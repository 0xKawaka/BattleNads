import { defineChain } from "viem";

// TODO: Add Chain details here.
export const monadDevnet = defineChain({
  id: Number(process.env.NEXT_PUBLIC_MONAD_CHAIN_ID) || 1,
  name: "Monad Devnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_MONAD_EXPLORER_URL || ""],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Devnet Blockscout",
      url: process.env.NEXT_PUBLIC_MONAD_EXPLORER_URL || "",
    },
  },
});