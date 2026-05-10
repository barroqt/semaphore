import type { WalletClient, Abi } from "viem";
import semOracleJson from "../../contracts/out/SemaphoreOracle.sol/SemaphoreOracle.json" with { type: "json" };

const semOracleAbi = (semOracleJson as { abi: Abi }).abi;
const ORACLE_ADDRESS = process.env.ORACLE_ADDRESS;

export async function fulfill(
  requestId: string,
  score: number,
  volumeIndex: number,
  signal: number,
  dataHash: `0x${string}`,
  walletClient: WalletClient
): Promise<string> {
  if (!ORACLE_ADDRESS) {
    throw new Error("ORACLE_ADDRESS is required");
  }

  const scaledScore = BigInt(Math.round(score * 1e18));
  const scaledVolumeIndex = BigInt(Math.round(volumeIndex * 1e18));

  const txHash = await walletClient.writeContract({
    address: ORACLE_ADDRESS as `0x${string}`,
    abi: semOracleAbi,
    functionName: "fulfillSentimentUpdate",
    args: [requestId as `0x${string}`, scaledScore, scaledVolumeIndex, signal, dataHash],
  });

  return txHash;
}