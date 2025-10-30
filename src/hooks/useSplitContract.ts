import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { Address, formatEther, parseEther } from "viem";
import { celo, base, baseSepolia } from "wagmi/chains";
import { celoSepolia } from "@/lib/wagmi";
import SPLIT_BASE_MAINNET_CONTRACT_ABI from "@/lib/SPLIT_BASE_MAINNET_CONTRACT_ABI.json";
import SPLIT_BASE_SEPOLIA_CONTRACT_ABI from "@/lib/SPLIT_BASE_SEPOLIA_CONTRACT_ABI.json";
import SPLIT_CELO_MAINNET_CONTRACT_ABI from "@/lib/SPLIT_CELO_MAINNET_CONTRACT_ABI.json";
import SPLIT_CELO_SEPOLIA_CONTRACT_ABI from "@/lib/SPLIT_CELO_SEPOLIA_CONTRACT_ABI.json";

export function useSplitContract(splitAddress: Address) {
  const { chain } = useAccount();

  // Determine which ABI to use based on chain
  const isOnCeloMainnet = chain?.id === celo.id;
  const isOnBaseMainnet = chain?.id === base.id;
  const isOnCeloSepolia = chain?.id === celoSepolia.id;
  const isOnBaseSepolia = chain?.id === baseSepolia.id;

  let CONTRACT_ABI: any;

  if (isOnCeloMainnet) {
    CONTRACT_ABI = SPLIT_CELO_MAINNET_CONTRACT_ABI;
  } else if (isOnBaseMainnet) {
    CONTRACT_ABI = SPLIT_BASE_MAINNET_CONTRACT_ABI;
  } else if (isOnCeloSepolia) {
    CONTRACT_ABI = SPLIT_CELO_SEPOLIA_CONTRACT_ABI;
  } else if (isOnBaseSepolia) {
    CONTRACT_ABI = SPLIT_BASE_SEPOLIA_CONTRACT_ABI;
  } else {
    // Default to Base mainnet
    CONTRACT_ABI = SPLIT_BASE_MAINNET_CONTRACT_ABI;
  }

  // Read functions
  const { data: splitDetails, refetch: refetchSplitDetails } = useReadContract({
    address: splitAddress,
    abi: CONTRACT_ABI,
    functionName: "getDetails",
    chainId: chain?.id,
  });

  const { data: balances, refetch: refetchBalances } = useReadContract({
    address: splitAddress,
    abi: CONTRACT_ABI,
    functionName: "getBalances",
    chainId: chain?.id,
  });

  const { data: isFinalized } = useReadContract({
    address: splitAddress,
    abi: CONTRACT_ABI,
    functionName: "finalized",
    chainId: chain?.id,
  });

  const { data: token } = useReadContract({
    address: splitAddress,
    abi: CONTRACT_ABI,
    functionName: "token",
    chainId: chain?.id,
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

  const depositNative = async (amount: string) => {
    try {
      const amountInWei = parseEther(amount);
      const result = await writeContractAsync({
        address: splitAddress,
        abi: CONTRACT_ABI,
        functionName: "depositNative",
        args: [amountInWei],
        value: amountInWei,
      });
      return result;
    } catch (error) {
      console.error("Failed to deposit native:", error);
      throw error;
    }
  };

  const depositToken = async (amount: string) => {
    try {
      const amountInWei = parseEther(amount);
      const result = await writeContractAsync({
        address: splitAddress,
        abi: CONTRACT_ABI,
        functionName: "depositToken",
        args: [amountInWei],
      });
      return result;
    } catch (error) {
      console.error("Failed to deposit token:", error);
      throw error;
    }
  };

  const distributeNative = async () => {
    try {
      const result = await writeContractAsync({
        address: splitAddress,
        abi: CONTRACT_ABI,
        functionName: "distributeNative",
        args: [],
      });
      return result;
    } catch (error) {
      console.error("Failed to distribute native:", error);
      throw error;
    }
  };

  const distributeToken = async () => {
    try {
      const result = await writeContractAsync({
        address: splitAddress,
        abi: CONTRACT_ABI,
        functionName: "distributeToken",
        args: [],
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
        abi: CONTRACT_ABI,
        functionName: "finalize",
        args: [],
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
          bigint[], // percentages
          bigint, // nativeDistributed
          bigint, // tokenDistributed
          boolean, // finalized
          bigint, // createdAt
          bigint, // totalFeesCollected
          bigint // chainId
        ]
      | undefined,
    balances: balances as
      | {
          nativeAmount: bigint;
          tokenAmount: bigint;
        }
      | undefined,
    isFinalized: isFinalized as boolean | undefined,
    token: token as Address | undefined,
    depositNative,
    depositToken,
    distributeNative,
    distributeToken,
    finalize,
    refreshData,
    isWriting,
    isConfirming,
    isConfirmed,
    hash,
  };
}
