# Semaphore Keeper - Frontend Integration Handoff

## Deployed Contract

| Network | Address |
|---------|---------|
| Base Sepolia | `TODO: Deploy and fill in` |

## ABI File

Location: `keeper/abi/SemaphoreOracle.json`

Copy from: `contracts/out/SemaphoreOracle.sol/SemaphoreOracle.json`

## Asset ID Mapping

| Label | keccak256(bytes32) |
|-------|-------------------|
| ETH | `0xaaaebeba3810b1e6b70781f14b2d72c1cb89c0b2b320c43bb67ff79f562f5ff4` |
| BTC | `0xe98e2830be1a7e4156d656a7505e65d08c67660dc618072422e9c78053c261e9` |
| SOL | `0x0a3ec4fc70eaf64faf6eeda4e9b2bd4742a785464053aa23afad8bd24650e86f` |

Note: Replace with actual deployed contract address after deployment.

## Events to Watch

| Event | Signature |
|-------|-----------|
| `SentimentUpdateRequested` | `SentimentUpdateRequested(bytes32 indexed requestId, bytes32 indexed assetId, address indexed requester)` |
| `SentimentUpdateFulfilled` | `SentimentUpdateFulfilled(bytes32 indexed requestId, bytes32 indexed assetId, int256 score, uint256 volumeIndex, uint8 signal, bytes32 dataHash)` |

## Read Functions

| Function | Signature |
|----------|-----------|
| `getLatestSentiment` | `getLatestSentiment(bytes32 assetId) → (int256 score, uint256 volumeIndex, uint8 signal, bytes32 dataHash, uint256 updatedAt)` |
| `getRoundCount` | `getRoundCount(bytes32 assetId) → uint256` |
| `getRound` | `getRound(bytes32 assetId, uint256 roundIndex) → (int256 score, uint256 volumeIndex, uint8 signal, bytes32 dataHash, uint256 updatedAt)` |

## Score Encoding

The `score` returned from `getLatestSentiment` and `getRound` is an `int256` scaled by `1e18`.

**To convert to float in [-1, 1]:**

```
floatScore = int256Score / 1e18
```

Example:
- Returned: `500000000000000000` (int256)
- Actual: `0.5` (float)

## Signal Values

| Signal | Meaning |
|--------|---------|
| 0 | Strong Negative |
| 1 | Negative |
| 2 | Neutral |
| 3 | Positive |
| 4 | Strong Positive |

## Volume Index

The `volumeIndex` is a `uint256` scaled by `1e18`, representing social media activity volume normalized to [0, 1].

```
floatVolumeIndex = uint256VolumeIndex / 1e18
```

## Example Usage

### Request Sentiment Update

```typescript
import { keccak256, toBytes } from 'viem';

const assetId = keccak256(toBytes('ETH'));
const sources = ['twitter', 'reddit'];

await writeContract({
  address: ORACLE_ADDRESS,
  abi: SemaphoreOracleABI,
  functionName: 'requestSentimentUpdate',
  args: [assetId, sources],
});
```

### Read Latest Sentiment

```typescript
const assetId = keccak256(toBytes('ETH'));
const [score, volumeIndex, signal, dataHash, updatedAt] = await readContract({
  address: ORACLE_ADDRESS,
  abi: SemaphoreOracleABI,
  functionName: 'getLatestSentiment',
  args: [assetId],
});

const normalizedScore = Number(score) / 1e18;
console.log(`Score: ${normalizedScore}, Signal: ${signal}`);
```