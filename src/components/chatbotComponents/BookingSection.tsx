import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Theme } from "../../types";
import BookingFlowComponent from "./chatbotBookingComponents/BookingFlowComponent";
import { useBookingLogic } from "../../hooks/useBookingLogic";

interface BookingSectionProps {
  theme: Theme;
  businessId: string;
  sessionName: string;
  isBookingConfigured: boolean;
  showOnlyBooking?: boolean;
  onDropdownToggle?: (isOpen: boolean) => void;
}

export default function BookingSection({
  theme,
  businessId,
  sessionName,
  isBookingConfigured: propIsBookingConfigured,
  showOnlyBooking = false,
  onDropdownToggle,
}: BookingSectionProps) {
  const [showBooking, setShowBooking] = useState<boolean>(showOnlyBooking);
  const [localIsBookingConfigured, setLocalIsBookingConfigured] = useState<boolean>(
    propIsBookingConfigured !== undefined ? propIsBookingConfigured : false
  );
  
  // Use our booking hook for pricing data
  const { pricingInfo, loadingPricing } = useBookingLogic(businessId, sessionName);

  useEffect(() => {
    if (propIsBookingConfigured !== undefined) {
      setLocalIsBookingConfigured(propIsBookingConfigured);
    }
  }, [propIsBookingConfigured]);
  
  useEffect(() => {
    if (onDropdownToggle) {
      onDropdownToggle(showBooking);
    }
  }, [showBooking, onDropdownToggle]);

  const toggleBookingDropdown = (): void => {
    const newState = !showBooking;
    setShowBooking(newState);
    if (onDropdownToggle) {
      onDropdownToggle(newState);
    }
  };

  if (showOnlyBooking && !localIsBookingConfigured) {
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

  if (showOnlyBooking && localIsBookingConfigured) {
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
          servicePrice={pricingInfo.sessionPrice}
          theme={theme}
          onClose={() => {
            setShowBooking(false);
            if (onDropdownToggle) onDropdownToggle(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="pt-4 px-2">
      <h2
        className="text-md mb-2"
        style={{ color: theme.isDark ? "#fff" : "#000", fontWeight: 500 }}
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
        onClick={toggleBookingDropdown}
      >
        <div>
          <div className="text-sm font-medium" style={{ fontWeight: 600 }}>
            {pricingInfo.sessionName || sessionName}
          </div>
          <div className="text-md font-medium text-left">
            {loadingPricing ? "Loading..." : pricingInfo.sessionPrice}
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
            serviceName={pricingInfo.sessionName || sessionName}
            servicePrice={pricingInfo.sessionPrice}
            theme={theme}
            onClose={() => {
              setShowBooking(false);
              if (onDropdownToggle) onDropdownToggle(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
