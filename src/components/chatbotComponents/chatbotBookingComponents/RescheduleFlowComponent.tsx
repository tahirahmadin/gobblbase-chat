import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Globe,
} from "lucide-react";
import { 
  getAvailableSlots,
  userRescheduleBooking,
  getBookingForReschedule,
  getDayWiseAvailability
} from "../../../lib/serverActions";
import { 
  formatTimezone, 
  isValidTimezone, 
  getTimezoneDifference 
} from "../../../utils/timezoneUtils";
import { Theme } from "../../types";
import TimezoneSelector, { getConsistentTimezoneLabel } from "./TimezoneSelector";
import { useTimezone } from "../../../context/TimezoneContext";
import toast from "react-hot-toast";
import { DateTime } from 'luxon';

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
  available?: boolean;
}

interface BookingData {
  agentId: string;
  date: string;
  startTime: string;
  endTime: string;
  startTimeUTC?: string;
  endTimeUTC?: string;
  location: string;
  name: string;
  notes: string;
  businessTimezone: string;
  sessionType: string;
  displayStartTime?: string;
  displayEndTime?: string;
  userTimezone?: string;
}

interface UnavailableDate {
  date: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
}

interface AvailabilityRule {
  day: string;
  available: boolean;
  timeSlots: { startTime: string; endTime: string }[];
}

interface AppointmentSettings {
  availability: AvailabilityRule[];
  unavailableDates: UnavailableDate[];
  timezone: string;
  meetingDuration: number;
  bufferTime: number;
}

