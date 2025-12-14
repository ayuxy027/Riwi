# Contract Deployment Knowledge Transfer

## Deployment Status (Testnet)

**✅ Successfully deployed to Monad Testnet**

The contract suite has been successfully deployed to the Monad testnet. All contracts are live and integrated on the testnet.

## Deployed Contract Addresses (Monad Testnet)

The following are the actual deployed contract addresses on Monad testnet:

```
ReviewToken:        0x579521fAf544FEE9a793a4FB6D3A78377EBCC680          # ERC-20 reward token
ReputationSystem:   0x308493Ea984632669A3A6Ecd46216A4858F6C137          # Reputation tracking
ReviewStaking:      0xCd9352bFBCDfAB07EE8e664A64ECe191c1836180          # Staking verification (Updated)
ReviewPlatform:     0xC98C12Fce07E5D1fbDf0836BCe2bc245d5d27347          # Main orchestration
```

**Note**: ReviewStaking was updated to fix deltaStake checking. Previous address: `0x51F7cbd74731976d834a67F156dBC387CCc59c1D` (deprecated)

### Network Information
- **Network**: Monad Testnet
- **RPC URL**: `https://testnet-rpc.monad.xyz`
- **Chain ID**: 10143
- **Deployment Date**: December 2024

### Verification

You can verify these contracts on the Monad testnet explorer or interact with them using:

```bash
# Check ReviewToken owner (should be ReviewPlatform)
cast call 0x579521fAf544FEE9a793a4FB6D3A78377EBCC680 "owner()" \
  --rpc-url https://testnet-rpc.monad.xyz --legacy

# Check ReputationSystem owner (should be ReviewPlatform)
cast call 0x308493Ea984632669A3A6Ecd46216A4858F6C137 "owner()" \
  --rpc-url https://testnet-rpc.monad.xyz --legacy

# Check ReviewPlatform contract addresses
cast call 0xC98C12Fce07E5D1fbDf0836BCe2bc245d5d27347 "reviewToken()" \
  --rpc-url https://testnet-rpc.monad.xyz --legacy
cast call 0xC98C12Fce07E5D1fbDf0836BCe2bc245d5d27347 "reputationSystem()" \
  --rpc-url https://testnet-rpc.monad.xyz --legacy
cast call 0xC98C12Fce07E5D1fbDf0836BCe2bc245d5d27347 "reviewStaking()" \
  --rpc-url https://testnet-rpc.monad.xyz --legacy
```

## Contract Functions Overview

The deployed system consists of 4 interconnected smart contracts:

### 1. ReviewToken.sol - ERC-20 Reward Token
- **Purpose**: RVT (Review Token) for reward distribution
- **Key Functions**:
  - `mintForReview(address reviewer, uint256 amount)` - Mints rewards for validated reviews
  - `transfer()` - Restricted to owner for security
  - Standard ERC-20 functions (balanceOf, totalSupply, etc.)
- **Initial Supply**: 1,000,000 RVT tokens minted to deployer
- **Access Control**: Only owner can mint tokens (ReviewPlatform after deployment)

### 2. ReputationSystem.sol - User Reputation Tracking
- **Purpose**: Tracks and manages user reputation based on review quality
- **Key Functions**:
  - `updateReputation(address user, bool goodReview)` - Basic reputation update
  - `updateReputationWithScore(address user, uint256 qualityScore)` - Quality-based scoring (0-100)
  - `getReputation(address user)` - Get user's reputation score
  - `getReviewHistory(address user)` - Get user's review history
  - `getUserStats(address user)` - Get complete user statistics
- **Features**: Quality-based scoring, history tracking, reputation history

### 3. ReviewStaking.sol - Monad Staking Integration
- **Purpose**: Verifies user stakes using Monad's staking precompile
- **Contract Address**: `0xCd9352bFBCDfAB07EE8e664A64ECe191c1836180` (Updated - checks both stake and deltaStake)
- **Key Functions**:
  - `canUserReview(address user)` - Check if user can submit reviews (checks both stake and deltaStake)
  - `verifyStake(address user)` - Verify user's stake amount (checks both stake and deltaStake)
  - `getUserStake(address user)` - Get actual stake amount (returns deltaStake if stake is 0)
  - `setValidatorId(uint64 _newValidatorId)` - Update validator ID
  - `setMinStakeAmount(uint256 _newMinStakeAmount)` - Update minimum stake
- **Integration**: Interfaces with Monad's staking precompile at `0x0000000000000000000000000000000000001000`
- **Configuration**: Validator ID (default: 1), Minimum stake amount (default: 1 token)
- **Important**: The contract checks both `stake` (index 0) and `deltaStake` (index 3) from the staking precompile to handle new stakes that haven't been processed yet

### 4. ReviewPlatform.sol - Main Platform Orchestrator
- **Purpose**: Main contract managing the complete review lifecycle
- **Key Functions**:
  - `submitReview(string calldata content)` - Submit a review (requires stake verification)
  - `validateReview(bytes32 reviewId, uint256 rewardAmount, uint256 qualityScore)` - Validate and reward reviews
  - `batchValidateReviews()` - Process multiple reviews at once
  - `getReview(bytes32 reviewId)` - Get review details
  - `getReviewsByUser(address user)` - Get all reviews by a user
- **Orchestration**: Manages all contract interactions, handles AI validation callbacks
- **Access Control**: Only owner can validate reviews (AI service access)

## Integration Flow

```
1. User submits review → ReviewPlatform.checks ReviewStaking.canUserReview() →
2. If valid stake → Review stored with pending status →
3. AI validates review → AI calls ReviewPlatform.validateReview() →
4. ReviewPlatform calls ReviewToken.mintForReview() → User receives RVT tokens
5. ReviewPlatform calls ReputationSystem.updateReputationWithScore() → User reputation updated
```

## Key Features

- **AI Integration Ready**: Contracts prepared for AI validation system with quality scoring
- **Monad Native**: Direct staking precompile integration for user commitment verification
- **Quality Focused**: Reputation and reward system based on review quality (0-100 scoring)
- **Scalable**: Designed for high-volume review processing with batch operations
- **Secure**: Proper access controls, ownership transfers after deployment
- **Economic**: Quality-based rewards (higher quality = more tokens)

## Recent Updates

### ReviewStaking Contract Update (Latest)
- **Issue**: Original contract (`0x51F7cbd74731976d834a67F156dBC387CCc59c1D`) only checked `stake` field (index 0) from Monad's staking precompile
- **Problem**: New stakes are stored in `deltaStake` (index 3) and only moved to `stake` after epoch processing
- **Impact**: Users with valid stakes in `deltaStake` were unable to submit reviews (transactions reverted)
- **Solution**: Deployed new contract (`0xCd9352bFBCDfAB07EE8e664A64ECe191c1836180`) that checks both `stake` and `deltaStake`
- **Result**: Users can now submit reviews immediately after staking, without waiting for epoch processing
- **Status**: ReviewPlatform has been updated to use the new staking contract
- **Verification**: All endpoints tested and working correctly