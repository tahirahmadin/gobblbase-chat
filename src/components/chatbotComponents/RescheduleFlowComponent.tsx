import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Check,
  X,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { 
  getAvailableSlots,
  userRescheduleBooking,
  getBookingForReschedule
} from "../../lib/serverActions";
import { Theme } from "../../types";

interface RescheduleFlowProps {
  bookingId: string;
  userId: string;
  theme: Theme;
  onClose: () => void;
  onSuccess: () => void;
}

interface Slot {
  startTime: string;
  endTime: string;
}

interface BookingData {
  agentId: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  name: string;
  notes: string;
  businessTimezone: string;
  sessionType: string;
}

const RescheduleFlowComponent: React.FC<RescheduleFlowProps> = ({
  bookingId,
  userId,
  theme,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<"loading" | "date" | "time" | "confirm" | "success">("loading");
  const [originalBooking, setOriginalBooking] = useState<BookingData | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      const result = await getBookingForReschedule(bookingId, userId);
      if (result.error) {
        setError(result.result);
        return;
      }
      
      setOriginalBooking(result.result.booking);
      setSettings(result.result.settings);
      setStep("date");
    } catch (err) {
      setError("Failed to load booking details");
    }
  };

  const formatTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ap = h < 12 ? "AM" : "PM";
    const hr = h % 12 === 0 ? 12 : h % 12;
    return `${hr}:${m.toString().padStart(2, "0")} ${ap}`;
  };

  const formatDateToAPI = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateFull = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const isDateUnavailable = (date: Date): boolean => {
    // Check if date is before today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    if (!settings) return false;

    // Check if day is available
    const dayName = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
    }).format(date);
    const dayRule = settings.availability.find((rule: any) => rule.day === dayName);
    
    if (!dayRule || !dayRule.available) return true;

    // Check unavailable dates
    const dateStr = date.toISOString().split('T')[0];
    const unavailable = settings.unavailableDates?.find((d: any) => 
      new Date(d.date).toISOString().split('T')[0] === dateStr && d.allDay
    );
    
    return !!unavailable;
  };

  const selectDate = async (date: Date) => {
    setSelectedDate(date);
    setStep("time");
    setLoadingSlots(true);
  
    try {
      const dateStr = formatDateToAPI(date);
      const slots = await getAvailableSlots(
        originalBooking!.agentId,
        dateStr,
        userTimezone
      );
      
      let filteredSlots = slots || [];
      
      const today = new Date();
      const isToday = date.getDate() === today.getDate() && 
                     date.getMonth() === today.getMonth() && 
                     date.getFullYear() === today.getFullYear();
      
      if (isToday) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        filteredSlots = filteredSlots.filter(slot => {
          const [hour, minute] = slot.startTime.split(':').map(Number);
          return hour > currentHour || (hour === currentHour && minute > currentMinute);
        });
      }
      
      setSlots(filteredSlots);
    } catch (err) {
      setError("Failed to load available slots");
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedDate || !selectedSlot || !originalBooking) return;

    setSubmitting(true);
    setError(null);

    try {
      const dateStr = formatDateToAPI(selectedDate);

      const result = await userRescheduleBooking({
        bookingId,
        userId,
        date: dateStr,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        location: originalBooking.location,
        userTimezone,
        notes: originalBooking.notes
      });

      if (result.error) {
        setError(result.result);
        return;
      }

      setStep("success");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setError("Failed to reschedule booking");
    } finally {
      setSubmitting(false);
    }
  };


  const renderDatePicker = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(prev => {
              const next = new Date(prev);
              next.setMonth(prev.getMonth() - 1);
              return next;
            })}
            className="p-1"
          >
            <ChevronLeft className="h-5 w-5" style={{ color: theme.highlightColor }} />
          </button>
          <h2 className="text-base font-medium">
            {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <button
            onClick={() => setCurrentMonth(prev => {
              const next = new Date(prev);
              next.setMonth(prev.getMonth() + 1);
              return next;
            })}
            className="p-1"
          >
            <ChevronRight className="h-5 w-5" style={{ color: theme.highlightColor }} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
            <div key={day} className="h-8 flex items-center justify-center text-xs font-medium opacity-75">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(year, month, day);
            const isUnavailable = isDateUnavailable(date);
            
            return (
              <button
                key={day}
                onClick={() => !isUnavailable && selectDate(date)}
                disabled={isUnavailable}
                className={`h-8 w-8 flex items-center justify-center rounded-md text-sm
                  ${isUnavailable ? "opacity-40 cursor-not-allowed" : "hover:bg-opacity-50"}
                `}
                style={{
                  backgroundColor: isUnavailable ? "transparent" : theme.mainLightColor,
                  color: theme.isDark ? "#fff" : "#000"
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (step === "loading") {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8" style={{ color: theme.mainLightColor }} />
      </div>
    );
  }

  if (error && step === "loading") {
    return (
      <div className="text-center p-4">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded"
          style={{ backgroundColor: theme.highlightColor, color: "white" }}
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Current Booking Info */}
      {originalBooking && (
        <div className="mb-4 p-3 rounded" style={{ backgroundColor: theme.isDark ? "#222" : "#f5f5f5" }}>
          <div className="text-sm font-medium mb-1" style={{ color: theme.highlightColor }}>
            Current Appointment
          </div>
          <div className="text-xs opacity-80">
            {new Date(originalBooking.date).toLocaleDateString()} at {formatTime(originalBooking.startTime)}
            {" - "}
            {formatTime(originalBooking.endTime)}
          </div>
          <div className="text-xs opacity-80 mt-1">
            <MapPin className="inline h-3 w-3 mr-1" />
            {originalBooking.location === 'google_meet' ? 'Google Meet' : 
              originalBooking.location === 'zoom' ? 'Zoom' : 
              originalBooking.location === 'teams' ? 'Microsoft Teams' : 'In-person'}
          </div>
        </div>
      )}

      {/* Date Selection */}
      {step === "date" && (
        <div>
          <h3 className="font-medium mb-4">Select New Date</h3>
          {renderDatePicker()}
        </div>
      )}

      {/* Time Selection */}
      {step === "time" && selectedDate && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setStep("date")}
              className="flex items-center text-sm"
              style={{ color: theme.mainLightColor }}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </button>
          </div>

          <h3 className="font-medium mb-2">Select New Time</h3>
          <p className="text-sm mb-4 opacity-80">
            {formatDateFull(selectedDate)}
          </p>

          {loadingSlots ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin h-8 w-8" style={{ color: theme.mainLightColor }} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {slots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedSlot(slot);
                    setStep("confirm");
                  }}
                  className="p-2 rounded-md text-center text-sm border transition-colors"
                  style={{
                    borderColor: theme.isDark ? "#555" : "#ddd",
                    backgroundColor: "transparent"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = theme.mainLightColor;
                    e.currentTarget.style.color = theme.isDark ? "#000" : "#fff";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = theme.isDark ? "#fff" : "#000";
                  }}
                >
                  {formatTime(slot.startTime)}
                </button>
              ))}
              {slots.length === 0 && (
                <p className="text-center col-span-2 py-8 opacity-75">
                  No available time slots for this date.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Confirmation */}
      {step === "confirm" && selectedDate && selectedSlot && originalBooking && (
        <div>
          <h3 className="font-medium mb-4">Confirm Reschedule</h3>
          
          <div className="space-y-3 mb-6">
            <div>
              <div className="text-sm font-medium text-gray-500">Original Appointment</div>
              <div className="line-through opacity-60">
                {new Date(originalBooking.date).toLocaleDateString()} at {formatTime(originalBooking.startTime)}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium" style={{ color: theme.highlightColor }}>New Appointment</div>
              <div>{formatDateFull(selectedDate)} at {formatTime(selectedSlot.startTime)}</div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setStep("time")}
              className="flex-1 p-2 rounded border"
              style={{ borderColor: theme.highlightColor, color: theme.highlightColor }}
            >
              Back
            </button>
            <button
              onClick={handleReschedule}
              disabled={submitting}
              className="flex-1 p-2 rounded"
              style={{
                backgroundColor: theme.highlightColor,
                color: theme.isDark ? "black" : "white",
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? (
                <Loader2 className="animate-spin h-5 w-5 mx-auto" />
              ) : (
                "Confirm Reschedule"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success */}
      {step === "success" && (
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h3 className="font-bold text-lg mb-2">Appointment Rescheduled!</h3>
          <p className="text-sm text-gray-600">
            Your appointment has been successfully rescheduled.
          </p>
        </div>
      )}
    </div>
  );
};

export default RescheduleFlowComponent;