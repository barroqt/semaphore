import vaderSentiment = require("vader-sentiment");

export type RawPost = {
  text: string;
  source: string;
  createdAt: string;
  engagement?: number;
};

export type SentimentResult = {
  score: number;
  volumeIndex: number;
  signal: 0 | 1 | 2 | 3 | 4;
  breakdown: Record<string, number>;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toSignal(score: number): 0 | 1 | 2 | 3 | 4 {
  if (score <= -0.6) return 0;
  if (score <= -0.2) return 1;
  if (score <= 0.2) return 2;
  if (score <= 0.6) return 3;
  return 4;
}

function getCompound(text: string): number {
  const result =
    vaderSentiment.SentimentIntensityAnalyzer.polarity_scores(text);
  return typeof result.compound === "number" ? result.compound : 0;
}

export function score(posts: RawPost[]): SentimentResult {
  if (posts.length === 0) {
    return {
      score: 0,
      volumeIndex: 0,
      signal: 2,
      breakdown: {},
    };
  }

  const sourceTotals: Record<string, { sum: number; count: number }> = {};
  let total = 0;

  for (const post of posts) {
    const compound = getCompound(post.text ?? "");
    total += compound;

    const source = post.source ?? "unknown";
    if (!sourceTotals[source]) {
      sourceTotals[source] = { sum: 0, count: 0 };
    }
    sourceTotals[source].sum += compound;
    sourceTotals[source].count += 1;
  }

  const rawScore = total / posts.length;
  const normalizedScore = clamp(rawScore, -1, 1);

  const breakdown: Record<string, number> = {};
  for (const [source, stats] of Object.entries(sourceTotals)) {
    breakdown[source] = clamp(stats.sum / stats.count, -1, 1);
  }

  return {
    score: normalizedScore,
    volumeIndex: Math.min(posts.length / 1000, 1),
    signal: toSignal(normalizedScore),
    breakdown,
  };
}

export const scorePosts = score;
