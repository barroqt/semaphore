import test from "node:test";
import assert from "node:assert/strict";

import { scorePosts } from "./scorer";

type Post = {
  text: string;
  source: string;
};

test("empty posts returns score=0, signal=2 (Neutral), volumeIndex=0", () => {
  const result = scorePosts([]);

  assert.equal(result.score, 0);
  assert.equal(result.signal, 2);
  assert.equal(result.volumeIndex, 0);
});

test("all positive posts return score > 0 and signal >= 3", () => {
  const posts: Post[] = [
    { text: "Amazing breakout, super bullish momentum!", source: "twitter" },
    { text: "Great fundamentals and strong adoption ahead", source: "reddit" },
    { text: "Very positive outlook, confidence is high", source: "news" }
  ];

  const result = scorePosts(posts);

  assert.ok(result.score > 0, `expected positive score, got ${result.score}`);
  assert.ok(result.signal >= 3, `expected signal >= 3, got ${result.signal}`);
});

test("all negative posts return score < 0 and signal <= 1", () => {
  const posts: Post[] = [
    { text: "Terrible outlook, extreme fear and panic", source: "twitter" },
    { text: "Very bearish sentiment, huge sell pressure", source: "reddit" },
    { text: "Awful news cycle and declining trust", source: "news" }
  ];

  const result = scorePosts(posts);

  assert.ok(result.score < 0, `expected negative score, got ${result.score}`);
  assert.ok(result.signal <= 1, `expected signal <= 1, got ${result.signal}`);
});

test("mixed posts return score near 0 and signal=2 (Neutral)", () => {
  const posts: Post[] = [
    { text: "Strong upside potential and great momentum", source: "twitter" },
    { text: "Project looks promising and adoption is growing", source: "reddit" },
    { text: "Risk concerns are rising with weak demand", source: "twitter" },
    { text: "Market sentiment looks uncertain and fragile", source: "news" }
  ];

  const result = scorePosts(posts);

  assert.ok(Math.abs(result.score) <= 0.2, `expected near-zero score, got ${result.score}`);
  assert.equal(result.signal, 2);
});

test("score is clamped to [-1, 1]", () => {
  const veryPositive: Post[] = Array.from({ length: 200 }, () => ({
    text: "Excellent amazing incredible bullish moon",
    source: "twitter"
  }));
  const veryNegative: Post[] = Array.from({ length: 200 }, () => ({
    text: "Horrible disastrous catastrophic bearish crash",
    source: "reddit"
  }));

  const positiveResult = scorePosts(veryPositive);
  const negativeResult = scorePosts(veryNegative);

  assert.ok(positiveResult.score <= 1, `expected <= 1, got ${positiveResult.score}`);
  assert.ok(positiveResult.score >= -1, `expected >= -1, got ${positiveResult.score}`);
  assert.ok(negativeResult.score <= 1, `expected <= 1, got ${negativeResult.score}`);
  assert.ok(negativeResult.score >= -1, `expected >= -1, got ${negativeResult.score}`);
});

test("volumeIndex is min(postCount / 1000, 1.0)", () => {
  const posts500: Post[] = Array.from({ length: 500 }, (_, i) => ({
    text: `post ${i}`,
    source: "twitter"
  }));
  const posts2000: Post[] = Array.from({ length: 2000 }, (_, i) => ({
    text: `post ${i}`,
    source: "twitter"
  }));

  const result500 = scorePosts(posts500);
  const result2000 = scorePosts(posts2000);

  assert.equal(result500.volumeIndex, 0.5);
  assert.equal(result2000.volumeIndex, 1.0);
});

test("breakdown contains one key per unique source in input", () => {
  const posts: Post[] = [
    { text: "bullish", source: "twitter" },
    { text: "bearish", source: "reddit" },
    { text: "neutral", source: "news" },
    { text: "mixed", source: "twitter" }
  ];

  const result = scorePosts(posts);

  const breakdownKeys = Object.keys(result.breakdown).sort();
  assert.deepEqual(breakdownKeys, ["news", "reddit", "twitter"]);
});
