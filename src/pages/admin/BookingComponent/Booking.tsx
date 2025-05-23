import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Plus,
  User,
  Users,
  Check,
  DollarSign,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useBotConfig } from "../../../store/useBotConfig";
import {
  updateAppointmentSettings,
  getAppointmentSettings,
} from "../../../lib/serverActions";
import { useNavigate, useLocation } from "react-router-dom";

interface TimeSlot {
  id?: string;
  startTime: string;
  endTime: string;
}

export interface AvailabilityDay {
  day: string;
  available: boolean;
  timeSlots: TimeSlot[];
}

interface Break {
  startTime: string;
  endTime: string;
}

interface MeetingLocation {
  id: string;
  name: string;
  icon: React.ReactNode;
  selected: boolean;
}

interface BookingProps {
  onSetupComplete?: () => void;
  isEditMode?: boolean;
  agentId?: string;
}

const DEFAULT_MEETING_LOCATIONS = [
  {
    id: "google_meet",
    name: "Google Meet",
    icon: <Video className="h-5 w-5" />,
    selected: true,
  },
  {
    id: "zoom",
    name: "Zoom",
    icon: <Video className="h-5 w-5" />,
    selected: false,
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    icon: <Video className="h-5 w-5" />,
    selected: false,
  },
  {
    id: "in_person",
    name: "In-person",
    icon: <MapPin className="h-5 w-5" />,
    selected: false,
  },
];

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
];

const DURATION_OPTIONS = [
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "45 minutes", value: 45 },
  { label: "1 hour", value: 60 },
  { label: "1.5 hours", value: 90 },
  { label: "2 hours", value: 120 },
];

const BUFFER_OPTIONS = [
  { label: "No buffer", value: 0 },
  { label: "5 minutes", value: 5 },
  { label: "10 minutes", value: 10 },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
];

const DEFAULT_AVAILABILITY = [
  { day: "Sunday", available: false, timeSlots: [] },
  {
    day: "Monday",
    available: true,
    timeSlots: [{ id: "monday_default", startTime: "09:00", endTime: "17:00" }],
  },
  {
    day: "Tuesday",
    available: true,
    timeSlots: [{ id: "tuesday_default", startTime: "09:00", endTime: "17:00" }],
  },
  {
    day: "Wednesday",
    available: true,
    timeSlots: [{ id: "wednesday_default", startTime: "09:00", endTime: "17:00" }],
  },
  {
    day: "Thursday",
    available: true,
    timeSlots: [{ id: "thursday_default", startTime: "09:00", endTime: "17:00" }],
  },
  {
    day: "Friday",
    available: true,
    timeSlots: [{ id: "friday_default", startTime: "09:00", endTime: "17:00" }],
  },
  { day: "Saturday", available: false, timeSlots: [] },
];

const DEFAULT_TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (US & Canada)" },
  { value: "America/Chicago", label: "Central Time (US & Canada)" },
  { value: "America/Denver", label: "Mountain Time (US & Canada)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Shanghai", label: "Shanghai" },
  { value: "Asia/Kolkata", label: "India" },
  { value: "Australia/Sydney", label: "Sydney" },
];

