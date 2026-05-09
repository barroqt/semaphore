import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import semOracleAbi from "../../contracts/out/SemaphoreOracle.sol/SemaphoreOracle.json" with { type: "json" };

const KEEPER_PRIVATE_KEY = process.env.KEEPER_PRIVATE_KEY;
const ORACLE_ADDRESS = process.env.ORACLE_ADDRESS;

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

export async function fulfill(
  requestId: string,
  score: number,
  volumeIndex: number,
  signal: number,
  walletClient: ReturnType<typeof createWalletClient>
): Promise<string> {
  const scaledScore = BigInt(Math.round(score)) * BigInt(1e18);
  const scaledVolumeIndex = BigInt(Math.round(volumeIndex * 100)) * BigInt(1e16);
  const dataHash = "0x0000000000000000000000000000000000000000000000000000000000000000";

  const txHash = await walletClient.writeContract({
    address: ORACLE_ADDRESS as `0x${string}`,
    abi: semOracleAbi,
    functionName: "fulfillSentimentUpdate",
    args: [BigInt(requestId), scaledScore, scaledVolumeIndex, signal, dataHash as `0x${string}`],
  });

  console.log(`Transaction hash: ${txHash}`);
  return txHash;
}