// Consistent date formatting like BookingFlowComponent
const getConsistentDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const RescheduleFlowComponent: React.FC<RescheduleFlowProps> = ({
  bookingId,
  userId,
  theme,
  onClose,
  onSuccess
}) => {
  // Use timezone context like BookingFlowComponent
  const { userTimezone, setUserTimezone, isTimezoneReady } = useTimezone();
  
  const [step, setStep] = useState<"loading" | "date" | "time" | "confirm" | "success">("loading");
  const [originalBooking, setOriginalBooking] = useState<BookingData | null>(null);
  const [settings, setSettings] = useState<AppointmentSettings | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [now, setNow] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [businessTimezone, setBusinessTimezone] = useState<string>("UTC");
  
  // Day-wise availability like BookingFlowComponent
  const [dayWiseAvailability, setDayWiseAvailability] = useState<Record<string, boolean>>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState<Record<string, UnavailableDate>>({});

  // Update current time every minute like BookingFlowComponent
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Clean timezone change handler like BookingFlowComponent
  const handleTimezoneChange = useCallback((newTimezone: string) => {
    setUserTimezone(newTimezone);
    
    // Reset reschedule flow when timezone changes
    setSelectedDate(null);
    setSelectedSlot(null);
    setSlots([]);
    
    if (step !== 'date') {
      setStep('date');
    }
    
    // Show confirmation for manual changes using consistent display
    toast.success(`Timezone changed to ${getConsistentTimezoneLabel(newTimezone)}`);
  }, [step, setUserTimezone]);

  // Convert original booking times to user timezone for display
  const getDisplayTimesInUserTimezone = useCallback(() => {
    if (!originalBooking) return { startTime: '', endTime: '' };

    try {
      // If we have display times already converted, use them
      if (originalBooking.displayStartTime && originalBooking.displayEndTime) {
        return {
          startTime: originalBooking.displayStartTime,
          endTime: originalBooking.displayEndTime
        };
      }

      // Otherwise use the regular times (should be in user timezone from API)
      return {
        startTime: originalBooking.startTime,
        endTime: originalBooking.endTime
      };
    } catch (error) {
      console.error('Error getting display times:', error);
      return {
        startTime: originalBooking.startTime,
        endTime: originalBooking.endTime
      };
    }
  }, [originalBooking]);

  // Fetch day-wise availability like BookingFlowComponent
  const fetchDayWiseAvailability = useCallback(async () => {
    if (!originalBooking?.agentId || !isTimezoneReady) return;
    
    setLoadingAvailability(true);
    
    try {
      const availability = await getDayWiseAvailability(originalBooking.agentId, userTimezone);
      
      if (typeof availability === 'object' && availability !== null) {
        const normalizedAvailability = {};
        Object.entries(availability).forEach(([dateStr, isAvailable]) => {
          let normalizedDate = dateStr;
          
          if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            normalizedDate = dateStr;
          } else if (dateStr.match(/^\d{2}-[A-Z]{3}-\d{4}$/)) {
            const [day, month, year] = dateStr.split('-');
            const monthMap = {
              'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05', 'JUN': '06',
              'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
            };
            normalizedDate = `${year}-${monthMap[month]}-${day}`;
          }
          
          normalizedAvailability[normalizedDate] = Boolean(isAvailable);
        });
        
        setDayWiseAvailability(normalizedAvailability);
      } else {
        setDayWiseAvailability({});
      }
    } catch (error) {
      console.error("Failed to fetch day-wise availability:", error);
      setDayWiseAvailability({});
    } finally {
      setLoadingAvailability(false);
    }
  }, [originalBooking?.agentId, userTimezone, isTimezoneReady]);

  // Load booking details on mount
  useEffect(() => {
    if (isTimezoneReady) {
      loadBookingDetails();
    }
  }, [bookingId, userId, isTimezoneReady]);

  // Load day-wise availability when booking is loaded
  useEffect(() => {
    if (originalBooking?.agentId && isTimezoneReady) {
      fetchDayWiseAvailability();
    }
  }, [originalBooking?.agentId, fetchDayWiseAvailability]);

  // Refresh availability when month changes
  useEffect(() => {
    if (originalBooking?.agentId && isTimezoneReady) {
      fetchDayWiseAvailability();
    }
  }, [currentMonth.getMonth(), currentMonth.getFullYear(), fetchDayWiseAvailability]);

  const loadBookingDetails = useCallback(async () => {
    try {
      setError(null);
      const result = await getBookingForReschedule(bookingId, userId);
      
      if (result.error) {
        setError(result.result || "Failed to load booking details");
        return;
      }
      
      if (!result.result?.booking || !result.result?.settings) {
        setError("Invalid booking data received");
        return;
      }
      
      setOriginalBooking(result.result.booking);
      setSettings(result.result.settings);
      
      // Set business timezone properly
      if (result.result.settings.timezone) {
        if (isValidTimezone(result.result.settings.timezone)) {
          setBusinessTimezone(result.result.settings.timezone);
        } else {
          setBusinessTimezone('UTC');
        }
      }

      // Set up unavailable dates lookup
      const unavailableLookup: Record<string, UnavailableDate> = {};
      if (result.result.settings.unavailableDates && Array.isArray(result.result.settings.unavailableDates)) {
        result.result.settings.unavailableDates.forEach((date) => {
          unavailableLookup[date.date] = date;
        });
      }
      setUnavailableDates(unavailableLookup);
      
      setStep("date");
    } catch (err) {
      console.error("Error loading booking details:", err);
      setError("Failed to load booking details. Please try again.");
    }
  }, [bookingId, userId]);

  // Format functions like BookingFlowComponent
  const fmtTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ap = h < 12 ? "AM" : "PM";
    const hr = h % 12 === 0 ? 12 : h % 12;
    return `${hr}:${m.toString().padStart(2, "0")} ${ap}`;
  };

  const fmtApiDate = (d: Date) => {
    const day = d.getDate().toString().padStart(2, "0");
    const monthNames = [
      "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
      "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
    ];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const fmtDateFull = (d: Date) =>
    new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(d);

  // Date availability checker like BookingFlowComponent
  const isBeforeToday = (d: Date) => {
    const today = DateTime.now().setZone(userTimezone).startOf('day');
    const checkDate = DateTime.fromJSDate(d).setZone(userTimezone).startOf('day');
    return checkDate < today;
  };

  const isDateFullyUnavailable = useCallback((date: Date): boolean => {
    if (isBeforeToday(date)) {
      return true;
    }

    const dateStr = getConsistentDateString(date);
    
    if (dayWiseAvailability.hasOwnProperty(dateStr)) {
      const apiAvailability = dayWiseAvailability[dateStr];
      
      if (apiAvailability === false) {
        return true;
      }
      if (apiAvailability === true) {
        return false;
      }
    }

    const apiDate = fmtApiDate(date);
    const unavailableDate = unavailableDates[apiDate];
    if (unavailableDate && unavailableDate.allDay === true) {
      return true;
    }

    if (!settings) return false;
    
    const dayName = DateTime.fromJSDate(date).setZone(userTimezone).toFormat('cccc');
    const dayRule = settings.availability.find((rule) => rule.day === dayName);
    if (dayRule && !dayRule.available) {
      return true;
    }
    
    return false;
  }, [dayWiseAvailability, unavailableDates, settings, userTimezone]);

  // Date selection like BookingFlowComponent
  const selectDate = useCallback(async (d: Date) => {
    if (!originalBooking?.agentId) {
      setError("Missing booking information");
      return;
    }

    setSelectedDate(d);
    setStep("time");
    setLoadingSlots(true);
    setError(null);

    const apiDate = fmtApiDate(d);
    const dateStr = getConsistentDateString(d);
    
    try {
      const slots = await getAvailableSlots(originalBooking.agentId, apiDate, userTimezone);
      
      if (slots && slots.length > 0) {
        // Filter out past slots for today
        let availableSlots = slots.map(slot => ({ ...slot, available: true }));
        
        const isToday = d.toDateString() === now.toDateString();
        if (isToday) {
          availableSlots = availableSlots.filter((s) => {
            const [h, m] = s.startTime.split(":").map(Number);
            const slotDate = new Date(now);
            slotDate.setHours(h, m, 0, 0);
            return slotDate > now;
          });
        }

        setSlots(availableSlots);
      } else {
        setDayWiseAvailability(prev => ({
          ...prev,
          [dateStr]: false
        }));
        setSlots([]);
      }
    } catch (error) {
      setSlots([]);
      setDayWiseAvailability(prev => ({
        ...prev,
        [dateStr]: false
      }));
    } finally {
      setLoadingSlots(false);
    }
  }, [originalBooking?.agentId, userTimezone, now]);

  // Reschedule handler
  const handleReschedule = useCallback(async () => {
    if (!selectedDate || !selectedSlot || !originalBooking) {
      setError("Missing required information");
      return;
    }

    if (!isValidTimezone(userTimezone)) {
      toast.error("Invalid timezone detected. Please refresh the page.");
      return;
    }

    try {
      // Verify slot is still available
      const currentSlots = await getAvailableSlots(
        originalBooking.agentId,
        fmtApiDate(selectedDate),
        userTimezone
      );
      
      const requestedSlot = `${selectedSlot.startTime}-${selectedSlot.endTime}`;
      const isStillAvailable = currentSlots.some(slot => 
        `${slot.startTime}-${slot.endTime}` === requestedSlot
      );
      
      if (!isStillAvailable) {
        toast.error("This slot is no longer available. Please select another time.");
        selectDate(selectedDate);
        return;
      }
    } catch (error) {
      toast.error("Unable to verify slot availability. Please try again.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const rescheduleData = {
        bookingId,
        userId,
        date: fmtApiDate(selectedDate),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        location: originalBooking.location,
        userTimezone,
        notes: originalBooking.notes || ""
      };

      const result = await userRescheduleBooking(rescheduleData);

      if (result.error) {
        setError(result.result || "Failed to reschedule booking");
        return;
      }

      setStep("success");
      toast.success("Appointment rescheduled successfully!");
      
      // Auto-close after success
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      console.error("Error rescheduling:", err);
      setError("Failed to reschedule booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [selectedDate, selectedSlot, originalBooking, bookingId, userId, userTimezone, selectDate, onSuccess]);

  // Calendar navigation
  const prevMonth = () =>
    setCurrentMonth((d) => {
      const x = new Date(d);
      x.setMonth(d.getMonth() - 1);
      return x;
    });

  const nextMonth = () =>
    setCurrentMonth((d) => {
      const x = new Date(d);
      x.setMonth(d.getMonth() + 1);
      return x;
    });

  // Calendar data
  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstWeekday = (y: number, m: number) => new Date(y, m, 1).getDay();
  const fmtMonthYear = (d: Date) =>
    new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(d);

  const getTimezoneDifferenceDisplay = (): string => {
    return getTimezoneDifference(userTimezone, businessTimezone);
  };

  // Show loading while timezone is being detected
  if (!isTimezoneReady) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8" style={{ color: theme.mainLightColor }} />
        <span className="ml-2 text-sm" style={{ color: theme.isDark ? '#fff' : '#000' }}>
          Preparing reschedule system...
        </span>
      </div>
    );
  }

  // Loading state
  if (step === "loading") {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 mb-2" style={{ color: theme.mainLightColor }} />
        <p className="text-sm opacity-75">Loading booking details...</p>
      </div>
    );
  }

  // Error state during loading
  if (error && step === "loading") {
    return (
      <div className="text-center p-4">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-500 mb-4">{error}</p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={loadBookingDetails}
            className="px-4 py-2 rounded border"
            style={{ borderColor: theme.highlightColor, color: theme.highlightColor }}
          >
            Try Again
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded"
            style={{ backgroundColor: theme.highlightColor, color: "white" }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Current Booking Info */}
      {originalBooking && (
        <div className="mb-6 p-4 rounded-lg border" 
             style={{ 
               backgroundColor: theme.isDark ? "#1a1a1a" : "#f8f9fa",
               borderColor: theme.isDark ? "#333" : "#e9ecef"
             }}>
          <div className="text-sm font-medium mb-2" style={{ color: theme.highlightColor }}>
            Current Appointment
          </div>
          <div className="text-sm mb-1">
            {new Date(originalBooking.date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long", 
              day: "numeric",
              year: "numeric"
            })}
          </div>
          <div className="text-sm opacity-80 mb-2">
            {(() => {
              const { startTime, endTime } = getDisplayTimesInUserTimezone();
              return `${fmtTime(startTime)} - ${fmtTime(endTime)}`;
            })()}
          </div>
          <div className="text-xs opacity-80 flex items-center">
            <MapPin className="inline h-3 w-3 mr-1" />
            {originalBooking.location === 'google_meet' ? 'Google Meet' : 
              originalBooking.location === 'zoom' ? 'Zoom' : 
              originalBooking.location === 'teams' ? 'Microsoft Teams' : 'In-person'}
          </div>
          <div className="text-xs opacity-60 mt-2 flex items-center">
            <Globe className="inline h-3 w-3 mr-1" />
            Your time ({getConsistentTimezoneLabel(userTimezone)})
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && step !== "loading" && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          <AlertCircle className="inline h-4 w-4 mr-1" />
          {error}
        </div>
      )}

      {/* Date Selection */}
      {step === "date" && (
        <div>
          <div className="flex justify-between items-center text-sm mb-4" style={{ borderColor: theme.isDark ? "#333" : "#ddd" }}>
            <h3 className="font-medium">SELECT NEW DATE</h3>
            <TimezoneSelector
              selectedTimezone={userTimezone}
              onTimezoneChange={handleTimezoneChange}
              theme={theme}
            />
          </div>

          {loadingAvailability ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin h-6 w-6" style={{ color: theme.mainLightColor }} />
              <span className="ml-2">Loading availability...</span>
            </div>
          ) : (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <button onClick={prevMonth} className="p-1">
                  <ChevronLeft className="h-5 w-5" style={{ color: theme.highlightColor }} />
                </button>
                <h2 className="text-base font-medium">
                  {fmtMonthYear(currentMonth)}
                </h2>
                <button onClick={nextMonth} className="p-1">
                  <ChevronRight className="h-5 w-5" style={{ color: theme.highlightColor }} />
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                  <div
                    key={d}
                    className="h-8 flex items-center justify-center text-xs font-medium opacity-75"
                  >
                    {d}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstWeekday(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => (
                  <div key={"e" + i} />
                ))}
                {Array.from({ length: daysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => {
                  const dn = i + 1;
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dn);
                  
                  const isUnavailable = isDateFullyUnavailable(date);
                  
                  return (
                    <button
                      key={dn}
                      onClick={() => !isUnavailable && selectDate(date)}
                      disabled={isUnavailable}
                      className={`
                        h-8 w-8 flex items-center justify-center rounded-md text-sm transition-colors
                        ${isUnavailable
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:opacity-80 cursor-pointer"
                        }
                      `}
                      style={{
                        backgroundColor: isUnavailable 
                          ? "transparent" 
                          : (theme.isDark ? "#222" : theme.mainLightColor),
                        color: isUnavailable 
                          ? (theme.isDark ? "#555" : "#aaa") 
                          : (theme.isDark ? "#fff" : "#000"),
                      }}
                    >
                      {dn}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
              <ArrowLeft className="h-4 w-4 mr-1" /> BACK
            </button>
            <TimezoneSelector
              selectedTimezone={userTimezone}
              onTimezoneChange={handleTimezoneChange}
              theme={theme}
            />
          </div>

          <div className="mb-4 flex justify-between">
            <div className="font-medium">NEW DATE</div>
            <div>{fmtDateFull(selectedDate)}</div>
          </div>

          {loadingSlots ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin h-8 w-8" style={{ color: theme.mainLightColor }} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {slots.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedSlot(s);
                    setStep("confirm");
                  }}
                  className="p-2 rounded-md text-center text-sm border transition-colors hover:bg-opacity-20"
                  style={{
                    backgroundColor: "transparent",
                    borderColor: theme.isDark ? "#555" : "#ddd",
                    color: theme.isDark ? "#fff" : "#000"
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
                  {fmtTime(s.startTime)}
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
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setStep("time")}
              className="flex items-center text-sm"
              style={{ color: theme.mainLightColor }}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> BACK
            </button>
            <TimezoneSelector
              selectedTimezone={userTimezone}
              onTimezoneChange={handleTimezoneChange}
              theme={theme}
            />
          </div>

          <h3 className="font-medium mb-4">Confirm Reschedule</h3>
          
          <div className="space-y-4 mb-6">
            <div className="p-3 rounded-lg" style={{ backgroundColor: theme.isDark ? "#2a2a2a" : "#f1f3f4" }}>
              <div className="text-sm font-medium text-red-600 mb-1">Original Appointment</div>
              <div className="line-through opacity-60 text-sm">
                {new Date(originalBooking.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric"
                })} at {(() => {
                  const { startTime, endTime } = getDisplayTimesInUserTimezone();
                  return `${fmtTime(startTime)} - ${fmtTime(endTime)}`;
                })()}
              </div>
            </div>
            
            <div className="p-3 rounded-lg" style={{ backgroundColor: theme.isDark ? "#1a3a1a" : "#e8f5e8" }}>
              <div className="text-sm font-medium mb-1" style={{ color: theme.highlightColor }}>
                New Appointment
              </div>
              <div className="text-sm">
                {fmtDateFull(selectedDate)} at {fmtTime(selectedSlot.startTime)}
                {" - "}
                {fmtTime(selectedSlot.endTime)}
              </div>
            </div>
          </div>

          <button
            onClick={handleReschedule}
            disabled={submitting}
            className="w-full p-3 rounded font-medium transition-all duration-200"
            style={{
              backgroundColor: theme.highlightColor,
              color: theme.isDark ? "black" : "white",
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? (
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Rescheduling...
              </div>
            ) : (
              "CONFIRM RESCHEDULE"
            )}
          </button>
        </div>
      )}

      {/* Success */}
      {step === "success" && (
        <div className="text-center py-8">
          <div className="flex justify-center my-4">
            <div className="rounded-full p-3" style={{ backgroundColor: "green" }}>
              <Check className="h-6 w-6 text-white" />
            </div>
          </div>
          <h3 className="font-bold text-lg mb-2">Appointment Rescheduled!</h3>
          <p className="text-sm mb-6">You'll receive a confirmation email shortly.</p>
        </div>
      )}
    </div>
  );
};

export default RescheduleFlowComponent;