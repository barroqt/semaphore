import { execSync } from "child_process";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const KEEPER_PRIVATE_KEY = process.env.KEEPER_PRIVATE_KEY;

const BASE_CHAIN = {
  id: 8453,
  name: "Base",
  network: "base",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://mainnet.base.org"] } },
};

function getWalletClient(): ReturnType<typeof createWalletClient> {
  if (!KEEPER_PRIVATE_KEY) {
    throw new Error("KEEPER_PRIVATE_KEY environment variable not set");
  }
  const account = privateKeyToAccount(KEEPER_PRIVATE_KEY as `0x${string}`);
  return createWalletClient({
    account,
    chain: BASE_CHAIN,
    transport: http(),
  });
}

let walletClientFactory: () => ReturnType<typeof createWalletClient> = getWalletClient;

export function __setWalletClientFactoryForTests(factory: () => ReturnType<typeof createWalletClient>): void {
  walletClientFactory = factory;
}

export async function payX402(
  actorName: string,
  input: Record<string, unknown>
): Promise<unknown> {
  const privateKey = process.env.KEEPER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("KEEPER_PRIVATE_KEY is required for X402 payments");
  }

  const actorPath = actorName.replace("/", "~");
  const endpoint = `https://api.apify.com/v2/acts/${actorPath}/run-sync-get-dataset-items`;

  console.log(`[x402] Initiating payment for actor: ${actorName}`);

  let paymentRequiredHeader: string | null = null;

  const step1Response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-APIFY-PAYMENT-PROTOCOL": "X402",
    },
    body: JSON.stringify(input),
  });

  if (step1Response.status !== 402) {
    const errorText = await step1Response.text();
    throw new Error(`Expected 402, got ${step1Response.status}: ${errorText}`);
  }

  paymentRequiredHeader = step1Response.headers.get("PAYMENT-REQUIRED");
  if (!paymentRequiredHeader) {
    throw new Error("Missing PAYMENT-REQUIRED header in 402 response");
  }

  console.log(`[x402] Payment required, signing with mcpc...`);

  let signature: string;
  if (signPayment) {
    signature = await signPayment(paymentRequiredHeader);
  } else {
    try {
      signature = execSync(`mcpc x402 sign "${paymentRequiredHeader}"`, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      }).trim();
    } catch (error) {
      const err = error as Error & { stderr?: string };
      throw new Error(`Failed to sign payment with mcpc: ${err.stderr || err.message}`);
    }
  }

  console.log(`[x402] Payment signed, executing actor...`);

  const step3Response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-APIFY-PAYMENT-PROTOCOL": "X402",
      "PAYMENT-SIGNATURE": signature,
    },
    body: JSON.stringify(input),
  });

  if (!step3Response.ok) {
    const errorText = await step3Response.text();
    throw new Error(`Actor execution failed: ${step3Response.status} - ${errorText}`);
  }

  const result = await step3Response.json();
  console.log(`[x402] Actor executed successfully`);

  return result;
}

type SignPaymentFn = (paymentRequired: string) => Promise<string>;
let signPayment: SignPaymentFn | null = null;

export function __setSignPaymentForTests(fn: SignPaymentFn | null): void {
  signPayment = fn;
}

export async function payX402Legacy(
  endpoint: string,
  payTo: string,
  network: string,
  walletClient: ReturnType<typeof createWalletClient>
): Promise<Headers> {
  const response = await fetch(endpoint);

  if (response.status !== 402) {
    throw new Error(`Non-402 status: ${response.status}`);
  }

  return response.headers;
}