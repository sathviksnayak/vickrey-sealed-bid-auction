// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;


import "./libraries/BidHash.sol";

contract VickreyAuction  {

    //errors
    error InvalidDuration();


    error CommitPhaseNotEnded();


    error CommitPhaseEnded();


    error Alreadycommited();


    error InvalidDeposit();


    error BidAlreadyRevealed();


    error RevealPhaseEnded();


    error NoCommitmentFound();


    error InvalidReveal();


    error InsufficientDeposit();




    struct Commitment {
        bytes32 bidHash;
        uint256 deposit;
        bool revealed;
    }


    mapping(address => Commitment) private commitments;



    mapping(address => uint256) private refunds;



    //events
    event BidCommitted(address indexed bidder, bytes32 bidHash, uint256 deposit);

    event BidRevealed(address indexed bidder, uint256 amount);




    address public immutable seller;

    uint256 public immutable commitDeadline;

    uint256 public immutable revealDeadline;

    constructor(uint256 _commitDuration,uint256 _revealDuration) {

        if (_commitDuration == 0 || _revealDuration == 0) {
        revert InvalidDuration();
        }


        seller = msg.sender;

        commitDeadline = block.timestamp + _commitDuration;

        revealDeadline = commitDeadline + _revealDuration;

    }




    address public highestBidder;

    uint256 public highestBid;

    uint256 public secondHighestBid;

  





    function commitBid(bytes32 bidHash) external payable {

        if(block.timestamp >= commitDeadline) {
            revert CommitPhaseEnded();
        }

        if(commitments[msg.sender].bidHash != bytes32(0)) {
            revert Alreadycommited();
        }

        if(msg.value == 0) {
            revert InvalidDeposit();
        }


        commitments[msg.sender] = Commitment({
            bidHash: bidHash,
            deposit: msg.value,
            revealed: false
        });


        emit BidCommitted(msg.sender, bidHash, msg.value);



    }

    function revealBid(uint256 amount, bytes32 salt) external  {

        Commitment storage commitment = commitments[msg.sender];

        if (block.timestamp < commitDeadline) {
        revert CommitPhaseNotEnded();
        }

        if(commitment.revealed) {
            revert BidAlreadyRevealed();
        }

        if(block.timestamp >= revealDeadline) {
            revert RevealPhaseEnded();
        }

        if(commitment.bidHash == bytes32(0)) {
            revert NoCommitmentFound();
        }

        if(commitment.bidHash != BidHash.generateHash(amount, salt)) {
            revert InvalidReveal();

        }

        if (commitment.deposit < amount) {
            revert InsufficientDeposit();
            }

        commitment.revealed = true;

        if(amount > highestBid) {
            secondHighestBid = highestBid;
            highestBid = amount;
            highestBidder = msg.sender;
        } else if(amount > secondHighestBid) {
            secondHighestBid = amount;
        }

        emit BidRevealed(msg.sender, amount);


    }

    function finalizeAuction() external  {

    }

    function withdrawRefund() external  {

    }

    

}