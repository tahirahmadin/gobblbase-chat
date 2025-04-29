import React, { useState, useEffect } from "react";
import { getAppointmentSettings } from "../lib/serverActions";
import CustomerBooking from "./adminComponents/bookingComponents/CustomerBooking";
import { CalendarOff, Settings } from "lucide-react";

interface CustomerBookingWrapperProps {
  businessId?: string;
  serviceName?: string;
  onRedirectToAdmin?: () => void; // Callback to redirect to admin panel
}

const CustomerBookingWrapper: React.FC<CustomerBookingWrapperProps> = ({
  businessId,
  serviceName,
  onRedirectToAdmin,
}) => {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkBookingConfiguration = async () => {
      if (!businessId) {
        setIsConfigured(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log(`Checking booking configuration for agent: ${businessId}`);
        const settings = await getAppointmentSettings(businessId);

        // Check if we have valid settings with required fields
        const hasValidSettings =
          !!settings &&
          settings.availability &&
          settings.meetingDuration &&
          settings.locations;

        console.log(
          `Agent ${businessId} has valid booking settings:`,
          hasValidSettings
        );
        setIsConfigured(hasValidSettings);
        setError(null);
      } catch (error) {
        console.error(
          `Error checking booking configuration for agent ${businessId}:`,
          error
        );
        setIsConfigured(false);
        setError(
          "Unable to verify booking configuration. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    checkBookingConfiguration();
  }, [businessId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-800 mb-4"></div>
        <p className="text-gray-600">Loading booking information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm">
        <div className="text-red-500 text-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="font-medium">Error Loading Booking</p>
        </div>
        <p className="text-gray-600 text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm text-center">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <CalendarOff className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          Booking Not Available
        </h3>
        <p className="text-gray-600 mb-6">
          The booking system hasn't been configured for this agent yet.
        </p>
        {onRedirectToAdmin ? (
          <button
            onClick={onRedirectToAdmin}
            className="flex items-center justify-center px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition-colors"
          >
            <Settings className="h-5 w-5 mr-2" />
            Setup Booking
          </button>
        ) : (
          <div className="flex items-center text-sm text-gray-500">
            <Settings className="h-4 w-4 mr-1" />
            <span>Admin needs to set up the booking system</span>
          </div>
        )}
      </div>
    );
  }

  // If configured, render the actual booking component
  return <CustomerBooking businessId={businessId} serviceName={serviceName} />;
};

export default CustomerBookingWrapper;
