import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { readContract } from "wagmi/actions";
import { Address, formatEther } from "viem";
import { SPLIT_CONTRACT_ABI, config } from "@/lib/wagmi";

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as Address;

export function useSplitFactory() {
  // Read functions
  const { data: userSplits, refetch: refetchUserSplits } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: SPLIT_CONTRACT_ABI,
    functionName: "getUserSplits",
    args: [], // Will be set when address is available
    query: {
      enabled: false, // Disable by default, enable when address is provided
    },
  });

  // Function to fetch user splits with specific address
  const fetchUserSplitsWithAddress = async (userAddress: Address) => {
    try {
      const result = await readContract(config, {
        address: FACTORY_ADDRESS,
        abi: SPLIT_CONTRACT_ABI,
        functionName: "getUserSplits",
        args: [userAddress],
      });
      return result as Address[];
    } catch (error) {
      console.error("Failed to fetch user splits:", error);
      throw error;
    }
  };

  const { data: allSplits } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: SPLIT_CONTRACT_ABI,
    functionName: "getAllSplits",
  });

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
    percentages: number[]
  ) => {
    try {
      const result = await writeContractAsync({
        address: FACTORY_ADDRESS,
        abi: SPLIT_CONTRACT_ABI,
        functionName: "createSplit",
        args: [token, recipients, percentages],
      });
      return result;
    } catch (error) {
      console.error("Failed to create split:", error);
      throw error;
    }
  };

  const fetchUserSplits = async (userAddress: Address) => {
    try {
      // Use the direct readContract function with the user address
      const result = await fetchUserSplitsWithAddress(userAddress);
      return result;
    } catch (error) {
      console.error("Failed to fetch user splits:", error);
      throw error;
    }
  };

  return {
    userSplits: userSplits as Address[] | undefined,
    allSplits: allSplits as Address[] | undefined,
    createSplit,
    fetchUserSplits,
    fetchUserSplitsWithAddress,
    isCreating,
    isConfirming,
    isConfirmed,
    hash,
  };
}
