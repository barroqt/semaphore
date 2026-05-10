import type { X402Transaction } from '../types';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function statusColor(status: X402Transaction['status']) {
  switch (status) {
    case 'confirmed': return 'rgba(34, 197, 94, 0.8)';
    case 'pending': return 'rgba(234, 179, 8, 0.8)';
    case 'failed': return 'rgba(239, 68, 68, 0.8)';
  }
}

interface Props {
  transactions: X402Transaction[];
}

export function TransactionHistory({ transactions }: Props) {
  const totalSpent = transactions
    .filter((t) => t.status === 'confirmed')
    .reduce((sum, t) => sum + t.usdValue, 0);

  return (
    <div>
      <div
        className="rounded-sm mb-6 p-4 flex items-center justify-between"
        style={{
          background: 'linear-gradient(135deg, #2a1e12 0%, #1e1510 100%)',
          border: '1px solid rgba(94, 61, 27, 0.3)',
        }}
      >
        <div>
          <span className="font-typewriter text-xs uppercase tracking-widest" style={{ color: 'rgba(200, 135, 30, 0.7)' }}>
            Total x402 Spend
          </span>
          <div className="font-mono text-2xl mt-1" style={{ color: '#f0d9ad' }}>
            ${totalSpent.toFixed(2)} USD
          </div>
        </div>
        <div className="text-right">
          <span className="font-typewriter text-xs uppercase tracking-widest" style={{ color: 'rgba(200, 135, 30, 0.7)' }}>
            Transactions
          </span>
          <div className="font-mono text-2xl mt-1" style={{ color: '#f0d9ad' }}>
            {transactions.length}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {transactions.map((tx) => (
          <div
            key={tx.hash}
            className="rounded-sm p-4 flex items-center gap-4"
            style={{
              background: 'linear-gradient(135deg, #2a1e12 0%, #1e1510 100%)',
              border: '1px solid rgba(94, 61, 27, 0.3)',
            }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs" style={{ color: 'rgba(188, 149, 89, 0.6)' }}>
                  {tx.hash}
                </span>
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: statusColor(tx.status) }}
                />
              </div>
              <div className="font-typewriter text-xs uppercase tracking-wider" style={{ color: 'rgba(188, 149, 89, 0.5)' }}>
                {tx.endpoint}
              </div>
            </div>

            <div className="text-right">
              <div className="font-mono text-sm" style={{ color: '#f0d9ad' }}>
                {tx.amount} {tx.token}
              </div>
              <div className="font-mono text-xs mt-0.5" style={{ color: 'rgba(188, 149, 89, 0.5)' }}>
                ${tx.usdValue.toFixed(2)}
              </div>
            </div>

            <div className="text-right w-16">
              <div className="font-mono text-xs" style={{ color: 'rgba(188, 149, 89, 0.5)' }}>
                {timeAgo(tx.timestamp)}
              </div>
              <div className="font-typewriter text-xs uppercase mt-0.5" style={{ color: statusColor(tx.status) }}>
                {tx.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
