/**
 * Enhanced timezone detection that considers VPN location
 * Integrates with existing timezoneUtils.ts
 * Improved VPN detection with reduced false positives
 */

 import { isValidTimezone, getUserTimezone } from './timezoneUtils';
 import { DateTime } from 'luxon';
 
 interface GeolocationResponse {
   timezone?: string;
   country_code?: string;
   country?: string;
   region?: string;
   city?: string;
   ip?: string;
   error?: boolean;
   message?: string;
 }
 
 interface TimezoneDetectionResult {
   timezone: string;
   source: 'ip' | 'system' | 'default';
   confidence: 'high' | 'medium' | 'low';
   location?: {
     country: string;
     city: string;
     ip: string;
   };
   debug?: string;
   vpnInfo?: any;
 }
 
 // Enhanced country timezone mapping with multiple timezones per country
 const COUNTRY_TIMEZONES: Record<string, string[]> = {
   'US': ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu'],
   'CA': ['America/Toronto', 'America/Vancouver', 'America/Winnipeg', 'America/Halifax', 'America/St_Johns'],
   'IN': ['Asia/Kolkata'], // India has single timezone
   'AU': ['Australia/Sydney', 'Australia/Melbourne', 'Australia/Perth', 'Australia/Adelaide', 'Australia/Brisbane', 'Australia/Darwin'],
   'BR': ['America/Sao_Paulo', 'America/Manaus', 'America/Fortaleza', 'America/Recife', 'America/Rio_Branco'],
   'RU': ['Europe/Moscow', 'Asia/Yekaterinburg', 'Asia/Novosibirsk', 'Asia/Vladivostok', 'Asia/Irkutsk'],
   'CN': ['Asia/Shanghai'], // China uses single timezone
   'MX': ['America/Mexico_City', 'America/Tijuana', 'America/Cancun', 'America/Chihuahua'],
   'GB': ['Europe/London'],
   'DE': ['Europe/Berlin'],
   'FR': ['Europe/Paris'],
   'IT': ['Europe/Rome'],
   'ES': ['Europe/Madrid'],
   'NL': ['Europe/Amsterdam'],
   'CH': ['Europe/Zurich'],
   'AT': ['Europe/Vienna'],
   'BE': ['Europe/Brussels'],
   'SE': ['Europe/Stockholm'],
   'NO': ['Europe/Oslo'],
   'DK': ['Europe/Copenhagen'],
   'FI': ['Europe/Helsinki'],
   'PL': ['Europe/Warsaw'],
   'TR': ['Asia/Istanbul'],
   'JP': ['Asia/Tokyo'],
   'KR': ['Asia/Seoul'],
   'SG': ['Asia/Singapore'],
   'HK': ['Asia/Hong_Kong'],
   'TW': ['Asia/Taipei'],
   'TH': ['Asia/Bangkok'],
   'VN': ['Asia/Ho_Chi_Minh'],
   'MY': ['Asia/Kuala_Lumpur'],
   'ID': ['Asia/Jakarta'],
   'PH': ['Asia/Manila'],
   'AE': ['Asia/Dubai'],
   'SA': ['Asia/Riyadh'],
   'IL': ['Asia/Tel_Aviv'],
   'NZ': ['Pacific/Auckland'],
   'FJ': ['Pacific/Fiji'],
   'CL': ['America/Santiago'],
   'PE': ['America/Lima'],
   'CO': ['America/Bogota'],
   'AR': ['America/Buenos_Aires'],
   'ZA': ['Africa/Johannesburg'],
   'EG': ['Africa/Cairo'],
   'NG': ['Africa/Lagos'],
   'KE': ['Africa/Nairobi'],
   'MA': ['Africa/Casablanca'],
 };
 
 // Mapping of countries to their most common/representative timezones (fallback)
 const COUNTRY_TO_TIMEZONE: Record<string, string> = {
   'US': 'America/New_York',
   'CA': 'America/Toronto',
   'MX': 'America/Mexico_City',
   'GB': 'Europe/London',
   'DE': 'Europe/Berlin',
   'FR': 'Europe/Paris',
   'IT': 'Europe/Rome',
   'ES': 'Europe/Madrid',
   'NL': 'Europe/Amsterdam',
   'CH': 'Europe/Zurich',
   'AT': 'Europe/Vienna',
   'BE': 'Europe/Brussels',
   'SE': 'Europe/Stockholm',
   'NO': 'Europe/Oslo',
   'DK': 'Europe/Copenhagen',
   'FI': 'Europe/Helsinki',
   'PL': 'Europe/Warsaw',
   'RU': 'Europe/Moscow',
   'TR': 'Asia/Istanbul',
   'IN': 'Asia/Kolkata',
   'CN': 'Asia/Shanghai',
   'JP': 'Asia/Tokyo',
   'KR': 'Asia/Seoul',
   'SG': 'Asia/Singapore',
   'HK': 'Asia/Hong_Kong',
   'TW': 'Asia/Taipei',
   'TH': 'Asia/Bangkok',
   'VN': 'Asia/Ho_Chi_Minh',
   'MY': 'Asia/Kuala_Lumpur',
   'ID': 'Asia/Jakarta',
   'PH': 'Asia/Manila',
   'AE': 'Asia/Dubai',
   'SA': 'Asia/Riyadh',
   'IL': 'Asia/Tel_Aviv',
   'AU': 'Australia/Sydney',
   'NZ': 'Pacific/Auckland',
   'FJ': 'Pacific/Fiji',
   'BR': 'America/Sao_Paulo',
   'CL': 'America/Santiago',
   'PE': 'America/Lima',
   'CO': 'America/Bogota',
   'AR': 'America/Buenos_Aires',
   'ZA': 'Africa/Johannesburg',
   'EG': 'Africa/Cairo',
   'NG': 'Africa/Lagos',
   'KE': 'Africa/Nairobi',
   'MA': 'Africa/Casablanca',
 };
 
 // Multiple IP geolocation services for redundancy
 const IP_SERVICES = [
   {
     name: 'ipapi.co',
     url: 'https://ipapi.co/json/',
     parser: (data: any): GeolocationResponse => ({
       timezone: data.timezone,
       country_code: data.country_code,
       country: data.country_name,
       region: data.region,
       city: data.city,
       ip: data.ip,
       error: data.error === true
     })
   },
   {
     name: 'ip-api.com',
     url: 'http://ip-api.com/json/',
     parser: (data: any): GeolocationResponse => ({
       timezone: data.timezone,
       country_code: data.countryCode,
       country: data.country,
       region: data.regionName,
       city: data.city,
       ip: data.query,
       error: data.status === 'fail'
     })
   },
   {
     name: 'ipinfo.io',
     url: 'https://ipinfo.io/json',
     parser: (data: any): GeolocationResponse => ({
       timezone: data.timezone,
       country_code: data.country,
       country: data.country,
       region: data.region,
       city: data.city,
       ip: data.ip,
       error: !!data.error
     })
   }
 ];
 
 /**
  * Calculate distance between two timezone offsets (in hours)
  */
 function getTimezoneOffsetDifference(tz1: string, tz2: string): number {
   try {
     const now = new Date();
     const dt1 = DateTime.fromJSDate(now, { zone: tz1 });
     const dt2 = DateTime.fromJSDate(now, { zone: tz2 });
     
     return Math.abs((dt1.offset - dt2.offset) / 60); // Convert minutes to hours
   } catch (error) {
     return 0;
   }
 }
 
 /**
  * Check if timezone belongs to detected country
  */
 function isTimezoneInCountry(timezone: string, countryCode: string): boolean {
   const countryTimezones = COUNTRY_TIMEZONES[countryCode] || [];
   return countryTimezones.includes(timezone);
 }
 
 /**
  * Fetch timezone from IP geolocation service
  */
 async function fetchTimezoneFromService(service: typeof IP_SERVICES[0]): Promise<GeolocationResponse> {
   try {
     console.log(`🌐 Attempting to detect timezone using ${service.name}...`);
     
     const controller = new AbortController();
     const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
     
     const response = await fetch(service.url, {
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
     const parsed = service.parser(data);
     
     console.log(`✅ ${service.name} response:`, parsed);
     
     if (parsed.error) {
       throw new Error(parsed.message || 'Service returned error');
     }
     
     return parsed;
   } catch (error) {
     console.warn(`❌ ${service.name} failed:`, error.message);
     throw error;
   }
 }
 
 /**
  * Try to get timezone from IP geolocation with fallbacks
  */
 async function getTimezoneFromIP(): Promise<GeolocationResponse | null> {
   for (const service of IP_SERVICES) {
     try {
       const result = await fetchTimezoneFromService(service);
       
       // Validate the timezone if provided
       if (result.timezone && isValidTimezone(result.timezone)) {
         console.log(`🎯 Valid timezone detected: ${result.timezone} via ${service.name}`);
         return result;
       }
       
       // If no timezone but we have country code, map to timezone
       if (result.country_code && COUNTRY_TO_TIMEZONE[result.country_code]) {
         const mappedTimezone = COUNTRY_TO_TIMEZONE[result.country_code];
         console.log(`🗺️ Mapped ${result.country_code} to timezone: ${mappedTimezone}`);
         return {
           ...result,
           timezone: mappedTimezone
         };
       }
       
     } catch (error) {
       // Continue to next service
       continue;
     }
   }
   
   console.warn('🚫 All IP geolocation services failed');
   return null;
 }
 
 /**
  * Enhanced VPN detection with reduced false positives
  */
 export async function detectVPNUsage(): Promise<{
   likelyVPN: boolean;
   systemTimezone: string;
   ipTimezone?: string;
   confidence: 'high' | 'medium' | 'low';
   reason?: string;
   countryMatch?: boolean;
   offsetDifference?: number;
 }> {
   const systemTimezone = getUserTimezone();
   
   try {
     const ipResult = await getTimezoneFromIP();
     
     if (ipResult?.timezone && ipResult?.country_code) {
       const ipTimezone = ipResult.timezone;
       const countryCode = ipResult.country_code;
       
       // Check if system timezone belongs to the detected country
       const systemInDetectedCountry = isTimezoneInCountry(systemTimezone, countryCode);
       
       // Calculate offset difference in hours
       const offsetDiff = getTimezoneOffsetDifference(systemTimezone, ipTimezone);
       
       // Enhanced VPN detection logic
       let likelyVPN = false;
       let confidence: 'high' | 'medium' | 'low' = 'low';
       let reason = '';
       
       console.log(`🔍 VPN Detection Analysis:`, {
         systemTimezone,
         ipTimezone,
         countryCode,
         systemInDetectedCountry,
         offsetDiff
       });
       
       if (systemTimezone === ipTimezone) {
         // Exact match - very unlikely to be VPN
         likelyVPN = false;
         confidence = 'high';
         reason = 'Timezones match exactly';
       } else if (systemInDetectedCountry) {
         // Different timezone but same country - probably not VPN
         // (e.g., user in US with ET timezone, IP detected as PT timezone)
         likelyVPN = false;
         confidence = 'medium';
         reason = 'Different timezone but same country';
       } else if (offsetDiff >= 8) {
         // Very large timezone difference (8+ hours) - very likely VPN
         likelyVPN = true;
         confidence = 'high';
         reason = `Very large timezone difference (${offsetDiff} hours)`;
       } else if (offsetDiff >= 4) {
         // Large timezone difference (4-8 hours) - likely VPN
         likelyVPN = true;
         confidence = 'medium';
         reason = `Large timezone difference (${offsetDiff} hours)`;
       } else if (offsetDiff >= 2) {
         // Medium difference - could be VPN or neighboring country
         likelyVPN = false; // Changed to false to reduce false positives
         confidence = 'low';
         reason = `Medium timezone difference (${offsetDiff} hours) - could be neighboring country or IP inaccuracy`;
       } else {
         // Small difference - probably not VPN (could be nearby country or IP inaccuracy)
         likelyVPN = false;
         confidence = 'low';
         reason = `Small timezone difference (${offsetDiff} hours) - likely IP geolocation inaccuracy`;
       }
       
       return {
         likelyVPN,
         systemTimezone,
         ipTimezone,
         confidence,
         reason,
         countryMatch: systemInDetectedCountry,
         offsetDifference: offsetDiff
       };
     }
   } catch (error) {
     console.warn('Enhanced VPN detection failed:', error);
   }
   
   return {
     likelyVPN: false,
     systemTimezone,
     confidence: 'low',
     reason: 'Unable to detect IP location'
   };
 }
 
 /**
  * Enhanced timezone detection that considers VPN location
  */
 export async function detectUserTimezone(): Promise<TimezoneDetectionResult> {
   console.log('🚀 Starting enhanced timezone detection...');
   
   try {
     // Get enhanced VPN detection
     const vpnDetection = await detectVPNUsage();
     
     // Get IP-based timezone
     const ipResult = await getTimezoneFromIP();
     
     if (ipResult && ipResult.timezone) {
       // Only suggest IP timezone if VPN confidence is high
       const shouldUseIPTimezone = vpnDetection.likelyVPN && vpnDetection.confidence === 'high';
       
       return {
         timezone: shouldUseIPTimezone ? ipResult.timezone : vpnDetection.systemTimezone,
         source: shouldUseIPTimezone ? 'ip' : 'system',
         confidence: vpnDetection.confidence,
         location: {
           country: ipResult.country || 'Unknown',
           city: ipResult.city || 'Unknown',
           ip: ipResult.ip || 'Unknown'
         },
         debug: vpnDetection.reason || 'Enhanced detection',
         vpnInfo: vpnDetection
       };
     }
   } catch (error) {
     console.warn('Enhanced timezone detection failed:', error);
   }
   
   // Fallback to system timezone using existing utility
   const systemTimezone = getUserTimezone();
   
   if (isValidTimezone(systemTimezone)) {
     console.log('⚙️ Using system timezone as fallback:', systemTimezone);
     return {
       timezone: systemTimezone,
       source: 'system',
       confidence: 'medium',
       debug: 'Using system timezone (IP detection failed)'
     };
   }
   
   // Final fallback to UTC
   console.warn('🔄 All detection methods failed, using UTC');
   return {
     timezone: 'UTC',
     source: 'default',
     confidence: 'low',
     debug: 'All detection methods failed, using UTC fallback'
   };
 }
 
 /**
  * Quick synchronous timezone detection for immediate use
  */
 export function getQuickTimezone(): string {
   return getUserTimezone();
 }