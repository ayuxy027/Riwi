# Deployment Documentation

## Overview

This document provides comprehensive documentation for the deployment process of the Monad AI Review System smart contracts. The deployment script (`deploy.sh`) has been thoroughly tested and debugged to ensure reliable contract deployment on the Monad testnet.

## Deployment Script: `deploy.sh`

### Purpose
The `deploy.sh` script automates the complete deployment of all smart contracts required for the AI-assisted review system on Monad blockchain, including proper integration setup.

### Prerequisites

1. **Foundry Tools**: 
   - `forge` (version 1.5.0-stable or compatible)
   - `cast` (version 1.5.0-stable or compatible)
   - Install via: `foundryup`

2. **Dependencies**:
   - `jq` (for JSON parsing - though not currently used)
   - `grep` and `awk` (standard Unix tools)

3. **Network Access**:
   - Access to Monad testnet RPC: `https://testnet-rpc.monad.xyz`
   - Valid private key with sufficient testnet funds

4. **Contract Compilation**:
   - Contracts must compile successfully: `forge build`
   - OpenZeppelin contracts must be installed

### Configuration

The script uses the following environment variables:

```bash
PRIVATE_KEY="4a47ba7832de1108ac36732015fd28c10a05b61c772e594e419f848b0b53bdb6"  # ⚠️ TESTNET ONLY
RPC_URL="https://testnet-rpc.monad.xyz"
```

**⚠️ SECURITY WARNING**: The private key in the script is for TESTNET/LOCAL use only. Never use production keys in deployment scripts.

### Deployment Process

The script deploys contracts in the following order:

#### 1. ReviewToken
- **Contract**: `contracts/tokens/ReviewToken.sol:ReviewToken`
- **Constructor Args**: None
- **Initial Supply**: 1,000,000 RVT tokens minted to deployer
- **Purpose**: ERC-20 token for review rewards

#### 2. ReputationSystem
- **Contract**: `contracts/reputation/ReputationSystem.sol:ReputationSystem`
- **Constructor Args**: None
- **Purpose**: Tracks user reputation scores based on review quality

#### 3. ReviewStaking
- **Contract**: `contracts/staking/ReviewStaking.sol:ReviewStaking`
- **Constructor Args**: 
  - `validatorId`: `1`
  - `minStakeAmount`: `1000000000000000000` (1 token in wei)
- **Purpose**: Integrates with Monad staking precompile to verify user stakes

#### 4. ReviewPlatform
- **Contract**: `contracts/reviews/ReviewPlatform.sol:ReviewPlatform`
- **Constructor Args**: 
  - `_tokenAddress`: ReviewToken address (from step 1)
  - `_reputationAddress`: ReputationSystem address (from step 2)
  - `_stakingAddress`: ReviewStaking address (from step 3)
- **Purpose**: Main platform contract that orchestrates review submission, validation, and rewards

### Integration Setup

After deploying all contracts, the script automatically configures integrations:

1. **Transfer ReviewToken Ownership**:
   - Transfers ownership from deployer to ReviewPlatform
   - Enables ReviewPlatform to call `mintForReview()` for reward distribution

2. **Transfer ReputationSystem Ownership**:
   - Transfers ownership from deployer to ReviewPlatform
   - Enables ReviewPlatform to call `updateReputationWithScore()` for reputation updates

### Technical Details

#### Transaction Type
- **Legacy Transactions**: The script uses `--legacy` flag for all deployments
- **Reason**: Monad testnet does not support EIP-1559 fee mechanism
- **Impact**: All transactions use legacy gas pricing

#### Address Extraction
- The script uses `grep` and `awk` to extract deployed addresses from forge output
- Format: `grep "Deployed to:" | awk '{print $3}'`
- This approach is more reliable than JSON parsing across different forge versions

#### Error Handling
- Script uses `set -euo pipefail` for strict error handling
- Each deployment is validated to ensure address capture succeeded
- Script exits immediately on any deployment failure

### Usage

```bash
# Make script executable (if not already)
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Expected Output

```
Using RPC: https://testnet-rpc.monad.xyz
Deploying ReviewToken...
ReviewToken deployed at: 0x...
Deploying ReputationSystem...
ReputationSystem deployed at: 0x...
Deploying ReviewStaking...
ReviewStaking deployed at: 0x...
Deploying ReviewPlatform...
ReviewPlatform deployed at: 0x...

