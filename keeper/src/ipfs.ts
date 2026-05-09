import pinata from "pinata";
import { keccak256, toHex } from "viem";
import type { RawPost } from "./scorer.js";

type PinataUploadResponse = {
  cid: string;
};

type PinataClient = {
  upload: {
    json: (payload: unknown) => Promise<PinataUploadResponse>;
  };
};

let pinataClientFactory: (() => PinataClient) | null = null;

function getPinataClient(): PinataClient {
  if (pinataClientFactory) {
    return pinataClientFactory();
  }

  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    throw new Error("PINATA_JWT is required");
  }

  return pinata({ pinataJwt: jwt }) as unknown as PinataClient;
}

export function __setPinataClientFactoryForTests(factory: (() => PinataClient) | null): void {
  pinataClientFactory = factory;
}

function isRawPostArray(value: unknown): value is RawPost[] {
  return Array.isArray(value);
}

export async function pinRawData(
  postsOrAssetId: RawPost[] | string,
  assetIdOrPosts: string | RawPost[]
): Promise<`0x${string}`> {
  // Supports both (posts, assetId) and (assetId, posts) call shapes.
  const posts = isRawPostArray(postsOrAssetId) ? postsOrAssetId : (assetIdOrPosts as RawPost[]);
  const assetId = typeof postsOrAssetId === "string" ? postsOrAssetId : (assetIdOrPosts as string);

  const payload = {
    assetId,
    posts,
    pinnedAt: new Date().toISOString()
  };

  const client = getPinataClient();
  const { cid } = await client.upload.json(payload);

  return keccak256(toHex(cid));
}
