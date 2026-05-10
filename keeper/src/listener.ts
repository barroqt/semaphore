import { type PublicClient, type Abi } from "viem";
import semOracleJson from "../../contracts/out/SemaphoreOracle.sol/SemaphoreOracle.json" with { type: "json" };

const semOracleAbi = (semOracleJson as { abi: Abi }).abi;

export type SentimentRequest = {
  requestId: string;
  assetId: string;
  requester: string;
  sources: string[];
};

async function fetchSourcesFromContract(publicClient: PublicClient, oracleAddress: string, requestId: string): Promise<string[]> {
  try {
    const request = await publicClient.readContract({
      address: oracleAddress as `0x${string}`,
      abi: semOracleAbi,
      functionName: "requests",
      args: [requestId as `0x${string}`],
    }) as { sources: string[] };
    return request.sources || [];
  } catch (e) {
    console.error("Failed to fetch sources:", e);
    return ["twitter", "reddit", "news"];
  }
}

export function startListener(
  publicClient: PublicClient,
  oracleAddress: string,
  onRequest: (req: SentimentRequest) => Promise<void>
): () => void {
  const processLogs = async (logs: typeof import("viem").Log[]) => {
    for (const log of logs) {
      const args = log.args as unknown as {
        requestId: string;
        assetId: string;
        requester: string;
      };
      try {
        const sources = await fetchSourcesFromContract(publicClient, oracleAddress, args.requestId);
        Promise.resolve(onRequest({
          requestId: args.requestId,
          assetId: args.assetId,
          requester: args.requester,
          sources,
        })).catch(console.error);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Fetch recent events (last 10000 blocks)
  publicClient.getBlockNumber().then((blockNumber) => {
    const fromBlock = blockNumber - BigInt(10000);
    return publicClient.getLogs({
      address: oracleAddress as `0x${string}`,
      event: semOracleAbi.find((x) => x.type === "event" && x.name === "SentimentUpdateRequested") as import("viem").AbiEvent,
      fromBlock,
    });
  }).then(processLogs).catch((e) => console.error("Failed to fetch historical events:", e));

  // Watch for new events
  const unwatch = publicClient.watchContractEvent({
    address: oracleAddress as `0x${string}`,
    abi: semOracleAbi,
    eventName: "SentimentUpdateRequested",
    onLogs: processLogs,
  });

  return unwatch;
}