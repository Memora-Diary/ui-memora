// ClientWrapper.tsx
"use client";

import { AuthProvider } from "@/context/AuthContext";
import { SocialProvider } from "@/context/SocialContext";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import Headers from "@/components/headers";
import DarkMode from "@/components/common/DarkMode";
import { createConfig, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, defineChain, } from "viem";
// import { rootstockTestnet } from 'viem/chains';
import { ALLOWED_SOCIAL_PROVIDERS } from "@/context/SocialContext";



// const evmNetworks = [
//   {
//     blockExplorerUrls: ["https://explorer.testnet.rsk.co"],
//     chainId: 31,
//     chainName: "RSK Testnet",
//     iconUrls: ["https://ethglobal.b-cdn.net/organizations/ggpyp/square-logo/default.png"],
//     name: "RSK",
//     nativeCurrency: {
//       name: "RSK Smart Bitcoin",
//       symbol: "tRBTC",
//       decimals: 18,
//     },
//     networkId: 31,
//     rpcUrls: ["https://rpc.testnet.rootstock.io/4MmYWv9uFySkJ1CSYQdKRIFfOa7oPa-T"],
//     vanityName: "RSK Testnet",
//   },
// ];


const rskTestnet = defineChain({
  id: 31,
  name: "RSK Testnet",
  network: "rsk-testnet",
  nativeCurrency: {
    name: "RSK Smart Bitcoin",
    symbol: "tRBTC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.rootstock.io/4MmYWv9uFySkJ1CSYQdKRIFfOa7oPa-T"],
    },
    public: {
      http: ["https://rpc.testnet.rootstock.io/4MmYWv9uFySkJ1CSYQdKRIFfOa7oPa-T"],
    },
  },
  blockExplorers: {
    default: { name: "RSK Explorer", url: "https://explorer.testnet.rsk.co" },
  },
  testnet: true,
});


const polygonTestnet = defineChain({
  id: 80002,
  name: "Polygon Amoy Testnet",
  network: "polygonAmoy",
  nativeCurrency: {
    name: "Polygon Amoy Testnet",
    symbol: "POL",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc-amoy.polygon.technology/"],
    },
    public: {
      http: ["https://rpc-amoy.polygon.technology/"],
    },
  },
  blockExplorers: {
    default: { name: "B", url: "https://amoy.polygonscan.com/" },
  },

  testnet: true,
});

const sepoliaTestnet = defineChain({
  id: 11155111,
  name: 'Sepolia',
  network: 'sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Sepolia Ether',
    symbol: 'SEth',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia.org'],
    },
    public: {
      http: ['https://rpc.sepolia.org'],
    },
  },
  blockExplorers: {
    default: { name: 'Sepolia Scan', url: 'https://sepolia.etherscan.io' },
  },
  testnet: true,
});


const evmNetworks = [
  {
    blockExplorerUrls: ["https://amoy.polygonscan.com/"],
    chainId: 80002,
    chainName: "Polygon Amoy Testnet",
    iconUrls: ["https://ethglobal.b-cdn.net/organizations/qy8m3/square-logo/default.png"],
    name: "POL",
    nativeCurrency: {
      name: "Polygon Amoy Testnet",
      symbol: "POL",
      decimals: 18,
    },
    networkId: 80002,
    rpcUrls: ["https://rpc-amoy.polygon.technology/"],
    vanityName: "Polygon Amoy Testnet",
  },
  {
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
    chainId: 11155111,
    chainName: "Sepolia",
    iconUrls: ["https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/6ed5f/eth-diamond-black.webp"],
    name: "Sepolia",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "SEth",
      decimals: 18,
    },
    networkId: 11155111,
    rpcUrls: ["https://rpc.sepolia.org"],
    vanityName: "Sepolia Testnet",
  }
];

export const wagmiConfig = createConfig({
  chains: [polygonTestnet, rskTestnet, sepoliaTestnet],
  multiInjectedProviderDiscovery: true,
  transports: {
    [polygonTestnet.id]: http(),
    [rskTestnet.id]: http(),
    [sepoliaTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export const dynamicConfig = {
  environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "",
  walletConnectors: [EthereumWalletConnectors],
  overrides: { evmNetworks },
  socialProvidersFilter: (_providers: string[]) => ALLOWED_SOCIAL_PROVIDERS,
};

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DynamicContextProvider
      settings={dynamicConfig}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            <AuthProvider>
              <SocialProvider>
                <DarkMode />
                <Headers />
                {children}
              </SocialProvider>
            </AuthProvider>
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
