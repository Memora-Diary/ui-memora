import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Address, formatEther, getAddress } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import MemoraABI from "@/data/MEMORA_ABI.json";
import { wagmiConfig } from "../clientwrapper";
import { readContract, writeContract } from "wagmi/actions";
import { nounsicon } from "@/data/nouns";
import { actionTypes } from "./CreateAction";
import { NFTData, RawNFTData } from "./types/ActiveLegacyTypes";
import toast, { Toaster } from "react-hot-toast";
import { RefreshCcw } from "lucide-react";

export default function Inherited() {
  const [nftDetails, setNftDetails] = useState<NFTData[]>([]);
  const checksumAddress: Address = getAddress(
    process.env.NEXT_PUBLIC_MEMORA_CONTRACT_ADDRESS as `0x${string}`
  );
  const { address } = useAccount();

  const { data: nftIds, refetch } = useReadContract({
    address: checksumAddress,
    abi: MemoraABI,
    functionName: "getAllNFTsForHeir",
    args: [address as Address],
  });

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

  useEffect(() => {
    const fetchAllNFTDetails = async () => {
      if (nftIds && Array.isArray(nftIds)) {
        const details: NFTData[] | null = [];
        for (const id of nftIds) {
          const nftData: NFTData | null = await fetchNFTDetails(id);

          console.log(nftData);
          if (nftData) {
            details.push(nftData);
          }
        }
        setNftDetails(details);
      }
    };
    fetchAllNFTDetails();
  }, [nftIds]);

  const refreshNFTs = async () => {
    const toastId = toast.loading("Refreshing NFTs...");
    try {
      // Manually fetch the NFT IDs
      const newNftIds = await readContract(wagmiConfig, {
        address: checksumAddress,
        abi: MemoraABI,
        functionName: "getAllNFTsForHeir",
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

  const {
    writeContract,
    data: hash,
    isError: isWriteError,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
    data: transactionReceipt,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const handleClaimNFT = async (tokenId: bigint | null) => {
    if (!tokenId) return;
    const toastId = toast.loading("Preparing transaction...");
    try {
      const result = await writeContract({
        address: checksumAddress,
        abi: MemoraABI,
        functionName: "heirSign",
        args: [tokenId],
      });

      toast.loading("Transaction submitted. Waiting for confirmation...", {
        id: toastId,
      });
    } catch (error) {
      console.error("Contract write error:", error);
      toast.error(`Failed to send transaction`, { id: toastId });
    }
  };

  useEffect(() => {
    if (isWriteError) {
      toast.dismiss();
      toast.error(`Write error: ${writeError?.name}`);
    }
  }, [isWriteError, writeError]);

  useEffect(() => {
    if (isConfirmed && transactionReceipt) {
      toast.dismiss();
      console.log("Transaction confirmed:", transactionReceipt);
      toast.success("NFT claim successfully!");
    } else if (confirmError) {
      toast.dismiss();
      toast.error(`Transaction failed: ${confirmError.message}`);
    }
  }, [isConfirmed, confirmError, transactionReceipt]);

  return (
    <div className="flex flex-col flex-wrap justify-center">
      <div className="flex flex-row text-center justify-end m-0 pb-5">
        <button
          onClick={() => refreshNFTs()}
          className="p-2 bg-blue text-white rounded-lg hover:bg-opacity-70 flex flex-row gap-1"
        >
          <RefreshCcw />
          Refresh
        </button>
      </div>
      <div className="flex flex-row flex-wrap gap-5 justify-center">
        {nftDetails.map((item, i) => (
          <article
            key={i}
            className="block rounded-2.5xl border border-lisabona-100 bg-white p-[1.1875rem] transition-shadow hover:shadow-lg dark:border-lisabona-700 dark:bg-lisabona-700"
          >
            <figure className="relative">
              <div>
                <Image
                  width={230}
                  height={230}
                  src={item.image || nounsicon[0].imageSrc}
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
              {/* {item.isTriggerDeclared ? <p className=" rounded-xl bg-orange text-lisabona-900 px-2 py-1 text-center text-sm">Triggered</p> : 
                        <p className=" rounded-xl bg-blue text-lisabona-900 px-2 py-1 text-center text-sm">Pending</p>} */}
              {!item.isTriggerDeclared && !item.isHeirSigned ? (
                <p className="rounded-xl bg-blue text-lisabona-900 px-2 py-1 text-center text-sm">
                  Pending
                </p>
              ) : item.isTriggerDeclared && !item.isHeirSigned ? (
                <p className="rounded-xl bg-orange text-lisabona-900 px-2 py-1 text-center text-sm">
                  Triggered
                </p>
              ) : (
                <p className="rounded-xl bg-green text-lisabona-900 px-2 py-1 text-center text-sm">
                  Claimed
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
              </>
            )}

            <div className="mt-5 flex items-center">
              {item.isTriggerDeclared && !item.isHeirSigned && (
                <div className="group flex items-center w-full">
                  <button
                    onClick={() => handleClaimNFT(item.id)}
                    className="font-display text-sm font-semibold group-hover:text-white dark:text-lisabona-700 bg-accent hover:bg-opacity-35 rounded-lg p-2"
                  >
                    Claim NFT
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
        <Toaster />
      </div>
    </div>
  );
}