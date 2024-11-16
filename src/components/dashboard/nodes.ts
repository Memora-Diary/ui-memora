import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Image from "next/image";
import { Address, formatEther, getAddress, parseEther } from "viem";
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Node, 
  Edge,
  ConnectionMode,
  Panel,
  ReactFlowProvider,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import MemoraABI from "@/data/MEMORA_ABI.json";
import { wagmiConfig } from "../clientwrapper";
import { readContract } from "wagmi/actions";
import { nounsicon } from "@/data/nouns";
import { actionTypes } from "./CreateAction";
import { NFTData, RawNFTData } from "./types/ActiveLegacyTypes";
import toast, { Toaster } from "react-hot-toast";
import Modal from "@/components/modal";
import { useSocial } from "@/context/SocialContext";
import { DollarSign, RefreshCcw } from "lucide-react";
import CreateAction from "./CreateAction";

// Add this mock data at the top of the file, after imports
const mockMemoras = [
  {
    id: "1",
    image: "https://memoraapi.bitnata.com/earth.png",
    triggers: [
      {
        condition: "When I get married",
        status: true,
        weight: 0.8,
      },
      {
        condition: "When I buy a house",
        weight: 0.4,
        operator: "AND"
      }
    ],
    action: 2, // Transfer Bitcoin
    balance: BigInt("192000000000000"),
    heir: "0x6E7F6b8FF026FDad80566D02D8e8CB768faEA910",
    isHeirSigned: false,
    isTriggerDeclared: false,
    judge: "0x843E73b0143F4A7DeBF05a9646917787B06f3A46",
    minter: "0x399F56CD72CA88f3873b3698A395083A44a9A641",
    triggerTimestamp: BigInt(0),
  },
  {
    id: "2",
    image: "https://memoraapi.bitnata.com/earth.png",
    triggers: [
      {
        condition: "When I pass away",
        status: false,
        weight: 1.0,
      }
    ],
    action: 0, // Manage Account
    balance: BigInt(0),
    heir: "0x7F6b8FF026FDad80566D02D8e8CB768faEA910ab",
    isHeirSigned: false,
    isTriggerDeclared: false,
    judge: "0x843E73b0143F4A7DeBF05a9646917787B06f3A46",
    minter: "0x399F56CD72CA88f3873b3698A395083A44a9A641",
    triggerTimestamp: BigInt(0),
  },
  {
    id: "3",
    image: "https://memoraapi.bitnata.com/earth.png",
    triggers: [
      {
        condition: "When I get a promotion",
        status: true,
        weight: 0.6,
      },
      {
        condition: "When I receive a bonus",
        status: true,
        weight: 0.3,
        operator: "OR"
      },
      {
        condition: "When I complete 5 years at the company",
        status: false,
        weight: 0.1,
        operator: "AND"
      }
    ],
    action: 1, // Close Account
    balance: BigInt(0),
    heir: "0x8FF026FDad80566D02D8e8CB768faEA910ab7F6b",
    isHeirSigned: false,
    isTriggerDeclared: false,
    judge: "0x843E73b0143F4A7DeBF05a9646917787B06f3A46",
    minter: "0x399F56CD72CA88f3873b3698A395083A44a9A641",
    triggerTimestamp: BigInt(0),
  }
];

