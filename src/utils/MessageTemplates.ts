// Create sets for tracking used message indices
const usedBookingUnavailableIndices = new Set<number>();
const usedBookingIntroIndices = new Set<number>();
const usedManagementIntroIndices = new Set<number>();
const usedProductIntroIndices = new Set<number>();
const usedProductUnavailableIndices = new Set<number>();
const usedContactIntroIndices = new Set<number>();

// Template messages moved from PublicChat
export const bookingUnavailableMessages: string[] = [
  "I'm sorry, but booking appointments is not available at this time. Is there anything else I can help you with?",
  "Unfortunately, our booking system is not currently set up. I apologize for the inconvenience. Is there something else I can assist you with?",
  "I wish I could help you book an appointment, but that feature isn't available right now. Would you like help with something else instead?",
  "Our scheduling system is currently offline. If you'd like to arrange an appointment, please contact us directly. Can I help with anything else in the meantime?",
  "We're still in the process of setting up our booking system. Until then, we're unable to process appointment requests through this chat. Is there another way I can assist you today?",
];

export const bookingManagementIntroMessages: string[] = [
  "I'll help you manage your upcoming appointments. Here are your confirmed bookings:",
  "Sure! Let me show you your scheduled appointments that you can reschedule or cancel:",
  "I understand you want to manage your bookings. Here are your upcoming appointments:",
  "No problem! Here are your confirmed bookings that you can modify:",
  "I can help you with that. Here are your scheduled appointments:",
];

export const productIntroMessages: string[] = [
  "Here's what I have available for you to browse:",
  "I'd be happy to show you our products. Take a look at what we offer:",
  "Great! Here are the products we currently have available:",
  "Sure thing! Here's our product catalog for you to browse:",
  "Of course! Take a look at our selection of products:",
];

export const productUnavailableMessages: string[] = [
  "I'm sorry, but we don't have any products available at the moment. Is there anything else I can help you with?",
  "Unfortunately, our product catalog is currently empty. Please check back later. Can I assist you with something else?",
  "We don't have any items for sale right now. Is there anything else you'd like to know?",
  "Our store is currently being updated and products aren't available for viewing. Would you like help with something else instead?",
  "I don't see any products in our catalog at the moment. Would you like to know more about our services instead?",
];

export const contactIntroMessages: string[] = [
  "I'd be happy to help you get in touch with us. Please fill out this form with your information:",
  "Sure, let me connect you with our team. Please share your details using this form:",
  "Great! To best assist you, please provide some information through this contact form:",
  "I'll help you reach out to our team. Please complete this contact form:",
  "Let's get you connected with our team. Please fill in your details below:",
];

export interface PricingInfo {
  isFreeSession: boolean;
  sessionPrice: string;
  sessionName: string;
  organizationName?: string;
  amount?: number; 
  currency?: string; 
}

const extractAmount = (sessionPrice: string): number => {
  if (!sessionPrice || sessionPrice.toLowerCase() === 'free') return 0;
  const numericValue = parseFloat(sessionPrice.replace(/[^0-9.]/g, ''));
  return isNaN(numericValue) ? 0 : numericValue;
};

const formatPrice = (pricingInfo: PricingInfo, globalCurrency: string): string => {
  if (pricingInfo.isFreeSession) return "free";
  
  const amount = pricingInfo.amount || extractAmount(pricingInfo.sessionPrice);
  const currency = pricingInfo.currency || globalCurrency;
  
  return amount > 0 ? `${amount} ${currency}` : "free";
};

// Utility function for selecting random unique messages
export const getRandomUniqueMessage = (
  messages: string[], 
  usedIndices: Set<number>
): string => {
  if (usedIndices.size >= messages.length) {
    usedIndices.clear();
  }

  let index: number;
  do {
    index = Math.floor(Math.random() * messages.length);
  } while (usedIndices.has(index));

  usedIndices.add(index);
  return messages[index];
};

// Export utility function with specific message sets
export const getRandomBookingUnavailableMessage = (): string => 
  getRandomUniqueMessage(bookingUnavailableMessages, usedBookingUnavailableIndices);

export const getRandomBookingManagementIntroMessage = (): string => 
  getRandomUniqueMessage(bookingManagementIntroMessages, usedManagementIntroIndices);

