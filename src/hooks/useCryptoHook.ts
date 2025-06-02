import { useState, useEffect, useRef } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useContractWrite,
  useWatchContractEvent,
} from "wagmi";
import { injected } from "wagmi/connectors";
import { parseUnits } from "viem";
import toast from "react-hot-toast";
import { backendApiUrl } from "../utils/constants";

// USDT token addresses for different chains
const tokenAddresses: Record<string, string> = {
  "USDT on Eth": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  "USDT on Base": "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
  "USDT on BSC": "0x55d398326f99059fF775485246999027B3197955",
  "USDT on BSC Testnet": "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee",
};

// Token decimals for each chain
const tokenDecimals: Record<string, number> = {
  "USDT on Eth": 6,
  "USDT on Base": 6,
  "USDT on BSC": 18,
  "USDT on BSC Testnet": 18,
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

// Reverse mapping for hex chain IDs to display names
const chainIdToName: Record<string, string> = {
  "0x1": "USDT on Eth",
  "0x2105": "USDT on Base",
  "0x38": "USDT on BSC",
  "0x61": "USDT on BSC Testnet",
};

// Chain parameters for network switching
const chainParams: Record<string, any> = {
  "0x1": {
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
  "0x2105": {
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
  "0x38": {
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
  "0x61": {
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

interface UseCryptoPaymentProps {
  product: {
    _id: string;
    price: number;
    title: string;
    description?: string;
    images?: string[];
    priceType?: string;
    selectedSize?: string;
    quantity: number;
    sizeQuantity?: Record<string, number>;
    [key: string]: any;
  };
  shipping: {
    name: string;
    email: string;
    phone: string;
    country: string;
    address1: string;
    address2: string;
    city: string;
    zipcode: string;
    saveDetails: boolean;
  };
  onSuccess: () => void;
  onOrderDetails: (details: {
    product: any;
    total: number;
    paymentMethod: string;
    paymentDate: string;
    transactionHash: string;
    orderId?: string;
  }) => void;
  walletAddress: string;
  activeBotId: string | null;
  userId: string | null;
  userEmail: string | null;
}

export function useCryptoPayment({
  product,
  onSuccess,
  onOrderDetails,
  walletAddress,
  activeBotId,
  userId,
  userEmail,
  shipping,
}: UseCryptoPaymentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [orderStatus, setOrderStatus] = useState<
    "pending" | "succeeded" | "failed" | null
  >(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { connectAsync } = useConnect();
  const { disconnect } = useDisconnect();

  // Watch for transaction confirmation
  useEffect(() => {
    if (txHash) {
      setIsConfirming(true);
      const createOrder = async () => {
        try {
          // Call backend API to create order
          const response = await fetch(
            `${backendApiUrl}/product/createCryptoOrder`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                lineItems: [],
                agentId: activeBotId,
                userId: userId || null,
                userEmail: userEmail || null,
                amount: (product.price * (product.quantity || 1)) / 100,
                currency: "USDT",
                cart: [product],
                shipping: shipping,
                checkType: product.checkType,
                checkQuantity: product.quantity,
                txHash: txHash,
                chainId: selectedChain,
                stripeAccountId: "", // Crypto payments don't use Stripe
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to create order");
          }

          const data = await response.json();
          console.log("OrderId data:", data);
          setOrderId(data.result.orderId);
          setOrderStatus("pending");
          setIsPolling(true);
          console.log("OrderId set:", data.result.orderId);
        } catch (error: unknown) {
          console.error("Order creation error:", error);
          toast.error(
            "Transaction confirmed but failed to create order. Please contact support."
          );
        } finally {
          setIsConfirming(false);
        }
      };

      // Wait for transaction confirmation
      const checkConfirmation = async () => {
        try {
          const receipt = await window.ethereum.request({
            method: "eth_getTransactionReceipt",
            params: [txHash],
          });

          if (receipt && receipt.status === "0x1") {
            await createOrder();
          } else {
            // Check again after 2 seconds
            setTimeout(checkConfirmation, 2000);
          }
        } catch (error) {
          console.error("Error checking transaction confirmation:", error);
          toast.error("Failed to confirm transaction. Please try again.");
          setIsConfirming(false);
        }
      };

      checkConfirmation();
    }
  }, [
    txHash,
    activeBotId,
    userId,
    userEmail,
    shipping,
    product,
    selectedChain,
    onSuccess,
    onOrderDetails,
  ]);

  // Contract write hook
  const { writeContract, isPending } = useContractWrite({
    mutation: {
      onSuccess: (hash: `0x${string}`) => {
        setTxHash(hash);
        toast.success("Transaction sent! Waiting for confirmation...");
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
  const handleChainSelect = async (chainId: string) => {
    const chainName = chainIdToName[chainId];
    setSelectedChain(chainId);

    if (chainId && window.ethereum) {
      try {
        // Log current chain before switching
        const currentChainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        console.log("Current chain before switch:", {
          currentChainId,
          targetChainId: chainId,
          chainName,
        });

        // First try to switch to the chain
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId }],
          });
        } catch (switchError: any) {
          // If the chain is not added to the wallet, add it
          if (switchError.code === 4902) {
            const params = chainParams[chainId];
            if (params) {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [params],
              });
            } else {
              throw new Error("Network parameters not found");
            }
          } else {
            throw switchError;
          }
        }

        // Verify the switch was successful
        const newChainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        console.log("Chain after switch:", {
          newChainId,
          expectedChainId: chainId,
          chainName,
        });

        if (newChainId !== chainId) {
          throw new Error("Failed to switch to the correct network");
        }
      } catch (error: any) {
        console.error("Chain switch error:", error);
        toast.error(
          error.message || "Failed to switch network. Please try again."
        );
        return;
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

      console.log("Network verification:", {
        currentChainId,
        expectedChainId: selectedChain,
        chainName: chainIdToName[selectedChain],
      });

      if (currentChainId !== selectedChain) {
        toast.error(
          `Please switch to ${chainIdToName[selectedChain]} network first`
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const chainName = chainIdToName[selectedChain];
      const contractAddress = tokenAddresses[chainName] as `0x${string}`;
      const totalAmount = (product.price * (product.quantity || 1)) / 100;
      const decimals = tokenDecimals[chainName];

      // Log the transaction details for debugging
      console.log("Transaction Details:", {
        chainId: selectedChain,
        contractAddress,
        amount: totalAmount,
        decimals,
        recipient: walletAddress,
        chainName,
      });

      // Prepare the transaction
      const tx = {
        abi: tokenABI,
        address: contractAddress,
        functionName: "transfer" as const,
        args: [
          walletAddress as `0x${string}`,
          parseUnits(totalAmount.toString(), decimals),
        ] as const,
        chainId: parseInt(selectedChain, 16),
        gas: 100000n, // Set a reasonable gas limit
      };

      console.log("Sending transaction with params:", tx);
      await writeContract(tx);
    } catch (error: any) {
      console.error("Transfer error:", error);
      if (error.message?.includes("user rejected")) {
        toast.error("Transaction was rejected. Please try again.");
      } else if (error.message?.includes("insufficient funds")) {
        toast.error(
          "Insufficient funds for transaction. Please check your balance."
        );
      } else {
        toast.error(error.message || "Transfer failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add network change listener
  useEffect(() => {
    if (window.ethereum) {
      const handleChainChanged = async (chainId: string) => {
        console.log("Chain changed:", {
          newChainId: chainId,
          expectedChainId: selectedChain,
          chainName: selectedChain ? chainIdToName[selectedChain] : null,
        });

        if (selectedChain && chainId !== selectedChain) {
          toast.error(
            `Please switch to ${chainIdToName[selectedChain]} network`
          );
        }
      };

      window.ethereum.on("chainChanged", handleChainChanged);
      return () => {
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [selectedChain]);

  // Polling for order payment status
  useEffect(() => {
    if (isPolling && orderId) {
      const pollStatus = async () => {
        try {
          const res = await fetch(
            `${backendApiUrl}/product/getOrderPaymentStatus/?orderId=${orderId}`
          );
          const json = await res.json();
          if (json?.result?.result === "succeeded") {
            setOrderStatus("succeeded");
            setIsPolling(false);
            onOrderDetails({
              product: product,
              total: (product.price * (product.quantity || 1)) / 100,
              paymentMethod: "crypto",
              paymentDate: new Date().toLocaleDateString(),
              transactionHash: txHash!,
              orderId: orderId,
            });
            onSuccess();
          } else if (json?.result?.result === "failed") {
            setOrderStatus("failed");
            setIsPolling(false);
            toast.error("Order payment failed.");
          } else {
            setOrderStatus("pending");
          }
        } catch (e) {
          // Optionally handle error
        }
      };
      pollStatus();
      pollingInterval.current = setInterval(pollStatus, 3000);
      return () => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);
      };
    }
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [isPolling, orderId]);

  console.log("Polling useEffect:", { isPolling, orderId });

  return {
    isConnected,
    address,
    isSubmitting,
    isPending,
    isConfirming,
    selectedChain,
    handleConnectWallet,
    handleChainSelect,
    handleSubmit,
    disconnect,
    tokenAddresses,
    orderStatus,
    isPolling,
  };
}
