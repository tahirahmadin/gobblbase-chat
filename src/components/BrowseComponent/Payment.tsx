import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, CheckCircle2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import { useCartStore } from "../../store/useCartStore";
import { useBotConfig } from "../../store/useBotConfig";
import { Product } from "../../types/cart";
import { useUserStore } from "../../store/useUserStore";

// Initialize Stripe
const stripePromise = loadStripe(
  "pk_test_51QmCr1HKEjO0z2HywTIERQIhoe6VpFHQOdLFrzAB8zb3qEj94S9v4MzxW3Wkdlh5YN0PogAcMSXoGl0xuDqBgCzw00nmJ8Segm"
);

interface PaymentProps {
  onBack: () => void;
  onOpenDrawer?: () => void;
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
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { config } = useBotConfig();

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

      // Payment successful, create order
      const response = await fetch("/api/user/create-new-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          totalAmount: getTotalPrice(),
          agentId: config?.agentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
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
        <h3 className="text-lg font-medium mb-4">Order Summary</h3>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-12 h-12 object-cover rounded-md"
                />
                <div>
                  <h4 className="text-sm font-medium">{item.title}</h4>
                  <p className="text-xs text-gray-500">
                    {item.currency} {item.price} x {item.quantity}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total</span>
            <span className="text-lg font-semibold">
              USD {getTotalPrice().toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium mb-4">Payment Details</h3>
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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

const Payment: React.FC<PaymentProps> = ({ onBack, onOpenDrawer }) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { items, getTotalPrice } = useCartStore();
  const { config } = useBotConfig();
  const { userId } = useUserStore();

  useEffect(() => {
    console.log("calling");
    console.log("userId");
    console.log(userId);
    const createPaymentIntent = async () => {
      try {
        const response = await fetch("/api/product/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lineItems: items.map((item) => ({
              id: item.id,
              quantity: item.quantity,
            })),
            agentId: config?.agentId || "",
            userId: userId, // Add user ID if available
            cart: items,
            stripeAccountId: config?.stripeAccountId || "",
            amount: getTotalPrice() * 100,
            currency: config?.currency || "USD",
          }),
        });

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
  }, [items, config]);

  if (isSuccess) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Order Placed Successfully!
          </h2>
          <p className="text-gray-600 mb-4">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          <div className="space-y-3">
            <button
              onClick={onBack}
              className="w-full bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => {
                if (onOpenDrawer) {
                  onOpenDrawer();
                }
              }}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
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
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold">Payment</h2>
      </div>

      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PaymentForm onSuccess={() => setIsSuccess(true)} onBack={onBack} />
      </Elements>
    </div>
  );
};

export default Payment;
