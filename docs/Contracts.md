# Smart Contracts for Review Platform on Monad

## Overview

This document details the smart contracts required for our AI-assisted review system on Monad. These contracts handle token distribution, staking mechanisms, and reputation management using Monad's staking precompile and other features documented in mcp.txt.

## Contract Architecture

### 1. ReviewToken.sol
A custom ERC-20 token contract for review rewards, similar to the testnet tokens documented in mcp.txt.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ReviewToken is ERC20 {
    address public owner;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() ERC20("Review Token", "RVT") {
        owner = msg.sender;
        // Initial supply minted to deployer
        _mint(msg.sender, 1000000 * 10**decimals()); // 1M tokens
    }
    
    // Function to mint tokens for valid reviews
    function mintForReview(address reviewer, uint256 amount) external onlyOwner {
        _mint(reviewer, amount);
    }
}
```

### 2. ReviewPlatform.sol
Main contract for managing the review system, including validation and reward distribution.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "./ReviewToken.sol";

contract ReviewPlatform {
    ReviewToken public reviewToken;
    address public owner;
    
    struct Review {
        string content;
        address reviewer;
        uint256 timestamp;
        bool validated;
        uint256 rewardAmount;
    }
    
    mapping(bytes32 => Review) public reviews;
    mapping(address => uint256) public userReputation;
    
    event ReviewSubmitted(bytes32 indexed reviewId, address indexed reviewer);
    event ReviewValidated(bytes32 indexed reviewId, uint256 rewardAmount);
    event RewardDistributed(address indexed reviewer, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor(address _tokenAddress) {
        reviewToken = ReviewToken(_tokenAddress);
        owner = msg.sender;
    }
    
    // Submit a review (will be validated off-chain by AI)
    function submitReview(string calldata content) external {
        bytes32 reviewId = keccak256(abi.encodePacked(msg.sender, block.timestamp, content));
        
        reviews[reviewId] = Review({
            content: content,
            reviewer: msg.sender,
            timestamp: block.timestamp,
            validated: false,
            rewardAmount: 0
        });
        
        emit ReviewSubmitted(reviewId, msg.sender);
    }
    
    // Function called by AI/Validator to validate reviews
    function validateReview(bytes32 reviewId, uint256 rewardAmount) external onlyOwner {
        require(!reviews[reviewId].validated, "Review already validated");
        require(reviews[reviewId].reviewer != address(0), "Review does not exist");
        
        reviews[reviewId].validated = true;
        reviews[reviewId].rewardAmount = rewardAmount;
        
        // Mint tokens for the review
        reviewToken.mintForReview(reviews[reviewId].reviewer, rewardAmount);
        
        // Update reputation
        userReputation[reviews[reviewId].reviewer] += 1;
        
        emit ReviewValidated(reviewId, rewardAmount);
        emit RewardDistributed(reviews[reviewId].reviewer, rewardAmount);
    }
    
    // Get review details
    function getReview(bytes32 reviewId) external view returns (Review memory) {
        return reviews[reviewId];
    }
}
```

### 3. ReviewStaking.sol
Uses Monad's staking precompile (from mcp.txt) to require users to stake before reviewing.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IMonadStaking {
    function delegate(uint64 validatorId) external payable returns (bool success);
    function getDelegator(uint64 validatorId, address delegator) external returns (
        uint256 stake,
        uint256 accRewardPerToken,
        uint256 unclaimedRewards,
        uint256 deltaStake,
        uint256 nextDeltaStake,
        uint64 deltaEpoch,
        uint64 nextDeltaEpoch
    );
}

contract ReviewStaking {
    IMonadStaking public constant STAKING_CONTRACT = IMonadStaking(0x0000000000000000000000000000000000001000); // From mcp.txt
    uint64 public validatorId;
    uint256 public minStakeAmount;
    
    mapping(address => bool) public hasStake;
    
    event StakeVerified(address indexed user);
    event StakeRemoved(address indexed user);
    
    constructor(uint64 _validatorId, uint256 _minStakeAmount) {
        validatorId = _validatorId;
        minStakeAmount = _minStakeAmount;
    }
    
    function verifyStake(address user) external returns (bool) {
        (uint256 stakeAmount, , , , , , ) = STAKING_CONTRACT.getDelegator(validatorId, user);
        
        if (stakeAmount >= minStakeAmount) {
            hasStake[user] = true;
            emit StakeVerified(user);
            return true;
        } else {
            hasStake[user] = false;
            emit StakeRemoved(user);
            return false;
        }
    }
    
    function canUserReview(address user) external view returns (bool) {
        (uint256 stakeAmount, , , , , , ) = STAKING_CONTRACT.getDelegator(validatorId, user);
        return stakeAmount >= minStakeAmount;
    }
}
```

### 4. ReputationSystem.sol
Handles reputation tracking and management based on review quality.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

contract ReputationSystem {
    mapping(address => uint256) public reputationScores;
    mapping(address => uint256[]) public reviewHistory; // Track quality of reviews
    
    event ReputationUpdated(address indexed user, uint256 newScore);
    
    function updateReputation(address user, bool goodReview) external {
        if (goodReview) {
            reputationScores[user] += 1; // Increment for good reviews
        } else {
            if (reputationScores[user] > 0) {
                reputationScores[user] -= 1; // Decrement for poor reviews (but not below 0)
            }
        }
        
        emit ReputationUpdated(user, reputationScores[user]);
    }
    
    function getReputation(address user) external view returns (uint256) {
        return reputationScores[user];
    }
    
    function addReviewToHistory(address user, uint256 reviewQuality) external {
        reviewHistory[user].push(reviewQuality);
    }
}
```

## Integration with Monad Features

### Staking Integration
Based on mcp.txt documentation:
- Uses Monad's staking precompile (`0x0000000000000000000000000000000000001000`) 
- Calls `getDelegator()` function to verify user stakes
- Leverages `delegate()` function for user staking

### Token Standards
- Follows ERC-20 standard similar to testnet tokens documented in mcp.txt
- Uses standard token operations like minting for reward distribution

### Gas Optimization
- Efficient storage patterns to minimize gas costs for micro-transactions
- Batch operations where possible to reduce transaction frequency

## Deployment Strategy

Following the deployment patterns from mcp.txt:
1. Deploy ReviewToken contract first
2. Deploy ReputationSystem contract
3. Deploy ReviewStaking contract with validator ID and minimum stake
4. Deploy ReviewPlatform contract with token address
5. Set proper ownership and permission structures

These contracts work together to create a complete review ecosystem on Monad, leveraging its staking mechanisms, efficient token handling, and high-throughput capabilities for real-time reward distribution.