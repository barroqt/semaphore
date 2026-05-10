import { keccak256, stringToHex } from "viem";
import type { RawPost } from "./scorer.js";

export function __setPinataClientFactoryForTests(_factory: unknown): void {
  // legacy
}

export async function pinRawData(posts: RawPost[], label: string): Promise<`0x${string}`> {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    throw new Error("PINATA_JWT is required");
  }

  const payload = JSON.stringify({
    asset: label,
    posts,
    timestamp: new Date().toISOString(),
  });

  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pinataContent: JSON.parse(payload),
      pinataMetadata: { name: `semaphore-${label}-${Date.now()}` },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Pinata upload failed: ${response.status} ${error}`);
  }

  const dataHash = keccak256(stringToHex(payload));
  return dataHash;
}
