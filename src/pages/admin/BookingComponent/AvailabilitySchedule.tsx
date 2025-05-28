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
  Link as LinkIcon,
  Plus
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
  const [workingHours, setWorkingHours] = useState([{ start: "09:00", end: "17:00" }]);
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [scheduledSlots, setScheduledSlots] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [weeklyAvailability, setWeeklyAvailability] = useState([]);
  
  // Mobile responsive state
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  
  // FIXED: Add meeting duration state
  const [meetingDuration, setMeetingDuration] = useState(30);
  const [bufferTime, setBufferTime] = useState(10);

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

  // FIXED: Helper function to generate time options based on meeting duration
  const generateTimeOptions = (startHour = 0, endHour = 24) => {
    const times = [];
    const increment = meetingDuration >= 60 ? 60 : meetingDuration;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += increment) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        times.push(timeString);
      }
    }
    
    return times;
  };

  // Helper function to get time slots for a specific day
  const getTimeSlotsForDay = (dayName, weeklyRules) => {
    const rule = weeklyRules.find((w) => w.day === dayName);
    if (rule && rule.available && rule.timeSlots && rule.timeSlots.length > 0) {
      return rule.timeSlots.map(slot => ({
        start: slot.startTime,
        end: slot.endTime
      }));
    }
    return [{ start: "09:00", end: "17:00" }]; // Default fallback
  };

  // Helper function to format multiple time slots for display
  const formatTimeSlots = (timeSlots) => {
    if (!timeSlots || timeSlots.length === 0) {
      return "9:00am - 5:00pm";
    }
    return timeSlots.map(slot => 
      `${formatTime12(slot.start)} - ${formatTime12(slot.end)}`
    ).join(", ");
  };

  const loadScheduleData = async () => {
    if (!activeAgentId) return;
    setIsLoading(true);
    try {
      // Get appointment settings
      const settings = await getAppointmentSettings(activeAgentId);
      const unavailableDatesData = settings.unavailableDates || [];
      const weekly = settings.availability || [];
  
      console.log("📥 Loaded settings with unavailable dates:", unavailableDatesData);
      console.log("📥 Settings object:", settings);
  
      // FIXED: Load meeting duration and buffer time
      if (settings.meetingDuration) {
        setMeetingDuration(settings.meetingDuration);
      }
      if (settings.bufferTime !== undefined) {
        setBufferTime(settings.bufferTime);
      }
  
      // Store weekly availability for reference
      setWeeklyAvailability(weekly);
  
      if (settings.timezone) {
        setUserTimezone(settings.timezone);
      }
  
      // Fetch bookings for the current month
      const bookings = await getBookings(activeAgentId);
      
      // Organize bookings by date
      const bookingsByDate = {};
      if (bookings && bookings.length > 0) {
        bookings.forEach(booking => {
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
      const totalCells = 35;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      for (let i = 0; i < totalCells; i++) {
        const dateObj = new Date(startOfCalendar);
        dateObj.setDate(startOfCalendar.getDate() + i);
        const apiDate = formatDateForApi(dateObj);
  
        const dayName = new Intl.DateTimeFormat("en-US", {
          weekday: "long",
          timeZone: settings.timezone || userTimezone,
        }).format(dateObj);
  
        const rule = weekly.find((w) => w.day === dayName);
  
        let available = true;
        let timeSlots = [];
        let isApiUnavailable = false;
        let allDay = false;
  
        // Apply weekly rule if exists
        if (rule) {
          if (rule.available && rule.timeSlots && rule.timeSlots.length > 0) {
            timeSlots = rule.timeSlots.map(slot => ({
              start: slot.startTime,
              end: slot.endTime
            }));
          } else {
            available = false;
            isApiUnavailable = true;
          }
        } else {
          timeSlots = [{ start: "09:00", end: "17:00" }];
        }
  
        // Override with date-specific unavailability if exists
        const unavailableData = unavailableDatesData.find(
          (item) => item.date === apiDate
        );
  
        if (unavailableData) {
          console.log(`🔍 Found unavailable data for ${apiDate}:`, unavailableData);
          
          allDay = !!unavailableData.allDay;
          available = !allDay;
  
          if (!allDay) {
            // FIXED: Handle multiple time slots from API response with better data processing
            if (unavailableData.timeSlots && Array.isArray(unavailableData.timeSlots) && unavailableData.timeSlots.length > 0) {
              // Handle both old and new format
              timeSlots = unavailableData.timeSlots.map(slot => {
                // Handle different formats:
                // New format: { startTime: "09:00", endTime: "18:00" }
                // Old format: { start: "09:00", end: "18:00" }
                // Mixed format: { _id: "...", start: "09:00", end: "18:00" }
                
                const startTime = slot.startTime || slot.start;
                const endTime = slot.endTime || slot.end;
                
                return {
                  start: startTime,
                  end: endTime
                };
              }).filter(slot => slot.start && slot.end); // Filter out invalid slots
              
              console.log(`✅ Loaded ${timeSlots.length} time slots for ${apiDate}:`, 
                timeSlots.map(slot => `${slot.start}-${slot.end}`).join(', '));
            } else if (unavailableData.startTime && unavailableData.endTime) {
              // Fallback to single slot
              timeSlots = [{
                start: unavailableData.startTime,
                end: unavailableData.endTime
              }];
              console.log(`📍 Loaded single time slot for ${apiDate}:`, timeSlots[0]);
            }
          }
        }
  
        const isPast = dateObj < today;
        const isToday = dateObj.toDateString() === today.toDateString();
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
          timeSlots,
          timeSlot: formatTimeSlots(timeSlots),
          isApiUnavailable,
          isDisabled: isPast || isApiUnavailable,
          hasCustomHours: (unavailableData && !allDay) || false,
          isModified: false, // Reset modification flag after loading
          originalTimeSlots: JSON.parse(JSON.stringify(timeSlots)), // Deep copy
          originalAvailable: available,
          allDay: allDay,
          dayName,
          isToday,
          hasBookings,
          bookings: bookingsByDate[apiDate] || []
        });
      }
  
      console.log("📊 Generated schedule days:", days.length);
      setScheduleDays(days);
      
      // FIXED: If a day is already selected, update its data properly and exit editing mode
      if (selectedDay) {
        const updatedSelectedDay = days.find(
          (day) => day.apiDate === selectedDay.apiDate
        );
        if (updatedSelectedDay) {
          console.log(`🔄 Updating selected day ${selectedDay.apiDate} with new data:`, updatedSelectedDay.timeSlots);
          
          setSelectedDay(updatedSelectedDay);
          setWorkingHours(JSON.parse(JSON.stringify(updatedSelectedDay.timeSlots)) || [{ start: "09:00", end: "17:00" }]);
          setScheduledSlots(updatedSelectedDay.bookings || []);
          
          // Force exit editing mode to show updated data
          setIsEditingHours(false);
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
      setWorkingHours(JSON.parse(JSON.stringify(selectedDay.timeSlots)) || [{ start: "09:00", end: "17:00" }]);
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
    setWorkingHours(JSON.parse(JSON.stringify(day.timeSlots)) || [{ start: "09:00", end: "17:00" }]);
    setScheduledSlots(day.bookings || []);
    setIsEditingHours(false); // Reset editing state when selecting a new day
    
    // Show mobile details view on mobile
    setShowMobileDetails(true);
  };

  // Mobile back button handler
  const handleMobileBack = () => {
    setShowMobileDetails(false);
    setSelectedDay(null);
    setIsEditingHours(false);
  };

  const handleEditHours = () => {
    setIsEditingHours(true);
  };

  const handleSaveHours = () => {
    console.log("handleSaveHours called");
    console.log("Current working hours:", workingHours);
    console.log("Selected day:", selectedDay);
    
    setIsEditingHours(false);
    
    // Update the working hours for the selected day
    if (selectedDay) {
      console.log("Updating schedule days...");
      
      setScheduleDays(prev => {
        const updated = prev.map(day => {
          if (day.apiDate === selectedDay.apiDate) {
            const updatedDay = {
              ...day,
              timeSlots: JSON.parse(JSON.stringify(workingHours)), // Deep copy
              timeSlot: formatTimeSlots(workingHours),
              isModified: true,
              hasCustomHours: true
            };
            
            console.log(`Updated day ${day.apiDate}:`, updatedDay);
            return updatedDay;
          }
          return day;
        });
        
        console.log("All schedule days after update:", updated);
        return updated;
      });
      
      // Update the selected day
      setSelectedDay(prev => {
        if (prev) {
          const updatedSelectedDay = {
            ...prev,
            timeSlots: JSON.parse(JSON.stringify(workingHours)), // Deep copy
            timeSlot: formatTimeSlots(workingHours),
            isModified: true,
            hasCustomHours: true
          };
          
          console.log("Updated selected day:", updatedSelectedDay);
          return updatedSelectedDay;
        }
        return prev;
      });
      
      console.log("Hours saved successfully");
    } else {
      console.log("No selected day to update");
    }
  };

  const handleCancelEdit = () => {
    setIsEditingHours(false);
    // FIXED: Reset working hours to original values (deep copy)
    if (selectedDay) {
      setWorkingHours(JSON.parse(JSON.stringify(selectedDay.timeSlots)) || [{ start: "09:00", end: "17:00" }]);
    }
  };

  // FIXED: Add new time slot with proper meeting duration consideration
  const addTimeSlot = () => {
    const lastSlot = workingHours[workingHours.length - 1];
    const lastEndTime = lastSlot.end;
    
    // Calculate next start time based on buffer
    const allTimes = generateTimeOptions(0, 24);
    const lastEndIndex = allTimes.indexOf(lastEndTime);
    
    if (lastEndIndex >= 0 && lastEndIndex < allTimes.length - 1) {
      const newStartTime = lastEndTime; // Start immediately after the last slot
      
      // Calculate end time based on meeting duration
      const increment = meetingDuration >= 60 ? 60 : meetingDuration;
      const startIndex = allTimes.indexOf(newStartTime);
      const slotsNeeded = Math.ceil(meetingDuration / increment);
      const endIndex = Math.min(startIndex + slotsNeeded, allTimes.length);
      const newEndTime = endIndex < allTimes.length ? allTimes[endIndex] : "24:00";
      
      if (newStartTime < "24:00" && newEndTime <= "24:00") {
        setWorkingHours(prev => [
          ...prev,
          {
            start: newStartTime,
            end: newEndTime
          }
        ]);
      }
    }
  };

  // Remove time slot
  const removeTimeSlot = (index) => {
    if (workingHours.length > 1) {
      setWorkingHours(prev => prev.filter((_, i) => i !== index));
    }
  };

  // FIXED: Update specific time slot with proper meeting duration consideration
  const updateTimeSlot = (index, field, value) => {
    setWorkingHours(prev => 
      prev.map((slot, i) => {
        if (i === index) {
          const updatedSlot = { ...slot, [field]: value };
          
          // Ensure end time is after start time
          if (field === 'start') {
            const allTimes = generateTimeOptions(0, 24);
            allTimes.push("24:00");
            const startIndex = allTimes.indexOf(value);
            const currentEndIndex = allTimes.indexOf(slot.end);
            
            if (currentEndIndex <= startIndex) {
              // Auto-calculate end time based on meeting duration
              const increment = meetingDuration >= 60 ? 60 : meetingDuration;
              const slotsNeeded = Math.ceil(meetingDuration / increment);
              const endIndex = Math.min(startIndex + slotsNeeded, allTimes.length - 1);
              updatedSlot.end = allTimes[endIndex] || "24:00";
            }
          }
          
          return updatedSlot;
        }
        return slot;
      })
    );
  };

  // FIXED: Get available start times based on meeting duration
  const getAvailableStartTimes = (currentSlotIndex) => {
    const allTimes = generateTimeOptions(0, 24);
    
    if (currentSlotIndex === 0) {
      const nextSlot = workingHours[1];
      if (nextSlot) {
        return allTimes.filter(time => time < nextSlot.start);
      }
      return allTimes.filter(time => time < "23:00");
    }
    
    const previousSlot = workingHours[currentSlotIndex - 1];
    if (!previousSlot) {
      return ["09:00"];
    }
    
    const previousEndTime = previousSlot.end;
    let maxStartTime = "23:00";
    
    const nextSlot = workingHours[currentSlotIndex + 1];
    if (nextSlot) {
      maxStartTime = nextSlot.start;
    }
    
    return allTimes.filter(time => time >= previousEndTime && time < maxStartTime);
  };

  // FIXED: Get available end times based on meeting duration
  const getAvailableEndTimes = (currentSlotIndex, startTime) => {
    const allTimes = generateTimeOptions(0, 24);
    allTimes.push("24:00");
    
    let maxEndTime = "24:00";
    
    const nextSlot = workingHours[currentSlotIndex + 1];
    if (nextSlot) {
      maxEndTime = nextSlot.start;
    }
    
    return allTimes.filter(time => time > startTime && time <= maxEndTime);
  };
  
  const toggleDayAvailability = () => {
    if (!selectedDay) return;
    
    console.log("Toggling day availability for:", selectedDay.apiDate);
    
    setScheduleDays(prev => 
      prev.map(day => {
        if (day.apiDate === selectedDay.apiDate) {
          const newAvailable = !day.available;
          const updatedDay = {
            ...day,
            available: newAvailable,
            allDay: !newAvailable,
            isModified: true // Ensure this is set
          };
          
          console.log(`Toggled ${day.apiDate} availability:`, updatedDay);
          return updatedDay;
        }
        return day;
      })
    );
    
    // Update the selected day
    setSelectedDay(prev => {
      if (prev) {
        const newAvailable = !prev.available;
        const updatedSelectedDay = {
          ...prev,
          available: newAvailable,
          allDay: !newAvailable,
          isModified: true // Ensure this is set
        };
        
        console.log("Updated selected day after toggle:", updatedSelectedDay);
        return updatedSelectedDay;
      }
      return prev;
    });
  };
  
  const saveChanges = async () => {
    if (!activeAgentId) return;
    setIsSaving(true);
    setSaveError(null);
    
    try {
      console.log("Starting to save changes...");
      
      const modifiedDays = scheduleDays.filter((d) => d.isModified);
      console.log("Modified days:", modifiedDays);
      
      if (modifiedDays.length === 0) {
        console.log("No changes to save");
        setIsSaving(false);
        return;
      }
  
      const unavailableDatesToUpdate = [];
      const datesToMakeAvailable = [];
      
      modifiedDays.forEach((d) => {
        console.log(`Processing day ${d.apiDate}:`, {
          available: d.available,
          timeSlots: d.timeSlots,
          allDay: d.allDay
        });
  
        if (!d.available || d.allDay) {
          unavailableDatesToUpdate.push({
            date: d.apiDate,
            startTime: "09:00",
            endTime: "17:00", 
            allDay: true,
            timezone: userTimezone,
          });
          console.log(`Added ${d.apiDate} as unavailable (all day)`);
        } else if (d.available && d.timeSlots && d.timeSlots.length > 0) {
          const weeklyRule = weeklyAvailability.find(w => w.day === d.dayName);
          
          let hasCustomHours = false;
          
          if (!weeklyRule || !weeklyRule.timeSlots || weeklyRule.timeSlots.length === 0) {
            hasCustomHours = true;
          } else {
            const weeklySlots = weeklyRule.timeSlots.map(slot => ({
              start: slot.startTime,
              end: slot.endTime
            }));
            
            const currentSlots = [...d.timeSlots].sort((a, b) => a.start.localeCompare(b.start));
            const defaultSlots = [...weeklySlots].sort((a, b) => a.start.localeCompare(b.start));
            
            if (currentSlots.length !== defaultSlots.length) {
              hasCustomHours = true;
            } else {
              hasCustomHours = currentSlots.some((slot, index) => 
                slot.start !== defaultSlots[index].start || 
                slot.end !== defaultSlots[index].end
              );
            }
          }
          
          console.log(`Day ${d.apiDate} has custom hours:`, hasCustomHours);
          
          if (hasCustomHours) {
            unavailableDatesToUpdate.push({
              date: d.apiDate,
              startTime: d.timeSlots[0].start,
              endTime: d.timeSlots[0].end,
              allDay: false,
              timezone: userTimezone,
              timeSlots: d.timeSlots.map(slot => ({
                startTime: slot.start,
                endTime: slot.end
              })),
              isMultipleSlots: d.timeSlots.length > 1,
            });
            
            console.log(`Added ${d.apiDate} with ${d.timeSlots.length} time slots:`, 
              d.timeSlots.map(slot => `${slot.start}-${slot.end}`).join(', '));
          } else {
            datesToMakeAvailable.push(d.apiDate);
            console.log(`Added ${d.apiDate} to make available (use weekly default)`);
          }
        }
      });
  
      console.log("Payload to send:");
      console.log("- unavailableDatesToUpdate:", unavailableDatesToUpdate);
      console.log("- datesToMakeAvailable:", datesToMakeAvailable);
  
      if (unavailableDatesToUpdate.length > 0 || datesToMakeAvailable.length > 0) {
        console.log("Making API call to update unavailable dates...");
        
        const result = await updateUnavailableDates(
          activeAgentId, 
          unavailableDatesToUpdate,
          datesToMakeAvailable
        );
        
        console.log("API call successful:", result);
        
        setSaveSuccess(true);
        
        // FIXED: Wait longer for backend to process, then reload
        console.log("🔄 Reloading schedule data...");
        
        // Small delay to ensure backend has processed the change
        setTimeout(async () => {
          await loadScheduleData();
          console.log("✅ Schedule data reloaded");
        }, 500);
        
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        console.log("No changes to send to API");
        setIsSaving(false);
      }
      
    } catch (error) {
      console.error("Error saving changes:", error);
      setSaveError(`Failed to update your schedule: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Calendar component for both desktop and mobile
  const CalendarView = () => (
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
  );

  // Details component for both desktop and mobile
  const DetailsView = () => (
    <div className="bg-white rounded-lg p-4 border border-blue-200">
      {/* Mobile back button - only show on mobile */}
      <div className="block md:hidden mb-4">
        <button
          onClick={handleMobileBack}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Calendar
        </button>
      </div>

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
                  <div className="flex gap-2">
                    <button 
                      onClick={handleCancelEdit}
                      className="text-xs bg-gray-500 text-white px-3 py-1 rounded-md"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveHours}
                      className="text-xs bg-green-500 text-white px-3 py-1 rounded-md"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleEditHours}
                    className="text-xs bg-green-500 text-white px-3 py-1 rounded-md"
                  >
                    EDIT HOURS
                  </button>
                )}
              </div>
              
              {isEditingHours ? (
                <div className="space-y-3">
                  {workingHours.map((slot, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <select 
                        value={slot.start}
                        onChange={(e) => updateTimeSlot(index, 'start', e.target.value)}
                        className="border border-gray-300 rounded-md p-1 text-sm"
                      >
                        {getAvailableStartTimes(index).map((time) => (
                          <option key={time} value={time}>
                            {formatTime12(time)}
                          </option>
                        ))}
                      </select>
                      
                      <span>—</span>
                      
                      <select 
                        value={slot.end}
                        onChange={(e) => updateTimeSlot(index, 'end', e.target.value)}
                        className="border border-gray-300 rounded-md p-1 text-sm"
                      >
                        {getAvailableEndTimes(index, slot.start).map((time) => (
                          <option key={time} value={time}>
                            {formatTime12(time)}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={addTimeSlot}
                        className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full hover:bg-green-600"
                        title="Add time slot"
                      >
                        <Plus className="h-4 w-4" />
                      </button>

                      {workingHours.length > 1 && (
                        <button
                          onClick={() => removeTimeSlot(index)}
                          className="flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600"
                          title="Remove time slot"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {workingHours.map((slot, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="border border-gray-300 rounded-md px-3 py-1">
                        {formatTime12(slot.start)}
                      </div>
                      <span>—</span>
                      <div className="border border-gray-300 rounded-md px-3 py-1">
                        {formatTime12(slot.end)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Display meeting duration info */}
          {selectedDay.available && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-sm text-blue-700">
                <div className="font-medium mb-1">Meeting Settings</div>
                <div>Duration: {meetingDuration} minutes{bufferTime > 0 && ` + ${bufferTime} min buffer`}</div>
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
  );

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
      
      {/* Desktop Layout (2 columns) */}
      <div className="hidden md:grid md:grid-cols-2 gap-6">
        <CalendarView />
        <DetailsView />
      </div>
      
      {/* Mobile Layout (single column with conditional rendering) */}
      <div className="block md:hidden">
        {!showMobileDetails ? (
          <CalendarView />
        ) : (
          <DetailsView />
        )}
      </div>
    </div>
  );
};

export default AvailabilitySchedule;