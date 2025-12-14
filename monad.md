# Monad AI-Assisted Review System - Smart Contracts Documentation

## Overview

The Monad AI-Assisted Review System is a decentralized review platform that combines AI-powered validation with blockchain-based rewards. The system incentivizes quality reviews through token distribution while ensuring authenticity through staking commitments and reputation tracking.

## Contract Architecture

### 1. ReviewToken.sol (ERC-20 Reward Token)

**Purpose**: Custom ERC-20 token for reward distribution to quality reviewers

**Contract Address**: `0x9Ce50706CD0F73bB5502b7AA0a8cD17D8513de83`

**Functions**:
- `mintForReview(address reviewer, uint256 amount)` - Mints rewards for validated reviews (only owner)
- `balanceOf(address account)` - Returns token balance for an account (ERC-20 standard)
- `totalSupply()` - Returns total token supply (ERC-20 standard)
- `transfer(address to, uint256 amount)` - Transfer tokens (restricted to owner for security)
- `transferFrom(address from, address to, uint256 amount)` - Transfer from allowance (restricted to owner)

**Events**:
- `ReviewRewardsMinted(address indexed reviewer, uint256 amount)` - Emitted when rewards are minted

**Initialization**:
- Name: "Review Token"
- Symbol: "RVT"
- Initial Supply: 1,000,000 tokens minted to deployer

### 2. ReputationSystem.sol (User Reputation Tracking)

**Purpose**: Tracks and manages user reputation based on review quality

**Contract Address**: `0xF158be31A900cA8B2Be13BBd22D9d81E64764DBC`

**Functions**:
- `updateReputation(address user, bool goodReview)` - Updates reputation based on review quality (only owner)
- `updateReputationWithScore(address user, uint256 qualityScore)` - Updates reputation with specific quality score (0-100) (only owner)
- `getReputation(address user)` - Returns reputation score for a user
- `getTotalReviews(address user)` - Returns total number of reviews for a user
- `getReviewHistory(address user)` - Returns review history (quality scores array)
- `getUserStats(address user)` - Returns combined user statistics (reputation, total reviews, history)

**State Variables**:
- `mapping(address => uint256) public reputationScores` - User reputation scores
- `mapping(address => uint256[]) public reviewHistory` - Review history by user
- `mapping(address => uint256) public totalReviews` - Total reviews per user

**Events**:
- `ReputationUpdated(address indexed user, uint256 newScore)` - Emitted when reputation is updated

### 3. ReviewStaking.sol (Monad Staking Integration)

**Purpose**: Verifies user stakes using Monad's staking precompile

**Contract Address**: `0xCd9352bFBCDfAB07EE8e664A64ECe191c1836180` (Updated - checks both stake and deltaStake)

**Previous Address**: `0x51F7cbd74731976d834a67F156dBC387CCc59c1D` (Deprecated - only checked stake field)

**Interfaces**:
- `IMonadStaking` - Interface for Monad's staking precompile at address `0x0000000000000000000000000000000000001000`

**Functions**:
- `verifyStake(address user)` - Verifies user's stake amount from precompile (checks both stake and deltaStake) (returns bool)
- `canUserReview(address user)` - Checks if user can submit reviews based on stake (checks both stake and deltaStake) (returns bool)
- `getUserStake(address user)` - Gets actual stake amount from precompile (returns deltaStake if stake is 0, otherwise stake) (returns uint256)
- `setValidatorId(uint64 _newValidatorId)` - Updates validator ID (only owner)
- `setMinStakeAmount(uint256 _newMinStakeAmount)` - Updates minimum stake amount (only owner)
- `getValidatorId()` - Returns current validator ID (view)
- `getMinStakeAmount()` - Returns current minimum stake amount (view)

**Important Note**: The contract checks both `stake` (index 0) and `deltaStake` (index 3) from Monad's staking precompile. This is because new stakes are stored in `deltaStake` and only moved to `stake` after epoch processing. The previous version only checked `stake`, causing valid stakes to be rejected.

**State Variables**:
- `uint64 public validatorId` - Current validator ID for staking
- `uint256 public minStakeAmount` - Minimum stake required to review
- `mapping(address => bool) public hasStake` - Tracks if user has sufficient stake

**Events**:
- `StakeVerified(address indexed user, bool verified)` - Emitted when stake is verified
- `StakeRemoved(address indexed user)` - Emitted when stake becomes insufficient

### 4. ReviewPlatform.sol (Main Platform Orchestrator)

**Purpose**: Main contract managing the complete review lifecycle

**Contract Address**: `0x2C87134c4Ca84E23B04bcE7dD671BbbcFB3Da195`

**Structs**:
- `struct Review`: 
  - `string content` - Review content text
  - `address reviewer` - Reviewer's address
  - `uint256 timestamp` - Review submission timestamp
  - `bool validated` - Whether review has been validated
  - `uint256 rewardAmount` - Amount of rewards distributed
  - `uint256 qualityScore` - Quality score assigned by AI

