// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std-1.12.0/Script.sol";
import {MockUSD} from "../contracts/MockUSD.sol";
import {DemoVault} from "../contracts/DemoVault.sol";

contract DevDeploy is Script {
    function run() external {

        uint256 deployerPrivateKey = vm.deriveKey("test test test test test test test test test test test junk", 0);
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy MockUSDC
        MockUSD usdc = new MockUSD();
        console.log("MockUSD deployed at:", address(usdc));

        // Mint test tokens to deployer for testing
        usdc.mint(deployer, 1000 * 10**6);

        DemoVault vault = new DemoVault(address(usdc), 50); // 0.5% fee
        console.log("DemoVault deployed at:", address(vault));

        vm.stopBroadcast();
    }
}
