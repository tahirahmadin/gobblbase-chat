/**
 * Simple timezone detection with session caching
 */

 import { isValidTimezone, getUserTimezone } from './timezoneUtils';

 const IP_SERVICE_URL = 'https://ipapi.co/json/';
 
 interface IPLocationResponse {
   timezone?: string;
   country_name?: string;
   city?: string;
   ip?: string;
   error?: boolean;
 }
 
 interface CachedTimezone {
   timezone: string;
   timestamp: number;
   isFromIP: boolean;
 }
 
 // In-memory cache for session (since we can't use localStorage)
 let timezoneCache: CachedTimezone | null = null;
 const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
 
 /**
  * Get timezone from IP geolocation
  */
 async function getTimezoneFromIP(): Promise<IPLocationResponse | null> {
   try {
     const controller = new AbortController();
     const timeoutId = setTimeout(() => controller.abort(), 5000);
     
     const response = await fetch(IP_SERVICE_URL, {
       signal: controller.signal,
       headers: { 'Accept': 'application/json' }
     });
     
     clearTimeout(timeoutId);
     
     if (!response.ok) {
       throw new Error(`HTTP ${response.status}`);
     }
     
     const data = await response.json();
     
     if (data.error) {
       throw new Error('IP service error');
     }
     
     return {
       timezone: data.timezone,
       country_name: data.country_name,
       city: data.city,
       ip: data.ip,
       error: false
     };
     
   } catch (error) {
     return null;
   }
 }
 
 /**
  * Get timezone with caching - main detection function
  */
 export async function detectUserTimezone(): Promise<string> {
   // Check cache first
   if (timezoneCache && (Date.now() - timezoneCache.timestamp) < CACHE_DURATION) {
     return timezoneCache.timezone;
   }
 
   const systemTimezone = getUserTimezone();
   
   try {
     const ipResult = await getTimezoneFromIP();
     
     if (ipResult?.timezone && isValidTimezone(ipResult.timezone)) {
       // Cache the IP timezone
       timezoneCache = {
         timezone: ipResult.timezone,
         timestamp: Date.now(),
         isFromIP: true
       };
       return ipResult.timezone;
     }
     
     throw new Error('No valid IP timezone');
     
   } catch (error) {
     // Cache the system timezone as fallback
     timezoneCache = {
       timezone: systemTimezone,
       timestamp: Date.now(),
       isFromIP: false
     };
     return systemTimezone;
   }
 }
 
 /**
  * Quick timezone for immediate use - checks cache first
  */
 export function getQuickTimezone(): string {
   // If we have cached timezone, use it immediately
   if (timezoneCache && (Date.now() - timezoneCache.timestamp) < CACHE_DURATION) {
     return timezoneCache.timezone;
   }
   
   // Otherwise return system timezone
   return getUserTimezone();
 }
 
 /**
  * Check if we have a cached timezone from IP detection
  */
 export function hasCachedIPTimezone(): boolean {
   return timezoneCache?.isFromIP === true && (Date.now() - timezoneCache.timestamp) < CACHE_DURATION;
 }
 
 /**
  * Get user's location info from IP (optional)
  */
 export async function getUserLocationFromIP(): Promise<{ city: string; country: string } | null> {
   try {
     const ipResult = await getTimezoneFromIP();
     
     if (ipResult?.city && ipResult?.country_name) {
       return {
         city: ipResult.city,
         country: ipResult.country_name
       };
     }
     
     return null;
   } catch (error) {
     return null;
   }
 }