// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReputationSystem
 * @dev Contract to handle reputation tracking and management based on review quality
 * As specified in the PRD, this tracks user review quality over time
 */
contract ReputationSystem is Ownable {
    // Mapping from user address to their reputation score
    mapping(address => uint256) public reputationScores;
    
    // Mapping from user address to their review history (quality scores)
    mapping(address => uint256[]) public reviewHistory;
    
    // Mapping from user address to total number of reviews
    mapping(address => uint256) public totalReviews;

    /**
     * @dev Emitted when a user's reputation is updated
     */
    event ReputationUpdated(address indexed user, uint256 newScore);

    /**
     * @dev Constructor to initialize the ReputationSystem
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Update reputation score for a user based on review quality
     * As per PRD: Track and reward consistent quality reviewers
     * @param user The address of the user whose reputation will be updated
     * @param goodReview Whether the review was of good quality (true) or poor (false)
     */
    function updateReputation(address user, bool goodReview) external onlyOwner {
        require(user != address(0), "User cannot be zero address");
        
        if (goodReview) {
            reputationScores[user] += 1; // Increment for good reviews
        } else {
            if (reputationScores[user] > 0) {
                reputationScores[user] -= 1; // Decrement for poor reviews (but not below 0)
            }
        }
        
        totalReviews[user] += 1;
        emit ReputationUpdated(user, reputationScores[user]);
    }

    /**
     * @dev Update reputation with a specific quality score
     * This allows for more granular reputation scoring based on review quality
     * @param user The address of the user whose reputation will be updated
     * @param qualityScore The quality score of the review (0-100 scale)
     */
    function updateReputationWithScore(address user, uint256 qualityScore) external onlyOwner {
        require(user != address(0), "User cannot be zero address");
        require(qualityScore <= 100, "Quality score must be between 0 and 100");
        
        // Calculate reputation change based on quality score
        if (qualityScore >= 70) {
            // Good review: increase reputation
            reputationScores[user] += 1;
        } else if (qualityScore >= 40 && reputationScores[user] > 0) {
            // Average review: no change
        } else if (qualityScore < 40 && reputationScores[user] > 0) {
            // Poor review: decrease reputation
            reputationScores[user] -= 1;
        }
        
        // Add to review history
        reviewHistory[user].push(qualityScore);
        totalReviews[user] += 1;
        
        emit ReputationUpdated(user, reputationScores[user]);
    }

    /**
     * @dev Get the reputation score for a user
     * @param user The address of the user
     * @return The reputation score
     */
    function getReputation(address user) external view returns (uint256) {
        return reputationScores[user];
    }

    /**
     * @dev Get the total number of reviews for a user
     * @param user The address of the user
     * @return The total number of reviews
     */
    function getTotalReviews(address user) external view returns (uint256) {
        return totalReviews[user];
    }

    /**
     * @dev Get the review history for a user
     * @param user The address of the user
     * @return Array of quality scores for all reviews
     */
    function getReviewHistory(address user) external view returns (uint256[] memory) {
        return reviewHistory[user];
    }

    /**
     * @dev Get user statistics (reputation, total reviews, and history)
     * @param user The address of the user
     * @return reputation The reputation score
     * @return totalRev The total number of reviews
     * @return history The review history
     */
    function getUserStats(address user) external view returns (uint256 reputation, uint256 totalRev, uint256[] memory history) {
        return (reputationScores[user], totalReviews[user], reviewHistory[user]);
    }
}