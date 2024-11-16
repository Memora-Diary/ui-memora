import Image from "next/image";
import { Nouns } from "../dashboard/types/CreateActionTypes";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

interface NftActionProps {
  metadata: Nouns;
  dataFarcaster: any | null;
  handleWriteContract: () => void;
  isWritePending: boolean;
  isConfirming: boolean;
  hash: string | undefined;
}

export default function NftAction({
  metadata,
  dataFarcaster,
  handleWriteContract,
  isWritePending,
  isConfirming,
  hash,
}: NftActionProps) {
  
  const { primaryWallet } = useDynamicContext();

  const chain = primaryWallet?.getNetwork()

  console.log("chain", chain)

  // from the user I want to get the chain that hes connected


  return (
    <div className=" bg-lisabona-700 h-fit w-full rounded-xl p-10 flex flex-col gap-y-10">
      <div className="rounded-xl   h-fit w-full block">
        <Image
          alt="nft-action"
          width={0}
          height={0}
          sizes="100vw"
          className="rounded-xl h-fit w-full"
          src={String(metadata.imageSrc)}
        ></Image>
      </div>

      <div id="card-content" className="flex flex-col gap-y-5">
        <div className="flex flex-row justify-between">
          <h1 className="text-white py-1 justify-start">Heirary NFT</h1>
          <p className="rounded-xl bg-[#FF9100] text-lisabona-900 px-2 py-1 text-center">
            {chain?.name || 'Unknown Network'}
          </p>
        </div>

        <div className="flex flex-row gap-3">
          <div className="rounded-xl h-[50px] w-[50px] block">
            <Image
              alt="avatar"
              width={50}
              height={50}
              className="rounded-xl"
              src="https://themesflat.co/html/axiesv/assets/images/avatar/avt-2.jpg"
            ></Image>
          </div>

          <div className="flex flex-col m-0">
            <h2 className="">Owned By</h2>
            <h2 className="text-white">
              {dataFarcaster?.displayName || "Anonymous User"}
            </h2>
          </div>
        </div>

        <div className="justify-center text-center">
          <button
            onClick={() => handleWriteContract()}
            disabled={isWritePending || isConfirming}
            className={`inline-block w-full ${
              isWritePending || isConfirming ? "opacity-50" : ""
            } rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark`}
          >
            {isWritePending
              ? "Preparing..."
              : isConfirming
              ? "Confirming txn..."
              : "Mint"}
            <div></div>
          </button>

          {hash && isConfirming && (
            <div className="pt-3">
              <a
                href={`${chain?.blockExplorers?.default?.url}/tx/${hash}`}
                className="hover:text-accent text-white mt-5"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on {chain?.blockExplorers?.default?.name || 'block explorer'}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
