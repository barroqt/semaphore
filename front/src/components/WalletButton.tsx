import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="font-typewriter text-xs uppercase tracking-wider px-3 py-2 rounded-sm transition-all duration-200"
        style={{
          background: 'rgba(82, 168, 67, 0.15)',
          border: '1px solid rgba(82, 168, 67, 0.4)',
          color: '#52a843',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(82, 168, 67, 0.25)';
          e.currentTarget.style.borderColor = 'rgba(82, 168, 67, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(82, 168, 67, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(82, 168, 67, 0.4)';
        }}
      >
        {address.slice(0, 6)}...{address.slice(-4)}
      </button>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      disabled={isPending}
      className="font-typewriter text-xs uppercase tracking-wider px-3 py-2 rounded-sm transition-all duration-200"
      style={{
        background: 'rgba(200, 135, 30, 0.15)',
        border: '1px solid rgba(200, 135, 30, 0.4)',
        color: '#c8871e',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(200, 135, 30, 0.25)';
        e.currentTarget.style.borderColor = 'rgba(200, 135, 30, 0.6)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(200, 135, 30, 0.15)';
        e.currentTarget.style.borderColor = 'rgba(200, 135, 30, 0.4)';
      }}
    >
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
