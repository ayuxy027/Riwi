# Contract Deployment Knowledge Transfer

## Deployment Status (Testnet)

**✅ Successfully deployed to Monad Testnet**

The contract suite has been successfully deployed to the Monad testnet. All contracts are live and integrated on the testnet.

## Deployed Contract Addresses (Monad Testnet)

The following are the actual deployed contract addresses on Monad testnet:

```
ReviewToken:        0x9Ce50706CD0F73bB5502b7AA0a8cD17D8513de83          # ERC-20 reward token
ReputationSystem:   0xF158be31A900cA8B2Be13BBd22D9d81E64764DBC          # Reputation tracking
ReviewStaking:      0xCd9352bFBCDfAB07EE8e664A64ECe191c1836180          # Staking verification (Updated)
ReviewPlatform:     0x40C11dF88eEf1B1276978b750e315E49A929D10d          # Main orchestration
TokenCashout:       0x4044F6D5A7B675Dc2dA4be604E0a415b310EBF78          # RVT to MON cashout
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
cast call 0x9Ce50706CD0F73bB5502b7AA0a8cD17D8513de83 "owner()" \
  --rpc-url https://testnet-rpc.monad.xyz --legacy

# Check ReputationSystem owner (should be ReviewPlatform)
cast call 0xF158be31A900cA8B2Be13BBd22D9d81E64764DBC "owner()" \
  --rpc-url https://testnet-rpc.monad.xyz --legacy

# Check ReviewPlatform contract addresses
cast call 0x40C11dF88eEf1B1276978b750e315E49A929D10d "reviewToken()" \
  --rpc-url https://testnet-rpc.monad.xyz --legacy
cast call 0x40C11dF88eEf1B1276978b750e315E49A929D10d "reputationSystem()" \
  --rpc-url https://testnet-rpc.monad.xyz --legacy
cast call 0x40C11dF88eEf1B1276978b750e315E49A929D10d "reviewStaking()" \
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

### TokenCashout - RVT to MON Exchange (New Feature)

**Purpose**: Allows users to exchange their earned RVT tokens for native MON tokens.

**Contract**: `contracts/cashout/TokenCashout.sol`

**Key Functions**:
- `cashout(uint256 rvtAmount)` - Exchange RVT for MON at current rate
- `calculateCashout(uint256 rvtAmount)` - Preview MON output for given RVT
- `getContractStats()` - Get treasury balance, exchange rate, etc.
- `getUserStats(address user)` - Get user's cashout history

**Admin Functions**:
- `setExchangeRate(uint256 newRate)` - Update exchange rate
- `setCashoutEnabled(bool enabled)` - Enable/disable cashout
- `withdrawTreasury(uint256 amount)` - Withdraw MON from treasury
- `withdrawRvt(uint256 amount)` - Withdraw collected RVT

**Configuration**:
- Default exchange rate: 0.01 MON per 1 RVT
- Minimum cashout: 1 RVT
- Maximum cashout: 10,000 RVT per transaction

**Flow**:
```
1. User earns RVT from validated reviews →
2. User calls approve(cashoutContract, amount) on ReviewToken →
3. User calls cashout(amount) on TokenCashout →
4. Contract receives RVT, sends MON to user
```

**Deployment**:
```bash
# 1. Set up environment
cp .env.example .env
# Edit .env with your PRIVATE_KEY

# 2. Compile contracts
npx hardhat compile

# 3. Deploy cashout contract
npx hardhat run scripts/deploy-cashout.js --network monad_testnet

# 4. Fund treasury (after deployment)
cast send <CASHOUT_ADDRESS> --value 10ether \
  --rpc-url https://testnet-rpc.monad.xyz --legacy
```

**Verification Commands**:
```bash
# Check treasury balance
cast call <CASHOUT_ADDRESS> "treasuryBalance()" \
  --rpc-url https://testnet-rpc.monad.xyz --legacy

# Check exchange rate
cast call <CASHOUT_ADDRESS> "exchangeRate()" \
  --rpc-url https://testnet-rpc.monad.xyz --legacy

# Calculate cashout for 100 RVT (100 * 10^18 wei)
cast call <CASHOUT_ADDRESS> \
  "calculateCashout(uint256)" 100000000000000000000 \
  --rpc-url https://testnet-rpc.monad.xyz --legacy
```

**Important Notes**:
- Current ReviewToken restricts transfers to owner only
- For cashout to work with existing token, either:
  1. Deploy ReviewTokenV2 with approved receivers, OR
  2. Have owner initiate transfers on behalf of users
- Treasury must be funded with MON before users can cashout