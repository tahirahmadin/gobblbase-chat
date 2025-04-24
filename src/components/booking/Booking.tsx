import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  ArrowRight,
  Check,
  Users,
  User,
  Coffee,
  Timer,
  Loader2
} from "lucide-react";
import { useBotConfig } from "../../store/useBotConfig";
import { updateAppointmentSettings, getAppointmentSettings } from "../../lib/serverActions";

interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface AvailabilityDay {
  day: string;
  available: boolean;
  timeSlots: TimeSlot[];
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

const DURATION_OPTIONS = [
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "45 minutes", value: 45 },
  { label: "1 hour", value: 60 },
  { label: "1 hour 15 minutes", value: 75 },
  { label: "1 hour 30 minutes", value: 90 },
  { label: "1 hour 45 minutes", value: 105 },
  { label: "2 hours", value: 120 },
];

const BUFFER_OPTIONS = [
  { label: "No buffer", value: 0 },
  { label: "5 minutes", value: 5 },
  { label: "10 minutes", value: 10 },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "45 minutes", value: 45 },
  { label: "1 hour", value: 60 },
];

const DEFAULT_AVAILABILITY = [
  { day: "Sunday", available: false, timeSlots: [] },
  { day: "Monday", available: true, timeSlots: [{ startTime: "09:00", endTime: "17:00" }] },
  { day: "Tuesday", available: true, timeSlots: [{ startTime: "09:00", endTime: "17:00" }] },
  { day: "Wednesday", available: true, timeSlots: [{ startTime: "09:00", endTime: "17:00" }] },
  { day: "Thursday", available: true, timeSlots: [{ startTime: "09:00", endTime: "17:00" }] },
  { day: "Friday", available: true, timeSlots: [{ startTime: "09:00", endTime: "17:00" }] },
  { day: "Saturday", available: false, timeSlots: [] },
];

