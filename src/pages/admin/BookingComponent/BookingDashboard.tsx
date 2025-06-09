import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Calendar,
  Users,
  Edit,
  Filter,
  ChevronDown,
  ChevronUp,
  User,
  Video,
  MapPin,
  Loader2,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  Globe,
  Link as LinkIcon,
  Mail,
  Copy,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useBotConfig } from "../../../store/useBotConfig";
import { getConsistentTimezoneLabel } from "../../../components/chatbotComponents/chatbotBookingComponents/TimezoneSelector";
import { formatTimezone, isValidTimezone, getTimezoneDifference, getUserTimezone, convertTime } from "../../../utils/timezoneUtils";
import {
  getAppointmentSettings,
  getBookings,
  cancelBooking,
  updateUnavailableDates,
  sendRescheduleRequestEmail,
} from "../../../lib/serverActions";
import { AvailabilityDay } from "./Booking";
import { useNavigate, useLocation } from "react-router-dom";
import AvailabilitySchedule from "./AvailabilitySchedule";
import MeetingDetails from "./MeetingDetails";
import { toast } from "react-hot-toast";
import { DateTime } from 'luxon';

interface Meeting {
  _id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  startTimeUTC?: string;
  endTimeUTC?: string;
  status: string;
  statusLabel: string;
  location: string;
  meetingLink?: string;
  userTimezone?: string;
  isRescheduled?: boolean;
  rescheduledFrom?: {
    bookingId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  };
  rescheduledTo?: string;
  name?: string;
  updatedAt?: string;
  sessionType?: string;
  displayStartTime?: string;
  displayEndTime?: string;
  needsTimezoneConversion?: boolean;
  convertedStartTime?: string;
  convertedEndTime?: string;
  originalTimezone?: string;
}

interface BookingDashboardProps {
  onEditSettings?: () => void;
  agentId?: string;
}

interface BookingSettings {
  bookingType: string;
  bookingsPerSlot: number;
  meetingDuration: number;
  bufferTime: number;
  breaks: { startTime: string; endTime: string }[];
  availability: AvailabilityDay[];
  locations: string[];
  timezone: string;
  price?: {
    isFree: boolean;
    amount: number;
    currency: string;
  };
}

interface FilterOptions {
  location: string | null;
  dateRange: "all" | "today" | "week" | "month";
  status: string | null;
}

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
];

const MEETINGS_PER_PAGE = 10;

