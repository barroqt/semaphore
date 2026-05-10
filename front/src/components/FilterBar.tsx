import { Search, ArrowUpDown, SlidersHorizontal } from 'lucide-react';
import type { FilterState, SortField, SortDirection, TopicCategory, SentimentLabel } from '../types';

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

const CATEGORIES: (TopicCategory | 'All')[] = ['All', 'Coin', 'Protocol', 'Blockchain'];
const LABELS: (SentimentLabel | 'All')[] = ['All', 'Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed'];
const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'score', label: 'Score' },
  { value: 'name', label: 'Name' },
  { value: 'change24h', label: '24h Change' },
  { value: 'volume', label: 'Volume' },
];

const LABEL_DOT: Record<string, string> = {
  'Extreme Fear': '#ad180b',
  'Fear': '#f03014',
  'Neutral': '#c8871e',
  'Greed': '#52a843',
  'Extreme Greed': '#2e7a32',
  'All': '#bc9559',
};

function SelectButton({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean;
  color?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-sm font-typewriter text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5"
      style={{
        background: active ? (color ? `${color}20` : 'rgba(200, 135, 30, 0.15)') : 'transparent',
        border: `1px solid ${active ? (color || 'rgba(200, 135, 30, 0.6)') : 'rgba(94, 61, 27, 0.4)'}`,
        color: active ? (color || '#c8871e') : 'rgba(188, 149, 89, 0.6)',
        boxShadow: active ? `0 0 8px ${color || 'rgba(200, 135, 30, 0.3)'}30` : 'none',
      }}
    >
      {color && (
        <span
          className="inline-block w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: color, opacity: active ? 1 : 0.5 }}
        />
      )}
      {children}
    </button>
  );
}

export function FilterBar({ filters, onChange, totalCount, filteredCount }: Props) {
  const update = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });

  const toggleSort = (field: SortField) => {
    if (filters.sortField === field) {
      update({ sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc' });
    } else {
      update({ sortField: field, sortDirection: 'desc' });
    }
  };

  return (
    <div
      className="rounded-sm paper-texture mb-6"
      style={{
        background: 'linear-gradient(135deg, #241a0e 0%, #1e1510 100%)',
        border: '1px solid rgba(94, 61, 27, 0.5)',
        boxShadow: 'inset 0 1px 0 rgba(200, 135, 30, 0.08)',
      }}
    >
      <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: 'rgba(94, 61, 27, 0.3)' }}>
        <SlidersHorizontal size={14} style={{ color: 'rgba(200, 135, 30, 0.6)' }} />
        <span className="font-typewriter text-xs uppercase tracking-widest" style={{ color: 'rgba(200, 135, 30, 0.6)' }}>
          Dispatch Filters
        </span>
        <div className="flex-1" />
        <span className="font-mono text-xs" style={{ color: 'rgba(188, 149, 89, 0.5)' }}>
          {filteredCount}/{totalCount} signals
        </span>
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-sm"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(94, 61, 27, 0.4)' }}
        >
          <Search size={13} style={{ color: 'rgba(200, 135, 30, 0.5)' }} />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => update({ searchQuery: e.target.value })}
            placeholder="Search transmissions..."
            className="bg-transparent flex-1 font-mono text-xs outline-none placeholder-opacity-40"
            style={{
              color: '#e8dcc4',
              caretColor: '#c8871e',
            }}
          />
        </div>

        {/* Category filter */}
        <div>
          <div className="font-typewriter text-xs uppercase tracking-widest mb-1.5" style={{ color: 'rgba(188, 149, 89, 0.45)' }}>
            Category
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <SelectButton
                key={cat}
                active={filters.category === cat}
                onClick={() => update({ category: cat })}
              >
                {cat}
              </SelectButton>
            ))}
          </div>
        </div>

        {/* Sentiment filter */}
        <div>
          <div className="font-typewriter text-xs uppercase tracking-widest mb-1.5" style={{ color: 'rgba(188, 149, 89, 0.45)' }}>
            Sentiment
          </div>
          <div className="flex flex-wrap gap-1.5">
            {LABELS.map((lbl) => (
              <SelectButton
                key={lbl}
                active={filters.label === lbl}
                color={LABEL_DOT[lbl]}
                onClick={() => update({ label: lbl })}
              >
                {lbl}
              </SelectButton>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div>
          <div className="font-typewriter text-xs uppercase tracking-widest mb-1.5" style={{ color: 'rgba(188, 149, 89, 0.45)' }}>
            Sort By
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => toggleSort(opt.value)}
                className="px-3 py-1.5 rounded-sm font-typewriter text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200"
                style={{
                  background: filters.sortField === opt.value ? 'rgba(200, 135, 30, 0.15)' : 'transparent',
                  border: `1px solid ${filters.sortField === opt.value ? 'rgba(200, 135, 30, 0.6)' : 'rgba(94, 61, 27, 0.4)'}`,
                  color: filters.sortField === opt.value ? '#c8871e' : 'rgba(188, 149, 89, 0.6)',
                }}
              >
                {opt.label}
                {filters.sortField === opt.value && (
                  <ArrowUpDown
                    size={10}
                    style={{
                      transform: filters.sortDirection === 'asc' ? 'scaleY(-1)' : 'none',
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
