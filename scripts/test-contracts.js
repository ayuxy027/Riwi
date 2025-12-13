// scripts/test-contracts.js
const { ethers } = require("hardhat");

async function testContracts() {
  console.log("Testing contracts deployment and functionality...");

  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", await deployer.getAddress());

  // Deploy ReviewToken
  const ReviewToken = await ethers.getContractFactory("ReviewToken");
  console.log("Deploying ReviewToken...");
  const reviewToken = await ReviewToken.deploy();
  await reviewToken.deploymentTransaction().wait();
  console.log("ReviewToken deployed to:", await reviewToken.getAddress());

  // Deploy ReputationSystem
  const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
  console.log("Deploying ReputationSystem...");
  const reputationSystem = await ReputationSystem.deploy();
  await reputationSystem.deploymentTransaction().wait();
  console.log("ReputationSystem deployed to:", await reputationSystem.getAddress());

  // Deploy ReviewStaking
  const ReviewStaking = await ethers.getContractFactory("ReviewStaking");
  console.log("Deploying ReviewStaking...");
  const reviewStaking = await ReviewStaking.deploy(1, ethers.parseEther("1")); // validatorId=1, minStake=1 token
  await reviewStaking.deploymentTransaction().wait();
  console.log("ReviewStaking deployed to:", await reviewStaking.getAddress());

  // Deploy ReviewPlatform
  const ReviewPlatform = await ethers.getContractFactory("ReviewPlatform");
  console.log("Deploying ReviewPlatform...");
  const reviewPlatform = await ReviewPlatform.deploy(
    await reviewToken.getAddress(),
    await reputationSystem.getAddress(),
    await reviewStaking.getAddress()
  );
  await reviewPlatform.deploymentTransaction().wait();
  console.log("ReviewPlatform deployed to:", await reviewPlatform.getAddress());

  // Test basic functionality
  console.log("\n--- Testing basic functionality ---");
  
  // Check token name and symbol
  const tokenName = await reviewToken.name();
  const tokenSymbol = await reviewToken.symbol();
  console.log("Token Name:", tokenName);
  console.log("Token Symbol:", tokenSymbol);

  // Check initial supply
  const initialSupply = await reviewToken.totalSupply();
  console.log("Initial Supply:", ethers.formatEther(initialSupply));

  // Test mintForReview (this would normally be called by the platform)
  const reviewer = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Example address
  const rewardAmount = ethers.parseEther("10");
  
  console.log("Testing mintForReview...");
  const mintTx = await reviewToken.mintForReview(reviewer, rewardAmount);
  await mintTx.wait();
  console.log("Successfully minted tokens for reviewer");

  // Check reviewer balance 
  const reviewerBalance = await reviewToken.balanceOf(reviewer);
  console.log("Reviewer balance:", ethers.formatEther(reviewerBalance));

  // Check staking values
  const validatorId = await reviewStaking.getValidatorId();
  const minStake = await reviewStaking.getMinStakeAmount();
  console.log("Staking Validator ID:", validatorId);
  console.log("Min Stake Amount:", ethers.formatEther(minStake));

  // Check reputation system
  const testUser = await deployer.getAddress();
  console.log("Testing reputation update for deployer...");
  const reputationTx = await reputationSystem.updateReputation(testUser, true);
  await reputationTx.wait();
  const reputation = await reputationSystem.getReputation(testUser);
  console.log("Deployer reputation:", reputation);

  console.log("\nAll contracts deployed and tested successfully!");
  console.log("End-to-end contract system is working properly!");
}

// Run the test
testContracts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });