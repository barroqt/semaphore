// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SemaphoreOracle {
    struct SentimentRound {
        int256 score; // 1e18 scaled
        uint256 volumeIndex; // 1e18 scaled
        uint8 signal; // 0-4
        bytes32 dataHash;
        uint256 updatedAt;
    }

    struct Request {
        bytes32 assetId;
        address requester;
        string[] sources;
        bool fulfilled;
    }

    address public owner;
    address public keeper;
    uint256 public requestCount;

    mapping(bytes32 => Request) public requests;
    mapping(bytes32 => SentimentRound) private latestSentiment;
    mapping(bytes32 => SentimentRound[]) private sentimentHistory;

    event SentimentUpdateRequested(bytes32 indexed requestId, bytes32 indexed assetId, address indexed requester);
    event SentimentUpdateFulfilled(
        bytes32 indexed requestId, bytes32 indexed assetId, int256 score, uint256 volumeIndex, uint8 signal, bytes32 dataHash
    );
    event KeeperUpdated(address indexed previousKeeper, address indexed newKeeper);

    modifier onlyOwner() {
        require(msg.sender == owner, "SemaphoreOracle: only owner");
        _;
    }

    modifier onlyKeeper() {
        require(msg.sender == keeper, "SemaphoreOracle: only keeper");
        _;
    }

    constructor(address _owner, address _keeper) {
        require(_owner != address(0), "SemaphoreOracle: owner zero");
        require(_keeper != address(0), "SemaphoreOracle: keeper zero");
        owner = _owner;
        keeper = _keeper;
    }

    function setKeeper(address newKeeper) external onlyOwner {
        require(newKeeper != address(0), "SemaphoreOracle: keeper zero");
        address previousKeeper = keeper;
        keeper = newKeeper;
        emit KeeperUpdated(previousKeeper, newKeeper);
    }

    function requestSentimentUpdate(bytes32 assetId, string[] calldata sources) external returns (bytes32 requestId) {
        uint256 nextCount = requestCount + 1;
        requestCount = nextCount;

        requestId = keccak256(abi.encodePacked(address(this), nextCount, assetId, msg.sender, block.timestamp));

        Request storage req = requests[requestId];
        req.assetId = assetId;
        req.requester = msg.sender;
        req.fulfilled = false;

        for (uint256 i = 0; i < sources.length; ++i) {
            req.sources.push(sources[i]);
        }

        emit SentimentUpdateRequested(requestId, assetId, msg.sender);
    }

    function fulfillSentimentUpdate(
        bytes32 requestId,
        int256 score,
        uint256 volumeIndex,
        uint8 signal,
        bytes32 dataHash
    ) external onlyKeeper {
        require(signal <= 4, "SemaphoreOracle: invalid signal");

        Request storage req = requests[requestId];
        require(req.requester != address(0), "SemaphoreOracle: request not found");
        require(!req.fulfilled, "SemaphoreOracle: already fulfilled");

        SentimentRound memory round = SentimentRound({
            score: score,
            volumeIndex: volumeIndex,
            signal: signal,
            dataHash: dataHash,
            updatedAt: block.timestamp
        });

        latestSentiment[req.assetId] = round;
        sentimentHistory[req.assetId].push(round);
        req.fulfilled = true;

        emit SentimentUpdateFulfilled(requestId, req.assetId, score, volumeIndex, signal, dataHash);
    }

    function getLatestSentiment(bytes32 assetId) external view returns (SentimentRound memory) {
        return latestSentiment[assetId];
    }

    function getRoundCount(bytes32 assetId) external view returns (uint256) {
        return sentimentHistory[assetId].length;
    }

    function getRound(bytes32 assetId, uint256 roundIndex) external view returns (SentimentRound memory) {
        require(roundIndex < sentimentHistory[assetId].length, "SemaphoreOracle: round out of bounds");
        return sentimentHistory[assetId][roundIndex];
    }
}
