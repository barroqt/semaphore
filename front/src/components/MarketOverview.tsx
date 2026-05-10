import type { TopicSignal, SentimentLabel } from '../types';

interface Props {
  topics: TopicSignal[];
}

const LABEL_COLORS: Record<SentimentLabel, string> = {
  'Extreme Fear': '#ad180b',
  'Fear': '#f03014',
  'Neutral': '#c8871e',
  'Greed': '#52a843',
  'Extreme Greed': '#2e7a32',
};

export function MarketOverview({ topics }: Props) {
  const avg = Math.round(topics.reduce((s, t) => s + t.score, 0) / topics.length);

  const distribution = topics.reduce(
    (acc, t) => {
      acc[t.label] = (acc[t.label] || 0) + 1;
      return acc;
    },
    {} as Partial<Record<SentimentLabel, number>>
  );

  const totalNarrative = Math.round(topics.reduce((s, t) => s + t.narrativeStrength, 0) / topics.length);

  const topGainer = topics.reduce((best, t) => (t.change24h > best.change24h ? t : best), topics[0]);
  const topLoser = topics.reduce((worst, t) => (t.change24h < worst.change24h ? t : worst), topics[0]);

  const avgColor = avg > 60 ? '#52a843' : avg < 40 ? '#f03014' : '#c8871e';

  return (
    <div
      className="rounded-sm mb-6 paper-texture"
      style={{
        background: 'linear-gradient(135deg, #1e1610 0%, #1a1410 100%)',
        border: '1px solid rgba(94, 61, 27, 0.4)',
      }}
    >
      <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ borderColor: 'rgba(94, 61, 27, 0.3)' }}>
        <span className="font-typewriter text-xs uppercase tracking-widest" style={{ color: 'rgba(200, 135, 30, 0.6)' }}>
          Bureau Overview
        </span>
        <div className="flex-1 h-px mx-2" style={{ background: 'rgba(94, 61, 27, 0.3)' }} />
        <span className="font-mono text-xs" style={{ color: 'rgba(188, 149, 89, 0.4)' }}>
          {topics.length} active signals
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: 'rgba(94, 61, 27, 0.2)' }}>
        {/* Composite score */}
        <div className="px-4 py-3" style={{ background: '#1a1410' }}>
          <div className="font-typewriter text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(188, 149, 89, 0.5)' }}>
            Composite Score
          </div>
          <div className="font-mono font-bold text-3xl" style={{ color: avgColor, lineHeight: 1 }}>
            {avg}
          </div>
          <div className="font-typewriter text-xs mt-1" style={{ color: avgColor, opacity: 0.8 }}>
            {avg > 60 ? 'Market Greed' : avg < 40 ? 'Market Fear' : 'Market Neutral'}
          </div>
        </div>

        {/* Narrative strength */}
        <div className="px-4 py-3" style={{ background: '#1a1410' }}>
          <div className="font-typewriter text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(188, 149, 89, 0.5)' }}>
            Avg Narrative
          </div>
          <div className="font-mono font-bold text-3xl" style={{ color: '#c8871e', lineHeight: 1 }}>
            {totalNarrative}
            <span className="text-base font-normal" style={{ color: 'rgba(200, 135, 30, 0.6)' }}>%</span>
          </div>
          <div className="font-typewriter text-xs mt-1" style={{ color: 'rgba(188, 149, 89, 0.5)' }}>
            Signal strength
          </div>
        </div>

        {/* Top gainer */}
        <div className="px-4 py-3" style={{ background: '#1a1410' }}>
          <div className="font-typewriter text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(188, 149, 89, 0.5)' }}>
            Top Gainer
          </div>
          <div className="font-playfair font-bold text-lg leading-none" style={{ color: '#f0d9ad' }}>
            {topGainer.ticker}
          </div>
          <div className="font-mono text-sm font-bold mt-0.5" style={{ color: '#52a843' }}>
            +{topGainer.change24h.toFixed(1)}%
          </div>
        </div>

        {/* Top loser */}
        <div className="px-4 py-3" style={{ background: '#1a1410' }}>
          <div className="font-typewriter text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(188, 149, 89, 0.5)' }}>
            Top Decline
          </div>
          <div className="font-playfair font-bold text-lg leading-none" style={{ color: '#f0d9ad' }}>
            {topLoser.ticker}
          </div>
          <div className="font-mono text-sm font-bold mt-0.5" style={{ color: '#f03014' }}>
            {topLoser.change24h.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Sentiment distribution bar */}
      <div className="px-4 py-3">
        <div className="font-typewriter text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(188, 149, 89, 0.45)' }}>
          Sentiment Distribution
        </div>
        <div className="flex h-3 rounded-sm overflow-hidden gap-px">
          {(Object.entries(distribution) as [SentimentLabel, number][])
            .sort((a, b) => {
              const order = ['Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed'];
              return order.indexOf(a[0]) - order.indexOf(b[0]);
            })
            .map(([lbl, count]) => (
              <div
                key={lbl}
                title={`${lbl}: ${count}`}
                style={{
                  flex: count,
                  background: LABEL_COLORS[lbl],
                  opacity: 0.7,
                }}
              />
            ))}
        </div>
        <div className="flex items-center gap-4 mt-1.5 flex-wrap">
          {(Object.entries(distribution) as [SentimentLabel, number][]).map(([lbl, count]) => (
            <div key={lbl} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: LABEL_COLORS[lbl] }} />
              <span className="font-typewriter text-xs" style={{ color: 'rgba(188, 149, 89, 0.55)' }}>
                {lbl}: {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
