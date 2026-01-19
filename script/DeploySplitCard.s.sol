// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "forge-std/Script.sol";
import "../contract/splitcard.sol";

contract DeploySplitCard is Script {
    function run() external {
        vm.startBroadcast();

        SplitCard splitCard = new SplitCard();

        console.log("SplitCard deployed to:", address(splitCard));

        vm.stopBroadcast();
    }
}
