import test from "node:test";
import assert from "node:assert/strict";
import { keccak256, toHex } from "viem";
import { __setPinataClientFactoryForTests, pinRawData } from "./ipfs.js";

type RawPostLike = {
  text: string;
  source: string;
  createdAt: string;
  engagement?: number;
};

test("pinRawData with non-empty posts returns 0x-prefixed 32-byte hex", async (t) => {
  __setPinataClientFactoryForTests(() => ({
    upload: {
      json: async () => ({ cid: "bafybeigdyrztw5examplecidforhash" })
    }
  }));
  t.after(() => __setPinataClientFactoryForTests(null));

  const posts: RawPostLike[] = [
    { text: "bullish momentum", source: "twitter", createdAt: "2026-05-09T00:00:00.000Z" }
  ];

  const hash = await pinRawData("ETH", posts);
  assert.match(hash, /^0x[0-9a-fA-F]{64}$/);
});

test("same input always returns same hash (deterministic keccak of CID)", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: new Date("2026-05-09T12:00:00.000Z") });
  __setPinataClientFactoryForTests(() => ({
    upload: {
      json: async () => ({ cid: "bafybeibwzifdeterministiccidvalue" })
    }
  }));
  t.after(() => __setPinataClientFactoryForTests(null));

  const posts: RawPostLike[] = [
    { text: "steady sentiment", source: "reddit", createdAt: "2026-05-09T11:00:00.000Z" }
  ];

  const first = await pinRawData("ETH", posts);
  const second = await pinRawData("ETH", posts);
  const expected = keccak256(toHex("bafybeibwzifdeterministiccidvalue"));

  assert.equal(first, second);
  assert.equal(first, expected);
});

test("pinRawData calls Pinata with JSON payload containing assetId, posts, and pinnedAt", async (t) => {
  const calls: unknown[] = [];

  t.mock.timers.enable({ apis: ["Date"], now: new Date("2026-05-09T13:37:00.000Z") });
  __setPinataClientFactoryForTests(() => ({
    upload: {
      json: async (payload: unknown) => {
        calls.push(payload);
        return { cid: "bafybeiforpayloadassertioncidvalue" };
      }
    }
  }));
  t.after(() => __setPinataClientFactoryForTests(null));

  const posts: RawPostLike[] = [
    { text: "positive signal", source: "twitter", createdAt: "2026-05-09T13:00:00.000Z", engagement: 42 }
  ];

  await pinRawData("BTC", posts);

  assert.equal(calls.length, 1);
  const payload = calls[0] as Record<string, unknown>;

  assert.equal(payload.assetId, "BTC");
  assert.deepEqual(payload.posts, posts);
  assert.equal(payload.pinnedAt, "2026-05-09T13:37:00.000Z");
});
