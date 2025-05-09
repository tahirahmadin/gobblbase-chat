import React, { useState, useEffect, useRef } from "react";
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
  CreditCard
} from "lucide-react";
import {
  getAvailableSlots,
  bookAppointment,
  getAppointmentSettings,
} from "../../lib/serverActions";
import {
  COUNTRY_CODES,
  detectCountryCode,
  formatPhoneNumber,
  validatePhone,
  createInternationalPhone,
} from "../../utils/phoneUtils";
import { Theme } from "../../types";
import { useUserStore } from "../../store/useUserStore"; // Import useUserStore

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

const BookingFlowComponent: React.FC<ChatbotBookingProps> = ({
  businessId: propId,
  serviceName = "Session Description",
  servicePrice = "Free", // Default value
  onClose,
  theme
}) => {
  // Get user information from the user store
  const { isLoggedIn, userEmail } = useUserStore();
  
  const businessId = propId || "";
  const [step, setStep] = useState<
  "date" | "time" | "details" | "payment" | "confirmation"
  >("date");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [now, setNow] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<
  "google_meet" | "zoom" | "teams" | "in_person" >("google_meet");
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
  const [unavailableDates, setUnavailableDates] = useState<
    Record<string, UnavailableDate>
  >({});
  const [userTimezone, setUserTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [businessTimezone, setBusinessTimezone] = useState<string>("UTC");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [stripeProcessing, setStripeProcessing] = useState(false);
  const [stablecoinProcessing, setStablecoinProcessing] = useState(false);
  
  // Store dynamic price info
  const [dynamicPrice, setDynamicPrice] = useState({
    isFree: servicePrice === "Free", 
    amount: servicePrice !== "Free" ? parseFloat(servicePrice.replace(/[^0-9.]/g, "")) || 0 : 0,
    currency: "USD", // Default currency
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
  const formatPrice = (priceSettings?: PriceSettings): string => {
    if (!priceSettings) return "Free";
    if (priceSettings.isFree) return "Free";
    
    const symbol = CURRENCY_SYMBOLS[priceSettings.currency] || "$";
    return `${symbol}${priceSettings.amount}`;
  };
  
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
      const digitsOnly = phone.replace(/\D/g, "");
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
        if (!target.closest(".country-code-dropdown")) {
          setShowCountryCodes(false);
        }
      };

      document.addEventListener("mousedown", handleOutsideClick);
      return () =>
        document.removeEventListener("mousedown", handleOutsideClick);
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

        // Get pricing data from settings
        if (data.price) {
          const formattedPrice = formatPrice(data.price);
          setDynamicPrice({
            isFree: data.price.isFree,
            amount: data.price.amount,
            currency: data.price.currency,
            displayPrice: formattedPrice
          });
          console.log("Set dynamic price from settings:", formattedPrice);
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
  }, [businessId]);

  useEffect(() => {
    if (settings?.locations?.length) {
      setSelectedLocation(settings.locations[0]);
    }
  }, [settings]);

  const convertTimeToBusinessTZ = (time: string, date: Date): string => {
    const [hours, minutes] = time.split(":").map(Number);
    const userDate = new Date(date);
    userDate.setHours(hours, minutes, 0, 0);
    const options: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "numeric",
      hour12: false,
      timeZone: businessTimezone,
    };

    const businessTime = new Intl.DateTimeFormat("en-US", options).format(
      userDate
    );
    return businessTime.replace(/\s/g, "").padStart(5, "0");
  };

  const convertTimeToUserTZ = (time: string, date: Date): string => {
    const [hours, minutes] = time.split(":").map(Number);
    const businessDate = new Date(date);
    const dateStr = businessDate.toISOString().split("T")[0];
    const timeStr = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:00`;
    const dateTimeStr = `${dateStr}T${timeStr}`;
    const tzDate = new Date(dateTimeStr);
    const options: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "numeric",
      hour12: false,
      timeZone: userTimezone,
    };

    const userTime = new Intl.DateTimeFormat("en-US", options).format(tzDate);
    return userTime.replace(/\s/g, "").padStart(5, "0");
  };

  const formatTimezone = (tz: string): string => {
    try {
      const date = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: tz,
        timeZoneName: "short",
      };
      const tzName =
        new Intl.DateTimeFormat("en-US", options)
          .formatToParts(date)
          .find((part) => part.type === "timeZoneName")?.value || tz;

      return tzName;
    } catch (e) {
      return tz;
    }
  };

  const getTimezoneDifference = (): string => {
    if (businessTimezone === userTimezone) return "same timezone";

    const now = new Date();
    const userOffset = -now.getTimezoneOffset();
    const businessDate = new Date(
      now.toLocaleString("en-US", { timeZone: businessTimezone })
    );
    const businessOffset =
      businessDate.getTimezoneOffset() +
      (now.getTime() - businessDate.getTime()) / 60000;

    const diffHours = (userOffset - businessOffset) / 60;

    if (diffHours === 0) return "same time";

    const diffFormatted = Math.abs(diffHours).toFixed(1).replace(/\.0$/, "");
    return diffHours > 0
      ? `${diffFormatted} hour${Math.abs(diffHours) !== 1 ? "s" : ""} ahead`
      : `${diffFormatted} hour${Math.abs(diffHours) !== 1 ? "s" : ""} behind`;
  };

  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstWeekday = (y: number, m: number) => new Date(y, m, 1).getDay();

  const isBeforeToday = (d: Date) => {
    const check = new Date(d);
    check.setHours(0, 0, 0, 0);
    const t = new Date(now);
    t.setHours(0, 0, 0, 0);
    return check < t;
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

  const isDateFullyUnavailable = (date: Date): boolean => {
    if (isBeforeToday(date)) return true;

    if (!settings) return false;

    const apiDate = fmtApiDate(date);
    const unavailableDate = unavailableDates[apiDate];

    if (unavailableDate && unavailableDate.allDay === true) {
      return true;
    }

    const dayName = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
    }).format(date);
    const dayRule = settings.availability.find((rule) => rule.day === dayName);

    if (dayRule && !dayRule.available) {
      return true;
    }

    return false;
  };

  const hasModifiedHours = (date: Date): boolean => {
    if (!settings) return false;

    const apiDate = fmtApiDate(date);
    const unavailableDate = unavailableDates[apiDate];

    return unavailableDate && unavailableDate.allDay === false;
  };

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
    for (
      let slotStart = startMins;
      slotStart + meetingDuration <= endMins;
      slotStart += slotDuration
    ) {
      const slotEnd = slotStart + meetingDuration;

      const formatTimeString = (mins: number) => {
        const hours = Math.floor(mins / 60);
        const minutes = mins % 60;
        return `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;
      };

      const businessSlotStart = formatTimeString(slotStart);
      const businessSlotEnd = formatTimeString(slotEnd);

      const userSlotStart = convertTimeToUserTZ(businessSlotStart, date);
      const userSlotEnd = convertTimeToUserTZ(businessSlotEnd, date);

      slots.push({
        startTime: userSlotStart,
        endTime: userSlotEnd,
        available: true,
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

    const dayName = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
    }).format(date);
    const dayRule = settings.availability.find((rule) => rule.day === dayName);

    if (dayRule && dayRule.available && dayRule.timeSlots.length > 0) {
      let allSlots: Slot[] = [];

      dayRule.timeSlots.forEach((window) => {
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

    return generateSlotsFromTimeWindow(
      "09:00",
      "17:00",
      meetingDuration,
      bufferTime,
      date
    );
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
        console.log(
          "Using modified hours:",
          dateEntry.startTime,
          "-",
          dateEntry.endTime
        );
        const generatedSlots = generateTimeSlots(d);
        console.log("Generated slots from modified hours:", generatedSlots);
        setSlots(generatedSlots);
      } else {
        console.log("Fetching slots from API");
        try {
          const raw = await getAvailableSlots(
            businessId,
            apiDate,
            userTimezone
          );
          console.log("API returned slots:", raw);

          if (raw && raw.length > 0) {
            const userSlots = raw.map((slot) => ({
              ...slot,
              startTime: convertTimeToUserTZ(slot.startTime, d),
              endTime: convertTimeToUserTZ(slot.endTime, d),
              available: true,
            }));
            setSlots(userSlots);
          } else {
            const generatedSlots = generateTimeSlots(d);
            console.log(
              "API returned empty, using generated slots:",
              generatedSlots
            );
            setSlots(generatedSlots);
          }
        } catch (e) {
          console.error(
            "Error fetching slots from API, using generated slots:",
            e
          );
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

  const handleStripePayment = () => {
    setPaymentError(null);
    setStripeProcessing(true);
    
    setTimeout(async () => {
      try {
        const businessStartTime = convertTimeToBusinessTZ(
          selectedSlot!.startTime,
          selectedDate!
        );
        const businessEndTime = convertTimeToBusinessTZ(
          selectedSlot!.endTime,
          selectedDate!
        );
        const formattedPhone = phone
          ? createInternationalPhone(phone, selectedCountryCode)
          : "";
  
        // Send both the form email (contact email) and the login email (userId)
        await bookAppointment({
          agentId: businessId,
          userId: isLoggedIn && userEmail ? userEmail : email, // Use logged-in email for userId if available
          email: email, // Always use form email for contact information
          date: fmtApiDate(selectedDate!),
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
        console.error("Payment or booking error:", e);
        setPaymentError("PAYMENT FAILED. TRY AGAIN.");
      } finally {
        setStripeProcessing(false);
      }
    }, 1000);
  };
  
  const handleStablecoinPayment = () => {
    setPaymentError(null);
    setStablecoinProcessing(true);
    setTimeout(async () => {
      try {
        const businessStartTime = convertTimeToBusinessTZ(
          selectedSlot!.startTime,
          selectedDate!
        );
        const businessEndTime = convertTimeToBusinessTZ(
          selectedSlot!.endTime,
          selectedDate!
        );
        const formattedPhone = phone
          ? createInternationalPhone(phone, selectedCountryCode)
          : "";
  
        // Send both the form email (contact email) and the login email (userId)
        await bookAppointment({
          agentId: businessId,
          userId: isLoggedIn && userEmail ? userEmail : email, // Use logged-in email for userId if available
          email: email, // Always use form email for contact information
          date: fmtApiDate(selectedDate!),
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
        console.error("Payment or booking error:", e);
        setPaymentError("PAYMENT FAILED. TRY AGAIN.");
      } finally {
        setStablecoinProcessing(false);
      }
    }, 1000); 
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
  
    if (settings?.price?.isFree) {
      setSubmitting(true);
      try {
        const businessStartTime = convertTimeToBusinessTZ(
          selectedSlot.startTime,
          selectedDate
        );
        const businessEndTime = convertTimeToBusinessTZ(
          selectedSlot.endTime,
          selectedDate
        );
        const formattedPhone = phone
          ? createInternationalPhone(phone, selectedCountryCode)
          : "";
  
        // Send both the form email (contact email) and the login email (userId)
        await bookAppointment({
          agentId: businessId,
          userId: isLoggedIn && userEmail ? userEmail : email, // Use logged-in email for userId if available
          email: email, // Always use form email for contact information
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
              ({getTimezoneDifference()})
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
            
            <div className="mb-4">
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
                  const apiDate = fmtApiDate(date);
                  const isUnavailable = isDateFullyUnavailable(date);
                  
                  return (
                    <button
                      key={dn}
                      onClick={() => !isUnavailable && selectDate(date)}
                      disabled={isUnavailable}
                      className={`
                        h-8 w-8 flex items-center justify-center rounded-md text-sm
                        ${
                          isUnavailable
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-opacity-50"
                        }
                      `}
                      style={{
                         backgroundColor: isUnavailable ?
                           "transparent" :
                           (theme.isDark ? "#222" : theme.mainLightColor),
                        color: theme.isDark ? "#fff" : "#000"
                      }}
                    >
                      {dn}
                    </button>
                  );
                })}
              </div>
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
          const [aHour, aMin] = a.startTime.split(":").map(Number);
          const [bHour, bMin] = b.startTime.split(":").map(Number);
          return aHour * 60 + aMin - (bHour * 60 + bMin);
        });
      
        
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
                    onChange={(e) => setName(e.target.value)}
                    placeholder="NAME"
                    className={`w-full p-2 rounded ${
                        theme.isDark ? "placeholder-gray-900" : "placeholder-gray-100"
                      }`}
                    style={{ 
                      backgroundColor: theme.mainLightColor,
                      color: theme.isDark ? "black" : "white"
                    }}
                  />
                </div>
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
                      className={`flex items-center justify-between h-full px-2 rounded-l ${
                        theme.isDark ? "placeholder-gray-900" : "placeholder-gray-100"
                      }`}
                      style={{ 
                        backgroundColor: theme.mainLightColor,
                        color: theme.isDark ? "black" : "white"
                      }}
                    >
                      <span>{selectedCountryCode}</span>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </button>
      
                    {showCountryCodes && (
                      <div className="absolute z-10 mt-1 bg-white border rounded-lg shadow-lg w-48 max-h-60 overflow-y-auto" style={{ 
                        backgroundColor: theme.isDark ? "#222" : "#fff",
                        color: theme.isDark ? "#fff" : "#000"
                      }}>
                        {COUNTRY_CODES.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => selectCountryCode(country.code)}
                            className="w-full text-left px-3 py-2 hover:bg-opacity-10 hover:bg-gray-500 text-sm flex items-center"
                          >
                            <span className="font-medium mr-2">{country.code}</span>
                            <span>{country.country}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
      
                  <input
                    type="tel"
                    value={phone}
                    placeholder="PHONE"
                    onChange={handlePhoneChange}
                    ref={phoneInputRef}
                    className={`w-full p-2 rounded ${
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
      
              <button
                type="submit"
                disabled={submitting || !name || !email || emailError || phoneError}
                className="w-full p-3 rounded font-medium mt-4"
                style={{
                  backgroundColor: theme.highlightColor,
                  color: theme.isDark ? "black" : "white",
                  opacity: submitting || !name || !email || emailError || phoneError ? 0.7 : 1
                }}
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Booking...
                  </div>
                ) : (
                  settings?.price?.isFree ? "BOOK NOW" : `PAY TO BOOK ${servicePrice}`
                )}
              </button>
            </form>
          </div>
        );
      }
      
      if (step === "payment" && selectedSlot && selectedDate) {
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setStep("details")}
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
                        
            <div className="mb-4 flex justify-between items-center">
            <div 
                className="font-medium uppercase"
                style={{ color: theme.highlightColor }}
            >
                DUE AMOUNT
            </div>
            <div style={{ color: theme.isDark ? "#fff" : "#000" }}>
                {servicePrice}
            </div>
            </div>
            
            {paymentError && (
              <div className="mb-4 text-center">
                <p className="text-yellow-400 text-sm font-medium">{paymentError}</p>
              </div>
            )}
            
            <div className="space-y-3 mt-8">
              <button
                onClick={handleStripePayment}
                disabled={stripeProcessing || stablecoinProcessing}
                className="w-full p-3 rounded-full font-medium"
                style={{
                    backgroundColor: theme.highlightColor,
                    color: theme.mainDarkColor,
                    opacity: (stripeProcessing || stablecoinProcessing) ? 0.7 : 1
                  }}
              >
                {stripeProcessing ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Processing...
                  </div>
                ) : "PAY WITH STRIPE"}
              </button>
              
              <button
                onClick={handleStablecoinPayment}
                disabled={stripeProcessing || stablecoinProcessing}
                className="w-full p-3 rounded-full font-medium"
                style={{
                  backgroundColor: theme.highlightColor,
                  color: theme.mainDarkColor,
                  opacity: (stripeProcessing || stablecoinProcessing) ? 0.7 : 1
                }}
              >
                {stablecoinProcessing ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Processing...
                  </div>
                ) : "PAY WITH STABLECOIN"}
              </button>
            </div>
          </div>
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
                onClick={() => onClose()}
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