import test from "node:test";
import assert from "node:assert/strict";

type FakeWalletClient = {
  writeContract: (args: {
    address: string;
    abi: unknown[];
    functionName: string;
    args: unknown[];
  }) => Promise<string>;
};

test("fulfill calls walletClient.writeContract with function name fulfillSentimentUpdate", async (t) => {
  let writeContractArgs: {
    address: string;
    abi: unknown[];
    functionName: string;
    args: unknown[];
  } | null = null;

  const walletClient: FakeWalletClient = {
    writeContract: async (args) => {
      writeContractArgs = args;
      return "0xtxhash123";
    }
  };

  const { fulfill } = await import("./fulfiller.js");

  await fulfill(
    "0x1234567890123456789012345678901234567890",
    80,
    0.5,
    3,
    walletClient
  );

  assert.ok(writeContractArgs !== null, "writeContract should have been called");
  assert.equal(writeContractArgs!.functionName, "fulfillSentimentUpdate");
});

test("fulfill converts score to BigInt scaled by 1e18", async (t) => {
  let argsArray: unknown[] = [];

  const walletClient: FakeWalletClient = {
    writeContract: async (args) => {
      argsArray = args.args as unknown[];
      return "0xtxhash123";
    }
  };

  const { fulfill } = await import("./fulfiller.js");

  await fulfill(
    "0x1234567890123456789012345678901234567890",
    80,
    0.5,
    3,
    walletClient
  );

  assert.ok(argsArray.length >= 2, "should have at least score and volumeIndex args");
  const scoreArg = argsArray[1];
  assert.equal(scoreArg, BigInt(80) * BigInt(1e18), "score should be scaled by 1e18");
});

test("fulfill converts volumeIndex to BigInt scaled by 1e18", async (t) => {
  let argsArray: unknown[] = [];

  const walletClient: FakeWalletClient = {
    writeContract: async (args) => {
      argsArray = args.args as unknown[];
      return "0xtxhash123";
    }
  };

  const { fulfill } = await import("./fulfiller.js");

  await fulfill(
    "0x1234567890123456789012345678901234567890",
    80,
    0.75,
    3,
    walletClient
  );

  assert.ok(argsArray.length >= 3, "should have score, volumeIndex, and signal args");
  const volumeIndexArg = argsArray[2];
  assert.equal(volumeIndexArg, BigInt(75) * BigInt(1e16), "volumeIndex should be scaled by 1e18");
});

test("fulfill passes signal as-is (uint8)", async (t) => {
  let argsArray: unknown[] = [];

  const walletClient: FakeWalletClient = {
    writeContract: async (args) => {
      argsArray = args.args as unknown[];
      return "0xtxhash123";
    }
  };

  const { fulfill } = await import("./fulfiller.js");

  await fulfill(
    "0x1234567890123456789012345678901234567890",
    50,
    0.25,
    2,
    walletClient
  );

  assert.ok(argsArray.length >= 4, "should have score, volumeIndex, signal, and dataHash args");
  const signalArg = argsArray[3];
  assert.equal(signalArg, 2, "signal should be passed as-is (uint8)");
});

test("fulfill returns transaction hash string from writeContract", async (t) => {
  const walletClient: FakeWalletClient = {
    writeContract: async () => "0xabc123def456789"
  };

  const { fulfill } = await import("./fulfiller.js");

  const result = await fulfill(
    "0x1234567890123456789012345678901234567890",
    80,
    0.5,
    3,
    walletClient
  );

  assert.equal(result, "0xabc123def456789");
});