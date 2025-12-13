// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TokenCashout
 * @dev Allows users to cashout RVT tokens for MON (native Monad tokens)
 * Uses a fixed exchange rate managed by the owner
 * 
 * Flow:
 * 1. Owner funds contract with MON
 * 2. User approves RVT spending
 * 3. User calls cashout(amount) to exchange RVT for MON
 * 4. Contract receives RVT and sends MON to user
 */
contract TokenCashout is Ownable, ReentrancyGuard {
    /// @notice The RVT token contract
    IERC20 public immutable rvtToken;
    
    /// @notice Exchange rate: MON wei per 1 RVT (18 decimals)
    /// @dev e.g., 1e17 = 0.1 MON per 1 RVT, 1e18 = 1 MON per 1 RVT
    uint256 public exchangeRate;
    
    /// @notice Minimum cashout amount (in RVT wei)
    uint256 public minCashoutAmount;
    
    /// @notice Maximum cashout amount per transaction (in RVT wei)
    uint256 public maxCashoutAmount;
    
    /// @notice Total RVT that has been cashed out
    uint256 public totalCashedOut;
    
    /// @notice Total MON that has been distributed
    uint256 public totalMonDistributed;
    
    /// @notice Mapping of user addresses to their total cashed out RVT
    mapping(address => uint256) public userCashouts;
    
    /// @notice Mapping of user addresses to their total MON received
    mapping(address => uint256) public userMonReceived;
    
    /// @notice Whether cashout is currently enabled
    bool public cashoutEnabled;
    
    // Events
    event Cashout(
        address indexed user, 
        uint256 rvtAmount, 
        uint256 monReceived,
        uint256 timestamp
    );
    event ExchangeRateUpdated(uint256 oldRate, uint256 newRate);
    event TreasuryFunded(address indexed funder, uint256 amount);
    event TreasuryWithdrawn(address indexed owner, uint256 amount);
    event CashoutStatusChanged(bool enabled);
    event MinCashoutAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event MaxCashoutAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event RvtWithdrawn(address indexed owner, uint256 amount);
    
    /**
     * @dev Constructor
     * @param _rvtToken Address of the RVT token contract
     * @param _initialRate Initial exchange rate (MON wei per 1 RVT)
     */
    constructor(
        address _rvtToken, 
        uint256 _initialRate
    ) Ownable(msg.sender) {
        require(_rvtToken != address(0), "Invalid RVT token address");
        require(_initialRate > 0, "Exchange rate must be > 0");
        
        rvtToken = IERC20(_rvtToken);
        exchangeRate = _initialRate;
        
        // Default limits
        minCashoutAmount = 1e18; // 1 RVT minimum
        maxCashoutAmount = 10000e18; // 10,000 RVT maximum per tx
        cashoutEnabled = true;
    }
    
    /**
     * @dev Fund the contract with MON for cashouts
     * Simply send MON to this contract
     */
    receive() external payable {
        emit TreasuryFunded(msg.sender, msg.value);
    }
    
    /**
     * @dev Calculate MON output for given RVT input
     * @param rvtAmount Amount of RVT to cashout (in wei, 18 decimals)
     * @return monAmount Amount of MON user will receive (in wei)
     */
    function calculateCashout(uint256 rvtAmount) public view returns (uint256 monAmount) {
        return (rvtAmount * exchangeRate) / 1e18;
    }
    
    /**
     * @dev Get the maximum RVT that can be cashed out based on treasury balance
     * @return maxRvt Maximum RVT that can be cashed out
     */
    function maxCashoutAvailable() public view returns (uint256 maxRvt) {
        uint256 treasuryMon = address(this).balance;
        // Reverse calculation: RVT = MON * 1e18 / exchangeRate
        return (treasuryMon * 1e18) / exchangeRate;
    }
    
    /**
     * @dev Cashout RVT tokens for MON
     * @param rvtAmount Amount of RVT to cashout (in wei, 18 decimals)
     * 
     * Requirements:
     * - Cashout must be enabled
     * - Amount must be >= minCashoutAmount and <= maxCashoutAmount
     * - User must have approved this contract to spend their RVT
     * - Treasury must have enough MON
     */
    function cashout(uint256 rvtAmount) external nonReentrant {
        require(cashoutEnabled, "Cashout is currently disabled");
        require(rvtAmount >= minCashoutAmount, "Amount below minimum");
        require(rvtAmount <= maxCashoutAmount, "Amount exceeds maximum");
        
        // Calculate MON output
        uint256 monOutput = calculateCashout(rvtAmount);
        require(monOutput > 0, "Output amount too small");
        require(address(this).balance >= monOutput, "Insufficient treasury balance");
        
        // Transfer RVT from user to contract
        // Note: User must have called approve() on RVT token first
        bool transferSuccess = rvtToken.transferFrom(msg.sender, address(this), rvtAmount);
        require(transferSuccess, "RVT transfer failed");
        
        // Update state before external call (CEI pattern)
        totalCashedOut += rvtAmount;
        totalMonDistributed += monOutput;
        userCashouts[msg.sender] += rvtAmount;
        userMonReceived[msg.sender] += monOutput;
        
        // Send MON to user
        (bool success, ) = payable(msg.sender).call{value: monOutput}("");
        require(success, "MON transfer failed");
        
        emit Cashout(msg.sender, rvtAmount, monOutput, block.timestamp);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Update the exchange rate
     * @param newRate New exchange rate (MON wei per 1 RVT)
     */
    function setExchangeRate(uint256 newRate) external onlyOwner {
        require(newRate > 0, "Rate must be > 0");
        uint256 oldRate = exchangeRate;
        exchangeRate = newRate;
        emit ExchangeRateUpdated(oldRate, newRate);
    }
    
    /**
     * @dev Enable or disable cashout
     * @param enabled Whether cashout should be enabled
     */
    function setCashoutEnabled(bool enabled) external onlyOwner {
        cashoutEnabled = enabled;
        emit CashoutStatusChanged(enabled);
    }
    
    /**
     * @dev Update minimum cashout amount
     * @param newMin New minimum amount (in RVT wei)
     */
    function setMinCashoutAmount(uint256 newMin) external onlyOwner {
        uint256 oldMin = minCashoutAmount;
        minCashoutAmount = newMin;
        emit MinCashoutAmountUpdated(oldMin, newMin);
    }
    
    /**
     * @dev Update maximum cashout amount
     * @param newMax New maximum amount (in RVT wei)
     */
    function setMaxCashoutAmount(uint256 newMax) external onlyOwner {
        uint256 oldMax = maxCashoutAmount;
        maxCashoutAmount = newMax;
        emit MaxCashoutAmountUpdated(oldMax, newMax);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get treasury MON balance
     * @return balance Current MON balance in contract
     */
    function treasuryBalance() external view returns (uint256 balance) {
        return address(this).balance;
    }
    
    /**
     * @dev Get collected RVT balance (from cashouts)
     * @return balance Current RVT balance in contract
     */
    function collectedRvt() external view returns (uint256 balance) {
        return rvtToken.balanceOf(address(this));
    }
    
    /**
     * @dev Get user's cashout statistics
     * @param user Address to query
     * @return rvtCashedOut Total RVT the user has cashed out
     * @return monReceived Total MON the user has received
     */
    function getUserStats(address user) external view returns (
        uint256 rvtCashedOut,
        uint256 monReceived
    ) {
        return (userCashouts[user], userMonReceived[user]);
    }
    
    /**
     * @dev Get contract statistics
     * @return _totalCashedOut Total RVT cashed out
     * @return _totalMonDistributed Total MON distributed
     * @return _treasuryBalance Current MON in treasury
     * @return _collectedRvt Current RVT collected
     * @return _exchangeRate Current exchange rate
     * @return _cashoutEnabled Whether cashout is enabled
     */
    function getContractStats() external view returns (
        uint256 _totalCashedOut,
        uint256 _totalMonDistributed,
        uint256 _treasuryBalance,
        uint256 _collectedRvt,
        uint256 _exchangeRate,
        bool _cashoutEnabled
    ) {
        return (
            totalCashedOut,
            totalMonDistributed,
            address(this).balance,
            rvtToken.balanceOf(address(this)),
            exchangeRate,
            cashoutEnabled
        );
    }
    
    // ============ Withdrawal Functions ============
    
    /**
     * @dev Withdraw MON from treasury (emergency/rebalancing)
     * @param amount Amount of MON to withdraw
     */
    function withdrawTreasury(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Withdrawal failed");
        emit TreasuryWithdrawn(owner(), amount);
    }
    
    /**
     * @dev Withdraw collected RVT tokens
     * @param amount Amount of RVT to withdraw
     */
    function withdrawRvt(uint256 amount) external onlyOwner {
        uint256 balance = rvtToken.balanceOf(address(this));
        require(balance >= amount, "Insufficient RVT balance");
        bool success = rvtToken.transfer(owner(), amount);
        require(success, "RVT transfer failed");
        emit RvtWithdrawn(owner(), amount);
    }
}
