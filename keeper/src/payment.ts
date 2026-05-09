import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const KEEPER_PRIVATE_KEY = process.env.KEEPER_PRIVATE_KEY;

const BASE_SEPOLIA_CHAIN = {
  id: 84532,
  name: "Base Sepolia",
  network: "base-sepolia",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://sepolia.base.org"] } },
};

function getWalletClient(): ReturnType<typeof createWalletClient> {
  if (!KEEPER_PRIVATE_KEY) {
    throw new Error("KEEPER_PRIVATE_KEY environment variable not set");
  }
  const account = privateKeyToAccount(KEEPER_PRIVATE_KEY as `0x${string}`);
  return createWalletClient({
    account,
    chain: BASE_SEPOLIA_CHAIN,
    transport: http(),
  });
}

let walletClientFactory: () => ReturnType<typeof createWalletClient> = getWalletClient;

export function __setWalletClientFactoryForTests(factory: () => ReturnType<typeof createWalletClient>): void {
  walletClientFactory = factory;
}

type PriceResponse = {
  price: string;
  payTo: string;
  network: string;
};

export async function payX402(
  endpoint: string,
  payTo: string,
  network: string,
  walletClient: ReturnType<typeof createWalletClient>
): Promise<Headers> {
  const response = await fetch(endpoint);

  if (response.status !== 402) {
    throw new Error(`Non-402 status: ${response.status}`);
  }

  let price = "0";
  let bodyPayTo = payTo;
  let bodyNetwork = network;

  try {
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const body = await response.json() as PriceResponse;
      price = body.price ?? "0";
      bodyPayTo = body.payTo ?? payTo;
      bodyNetwork = body.network ?? network;
    }
  } catch {
  }

  const timestamp = Date.now();
  const message = JSON.stringify({
    price,
    payTo: bodyPayTo,
    network: bodyNetwork.replace(/-/g, "_"),
    timestamp,
  });

  const signature = await walletClient.signMessage({ message });

  return response.headers;
}