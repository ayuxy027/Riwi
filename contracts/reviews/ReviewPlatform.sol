// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../tokens/ReviewToken.sol";
import "../reputation/ReputationSystem.sol";
import "../staking/ReviewStaking.sol";

/**
 * @title ReviewPlatform
 * @dev Main contract for managing the AI-assisted review system on Monad
 * Handles review submission, validation, reward distribution, and integration with other systems
 */
contract ReviewPlatform is Ownable {
    // Contract addresses
    ReviewToken public reviewToken;
    ReputationSystem public reputationSystem;
    ReviewStaking public reviewStaking;

    // Struct to represent a review
    struct Review {
        string content;
        address reviewer;
        uint256 timestamp;
        bool validated;
        uint256 rewardAmount;
        uint256 qualityScore; // Quality score assigned by AI validation
    }

    // Mapping from review ID to Review struct
    mapping(bytes32 => Review) public reviews;
    
    // Mapping to track reviews by user
    mapping(address => bytes32[]) public reviewsByUser;

    /**
     * @dev Emitted when a review is submitted
     */
    event ReviewSubmitted(bytes32 indexed reviewId, address indexed reviewer, string content);
    
    /**
     * @dev Emitted when a review is validated
     */
    event ReviewValidated(bytes32 indexed reviewId, uint256 rewardAmount, uint256 qualityScore);
    
    /**
     * @dev Emitted when rewards are distributed to a reviewer
     */
    event RewardDistributed(address indexed reviewer, uint256 amount);

    /**
     * @dev Constructor to initialize the ReviewPlatform
     * @param _tokenAddress Address of the ReviewToken contract
     * @param _reputationAddress Address of the ReputationSystem contract
     * @param _stakingAddress Address of the ReviewStaking contract
     */
    constructor(
        address _tokenAddress,
        address _reputationAddress,
        address _stakingAddress
    ) Ownable(msg.sender) {
        require(_tokenAddress != address(0), "Token address cannot be zero");
        require(_reputationAddress != address(0), "Reputation address cannot be zero");
        require(_stakingAddress != address(0), "Staking address cannot be zero");

        reviewToken = ReviewToken(_tokenAddress);
        reputationSystem = ReputationSystem(_reputationAddress);
        reviewStaking = ReviewStaking(_stakingAddress);
    }

    /**
     * @dev Submit a review to the platform
     * Before accepting the review, verifies that the user has sufficient stake
     * @param content The content of the review
     */
    function submitReview(string calldata content) external {
        require(bytes(content).length > 0, "Review content cannot be empty");
        require(reviewStaking.canUserReview(msg.sender), "User must have sufficient stake to submit reviews");

        bytes32 reviewId = keccak256(abi.encodePacked(msg.sender, block.timestamp, content));

        // Store the review
        reviews[reviewId] = Review({
            content: content,
            reviewer: msg.sender,
            timestamp: block.timestamp,
            validated: false,
            rewardAmount: 0,
            qualityScore: 0
        });

        // Track the review by user
        reviewsByUser[msg.sender].push(reviewId);

        emit ReviewSubmitted(reviewId, msg.sender, content);
    }

    /**
     * @dev Validate a review and distribute rewards
     * If qualityScore >= 60, automatically validates and calculates reward
     * If qualityScore < 60, review is rejected (no rewards)
     * @param reviewId The ID of the review to validate
     * @param rewardAmount The amount of tokens to reward (ignored if score >= 60, auto-calculated)
     * @param qualityScore The quality score assigned by AI (0-100)
     */
    function validateReview(bytes32 reviewId, uint256 rewardAmount, uint256 qualityScore) public onlyOwner {
        require(!reviews[reviewId].validated, "Review already validated");
        require(reviews[reviewId].reviewer != address(0), "Review does not exist");
        require(qualityScore <= 100, "Quality score must be between 0 and 100");

        address reviewer = reviews[reviewId].reviewer;

        // If quality score is >= 60, automatically validate and reward
        if (qualityScore >= 60) {
            // Calculate reward based on quality score (higher score = more reward)
            // Base reward: 50 RVT, max reward: 200 RVT for score of 100
            // Formula: 50 + (qualityScore - 60) * 3.75
            // This gives: 50 RVT for 60, ~100 RVT for 80, 200 RVT for 100
            uint256 baseReward = 50 * 10**18; // 50 RVT in wei
            uint256 bonusReward = ((qualityScore - 60) * 375 * 10**15); // Bonus for scores above 60
            uint256 calculatedReward = baseReward + bonusReward;

            // Update the review status
            reviews[reviewId].validated = true;
            reviews[reviewId].rewardAmount = calculatedReward;
            reviews[reviewId].qualityScore = qualityScore;

            // Mint tokens for the review
            reviewToken.mintForReview(reviewer, calculatedReward);

            // Update reputation based on quality score
            reputationSystem.updateReputationWithScore(reviewer, qualityScore);

            emit ReviewValidated(reviewId, calculatedReward, qualityScore);
            emit RewardDistributed(reviewer, calculatedReward);
        } else {
            // Score < 60: Mark as rejected (store score but don't validate/reward)
            reviews[reviewId].qualityScore = qualityScore;
            // Review remains validated = false, so it won't show as validated
            emit ReviewValidated(reviewId, 0, qualityScore);
        }
    }

    /**
     * @dev Auto-validate review based on AI quality score
     * If quality score is >= 60, automatically validates and distributes rewards
     * If quality score < 60, marks review as rejected (no rewards)
     * @param reviewId The ID of the review to evaluate
     * @param qualityScore The quality score assigned by AI (0-100)
     */
    function autoValidateReview(bytes32 reviewId, uint256 qualityScore) public onlyOwner {
        require(!reviews[reviewId].validated, "Review already validated");
        require(reviews[reviewId].reviewer != address(0), "Review does not exist");
        require(qualityScore <= 100, "Quality score must be between 0 and 100");

        address reviewer = reviews[reviewId].reviewer;

        // If quality score is >= 60, automatically validate and reward
        if (qualityScore >= 60) {
            // Calculate reward based on quality score (higher score = more reward)
            // Base reward: 50 RVT, max reward: 200 RVT for score of 100
            // Formula: 50 + (qualityScore - 60) * 3.75
            // This gives: 50 RVT for 60, ~100 RVT for 80, 200 RVT for 100
            uint256 baseReward = 50 * 10**18; // 50 RVT in wei
            uint256 bonusReward = ((qualityScore - 60) * 375 * 10**15); // Bonus for scores above 60
            uint256 rewardAmount = baseReward + bonusReward;

            // Update the review status
            reviews[reviewId].validated = true;
            reviews[reviewId].rewardAmount = rewardAmount;
            reviews[reviewId].qualityScore = qualityScore;

            // Mint tokens for the review
            reviewToken.mintForReview(reviewer, rewardAmount);

            // Update reputation based on quality score
            reputationSystem.updateReputationWithScore(reviewer, qualityScore);

            emit ReviewValidated(reviewId, rewardAmount, qualityScore);
            emit RewardDistributed(reviewer, rewardAmount);
        } else {
            // Score < 60: Mark as rejected (store score but don't validate/reward)
            reviews[reviewId].qualityScore = qualityScore;
            // Review remains validated = false, so it won't show as validated
            emit ReviewValidated(reviewId, 0, qualityScore);
        }
    }

    /**
     * @dev Get review details
     * @param reviewId The ID of the review to retrieve
     * @return Review struct containing all review information
     */
    function getReview(bytes32 reviewId) external view returns (Review memory) {
        return reviews[reviewId];
    }

    /**
     * @dev Get all reviews by a specific user
     * @param user The address of the user
     * @return Array of review IDs for the user
     */
    function getReviewsByUser(address user) external view returns (bytes32[] memory) {
        return reviewsByUser[user];
    }

    /**
     * @dev Get the total number of reviews submitted by a user
     * @param user The address of the user
     * @return The total number of reviews
     */
    function getUserReviewCount(address user) external view returns (uint256) {
        return reviewsByUser[user].length;
    }

    /**
     * @dev Batch auto-validate multiple reviews based on AI scores
     * Automatically validates reviews with score >= 60, rejects those < 60
     * @param reviewIds Array of review IDs to evaluate
     * @param qualityScores Array of quality scores for each review (0-100)
     */
    function batchAutoValidateReviews(
        bytes32[] memory reviewIds,
        uint256[] memory qualityScores
    ) external onlyOwner {
        require(reviewIds.length == qualityScores.length, "Array lengths must match");

        for (uint256 i = 0; i < reviewIds.length; i++) {
            autoValidateReview(reviewIds[i], qualityScores[i]);
        }
    }

    /**
     * @dev Batch validate multiple reviews
     * Useful for processing multiple AI-validated reviews at once
     * @param reviewIds Array of review IDs to validate
     * @param rewardAmounts Array of reward amounts for each review
     * @param qualityScores Array of quality scores for each review
     */
    function batchValidateReviews(
        bytes32[] memory reviewIds,
        uint256[] memory rewardAmounts,
        uint256[] memory qualityScores
    ) external onlyOwner {
        require(reviewIds.length == rewardAmounts.length, "Array lengths must match");
        require(reviewIds.length == qualityScores.length, "Array lengths must match");

        for (uint256 i = 0; i < reviewIds.length; i++) {
            validateReview(reviewIds[i], rewardAmounts[i], qualityScores[i]);
        }
    }

    /**
     * @dev Update the review token contract address
     * @param _newReviewToken The new review token address
     */
    function setReviewToken(address _newReviewToken) external onlyOwner {
        require(_newReviewToken != address(0), "Review token address cannot be zero");
        reviewToken = ReviewToken(_newReviewToken);
    }

    /**
     * @dev Update the reputation system contract address
     * @param _newReputationSystem The new reputation system address
     */
    function setReputationSystem(address _newReputationSystem) external onlyOwner {
        require(_newReputationSystem != address(0), "Reputation system address cannot be zero");
        reputationSystem = ReputationSystem(_newReputationSystem);
    }

    /**
     * @dev Update the staking contract address
     * @param _newReviewStaking The new staking contract address
     */
    function setReviewStaking(address _newReviewStaking) external onlyOwner {
        require(_newReviewStaking != address(0), "Staking contract address cannot be zero");
        reviewStaking = ReviewStaking(_newReviewStaking);
    }
}