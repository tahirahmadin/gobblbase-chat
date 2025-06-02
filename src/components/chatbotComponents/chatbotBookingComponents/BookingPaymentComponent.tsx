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
import { CreditCard, Wallet } from "lucide-react";
import { Theme } from "../../types";
import { bookAppointment } from "../../../lib/serverActions";
import { backendApiUrl } from "../../../utils/constants";
import { useCryptoPayment } from "../../../hooks/useCryptoHook";

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

type PaymentMethod = "stripe" | "razorpay" | "crypto";

function StripeBookingForm({
  theme,
  onSuccess,
  bookingDetails,
  price,
}: {
  theme: any;
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
          `PAY ${price.displayPrice}`
        )}
      </button>
    </form>
  );
}

function RazorpayBookingForm({
  theme,
  onSuccess,
  bookingDetails,
  price,
}: {
  theme: any;
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
          "PROCEED TO PAYMENT"
        )}
      </button>
    </form>
  );
}

function CryptoBookingForm({
  theme,
  onSuccess,
  bookingDetails,
  price,
}: {
  theme: any;
  onSuccess: () => void;
  bookingDetails: BookingPaymentProps["bookingDetails"];
  price: BookingPaymentProps["price"];
}) {
  const { activeBotData, activeBotId } = useBotConfig();
  const { userId, userEmail, isLoggedIn } = useUserStore();
  const walletAddress = activeBotData?.paymentMethods.crypto.walletAddress;
  const supportedChains = activeBotData?.paymentMethods.crypto.chains;

  const chainIdToName: Record<string, string> = {
    "0x1": "USDT on Eth",
    "0x2105": "USDT on Base",
    "0x38": "USDT on BSC",
    "0x61": "USDT on BSC Testnet",
  };

  const bookingProduct = useMemo(() => ({
    _id: `booking_${bookingDetails.businessId}_${Date.now()}`,
    price: price.amount,
    title: `Booking: ${bookingDetails.date} ${bookingDetails.startTime}`,
    description: `Booking for ${bookingDetails.name} on ${bookingDetails.date}`,
    quantity: 1,
    checkType: "booking",
    metadata: {
      type: "booking",
      bookingDetails: bookingDetails,
    },
  }), [bookingDetails, price.amount]);


  const shippingData = useMemo(() => ({
    name: bookingDetails.name,
    email: bookingDetails.email,
    phone: bookingDetails.phone,
    country: "US", 
    address1: bookingDetails.location,
    address2: "",
    city: "",
    zipcode: "",
    saveDetails: false,
  }), [bookingDetails]);

  const {
    isConnected,
    address,
    isSubmitting,
    isPending,
    selectedChain,
    handleConnectWallet,
    handleChainSelect,
    handleSubmit: cryptoHandleSubmit,
    disconnect,
  } = useCryptoPayment({
    product: bookingProduct,
    onSuccess: () => {
      // Handle booking-specific success
      bookAppointment({
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
        paymentId: `crypto_${Date.now()}`,
        paymentMethod: "USDT",
        paymentAmount: price.amount,
        paymentCurrency: "USDT",
      }).then(() => {
        toast.success("Booking confirmed!");
        onSuccess();
      }).catch((err) => {
        console.error("Booking error:", err);
        toast.error("Booking failed. Please try again.");
      });
    },
    onOrderDetails: () => {}, // Not needed for bookings
    walletAddress: walletAddress || "",
    activeBotId: activeBotId,
    userId: userId,
    userEmail: userEmail,
    shipping: shippingData,
  });

  return (
    <form onSubmit={cryptoHandleSubmit} className="space-y-4">
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
                    Send {price.displayPrice} USDT to:
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
          `${backendApiUrl}/product/create-booking-payment-intent`,
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
              theme={theme}
              onSuccess={onSuccess}
              bookingDetails={bookingDetails}
              price={price}
            />
          </Elements>
        );
      case "razorpay":
        return (
          <RazorpayBookingForm
            theme={theme}
            onSuccess={onSuccess}
            bookingDetails={bookingDetails}
            price={price}
          />
        );
      case "crypto":
        return (
          <CryptoBookingForm
            theme={theme}
            onSuccess={onSuccess}
            bookingDetails={bookingDetails}
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
          <div className="mt-2 text-red-500 text-center">
            {freeBookingError}
          </div>
        )}
      </div>
    );
  }

  // If no payment methods are enabled, show error message (same as PaymentSection)
  if (!hasEnabledPaymentMethods) {
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

      {/* Payment Method Selection - Only show enabled methods (same logic as PaymentSection) */}
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

      {/* Show info about available payment methods (same as PaymentSection) */}
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
