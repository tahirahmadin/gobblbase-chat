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
  getDayWiseAvailability // Add this import
} from "../../../lib/serverActions";
import { 
  formatTimezone, 
  isValidTimezone, 
  getUserTimezone, 
  convertTime,
  getTimezoneDifference 
} from "../../../utils/timezoneUtils";
import { Theme } from "../../types";
import toast from "react-hot-toast";

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

interface AppointmentSettings {
  availability: Array<{
    day: string;
    available: boolean;
    timeSlots: Array<{ startTime: string; endTime: string; }>;
  }>;
  unavailableDates?: Array<{
    date: string;
    allDay: boolean;
    startTime?: string;
    endTime?: string;
  }>;
  timezone: string;
  meetingDuration: number;
  bufferTime: number;
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
  const [settings, setSettings] = useState<AppointmentSettings | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // *** FIXED: Use proper timezone management like BookingFlowComponent ***
  const [userTimezone] = useState<string>(() => {
    const detected = getUserTimezone();
    return isValidTimezone(detected) ? detected : 'UTC';
  });
  
  const [businessTimezone, setBusinessTimezone] = useState<string>("UTC");
  
  // *** ADDED: Day-wise availability like BookingFlowComponent ***
  const [dayWiseAvailability, setDayWiseAvailability] = useState<Record<string, boolean>>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Memoized timezone difference for display
  const timezoneDifference = useMemo(() => {
    if (!settings?.timezone || settings.timezone === userTimezone) {
      return null;
    }
    return getTimezoneDifference(userTimezone, settings.timezone);
  }, [settings?.timezone, userTimezone]);

  // *** FIXED: Convert original booking UTC times to user timezone for display ***
  const getDisplayTimesInUserTimezone = useCallback(() => {
    if (!originalBooking) return { startTime: '', endTime: '' };

    try {
      // Use UTC times from database if available
      const startTimeUTC = originalBooking.startTimeUTC;
      const endTimeUTC = originalBooking.endTimeUTC;
      
      // Use userTimezone from booking data if available, otherwise use detected timezone
      const targetTimezone = originalBooking.userTimezone || userTimezone;
      
      console.log('=== FULL TIMEZONE CONVERSION DEBUG ===');
      console.log('Full booking object keys:', Object.keys(originalBooking));
      console.log('Full booking object:', JSON.stringify(originalBooking, null, 2));
      console.log('startTimeUTC from booking:', startTimeUTC);
      console.log('endTimeUTC from booking:', endTimeUTC);
      console.log('userTimezone from booking:', originalBooking.userTimezone);
      console.log('detected userTimezone:', userTimezone);
      console.log('target timezone for conversion:', targetTimezone);
      
      if (!startTimeUTC || !endTimeUTC) {
        console.log('UTC times not available, falling back to regular times');
        console.log('startTime fallback:', originalBooking.startTime);
        console.log('endTime fallback:', originalBooking.endTime);
        return {
          startTime: originalBooking.displayStartTime || originalBooking.startTime,
          endTime: originalBooking.displayEndTime || originalBooking.endTime
        };
      }
      
      // Manual timezone conversion since convertTime might not be working
      // UTC time + timezone offset
      if (targetTimezone === 'Asia/Calcutta' || targetTimezone === 'Asia/Kolkata') {
        console.log('Manual conversion for India timezone');
        
        // Parse UTC time
        const [startHour, startMin] = startTimeUTC.split(':').map(Number);
        const [endHour, endMin] = endTimeUTC.split(':').map(Number);
        
        // Add 5:30 for India timezone
        const startTotalMinutes = (startHour * 60 + startMin) + (5 * 60 + 30);
        const endTotalMinutes = (endHour * 60 + endMin) + (5 * 60 + 30);
        
        // Convert back to hours:minutes
        const convertedStartHour = Math.floor(startTotalMinutes / 60) % 24;
        const convertedStartMin = startTotalMinutes % 60;
        const convertedEndHour = Math.floor(endTotalMinutes / 60) % 24;
        const convertedEndMin = endTotalMinutes % 60;
        
        const manualStartTime = `${convertedStartHour.toString().padStart(2, '0')}:${convertedStartMin.toString().padStart(2, '0')}`;
        const manualEndTime = `${convertedEndHour.toString().padStart(2, '0')}:${convertedEndMin.toString().padStart(2, '0')}`;
        
        console.log('Manual conversion result:');
        console.log('Start time (India):', manualStartTime);
        console.log('End time (India):', manualEndTime);
        
        return {
          startTime: manualStartTime,
          endTime: manualEndTime
        };
      }
      
      // Try using convertTime function
      const userStartTime = convertTime(
        startTimeUTC, 
        'UTC', 
        targetTimezone
      );
      
      const userEndTime = convertTime(
        endTimeUTC, 
        'UTC', 
        targetTimezone
      );

      console.log('convertTime function results:');
      console.log('Converted start time:', userStartTime);
      console.log('Converted end time:', userEndTime);
      console.log('=== END DEBUG ===');

      // Use converted times if available, otherwise fallback to UTC times
      return {
        startTime: userStartTime || startTimeUTC,
        endTime: userEndTime || endTimeUTC
      };
    } catch (error) {
      console.error('Error converting booking times to user timezone:', error);
      // Fallback to original times if conversion fails
      return {
        startTime: originalBooking.displayStartTime || originalBooking.startTime,
        endTime: originalBooking.displayEndTime || originalBooking.endTime
      };
    }
  }, [originalBooking, userTimezone]);

