/**
 * Frontend timezone utilities using Luxon for consistency with backend
 * This replaces your existing timezoneUtils.ts completely
 */

 import { DateTime } from 'luxon';

 /**
  * Validate if a timezone is valid (matches backend validation)
  */
 export const isValidTimezone = (timezone: string): boolean => {
   if (!timezone) return false;
   try {
     const dt = DateTime.now().setZone(timezone);
     return dt.isValid;
   } catch {
     return false;
   }
 };
 
 /**
  * Get user's detected timezone with fallback
  */
 export const getUserTimezone = (): string => {
   try {
     const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
     return isValidTimezone(detected) ? detected : 'UTC';
   } catch (error) {
     console.warn('Could not detect user timezone:', error);
     return 'UTC';
   }
 };
 
 /**
  * Convert a time from one timezone to another - SINGLE SOURCE OF TRUTH
  */
 export const convertTime = (
   timeStr: string, 
   dateStr: string, 
   sourceTimezone: string, 
   targetTimezone: string
 ): string => {
   try {
     if (sourceTimezone === targetTimezone) {
       return timeStr;
     }
 
     if (!timeStr || !dateStr || !sourceTimezone || !targetTimezone) {
       throw new Error('Missing required parameters for timezone conversion');
     }
 
     if (!isValidTimezone(sourceTimezone) || !isValidTimezone(targetTimezone)) {
       throw new Error(`Invalid timezone: ${sourceTimezone} or ${targetTimezone}`);
     }
 
     let isoDate = dateStr;
     if (dateStr.match(/^\d{2}-[A-Z]{3}-\d{4}$/)) {
       isoDate = convertAPIDateToISO(dateStr);
     }
 
     const sourceDateTime = DateTime.fromISO(`${isoDate}T${timeStr}:00`, {
       zone: sourceTimezone
     });
 
     if (!sourceDateTime.isValid) {
       throw new Error(`Invalid date/time: ${dateStr} ${timeStr} in ${sourceTimezone}`);
     }
 
     const targetDateTime = sourceDateTime.setZone(targetTimezone);
     return targetDateTime.toFormat('HH:mm');
 
   } catch (error) {
     console.error('Timezone conversion error:', error);
     console.warn('Using fallback: returning original time');
     return timeStr;
   }
 };
 
 /**
  * Convert time to UTC
  */
 export const toUTC = (timeStr: string, dateStr: string, timezone: string): string => {
   return convertTime(timeStr, dateStr, timezone, 'UTC');
 };
 
 /**
  * Convert time from UTC to specific timezone
  */
 export const fromUTC = (timeStr: string, dateStr: string, timezone: string): string => {
   return convertTime(timeStr, dateStr, 'UTC', timezone);
 };
 
 /**
  * Get the difference between two timezones
  */
 export const getTimezoneDifference = (
   timezone1: string, 
   timezone2: string, 
   date: Date = new Date()
 ): string => {
   if (timezone1 === timezone2) return "same timezone";
   
   try {
     const dt1 = DateTime.fromJSDate(date, { zone: timezone1 });
     const dt2 = DateTime.fromJSDate(date, { zone: timezone2 });
     
     const diffHours = (dt1.offset - dt2.offset) / 60;
     
     if (diffHours === 0) return "same time";
     
     const absDiff = Math.abs(diffHours);
     const diffFormatted = absDiff.toFixed(1).replace(/\.0$/, "");
     const plural = absDiff !== 1 ? "s" : "";
     
     return diffHours > 0
       ? `${diffFormatted} hour${plural} ahead`
       : `${diffFormatted} hour${plural} behind`;
   } catch (error) {
     console.error('Error calculating timezone difference:', error);
     return "unknown difference";
   }
 };
 
 /**
  * Format timezone for display
  */
 export const formatTimezone = (timezone: string): string => {
   try {
     if (!isValidTimezone(timezone)) {
       return timezone;
     }
     
     const date = new Date();
     const formatter = new Intl.DateTimeFormat('en-US', {
       timeZone: timezone,
       timeZoneName: 'short'
     });
     
     const parts = formatter.formatToParts(date);
     const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value;
     
     return timeZoneName || timezone;
   } catch (error) {
     console.error('Error formatting timezone:', error);
     return timezone;
   }
 };
 
 /**
  * Check if a time is in the past
  */
 export const isInPast = (dateStr: string, timeStr: string, timezone: string): boolean => {
   try {
     let isoDate = dateStr;
     if (dateStr.match(/^\d{2}-[A-Z]{3}-\d{4}$/)) {
       isoDate = convertAPIDateToISO(dateStr);
     }
 
     const slotDateTime = DateTime.fromISO(`${isoDate}T${timeStr}:00`, {
       zone: timezone
     });
     
     if (!slotDateTime.isValid) return true;
 
     const now = DateTime.now().setZone(timezone);
     return slotDateTime <= now;
   } catch (error) {
     console.error('Error checking if time is in past:', error);
     return true;
   }
 };
 
 /**
  * Format time to AM/PM
  */
 export const formatTimeToAMPM = (timeStr: string): string => {
   try {
     const [hours, minutes] = timeStr.split(':').map(Number);
     const period = hours >= 12 ? 'PM' : 'AM';
     const hour12 = hours % 12 || 12;
     return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
   } catch (error) {
     console.error('Error formatting time to AM/PM:', error);
     return timeStr;
   }
 };
 
 /**
  * Helper function to convert DD-MMM-YYYY to YYYY-MM-DD
  */
 const convertAPIDateToISO = (apiDate: string): string => {
   const months: Record<string, string> = {
     'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05', 'JUN': '06',
     'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
   };
   
   const [day, month, year] = apiDate.split('-');
   return `${year}-${months[month]}-${day}`;
 };
 
 // Backward compatibility
 export const convertTimeUniversal = convertTime;
 export const convertTimeRobust = convertTime;
 export const convertTimeBetweenZones = convertTime;