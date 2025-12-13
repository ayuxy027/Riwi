#!/bin/bash
set -euo pipefail

# ⚠️ TESTNET / LOCAL ONLY KEY
export PRIVATE_KEY="4a47ba7832de1108ac36732015fd28c10a05b61c772e594e419f848b0b53bdb6"
export RPC_URL="https://testnet-rpc.monad.xyz"

echo "Using RPC: $RPC_URL"

# Existing contract addresses (from deployment.md)
REVIEW_PLATFORM_ADDR="0x40C11dF88eEf1B1276978b750e315E49A929D10d"
OLD_STAKING_ADDR="0x51F7cbd74731976d834a67F156dBC387CCc59c1D"

# -------------------------------
# Deploy NEW ReviewStaking (with fix)
# -------------------------------
echo "Deploying NEW ReviewStaking (with deltaStake fix)..."
NEW_STAKING_ADDR=$(forge create contracts/staking/ReviewStaking.sol:ReviewStaking \
  --private-key "$PRIVATE_KEY" \
  --rpc-url "$RPC_URL" \
  --legacy \
  --broadcast \
  --constructor-args 1 1000000000000000000 2>&1 | grep "Deployed to:" | awk '{print $3}')

if [ -z "$NEW_STAKING_ADDR" ] || [ "$NEW_STAKING_ADDR" = "null" ]; then
  echo "Error: Failed to deploy ReviewStaking"
  exit 1
fi
echo "NEW ReviewStaking deployed at: $NEW_STAKING_ADDR"

# -------------------------------
# Update ReviewPlatform to use new staking contract
# -------------------------------
echo "Updating ReviewPlatform to use new staking contract..."
cast send "$REVIEW_PLATFORM_ADDR" "setReviewStaking(address)" "$NEW_STAKING_ADDR" \
  --private-key "$PRIVATE_KEY" \
  --rpc-url "$RPC_URL" \
  --legacy > /dev/null 2>&1

echo "✅ ReviewPlatform updated to use new staking contract"
echo ""
echo "=========================================="
echo "Deployment Summary"
echo "=========================================="
echo "OLD ReviewStaking: $OLD_STAKING_ADDR"
echo "NEW ReviewStaking: $NEW_STAKING_ADDR"
echo "ReviewPlatform: $REVIEW_PLATFORM_ADDR"
echo ""
echo "✅ Fix applied: canUserReview now checks both stake and deltaStake"
echo ""
echo "⚠️  IMPORTANT: Update frontend .env with new staking address:"
echo "   VITE_REVIEW_STAKING_ADDRESS=$NEW_STAKING_ADDR"
