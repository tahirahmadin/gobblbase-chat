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
import { useCryptoPayment } from "../../../hooks/useCryptoHook";

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

type PaymentMethod = "stripe" | "razorpay" | "crypto";

function StripePaymentForm({
  theme,
  onSuccess,
  onOrderDetails,
  product,
}: {
  theme: any;
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
          backgroundColor: theme.highlightColor,
          color: theme.isDark ? "#000" : "#fff",
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
  theme,
  onSuccess,
  onOrderDetails,
  product,
  shipping,
}: {
  theme: any;
  onSuccess: () => void;
  onOrderDetails: (details: any) => void;
  product: PaymentSectionProps["product"];
  shipping: PaymentSectionProps["shipping"];
}) {
  const { activeBotData, activeBotId } = useBotConfig();
  const { userId, userEmail, fetchUserDetails } = useUserStore();
  const walletAddress = activeBotData?.paymentMethods.crypto.walletAddress;
  const supportedChains = activeBotData?.paymentMethods.crypto.chains;

  // Chain ID to display name mapping
  const chainIdToName: Record<string, string> = {
    "0x1": "USDT on Eth",
    "0x2105": "USDT on Base",
    "0x38": "USDT on BSC",
    "0x61": "USDT on BSC Testnet",
  };

  const {
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
  } = useCryptoPayment({
    product,
    onSuccess,
    onOrderDetails,
    walletAddress: walletAddress || "",
    activeBotId: activeBotId,
    userId: userId,
    userEmail: userEmail,
    shipping,
  });

  // Loader and status UI for polling
  if (isPolling && orderStatus === "pending") {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500 mb-4"></div>
        <p
          className="text-lg font-medium mb-2"
          style={{ color: theme.isDark ? "#fff" : "#000" }}
        >
          Waiting for payment confirmation...
        </p>
        <p
          className="text-sm"
          style={{ color: theme.isDark ? "#ccc" : "#666" }}
        >
          This may take a few moments. Please do not close this window.
        </p>
      </div>
    );
  }
  if (orderStatus === "succeeded") {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="h-10 w-10 mb-4 flex items-center justify-center bg-green-100 rounded-full">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-lg font-medium mb-2 text-green-700">
          Payment Confirmed!
        </p>
        <p
          className="text-sm"
          style={{ color: theme.isDark ? "#ccc" : "#666" }}
        >
          Your crypto payment was successful.
        </p>
      </div>
    );
  }
  if (orderStatus === "failed") {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="h-10 w-10 mb-4 flex items-center justify-center bg-red-100 rounded-full">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <p className="text-lg font-medium mb-2 text-red-700">Payment Failed</p>
        <p
          className="text-sm"
          style={{ color: theme.isDark ? "#ccc" : "#666" }}
        >
          Your crypto payment could not be confirmed. Please try again or
          contact support.
        </p>
      </div>
    );
  }

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
                  {supportedChains?.map((chainId: string) => (
                    <button
                      key={chainId}
                      type="button"
                      onClick={() => handleChainSelect(chainId)}
                      className={`px-3 py-1 text-sm rounded ${
                        selectedChain === chainId
                          ? "bg-yellow-500 text-black"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {chainIdToName[chainId] || chainId}
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
                    Send {product.price * product.quantity} USDT to:
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
            disabled={isSubmitting || !selectedChain || isPending}
            className="w-full p-3 rounded font-medium flex items-center justify-center gap-2"
            style={{
              backgroundColor: theme.highlightColor,
              color: theme.isDark ? "#000" : "#fff",
              opacity: isSubmitting || !selectedChain || isPending ? 0.7 : 1,
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
    if (activeBotData.paymentMethods.stripe?.isActivated)
      methods.push("stripe");
    if (activeBotData.paymentMethods.razorpay?.isActivated)
      methods.push("razorpay");
    if (activeBotData.paymentMethods.crypto?.isActivated)
      methods.push("crypto");

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
              theme={theme}
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
      case "crypto":
        return (
          <CryptoPaymentForm
            theme={theme}
            onSuccess={onSuccess}
            onOrderDetails={onOrderDetails}
            product={product}
            shipping={shipping}
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
            className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 transition-colors `}
            style={{
              backgroundColor:
                selectedMethod === "stripe" ? theme.highlightColor : "#bdbdbd",
              color:
                selectedMethod === "stripe"
                  ? theme.isDark
                    ? "#000"
                    : "#fff"
                  : "#000000",
            }}
          >
            <CreditCard className="w-5 h-5" />
            <span>Credit Card</span>
          </button>
        )}

        {availablePaymentMethods.includes("razorpay") && (
          <button
            onClick={() => setSelectedMethod("razorpay")}
            className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 transition-colors`}
            style={{
              backgroundColor:
                selectedMethod === "razorpay"
                  ? theme.highlightColor
                  : "#bdbdbd",
              color:
                selectedMethod === "razorpay"
                  ? theme.isDark
                    ? "#000"
                    : "#fff"
                  : "#000000",
            }}
          >
            <Wallet className="w-5 h-5" />
            <span>Razorpay</span>
          </button>
        )}

        {availablePaymentMethods.includes("crypto") && (
          <button
            onClick={() => setSelectedMethod("crypto")}
            className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 transition-colors`}
            style={{
              backgroundColor:
                selectedMethod === "crypto" ? theme.highlightColor : "#bdbdbd",
              color:
                selectedMethod === "crypto"
                  ? theme.isDark
                    ? "#000"
                    : "#fff"
                  : "#000000",
            }}
          >
            <Wallet className="w-5 h-5" />
            <span>Crypto (USDT)</span>
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
