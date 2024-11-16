"use client"
import { useEffect, useState, useCallback } from "react";
import Headers from "@/components/headers";
import Footers from "@/components/footers";
import Collections from "@/components/dashboard/collections";
import { useSocial } from "@/context/SocialContext";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useAccount, useReadContract } from "wagmi";
import { Address, getAddress, formatEther } from "viem";
import { readContract } from "wagmi/actions";
import MemoraABI from "@/data/MEMORA_ABI.json";
import { wagmiConfig } from "@/components/clientwrapper";
import { NFTData, RawNFTData } from "@/components/dashboard/types/ActiveLegacyTypes";
import Modal from "@/components/modal";
import CreateAction from "@/components/dashboard/CreateAction";
import toast from "react-hot-toast";

// Add utility function for conversion
const convertRBTCToUSD = (rbtcWei: bigint | number): number => {
  // Convert from wei to RBTC
  const rbtcAmount = Number(formatEther(BigInt(rbtcWei || 0)));
  // Assuming 1 RBTC = $50,000 (you should get this from an API in production)
  const rbtcPrice = 50000;
  return rbtcAmount * rbtcPrice;
};

const formatUSD = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export default function Dashboard() {
  const { connectedSocials } = useSocial();
  const { setShowAuthFlow } = useDynamicContext();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [nftDetails, setNftDetails] = useState<NFTData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useAccount();

  // Get checksum address for the contract
  const checksumAddress: Address = getAddress(
    process.env.NEXT_PUBLIC_MEMORA_CONTRACT_ADDRESS as `0x${string}`
  );

  // Fetch NFT IDs
  const { data: nftIds, refetch } = useReadContract({
    address: checksumAddress,
    abi: MemoraABI,
    functionName: "getNFTsMintedByOwner",
    args: [address as Address],
  });

  // Fetch NFT details function
  const fetchNFTDetails = async (id: bigint): Promise<NFTData | null> => {
    try {
      const result = (await readContract(wagmiConfig, {
        address: checksumAddress,
        abi: MemoraABI,
        functionName: "tokenInfo",
        args: [id],
      })) as RawNFTData;

      const response = await fetch(result[9]);
      const metadata = await response.json();

      if (result) {
        return {
          id,
          judge: result[0],
          heir: result[1],
          isTriggerDeclared: result[2],
          isHeirSigned: result[3],
          minter: result[4],
          prompt: result[5],
          actions: result[6],
          triggerTimestamp: result[7],
          balance: result[8],
          uri: result[9],
          image: metadata.image,
        };
      }
    } catch (error) {
      console.error(`Error fetching details for NFT ${id}:`, error);
    }
    return null;
  };

  // Refresh NFTs function
  const refreshNFTs = async () => {
    const toastId = toast.loading("Refreshing workflows...");
    setIsLoading(true);
    try {
      await refetch();
      if (nftIds && Array.isArray(nftIds)) {
        const details = await Promise.all(
          nftIds.map((id) => fetchNFTDetails(id))
        );
        setNftDetails(details.filter((data): data is NFTData => data !== null));
      }
      toast.success("Workflows refreshed successfully!", { id: toastId });
    } catch (error) {
      console.error("Error refreshing workflows:", error);
      toast.error("Failed to refresh workflows", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    refreshNFTs();
  }, [nftIds]);

  // Calculate stats
  const stats = {
    activeWorkflows: nftDetails.length,
    pendingTriggers: nftDetails.filter(nft => !nft.isTriggerDeclared).length,
    lockedValue: nftDetails.reduce((acc, nft) => {
      if (!nft.isTriggerDeclared) {
        const usdValue = convertRBTCToUSD(nft.balance || 0);
        return acc + usdValue;
      }
      return acc;
    }, 0),
    lockedRBTC: Number(nftDetails.reduce((acc, nft) => 
      !nft.isTriggerDeclared ? acc + Number(formatEther(BigInt(nft.balance || 0))) : acc, 0
    ).toFixed(4)),
    releasedValue: nftDetails.reduce((acc, nft) => {
      if (nft.isTriggerDeclared) {
        const usdValue = convertRBTCToUSD(nft.balance || 0);
        return acc + usdValue;
      }
      return acc;
    }, 0),
    releasedRBTC: Number(nftDetails.reduce((acc, nft) => 
      nft.isTriggerDeclared ? acc + Number(formatEther(BigInt(nft.balance || 0))) : acc, 0
    ).toFixed(4))
  };

  const statsCards = [
    { 
      label: "Active Workflows", 
      value: stats.activeWorkflows.toString(), 
      color: "from-green-500 to-green-600" 
    },
    { 
      label: "Locked Value", 
      value: formatUSD(stats.lockedValue),
      subValue: `${stats.lockedRBTC} RBTC`,
      color: "from-blue-500 to-blue-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
      )
    },
    { 
      label: "Released Value", 
      value: formatUSD(stats.releasedValue),
      subValue: `${stats.releasedRBTC} RBTC`,
      color: "from-purple-500 to-purple-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
        </svg>
      )
    }
  ];

  return (
    <>
      <Headers />
      <main className="min-h-screen bg-gradient-to-b from-lisabona-900 to-lisabona-800">
        <div className="container mx-auto px-4">
          {/* Dashboard Header */}
          <div className="pt-24 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Workflow Dashboard</h1>
                <p className="text-lisabona-200">Manage your conditional workflows and triggers</p>
              </div>
              
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-accent hover:bg-accent-dark rounded-xl text-white font-semibold transition-all flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Workflow
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {statsCards.map((stat, index) => (
              <div key={index} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-10 group-hover:opacity-15 rounded-2xl transition-opacity duration-300`} />
                <div className="relative p-6 bg-lisabona-800/50 backdrop-blur-sm rounded-2xl border border-lisabona-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lisabona-200">{stat.label}</h3>
                    {stat.icon && <span>{stat.icon}</span>}
                  </div>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  {stat.subValue && (
                    <p className="text-sm text-lisabona-300 mt-1">{stat.subValue}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="bg-lisabona-800/50 backdrop-blur-sm rounded-2xl border border-lisabona-700 p-6">
            {connectedSocials || true ? (
              <Collections 
                nftDetails={nftDetails} 
                isLoading={isLoading}
                onRefresh={refreshNFTs}
              />
            ) : (
              <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-white mb-4">Connect to Get Started</h2>
                <p className="text-lisabona-200 mb-8">Connect your account to start creating conditional workflows.</p>
                <button 
                  onClick={() => setShowAuthFlow(true)}
                  className="px-6 py-3 bg-accent hover:bg-accent-dark rounded-xl text-white font-semibold transition-all"
                >
                  Connect Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Create Workflow Modal */}
        {isCreateModalOpen && (
          <Modal onClose={() => setIsCreateModalOpen(false)}>
            <div className="max-h-[80vh] overflow-y-auto w-full lg:w-[800px]">
              <CreateAction onSuccess={() => {
                setIsCreateModalOpen(false);
                refreshNFTs();
              }} />
            </div>
          </Modal>
        )}
      </main>
      <Footers />
    </>
  );
}