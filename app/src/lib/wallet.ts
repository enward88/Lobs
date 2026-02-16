import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";

export const RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";

export const walletAdapters = [new PhantomWalletAdapter()];
