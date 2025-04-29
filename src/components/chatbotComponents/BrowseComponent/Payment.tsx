import React, { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, CheckCircle2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import { useCartStore } from "../../../store/useCartStore";
import { useBotConfig } from "../../../store/useBotConfig";
import { useUserStore } from "../../../store/useUserStore";

interface PaymentProps {
  onBack: () => void;
  onOpenDrawer?: () => void;
  setActiveScreen: (screen: "chat" | "book" | "browse" | "cart") => void;
}

const PaymentForm = ({
  onSuccess,
  onBack,
}: {
  onSuccess: () => void;
  onBack: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { clearCart } = useCartStore();
  const { activeBotData } = useBotConfig();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: "if_required",
      });

      if (error) {
        throw error;
      }

      clearCart();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium mb-4">Payment Details</h3>
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full py-3 px-4 rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        style={{
          backgroundColor: activeBotData?.themeColors?.headerIconColor,
          color: activeBotData?.themeColors?.headerColor,
        }}
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            <span>Pay Now</span>
          </>
        )}
      </button>
    </form>
  );
};

const Payment: React.FC<PaymentProps> = ({
  onBack,
  onOpenDrawer,
  setActiveScreen,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { items, getTotalPrice } = useCartStore();
  const { activeBotId, activeBotData } = useBotConfig();
  const { userId, userEmail } = useUserStore();

  let stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY, {
    stripeAccount: activeBotData?.stripeAccountId,
  });

  useEffect(() => {
    const createPaymentIntent = async () => {
      if (isLoading || clientSecret || !items || !activeBotData) {
        return;
      }

      setIsLoading(true);
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
              stripeAccountId: activeBotData?.stripeAccountId || "",
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
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [items, activeBotData, clientSecret, isLoading]);

  const handleBackFromPayment = () => {
    setIsSuccess(false);
    setClientSecret(null);
  };

  if (isSuccess) {
    return (
      <div className="container py-4">
        <div
          className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6"
          style={{
            backgroundColor: activeBotData?.themeColors?.bubbleAgentBgColor,
            color: activeBotData?.themeColors?.bubbleAgentTextColor,
          }}
        >
          <div className="text-center mb-6">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h2
              className="text-2xl font-semibold mb-2"
              style={{
                color: activeBotData?.themeColors?.headerIconColor,
              }}
            >
              Order Placed Successfully!
            </h2>
            <p
              className="text-gray-600 mb-6"
              style={{
                color: activeBotData?.themeColors?.bubbleAgentTextColor,
              }}
            >
              Thank you for your purchase. Your order has been confirmed.
            </p>
          </div>

          <div className="border-t border-b border-gray-200 py-4 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-medium">
                  #{Math.random().toString(36).substr(2, 9).toUpperCase()}
                </p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{userEmail}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600">
              Our team will reach out to you shortly with order confirmation and
              delivery details.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setIsSuccess(false);
                setClientSecret(null);
                setActiveScreen("browse");
              }}
              className="w-full px-4 py-3 rounded-md hover:bg-orange-600 transition-colors"
              style={{
                backgroundColor: activeBotData?.themeColors?.headerIconColor,
                color: activeBotData?.themeColors?.headerColor,
              }}
            >
              Continue Shopping
            </button>
            <button
              onClick={() => {
                if (onOpenDrawer) {
                  onOpenDrawer();
                }
              }}
              className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-md hover:bg-gray-200 transition-colors"
            >
              Check Order History
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="container py-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="flex items-center space-x-2 mb-6">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
          <ArrowLeft
            className="h-5 w-5"
            style={{
              color: activeBotData?.themeColors?.headerIconColor,
            }}
          />
        </button>
        <h2
          className="text-lg font-semibold"
          style={{
            color: activeBotData?.themeColors?.headerIconColor,
          }}
        >
          Payment
        </h2>
      </div>

      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PaymentForm
          onSuccess={() => setIsSuccess(true)}
          onBack={handleBackFromPayment}
        />
      </Elements>
    </div>
  );
};

export default Payment;
