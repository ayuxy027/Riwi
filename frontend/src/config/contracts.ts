// Contract addresses and configuration for Monad Testnet
export const CONTRACT_ADDRESSES = {
  REVIEW_TOKEN: import.meta.env.VITE_REVIEW_TOKEN_ADDRESS || "0x9Ce50706CD0F73bB5502b7AA0a8cD17D8513de83",
  REPUTATION_SYSTEM: import.meta.env.VITE_REPUTATION_SYSTEM_ADDRESS || "0xF158be31A900cA8B2Be13BBd22D9d81E64764DBC",
  REVIEW_STAKING: import.meta.env.VITE_REVIEW_STAKING_ADDRESS || "0xCd9352bFBCDfAB07EE8e664A64ECe191c1836180",
  REVIEW_PLATFORM: import.meta.env.VITE_REVIEW_PLATFORM_ADDRESS || "0x40C11dF88eEf1B1276978b750e315E49A929D10d",
} as const;

export const NETWORK_CONFIG = {
  RPC_URL: import.meta.env.VITE_MONAD_RPC_URL || "https://testnet-rpc.monad.xyz",
  CHAIN_ID: Number(import.meta.env.VITE_CHAIN_ID) || 10143,
} as const;