// First, let's create a separate TriggerNode component
const TriggerNode = React.memo(({ data }: { data: any }) => {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md ${
      data.status ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'
    } border-2`}>
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Bottom} id="bottom" />
      
      <div className="text-sm text-lisabona-500 dark:text-lisabona-300">
        {data.condition}
      </div>
    </div>
  );
});

TriggerNode.displayName = 'TriggerNode';

// Update the CustomNode component to include all handles
const CustomNode = React.memo(({ data }: { data: any }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white dark:bg-lisabona-700 border-2 border-lisabona-100 dark:border-lisabona-600">
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="target" position={Position.Left} id="left" />
      
      <div className="flex items-center">
        <div className="rounded-full w-12 h-12 flex items-center justify-center">
          <Image
            src={data.image}
            alt="nft"
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
        <div className="ml-2">
          <div className="text-lg font-bold text-lisabona-700 dark:text-white">
            Heirary #{data.id}
          </div>
          <div className="text-sm text-lisabona-500 dark:text-lisabona-300">
            {actionTypes[data.action].text}
          </div>
        </div>
      </div>

      {data.balance && (
        <div className="mt-2 text-sm text-lisabona-500 dark:text-lisabona-300 flex items-center justify-end gap-1">
          <span>{formatEther(data.balance)} RBTC</span>
          <Image
            width={20}
            height={20}
            alt="btc"
            src="https://i.postimg.cc/cJyjRjgb/btc.webp"
          />
        </div>
      )}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

// Update nodeTypes to include both node types
const nodeTypes = {
  custom: CustomNode,
  trigger: TriggerNode,
};

export default function ActiveLegacy() {
  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    isError: isWriteError,
    error: writeError,
  } = useWriteContract();

  const { socialData } = useSocial();
  // State management
  const [nftDetails] = useState(mockMemoras);
  const [tRBTCAmount, setTRBTCAmount] = useState("");
  const [fundAmount, setFundAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Track the transaction confirmation state
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Get checksum address for the contract
  const checksumAddress: Address = getAddress(
    process.env.NEXT_PUBLIC_MEMORA_CONTRACT_ADDRESS as `0x${string}`
  );

  const { address } = useAccount();

  const { data: nftIds } = useReadContract({
    address: checksumAddress,
    abi: MemoraABI,
    functionName: "getNFTsMintedByOwner",
    args: [address as Address],
  });

  console.log(nftIds, "nftIds");


  // Function to convert USD to tRBTC (mock conversion)
  const convertUSDToTRBTC = (usdAmount: string) => {
    const rate = 0.000016;
    const tRBTC = parseFloat(usdAmount) * rate;
    return tRBTC.toFixed(8);
  };

  // Update tRBTC amount when USD amount changes
  useEffect(() => {
    if (fundAmount) {
      const tRBTC = convertUSDToTRBTC(fundAmount);
      setTRBTCAmount(tRBTC);
    } else {
      setTRBTCAmount("");
    }
  }, [fundAmount]);

  // Handle adding funds to NFT
  const handleAddFunds = async (tokenId: any) => {
    if (!tokenId || !tRBTCAmount) {
      toast.error("Invalid token ID or amount");
      return;
    }
    const toastId = toast.loading("Adding funds...");
    try {
      await writeContract({
        address: checksumAddress,
        abi: MemoraABI,
        functionName: "addFunds",
        args: [tokenId],
        value: parseEther(tRBTCAmount),
      });
      toast.success("Please Approve The Transaction", { id: toastId });
    } catch (error) {
      console.error("Add funds error:", error);
      toast.error(`Failed to add funds`, { id: toastId });
    }
  };

  // Handle adding funds to NFT
  const handleCancelTrigger = async (tokenId: any) => {
    if (!tokenId) {
      toast.error("Invalid token ID");
      return;
    }
    const toastId = toast.loading("Canceling Trigger...");
    try {
      await writeContract({
        address: checksumAddress,
        abi: MemoraABI,
        functionName: "disableTrigger",
        args: [tokenId],
      });
      const body = {
        handle: {
          tokenId: Number(tokenId),
          fid: socialData?.fid,
        },
      };
      toast.success("Please Approve The Transaction", { id: toastId });
      const axiosRequest = await axios.post(
        "https://memoraapi.bitnata.com/finetune-neg",
        body
      );
      console.log(axiosRequest, "ress");
    } catch (error) {
      console.error("Cancel Trigger error:", error);
      toast.error(`Failed to cancel trigger`, { id: toastId });
    }
  };

  // Fetch NFT details for each ID
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

  // Regex to validate input is a valid number (supports integers and decimals)
  const handleFundAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^[0-9]*[.,]?[0-9]*$/; // Regex to allow numbers with optional decimal point

    if (value === "" || regex.test(value)) {
      setFundAmount(value.replace(",", ".")); // Replace comma with dot for decimal consistency
    }
  };

  useEffect(() => {
    const fetchAllNFTDetails = async () => {
      if (nftIds && Array.isArray(nftIds)) {
        const details: NFTData[] | null = [];
        for (const id of nftIds) {
          const nftData: NFTData | null = await fetchNFTDetails(id);
          console.log(nftData, "nftData");
          if (nftData) {
            details.push(nftData);
          }
        }
        setNftDetails(details);
      }
    };
    fetchAllNFTDetails();
  }, [nftIds, checksumAddress]);

  const refreshNFTs = async () => {
    const toastId = toast.loading("Refreshing NFTs...");
    try {
      // Manually fetch the NFT IDs
      const newNftIds = await readContract(wagmiConfig, {
        address: checksumAddress,
        abi: MemoraABI,
        functionName: "getNFTsMintedByOwner",
        args: [address as Address],
      });

      // Fetch details for the new NFT IDs
      if (newNftIds && Array.isArray(newNftIds)) {
        const details = await Promise.all(
          newNftIds.map((id) => fetchNFTDetails(id))
        );
        setNftDetails(details.filter((data): data is NFTData => data !== null));
      }
      toast.success("NFTs refreshed successfully!", { id: toastId });
    } catch (error) {
      console.error("Error refreshing NFTs:", error);
      toast.error("Failed to refresh NFTs", { id: toastId });
    }
  };

  // Open the modal with the selected token ID
  const openModal = (tokenId: any) => {
    setSelectedTokenId(tokenId);
    setIsModalOpen(true);
  };

  // Handle modal close after confirmation or error
  useEffect(() => {
    if (isConfirmed) {
      toast.success("Transaction confirmed!");
      setIsModalOpen(false);
      window.location.reload();
    }
    if (confirmError) {
      toast.error("Transaction failed!");
    }
  }, [isConfirmed, confirmError]);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Update the getNodesAndEdges function to position nodes better
  const getNodesAndEdges = useCallback((nfts: typeof mockMemoras) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Helper function to get edge style based on weight and status
    const getEdgeStyle = (weight: number, status: boolean) => {
      const strokeWidth = 1 + (weight * 4);
      const opacity = 0.2 + (weight * 0.8);
      const baseColor = status ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
      
      return {
        stroke: baseColor,
        strokeWidth,
        opacity,
      };
    };

    nfts.forEach((nft, index) => {
      // Create Heirary node with more horizontal spacing
      const memoraNode: Node = {
        id: `heirary-${nft.id}`,
        type: 'custom',
        position: { 
          x: 600 * index, // Increased spacing between Heirary nodes
          y: 0 
        },
        data: nft,
      };
      nodes.push(memoraNode);

      // Create trigger nodes and edges
      nft.triggers.forEach((trigger, triggerIndex) => {
        const triggerId = `trigger-${nft.id}-${triggerIndex}`;
        nodes.push({
          id: triggerId,
          type: 'trigger',
          position: { 
            x: 600 * index + (triggerIndex % 2 ? 150 : -150), // Adjusted trigger positioning
            y: 150 + (Math.floor(triggerIndex / 2) * 100)
          },
          data: trigger,
        });

        // Add edge from trigger to Heirary
        const edgeStyle = getEdgeStyle(trigger.weight, trigger.status);
        edges.push({
          id: `edge-${triggerId}`,
          source: triggerId,
          target: `heirary-${nft.id}`,
          sourceHandle: 'top',
          targetHandle: 'bottom',
          animated: true,
          style: edgeStyle,
          type: 'smoothstep',
          label: `${trigger.operator || 'INITIAL'} (${(trigger.weight * 100).toFixed(0)}%)`,
          labelStyle: { 
            fill: trigger.status ? '#22c55e' : '#ef4444',
            fontWeight: 500,
            fontSize: 12,
          },
          labelBgStyle: { 
            fill: '#18181b',
            fillOpacity: 0.7,
            rx: 4,
            ry: 4,
          },
        });
      });

      // Add edges between Heirary nodes if needed
      if (index > 0) {
        edges.push({
          id: `heirary-edge-${index}`,
          source: `heirary-${nfts[index - 1].id}`,
          target: `heirary-${nft.id}`,
          sourceHandle: 'right',
          targetHandle: 'left',
          animated: true,
          style: { 
            stroke: '#6366f1',
            strokeWidth: 1,
            opacity: 0.5,
          },
          type: 'smoothstep',
        });
      }
    });

    return { nodes, edges };
  }, []);

  // Replace nodes and edges state with useNodesState and useEdgesState
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Add connection handler
  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Update the effect that sets nodes and edges
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = getNodesAndEdges(nftDetails);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [nftDetails, getNodesAndEdges]);

  return (
    <div>
      <div className="flex flex-col flex-wrap justify-center">
        <div className="flex flex-row text-center justify-end m-0 pb-5 gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-2 bg-accent text-white rounded-lg hover:bg-accent-dark flex flex-row gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              className="h-5 w-5 fill-current"
            >
              <path fill="none" d="M0 0h24v24H0z" />
              <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
            </svg>
            Create Heirary
          </button>
          <button
            onClick={() => refreshNFTs()}
            className="p-2 bg-blue text-white rounded-lg hover:bg-opacity-70 flex flex-row gap-1"
          >
            <RefreshCcw />
            Refresh
          </button>
        </div>

        {isMobile ? (
          // Original card view for mobile
          <div className="flex flex-row flex-wrap gap-5 justify-center">
            {nftDetails.map((item, i) => (
              <article
                key={i}
                className="block rounded-2.5xl border border-lisabona-100 bg-white p-[1.1875rem] transition-shadow hover:shadow-lg dark:border-lisabona-700 dark:bg-lisabona-700"
              >
                <figure className="relative">
                  <div>
                    <Image
                      width={120}
                      height={120}
                      src={item.image}
                      alt={`heirary#${item.id}`}
                      className="w-full rounded-[0.625rem]"
                      loading="lazy"
                    />
                  </div>
                </figure>
                <div className="mt-7 flex items-center justify-between">
                  <div>
                    <span className="font-display text-base text-lisabona-700 hover:text-accent dark:text-white">
                      {`heirary #${item.id}`}
                    </span>
                  </div>
                  {item.isTriggerDeclared ? (
                    <p className=" rounded-xl bg-orange text-lisabona-900 px-2 py-1 text-center text-sm">
                      Triggered
                    </p>
                  ) : (
                    <p className=" rounded-xl bg-green text-lisabona-900 px-2 py-1 text-center text-sm">
                      Live
                    </p>
                  )}
                </div>
                <div className="mt-2 text-sm">
                  <span className="mr-1 text-lisabona-700 dark:text-lisabona-200">
                    Prompt:
                  </span>
                  <span className="text-lisabona-500 dark:text-lisabona-300">
                    {item.prompt}
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  <span className="mr-1 text-lisabona-700 dark:text-lisabona-200">
                    Action:
                  </span>
                  <span className="text-lisabona-500 dark:text-lisabona-300">
                    {actionTypes[item.actions].text}
                  </span>
                </div>
                <div className="mt-2 text-sm max-w-xs">
                  <span className="mr-1 text-lisabona-700 dark:text-lisabona-200">
                    Address Inherited:
                  </span>
                  <span className="text-lisabona-500 dark:text-lisabona-300 break-all">
                    {item.heir}
                  </span>
                </div>
                {actionTypes[item.actions].text === "Transfer Bitcoin" && (
                  <>
                    <div className="w-full flex justify-end">
                      <div className="flex flex-row items-center gap-1">
                        <span className="text-white">
                          {item.balance ? formatEther(item.balance) : "0"} RBTC
                        </span>
                        <Image
                          width={30}
                          height={30}
                          alt="btc"
                          src={"https://i.postimg.cc/cJyjRjgb/btc.webp"}
                        />
                      </div>
                    </div>

                    {!item.isTriggerDeclared && (
                      <div className="mt-5 flex items-center">
                        <div className="group flex items-center w-full">
                          <button
                            onClick={() => openModal(item.id)}
                            className={`inline-block w-full rounded-full bg-green py-3 px-8 text-center font-semibold text-white transition-all hover:bg-accent-dark`}
                          >
                            Add Funds
                          </button>
                        </div>
                      </div>
                    )}
                    {item.isTriggerDeclared ? (
                      <div className="mt-5 flex items-center">
                        <div className="group flex items-center w-full">
                          <button
                            onClick={() => handleCancelTrigger(item.id)}
                            className={`inline-block w-full rounded-full bg-red border border-white/20 py-3 px-8 text-center font-semibold text-white transition-all hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#0b0b1e] ${
                              isWritePending || isConfirming
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={isWritePending || isConfirming}
                          >
                            {isWritePending || isConfirming
                              ? "Processing..."
                              : "Cancel Trigger"}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </article>
            ))}
            <Toaster />
          </div>
        ) : (
          // Wrap ReactFlow with ReactFlowProvider
          <ReactFlowProvider>
            <div style={{ height: '70vh', width: '100%' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                connectionMode={ConnectionMode.Loose}
                fitView
                minZoom={0.5}
                maxZoom={1.5}
                defaultEdgeOptions={{
                  type: 'smoothstep',
                  animated: true,
                }}
              >
                <Background />
                <Controls />
                <MiniMap 
                  nodeColor={(node) => {
                    if (node.type === 'trigger') {
                      return node.data.status ? '#22c55e' : '#ef4444';
                    }
                    return '#6366f1';
                  }}
                  style={{
                    backgroundColor: '#0b0b1e', // Dark background matching the project
                    border: '1px solid rgba(255, 255, 255, 0.1)', // Subtle border
                  }}
                  maskColor="rgba(11, 11, 30, 0.6)" // Darker version of the background
                  className="rounded-lg shadow-xl" // Rounded corners and shadow
                />
                <Panel position="top-left" className="dark:bg-lisabona-700 p-2 rounded-lg">
                  <h3 className="text-lg font-bold dark:text-white">My Heirary NFTs</h3>
                </Panel>
              </ReactFlow>
            </div>
          </ReactFlowProvider>
        )}
      </div>

      {isModalOpen && selectedTokenId && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className="p-6">
            <h2 className="text-white text-center text-lg font-semibold mb-4">
              Add Funds to Heirary #{selectedTokenId}
            </h2>
            <div className="mb-6">
              <label
                htmlFor="fund-amount"
                className="mb-2 block font-display text-white"
              >
                Amount to transfer (in USD)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="fund-amount"
                  className="w-full rounded-lg border-lisabona-100 py-3 pl-10 pr-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent dark:border-lisabona-600 dark:bg-lisabona-700 dark:text-white dark:placeholder:text-lisabona-300"
                  placeholder="Enter amount in USD"
                  value={fundAmount}
                  onChange={handleFundAmountChange}
                />
              </div>
              {tRBTCAmount && (
                <p className="mt-2 text-sm text-lisabona-500 dark:text-lisabona-300">
                  Equivalent: {tRBTCAmount} tRBTC
                </p>
              )}
            </div>
            <button
              onClick={() => handleAddFunds(selectedTokenId)}
              className={`w-full rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark ${
                isWritePending || isConfirming
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={isWritePending || isConfirming}
            >
              {isWritePending || isConfirming ? "Processing..." : "Submit"}
            </button>
          </div>
        </Modal>
      )}

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
    </div>
  );
}