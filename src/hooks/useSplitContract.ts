import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { readContract } from "wagmi/actions";
import { Address, formatEther, parseEther, parseUnits } from "viem";
import { celo, base } from "wagmi/chains";
import { config } from "@/lib/wagmi";
import SPLIT_BASE_MAINNET_CONTRACT_ABI from "@/lib/SPLIT_BASE_MAINNET_CONTRACT_ABI.json";
import SPLIT_CELO_MAINNET_CONTRACT_ABI from "@/lib/SPLIT_CELO_MAINNET_CONTRACT_ABI.json";
import ERC20_ABI from "@/lib/ERC20_ABI.json";

// USDC token addresses (6 decimals)
const USDC_ADDRESSES: Record<string, boolean> = {
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": true, // Base mainnet USDC
  "0xef4229c8c3250C675F21BCefa42f58EfbfF6002a": true, // Celo mainnet USDC
};

export function useSplitContract(splitAddress: Address) {
  const { chain, address: userAddress } = useAccount();

  // Determine which ABI to use based on chain
  const isOnCeloMainnet = chain?.id === celo.id;
  const isOnBaseMainnet = chain?.id === base.id;

  let CONTRACT_ABI: any;

  if (isOnCeloMainnet) {
    CONTRACT_ABI = SPLIT_CELO_MAINNET_CONTRACT_ABI;
  } else if (isOnBaseMainnet) {
    CONTRACT_ABI = SPLIT_BASE_MAINNET_CONTRACT_ABI;
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

  // Check if token is USDC (6 decimals)
  const tokenAddress = token as Address | undefined;
  const isUsdcToken = tokenAddress
    ? USDC_ADDRESSES[tokenAddress.toLowerCase()] || USDC_ADDRESSES[tokenAddress]
    : false;

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
    if (
      !tokenAddress ||
      tokenAddress === "0x0000000000000000000000000000000000000000"
    ) {
      throw new Error("This split does not use an ERC20 token");
    }
    if (!userAddress) {
      throw new Error("Wallet not connected");
    }

    try {
      // Use 6 decimals for USDC, 18 for other ERC20 tokens
      const decimals = isUsdcToken ? 6 : 18;
      const amountInUnits = parseUnits(amount, decimals);

      // Check current allowance
      const currentAllowance = (await readContract(config, {
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [userAddress, splitAddress],
        chainId: chain?.id,
      })) as bigint;

      // If allowance is insufficient, request approval first
      if (currentAllowance < amountInUnits) {
        await writeContractAsync({
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [splitAddress, amountInUnits],
        });
      }

      // Now deposit the tokens
      const result = await writeContractAsync({
        address: splitAddress,
        abi: CONTRACT_ABI,
        functionName: "depositToken",
        args: [amountInUnits],
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
