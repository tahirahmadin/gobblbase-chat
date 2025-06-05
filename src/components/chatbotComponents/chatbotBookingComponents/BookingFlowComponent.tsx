import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  X,
  CreditCard,
} from "lucide-react";
import {
  getAvailableSlots,
  bookAppointment,
  getAppointmentSettings,
  getDayWiseAvailability,
} from "../../../lib/serverActions";
import {
  SmartPhoneFormatter,
  validatePhoneNumber,
  formatPhoneForStorage,
  detectCountryFromPhone,
  getCallingCode,
  getExamplePhoneNumber,
  MAJOR_COUNTRIES,
  parsePhoneNumber,
  autoDetectCountry
} from "../../../utils/advphoneUtils";
import { Theme } from "../../types";
import { useUserStore } from "../../../store/useUserStore"; 
import { useBotConfig } from "../../../store/useBotConfig";
import { LoginCard } from "../otherComponents/LoginCard"; 
import { BookingPaymentComponent } from "./BookingPaymentComponent";
import toast from "react-hot-toast";
import { formatTimezone, isValidTimezone, getUserTimezone, getTimezoneDifference } from "../../../utils/timezoneUtils";
import { DateTime } from 'luxon';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Currency symbols mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  CAD: "C$",
  AUD: "A$",
  JPY: "¥"
};

interface ChatbotBookingProps {
  businessId?: string;
  serviceName?: string;
  servicePrice?: string;
  onClose: () => void;
  theme: Theme;
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

interface PriceSettings {
  isFree: boolean;
  amount: number;
  currency: string;
}

interface AppointmentSettings {
  availability: AvailabilityRule[];
  unavailableDates: UnavailableDate[];
  lunchBreak: { start: string; end: string };
  meetingDuration: number;
  bufferTime: number;
  timezone: string;
  price?: PriceSettings;
  locations: Array<"google_meet" | "zoom" | "teams" | "in_person">;
}

// Helper function to detect user's country based on timezone
const getUserCountry = (): string => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Map common timezones to countries
  const timezoneToCountry: Record<string, string> = {
    'Asia/Kolkata': 'IN',
    'Asia/Mumbai': 'IN',
    'Asia/Delhi': 'IN',
    'Asia/Calcutta': 'IN',
    'America/New_York': 'US',
    'America/Los_Angeles': 'US',
    'America/Chicago': 'US',
    'America/Denver': 'US',
    'America/Phoenix': 'US',
    'America/Toronto': 'CA',
    'America/Vancouver': 'CA',
    'Europe/London': 'GB',
    'Europe/Berlin': 'DE',
    'Europe/Paris': 'FR',
    'Europe/Rome': 'IT',
    'Europe/Madrid': 'ES',
    'Australia/Sydney': 'AU',
    'Australia/Melbourne': 'AU',
    'Asia/Tokyo': 'JP',
    'Asia/Shanghai': 'CN',
    'Asia/Singapore': 'SG',
    'Asia/Hong_Kong': 'HK',
    'Asia/Dubai': 'AE',
    'Asia/Seoul': 'KR',
    'Europe/Amsterdam': 'NL',
    'Europe/Zurich': 'CH',
    'Europe/Stockholm': 'SE',
    'Europe/Oslo': 'NO',
    'Europe/Copenhagen': 'DK',
    'Europe/Helsinki': 'FI',
    'Europe/Vienna': 'AT',
    'Europe/Brussels': 'BE',
    'Europe/Warsaw': 'PL',
    'Asia/Bangkok': 'TH',
    'Asia/Jakarta': 'ID',
    'Asia/Kuala_Lumpur': 'MY',
    'Asia/Manila': 'PH',
    'America/Sao_Paulo': 'BR',
    'America/Mexico_City': 'MX',
    'America/Buenos_Aires': 'AR',
    'Europe/Moscow': 'RU',
    'Asia/Istanbul': 'TR',
    'Asia/Tel_Aviv': 'IL',
    'Africa/Cairo': 'EG',
    'Africa/Lagos': 'NG',
    'Africa/Nairobi': 'KE',
    'Africa/Johannesburg': 'ZA',
    'Asia/Riyadh': 'SA',
    'Asia/Ho_Chi_Minh': 'VN',
  };
  
