import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Plus } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import TryFreeBanner from "./TryFreeBanner";
import { Theme } from "../../types";
import BookingFlowComponent from "./BookingFlowComponent";
import { getAppointmentSettings } from "../../lib/serverActions";

// Currency symbols mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  CAD: "C$",
  AUD: "A$",
  JPY: "¥",
};

interface BrowseSectionProps {
  theme: Theme;
  currentConfig?: {
    agentId?: string;
    name?: string;
    sessionName?: string;
    sessionPrice?: string;
    isFreeSession?: boolean;
  };
  showOnlyBooking?: boolean;
}

export default function BrowseSection({
  theme,
  currentConfig,
  showOnlyBooking = false,
}: BrowseSectionProps) {
  const { products } = useCartStore();
  const [showBooking, setShowBooking] = useState(showOnlyBooking);

  // State for dynamic pricing from backend
  const [dynamicPrice, setDynamicPrice] = useState({
    isFree: currentConfig?.isFreeSession || false,
    amount: 0,
    currency: "USD",
    displayPrice: currentConfig?.isFreeSession
      ? "Free"
      : currentConfig?.sessionPrice || "Free",
  });

  const [loadingPrice, setLoadingPrice] = useState(false);

  // Format price for display
  const formatPrice = (price: {
    isFree: boolean;
    amount: number;
    currency: string;
  }): string => {
    if (price.isFree) return "Free";
    const symbol = CURRENCY_SYMBOLS[price.currency] || "$";
    return `${symbol}${price.amount}`;
  };

  // Extract values from config with defaults
  const businessId = currentConfig?.agentId || "";
  const botName = currentConfig?.name || "AI Assistant";
  const sessionName = currentConfig?.sessionName || "Session Description";

  // Load price from backend API
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
        } else {
          // Use defaults from currentConfig if no price data found
          setDynamicPrice({
            isFree: currentConfig?.isFreeSession || false,
            amount: currentConfig?.sessionPrice
              ? parseFloat(
                  currentConfig.sessionPrice.replace(/[^0-9.]/g, "")
                ) || 0
              : 0,
            currency: "USD",
            displayPrice: currentConfig?.isFreeSession
              ? "Free"
              : currentConfig?.sessionPrice || "Free",
          });
        }
      } catch (error) {
        console.error("Failed to load price settings:", error);
      } finally {
        setLoadingPrice(false);
      }
    };

    fetchPriceSettings();
  }, [businessId, currentConfig]);

  // If showOnlyBooking is true, only show the booking section
  if (showOnlyBooking) {
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
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: theme.isDark ? "#1c1c1c" : "#e9e9e9",
      }}
    >
      {/* Book Meeting Section */}
      <div className="pt-4 px-4">
        <h2 className="text-sm font-medium mb-2">Book Meeting</h2>

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

      {/* Browse Products Section - Only show when booking is closed and not in booking-only mode */}
      {!showBooking && !showOnlyBooking && (
        <div className="px-4 mt-6">
          <h2 className="text-sm font-medium mb-2">Browse</h2>
          <div className="grid grid-cols-2 gap-4">
            {products.map((product, index) => (
              <div
                key={index}
                className="rounded-xl overflow-hidden"
                style={{
                  backgroundColor: theme.isDark ? "#000000" : "#ffffff",
                  color: !theme.isDark ? "#000000" : "#ffffff",
                }}
              >
                {/* Product Image */}
                <div className="aspect-square">
                  <img
                    src={
                      product.image ||
                      "https://image.made-in-china.com/2f0j00vYDGElfRmuko/Customize-9cm-Small-Tea-Spoon-Natural-Bamboo-Spoon.jpg"
                    }
                    alt={product.title}
                    className="w-full h-full object-cover p-2 rounded-xl"
                  />
                </div>
                {/* Product Info */}
                <div className="px-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm line-clamp-2">{product.title}</div>
                    <div className="text-sm font-semibold py-2">
                      ${product.price}
                    </div>
                  </div>
                  <button
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: theme.highlightColor }}
                  >
                    <Plus className="w-4 h-4 text-black" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Always show TryFreeBanner */}
      <TryFreeBanner />
    </div>
  );
}
