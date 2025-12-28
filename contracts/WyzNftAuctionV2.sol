// SPDX-License-Identifier: MIT 
pragma solidity ^0.8;

import "./WyzNftAuction.sol";

contract WyzNftAuctionV2 is WyzNftAuction {
    function addCustom() public view returns(string memory){
        return "welcome!";
    }
}