import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Theme } from "../../types";
import BookingFlowComponent from "./BookingFlowComponent";
import { getAppointmentSettings } from "../../lib/serverActions";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  CAD: "C$",
  AUD: "A$",
  JPY: "¥",
};

interface BookingSectionProps {
  theme: Theme;
  businessId: string;
  sessionName: string;
  isBookingConfigured: boolean;
  showOnlyBooking?: boolean;
}

export default function BookingSection({
  theme,
  businessId,
  sessionName,
  isBookingConfigured,
  showOnlyBooking = false,
}: BookingSectionProps) {
  const [showBooking, setShowBooking] = useState(showOnlyBooking);
  const [dynamicPrice, setDynamicPrice] = useState({
    isFree: false,
    amount: 0,
    currency: "USD",
    displayPrice: "Free",
  });
  const [loadingPrice, setLoadingPrice] = useState(false);

  useEffect(() => {
    const fetchPriceSettings = async () => {
      if (!businessId) return;

      setLoadingPrice(true);
      try {
        const data = await getAppointmentSettings(businessId);
        console.log("Loaded settings for pricing:", data);

        if (data && data.price) {
          const formattedPrice = formatPrice(data.price);
          setDynamicPrice({
            isFree: data.price.isFree,
            amount: data.price.amount,
            currency: data.price.currency,
            displayPrice: formattedPrice,
          });
          console.log("Set dynamic price from API:", formattedPrice);
        }
      } catch (error) {
        console.error("Failed to load price settings:", error);
      } finally {
        setLoadingPrice(false);
      }
    };

    fetchPriceSettings();
  }, [businessId]);

  const formatPrice = (price: {
    isFree: boolean;
    amount: number;
    currency: string;
  }): string => {
    if (price.isFree) return "Free";
    const symbol = CURRENCY_SYMBOLS[price.currency] || "$";
    return `${symbol}${price.amount}`;
  };

  if (showOnlyBooking && !isBookingConfigured) {
    return (
      <div
        className="p-4 rounded-xl"
        style={{
          backgroundColor: theme.isDark ? "#000000" : "#ffffff",
          color: !theme.isDark ? "#000000" : "#ffffff",
        }}
      >
        <p>
          I'm sorry, but booking appointments is not available at this time.
        </p>
      </div>
    );
  }

  if (showOnlyBooking && isBookingConfigured) {
    return (
      <div
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: theme.isDark ? "#000000" : "#ffffff",
          color: !theme.isDark ? "#000000" : "#ffffff",
        }}
      >
        <BookingFlowComponent
          businessId={businessId}
          serviceName={sessionName}
          servicePrice={dynamicPrice.displayPrice}
          theme={theme}
          onClose={() => setShowBooking(false)}
        />
      </div>
    );
  }

  return (
    <div className="pt-4 px-2">
      <h2
        className="text-md font-medium mb-2"
        style={{ color: theme.isDark ? "#fff" : "#000" }}
      >
        Book Meeting
      </h2>

      {/* Session Description Button */}
      <button
        className="w-full rounded-xl p-4 flex items-center justify-between"
        style={{
          backgroundColor: theme.isDark ? "#000000" : "#ffffff",
          color: !theme.isDark ? "#000000" : "#ffffff",
        }}
        onClick={() => setShowBooking(!showBooking)}
      >
        <div>
          <div className="text-sm font-medium">{sessionName}</div>
          <div className="text-md font-medium text-left">
            {loadingPrice ? "Loading..." : dynamicPrice.displayPrice}
          </div>
        </div>
        {showBooking ? (
          <ChevronDown
            className="w-5 h-5"
            style={{ color: theme.highlightColor }}
          />
        ) : (
          <ChevronRight
            className="w-5 h-5"
            style={{ color: theme.highlightColor }}
          />
        )}
      </button>

      {/* Booking Component (appears as dropdown) */}
      {showBooking && (
        <div
          className="mt-2 rounded-xl overflow-hidden"
          style={{
            backgroundColor: theme.isDark ? "#000000" : "#ffffff",
            color: !theme.isDark ? "#000000" : "#ffffff",
            maxHeight: "450px",
            overflowY: "auto",
          }}
        >
          <BookingFlowComponent
            businessId={businessId}
            serviceName={sessionName}
            servicePrice={dynamicPrice.displayPrice}
            theme={theme}
            onClose={() => setShowBooking(false)}
          />
        </div>
      )}
    </div>
  );
}
