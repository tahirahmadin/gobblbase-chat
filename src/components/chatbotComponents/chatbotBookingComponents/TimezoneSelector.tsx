import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { formatTimezone } from '../../../utils/timezoneUtils';
import { DateTime } from 'luxon';
import { Theme } from '../../types';

// Common timezones list
const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)', region: 'North America' },
  { value: 'America/Chicago', label: 'Central Time (CT)', region: 'North America' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', region: 'North America' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', region: 'North America' },
  { value: 'America/Toronto', label: 'Toronto (ET)', region: 'North America' },
  { value: 'America/Vancouver', label: 'Vancouver (PT)', region: 'North America' },
  { value: 'Europe/London', label: 'London (GMT/BST)', region: 'Europe' },
  { value: 'Europe/Paris', label: 'Paris (CET)', region: 'Europe' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)', region: 'Europe' },
  { value: 'Europe/Rome', label: 'Rome (CET)', region: 'Europe' },
  { value: 'Europe/Madrid', label: 'Madrid (CET)', region: 'Europe' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (CET)', region: 'Europe' },
  { value: 'Europe/Zurich', label: 'Zurich (CET)', region: 'Europe' },
  { value: 'Europe/Stockholm', label: 'Stockholm (CET)', region: 'Europe' },
  { value: 'Europe/Oslo', label: 'Oslo (CET)', region: 'Europe' },
  { value: 'Europe/Copenhagen', label: 'Copenhagen (CET)', region: 'Europe' },
  { value: 'Europe/Helsinki', label: 'Helsinki (EET)', region: 'Europe' },
  { value: 'Europe/Vienna', label: 'Vienna (CET)', region: 'Europe' },
  { value: 'Europe/Brussels', label: 'Brussels (CET)', region: 'Europe' },
  { value: 'Europe/Warsaw', label: 'Warsaw (CET)', region: 'Europe' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)', region: 'Europe' },
  { value: 'Asia/Kolkata', label: 'India (IST)', region: 'Asia' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', region: 'Asia' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', region: 'Asia' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', region: 'Asia' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', region: 'Asia' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', region: 'Asia' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)', region: 'Asia' },
  { value: 'Asia/Bangkok', label: 'Bangkok (ICT)', region: 'Asia' },
  { value: 'Asia/Jakarta', label: 'Jakarta (WIB)', region: 'Asia' },
  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur (MYT)', region: 'Asia' },
  { value: 'Asia/Manila', label: 'Manila (PHT)', region: 'Asia' },
  { value: 'Asia/Istanbul', label: 'Istanbul (TRT)', region: 'Asia' },
  { value: 'Asia/Tel_Aviv', label: 'Tel Aviv (IST)', region: 'Asia' },
  { value: 'Asia/Riyadh', label: 'Riyadh (AST)', region: 'Asia' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh (ICT)', region: 'Asia' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)', region: 'Australia' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEST)', region: 'Australia' },
  { value: 'Australia/Perth', label: 'Perth (AWST)', region: 'Australia' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST)', region: 'Pacific' },
  { value: 'Pacific/Fiji', label: 'Fiji (FJT)', region: 'Pacific' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)', region: 'South America' },
  { value: 'America/Mexico_City', label: 'Mexico City (CST)', region: 'North America' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (ART)', region: 'South America' },
  { value: 'Africa/Cairo', label: 'Cairo (EET)', region: 'Africa' },
  { value: 'Africa/Lagos', label: 'Lagos (WAT)', region: 'Africa' },
  { value: 'Africa/Nairobi', label: 'Nairobi (EAT)', region: 'Africa' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)', region: 'Africa' }
];

// Group timezones by region
const GROUPED_TIMEZONES = COMMON_TIMEZONES.reduce((acc, tz) => {
  if (!acc[tz.region]) {
    acc[tz.region] = [];
  }
  acc[tz.region].push(tz);
  return acc;
}, {} as Record<string, typeof COMMON_TIMEZONES>);

interface TimezoneSelectoProps {
  selectedTimezone: string;
  onTimezoneChange: (timezone: string) => void;
  theme: Theme;
  className?: string;
  showLabel?: boolean;
}

const TimezoneSelector: React.FC<TimezoneSelectoProps> = ({ 
  selectedTimezone, 
  onTimezoneChange, 
  theme,
  className = "",
  showLabel = true
}) => {
  const [showTimezones, setShowTimezones] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentTimezoneLabel = useMemo(() => {
    const found = COMMON_TIMEZONES.find(tz => tz.value === selectedTimezone);
    return found ? found.label : formatTimezone(selectedTimezone);
  }, [selectedTimezone]);

  const filteredTimezones = useMemo(() => {
    if (!searchTerm) return GROUPED_TIMEZONES;
    
    const filtered = {};
    Object.entries(GROUPED_TIMEZONES).forEach(([region, timezones]) => {
      const matchingTimezones = timezones.filter(tz => 
        tz.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tz.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        region.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchingTimezones.length > 0) {
        filtered[region] = matchingTimezones;
      }
    });
    return filtered;
  }, [searchTerm]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowTimezones(false);
        setSearchTerm(''); // Clear search when closing
      }
    };

    if (showTimezones) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [showTimezones]);

  const handleTimezoneSelect = (timezone: string) => {
    onTimezoneChange(timezone);
    setShowTimezones(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setShowTimezones(!showTimezones)}
        className="flex items-center space-x-2 text-sm hover:opacity-80 transition-opacity"
        style={{ color: theme.mainLightColor }}
        title="Select timezone"
      >
        <Globe className="h-4 w-4 flex-shrink-0" />
        {showLabel && (
          <span className="truncate max-w-[150px]">{currentTimezoneLabel}</span>
        )}
        <ChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform ${showTimezones ? 'rotate-180' : ''}`} />
      </button>

      {showTimezones && (
        <div 
          className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden"
          style={{
            backgroundColor: theme.isDark ? '#1a1a1a' : '#ffffff',
            borderColor: theme.isDark ? '#333' : '#e5e5e5',
            boxShadow: theme.isDark ? '0 10px 25px rgba(0,0,0,0.5)' : '0 10px 25px rgba(0,0,0,0.15)'
          }}
        >
          {/* Header */}
          <div 
            className="px-3 py-2 border-b"
            style={{ 
              borderColor: theme.isDark ? '#333' : '#e5e5e5',
              backgroundColor: theme.isDark ? '#2a2a2a' : '#f8f9fa'
            }}
          >
            <span className="text-sm font-medium" style={{ color: theme.isDark ? '#fff' : '#000' }}>
              Select Timezone
            </span>
          </div>

          {/* Search Input */}
          <div className="p-3 border-b" style={{ borderColor: theme.isDark ? '#333' : '#e5e5e5' }}>
            <input
              type="text"
              placeholder="Search timezones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm outline-none"
              style={{
                backgroundColor: theme.isDark ? '#2a2a2a' : '#f8f9fa',
                color: theme.isDark ? '#fff' : '#000',
                border: `1px solid ${theme.isDark ? '#333' : '#ddd'}`
              }}
              autoFocus
            />
          </div>

          {/* Timezone List */}
          <div className="max-h-80 overflow-y-auto">
            {Object.entries(filteredTimezones).map(([region, timezones]) => (
              <div key={region}>
                {/* Region Header */}
                <div 
                  className="px-3 py-2 text-xs font-semibold uppercase tracking-wide sticky top-0"
                  style={{
                    backgroundColor: theme.isDark ? '#2a2a2a' : '#f8f9fa',
                    color: theme.isDark ? '#888' : '#666',
                    borderBottom: `1px solid ${theme.isDark ? '#333' : '#eee'}`
                  }}
                >
                  {region}
                </div>

                {/* Timezone Options */}
                {timezones.map((timezone) => {
                  const isSelected = selectedTimezone === timezone.value;
                  const currentTime = DateTime.now().setZone(timezone.value).toFormat('HH:mm');
                  
                  return (
                    <button
                      key={timezone.value}
                      onClick={() => handleTimezoneSelect(timezone.value)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-opacity-10 hover:bg-gray-500 transition-colors ${
                        isSelected ? 'font-medium' : ''
                      }`}
                      style={{
                        color: isSelected ? theme.mainLightColor : (theme.isDark ? '#fff' : '#000'),
                        backgroundColor: isSelected ? 
                          (theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)') : 
                          'transparent'
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{timezone.label}</div>
                          {isSelected && (
                            <div className="text-xs opacity-75 truncate">{timezone.value}</div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                          {isSelected && (
                            <span className="text-xs opacity-75">✓</span>
                          )}
                          <span 
                            className="text-xs font-mono px-1 py-0.5 rounded"
                            style={{
                              backgroundColor: theme.isDark ? '#333' : '#f0f0f0',
                              color: theme.isDark ? '#ccc' : '#666'
                            }}
                          >
                            {currentTime}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
            
            {Object.keys(filteredTimezones).length === 0 && (
              <div className="px-3 py-8 text-center text-sm" style={{ color: theme.isDark ? '#888' : '#666' }}>
                <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div>No timezones found</div>
                <div className="text-xs opacity-75 mt-1">Try a different search term</div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div 
            className="px-3 py-2 border-t text-xs opacity-75"
            style={{ 
              borderColor: theme.isDark ? '#333' : '#e5e5e5',
              color: theme.isDark ? '#888' : '#666'
            }}
          >
            Times shown are current local times
          </div>
        </div>
      )}
    </div>
  );
};

export default TimezoneSelector;