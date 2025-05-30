import React, { useState, useEffect, useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useBotConfig } from "../../../store/useBotConfig";
import { useUserStore } from "../../../store/useUserStore";
import toast from "react-hot-toast";
import { CreditCard, Wallet, AlertCircle } from "lucide-react";
import { backendApiUrl } from "../../../utils/constants";
import { useAccount, useConnect, useDisconnect, useContractWrite } from "wagmi";
import { injected } from "wagmi/connectors";
import { parseEther } from "viem";
import { mainnet, base, bsc } from "viem/chains";
import { createConfig, http } from "wagmi";
import { Hash, TransactionReceipt } from "viem";

// Create wagmi config
const config = createConfig({
  chains: [mainnet, base, bsc],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
  },
});

interface PaymentSectionProps {
  theme: {
    isDark: boolean;
    highlightColor: string;
  };
  onSuccess: () => void;
  onOrderDetails: (details: {
    product: any;
    total: number;
    orderId?: string;
    paymentMethod?: string;
    paymentDate?: string;
  }) => void;
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
}

type PaymentMethod = "stripe" | "razorpay" | "usdt" | "usdc";

function StripePaymentForm({
  onSuccess,
  onOrderDetails,
  product,
}: {
  onSuccess: () => void;
  onOrderDetails: (details: any) => void;
  product: PaymentSectionProps["product"];
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast.error("Payment system is not ready. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: "if_required",
      });

      if (error) {
        throw error;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        const orderDetails = {
          product: product,
          total: product.price * product.quantity,
          orderId: paymentIntent.id,
          paymentMethod: "Credit Card",
          paymentDate: new Date().toLocaleDateString(),
        };

        onOrderDetails(orderDetails);
        onSuccess();
      } else {
        throw new Error("Payment was not successful");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={isSubmitting || !stripe || !elements}
        className="w-full p-3 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
        style={{
          backgroundColor: "#FFD700",
          color: "#000",
          opacity: isSubmitting ? 0.7 : 1,
        }}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
            Processing...
          </div>
        ) : (
          "PAY NOW"
        )}
      </button>
    </form>
  );
}

