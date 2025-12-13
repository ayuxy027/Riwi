// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReviewTokenV2
 * @dev Updated ERC-20 token contract for review rewards with cashout support
 * This version allows transfers to approved contracts (like TokenCashout)
 * while maintaining security for regular transfers
 */
contract ReviewTokenV2 is ERC20, Ownable {
    /// @notice Mapping of addresses that are approved to receive tokens
    mapping(address => bool) public approvedReceivers;
    
    /// @notice Whether unrestricted transfers are enabled
    bool public unrestrictedTransfers;
    
    // Events
    event ReviewRewardsMinted(address indexed reviewer, uint256 amount);
    event ReceiverApproved(address indexed receiver, bool approved);
    event UnrestrictedTransfersChanged(bool enabled);
    
    /**
     * @dev Constructor to initialize the ReviewTokenV2
     */
    constructor() ERC20("Review Token", "RVT") Ownable(msg.sender) {
        // Mint initial supply to the deployer (1M tokens as per PRD)
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
        unrestrictedTransfers = false;
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
     * @dev Approve or revoke an address as a valid token receiver
     * This is used to whitelist contracts like TokenCashout
     * @param receiver Address to approve/revoke
     * @param approved Whether the address should be approved
     */
    function setApprovedReceiver(address receiver, bool approved) external onlyOwner {
        require(receiver != address(0), "Invalid receiver address");
        approvedReceivers[receiver] = approved;
        emit ReceiverApproved(receiver, approved);
    }
    
    /**
     * @dev Enable or disable unrestricted transfers
     * When enabled, tokens can be freely transferred between any addresses
     * @param enabled Whether unrestricted transfers should be enabled
     */
    function setUnrestrictedTransfers(bool enabled) external onlyOwner {
        unrestrictedTransfers = enabled;
        emit UnrestrictedTransfersChanged(enabled);
    }
    
    /**
     * @dev Check if a transfer is allowed
     * Transfers are allowed if:
     * - Sender is owner (always allowed)
     * - Unrestricted transfers are enabled
     * - Recipient is an approved receiver (like TokenCashout)
     */
    function _isTransferAllowed(address from, address to) internal view returns (bool) {
        // Owner can always transfer
        if (from == owner()) {
            return true;
        }
        
        // If unrestricted transfers are enabled, anyone can transfer
        if (unrestrictedTransfers) {
            return true;
        }
        
        // Check if recipient is an approved receiver
        if (approvedReceivers[to]) {
            return true;
        }
        
        return false;
    }
    
    /**
     * @dev Override transfer to enforce transfer restrictions
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        require(_isTransferAllowed(msg.sender, to), "Transfer not allowed: recipient not approved");
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override transferFrom to enforce transfer restrictions
     */
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        require(_isTransferAllowed(from, to), "Transfer not allowed: recipient not approved");
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev Batch approve multiple receivers at once
     * @param receivers Array of addresses to approve
     */
    function batchApproveReceivers(address[] calldata receivers) external onlyOwner {
        for (uint256 i = 0; i < receivers.length; i++) {
            require(receivers[i] != address(0), "Invalid receiver address");
            approvedReceivers[receivers[i]] = true;
            emit ReceiverApproved(receivers[i], true);
        }
    }
}
