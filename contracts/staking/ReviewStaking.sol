// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IMonadStaking.sol";

/**
 * @title ReviewStaking
 * @dev Contract that integrates with Monad's staking precompile to require users to stake before reviewing
 * As specified in the PRD: Users must stake tokens to submit reviews, ensuring commitment and quality
 */
contract ReviewStaking is Ownable {
    // The Monad staking precompile contract
    IMonadStaking public constant STAKING_CONTRACT = IMonadStaking(0x0000000000000000000000000000000000001000);
    
    // The validator ID that users need to stake with
    uint64 public validatorId;
    
    // The minimum stake amount required to submit reviews
    uint256 public minStakeAmount;

    // Mapping to track which users have sufficient stake
    mapping(address => bool) public hasStake;

    /**
     * @dev Emitted when a user's stake is verified
     */
    event StakeVerified(address indexed user, bool verified);
    
    /**
     * @dev Emitted when a user's stake is removed (no longer sufficient)
     */
    event StakeRemoved(address indexed user);

    /**
     * @dev Constructor to initialize the ReviewStaking contract
     * @param _validatorId The validator ID that users need to stake with
     * @param _minStakeAmount The minimum stake amount required to submit reviews
     */
    constructor(uint64 _validatorId, uint256 _minStakeAmount) Ownable(msg.sender) {
        validatorId = _validatorId;
        minStakeAmount = _minStakeAmount;
    }

    /**
     * @dev Function to verify a user's stake amount
     * Checks if the user has sufficient stake through Monad's staking precompile
     * NOTE: Monad's staking precompile stores active stake in deltaStake (index 3) 
     * when stake hasn't been processed yet. We check both stake and deltaStake.
     * @param user The address of the user to verify
     * @return bool indicating whether the user has sufficient stake
     */
    function verifyStake(address user) external returns (bool) {
        (uint256 stakeAmount, , , uint256 deltaStake, , , ) = STAKING_CONTRACT.getDelegator(validatorId, user);

        // Check both stake (processed) and deltaStake (pending activation)
        bool hasSufficientStake = (stakeAmount >= minStakeAmount) || (deltaStake >= minStakeAmount);
        hasStake[user] = hasSufficientStake;

        if (hasSufficientStake) {
            emit StakeVerified(user, true);
        } else {
            emit StakeRemoved(user);
        }

        return hasSufficientStake;
    }

    /**
     * @dev Check if a user can submit reviews based on their stake
     * This function is called by the ReviewPlatform before accepting reviews
     * NOTE: Monad's staking precompile stores active stake in deltaStake (index 3) 
     * when stake hasn't been processed yet. We check both stake and deltaStake.
     * @param user The address of the user to check
     * @return bool indicating whether the user can submit reviews
     */
    function canUserReview(address user) external returns (bool) {
        (uint256 stakeAmount, , , uint256 deltaStake, , , ) = STAKING_CONTRACT.getDelegator(validatorId, user);
        // Check both stake (processed) and deltaStake (pending activation)
        // deltaStake is the active stake that will be activated in the next epoch
        return (stakeAmount >= minStakeAmount) || (deltaStake >= minStakeAmount);
    }

    /**
     * @dev Update the validator ID
     * @param _newValidatorId The new validator ID
     */
    function setValidatorId(uint64 _newValidatorId) external onlyOwner {
        validatorId = _newValidatorId;
    }

    /**
     * @dev Update the minimum stake amount required
     * @param _newMinStakeAmount The new minimum stake amount
     */
    function setMinStakeAmount(uint256 _newMinStakeAmount) external onlyOwner {
        minStakeAmount = _newMinStakeAmount;
    }

    /**
     * @dev Get the current validator ID
     * @return The current validator ID
     */
    function getValidatorId() external view returns (uint64) {
        return validatorId;
    }

    /**
     * @dev Get the current minimum stake amount
     * @return The current minimum stake amount
     */
    function getMinStakeAmount() external view returns (uint256) {
        return minStakeAmount;
    }

    /**
     * @dev Get the actual stake amount for a user from Monad's staking precompile
     * NOTE: Returns the active stake (either stake or deltaStake, whichever is greater)
     * @param user The address of the user
     * @return The stake amount
     */
    function getUserStake(address user) external returns (uint256) {
        (uint256 stakeAmount, , , uint256 deltaStake, , , ) = STAKING_CONTRACT.getDelegator(validatorId, user);
        // Return the active stake (deltaStake if stake is 0, otherwise stake)
        return deltaStake > 0 ? deltaStake : stakeAmount;
    }
}