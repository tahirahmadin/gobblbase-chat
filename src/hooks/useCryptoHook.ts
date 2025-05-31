import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useContractWrite } from "wagmi";
import { injected } from "wagmi/connectors";
import { parseEther } from "viem";
import {
  mainnet,
  base,
  bsc,
  sepolia,
  baseGoerli,
  bscTestnet,
} from "viem/chains";
import toast from "react-hot-toast";

// USDT token addresses for different chains (mainnet and testnet)
const tokenAddresses: Record<string, Record<string, string>> = {
  mainnet: {
    "USDT on Eth": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "USDT on Base": "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    "USDT on BSC": "0x55d398326f99059fF775485246999027B3197955",
  },
  testnet: {
    "USDT on Eth": "0x6f14C02Fc1F78322cFd7d707aB90f18baD3B54f5", // Sepolia USDT
    "USDT on Base": "0x853154e2A5604E5F74f3f16836a970bB5D6BcA99", // Base Goerli USDT
    "USDT on BSC": "0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684", // BSC Testnet USDT
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

// Chain parameters for network switching (mainnet and testnet)
const chainParams: Record<number, any> = {
  // Mainnet
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
  // Testnet
  11155111: {
    chainId: "0xaa36a7",
    chainName: "Sepolia",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "SEP",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.sepolia.org"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
  84531: {
    chainId: "0x14a33",
    chainName: "Base Goerli",
    nativeCurrency: {
      name: "Goerli Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://goerli.base.org"],
    blockExplorerUrls: ["https://goerli.basescan.org"],
  },
  97: {
    chainId: "0x61",
    chainName: "BNB Smart Chain Testnet",
    nativeCurrency: {
      name: "BNB",
      symbol: "tBNB",
      decimals: 18,
    },
    rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
    blockExplorerUrls: ["https://testnet.bscscan.com"],
  },
};

// Chain ID mapping (mainnet and testnet)
const chainIdMap: Record<string, Record<string, number>> = {
  mainnet: {
    "USDT on Eth": 1,
    "USDT on Base": 8453,
    "USDT on BSC": 56,
  },
  testnet: {
    "USDT on Eth": 11155111, // Sepolia
    "USDT on Base": 84531, // Base Goerli
    "USDT on BSC": 97, // BSC Testnet
  },
};

interface UseCryptoPaymentProps {
  product: {
    price: number;
    quantity?: number;
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
  isTestnet?: boolean; // New prop to toggle between testnet and mainnet
}

export function useCryptoPayment({
  product,
  onSuccess,
  onOrderDetails,
  walletAddress,
  isTestnet = true, // Default to mainnet
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
          total: product.price * (product.quantity || 1),
          paymentMethod: "crypto",
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
    const chainId = chainIdMap[isTestnet ? "testnet" : "mainnet"][chainName];

    if (chainId && window.ethereum) {
      try {
        // First try to switch to the chain
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });

        // Verify the switch was successful
        const currentChainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        if (parseInt(currentChainId, 16) !== chainId) {
          throw new Error("Failed to switch to the correct network");
        }
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

              // Verify the chain was added and switched to
              const currentChainId = await window.ethereum.request({
                method: "eth_chainId",
              });
              if (parseInt(currentChainId, 16) !== chainId) {
                throw new Error("Failed to switch to the added network");
              }
            } catch (addError) {
              console.error("Failed to add chain:", addError);
              toast.error("Failed to add network. Please try again.");
              return;
            }
          }
        } else {
          console.error("Failed to switch chain:", error);
          toast.error("Failed to switch network. Please try again.");
          return;
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

    // Verify we're on the correct network before proceeding
    if (window.ethereum) {
      const currentChainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      const expectedChainId =
        chainIdMap[isTestnet ? "testnet" : "mainnet"][selectedChain];

      if (parseInt(currentChainId, 16) !== expectedChainId) {
        toast.error(
          `Please switch to ${isTestnet ? "testnet" : "mainnet"} network first`
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const contractAddress = tokenAddresses[isTestnet ? "testnet" : "mainnet"][
        selectedChain
      ] as `0x${string}`;
      const totalAmount = product.price * (product.quantity || 1);

      // Log the transaction details for debugging
      console.log("Transaction Details:", {
        network: isTestnet ? "testnet" : "mainnet",
        chainId: chainIdMap[isTestnet ? "testnet" : "mainnet"][selectedChain],
        contractAddress,
        amount: totalAmount,
        recipient: walletAddress,
      });

      await writeContract({
        abi: tokenABI,
        address: contractAddress,
        functionName: "transfer",
        args: [
          walletAddress as `0x${string}`,
          parseEther(totalAmount.toString()),
        ],
        chainId: chainIdMap[isTestnet ? "testnet" : "mainnet"][selectedChain],
      });
    } catch (error: any) {
      console.error("Transfer error:", error);
      toast.error(error.message || "Transfer failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add network change listener
  useEffect(() => {
    if (window.ethereum) {
      const handleChainChanged = (chainId: string) => {
        const expectedChainId = selectedChain
          ? chainIdMap[isTestnet ? "testnet" : "mainnet"][selectedChain]
          : null;

        if (expectedChainId && parseInt(chainId, 16) !== expectedChainId) {
          toast.error(
            `Please switch to ${isTestnet ? "testnet" : "mainnet"} network`
          );
        }
      };

      window.ethereum.on("chainChanged", handleChainChanged);
      return () => {
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [selectedChain, isTestnet]);

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
    tokenAddresses: tokenAddresses[isTestnet ? "testnet" : "mainnet"],
    isTestnet,
    currentNetwork: isTestnet ? "testnet" : "mainnet",
  };
}
