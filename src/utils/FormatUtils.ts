// Currency formatting utilities
export const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    CAD: "C$",
    AUD: "A$",
    JPY: "¥",
  };
  
  export interface PriceData {
    isFree: boolean;
    amount: number;
    currency: string;
  }
  
  export const formatPrice = (price?: PriceData): string => {
    if (!price) return "Free";
    
    if (price.isFree) return "Free";
    
    const symbol = CURRENCY_SYMBOLS[price.currency] || "$";
    return `${symbol}${price.amount}`;
  };