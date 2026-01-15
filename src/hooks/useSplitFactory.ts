import { useCallback } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { readContract, multicall } from "wagmi/actions";
import { Address, formatEther } from "viem";
import { SPLIT_CONTRACT_ABI, config } from "@/lib/wagmi";
import { celo, base, baseSepolia } from "wagmi/chains";
import { celoSepolia } from "@/lib/wagmi";
import SPLIT_BASE_MAINNET_FACTORY_ABI from "@/lib/SPLIT_BASE_MAINNET_FACTORY_ABI.json";
import SPLIT_BASE_SEPOLIA_FACTORY_ABI from "@/lib/SPLIT_BASE_SEPOLIA_FACTORY_ABI.json";
import SPLIT_CELO_MAINNET_FACTORY_ABI from "@/lib/SPLIT_CELO_MAINNET_FACTORY_ABI.json";
import SPLIT_CELO_SEPOLIA_FACTORY_ABI from "@/lib/SPLIT_CELO_SEPOLIA_FACTORY_ABI.json";
import SPLIT_BASE_MAINNET_CONTRACT_ABI from "@/lib/SPLIT_BASE_MAINNET_CONTRACT_ABI.json";
import SPLIT_CELO_MAINNET_CONTRACT_ABI from "@/lib/SPLIT_CELO_MAINNET_CONTRACT_ABI.json";

const FACTORY_ADDRESS_CELO_MAINNET = process.env
  .NEXT_PUBLIC_FACTORY_ADDRESS_CELO_MAINNET as Address;
const FACTORY_ADDRESS_BASE_MAINNET = process.env
  .NEXT_PUBLIC_FACTORY_ADDRESS_BASE_MAINNET as Address;
const FACTORY_ADDRESS_CELO_SEPOLIA = process.env
  .NEXT_PUBLIC_FACTORY_ADDRESS_CELO_SEPOLIA as Address;
const FACTORY_ADDRESS_BASE_SEPOLIA = process.env
  .NEXT_PUBLIC_FACTORY_ADDRESS_BASE_SEPOLIA as Address;

export interface SplitInfo {
  address: Address;
  token: Address;
  createdAt: number;
  creator: Address;
}

