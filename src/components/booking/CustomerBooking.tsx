import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowLeft,
  User,
  Mail,
  Phone,
  FileText,
  Check,
  Video,
  MapPin,
} from "lucide-react";
import { getAvailableSlots, bookAppointment, getAppointmentSettings } from "../../lib/serverActions";

interface CustomerBookingProps {
  businessId?: string;
  serviceName?: string;
}

interface Slot {
  startTime: string;
  endTime: string;
  available: boolean;
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
  lunchBreak: { start: string; end: string };
  meetingDuration: number;
  bufferTime: number;
}

const CustomerBooking: React.FC<CustomerBookingProps> = ({
  businessId: propId,
  serviceName = "Consultation",
}) => {
  const { agentId } = useParams<{ agentId: string }>();
  const businessId = propId || agentId || "";

  // Steps & data
  const [step, setStep] = useState<"date" | "time" | "details" | "confirmation">(
    "date"
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [now, setNow] = useState(new Date());         // <-- for live "now"
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<
    "google_meet" | "in_person"
  >("google_meet");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Settings data
  const [settings, setSettings] = useState<AppointmentSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [unavailableDates, setUnavailableDates] = useState<Record<string, UnavailableDate>>({});

  // Refresh `now` every minute so today's slots refresh live
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Load appointment settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!businessId) return;
      
      setLoadingSettings(true);
      try {
        const data = await getAppointmentSettings(businessId);
        console.log("Loaded settings:", data);
        setSettings(data);
        
        // Create a lookup map for unavailable dates
        const unavailableLookup: Record<string, UnavailableDate> = {};
        if (data.unavailableDates && Array.isArray(data.unavailableDates)) {
          data.unavailableDates.forEach(date => {
            unavailableLookup[date.date] = date;
            console.log(`Date ${date.date} - allDay: ${date.allDay}`);
          });
        }
        setUnavailableDates(unavailableLookup);
        console.log("Unavailable dates map:", unavailableLookup);
      } catch (error) {
        console.error("Failed to load appointment settings:", error);
      } finally {
        setLoadingSettings(false);
      }
    };
    
    loadSettings();
  }, [businessId]);

  // Helpers
  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstWeekday = (y: number, m: number) => new Date(y, m, 1).getDay();
  const isWeekend = (d: Date) => [0, 6].includes(d.getDay());

  const isBeforeToday = (d: Date) => {
    const check = new Date(d);
    check.setHours(0, 0, 0, 0);
    const t = new Date(now);
    t.setHours(0, 0, 0, 0);
    return check < t;
  };

  const fmtMonthYear = (d: Date) =>
    new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(d);

  // Format date for API in the exact format needed: "DD-MMM-YYYY"
  const fmtApiDate = (d: Date) => {
    const day = d.getDate().toString().padStart(2, "0");
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
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

  const fmtTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ap = h < 12 ? "AM" : "PM";
    const hr = h % 12 === 0 ? 12 : h % 12;
    return `${hr}:${m.toString().padStart(2, "0")} ${ap}`;
  };

  // Check if a date is unavailable (allDay=true)
  const isDateFullyUnavailable = (date: Date): boolean => {
    if (isBeforeToday(date)) return true;
    
    if (!settings) return false;
    
    // Check if date is marked as allDay=true in unavailable dates
    const apiDate = fmtApiDate(date);
    const unavailableDate = unavailableDates[apiDate];
    
    if (unavailableDate && unavailableDate.allDay === true) {
      return true;
    }
    
    // Check weekly availability
    const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
    const dayRule = settings.availability.find(rule => rule.day === dayName);
    
    if (dayRule && !dayRule.available) {
      return true;
    }
    
    return false;
  }

  // Check if a date has modified hours (allDay=false)
  const hasModifiedHours = (date: Date): boolean => {
    if (!settings) return false;
    
    const apiDate = fmtApiDate(date);
    const unavailableDate = unavailableDates[apiDate];
    
    return unavailableDate && unavailableDate.allDay === false;
  }

  // Generate time slots from a start and end time
  const generateSlotsFromTimeWindow = (
    startTime: string,
    endTime: string,
    meetingDuration: number,
    bufferTime: number
  ): Slot[] => {
    const slots: Slot[] = [];
    
    // Convert times to minutes since midnight
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    
    const startMins = startHour * 60 + startMinute;
    const endMins = endHour * 60 + endMinute;
    
    // Duration of each slot (meeting + buffer)
    const slotDuration = meetingDuration + bufferTime;
    
    // Create slots
    for (let slotStart = startMins; slotStart + meetingDuration <= endMins; slotStart += slotDuration) {
      const slotEnd = slotStart + meetingDuration;
      
      const formatTimeString = (mins: number) => {
        const hours = Math.floor(mins / 60);
        const minutes = mins % 60;
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      };
      
      slots.push({
        startTime: formatTimeString(slotStart),
        endTime: formatTimeString(slotEnd),
        available: true
      });
    }
    
    return slots;
  };

  // Generate available time slots based on settings
  const generateTimeSlots = (date: Date): Slot[] => {
    if (!settings) return [];
    
    const meetingDuration = settings.meetingDuration || 45;
    const bufferTime = settings.bufferTime || 10;
    const apiDate = fmtApiDate(date);
    const dateEntry = unavailableDates[apiDate];
    
    // If it has modified hours (allDay: false), use those times
    if (dateEntry && dateEntry.allDay === false) {
      return generateSlotsFromTimeWindow(
        dateEntry.startTime,
        dateEntry.endTime,
        meetingDuration,
        bufferTime
      );
    }
    
    // Otherwise use the weekly schedule
    const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
    const dayRule = settings.availability.find(rule => rule.day === dayName);
    
    if (dayRule && dayRule.available && dayRule.timeSlots.length > 0) {
      let allSlots: Slot[] = [];
      
      // Generate slots for each time window in the schedule
      dayRule.timeSlots.forEach(window => {
        const windowSlots = generateSlotsFromTimeWindow(
          window.startTime,
          window.endTime,
          meetingDuration,
          bufferTime
        );
        allSlots = [...allSlots, ...windowSlots];
      });
      
      return allSlots;
    }
    
    // Default slots if no specific rules
    return generateSlotsFromTimeWindow("09:00", "17:00", meetingDuration, bufferTime);
  }

  // Calendar nav
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

  // When picking a date, fetch slots
  const selectDate = async (d: Date) => {
    setSelectedDate(d);
    setStep("time");
    setLoadingSlots(true);
    
    const apiDate = fmtApiDate(d);
    console.log("Selecting date:", apiDate);
    
    try {
      // Check if this date has modified hours or using standard availability
      const dateEntry = unavailableDates[apiDate];
      console.log("Date entry from unavailableDates:", dateEntry);
      
      if (dateEntry && dateEntry.allDay === false) {
        console.log("Using modified hours:", dateEntry.startTime, "-", dateEntry.endTime);
        // Generate slots from the modified hours
        const generatedSlots = generateTimeSlots(d);
        console.log("Generated slots from modified hours:", generatedSlots);
        setSlots(generatedSlots);
      } else {
        console.log("Fetching slots from API");
        // Try to get slots from the API
        try {
          const raw = await getAvailableSlots(businessId, apiDate);
          console.log("API returned slots:", raw);
          
          if (raw && raw.length > 0) {
            setSlots(raw.map((r) => ({ ...r, available: true })));
          } else {
            // If API returns empty, generate slots from settings
            const generatedSlots = generateTimeSlots(d);
            console.log("API returned empty, using generated slots:", generatedSlots);
            setSlots(generatedSlots);
          }
        } catch (e) {
          console.error("Error fetching slots from API, using generated slots:", e);
          // If API fails, use generated slots from settings
          const generatedSlots = generateTimeSlots(d);
          console.log("Generated slots due to API error:", generatedSlots);
          setSlots(generatedSlots);
        }
      }
    } catch (e) {
      console.error("Error in selectDate:", e);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const selectSlot = (slot: Slot) => {
    setSelectedSlot(slot);
    setStep("details");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;
    setSubmitting(true);
    try {
      await bookAppointment({
        agentId: businessId,
        userId: email,
        date: fmtApiDate(selectedDate),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        location: selectedLocation,
      });
      setStep("confirmation");
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const layout = (title: string, subtitle: string, content: React.ReactNode) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-4xl mx-auto">
      <div className="bg-gray-800 text-white p-6">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-gray-300 mt-1">{subtitle}</p>
      </div>
      {content}
    </div>
  );

  // If still loading settings
  if (loadingSettings) {
    return layout(
      `Book ${serviceName}`,
      "Loading availability...",
      <div className="p-6 flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    );
  }

  // === Step: DATE ===
  if (step === "date") {
    const y = currentMonth.getFullYear(),
      m = currentMonth.getMonth();
    const off = firstWeekday(y, m),
      days = daysInMonth(y, m);

    return layout(
      `Book ${serviceName}`,
      "Select a date for your appointment",
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-medium text-gray-800">
            {fmtMonthYear(currentMonth)}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="h-10 flex items-center justify-center text-sm font-medium text-gray-500"
            >
              {d}
            </div>
          ))}
          {Array.from({ length: off }).map((_, i) => (
            <div key={"e" + i} />
          ))}
          {Array.from({ length: days }).map((_, i) => {
            const dn = i + 1;
            const date = new Date(y, m, dn);
            const apiDate = fmtApiDate(date);
            
            // Check if date is fully unavailable (past or allDay=true)
            const isUnavailable = isDateFullyUnavailable(date);
            
            return (
              <button
                key={dn}
                onClick={() => !isUnavailable && selectDate(date)}
                disabled={isUnavailable}
                className={`
                  h-12 flex items-center justify-center rounded-lg text-sm relative
                  ${isUnavailable 
                    ? "text-gray-300 cursor-not-allowed bg-gray-100" 
                    : "hover:bg-gray-100 text-gray-800"
                  }
                `}
              >
                {dn}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // === Step: TIME ===
  if (step === "time" && selectedDate) {
    // Filter out any past‐time if today
    const todayStr = selectedDate.toDateString();
    const availableSlots = slots.filter((s) => {
      if (!s.available) return false;
      if (selectedDate.toDateString() !== now.toDateString()) return true;
      // build a Date for slot start
      const [h, m] = s.startTime.split(":").map(Number);
      const slotDate = new Date(now);
      slotDate.setHours(h, m, 0, 0);
      return slotDate > now;
    });

    return layout(
      `Book ${serviceName}`,
      `Select a time on ${fmtDateFull(selectedDate)}`,
      <div className="p-6">
        <button
          onClick={() => setStep("date")}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to calendar
        </button>

        {loadingSlots ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {availableSlots.map((s, idx) => (
              <button
                key={idx}
                onClick={() => selectSlot(s)}
                className="flex items-center justify-center p-3 border rounded-lg text-sm hover:border-gray-800 hover:bg-gray-50 text-gray-800"
              >
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                {fmtTime(s.startTime)}–{fmtTime(s.endTime)}
              </button>
            ))}
            {availableSlots.length === 0 && (
              <p className="text-gray-500 col-span-full py-8 text-center">
                No available time slots for this date.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // === Step: DETAILS ===
  if (step === "details" && selectedSlot) {
    return layout(
      `Book ${serviceName}`,
      `Complete your booking details`,
      <div className="p-6">
        <button
          onClick={() => setStep("time")}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to time selection
        </button>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500"
              />
            </div>
          </div>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500"
              />
            </div>
          </div>
          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Optional"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500"
              />
            </div>
          </div>
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 h-24"
              />
            </div>
          </div>
          {/* Location */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedLocation("google_meet")}
              className={`flex items-center p-3 border rounded-lg ${
                selectedLocation === "google_meet"
                  ? "border-gray-800 bg-gray-50"
                  : "border-gray-200"
              }`}
            >
              <Video className="h-5 w-5 mr-2" /> Google Meet
            </button>
            <button
              type="button"
              onClick={() => setSelectedLocation("in_person")}
              className={`flex items-center p-3 border rounded-lg ${
                selectedLocation === "in_person"
                  ? "border-gray-800 bg-gray-50"
                  : "border-gray-200"
              }`}
            >
              <MapPin className="h-5 w-5 mr-2" /> In‑person
            </button>
          </div>
          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !name || !email}
            className={`w-full py-3 rounded-lg text-white font-medium ${
              submitting || !name || !email
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-800 hover:bg-gray-900"
            }`}
          >
            {submitting ? "Booking..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    );
  }

  // === Step: CONFIRMATION ===
  if (step === "confirmation") {
    return layout(
      "Booking Confirmed",
      "Your appointment has been scheduled",
      <div className="p-6">
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-start mb-6">
          <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
          <div>
            <p className="font-medium text-green-800">Booking successful!</p>
            <p className="text-green-700 text-sm mt-1">
              A confirmation email has been sent to {email}.
            </p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-gray-600 hover:text-gray-800 font-medium"
        >
          Book another appointment
        </button>
      </div>
    );
  }

  return null;
};

export default CustomerBooking;