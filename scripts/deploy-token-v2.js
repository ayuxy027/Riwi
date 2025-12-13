// Deploy ReviewTokenV2 and configure for cashout
// Run: npx hardhat run scripts/deploy-token-v2.js --network monad_testnet

const hre = require("hardhat");
require("dotenv").config();

// Configuration
const CASHOUT_CONTRACT = "0x4044F6D5A7B675Dc2dA4be604E0a415b310EBF78";
const REVIEW_PLATFORM = "0x40C11dF88eEf1B1276978b750e315E49A929D10d";

async function main() {
    console.log("\n🚀 Deploying ReviewTokenV2...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);

    // Check balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Balance:", hre.ethers.formatEther(balance), "MON");

    if (balance < hre.ethers.parseEther("0.1")) {
        throw new Error("Insufficient balance for deployment");
    }

    // Deploy ReviewTokenV2
    console.log("\n📋 Deploying ReviewTokenV2...");
    const ReviewTokenV2 = await hre.ethers.getContractFactory("ReviewTokenV2");
    const token = await ReviewTokenV2.deploy();
    await token.waitForDeployment();

    const tokenAddress = await token.getAddress();
    console.log("✅ ReviewTokenV2 deployed at:", tokenAddress);

    // Wait for confirmations
    console.log("\n⏳ Waiting for confirmations...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Approve TokenCashout as a receiver
    console.log("\n📋 Approving TokenCashout as receiver...");
    const approveCashoutTx = await token.setApprovedReceiver(CASHOUT_CONTRACT, true);
    await approveCashoutTx.wait();
    console.log("✅ TokenCashout approved as receiver");

    // Get initial supply
    const totalSupply = await token.totalSupply();
    console.log("\n💰 Initial Supply:", hre.ethers.formatEther(totalSupply), "RVT");

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ DEPLOYMENT COMPLETE");
    console.log("=".repeat(60));
    console.log("\n📄 Contract Addresses:");
    console.log("   ReviewTokenV2:", tokenAddress);
    console.log("   TokenCashout:", CASHOUT_CONTRACT, "(approved receiver)");

    console.log("\n⚠️  IMPORTANT NEXT STEPS:");
    console.log("1. Update TokenCashout to use this new token address");
    console.log("2. Transfer ownership to ReviewPlatform if needed");
    console.log("3. Update frontend REVIEW_TOKEN address");

    console.log("\n📄 Deployment Info:");
    console.log(JSON.stringify({
        network: "monad_testnet",
        chainId: 10143,
        timestamp: new Date().toISOString(),
        deployer: deployer.address,
        contracts: {
            ReviewTokenV2: tokenAddress,
            TokenCashout: CASHOUT_CONTRACT,
            ReviewPlatform: REVIEW_PLATFORM
        }
    }, null, 2));

    console.log("\n✅ Script completed successfully");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
