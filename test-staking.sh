#!/bin/bash
set -e

RPC_URL="https://testnet-rpc.monad.xyz"
STAKING_CONTRACT="0x51F7cbd74731976d834a67F156dBC387CCc59c1D"
STAKING_PRECOMPILE="0x0000000000000000000000000000000000001000"
DEPLOYER="0xab1c13383A82a4E0d1A5D56ad0C9691BBCddd617"
VALIDATOR_ID=1

echo "=========================================="
echo "Testing Staking Endpoints"
echo "=========================================="
echo ""

echo "1. Testing RPC Connection..."
CHAIN_ID=$(cast chain-id --rpc-url "$RPC_URL")
echo "   Chain ID: $CHAIN_ID"
echo ""

echo "2. Testing ReviewStaking Contract..."
echo "   Contract Address: $STAKING_CONTRACT"
echo ""

echo "   a) Getting Validator ID..."
VALIDATOR=$(cast call "$STAKING_CONTRACT" "getValidatorId()" --rpc-url "$RPC_URL")
echo "      Validator ID: $VALIDATOR"
echo ""

echo "   b) Getting Min Stake Amount..."
MIN_STAKE=$(cast call "$STAKING_CONTRACT" "getMinStakeAmount()" --rpc-url "$RPC_URL")
MIN_STAKE_ETH=$(cast --to-unit "$MIN_STAKE" ether)
echo "      Min Stake: $MIN_STAKE ($MIN_STAKE_ETH MON)"
echo ""

echo "   c) Getting User Stake (via contract)..."
USER_STAKE=$(cast call "$STAKING_CONTRACT" "getUserStake(address)" "$DEPLOYER" --rpc-url "$RPC_URL")
USER_STAKE_ETH=$(cast --to-unit "$USER_STAKE" ether)
echo "      User Stake: $USER_STAKE ($USER_STAKE_ETH MON)"
echo ""

echo "   d) Checking if user can review..."
CAN_REVIEW=$(cast call "$STAKING_CONTRACT" "canUserReview(address)" "$DEPLOYER" --rpc-url "$RPC_URL")
echo "      Can Review: $CAN_REVIEW"
echo ""

echo "3. Testing Staking Precompile Directly..."
echo "   Precompile Address: $STAKING_PRECOMPILE"
echo ""

echo "   a) Calling getDelegator directly..."
DELEGATOR_DATA=$(cast call "$STAKING_PRECOMPILE" "getDelegator(uint64,address)(uint256,uint256,uint256,uint256,uint256,uint64,uint64)" "$VALIDATOR_ID" "$DEPLOYER" --rpc-url "$RPC_URL")
echo "      Delegator Data: $DELEGATOR_DATA"
echo ""

# Extract first value (stake amount)
STAKE_FROM_PRECOMPILE=$(echo "$DELEGATOR_DATA" | awk '{print $1}')
STAKE_ETH=$(cast --to-unit "$STAKE_FROM_PRECOMPILE" ether)
echo "      Stake from Precompile: $STAKE_FROM_PRECOMPILE ($STAKE_ETH MON)"
echo ""

echo "4. Checking Account Balance..."
BALANCE=$(cast balance "$DEPLOYER" --rpc-url "$RPC_URL")
BALANCE_ETH=$(cast --to-unit "$BALANCE" ether)
echo "   Balance: $BALANCE ($BALANCE_ETH MON)"
echo ""

echo "=========================================="
echo "Summary:"
echo "=========================================="
echo "Validator ID: $VALIDATOR"
echo "Min Stake Required: $MIN_STAKE_ETH MON"
echo "User Current Stake (via contract): $USER_STAKE_ETH MON"
echo "User Current Stake (via precompile): $STAKE_ETH MON"
echo "User Balance: $BALANCE_ETH MON"
echo "Can Review: $CAN_REVIEW"
echo ""

if [ "$USER_STAKE_ETH" = "0" ] && [ "$STAKE_ETH" = "0" ]; then
    echo "⚠️  User has not staked any tokens yet."
    echo "   They need to stake at least $MIN_STAKE_ETH MON to submit reviews."
elif [ "$USER_STAKE_ETH" != "$STAKE_ETH" ]; then
    echo "⚠️  Mismatch between contract and precompile stake amounts!"
    echo "   This indicates a potential issue with the contract reading from precompile."
else
    echo "✅ Stake data is consistent between contract and precompile."
fi

