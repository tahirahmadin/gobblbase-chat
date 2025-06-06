/**
 * Ultra simple timezone detection - just use IP timezone directly
 * No VPN detection, no system comparison, no complexity
 */

 import { isValidTimezone, getUserTimezone } from './timezoneUtils';

 // Single reliable IP service
 const IP_SERVICE_URL = 'https://ipapi.co/json/';
 
 interface IPLocationResponse {
   timezone?: string;
   country_name?: string;
   city?: string;
   ip?: string;
   error?: boolean;
 }
 
 /**
  * Get timezone from IP geolocation
  */
 async function getTimezoneFromIP(): Promise<IPLocationResponse | null> {
   try {
     console.log('🌐 Getting timezone from IP...');
     
     const controller = new AbortController();
     const timeoutId = setTimeout(() => controller.abort(), 5000);
     
     const response = await fetch(IP_SERVICE_URL, {
       signal: controller.signal,
       headers: {
         'Accept': 'application/json',
       }
     });
     
     clearTimeout(timeoutId);
     
     if (!response.ok) {
       throw new Error(`HTTP ${response.status}: ${response.statusText}`);
     }
     
     const data = await response.json();
     
     if (data.error) {
       throw new Error('IP service returned error');
     }
     
     console.log('✅ IP detection result:', {
       timezone: data.timezone,
       location: `${data.city}, ${data.country_name}`
     });
     
     return {
       timezone: data.timezone,
       country_name: data.country_name,
       city: data.city,
       ip: data.ip,
       error: false
     };
     
   } catch (error) {
     console.warn('❌ IP timezone detection failed:', error.message);
     return null;
   }
 }
 
 /**
  * Dead simple: just get timezone from IP and use it
  * Falls back to system timezone if IP detection fails
  */
 export async function detectUserTimezone(): Promise<string> {
   try {
     const ipResult = await getTimezoneFromIP();
     
     if (ipResult?.timezone && isValidTimezone(ipResult.timezone)) {
       console.log(`🌍 Using IP timezone: ${ipResult.timezone}`);
       return ipResult.timezone;
     }
     
     throw new Error('No valid timezone from IP');
     
   } catch (error) {
     console.warn('🔄 IP detection failed, using system timezone');
     const systemTz = getUserTimezone();
     console.log(`⚙️ Using system timezone: ${systemTz}`);
     return systemTz;
   }
 }
 
 /**
  * Quick timezone for immediate use (system timezone)
  * Use this for initial display before IP detection completes
  */
 export function getQuickTimezone(): string {
   return getUserTimezone();
 }
 
 /**
  * Get user's location info from IP (optional - for display purposes)
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
     console.warn('Failed to get location from IP:', error);
     return null;
   }
 }