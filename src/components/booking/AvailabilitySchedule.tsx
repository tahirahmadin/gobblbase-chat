
import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useBotConfig } from "../../store/useBotConfig";
import {
  getAppointmentSettings,
  updateUnavailableDates,
} from "../../lib/serverActions";

interface ScheduleProps {}

type ScheduleDay = {
  apiDate: string;            
  dateObj: Date;              
  formattedDate: string;      
  available: boolean;         
  timeSlot: string;           
  isApiUnavailable: boolean;  
  isDisabled: boolean;        
  hasCustomHours: boolean;    
  isModified: boolean;        
  originalTimeSlot: string;   
  originalAvailable: boolean; 
  allDay: boolean;            
  startTime: string;          
  endTime: string;            
};

const AvailabilitySchedule: React.FC<ScheduleProps> = () => {
  const { activeBotData } = useBotConfig();
  const activeAgentId = activeBotData?.agentId; 
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [scheduleDays, setScheduleDays] = useState<ScheduleDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<ScheduleDay | null>(null);
  const [timeInput, setTimeInput] = useState({
    start: "9:00",
    end: "5:00",
    ampmStart: "am",
    ampmEnd: "pm",
  });

  const timePresets = [
    { label: "Morning",    time: "9:00am - 12:00pm", start: "9:00", end: "12:00", ampmStart: "am", ampmEnd: "pm" },
    { label: "Afternoon",  time: "1:00pm - 5:00pm",   start: "1:00", end: "5:00",  ampmStart: "pm", ampmEnd: "pm" },
    { label: "Evening",    time: "6:00pm - 9:00pm",   start: "6:00", end: "9:00",  ampmStart: "pm", ampmEnd: "pm" },
    { label: "Full day",   time: "9:00am - 5:00pm",   start: "9:00", end: "5:00",  ampmStart: "am", ampmEnd: "pm" },
  ];

  
  const formatDateForApi = (d: Date) => {
    const day = d.getDate().toString().padStart(2, "0");
    const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    return `${day}-${months[d.getMonth()]}-${d.getFullYear()}`;
  };
  
  const formatDateForDisplay = (d: Date) =>
    new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(d);
  
  const formatMonthYear = (d: Date) =>
    new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(d);
  
  const formatTime12 = (t24: string) => {
    const [h, m] = t24.split(":").map((x) => parseInt(x, 10));
    const suffix = h >= 12 ? "pm" : "am";
    const hr12 = h % 12 === 0 ? 12 : h % 12;
    return `${hr12}:${m.toString().padStart(2, "0")}${suffix}`;
  };

  
  const convertTo24Hour = (time: string, ampm: string) => {
    let [hours, minutes] = time.split(':').map(part => parseInt(part, 10));
    if (ampm.toLowerCase() === 'pm' && hours < 12) {
      hours += 12;
    } else if (ampm.toLowerCase() === 'am' && hours === 12) {
      hours = 0;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  
  const convertTo12Hour = (time24h: string) => {
    if (!time24h) return { time: "9:00", ampm: "am" };
    
    const [hours, minutes] = time24h.split(':').map(part => parseInt(part, 10));
    const ampm = hours >= 12 ? 'pm' : 'am';
    const hours12 = hours % 12 || 12;
    const time = `${hours12}:${minutes.toString().padStart(2, '0')}`;
    
    return { time, ampm };
  };

  
  const parseTimeSlot = (timeSlot: string) => {
    const parts = timeSlot.split(' - ');
    if (parts.length !== 2) return { startTime: "09:00", endTime: "17:00" };
    
    const startPart = parts[0];
    const endPart = parts[1];
    
    const startTime = startPart.replace(/[^0-9:]/g, '');
    const startAmPm = startPart.replace(/[0-9:]/g, '');
    const endTime = endPart.replace(/[^0-9:]/g, '');
    const endAmPm = endPart.replace(/[0-9:]/g, '');
    
    return {
      startTime: convertTo24Hour(startTime, startAmPm),
      endTime: convertTo24Hour(endTime, endAmPm)
    };
  };

  
  const getSelectedDayFormatted = () => {
    if (!selectedDay) return "";
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(selectedDay.dateObj);
  };

  
  const loadScheduleData = async () => {
    if (!activeAgentId) return;
    setIsLoading(true);
    try {
      const settings = await getAppointmentSettings(activeAgentId);
      const unavailableDatesData = settings.unavailableDates || [];
      const weekly = settings.availability;

      const days: ScheduleDay[] = [];
      const startOfCalendar = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const totalCells = 42;
      const today = new Date(); today.setHours(0,0,0,0);

      for (let i = 0; i < totalCells; i++) {
        const dateObj = new Date(startOfCalendar);
        dateObj.setDate(startOfCalendar.getDate() + i);
        const apiDate = formatDateForApi(dateObj);
        const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(dateObj);
        const rule = weekly.find((w: any) => w.day === dayName);

        let available = true;
        let timeSlot = "9:00am - 5:00pm"; 
        let startTime = "09:00";
        let endTime = "17:00";
        let isApiUnavailable = false;
        let allDay = false;
        
        
        if (rule) {
          if (rule.available && rule.timeSlots.length > 0) {
            const slot = rule.timeSlots[0];
            startTime = slot.startTime;
            endTime = slot.endTime;
            timeSlot = `${formatTime12(startTime)} - ${formatTime12(endTime)}`;
          } else {
            available = false;
            isApiUnavailable = true;
          }
        }
        
        
        const unavailableData = unavailableDatesData.find(
          (item: any) => item.date === apiDate
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

        days.push({
          apiDate,
          dateObj,
          formattedDate: formatDateForDisplay(dateObj),
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
          endTime
        });
      }

      setScheduleDays(days);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  
  useEffect(() => {
    loadScheduleData();
  }, [activeAgentId, currentMonth]);

  
  const prevMonth = () =>
    setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  const daysInMonth = (y: number, mo: number) => new Date(y, mo + 1, 0).getDate();

  
  const getCalendarDays = () => {
    const cells: any[] = [];
    const year = currentMonth.getFullYear();
    const mo = currentMonth.getMonth();
    const firstDow = new Date(year, mo, 1).getDay();
    for (let i = 0; i < firstDow; i++) cells.push({ empty: true });
    for (let d = 1; d <= daysInMonth(year, mo); d++) {
      const dateObj = new Date(year, mo, d);
      const apiDate = formatDateForApi(dateObj);
      const c = scheduleDays.find(s => s.apiDate === apiDate);
      cells.push({ ...c, empty: false, dayNum: d });
    }
    return cells;
  };

  
  const handleDaySelect = (day: ScheduleDay) => {
    if (day.isDisabled) return;
    if (selectedDay?.apiDate === day.apiDate) {
      toggleDayAvailability(day.apiDate);
    } else {
      setSelectedDay(day);
    }
  };

  const toggleDayAvailability = (apiDate: string) => {
    setScheduleDays(prev =>
      prev.map(d => {
        if (d.apiDate === apiDate) {
          
          const newAvailable = !d.available; 
          return { 
            ...d, 
            available: newAvailable,
            allDay: !newAvailable, 
            isModified: true, 
            hasCustomHours: newAvailable && d.timeSlot !== d.originalTimeSlot 
          };
        }
        return d;
      })
    );
    
    if (selectedDay?.apiDate === apiDate) {
      setSelectedDay(d => {
        if (d) {
          const newAvailable = !d.available;
          
          return { 
            ...d, 
            available: newAvailable,
            allDay: !newAvailable, 
            isModified: true, 
            hasCustomHours: newAvailable && d.timeSlot !== d.originalTimeSlot 
          };
        }
        return d;
      });
    }
  };

  const markDayUnavailable = (day: ScheduleDay) => {
    if (day.isDisabled) return;
    setScheduleDays(prev =>
      prev.map(d => {
        if (d.apiDate === day.apiDate) {
          return { 
            ...d, 
            available: false,
            allDay: true, 
            isModified: true, 
            hasCustomHours: false 
          };
        }
        return d;
      })
    );
    
    if (selectedDay?.apiDate === day.apiDate) {
      setSelectedDay(d => {
        if (d) {
          return { 
            ...d, 
            available: false,
            allDay: true, 
            isModified: true, 
            hasCustomHours: false 
          };
        }
        return d;
      });
    }
  };

  const markDayAvailable = (day: ScheduleDay) => {
    if (day.isDisabled) return;
    setScheduleDays(prev =>
      prev.map(d => {
        if (d.apiDate === day.apiDate) {
          return { 
            ...d, 
            available: true,
            allDay: false, 
            isModified: true, 
            hasCustomHours: d.timeSlot !== d.originalTimeSlot 
          };
        }
        return d;
      })
    );
    
    if (selectedDay?.apiDate === day.apiDate) {
      setSelectedDay(d => {
        if (d) {
          return { 
            ...d, 
            available: true,
            allDay: false, 
            isModified: true, 
            hasCustomHours: d.timeSlot !== d.originalTimeSlot 
          };
        }
        return d;
      });
    }
  };

  const openTimeModal = (day: ScheduleDay) => {
    if (day.isDisabled) return;
    setSelectedDate(day.apiDate);

    const [startPart, endPart] = day.timeSlot.split(" - ");
    if (startPart && endPart) {
      const startTime = startPart.replace(/[^0-9:]/g, "");
      const ampmStart = startPart.replace(/[0-9:]/g, "");
      const endTime = endPart.replace(/[^0-9:]/g, "");
      const ampmEnd = endPart.replace(/[0-9:]/g, "");
      setTimeInput({ start: startTime, end: endTime, ampmStart, ampmEnd });
    }
    setShowTimeModal(true);
  };

  const saveTimeSlot = () => {
    if (!selectedDate) return;
    const slot = `${timeInput.start}${timeInput.ampmStart} - ${timeInput.end}${timeInput.ampmEnd}`;
    const startTime24 = convertTo24Hour(timeInput.start, timeInput.ampmStart);
    const endTime24 = convertTo24Hour(timeInput.end, timeInput.ampmEnd);
    
    setScheduleDays(prev =>
      prev.map(d => {
        if (d.apiDate === selectedDate) {
          const isCustom = slot !== d.originalTimeSlot;
          return { 
            ...d, 
            available: true, 
            allDay: false, 
            timeSlot: slot,
            startTime: startTime24,
            endTime: endTime24,
            isModified: true, 
            hasCustomHours: isCustom 
          };
        }
        return d;
      })
    );
    
    if (selectedDay?.apiDate === selectedDate) {
      setSelectedDay(d => {
        if (d) {
          const isCustom = slot !== d.originalTimeSlot;
          return { 
            ...d, 
            available: true, 
            allDay: false, 
            timeSlot: slot,
            startTime: startTime24,
            endTime: endTime24,
            isModified: true, 
            hasCustomHours: isCustom 
          };
        }
        return d;
      });
    }
    
    setShowTimeModal(false);
    setSelectedDate(null);
  };

  const saveChanges = async () => {
    if (!activeAgentId) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      
      const unavailableDates = scheduleDays
        .filter(d => d.isModified)
        .map(d => ({
          date: d.apiDate,
          startTime: d.startTime,
          endTime: d.endTime,
          allDay: !d.available || d.allDay 
        }));
      
      await updateUnavailableDates(activeAgentId, unavailableDates);
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-gray-700" />
          My Schedule
        </h2>
        <button
          onClick={saveChanges}
          disabled={isSaving}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
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
          ) : (
            "Save"
          )}
        </button>
      </div>

      {/* Success/Error */}
      {saveSuccess && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-3 rounded flex items-center">
          <Check className="h-5 w-5 mr-2 text-green-500" />
          Schedule updated successfully!
        </div>
      )}
      {saveError && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
          {saveError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Calendar */}
        <div className="md:col-span-2 bg-white rounded-md shadow-sm border border-gray-200">
          <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="text-base font-medium text-gray-800">
              {formatMonthYear(currentMonth)}
            </h3>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="p-2 bg-white">
            {/* Weekdays */}
            <div className="grid grid-cols-7 mb-1">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((wd) => (
                <div
                  key={wd}
                  className="text-center py-1.5 text-xs font-medium text-gray-600"
                >
                  {wd}
                </div>
              ))}
            </div>
            {/* Cells */}
            <div className="grid grid-cols-7 gap-1 bg-white">
              {getCalendarDays().map((c, i) => (
                <div
                  key={i}
                  className={`aspect-square overflow-hidden ${c.empty ? "invisible" : ""}`}
                >
                  {!c.empty && (
                    <div
                      onClick={() => { if (!c.isDisabled) handleDaySelect(c); }}
                      className={`
                        w-full h-full p-1 transition-colors flex flex-col
                        ${c.isDisabled ? "bg-gray-100 opacity-70 cursor-not-allowed"
                          : c.allDay ? "bg-red-50 hover:bg-red-100 cursor-pointer"
                          : !c.available ? "bg-gray-100 hover:bg-gray-200 cursor-pointer"
                          : c.hasCustomHours ? "bg-blue-50 hover:bg-blue-100 cursor-pointer"
                          : "bg-white hover:bg-gray-50 cursor-pointer"}
                        ${c.isToday ? "ring-1 ring-gray-800" : "border border-gray-200"}
                        rounded-md
                      `}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-medium ${c.isToday ? "text-black" : "text-gray-700"}`}>
                          {c.dayNum}
                        </span>
                        {!c.isDisabled && (
                          <>
                            {c.isApiUnavailable ? (
                              <span className="h-4 w-4 flex items-center justify-center rounded-full bg-gray-400 text-white">
                                <X className="h-3 w-3" />
                              </span>
                            ) : c.allDay ? (
                              <span className="h-4 w-4 flex items-center justify-center rounded-full bg-red-400 text-white">
                                <X className="h-3 w-3" />
                              </span>
                            ) : !c.available ? (
                              <span className="h-4 w-4 flex items-center justify-center rounded-full bg-gray-400 text-white">
                                <X className="h-3 w-3" />
                              </span>
                            ) : c.hasCustomHours ? (
                              <span className="h-4 w-4 flex items-center justify-center rounded-full bg-blue-500 text-white">
                                <Clock className="h-3 w-3" />
                              </span>
                            ) : (
                              <span className="h-4 w-4 flex items-center justify-center rounded-full bg-green-500 text-white">
                                <Check className="h-3 w-3" />
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      {c.available && !c.isDisabled && (
                        <div className={`text-xs truncate mt-auto ${
                          c.hasCustomHours ? "text-blue-600 font-medium" : "text-gray-600"
                        }`}>
                          {c.timeSlot}
                        </div>
                      )}
                      {!c.available && !c.isDisabled && (
                        <div className={`text-xs mt-auto flex items-center ${
                          c.allDay ? "text-red-500 font-medium" : "text-gray-500"
                        }`}>
                          <X className="h-3 w-3 mr-1" /> 
                          {c.allDay ? "Off duty" : "Unavailable"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected day panel */}
        <div className="md:col-span-1">
          {selectedDay ? (
            <div className="bg-white rounded-md shadow-sm border border-gray-200 h-full flex flex-col">
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-base font-semibold text-gray-800">
                  {getSelectedDayFormatted()}
                </h3>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                {selectedDay.allDay ? (
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mb-4 bg-red-100 text-red-800">
                    <span className="h-2 w-2 rounded-full mr-1.5 bg-red-500"></span>
                    Status: Off duty
                  </div>
                ) : !selectedDay.available ? (
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mb-4 bg-gray-100 text-gray-800">
                    <span className="h-2 w-2 rounded-full mr-1.5 bg-gray-500"></span>
                    Status: Unavailable (from schedule)
                  </div>
                ) : selectedDay.hasCustomHours ? (
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mb-4 bg-blue-100 text-blue-800">
                    <span className="h-2 w-2 rounded-full mr-1.5 bg-blue-500"></span>
                    Status: Custom schedule
                  </div>
                ) : (
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mb-4 bg-green-100 text-green-800">
                    <span className="h-2 w-2 rounded-full mr-1.5 bg-green-500"></span>
                    Status: Available
                  </div>
                )}

                {selectedDay.available && (
                  <div className="mb-6">
                    <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Working Hours
                    </div>
                    <div className={`flex items-center ${selectedDay.hasCustomHours ? "text-blue-600" : "text-gray-800"}`}>
                      <Clock className={`h-4 w-4 mr-2 ${selectedDay.hasCustomHours ? "text-blue-500" : "text-gray-500"}`} />
                      <span className="font-medium">{selectedDay.timeSlot}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3 mt-auto">
                  {selectedDay.available ? (
                    <>
                      <button
                        onClick={() => openTimeModal(selectedDay)}
                        className="w-full flex items-center justify-center p-2.5 bg-white border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      >
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        Edit hours
                      </button>
                      <button
                        onClick={() => markDayUnavailable(selectedDay)}
                        className="w-full flex items-center justify-center p-2.5 bg-white border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      >
                        <X className="h-4 w-4 mr-2 text-gray-500" />
                        Mark as off duty
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => markDayAvailable(selectedDay)}
                      className="w-full flex items-center justify-center p-2.5 bg-gray-800 hover:bg-black rounded-md text-white font-medium transition-colors"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Mark as available
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-md shadow-sm border border-gray-200 h-full p-4 flex items-center justify-center text-center">
              <div className="text-gray-500">
                <CalendarIcon className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                <p className="font-medium mb-1">Select a date</p>
                <p className="text-xs text-gray-400">Click on any date to view and edit</p>
              </div>
            </div>
          )}  
        </div>
      </div>

      {/* Time Slot Modal */}
      {showTimeModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4 m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Set Working Hours</h3>
              <button 
                onClick={() => setShowTimeModal(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-5">
              <p className="text-sm text-gray-600">
                {selectedDay ? getSelectedDayFormatted() : ''}
              </p>
            </div>
            
            <div className="space-y-4">
              {/* Quick Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick select</label>
                <div className="grid grid-cols-2 gap-2">
                  {timePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTimeInput({
                        start: preset.start,
                        end: preset.end,
                        ampmStart: preset.ampmStart,
                        ampmEnd: preset.ampmEnd
                      })}
                      className="flex items-center justify-between py-2 px-3 border border-gray-200 rounded-md hover:bg-gray-50 text-left"
                    >
                      <span className="text-sm font-medium text-gray-800">{preset.label}</span>
                      <span className="text-xs text-gray-500">{preset.time}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Custom Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom hours</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                    <div className="flex">
                      <input
                        type="text"
                        value={timeInput.start}
                        onChange={e => setTimeInput(t => ({ ...t, start: e.target.value }))}
                        placeholder="9:00"
                        className="flex-1 rounded-l-md border-gray-300 focus:border-gray-500 focus:ring-gray-500 text-sm"
                      />
                      <select
                        value={timeInput.ampmStart}
                        onChange={e => setTimeInput(t => ({ ...t, ampmStart: e.target.value }))}
                        className="rounded-r-md border-l-0 border-gray-300 text-sm bg-gray-50"
                      >
                        <option value="am">AM</option>
                        <option value="pm">PM</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Time</label>
                    <div className="flex">
                      <input
                        type="text"
                        value={timeInput.end}
                        onChange={e => setTimeInput(t => ({ ...t, end: e.target.value }))}
                        placeholder="5:00"
                        className="flex-1 rounded-l-md border-gray-300 focus:border-gray-500 focus:ring-gray-500 text-sm"
                      />
                      <select
                        value={timeInput.ampmEnd}
                        onChange={e => setTimeInput(t => ({ ...t, ampmEnd: e.target.value }))}
                        className="rounded-r-md border-l-0 border-gray-300 text-sm bg-gray-50"
                      >
                        <option value="am">AM</option>
                        <option value="pm">PM</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200">
                <button
                  onClick={() => setShowTimeModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveTimeSlot}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilitySchedule;