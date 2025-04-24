import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Clock,
  Users,
  Settings,
  Edit,
  Trash2,
  ArrowLeft,
  Filter,
  ChevronDown,
  User,
  Video,
  MapPin,
  Loader2,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  Globe
} from "lucide-react";
import { useBotConfig } from "../../store/useBotConfig";
import { getAppointmentSettings, getBookings, cancelBooking } from "../../lib/serverActions";
import { AvailabilityDay } from "./Booking";
import AvailabilitySchedule from "./AvailabilitySchedule";

interface Meeting {
  _id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  statusLabel: string;
  location: string;
  meetingLink?: string;
  userTimezone?: string; // Add user timezone field
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
  lunchBreak: { start: string; end: string };
  availability: AvailabilityDay[];
  locations: string[];
  timezone: string; // Add timezone field
}

interface FilterOptions {
  location: string | null;
  dateRange: 'all' | 'today' | 'week' | 'month';
  status: string | null;
}

// Function to format time for display
const formatTimeLabel = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }
  
  return `${hours} ${hours === 1 ? "hour" : "hours"} ${remainingMinutes} minutes`;
};

// Format timezone for display
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

const BookingDashboard: React.FC<BookingDashboardProps> = ({ onEditSettings, agentId: propAgentId }) => {
  const { activeBotData, activeBotId } = useBotConfig();
  const activeAgentId = propAgentId || activeBotId || activeBotData?.agentId;
  useEffect(() => {
    console.log("BookingDashboard - Using agent ID:", activeAgentId);
    console.log("BookingDashboard - Prop agent ID:", propAgentId);
    console.log("BookingDashboard - Store activeBotId:", activeBotId);
  }, [activeAgentId, propAgentId, activeBotId]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "settings" | "schedule">("upcoming");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingSettings, setBookingSettings] = useState<BookingSettings | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Filter states
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    location: null,
    dateRange: 'all',
    status: null
  });
  const [filtersApplied, setFiltersApplied] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  
  // Get business timezone
  const [businessTimezone, setBusinessTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  
  // Fetch booking settings from API
  useEffect(() => {
    const fetchBookingSettings = async () => {
      if (!activeAgentId) return;
      
      try {
        const settings = await getAppointmentSettings(activeAgentId);
        setBookingSettings(settings);
        
        // Set business timezone from settings
        if (settings && settings.timezone) {
          setBusinessTimezone(settings.timezone);
        }
      } catch (error) {
        console.error("Error fetching booking settings:", error);
      }
    };
    
    fetchBookingSettings();
  }, [activeAgentId]);

  // Fetch meetings from API
  useEffect(() => {
    const fetchMeetings = async () => {
      if (!activeAgentId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const bookings = await getBookings(activeAgentId);
        setMeetings(bookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError("Failed to load bookings. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMeetings();
  }, [activeAgentId, refreshTrigger]);

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    
    setCancellingId(bookingId);
    
    try {
      await cancelBooking(bookingId);
      // Refresh the bookings list
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Format time for display
  const fmtTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ap = h < 12 ? "AM" : "PM";
    const hr = h % 12 === 0 ? 12 : h % 12;
    return `${hr}:${m.toString().padStart(2, "0")} ${ap}`;
  };

  // Check if a meeting is within the selected date range
  const isWithinDateRange = (meeting: Meeting) => {
    const meetingDate = new Date(meeting.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (filters.dateRange) {
      case 'today':
        return meetingDate.toDateString() === today.toDateString();
      
      case 'week': {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return meetingDate >= weekAgo;
      }
      
      case 'month': {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return meetingDate >= monthAgo;
      }
      
      default:
        return true;
    }
  };

  // Apply filters to meetings
  const applyFilters = (meeting: Meeting) => {
    // Filter by location
    if (filters.location && meeting.location !== filters.location) {
      return false;
    }
    
    // Filter by date range
    if (!isWithinDateRange(meeting)) {
      return false;
    }
    
    // Filter by status
    if (filters.status && meeting.status !== filters.status) {
      return false;
    }
    
    return true;
  };

  // Filter meetings based on active tab and applied filters
  const filteredMeetings = meetings.filter(meeting => {
    // First filter by tab
    if (activeTab === "upcoming") {
      if (meeting.statusLabel !== "upcoming") return false;
    } else {
      if (meeting.statusLabel === "upcoming") return false;
    }
    
    // Then apply additional filters if enabled
    if (filtersApplied) {
      return applyFilters(meeting);
    }
    
    return true;
  });

  // Apply the current filter settings
  const handleApplyFilters = () => {
    setFiltersApplied(true);
    setShowFilterMenu(false);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      location: null,
      dateRange: 'all',
      status: null
    });
    setFiltersApplied(false);
    setShowFilterMenu(false);
  };

  // Handle edit settings button click
  const handleEditSettingsClick = () => {
    if (onEditSettings) {
      onEditSettings();
    }
  };

  // Calculate duration in minutes
  const calculateDuration = (startTime: string, endTime: string) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    return endMinutes - startMinutes;
  };

  // Format duration for display
  const formatDuration = (durationMinutes: number) => {
    if (durationMinutes < 60) {
      return `${durationMinutes} min`;
    } else {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
    }
  };

  // Refresh bookings
  const refreshBookings = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Render meeting list
  const renderMeetingList = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-gray-500 animate-spin mr-3" />
          <span className="text-gray-600 font-medium">Loading bookings...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Failed to load bookings</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshBookings}
            className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      );
    }

    if (filteredMeetings.length === 0) {
      return (
        <div className="text-center py-12 px-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-1">
            {filtersApplied 
              ? "No meetings match your filters" 
              : `No meetings ${activeTab === "upcoming" ? "scheduled" : "found"}`}
          </h3>
          <p className="text-gray-500">
            {filtersApplied 
              ? (
                <button 
                  onClick={handleResetFilters}
                  className="text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              )
              : activeTab === "upcoming" 
                ? "When customers book time with you, their appointments will appear here."
                : "Past meetings will appear here once you've had some appointments."}
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMeetings.map((meeting) => {
                const durationMinutes = calculateDuration(meeting.startTime, meeting.endTime);
                
                return (
                  <tr key={meeting._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{meeting.userId.split('@')[0]}</div>
                          <div className="text-sm text-gray-500">{meeting.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(meeting.date)}</div>
                      <div className="flex items-center text-sm text-gray-500">
                        {fmtTime(meeting.startTime)} - {fmtTime(meeting.endTime)}
                        {meeting.userTimezone && meeting.userTimezone !== businessTimezone && (
                          <div className="ml-2 flex items-center" title={`Customer timezone: ${meeting.userTimezone}`}>
                            <Globe className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs">{formatTimezone(meeting.userTimezone)}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDuration(durationMinutes)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {meeting.location === "google_meet" ? (
                          <>
                            <Video className="h-4 w-4 text-gray-400 mr-2" />
                            <span>Google Meet</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                            <span>In-person</span>
                          </>
                        )}
                      </div>
                      {meeting.location === "google_meet" && meeting.meetingLink && (
                        <a
                          href={meeting.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs mt-1 inline-block"
                        >
                          Meeting link
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        meeting.statusLabel === "upcoming"
                          ? "bg-blue-100 text-blue-800"
                          : meeting.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {meeting.statusLabel === "upcoming" && (
                          <button
                            onClick={() => handleCancelBooking(meeting._id)}
                            disabled={cancellingId === meeting._id}
                            className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center"
                          >
                            {cancellingId === meeting._id ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                            )}
                            Cancel
                          </button>
                        )}
                        {meeting.statusLabel !== "upcoming" && (
                          <span className="text-gray-400">
                            {meeting.status === "cancelled" ? "Cancelled" : "Completed"}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-4 sm:mb-0">
          <Calendar className="h-6 w-6 text-gray-700" />
          <h1 className="text-2xl font-semibold text-gray-800">Booking Dashboard</h1>
          <div className="ml-2 flex items-center px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">
            <Globe className="h-3 w-3 text-gray-400 mr-1" />
            {formatTimezone(businessTimezone)}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={refreshBookings}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          
          <button
            onClick={handleEditSettingsClick}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <Settings className="h-4 w-4 mr-2" />
            Edit Booking Settings
          </button>
          
          <a
            href={`/book/${activeAgentId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none"
          >
            <Calendar className="h-4 w-4 mr-2" />
            View Booking Page
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex overflow-x-auto">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${
              activeTab === "upcoming"
                ? "border-b-2 border-gray-800 text-gray-800"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Upcoming Meetings
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${
              activeTab === "past"
                ? "border-b-2 border-gray-800 text-gray-800"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Past Meetings
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${
              activeTab === "schedule"
                ? "border-b-2 border-gray-800 text-gray-800"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            My Schedule
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${
              activeTab === "settings"
                ? "border-b-2 border-gray-800 text-gray-800"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Booking Settings
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      {(activeTab === "upcoming" || activeTab === "past") && (
        <div>
          {/* Filters */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-500">
              {filteredMeetings.length} {filteredMeetings.length === 1 ? "meeting" : "meetings"} {activeTab === "upcoming" ? "scheduled" : "completed"}
              {filtersApplied && (
                <button 
                  onClick={handleResetFilters}
                  className="ml-2 text-blue-600 hover:underline text-xs"
                >
                  Clear filters
                </button>
              )}
            </div>
            
            <div className="relative" ref={filterMenuRef}>
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`inline-flex items-center px-3 py-2 border ${filtersApplied ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-white'} shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none`}
              >
                <Filter className={`h-4 w-4 mr-2 ${filtersApplied ? 'text-blue-500' : 'text-gray-500'}`} />
                Filter
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="p-4">
                    <h3 className="font-medium text-gray-800 mb-3">Filter By</h3>
                    
                    {/* Location filter */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="location-all"
                            name="location"
                            checked={filters.location === null}
                            onChange={() => setFilters(prev => ({ ...prev, location: null }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="location-all" className="ml-2 block text-sm text-gray-700">All locations</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="location-online"
                            name="location"
                            checked={filters.location === "google_meet"}
                            onChange={() => setFilters(prev => ({ ...prev, location: "google_meet" }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="location-online" className="ml-2 block text-sm text-gray-700">Google Meet</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="location-inperson"
                            name="location"
                            checked={filters.location === "in_person"}
                            onChange={() => setFilters(prev => ({ ...prev, location: "in_person" }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="location-inperson" className="ml-2 block text-sm text-gray-700">In-person</label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Date range filter */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="date-all"
                            name="date-range"
                            checked={filters.dateRange === 'all'}
                            onChange={() => setFilters(prev => ({ ...prev, dateRange: 'all' }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="date-all" className="ml-2 block text-sm text-gray-700">All dates</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="date-today"
                            name="date-range"
                            checked={filters.dateRange === 'today'}
                            onChange={() => setFilters(prev => ({ ...prev, dateRange: 'today' }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="date-today" className="ml-2 block text-sm text-gray-700">Today</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="date-week"
                            name="date-range"
                            checked={filters.dateRange === 'week'}
                            onChange={() => setFilters(prev => ({ ...prev, dateRange: 'week' }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="date-week" className="ml-2 block text-sm text-gray-700">Last 7 days</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="date-month"
                            name="date-range"
                            checked={filters.dateRange === 'month'}
                            onChange={() => setFilters(prev => ({ ...prev, dateRange: 'month' }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="date-month" className="ml-2 block text-sm text-gray-700">Last 30 days</label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status filter (for past meetings) */}
                    {activeTab === "past" && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="status-all"
                              name="status"
                              checked={filters.status === null}
                              onChange={() => setFilters(prev => ({ ...prev, status: null }))}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="status-all" className="ml-2 block text-sm text-gray-700">All</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="status-completed"
                              name="status"
                              checked={filters.status === "confirmed"}
                              onChange={() => setFilters(prev => ({ ...prev, status: "confirmed" }))}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="status-completed" className="ml-2 block text-sm text-gray-700">Completed</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="status-cancelled"
                              name="status"
                              checked={filters.status === "cancelled"}
                              onChange={() => setFilters(prev => ({ ...prev, status: "cancelled" }))}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="status-cancelled" className="ml-2 block text-sm text-gray-700">Cancelled</label>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Filter actions */}
                    <div className="flex justify-between pt-3 border-t border-gray-200 mt-3">
                      <button
                        onClick={handleResetFilters}
                        className="text-gray-600 text-sm hover:text-gray-800"
                      >
                        Reset
                      </button>
                      <button
                        onClick={handleApplyFilters}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 focus:outline-none"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Meetings list */}
          {renderMeetingList()}
        </div>
      )}

      {activeTab === "schedule" && (
        <AvailabilitySchedule />
      )}

      {activeTab === "settings" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {isLoading || !bookingSettings ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500 mr-3" />
              <span className="text-gray-600 font-medium">Loading settings...</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium">Booking Configuration</h2>
                <button
                  onClick={handleEditSettingsClick}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Settings
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 flex items-center mb-3">
                    <Users className="h-5 w-5 mr-2 text-gray-500" />
                    Booking Type
                  </h3>
                  <p className="text-gray-600">{bookingSettings.bookingType === "group" ? "Team" : "Individual"}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {bookingSettings.bookingType === "group" 
                      ? `${bookingSettings.bookingsPerSlot} bookings per time slot` 
                      : "One booking per time slot"}
                  </p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 flex items-center mb-3">
                    <Clock className="h-5 w-5 mr-2 text-gray-500" />
                    Meeting Duration
                  </h3>
                  <p className="text-gray-600">
                    {formatTimeLabel(bookingSettings.meetingDuration)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Buffer time: {formatTimeLabel(bookingSettings.bufferTime)}
                  </p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 flex items-center mb-3">
                    <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                    Availability
                  </h3>
                  <p className="text-gray-600">
                    {bookingSettings.availability
                      .filter((day) => day.available)
                      .map((day) => day.day)
                      .join(", ")}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {`Lunch break: ${bookingSettings.lunchBreak.start} - ${bookingSettings.lunchBreak.end}`}
                  </p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 flex items-center mb-3">
                    <Globe className="h-5 w-5 mr-2 text-gray-500" />
                    Timezone & Locations
                  </h3>
                  <p className="text-gray-600 flex items-center mb-2">
                    <span className="mr-1">Timezone:</span> {formatTimezone(bookingSettings.timezone || businessTimezone)}
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700">Meeting Locations:</p>
                    {bookingSettings.locations.map((locId) => (
                      <p key={locId} className="text-sm text-gray-600 flex items-center">
                        {locId === "google_meet" ? (
                          <>
                            <Video className="h-4 w-4 mr-2 text-gray-400" />
                            Google Meet
                          </>
                        ) : (
                          <>
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            In-person
                          </>
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingDashboard;