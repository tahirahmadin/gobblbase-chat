import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  Settings,
  Edit,
  Trash2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
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
  Globe,
  Link as LinkIcon
} from "lucide-react";
import { useBotConfig } from "../../../store/useBotConfig";
import {
  getAppointmentSettings,
  getBookings,
  cancelBooking,
  updateUnavailableDates,
} from "../../../lib/serverActions";
import { AvailabilityDay } from "./Booking";

// Format time for display
const formatTime12 = (t24) => {
  const [h, m] = t24.split(":").map((x) => parseInt(x, 10));
  const suffix = h >= 12 ? "pm" : "am";
  const hr12 = h % 12 === 0 ? 12 : h % 12;
  return `${hr12}:${m.toString().padStart(2, "0")}${suffix}`;
};

// Format timezone for display
const formatTimezone = (tz) => {
  try {
    const date = new Date();
    const options = {
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

// Calendar component for Schedule view
const AvailabilitySchedule = ({ activeAgentId }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [scheduleDays, setScheduleDays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [userTimezone, setUserTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [workingHours, setWorkingHours] = useState({ start: "09:00", end: "17:00" });
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [scheduledSlots, setScheduledSlots] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const formatDateForApi = (d) => {
    const day = d.getDate().toString().padStart(2, "0");
    const months = [
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
    return `${day}-${months[d.getMonth()]}-${d.getFullYear()}`;
  };

  const formatMonthYear = (d) =>
    new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
      d
    ).toUpperCase();

  const getSelectedDayFormatted = () => {
    if (!selectedDay) return "";
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(selectedDay.dateObj);
  };

  const loadScheduleData = async () => {
    if (!activeAgentId) return;
    setIsLoading(true);
    try {
      // Get appointment settings
      const settings = await getAppointmentSettings(activeAgentId);
      const unavailableDatesData = settings.unavailableDates || [];
      const weekly = settings.availability;

      // If settings has a timezone, use it as the business timezone
      if (settings.timezone) {
        setUserTimezone(settings.timezone);
      }

      // Fetch bookings for the current month
      const bookings = await getBookings(activeAgentId);
      
      // Organize bookings by date
      const bookingsByDate = {};
      if (bookings && bookings.length > 0) {
        bookings.forEach(booking => {
          // Format date to match our date format
          if (booking.status === 'cancelled') return;
          
          const bookingDate = new Date(booking.date);
          const apiDate = formatDateForApi(bookingDate);
          
          if (!bookingsByDate[apiDate]) {
            bookingsByDate[apiDate] = [];
          }
          
          bookingsByDate[apiDate].push({
            time: `${formatTime12(booking.startTime)} - ${formatTime12(booking.endTime)}`,
            name: booking.name.split('@')[0] || "Guest",
            email: booking.userId || "guest@example.com"
          });
        });
      }

      const days = [];
      const startOfCalendar = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
      );
      const totalCells = 35; // 5 rows x 7 days
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < totalCells; i++) {
        const dateObj = new Date(startOfCalendar);
        dateObj.setDate(startOfCalendar.getDate() + i);
        const apiDate = formatDateForApi(dateObj);

        // Use the business timezone for determining day of week
        const dayName = new Intl.DateTimeFormat("en-US", {
          weekday: "long",
          timeZone: settings.timezone || userTimezone,
        }).format(dateObj);

        const rule = weekly.find((w) => w.day === dayName);

        let available = true;
        let timeSlot = "9:00am - 5:00pm";
        let startTime = "09:00";
        let endTime = "17:00";
        let isApiUnavailable = false;
        let allDay = false;

        // Apply weekly rule if exists
        if (rule) {
          if (rule.available && rule.timeSlots && rule.timeSlots.length > 0) {
            const slot = rule.timeSlots[0];
            startTime = slot.startTime;
            endTime = slot.endTime;
            timeSlot = `${formatTime12(startTime)} - ${formatTime12(endTime)}`;
          } else {
            available = false;
            isApiUnavailable = true;
          }
        }

        // Override with date-specific unavailability if exists
        const unavailableData = unavailableDatesData.find(
          (item) => item.date === apiDate
        );

        if (unavailableData) {
          allDay = !!unavailableData.allDay;
          available = !allDay;

          if (unavailableData.startTime && unavailableData.endTime) {
            startTime = unavailableData.startTime;
            endTime = unavailableData.endTime;
            timeSlot = `${formatTime12(startTime)} - ${formatTime12(endTime)}`;
          }
        }

        const isPast = dateObj < today;
        const isToday = dateObj.toDateString() === today.toDateString();
        
        // Check if this date has bookings
        const hasBookings = bookingsByDate[apiDate] && bookingsByDate[apiDate].length > 0;

        days.push({
          apiDate,
          dateObj,
          formattedDate: new Intl.DateTimeFormat("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }).format(dateObj),
          available,
          timeSlot,
          isApiUnavailable,
          isDisabled: isPast || isApiUnavailable,
          hasCustomHours: (unavailableData && !allDay) || false,
          isModified: false,
          originalTimeSlot: timeSlot,
          originalAvailable: available,
          allDay: allDay,
          startTime,
          endTime,
          isToday,
          hasBookings,
          bookings: bookingsByDate[apiDate] || []
        });
      }

      setScheduleDays(days);
      
      // If a day is already selected, update its data
      if (selectedDay) {
        const updatedSelectedDay = days.find(
          (day) => day.apiDate === selectedDay.apiDate
        );
        if (updatedSelectedDay) {
          setSelectedDay(updatedSelectedDay);
          setWorkingHours({
            start: updatedSelectedDay.startTime,
            end: updatedSelectedDay.endTime
          });
          setScheduledSlots(updatedSelectedDay.bookings || []);
        }
      }
    } catch (e) {
      console.error("Error loading schedule data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScheduleData();
  }, [activeAgentId, currentMonth]);

  useEffect(() => {
    // Update scheduled slots when a day is selected
    if (selectedDay) {
      setScheduledSlots(selectedDay.bookings || []);
      setWorkingHours({
        start: selectedDay.startTime,
        end: selectedDay.endTime
      });
    }
  }, [selectedDay]);

  const prevMonth = () => {
    setCurrentMonth((m) => {
      const newDate = new Date(m.getFullYear(), m.getMonth() - 1, 1);
      return newDate;
    });
  };
  
  const nextMonth = () => {
    setCurrentMonth((m) => {
      const newDate = new Date(m.getFullYear(), m.getMonth() + 1, 1);
      return newDate;
    });
  };

  const getCalendarDays = () => {
    const cells = [];
    const year = currentMonth.getFullYear();
    const mo = currentMonth.getMonth();
    const firstDow = new Date(year, mo, 1).getDay();
    const daysInCurrentMonth = new Date(year, mo + 1, 0).getDate();
    
    const mondayFirstDow = firstDow === 0 ? 6 : firstDow - 1;
    
    for (let i = 0; i < mondayFirstDow; i++) {
      cells.push({ empty: true });
    }
    
    // Add days of the month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateObj = new Date(year, mo, d);
      const apiDate = formatDateForApi(dateObj);
      const dayData = scheduleDays.find((s) => s.apiDate === apiDate);
      
      if (dayData) {
        cells.push({ 
          ...dayData, 
          empty: false, 
          dayNum: d,
          isSelected: selectedDay?.apiDate === apiDate 
        });
      } else {
        cells.push({ 
          empty: false, 
          dayNum: d, 
          isDisabled: true,
          isSelected: false
        });
      }
    }
    
    return cells;
  };

  const handleDayClick = (day) => {
    if (day.isDisabled) return;
    setSelectedDay(day);
    setSelectedDate(day.dateObj);
    setWorkingHours({
      start: day.startTime,
      end: day.endTime
    });
    setScheduledSlots(day.bookings || []);
  };

  const handleEditHours = () => {
    setIsEditingHours(true);
  };

  const handleSaveHours = () => {
    setIsEditingHours(false);
    
    // Update the working hours for the selected day
    if (selectedDay) {
      setScheduleDays(prev => 
        prev.map(day => {
          if (day.apiDate === selectedDay.apiDate) {
            return {
              ...day,
              startTime: workingHours.start,
              endTime: workingHours.end,
              timeSlot: `${formatTime12(workingHours.start)} - ${formatTime12(workingHours.end)}`,
              isModified: true,
              hasCustomHours: true
            };
          }
          return day;
        })
      );
      
      // Update the selected day
      setSelectedDay(prev => {
        if (prev) {
          return {
            ...prev,
            startTime: workingHours.start,
            endTime: workingHours.end,
            timeSlot: `${formatTime12(workingHours.start)} - ${formatTime12(workingHours.end)}`,
            isModified: true,
            hasCustomHours: true
          };
        }
        return prev;
      });
    }
  };
  
  const toggleDayAvailability = () => {
    if (!selectedDay) return;
    
    setScheduleDays(prev => 
      prev.map(day => {
        if (day.apiDate === selectedDay.apiDate) {
          const newAvailable = !day.available;
          return {
            ...day,
            available: newAvailable,
            allDay: !newAvailable,
            isModified: true
          };
        }
        return day;
      })
    );
    
    // Update the selected day
    setSelectedDay(prev => {
      if (prev) {
        const newAvailable = !prev.available;
        return {
          ...prev,
          available: newAvailable,
          allDay: !newAvailable,
          isModified: true
        };
      }
      return prev;
    });
  };
  
  const saveChanges = async () => {
    if (!activeAgentId) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      // Separate dates into two categories
      const unavailableDatesToUpdate = [];
      const datesToMakeAvailable = [];
      
      scheduleDays
        .filter((d) => d.isModified)
        .forEach((d) => {
          if (d.available) {
            // If the day is being made available, add to datesToMakeAvailable
            datesToMakeAvailable.push(d.apiDate);
          } else {
            // If the day is being made unavailable or has custom hours
            unavailableDatesToUpdate.push({
              date: d.apiDate,
              startTime: d.startTime,
              endTime: d.endTime,
              allDay: !d.available || d.allDay,
              timezone: userTimezone,
            });
          }
        });
  
      // Call the updated API with both parameters
      await updateUnavailableDates(
        activeAgentId, 
        unavailableDatesToUpdate,
        datesToMakeAvailable
      );
      
      setSaveSuccess(true);
      await loadScheduleData();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError("Failed to update your schedule. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-gray-400 animate-spin mr-3" />
        <span className="text-gray-600 font-medium">
          Loading your schedule...
        </span>
      </div>
    );
  }

  return (
    <div>
      {/* Header with save button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">My Schedule</h2>
        <button
          onClick={saveChanges}
          disabled={isSaving}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isSaving
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="inline-block h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : "Save Changes"}
        </button>
      </div>
      
      {/* Success/Error messages */}
      {saveSuccess && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-3 rounded flex items-center mb-4">
          <Check className="h-5 w-5 mr-2 text-green-500" />
          Schedule updated successfully!
        </div>
      )}
      {saveError && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded flex items-center mb-4">
          <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
          {saveError}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-6">
        {/* Left side - Calendar */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">Select Day</span>
            <span className="text-xs text-gray-500">Timezone: {formatTimezone(userTimezone)}</span>
          </div>
          
          <div className="flex justify-between items-center mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg">
            <button onClick={prevMonth} className="text-white p-1 rounded-full hover:bg-blue-700">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-medium">{formatMonthYear(currentMonth)}</span>
            <button onClick={nextMonth} className="text-white p-1 rounded-full hover:bg-blue-700">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
              <div key={day} className="text-center text-xs font-medium py-1">{day}</div>
            ))}
            
            {getCalendarDays().map((day, index) => (
              <div 
                key={index} 
                onClick={() => day.empty ? null : handleDayClick(day)}
                className={`${day.empty ? 'invisible' : 
                  day.isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'} 
                  text-center p-1`}
              >
                {!day.empty && (
                  <div 
                    className={`aspect-square flex justify-center items-center rounded-full
                      ${day.isDisabled ? 'bg-gray-200 text-gray-500' :
                        day.isSelected ? 'bg-blue-600 text-white' : 
                        day.isToday ? 'border border-blue-500' : 
                        day.allDay ? 'bg-red-100' : 
                        day.hasBookings ? 'bg-green-200' : 'hover:bg-gray-100'}`}
                  >
                    {day.dayNum}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-gray-500 grid grid-cols-2 gap-2">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-200 rounded-full mr-2"></div>
              <span>Has bookings</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 rounded-full mr-2"></div>
              <span>Unavailable</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 border border-blue-500 rounded-full mr-2"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
              <span>Past date</span>
            </div>
          </div>
        </div>
        
        {/* Right side - Selected day details */}
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          {selectedDay ? (
            <div>
              <h3 className="font-medium mb-4">{getSelectedDayFormatted()}</h3>
              
              {/* Availability toggle */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedDay.available ? "Available" : "Unavailable"}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDay.available}
                      onChange={toggleDayAvailability}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full peer ${
                      selectedDay.available ? "bg-green-500" : "bg-gray-200"
                    }`}>
                      <div
                        className={`absolute w-4 h-4 rounded-full bg-white transition-all ${
                          selectedDay.available ? "right-1" : "left-1"
                        } top-1`}
                      ></div>
                    </div>
                  </label>
                </div>
              </div>
              
              {selectedDay.available && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Working Hours</span>
                    {isEditingHours ? (
                      <button 
                        onClick={handleSaveHours}
                        className="text-xs bg-green-500 text-white px-3 py-1 rounded-md"
                      >
                        Save
                      </button>
                    ) : (
                      <button 
                        onClick={handleEditHours}
                        className="text-xs bg-green-500 text-white px-3 py-1 rounded-md"
                      >
                        EDIT HOURS
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isEditingHours ? (
                      <>
                        <select 
                          value={workingHours.start}
                          onChange={(e) => setWorkingHours({...workingHours, start: e.target.value})}
                          className="border border-gray-300 rounded-md p-1 text-sm"
                        >
                          {Array.from({ length: 24 }).map((_, i) => (
                            <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                              {`${i.toString().padStart(2, '0')}:00`}
                            </option>
                          ))}
                        </select>
                        
                        <span>—</span>
                        
                        <select 
                          value={workingHours.end}
                          onChange={(e) => setWorkingHours({...workingHours, end: e.target.value})}
                          className="border border-gray-300 rounded-md p-1 text-sm"
                        >
                          {Array.from({ length: 24 }).map((_, i) => (
                            <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                              {`${i.toString().padStart(2, '0')}:00`}
                            </option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <>
                        <div className="border border-gray-300 rounded-md px-3 py-1">{workingHours.start}</div>
                        <span>—</span>
                        <div className="border border-gray-300 rounded-md px-3 py-1">{workingHours.end}</div>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* Display booked slots if available */}
              {scheduledSlots.length > 0 ? (
                <div className="mt-6">
                  <div className="grid grid-cols-3 gap-2 mb-2 border-b pb-2">
                    <div className="text-xs font-medium">Booked Slots</div>
                    <div className="text-xs font-medium">Guest Name</div>
                    <div className="text-xs font-medium">Guest Email</div>
                  </div>
                  
                  {scheduledSlots.map((slot, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 py-1">
                      <div className="text-xs bg-green-100 px-2 py-1 rounded">{slot.time}</div>
                      <div className="text-xs">{slot.name}</div>
                      <div className="text-xs truncate">{slot.email}</div>
                    </div>
                  ))}
                </div>
              ) : selectedDay.available ? (
                <div className="mt-6 p-4 bg-gray-50 rounded text-center text-sm text-gray-500">
                  No bookings for this day
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Calendar className="h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Select a date to view your schedule</h3>
              <p className="text-sm text-gray-500">Click on a date from the calendar to see your appointments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilitySchedule;