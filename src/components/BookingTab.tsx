import React, { useState, useEffect } from "react";
import {
  CalendarIcon,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import { getAppointmentSettings } from "../lib/serverActions";
import { useBotConfig } from "../store/useBotConfig";
import BookingIntegration from "./booking/BookingIntegration";

const BookingTab: React.FC = () => {
  const { activeBotId, activeBotData } = useBotConfig();
  const agentId = activeBotId || activeBotData?.agentId;

  const [isLoading, setIsLoading] = useState(true);
  const [showBookingIntegration, setShowBookingIntegration] = useState(false);
  const [bookingMode, setBookingMode] = useState<"setup" | "dashboard">("dashboard");
  const [bookingConfigured, setBookingConfigured] = useState(false);
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(null);

  // Check if booking is already configured using the API
  useEffect(() => {
    const checkBookingConfig = async () => {
      if (!agentId) return;

      if (currentAgentId !== agentId) {
        setBookingConfigured(false);
        setCurrentAgentId(agentId);
      }

      setIsLoading(true);
      try {
        // Fetch booking settings from API
        const settings = await getAppointmentSettings(agentId);
        // If settings exist, booking is configured
        setBookingConfigured(!!settings);
      } catch (error) {
        console.error("Error checking booking configuration:", error);
        setBookingConfigured(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkBookingConfig();
  }, [agentId, showBookingIntegration, currentAgentId]);

  const handleCloseConfiguration = () => {
    setShowBookingIntegration(false);
  };

  const openBookingSetup = () => {
    setBookingMode("setup");
    setShowBookingIntegration(true);
  };

  const openBookingDashboard = () => {
    setBookingMode("dashboard");
    setShowBookingIntegration(true);
  };

  if (showBookingIntegration) {
    return (
      <div className="p-6">
        <button
          onClick={handleCloseConfiguration}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Booking
        </button>
        <BookingIntegration
          initialView={bookingMode}
          isEditMode={bookingConfigured}
          onSetupComplete={handleCloseConfiguration}
          agentId={agentId}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Booking System Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-6 w-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Booking System
            </h2>
          </div>
          <p className="mt-2 text-gray-600">
            Set up your own appointment booking system with customizable time slots
          </p>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-800"></div>
            </div>
          ) : bookingConfigured ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Booking system is configured!</p>
                  <p className="text-green-700 text-sm mt-1">
                    Your booking system is ready to accept appointments.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                <button
                  onClick={openBookingSetup}
                  className="flex-1 py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
                >
                  Edit Booking Settings
                </button>
                <button
                  onClick={openBookingDashboard}
                  className="flex-1 py-3 px-4 rounded-lg bg-gray-800 hover:bg-gray-900 text-white font-medium"
                >
                  Go to Booking Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-700">
                Create a personalized booking experience for your clients. Configure your:
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Booking type (individual or team)</li>
                <li>Meeting duration and buffer times</li>
                <li>Available days and times</li>
                <li>Meeting location options (Google Meet, In-person)</li>
              </ul>
              <button
                onClick={openBookingSetup}
                className="w-full py-3 px-4 rounded-lg bg-gray-800 hover:bg-gray-900 text-white font-medium transition-colors"
              >
                Configure Booking System
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingTab;
