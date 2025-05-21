import React, { useState, useEffect, useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useBotConfig } from "../../store/useBotConfig";
import { useUserStore } from "../../store/useUserStore";
import toast from "react-hot-toast";
import { CreditCard, Wallet, Loader2 } from "lucide-react";
import { Theme } from "../../types";
import { bookAppointment } from "../../lib/serverActions";

interface BookingPaymentProps {
  theme: Theme;
  onSuccess: () => void;
  onBack: () => void;
  bookingDetails: {
    businessId: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    name: string;
    email: string;
    phone: string;
    notes?: string;
    userTimezone: string;
  };
  price: {
    amount: number;
    currency: string;
    displayPrice: string;
  };
}

type PaymentMethod = "stripe" | "stablecoin";

function StripeBookingForm({
  onSuccess,
  bookingDetails,
  price,
}: {
  onSuccess: () => void;
  bookingDetails: BookingPaymentProps["bookingDetails"];
  price: BookingPaymentProps["price"];
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoggedIn, userEmail } = useUserStore();

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
        console.log("Payment successful with ID:", paymentIntent.id);

        // Use the existing bookAppointment function from your lib/serverActions
        try {
          await bookAppointment({
            agentId: bookingDetails.businessId,
            userId: isLoggedIn && userEmail ? userEmail : bookingDetails.email,
            email: bookingDetails.email,
            date: bookingDetails.date,
            startTime: bookingDetails.startTime,
            endTime: bookingDetails.endTime,
            location: bookingDetails.location,
            name: bookingDetails.name,
            phone: bookingDetails.phone,
            notes: bookingDetails.notes || "",
            userTimezone: bookingDetails.userTimezone,
            paymentId: paymentIntent.id,
            paymentMethod: "Credit Card",
            paymentAmount: price.amount,
            paymentCurrency: price.currency,
          });

          toast.success("Booking confirmed!");
          onSuccess();
        } catch (err) {
          console.error("Booking error:", err);
          toast.error("Booking failed. Please try again.");
        }
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
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
            Processing...
          </div>
        ) : (
          `PAY ${price.displayPrice}`
        )}
      </button>
    </form>
  );
}

function StablecoinBookingForm({
  onSuccess,
  bookingDetails,
  price,
}: {
  onSuccess: () => void;
  bookingDetails: BookingPaymentProps["bookingDetails"];
  price: BookingPaymentProps["price"];
}) {
  const { activeBotData } = useBotConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoggedIn, userEmail } = useUserStore();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // Generate a simple payment ID for stablecoin payment
      const paymentId = "stablecoin_" + Date.now();

      // Use the existing bookAppointment function from your lib/serverActions
      await bookAppointment({
        agentId: bookingDetails.businessId,
        userId: isLoggedIn && userEmail ? userEmail : bookingDetails.email,
        email: bookingDetails.email,
        date: bookingDetails.date,
        startTime: bookingDetails.startTime,
        endTime: bookingDetails.endTime,
        location: bookingDetails.location,
        name: bookingDetails.name,
        phone: bookingDetails.phone,
        notes: bookingDetails.notes || "",
        userTimezone: bookingDetails.userTimezone,
        paymentId: paymentId,
        paymentMethod: "USDC",
        paymentAmount: price.amount,
        paymentCurrency: "USDC",
      });

      toast.success("Booking confirmed!");
      onSuccess();
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error("Booking failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const walletAddress =
    activeBotData?.paymentMethods?.usdc?.walletAddress ||
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
  const chains = activeBotData?.paymentMethods?.usdc?.chains || [
    "Ethereum",
    "Polygon",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 rounded-lg border" style={{ borderColor: "#FFD700" }}>
        <p className="text-center mb-2">
          Send {price.displayPrice} USDC to the following address:
        </p>
        <div className="mt-2 text-center">
          <p className="font-mono text-sm break-all">{walletAddress}</p>
          <p className="text-sm mt-2">Supported chains: {chains?.join(", ")}</p>
        </div>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full p-3 rounded font-medium"
        style={{
          backgroundColor: "#FFD700",
          color: "#000",
          opacity: isSubmitting ? 0.7 : 1,
        }}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
            Processing...
          </div>
        ) : (
          "CONFIRM PAYMENT"
        )}
      </button>
    </form>
  );
}