function RazorpayPaymentForm({
  onSuccess,
  onOrderDetails,
  product,
}: {
  onSuccess: () => void;
  onOrderDetails: (details: any) => void;
  product: PaymentSectionProps["product"];
}) {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onOrderDetails({
      product: product,
      total: product.price,
      paymentMethod: "Razorpay",
      paymentDate: new Date().toLocaleDateString(),
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 rounded-lg border" style={{ borderColor: "#FFD700" }}>
        <p className="text-center" style={{ color: "#FFD700" }}>
          You will be redirected to Razorpay payment gateway
        </p>
      </div>
      <button
        type="submit"
        className="w-full p-3 rounded font-medium"
        style={{
          backgroundColor: "#FFD700",
          color: "#000",
        }}
      >
        PROCEED TO PAYMENT
      </button>
    </form>
  );
}

function CryptoPaymentForm({
  onSuccess,
  onOrderDetails,
  type,
  product,
}: {
  onSuccess: () => void;
  onOrderDetails: (details: any) => void;
  type: "usdt" | "usdc";
  product: PaymentSectionProps["product"];
}) {
  const { activeBotData } = useBotConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedChain, setSelectedChain] = useState<string | null>(null);

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { connectAsync } = useConnect();
  const { disconnect } = useDisconnect();

  // Contract configuration
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

  const handleConnectWallet = async () => {
    try {
      await connectAsync({ connector: injected() });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast.error("Failed to connect wallet. Please try again.");
    }
  };

  const handleChainSelect = (chainName: string) => {
    setSelectedChain(chainName);
    const chainId = getChainIdFromName(chainName);
    if (chainId) {
      // Switch network using the wallet's native method
      if (window.ethereum) {
        window.ethereum
          .request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${chainId.toString(16)}` }],
          })
          .catch((error: any) => {
            if (error.code === 4902) {
              // Chain not added to wallet, add it
              const chainParams = getChainParams(chainId);
              if (chainParams) {
                window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [chainParams],
                });
              }
            }
          });
      }
    }
  };

  const getChainIdFromName = (chainName: string): number | undefined => {
    const chainMap: Record<string, number> = {
      "USDT on Eth": 1,
      "USDT on Base": 8453,
      "USDT on BSC": 56,
      "USDC on Eth": 1,
      "USDC on Base": 8453,
      "USDC on BSC": 56,
    };
    return chainMap[chainName];
  };

  const getChainParams = (chainId: number) => {
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
    return chainParams[chainId];
  };

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
          activeBotData?.paymentMethods[type]?.walletAddress as `0x${string}`,
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

  const walletAddress = activeBotData?.paymentMethods[type]?.walletAddress;
  const supportedChains = activeBotData?.paymentMethods[type]?.chains;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isConnected ? (
        <button
          type="button"
          onClick={handleConnectWallet}
          className="w-full p-3 rounded font-medium flex items-center justify-center gap-2"
          style={{
            backgroundColor: "#FFD700",
            color: "#000",
          }}
        >
          <Wallet className="w-5 h-5" />
          Connect Wallet
        </button>
      ) : (
        <>
          <div
            className="p-4 rounded-lg border"
            style={{ borderColor: "#FFD700" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p
                style={{
                  color: activeBotData?.themeColors.isDark ? "#fff" : "#000",
                }}
              >
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
              <button
                type="button"
                onClick={() => disconnect()}
                className="text-sm underline"
                style={{
                  color: activeBotData?.themeColors.isDark ? "#fff" : "#000",
                }}
              >
                Disconnect
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p
                  className="mb-2"
                  style={{
                    color: activeBotData?.themeColors.isDark ? "#fff" : "#000",
                  }}
                >
                  Select Network
                </p>
                <div className="flex flex-wrap gap-2">
                  {supportedChains?.map((chainName: string) => (
                    <button
                      key={chainName}
                      type="button"
                      onClick={() => handleChainSelect(chainName)}
                      className={`px-3 py-1 text-sm rounded ${
                        selectedChain === chainName
                          ? "bg-yellow-500 text-black"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {chainName}
                    </button>
                  ))}
                </div>
              </div>

              {selectedChain && (
                <div>
                  <p
                    className="mb-2"
                    style={{
                      color: activeBotData?.themeColors.isDark
                        ? "#fff"
                        : "#000",
                    }}
                  >
                    Send {product.price} {type.toUpperCase()} to:
                  </p>
                  <p
                    className="font-mono text-sm break-all p-2 bg-gray-100 rounded"
                    style={{
                      color: activeBotData?.themeColors.isDark
                        ? "#fff"
                        : "#000",
                    }}
                  >
                    {walletAddress}
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !selectedChain || !writeContract}
            className="w-full p-3 rounded font-medium flex items-center justify-center gap-2"
            style={{
              backgroundColor: "#FFD700",
              color: "#000",
              opacity:
                isSubmitting || !selectedChain || !writeContract ? 0.7 : 1,
            }}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                Processing...
              </>
            ) : (
              "CONFIRM PAYMENT"
            )}
          </button>
        </>
      )}
    </form>
  );
}

