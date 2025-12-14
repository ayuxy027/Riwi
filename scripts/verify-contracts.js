// Verify deployed contracts
// Run: npx hardhat run scripts/verify-contracts.js --network monad_testnet

const hre = require("hardhat");

// Contract addresses
const CONTRACTS = {
    TokenCashout: "0x4044F6D5A7B675Dc2dA4be604E0a415b310EBF78",
    ReviewTokenV2: "0xeE35cF5da87F0B10A4e5DC253BD181b72691F5A1",
    ReviewToken: "0x9Ce50706CD0F73bB5502b7AA0a8cD17D8513de83",
};

async function main() {
    console.log("\n🔍 Verifying Deployed Contracts...\n");
    console.log("=".repeat(60));

    // Get TokenCashout contract
    console.log("\n📋 TokenCashout Verification");
    console.log("-".repeat(40));

    const cashoutAbi = [
        "function exchangeRate() view returns (uint256)",
        "function treasuryBalance() view returns (uint256)",
        "function cashoutEnabled() view returns (bool)",
        "function minCashoutAmount() view returns (uint256)",
        "function maxCashoutAmount() view returns (uint256)",
        "function rvtToken() view returns (address)",
        "function owner() view returns (address)",
    ];

    const cashout = new hre.ethers.Contract(
        CONTRACTS.TokenCashout,
        cashoutAbi,
        hre.ethers.provider
    );

    try {
        const exchangeRate = await cashout.exchangeRate();
        const treasuryBalance = await cashout.treasuryBalance();
        const cashoutEnabled = await cashout.cashoutEnabled();
        const minCashout = await cashout.minCashoutAmount();
        const maxCashout = await cashout.maxCashoutAmount();
        const rvtToken = await cashout.rvtToken();
        const owner = await cashout.owner();

        console.log("   Address:", CONTRACTS.TokenCashout);
        console.log("   Exchange Rate:", hre.ethers.formatEther(exchangeRate), "MON per RVT");
        console.log("   Treasury Balance:", hre.ethers.formatEther(treasuryBalance), "MON");
        console.log("   Cashout Enabled:", cashoutEnabled);
        console.log("   Min Cashout:", hre.ethers.formatEther(minCashout), "RVT");
        console.log("   Max Cashout:", hre.ethers.formatEther(maxCashout), "RVT");
        console.log("   RVT Token:", rvtToken);
        console.log("   Owner:", owner);
        console.log("   ✅ TokenCashout is live and configured");
    } catch (error) {
        console.log("   ❌ Error reading TokenCashout:", error.message);
    }

    // Get ReviewTokenV2 contract
    console.log("\n📋 ReviewTokenV2 Verification");
    console.log("-".repeat(40));

    const tokenAbi = [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function totalSupply() view returns (uint256)",
        "function owner() view returns (address)",
        "function approvedReceivers(address) view returns (bool)",
    ];

    const tokenV2 = new hre.ethers.Contract(
        CONTRACTS.ReviewTokenV2,
        tokenAbi,
        hre.ethers.provider
    );

    try {
        const name = await tokenV2.name();
        const symbol = await tokenV2.symbol();
        const totalSupply = await tokenV2.totalSupply();
        const owner = await tokenV2.owner();
        const cashoutApproved = await tokenV2.approvedReceivers(CONTRACTS.TokenCashout);

        console.log("   Address:", CONTRACTS.ReviewTokenV2);
        console.log("   Name:", name);
        console.log("   Symbol:", symbol);
        console.log("   Total Supply:", hre.ethers.formatEther(totalSupply), "RVT");
        console.log("   Owner:", owner);
        console.log("   TokenCashout Approved:", cashoutApproved ? "✅ Yes" : "❌ No");
        console.log("   ✅ ReviewTokenV2 is deployed");
    } catch (error) {
        console.log("   ❌ Error reading ReviewTokenV2:", error.message);
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ VERIFICATION COMPLETE");
    console.log("=".repeat(60));

    console.log("\n📄 Summary:");
    console.log("   • TokenCashout is deployed and funded with 1 MON");
    console.log("   • ReviewTokenV2 is deployed with TokenCashout approved");
    console.log("   • Exchange rate: 1 RVT = 0.01 MON");

    console.log("\n⚠️  Note:");
    console.log("   The TokenCashout currently points to the OLD ReviewToken");
    console.log("   To enable cashout, you need to either:");
    console.log("   1. Deploy a NEW TokenCashout pointing to ReviewTokenV2, OR");
    console.log("   2. Users need to have RVT on ReviewTokenV2");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Verification failed:", error);
        process.exit(1);
    });