export const getRandomProductIntroMessage = (): string => 
  getRandomUniqueMessage(productIntroMessages, usedProductIntroIndices);

export const getRandomProductUnavailableMessage = (): string => 
  getRandomUniqueMessage(productUnavailableMessages, usedProductUnavailableIndices);

export const getRandomContactIntroMessage = (): string => 
  getRandomUniqueMessage(contactIntroMessages, usedContactIntroIndices);

export const getBookingIntroMessages = (
  pricingInfo: PricingInfo, 
  globalCurrency: string
): string[] => {
  const orgName = pricingInfo?.organizationName || "us";
  const sessionType = pricingInfo?.sessionName || "appointment";
  const formattedPrice = formatPrice(pricingInfo, globalCurrency);
  
  // Create dynamic price message
  const isPriceMessage = pricingInfo?.isFreeSession || formattedPrice === "free"
    ? "This is completely free!"
    : `The cost is ${formattedPrice}.`;

  return [
    `Great! You can schedule a ${sessionType} with ${orgName}. ${isPriceMessage} Please select a date and time that works for you:`,
    `I'd be happy to help you book a ${sessionType}! ${isPriceMessage} Just use the calendar below to find a time that works for you:`,
    `Perfect timing! We have availability for ${sessionType}s with ${orgName}. ${isPriceMessage} Please choose from the available slots below:`,
    `Absolutely! You can book a ${sessionType} right here. ${isPriceMessage} Take a look at our availability and select what works best for you:`,
    `I can help you schedule that ${sessionType}! ${isPriceMessage} Just browse through our available time slots and pick one that's convenient for you:`,
  ];
};

export const getRandomBookingIntroMessage = (
  pricingInfo: PricingInfo, 
  globalCurrency: string
): string => 
  getRandomUniqueMessage(
    getBookingIntroMessages(pricingInfo, globalCurrency), 
    usedBookingIntroIndices
  );

export const getCurrencySpecificMessages = (
  pricingInfo: PricingInfo,
  globalCurrency: string
): {
  freeMessages: string[];
  paidMessages: string[];
} => {
  const orgName = pricingInfo?.organizationName || "us";
  const sessionType = pricingInfo?.sessionName || "appointment";
  const formattedPrice = formatPrice(pricingInfo, globalCurrency);

  const freeMessages = [
    `Excellent! You can schedule a complimentary ${sessionType} with ${orgName}. There's no charge for this session. Please select your preferred time:`,
    `Great news! Our ${sessionType}s are offered at no cost. Simply choose a time that works best for you:`,
    `Perfect! We're offering free ${sessionType}s with ${orgName}. Pick a convenient time from our availability:`,
    `Wonderful! You can book a ${sessionType} with ${orgName} completely free of charge. Choose your preferred slot:`,
    `Amazing! Our ${sessionType}s are complimentary. Just select a time that fits your schedule:`,
  ];

  const paidMessages = [
    `Excellent! You can schedule a ${sessionType} with ${orgName} for ${formattedPrice}. Please select your preferred time and proceed with booking:`,
    `Great! Our ${sessionType}s are available for ${formattedPrice}. Choose a convenient time and complete your booking:`,
    `Perfect! You can book a ${sessionType} with ${orgName} for ${formattedPrice}. Select your preferred slot to get started:`,
    `Wonderful! Our ${sessionType}s are priced at ${formattedPrice}. Pick a time that works for you and proceed with payment:`,
    `Excellent! Book your ${sessionType} for ${formattedPrice}. Choose from our available time slots:`,
  ];

  return { freeMessages, paidMessages };
};

export const getRandomCurrencySpecificBookingMessage = (
  pricingInfo: PricingInfo,
  globalCurrency: string
): string => {
  const { freeMessages, paidMessages } = getCurrencySpecificMessages(pricingInfo, globalCurrency);
  const isFree = pricingInfo.isFreeSession || formatPrice(pricingInfo, globalCurrency) === "free";
  
  const messagesToUse = isFree ? freeMessages : paidMessages;
  return getRandomUniqueMessage(messagesToUse, usedBookingIntroIndices);
};

export { 
  formatPrice as formatBookingPrice,
  extractAmount as extractPriceAmount 
};