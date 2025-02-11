// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/Groth16Verifier.sol";
import "../src/ZkAirdrop.sol";

contract ZkAirdropScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        Groth16Verifier gv = new Groth16Verifier();
        uint256 root = 1361273830077940999351469964168601562907739345567305980408926899221680173608;
        ZkAirdrop sm = new ZkAirdrop(address(gv), root);

        vm.stopBroadcast();
    }
}