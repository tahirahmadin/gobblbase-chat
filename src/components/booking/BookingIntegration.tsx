import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Booking from "./Booking";
import BookingDashboard from "./BookingDashboard";
import { useUserStore } from "../../store/useUserStore";

interface BookingIntegrationProps {
  /** Called to close the integration view */
  onSetupComplete: () => void;
  /** If 'setup', start in booking setup (edit) mode; if 'dashboard', start in dashboard view */
  initialView?: "setup" | "dashboard";
  isEditMode: boolean;
}

const BookingIntegration: React.FC<BookingIntegrationProps> = ({ onSetupComplete, initialView = 'dashboard', isEditMode, }) => {
  const { activeAgentId } = useUserStore();
  const [view, setView] = useState<"setup" | "dashboard">(initialView);
  
  const handleLocalSetupComplete = () => onSetupComplete();

  const handleEditSettings = () => {
    setView('setup');
  };

  return (
    <div>
        {view === 'setup' ? (
            <Booking
            key={isEditMode ? 'edit' : 'new'}
            onSetupComplete={handleLocalSetupComplete}
            isEditMode={isEditMode}
            />
      ) : (
         <BookingDashboard onEditSettings={handleEditSettings} />
       )}
     </div>
   );
 };

export default BookingIntegration;
