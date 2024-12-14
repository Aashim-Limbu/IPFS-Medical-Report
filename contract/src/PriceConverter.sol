// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;
import {AggregatorV3Interface} from "@chainlink/contracts/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {console} from "forge-std/Test.sol";

//Basically we talk eth in terms of wei.
library PriceConverter {
    function getCurrentPrice(
        AggregatorV3Interface dataFeed
    ) internal view returns (uint256) {
        (, int answer, , , ) = dataFeed.latestRoundData();
        return uint256(answer * 1e10); //converting to 10e18 by default for decimal precision they are multiplied with 1e8 so we only add 1e10 to convert it into wei.
    }

    function getEquivalentUSD(
        uint256 ethAmount,
        AggregatorV3Interface dataFeed
    ) internal view returns (uint256) {
        uint currentFare = getCurrentPrice(dataFeed);
        uint ethinUSD = (currentFare * ethAmount) / (1e18); //since 1e18*1e18 leads to 1e36
        return ethinUSD;
    }
}
