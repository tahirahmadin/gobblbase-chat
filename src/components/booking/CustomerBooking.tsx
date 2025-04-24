import React, { useState, useEffect, useRef } from "react";
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
  Globe,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { getAvailableSlots, bookAppointment, getAppointmentSettings } from "../../lib/serverActions";
import { 
  COUNTRY_CODES, 
  detectCountryCode, 
  formatPhoneNumber, 
  validatePhone,
  createInternationalPhone
} from "../../utils/phoneUtils";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

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
  timezone: string;
}

const CustomerBooking: React.FC<CustomerBookingProps> = ({
  businessId: propId,
  serviceName = "Consultation",
}) => {
  const { agentId } = useParams<{ agentId: string }>();
  const businessId = propId || agentId || "";
  const [step, setStep] = useState<"date" | "time" | "details" | "confirmation">("date");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [now, setNow] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<"google_meet" | "in_person">("google_meet");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+1");
  const [showCountryCodes, setShowCountryCodes] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<AppointmentSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [unavailableDates, setUnavailableDates] = useState<Record<string, UnavailableDate>>({});
  const [userTimezone, setUserTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [businessTimezone, setBusinessTimezone] = useState<string>("UTC");
  const validateEmail = (value: string): boolean => {
    if (!value) {
      setEmailError("Email is required");
      return false;
    }
    if (!EMAIL_REGEX.test(value)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (rawValue) {
      const detectedCode = detectCountryCode(rawValue, selectedCountryCode);
      if (detectedCode !== selectedCountryCode) {
        setSelectedCountryCode(detectedCode);
      }
    }
    
    if (rawValue.length < phone.length) {
      setPhone(rawValue);
      return;
    }
    const formattedValue = formatPhoneNumber(rawValue, selectedCountryCode);
    setPhone(formattedValue);
    
    const validation = validatePhone(formattedValue, selectedCountryCode);
    setPhoneError(validation.errorMessage);
  };

  const selectCountryCode = (code: string) => {
    setSelectedCountryCode(code);
    setShowCountryCodes(false);
    
    if (phone) {
      const digitsOnly = phone.replace(/\D/g, '');
      const reformatted = formatPhoneNumber(digitsOnly, code);
      setPhone(reformatted);
    }
    
    if (phoneInputRef.current) {
      phoneInputRef.current.focus();
    }
  };

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (showCountryCodes) {
      const handleOutsideClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.country-code-dropdown')) {
          setShowCountryCodes(false);
        }
      };
      
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [showCountryCodes]);

  useEffect(() => {
    const loadSettings = async () => {
      if (!businessId) return;
      
      setLoadingSettings(true);
      try {
        const data = await getAppointmentSettings(businessId);
        console.log("Loaded settings:", data);
        setSettings(data);
        
        if (data.timezone) {
          setBusinessTimezone(data.timezone);
        }
        
        const unavailableLookup: Record<string, UnavailableDate> = {};
        if (data.unavailableDates && Array.isArray(data.unavailableDates)) {
          data.unavailableDates.forEach(date => {
            unavailableLookup[date.date] = date;
          });
        }
        setUnavailableDates(unavailableLookup);
      } catch (error) {
        console.error("Failed to load appointment settings:", error);
      } finally {
        setLoadingSettings(false);
      }
    };
    
    loadSettings();
  }, [businessId]);

  const convertTimeToBusinessTZ = (time: string, date: Date): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const userDate = new Date(date);
    userDate.setHours(hours, minutes, 0, 0);
    const options: Intl.DateTimeFormatOptions = { 
      hour: 'numeric', 
      minute: 'numeric', 
      hour12: false,
      timeZone: businessTimezone 
    };
    
    const businessTime = new Intl.DateTimeFormat('en-US', options).format(userDate);
    return businessTime.replace(/\s/g, '').padStart(5, '0');
  };

  const convertTimeToUserTZ = (time: string, date: Date): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const businessDate = new Date(date);
    const dateStr = businessDate.toISOString().split('T')[0];
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    const dateTimeStr = `${dateStr}T${timeStr}`;
    const tzDate = new Date(dateTimeStr);
    const options: Intl.DateTimeFormatOptions = { 
      hour: 'numeric', 
      minute: 'numeric', 
      hour12: false,
      timeZone: userTimezone 
    };
    
    const userTime = new Intl.DateTimeFormat('en-US', options).format(tzDate);
    return userTime.replace(/\s/g, '').padStart(5, '0');
  };

  const formatTimezone = (tz: string): string => {
    try {
      const date = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: tz,
        timeZoneName: 'short'
      };
      const tzName = new Intl.DateTimeFormat('en-US', options)
        .formatToParts(date)
        .find(part => part.type === 'timeZoneName')?.value || tz;
      
      return tzName;
    } catch (e) {
      return tz;
    }
  };

  const getTimezoneDifference = (): string => {
    if (businessTimezone === userTimezone) return "same timezone";
    
    const now = new Date();
    const userOffset = -now.getTimezoneOffset();
    const businessDate = new Date(now.toLocaleString('en-US', { timeZone: businessTimezone }));
    const businessOffset = businessDate.getTimezoneOffset() + 
      (now.getTime() - businessDate.getTime()) / 60000;
    
    const diffHours = (userOffset - businessOffset) / 60;
    
    if (diffHours === 0) return "same time";
    
    const diffFormatted = Math.abs(diffHours).toFixed(1).replace(/\.0$/, '');
    return diffHours > 0 
      ? `${diffFormatted} hour${Math.abs(diffHours) !== 1 ? 's' : ''} ahead` 
      : `${diffFormatted} hour${Math.abs(diffHours) !== 1 ? 's' : ''} behind`;
  };

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

  const isDateFullyUnavailable = (date: Date): boolean => {
    if (isBeforeToday(date)) return true;
    
    if (!settings) return false;
    
    const apiDate = fmtApiDate(date);
    const unavailableDate = unavailableDates[apiDate];
    
    if (unavailableDate && unavailableDate.allDay === true) {
      return true;
    }
    
    const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
    const dayRule = settings.availability.find(rule => rule.day === dayName);
    
    if (dayRule && !dayRule.available) {
      return true;
    }
    
    return false;
  }

  const hasModifiedHours = (date: Date): boolean => {
    if (!settings) return false;
    
    const apiDate = fmtApiDate(date);
    const unavailableDate = unavailableDates[apiDate];
    
    return unavailableDate && unavailableDate.allDay === false;
  }

  const generateSlotsFromTimeWindow = (
    startTime: string,
    endTime: string,
    meetingDuration: number,
    bufferTime: number,
    date: Date
  ): Slot[] => {
    const slots: Slot[] = [];
    
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    
    const startMins = startHour * 60 + startMinute;
    const endMins = endHour * 60 + endMinute;
    const slotDuration = meetingDuration + bufferTime;
    for (let slotStart = startMins; slotStart + meetingDuration <= endMins; slotStart += slotDuration) {
      const slotEnd = slotStart + meetingDuration;
      
      const formatTimeString = (mins: number) => {
        const hours = Math.floor(mins / 60);
        const minutes = mins % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      };
      
      const businessSlotStart = formatTimeString(slotStart);
      const businessSlotEnd = formatTimeString(slotEnd);
      
      const userSlotStart = convertTimeToUserTZ(businessSlotStart, date);
      const userSlotEnd = convertTimeToUserTZ(businessSlotEnd, date);
      
      slots.push({
        startTime: userSlotStart,
        endTime: userSlotEnd,
        available: true
      });
    }
    
    return slots;
  };

  const generateTimeSlots = (date: Date): Slot[] => {
    if (!settings) return [];
    
    const meetingDuration = settings.meetingDuration || 45;
    const bufferTime = settings.bufferTime || 10;
    const apiDate = fmtApiDate(date);
    const dateEntry = unavailableDates[apiDate];
  
    if (dateEntry && dateEntry.allDay === false) {
      return generateSlotsFromTimeWindow(
        dateEntry.startTime,
        dateEntry.endTime,
        meetingDuration,
        bufferTime,
        date
      );
    }
    
    const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
    const dayRule = settings.availability.find(rule => rule.day === dayName);
    
    if (dayRule && dayRule.available && dayRule.timeSlots.length > 0) {
      let allSlots: Slot[] = [];
      
      dayRule.timeSlots.forEach(window => {
        const windowSlots = generateSlotsFromTimeWindow(
          window.startTime,
          window.endTime,
          meetingDuration,
          bufferTime,
          date
        );
        allSlots = [...allSlots, ...windowSlots];
      });
      
      return allSlots;
    }
    
    return generateSlotsFromTimeWindow("09:00", "17:00", meetingDuration, bufferTime, date);
  }

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

  const selectDate = async (d: Date) => {
    setSelectedDate(d);
    setStep("time");
    setLoadingSlots(true);
    
    const apiDate = fmtApiDate(d);
    console.log("Selecting date:", apiDate);
    
    try {
      const dateEntry = unavailableDates[apiDate];
      console.log("Date entry from unavailableDates:", dateEntry);
      
      if (dateEntry && dateEntry.allDay === false) {
        console.log("Using modified hours:", dateEntry.startTime, "-", dateEntry.endTime);
        const generatedSlots = generateTimeSlots(d);
        console.log("Generated slots from modified hours:", generatedSlots);
        setSlots(generatedSlots);
      } else {
        console.log("Fetching slots from API");
        try {
          const raw = await getAvailableSlots(businessId, apiDate, userTimezone);
          console.log("API returned slots:", raw);
          
          if (raw && raw.length > 0) {
            const userSlots = raw.map(slot => ({
              ...slot,
              startTime: convertTimeToUserTZ(slot.startTime, d),
              endTime: convertTimeToUserTZ(slot.endTime, d),
              available: true
            }));
            setSlots(userSlots);
          } else {
            const generatedSlots = generateTimeSlots(d);
            console.log("API returned empty, using generated slots:", generatedSlots);
            setSlots(generatedSlots);
          }
        } catch (e) {
          console.error("Error fetching slots from API, using generated slots:", e);
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
    const isEmailValid = validateEmail(email);
    const validation = validatePhone(phone, selectedCountryCode);
    const isPhoneValid = validation.isValid;
    
    if (!isEmailValid || !isPhoneValid) {
      setPhoneError(validation.errorMessage);
      return;
    }
    
    setSubmitting(true);
    
    try {
      const businessStartTime = convertTimeToBusinessTZ(selectedSlot.startTime, selectedDate);
      const businessEndTime = convertTimeToBusinessTZ(selectedSlot.endTime, selectedDate);
      const formattedPhone = phone ? createInternationalPhone(phone, selectedCountryCode) : '';
      
      await bookAppointment({
        agentId: businessId,
        userId: email,
        date: fmtApiDate(selectedDate),
        startTime: businessStartTime,
        endTime: businessEndTime,    
        location: selectedLocation,
        name: name,
        phone: formattedPhone,
        notes: notes,
        userTimezone: userTimezone,  
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

  if (loadingSettings) {
    return layout(
      `Book ${serviceName}`,
      "Loading availability...",
      <div className="p-6 flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    );
  }

  const renderTimezoneInfo = () => (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <Globe className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <p className="text-sm text-blue-800">
            Times are displayed in your local timezone: <strong>{formatTimezone(userTimezone)}</strong>
          </p>
          {businessTimezone !== userTimezone && (
            <p className="text-xs text-blue-600 mt-1">
              The business is in {formatTimezone(businessTimezone)} ({getTimezoneDifference()})
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (step === "date") {
    const y = currentMonth.getFullYear(),
      m = currentMonth.getMonth();
    const off = firstWeekday(y, m),
      days = daysInMonth(y, m);

    return layout(
      `Book ${serviceName}`,
      "Select a date for your appointment",
      <div className="p-6">
        {renderTimezoneInfo()}
        
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

  if (step === "time" && selectedDate) {
    const todayStr = selectedDate.toDateString();
    const availableSlots = slots.filter((s) => {
      if (!s.available) return false;
      if (selectedDate.toDateString() !== now.toDateString()) return true;
      const [h, m] = s.startTime.split(":").map(Number);
      const slotDate = new Date(now);
      slotDate.setHours(h, m, 0, 0);
      return slotDate > now;
    });

    availableSlots.sort((a, b) => {
      const [aHour, aMin] = a.startTime.split(':').map(Number);
      const [bHour, bMin] = b.startTime.split(':').map(Number);
      return (aHour * 60 + aMin) - (bHour * 60 + bMin);
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

        {renderTimezoneInfo()}

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

        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <h3 className="font-medium text-gray-800 mb-2 flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            Appointment Details
          </h3>
          <p className="text-gray-700">
            {fmtDateFull(selectedDate)} at {fmtTime(selectedSlot.startTime)} - {fmtTime(selectedSlot.endTime)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Time shown in your local timezone: {formatTimezone(userTimezone)}
          </p>
        </div>

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
                onChange={handleEmailChange}
                onBlur={() => validateEmail(email)}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 ${
                  emailError ? "border-red-300 focus:ring-red-500" : "focus:ring-gray-500"
                }`}
              />
            </div>
            {emailError && (
              <div className="mt-1 flex items-center text-red-500 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {emailError}
              </div>
            )}
          </div>
          
          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <div className="flex">
              {/* Country code dropdown */}
              <div className="relative country-code-dropdown">
                <button
                  type="button"
                  onClick={() => setShowCountryCodes(!showCountryCodes)}
                  className="flex items-center justify-between w-20 bg-gray-50 border rounded-l-lg py-2 px-3 text-sm focus:ring-2 focus:ring-gray-500"
                >
                  <span>{selectedCountryCode}</span>
                  <ChevronDown className="h-4 w-4 ml-1 text-gray-400" />
                </button>
                
                {/* Country code list */}
                {showCountryCodes && (
                  <div className="absolute z-10 mt-1 bg-white border rounded-lg shadow-lg w-48 max-h-60 overflow-y-auto">
                    {COUNTRY_CODES.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => selectCountryCode(country.code)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm flex items-center"
                      >
                        <span className="font-medium mr-2">{country.code}</span>
                        <span className="text-gray-600">{country.country}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Phone input */}
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  ref={phoneInputRef}
                  placeholder="(555) 123-4567"
                  className={`w-full pl-10 pr-4 py-2 border border-l-0 rounded-r-lg focus:ring-2 ${
                    phoneError ? "border-red-300 focus:ring-red-500" : "focus:ring-gray-500"
                  }`}
                />
              </div>
            </div>
            {phoneError && (
              <div className="mt-1 flex items-center text-red-500 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {phoneError}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Optional. Include country code for international numbers.
            </p>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Location
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedLocation("google_meet")}
                className={`flex items-center justify-center p-3 border rounded-lg ${
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
                className={`flex items-center justify-center p-3 border rounded-lg ${
                  selectedLocation === "in_person"
                    ? "border-gray-800 bg-gray-50"
                    : "border-gray-200"
                }`}
              >
                <MapPin className="h-5 w-5 mr-2" /> In‑person
              </button>
            </div>
          </div>
          
          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !name || !email || emailError || phoneError}
            className={`w-full py-3 rounded-lg text-white font-medium mt-6 ${
              submitting || !name || !email || emailError || phoneError
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-800 hover:bg-gray-900"
            }`}
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Booking...
              </span>
            ) : "Confirm Booking"}
          </button>
        </form>
      </div>
    );
  }

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

        {selectedDate && selectedSlot && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-3">Appointment Details</h3>
            <div className="space-y-2">
              <div className="flex">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-gray-800">{fmtDateFull(selectedDate)}</p>
                </div>
              </div>
              <div className="flex">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-gray-800">
                    {fmtTime(selectedSlot.startTime)} - {fmtTime(selectedSlot.endTime)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Time shown in your local timezone: {formatTimezone(userTimezone)}
                  </p>
                </div>
              </div>
              <div className="flex">
                {selectedLocation === "google_meet" ? (
                  <Video className="h-5 w-5 text-gray-400 mr-2" />
                ) : (
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                )}
                <p className="text-gray-800">
                  {selectedLocation === "google_meet" 
                    ? "Google Meet (link will be sent by email)" 
                    : "In-person"}
                </p>
              </div>
              {name && (
                <div className="flex">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-gray-800">{name}</p>
                </div>
              )}
              {phone && (
                <div className="flex">
                  <Phone className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-gray-800">{createInternationalPhone(phone, selectedCountryCode)}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
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