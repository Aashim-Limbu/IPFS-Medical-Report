// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import {EHRManagement} from "src/EHRManagement.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {Script, console} from "forge-std/Script.sol";

contract DeployEHRManagement is Script {
    function run() public {
        deployContract();
    }

    function deployContract() public returns (EHRManagement, HelperConfig) {
        HelperConfig helperConfig = new HelperConfig();
        HelperConfig.NetworkConfig memory activeNetworkConfig = helperConfig.getCurrentConfig();
        vm.startBroadcast();
        EHRManagement ehrManagement = new EHRManagement(activeNetworkConfig.priceFeed);
        vm.stopBroadcast();
        return (ehrManagement, helperConfig);
    }
}