// This component works with your existing BookingFlowComponent
// and uses the bookAppointment function from your lib/serverActions
export function BookingPaymentComponent({
  theme,
  onSuccess,
  onBack,
  bookingDetails,
  price,
}: BookingPaymentProps) {
  const { activeBotId, activeBotData } = useBotConfig();
  const { userId, userEmail } = useUserStore();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("stripe");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Stripe in the same way as PaymentSection
  const stripePromise = useMemo(() => {
    if (!activeBotData?.paymentMethods?.stripe?.accountId) {
      console.log("No Stripe account ID found in bot data");
      return null;
    }
    return loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY, {
      stripeAccount: activeBotData.paymentMethods.stripe.accountId,
    });
  }, [activeBotData?.paymentMethods?.stripe?.accountId]);

  useEffect(() => {
    const createPaymentIntent = async () => {
      // Skip if price is invalid
      if (!price || price.amount <= 0) {
        setError("Invalid booking price");
        return;
      }

      // Skip if we already have a client secret or other conditions aren't met
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
        console.log("Creating payment intent for booking:", {
          booking: bookingDetails,
          amount: price.amount,
        });

        // Convert booking to a format your product API can understand
        const bookingAsProduct = {
          _id: `booking_${bookingDetails.businessId}_${Date.now()}`,
          price: price.amount,
          title: `Booking: ${bookingDetails.date} ${bookingDetails.startTime}`,
          description: `Booking for ${bookingDetails.name} on ${bookingDetails.date}`,
          metadata: {
            type: "booking",
            bookingDetails: bookingDetails,
          },
        };

        // Use the same product payment endpoint that works in PaymentSection
        const response = await fetch(
          "https://rag.gobbl.ai/product/create-payment-intent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cart: [bookingAsProduct],
              agentId: activeBotId || bookingDetails.businessId,
              userId: userId || bookingDetails.email,
              userEmail: userEmail || bookingDetails.email,
              stripeAccountId: activeBotData.paymentMethods.stripe.accountId,
              amount: Math.round(price.amount * 100),
              currency: price.currency || "USD",
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
    bookingDetails,
    price,
    activeBotData,
    clientSecret,
    activeBotId,
    userId,
    userEmail,
    selectedMethod,
    stripePromise,
  ]);

  // Handle manual payment without Stripe
  const handleManualPayment = async () => {
    setIsLoading(true);

    try {
      // Generate a payment ID
      const paymentId = `manual_${selectedMethod}_${Date.now()}`;

      // Use the existing bookAppointment function from your lib/serverActions
      await bookAppointment({
        agentId: bookingDetails.businessId,
        userId: isLoggedIn && userEmail ? userEmail : bookingDetails.email,
        email: bookingDetails.email,
        date: bookingDetails.date,
        startTime: bookingDetails.startTime,
        endTime: bookingDetails.endTime,
        location: bookingDetails.location,
        name: bookingDetails.name,
        phone: bookingDetails.phone,
        notes: bookingDetails.notes || "",
        userTimezone: bookingDetails.userTimezone,
        paymentId: paymentId,
        paymentMethod: selectedMethod === "stablecoin" ? "USDC" : "Credit Card",
        paymentAmount: price.amount,
        paymentCurrency:
          selectedMethod === "stablecoin" ? "USDC" : price.currency,
      });

      toast.success("Booking confirmed!");
      onSuccess();
    } catch (error: any) {
      console.error("Booking error:", error);
      setError(error.message || "Booking failed. Please try again.");
      toast.error("Booking failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

              {/* Provide fallback manual payment option */}
              <button
                onClick={handleManualPayment}
                className="mt-4 w-full p-3 rounded font-medium"
                style={{
                  backgroundColor: "#FFD700",
                  color: "#000",
                }}
              >
                Continue with Manual Payment
              </button>
            </div>
          );
        }
        if (isLoading) {
          return (
            <div className="flex items-center justify-center h-32">
              <Loader2
                className="animate-spin h-8 w-8"
                style={{ color: theme.mainLightColor }}
              />
            </div>
          );
        }
        if (!stripePromise) {
          return (
            <div className="p-4 text-red-500 text-center">
              Stripe is not properly configured.
              <button
                onClick={handleManualPayment}
                className="mt-4 w-full p-3 rounded font-medium"
                style={{
                  backgroundColor: "#FFD700",
                  color: "#000",
                }}
              >
                Continue with Manual Payment
              </button>
            </div>
          );
        }
        if (!clientSecret) {
          return (
            <div className="p-4 text-red-500 text-center">
              Unable to initialize payment.
              <button
                onClick={handleManualPayment}
                className="mt-4 w-full p-3 rounded font-medium"
                style={{
                  backgroundColor: "#FFD700",
                  color: "#000",
                }}
              >
                Continue with Manual Payment
              </button>
            </div>
          );
        }
        return (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripeBookingForm
              onSuccess={onSuccess}
              bookingDetails={bookingDetails}
              price={price}
            />
          </Elements>
        );
      case "stablecoin":
        return (
          <StablecoinBookingForm
            onSuccess={onSuccess}
            bookingDetails={bookingDetails}
            price={price}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 ">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={onBack}
          className="flex items-center text-sm"
          style={{ color: theme.mainLightColor }}
        >
          <span className="mr-1">←</span> BACK
        </button>
      </div>

      <h3
        className="mb-4 font-medium"
        style={{ color: theme.isDark ? "#fff" : "#000" }}
      >
        PAY WITH
      </h3>

      {/* Payment Method Selection */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => {
            setSelectedMethod("stripe");
            setError(null);
          }}
          className="flex-1 p-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          style={{
            backgroundColor:
              selectedMethod === "stripe"
                ? theme.highlightColor
                : theme.isDark
                ? "#333"
                : "#f0f0f0",
            color:
              selectedMethod === "stripe"
                ? theme.isDark
                  ? "#000"
                  : "#fff"
                : theme.isDark
                ? "#fff"
                : "#000",
          }}
        >
          <CreditCard className="w-5 h-5" />
          <span>Credit Card</span>
        </button>

        <button
          onClick={() => {
            setSelectedMethod("stablecoin");
            setError(null);
          }}
          className="flex-1 p-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          style={{
            backgroundColor:
              selectedMethod === "stablecoin"
                ? theme.highlightColor
                : theme.isDark
                ? "#333"
                : "#f0f0f0",
            color:
              selectedMethod === "stablecoin"
                ? theme.isDark
                  ? "#000"
                  : "#fff"
                : theme.isDark
                ? "#fff"
                : "#000",
          }}
        >
          <Wallet className="w-5 h-5" />
          <span>Stablecoin</span>
        </button>
      </div>

      {/* Booking Summary */}
      <div
        className="p-3 rounded-md mb-4"
        style={{ backgroundColor: theme.isDark ? "#222" : "#f5f5f5" }}
      >
        <h4
          className="font-medium mb-2"
          style={{ color: theme.highlightColor }}
        >
          BOOKING SUMMARY
        </h4>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Service:</span>
            <span>Consultation</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Date:</span>
            <span>{bookingDetails.date}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Time:</span>
            <span>
              {bookingDetails.startTime} - {bookingDetails.endTime}
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold">
            <span>Total:</span>
            <span>{price.displayPrice}</span>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      {renderPaymentMethod()}
    </div>
  );
}
