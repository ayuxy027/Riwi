// Constants and configuration

// Deployer address (the address that deployed contracts and received initial 1M RVT)
// This is used to filter out the initial deployer mint from "earned" calculations
export const DEPLOYER_ADDRESS = "0xab1c13383A82a4E0d1A5D56ad0C9691BBCddd617" as const;

// Check if an address is the deployer
export function isDeployerAddress(address: string | null | undefined): boolean {
  if (!address) return false;
  return address.toLowerCase() === DEPLOYER_ADDRESS.toLowerCase();
}