  return timezoneToCountry[timezone] || 'US'; // Default to US if not found
};

const getConsistentDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const LoadingSkeleton = ({ theme }: { theme: any }) => (
  <div className="space-y-4 animate-pulse p-4">
    <div className="flex justify-between items-center mb-4">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </div>
    
    <div className="space-y-3">
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-8 bg-gray-200 rounded"></div>
      <div className="h-8 bg-gray-200 rounded"></div>
      <div className="h-32 bg-gray-200 rounded"></div>
    </div>
    
    <div className="flex justify-end">
      <div className="h-10 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
);

const BookingFlowComponent: React.FC<ChatbotBookingProps> = ({
  businessId: propId,
  serviceName = "Session Description",
  servicePrice = "Free", 
  onClose,
  theme
}) => {
  // Get user information from the user store
  const { isLoggedIn, userEmail } = useUserStore();
  const { activeBotData } = useBotConfig();
  const globalCurrency = activeBotData?.currency || "USD";
  const businessId = propId || "";
  const [step, setStep] = useState<"date" | "time" | "details" | "payment" | "confirmation">("date");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [now, setNow] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<"google_meet" | "zoom" | "teams" | "in_person">("google_meet");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  
  // Auto-detect user's country and initialize phone formatter
  const userCountry = getUserCountry();
  const [selectedCountryCode, setSelectedCountryCode] = useState(() => getCallingCode(userCountry));
  const [phoneFormatter] = useState(() => new SmartPhoneFormatter(userCountry));
  const [selectedCountry, setSelectedCountry] = useState(userCountry);
  const [showCountryCodes, setShowCountryCodes] = useState(false);
  
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<AppointmentSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [unavailableDates, setUnavailableDates] = useState<Record<string, UnavailableDate>>({});
  const [userTimezone, setUserTimezone] = useState<string>(
    getUserTimezone() 
  );
  const [businessTimezone, setBusinessTimezone] = useState<string>("UTC");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [stripeProcessing, setStripeProcessing] = useState(false);
  const [stablecoinProcessing, setStablecoinProcessing] = useState(false);
  const [nameError, setNameError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Add state for day-wise availability
  const [dayWiseAvailability, setDayWiseAvailability] = useState<Record<string, boolean>>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  
  // Add debug state to track availability issues
  const [availabilityDebug, setAvailabilityDebug] = useState<string>("");

  // Check if any payment method is enabled
  const availablePaymentMethods = useMemo(() => {
    if (!activeBotData?.paymentMethods) return [];
    
    const methods = [];
    if (activeBotData.paymentMethods.stripe?.enabled) methods.push('stripe');
    if (activeBotData.paymentMethods.razorpay?.enabled) methods.push('razorpay');
    if (activeBotData.paymentMethods.usdt?.enabled) methods.push('usdt');
    if (activeBotData.paymentMethods.usdc?.enabled) methods.push('usdc');
    
    return methods;
  }, [activeBotData?.paymentMethods]);

  const hasEnabledPaymentMethods = availablePaymentMethods.length > 0;

  const validateForm = () => {
    const isNameValid = name.trim().length >= 2;
    if (!isNameValid) {
      setNameError(name.trim() === "" ? "Name is required" : "Name must be at least 2 characters");
    } else {
      setNameError("");
    }
    
    let isPhoneValid = true;
    if (phone && phone.trim()) {
      const phoneValidation = validatePhoneNumber(phone.trim(), selectedCountry);
      isPhoneValid = phoneValidation.isValid;
    }
    
    const isEmailValid = EMAIL_REGEX.test(email);
    
    return isNameValid && isEmailValid && isPhoneValid;
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    
    if (value.trim().length >= 2) {
      setNameError("");
    }
    
    setTimeout(() => {
      setIsFormValid(validateForm());
    }, 0);
  };
  
  // Store dynamic price info
  const [dynamicPrice, setDynamicPrice] = useState({
    isFree: servicePrice === "Free", 
    amount: servicePrice !== "Free" ? parseFloat(servicePrice.replace(/[^0-9.]/g, "")) || 0 : 0,
    currency: globalCurrency, 
    displayPrice: servicePrice
  });
  
  // Pre-fill the email if the user is logged in
  useEffect(() => {
    if (isLoggedIn && userEmail) {
      setEmail(userEmail);
      // Also validate it immediately to avoid validation errors
      validateEmail(userEmail);
    }
  }, [isLoggedIn, userEmail]);
  
  // Format price for display
  const formatPrice = useCallback((priceSettings?: PriceSettings): string => {
    if (!priceSettings) return "Free";
    if (priceSettings.isFree) return "Free";
    return `${priceSettings.amount} ${globalCurrency}`;
  }, [globalCurrency]);
  
  const validateEmail = useCallback((value: string): boolean => {
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
  }, []);
  
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
    setTimeout(() => {
      setIsFormValid(validateForm());
    }, 0);
  }, [validateForm, validateEmail]);
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Handle backspace/deletion
    if (input.length < phone.length) {
      setPhone(input);
      if (phoneError) {
        setPhoneError("");
      }
      setTimeout(() => {
        setIsFormValid(validateForm());
      }, 0);
      return;
    }
    
    // Auto-detect country using optimized function
    const detectedCountry = autoDetectCountry(input, selectedCountry);
    
    // Update country if different (with console log for debugging)
    if (detectedCountry !== selectedCountry) {
      console.log(`🌍 Country detected: ${selectedCountry} → ${detectedCountry}`);
      setSelectedCountry(detectedCountry);
      setSelectedCountryCode(getCallingCode(detectedCountry));
      phoneFormatter.setCountry(detectedCountry);
    }
    
    // Format the number with the detected country
    const result = phoneFormatter.formatAsYouType(input);
    setPhone(result.formatted);
    
    // Validate with detected country
    setTimeout(() => {
      if (input.trim()) {
        const validation = validatePhoneNumber(input.trim(), detectedCountry);
        setPhoneError(validation.errorMessage);
      } else {
        setPhoneError("");
      }
      setIsFormValid(validateForm());
    }, 0);
  };

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (showCountryCodes) {
      const handleOutsideClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest(".country-code-dropdown")) {
          setShowCountryCodes(false);
        }
      };

      document.addEventListener("mousedown", handleOutsideClick);
      return () =>
        document.removeEventListener("mousedown", handleOutsideClick);
    }
  }, [showCountryCodes]);

  // Fetch day-wise availability with improved error handling
  const fetchDayWiseAvailability = async () => {
    if (!businessId) return;
    
    setLoadingAvailability(true);
    setAvailabilityDebug('');
    
    try {
      console.log('🔍 Fetching availability for business:', businessId);
      const availability = await getDayWiseAvailability(businessId, userTimezone);
      
      console.log('📥 API Response:', availability);
      
      if (typeof availability === 'object' && availability !== null) {
        // Normalize all date keys to YYYY-MM-DD format
        const normalizedAvailability = {};
        Object.entries(availability).forEach(([dateStr, isAvailable]) => {
          let normalizedDate = dateStr;
          
          // Handle different date formats that might come from API
          if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            normalizedDate = dateStr; // Already correct format
          } else if (dateStr.match(/^\d{2}-[A-Z]{3}-\d{4}$/)) {
            // Convert DD-MMM-YYYY to YYYY-MM-DD
            const [day, month, year] = dateStr.split('-');
            const monthMap = {
              'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05', 'JUN': '06',
              'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
            };
            normalizedDate = `${year}-${monthMap[month]}-${day}`;
          }
          
          normalizedAvailability[normalizedDate] = Boolean(isAvailable);
        });
        
        console.log('✅ Normalized availability:', normalizedAvailability);
        setDayWiseAvailability(normalizedAvailability);
      } else {
        console.error("Invalid availability response:", availability);
        setAvailabilityDebug("Invalid API response format");
        setDayWiseAvailability({});
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      setAvailabilityDebug(`Error: ${error.message}`);
      setDayWiseAvailability({});
    } finally {
      setLoadingAvailability(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchDayWiseAvailability();
    }
  }, [businessId, userTimezone]);

  useEffect(() => {
    if (businessId) {
      fetchDayWiseAvailability();
    }
  }, [currentMonth.getMonth(), currentMonth.getFullYear()]);

  useEffect(() => {
    const loadSettings = async () => {
      if (!businessId) return;

      setLoadingSettings(true);
      try {
        const data = await getAppointmentSettings(businessId);
        setSettings(data);

        if (data.timezone) {
          if (isValidTimezone(data.timezone)) {
            setBusinessTimezone(data.timezone);
          } else {
            console.warn('Invalid business timezone:', data.timezone);
            setBusinessTimezone('UTC');
          }
        }

        // Get pricing data from settings
        if (data.price) {
          const formattedPrice = data.price.isFree ? "Free" : `${data.price.amount} ${globalCurrency}`;
          
          setDynamicPrice({
            isFree: data.price.isFree,
            amount: data.price.amount,
            currency: globalCurrency, 
            displayPrice: formattedPrice
          });
        }

        const unavailableLookup: Record<string, UnavailableDate> = {};
        if (data.unavailableDates && Array.isArray(data.unavailableDates)) {
          data.unavailableDates.forEach((date) => {
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
  }, [businessId, globalCurrency]);

  useEffect(() => {
    if (settings?.locations?.length) {
      setSelectedLocation(settings.locations[0]);
    }
  }, [settings]);

  useEffect(() => {
    const detectedTimezone = getUserTimezone();
    if (detectedTimezone !== userTimezone) {
      console.log('Updating user timezone from', userTimezone, 'to', detectedTimezone);
      setUserTimezone(detectedTimezone);
    }
  }, []);

  const getTimezoneDifferenceDisplay = (): string => {
    return getTimezoneDifference(userTimezone, businessTimezone);
  };
  

  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstWeekday = (y: number, m: number) => new Date(y, m, 1).getDay();

  const isBeforeToday = (d: Date) => {
    const today = DateTime.now().setZone(userTimezone).startOf('day');
    const checkDate = DateTime.fromJSDate(d).setZone(userTimezone).startOf('day');
    return checkDate < today;
  };

  const fmtMonthYear = (d: Date) =>
    new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
      d
    );

  const fmtApiDate = (d: Date) => {
    const day = d.getDate().toString().padStart(2, "0");
    const monthNames = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
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

  const fmtTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ap = h < 12 ? "AM" : "PM";
    const hr = h % 12 === 0 ? 12 : h % 12;
    return `${hr}:${m.toString().padStart(2, "0")} ${ap}`;
  };

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

    const isDateFullyUnavailable = (date) => {
      if (isBeforeToday(date)) {
        return true;
      }
    
      const dateStr = getConsistentDateString(date);
      
      // PRIORITY 1: API day-wise availability (highest priority)
      if (dayWiseAvailability.hasOwnProperty(dateStr)) {
        const apiAvailability = dayWiseAvailability[dateStr];
        console.log(`🎯 Date ${dateStr} API availability:`, apiAvailability);
        
        // If API says false, it's unavailable
        if (apiAvailability === false) {
          return true;
        }
        // If API says true, it's available (override other rules)
        if (apiAvailability === true) {
          return false;
        }
      }
    
      // PRIORITY 2: Date-specific overrides from settings
      const apiDate = fmtApiDate(date);
      const unavailableDate = unavailableDates[apiDate];
      if (unavailableDate && unavailableDate.allDay === true) {
        return true;
      }
    
      // PRIORITY 3: Weekly availability rules
      if (!settings) return false;
      
      const dayName = DateTime.fromJSDate(date).setZone(userTimezone).toFormat('cccc');
      const dayRule = settings.availability.find((rule) => rule.day === dayName);
      if (dayRule && !dayRule.available) {
        return true;
      }
      
      return false;
    };

    const selectDate = async (d) => {
      setSelectedDate(d);
      setStep("time");
      setLoadingSlots(true);
    
      const apiDate = fmtApiDate(d);
      const dateStr = getConsistentDateString(d);
      
      console.log(`🎯 Selecting date: ${dateStr} (API: ${apiDate})`);
      
      try {
        const slots = await getAvailableSlots(businessId, apiDate, userTimezone);
        
        console.log(`⏰ Slots for ${dateStr}:`, slots);
        
        if (slots && slots.length > 0) {
          setSlots(slots.map(slot => ({ ...slot, available: true })));
        } else {
          console.log(`❌ No slots for ${dateStr}, updating availability`);
          // Update local state to reflect no availability
          setDayWiseAvailability(prev => ({
            ...prev,
            [dateStr]: false
          }));
          setSlots([]);
        }
      } catch (error) {
        console.error("Error fetching slots for", dateStr, ":", error);
        setSlots([]);
        // Mark as unavailable on error
        setDayWiseAvailability(prev => ({
          ...prev,
          [dateStr]: false
        }));
      } finally {
        setLoadingSlots(false);
      }
    };

  const selectSlot = (slot: Slot) => {
    if (!isLoggedIn) {
      setSelectedSlot(null);
      return;
    }
    
    setSelectedSlot(slot);
    setStep("details");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;

    if (!isValidTimezone(userTimezone)) {
      toast.error("Invalid timezone detected. Please refresh the page.");
      return;
    }
  
    try {
      const currentSlots = await getAvailableSlots(
        businessId,
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
    
    const isValid = validateForm();
    if (!isValid) return;
  
    const isPaidBooking = !settings?.price?.isFree && !dynamicPrice.isFree;
    if (isPaidBooking && !hasEnabledPaymentMethods) {
      toast.error("Payment methods are not enabled. Please contact the admin.");
      return;
    }
  
    if (settings?.price?.isFree || dynamicPrice.isFree) {
      setSubmitting(true);
      try {
        const formattedPhone = phone ? formatPhoneForStorage(phone, selectedCountry) : "";
  
        await bookAppointment({
          agentId: businessId,
          userId: isLoggedIn && userEmail ? userEmail : email,
          email: email,
          date: fmtApiDate(selectedDate),
          startTime: selectedSlot.startTime, 
          endTime: selectedSlot.endTime,     
          location: selectedLocation,
          name: name,
          phone: formattedPhone,
          notes: notes,
          userTimezone: userTimezone, 
        });
        setStep("confirmation");
      } catch (error) {
        console.error(error);
        toast.error("Failed to book appointment. Please try again.");
      } finally {
        setSubmitting(false);
      }
    } else {
      setStep("payment");
    }
  };

  const renderTimezoneInfo = () => (
    <div className="flex items-start text-xs mb-4">
      <Globe className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" style={{ color: theme.mainLightColor }} />
      <div>
        <p>
          Timezone: <strong>{formatTimezone(userTimezone)}</strong>
          {businessTimezone !== userTimezone && (
            <span className="text-xs block opacity-75">
              ({getTimezoneDifferenceDisplay()})
            </span>
          )}
        </p>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loadingSettings) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8" style={{ color: theme.mainLightColor }} />
        </div>
      );
    }

    if (loadingSettings) {
      return <LoadingSkeleton theme={theme} />;
    }

    if (step === "date") {
        const y = currentMonth.getFullYear(),
              m = currentMonth.getMonth();
        const off = firstWeekday(y, m),
              days = daysInMonth(y, m);
              
        return (
          <div>
            <div className="flex justify-between items-center text-sm mb-4" style={{ borderColor: theme.isDark ? "#333" : "#ddd" }}>
              <h3 className="font-medium">SELECT SLOT</h3>
              <div className="text-sm">Timezone: {formatTimezone(userTimezone)}</div>
            </div>

            {loadingAvailability ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin h-6 w-6" style={{ color: theme.mainLightColor }} />
              <span className="ml-2">Loading availability...</span>
            </div>
          ) : (
            <div className="mb-4">
              {/* Debug info */}
              {availabilityDebug && (
                <div className="text-xs mb-2 p-1 bg-gray-100 rounded">
                  Debug: {availabilityDebug}
                </div>
              )}
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={prevMonth}
                  className="p-1"
                >
                  <ChevronLeft className="h-5 w-5" style={{ color: theme.highlightColor }} />
                </button>
                <h2 className="text-base font-medium">
                  {fmtMonthYear(currentMonth)}
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-1"
                >
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
                {Array.from({ length: off }).map((_, i) => (
                  <div key={"e" + i} />
                ))}
                {Array.from({ length: days }).map((_, i) => {
                  const dn = i + 1;
                  const date = new Date(y, m, dn);
                  
                  // Use consistent date formatting
                  const dateString = getConsistentDateString(date);
                  
                  // Check availability with clear logging
                  const isUnavailable = isDateFullyUnavailable(date);
                  const hasApiData = dayWiseAvailability.hasOwnProperty(dateString);
                  const apiValue = dayWiseAvailability[dateString];
                  
                  // Debug logging (remove in production)
                  if (hasApiData) {
                    console.log(`📅 ${dateString}: API=${apiValue}, Final=${!isUnavailable}`);
                  }
                  
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
                      title={hasApiData ? `API: ${apiValue}` : "No API data"}
                    >
                      {dn}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
          const [aHour, aMin] = a.startTime.split(":").map(Number);
          const [bHour, bMin] = b.startTime.split(":").map(Number);
          return aHour * 60 + aMin - (bHour * 60 + bMin);
        });
      
        if (!isLoggedIn) {
          return (
            <div>
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setStep("date")}
                  className="flex items-center text-sm"
                  style={{ color: theme.mainLightColor }}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> BACK
                </button>
                <div className="text-sm">Timezone: {formatTimezone(userTimezone)}</div>
              </div>
              
              <div className="mb-4 flex justify-between">
                <div className="font-medium">SELECTED DATE</div>
                <div>{fmtDateFull(selectedDate)}</div>
              </div>
              
              {/* Login Card */}
              <LoginCard theme={theme} />
            </div>
          );
        }
        
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setStep("date")}
                className="flex items-center text-sm"
                style={{ color: theme.mainLightColor }}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> BACK
              </button>
              <div className="text-sm">Timezone: {formatTimezone(userTimezone)}</div>
            </div>
      
            <div className="mb-4 flex justify-between">
              <div className="font-medium">SELECTED DATE</div>
              <div>{fmtDateFull(selectedDate)}</div>
            </div>
            
            {loadingSlots ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin h-8 w-8" style={{ color: theme.mainLightColor }} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {availableSlots.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectSlot(s)}
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
                {availableSlots.length === 0 && (
                  <p className="text-center col-span-2 py-8 opacity-75">
                    No available time slots for this date.
                  </p>
                )}
              </div>
            )}
          </div>
        );
      }
      
      if (step === "details" && selectedSlot && selectedDate) {
        const isPaidBooking = !settings?.price?.isFree && !dynamicPrice.isFree;
        const isBookingDisabled = isPaidBooking && !hasEnabledPaymentMethods;
        
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setStep("time")}
                className="flex items-center text-sm"
                style={{ color: theme.mainLightColor }}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> BACK
              </button>
              <div className="text-sm">Timezone: {formatTimezone(userTimezone)}</div>
            </div>
      
            <div className="mb-4 flex justify-between items-center">
            <div 
                className="font-medium uppercase"
                style={{ color: theme.highlightColor }}
            >
                SELECTED DATE
            </div>
            <div style={{ color: theme.isDark ? "#fff" : "#000" }}>
                {fmtDateFull(selectedDate)}
            </div>
            </div>
      
            <div className="mb-4 flex justify-between items-center">
            <div 
                className="font-medium uppercase"
                style={{ color: theme.highlightColor }}
            >
                SELECTED TIME
            </div>
            <div style={{ color: theme.isDark ? "#fff" : "#000" }}>
                {fmtTime(selectedSlot.startTime)} - {fmtTime(selectedSlot.endTime)}
            </div>
            </div>
      
            <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={handleNameChange}
                  onBlur={() => {
                    if (!name.trim()) {
                      setNameError("Name is required");
                    } else if (name.trim().length < 2) {
                      setNameError("Name must be at least 2 characters");
                    }
                    setIsFormValid(validateForm());
                  }}
                  placeholder="NAME"
                  className={`w-full p-2 rounded ${
                    theme.isDark ? "placeholder-gray-900" : "placeholder-gray-100"
                  }`}
                  style={{ 
                    backgroundColor: theme.mainLightColor,
                    color: theme.isDark ? "black" : "white",
                    borderColor: nameError ? "red" : "transparent"
                  }}
                />
              </div>
              {nameError && (
                <div className="mt-1 text-red-500 text-xs">
                  {nameError}
                </div>
              )}
            </div>
              <div>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    placeholder="EMAIL"
                    onChange={handleEmailChange}
                    onBlur={() => validateEmail(email)}
                    className={`w-full p-2 rounded ${
                        theme.isDark ? "placeholder-gray-900" : "placeholder-gray-100"
                      }`}
                    style={{ 
                      backgroundColor: theme.mainLightColor,
                      color: theme.isDark ? "black" : "white",
                      borderColor: emailError ? "red" : "transparent"
                    }}
                  />
                </div>
                {emailError && (
                  <div className="mt-1 text-red-500 text-xs">
                    {emailError}
                  </div>
                )}
              </div>
      
              <div>
  <div className="flex">
    <div className="relative country-code-dropdown">
      <button
        type="button"
        onClick={() => setShowCountryCodes(!showCountryCodes)}
        className={`flex items-center justify-between h-full px-3 rounded-l border-r ${
          theme.isDark ? "placeholder-gray-900" : "placeholder-gray-100"
        }`}
        style={{ 
          backgroundColor: theme.mainLightColor,
          color: theme.isDark ? "black" : "white",
          borderColor: theme.isDark ? "#444" : "#ddd"
        }}
      >
        <span className="flex items-center">
          {MAJOR_COUNTRIES.find(c => c.code === selectedCountry)?.flag || "🌍"}
          <span className="ml-1 text-sm">{selectedCountryCode}</span>
        </span>
        <ChevronDown className="h-4 w-4 ml-1" />
      </button>

      {showCountryCodes && (
        <div className="absolute z-10 mt-1 bg-white border rounded-lg shadow-lg w-80 max-h-60 overflow-y-auto" style={{ 
          backgroundColor: theme.isDark ? "#222" : "#fff",
          color: theme.isDark ? "#fff" : "#000"
        }}>
          {MAJOR_COUNTRIES.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => {
                setSelectedCountry(country.code);
                setSelectedCountryCode(country.callingCode);
                phoneFormatter.setCountry(country.code);
                setShowCountryCodes(false);
                if (phoneInputRef.current) {
                  phoneInputRef.current.focus();
                }
              }}
              className="w-full text-left px-3 py-2 hover:bg-opacity-10 hover:bg-gray-500 text-sm flex items-center justify-between"
            >
              <div className="flex items-center">
                <span className="mr-2">{country.flag}</span>
                <span>{country.name}</span>
              </div>
              <span className="text-xs opacity-75">{country.callingCode}</span>
            </button>
          ))}
        </div>
      )}
    </div>

    <input
      type="tel"
      value={phone}
      placeholder={getExamplePhoneNumber(selectedCountry) || "PHONE"}
      onChange={handlePhoneChange}
      ref={phoneInputRef}
      className={`w-full p-2 rounded-r ${
          theme.isDark ? "placeholder-gray-900" : "placeholder-gray-100"
        }`}
      style={{ 
        backgroundColor: theme.mainLightColor,
        color: theme.isDark ? "black" : "white",
        borderColor: phoneError ? "red" : "transparent"
      }}
    />
  </div>
  {phoneError && (
    <div className="mt-1 text-red-500 text-xs">
      {phoneError}
    </div>
  )}
