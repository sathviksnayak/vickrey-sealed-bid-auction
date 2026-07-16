// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./VickreyAuction.sol";

contract AuctionFactory{


event AuctionCreated(address indexed seller,address auction);




address[] public   auctions;



function createAuction(uint256 commitDuration,uint256 revealDuration,uint256 penalty,uint256 reservePrice) external {
    VickreyAuction auction = new VickreyAuction(
    msg.sender,
    commitDuration,
    revealDuration,
    penalty,
    reservePrice
);

auctions.push(address(auction));

emit AuctionCreated(msg.sender, address(auction));
}


function getAuctions() external view returns(address[] memory){
    return auctions;
}



}