import "dotenv/config";
import { createPublicClient, http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { startListener, type SentimentRequest } from "./listener.js";
import { runActors, sourceToActor } from "./apify.js";
import { score, type RawPost } from "./scorer.js";
import { pinRawData } from "./ipfs.js";
import { payX402 } from "./payment.js";
import { fulfill } from "./fulfiller.js";

const BASE_RPC = process.env.BASE_RPC || "https://mainnet.base.org";
const ORACLE_ADDRESS = process.env.ORACLE_ADDRESS;
const KEEPER_PRIVATE_KEY = process.env.KEEPER_PRIVATE_KEY;
const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;

const USE_X402 = !!APIFY_API_TOKEN && APIFY_API_TOKEN.startsWith("apify_api_");

if (!ORACLE_ADDRESS) {
  throw new Error("ORACLE_ADDRESS is required");
}
if (!KEEPER_PRIVATE_KEY) {
  throw new Error("KEEPER_PRIVATE_KEY is required");
}

const BASE_CHAIN = {
  id: 8453,
  name: "Base",
  network: "base",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [BASE_RPC] } },
};

const publicClient = createPublicClient({
  chain: BASE_CHAIN,
  transport: http(),
});

const account = privateKeyToAccount(KEEPER_PRIVATE_KEY as `0x${string}`);
const walletClient = createWalletClient({
  account,
  chain: BASE_CHAIN,
  transport: http(),
});

const assetIdToLabel: Record<string, string> = {
  "0xaaaebeba3810b1e6b70781f14b2d72c1cb89c0b2b320c43bb67ff79f562f5ff4": "ETH",
  "0xe98e2830be1a7e4156d656a7505e65d08c67660dc618072422e9c78053c261e9": "BTC",
  "0x0a3ec4fc70eaf64faf6eeda4e9b2bd4742a785464053aa23afad8bd24650e86f": "SOL",
};

function normalizeX402Post(item: unknown): RawPost {
  const raw = item as Record<string, unknown>;
  return {
    text: String(raw.text ?? raw.content ?? raw.title ?? ""),
    source: String(raw.source ?? "unknown"),
    createdAt: String(raw.created_at ?? raw.timestamp ?? new Date().toISOString()),
    engagement: typeof raw.engagement === "number" ? raw.engagement : 
                 typeof raw.likes === "number" ? raw.likes :
                 typeof raw.upvotes === "number" ? raw.upvotes : undefined,
  };
}

async function fetchWithX402(actorId: string, label: string): Promise<RawPost[]> {
  console.log(`[x402] Fetching from ${actorId}...`);
  const result = await payX402(actorId, { query: label, limit: 100 });
  const items = result as unknown[];
  return items.map(normalizeX402Post);
}

async function fetchWithoutX402(assetId: string, sources: string[]): Promise<RawPost[]> {
  return runActors(assetId, sources);
}

async function handleRequest(req: SentimentRequest): Promise<void> {
  const { requestId, assetId, sources } = req;
  const label = assetIdToLabel[assetId] || assetId;
  console.log(`[keeper:${requestId}] processing request for asset ${assetId} (${label})`);

  try {
    console.log(`[keeper:${requestId}] step 1: fetching social data`);
    let posts: RawPost[];

    if (USE_X402) {
      console.log(`[keeper:${requestId}] using X402 payments`);
      const actorIds = sources.map((s) => sourceToActor[s]).filter(Boolean);
      const results = await Promise.all(actorIds.map((actorId) => fetchWithX402(actorId!, label)));
      posts = results.flat();
    } else {
      posts = await fetchWithoutX402(assetId, sources);
    }

    console.log(`[keeper:${requestId}] fetched ${posts.length} posts`);

    if (posts.length === 0) {
      console.log(`[keeper:${requestId}] no posts fetched, using fallback mock data`);
    }

    console.log(`[keeper:${requestId}] step 2: scoring posts`);
    const result = score(posts);
    console.log(`[keeper:${requestId}] score: ${result.score.toFixed(4)}, signal: ${result.signal}`);

    console.log(`[keeper:${requestId}] step 3: pinning to IPFS`);
    const dataHash = await pinRawData(posts, label);
    console.log(`[keeper:${requestId}] data hash: ${dataHash}`);

    console.log(`[keeper:${requestId}] step 4: fulfilling oracle`);
    const txHash = await fulfill(requestId, result.score, result.volumeIndex, result.signal, walletClient);
    console.log(`[keeper:${requestId}] fulfilled, tx: ${txHash}`);
  } catch (error) {
    console.error(`[keeper:${requestId}] error:`, error);
  }
}

console.log("[semaphore] keeper running");

startListener(publicClient, ORACLE_ADDRESS!, handleRequest);