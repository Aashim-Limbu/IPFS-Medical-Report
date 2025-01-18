// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;
import {Script} from "forge-std/Script.sol";
import {MockV3Aggregator} from "@chainlink/contracts/v0.8/tests/MockV3Aggregator.sol";

contract HelperConfig is Script {
    uint8 constant DECIMALS = 8;
    int256 constant INITIAL_PRICE = 2000e8;
    struct NetworkConfig {
        address priceFeed;
    }
    NetworkConfig activeNetConfig;

    constructor() {
        if (block.chainid == 11155111) {
            activeNetConfig = getSepoliaEthConfig();
        } else if (block.chainid == 300) {
            activeNetConfig = getZKSyncSepoliaConfig();
        } else {
            activeNetConfig = getAnvilConfig();
        }
    }

    function getSepoliaEthConfig() public pure returns (NetworkConfig memory) {
        NetworkConfig memory sepoliaConfig = NetworkConfig({
            priceFeed: 0x694AA1769357215DE4FAC081bf1f309aDC325306
        }); // ETH -->USD
        return sepoliaConfig;
    }

    function getZKSyncSepoliaConfig()
        public
        pure
        returns (NetworkConfig memory)
    {
        NetworkConfig memory zkConfig = NetworkConfig({
            priceFeed: 0xfEefF7c3fB57d18C5C6Cdd71e45D2D0b4F9377bF
        });
        return zkConfig;
    }

    function getAnvilConfig() public returns (NetworkConfig memory) {
        if (activeNetConfig.priceFeed != address(0)) return activeNetConfig;
        MockV3Aggregator mockAggregator;
        vm.startBroadcast();
        mockAggregator = new MockV3Aggregator(DECIMALS, INITIAL_PRICE);
        vm.stopBroadcast();
        NetworkConfig memory anvilConfig = NetworkConfig({
            priceFeed: address(mockAggregator)
        });
        return anvilConfig;
    }

    /*//////////////////////////////////////////////////////////////
                                GETTERS
    //////////////////////////////////////////////////////////////*/
    function getCurrentConfig() public view returns (NetworkConfig memory) {
        return activeNetConfig;
    }
}
