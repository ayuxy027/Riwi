// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title IMonadStaking
 * @dev Interface for Monad's staking precompile as documented in mcp.txt
 * This interface represents the staking precompile contract at address 0x0000000000000000000000000000000000001000
 */
interface IMonadStaking {
    /**
     * @dev Delegate stake to a validator
     * @param validatorId The ID of the validator to delegate to
     * @return success Whether the delegation was successful
     */
    function delegate(uint64 validatorId) external payable returns (bool success);

    /**
     * @dev Get delegator information for a specific validator
     * @param validatorId The ID of the validator
     * @param delegator The address of the delegator
     * @return stake The amount of stake
     * @return accRewardPerToken Accumulated reward per token
     * @return unclaimedRewards Amount of unclaimed rewards
     * @return deltaStake Delta stake
     * @return nextDeltaStake Next delta stake
     * @return deltaEpoch Delta epoch
     * @return nextDeltaEpoch Next delta epoch
     */
    function getDelegator(uint64 validatorId, address delegator) external returns (
        uint256 stake,
        uint256 accRewardPerToken,
        uint256 unclaimedRewards,
        uint256 deltaStake,
        uint256 nextDeltaStake,
        uint64 deltaEpoch,
        uint64 nextDeltaEpoch
    );

    /**
     * @dev Claim rewards for a delegator
     * @param validatorId The ID of the validator
     */
    function claimRewards(uint64 validatorId) external;
    
    /**
     * @dev Compound rewards back into stake
     * @param validatorId The ID of the validator
     */
    function compound(uint64 validatorId) external;
}