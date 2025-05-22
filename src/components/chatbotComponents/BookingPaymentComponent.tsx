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
import { CreditCard, Wallet } from "lucide-react";
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

type PaymentMethod = "stripe" | "razorpay" | "usdt" | "usdc";

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
          `PAY ${price.displayPrice}`
        )}
      </button>
    </form>
  );
}

function RazorpayBookingForm({
  onSuccess,
  bookingDetails,
  price,
}: {
  onSuccess: () => void;
  bookingDetails: BookingPaymentProps["bookingDetails"];
  price: BookingPaymentProps["price"];
}) {
  const { isLoggedIn, userEmail } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const paymentId = "razorpay_" + Date.now();

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
        paymentMethod: "Razorpay",
        paymentAmount: price.amount,
        paymentCurrency: price.currency,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 rounded-lg border" style={{ borderColor: "#FFD700" }}>
        <p className="text-center" style={{ color: "#FFD700" }}>
          You will be redirected to Razorpay payment gateway
        </p>
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
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
            Processing...
          </div>
        ) : (
          "PROCEED TO PAYMENT"
        )}
      </button>
    </form>
  );
}

function CryptoBookingForm({
  onSuccess,
  bookingDetails,
  type,
  price,
}: {
  onSuccess: () => void;
  bookingDetails: BookingPaymentProps["bookingDetails"];
  type: "usdt" | "usdc";
  price: BookingPaymentProps["price"];
}) {
  const { activeBotData } = useBotConfig();
  const { isLoggedIn, userEmail } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const paymentId = `${type}_${Date.now()}`;

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
        paymentMethod: type.toUpperCase(),
        paymentAmount: price.amount,
        paymentCurrency: type.toUpperCase(),
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

  const walletAddress = activeBotData?.paymentMethods[type]?.walletAddress;
  const chains = activeBotData?.paymentMethods[type]?.chains;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 rounded-lg border" style={{ borderColor: "#FFD700" }}>
        <p
          className="text-center mb-2"
          style={{ color: activeBotData?.themeColors.isDark ? "#fff" : "#000" }}
        >
          Send {price.displayPrice} {type.toUpperCase()} to the following address
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
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
            Processing...
          </div>
        ) : (
          "CONFIRM PAYMENT"
        )}
      </button>
    </form>
  );
}

export function BookingPaymentComponent({
  theme,
  onSuccess,
  onBack,
  bookingDetails,
  price,
}: BookingPaymentProps) {
  const { activeBotId, activeBotData } = useBotConfig();
  const { userId, userEmail, isLoggedIn } = useUserStore();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("stripe");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [freeBookingLoading, setFreeBookingLoading] = useState(false);
  const [freeBookingError, setFreeBookingError] = useState<string | null>(null);

  // Handle free booking
  const isFreeBooking = price?.amount === 0;

  const handleFreeBooking = async () => {
    setFreeBookingLoading(true);
    setFreeBookingError(null);
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
        paymentId: "free_" + Date.now(),
        paymentMethod: "Free",
        paymentAmount: 0,
        paymentCurrency: "USD",
      });

      toast.success("Booking confirmed!");
      onSuccess();
    } catch (err: any) {
      setFreeBookingError(err.message || "Failed to create booking");
      toast.error(err.message || "Failed to create booking");
    } finally {
      setFreeBookingLoading(false);
    }
  };

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
      if (!price || price.amount <= 0) {
        setError("Invalid booking price");
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
        console.log("Creating payment intent for booking:", bookingDetails);

        // Convert booking to a format compatible with the product API
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
              // Adding booking-specific shipping data
              shipping: {
                name: bookingDetails.name,
                email: bookingDetails.email,
                phone: bookingDetails.phone,
                country: "US", // Default or get from booking details
                address1: bookingDetails.location,
                address2: "",
                city: "",
                zipcode: "",
                saveDetails: false,
              },
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
            <StripeBookingForm
              onSuccess={onSuccess}
              bookingDetails={bookingDetails}
              price={price}
            />
          </Elements>
        );
      case "razorpay":
        return (
          <RazorpayBookingForm
            onSuccess={onSuccess}
            bookingDetails={bookingDetails}
            price={price}
          />
        );
      case "usdt":
      case "usdc":
        return (
          <CryptoBookingForm
            onSuccess={onSuccess}
            bookingDetails={bookingDetails}
            type={selectedMethod}
            price={price}
          />
        );
      default:
        return null;
    }
  };

  if (isFreeBooking) {
    return (
      <div className="p-4" style={{ paddingBottom: "100px" }}>
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onBack}
            className="flex items-center text-sm"
            style={{ color: theme.mainLightColor }}
          >
            <span className="mr-1">←</span> BACK
          </button>
        </div>

        <h3 className="mb-4" style={{ color: theme.isDark ? "#fff" : "#000" }}>
          This is a free booking
        </h3>
        
        {/* Booking Summary for free booking */}
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
              <span>Free</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleFreeBooking}
          className="w-full p-3 rounded font-medium"
          style={{
            backgroundColor: "#FFD700",
            color: "#000",
            opacity: freeBookingLoading ? 0.7 : 1,
          }}
          disabled={freeBookingLoading}
        >
          {freeBookingLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
              Processing...
            </div>
          ) : (
            "Confirm Booking"
          )}
        </button>
        {freeBookingError && (
          <div className="mt-2 text-red-500 text-center">{freeBookingError}</div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4" style={{ paddingBottom: "100px" }}>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={onBack}
          className="flex items-center text-sm"
          style={{ color: theme.mainLightColor }}
        >
          <span className="mr-1">←</span> BACK
        </button>
      </div>

      <h3 className="mb-4" style={{ color: theme.isDark ? "#fff" : "#000" }}>
        Pay with
      </h3>

      {/* Payment Method Selection */}
      <div className="flex gap-2 mb-4 pb-10">
        {activeBotData?.paymentMethods?.stripe?.enabled && (
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
        {activeBotData?.paymentMethods?.razorpay?.enabled && (
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
        {activeBotData?.paymentMethods?.usdt?.enabled && (
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
        {activeBotData?.paymentMethods?.usdc?.enabled && (
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
