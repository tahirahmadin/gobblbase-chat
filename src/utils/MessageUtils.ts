import { ChatMessage } from '../types';

// Utility functions for detecting message types

export const containsBookingManagementKeywords = (text: string): boolean => {
  const personalPhrases: string[] = [
    "my appointment", "my booking", "my meeting", "my scheduled",
    "i have an appointment", "i have a booking", "i have a meeting",
    "my existing", "my current",
  ];

  const lowerText = text.toLowerCase();

  const hasPersonalContext = personalPhrases.some((phrase) =>
    lowerText.includes(phrase)
  );

  if (
    lowerText.includes("reschedule") &&
    (lowerText.includes("appointment") ||
      lowerText.includes("booking") ||
      lowerText.includes("meeting"))
  ) {
    return true;
  }

  if (hasPersonalContext) {
    const managementActions: string[] = [
      "reschedule", "cancel", "change", "modify", "update",
      "manage", "view", "check", "see", "upcoming",
    ];

    return managementActions.some((action) => lowerText.includes(action));
  }

  const specificManagementPhrases: string[] = [
    "manage booking", "manage appointment", "manage meeting",
    "view bookings", "view appointments", "view meetings",
    "cancel booking", "cancel appointment", "cancel meeting",
    "reschedule booking", "reschedule appointment", "reschedule meeting",
    "change booking", "change appointment", "change meeting",
    "modify booking", "modify appointment", "modify meeting",
    "upcoming bookings", "upcoming appointments", "upcoming meetings",
    "scheduled bookings", "scheduled appointments", "scheduled meetings",
  ];

  return specificManagementPhrases.some((phrase) =>
    lowerText.includes(phrase)
  );
};

export const containsNewBookingKeywords = (text: string): boolean => {
  if (containsBookingManagementKeywords(text)) {
    return false;
  }

  const bookingPhrases: string[] = [
    "book new", "book a", "book an", "make appointment",
    "make a booking", "schedule new", "schedule a", "schedule an",
    "create appointment", "create booking", "set up appointment",
    "set up meeting", "arrange appointment", "arrange meeting",
    "arrange call", "reserve slot", "reserve time", "book slot",
    "book time", "i want to book", "i'd like to book", "can i book",
    "i need to book", "i want to schedule", "i'd like to schedule",
    "can i schedule", "i need to schedule", "i want an appointment",
    "i need an appointment", "available slots", "available times",
    "availability", "when can i", "when are you available",
    "book appointment", "book meeting", "book call",
    "schedule appointment", "schedule meeting", "schedule call",
    "make an appointment", "make a meeting", "reservation",
    "make reservation", "create reservation", "do a booking",
    "do booking",
  ];

  const lowerText = text.toLowerCase();
  return bookingPhrases.some((phrase) => lowerText.includes(phrase));
};

export const containsProductKeywords = (text: string): boolean => {
  const productKeywords: string[] = [
    "product", "products", "catalog", "catalogue", "shop",
    "store", "buy", "purchase", "order", "item", "items",
    "merchandise", "good", "goods", "sale", "shopping",
    "browse", "browsing",
  ];

  const productPhrases: string[] = [
    "show me what you have", "show me what you're selling",
    "what do you sell", "what are you selling", "what's for sale",
    "see your products", "view products", "display products",
    "what products", "check out products", "browse products",
    "buy something", "purchase something", "get something",
    "inventory", "stock", "collection", "selections", "offerings",
  ];

  const lowerText = text.toLowerCase();

  if (productPhrases.some((phrase) => lowerText.includes(phrase))) {
    return true;
  }

  for (const keyword of productKeywords) {
    if (lowerText.includes(keyword)) {
      const buyingPatterns: string[] = [
        `your ${keyword}`, `the ${keyword}`, `show ${keyword}`,
        `view ${keyword}`, `see ${keyword}`, `browse ${keyword}`,
        `available ${keyword}`, `${keyword} available`,
        `${keyword} you have`, `${keyword} for sale`,
        `${keyword} to buy`, `${keyword} to purchase`,
      ];

      if (buyingPatterns.some((pattern) => lowerText.includes(pattern))) {
        return true;
      }

      const simpleProductQueries: string[] = [
        `${keyword}?`, `${keyword}.`, `${keyword}!`,
        `${keyword} `, ` ${keyword}`,
      ];

      if (simpleProductQueries.some((pattern) => lowerText.includes(pattern))) {
        return true;
      }

      if (lowerText.startsWith(keyword)) {
        return true;
      }
    }
  }

  return false;
};

