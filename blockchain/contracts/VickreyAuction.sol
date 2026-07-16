// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;


import "./libraries/BidHash.sol";

contract VickreyAuction  {
    //constants
    
    //errors
    error InvalidDuration();

    error CommitPhaseNotEnded();

    error CommitPhaseEnded();

    error AlreadyCommitted();

    error InvalidDeposit();

    error BidAlreadyRevealed();

    error RevealPhaseEnded();

    error NoCommitmentFound();

    error InvalidReveal();

    error InsufficientDeposit();

    error RevealPhaseNotEnded();

    error AuctionAlreadyFinalized();

    error TransferFailed();

    error RefundNotAvailable();

    error NotFinalised();

    error InvalidPenaltyPercent();

    //error BidBelowReservePrice();


//state variables

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

    event AuctionFinalised(address indexed seller, address indexed highestBidder, uint256 highestBid, uint256 secondHighestBid);

    event RefundWithdrawn(address indexed bidder,uint256 amount);

  //state variables

    address public immutable seller;

    uint256 public immutable commitDeadline;

    uint256 public immutable revealDeadline;

    uint256 public immutable PENALTY_PERCENT;

    uint256 public immutable reservePrice;

    bool public finalized;

    constructor(address _seller,uint256 _commitDuration,uint256 _revealDuration,uint256 _penaltyPercent,uint256 _reservePrice)  {

        if (_commitDuration == 0 || _revealDuration == 0) {
        revert InvalidDuration();
        }

        reservePrice=_reservePrice;


        seller = _seller;

        commitDeadline = block.timestamp + _commitDuration;

        revealDeadline = commitDeadline + _revealDuration;
        if(_penaltyPercent > 100) {
            revert InvalidPenaltyPercent();
        }
        PENALTY_PERCENT = _penaltyPercent;

        highestBid=reservePrice;

        secondHighestBid=reservePrice;

    }

    address[] private bidders;

    address public highestBidder;

    uint256 public highestBid;

    uint256 public secondHighestBid;

  



//functions

    function commitBid(bytes32 bidHash) external payable {

        if(block.timestamp >= commitDeadline) {
            revert CommitPhaseEnded();
        }

        if(commitments[msg.sender].bidHash != bytes32(0)) {
            revert AlreadyCommitted();
        }

        if(msg.value <reservePrice) {
            revert InvalidDeposit();
        }



        commitments[msg.sender] = Commitment({
            bidHash: bidHash,
            deposit: msg.value,
            revealed: false
        });

        bidders.push(msg.sender);


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
        uint256 sellerPenalty = 0;

        if (finalized) {
            revert AuctionAlreadyFinalized();
        }

        if(block.timestamp < revealDeadline) {
            revert RevealPhaseNotEnded();
        }



        for(uint256 i=0;i<bidders.length;i++){
            address bidder=bidders[i];
            Commitment storage commitment = commitments[bidder];

            if(commitment.revealed) {
                if(bidder == highestBidder) {
                    //winner pays the secondhighest bid
                    uint256 refund = commitment.deposit - secondHighestBid;
                    if(refund > 0) {
                        refunds[bidder] = refund;
                    }
                } else {
                    // Full refund for losing bidders
                    refunds[bidder] = commitment.deposit;
                }
            } else {
                //penalty for not revealing bid
                uint256 penalty =commitment.deposit * PENALTY_PERCENT / 100;
                sellerPenalty+=penalty;

                refunds[bidder] = commitment.deposit - penalty;
            }
        }
        finalized = true;

        uint256 sellerAmount = sellerPenalty;

        if (highestBidder != address(0)) {
       
            sellerAmount += secondHighestBid;
        }

        if (sellerAmount > 0) {
            (bool success, ) = payable(seller).call{value: sellerAmount}("");

        if (!success) {
            revert TransferFailed();
            }
        }

        emit AuctionFinalised(seller, highestBidder, highestBid, secondHighestBid);

    }

    function withdrawRefund() external  {
        if(!finalized) {
            revert NotFinalised();
        }

        uint256 refundAmount = refunds[msg.sender];

        if(refundAmount == 0) {
            revert RefundNotAvailable();
        }

        refunds[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");

        if(!success) {
            revert TransferFailed();
        }

          emit RefundWithdrawn(msg.sender, refundAmount);


    }

  

    

}