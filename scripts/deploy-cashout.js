const hre = require("hardhat");
const { parseEther, formatEther } = require("ethers");

/**
 * Deployment script for TokenCashout contract
 * 
 * This script deploys the TokenCashout contract and optionally:
 * 1. Deploys ReviewTokenV2 (if needed)
 * 2. Sets up the cashout contract as an approved receiver
 * 3. Funds the treasury with MON
 * 
 * Usage:
 *   npx hardhat run scripts/deploy-cashout.js --network monad_testnet
 * 
 * Environment Variables:
 *   PRIVATE_KEY - Deployer's private key
 *   MONAD_TESTNET_RPC - RPC URL (defaults to https://testnet-rpc.monad.xyz)
 */

async function main() {
    console.log("🚀 Starting TokenCashout Deployment...\n");

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("📍 Deployer address:", deployer.address);

    // Check deployer balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Deployer balance:", formatEther(balance), "MON\n");

    if (balance < parseEther("0.1")) {
        console.error("❌ Insufficient balance for deployment. Need at least 0.1 MON");
        process.exit(1);
    }

    // ============ Configuration ============

    // Existing ReviewToken address (from previous deployment)
    // If using ReviewTokenV2, set this to "DEPLOY_NEW"
    const EXISTING_RVT_ADDRESS = "0x9Ce50706CD0F73bB5502b7AA0a8cD17D8513de83";

    // Set to true to deploy ReviewTokenV2 instead of using existing
    const DEPLOY_NEW_TOKEN = false;

    // Exchange rate: MON per 1 RVT (in wei)
    // 0.1 MON per 1 RVT = 1e17
    // 0.01 MON per 1 RVT = 1e16
    const EXCHANGE_RATE = parseEther("0.01"); // 0.01 MON per RVT

    // Initial treasury funding (in MON)
    const INITIAL_TREASURY = parseEther("1"); // 1 MON to start

    // ============ Deployment ============

    let rvtTokenAddress = EXISTING_RVT_ADDRESS;

    // Step 1: Deploy ReviewTokenV2 if needed
    if (DEPLOY_NEW_TOKEN) {
        console.log("📦 Deploying ReviewTokenV2...");
        const ReviewTokenV2 = await hre.ethers.getContractFactory("ReviewTokenV2");
        const reviewToken = await ReviewTokenV2.deploy();
        await reviewToken.waitForDeployment();
        rvtTokenAddress = await reviewToken.getAddress();
        console.log("✅ ReviewTokenV2 deployed to:", rvtTokenAddress);
    } else {
        console.log("📦 Using existing ReviewToken:", rvtTokenAddress);
    }

    // Step 2: Deploy TokenCashout
    console.log("\n📦 Deploying TokenCashout...");
    const TokenCashout = await hre.ethers.getContractFactory("TokenCashout");
    const cashout = await TokenCashout.deploy(rvtTokenAddress, EXCHANGE_RATE);
    await cashout.waitForDeployment();
    const cashoutAddress = await cashout.getAddress();
    console.log("✅ TokenCashout deployed to:", cashoutAddress);

    // Step 3: Fund the treasury
    console.log("\n💸 Funding treasury with", formatEther(INITIAL_TREASURY), "MON...");
    const fundTx = await deployer.sendTransaction({
        to: cashoutAddress,
        value: INITIAL_TREASURY
    });
    await fundTx.wait();
    console.log("✅ Treasury funded. TX:", fundTx.hash);

    // Step 4: If we deployed ReviewTokenV2, set cashout as approved receiver
    if (DEPLOY_NEW_TOKEN) {
        console.log("\n🔧 Setting TokenCashout as approved receiver...");
        const reviewToken = await hre.ethers.getContractAt("ReviewTokenV2", rvtTokenAddress);
        const approveTx = await reviewToken.setApprovedReceiver(cashoutAddress, true);
        await approveTx.wait();
        console.log("✅ TokenCashout approved as receiver. TX:", approveTx.hash);
    }

    // ============ Verification ============

    console.log("\n📊 Verifying deployment...");

    // Get contract stats
    const stats = await cashout.getContractStats();
    console.log("   Exchange Rate:", formatEther(stats._exchangeRate), "MON per RVT");
    console.log("   Treasury Balance:", formatEther(stats._treasuryBalance), "MON");
    console.log("   Cashout Enabled:", stats._cashoutEnabled);

    // Calculate how many RVT can be cashed out
    const maxCashout = await cashout.maxCashoutAvailable();
    console.log("   Max RVT Cashout Available:", formatEther(maxCashout), "RVT");

    // ============ Summary ============

    console.log("\n" + "=".repeat(60));
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(60));
    console.log("\n📋 Contract Addresses:");
    console.log("   ReviewToken:", rvtTokenAddress);
    console.log("   TokenCashout:", cashoutAddress);
    console.log("\n📋 Configuration:");
    console.log("   Exchange Rate: 1 RVT =", formatEther(EXCHANGE_RATE), "MON");
    console.log("   Treasury Balance:", formatEther(INITIAL_TREASURY), "MON");
    console.log("   Min Cashout: 1 RVT");
    console.log("   Max Cashout: 10,000 RVT per tx");

    console.log("\n📋 Next Steps:");
    console.log("   1. Add more MON to treasury if needed:");
    console.log(`      cast send ${cashoutAddress} --value 10ether --rpc-url https://testnet-rpc.monad.xyz --legacy`);
    console.log("   2. Update frontend with new contract address");
    console.log("   3. If using existing ReviewToken, users need owner to enable transfers");

    console.log("\n📋 Verify Commands:");
    console.log(`   # Check treasury balance`);
    console.log(`   cast call ${cashoutAddress} "treasuryBalance()" --rpc-url https://testnet-rpc.monad.xyz --legacy`);
    console.log(`   # Check exchange rate`);
    console.log(`   cast call ${cashoutAddress} "exchangeRate()" --rpc-url https://testnet-rpc.monad.xyz --legacy`);
    console.log(`   # Calculate cashout for 100 RVT`);
    console.log(`   cast call ${cashoutAddress} "calculateCashout(uint256)" 100000000000000000000 --rpc-url https://testnet-rpc.monad.xyz --legacy`);

    // Save deployment info
    const deploymentInfo = {
        network: "monad_testnet",
        chainId: 10143,
        timestamp: new Date().toISOString(),
        deployer: deployer.address,
        contracts: {
            ReviewToken: rvtTokenAddress,
            TokenCashout: cashoutAddress
        },
        config: {
            exchangeRate: formatEther(EXCHANGE_RATE),
            initialTreasury: formatEther(INITIAL_TREASURY)
        }
    };

    console.log("\n📄 Deployment Info (save this):");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    return deploymentInfo;
}

main()
    .then((result) => {
        console.log("\n✅ Script completed successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Deployment failed:", error);
        process.exit(1);
    });