export function PaymentSection({
  theme,
  onSuccess,
  onOrderDetails,
  product,
  shipping,
}: PaymentSectionProps) {
  const { activeBotId, activeBotData } = useBotConfig();
  const { userId, userEmail, fetchUserDetails } = useUserStore();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("stripe");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [freeOrderLoading, setFreeOrderLoading] = useState(false);
  const [freeOrderError, setFreeOrderError] = useState<string | null>(null);

  // Check if any payment method is enabled
  const availablePaymentMethods = useMemo(() => {
    if (!activeBotData?.paymentMethods) return [];

    const methods = [];
    if (activeBotData.paymentMethods.stripe?.enabled) methods.push("stripe");
    if (activeBotData.paymentMethods.razorpay?.enabled)
      methods.push("razorpay");
    if (activeBotData.paymentMethods.usdt?.enabled) methods.push("usdt");
    if (activeBotData.paymentMethods.usdc?.enabled) methods.push("usdc");

    return methods;
  }, [activeBotData?.paymentMethods]);

  const hasEnabledPaymentMethods = availablePaymentMethods.length > 0;

  // Auto-select first available payment method
  useEffect(() => {
    if (
      availablePaymentMethods.length > 0 &&
      !availablePaymentMethods.includes(selectedMethod)
    ) {
      setSelectedMethod(availablePaymentMethods[0] as PaymentMethod);
    }
  }, [availablePaymentMethods, selectedMethod]);

  // Handle free product order
  const isFreeProduct = product?.price === 0 || product?.priceType === "free";

  const handleFreeOrder = async () => {
    setFreeOrderLoading(true);
    setFreeOrderError(null);
    try {
      const response = await fetch(
        `${backendApiUrl}/product/createFreeProductOrder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lineItems: [],
            agentId: activeBotId,
            userId: userId,
            userEmail: userEmail,
            amount: 0,
            currency: "USD",
            cart: [product],
            shipping: shipping,
            checkType: product.checkType,
            checkQuantity: product.quantity,
            stripeAccountId:
              activeBotData?.paymentMethods?.stripe?.accountId || "",
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create free order");
      }
      if (userId) {
        fetchUserDetails(userId);
      }
      const data = await response.json();
      // Callbacks as with paid orders
      onOrderDetails({
        product: product,
        total: 0,
        orderId: data.orderId || data._id || undefined,
        paymentMethod: "Free",
        paymentDate: new Date().toLocaleDateString(),
      });
      onSuccess();
    } catch (err: any) {
      setFreeOrderError(err.message || "Failed to create free order");
      toast.error(err.message || "Failed to create free order");
    } finally {
      setFreeOrderLoading(false);
    }
  };

  const stripePromise = useMemo(() => {
    if (!activeBotData?.paymentMethods.stripe?.accountId) {
      console.log("No Stripe account ID found in bot data");
      return null;
    }
    return loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY, {
      stripeAccount: activeBotData.paymentMethods.stripe.accountId,
    });
  }, [activeBotData?.paymentMethods.stripe?.accountId]);

  useEffect(() => {
    const createPaymentIntent = async () => {
      if (!product || !product.price || product.price <= 0) {
        setError("Invalid product price");
        return;
      }

      if (
        clientSecret ||
        !activeBotData ||
        selectedMethod !== "stripe" ||
        !stripePromise
      ) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("Creating payment intent for product:", product);
        const response = await fetch(
          `${backendApiUrl}/product/create-payment-intent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cart: [product],
              agentId: activeBotId,
              userId: userId,
              userEmail: userEmail,
              stripeAccountId: activeBotData.paymentMethods.stripe.accountId,
              amount: Math.round(product.price * 100) * product.quantity,
              currency: activeBotData.currency || "USD",
              shipping: shipping,
              checkType: product.checkType,
              checkQuantity: product.quantity,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || "Failed to create payment intent"
          );
        }

        const data = await response.json();
        console.log("Payment intent created successfully:", data);
        if (userId) {
          fetchUserDetails(userId);
        }
        setClientSecret(data.clientSecret);
      } catch (error: any) {
        console.error("Payment intent creation error:", error);
        setError(error.message || "Failed to initialize payment");
        toast.error(error.message || "Failed to initialize payment");
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [
    product,
    activeBotData,
    clientSecret,
    activeBotId,
    userId,
    userEmail,
    selectedMethod,
    stripePromise,
  ]);

  const renderPaymentMethod = () => {
    switch (selectedMethod) {
      case "stripe":
        if (error) {
          return (
            <div className="p-4 text-red-500 text-center">
              {error}
              <button
                onClick={() => {
                  setError(null);
                  setClientSecret(null);
                }}
                className="mt-2 text-sm underline"
              >
                Try Again
              </button>
            </div>
          );
        }
        if (isLoading) {
          return (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            </div>
          );
        }
        if (!stripePromise) {
          return (
            <div className="p-4 text-red-500 text-center">
              Stripe is not properly configured. Please contact support.
            </div>
          );
        }
        if (!clientSecret) {
          return (
            <div className="p-4 text-red-500 text-center">
              Unable to initialize payment. Please try again.
            </div>
          );
        }
        return (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripePaymentForm
              onSuccess={onSuccess}
              onOrderDetails={onOrderDetails}
              product={product}
            />
          </Elements>
        );
      case "razorpay":
        return (
          <RazorpayPaymentForm
            onSuccess={onSuccess}
            onOrderDetails={onOrderDetails}
            product={product}
          />
        );
      case "usdt":
      case "usdc":
        return (
          <CryptoPaymentForm
            onSuccess={onSuccess}
            onOrderDetails={onOrderDetails}
            type={selectedMethod}
            product={product}
          />
        );
      default:
        return null;
    }
  };

  if (isFreeProduct) {
    return (
      <div className="p-4" style={{ paddingBottom: "100px" }}>
        <h3 className="mb-4" style={{ color: theme.isDark ? "#fff" : "#000" }}>
          This is a free product
        </h3>
        <button
          onClick={handleFreeOrder}
          className="w-full p-3 rounded font-medium"
          style={{
            backgroundColor: "#FFD700",
            color: "#000",
            opacity: freeOrderLoading ? 0.7 : 1,
          }}
          disabled={freeOrderLoading}
        >
          {freeOrderLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
              Processing...
            </div>
          ) : (
            "Confirm Purchase"
          )}
        </button>
        {freeOrderError && (
          <div className="mt-2 text-red-500 text-center">{freeOrderError}</div>
        )}
      </div>
    );
  }

  // If no payment methods are enabled, show error message
  if (!hasEnabledPaymentMethods) {
    return (
      <div className="p-4" style={{ paddingBottom: "100px" }}>
        <div
          className="p-4 rounded-lg border border-red-300 bg-red-50 text-center"
          style={{
            backgroundColor: theme.isDark ? "#2d1b1b" : "#fef2f2",
            borderColor: "#ef4444",
            color: theme.isDark ? "#fca5a5" : "#dc2626",
          }}
        >
          <div className="mb-2">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="font-semibold mb-2">Payment Methods Not Available</h3>
          <p className="text-sm">
            No payment methods are currently enabled for this store. Please
            contact the store administrator to enable payment options.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4" style={{ paddingBottom: "100px" }}>
      <h3 className="mb-4" style={{ color: theme.isDark ? "#fff" : "#000" }}>
        Pay with
      </h3>

      {/* Payment Method Selection - Only show enabled methods */}
      <div className="flex gap-2 mb-4 pb-10">
        {availablePaymentMethods.includes("stripe") && (
          <button
            onClick={() => setSelectedMethod("stripe")}
            className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              selectedMethod === "stripe"
                ? "bg-yellow-500 text-black"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>Credit Card</span>
          </button>
        )}

        {availablePaymentMethods.includes("razorpay") && (
          <button
            onClick={() => setSelectedMethod("razorpay")}
            className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              selectedMethod === "razorpay"
                ? "bg-yellow-500 text-black"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span>Razorpay</span>
          </button>
        )}

        {availablePaymentMethods.includes("usdt") && (
          <button
            onClick={() => setSelectedMethod("usdt")}
            className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              selectedMethod === "usdt"
                ? "bg-yellow-500 text-black"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span>USDT</span>
          </button>
        )}

        {availablePaymentMethods.includes("usdc") && (
          <button
            onClick={() => setSelectedMethod("usdc")}
            className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              selectedMethod === "usdc"
                ? "bg-yellow-500 text-black"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span>USDC</span>
          </button>
        )}
      </div>

      {/* Show info about available payment methods */}
      {hasEnabledPaymentMethods && (
        <div
          className="mb-4 text-sm"
          style={{ color: theme.isDark ? "#ccc" : "#666" }}
        >
          {availablePaymentMethods.length === 1
            ? `Only ${availablePaymentMethods[0].toUpperCase()} payment is available.`
            : `${availablePaymentMethods.length} payment methods available.`}
        </div>
      )}

      {/* Payment Form */}
      {renderPaymentMethod()}
    </div>
  );
}