  // *** ADDED: Fetch day-wise availability like BookingFlowComponent ***
  const fetchDayWiseAvailability = useCallback(async () => {
    if (!originalBooking?.agentId) return;
    
    setLoadingAvailability(true);
    try {
      const availability = await getDayWiseAvailability(originalBooking.agentId, userTimezone);
      
      if (typeof availability === 'object' && availability !== null) {
        setDayWiseAvailability(availability);
      } else {
        console.error("Unexpected availability format:", availability);
      }
    } catch (error) {
      console.error("Failed to fetch day-wise availability:", error);
    } finally {
      setLoadingAvailability(false);
    }
  }, [originalBooking?.agentId, userTimezone]);

  // Load booking details on mount
  useEffect(() => {
    loadBookingDetails();
  }, [bookingId, userId]);

  // *** ADDED: Load day-wise availability when booking is loaded ***
  useEffect(() => {
    if (originalBooking?.agentId) {
      fetchDayWiseAvailability();
    }
  }, [originalBooking?.agentId, fetchDayWiseAvailability]);

  // *** ADDED: Refresh availability when month changes ***
  useEffect(() => {
    if (originalBooking?.agentId) {
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
      
      // *** FIXED: Set business timezone properly ***
      if (result.result.settings.timezone) {
        if (isValidTimezone(result.result.settings.timezone)) {
          setBusinessTimezone(result.result.settings.timezone);
        } else {
          console.warn('Invalid business timezone:', result.result.settings.timezone);
          setBusinessTimezone('UTC');
        }
      }
      
      setStep("date");
    } catch (err) {
      console.error("Error loading booking details:", err);
      setError("Failed to load booking details. Please try again.");
    }
  }, [bookingId, userId]);

