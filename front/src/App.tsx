import { useState, useMemo, useEffect } from 'react';
import { useAccount } from 'wagmi';
import type { FilterState, TopicSignal } from './types';
import { mockTopics, mockTransactions } from './mockData';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { TopicCard } from './components/TopicCard';
import { MarketOverview } from './components/MarketOverview';
import { TransactionHistory } from './components/TransactionHistory';

const DEFAULT_FILTERS: FilterState = {
  category: 'All',
  label: 'All',
  sortField: 'score',
  sortDirection: 'desc',
  searchQuery: '',
};

function applyFilters(topics: TopicSignal[], filters: FilterState): TopicSignal[] {
  let result = [...topics];

  if (filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase();
    result = result.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.ticker.toLowerCase().includes(q) ||
        t.dominantNarrative.toLowerCase().includes(q)
    );
  }

  if (filters.category !== 'All') {
    result = result.filter((t) => t.category === filters.category);
  }

  if (filters.label !== 'All') {
    result = result.filter((t) => t.label === filters.label);
  }

  result.sort((a, b) => {
    let av: number | string, bv: number | string;
    switch (filters.sortField) {
      case 'name': av = a.name; bv = b.name; break;
      case 'change24h': av = a.change24h; bv = b.change24h; break;
      case 'volume': av = a.volume; bv = b.volume; break;
      default: av = a.score; bv = b.score;
    }
    if (typeof av === 'string') {
      return filters.sortDirection === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
    }
    return filters.sortDirection === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  return result;
}

type Tab = 'active' | 'transactions';

export default function App() {
  const { isConnected } = useAccount();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<TopicSignal[]>([]);
  const [tab, setTab] = useState<Tab>('active');

  useEffect(() => {
    if (!isConnected) return;
    const t = setTimeout(() => {
      setTopics(mockTopics);
      setLoading(false);
    }, 900);
    return () => clearTimeout(t);
  }, [isConnected]);

  const filtered = useMemo(() => applyFilters(topics, filters), [topics, filters]);

  return (
    <div className="min-h-screen" style={{ background: '#141009' }}>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 20%, rgba(94, 61, 27, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 80%, rgba(94, 61, 27, 0.06) 0%, transparent 60%)
          `,
        }}
      />

      <Header topics={isConnected && topics.length ? topics : mockTopics} />

      <main className="relative max-w-7xl mx-auto px-4 py-6">
        {!isConnected ? (
          <div
            className="rounded-sm p-12 text-center"
            style={{
              background: 'linear-gradient(135deg, #2a1e12 0%, #1e1510 100%)',
              border: '1px solid rgba(94, 61, 27, 0.3)',
            }}
          >
            <div className="text-3xl mb-4">🔗</div>
            <h2 className="font-playfair font-bold text-xl mb-2" style={{ color: '#f0d9ad' }}>
              Wallet Not Connected
            </h2>
            <p className="font-typewriter text-sm" style={{ color: 'rgba(188, 149, 89, 0.5)' }}>
              Connect your wallet to access the Semaphore Intelligence Dispatch
            </p>
          </div>
        ) : (
        <>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(94, 61, 27, 0.6), transparent)' }} />
          <div
            className="flex items-center gap-3 px-4 py-1.5 rounded-sm"
            style={{ border: '1px solid rgba(94, 61, 27, 0.4)' }}
          >
            <span className="font-typewriter text-xs uppercase tracking-widest" style={{ color: 'rgba(200, 135, 30, 0.7)' }}>
              Narrative Intelligence Dispatch
            </span>
            <span className="font-mono text-xs" style={{ color: 'rgba(188, 149, 89, 0.4)' }}>
              ——  Series IV
            </span>
          </div>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(270deg, rgba(94, 61, 27, 0.6), transparent)' }} />
        </div>

        <div className="flex gap-1 mb-6">
          {(['active', 'transactions'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-1.5 rounded-sm font-typewriter text-xs uppercase tracking-widest transition-all"
              style={{
                background: tab === t ? 'rgba(94, 61, 27, 0.3)' : 'transparent',
                border: '1px solid rgba(94, 61, 27, 0.4)',
                color: tab === t ? '#f0d9ad' : 'rgba(188, 149, 89, 0.5)',
              }}
            >
              {t === 'active' ? 'Active Signals' : 'x402 Transactions'}
            </button>
          ))}
        </div>

        {tab === 'active' && !loading && <MarketOverview topics={topics} />}

        {tab === 'active' && (
          <FilterBar
            filters={filters}
            onChange={setFilters}
            totalCount={topics.length}
            filteredCount={filtered.length}
          />
        )}

        {tab === 'active' && (loading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((topic, i) => (
              <TopicCard key={topic.id} topic={topic} index={i} />
            ))}
          </div>
        ))}

        {tab === 'transactions' && (
          <TransactionHistory transactions={mockTransactions} />
        )}

        <div className="mt-12 pt-6 border-t text-center" style={{ borderColor: 'rgba(94, 61, 27, 0.3)' }}>
          <p className="font-typewriter text-xs uppercase tracking-widest" style={{ color: 'rgba(188, 149, 89, 0.3)' }}>
            Semaphore Intelligence Bureau — All transmissions are on-chain verified
          </p>
          <p className="font-mono text-xs mt-1" style={{ color: 'rgba(188, 149, 89, 0.2)' }}>
            ——  Data is simulated for demonstration purposes  ——
          </p>
        </div>
        </>
        )}
      </main>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="rounded-sm h-64 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #2a1e12 0%, #1e1510 100%)',
            border: '1px solid rgba(94, 61, 27, 0.3)',
          }}
        >
          <div className="p-4 space-y-3 animate-pulse">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-sm" style={{ background: 'rgba(94, 61, 27, 0.3)' }} />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 rounded-sm w-32" style={{ background: 'rgba(94, 61, 27, 0.3)' }} />
                <div className="h-3 rounded-sm w-20" style={{ background: 'rgba(94, 61, 27, 0.2)' }} />
              </div>
            </div>
            <div className="h-20 rounded-sm" style={{ background: 'rgba(94, 61, 27, 0.2)' }} />
            <div className="h-3 rounded-sm w-full" style={{ background: 'rgba(94, 61, 27, 0.2)' }} />
            <div className="h-3 rounded-sm w-3/4" style={{ background: 'rgba(94, 61, 27, 0.15)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="text-center py-20 rounded-sm"
      style={{
        background: 'linear-gradient(135deg, #1e1610 0%, #1a1410 100%)',
        border: '1px solid rgba(94, 61, 27, 0.3)',
      }}
    >
      <div className="text-4xl mb-4">⚡</div>
      <h3 className="font-playfair font-bold text-xl mb-2" style={{ color: '#f0d9ad' }}>
        No Transmissions Found
      </h3>
      <p className="font-typewriter text-sm" style={{ color: 'rgba(188, 149, 89, 0.5)' }}>
        Adjust your dispatch filters to receive signals
      </p>
    </div>
  );
}
