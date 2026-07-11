// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

library BidHash {

    function generateHash( uint256 amount , bytes32 salt ) internal   pure  returns (bytes32)
    {
        return keccak256(
            abi.encodePacked(amount, salt)
        );
    }
}