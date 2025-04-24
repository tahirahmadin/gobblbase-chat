// Country codes and their regex patterns
export const COUNTRY_CODES = [
    { code: "+1", country: "US/Canada", pattern: /^(\+?1)?\s*(\(?[2-9][0-8][0-9]\)?)\s*[-.]?\s*([2-9][0-9]{2})\s*[-.]?\s*([0-9]{4})$/ },
    { code: "+44", country: "UK", pattern: /^(\+?44)?\s*[0-9]{2,5}\s*[0-9]{6,8}$/ },
    // Updated pattern for India - more permissive to accept spaces and formatting
    { code: "+91", country: "India", pattern: /^(\+?91)?\s*[6-9][0-9\s-]{8,13}$/ },
    { code: "+49", country: "Germany", pattern: /^(\+?49)?\s*[0-9]{2,4}\s*[0-9]{6,8}$/ },
    { code: "+33", country: "France", pattern: /^(\+?33)?\s*[1-9][0-9]{8}$/ },
    { code: "+61", country: "Australia", pattern: /^(\+?61)?\s*[0-9]{9}$/ },
    { code: "+86", country: "China", pattern: /^(\+?86)?\s*[0-9]{10,11}$/ },
    { code: "+81", country: "Japan", pattern: /^(\+?81)?\s*[0-9]{9,10}$/ },
    { code: "+7", country: "Russia", pattern: /^(\+?7)?\s*[0-9]{10}$/ },
    { code: "+55", country: "Brazil", pattern: /^(\+?55)?\s*[0-9]{10,11}$/ },
    { code: "+27", country: "South Africa", pattern: /^(\+?27)?\s*[0-9]{9}$/ },
    { code: "+82", country: "South Korea", pattern: /^(\+?82)?\s*[0-9]{9,10}$/ },
    { code: "+52", country: "Mexico", pattern: /^(\+?52)?\s*[0-9]{10}$/ },
    { code: "+971", country: "UAE", pattern: /^(\+?971)?\s*[0-9]{9}$/ },
    { code: "+65", country: "Singapore", pattern: /^(\+?65)?\s*[0-9]{8}$/ },
  ];
  
  // General phone validation regex (more permissive)
  export const PHONE_REGEX = /^\+?[0-9\s()\-\.]{6,20}$/;
  
  /**
   * Detects the country code from a phone number
   */
  export const detectCountryCode = (phoneNumber: string, currentCode: string): string => {
    // Remove all non-digits
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    
    // Check if number starts with a country code (without the +)
    if (phoneNumber.startsWith('+')) {
      // Try to match the beginning of the number with known country codes
      for (const country of COUNTRY_CODES) {
        const code = country.code.substring(1); // Remove the '+'
        if (digitsOnly.startsWith(code)) {
          return country.code;
        }
      }
    }
    
    // Try to detect by common patterns if not explicitly marked with +
    if (digitsOnly.length >= 10) {
      // Check for specific country patterns
      if (digitsOnly.startsWith('91') && digitsOnly.length >= 12) {
        return "+91"; // India
      } else if (digitsOnly.startsWith('1') && digitsOnly.length >= 11) {
        return "+1"; // US/Canada
      } else if (digitsOnly.startsWith('44') && digitsOnly.length >= 11) {
        return "+44"; // UK
      } else if (digitsOnly.startsWith('49') && digitsOnly.length >= 11) {
        return "+49"; // Germany
      } else if (digitsOnly.startsWith('33') && digitsOnly.length >= 11) {
        return "+33"; // France
      }
      
      // If it's a 10-digit number with no detected country code and starts with 6-9, 
      // it might be an Indian mobile number
      if (digitsOnly.length === 10 && /^[6-9]/.test(digitsOnly)) {
        return "+91"; // India
      }
    }
    
    // Default to current selection if no match
    return currentCode;
  };
  
  /**
   * Formats a phone number based on country code
   */
  export const formatPhoneNumber = (value: string, countryCode: string): string => {
    // Strip all non-digits
    let digitsOnly = value.replace(/\D/g, '');
    
    // If empty, return empty
    if (!digitsOnly) return '';
    
    // If the number already includes the country code (without +), remove it for formatting
    const codeWithoutPlus = countryCode.substring(1); // Remove the '+'
    if (digitsOnly.startsWith(codeWithoutPlus)) {
      digitsOnly = digitsOnly.substring(codeWithoutPlus.length);
    }
    
    // Format based on country code
    switch (countryCode) {
      case "+1": // US/Canada: (XXX) XXX-XXXX
        if (digitsOnly.length <= 3) {
          return digitsOnly;
        } else if (digitsOnly.length <= 6) {
          return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
        } else {
          return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
        }
      
      case "+91": // India: XXXXX XXXXX for mobile
        if (digitsOnly.length <= 5) {
          return digitsOnly;
        } else {
          return `${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5, 10)}`;
        }
      
      case "+44": // UK: XXXX XXXXXX
        if (digitsOnly.length <= 4) {
          return digitsOnly;
        } else {
          return `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4)}`;
        }
      
      case "+49": // Germany: XXXX XXXXXX
        if (digitsOnly.length <= 4) {
          return digitsOnly;
        } else {
          return `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4)}`;
        }
        
      // Add more country-specific formatting as needed
        
      default: // Generic grouping for other countries: XXX XXX XXX
        // Group in threes
        return digitsOnly.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
    }
  };
  
  /**
   * Validates a phone number against country-specific pattern
   */
  export const validatePhone = (value: string, countryCode: string): { isValid: boolean; errorMessage: string } => {
    // Phone is optional
    if (!value) {
      return { isValid: true, errorMessage: "" };
    }
    
    // Remove formatting to check the actual digits
    const phoneDigits = value.replace(/\D/g, '');
    
    if (phoneDigits.length < 6) {
      return { isValid: false, errorMessage: "Phone number is too short" };
    }
    
    // Special case for India - check for exactly 10 digits (excluding country code)
    if (countryCode === "+91") {
      // Calculate actual digits without country code
      let nationalDigits = phoneDigits;
      if (phoneDigits.startsWith('91')) {
        nationalDigits = phoneDigits.substring(2);
      }
      
      // Check if it's a valid Indian mobile number format (10 digits starting with 6-9)
      if (nationalDigits.length !== 10) {
        return { 
          isValid: false, 
          errorMessage: "Indian mobile numbers must be 10 digits"
        };
      }
      
      if (!/^[6-9]/.test(nationalDigits)) {
        return {
          isValid: false,
          errorMessage: "Indian mobile numbers must start with 6, 7, 8, or 9"
        };
      }
      
      return { isValid: true, errorMessage: "" };
    }
    
    // For other countries, check against the pattern
    const countryInfo = COUNTRY_CODES.find(c => c.code === countryCode);
    
    if (countryInfo && countryInfo.pattern) {
      if (!countryInfo.pattern.test(value)) {
        return { 
          isValid: false, 
          errorMessage: `Invalid phone format for ${countryInfo.country}` 
        };
      }
    } else if (!PHONE_REGEX.test(value)) {
      return { isValid: false, errorMessage: "Please enter a valid phone number" };
    }
    
    return { isValid: true, errorMessage: "" };
  };
  
  /**
   * Creates a full international phone number
   */
  export const createInternationalPhone = (phoneNumber: string, countryCode: string): string => {
    if (!phoneNumber) return '';
    
    // Remove all non-digits and spaces
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    
    // Check if the number already has the country code
    const codeWithoutPlus = countryCode.substring(1);
    if (digitsOnly.startsWith(codeWithoutPlus)) {
      // Already has the country code
      return countryCode + ' ' + formatPhoneNumber(digitsOnly.substring(codeWithoutPlus.length), countryCode);
    } else {
      // Add the country code
      return countryCode + ' ' + formatPhoneNumber(digitsOnly, countryCode);
    }
  };