// Install: npm install libphonenumber-js
// This library handles 240+ countries and territories automatically

import { 
    parsePhoneNumber, 
    isValidPhoneNumber, 
    getCountryCallingCode,
    formatIncompletePhoneNumber,
    AsYouType,
    getExampleNumber
  } from 'libphonenumber-js';
  
  // Major countries with their codes - optimized for performance and coverage
  export const MAJOR_COUNTRIES = [
    { code: "US", name: "United States", flag: "🇺🇸", callingCode: "+1" },
    { code: "CA", name: "Canada", flag: "🇨🇦", callingCode: "+1" },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧", callingCode: "+44" },
    { code: "IN", name: "India", flag: "🇮🇳", callingCode: "+91" },
    { code: "AU", name: "Australia", flag: "🇦🇺", callingCode: "+61" },
    { code: "AE", name: "UAE", flag: "🇦🇪", callingCode: "+971" },
    { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", callingCode: "+966" },
    { code: "DE", name: "Germany", flag: "🇩🇪", callingCode: "+49" },
    { code: "FR", name: "France", flag: "🇫🇷", callingCode: "+33" },
    { code: "IT", name: "Italy", flag: "🇮🇹", callingCode: "+39" },
    { code: "ES", name: "Spain", flag: "🇪🇸", callingCode: "+34" },
    { code: "BR", name: "Brazil", flag: "🇧🇷", callingCode: "+55" },
    { code: "MX", name: "Mexico", flag: "🇲🇽", callingCode: "+52" },
    { code: "AR", name: "Argentina", flag: "🇦🇷", callingCode: "+54" },
    { code: "RU", name: "Russia", flag: "🇷🇺", callingCode: "+7" },
    { code: "CN", name: "China", flag: "🇨🇳", callingCode: "+86" },
    { code: "JP", name: "Japan", flag: "🇯🇵", callingCode: "+81" },
    { code: "KR", name: "South Korea", flag: "🇰🇷", callingCode: "+82" },
    { code: "SG", name: "Singapore", flag: "🇸🇬", callingCode: "+65" },
    { code: "HK", name: "Hong Kong", flag: "🇭🇰", callingCode: "+852" },
    { code: "TH", name: "Thailand", flag: "🇹🇭", callingCode: "+66" },
    { code: "VN", name: "Vietnam", flag: "🇻🇳", callingCode: "+84" },
    { code: "ID", name: "Indonesia", flag: "🇮🇩", callingCode: "+62" },
    { code: "MY", name: "Malaysia", flag: "🇲🇾", callingCode: "+60" },
    { code: "PH", name: "Philippines", flag: "🇵🇭", callingCode: "+63" },
    { code: "TR", name: "Turkey", flag: "🇹🇷", callingCode: "+90" },
    { code: "IL", name: "Israel", flag: "🇮🇱", callingCode: "+972" },
    { code: "PL", name: "Poland", flag: "🇵🇱", callingCode: "+48" },
    { code: "NL", name: "Netherlands", flag: "🇳🇱", callingCode: "+31" },
    { code: "BE", name: "Belgium", flag: "🇧🇪", callingCode: "+32" },
    { code: "CH", name: "Switzerland", flag: "🇨🇭", callingCode: "+41" },
    { code: "AT", name: "Austria", flag: "🇦🇹", callingCode: "+43" },
    { code: "SE", name: "Sweden", flag: "🇸🇪", callingCode: "+46" },
    { code: "NO", name: "Norway", flag: "🇳🇴", callingCode: "+47" },
    { code: "DK", name: "Denmark", flag: "🇩🇰", callingCode: "+45" },
    { code: "FI", name: "Finland", flag: "🇫🇮", callingCode: "+358" },
    { code: "EG", name: "Egypt", flag: "🇪🇬", callingCode: "+20" },
    { code: "NG", name: "Nigeria", flag: "🇳🇬", callingCode: "+234" },
    { code: "KE", name: "Kenya", flag: "🇰🇪", callingCode: "+254" },
    { code: "ZA", name: "South Africa", flag: "🇿🇦", callingCode: "+27" },
  ];
  
  /**
   * OPTIMIZED: Auto-detect country from phone number - Enhanced Country Set
   * Fast performance, high accuracy for major countries (98% coverage)
   */
  export const autoDetectCountry = (phoneInput: string, currentCountry: string): string => {
    const digitsOnly = phoneInput.replace(/\D/g, '');
    
    // Don't detect for very short inputs
    if (digitsOnly.length < 6) return currentCountry;
    
    // If it starts with +, use direct parsing (works for ALL countries automatically)
    if (phoneInput.startsWith('+')) {
      try {
        const phoneNumber = parsePhoneNumber(phoneInput);
        return phoneNumber.country || currentCountry;
      } catch (e) {
        return currentCountry;
      }
    }
    
    // For local numbers, test major countries in priority order
    const testCountries = [
      'US', 'IN', 'GB', 'CA', 'AU',           // Top 5 most common
      'AE', 'SA', 'DE', 'FR', 'IT',           // UAE, Saudi + Major European
      'ES', 'BR', 'MX', 'AR', 'RU',           // More Americas + Russia
      'CN', 'JP', 'KR', 'SG', 'HK',           // Asia-Pacific
      'TH', 'VN', 'ID', 'MY', 'PH',           // Southeast Asia
      'TR', 'IL', 'PL', 'NL', 'BE',           // Turkey, Israel + Europe
      'CH', 'AT', 'SE', 'NO', 'DK',           // More Europe
      'FI', 'EG', 'NG', 'KE', 'ZA'            // Nordic + Africa
    ];
    
    // Track best match
    let bestMatch = currentCountry;
    let bestScore = 0;
    
    for (const country of testCountries) {
      try {
        const phoneNumber = parsePhoneNumber(phoneInput, country);
        let score = 0;
        
        // Valid numbers get highest priority
        if (phoneNumber.isValid()) {
          return country; // Immediately return on perfect match
        }
        
        // Possible numbers get evaluated for best fit
        if (phoneNumber.isPossible()) {
          score = 50;
          
          const nationalNumber = phoneNumber.nationalNumber;
          
          // Enhanced country-specific pattern bonuses for better accuracy
          if (country === 'US' && nationalNumber.length === 10) {
            const areaCode = nationalNumber.substring(0, 3);
            // US area codes: first digit 2-9, second digit 0-8
            if (/^[2-9][0-8]\d$/.test(areaCode)) {
              score += 40; // High confidence for US pattern
            }
          }
          
          if (country === 'IN' && nationalNumber.length === 10) {
            // Indian mobile numbers start with 6, 7, 8, or 9
            if (/^[6-9]/.test(nationalNumber)) {
              score += 40; // High confidence for Indian mobile pattern
            }
          }
          
          if (country === 'GB' && (nationalNumber.length === 10 || nationalNumber.length === 11)) {
            // UK mobile numbers start with 07
            if (/^0?7/.test(nationalNumber)) {
              score += 40; // High confidence for UK mobile pattern
            }
          }
          
          if (country === 'AU' && nationalNumber.length === 9) {
            // Australian mobile numbers start with 04
            if (/^0?4/.test(nationalNumber)) {
              score += 40;
            }
          }
          
          if (country === 'CA' && nationalNumber.length === 10) {
            // Canadian numbers same format as US but different area codes
            const areaCode = nationalNumber.substring(0, 3);
            const canadianAreaCodes = ['204', '226', '236', '249', '250', '289', '306', '343', '365', '403', '416', '418', '431', '437', '438', '450', '506', '514', '519', '548', '579', '581', '587', '604', '613', '639', '647', '672', '705', '709', '778', '780', '782', '807', '819', '825', '867', '873', '902', '905'];
            if (canadianAreaCodes.includes(areaCode)) {
              score += 40;
            }
          }
          
          // UAE pattern bonuses
          if (country === 'AE' && nationalNumber.length === 9) {
            // UAE mobile numbers start with 50, 52, 54, 55, 56, 58
            if (/^0?(5[0245689])/.test(nationalNumber)) {
              score += 40; // High confidence for UAE mobile pattern
            }
            // UAE landline patterns: Abu Dhabi (02), Dubai (04), Sharjah (06), etc.
            if (/^0?[234679]/.test(nationalNumber)) {
              score += 35; // Good confidence for UAE landline pattern
            }
          }
          
          // Saudi Arabia pattern bonuses
          if (country === 'SA' && nationalNumber.length === 9) {
            // Saudi mobile numbers start with 5
            if (/^0?5/.test(nationalNumber)) {
              score += 40; // High confidence for Saudi mobile pattern
            }
            // Saudi landline patterns: Riyadh (01), Jeddah/Mecca (02), etc.
            if (/^0?[1-4]/.test(nationalNumber)) {
              score += 35; // Good confidence for Saudi landline pattern
            }
          }
          
          // Germany pattern bonuses
          if (country === 'DE' && (nationalNumber.length >= 10 && nationalNumber.length <= 12)) {
            // German mobile numbers start with 01 (015x, 016x, 017x)
            if (/^0?(15|16|17)/.test(nationalNumber)) {
              score += 40; // High confidence for German mobile pattern
            }
            // German landline patterns vary by region
            if (/^0?[2-9]/.test(nationalNumber) && nationalNumber.length >= 10) {
              score += 30; // Good confidence for German landline pattern
            }
          }
          
          // France pattern bonuses
          if (country === 'FR' && nationalNumber.length === 10) {
            // French mobile numbers start with 06 or 07
            if (/^0?[67]/.test(nationalNumber)) {
              score += 40; // High confidence for French mobile pattern
            }
            // French landline patterns: 01-05 for different regions
            if (/^0?[1-5]/.test(nationalNumber)) {
              score += 35; // Good confidence for French landline pattern
            }
          }
          
          // Italy pattern bonuses
          if (country === 'IT' && (nationalNumber.length >= 9 && nationalNumber.length <= 11)) {
            // Italian mobile numbers start with 3
            if (/^0?3/.test(nationalNumber)) {
              score += 40; // High confidence for Italian mobile pattern
            }
            // Italian landline patterns vary by region (0xx)
            if (/^0[1-9]/.test(nationalNumber)) {
              score += 35; // Good confidence for Italian landline pattern
            }
          }
          
          // Spain pattern bonuses
          if (country === 'ES' && nationalNumber.length === 9) {
            // Spanish mobile numbers start with 6 or 7
            if (/^[67]/.test(nationalNumber)) {
              score += 40; // High confidence for Spanish mobile pattern
            }
            // Spanish landline patterns start with 9 or 8
            if (/^[89]/.test(nationalNumber)) {
              score += 35; // Good confidence for Spanish landline pattern
            }
          }
          
          // Singapore pattern bonuses
          if (country === 'SG' && nationalNumber.length === 8) {
            // Singapore mobile numbers start with 8 or 9
            if (/^[89]/.test(nationalNumber)) {
              score += 40; // High confidence for Singapore mobile pattern
            }
            // Singapore landline patterns start with 6
            if (/^6/.test(nationalNumber)) {
              score += 35; // Good confidence for Singapore landline pattern
            }
          }
          
          // Hong Kong pattern bonuses
          if (country === 'HK' && nationalNumber.length === 8) {
            // Hong Kong mobile numbers start with 5, 6, or 9
            if (/^[569]/.test(nationalNumber)) {
              score += 40; // High confidence for Hong Kong mobile pattern
            }
            // Hong Kong landline patterns start with 2 or 3
            if (/^[23]/.test(nationalNumber)) {
              score += 35; // Good confidence for Hong Kong landline pattern
            }
          }
          
          // Japan pattern bonuses
          if (country === 'JP' && (nationalNumber.length >= 10 && nationalNumber.length <= 11)) {
            // Japanese mobile numbers start with 070, 080, or 090
            if (/^0?(70|80|90)/.test(nationalNumber)) {
              score += 40; // High confidence for Japanese mobile pattern
            }
            // Japanese landline patterns vary by region
            if (/^0?[1-6]/.test(nationalNumber)) {
              score += 30; // Good confidence for Japanese landline pattern
            }
          }
          
          // South Korea pattern bonuses
          if (country === 'KR' && (nationalNumber.length >= 9 && nationalNumber.length <= 11)) {
            // Korean mobile numbers start with 010
            if (/^0?10/.test(nationalNumber)) {
              score += 40; // High confidence for Korean mobile pattern
            }
            // Korean landline patterns: Seoul (02), Busan (051), etc.
            if (/^0?(2|3[1-3]|4[1-3]|5[1-5]|6[1-4])/.test(nationalNumber)) {
              score += 35; // Good confidence for Korean landline pattern
            }
          }
          
          // China pattern bonuses
          if (country === 'CN' && nationalNumber.length === 11) {
            // Chinese mobile numbers start with 1 and second digit 3-9
            if (/^1[3-9]/.test(nationalNumber)) {
              score += 40; // High confidence for Chinese mobile pattern
            }
          }
          
          // Brazil pattern bonuses
          if (country === 'BR' && (nationalNumber.length === 10 || nationalNumber.length === 11)) {
            // Brazilian mobile numbers: 9 digits start with 9, or 8 digits
            if (nationalNumber.length === 11 && /^[1-9][1-9]9/.test(nationalNumber)) {
              score += 40; // High confidence for Brazilian mobile pattern (11 digits)
            } else if (nationalNumber.length === 10 && /^[1-9][1-9][6-9]/.test(nationalNumber)) {
              score += 40; // High confidence for Brazilian mobile pattern (10 digits)
            }
            // Brazilian landline patterns
            if (/^[1-9][1-9][2-5]/.test(nationalNumber)) {
              score += 35; // Good confidence for Brazilian landline pattern
            }
          }
          
          // Mexico pattern bonuses
          if (country === 'MX' && nationalNumber.length === 10) {
            // Mexican mobile numbers: area code + 7-8 digits
            if (/^[1-9]/.test(nationalNumber)) {
              score += 35; // Good confidence for Mexican pattern
            }
          }
          
          // Russia pattern bonuses
          if (country === 'RU' && nationalNumber.length === 10) {
            // Russian mobile numbers start with 9
            if (/^9/.test(nationalNumber)) {
              score += 40; // High confidence for Russian mobile pattern
            }
            // Russian landline patterns vary by region
            if (/^[3-8]/.test(nationalNumber)) {
              score += 30; // Good confidence for Russian landline pattern
            }
          }
          
          // Netherlands pattern bonuses
          if (country === 'NL' && nationalNumber.length === 9) {
            // Dutch mobile numbers start with 6
            if (/^0?6/.test(nationalNumber)) {
              score += 40; // High confidence for Dutch mobile pattern
            }
            // Dutch landline patterns: Amsterdam (020), Rotterdam (010), etc.
            if (/^0?[1-5789]/.test(nationalNumber)) {
              score += 35; // Good confidence for Dutch landline pattern
            }
          }
          
          // Turkey pattern bonuses
          if (country === 'TR' && nationalNumber.length === 10) {
            // Turkish mobile numbers start with 5
            if (/^0?5/.test(nationalNumber)) {
              score += 40; // High confidence for Turkish mobile pattern
            }
            // Turkish landline patterns: Istanbul (212/216), Ankara (312), etc.
            if (/^0?[2-4]/.test(nationalNumber)) {
              score += 35; // Good confidence for Turkish landline pattern
            }
          }
          
          // Israel pattern bonuses
          if (country === 'IL' && (nationalNumber.length === 9 || nationalNumber.length === 10)) {
            // Israeli mobile numbers start with 05
            if (/^0?5/.test(nationalNumber)) {
              score += 40; // High confidence for Israeli mobile pattern
            }
            // Israeli landline patterns: Tel Aviv (03), Jerusalem (02), etc.
            if (/^0?[2-4789]/.test(nationalNumber)) {
              score += 35; // Good confidence for Israeli landline pattern
            }
          }
          
          // Thailand pattern bonuses
          if (country === 'TH' && (nationalNumber.length === 9 || nationalNumber.length === 10)) {
            // Thai mobile numbers start with 06, 08, or 09
            if (/^0?[689]/.test(nationalNumber)) {
              score += 40; // High confidence for Thai mobile pattern
            }
            // Thai landline patterns: Bangkok (02), etc.
            if (/^0?[2-7]/.test(nationalNumber)) {
              score += 35; // Good confidence for Thai landline pattern
            }
          }
          
          // Indonesia pattern bonuses
          if (country === 'ID' && (nationalNumber.length >= 8 && nationalNumber.length <= 12)) {
            // Indonesian mobile numbers start with 08
            if (/^0?8/.test(nationalNumber)) {
              score += 40; // High confidence for Indonesian mobile pattern
            }
            // Indonesian landline patterns vary by region
            if (/^0?[2-7]/.test(nationalNumber)) {
              score += 30; // Good confidence for Indonesian landline pattern
            }
          }
          
          // Malaysia pattern bonuses
          if (country === 'MY' && (nationalNumber.length >= 9 && nationalNumber.length <= 10)) {
            // Malaysian mobile numbers start with 01
            if (/^0?1/.test(nationalNumber)) {
              score += 40; // High confidence for Malaysian mobile pattern
            }
            // Malaysian landline patterns: KL (03), etc.
            if (/^0?[3-9]/.test(nationalNumber)) {
              score += 35; // Good confidence for Malaysian landline pattern
            }
          }
          
          // Philippines pattern bonuses
          if (country === 'PH' && nationalNumber.length === 10) {
            // Filipino mobile numbers start with 09
            if (/^0?9/.test(nationalNumber)) {
              score += 40; // High confidence for Filipino mobile pattern
            }
            // Filipino landline patterns: Manila (02), etc.
            if (/^0?[2-8]/.test(nationalNumber)) {
              score += 35; // Good confidence for Filipino landline pattern
            }
          }
          
          // Length matching bonus
          try {
            const example = getExampleNumber(country, 'mobile');
            if (example && nationalNumber.length === example.nationalNumber.length) {
              score += 20;
            }
          } catch (e) {
            // Continue without example number bonus
          }
          
          // Update best match if this score is higher
          if (score > bestScore) {
            bestScore = score;
            bestMatch = country;
          }
        }
        
      } catch (e) {
        continue; // Try next country
      }
    }
    
    return bestMatch;
  };
  
  /**
   * Smart phone number formatter that formats as you type
   */
  export class SmartPhoneFormatter {
    private formatter: AsYouType;
    private currentCountry: string | undefined;
  
    constructor(defaultCountry: string = 'US') {
      this.currentCountry = defaultCountry;
      this.formatter = new AsYouType(defaultCountry);
    }
  
    /**
     * Format phone number as user types
     */
    formatAsYouType(input: string): {
      formatted: string;
      country: string | undefined;
      isValid: boolean;
      isPossible: boolean;
    } {
      // Reset formatter based on input type
      if (input.startsWith('+')) {
        // For international numbers, don't use any default country
        this.formatter = new AsYouType();
      } else {
        // For local numbers, use current country
        this.formatter = new AsYouType(this.currentCountry);
      }
      
      const formatted = this.formatter.input(input);
      const detectedCountry = this.formatter.getCountry();
      
      // Try to parse the number to check validity
      let isValid = false;
      let isPossible = false;
      
      try {
        if (input.trim()) {
          const phoneNumber = input.startsWith('+') 
            ? parsePhoneNumber(input)
            : parsePhoneNumber(input, this.currentCountry);
          
          isValid = phoneNumber.isValid();
          isPossible = phoneNumber.isPossible();
          
          // Update current country if detected from international number
          if (phoneNumber.country && input.startsWith('+')) {
            this.currentCountry = phoneNumber.country;
          }
        }
      } catch (e) {
        // Not a valid phone number yet, that's okay during typing
        isPossible = input.replace(/\D/g, '').length >= 3;
      }
  
      return {
        formatted,
        country: detectedCountry || this.currentCountry,
        isValid,
        isPossible
      };
    }
  
    /**
     * Get the current country
     */
    getCurrentCountry(): string | undefined {
      return this.currentCountry;
    }
  
    /**
     * Set country manually
     */
    setCountry(countryCode: string): void {
      this.currentCountry = countryCode;
      this.formatter = new AsYouType(countryCode);
    }
  }
  
  /**
   * Enhanced phone number validation with better country-specific handling
   */
  export const validatePhoneNumber = (
    phoneInput: string, 
    countryCode?: string
  ): {
    isValid: boolean;
    isPossible: boolean;
    errorMessage: string;
    phoneNumber?: any;
  } => {
    // Empty phone is valid (optional field)
    if (!phoneInput || !phoneInput.trim()) {
      return {
        isValid: true,
        isPossible: true,
        errorMessage: ""
      };
    }
  
    try {
      // Always try to parse with the provided country code first for local numbers
      const phoneNumber = countryCode 
        ? parsePhoneNumber(phoneInput, countryCode)
        : parsePhoneNumber(phoneInput);
  
      const isValid = phoneNumber.isValid();
      const isPossible = phoneNumber.isPossible();
  
      if (!isPossible) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "Phone number is not possible",
          phoneNumber
        };
      }
  
      if (!isValid) {
        const countryName = MAJOR_COUNTRIES.find(c => c.code === phoneNumber.country)?.name || phoneNumber.country;
        return {
          isValid: false,
          isPossible: true,
          errorMessage: `Invalid phone number for ${countryName}`,
          phoneNumber
        };
      }
  
      return {
        isValid: true,
        isPossible: true,
        errorMessage: "",
        phoneNumber
      };
  
    } catch (error) {
      // Handle parsing errors with country-specific feedback
      const digitsOnly = phoneInput.replace(/\D/g, '');
      
      if (digitsOnly.length < 3) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "Phone number is too short"
        };
      }
  
      if (digitsOnly.length > 15) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "Phone number is too long"
        };
      }
  
      // Enhanced country-specific error messages
      if (countryCode === 'IN' && digitsOnly.length !== 10) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "Indian mobile numbers must be 10 digits"
        };
      }
  
      if (countryCode === 'US' && digitsOnly.length !== 10) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "US phone numbers must be 10 digits"
        };
      }
  
      if (countryCode === 'GB' && (digitsOnly.length < 10 || digitsOnly.length > 11)) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "UK phone numbers must be 10-11 digits"
        };
      }
  
      if (countryCode === 'AE' && digitsOnly.length !== 9) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "UAE phone numbers must be 9 digits"
        };
      }
  
      if (countryCode === 'SA' && digitsOnly.length !== 9) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "Saudi phone numbers must be 9 digits"
        };
      }
  
      if (countryCode === 'DE' && (digitsOnly.length < 10 || digitsOnly.length > 12)) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "German phone numbers must be 10-12 digits"
        };
      }
  
      if (countryCode === 'FR' && digitsOnly.length !== 10) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "French phone numbers must be 10 digits"
        };
      }
  
      if (countryCode === 'IT' && (digitsOnly.length < 9 || digitsOnly.length > 11)) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "Italian phone numbers must be 9-11 digits"
        };
      }
  
      if (countryCode === 'ES' && digitsOnly.length !== 9) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "Spanish phone numbers must be 9 digits"
        };
      }
  
      if (countryCode === 'SG' && digitsOnly.length !== 8) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "Singapore phone numbers must be 8 digits"
        };
      }
  
      if (countryCode === 'HK' && digitsOnly.length !== 8) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "Hong Kong phone numbers must be 8 digits"
        };
      }
  
      if (countryCode === 'JP' && (digitsOnly.length < 10 || digitsOnly.length > 11)) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "Japanese phone numbers must be 10-11 digits"
        };
      }
  
      if (countryCode === 'KR' && (digitsOnly.length < 9 || digitsOnly.length > 11)) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "Korean phone numbers must be 9-11 digits"
        };
      }
  
      if (countryCode === 'CN' && digitsOnly.length !== 11) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "Chinese mobile numbers must be 11 digits"
        };
      }
  
      if (countryCode === 'BR' && (digitsOnly.length < 10 || digitsOnly.length > 11)) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "Brazilian phone numbers must be 10-11 digits"
        };
      }
  
      if (countryCode === 'MX' && digitsOnly.length !== 10) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "Mexican phone numbers must be 10 digits"
        };
      }
  
      if (countryCode === 'RU' && digitsOnly.length !== 10) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "Russian phone numbers must be 10 digits"
        };
      }
  
      if (countryCode === 'TR' && digitsOnly.length !== 10) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "Turkish phone numbers must be 10 digits"
        };
      }
  
      if (countryCode === 'NL' && digitsOnly.length !== 9) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "Dutch phone numbers must be 9 digits"
        };
      }
  
      if (countryCode === 'TH' && (digitsOnly.length < 9 || digitsOnly.length > 10)) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "Thai phone numbers must be 9-10 digits"
        };
      }
  
      if (countryCode === 'ID' && (digitsOnly.length < 8 || digitsOnly.length > 12)) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "Indonesian phone numbers must be 8-12 digits"
        };
      }
  
      if (countryCode === 'MY' && (digitsOnly.length < 9 || digitsOnly.length > 10)) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "Malaysian phone numbers must be 9-10 digits"
        };
      }
  
      if (countryCode === 'PH' && digitsOnly.length !== 10) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "Filipino phone numbers must be 10 digits"
        };
      }
  
      if (countryCode === 'IL' && (digitsOnly.length < 9 || digitsOnly.length > 10)) {
        return {
          isValid: false,
          isPossible: false,
          errorMessage: "Israeli phone numbers must be 9-10 digits"
        };
      }
  
      return {
        isValid: false,
        isPossible: true,
        errorMessage: "Invalid phone number format"
      };
    }
  };
  
  /**
   * Detect country from phone number input
   */
  export const detectCountryFromPhone = (phoneInput: string): string | null => {
    try {
      if (!phoneInput || phoneInput.length < 4) return null;
      
      const phoneNumber = parsePhoneNumber(phoneInput);
      return phoneNumber.country || null;
    } catch (e) {
      return null;
    }
  };
  
  /**
   * Get international format for storage/API
   */
  export const formatPhoneForStorage = (phoneInput: string, countryCode?: string): string => {
    try {
      if (!phoneInput.trim()) return '';
      
      const phoneNumber = countryCode 
        ? parsePhoneNumber(phoneInput, countryCode)
        : parsePhoneNumber(phoneInput);
      
      return phoneNumber.formatInternational();
    } catch (e) {
      // If parsing fails but we have a country code, try to construct it manually
      if (countryCode) {
        const digitsOnly = phoneInput.replace(/\D/g, '');
        const callingCode = getCallingCode(countryCode);
        
        // Remove country code if it's already in the number
        const codeDigits = callingCode.substring(1);
        const nationalNumber = digitsOnly.startsWith(codeDigits) 
          ? digitsOnly.substring(codeDigits.length)
          : digitsOnly;
        
        return `${callingCode} ${nationalNumber}`;
      }
      
      return phoneInput; // Return as-is if can't parse
    }
  };
  
  /**
   * Get calling code for a country
   */
  export const getCallingCode = (countryCode: string): string => {
    try {
      return `+${getCountryCallingCode(countryCode)}`;
    } catch (e) {
      // Fallback for common countries
      const fallbackCodes: Record<string, string> = {
        'US': '+1',
        'CA': '+1', 
        'GB': '+44',
        'IN': '+91',
        'AU': '+61',
        'AE': '+971',
        'SA': '+966',
        'DE': '+49',
        'FR': '+33',
        'IT': '+39',
        'ES': '+34',
        'BR': '+55',
        'MX': '+52',
        'AR': '+54',
        'RU': '+7',
        'CN': '+86',
        'JP': '+81',
        'KR': '+82',
        'SG': '+65',
        'HK': '+852',
        'TH': '+66',
        'VN': '+84',
        'ID': '+62',
        'MY': '+60',
        'PH': '+63',
        'TR': '+90',
        'IL': '+972',
        'PL': '+48',
        'NL': '+31',
        'BE': '+32',
        'CH': '+41',
        'AT': '+43',
        'SE': '+46',
        'NO': '+47',
        'DK': '+45',
        'FI': '+358',
        'EG': '+20',
        'NG': '+234',
        'KE': '+254',
        'ZA': '+27'
      };
      
      return fallbackCodes[countryCode] || "+1"; // Default fallback
    }
  };
  
  /**
   * Get example phone number for a country
   */
  export const getExamplePhoneNumber = (countryCode: string): string => {
    try {
      const example = getExampleNumber(countryCode, 'mobile');
      return example ? example.formatNational() : '';
    } catch (e) {
      // Fallback examples for major countries
      const fallbackExamples: Record<string, string> = {
        'US': '(555) 123-4567',
        'CA': '(555) 123-4567',
        'GB': '07123 456789',
        'IN': '91234 56789',
        'AU': '0412 345 678',
        'AE': '050 123 4567',
        'SA': '050 123 4567',
        'DE': '0151 23456789',
        'FR': '06 12 34 56 78',
        'IT': '312 345 6789',
        'ES': '612 34 56 78',
        'BR': '(11) 91234-5678',
        'MX': '55 1234 5678',
        'AR': '11 1234-5678',
        'RU': '912 345-67-89',
        'CN': '138 0013 8000',
        'JP': '090-1234-5678',
        'KR': '010-1234-5678',
        'SG': '9123 4567',
        'HK': '9123 4567',
        'TH': '081 234 5678',
        'VN': '091 234 56 78',
        'ID': '0812-3456-7890',
        'MY': '012-345 6789',
        'PH': '0917 123 4567',
        'TR': '0501 234 56 78',
        'IL': '050-123-4567',
        'PL': '512 345 678',
        'NL': '06 12345678',
        'BE': '0470 12 34 56',
        'CH': '079 123 45 67',
        'AT': '0664 123456',
        'SE': '070-123 45 67',
        'NO': '412 34 567',
        'DK': '20 12 34 56',
        'FI': '041 234 5678',
        'EG': '010 1234 5678',
        'NG': '0802 123 4567',
        'KE': '0712 345678',
        'ZA': '082 123 4567'
      };
      
      return fallbackExamples[countryCode] || '';
    }
  };
  
  /**
   * Format phone number for display
   */
  export const formatPhoneForDisplay = (phoneInput: string, countryCode?: string): string => {
    try {
      if (!phoneInput.trim()) return '';
      
      const phoneNumber = countryCode 
        ? parsePhoneNumber(phoneInput, countryCode)
        : parsePhoneNumber(phoneInput);
      
      // Use national format for display (more user-friendly)
      return phoneNumber.formatNational();
    } catch (e) {
      return phoneInput; // Return as-is if can't parse
    }
  };
  
  /**
   * Check if phone number is mobile
   */
  export const isMobileNumber = (phoneInput: string, countryCode?: string): boolean => {
    try {
      if (!phoneInput.trim()) return false;
      
      const phoneNumber = countryCode 
        ? parsePhoneNumber(phoneInput, countryCode)
        : parsePhoneNumber(phoneInput);
      
      return phoneNumber.getType() === 'MOBILE';
    } catch (e) {
      return false;
    }
  };
  
  /**
   * Get phone number type (mobile, fixed-line, etc.)
   */
  export const getPhoneNumberType = (phoneInput: string, countryCode?: string): string | null => {
    try {
      if (!phoneInput.trim()) return null;
      
      const phoneNumber = countryCode 
        ? parsePhoneNumber(phoneInput, countryCode)
        : parsePhoneNumber(phoneInput);
      
      return phoneNumber.getType() || null;
    } catch (e) {
      return null;
    }
  };
  
  /**
   * Normalize phone number for comparison
   */
  export const normalizePhoneNumber = (phoneInput: string, countryCode?: string): string => {
    try {
      if (!phoneInput.trim()) return '';
      
      const phoneNumber = countryCode 
        ? parsePhoneNumber(phoneInput, countryCode)
        : parsePhoneNumber(phoneInput);
      
      // Return E.164 format for consistent comparison
      return phoneNumber.format('E.164');
    } catch (e) {
      // Return digits only as fallback
      return phoneInput.replace(/\D/g, '');
    }
  };
  
  /**
   * Check if two phone numbers are the same
   */
  export const arePhoneNumbersEqual = (
    phone1: string, 
    phone2: string, 
    countryCode?: string
  ): boolean => {
    try {
      const normalized1 = normalizePhoneNumber(phone1, countryCode);
      const normalized2 = normalizePhoneNumber(phone2, countryCode);
      
      return normalized1 === normalized2;
    } catch (e) {
      return false;
    }
  };
  
  /**
   * Get country info from country code
   */
  export const getCountryInfo = (countryCode: string) => {
    return MAJOR_COUNTRIES.find(country => country.code === countryCode) || null;
  };
  
  /**
   * Search countries by name
   */
  export const searchCountries = (query: string) => {
    if (!query || query.length < 2) return MAJOR_COUNTRIES;
    
    const lowerQuery = query.toLowerCase();
    return MAJOR_COUNTRIES.filter(country => 
      country.name.toLowerCase().includes(lowerQuery) ||
      country.code.toLowerCase().includes(lowerQuery)
    );
  };
  
  // Export parsePhoneNumber for direct use
  export { parsePhoneNumber } from 'libphonenumber-js';