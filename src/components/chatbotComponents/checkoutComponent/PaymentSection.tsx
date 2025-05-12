import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCartStore } from "../../../store/useCartStore";
import { useBotConfig } from "../../../store/useBotConfig";
import { useUserStore } from "../../../store/useUserStore";
import toast from "react-hot-toast";
import { CreditCard, Wallet } from "lucide-react";

interface PaymentSectionProps {
  theme: {
    isDark: boolean;
    highlightColor: string;
  };
  onSuccess: () => void;
  onOrderDetails: (details: {
    items: any[];
    total: number;
    orderId?: string;
    paymentMethod?: string;
    paymentDate?: string;
  }) => void;
}

type PaymentMethod = "stripe" | "razorpay" | "usdt" | "usdc";

function StripePaymentForm({
  onSuccess,
  onOrderDetails,
}: {
  onSuccess: () => void;
  onOrderDetails: (details: any) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast.error("Payment system is not ready. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      // First validate the form
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      // Then confirm the payment
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
        // Store order details before clearing cart
        onOrderDetails({
          items: items,
          total: getTotalPrice(),
          orderId: paymentIntent.id,
          paymentMethod: "Credit Card",
          paymentDate: new Date().toLocaleDateString(),
        });
        clearCart();
        onSuccess();
      } else {
        throw new Error("Payment was not successful");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment failed. Please try again.");
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
}: {
  onSuccess: () => void;
  onOrderDetails: (details: any) => void;
}) {
  const { items, getTotalPrice, clearCart } = useCartStore();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onOrderDetails({
      items: items,
      total: getTotalPrice(),
      paymentMethod: "Razorpay",
      paymentDate: new Date().toLocaleDateString(),
    });
    clearCart();
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
}: {
  onSuccess: () => void;
  onOrderDetails: (details: any) => void;
  type: "usdt" | "usdc";
}) {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { activeBotData } = useBotConfig();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onOrderDetails({
      items: items,
      total: getTotalPrice(),
      paymentMethod: type.toUpperCase(),
      paymentDate: new Date().toLocaleDateString(),
    });
    clearCart();
    onSuccess();
  };

  const walletAddress = activeBotData?.paymentMethods[type]?.walletAddress;
  const chains = activeBotData?.paymentMethods[type]?.chains;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 rounded-lg border" style={{ borderColor: "#FFD700" }}>
        <p
          className="text-center mb-2"
          style={{ color: activeBotData?.themeColors.isDark ? "#fff" : "#000" }}
        >
          Send {type.toUpperCase()} to the following address
        </p>
        <div className="mt-2 text-center">
          <p
            className="font-mono text-sm break-all"
            style={{
              color: activeBotData?.themeColors.isDark ? "#fff" : "#000",
            }}
          >
            {walletAddress}
          </p>
          <p
            className="text-sm mt-2"
            style={{
              color: activeBotData?.themeColors.isDark ? "#fff" : "#000",
            }}
          >
            Supported chains: {chains?.join(", ")}
          </p>
        </div>
      </div>
      <button
        type="submit"
        className="w-full p-3 rounded font-medium"
        style={{
          backgroundColor: "#FFD700",
          color: "#000",
        }}
      >
        CONFIRM PAYMENT
      </button>
    </form>
  );
}

export function PaymentSection({
  theme,
  onSuccess,
  onOrderDetails,
}: PaymentSectionProps) {
  const { items, getTotalPrice } = useCartStore();
  const { activeBotId, activeBotData } = useBotConfig();
  const { userId, userEmail } = useUserStore();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("stripe");

  let stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY, {
    stripeAccount: activeBotData?.paymentMethods.stripe.accountId,
  });

  useEffect(() => {
    const createPaymentIntent = async () => {
      if (
        clientSecret ||
        !items ||
        !activeBotData ||
        items.length === 0 ||
        selectedMethod !== "stripe"
      ) {
        return;
      }

      try {
        const response = await fetch(
          "https://rag.gobbl.ai/product/create-payment-intent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              lineItems: items.map((item) => ({
                id: item._id,
                quantity: item.quantity,
              })),
              agentId: activeBotId,
              userId: userId,
              userEmail: userEmail,
              cart: items,
              stripeAccountId:
                activeBotData?.paymentMethods.stripe.accountId || "",
              amount: getTotalPrice() * 100,
              currency: activeBotData?.currency || "USD",
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to create payment intent");
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error: any) {
        toast.error(error.message || "Failed to initialize payment");
      }
    };

    createPaymentIntent();
  }, [
    items,
    activeBotData,
    clientSecret,
    activeBotId,
    userId,
    userEmail,
    getTotalPrice,
    selectedMethod,
  ]);

  const renderPaymentMethod = () => {
    switch (selectedMethod) {
      case "stripe":
        return clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripePaymentForm
              onSuccess={onSuccess}
              onOrderDetails={onOrderDetails}
            />
          </Elements>
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          </div>
        );
      case "razorpay":
        return (
          <RazorpayPaymentForm
            onSuccess={onSuccess}
            onOrderDetails={onOrderDetails}
          />
        );
      case "usdt":
      case "usdc":
        return (
          <CryptoPaymentForm
            onSuccess={onSuccess}
            onOrderDetails={onOrderDetails}
            type={selectedMethod}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <h3 className="mb-4" style={{ color: theme.isDark ? "#fff" : "#000" }}>
        Pay with
      </h3>

      {/* Payment Method Selection */}
      <div className="flex gap-2 mb-4">
        {activeBotData?.paymentMethods.stripe?.enabled && (
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
        {activeBotData?.paymentMethods.razorpay?.enabled && (
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
        {activeBotData?.paymentMethods.usdt?.enabled && (
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
        {activeBotData?.paymentMethods.usdc?.enabled && (
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

      {/* Payment Form */}
      {renderPaymentMethod()}
    </div>
  );
}
