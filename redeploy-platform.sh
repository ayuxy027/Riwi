#!/bin/bash
set -euo pipefail

# ⚠️ TESTNET / LOCAL ONLY KEY
export PRIVATE_KEY="4a47ba7832de1108ac36732015fd28c10a05b61c772e594e419f848b0b53bdb6"
export RPC_URL="https://testnet-rpc.monad.xyz"

echo "Using RPC: $RPC_URL"
echo ""

# Existing contract addresses (keep these)
REVIEW_TOKEN_ADDR="0x9Ce50706CD0F73bB5502b7AA0a8cD17D8513de83"
REPUTATION_ADDR="0xF158be31A900cA8B2Be13BBd22D9d81E64764DBC"
STAKING_ADDR="0xCd9352bFBCDfAB07EE8e664A64ECe191c1836180"

echo "Existing contracts:"
echo "  ReviewToken: $REVIEW_TOKEN_ADDR"
echo "  ReputationSystem: $REPUTATION_ADDR"
echo "  ReviewStaking: $STAKING_ADDR"
echo ""

# -------------------------------
# Deploy NEW ReviewPlatform (with auto-validation)
# -------------------------------
echo "Deploying NEW ReviewPlatform with auto-validation logic..."
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
echo "✅ NEW ReviewPlatform deployed at: $PLATFORM_ADDR"
echo ""

# -------------------------------
# Setup Integrations: Transfer Ownership
# -------------------------------
echo "Setting up integrations..."
echo "Transferring ReviewToken ownership to new ReviewPlatform..."
cast send "$REVIEW_TOKEN_ADDR" "transferOwnership(address)" "$PLATFORM_ADDR" \
  --private-key "$PRIVATE_KEY" \
  --rpc-url "$RPC_URL" \
  --legacy > /dev/null 2>&1

echo "Transferring ReputationSystem ownership to new ReviewPlatform..."
cast send "$REPUTATION_ADDR" "transferOwnership(address)" "$PLATFORM_ADDR" \
  --private-key "$PRIVATE_KEY" \
  --rpc-url "$RPC_URL" \
  --legacy > /dev/null 2>&1

echo "✅ Integrations configured!"
echo ""

# -------------------------------
# Update Frontend Config
# -------------------------------
echo "Updating frontend configuration..."
sed -i '' "s|REVIEW_PLATFORM:.*0x40C11dF88eEf1B1276978b750e315E49A929D10d|REVIEW_PLATFORM: import.meta.env.VITE_REVIEW_PLATFORM_ADDRESS || \"$PLATFORM_ADDR\",|" frontend/src/config/contracts.ts
echo "✅ frontend/src/config/contracts.ts updated"

# Update .env
if [ -f frontend/.env ]; then
  sed -i '' "s|VITE_REVIEW_PLATFORM_ADDRESS=.*|VITE_REVIEW_PLATFORM_ADDRESS=$PLATFORM_ADDR|" frontend/.env
else
  echo "VITE_REVIEW_PLATFORM_ADDRESS=$PLATFORM_ADDR" > frontend/.env
fi
echo "✅ frontend/.env updated"
echo ""

# -------------------------------
# Update Documentation
# -------------------------------
echo "Updating documentation..."
sed -i '' "s|ReviewPlatform:.*0x40C11dF88eEf1B1276978b750e315E49A929D10d|ReviewPlatform:     $PLATFORM_ADDR|" docs/deployment.md
sed -i '' "s|Contract Address.*0x40C11dF88eEf1B1276978b750e315E49A929D10d|Contract Address: \`$PLATFORM_ADDR\`|" monad.md
echo "✅ Documentation updated"
echo ""

# -------------------------------
# Done
# -------------------------------
echo "=============================="
echo "✅ REDEPLOYMENT COMPLETE!"
echo "=============================="
echo ""
echo "Contract Addresses:"
echo "  ReviewToken:        $REVIEW_TOKEN_ADDR"
echo "  ReputationSystem:   $REPUTATION_ADDR"
echo "  ReviewStaking:      $STAKING_ADDR"
echo "  ReviewPlatform:     $PLATFORM_ADDR (NEW - with auto-validation)"
echo ""
echo "✅ New Features:"
echo "   - Auto-validates if AI score >= 60"
echo "   - Auto-calculates rewards (50-200 RVT)"
echo "   - Auto-rejects if score < 60"
echo ""
echo "✅ All files updated:"
echo "   - frontend/src/config/contracts.ts"
echo "   - frontend/.env"
echo "   - docs/deployment.md"
echo "   - monad.md"
echo ""
echo "🔄 Restart frontend to use new contract!"