Setting up integrations...
Transferring ReviewToken ownership to ReviewPlatform...
Transferring ReputationSystem ownership to ReviewPlatform...
Integrations configured successfully!
==============================
Deployment complete!
ReviewToken:        0x...
ReputationSystem:   0x...
ReviewStaking:      0x...
ReviewPlatform:     0x...
==============================
```

### Verification

After deployment, verify the setup:

1. **Check Contract Owners**:
   ```bash
   cast call <REVIEW_TOKEN_ADDR> "owner()" --rpc-url $RPC_URL --legacy
   cast call <REPUTATION_ADDR> "owner()" --rpc-url $RPC_URL --legacy
   ```
   Both should return the ReviewPlatform address.

2. **Verify Contract Addresses in ReviewPlatform**:
   ```bash
   cast call <PLATFORM_ADDR> "reviewToken()" --rpc-url $RPC_URL --legacy
   cast call <PLATFORM_ADDR> "reputationSystem()" --rpc-url $RPC_URL --legacy
   cast call <PLATFORM_ADDR> "reviewStaking()" --rpc-url $RPC_URL --legacy
   ```

## Issues Fixed During Development

### Issue 1: EIP-1559 Not Supported
**Problem**: Initial deployment failed with error: "Failed to estimate EIP1559 fees"
**Solution**: Added `--legacy` flag to all `forge create` commands
**Status**: ✅ Fixed

### Issue 2: JSON Parsing Failure
**Problem**: `jq` parsing failed when forge output wasn't valid JSON
**Solution**: Replaced `--json | jq` with `grep` and `awk` for address extraction
**Status**: ✅ Fixed

### Issue 3: Missing Integration Setup
**Problem**: ReviewPlatform couldn't call ReviewToken and ReputationSystem functions
**Solution**: Added ownership transfer steps after deployment
**Status**: ✅ Fixed

### Issue 4: No Error Validation
**Problem**: Script could continue even if address extraction failed
**Solution**: Added validation checks after each deployment
**Status**: ✅ Fixed

## Contract Architecture

```
┌─────────────────┐
│ ReviewPlatform  │ (Main Orchestrator)
│                 │
│  - submitReview │
│  - validateReview│
└────────┬────────┘
         │
         ├─────────────────┬─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ ReviewToken  │  │ Reputation   │  │ ReviewStaking│
│              │  │ System       │  │              │
│ - mintFor    │  │ - update     │  │ - verifyStake│
│   Review     │  │   Reputation │  │ - canUser    │
│              │  │              │  │   Review     │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Integration Flow

1. **User Submits Review**:
   - ReviewPlatform checks stake via ReviewStaking
   - If valid, review is stored

2. **Review Validation**:
   - AI/Validator calls `validateReview()` on ReviewPlatform
   - ReviewPlatform:
     - Mints tokens via ReviewToken (requires ownership)
     - Updates reputation via ReputationSystem (requires ownership)

## Deployment Checklist

- [x] Contracts compile successfully
- [x] Foundry tools installed and accessible
- [x] RPC endpoint accessible
- [x] Private key configured (testnet only)
- [x] All contracts deployed successfully
- [x] Ownership transfers completed
- [x] Integration verified
- [x] Contract addresses documented

## Production Deployment Considerations

Before deploying to production:

1. **Security**:
   - Remove hardcoded private key from script
   - Use environment variables or secure key management
   - Verify all contract addresses before ownership transfers

2. **Configuration**:
   - Update RPC URL to production endpoint
   - Review and adjust constructor parameters
   - Set appropriate minimum stake amounts

3. **Testing**:
   - Test on testnet first
   - Verify all integrations work correctly
   - Test edge cases and error scenarios

4. **Documentation**:
   - Document all deployed contract addresses
   - Save transaction hashes for verification
   - Update frontend configuration with new addresses

## Troubleshooting

### Deployment Fails with "Internal transport error"
- **Cause**: Network connectivity issues or RPC endpoint problems
- **Solution**: Verify RPC endpoint is accessible, retry deployment

### Address Extraction Returns Empty
- **Cause**: Forge output format changed or deployment failed
- **Solution**: Check forge output manually, verify deployment succeeded

### Ownership Transfer Fails
- **Cause**: Insufficient gas or incorrect function signature
- **Solution**: Verify contract ABI, check gas limits, ensure deployer is current owner

### Contracts Not Integrated
- **Cause**: Ownership transfers not completed
- **Solution**: Manually verify owners, re-run ownership transfer commands

## Related Files

- `deploy.sh` - Main deployment script
- `contracts/tokens/ReviewToken.sol` - Token contract
- `contracts/reputation/ReputationSystem.sol` - Reputation contract
- `contracts/staking/ReviewStaking.sol` - Staking contract
- `contracts/reviews/ReviewPlatform.sol` - Main platform contract

## Version History

- **v1.0** (Current): Initial deployment script with full integration setup
  - Fixed EIP-1559 compatibility
  - Fixed address extraction
  - Added ownership transfers
  - Added error validation

## Support

For issues or questions regarding deployment:
1. Check this documentation
2. Review contract source code
3. Verify network connectivity
4. Check Foundry version compatibility