const Booking: React.FC<BookingProps> = ({
  onSetupComplete,
  isEditMode = false,
  agentId: propAgentId,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const agentIdFromUrl = queryParams.get("agentId");
  const { activeBotData, activeBotId } = useBotConfig();
  const activeAgentId =
    propAgentId || agentIdFromUrl || activeBotId || activeBotData?.agentId;
  const [timezones, setTimezones] = useState(DEFAULT_TIMEZONES);
  const [detectedTimezoneInList, setDetectedTimezoneInList] = useState(false);
  const [sessionType, setSessionType] = useState("Consultation");

  useEffect(() => {
    if (!isEditMode) {
      const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

      setTimezone(detectedTz);

      const alreadyInList = DEFAULT_TIMEZONES.find(
        (tz) => tz.value === detectedTz
      );
      setDetectedTimezoneInList(!!alreadyInList);

      if (!alreadyInList && detectedTz) {
        try {
          const tzOffset =
            new Intl.DateTimeFormat("en", {
              timeZone: detectedTz,
              timeZoneName: "short",
            })
              .formatToParts()
              .find((part) => part.type === "timeZoneName")?.value || "";

          const detectedTzEntry = {
            value: detectedTz,
            label: `${detectedTz} (${tzOffset})`,
          };

          setTimezones((prev) => [
            detectedTzEntry,
            ...prev.filter((tz) => tz.value !== detectedTz),
          ]);
        } catch (e) {
          console.error("Error formatting timezone offset:", e);
        }
      } else {
        setTimezones(DEFAULT_TIMEZONES);
      }
    }
  }, [isEditMode]);

  // State for active step
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form state
  const [bookingType, setBookingType] = useState<string>("individual");
  const [bookingsPerSlot, setBookingsPerSlot] = useState(1);
  const [meetingDuration, setMeetingDuration] = useState(30);
  const [bufferTime, setBufferTime] = useState(10);
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [newBreakStart, setNewBreakStart] = useState("12:00");
  const [newBreakEnd, setNewBreakEnd] = useState("13:00");
  const [availability, setAvailability] =
    useState<AvailabilityDay[]>(DEFAULT_AVAILABILITY);
  const [meetingLocations, setMeetingLocations] = useState<MeetingLocation[]>(
    DEFAULT_MEETING_LOCATIONS
  );
  const [selectedLocation, setSelectedLocation] =
    useState<string>("google_meet");
  const [timezone, setTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [isFree, setIsFree] = useState(false);
  const [priceAmount, setPriceAmount] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [showCurrencies, setShowCurrencies] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSettings, setIsFetchingSettings] = useState(isEditMode);

  // Navigation functions
  const goToNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Fetch existing settings if in edit mode
  useEffect(() => {
    const fetchSettings = async () => {
      if (!activeAgentId) return;

      try {
        setIsFetchingSettings(true);
        const settings = await getAppointmentSettings(activeAgentId);

        if (settings) {
          console.log("Fetched settings for agent:", activeAgentId, settings);

          // Update form state with fetched settings
          setBookingType(settings.bookingType || "individual");
          setBookingsPerSlot(settings.bookingsPerSlot || 1);
          setMeetingDuration(settings.meetingDuration || 30);
          setBufferTime(settings.bufferTime || 10);

          setBreaks(settings.breaks || []);

          setSessionType(settings.sessionType || "Consultation");

          if (settings.availability && settings.availability.length > 0) {
            // Ensure all timeSlots have IDs
            const availabilityWithIds = settings.availability.map((day, dayIndex) => ({
              ...day,
              timeSlots: day.timeSlots.map((slot, slotIndex) => ({
                ...slot,
                id: slot.id || `fetched_${dayIndex}_${slotIndex}_${Date.now()}`
              }))
            }));
            setAvailability(availabilityWithIds);
          }

          if (settings.locations && settings.locations.length > 0) {
            const updatedLocations = [...DEFAULT_MEETING_LOCATIONS].map(
              (loc) => ({
                ...loc,
                selected: settings.locations.includes(loc.id),
              })
            );
            setMeetingLocations(updatedLocations);

            // Set the first selected location as the current one
            const firstSelected = updatedLocations.find((loc) => loc.selected);
            if (firstSelected) {
              setSelectedLocation(firstSelected.id);
            }
          }

          if (settings.timezone) {
            setTimezone(settings.timezone);
            // If saved timezone is not in default list, add it
            const tzInList = DEFAULT_TIMEZONES.find(
              (tz) => tz.value === settings.timezone
            );
            if (!tzInList) {
              try {
                const tzOffset =
                  new Intl.DateTimeFormat("en", {
                    timeZone: settings.timezone,
                    timeZoneName: "short",
                  })
                    .formatToParts()
                    .find((part) => part.type === "timeZoneName")?.value || "";

                const savedTzEntry = {
                  value: settings.timezone,
                  label: `${settings.timezone} (${tzOffset})`,
                };

                setTimezones((prev) => [
                  savedTzEntry,
                  ...prev.filter((tz) => tz.value !== settings.timezone),
                ]);
              } catch (e) {
                console.error("Error formatting saved timezone offset:", e);
              }
            }
          }

          // Load pricing data if available
          if (settings.price) {
            setIsFree(settings.price.isFree);
            setPriceAmount(settings.price.amount || 0);
            setSelectedCurrency(settings.price.currency || "USD");
          }
        }
      } catch (error) {
        console.error("Error fetching booking settings:", error);
      } finally {
        setIsFetchingSettings(false);
      }
    };

    if (isEditMode) {
      fetchSettings();
    }
  }, [activeAgentId, isEditMode]);

  // Helper functions
  const toggleDayAvailability = (dayIndex: number) => {
    setAvailability((prev) => {
      const updated = [...prev];
      const current = updated[dayIndex];
      updated[dayIndex] = {
        ...current,
        available: !current.available,
        timeSlots: current.available
          ? []
          : [{ 
              id: `default_${dayIndex}_${Date.now()}`, 
              startTime: "09:00", 
              endTime: "17:00" 
            }],
      };
      return updated;
    });
  };

  const updateTimeSlot = (
    dayIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setAvailability((prev) => {
      const updated = [...prev];
      if (updated[dayIndex]?.timeSlots[0]) {
        updated[dayIndex].timeSlots[0][field] = value;
      }
      return updated;
    });
  };

  const selectMeetingLocation = (locationId: string) => {
    setSelectedLocation(locationId);
    setMeetingLocations((prev) =>
      prev.map((loc) => ({
        ...loc,
        selected: loc.id === locationId,
      }))
    );
  };

  const selectCurrency = (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    setShowCurrencies(false);
  };

  const handlePriceAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters except decimal point
    const rawValue = e.target.value.replace(/[^0-9.]/g, "");

    // Handle decimal points properly
    if (rawValue === "" || rawValue === ".") {
      setPriceAmount(0);
      return;
    }

    // Ensure only valid numbers are entered
    const numValue = parseFloat(rawValue);
    if (!isNaN(numValue)) {
      setPriceAmount(numValue);
    }
  };

  const formatTimezoneDisplay = (tz) => {
    try {
      const now = new Date();
      const offset = new Intl.DateTimeFormat('en', {
        timeZone: tz,
        timeZoneName: 'short'
      }).formatToParts().find(part => part.type === 'timeZoneName')?.value;
      
      const offsetHours = Math.round((new Date(now.toLocaleString('en-US', {timeZone: tz})) - now) / (1000 * 60 * 60));
      const offsetString = offsetHours >= 0 ? `+${offsetHours}` : `${offsetHours}`;
      
      return `${tz.split('/').pop()} (GMT${offsetString}) ${offset}`;
    } catch (e) {
      return tz;
    }
  };
  
  const getAvailableStartTimes = (dayIndex, currentSlotIndex) => {
    const currentSlots = availability[dayIndex].timeSlots;
    
    if (currentSlotIndex === 0) {
      const nextSlot = currentSlots[1];
      if (nextSlot) {
        const nextStartHour = parseInt(nextSlot.startTime.split(':')[0]);
        const maxHour = Math.min(nextStartHour - 1, 22); 
        return Array.from({ length: maxHour + 1 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);
      }
      return Array.from({ length: 23 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);
    }
    
    const previousSlot = currentSlots[currentSlotIndex - 1];
    if (!previousSlot) {
      return [`09:00`]; 
    }
    
    const previousEndHour = parseInt(previousSlot.endTime.split(':')[0]);
    
    let maxStartHour = 22;
    const nextSlot = currentSlots[currentSlotIndex + 1];
    if (nextSlot) {
      const nextStartHour = parseInt(nextSlot.startTime.split(':')[0]);
      maxStartHour = Math.min(nextStartHour - 1, 22); 
    }
    
    const availableTimes = [];
    for (let hour = previousEndHour; hour <= maxStartHour; hour++) {
      availableTimes.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    
    return availableTimes.length > 0 ? availableTimes : [`${previousEndHour.toString().padStart(2, '0')}:00`];
  };
  
  const getAvailableEndTimes = (dayIndex, currentSlotIndex, startTime) => {
    const currentSlots = availability[dayIndex].timeSlots;
    const startHour = parseInt(startTime.split(':')[0]);
    
    let maxHour = 24;
    
    const nextSlot = currentSlots[currentSlotIndex + 1];
    if (nextSlot) {
      const nextStartHour = parseInt(nextSlot.startTime.split(':')[0]);
      maxHour = nextStartHour;
    }
    
    const availableTimes = [];
    for (let hour = startHour + 1; hour <= maxHour; hour++) {
      availableTimes.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    
    if (availableTimes.length === 0 && startHour + 1 <= 24) {
      availableTimes.push(`${(startHour + 1).toString().padStart(2, '0')}:00`);
    }
    
    return availableTimes;
  };
  
  const addTimeSlot = (dayIndex) => {
    setAvailability(prev => {
      const updated = [...prev];
      const currentDay = { ...updated[dayIndex] };
      const currentSlots = [...currentDay.timeSlots];
      
      console.log("Before adding slot - current slots:", currentSlots);
      
      if (currentSlots.length === 0) {
        currentDay.timeSlots = [{
          id: `slot_${Date.now()}`, 
          startTime: "09:00",
          endTime: "17:00"
        }];
        updated[dayIndex] = currentDay;
        return updated;
      }
      
      let latestEndHour = 0;
      
      for (const slot of currentSlots) {
        const endHour = parseInt(slot.endTime.split(':')[0]);
        if (endHour > latestEndHour) {
          latestEndHour = endHour;
        }
      }
      
      if (latestEndHour < 23) {
        const newSlot = {
          id: `slot_${Date.now()}`, 
          startTime: `${latestEndHour.toString().padStart(2, '0')}:00`,
          endTime: `${Math.min(latestEndHour + 1, 24).toString().padStart(2, '0')}:00`
        };
        currentDay.timeSlots = [...currentSlots, newSlot];
        
        console.log("After adding slot - all slots:", currentDay.timeSlots);
      }
      
      updated[dayIndex] = currentDay;
      return updated;
    });
  };
  
  const removeTimeSlot = (dayIndex, slotIndex) => {
    setAvailability(prev => {
      const updated = [...prev];
      const currentDay = { ...updated[dayIndex] };
      
      currentDay.timeSlots = currentDay.timeSlots.filter((_, index) => index !== slotIndex);
      
      if (currentDay.timeSlots.length === 0 && currentDay.available) {
        currentDay.timeSlots = [{ 
          id: `default_${dayIndex}_${Date.now()}`, 
          startTime: "09:00", 
          endTime: "17:00" 
        }];
      }
      
      updated[dayIndex] = currentDay;
      return updated;
    });
  };
  
  const updateSpecificTimeSlot = (dayIndex, slotIndex, field, value) => {
    setAvailability(prev => {
      const updated = [...prev];
      const currentDay = { ...updated[dayIndex] };
      const slots = [...currentDay.timeSlots];
      
      if (!slots[slotIndex]) return updated;
      
      const valueHour = parseInt(value.split(':')[0]);
      
      if (field === 'startTime') {
        if (slotIndex > 0) {
          const previousSlot = slots[slotIndex - 1];
          const previousEndHour = parseInt(previousSlot.endTime.split(':')[0]);
          if (valueHour < previousEndHour) {
            console.warn(`Cannot set start time ${value} before previous slot ends at ${previousSlot.endTime}`);
            return updated; 
          }
        }
        
        if (slotIndex < slots.length - 1) {
          const nextSlot = slots[slotIndex + 1];
          const nextStartHour = parseInt(nextSlot.startTime.split(':')[0]);
          if (valueHour >= nextStartHour) {
            console.warn(`Cannot set start time ${value} at or after next slot starts at ${nextSlot.startTime}`);
            return updated; 
          }
        }
        
        slots[slotIndex] = {
          ...slots[slotIndex],
          startTime: value
        };
        
        const currentEndHour = parseInt(slots[slotIndex].endTime.split(':')[0]);
        if (valueHour >= currentEndHour) {
          let newEndHour = valueHour + 1;
          
          if (slotIndex < slots.length - 1) {
            const nextSlot = slots[slotIndex + 1];
            const nextStartHour = parseInt(nextSlot.startTime.split(':')[0]);
            newEndHour = Math.min(newEndHour, nextStartHour);
          }
          
          newEndHour = Math.min(newEndHour, 24);
          
          slots[slotIndex] = {
            ...slots[slotIndex],
            endTime: `${newEndHour.toString().padStart(2, '0')}:00`
          };
        }
        
      } else if (field === 'endTime') {
        
        const startHour = parseInt(slots[slotIndex].startTime.split(':')[0]);
        
        if (valueHour <= startHour) {
          console.warn(`End time ${value} must be after start time ${slots[slotIndex].startTime}`);
          return updated; 
        }
        
        if (slotIndex < slots.length - 1) {
          const nextSlot = slots[slotIndex + 1];
          const nextStartHour = parseInt(nextSlot.startTime.split(':')[0]);
          if (valueHour > nextStartHour) {
            console.warn(`Cannot set end time ${value} after next slot starts at ${nextSlot.startTime}`);
            return updated; 
          }
        }
        
        slots[slotIndex] = {
          ...slots[slotIndex],
          endTime: value
        };
      }
      
      currentDay.timeSlots = slots;
      updated[dayIndex] = currentDay;
      
      return updated;
    });
  };

  const validateAndFixSlots = (dayIndex) => {
    setAvailability(prev => {
      const updated = [...prev];
      const currentDay = { ...updated[dayIndex] };
      let slots = [...currentDay.timeSlots];
      
      // Sort slots by start time
      slots.sort((a, b) => {
        const aStart = parseInt(a.startTime.split(':')[0]);
        const bStart = parseInt(b.startTime.split(':')[0]);
        return aStart - bStart;
      });
      
      // Remove overlaps
      const validSlots = [];
      for (let i = 0; i < slots.length; i++) {
        const currentSlot = slots[i];
        const currentStart = parseInt(currentSlot.startTime.split(':')[0]);
        const currentEnd = parseInt(currentSlot.endTime.split(':')[0]);
        
        // Check if this slot overlaps with any already valid slot
        const hasOverlap = validSlots.some(validSlot => {
          const validStart = parseInt(validSlot.startTime.split(':')[0]);
          const validEnd = parseInt(validSlot.endTime.split(':')[0]);
          
          // Check for any overlap
          return (currentStart < validEnd && currentEnd > validStart);
        });
        
        if (!hasOverlap) {
          validSlots.push(currentSlot);
        } else {
          console.warn(`Removing overlapping slot: ${currentSlot.startTime}-${currentSlot.endTime}`);
        }
      }
      
      currentDay.timeSlots = validSlots;
      updated[dayIndex] = currentDay;
      
      return updated;
    });
  };

  // Helper function to check if a time slot conflicts with breaks
  const hasBreakConflict = (startTime, endTime) => {
    return breaks.some(breakItem => {
      const slotStart = new Date(`2000-01-01T${startTime}:00`);
      const slotEnd = new Date(`2000-01-01T${endTime}:00`);
      const breakStart = new Date(`2000-01-01T${breakItem.startTime}:00`);
      const breakEnd = new Date(`2000-01-01T${breakItem.endTime}:00`);
      
      return (slotStart < breakEnd && slotEnd > breakStart);
    });
  };

  // Save settings function
  const saveSettings = async () => {
    if (!activeAgentId) return;
    setIsLoading(true);

    const payload = {
      agentId: activeAgentId,
      bookingType,
      bookingsPerSlot,
      meetingDuration,
      bufferTime,
      breaks,
      availability,
      locations: meetingLocations.filter((l) => l.selected).map((l) => l.id),
      timezone,
      sessionType,
      price: {
        isFree,
        amount: priceAmount,
        currency: selectedCurrency,
      },
    };

    try {
      await updateAppointmentSettings(payload);

      if (onSetupComplete) {
        onSetupComplete();
      } else {
        // Use this simpler approach for testing
        console.log("Navigation triggered to: /admin/commerce/calendar");
        navigate("/admin/commerce/calendar");

        // If that doesn't work, try with the full path:
        // window.location.href = '/admin/commerce/calendar';
      }
    } catch (error) {
      console.error("Failed to save booking settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render navigation buttons
  const renderNavigationButtons = () => (
    <div className="flex justify-end items-center gap-4 mt-6">
      {currentStep > 1 && (
        <button
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center"
          onClick={goToPreviousStep}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          BACK
        </button>
      )}
      
      {currentStep < 5 ? (
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
          onClick={goToNextStep}
        >
          NEXT
          <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      ) : (
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          onClick={saveSettings}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              Saving...
            </span>
          ) : (
            "FINISH"
          )}
        </button>
      )}
    </div>
  );

  // Header component
  const renderHeader = () => (
    <div>
      <h1 className="text-2xl font-semibold">Set up Calendar</h1>
      <p className="text-gray-600 text-sm mt-1">
        Configure your calendar for appointments & 1:1 meetings
      </p>
    </div>
  );

  // Render step 1 - Booking Type
  const renderStep1 = () => (
    <div className="mt-8">
      <div className="bg-blue-50 p-6 rounded-lg">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-medium">
            1
          </div>
          <h3 className="ml-3 text-lg font-medium">Booking Type</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Individual Sessions Option */}
          <div
            className={`p-6 rounded-lg cursor-pointer transition-all ${
              bookingType === "individual"
                ? "bg-green-100 border-2 border-green-500"
                : "bg-white border border-gray-200"
            }`}
            onClick={() => {
              setBookingType("individual");
              setBookingsPerSlot(1); 
            }}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-medium">Individual 1:1 Sessions</h3>
            <p className="text-sm text-gray-600 mt-2">
              Ideal for Consultants, Coaches and Freelancers
            </p>
          </div>

          {/* Multiple Slots Option */}
          <div
            className={`p-6 rounded-lg cursor-pointer transition-all ${
              bookingType === "group"
                ? "bg-green-100 border-2 border-green-500"
                : "bg-white border border-gray-200"
            }`}
            onClick={() => {
              setBookingType("group");
              if (bookingsPerSlot < 2) {
                setBookingsPerSlot(2); 
              }
            }}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-600" />
              </div>
            </div>
            <h3 className="font-medium">Multiple Slots per Session</h3>
            <p className="text-sm text-gray-600 mt-2">
              Ideal for large-size service providers like Salons & Clinics
            </p>

            {bookingType === "group" && (
              <div className="mt-4">
                <label className="text-sm text-gray-600">
                  SLOTS PER SESSION
                </label>
                <div className="flex items-center mt-2">
                  <button
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBookingsPerSlot(Math.max(2, bookingsPerSlot - 1));
                    }}
                  >
                    -
                  </button>
                  <span className="mx-4 font-medium">{bookingsPerSlot}</span>
                  <button
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBookingsPerSlot(bookingsPerSlot + 1);
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {renderNavigationButtons()}
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-medium">
            2
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-400">Duration</h3>
        </div>
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-medium">
            3
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-400">
            Availability
          </h3>
        </div>
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-medium">
            4
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-400">Location</h3>
        </div>
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-medium">
            5
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-400">Pricing</h3>
        </div>
      </div>
    </div>
  );

  // Step 2 - Duration
  const renderStep2 = () => (
    <div className="mt-8">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <h3 className="ml-3 text-lg font-medium">Booking Type</h3>
        </div>
      </div>

      <div className="mt-4 bg-blue-50 p-6 rounded-lg">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-medium">
            2
          </div>
          <h3 className="ml-3 text-lg font-medium">Duration</h3>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">Your Time Zone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="p-2 border border-gray-300 rounded-md w-64"
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-start mb-2">
            <label className="text-sm font-medium block min-w-32">
              Duration
              <br />
              <span className="text-xs text-gray-500">Meeting slot</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setMeetingDuration(option.value)}
                  className={`px-4 py-2 rounded-md text-sm ${
                    meetingDuration === option.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-start mb-2">
            <label className="text-sm font-medium block min-w-32">
              Buffer
              <br />
              <span className="text-xs text-gray-500">Between meetings</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {BUFFER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setBufferTime(option.value)}
                  className={`px-4 py-2 rounded-md text-sm ${
                    bufferTime === option.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Break Section */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium">Break</span>
            <span className="text-xs text-gray-500 ml-2">Blocked-off time</span>
          </div>

          {/* Add Break Form */}
          <div className="flex items-center space-x-4 mb-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Start Time
              </label>
              <select
                value={newBreakStart}
                onChange={(e) => {
                  setNewBreakStart(e.target.value);
                  // If end time is not greater than new start time, adjust it
                  const startHour = parseInt(e.target.value.split(':')[0]);
                  const endHour = parseInt(newBreakEnd.split(':')[0]);
                  if (endHour <= startHour) {
                    const newEndHour = Math.min(startHour + 1, 23);
                    setNewBreakEnd(`${newEndHour.toString().padStart(2, "0")}:00`);
                  }
                }}
                className="p-1 border border-gray-300 rounded"
              >
                {Array.from({ length: 23 }).map((_, hour) => (
                  <option
                    key={hour}
                    value={`${hour.toString().padStart(2, "0")}:00`}
                  >
                    {`${hour.toString().padStart(2, "0")}:00`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                End Time
              </label>
              <select
                value={newBreakEnd}
                onChange={(e) => setNewBreakEnd(e.target.value)}
                className="p-1 border border-gray-300 rounded"
              >
                {(() => {
                  const startHour = parseInt(newBreakStart.split(':')[0]);
                  const availableEndTimes = [];
                  
                  // Generate end times that are after the start time
                  for (let hour = startHour + 1; hour <= 24; hour++) {
                    availableEndTimes.push(`${hour.toString().padStart(2, "0")}:00`);
                  }
                  
                  return availableEndTimes.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ));
                })()}
              </select>
            </div>

            <button
              className="mt-5 flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full"
              onClick={() => {
                // Validate that end time is after start time before adding
                const startHour = parseInt(newBreakStart.split(':')[0]);
                const endHour = parseInt(newBreakEnd.split(':')[0]);
                
                if (endHour > startHour) {
                  setBreaks((prev) => [
                    ...prev,
                    { startTime: newBreakStart, endTime: newBreakEnd },
                  ]);
                } else {
                  // This shouldn't happen with the new validation, but just in case
                  alert("End time must be after start time");
                }
              }}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Break List */}
          <div className="space-y-2">
            {breaks.map((breakItem, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 bg-white rounded"
              >
                <span>
                  {breakItem.startTime} — {breakItem.endTime}
                </span>
                <button
                  className="text-red-500 text-sm"
                  onClick={() =>
                    setBreaks((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
        {renderNavigationButtons()}
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-medium">
            3
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-400">
            Availability
          </h3>
        </div>
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-medium">
            4
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-400">Location</h3>
        </div>
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-medium">
            5
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-400">Pricing</h3>
        </div>
      </div>
    </div>
  );

  // Step 3 - Availability
const renderStep3 = () => {
  return (
    <div className="mt-8">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <h3 className="ml-3 text-lg font-medium">Booking Type</h3>
        </div>
      </div>
  
      <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <h3 className="ml-3 text-lg font-medium">Duration</h3>
        </div>
      </div>
  
      <div className="mt-4 bg-blue-50 p-6 rounded-lg">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-medium">
            3
          </div>
          <h3 className="ml-3 text-lg font-medium">Availability</h3>
        </div>
  
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium">Set your weekly hours</div>
            <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-md border">
              <Clock className="h-4 w-4 inline mr-1" />
              {formatTimezoneDisplay(timezone)}
            </div>
          </div>
          
          {breaks.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="text-sm font-medium text-yellow-800 mb-2">
                Scheduled Breaks:
              </div>
              <div className="flex flex-wrap gap-2">
                {breaks.map((breakItem, index) => (
                  <span key={index} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                    {breakItem.startTime} - {breakItem.endTime}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
  
        <div className="space-y-6">
          {availability.map((day, dayIndex) => (
            <div key={`${day.day}-${day.timeSlots.length}`} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="font-medium uppercase text-gray-700">{day.day}</div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={day.available}
                    onChange={() => toggleDayAvailability(dayIndex)}
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full peer transition-colors ${
                      day.available ? "bg-green-500" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`absolute w-5 h-5 rounded-full bg-white transition-all shadow-md ${
                        day.available ? "right-0.5" : "left-0.5"
                      } top-0.5`}
                    ></div>
                  </div>
                </label>
              </div>
  
              {day.available && (
                <div className="space-y-3">
                  {day.timeSlots.map((slot, slotIndex) => {
                    // ADD THIS DEBUG LOG
                    if (day.day === "Thursday") {
                      console.log(`Rendering ${day.day} slot ${slotIndex}:`, slot);
                      console.log(`Available start times:`, getAvailableStartTimes(dayIndex, slotIndex));
                      console.log(`Available end times:`, getAvailableEndTimes(dayIndex, slotIndex, slot.startTime));
                    }
                    
                    return (
                      <div key={slot.id || `${dayIndex}-${slotIndex}`} className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <select
                              value={slot.startTime}
                              onChange={(e) => {
                                console.log(`Changing start time for ${day.day} slot ${slotIndex} from ${slot.startTime} to ${e.target.value}`);
                                updateSpecificTimeSlot(dayIndex, slotIndex, "startTime", e.target.value);
                              }}
                              className="p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              {getAvailableStartTimes(dayIndex, slotIndex).map((time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
  
                            <span className="text-gray-400 font-medium">—</span>
  
                            <select
                              value={slot.endTime}
                              onChange={(e) => {
                                console.log(`Changing end time for ${day.day} slot ${slotIndex} from ${slot.endTime} to ${e.target.value}`);
                                updateSpecificTimeSlot(dayIndex, slotIndex, "endTime", e.target.value);
                              }}
                              className="p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              {getAvailableEndTimes(dayIndex, slotIndex, slot.startTime).map((time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
                          </div>
  
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                console.log(`Adding time slot for ${day.day} (index ${dayIndex})`);
                                addTimeSlot(dayIndex);
                              }}
                              className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                              title="Add time slot"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
  
                            {day.timeSlots.length > 1 && (
                              <button
                                onClick={() => {
                                  console.log(`Removing time slot ${slotIndex} for ${day.day}`);
                                  removeTimeSlot(dayIndex, slotIndex);
                                }}
                                className="flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                title="Remove time slot"
                              >
                                <span className="text-sm font-bold">×</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
  
                  {day.timeSlots.length === 0 && (
                    <div className="text-center py-4">
                      <button
                        onClick={() => addTimeSlot(dayIndex)}
                        className="flex items-center justify-center mx-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Time Slot
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
  
        {breaks.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-700">
                <div className="font-medium mb-1">Break Time Information</div>
                <div>If breaks are scheduled during your availability hours, those break times will be automatically removed from your available slots to prevent double booking.</div>
              </div>
            </div>
          </div>
        )}
      {renderNavigationButtons()} 
      </div>
  
      <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-medium">
            4
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-400">Location</h3>
        </div>
      </div>
  
      <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-medium">
            5
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-400">Pricing</h3>
        </div>
      </div>
    </div>
  );
};

  // Step 4 - Location
  const renderStep4 = () => (
    <div className="mt-8">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <h3 className="ml-3 text-lg font-medium">Booking Type</h3>
        </div>
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <h3 className="ml-3 text-lg font-medium">Duration</h3>
        </div>
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <h3 className="ml-3 text-lg font-medium">Availability</h3>
        </div>
      </div>

      <div className="mt-4 bg-blue-50 p-6 rounded-lg">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-medium">
            4
          </div>
          <h3 className="ml-3 text-lg font-medium">Location</h3>
        </div>

        <div className="mb-4">
          <div className="text-sm font-medium">
            Choose your preferred meeting method
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {meetingLocations.map((location) => (
            <div
              key={location.id}
              className={`p-6 bg-white border rounded-lg flex flex-col items-center cursor-pointer ${
                location.id === selectedLocation
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200"
              }`}
              onClick={() => selectMeetingLocation(location.id)}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  location.id === selectedLocation
                    ? "bg-green-500"
                    : "bg-gray-100"
                }`}
              >
                <div className="text-center">
                  {React.cloneElement(location.icon as React.ReactElement, {
                    className: `h-5 w-5 ${
                      location.id === selectedLocation
                        ? "text-white"
                        : "text-gray-500"
                    }`,
                  })}
                </div>
              </div>
              <div className="mt-3 text-center">
                <span className="font-medium text-sm">
                  {location.id === "in_person" ? "IN-PERSON" : location.name}
                </span>
              </div>
            </div>
          ))}
        </div>
        {renderNavigationButtons()}
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-medium">
            5
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-400">Pricing</h3>
        </div>
      </div>
    </div>
  );

  // Step 5 - Pricing
  const renderStep5 = () => (
    <div className="mt-8">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <h3 className="ml-3 text-lg font-medium">Booking Type</h3>
        </div>
      </div>
  
      <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <h3 className="ml-3 text-lg font-medium">Duration</h3>
        </div>
      </div>
  
      <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <h3 className="ml-3 text-lg font-medium">Availability</h3>
        </div>
      </div>
  
      <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <h3 className="ml-3 text-lg font-medium">Location</h3>
        </div>
      </div>
  
      <div className="mt-4 bg-blue-50 p-6 rounded-lg">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-medium">
            5
          </div>
          <h3 className="ml-3 text-lg font-medium">Pricing</h3>
        </div>
  
        <div className="bg-white p-6 rounded-lg mb-6">
          <div className="flex items-center mb-4">
            <DollarSign className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="font-medium">Session Pricing</h3>
          </div>
  
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Type
            </label>
            <input
              type="text"
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
              placeholder="Enter session type (e.g. Consultation, Therapy Session, Coaching Call)"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter what type of session this is (e.g. "Consultation", "Therapy Session", "Coaching Call")
            </p>
          </div>
  
          <div className="mb-6">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-medium">Paid Session</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={!isFree}
                  onChange={() => setIsFree(!isFree)}
                  className="sr-only"
                />
                <div
                  className={`w-11 h-6 rounded-full peer transition-colors ${
                    !isFree ? "bg-blue-500" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`absolute w-5 h-5 rounded-full bg-white transition-all shadow-md ${
                      !isFree ? "right-0.5" : "left-0.5"
                    } top-0.5`}
                  ></div>
                </div>
              </div>
            </label>
            <p className="text-sm text-gray-500 mt-1">
              {isFree
                ? "Your sessions will be offered for free."
                : "Your sessions will require payment."}
            </p>
          </div>
  
          {!isFree && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Price
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500 text-sm">
                      {CURRENCIES.find((c) => c.code === selectedCurrency)?.symbol || "$"}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={priceAmount || ""}
                    onChange={handlePriceAmountChange}
                    className="block w-full rounded-md border border-gray-300 pl-8 pr-3 py-2 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                    placeholder="10"
                  />
                </div>
                <div className="mt-2">
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {CURRENCIES.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.name} ({currency.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
        {renderNavigationButtons()}
      </div>
    </div>
  );

  // Content based on current step
  const renderContent = () => {
    if (isFetchingSettings) {
      return (
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
          <span className="ml-3 text-lg">Loading settings...</span>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {renderHeader()}
      {renderContent()}
    </div>
  );
};

export default Booking;
