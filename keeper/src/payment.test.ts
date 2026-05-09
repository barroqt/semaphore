import test from "node:test";
import assert from "node:assert/strict";

test("payX402 throws error when KEEPER_PRIVATE_KEY is not set", async () => {
  const originalKey = process.env.KEEPER_PRIVATE_KEY;
  delete process.env.KEEPER_PRIVATE_KEY;

  const { payX402 } = await import("./payment.js");

  await assert.rejects(
    async () => await payX402("apidojo/tweet-scraper", { query: "ETH" }),
    { message: /KEEPER_PRIVATE_KEY is required/ }
  );

  process.env.KEEPER_PRIVATE_KEY = originalKey;
});

test("payX402 uses injected signer when available", async (t) => {
  process.env.KEEPER_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

  const mockResult = [
    { text: "test post", source: "twitter", created_at: "2024-01-01", likes: 100 }
  ];

  let requestCount = 0;
  t.mock.method(globalThis, "fetch", async (url: unknown, options: unknown) => {
    const urlStr = url as string;
    const opts = options as { headers?: Record<string, string> };
    
    requestCount++;
    
    if (requestCount === 1) {
      return {
        ok: false,
        status: 402,
        headers: new Headers({ "PAYMENT-REQUIRED": "eyJwcmllY2UiOiAiMC4wMSJ9" }),
        text: async () => "Payment required",
      } as unknown as Response;
    }
    
    return {
      ok: true,
      status: 200,
      json: async () => mockResult,
      text: async () => JSON.stringify(mockResult),
    } as unknown as Response;
  });

  const { payX402, __setSignPaymentForTests } = await import("./payment.js");

  __setSignPaymentForTests(async (header) => {
    return "mock_signature_123";
  });

  const result = await payX402("apidojo/tweet-scraper", { query: "ETH" });
  
  __setSignPaymentForTests(null);

  assert.deepEqual(result, mockResult);
});

test("payX402 throws when mcpc is not available and no signer injected", async (t) => {
  process.env.KEEPER_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

  t.mock.method(globalThis, "fetch", async () => {
    return {
      ok: false,
      status: 402,
      headers: new Headers({ "PAYMENT-REQUIRED": "eyJwcmllY2UiOiAiMC4wMSJ9" }),
      text: async () => "Payment required",
    } as unknown as Response;
  });

  const { payX402, __setSignPaymentForTests } = await import("./payment.js");

  __setSignPaymentForTests(null);

  await assert.rejects(
    async () => await payX402("apidojo/tweet-scraper", { query: "ETH" }),
    { message: /mcpc.*not found/i }
  );
});