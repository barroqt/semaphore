import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Radio, Zap } from 'lucide-react';
import type { TopicSignal, SentimentLabel } from '../types';
import { SentimentDial } from './SentimentDial';
import { Sparkline } from './Sparkline';

interface Props {
  topic: TopicSignal;
  index: number;
}

const LABEL_COLORS: Record<SentimentLabel, string> = {
  'Extreme Fear': '#ad180b',
  'Fear': '#f03014',
  'Neutral': '#c8871e',
  'Greed': '#52a843',
  'Extreme Greed': '#2e7a32',
};

const LABEL_BG: Record<SentimentLabel, string> = {
  'Extreme Fear': 'rgba(173, 24, 11, 0.12)',
  'Fear': 'rgba(240, 48, 20, 0.10)',
  'Neutral': 'rgba(200, 135, 30, 0.10)',
  'Greed': 'rgba(82, 168, 67, 0.10)',
  'Extreme Greed': 'rgba(46, 122, 50, 0.10)',
};

const CATEGORY_ICON: Record<string, string> = {
  Coin: '◈',
  Protocol: '⬡',
  Blockchain: '⬢',
};

function formatVolume(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${v.toLocaleString()}`;
}

function formatAge(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export function TopicCard({ topic, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const color = LABEL_COLORS[topic.label];
  const bg = LABEL_BG[topic.label];
  const isPositiveDay = topic.change24h >= 0;
  const isPositiveWeek = topic.change7d >= 0;

  const delayClass = [
    'animate-delay-100',
    'animate-delay-200',
    'animate-delay-300',
    'animate-delay-400',
    'animate-delay-500',
  ][index % 5];

  const totalSignals = topic.signals.bullish + topic.signals.bearish + topic.signals.neutral;
  const bullishPct = Math.round((topic.signals.bullish / totalSignals) * 100);
  const bearishPct = Math.round((topic.signals.bearish / totalSignals) * 100);
  const neutralPct = 100 - bullishPct - bearishPct;

  return (
    <div
      className={`relative opacity-0 animate-fade-slide ${delayClass}`}
      style={{ animationFillMode: 'forwards' }}
    >
      {/* Corner rivets */}
      <div className="absolute top-2 left-2 rivet z-10" />
      <div className="absolute top-2 right-2 rivet z-10" />
      <div className="absolute bottom-2 left-2 rivet z-10" />
      <div className="absolute bottom-2 right-2 rivet z-10" />

      <div
        className="telegraph-border telegraph-border-hover cursor-pointer rounded-sm overflow-hidden paper-texture"
        style={{
          background: `linear-gradient(135deg, #2a1e12 0%, #221810 60%, #1e1510 100%)`,
          borderColor: `${color}40`,
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Top accent bar */}
        <div
          className="h-0.5 w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        />

        <div className="p-4">
          {/* Header row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              {/* Category badge */}
              <div
                className="flex-shrink-0 w-10 h-10 rounded-sm flex items-center justify-center text-lg font-bold"
                style={{ background: bg, border: `1px solid ${color}40`, color }}
              >
                {CATEGORY_ICON[topic.category]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3
                    className="font-playfair font-bold text-lg leading-tight"
                    style={{ color: '#f0d9ad' }}
                  >
                    {topic.name}
                  </h3>
                  <span
                    className="font-mono text-xs px-1.5 py-0.5 rounded-sm"
                    style={{
                      background: `${color}18`,
                      color: `${color}cc`,
                      border: `1px solid ${color}30`,
                    }}
                  >
                    {topic.ticker}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-typewriter text-xs" style={{ color: 'rgba(200, 135, 30, 0.6)' }}>
                    {topic.category}
                  </span>
                  <span style={{ color: 'rgba(200, 135, 30, 0.3)' }}>·</span>
                  <span className="font-mono text-xs" style={{ color: 'rgba(188, 149, 89, 0.5)' }}>
                    {formatAge(topic.lastUpdated)}
                  </span>
                </div>
              </div>
            </div>

            {/* Sentiment label stamp */}
            <div
              className="flex-shrink-0 text-center px-2 py-1 animate-stamp-in"
              style={{
                background: bg,
                border: `1.5px solid ${color}60`,
                color,
                animationFillMode: 'forwards',
                animationDelay: `${(index % 5) * 100 + 200}ms`,
                opacity: 0,
              }}
            >
              <div className="font-typewriter text-xs font-bold tracking-widest uppercase leading-none">
                {topic.label}
              </div>
            </div>
          </div>

          {/* Dial + Sparkline row */}
          <div className="flex items-center gap-4 mb-3">
            <SentimentDial score={topic.score} label={topic.label} size={100} />

            <div className="flex-1 min-w-0">
              {/* Change indicators */}
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1">
                  {isPositiveDay ? (
                    <TrendingUp size={12} className="text-green-500" />
                  ) : topic.change24h === 0 ? (
                    <Minus size={12} style={{ color: '#c8871e' }} />
                  ) : (
                    <TrendingDown size={12} className="text-red-500" />
                  )}
                  <span
                    className="font-mono text-xs font-bold"
                    style={{ color: isPositiveDay ? '#52a843' : '#f03014' }}
                  >
                    {isPositiveDay ? '+' : ''}{topic.change24h.toFixed(1)}%
                  </span>
                  <span className="font-mono text-xs" style={{ color: 'rgba(188, 149, 89, 0.5)' }}>24h</span>
                </div>
                <div className="flex items-center gap-1">
                  {isPositiveWeek ? (
                    <TrendingUp size={12} className="text-green-500" />
                  ) : (
                    <TrendingDown size={12} className="text-red-500" />
                  )}
                  <span
                    className="font-mono text-xs font-bold"
                    style={{ color: isPositiveWeek ? '#52a843' : '#f03014' }}
                  >
                    {isPositiveWeek ? '+' : ''}{topic.change7d.toFixed(1)}%
                  </span>
                  <span className="font-mono text-xs" style={{ color: 'rgba(188, 149, 89, 0.5)' }}>7d</span>
                </div>
              </div>

              {/* Sparkline */}
              <Sparkline data={topic.sparkline} color={color} width={150} height={36} />
            </div>
          </div>

          {/* Narrative strength bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Radio size={10} style={{ color: 'rgba(200, 135, 30, 0.6)' }} />
                <span className="font-typewriter text-xs uppercase tracking-widest" style={{ color: 'rgba(200, 135, 30, 0.6)' }}>
                  Narrative Strength
                </span>
              </div>
              <span className="font-mono text-xs font-bold" style={{ color: '#c8871e' }}>
                {topic.narrativeStrength}%
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(94, 61, 27, 0.4)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${topic.narrativeStrength}%`,
                  background: `linear-gradient(90deg, ${color}80, ${color})`,
                  boxShadow: `0 0 6px ${color}60`,
                }}
              />
            </div>
          </div>

          {/* Dominant narrative */}
          <div
            className="text-xs font-typewriter leading-relaxed mb-3 px-2 py-1.5 rounded-sm"
            style={{
              color: 'rgba(232, 220, 196, 0.75)',
              background: 'rgba(0,0,0,0.25)',
              borderLeft: `2px solid ${color}50`,
            }}
          >
            {topic.dominantNarrative}
          </div>

          {/* Signal counts */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <div className="flex items-center gap-1">
              <span style={{ color: '#52a843' }}>▲</span>
              <span style={{ color: 'rgba(188, 149, 89, 0.7)' }}>{topic.signals.bullish}</span>
            </div>
            <div className="flex items-center gap-1">
              <span style={{ color: '#f03014' }}>▼</span>
              <span style={{ color: 'rgba(188, 149, 89, 0.7)' }}>{topic.signals.bearish}</span>
            </div>
            <div className="flex items-center gap-1">
              <span style={{ color: '#c8871e' }}>◆</span>
              <span style={{ color: 'rgba(188, 149, 89, 0.7)' }}>{topic.signals.neutral}</span>
            </div>
            <div className="flex-1" />
            <span style={{ color: 'rgba(188, 149, 89, 0.45)' }} className="text-xs">
              Vol: {formatVolume(topic.volume)}
            </span>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div
            className="border-t px-4 py-3"
            style={{ borderColor: `${color}25`, background: 'rgba(0,0,0,0.2)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap size={12} style={{ color }} />
              <span className="font-typewriter text-xs uppercase tracking-widest" style={{ color: 'rgba(200, 135, 30, 0.7)' }}>
                Signal Distribution
              </span>
            </div>

            {/* Signal bars */}
            <div className="space-y-1.5 mb-3">
              {[
                { label: 'Bullish', pct: bullishPct, color: '#52a843', count: topic.signals.bullish },
                { label: 'Bearish', pct: bearishPct, color: '#f03014', count: topic.signals.bearish },
                { label: 'Neutral', pct: neutralPct, color: '#c8871e', count: topic.signals.neutral },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="font-typewriter text-xs w-12" style={{ color: 'rgba(188, 149, 89, 0.6)' }}>
                    {s.label}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${s.pct}%`, background: s.color, opacity: 0.8 }}
                    />
                  </div>
                  <span className="font-mono text-xs w-8 text-right" style={{ color: s.color }}>
                    {s.pct}%
                  </span>
                </div>
              ))}
            </div>

            <div className="font-mono text-xs" style={{ color: 'rgba(188, 149, 89, 0.4)' }}>
              TRANSMISSION: {topic.transmissionId}
            </div>
          </div>
        )}

        {/* Bottom accent */}
        <div
          className="h-px w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${color}30, transparent)` }}
        />
      </div>
    </div>
  );
}
