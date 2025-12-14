// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReviewToken
 * @dev Custom ERC-20 token contract for review rewards as specified in the PRD
 * This contract handles the token distribution for validated reviews
 */
contract ReviewToken is ERC20, Ownable {
    /**
     * @dev Emitted when tokens are minted for a review
     */
    event ReviewRewardsMinted(address indexed reviewer, uint256 amount);

    /**
     * @dev Constructor to initialize the ReviewToken
     */
    constructor() ERC20("Review Token", "RVT") Ownable(msg.sender) {
        // Mint initial supply to the deployer (1M tokens as per PRD)
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    /**
     * @dev Function to mint tokens for valid reviews
     * This is called by the ReviewPlatform contract when a review is validated
     * @param reviewer The address of the reviewer to receive tokens
     * @param amount The amount of tokens to mint
     */
    function mintForReview(address reviewer, uint256 amount) external onlyOwner {
        require(reviewer != address(0), "Reviewer cannot be zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        _mint(reviewer, amount);
        emit ReviewRewardsMinted(reviewer, amount);
    }

    /**
     * @dev Override transfer to only allow owner to transfer tokens (for initial distribution)
     * In the PRD implementation, tokens are distributed via mintForReview, not regular transfers
     */
    function transfer(address to, uint256 amount) public override onlyOwner returns (bool) {
        return super.transfer(to, amount);
    }

    /**
     * @dev Override transferFrom to only allow owner to transfer tokens
     */
    function transferFrom(address from, address to, uint256 amount) public override onlyOwner returns (bool) {
        return super.transferFrom(from, to, amount);
    }

    /**
     * @dev Helper function to transfer ownership to a new platform
     * This allows the current owner (old platform) to transfer ownership to new platform
     * @param newOwner The address of the new owner (new ReviewPlatform)
     */
    function transferOwnershipToPlatform(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        _transferOwnership(newOwner);
    }
}