import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  RefreshCcw,
  AlertCircle,
  Loader2,
  X,
  ArrowDown,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { 
  getUserBookingHistory,
  cancelUserBooking 
} from "../../../lib/serverActions";
import { Theme } from "../../types";
import RescheduleFlowComponent from "./RescheduleFlowComponent";
import { useUserStore } from "../../../store/useUserStore";

interface Booking {
  _id: string;
  agentId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  displayStartTime: string;  
  displayEndTime: string;    
  location: string;
  status: string;
  statusLabel: string;
  meetingLink?: string;
  sessionType: string;
  notes?: string;
  canJoin: boolean;
  userTimezone: string;
  businessTimezone: string;  
  isRescheduled?: boolean;
  rescheduledFrom?: {
    date: string;
    startTime: string;
    endTime: string;
  };
}

interface BookingManagementComponentProps {
  theme: Theme;
  agentId: string;
  sessionName: string;
  botName: string;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  theme: Theme;
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  theme,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl"
        style={{
          backgroundColor: theme.isDark ? "#1a1a1a" : "white",
          border: `1px solid ${theme.isDark ? "#333" : "#e0e0e0"}`,
        }}
      >
        <h3 className="text-lg font-semibold mb-3" style={{ color: theme.highlightColor }}>
          {title}
        </h3>
        <p className="text-sm mb-6" style={{ color: theme.isDark ? "#ccc" : "#555" }}>
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              backgroundColor: theme.isDark ? "#333" : "#e0e0e0",
              color: theme.isDark ? "white" : "black",
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded text-sm font-medium transition-opacity hover:opacity-80 flex items-center gap-2"
            style={{
              backgroundColor: "#ef4444",
              color: "white",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

interface NotificationProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
  theme: Theme;
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose, theme }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div
        className="rounded-lg p-4 shadow-lg flex items-start gap-3 min-w-[300px] max-w-md"
        style={{
          backgroundColor: theme.isDark ? "#1a1a1a" : "white",
          border: `1px solid ${type === 'success' ? '#10b981' : '#ef4444'}`,
        }}
      >
        {type === 'success' ? (
          <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#10b981' }} />
        ) : (
          <XCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#ef4444' }} />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium" style={{ color: theme.isDark ? 'white' : 'black' }}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          style={{ color: theme.isDark ? '#999' : '#666' }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const BookingManagementComponent: React.FC<BookingManagementComponentProps> = ({
  theme,
  agentId,
  sessionName,
  botName,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    booking: Booking | null;
    type: 'cancel' | 'cancel24h' | null;
  }>({ isOpen: false, booking: null, type: null });
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] = useState<Booking | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const { userEmail, isLoggedIn } = useUserStore();

  useEffect(() => {
    if (isLoggedIn && userEmail) {
      fetchUserBookings();
    } else {
      setIsLoading(false);
      setError("Please log in to view your bookings");
    }
  }, [isLoggedIn, userEmail]);

  const fetchUserBookings = async () => {
    try {
      setIsLoading(true);
      const bookingsData = await getUserBookingHistory(userEmail, agentId);
      
      // Filter only confirmed and upcoming bookings
      const confirmedBookings = (bookingsData || []).filter((booking: Booking) => 
        booking.status === 'confirmed' && booking.statusLabel === 'upcoming'
      );
      
      setBookings(confirmedBookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      setError("Failed to load your bookings");
    } finally {
      setIsLoading(false);
    }
  };

  // Updated function to use displayStartTime and displayEndTime with timezone
  const formatDisplayTime = (time: string, timezone: string) => {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const today = new Date();
      today.setHours(hours, minutes, 0, 0);
      
      const timeString = today.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });

      // Get timezone abbreviation
      const timezoneAbbr = getTimezoneAbbreviation(timezone);
      
      return `${timeString} ${timezoneAbbr}`;
    } catch (error) {
      return `${time} ${getTimezoneAbbreviation(timezone)}`;
    }
  };

  // Helper function to get timezone abbreviation
  const getTimezoneAbbreviation = (timezone: string) => {
    const timezoneMap: { [key: string]: string } = {
      'Asia/Kolkata': 'IST',
      'Asia/Dubai': 'GST',
      'Asia/Calcutta': 'IST',
      'America/New_York': 'EST/EDT',
      'America/Los_Angeles': 'PST/PDT',
      'Europe/London': 'GMT/BST',
      // Add more as needed
    };
    
    return timezoneMap[timezone] || timezone.split('/')[1]?.replace('_', ' ') || 'Local';
  };

  const formatBookingDate = (date: string) => {
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return date;
    }
  };

  const handleCancelClick = (booking: Booking) => {
    const bookingDate = new Date(booking.date);
    const startTime = booking.startTime.split(':');
    bookingDate.setHours(parseInt(startTime[0]), parseInt(startTime[1]));
    
    const hoursUntilBooking = (bookingDate.getTime() - Date.now()) / (1000 * 60 * 60);
    
    setConfirmDialog({
      isOpen: true,
      booking,
      type: hoursUntilBooking < 24 ? 'cancel24h' : 'cancel'
    });
  };

  const handleConfirmCancel = async () => {
    if (!confirmDialog.booking) return;

    setCancellingBookingId(confirmDialog.booking._id);

    try {
      await cancelUserBooking(confirmDialog.booking._id, userEmail);
      setNotification({ type: 'success', message: 'Booking cancelled successfully!' });
      
      // Refresh bookings
      await fetchUserBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      setNotification({ type: 'error', message: 'Failed to cancel booking. Please try again.' });
    } finally {
      setCancellingBookingId(null);
      setConfirmDialog({ isOpen: false, booking: null, type: null });
    }
  };

  const handleRescheduleClick = (booking: Booking) => {
    setSelectedBookingForReschedule(booking);
    setRescheduleModalOpen(true);
  };

  const handleRescheduleSuccess = () => {
    setRescheduleModalOpen(false);
    setSelectedBookingForReschedule(null);
    setNotification({ type: 'success', message: 'Appointment rescheduled successfully!' });
    fetchUserBookings();
  };

  if (!isLoggedIn || !userEmail) {
    return (
      <div className="p-4 rounded-lg" style={{ backgroundColor: theme.mainLightColor + '10' }}>
        <div className="text-sm text-center">
          Please log in to manage your bookings
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 rounded-lg" style={{ backgroundColor: theme.mainLightColor + '10' }}>
        <div className="flex justify-center items-center">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: theme.mainLightColor }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg" style={{ backgroundColor: '#fee2e2' }}>
        <div className="text-sm text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: theme.mainLightColor + '10' }}>
        <div className="p-3 border-b" style={{ backgroundColor: theme.mainLightColor + '20', borderColor: theme.mainLightColor + '30' }}>
          <h3 className="font-semibold text-sm" style={{ color: theme.highlightColor }}>
            Your Upcoming {sessionName}s
          </h3>
        </div>

        <div className="p-3">
          {bookings.length === 0 ? (
            <div className="text-center py-4 text-sm" style={{ color: theme.isDark ? '#999' : '#666' }}>
              No upcoming bookings found
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="rounded-lg p-3"
                  style={{ 
                    backgroundColor: theme.isDark ? '#2a2a2a' : '#f5f5f5',
                    border: `1px solid ${theme.isDark ? '#333' : '#e0e0e0'}`
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-sm font-medium" style={{ color: theme.highlightColor }}>
                        {booking.sessionType}
                      </div>
                      <div className="text-xs" style={{ color: theme.isDark ? '#ccc' : '#555' }}>
                        with {botName}
                      </div>
                    </div>
                    <div 
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: '#4CAF5020',
                        color: '#4CAF50'
                      }}
                    >
                      CONFIRMED
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex items-center text-xs mb-1" style={{ color: theme.isDark ? '#e0e0e0' : '#333' }}>
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{formatBookingDate(booking.date)}</span>
                    </div>
                    <div className="flex items-center text-xs" style={{ color: theme.isDark ? '#e0e0e0' : '#333' }}>
                      <Clock className="h-3 w-3 mr-1" />
                      <span>
                        {formatDisplayTime(booking.displayStartTime, booking.userTimezone)} - {" "}
                        {formatDisplayTime(booking.displayEndTime, booking.userTimezone)}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs mb-3" style={{ color: theme.isDark ? '#999' : '#666' }}>
                    {booking.location === "google_meet" ? "Google Meet" : 
                     booking.location === "zoom" ? "Zoom" : 
                     booking.location === "teams" ? "Microsoft Teams" : "In Person"}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRescheduleClick(booking)}
                      className="flex-1 flex items-center justify-center px-3 py-1.5 rounded text-xs font-medium transition-opacity hover:opacity-80"
                      style={{
                        backgroundColor: theme.mainLightColor,
                        color: "white"
                      }}
                    >
                      <RefreshCcw className="h-3 w-3 mr-1" />
                      Reschedule
                    </button>
                    
                    <button
                      onClick={() => handleCancelClick(booking)}
                      className="flex-1 px-3 py-1.5 rounded text-xs font-medium transition-opacity hover:opacity-80"
                      style={{
                        backgroundColor: "#ef4444",
                        color: "white",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, booking: null, type: null })}
        onConfirm={handleConfirmCancel}
        title="Cancel Booking"
        message={
          confirmDialog.type === 'cancel24h'
            ? "This booking is within 24 hours. Are you sure you want to cancel? You may not be eligible for a refund."
            : "Are you sure you want to cancel this booking?"
        }
        confirmText="Yes, Cancel"
        cancelText="No, Keep It"
        theme={theme}
        isLoading={!!cancellingBookingId}
      />

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
          theme={theme}
        />
      )}

      {/* Reschedule Modal */}
      {rescheduleModalOpen && selectedBookingForReschedule && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div 
            className="rounded-xl w-96 max-w-full p-0 relative max-h-[80vh] overflow-y-auto"
            style={{
              backgroundColor: theme.isDark ? "black" : "white",
              border: `1px solid ${theme.highlightColor}`,
            }}
          >
            <div className="sticky top-0 p-4 border-b flex justify-between items-center"
                 style={{ 
                   backgroundColor: theme.isDark ? "black" : "white",
                   borderColor: theme.highlightColor 
                 }}>
              <h2 className="font-semibold">Reschedule {selectedBookingForReschedule.sessionType}</h2>
              <button
                onClick={() => {
                  setRescheduleModalOpen(false);
                  setSelectedBookingForReschedule(null);
                }}
                style={{ color: theme.highlightColor }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <RescheduleFlowComponent
              bookingId={selectedBookingForReschedule._id}
              userId={userEmail}
              theme={theme}
              onClose={() => {
                setRescheduleModalOpen(false);
                setSelectedBookingForReschedule(null);
              }}
              onSuccess={handleRescheduleSuccess}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default BookingManagementComponent;