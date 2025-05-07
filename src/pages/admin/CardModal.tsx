import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  X, 
  Check, 
  AlertCircle
} from "lucide-react";

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cardData: NewCardData) => Promise<void>;
  loading: boolean;
}

interface NewCardData {
  cardType: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  default: boolean;
}

const CardModal: React.FC<CardModalProps> = ({ isOpen, onClose, onSubmit, loading }) => {
  const [cardData, setCardData] = useState<NewCardData>({
    cardType: "VISA",
    cardNumber: "",
    expiry: "",
    cvv: "",
    default: false
  });
  
  const [errors, setErrors] = useState({
    cardNumber: "",
    expiry: "",
    cvv: ""
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCardData({
        cardType: "VISA",
        cardNumber: "",
        expiry: "",
        cvv: "",
        default: false
      });
      setErrors({
        cardNumber: "",
        expiry: "",
        cvv: ""
      });
    }
  }, [isOpen]);

  // Auto-detect card type based on first digits
  useEffect(() => {
    const cardNumber = cardData.cardNumber.replace(/\s/g, "");
    
    if (cardNumber.startsWith("4")) {
      setCardData(prev => ({ ...prev, cardType: "VISA" }));
    } else if (/^5[1-5]/.test(cardNumber)) {
      setCardData(prev => ({ ...prev, cardType: "MASTERCARD" }));
    } else if (/^3[47]/.test(cardNumber)) {
      setCardData(prev => ({ ...prev, cardType: "AMEX" }));
    } else if (/^6(?:011|5)/.test(cardNumber)) {
      setCardData(prev => ({ ...prev, cardType: "DISCOVER" }));
    }
  }, [cardData.cardNumber]);

  // Format card number with spaces (4 digits groups)
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    
    // Limit to 16 digits
    const limitedDigits = digits.slice(0, 16);
    
    // Add spaces every 4 digits
    const formatted = limitedDigits.replace(/(\d{4})(?=\d)/g, "$1 ");
    
    return formatted;
  };
  
  // Format expiry date (MM/YY)
  const formatExpiryDate = (value: string) => {
    const digits = value.replace(/\D/g, "");
    
    // Limit to 4 digits
    const limitedDigits = digits.slice(0, 4);
    
    // Add slash after first 2 digits if there are more than 2
    if (limitedDigits.length > 2) {
      return `${limitedDigits.slice(0, 2)}/${limitedDigits.slice(2)}`;
    }
    
    return limitedDigits;
  };
  
  // Format CVV (limit to 3 or 4 digits)
  const formatCVV = (value: string) => {
    const digits = value.replace(/\D/g, "");
    // AMEX cards have 4-digit CVV, others have 3
    const maxLength = cardData.cardType === "AMEX" ? 4 : 3;
    return digits.slice(0, maxLength);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    if (name === "cardNumber") {
      setCardData(prev => ({
        ...prev,
        [name]: formatCardNumber(value)
      }));
    } else if (name === "expiry") {
      setCardData(prev => ({
        ...prev,
        [name]: formatExpiryDate(value)
      }));
    } else if (name === "cvv") {
      setCardData(prev => ({
        ...prev,
        [name]: formatCVV(value)
      }));
    } else {
      setCardData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }

    // Clear error when typing
    if (name in errors) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      cardNumber: "",
      expiry: "",
      cvv: ""
    };
    
    let isValid = true;
    
    // Validate card number (must be 16 digits without spaces)
    const cardNumber = cardData.cardNumber.replace(/\s/g, "");
    if (cardNumber.length !== 16) {
      newErrors.cardNumber = "Card number must be 16 digits";
      isValid = false;
    }
    
    // Validate expiry date (must be in MM/YY format)
    const expiry = cardData.expiry;
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      newErrors.expiry = "Expiry date must be in MM/YY format";
      isValid = false;
    } else {
      // Check if month is valid (01-12)
      const month = parseInt(expiry.slice(0, 2));
      if (month < 1 || month > 12) {
        newErrors.expiry = "Month must be between 01 and 12";
        isValid = false;
      }
      
      // Check if date is in the future
      const year = parseInt("20" + expiry.slice(3));
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiry = "Card has expired";
        isValid = false;
      }
    }
    
    // Validate CVV (must be 3 digits, or 4 for AMEX)
    const cvvLength = cardData.cardType === "AMEX" ? 4 : 3;
    if (cardData.cvv.length !== cvvLength) {
      newErrors.cvv = `CVV must be ${cvvLength} digits`;
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      await onSubmit(cardData);
    }
  };

  // Get card icon based on card type
  const getCardIcon = () => {
    switch (cardData.cardType) {
      case "VISA":
        return <div className="text-blue-600 font-bold text-sm">VISA</div>;
      case "MASTERCARD":
        return <div className="text-red-600 font-bold text-sm">MASTERCARD</div>;
      case "AMEX":
        return <div className="text-green-600 font-bold text-sm">AMEX</div>;
      case "DISCOVER":
        return <div className="text-orange-600 font-bold text-sm">DISCOVER</div>;
      default:
        return <CreditCard size={20} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Add Payment Method</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-5">
          {/* Credit Card Preview */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-5 text-white shadow-md">
            <div className="flex justify-between items-start mb-10">
              <div className="text-lg font-medium">
                {getCardIcon()}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs opacity-70">VALID THRU</span>
                <span>{cardData.expiry || "MM/YY"}</span>
              </div>
            </div>
            <div className="text-xl tracking-wider font-mono mb-4 min-h-[28px]">
              {cardData.cardNumber || "•••• •••• •••• ••••"}
            </div>
            <div className="text-sm">Card Holder</div>
          </div>
          
          {/* Card Number */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <div className="relative">
              <input
                type="text"
                name="cardNumber"
                value={cardData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                className={`w-full border rounded-lg px-4 py-3 pr-10 ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                autoComplete="cc-number"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getCardIcon()}
              </div>
            </div>
            {errors.cardNumber && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.cardNumber}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                name="expiry"
                value={cardData.expiry}
                onChange={handleInputChange}
                placeholder="MM/YY"
                className={`w-full border rounded-lg px-4 py-3 ${errors.expiry ? 'border-red-500' : 'border-gray-300'}`}
                autoComplete="cc-exp"
              />
              {errors.expiry && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.expiry}
                </p>
              )}
            </div>
            
            {/* CVV */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                type="text"
                name="cvv"
                value={cardData.cvv}
                onChange={handleInputChange}
                placeholder={cardData.cardType === "AMEX" ? "4 digits" : "3 digits"}
                className={`w-full border rounded-lg px-4 py-3 ${errors.cvv ? 'border-red-500' : 'border-gray-300'}`}
                autoComplete="cc-csc"
              />
              {errors.cvv && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.cvv}
                </p>
              )}
            </div>
          </div>
          
          {/* Default Payment Method Checkbox */}
          <div className="mb-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="default"
                checked={cardData.default}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
              />
              <span className="text-sm text-gray-700">Set as default payment method</span>
            </label>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </span>
              ) : (
                <span className="flex items-center">
                  <Check size={18} className="mr-1" />
                  Add Card
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;