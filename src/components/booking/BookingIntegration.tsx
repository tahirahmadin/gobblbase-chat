import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Booking from "./Booking";
import BookingDashboard from "./BookingDashboard";
import { useBotConfig } from "../../store/useBotConfig";

interface BookingIntegrationProps {
  /** Called to close the integration view */
  onSetupComplete: () => void;
  /** If 'setup', start in booking setup (edit) mode; if 'dashboard', start in dashboard view */
  initialView?: "setup" | "dashboard";
  isEditMode: boolean;
  agentId?: string; // Accept explicit agentId prop
}

const BookingIntegration: React.FC<BookingIntegrationProps> = ({
  onSetupComplete,
  initialView = 'dashboard',
  isEditMode,
  agentId: propAgentId, // Accept the explicit agentId prop
}) => {
  const { activeBotId, activeBotData } = useBotConfig();
  
  // Use explicitly passed agentId if available, otherwise fall back to store values
  const activeAgentId = propAgentId || activeBotId || activeBotData?.agentId;
  
  const [view, setView] = useState<"setup" | "dashboard">(initialView);

  const handleLocalSetupComplete = () => onSetupComplete();
  
  const handleEditSettings = () => {
    setView('setup');
  };
  
  return (
    <div>
      {/* Display current agentId for debugging (can be removed in production) */}      
      {view === 'setup' ? (
        <Booking
          key={`${activeAgentId}-${isEditMode ? 'edit' : 'new'}`} // Include agentId in key to force re-render
          onSetupComplete={handleLocalSetupComplete}
          isEditMode={isEditMode}
          agentId={activeAgentId} // Pass agentId explicitly
        />
      ) : (
        <BookingDashboard 
          onEditSettings={handleEditSettings} 
          agentId={activeAgentId} // Pass agentId explicitly
        />
      )}
    </div>
  );
};

export default BookingIntegration;