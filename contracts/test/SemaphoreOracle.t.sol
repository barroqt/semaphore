// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/SemaphoreOracle.sol";

contract SemaphoreOracleTest is Test {
    SemaphoreOracle public oracle;
    address public owner;
    address public keeper;
    address public nonKeeper;
    bytes32 internal constant ASSET_ID = keccak256("ETH");

    function setUp() public {
        owner = address(this);
        keeper = makeAddr("keeper");
        nonKeeper = makeAddr("nonKeeper");
        oracle = new SemaphoreOracle(owner, keeper);
    }

    function test_NonKeeperCannotFulfillSentimentUpdate() public {
        vm.prank(nonKeeper);
        vm.expectRevert();
        oracle.fulfillSentimentUpdate(bytes32(uint256(1)), 80e18, 10e18, 2, bytes32(0));
    }

    function test_RequestSentimentUpdateStoresRequestAndIncrementsCount() public {
        string[] memory sources = new string[](2);
        sources[0] = "x";
        sources[1] = "reddit";

        bytes32 requestId = oracle.requestSentimentUpdate(ASSET_ID, sources);

        assertEq(oracle.requestCount(), 1);

        (bytes32 assetId, address requester, bool fulfilled) = oracle.requests(requestId);
        assertEq(assetId, ASSET_ID);
        assertEq(requester, address(this));
        assertEq(fulfilled, false);
    }

    function test_GetLatestSentimentAfterFulfill() public {
        string[] memory sources = new string[](1);
        sources[0] = "x";
        bytes32 requestId = oracle.requestSentimentUpdate(ASSET_ID, sources);

        vm.prank(keeper);
        oracle.fulfillSentimentUpdate(requestId, 80e18, 120e18, 3, bytes32(uint256(0x1234)));

        SemaphoreOracle.SentimentRound memory latest = oracle.getLatestSentiment(ASSET_ID);
        assertEq(latest.score, 80e18);
        assertEq(latest.volumeIndex, 120e18);
        assertEq(latest.signal, 3);
        assertEq(latest.dataHash, bytes32(uint256(0x1234)));
        assertGt(latest.updatedAt, 0);
    }

    function test_GetRoundCountAndDataAfterFulfill() public {
        string[] memory sources = new string[](1);
        sources[0] = "x";
        bytes32 requestId = oracle.requestSentimentUpdate(ASSET_ID, sources);

        vm.prank(keeper);
        oracle.fulfillSentimentUpdate(requestId, 80e18, 120e18, 1, bytes32(uint256(0x1234)));

        assertEq(oracle.getRoundCount(ASSET_ID), 1);

        SemaphoreOracle.SentimentRound memory round = oracle.getRound(ASSET_ID, 0);
        assertEq(round.score, 80e18);
        assertEq(round.volumeIndex, 120e18);
        assertEq(round.signal, 1);
        assertEq(round.dataHash, bytes32(uint256(0x1234)));
        assertGt(round.updatedAt, 0);
    }

    function test_CannotFulfillSameRequestIdTwice() public {
        string[] memory sources = new string[](1);
        sources[0] = "x";
        bytes32 requestId = oracle.requestSentimentUpdate(ASSET_ID, sources);

        vm.prank(keeper);
        oracle.fulfillSentimentUpdate(requestId, 80e18, 100e18, 2, bytes32(uint256(0x1234)));

        vm.prank(keeper);
        vm.expectRevert();
        oracle.fulfillSentimentUpdate(requestId, 90e18, 200e18, 4, bytes32(uint256(0x5678)));
    }

    function test_OwnerCanUpdateKeeper() public {
        address newKeeper = makeAddr("newKeeper");
        oracle.setKeeper(newKeeper);
        assertEq(oracle.keeper(), newKeeper);
    }
}