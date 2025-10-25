import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { Address, formatEther, parseEther } from "viem";
import SPLIT_FACTORY_ABI from "@/lib/SPLIT_FACTORY_ABI.json";

export function useSplitContract(splitAddress: Address) {
  // Read functions
  const { data: splitDetails, refetch: refetchSplitDetails } = useReadContract({
    address: splitAddress,
    abi: SPLIT_FACTORY_ABI,
    functionName: "getDetails",
  });

  const { data: balances, refetch: refetchBalances } = useReadContract({
    address: splitAddress,
    abi: SPLIT_FACTORY_ABI,
    functionName: "getBalances",
  });

  const { data: isFinalized } = useReadContract({
    address: splitAddress,
    abi: SPLIT_FACTORY_ABI,
    functionName: "finalized",
  });

  const { data: token } = useReadContract({
    address: splitAddress,
    abi: SPLIT_FACTORY_ABI,
    functionName: "token",
  });

  // Write functions
  const {
    writeContractAsync,
    data: hash,
    isPending: isWriting,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const depositEth = async (amount: string) => {
    try {
      const amountInWei = parseEther(amount);
      const result = await writeContractAsync({
        address: splitAddress,
        abi: SPLIT_FACTORY_ABI,
        functionName: "depositEth",
        args: [amountInWei],
        value: amountInWei,
      });
      return result;
    } catch (error) {
      console.error("Failed to deposit ETH:", error);
      throw error;
    }
  };

  const depositToken = async (amount: string) => {
    try {
      const amountInWei = parseEther(amount);
      const result = await writeContractAsync({
        address: splitAddress,
        abi: SPLIT_FACTORY_ABI,
        functionName: "depositToken",
        args: [amountInWei],
      });
      return result;
    } catch (error) {
      console.error("Failed to deposit token:", error);
      throw error;
    }
  };

  const distributeEth = async () => {
    try {
      const result = await writeContractAsync({
        address: splitAddress,
        abi: SPLIT_FACTORY_ABI,
        functionName: "distributeEth",
      });
      return result;
    } catch (error) {
      console.error("Failed to distribute ETH:", error);
      throw error;
    }
  };

  const distributeToken = async () => {
    try {
      const result = await writeContractAsync({
        address: splitAddress,
        abi: SPLIT_FACTORY_ABI,
        functionName: "distributeToken",
      });
      return result;
    } catch (error) {
      console.error("Failed to distribute token:", error);
      throw error;
    }
  };

  const finalize = async () => {
    try {
      const result = await writeContractAsync({
        address: splitAddress,
        abi: SPLIT_FACTORY_ABI,
        functionName: "finalize",
      });
      return result;
    } catch (error) {
      console.error("Failed to finalize split:", error);
      throw error;
    }
  };

  const refreshData = async () => {
    await Promise.all([refetchSplitDetails(), refetchBalances()]);
  };

  return {
    splitDetails: splitDetails as
      | [
          Address, // treasury
          Address, // token
          Address[], // recipients
          number[], // percentages
          bigint, // ethDistributed
          bigint, // tokenDistributed
          boolean // finalized
        ]
      | undefined,
    balances: balances as
      | {
          ethAmount: bigint;
          tokenAmount: bigint;
        }
      | undefined,
    isFinalized: isFinalized as boolean | undefined,
    token: token as Address | undefined,
    depositEth,
    depositToken,
    distributeEth,
    distributeToken,
    finalize,
    refreshData,
    isWriting,
    isConfirming,
    isConfirmed,
    hash,
  };
}
