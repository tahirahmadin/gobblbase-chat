import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBotConfig } from "../../../store/useBotConfig";
import { getAppointmentSettings } from "../../../lib/serverActions";
import Booking from "./Booking";
import BookingDashboard from "./BookingDashboard";

interface BookingDashboardWrapperProps {
  isEditMode?: boolean;
}

const BookingDashboardWrapper: React.FC<BookingDashboardWrapperProps> = ({
  isEditMode = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const agentIdFromUrl = queryParams.get("agentId");

  const { activeBotData, activeBotId } = useBotConfig();
  const activeAgentId = agentIdFromUrl || activeBotId || activeBotData?.agentId;

  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [forceSetupView, setForceSetupView] = useState(false);

  useEffect(() => {
    const checkSetupStatus = async () => {
      if (!activeAgentId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const settings = await getAppointmentSettings(activeAgentId);

        // Check if we have all required settings to consider setup complete
        const hasBasicSettings = !!settings;
        const hasAvailability =
          settings?.availability &&
          settings.availability.some((day) => day.available);
        const hasLocations =
          settings?.locations && settings.locations.length > 0;

        const setupComplete =
          hasBasicSettings && hasAvailability && hasLocations;
        setIsSetupComplete(setupComplete);
      } catch (error) {
        console.error("Error checking booking setup status:", error);
        setIsSetupComplete(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isEditMode) {
      checkSetupStatus();
    } else {
      setIsLoading(false);
    }
  }, [activeAgentId, isEditMode]);

  // When setup is completed
  const handleSetupComplete = () => {
    setIsSetupComplete(true);
    setForceSetupView(false);
    navigate("/admin/commerce/calendar");
  };

  // For reopening the setup through the Edit Settings button
  const handleEditSetup = () => {
    navigate("/admin/commerce/calendar/edit");
  };

  return (
    <div
      className="h-full overflow-y-auto py-6"
      style={{ maxHeight: "calc(100vh - 64px)" }}
    >
      <div className=" overflow-x-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <svg
              className="animate-spin h-8 w-8 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="ml-3 text-lg">
              Checking calendar setup status...
            </span>
          </div>
        ) : isEditMode || !isSetupComplete ? (
          <Booking
            onSetupComplete={handleSetupComplete}
            isEditMode={isEditMode}
            agentId={activeAgentId}
          />
        ) : (
          <BookingDashboard
            onEditSettings={handleEditSetup}
            agentId={activeAgentId}
          />
        )}
      </div>
    </div>
  );
};

export default BookingDashboardWrapper;