  // Memoized format functions
  const formatTime = useCallback((timeStr: string) => {
    try {
      const [h, m] = timeStr.split(":").map(Number);
      if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
        return timeStr; // Return original if invalid
      }
      const period = h >= 12 ? "PM" : "AM";
      const hour = h % 12 === 0 ? 12 : h % 12;
      return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
    } catch {
      return timeStr;
    }
  }, []);

  const formatDateToAPI = useCallback((date: Date) => {
    try {
      const day = date.getDate().toString().padStart(2, "0");
      const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return "";
    }
  }, []);

  const formatDateFull = useCallback((date: Date) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: userTimezone
      }).format(date);
    } catch {
      return date.toLocaleDateString();
    }
  }, [userTimezone]);

  // *** FIXED: Improved date availability checker like BookingFlowComponent ***
  const isDateUnavailable = useCallback((date: Date): boolean => {
    // Check if date is before today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    if (checkDate < today) return true;

    // *** ADDED: Check day-wise availability from API ***
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    if (dayWiseAvailability[dateString] === false) {
      return true;
    }
    
    if (dayWiseAvailability[dateString] === true) {
      return false;
    }

    if (!settings) return true;

    // Check if day is available in business timezone
    const dayName = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      timeZone: businessTimezone
    }).format(date);
    
    const dayRule = settings.availability.find((rule) => rule.day === dayName);
    if (!dayRule || !dayRule.available || !dayRule.timeSlots.length) return true;

    // Check unavailable dates
    const dateStr = date.toISOString().split('T')[0];
    const unavailable = settings.unavailableDates?.find((d) => {
      try {
        const unavailableDate = new Date(d.date);
        return unavailableDate.toISOString().split('T')[0] === dateStr && d.allDay;
      } catch {
        return false;
      }
    });
    
    return !!unavailable;
  }, [settings, businessTimezone, dayWiseAvailability]);

  // Optimized date selection with proper error handling
  const selectDate = useCallback(async (date: Date) => {
    if (!originalBooking?.agentId) {
      setError("Missing booking information");
      return;
    }

    setSelectedDate(date);
    setStep("time");
    setLoadingSlots(true);
    setError(null);
  
    try {
      const dateStr = formatDateToAPI(date);
      if (!dateStr) {
        throw new Error("Invalid date format");
      }

      // *** FIXED: Use userTimezone consistently like BookingFlowComponent ***
      const slotsResult = await getAvailableSlots(
        originalBooking.agentId,
        dateStr,
        userTimezone
      );
      
      let availableSlots: Slot[] = [];
      
      if (slotsResult && Array.isArray(slotsResult)) {
        availableSlots = slotsResult.map(slot => ({
          ...slot,
          available: true
        }));
      }
      
      // Filter out past slots for today
      const today = new Date();
      const isToday = date.getDate() === today.getDate() && 
                     date.getMonth() === today.getMonth() && 
                     date.getFullYear() === today.getFullYear();
      
      if (isToday) {
        const currentHour = today.getHours();
        const currentMinute = today.getMinutes();
        const currentTotalMinutes = currentHour * 60 + currentMinute;
        
        availableSlots = availableSlots.filter(slot => {
          try {
            const [hour, minute] = slot.startTime.split(':').map(Number);
            const slotTotalMinutes = hour * 60 + minute;
            return slotTotalMinutes > currentTotalMinutes + 60; // 1 hour buffer
          } catch {
            return false;
          }
        });
      }
      
      setSlots(availableSlots);
      
      if (availableSlots.length === 0) {
        setError("No available time slots for this date. Please select another date.");
      }
    } catch (err) {
      console.error("Error loading slots:", err);
      setError("Failed to load available slots. Please try again.");
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [originalBooking?.agentId, formatDateToAPI, userTimezone]);

  // *** FIXED: Improved reschedule handler with proper timezone handling ***
  const handleReschedule = useCallback(async () => {
    if (!selectedDate || !selectedSlot || !originalBooking) {
      setError("Missing required information");
      return;
    }

    // Validate inputs
    if (!bookingId || !userId) {
      setError("Invalid booking or user information");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const dateStr = formatDateToAPI(selectedDate);
      if (!dateStr) {
        throw new Error("Invalid date format");
      }

      // Double-check slot availability before submitting
      const currentSlots = await getAvailableSlots(
        originalBooking.agentId,
        dateStr,
        userTimezone
      );
      
      const requestedSlot = `${selectedSlot.startTime}-${selectedSlot.endTime}`;
      const isStillAvailable = currentSlots?.some((slot: Slot) => 
        `${slot.startTime}-${slot.endTime}` === requestedSlot
      );
      
      if (!isStillAvailable) {
        setError("This time slot is no longer available. Please select another time.");
        setStep("time");
        await selectDate(selectedDate); // Refresh slots
        return;
      }

      // *** FIXED: Pass times in user timezone like BookingFlowComponent ***
      const rescheduleData = {
        bookingId,
        userId,
        date: dateStr,
        startTime: selectedSlot.startTime,  // These are already in user timezone from API
        endTime: selectedSlot.endTime,      // These are already in user timezone from API
        location: originalBooking.location,
        userTimezone,  // *** IMPORTANT: Pass user timezone ***
        notes: originalBooking.notes || ""
      };

      console.log('=== RESCHEDULE DEBUG ===');
      console.log('Reschedule data being sent:', rescheduleData);
      console.log('User timezone:', userTimezone);
      console.log('Business timezone:', businessTimezone);
      console.log('Selected times (user TZ):', selectedSlot.startTime, '-', selectedSlot.endTime);
      console.log('=== END DEBUG ===');

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
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error rescheduling:", err);
      setError("Failed to reschedule booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [selectedDate, selectedSlot, originalBooking, bookingId, userId, formatDateToAPI, userTimezone, businessTimezone, selectDate, onSuccess, onClose]);

  // Memoized navigation handlers
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prev => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() - 1);
      return next;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + 1);
      return next;
    });
  }, []);

  // Memoized calendar data
  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    return { year, month, firstDay, daysInMonth };
  }, [currentMonth]);

  // Render timezone info
  const renderTimezoneInfo = () => (
    <div className="flex items-center text-xs mb-4 p-2 rounded" 
         style={{ backgroundColor: theme.isDark ? "#1a1a1a" : "#f8f9fa" }}>
      <Globe className="h-4 w-4 mr-2" style={{ color: theme.mainLightColor }} />
      <div>
        <span>Your timezone: <strong>{formatTimezone(userTimezone)}</strong></span>
        {timezoneDifference && (
          <span className="ml-2 opacity-75">
            ({timezoneDifference} business time)
          </span>
        )}
      </div>
    </div>
  );

  // Render date picker
  const renderDatePicker = () => {
    const { year, month, firstDay, daysInMonth } = calendarData;

    return (
      <div>
        {renderTimezoneInfo()}
        
        {/* *** ADDED: Loading state for availability *** */}
        {loadingAvailability ? (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin h-6 w-6" style={{ color: theme.mainLightColor }} />
            <span className="ml-2 text-sm">Loading availability...</span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goToPreviousMonth}
                className="p-2 rounded hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5" style={{ color: theme.highlightColor }} />
              </button>
              <h2 className="text-base font-medium">
                {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-2 rounded hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
                aria-label="Next month"
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
                
                // *** FIXED: Use improved availability checking like BookingFlowComponent ***
                const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                const isUnavailableByAPI = dayWiseAvailability[dateString] === false;
                const isAvailableByAPI = dayWiseAvailability[dateString] === true;
                const isUnavailableByOtherRules = isDateUnavailable(date);
                
                // Final availability: API override takes precedence
                const finalUnavailable = isAvailableByAPI ? false : (isUnavailableByAPI || isUnavailableByOtherRules);
                
                return (
                  <button
                    key={day}
                    onClick={() => !finalUnavailable && selectDate(date)}
                    disabled={finalUnavailable}
                    className={`h-8 w-8 flex items-center justify-center rounded-md text-sm transition-colors
                      ${finalUnavailable 
                        ? "opacity-40 cursor-not-allowed" 
                        : "hover:bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      }
                    `}
                    style={{
                      backgroundColor: finalUnavailable ? "transparent" : theme.mainLightColor,
                      color: finalUnavailable 
                        ? (theme.isDark ? "#555" : "#aaa")
                        : (theme.isDark ? "#fff" : "#000"),
                      focusRingColor: theme.highlightColor
                    }}
                    aria-label={`Select ${date.toLocaleDateString()}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

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
      {/* Current Booking Info - FIXED: Shows times in user timezone */}
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
              return `${formatTime(startTime)} - ${formatTime(endTime)}`;
            })()}
          </div>
          <div className="text-xs opacity-80 flex items-center">
            <MapPin className="inline h-3 w-3 mr-1" />
            {originalBooking.location === 'google_meet' ? 'Google Meet' : 
              originalBooking.location === 'zoom' ? 'Zoom' : 
              originalBooking.location === 'teams' ? 'Microsoft Teams' : 'In-person'}
          </div>
          {/* Show timezone info for clarity */}
          <div className="text-xs opacity-60 mt-2 flex items-center">
            <Globe className="inline h-3 w-3 mr-1" />
            Your time ({formatTimezone(userTimezone)})
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
              className="flex items-center text-sm p-2 rounded hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
              style={{ color: theme.mainLightColor }}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </button>
            <div className="text-sm">Timezone: {formatTimezone(userTimezone)}</div>
          </div>

          <h3 className="font-medium mb-2">Select New Time</h3>
          <p className="text-sm mb-4 opacity-80">
            {formatDateFull(selectedDate)}
          </p>

          {loadingSlots ? (
            <div className="flex flex-col justify-center items-center py-8">
              <Loader2 className="animate-spin h-8 w-8 mb-2" style={{ color: theme.mainLightColor }} />
              <p className="text-sm opacity-75">Loading available times...</p>
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
                  className="p-3 rounded-md text-center text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{
                    borderColor: theme.isDark ? "#555" : "#ddd",
                    backgroundColor: "transparent",
                    focusRingColor: theme.highlightColor
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.mainLightColor;
                    e.currentTarget.style.color = theme.isDark ? "#000" : "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = theme.isDark ? "#fff" : "#000";
                  }}
                >
                  {formatTime(slot.startTime)}
                </button>
              ))}
              {slots.length === 0 && (
                <div className="col-span-2 text-center py-8">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm opacity-75">
                    No available time slots for this date.
                  </p>
                  <p className="text-xs opacity-60 mt-1">
                    Please select another date.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Confirmation - ALSO FIXED: Shows original appointment times in user timezone */}
      {step === "confirm" && selectedDate && selectedSlot && originalBooking && (
        <div>
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
                  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
                })()}
              </div>
            </div>
            
            <div className="p-3 rounded-lg" style={{ backgroundColor: theme.isDark ? "#1a3a1a" : "#e8f5e8" }}>
              <div className="text-sm font-medium mb-1" style={{ color: theme.highlightColor }}>
                New Appointment
              </div>
              <div className="text-sm">
                {formatDateFull(selectedDate)} at {formatTime(selectedSlot.startTime)}
                {" - "}
                {formatTime(selectedSlot.endTime)}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("time")}
              className="flex-1 p-3 rounded-lg border transition-colors"
              style={{ 
                borderColor: theme.highlightColor, 
                color: theme.highlightColor 
              }}
            >
              Back
            </button>
            <button
              onClick={handleReschedule}
              disabled={submitting}
              className="flex-1 p-3 rounded-lg transition-all duration-200"
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
          <p className="text-sm opacity-80 mb-2">
            Your appointment has been successfully rescheduled.
          </p>
          <p className="text-xs opacity-60">
            You'll receive a confirmation email shortly.
          </p>
        </div>
      )}
    </div>
  );
};

export default RescheduleFlowComponent;