export function useSplitFactory() {
  // Get current chain to determine which contract address and ABI to use
  const { chain } = useAccount();
  const isOnCeloMainnet = chain?.id === celo.id;
  const isOnBaseMainnet = chain?.id === base.id;
  const isOnCeloSepolia = chain?.id === celoSepolia.id;
  const isOnBaseSepolia = chain?.id === baseSepolia.id;

  let FACTORY_ADDRESS: Address;
  let FACTORY_ABI: any;

  if (isOnCeloMainnet) {
    FACTORY_ADDRESS = FACTORY_ADDRESS_CELO_MAINNET;
    FACTORY_ABI = SPLIT_CELO_MAINNET_FACTORY_ABI;
  } else if (isOnBaseMainnet) {
    FACTORY_ADDRESS = FACTORY_ADDRESS_BASE_MAINNET;
    FACTORY_ABI = SPLIT_BASE_MAINNET_FACTORY_ABI;
  } else if (isOnCeloSepolia) {
    FACTORY_ADDRESS = FACTORY_ADDRESS_CELO_SEPOLIA;
    FACTORY_ABI = SPLIT_CELO_SEPOLIA_FACTORY_ABI;
  } else if (isOnBaseSepolia) {
    FACTORY_ADDRESS = FACTORY_ADDRESS_BASE_SEPOLIA;
    FACTORY_ABI = SPLIT_BASE_SEPOLIA_FACTORY_ABI;
  } else {
    // Default to Celo mainnet
    FACTORY_ADDRESS = FACTORY_ADDRESS_CELO_MAINNET;
    FACTORY_ABI = SPLIT_CELO_MAINNET_FACTORY_ABI;
  }

  // console.log("Current chain:", chain?.name, chain?.id);
  // console.log("Using factory address:", FACTORY_ADDRESS);
  // console.log("Is on Base Sepolia:", isOnBaseSepolia);

  // Determine which split contract ABI to use based on chain
  const getSplitContractABI = useCallback(() => {
    if (isOnCeloMainnet || isOnCeloSepolia) {
      return SPLIT_CELO_MAINNET_CONTRACT_ABI;
    }
    return SPLIT_BASE_MAINNET_CONTRACT_ABI;
  }, [isOnCeloMainnet, isOnCeloSepolia]);

  // Read functions
  const { data: totalSplitsCreated, refetch: refetchTotalSplits } =
    useReadContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "totalSplitsCreated",
      chainId: chain?.id,
    });

  // Function to fetch all splits from the factory with their token addresses
  const fetchSplits = useCallback(async (): Promise<SplitInfo[]> => {
    try {
      // Refetch to get the latest count
      const { data: latestCount } = await refetchTotalSplits();

      if (!latestCount || latestCount === BigInt(0)) {
        return [];
      }

      const splitCount = Number(latestCount);
      const SPLIT_ABI = getSplitContractABI();

      // Step 1: Fetch all split addresses
      const addressContracts = Array.from({ length: splitCount }, (_, i) => ({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: "splits",
        args: [BigInt(i)],
      }));

      const addressResults = await multicall(config, {
        contracts: addressContracts,
        chainId: chain?.id,
        allowFailure: true,
      });

      const splitAddresses: Address[] = [];
      for (const result of addressResults) {
        if (result.status === "success" && result.result) {
          splitAddresses.push(result.result as Address);
        }
      }

      if (splitAddresses.length === 0) {
        return [];
      }

      // Step 2: Fetch token, createdAt, and splitCreator for each split address
      const detailContracts: any[] = [];
      for (const addr of splitAddresses) {
        detailContracts.push({
          address: addr,
          abi: SPLIT_ABI,
          functionName: "token",
        });
        detailContracts.push({
          address: addr,
          abi: SPLIT_ABI,
          functionName: "createdAt",
        });
        detailContracts.push({
          address: addr,
          abi: SPLIT_ABI,
          functionName: "splitCreator",
        });
      }

      const detailResults = await multicall(config, {
        contracts: detailContracts,
        chainId: chain?.id,
        allowFailure: true,
      });

      // Parse results: every 3 results correspond to one split (token, createdAt, splitCreator)
      const splitsInfo: SplitInfo[] = [];
      for (let i = 0; i < splitAddresses.length; i++) {
        const tokenResult = detailResults[i * 3];
        const createdAtResult = detailResults[i * 3 + 1];
        const creatorResult = detailResults[i * 3 + 2];

        const tokenAddr =
          tokenResult.status === "success"
            ? (tokenResult.result as Address)
            : ("0x0000000000000000000000000000000000000000" as Address);

        const createdAtValue =
          createdAtResult.status === "success"
            ? Number(createdAtResult.result)
            : Math.floor(Date.now() / 1000);

        const creatorAddr =
          creatorResult.status === "success"
            ? (creatorResult.result as Address)
            : ("0x0000000000000000000000000000000000000000" as Address);

        splitsInfo.push({
          address: splitAddresses[i],
          token: tokenAddr,
          createdAt: createdAtValue,
          creator: creatorAddr,
        });
      }

      return splitsInfo;
    } catch (error) {
      console.error("Failed to fetch splits:", error);
      return [];
    }
  }, [
    FACTORY_ADDRESS,
    FACTORY_ABI,
    chain?.id,
    getSplitContractABI,
    refetchTotalSplits,
  ]);

  // Write functions
  const {
    writeContractAsync,
    data: hash,
    isPending: isCreating,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const createSplit = async (
    token: Address,
    recipients: Address[],
    percentages: bigint[]
  ) => {
    try {
      const result = await writeContractAsync({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: "createSplit",
        args: [token, recipients, percentages],
      });
      return result;
    } catch (error) {
      console.error("Failed to create split:", error);
      throw error;
    }
  };

  return {
    totalSplitsCreated: totalSplitsCreated as bigint | undefined,
    createSplit,
    fetchSplits,
    isCreating,
    isConfirming,
    isConfirmed,
    hash,
  };
}