const formatTimeLabel = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} Minutes`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return hours === 1 ? "1 Hour" : `${hours} Hours`;
  }

  return `${hours}.${remainingMinutes === 30 ? "5" : remainingMinutes} Hours`;
};

const formatTime12 = (t24: string) => {
  const [h, m] = t24.split(":").map((x) => parseInt(x, 10));
  const suffix = h >= 12 ? "PM" : "AM";
  const hr12 = h % 12 === 0 ? 12 : h % 12;
  return `${hr12}:${m.toString().padStart(2, "0")} ${suffix}`;
};

const BookingDashboard: React.FC<BookingDashboardProps> = ({
  onEditSettings,
  agentId: propAgentId,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const agentIdFromUrl = queryParams.get("agentId");
  const { activeBotData, activeBotId } = useBotConfig();
  const globalCurrency = activeBotData?.currency || "USD";
  const activeAgentId =
    propAgentId || agentIdFromUrl || activeBotId || activeBotData?.agentId;
  
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "schedule">("upcoming");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingSettings, setBookingSettings] = useState<BookingSettings | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [detailsOpenState, setDetailsOpenState] = useState<Record<string, boolean>>({});
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    location: null,
    dateRange: "all",
    status: null,
  });
  const [filtersApplied, setFiltersApplied] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const [businessTimezone, setBusinessTimezone] = useState<string>(getUserTimezone());
  const [showMobileCalendarSettings, setShowMobileCalendarSettings] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Memoized function to toggle meeting details
  const toggleDetailsOpen = useCallback((key: string) => {
    setDetailsOpenState((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  }, []);

  // Memoized timezone conversion function
  const convertMeetingToCurrentTimezone = useCallback((meeting: Meeting): Meeting => {
    if (meeting.originalTimezone && meeting.originalTimezone !== businessTimezone) {
      try {
        const meetingDate = new Date(meeting.date);
        const dateStr = meetingDate.toISOString().split('T')[0];
        
        const convertedStartTime = convertTime(
          meeting.startTime, 
          dateStr, 
          meeting.originalTimezone, 
          businessTimezone
        );
        
        const convertedEndTime = convertTime(
          meeting.endTime, 
          dateStr, 
          meeting.originalTimezone, 
          businessTimezone
        );
        
        return {
          ...meeting,
          convertedStartTime,
          convertedEndTime,
          needsTimezoneConversion: true,
          originalTimezone: meeting.originalTimezone
        };
      } catch (error) {
        console.error('Error converting meeting timezone:', error);
        return { ...meeting, needsTimezoneConversion: false };
      }
    }
    
    return { ...meeting, needsTimezoneConversion: false };
  }, [businessTimezone]); 

  // Memoized TimeDisplay component
  const TimeDisplay = useMemo(() => {
    return ({ meeting }: { meeting: Meeting }) => {
      if (meeting.needsTimezoneConversion) {
        return (
          <div className="text-xs text-gray-500">
            <div className="font-medium text-green-600">
              {formatTime(meeting.convertedStartTime!)} - {formatTime(meeting.convertedEndTime!)}
              <span className="text-xs ml-1">({getConsistentTimezoneLabel(businessTimezone)})</span>
            </div>
            <div className="text-xs text-gray-400">
              was {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
              <span className="text-xs ml-1">({getConsistentTimezoneLabel(meeting.originalTimezone || bookingSettings?.timezone || businessTimezone)})</span>
            </div>
          </div>
        );
      }
      
      return (
        <div className="text-xs text-gray-500">
          {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
        </div>
      );
    };
  }, [businessTimezone, bookingSettings?.timezone]);
  
  // Memoized format functions
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }, []);

  const formatTime = useCallback((t: string) => {
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
  }, []);

  // Memoized event handlers
  const handleCancelBooking = useCallback(async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    setCancellingId(bookingId);

    try {
      await cancelBooking(bookingId);
      toast.success("Booking cancelled successfully!");
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.success("Booking cancelled successfully!");
    } finally {
      setCancellingId(null);
    }
  }, []);

  const handleSendRescheduleEmail = useCallback(async (meeting: Meeting) => {
    if (!confirm("Send reschedule request email to this user?")) return;
  
    setSendingEmailId(meeting._id);
  
    try {
      const rescheduleLink = `${window.location.origin}/reschedule/${
        meeting._id
      }?userId=${encodeURIComponent(meeting.userId)}`;
  
      await sendRescheduleRequestEmail({
        bookingId: meeting._id,
        email: meeting.userId,
        rescheduleLink,
        agentName: meeting.name || activeBotData?.name || "Your Assistant",
        date: meeting.date,
        startTime: meeting.startTime,           
        endTime: meeting.endTime,               
        startTimeUTC: meeting.startTimeUTC,     
        endTimeUTC: meeting.endTimeUTC,         
        businessTimezone: businessTimezone,     
        userTimezone: meeting.userTimezone,
        agentId: activeAgentId
      });
  
      toast.success("Reschedule email sent successfully!");
    } catch (error) {
      console.error("Error sending reschedule email:", error);
      toast.error("Failed to send reschedule email. Please try again.");
    } finally {
      setSendingEmailId(null);
    }
  }, [activeBotData?.name, activeAgentId, businessTimezone]);

  const refreshMeetings = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleEditSettingsClick = useCallback(() => {
    navigate("/admin/commerce/calendar/edit");
  }, [navigate]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Effects
  useEffect(() => {
    const fetchBookingSettings = async () => {
      if (!activeAgentId) return;
  
      try {
        const settings = await getAppointmentSettings(activeAgentId);
        setBookingSettings(settings);
  
        if (settings && settings.timezone) {
          if (isValidTimezone(settings.timezone)) {
            setBusinessTimezone(settings.timezone);
          } else {
            console.warn('Invalid timezone from settings:', settings.timezone);
            setBusinessTimezone('UTC');
          }
        }
      } catch (error) {
        console.error("Error fetching booking settings:", error);
      }
    };
  
    fetchBookingSettings();
  }, [activeAgentId]);

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!activeAgentId) return;

      setIsLoading(true);
      setError(null);

      try {
        const bookings = await getBookings(activeAgentId);
        setMeetings(bookings || []);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError("Failed to load bookings. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, [activeAgentId, refreshTrigger]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target as Node)
      ) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset pagination when filters or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, activeTab]);

  // Memoized filtered meetings with performance optimization
  const filteredMeetings = useMemo(() => {
    if (!meetings.length) return [];

    return meetings
      .map(meeting => convertMeetingToCurrentTimezone(meeting))
      .filter((meeting) => {
        if (meeting.status === "cancelled" && meeting.isRescheduled) {
          return false;
        }

        const now = DateTime.now().setZone(businessTimezone);
        
        const meetingDate = DateTime.fromISO(meeting.date).setZone(businessTimezone);
        
        const businessStartTime = meeting.needsTimezoneConversion 
          ? meeting.convertedStartTime! 
          : meeting.startTime;
        const businessEndTime = meeting.needsTimezoneConversion 
          ? meeting.convertedEndTime! 
          : meeting.endTime;

        if (!businessStartTime?.match(/^\d{2}:\d{2}$/) || !businessEndTime?.match(/^\d{2}:\d{2}$/)) {
          console.warn('Invalid time format for meeting:', meeting._id);
          return false;
        }
        
        const [startHours, startMinutes] = businessStartTime.split(':').map(Number);
        const [endHours, endMinutes] = businessEndTime.split(':').map(Number);

        const meetingStartDateTime = meetingDate.set({ 
          hour: startHours, 
          minute: startMinutes, 
          second: 0, 
          millisecond: 0 
        });

        const meetingEndDateTime = meetingDate.set({ 
          hour: endHours, 
          minute: endMinutes, 
          second: 0, 
          millisecond: 0 
        });

        if (activeTab === "upcoming") {
          if (meetingEndDateTime <= now) return false;
        } else if (activeTab === "past") {
          if (meetingEndDateTime > now) return false;
        }

        if (filters.location && meeting.location !== filters.location) {
          return false;
        }

        if (filters.status && meeting.status !== filters.status) {
          return false;
        }

        if (filters.dateRange !== "all") {
          const today = DateTime.now().setZone(businessTimezone).startOf('day');

          if (filters.dateRange === "today") {
            const todayEnd = today.endOf('day');
            if (meetingEndDateTime < today || meetingStartDateTime > todayEnd) return false;
          } else if (filters.dateRange === "week") {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);
            if (meetingEndDateTime < weekStart || meetingStartDateTime > weekEnd) return false;
          } else if (filters.dateRange === "month") {
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            monthEnd.setHours(23, 59, 59, 999);
            if (meetingEndDateTime < monthStart || meetingStartDateTime > monthEnd) return false;
          }
        }

        return true;
      })
      .map((meeting) => {
        const updatedMeeting = { ...meeting };

        if (activeTab === "past" && meeting.status === "confirmed") {
          updatedMeeting.status = "completed";
        }

        return updatedMeeting;
      })
      .sort((a, b) => {
        const createSortDate = (meeting: Meeting) => {
          const meetingDate = new Date(meeting.date);
          const timeToUse = meeting.needsTimezoneConversion 
            ? meeting.convertedStartTime! 
            : meeting.startTime;
          const [hours, minutes] = timeToUse.split(':').map(Number);
          meetingDate.setHours(hours, minutes, 0, 0);
          return meetingDate;
        };
        
        const dateA = createSortDate(a);
        const dateB = createSortDate(b);
        
        return activeTab === "upcoming" 
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      });
  }, [meetings, convertMeetingToCurrentTimezone, filters, activeTab, businessTimezone]);

  // Memoized pagination calculations
  const paginationData = useMemo(() => {
    const totalMeetings = filteredMeetings.length;
    const totalPages = Math.ceil(totalMeetings / MEETINGS_PER_PAGE);
    const startIndex = (currentPage - 1) * MEETINGS_PER_PAGE;
    const endIndex = startIndex + MEETINGS_PER_PAGE;
    const paginatedMeetings = filteredMeetings.slice(startIndex, endIndex);

    return {
      totalMeetings,
      totalPages,
      startIndex,
      endIndex,
      paginatedMeetings
    };
  }, [filteredMeetings, currentPage]);

  const { totalMeetings, totalPages, startIndex, endIndex, paginatedMeetings } = paginationData;

  // IMPROVED: Calendar Settings Sidebar with consistent timezone display
  const CalendarSettingsSidebar = useMemo(() => {
    if (!bookingSettings) return null;

    return (
      <div className="bg-blue-50 rounded-lg p-4 w-64 h-fit">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Calendar Settings</h3>
          <button
            onClick={handleEditSettingsClick}
            className="bg-green-500 text-white p-1 rounded"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-1">Booking type</div>
            <div className="bg-gray-100 rounded-md p-2 flex items-center">
              <div className="h-5 w-5 bg-black rounded-full flex items-center justify-center mr-2">
                {bookingSettings.bookingType === "group" ? (
                  <Users className="h-3 w-3 text-white" />
                ) : (
                  <User className="h-3 w-3 text-white" />
                )}
              </div>
              <span className="text-sm">
                {bookingSettings.bookingType === "group"
                  ? "Multiple Slots"
                  : "Individual"}
              </span>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-1">Time zone</div>
            <div className="bg-gray-100 rounded-md p-2 text-sm">
              {getConsistentTimezoneLabel(bookingSettings.timezone)}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-1">Slots per session</div>
            <div className="bg-gray-100 rounded-md p-2 text-sm">
              {bookingSettings.bookingType === "group"
                ? bookingSettings.bookingsPerSlot
                : 1}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-1">Available</div>
            <div className="bg-gray-100 rounded-md p-2 text-sm">
              {
                bookingSettings.availability.filter((day) => day.available)
                  .length
              }{" "}
              Days
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-1">Duration</div>
            <div className="bg-gray-100 rounded-md p-2 text-sm">
              {formatTimeLabel(bookingSettings.meetingDuration)}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-1">Buffer</div>
            <div className="bg-gray-100 rounded-md p-2 text-sm">
              {bookingSettings.bufferTime > 0
                ? formatTimeLabel(bookingSettings.bufferTime)
                : "No Buffer"}
            </div>
          </div>

          {bookingSettings.breaks && bookingSettings.breaks.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-1">
                Break
                {bookingSettings.breaks.length > 1 ? "s" : ""}
              </div>
              <div className="space-y-1">
                {bookingSettings.breaks.map((breakItem, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 rounded-md p-2 text-sm"
                  >
                    {formatTime12(breakItem.startTime)} -{" "}
                    {formatTime12(breakItem.endTime)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {bookingSettings.price && (
            <div>
              <div className="text-sm font-medium mb-1">Price</div>
              <div className="bg-gray-100 rounded-md p-2 text-sm">
                {bookingSettings.price.isFree
                  ? "Free"
                  : `${bookingSettings.price.amount} ${globalCurrency}`}
              </div>
            </div>
          )}

          <button
            onClick={handleEditSettingsClick}
            className="w-full mt-4 bg-green-500 hover:bg-green-600 transition-colors text-white py-2 rounded-md text-sm"
          >
            EDIT
          </button>
        </div>
      </div>
    );
  }, [bookingSettings, globalCurrency, handleEditSettingsClick]);

  // IMPROVED: Mobile Calendar Settings Dropdown Component with consistent timezone display
  const MobileCalendarSettingsDropdown = useMemo(() => {
    if (!bookingSettings || !showMobileCalendarSettings) return null;

    return (
      <div className="md:hidden bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-lg">Calendar Settings</h3>
          <button
            onClick={() => setShowMobileCalendarSettings(false)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">Booking type</div>
            <div className="bg-gray-100 rounded-md p-3 flex items-center">
              <div className="h-6 w-6 bg-black rounded-full flex items-center justify-center mr-3">
                {bookingSettings.bookingType === "group" ? (
                  <Users className="h-4 w-4 text-white" />
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
              </div>
              <span className="text-sm">
                {bookingSettings.bookingType === "group"
                  ? "Multiple Slots"
                  : "Individual"}
              </span>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Time zone</div>
            <div className="bg-gray-100 rounded-md p-3 text-sm">
              {getConsistentTimezoneLabel(bookingSettings.timezone)}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Slots per session</div>
            <div className="bg-gray-100 rounded-md p-3 text-sm">
              {bookingSettings.bookingType === "group"
                ? bookingSettings.bookingsPerSlot
                : 1}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Available</div>
            <div className="bg-gray-100 rounded-md p-3 text-sm">
              {
                bookingSettings.availability.filter((day) => day.available)
                  .length
              }{" "}
              Days
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Duration</div>
            <div className="bg-gray-100 rounded-md p-3 text-sm">
              {formatTimeLabel(bookingSettings.meetingDuration)}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Buffer</div>
            <div className="bg-gray-100 rounded-md p-3 text-sm">
              {bookingSettings.bufferTime > 0
                ? formatTimeLabel(bookingSettings.bufferTime)
                : "No Buffer"}
            </div>
          </div>

          {bookingSettings.breaks && bookingSettings.breaks.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">
                Break
                {bookingSettings.breaks.length > 1 ? "s" : ""}
              </div>
              <div className="space-y-2">
                {bookingSettings.breaks.map((breakItem, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 rounded-md p-3 text-sm"
                  >
                    {formatTime12(breakItem.startTime)} -{" "}
                    {formatTime12(breakItem.endTime)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {bookingSettings.price && (
            <div>
              <div className="text-sm font-medium mb-2">Price</div>
              <div className="bg-gray-100 rounded-md p-3 text-sm">
                {bookingSettings.price.isFree
                  ? "Free"
                  : `${
                      CURRENCIES.find(
                        (c) => c.code === bookingSettings.price?.currency
                      )?.symbol || "$"
                    }${bookingSettings.price.amount}`}
              </div>
            </div>
          )}

          <button
            onClick={handleEditSettingsClick}
            className="w-full mt-6 bg-green-500 hover:bg-green-600 transition-colors text-white py-3 rounded-md text-sm font-medium"
          >
            EDIT CALENDAR
          </button>
        </div>
      </div>
    );
  }, [bookingSettings, showMobileCalendarSettings, handleEditSettingsClick]);

  // Pagination Component
  const PaginationComponent = useMemo(() => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
      const pages: (number | string)[] = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white rounded-lg border border-gray-200">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(endIndex, totalMeetings)} of {totalMeetings} meetings
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-500">...</span>
              ) : (
                <button
                  onClick={() => handlePageChange(page as number)}
                  className={`px-3 py-2 rounded-md text-sm ${
                    currentPage === page
                      ? 'bg-black text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }, [totalPages, currentPage, startIndex, endIndex, totalMeetings, handlePageChange]);

  return (
    <div className="flex flex-col md:flex-row p-4 sm:p-6 lg:p-8 gap-6 max-w-7xl mx-auto">
      <div className="flex-1">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Bookings Dashboard</h1>
          </div>
        </div>

        {/* MEETINGS Section with Calendar Icon */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">MEETINGS</h2>
            {/* Calendar Icon with Dropdown - visible on mobile */}
            <button
              onClick={() => setShowMobileCalendarSettings(!showMobileCalendarSettings)}
              className="md:hidden flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Calendar Settings"
            >
              <Calendar className="h-5 w-5 text-gray-600" />
              {showMobileCalendarSettings ? (
                <ChevronUp className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Timezone Change Warning */}
        {filteredMeetings.some(m => m.needsTimezoneConversion) && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-amber-800 mb-1">
                  Timezone Change Detected
                </div>
                <div className="text-amber-700">
                  Some meetings were created in a different timezone. Times shown in{" "}
                  <strong className="text-green-600">green</strong> reflect your current timezone 
                  ({getConsistentTimezoneLabel(businessTimezone)}). Crossed-out times show the original timezone.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Calendar Settings Dropdown */}
        {MobileCalendarSettingsDropdown}

        {/* Tabs and Content - Hidden when calendar settings is open */}
        {!showMobileCalendarSettings && (
          <>
            {/* Tabs - Single line on mobile */}
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`px-3 md:px-4 py-2 rounded-md text-xs md:text-sm font-medium transition-colors ${
                  activeTab === "upcoming"
                    ? "bg-black text-white shadow-sm"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`px-3 md:px-4 py-2 rounded-md text-xs md:text-sm font-medium transition-colors ${
                  activeTab === "past"
                    ? "bg-black text-white shadow-sm"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Past
              </button>
              <button
                onClick={() => setActiveTab("schedule")}
                className={`px-3 md:px-4 py-2 rounded-md text-xs md:text-sm font-medium transition-colors ${
                  activeTab === "schedule"
                    ? "bg-black text-white shadow-sm"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                My Schedule
              </button>
            </div>

            {/* Filters and Meeting Content */}
            {activeTab !== "schedule" && (
              <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowFilterMenu(!showFilterMenu)}
                      className={`flex items-center px-3 py-2 text-sm rounded-md border transition-colors ${
                        filtersApplied
                          ? "bg-blue-100 border-blue-300"
                          : "bg-white border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      {filtersApplied ? "Filters Applied" : "Filter"}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </button>

                    {showFilterMenu && (
                      <div
                        ref={filterMenuRef}
                        className="absolute left-0 top-full mt-1 w-72 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-4"
                      >
                        <h4 className="font-medium mb-3">Filters</h4>

                        <div className="mb-3">
                          <label className="block text-sm font-medium mb-1">
                            Date Range
                          </label>
                          <select
                            value={filters.dateRange}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                dateRange: e.target.value as
                                  | "all"
                                  | "today"
                                  | "week"
                                  | "month",
                              })
                            }
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="all">All Dates</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="block text-sm font-medium mb-1">
                            Location
                          </label>
                          <select
                            value={filters.location || ""}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                location: e.target.value || null,
                              })
                            }
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="">All Locations</option>
                            <option value="google_meet">Google Meet</option>
                            <option value="zoom">Zoom</option>
                            <option value="teams">Microsoft Teams</option>
                            <option value="in_person">In-person</option>
                          </select>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-1">
                            Status
                          </label>
                          <select
                            value={filters.status || ""}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                status: e.target.value || null,
                              })
                            }
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="">All Statuses</option>
                            {activeTab === "upcoming" ? (
                              <option value="confirmed">Confirmed</option>
                            ) : (
                              <option value="completed">Completed</option>
                            )}
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>

                        <div className="flex justify-between">
                          <button
                            onClick={() => {
                              setFilters({
                                location: null,
                                dateRange: "all",
                                status: null,
                              });
                              setFiltersApplied(false);
                            }}
                            className="text-sm text-gray-600 hover:text-gray-800"
                          >
                            Clear All
                          </button>
                          <button
                            onClick={() => {
                              setShowFilterMenu(false);
                              setFiltersApplied(
                                filters.location !== null ||
                                  filters.dateRange !== "all" ||
                                  filters.status !== null
                              );
                            }}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm rounded-md"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {filtersApplied && (
                    <div className="flex flex-wrap gap-2 items-center">
                      {filters.dateRange !== "all" && (
                        <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
                          {filters.dateRange === "today"
                            ? "Today"
                            : filters.dateRange === "week"
                            ? "This Week"
                            : "This Month"}
                          <button
                            onClick={() => {
                              setFilters({ ...filters, dateRange: "all" });
                              setFiltersApplied(
                                filters.location !== null || filters.status !== null
                              );
                            }}
                            className="ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}

                      {filters.location && (
                        <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
                          {filters.location === "google_meet"
                            ? "Google Meet"
                            : filters.location === "zoom"
                            ? "Zoom"
                            : filters.location === "teams"
                            ? "Microsoft Teams"
                            : "In-person"}
                          <button
                            onClick={() => {
                              setFilters({ ...filters, location: null });
                              setFiltersApplied(
                                filters.dateRange !== "all" ||
                                  filters.status !== null
                              );
                            }}
                            className="ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}

                      {filters.status && (
                        <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
                          {filters.status.charAt(0).toUpperCase() +
                            filters.status.slice(1)}
                          <button
                            onClick={() => {
                              setFilters({ ...filters, status: null });
                              setFiltersApplied(
                                filters.dateRange !== "all" ||
                                  filters.location !== null
                              );
                            }}
                            className="ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={refreshMeetings}
                  className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 hover:bg-gray-50 transition-colors rounded-md"
                  title="Refresh meetings"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              </div>
            )}

            {activeTab === "schedule" ? (
              <AvailabilitySchedule activeAgentId={activeAgentId} />
            ) : (
              <div className="bg-gray-100 rounded-lg p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Unable to load meetings
                    </h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                      onClick={() => setRefreshTrigger((prev) => prev + 1)}
                      className="px-4 py-2 bg-black text-white rounded-md text-sm"
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredMeetings.length === 0 && !filtersApplied ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      {activeTab === "upcoming"
                        ? "No Scheduled Meetings"
                        : "No Past Meetings"}
                    </h3>
                    <p className="text-gray-600">
                      {activeTab === "upcoming"
                        ? "When customers book time with you, appointments will appear here."
                        : "Your completed and cancelled meetings will appear here."}
                    </p>
                  </div>
                ) : filteredMeetings.length === 0 && filtersApplied ? (
                  <div className="text-center py-12">
                    <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      No Meetings Match Filters
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your filter settings to see more results.
                    </p>
                    <button
                      onClick={() => {
                        setFilters({
                          location: null,
                          dateRange: "all",
                          status: null,
                        });
                        setFiltersApplied(false);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <div className="text-sm font-medium">
                        {totalMeetings}{" "}
                        {activeTab === "upcoming" ? "Scheduled" : "Completed"}{" "}
                        Meeting{totalMeetings !== 1 ? "s" : ""}
                        {totalPages > 1 && (
                          <span className="text-gray-500 ml-2">
                            (Page {currentPage} of {totalPages})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
                      <div className="w-full">
                        <div className="overflow-x-auto">
                          <div className="min-w-[800px] hidden md:block">
                            {activeTab === "upcoming" ? (
                              <div className="bg-white rounded-lg mb-2 p-3 md:p-4 grid grid-cols-12 gap-2 md:gap-4 font-medium text-sm text-gray-500">
                                <div className="col-span-3">NAME</div>
                                <div className="col-span-2">DATE/TIME</div>
                                <div className="col-span-2">LOCATION</div>
                                <div className="col-span-2">STATUS</div>
                                <div className="col-span-3 text-right">ACTIONS</div>
                              </div>
                            ) : (
                              <div className="bg-white rounded-lg mb-2 p-3 md:p-4 grid grid-cols-12 gap-2 md:gap-4 font-medium text-sm text-gray-500">
                                <div className="col-span-3">NAME</div>
                                <div className="col-span-3">DATE/TIME</div>
                                <div className="col-span-3">LOCATION</div>
                                <div className="col-span-3">STATUS</div>
                              </div>
                            )}

                            {paginatedMeetings.map((meeting) => {
                              // Check if meeting has been rescheduled
                              const hasRescheduledFrom =
                                meeting.rescheduledFrom &&
                                meeting.rescheduledFrom.bookingId !== undefined;

                              const isRescheduled =
                                meeting.isRescheduled || hasRescheduledFrom;
                              const isRescheduledConfirmed =
                                isRescheduled && meeting.status === "confirmed";

                              // Create unique key for this meeting's details state
                              const detailsStateKey = `details_${meeting._id}`;
                              const isDetailsOpen =
                                detailsOpenState[detailsStateKey] || false;

                              return (
                                <React.Fragment key={meeting._id}>
                                  {/* Meeting Row */}
                                  <div
                                    className={`bg-white rounded-lg ${
                                      isDetailsOpen ? "mb-0 rounded-b-none" : "mb-2"
                                    } p-3 md:p-4 hover:shadow-md transition-shadow`}
                                  >
                                    {activeTab === "upcoming" ? (
                                      <div className="grid grid-cols-12 gap-2 md:gap-4 items-center">
                                        <div className="col-span-3">
                                          <div className="text-sm font-medium">
                                            {meeting.name?.split("@")[0] || meeting.userId?.split("@")[0]}
                                          </div>
                                          <div className="text-xs text-gray-500 truncate">
                                            {meeting.userId}
                                          </div>
                                        </div>

                                        <div className="col-span-2">
                                          <div className="text-sm font-medium">
                                            {formatDate(meeting.date)}
                                          </div>
                                          <TimeDisplay meeting={meeting} />
                                        </div>

                                        <div className="col-span-2">
                                          <div className="text-sm font-medium">
                                            {meeting.location === "google_meet" &&
                                              "Google Meet"}
                                            {meeting.location === "zoom" && "Zoom"}
                                            {meeting.location === "teams" &&
                                              "Microsoft Teams"}
                                            {meeting.location === "in_person" &&
                                              "In-person"}
                                          </div>
                                          {/* Only show meeting links if meeting is not cancelled */}
                                          {meeting.status !== "cancelled" &&
                                            meeting.location !== "in_person" &&
                                            meeting.meetingLink && (
                                              <div className="mt-1 flex flex-wrap gap-1">
                                                <a
                                                  href={meeting.meetingLink}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="px-2 py-0.5 text-xs bg-green-500 hover:bg-green-600 transition-colors text-white rounded"
                                                >
                                                  Join Now
                                                </a>

                                                <button
                                                  onClick={() => {
                                                    navigator.clipboard.writeText(
                                                      meeting.meetingLink!
                                                    );
                                                    alert(
                                                      "Meeting link copied to clipboard!"
                                                    );
                                                  }}
                                                  className="px-2 py-0.5 text-xs bg-blue-50 hover:bg-blue-100 transition-colors text-blue-600 rounded"
                                                >
                                                  Copy Link
                                                </button>
                                              </div>
                                            )}
                                        </div>

                                        <div className="col-span-2">
                                          <div className="flex flex-wrap gap-1">
                                            <span
                                              className={`px-2 py-0.5 rounded text-xs ${
                                                meeting.status === "confirmed"
                                                  ? "bg-green-100 text-green-700"
                                                  : meeting.status === "cancelled"
                                                  ? "bg-red-100 text-red-700"
                                                  : "bg-blue-100 text-blue-700"
                                              }`}
                                            >
                                              {meeting.status
                                                .charAt(0)
                                                .toUpperCase() +
                                                meeting.status.slice(1)}
                                            </span>
                                            {isRescheduledConfirmed && (
                                              <span className="px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-700">
                                                Rescheduled
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        <div className="col-span-3 text-right">
                                          {meeting.status === "cancelled" ? (
                                            <div className="flex flex-wrap gap-1 justify-end">
                                              <button
                                                onClick={() =>
                                                  toggleDetailsOpen(detailsStateKey)
                                                }
                                                className="flex items-center justify-center px-4 py-2 text-xs bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 rounded-md w-32"
                                              >
                                                <Info className="h-3 w-3 mr-1" />
                                                Details
                                                {isDetailsOpen ? (
                                                  <ChevronUp className="h-3 w-3 ml-1" />
                                                ) : (
                                                  <ChevronDown className="h-3 w-3 ml-1" />
                                                )}
                                              </button>
                                            </div>
                                          ) : (
                                            <div className="flex flex-wrap gap-1 justify-end">
                                              {meeting.status === "confirmed" && (
                                                <button
                                                  onClick={() =>
                                                    handleSendRescheduleEmail(
                                                      meeting
                                                    )
                                                  }
                                                  disabled={
                                                    sendingEmailId === meeting._id
                                                  }
                                                  className="text-xs bg-blue-100 hover:bg-blue-200 transition-colors text-blue-800 px-4 py-2 rounded-md flex items-center justify-center gap-1 w-32"
                                                >
                                                  {sendingEmailId ===
                                                  meeting._id ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                  ) : (
                                                    <Mail className="h-3 w-3" />
                                                  )}
                                                  Reschedule
                                                </button>
                                              )}

                                              <button
                                                onClick={() =>
                                                  handleCancelBooking(meeting._id)
                                                }
                                                disabled={
                                                  cancellingId === meeting._id
                                                }
                                                className="text-xs bg-red-100 hover:bg-red-200 transition-colors text-red-800 px-4 py-2 rounded-md flex items-center justify-center w-32"
                                              >
                                                {cancellingId === meeting._id ? (
                                                  <Loader2 className="h-3 w-3 animate-spin inline-block" />
                                                ) : (
                                                  "Cancel"
                                                )}
                                              </button>

                                              <button
                                                onClick={() =>
                                                  toggleDetailsOpen(detailsStateKey)
                                                }
                                                className="text-xs flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 rounded-md w-32"
                                              >
                                                <Info className="h-3 w-3 mr-1" />
                                                Details
                                                {isDetailsOpen ? (
                                                  <ChevronUp className="h-3 w-3 ml-1" />
                                                ) : (
                                                  <ChevronDown className="h-3 w-3 ml-1" />
                                                )}
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-12 gap-2 md:gap-4 items-center">
                                        <div className="col-span-3">
                                          <div className="text-sm font-medium">
                                            {meeting.name?.split("@")[0] || meeting.userId?.split("@")[0]}
                                          </div>
                                          <div className="text-xs text-gray-500 truncate">
                                            {meeting.userId}
                                          </div>
                                        </div>

                                        <div className="col-span-3">
                                          <div className="text-sm font-medium">
                                            {formatDate(meeting.date)}
                                          </div>
                                          <TimeDisplay meeting={meeting} />
                                        </div>

                                        <div className="col-span-3">
                                          <div className="text-sm font-medium">
                                            {meeting.location === "google_meet" &&
                                              "Google Meet"}
                                            {meeting.location === "zoom" && "Zoom"}
                                            {meeting.location === "teams" &&
                                              "Microsoft Teams"}
                                            {meeting.location === "in_person" &&
                                              "In-person"}
                                          </div>
                                        </div>

                                        <div className="col-span-3">
                                          <div className="flex flex-wrap gap-1 items-center justify-between">
                                            <span
                                              className={`px-2 py-0.5 rounded-full text-xs w-fit ${
                                                meeting.status === "completed" ||
                                                (activeTab === "past" &&
                                                  meeting.status === "confirmed")
                                                  ? "bg-gray-100 text-gray-800"
                                                  : meeting.status === "cancelled"
                                                  ? "bg-red-100 text-red-800"
                                                  : "bg-blue-100 text-blue-800"
                                              }`}
                                            >
                                              {activeTab === "past" &&
                                              meeting.status === "confirmed"
                                                ? "Completed"
                                                : meeting.status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                  meeting.status.slice(1)}
                                            </span>
                                            {isRescheduledConfirmed && (
                                              <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-800 w-fit">
                                                Rescheduled
                                              </span>
                                            )}

                                            <button
                                              onClick={() =>
                                                toggleDetailsOpen(detailsStateKey)
                                              }
                                              className="flex items-center justify-between px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 transition-colors text-gray-800 rounded"
                                            >
                                              <span className="flex items-center">
                                                <Info className="h-3 w-3 mr-1" />
                                                Details
                                              </span>
                                              {isDetailsOpen ? (
                                                <ChevronUp className="h-3 w-3 ml-1" />
                                              ) : (
                                                <ChevronDown className="h-3 w-3 ml-1" />
                                              )}
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Details Panel - Displayed when isDetailsOpen is true */}
                                  {isDetailsOpen && (
                                    <MeetingDetails
                                      meeting={meeting}
                                      businessTimezone={businessTimezone}
                                      formatDate={formatDate}
                                      formatTime={formatTime}
                                      activeTab={activeTab}
                                    />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>

                          {/* Mobile Meeting Cards */}
                          <div className="md:hidden space-y-3">
                            {paginatedMeetings.map((meeting) => {
                              const hasRescheduledFrom =
                                meeting.rescheduledFrom &&
                                meeting.rescheduledFrom.bookingId !== undefined;

                              const isRescheduled =
                                meeting.isRescheduled || hasRescheduledFrom;
                              const isRescheduledConfirmed =
                                isRescheduled && meeting.status === "confirmed";

                              const detailsStateKey = `details_${meeting._id}`;
                              const isDetailsOpen =
                                detailsOpenState[detailsStateKey] || false;

                              return (
                                <React.Fragment key={meeting._id}>
                                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex-1">
                                        <div className="font-medium text-sm">
                                          {meeting.name?.split("@")[0] || meeting.userId?.split("@")[0]}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          {meeting.userId}
                                        </div>
                                      </div>
                                      <div className="flex flex-wrap gap-1 justify-end items-start">
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs ${
                                            meeting.status === "confirmed"
                                              ? "bg-green-100 text-green-700"
                                              : meeting.status === "cancelled"
                                              ? "bg-red-100 text-red-700"
                                              : activeTab === "past" && meeting.status === "confirmed"
                                              ? "bg-gray-100 text-gray-800"
                                              : "bg-blue-100 text-blue-700"
                                          }`}
                                        >
                                          {activeTab === "past" && meeting.status === "confirmed"
                                            ? "Completed"
                                            : meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                                        </span>
                                        {isRescheduledConfirmed && (
                                          <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                                            Rescheduled
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="space-y-2 mb-3">
                                      <div className="flex items-center text-sm">
                                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                        <div>
                                          <div>{formatDate(meeting.date)}</div>
                                          <TimeDisplay meeting={meeting} />
                                        </div>
                                      </div>

                                      <div className="flex items-center text-sm">
                                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                        <span>
                                          {meeting.location === "google_meet" && "Google Meet"}
                                          {meeting.location === "zoom" && "Zoom"}
                                          {meeting.location === "teams" && "Microsoft Teams"}
                                          {meeting.location === "in_person" && "In-person"}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Mobile Action Buttons */}
                                    {activeTab === "upcoming" && (
                                      <div className="flex flex-wrap gap-2 mb-3">
                                        {meeting.status !== "cancelled" && meeting.location !== "in_person" && meeting.meetingLink && (
                                          <>
                                            <a
                                              href={meeting.meetingLink}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex-1 px-3 py-2 text-xs bg-green-500 hover:bg-green-600 transition-colors text-white rounded text-center"
                                            >
                                              Join Now
                                            </a>
                                            <button
                                              onClick={() => {
                                                navigator.clipboard.writeText(meeting.meetingLink!);
                                                alert("Meeting link copied to clipboard!");
                                              }}
                                              className="px-3 py-2 text-xs bg-blue-50 hover:bg-blue-100 transition-colors text-blue-600 rounded"
                                            >
                                              Copy Link
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    )}

                                    <div className="flex flex-wrap gap-2">
                                      {activeTab === "upcoming" && meeting.status !== "cancelled" && (
                                        <>
                                          {meeting.status === "confirmed" && (
                                            <button
                                              onClick={() => handleSendRescheduleEmail(meeting)}
                                              disabled={sendingEmailId === meeting._id}
                                              className="flex-1 text-xs bg-blue-100 hover:bg-blue-200 transition-colors text-blue-800 px-3 py-2 rounded flex items-center justify-center gap-1"
                                            >
                                              {sendingEmailId === meeting._id ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                              ) : (
                                                <Mail className="h-3 w-3" />
                                              )}
                                              Reschedule
                                            </button>
                                          )}

                                          <button
                                            onClick={() => handleCancelBooking(meeting._id)}
                                            disabled={cancellingId === meeting._id}
                                            className="flex-1 text-xs bg-red-100 hover:bg-red-200 transition-colors text-red-800 px-3 py-2 rounded flex items-center justify-center"
                                          >
                                            {cancellingId === meeting._id ? (
                                              <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                              "Cancel"
                                            )}
                                          </button>
                                        </>
                                      )}

                                      <button
                                        onClick={() => toggleDetailsOpen(detailsStateKey)}
                                        className="flex-1 text-xs flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 rounded"
                                      >
                                        <Info className="h-3 w-3 mr-1" />
                                        Details
                                        {isDetailsOpen ? (
                                          <ChevronUp className="h-3 w-3 ml-1" />
                                        ) : (
                                          <ChevronDown className="h-3 w-3 ml-1" />
                                        )}
                                      </button>
                                    </div>
                                  </div>

                                  {/* Mobile Details Panel */}
                                  {isDetailsOpen && (
                                    <MeetingDetails
                                      meeting={meeting}
                                      businessTimezone={businessTimezone}
                                      formatDate={formatDate}
                                      formatTime={formatTime}
                                      activeTab={activeTab}
                                    />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pagination */}
                    {PaginationComponent}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Desktop Calendar Settings Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        {CalendarSettingsSidebar}
      </div>
    </div>
  );
};

export default BookingDashboard;