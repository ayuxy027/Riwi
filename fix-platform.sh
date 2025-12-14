#!/bin/bash
set -euo pipefail

export PRIVATE_KEY="4a47ba7832de1108ac36732015fd28c10a05b61c772e594e419f848b0b53bdb6"
export RPC_URL="https://testnet-rpc.monad.xyz"

NEW_TOKEN="0x579521fAf544FEE9a793a4FB6D3A78377EBCC680"
NEW_REPUTATION="0x308493Ea984632669A3A6Ecd46216A4858F6C137"
STAKING="0xCd9352bFBCDfAB07EE8e664A64ECe191c1836180"

echo "=== REDEPLOYING ReviewPlatform ==="
echo "ReviewToken: $NEW_TOKEN"
echo "ReputationSystem: $NEW_REPUTATION"
echo "ReviewStaking: $STAKING"
echo ""

PLATFORM=$(forge create contracts/reviews/ReviewPlatform.sol:ReviewPlatform \
  --private-key "$PRIVATE_KEY" \
  --rpc-url "$RPC_URL" \
  --legacy \
  --broadcast \
  --constructor-args "$NEW_TOKEN" "$NEW_REPUTATION" "$STAKING" 2>&1 | grep "Deployed to:" | awk '{print $3}')

if [ -z "$PLATFORM" ] || [ "$PLATFORM" = "null" ]; then
  echo "❌ Failed to deploy"
  exit 1
fi

echo "✅ New ReviewPlatform: $PLATFORM"
echo ""

echo "=== TRANSFERRING OWNERSHIP ==="
cast send "$NEW_TOKEN" "transferOwnership(address)" "$PLATFORM" \
  --private-key "$PRIVATE_KEY" \
  --rpc-url "$RPC_URL" \
  --legacy > /dev/null 2>&1

cast send "$NEW_REPUTATION" "transferOwnership(address)" "$PLATFORM" \
  --private-key "$PRIVATE_KEY" \
  --rpc-url "$RPC_URL" \
  --legacy > /dev/null 2>&1

echo "✅ Ownership transferred"
echo ""
echo "New ReviewPlatform: $PLATFORM"
echo "$PLATFORM"

