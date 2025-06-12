import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { formatTimezone } from '../../../utils/timezoneUtils';
import { DateTime } from 'luxon';
import { Theme } from '../../types';

const getConsistentTimezoneLabel = (timezone: string): string => {
  const found = COMMON_TIMEZONES.find(tz => tz.value === timezone);
  if (found) {
    return found.label;
  }
  
  try {
    return formatTimezone(timezone);
  } catch (error) {
    return timezone.split('/').pop()?.replace(/_/g, ' ') || timezone;
  }
};

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
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentTimezoneLabel = useMemo(() => {
    return getConsistentTimezoneLabel(selectedTimezone);
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
        setSearchTerm('');
      }
    };

    if (showTimezones) {
      document.addEventListener('mousedown', handleOutsideClick);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
        document.body.style.overflow = 'unset';
      };
    }
  }, [showTimezones]);

  const handleTimezoneSelect = (timezone: string) => {
    onTimezoneChange(timezone);
    setShowTimezones(false);
    setSearchTerm('');
  };

  const toggleDropdown = () => {
    setShowTimezones(!showTimezones);
  };

  // Always use modal-style UI (previously mobile-only)
  const getDropdownStyles = () => {
    return {
      backgroundColor: theme.isDark ? '#1a1a1a' : '#ffffff',
      borderColor: theme.isDark ? '#333' : '#e5e5e5',
      boxShadow: theme.isDark ? '0 8px 20px rgba(0,0,0,0.6)' : '0 8px 20px rgba(0,0,0,0.15)',
      position: 'fixed' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 'calc(100vw - 32px)',
      maxWidth: '420px',
      maxHeight: '50vh',
      borderRadius: '12px',
      zIndex: 9999,
      overflowY: 'hidden' as const,
    };
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="flex items-center space-x-1 text-xs hover:opacity-80 transition-opacity"
        style={{ color: theme.mainLightColor }}
        title="Select timezone"
      >
        <Globe className="h-3 w-3 flex-shrink-0" />
        {showLabel && (
          <span className="truncate max-w-[100px] text-xs">{currentTimezoneLabel}</span>
        )}
        <ChevronDown className={`h-3 w-3 flex-shrink-0 transition-transform ${showTimezones ? 'rotate-180' : ''}`} />
      </button>

      {showTimezones && (
        <>
          {/* Always show backdrop (modal-style) */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
            onClick={() => setShowTimezones(false)}
          />
          
          <div 
            className="rounded-lg shadow-lg border overflow-hidden"
            style={getDropdownStyles()}
          >
            {/* Header - Always show close button */}
            <div 
              className="px-4 py-2 border-b flex items-center justify-between"
              style={{ 
                borderColor: theme.isDark ? '#333' : '#e5e5e5',
                backgroundColor: theme.isDark ? '#2a2a2a' : '#f8f9fa'
              }}
            >
              <span className="text-sm font-medium" style={{ color: theme.isDark ? '#fff' : '#000' }}>
                Select Timezone
              </span>
              <button
                onClick={() => setShowTimezones(false)}
                className="text-lg opacity-70 hover:opacity-100 transition-opacity p-1 rounded hover:bg-black hover:bg-opacity-10"
                style={{ color: theme.isDark ? '#fff' : '#000' }}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="p-2 border-b" style={{ borderColor: theme.isDark ? '#333' : '#e5e5e5' }}>
              <input
                type="text"
                placeholder="Search timezones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md text-sm outline-none transition-colors focus:ring-2"
                style={{
                  backgroundColor: theme.isDark ? '#2a2a2a' : '#f8f9fa',
                  color: theme.isDark ? '#fff' : '#000',
                  border: `1px solid ${theme.isDark ? '#333' : '#ddd'}`,
                  focusRingColor: theme.mainLightColor
                }}
                autoFocus
              />
            </div>

            {/* Timezone List */}
            <div className="max-h-56 overflow-y-auto">
              {Object.entries(filteredTimezones).map(([region, timezones]) => (
                <div key={region}>
                  {/* Region Header */}
                  <div 
                    className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide sticky top-0 z-10"
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
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-opacity-10 hover:bg-gray-500 transition-colors ${
                          isSelected ? 'font-medium' : ''
                        }`}
                        style={{
                          color: isSelected ? theme.mainLightColor : (theme.isDark ? '#fff' : '#000'),
                          backgroundColor: isSelected ? 
                            (theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)') : 
                            'transparent'
                        }}
                      >
                        <div className="flex justify-between items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-medium">{timezone.label}</div>
                            {isSelected && (
                              <div className="text-xs opacity-75 truncate">{timezone.value}</div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            {isSelected && (
                              <span className="text-sm opacity-75">✓</span>
                            )}
                            <span 
                              className="text-xs font-mono px-2 py-0.5 rounded"
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
                <div className="px-4 py-8 text-center text-sm" style={{ color: theme.isDark ? '#888' : '#666' }}>
                  <Globe className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <div className="font-medium mb-1">No timezones found</div>
                  <div className="text-xs opacity-75">Try a different search term</div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div 
              className="px-4 py-1.5 border-t text-xs text-center opacity-75"
              style={{ 
                borderColor: theme.isDark ? '#333' : '#e5e5e5',
                color: theme.isDark ? '#888' : '#666',
                backgroundColor: theme.isDark ? '#2a2a2a' : '#f8f9fa'
              }}
            >
              Showing current local times
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export { getConsistentTimezoneLabel };

export default TimezoneSelector;