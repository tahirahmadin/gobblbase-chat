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
import { toast } from "react-hot-toast";
import TimezoneSelector, { getConsistentTimezoneLabel } from "../../../components/chatbotComponents/chatbotBookingComponents/TimezoneSelector";
import { formatTimezone, isValidTimezone, getUserTimezone } from "../../../utils/timezoneUtils";

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
    timeSlots: [
      { id: "tuesday_default", startTime: "09:00", endTime: "17:00" },
    ],
  },
  {
    day: "Wednesday",
    available: true,
    timeSlots: [
      { id: "wednesday_default", startTime: "09:00", endTime: "17:00" },
    ],
  },
  {
    day: "Thursday",
    available: true,
    timeSlots: [
      { id: "thursday_default", startTime: "09:00", endTime: "17:00" },
    ],
  },
  {
    day: "Friday",
    available: true,
    timeSlots: [{ id: "friday_default", startTime: "09:00", endTime: "17:00" }],
  },
  { day: "Saturday", available: false, timeSlots: [] },
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
  const globalCurrency = activeBotData?.currency || "USD";
  const [sessionType, setSessionType] = useState("Consultation");
  const [priceError, setPriceError] = useState("");

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
  
  // IMPROVED: Use user's actual timezone with better detection
  const [timezone, setTimezone] = useState<string>(() => {
    try {
      const userTz = getUserTimezone();
      return isValidTimezone(userTz) ? userTz : "UTC";
    } catch (error) {
      console.error("Error getting user timezone:", error);
      return "UTC";
    }
  });
  
  const [isFree, setIsFree] = useState(false);
  const [priceAmount, setPriceAmount] = useState(0);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSettings, setIsFetchingSettings] = useState(isEditMode);

  const generateTimeOptions = (startHour = 0, endHour = 24) => {
    const times = [];
    const increment = meetingDuration >= 60 ? 60 : meetingDuration;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += increment) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        times.push(timeString);
      }
    }

    return times;
  };

  const generateBreakTimeOptions = (startHour = 0, endHour = 24) => {
    const times = [];
    const increment = 30;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += increment) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        times.push(timeString);
      }
    }

    return times;
  };

  const breaksOverlap = (break1: Break, break2: Break): boolean => {
    const start1 = new Date(`2000-01-01T${break1.startTime}:00`);
    const end1 = new Date(`2000-01-01T${break1.endTime}:00`);
    const start2 = new Date(`2000-01-01T${break2.startTime}:00`);
    const end2 = new Date(`2000-01-01T${break2.endTime}:00`);

    return start1 < end2 && end1 > start2;
  };

  const validateNewBreak = (newBreak: Break): string | null => {
    for (const existingBreak of breaks) {
      if (breaksOverlap(newBreak, existingBreak)) {
        return `This break overlaps with existing break: ${existingBreak.startTime} - ${existingBreak.endTime}`;
      }
    }
    return null;
  };

  // Navigation functions
  const goToNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // IMPROVED: Timezone change handler using consistent display
  const handleTimezoneChange = (newTimezone: string) => {
    if (isValidTimezone(newTimezone)) {
      setTimezone(newTimezone);
      toast.success(`Timezone changed to ${getConsistentTimezoneLabel(newTimezone)}`);
    } else {
      toast.error("Invalid timezone selected");
    }
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
          setBufferTime(
            settings.bufferTime !== undefined ? settings.bufferTime : 10
          );

          setBreaks(settings.breaks || []);
          setSessionType(settings.sessionType || "Consultation");

          if (settings.availability && settings.availability.length > 0) {
            // Ensure all timeSlots have IDs
            const availabilityWithIds = settings.availability.map(
              (day, dayIndex) => ({
                ...day,
                timeSlots: day.timeSlots.map((slot, slotIndex) => ({
                  ...slot,
                  id:
                    slot.id || `fetched_${dayIndex}_${slotIndex}_${Date.now()}`,
                })),
              })
            );
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

          // IMPROVED: Better timezone handling from settings
          if (settings.timezone && isValidTimezone(settings.timezone)) {
            setTimezone(settings.timezone);
          }

          // Load pricing data if available
          if (settings.price) {
            setIsFree(settings.price.isFree);
            setPriceAmount(settings.price.amount || 0);
          }
        }
      } catch (error) {
        console.error("Error fetching booking settings:", error);
        toast.error("Failed to load existing settings");
      } finally {
        setIsFetchingSettings(false);
      }
    };

    if (isEditMode) {
      fetchSettings();
    }
  }, [activeAgentId, isEditMode, globalCurrency]);

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
          : [
              {
                id: `default_${dayIndex}_${Date.now()}`,
                startTime: "09:00",
                endTime: "17:00",
              },
            ],
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

  const handlePriceAmountChange = (e) => {
    if (priceError) {
      setPriceError("");
    }
    
    const rawValue = e.target.value.replace(/[^0-9.]/g, "");
  
    if (rawValue === "" || rawValue === ".") {
      setPriceAmount(0);
      return;
    }
  
    const numValue = parseFloat(rawValue);
    if (!isNaN(numValue)) {
      setPriceAmount(numValue);
    }
  };

  const getAvailableStartTimes = (dayIndex, currentSlotIndex) => {
    const currentSlots = availability[dayIndex].timeSlots;
    const allTimes = generateTimeOptions(0, 24);

    if (currentSlotIndex === 0) {
      const nextSlot = currentSlots[1];
      if (nextSlot) {
        const nextStartTime = nextSlot.startTime;
        return allTimes.filter((time) => time < nextStartTime);
      }
      return allTimes.filter((time) => time < "23:00");
    }

    const previousSlot = currentSlots[currentSlotIndex - 1];
    if (!previousSlot) {
      return [`09:00`];
    }

    const previousEndTime = previousSlot.endTime;

    let maxStartTime = "23:00";
    const nextSlot = currentSlots[currentSlotIndex + 1];
    if (nextSlot) {
      maxStartTime = nextSlot.startTime;
    }

    return allTimes.filter(
      (time) => time >= previousEndTime && time < maxStartTime
    );
  };

  const getAvailableEndTimes = (dayIndex, currentSlotIndex, startTime) => {
    const currentSlots = availability[dayIndex].timeSlots;
    const allTimes = generateTimeOptions(0, 24);

    // Add 24:00 as an option for end times
    allTimes.push("24:00");

    let maxEndTime = "24:00";

    const nextSlot = currentSlots[currentSlotIndex + 1];
    if (nextSlot) {
      maxEndTime = nextSlot.startTime;
    }

    return allTimes.filter((time) => time > startTime && time <= maxEndTime);
  };

  const addTimeSlot = (dayIndex) => {
    setAvailability((prev) => {
      const updated = [...prev];
      const currentDay = { ...updated[dayIndex] };
      const currentSlots = [...currentDay.timeSlots];

      if (currentSlots.length === 0) {
        currentDay.timeSlots = [
          {
            id: `slot_${Date.now()}`,
            startTime: "09:00",
            endTime: "17:00",
          },
        ];
        updated[dayIndex] = currentDay;
        return updated;
      }

      // Find the latest end time
      let latestEndTime = "00:00";

      for (const slot of currentSlots) {
        if (slot.endTime > latestEndTime) {
          latestEndTime = slot.endTime;
        }
      }

      // Generate time options and find the next available slot
      const allTimes = generateTimeOptions(0, 24);
      const increment = meetingDuration >= 60 ? 60 : meetingDuration;

      // Calculate next available start time
      const latestEndIndex = allTimes.indexOf(latestEndTime);
      const nextStartIndex = latestEndIndex >= 0 ? latestEndIndex : 0;

      if (nextStartIndex < allTimes.length - 1) {
        const newStartTime =
          allTimes[nextStartIndex] === latestEndTime
            ? allTimes[nextStartIndex]
            : latestEndTime;

        // Calculate end time based on meeting duration
        const startIndex = allTimes.indexOf(newStartTime);
        const slotsNeeded = Math.ceil(meetingDuration / increment);
        const endIndex = Math.min(startIndex + slotsNeeded, allTimes.length);
        const newEndTime =
          endIndex < allTimes.length ? allTimes[endIndex] : "24:00";

        if (newStartTime < "24:00" && newEndTime <= "24:00") {
          const newSlot = {
            id: `slot_${Date.now()}`,
            startTime: newStartTime,
            endTime: newEndTime,
          };
          currentDay.timeSlots = [...currentSlots, newSlot];
        }
      }

      updated[dayIndex] = currentDay;
      return updated;
    });
  };

  const removeTimeSlot = (dayIndex, slotIndex) => {
    setAvailability((prev) => {
      const updated = [...prev];
      const currentDay = { ...updated[dayIndex] };

      currentDay.timeSlots = currentDay.timeSlots.filter(
        (_, index) => index !== slotIndex
      );

      if (currentDay.timeSlots.length === 0 && currentDay.available) {
        currentDay.timeSlots = [
          {
            id: `default_${dayIndex}_${Date.now()}`,
            startTime: "09:00",
            endTime: "17:00",
          },
        ];
      }

      updated[dayIndex] = currentDay;
      return updated;
    });
  };

  const updateSpecificTimeSlot = (dayIndex, slotIndex, field, value) => {
    setAvailability((prev) => {
      const updated = [...prev];
      const currentDay = { ...updated[dayIndex] };
      const slots = [...currentDay.timeSlots];

      if (!slots[slotIndex]) return updated;

      if (field === "startTime") {
        // Validate start time against previous slot
        if (slotIndex > 0) {
          const previousSlot = slots[slotIndex - 1];
          if (value < previousSlot.endTime) {
            console.warn(
              `Cannot set start time ${value} before previous slot ends at ${previousSlot.endTime}`
            );
            return updated;
          }
        }

        // Validate start time against next slot
        if (slotIndex < slots.length - 1) {
          const nextSlot = slots[slotIndex + 1];
          if (value >= nextSlot.startTime) {
            console.warn(
              `Cannot set start time ${value} at or after next slot starts at ${nextSlot.startTime}`
            );
            return updated;
          }
        }

        slots[slotIndex] = {
          ...slots[slotIndex],
          startTime: value,
        };

        // Auto-adjust end time if necessary
        if (value >= slots[slotIndex].endTime) {
          const allTimes = generateTimeOptions(0, 24);
          allTimes.push("24:00");
          const startIndex = allTimes.indexOf(value);
          const increment = meetingDuration >= 60 ? 60 : meetingDuration;
          const slotsNeeded = Math.ceil(meetingDuration / increment);
          const endIndex = Math.min(
            startIndex + slotsNeeded,
            allTimes.length - 1
          );
          let newEndTime = allTimes[endIndex] || "24:00";

          // Check against next slot
          if (slotIndex < slots.length - 1) {
            const nextSlot = slots[slotIndex + 1];
            if (newEndTime > nextSlot.startTime) {
              newEndTime = nextSlot.startTime;
            }
          }

          slots[slotIndex] = {
            ...slots[slotIndex],
            endTime: newEndTime,
          };
        }
      } else if (field === "endTime") {
        // Validate end time is after start time
        if (value <= slots[slotIndex].startTime) {
          console.warn(
            `End time ${value} must be after start time ${slots[slotIndex].startTime}`
          );
          return updated;
        }

        // Validate end time against next slot
        if (slotIndex < slots.length - 1) {
          const nextSlot = slots[slotIndex + 1];
          if (value > nextSlot.startTime) {
            console.warn(
              `Cannot set end time ${value} after next slot starts at ${nextSlot.startTime}`
            );
            return updated;
          }
        }

        slots[slotIndex] = {
          ...slots[slotIndex],
          endTime: value,
        };
      }

      currentDay.timeSlots = slots;
      updated[dayIndex] = currentDay;

      return updated;
    });
  };

  // Helper function to check if a time slot conflicts with breaks
  const hasBreakConflict = (startTime, endTime) => {
    return breaks.some((breakItem) => {
      const slotStart = new Date(`2000-01-01T${startTime}:00`);
      const slotEnd = new Date(`2000-01-01T${endTime}:00`);
      const breakStart = new Date(`2000-01-01T${breakItem.startTime}:00`);
      const breakEnd = new Date(`2000-01-01T${breakItem.endTime}:00`);

      return slotStart < breakEnd && slotEnd > breakStart;
    });
  };

  // Save settings function
  const saveSettings = async () => {
    if (!activeAgentId) return;

    setPriceError("");

    if (!isFree && (!priceAmount || priceAmount <= 0)) {
      setPriceError("Price cannot be empty for paid sessions");
      return;
    }

    if (!isValidTimezone(timezone)) {
      toast.error("Invalid timezone selected. Please choose a valid timezone.");
      return;
    }

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
        currency: globalCurrency,
      },
    };

    try {
      await updateAppointmentSettings(payload);
      toast.success(`Calendar settings saved with timezone ${getConsistentTimezoneLabel(timezone)}`);

      if (onSetupComplete) {
        onSetupComplete();
      } else {
        navigate("/admin/commerce/calendar");
      }
    } catch (error) {
      console.error("Failed to save booking settings:", error);
      toast.error("Failed to save settings. Please try again.");
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
    <div className="text-center md:text-left">
      <h1 className="text-xl md:text-2xl font-semibold">
        {isEditMode ? "Edit Calendar Settings" : "Set up Calendar"}
      </h1>
      <p className="text-gray-600 text-sm mt-1">
        {isEditMode
          ? "Update your calendar configuration for appointments & 1:1 meetings"
          : "Configure your calendar for appointments & 1:1 meetings"}
      </p>
    </div>
  );

  // Render step 1 - Booking Type (keeping existing implementation)
  const renderStep1 = () => (
    <div className="mt-6 md:mt-8 px-2 md:px-0">
    <div className="bg-blue-50 p-4 md:p-6 rounded-lg">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-medium">
            1
          </div>
          <h3 className="ml-3 text-lg font-medium">Booking Type</h3>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Individual Sessions Option */}
          <div
            className={`p-6 rounded-lg cursor-pointer transition-all border-2 ${
              bookingType === "individual"
                ? "bg-green-100 border-green-500"
                : "bg-white border-gray-200 hover:border-gray-300"
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
            <h3 className="font-medium text-gray-900 mb-2">Individual 1:1 Sessions</h3>
            <p className="text-sm text-gray-600">
              Ideal for Consultants, Coaches and Freelancers
            </p>
          </div>
  
          {/* Multiple Slots Option */}
          <div
            className={`p-6 rounded-lg cursor-pointer transition-all border-2 ${
              bookingType === "group"
                ? "bg-green-100 border-green-500"
                : "bg-white border-gray-200 hover:border-gray-300"
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
            <h3 className="font-medium text-gray-900 mb-2">Multiple Slots per Session</h3>
            <p className="text-sm text-gray-600 mb-4">
              Ideal for large-size service providers like Salons & Clinics
            </p>
  
            {bookingType === "group" && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-600 font-medium">
                    SLOTS PER SESSION
                  </label>
                  <div className="flex items-center bg-gray-800 text-white px-3 py-1 rounded-full">
                    <button
                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBookingsPerSlot(Math.max(2, bookingsPerSlot - 1));
                      }}
                    >
                      -
                    </button>
                    <span className="mx-3 font-medium min-w-[20px] text-center">{bookingsPerSlot}</span>
                    <button
                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBookingsPerSlot(bookingsPerSlot + 1);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {renderNavigationButtons()}
      </div>
  
      {/* Step Progress */}
      <div className="mt-4 bg-white border border-gray-200 rounded-lg p-3 md:p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-medium">
            2
          </div>
          <h3 className="ml-3 text-base md:text-lg font-medium text-gray-400">Duration</h3>
        </div>
      </div>
  
      <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-medium">
            3
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-400">Availability</h3>
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

  // IMPROVED: Step 2 - Duration with better timezone selector
  const renderStep2 = () => (
    <div className="mt-6 md:mt-8 px-2 md:px-0">
      {/* Completed Step 1 */}
      <div className="bg-green-100 border border-green-300 rounded-lg p-3 md:p-4 mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <h3 className="ml-3 text-base md:text-lg font-medium text-gray-900">Booking Type</h3>
        </div>
      </div>
  
      {/* Active Step 2 */}
      <div className="bg-blue-50 p-6 md:p-6 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center mb-2 md:mb-0">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
              2
            </div>
            <h3 className="ml-3 text-lg font-medium">Duration</h3>
          </div>
          
          {/* IMPROVED: Better timezone selector with consistent display */}
          <div className="flex items-center">
            <span className="text-sm font-medium mr-3">Your Time Zone</span>
            <div className="min-w-[200px]">
              <TimezoneSelector
                selectedTimezone={timezone}
                onTimezoneChange={handleTimezoneChange}
                theme={{
                  isDark: false,
                  mainLightColor: "#3b82f6",
                  highlightColor: "#3b82f6"
                }}
                showLabel={true}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Timezone Display - Show current selection clearly */}
        <div className="mb-6 p-3 bg-blue-100 border border-blue-200 rounded-lg">
          <div className="flex items-center text-sm text-blue-800">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              <strong>Selected Timezone:</strong> {getConsistentTimezoneLabel(timezone)}
            </span>
          </div>
        </div>
  
        {/* Duration Section */}
        <div className="mb-6">
          <div className="flex items-start mb-3">
            <div className="min-w-[120px]">
              <label className="text-sm font-medium text-gray-900">Duration</label>
              <div className="text-xs text-gray-500">Meeting slot</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setMeetingDuration(option.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  meetingDuration === option.value
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
  
        {/* Buffer Section */}
        <div className="mb-6">
          <div className="flex items-start mb-3">
            <div className="min-w-[120px]">
              <label className="text-sm font-medium text-gray-900">Buffer</label>
              <div className="text-xs text-gray-500">Between meetings</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {BUFFER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setBufferTime(option.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  bufferTime === option.value
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
  
        {/* Break Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="text-sm font-medium text-gray-900">Break</label>
              <div className="text-xs text-gray-500">Blocked-off time</div>
            </div>
            
            {/* Break Toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={breaks.length > 0 || newBreakStart !== "12:00" || newBreakEnd !== "13:00"}
                onChange={(e) => {
                  if (!e.target.checked) {
                    setBreaks([]);
                    setNewBreakStart("12:00");
                    setNewBreakEnd("13:00");
                  }
                }}
                className="sr-only"
              />
              <div className={`w-11 h-6 rounded-full peer transition-colors ${
                breaks.length > 0 ? "bg-green-500" : "bg-gray-200"
              }`}>
                <div className={`absolute w-5 h-5 rounded-full bg-white transition-all shadow-md ${
                  breaks.length > 0 ? "right-0.5" : "left-0.5"
                } top-0.5`}></div>
              </div>
            </label>
          </div>
  
          {/* Break Time Selectors */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Start Time</label>
              <select
                value={newBreakStart}
                onChange={(e) => {
                  setNewBreakStart(e.target.value);
                  if (newBreakEnd <= e.target.value) {
                    const allTimes = generateBreakTimeOptions(0, 24);
                    const startIndex = allTimes.indexOf(e.target.value);
                    const nextTimeIndex = Math.min(startIndex + 1, allTimes.length - 1);
                    setNewBreakEnd(allTimes[nextTimeIndex] || "24:00");
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
              >
                {generateBreakTimeOptions(0, 23).map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
  
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">End Time</label>
              <select
                value={newBreakEnd}
                onChange={(e) => setNewBreakEnd(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
              >
                {(() => {
                  const allTimes = generateBreakTimeOptions(0, 24);
                  allTimes.push("24:00");
                  return allTimes
                    .filter((time) => time > newBreakStart)
                    .map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ));
                })()}
              </select>
            </div>
  
            <button
              className="mt-5 flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              onClick={() => {
                const newBreak = {
                  startTime: newBreakStart,
                  endTime: newBreakEnd,
                };
                const validationError = validateNewBreak(newBreak);
  
                if (validationError) {
                  toast.error(validationError);
                  return;
                }
  
                if (newBreakEnd > newBreakStart) {
                  setBreaks((prev) => [...prev, newBreak]);
                  toast.success("Break added successfully!");
                } else {
                  toast.error("End time must be after start time");
                }
              }}
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
  
          {/* Break List */}
          {breaks.length > 0 && (
            <div className="space-y-2">
              {breaks.map((breakItem, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-white rounded-md border border-gray-200"
                >
                  <span className="text-sm text-gray-700">
                    {breakItem.startTime} — {breakItem.endTime}
                  </span>
                  <button
                    className="text-red-500 text-sm hover:text-red-700 font-medium"
                    onClick={() =>
                      setBreaks((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
  
        {renderNavigationButtons()}
      </div>
  
      {/* Inactive Steps */}
      <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-medium">
            3
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-400">Availability</h3>
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
      <div className="mt-6 md:mt-8 px-2 md:px-0">
        {/* Completed Steps */}
        <div className="bg-green-100 border border-green-300 rounded-lg p-3 md:p-4 mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
            <Check className="w-4 h-4" />
            </div>
            <h3 className="ml-3 text-base md:text-lg font-medium text-gray-900">Booking Type</h3>
          </div>
        </div>

        <div className="bg-green-100 border border-green-300 rounded-lg p-3 md:p-4 mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <h3 className="ml-3 text-base md:text-lg font-medium text-gray-900">Duration</h3>
          </div>
        </div>

        {/* Active Step 3 */}
        <div className="bg-blue-50 p-4 md:p-6 rounded-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center mb-2 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                3
              </div>
              <h3 className="ml-3 text-lg font-medium">Availability</h3>
            </div>
            <div className="text-sm text-gray-600">
              Set your weekly hours
            </div>
          </div>
  
          {/* Days of the week */}
          <div className="space-y-2 overflow-x-auto">
            {availability.map((day, dayIndex) => (
              <div key={day.day} className="min-w-full">
                {/* First row for each day */}
                <div className="flex items-center gap-2 md:gap-3 min-w-max md:min-w-0">
                  {/* Day name - fixed width */}
                  <div className="w-10 md:w-12 text-xs md:text-sm font-medium text-gray-700 uppercase flex-shrink-0">
                    {day.day.slice(0, 3)}
                  </div>
  
                  {/* Toggle switch */}
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={day.available}
                      onChange={() => toggleDayAvailability(dayIndex)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 md:w-11 md:h-6 rounded-full transition-colors ${
                      day.available ? "bg-green-500" : "bg-gray-200"
                    }`}>
                      <div className={`absolute w-4 h-4 md:w-5 md:h-5 rounded-full bg-white transition-all shadow-md ${
                        day.available ? "right-0.5" : "left-0.5"
                      } top-0.5`}></div>
                    </div>
                  </label>
  
                  {/* Clock icon and time slots */}
                  {day.available && (
                    <>
                      <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      
                      {/* Time slots container */}
                      <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                        {day.timeSlots.length > 0 ? (
                          <>
                            {/* First time slot */}
                            <select
                              value={day.timeSlots[0].startTime}
                              onChange={(e) => {
                                updateSpecificTimeSlot(dayIndex, 0, "startTime", e.target.value);
                              }}
                              className="p-1 md:p-2 border border-gray-300 rounded text-xs md:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-16 md:w-20"
                            >
                              {getAvailableStartTimes(dayIndex, 0).map((time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
  
                            <span className="text-gray-400 font-medium text-xs md:text-sm">—</span>
  
                            <select
                              value={day.timeSlots[0].endTime}
                              onChange={(e) => {
                                updateSpecificTimeSlot(dayIndex, 0, "endTime", e.target.value);
                              }}
                              className="p-1 md:p-2 border border-gray-300 rounded text-xs md:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-16 md:w-20"
                            >
                              {getAvailableEndTimes(dayIndex, 0, day.timeSlots[0].startTime).map((time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
  
                            {/* Remove first slot button (only show if more than 1 slot) */}
                            {day.timeSlots.length > 1 && (
                              <button
                                onClick={() => removeTimeSlot(dayIndex, 0)}
                                className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                                title="Remove time slot"
                              >
                                <span className="text-sm md:text-lg font-bold">×</span>
                              </button>
                            )}
  
                            {/* Add slot button */}
                            <button
                              onClick={() => addTimeSlot(dayIndex)}
                              className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors flex-shrink-0"
                              title="Add time slot"
                            >
                              <Plus className="h-3 w-3 md:h-4 md:w-4" />
                            </button>
                          </>
                        ) : (
                          /* Empty state - add first slot */
                          <button
                            onClick={() => addTimeSlot(dayIndex)}
                            className="flex items-center text-xs md:text-sm text-blue-600 hover:text-blue-700"
                          >
                            <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                            Add time slot
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
  
                {/* Additional time slots (rendered below with proper indentation) */}
                {day.available && day.timeSlots.slice(1).map((slot, slotIndex) => {
                  const actualSlotIndex = slotIndex + 1;
                  return (
                    <div key={slot.id || `${dayIndex}-${actualSlotIndex}`} className="flex items-center gap-2 md:gap-3 mt-1 md:mt-2 min-w-max md:min-w-0">
                      {/* Empty space for day name alignment */}
                      <div className="w-10 md:w-12 flex-shrink-0"></div>
                      
                      {/* Empty space for toggle alignment */}
                      <div className="w-10 md:w-11 flex-shrink-0"></div>
                      
                      {/* Empty space for clock icon alignment */}
                      <div className="w-4 flex-shrink-0"></div>
                      
                      {/* Time slot controls */}
                      <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                        <select
                          value={slot.startTime}
                          onChange={(e) => {
                            updateSpecificTimeSlot(dayIndex, actualSlotIndex, "startTime", e.target.value);
                          }}
                          className="p-1 md:p-2 border border-gray-300 rounded text-xs md:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-16 md:w-20"
                        >
                          {getAvailableStartTimes(dayIndex, actualSlotIndex).map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
  
                        <span className="text-gray-400 font-medium text-xs md:text-sm">—</span>
  
                        <select
                          value={slot.endTime}
                          onChange={(e) => {
                            updateSpecificTimeSlot(dayIndex, actualSlotIndex, "endTime", e.target.value);
                          }}
                          className="p-1 md:p-2 border border-gray-300 rounded text-xs md:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-16 md:w-20"
                        >
                          {getAvailableEndTimes(dayIndex, actualSlotIndex, slot.startTime).map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
  
                        {/* Remove slot button */}
                        <button
                          onClick={() => removeTimeSlot(dayIndex, actualSlotIndex)}
                          className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                          title="Remove time slot"
                        >
                          <span className="text-sm md:text-lg font-bold">×</span>
                        </button>
  
                        {/* Add another slot button */}
                        <button
                          onClick={() => addTimeSlot(dayIndex)}
                          className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors flex-shrink-0"
                          title="Add time slot"
                        >
                          <Plus className="h-3 w-3 md:h-4 md:w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
  
          {/* Break time information */}
          {breaks.length > 0 && (
            <div className="mt-6 p-3 md:p-4 bg-blue-100 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-xs md:text-sm text-blue-700">
                  <div className="font-medium mb-1">Scheduled Breaks:</div>
                  <div className="flex flex-wrap gap-1 md:gap-2 mb-2">
                    {breaks.map((breakItem, index) => (
                      <span key={index} className="inline-block bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs">
                        {breakItem.startTime} - {breakItem.endTime}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs">
                    Break times will be automatically excluded from your available slots.
                  </div>
                </div>
              </div>
            </div>
          )}
  
          {renderNavigationButtons()}
        </div>
  
        {/* Inactive Steps */}
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
    <div className="mt-6 md:mt-8 px-2 md:px-0">
      {/* Completed Steps with mobile padding */}
      <div className="bg-green-100 border border-green-300 rounded-lg p-3 md:p-4 mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <h3 className="ml-3 text-base md:text-lg font-medium text-gray-900">Booking Type</h3>
        </div>
      </div>
  
      <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-900">Duration</h3>
        </div>
      </div>
  
      <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-900">Availability</h3>
        </div>
      </div>
  
      {/* Active Step 4 */}
      <div className="bg-blue-50 p-4 md:p-6 rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
              4
            </div>
            <h3 className="ml-3 text-lg font-medium">Location</h3>
          </div>
          <div className="text-sm text-gray-600 hidden md:block">
            Choose your preferred meeting method
          </div>
        </div>
  
        {/* Mobile header */}
        <div className="text-sm text-gray-600 mb-6 md:hidden">
          Choose your preferred meeting method
        </div>
  
        {/* Desktop: 4 columns layout */}
        <div className="hidden md:grid md:grid-cols-4 gap-4 mb-6">
          {meetingLocations.map((location) => (
            <div
              key={location.id}
              className={`p-4 bg-white border-2 rounded-lg flex flex-col items-center cursor-pointer transition-all hover:shadow-md ${
                location.id === selectedLocation
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => selectMeetingLocation(location.id)}
            >
              {/* Content - logo images or text */}
              <div className="flex items-center justify-center">
                {location.id === "google_meet" && (
                  <>
                    <img 
                      src="/assets/calendar/gmeet.png" 
                      alt="Google Meet"
                      className="h-10 w-auto object-contain max-w-[150px]"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden items-center gap-2">
                      <Video className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-700">Google Meet</span>
                    </div>
                  </>
                )}
                
                {location.id === "zoom" && (
                  <>
                    <img 
                      src="/assets/calendar/zoom.png" 
                      alt="Zoom"
                      className="h-10 w-auto object-contain max-w-[150px]"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden items-center gap-2">
                      <Video className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-700">Zoom</span>
                    </div>
                  </>
                )}
                
                {location.id === "teams" && (
                  <>
                    <img 
                      src="/assets/calendar/teams.png" 
                      alt="Microsoft Teams"
                      className="h-10 w-auto object-contain max-w-[150px]"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden items-center gap-2">
                      <Video className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-700">Microsoft Teams</span>
                    </div>
                  </>
                )}
                
                {location.id === "in_person" && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">IN-PERSON</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
  
        {/* Mobile: Single column layout */}
        <div className="md:hidden space-y-3 mb-6">
          {meetingLocations.map((location) => (
            <div
              key={location.id}
              className={`p-4 bg-white border rounded-lg flex items-center cursor-pointer transition-all ${
                location.id === selectedLocation
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200"
              }`}
              onClick={() => selectMeetingLocation(location.id)}
            >
              {/* Content - logo images or text */}
              <div className="flex items-center justify-center">
                {location.id === "google_meet" && (
                  <>
                    <img 
                      src="/assets/calendar/gmeet.png" 
                      alt="Google Meet"
                      className="h-8 w-auto object-contain max-w-[120px]"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden items-center gap-2">
                      <Video className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-700">Google Meet</span>
                    </div>
                  </>
                )}
                
                {location.id === "zoom" && (
                  <>
                    <img 
                      src="/assets/calendar/zoom.png" 
                      alt="Zoom"
                      className="h-8 w-auto object-contain max-w-[120px]"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden items-center gap-2">
                      <Video className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-700">Zoom</span>
                    </div>
                  </>
                )}
                
                {location.id === "teams" && (
                  <>
                    <img 
                      src="/assets/calendar/teams.png" 
                      alt="Microsoft Teams"
                      className="h-8 w-auto object-contain max-w-[120px]"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden items-center gap-2">
                      <Video className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-700">Microsoft Teams</span>
                    </div>
                  </>
                )}
                
                {location.id === "in_person" && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-700">IN-PERSON</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
  
        {renderNavigationButtons()}
      </div>
  
      {/* Inactive Step 5 */}
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
    <div className="mt-6 md:mt-8 px-2 md:px-0">
      <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <h3 className="ml-3 text-base md:text-lg font-medium">Booking Type</h3>
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
  
      <div className="mt-4 bg-blue-50 p-4 md:p-6 rounded-lg">
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

          {/* Display global currency info - read-only */}
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-blue-500 mr-2">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Currency:</strong> {globalCurrency}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Currency is set globally and cannot be changed here. Contact admin to modify currency settings.
                </p>
              </div>
            </div>
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
              Enter what type of session this is (e.g. "Consultation", "Therapy
              Session", "Coaching Call")
            </p>
          </div>
  
          <div className="mb-6">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-medium">Paid Session</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={!isFree}
                  onChange={() => {
                    setIsFree(!isFree);
                    // Clear price error when toggling to free
                    if (!isFree) {
                      setPriceError("");
                    }
                  }}
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
                  Session Price ({globalCurrency})
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    value={priceAmount || ""}
                    onChange={handlePriceAmountChange}
                    className={`block w-full rounded-md border py-2 pl-4 pr-16 bg-white shadow-sm focus:outline-none sm:text-sm ${
                      priceError 
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                    placeholder="10"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">{globalCurrency}</span>
                  </div>
                </div>
                
                {priceError && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {priceError}
                  </p>
                )}

                <p className="text-sm text-gray-500 mt-2">
                  Clients will be charged {priceAmount} {globalCurrency} for each session
                </p>
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
    <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8">
      {renderHeader()}
      {renderContent()}
    </div>
  );
};

export default Booking;
