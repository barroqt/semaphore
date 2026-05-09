// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console2.sol";
import "../src/SemaphoreOracle.sol";

contract Deploy is Script {
    function run() external returns (SemaphoreOracle oracle) {
        address keeper = vm.envAddress("KEEPER_ADDRESS");

        vm.startBroadcast();
        oracle = new SemaphoreOracle(msg.sender, keeper);
        vm.stopBroadcast();

        console2.log("SemaphoreOracle deployed at:", address(oracle));
    }
}