</div>
      
              <div>
                <div className="relative">
                  <textarea
                    value={notes}
                    placeholder="NOTES"
                    onChange={(e) => setNotes(e.target.value)}
                    className={`w-full p-2 rounded h-20 resize-none ${
                        theme.isDark ? "placeholder-gray-900" : "placeholder-gray-100"
                      }`}
                    style={{ 
                      backgroundColor: theme.mainLightColor,
                      color: theme.isDark ? "black" : "white"
                    }}
                  />
                </div>
              </div>

              {/* Payment Warning for Paid Bookings */}
              {isPaidBooking && !hasEnabledPaymentMethods && (
                <div 
                  className="mb-3 p-2 rounded-lg border text-center text-xs"
                  style={{ 
                    backgroundColor: theme.isDark ? '#2d1b1b' : '#fef2f2',
                    borderColor: '#ef4444',
                    color: theme.isDark ? '#fca5a5' : '#dc2626'
                  }}
                >
                  ⚠️ Payment methods not available. Contact admin to enable bookings.
                </div>
              )}
      
              <button
                type="submit"
                disabled={submitting || isBookingDisabled}
                className={`w-full p-3 rounded font-medium mt-4 transition-all duration-200 ${
                  isBookingDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
                style={{
                  backgroundColor: isBookingDisabled 
                    ? (theme.isDark ? '#444' : '#ccc') 
                    : theme.highlightColor,
                  color: isBookingDisabled 
                    ? (theme.isDark ? '#888' : '#666')
                    : (theme.isDark ? "black" : "white"),
                  opacity: (submitting || isBookingDisabled) ? 0.7 : 1
                }}
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Booking...
                  </div>
                ) : (
                  (settings?.price?.isFree || dynamicPrice.isFree) ? "BOOK NOW" : `PAY ${servicePrice} TO BOOK`
                )}
              </button>
            </form>
          </div>
        );
      }
      
      if (step === "payment" && selectedSlot && selectedDate) {
        const bookingDetails = {
          businessId: businessId,
          date: fmtApiDate(selectedDate),
          startTime: selectedSlot.startTime,  
          endTime: selectedSlot.endTime,     
          location: selectedLocation,
          name: name,
          email: email,
          phone: phone ? formatPhoneForStorage(phone, selectedCountry) : "",
          notes: notes,
          userTimezone: userTimezone,
        };
      
        // Create the price object from your dynamic price state
        const priceDetails = {
          amount: dynamicPrice.amount,
          currency: dynamicPrice.currency,
          displayPrice: dynamicPrice.displayPrice
        };
      
        return (
          <BookingPaymentComponent
            theme={theme}
            bookingDetails={bookingDetails}
            price={priceDetails}
            onBack={() => setStep("details")}
            onSuccess={() => {
              setStep("confirmation");
            }}
          />
        );
      }
      
      if (step === "confirmation") {
        return (
          <div className="text-center">
            <div className="flex justify-center my-4">
              <div className="rounded-full p-3" style={{ backgroundColor: "green" }}>
                <Check className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <h3 className="font-bold text-lg mb-2">You are scheduled!</h3>
            <p className="text-sm mb-6">Details have been sent to your email</p>
            
            {selectedDate && selectedSlot && (
            <div className="space-y-3 text-left mb-6">
                <div className="flex justify-between items-center">
                <div 
                    className="font-medium uppercase"
                    style={{ color: theme.highlightColor }}
                >
                    SELECTED DATE
                </div>
                <div style={{ color: theme.isDark ? "#fff" : "#000" }}>
                    {fmtDateFull(selectedDate)}
                </div>
                </div>
                
                <div className="flex justify-between items-center">
                <div 
                    className="font-medium uppercase"
                    style={{ color: theme.highlightColor }}
                >
                    SELECTED TIME
                </div>
                <div style={{ color: theme.isDark ? "#fff" : "#000" }}>
                    {fmtTime(selectedSlot.startTime)} - {fmtTime(selectedSlot.endTime)}
                </div>
                </div>
                
                {!dynamicPrice.isFree && (
                <div className="flex justify-between items-center">
                    <div 
                    className="font-medium uppercase"
                    style={{ color: theme.highlightColor }}
                    >
                    AMOUNT PAID
                    </div>
                    <div style={{ color: theme.isDark ? "#fff" : "#000" }}>
                    {dynamicPrice.displayPrice}
                    </div>
                </div>
                )}
            </div>
            )}
            
            <button
                onClick={() => {
                  setStep("date");
                  setSelectedDate(null);
                  setSelectedSlot(null);
                  setSlots([]);
                  setName("");
                  setEmail(isLoggedIn && userEmail ? userEmail : "");
                  setPhone("");
                  setNotes("");
                  setEmailError("");
                  setPhoneError("");
                  setNameError("");
                  setPaymentError(null);
                  setIsFormValid(false);
                }}
                className="px-6 py-2 rounded-2xl font-medium border"
                style={{
                    backgroundColor: "transparent",
                    borderColor: theme.highlightColor,
                    color: theme.highlightColor,
                    borderWidth: "1px"
                }}
                >
                BOOK ANOTHER SLOT
            </button>
          </div>
        );
      }
      return null;
      };
      
      return (
        <div className="p-4">
          {renderContent()}
        </div>
      );
      };
      
      export default BookingFlowComponent;
