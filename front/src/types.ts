export type SentimentLabel =
  | 'Extreme Fear'
  | 'Fear'
  | 'Neutral'
  | 'Greed'
  | 'Extreme Greed';

export type TopicCategory = 'Coin' | 'Protocol' | 'Blockchain';

export type SortField = 'score' | 'name' | 'change24h' | 'volume';
export type SortDirection = 'asc' | 'desc';

export interface SparkPoint {
  timestamp: number;
  score: number;
}

export interface TopicSignal {
  id: string;
  name: string;
  ticker: string;
  category: TopicCategory;
  score: number;
  label: SentimentLabel;
  change24h: number;
  change7d: number;
  volume: number;
  narrativeStrength: number;
  dominantNarrative: string;
  signals: {
    bullish: number;
    bearish: number;
    neutral: number;
  };
  sparkline: SparkPoint[];
  lastUpdated: string;
  transmissionId: string;
}

export interface FilterState {
  category: TopicCategory | 'All';
  label: SentimentLabel | 'All';
  sortField: SortField;
  sortDirection: SortDirection;
  searchQuery: string;
}
