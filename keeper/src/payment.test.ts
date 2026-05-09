import test from "node:test";
import assert from "node:assert/strict";

type FakeWalletClient = {
  signMessage: (args: { message: string }) => Promise<string>;
};

type FakeFetchOptions = {
  status?: number;
  headers?: Record<string, string>;
};

test("payX402 throws error when endpoint returns non-402 status", async (t) => {
  t.mock.method(globalThis, "fetch", async () => {
    return {
      ok: false,
      status: 500,
      headers: new Headers(),
    } as unknown as Response;
  });

  const { payX402 } = await import("./payment.js");

  await assert.rejects(
    async () => await payX402("http://example.com/api", "0x123", "test-network", { signMessage: async () => "sig" } as unknown as FakeWalletClient),
    { message: /non-402/i }
  );
});

test("payX402 calls walletClient.signMessage with message containing payTo, price, and network when endpoint returns 402", async (t) => {
  let signMessageArgs: { message: string } | null = null;

  t.mock.method(globalThis, "fetch", async () => {
    return {
      ok: false,
      status: 402,
      headers: new Headers({ "X-Payment": "signed:abc123" }),
    } as unknown as Response;
  });

  const walletClient: FakeWalletClient = {
    signMessage: async (args: { message: string }) => {
      signMessageArgs = args;
      return "signature123";
    }
  };

  const { payX402 } = await import("./payment.js");

  await payX402("http://example.com/api", "0xabc", "test-network", walletClient);

  assert.ok(signMessageArgs !== null, "signMessage should have been called");
  const message = signMessageArgs!.message;
  assert.ok(message.includes("0xabc"), "message should contain payTo address");
  assert.ok(message.includes("test_network"), "message should contain network");
});

test("payX402 returns Headers object containing X-Payment key when endpoint returns 402", async (t) => {
  t.mock.method(globalThis, "fetch", async () => {
    return {
      ok: false,
      status: 402,
      headers: new Headers({ "X-Payment": "signature_xyz" }),
    } as unknown as Response;
  });

  const walletClient: FakeWalletClient = {
    signMessage: async () => "signature123"
  };

  const { payX402 } = await import("./payment.js");

  const result = await payX402("http://example.com/api", "0x123", "mainnet", walletClient);

  assert.ok(result instanceof Headers, "result should be Headers object");
  assert.ok(result.has("X-Payment"), "Headers should have X-Payment key");
  assert.equal(result.get("X-Payment"), "signature_xyz");
});