const DEFAULT_MEETING_LOCATIONS = [
  { id: "google_meet", name: "Google Meet", icon: <Video className="h-5 w-5" />, selected: true },
  { id: "in_person", name: "In-person", icon: <MapPin className="h-5 w-5" />, selected: true },
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

const Booking: React.FC<BookingProps> = ({ onSetupComplete, isEditMode = false, agentId: propAgentId }) => {
  const { activeBotData, activeBotId } = useBotConfig();
  const activeAgentId = propAgentId || activeBotId || activeBotData?.agentId;
  const [timezones, setTimezones] = useState(DEFAULT_TIMEZONES);
  const [detectedTimezoneInList, setDetectedTimezoneInList] = useState(false);

  useEffect(() => {
    console.log("Booking Component - Using agentId:", activeAgentId);
    console.log("Booking Component - Prop agentId:", propAgentId);
    console.log("Booking Component - Store activeBotId:", activeBotId);
  }, [activeAgentId, propAgentId, activeBotId]);

  useEffect(() => {
    if (!isEditMode) {
      const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      setTimezone(detectedTz);
  
      const alreadyInList = DEFAULT_TIMEZONES.find(tz => tz.value === detectedTz);
      setDetectedTimezoneInList(!!alreadyInList);
      
      if (!alreadyInList && detectedTz) {
        try {
          const tzOffset = new Intl.DateTimeFormat('en', {
            timeZone: detectedTz,
            timeZoneName: 'short',
          }).formatToParts().find(part => part.type === 'timeZoneName')?.value || '';
  
          const detectedTzEntry = {
            value: detectedTz,
            label: `${detectedTz} (${tzOffset})`,
          };
  
          setTimezones(prev => [detectedTzEntry, ...prev.filter(tz => tz.value !== detectedTz)]);
        } catch (e) {
          console.error("Error formatting timezone offset:", e);
        }
      } else {
        setTimezones(DEFAULT_TIMEZONES);
      }
    }
  }, [isEditMode]);

  const [currentStep, setCurrentStep] = useState<
    "booking-type" | "duration" | "availability" | "locations" | "complete"
  >("booking-type");
  
  // Form state
  const [isTeamBooking, setIsTeamBooking] = useState(false);
  const [bookingsPerSlot, setBookingsPerSlot] = useState(1);
  const [meetingDuration, setMeetingDuration] = useState(30);
  const [bufferTime, setBufferTime] = useState(10);
  const [lunchTimeStart, setLunchTimeStart] = useState("12:00");
  const [lunchTimeEnd, setLunchTimeEnd] = useState("13:00");
  const [availability, setAvailability] = useState<AvailabilityDay[]>(DEFAULT_AVAILABILITY);
  const [meetingLocations, setMeetingLocations] = useState<MeetingLocation[]>(DEFAULT_MEETING_LOCATIONS);

  // Add timezone state
  const [timezone, setTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSettings, setIsFetchingSettings] = useState(isEditMode);

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
          setIsTeamBooking(settings.bookingType === "group");
          setBookingsPerSlot(settings.bookingsPerSlot || 1);
          setMeetingDuration(settings.meetingDuration || 30);
          setBufferTime(settings.bufferTime || 10);
          
          if (settings.lunchBreak) {
            setLunchTimeStart(settings.lunchBreak.start || "12:00");
            setLunchTimeEnd(settings.lunchBreak.end || "13:00");
          }
          
          if (settings.availability && settings.availability.length > 0) {
            setAvailability(settings.availability);
          }
          
          if (settings.locations && settings.locations.length > 0) {
            const updatedLocations = [...DEFAULT_MEETING_LOCATIONS].map(loc => ({
              ...loc,
              selected: settings.locations.includes(loc.id)
            }));
            setMeetingLocations(updatedLocations);
          }

          if (settings.timezone) {
            setTimezone(settings.timezone);
            
            // If saved timezone is not in default list, add it
            const tzInList = DEFAULT_TIMEZONES.find(tz => tz.value === settings.timezone);
            if (!tzInList) {
              try {
                const tzOffset = new Intl.DateTimeFormat('en', {
                  timeZone: settings.timezone,
                  timeZoneName: 'short',
                }).formatToParts().find(part => part.type === 'timeZoneName')?.value || '';
                
                const savedTzEntry = {
                  value: settings.timezone,
                  label: `${settings.timezone} (${tzOffset})`,
                };
                
                setTimezones(prev => [savedTzEntry, ...prev.filter(tz => tz.value !== settings.timezone)]);
              } catch (e) {
                console.error("Error formatting saved timezone offset:", e);
              }
            }
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

  const toggleDayAvailability = (dayIndex: number) => {
    setAvailability((prev) => {
      const updated = [...prev];
      const current = updated[dayIndex];
      updated[dayIndex] = {
        ...current,
        available: !current.available,
        timeSlots: current.available ? [] : [{ startTime: "09:00", endTime: "17:00" }],
      };
      return updated;
    });
  };

  // const addTimeSlot = (dayIndex: number) => {
  //   setAvailability((prev) => {
  //     const updated = [...prev];
  //     const slots = updated[dayIndex].timeSlots;
  //     const last = slots[slots.length - 1];
  //     slots.push({ startTime: last?.startTime || "09:00", endTime: last?.endTime || "17:00" });
  //     return updated;
  //   });
  // };

  // const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
  //   setAvailability((prev) => {
  //     const updated = [...prev];
  //     updated[dayIndex].timeSlots.splice(slotIndex, 1);
  //     return updated;
  //   });
  // };

  const updateTimeSlot = (
    dayIndex: number,
    slotIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setAvailability((prev) => {
      const updated = [...prev];
      updated[dayIndex].timeSlots[slotIndex][field] = value;
      return updated;
    });
  };

  const toggleMeetingLocation = (locationId: string) => {
    setMeetingLocations((prev) =>
      prev.map((loc) => (loc.id === locationId ? { ...loc, selected: !loc.selected } : loc))
    );
  };

  const handleNextStep = () => {
    if (currentStep === "booking-type") setCurrentStep("duration");
    else if (currentStep === "duration") setCurrentStep("availability");
    else if (currentStep === "availability") setCurrentStep("locations");
    else if (currentStep === "locations") saveSettings();
  };

  const handlePrevStep = () => {
    if (currentStep === "duration") setCurrentStep("booking-type");
    else if (currentStep === "availability") setCurrentStep("duration");
    else if (currentStep === "locations") setCurrentStep("availability");
    else if (currentStep === "complete") setCurrentStep("locations");
  };

  const saveSettings = async () => {
    if (!activeAgentId) return;
    setIsLoading(true);

    const payload = {
      agentId: activeAgentId,
      bookingType: isTeamBooking ? "group" : "individual",
      bookingsPerSlot,
      meetingDuration,
      bufferTime,
      lunchBreak: { start: lunchTimeStart, end: lunchTimeEnd },
      availability,
      locations: meetingLocations.filter((l) => l.selected).map((l) => l.id),
      timezone,
    };

    console.log("Saving booking settings for agent:", activeAgentId, payload);

    try {
      await updateAppointmentSettings(payload);
      setCurrentStep("complete");
    } catch (error) {
      console.error("Failed to save booking settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDashboardNavigation = () => {
    if (onSetupComplete) onSetupComplete();
    else window.location.href = "/dashboard/bookings";
  };

  const formatTimeLabel = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins ? `${hrs} hr ${mins} min` : `${hrs} hr`;
  };

  // Render loading state when fetching settings
  if (isFetchingSettings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <Loader2 className="w-12 h-12 text-gray-300 animate-spin mb-4" />
        <p className="text-gray-500">Loading booking settings...</p>
      </div>
    );
  }

  // Render step progress indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center">
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === "booking-type" 
              ? "bg-gray-800 text-white" 
              : "bg-gray-200 text-gray-700"
          }`}>
            1
          </div>
          <span className="text-xs mt-1">Type</span>
        </div>
        <div className={`w-12 h-1 ${
          currentStep === "booking-type" ? "bg-gray-300" : "bg-gray-800"
        }`}></div>
        
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === "duration" 
              ? "bg-gray-800 text-white" 
              : currentStep === "booking-type" 
              ? "bg-gray-200 text-gray-700"
              : "bg-gray-800 text-white"
          }`}>
            2
          </div>
          <span className="text-xs mt-1">Duration</span>
        </div>
        <div className={`w-12 h-1 ${
          currentStep === "booking-type" || currentStep === "duration" 
            ? "bg-gray-300" 
            : "bg-gray-800"
        }`}></div>
        
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === "availability" 
              ? "bg-gray-800 text-white" 
              : currentStep === "booking-type" || currentStep === "duration"
              ? "bg-gray-200 text-gray-700"
              : "bg-gray-800 text-white"
          }`}>
            3
          </div>
          <span className="text-xs mt-1">Availability</span>
        </div>
        <div className={`w-12 h-1 ${
          currentStep === "booking-type" || currentStep === "duration" || currentStep === "availability"
            ? "bg-gray-300" 
            : "bg-gray-800"
        }`}></div>
        
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === "locations" 
              ? "bg-gray-800 text-white" 
              : currentStep === "complete"
              ? "bg-gray-800 text-white"
              : "bg-gray-200 text-gray-700"
          }`}>
            4
          </div>
          <span className="text-xs mt-1">Locations</span>
        </div>
        <div className={`w-12 h-1 ${
          currentStep === "complete" 
            ? "bg-gray-800" 
            : "bg-gray-300"
        }`}></div>
        
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === "complete" 
              ? "bg-gray-800 text-white" 
              : "bg-gray-200 text-gray-700"
          }`}>
            5
          </div>
          <span className="text-xs mt-1">Complete</span>
        </div>
      </div>
    </div>
  );

  // Render booking type step
  const renderBookingTypeStep = () => (
    <div className="space-y-6">
      <div className="text-sm text-gray-700 mb-8">
        Choose how you'll manage bookings for your business. This determines if multiple bookings can be made for the same time slot.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={() => setIsTeamBooking(false)}
          className={`border rounded-lg p-6 cursor-pointer transition-colors ${
            !isTeamBooking
              ? "border-gray-800 bg-gray-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className={`inline-flex items-center justify-center p-3 rounded-full mb-4 ${
            !isTeamBooking ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-500"
          }`}>
            <User className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium mb-2">Individual</h3>
          <p className="text-gray-600 mb-3">
            Each time slot is for one-on-one meetings. Only one booking can be made per available time slot.
          </p>
          <div className="text-sm text-gray-500">
            Perfect for: consultants, coaches, freelancers, or any one-on-one service.
          </div>
        </div>

        <div
          onClick={() => setIsTeamBooking(true)}
          className={`border rounded-lg p-6 cursor-pointer transition-colors ${
            isTeamBooking
              ? "border-gray-800 bg-gray-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className={`inline-flex items-center justify-center p-3 rounded-full mb-4 ${
            isTeamBooking ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-500"
          }`}>
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium mb-2">Team</h3>
          <p className="text-gray-600 mb-3">
            Multiple bookings can be made for the same time slot. Perfect for teams or businesses with multiple service providers.
          </p>
          <div className="text-sm text-gray-500">
            Perfect for: salons, clinics, group classes, or businesses with multiple staff members.
          </div>
        </div>
      </div>

      {isTeamBooking && (
        <div className="mt-6 p-6 border border-gray-200 rounded-lg">
          <h3 className="font-medium mb-4">How many bookings can be accepted per time slot?</h3>
          <div className="flex items-center">
            <button
              onClick={() => setBookingsPerSlot(Math.max(1, bookingsPerSlot - 1))}
              className="p-2 rounded-md border border-gray-200 hover:bg-gray-50"
              disabled={bookingsPerSlot <= 1}
            >
              -
            </button>
            <span className="mx-4 font-medium w-8 text-center">{bookingsPerSlot}</span>
            <button
              onClick={() => setBookingsPerSlot(bookingsPerSlot + 1)}
              className="p-2 rounded-md border border-gray-200 hover:bg-gray-50"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
  // In your renderTimezoneStep function
  const renderTimezoneStep = () => {
    const displayLabel = timezones.find(tz => tz.value === timezone)?.label || timezone;
  
    return (
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="mb-4 bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start">
          <div className="text-blue-500 mr-2 mt-0.5">
            <Check className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm text-blue-800">
              We've automatically detected your timezone as <strong>{displayLabel}</strong>
            </p>
          </div>
        </div>
  
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Timezone
        </label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          {timezones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  

  // Render duration step
  const renderDurationStep = () => (
    <div className="space-y-6">
      <div className="text-sm text-gray-700 mb-8">
        Configure the duration of your appointments and add buffer time between meetings to help you prepare.
      </div>

      {renderTimezoneStep()}

      <div className="border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="font-medium">Meeting Duration</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DURATION_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setMeetingDuration(option.value)}
              className={`p-3 rounded-lg border ${
                meetingDuration === option.value
                  ? "border-gray-800 bg-gray-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <Timer className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="font-medium">Buffer Time</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Add time between meetings to prepare for your next appointment.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BUFFER_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setBufferTime(option.value)}
              className={`p-3 rounded-lg border ${
                bufferTime === option.value
                  ? "border-gray-800 bg-gray-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Coffee className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="font-medium">Lunch Break</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Set a lunch break time that will be blocked off from your availability.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Start Time</label>
            <select
              value={lunchTimeStart}
              onChange={(e) => setLunchTimeStart(e.target.value)}
              className="p-2 border border-gray-200 rounded-md"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <option key={i} value={`${i.toString().padStart(2, "0")}:00`}>
                  {`${i.toString().padStart(2, "0")}:00`}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">End Time</label>
            <select
              value={lunchTimeEnd}
              onChange={(e) => setLunchTimeEnd(e.target.value)}
              className="p-2 border border-gray-200 rounded-md"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <option key={i} value={`${i.toString().padStart(2, "0")}:00`}>
                  {`${i.toString().padStart(2, "0")}:00`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  // Render availability step
  const renderAvailabilityStep = () => (
    <div className="space-y-6">
      <div className="text-sm text-gray-700 mb-4">
        Set your weekly hours to let people know when they can book meetings with you.
      </div>

      <div className="space-y-4">
        {availability.map((day, dayIndex) => (
          <div key={day.day} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    day.available
                      ? "bg-gray-800 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {day.day.charAt(0)}
                </div>
                <span className="font-medium">{day.day}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={day.available}
                  onChange={() => toggleDayAvailability(dayIndex)}
                  className="sr-only"
                />
                <div className={`w-10 h-5 bg-gray-200 rounded-full peer ${
                  day.available ? "bg-gray-600" : ""
                }`}>
                  <div
                    className={`absolute w-4 h-4 rounded-full bg-white transition-all ${
                      day.available ? "right-1" : "left-1"
                    } top-0.5`}
                  ></div>
                </div>
              </label>
            </div>

            {day.available && (
              <div className="p-4 space-y-3">
                {day.timeSlots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <select
                        value={slot.startTime}
                        onChange={(e) =>
                          updateTimeSlot(dayIndex, slotIndex, "startTime", e.target.value)
                        }
                        className="p-2 border border-gray-200 rounded-md"
                      >
                        {Array.from({ length: 24 }).map((_, i) => (
                          <option key={i} value={`${i.toString().padStart(2, "0")}:00`}>
                            {`${i.toString().padStart(2, "0")}:00`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <span>—</span>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <select
                        value={slot.endTime}
                        onChange={(e) =>
                          updateTimeSlot(dayIndex, slotIndex, "endTime", e.target.value)
                        }
                        className="p-2 border border-gray-200 rounded-md"
                      >
                        {Array.from({ length: 24 }).map((_, i) => (
                          <option key={i} value={`${i.toString().padStart(2, "0")}:00`}>
                            {`${i.toString().padStart(2, "0")}:00`}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* <button
                      onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                      className="text-gray-400 hover:text-gray-700"
                      disabled={day.timeSlots.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button> */}
                  </div>
                ))}
                
                {/* <button
                  onClick={() => addTimeSlot(dayIndex)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Time Range
                </button> */}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Render locations step
  const renderLocationsStep = () => (
    <div className="space-y-6">
      <div className="text-sm text-gray-700 mb-6">
        Select how you'd like to meet with people. These options will be displayed to your clients when they book a meeting.
      </div>

      <div className="grid grid-cols-1 gap-4">
        {meetingLocations.map((location) => (
          <div
            key={location.id}
            onClick={() => toggleMeetingLocation(location.id)}
            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
              location.selected
                ? "border-gray-800 bg-gray-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`flex items-center justify-center p-2 rounded-lg ${
                  location.selected ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {location.icon}
              </div>
              <span className="font-medium">{location.name}</span>
            </div>
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                location.selected
                  ? "border-gray-800 bg-gray-800"
                  : "border-gray-300"
              }`}
            >
              {location.selected && <Check className="h-3 w-3 text-white" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render complete step
  const renderCompleteStep = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-100 rounded-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 rounded-full p-3">
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h3 className="text-xl font-medium text-green-800 mb-2">Booking System Ready!</h3>
        <p className="text-green-700 mb-6">
          Your booking system has been {isEditMode ? "updated" : "set up"} successfully and is ready to accept appointments.
        </p>
        
        <div className="border-t border-green-200 pt-6 mt-6">
          <h4 className="font-medium text-gray-800 mb-4">Summary of Your Settings</h4>
          
          <div className="space-y-3 text-left max-w-lg mx-auto">
            <div className="flex justify-between pb-2 border-b border-green-100">
              <span className="text-gray-600">Booking Type:</span>
              <span className="font-medium">{isTeamBooking ? "Team" : "Individual"}</span>
            </div>
            
            {isTeamBooking && (
              <div className="flex justify-between pb-2 border-b border-green-100">
                <span className="text-gray-600">Bookings Per Slot:</span>
                <span className="font-medium">{bookingsPerSlot}</span>
              </div>
            )}
            
            <div className="flex justify-between pb-2 border-b border-green-100">
              <span className="text-gray-600">Meeting Duration:</span>
              <span className="font-medium">{formatTimeLabel(meetingDuration)}</span>
            </div>
            
            <div className="flex justify-between pb-2 border-b border-green-100">
              <span className="text-gray-600">Buffer Time:</span>
              <span className="font-medium">{formatTimeLabel(bufferTime)}</span>
            </div>
            
            <div className="flex justify-between pb-2 border-b border-green-100">
              <span className="text-gray-600">Lunch Break:</span>
              <span className="font-medium">{lunchTimeStart} - {lunchTimeEnd}</span>
            </div>
            
            <div className="flex justify-between pb-2 border-b border-green-100">
              <span className="text-gray-600">Available Days:</span>
              <span className="font-medium">
                {availability.filter(day => day.available).length} days
              </span>
            </div>

            <div className="flex justify-between pb-2 border-b border-green-100">
              <span className="text-gray-600">Timezone:</span>
              <span className="font-medium">{
                timezones.find(tz => tz.value === timezone)?.label || timezone
              }</span>
            </div>
            
            <div className="flex justify-between pb-2 border-b border-green-100">
              <span className="text-gray-600">Meeting Locations:</span>
              <span className="font-medium">
                {meetingLocations.filter(loc => loc.selected).map(loc => loc.name).join(", ")}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <button
            onClick={handleDashboardNavigation}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
          >
            Go to Booking Dashboard
          </button>
        </div>
      </div>
      
      <div className="flex justify-center text-sm">
        <button
          onClick={() => setCurrentStep("booking-type")}
          className="text-gray-600 hover:text-gray-800 underline"
        >
          Edit booking settings
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-gray-700" />
          <h1 className="text-2xl font-semibold text-gray-800">
            {isEditMode ? "Edit Booking Settings" : "Booking System Setup"}
          </h1>
        </div>
        
        {currentStep !== "complete" && (
          <div className="flex items-center space-x-3">
            {currentStep !== "booking-type" && (
              <button
                onClick={handlePrevStep}
                className="flex items-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </button>
            )}
            
            <button
              onClick={handleNextStep}
              className="flex items-center px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {currentStep === "locations" ? "Saving..." : "Loading..."}
                </>
              ) : (
                <>
                  {currentStep === "locations" ? "Save Settings" : "Next"}
                  {currentStep !== "locations" && <ArrowRight className="h-4 w-4 ml-2" />}
                </>
              )}
            </button>
          </div>
        )}
      </div>
      
      {/* Step indicator */}
      {renderStepIndicator()}
      
      {/* Step content */}
      <div className="mt-6">
        {currentStep === "booking-type" && renderBookingTypeStep()}
        {currentStep === "duration" && renderDurationStep()}
        {currentStep === "availability" && renderAvailabilityStep()}
        {currentStep === "locations" && renderLocationsStep()}
        {currentStep === "complete" && renderCompleteStep()}
      </div>
    </div>
  );
};

export default Booking;