export const containsContactKeywords = (text: string): boolean => {
  const contactKeywords: string[] = [
    "contact", "reach out", "get in touch", "talk to", "speak with",
    "connect with", "email", "call", "phone", "message", "contact form",
    "contact us", "customer service", "support", "representative",
    "agent", "team", "feedback", "inquiry", "question", "help desk",
    "assistance",
  ];

  const contactPhrases: string[] = [
    "how can i contact", "i want to contact", "i need to contact",
    "how do i reach", "i want to talk to", "i need to speak with",
    "how can i get in touch", "i want to get in touch",
    "can i talk to someone", "can i speak to someone",
    "is there someone i can talk to", "is there a way to contact",
    "i have a question for", "need human assistance",
    "talk to a human", "speak to a human", "talk to a person",
    "speak to a person", "talk to a representative",
    "speak to a representative", "talk to support", "speak to support",
    "need help from a person", "real person", "leave feedback",
    "submit feedback", "send a message to",
  ];

  const lowerText = text.toLowerCase();

  if (contactPhrases.some((phrase) => lowerText.includes(phrase))) {
    return true;
  }

  return contactKeywords.some((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    return regex.test(lowerText);
  });
};

export const shouldUseContext = (newQuery: string, recentMessages: ChatMessage[]): boolean => {
  if (!newQuery || typeof newQuery !== "string") return false;

  const query = newQuery.toLowerCase().trim();

  const followUpIndicators = [
    /\b(it|they|them|those|that|this|these|he|she|his|her|its)\b/i,
    /\b(also|too|as well|additionally|furthermore|moreover|besides|otherwise|however|though)\b/i,
    /\b(previous|earlier|before|above|mentioned|you said|you mentioned|what about)\b/i,
    /\b(instead|rather|why not|then what|and how|so what|but how|and what|so how)\b/i,
    /\b(why|how come|what if|can you explain)\b/i,
    /^(and|but|so|then|what about|how about|tell me more|continue)/i,
    /^(is it|are they|does it|do they|can it|will it|would it|should it|has it|have they)/i,
  ];

  const hasFollowUpMarkers = followUpIndicators.some((pattern) =>
    pattern.test(query)
  );
  
  if (hasFollowUpMarkers) return true;

  const wordCount = query
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
    
  if (wordCount <= 3 && recentMessages.length > 0) {
    const lastBotMessage = [...recentMessages]
      .reverse()
      .find((msg) => msg.sender === "agent");
      
    if (lastBotMessage && lastBotMessage.content) {
      const lastBotContent = lastBotMessage.content.toLowerCase();
      const botAskedQuestion = /\?/.test(lastBotContent);
      if (botAskedQuestion) return true;
    }
  }

  if (recentMessages.length > 0) {
    const lastUserMessage = [...recentMessages]
      .reverse()
      .find((msg) => msg.sender === "user");
      
    const lastBotMessage = [...recentMessages]
      .reverse()
      .find((msg) => msg.sender === "agent");

    if (lastUserMessage?.content || lastBotMessage?.content) {
      const lastContent = [
        lastUserMessage?.content || "",
        lastBotMessage?.content || "",
      ]
        .join(" ")
        .toLowerCase();

      const stopwords = new Set([
        "the", "and", "that", "have", "for", "not", "with", "you", 
        "this", "but", "his", "her", "she", "they", "from", "will", 
        "would", "could", "should", "what", "when", "where", "how", 
        "there", "here", "their", "your", "about",
      ]);

      const lastContentWords = lastContent
        .split(/\W+/)
        .filter((word) => word.length > 3)
        .filter((word) => !stopwords.has(word))
        .filter((word) => !/^\d+$/.test(word));

      const queryWords = query
        .split(/\W+/)
        .filter((word) => word.length > 3)
        .filter((word) => !stopwords.has(word))
        .filter((word) => !/^\d+$/.test(word));

      const sharedWords = lastContentWords.filter((word) =>
        queryWords.includes(word)
      );
      
      if (sharedWords.length >= 1) return true;
    }
  }

  return false;
};