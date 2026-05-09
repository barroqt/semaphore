// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

interface SemaphoreOracle {
    function requestSentimentUpdate(uint256 assetId) external returns (uint256 requestId);

    function fulfillSentimentUpdate(
        uint256 requestId,
        uint256 score,
        string calldata signal,
        bytes32 dataHash
    ) external;

    function getLatestSentiment(uint256 assetId) external view returns (uint256 score, string memory signal, bytes32 dataHash);

    function getRoundCount(uint256 assetId) external view returns (uint256);

    function getRound(uint256 assetId, uint256 roundId)
        external
        view
        returns (uint256 score, string memory signal, bytes32 dataHash, uint256 timestamp);

    function setKeeper(address newKeeper) external;

    function keeper() external view returns (address);
}

contract SemaphoreOracleTest is Test {
    event SentimentRequested(uint256 indexed assetId, address indexed requester);
    SemaphoreOracle public oracle;
    address public owner;
    address public keeper;
    address public nonKeeper;

    function setUp() public {
        owner = address(this);
        keeper = makeAddr("keeper");
        nonKeeper = makeAddr("nonKeeper");
        oracle = new SemaphoreOracle(owner, keeper);
    }

    function test_NonKeeperCannotFulfillSentimentUpdate() public {
        vm.prank(nonKeeper);
        vm.expectRevert();
        oracle.fulfillSentimentUpdate(1, 80, "signal123", bytes32(0));
    }

    function test_RequestSentimentUpdateEmitsEvent() public {
        vm.expectEmit(true, true, true, true);
        emit SentimentRequested(1, address(this));
        oracle.requestSentimentUpdate(1);
    }

    function test_GetLatestSentimentAfterFulfill() public {
        uint256 requestId = oracle.requestSentimentUpdate(1);

        vm.prank(keeper);
        oracle.fulfillSentimentUpdate(requestId, 80, "signal123", bytes32(0x1234));

        (uint256 score, string memory signal, bytes32 dataHash) = oracle.getLatestSentiment(1);
        assertEq(score, 80);
        assertEq(signal, "signal123");
        assertEq(dataHash, bytes32(0x1234));
    }

    function test_GetRoundCountAndDataAfterFulfill() public {
        uint256 requestId = oracle.requestSentimentUpdate(1);

        vm.prank(keeper);
        oracle.fulfillSentimentUpdate(requestId, 80, "signal123", bytes32(0x1234));

        assertEq(oracle.getRoundCount(1), 1);

        (uint256 roundScore, string memory roundSignal, bytes32 roundDataHash, uint256 roundTimestamp) =
            oracle.getRound(1, 0);
        assertEq(roundScore, 80);
        assertEq(roundSignal, "signal123");
        assertEq(roundDataHash, bytes32(0x1234));
    }

    function test_CannotFulfillSameRequestIdTwice() public {
        uint256 requestId = oracle.requestSentimentUpdate(1);

        vm.prank(keeper);
        oracle.fulfillSentimentUpdate(requestId, 80, "signal123", bytes32(0x1234));

        vm.prank(keeper);
        vm.expectRevert();
        oracle.fulfillSentimentUpdate(requestId, 90, "signal456", bytes32(0x5678));
    }

    function test_OwnerCanUpdateKeeper() public {
        address newKeeper = makeAddr("newKeeper");

        oracle.setKeeper(newKeeper);

        assertEq(oracle.keeper(), newKeeper);
    }
}