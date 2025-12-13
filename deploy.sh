#!/bin/bash
set -euo pipefail

# ⚠️ TESTNET / LOCAL ONLY KEY
export PRIVATE_KEY="4a47ba7832de1108ac36732015fd28c10a05b61c772e594e419f848b0b53bdb6"
export RPC_URL="https://testnet-rpc.monad.xyz"

echo "Using RPC: $RPC_URL"

# -------------------------------
# Deploy ReviewToken
# -------------------------------
echo "Deploying ReviewToken..."
REVIEW_TOKEN_ADDR=$(forge create contracts/tokens/ReviewToken.sol:ReviewToken \
  --private-key "$PRIVATE_KEY" \
  --rpc-url "$RPC_URL" \
  --legacy \
  --broadcast 2>&1 | grep "Deployed to:" | awk '{print $3}')

if [ -z "$REVIEW_TOKEN_ADDR" ] || [ "$REVIEW_TOKEN_ADDR" = "null" ]; then
  echo "Error: Failed to deploy ReviewToken"
  exit 1
fi
echo "ReviewToken deployed at: $REVIEW_TOKEN_ADDR"

# -------------------------------
# Deploy ReputationSystem
# -------------------------------
echo "Deploying ReputationSystem..."
REPUTATION_ADDR=$(forge create contracts/reputation/ReputationSystem.sol:ReputationSystem \
  --private-key "$PRIVATE_KEY" \
  --rpc-url "$RPC_URL" \
  --legacy \
  --broadcast 2>&1 | grep "Deployed to:" | awk '{print $3}')

if [ -z "$REPUTATION_ADDR" ] || [ "$REPUTATION_ADDR" = "null" ]; then
  echo "Error: Failed to deploy ReputationSystem"
  exit 1
fi
echo "ReputationSystem deployed at: $REPUTATION_ADDR"

# -------------------------------
# Deploy ReviewStaking
# -------------------------------
echo "Deploying ReviewStaking..."
STAKING_ADDR=$(forge create contracts/staking/ReviewStaking.sol:ReviewStaking \
  --private-key "$PRIVATE_KEY" \
  --rpc-url "$RPC_URL" \
  --legacy \
  --broadcast \
  --constructor-args 1 1000000000000000000 2>&1 | grep "Deployed to:" | awk '{print $3}')

if [ -z "$STAKING_ADDR" ] || [ "$STAKING_ADDR" = "null" ]; then
  echo "Error: Failed to deploy ReviewStaking"
  exit 1
fi
echo "ReviewStaking deployed at: $STAKING_ADDR"

# -------------------------------
# Deploy ReviewPlatform
# -------------------------------
echo "Deploying ReviewPlatform..."
PLATFORM_ADDR=$(forge create contracts/reviews/ReviewPlatform.sol:ReviewPlatform \
  --private-key "$PRIVATE_KEY" \
  --rpc-url "$RPC_URL" \
  --legacy \
  --broadcast \
  --constructor-args \
    "$REVIEW_TOKEN_ADDR" \
    "$REPUTATION_ADDR" \
    "$STAKING_ADDR" 2>&1 | grep "Deployed to:" | awk '{print $3}')

if [ -z "$PLATFORM_ADDR" ] || [ "$PLATFORM_ADDR" = "null" ]; then
  echo "Error: Failed to deploy ReviewPlatform"
  exit 1
fi
echo "ReviewPlatform deployed at: $PLATFORM_ADDR"

# -------------------------------
# Setup Integrations: Transfer Ownership
# -------------------------------
echo ""
echo "Setting up integrations..."

echo "Transferring ReviewToken ownership to ReviewPlatform..."
cast send "$REVIEW_TOKEN_ADDR" "transferOwnership(address)" "$PLATFORM_ADDR" \
  --private-key "$PRIVATE_KEY" \
  --rpc-url "$RPC_URL" \
  --legacy > /dev/null 2>&1

echo "Transferring ReputationSystem ownership to ReviewPlatform..."
cast send "$REPUTATION_ADDR" "transferOwnership(address)" "$PLATFORM_ADDR" \
  --private-key "$PRIVATE_KEY" \
  --rpc-url "$RPC_URL" \
  --legacy > /dev/null 2>&1

echo "Integrations configured successfully!"

# -------------------------------
# Done
# -------------------------------
echo "=============================="
echo "Deployment complete!"
echo "ReviewToken:        $REVIEW_TOKEN_ADDR"
echo "ReputationSystem:   $REPUTATION_ADDR"
echo "ReviewStaking:      $STAKING_ADDR"
echo "ReviewPlatform:     $PLATFORM_ADDR"
echo "=============================="

