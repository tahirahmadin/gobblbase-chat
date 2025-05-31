import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useContractWrite } from "wagmi";
import { injected } from "wagmi/connectors";
import { parseEther } from "viem";
import toast from "react-hot-toast";

// USDT token addresses for different chains
const tokenAddresses: Record<string, string> = {
  "USDT on Eth": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  "USDT on Base": "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
  "USDT on BSC": "0x55d398326f99059fF775485246999027B3197955",
  "USDT on BSC Testnet": "0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684",
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

// Chain ID mapping
const chainIdMap: Record<string, number> = {
  "USDT on Eth": 1,
  "USDT on Base": 8453,
  "USDT on BSC": 56,
  "USDT on BSC Testnet": 97,
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
}

export function useCryptoPayment({
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
    const chainId = chainIdMap[chainName];

    if (chainId && window.ethereum) {
      try {
        // Log current chain before switching
        const currentChainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        console.log("Current chain before switch:", {
          currentChainId: parseInt(currentChainId, 16),
          targetChainId: chainId,
          chainName,
        });

        // First try to switch to the chain
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });

        // Verify the switch was successful
        const newChainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        console.log("Chain after switch:", {
          newChainId: parseInt(newChainId, 16),
          expectedChainId: chainId,
          chainName,
        });

        if (parseInt(newChainId, 16) !== chainId) {
          throw new Error("Failed to switch to the correct network");
        }
      } catch (error: any) {
        console.error("Chain switch error:", error);
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
              console.log("Chain after adding:", {
                currentChainId: parseInt(currentChainId, 16),
                expectedChainId: chainId,
                chainName,
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
      const expectedChainId = chainIdMap[selectedChain];

      console.log("Network verification:", {
        currentChainId: parseInt(currentChainId, 16),
        expectedChainId,
        selectedChain,
      });

      // Convert both to numbers for comparison
      const currentChainIdNum = parseInt(currentChainId, 16);

      if (currentChainIdNum !== expectedChainId) {
        toast.error(`Please switch to ${selectedChain} network first`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const contractAddress = tokenAddresses[selectedChain] as `0x${string}`;
      const totalAmount = product.price * (product.quantity || 1);

      // Log the transaction details for debugging
      console.log("Transaction Details:", {
        chainId: chainIdMap[selectedChain],
        contractAddress,
        amount: totalAmount,
        recipient: walletAddress,
        selectedChain,
      });

      await writeContract({
        abi: tokenABI,
        address: contractAddress,
        functionName: "transfer",
        args: [
          walletAddress as `0x${string}`,
          parseEther(totalAmount.toString()),
        ],
        chainId: chainIdMap[selectedChain],
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
      const handleChainChanged = async (chainId: string) => {
        const expectedChainId = selectedChain
          ? chainIdMap[selectedChain]
          : null;

        console.log("Chain changed:", {
          newChainId: parseInt(chainId, 16),
          expectedChainId,
          selectedChain,
        });

        if (expectedChainId && parseInt(chainId, 16) !== expectedChainId) {
          toast.error(`Please switch to ${selectedChain} network`);
        }
      };

      window.ethereum.on("chainChanged", handleChainChanged);
      return () => {
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [selectedChain]);

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
