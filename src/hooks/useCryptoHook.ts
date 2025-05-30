import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useContractWrite } from "wagmi";
import { injected } from "wagmi/connectors";
import { parseEther } from "viem";
import { mainnet, base, bsc } from "viem/chains";
import toast from "react-hot-toast";

// Token addresses for different chains
const tokenAddresses: Record<string, Record<string, string>> = {
  usdt: {
    "USDT on Eth": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "USDT on Base": "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    "USDT on BSC": "0x55d398326f99059fF775485246999027B3197955",
  },
  usdc: {
    "USDC on Eth": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "USDC on Base": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "USDC on BSC": "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  },
};

// ERC20 token ABI for transfer function
const tokenABI = [
  {
    constant: false,
    inputs: [
      {
        name: "_to",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Chain parameters for network switching
const chainParams: Record<number, any> = {
  1: {
    chainId: "0x1",
    chainName: "Ethereum Mainnet",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.infura.io/v3/"],
    blockExplorerUrls: ["https://etherscan.io"],
  },
  8453: {
    chainId: "0x2105",
    chainName: "Base",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorerUrls: ["https://basescan.org"],
  },
  56: {
    chainId: "0x38",
    chainName: "BNB Smart Chain",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: ["https://bsc-dataseed.binance.org"],
    blockExplorerUrls: ["https://bscscan.com"],
  },
};

// Chain ID mapping
const chainIdMap: Record<string, number> = {
  "USDT on Eth": 1,
  "USDT on Base": 8453,
  "USDT on BSC": 56,
  "USDC on Eth": 1,
  "USDC on Base": 8453,
  "USDC on BSC": 56,
};

interface UseCryptoPaymentProps {
  type: "usdt" | "usdc";
  product: {
    price: number;
    [key: string]: any;
  };
  onSuccess: () => void;
  onOrderDetails: (details: {
    product: any;
    total: number;
    paymentMethod: string;
    paymentDate: string;
    transactionHash: string;
  }) => void;
  walletAddress: string;
}

export function useCryptoPayment({
  type,
  product,
  onSuccess,
  onOrderDetails,
  walletAddress,
}: UseCryptoPaymentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedChain, setSelectedChain] = useState<string | null>(null);

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { connectAsync } = useConnect();
  const { disconnect } = useDisconnect();

  // Contract write hook
  const { writeContract, isPending } = useContractWrite({
    mutation: {
      onSuccess: (hash: `0x${string}`) => {
        onOrderDetails({
          product: product,
          total: product.price,
          paymentMethod: type.toUpperCase(),
          paymentDate: new Date().toLocaleDateString(),
          transactionHash: hash,
        });
        onSuccess();
      },
      onError: (error: Error) => {
        console.error("Transfer error:", error);
        toast.error(error.message || "Transfer failed. Please try again.");
      },
    },
  });

  // Connect wallet
  const handleConnectWallet = async () => {
    try {
      await connectAsync({ connector: injected() });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast.error("Failed to connect wallet. Please try again.");
    }
  };

  // Handle chain selection and switching
  const handleChainSelect = async (chainName: string) => {
    setSelectedChain(chainName);
    const chainId = chainIdMap[chainName];

    if (chainId && window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
      } catch (error: any) {
        if (error.code === 4902) {
          // Chain not added to wallet, add it
          const params = chainParams[chainId];
          if (params) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [params],
              });
            } catch (addError) {
              console.error("Failed to add chain:", addError);
              toast.error("Failed to add network. Please try again.");
            }
          }
        } else {
          console.error("Failed to switch chain:", error);
          toast.error("Failed to switch network. Please try again.");
        }
      }
    }
  };

  // Handle payment submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!selectedChain) {
      toast.error("Please select a network");
      return;
    }

    if (!writeContract) {
      toast.error("Transaction preparation failed");
      return;
    }

    setIsSubmitting(true);
    try {
      await writeContract({
        abi: tokenABI,
        functionName: "transfer",
        address: tokenAddresses[type][selectedChain] as `0x${string}`,
        args: [
          walletAddress as `0x${string}`,
          parseEther(product.price.toString()),
        ],
      });
    } catch (error: any) {
      console.error("Transfer error:", error);
      toast.error(error.message || "Transfer failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isConnected,
    address,
    isSubmitting,
    isPending,
    selectedChain,
    handleConnectWallet,
    handleChainSelect,
    handleSubmit,
    disconnect,
    tokenAddresses,
  };
}