**Functions**:
- `submitReview(string calldata content)` - Submits a review after stake verification (external)
- `validateReview(bytes32 reviewId, uint256 rewardAmount, uint256 qualityScore)` - Validates and rewards reviews (only owner). **Auto-validates if qualityScore >= 60, auto-rejects if < 60**
- `autoValidateReview(bytes32 reviewId, uint256 qualityScore)` - Auto-validates based on AI score (only owner). If score >= 60: validates and rewards. If < 60: rejects
- `batchAutoValidateReviews(bytes32[] memory reviewIds, uint256[] memory qualityScores)` - Batch auto-validate multiple reviews (only owner)
- `batchValidateReviews(bytes32[] memory reviewIds, uint256[] memory rewardAmounts, uint256[] memory qualityScores)` - Validates multiple reviews at once (only owner)
- `getReview(bytes32 reviewId)` - Returns review details (external view)
- `getReviewsByUser(address user)` - Returns all review IDs for a user (external view)
- `getUserReviewCount(address user)` - Returns total reviews by user (external view)
- `setReputationSystem(address _newReputationSystem)` - Updates reputation system address (only owner)
- `setReviewStaking(address _newReviewStaking)` - Updates staking contract address (only owner)

**State Variables**:
- `ReviewToken public reviewToken` - ERC-20 token contract
- `ReputationSystem public reputationSystem` - Reputation tracking contract
- `ReviewStaking public reviewStaking` - Staking verification contract
- `mapping(bytes32 => Review) public reviews` - Reviews by ID
- `mapping(address => bytes32[]) public reviewsByUser` - Reviews by user

**Events**:
- `ReviewSubmitted(bytes32 indexed reviewId, address indexed reviewer, string content)` - Emitted when review is submitted
- `ReviewValidated(bytes32 indexed reviewId, uint256 rewardAmount, uint256 qualityScore)` - Emitted when review is validated
- `RewardDistributed(address indexed reviewer, uint256 amount)` - Emitted when rewards are distributed

## Integration Flow

### Review Submission Process:
1. User calls `submitReview(content)` on ReviewPlatform
2. ReviewPlatform verifies stake via `reviewStaking.canUserReview(user)`
3. If stake is sufficient, review is stored in `reviews` mapping
4. `ReviewSubmitted` event is emitted

### Review Validation Process:
1. AI/Validator calls `validateReview(reviewId, rewardAmount, qualityScore)` on ReviewPlatform
2. ReviewPlatform mints tokens via `reviewToken.mintForReview(reviewer, rewardAmount)`
3. ReviewPlatform updates reputation via `reputationSystem.updateReputationWithScore(reviewer, qualityScore)`
4. `ReviewValidated` and `RewardDistributed` events are emitted

### Staking Verification Process:
1. ReviewStaking queries Monad's staking precompile via `getDelegator(validatorId, user)`
2. Extracts both `stake` (index 0) and `deltaStake` (index 3) from the response
3. Compares both values against `minStakeAmount` (returns true if either meets requirement)
4. Returns true/false for `canUserReview()` function

**Why Both Fields?**: Monad's staking precompile stores new stakes in `deltaStake` initially, and only moves them to `stake` after epoch processing. Checking both ensures users can review immediately after staking.

## Security Features

- **Access Control**: All critical functions are protected with `onlyOwner` modifier
- **Input Validation**: All function parameters are validated before processing
- **Re-entrancy Protection**: Built into OpenZeppelin libraries
- **Staking Verification**: Users must have stake before submitting reviews
- **Quality Filtering**: Only validated reviews trigger token rewards

## Deployment Information

- **Network**: Monad Testnet 
- **RPC URL**: `https://testnet-rpc.monad.xyz`
- **Chain ID**: 10143
- **Deployer**: Contract owner with administrative privileges
- **Verification**: All contracts deployed and integrated properly

## Recent Updates

### ReviewPlatform Auto-Validation Update (Latest)
- **Feature**: Automatic validation based on AI quality score
- **Logic**: 
  - If `qualityScore >= 60`: Automatically validates, calculates and distributes rewards (50-200 RVT), updates reputation
  - If `qualityScore < 60`: Automatically rejects (no rewards)
- **Reward Formula**: 50 RVT base + (score - 60) × 3.75 RVT bonus
- **New Functions**: `autoValidateReview()` and `batchAutoValidateReviews()`
- **New Address**: `0x2C87134c4Ca84E23B04bcE7dD671BbbcFB3Da195`
- **Previous Address**: `0x2C87134c4Ca84E23B04bcE7dD671BbbcFB3Da195` (deprecated)

### ReviewStaking Contract Fix
- **Issue**: Original contract (`0x51F7cbd74731976d834a67F156dBC387CCc59c1D`) only checked `stake` field from Monad's staking precompile
- **Problem**: New stakes are stored in `deltaStake` (index 3) and only moved to `stake` (index 0) after epoch processing
- **Impact**: Users with valid stakes in `deltaStake` were unable to submit reviews
- **Solution**: Deployed new contract (`0xCd9352bFBCDfAB07EE8e664A64ECe191c1836180`) that checks both `stake` and `deltaStake`
- **Result**: Users can now submit reviews immediately after staking

## Contract Inheritance

- `ReviewToken.sol`: Inherits from OpenZeppelin's `ERC20` and `Ownable`
- `ReputationSystem.sol`: Inherits from OpenZeppelin's `Ownable`
- `ReviewStaking.sol`: Inherits from OpenZeppelin's `Ownable`
- `ReviewPlatform.sol`: Inherits from OpenZeppelin's `Ownable`