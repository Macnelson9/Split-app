import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { readContract } from "wagmi/actions";
import { Address, formatEther } from "viem";
import { SPLIT_CONTRACT_ABI, config } from "@/lib/wagmi";
import { celo, base, baseSepolia } from "wagmi/chains";
import { celoSepolia } from "@/lib/wagmi";
import SPLIT_BASE_MAINNET_FACTORY_ABI from "@/lib/SPLIT_BASE_MAINNET_FACTORY_ABI.json";
import SPLIT_BASE_SEPOLIA_FACTORY_ABI from "@/lib/SPLIT_BASE_SEPOLIA_FACTORY_ABI.json";
import SPLIT_CELO_MAINNET_FACTORY_ABI from "@/lib/SPLIT_CELO_MAINNET_FACTORY_ABI.json";
import SPLIT_CELO_SEPOLIA_FACTORY_ABI from "@/lib/SPLIT_CELO_SEPOLIA_FACTORY_ABI.json";

const FACTORY_ADDRESS_CELO_MAINNET = process.env
  .NEXT_PUBLIC_FACTORY_ADDRESS_CELO_MAINNET as Address;
const FACTORY_ADDRESS_BASE_MAINNET = process.env
  .NEXT_PUBLIC_FACTORY_ADDRESS_BASE_MAINNET as Address;
const FACTORY_ADDRESS_CELO_SEPOLIA = process.env
  .NEXT_PUBLIC_FACTORY_ADDRESS_CELO_SEPOLIA as Address;
const FACTORY_ADDRESS_BASE_SEPOLIA = process.env
  .NEXT_PUBLIC_FACTORY_ADDRESS_BASE_SEPOLIA as Address;

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

  // Read functions
  const { data: totalSplitsCreated } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "totalSplitsCreated",
    chainId: chain?.id,
  });

  // Function to fetch all splits from the factory
  const fetchSplits = async () => {
    try {
      if (!totalSplitsCreated || totalSplitsCreated === 0) {
        return [];
      }
      const count = Number(totalSplitsCreated);
      const splitsArray: Address[] = [];
      for (let i = 0; i < count; i++) {
        const split = await readContract(config, {
          address: FACTORY_ADDRESS,
          abi: FACTORY_ABI,
          functionName: "splits",
          args: [i],
          chainId: chain?.id,
        });
        splitsArray.push(split as Address);
      }
      return splitsArray;
    } catch (error) {
      console.error("Failed to fetch splits:", error);
      throw error;
    }
  };

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
