import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { BotConfig, ChatMessage } from "../../types";
import { queryDocument, getAppointmentSettings } from "../../lib/serverActions";
import OpenAI from "openai";
import { useBotConfig } from "../../store/useBotConfig";
import { useCartStore } from "../../store/useCartStore";
import HeaderSection from "../../components/chatbotComponents/HeaderSection";
import ChatSection from "../../components/chatbotComponents/ChatSection";
import InputSection from "../../components/chatbotComponents/InputSection";
import AboutSection from "../../components/chatbotComponents/AboutSection";
import BrowseSection from "../../components/chatbotComponents/BrowseSection";
import { useChatLogs } from "../../hooks/useChatLogs";

type ExtendedChatMessage = ChatMessage & { 
  type?: "booking" | "booking-intro" | "booking-loading" | "booking-calendar" | 
         "booking-management-intro" | "booking-management" 
};

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

type Screen = "about" | "chat" | "browse";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  CAD: "C$",
  AUD: "A$",
  JPY: "¥",
};

const usedBookingUnavailableIndices = new Set<number>();
const usedBookingIntroIndices = new Set<number>();
const usedManagementIntroIndices = new Set<number>();

const bookingUnavailableMessages = [
  "I'm sorry, but booking appointments is not available at this time. Is there anything else I can help you with?",
  "Unfortunately, our booking system is not currently set up. I apologize for the inconvenience. Is there something else I can assist you with?",
  "I wish I could help you book an appointment, but that feature isn't available right now. Would you like help with something else instead?",
  "Our scheduling system is currently offline. If you'd like to arrange an appointment, please contact us directly. Can I help with anything else in the meantime?",
  "We're still in the process of setting up our booking system. Until then, we're unable to process appointment requests through this chat. Is there another way I can assist you today?"
];

const bookingManagementIntroMessages = [
  "I'll help you manage your upcoming appointments. Here are your confirmed bookings:",
  "Sure! Let me show you your scheduled appointments that you can reschedule or cancel:",
  "I understand you want to manage your bookings. Here are your upcoming appointments:",
  "No problem! Here are your confirmed bookings that you can modify:",
  "I can help you with that. Here are your scheduled appointments:",
];

const getRandomUniqueMessage = (messages: string[], usedIndices: Set<number>): string => {
  if (usedIndices.size >= messages.length) {
    usedIndices.clear();
  }
  
  let index;
  do {
    index = Math.floor(Math.random() * messages.length);
  } while (usedIndices.has(index));
  
  usedIndices.add(index);
  return messages[index];
};

export default function PublicChat({
  chatHeight,
  previewConfig,
}: {
  chatHeight: string | null;
  previewConfig: BotConfig | null;
}) {
  const { botUsername } = useParams();
  const {
    activeBotData: config,
    isLoading: isConfigLoading,
    fetchBotData,
  } = useBotConfig();
  const { addMessages } = useChatLogs();

  const currentConfig = previewConfig ? previewConfig : config;
  const currentIsLoading = previewConfig ? false : isConfigLoading;

  const { products } = useCartStore();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([
    {
      id: "1",
      content: previewConfig?.welcomeMessage || "Hi! How may I help you?",
      timestamp: new Date(),
      sender: "agent",
    },
  ]);

  const [activeScreen, setActiveScreen] = useState<Screen>("chat");
  const [isLoading, setIsLoading] = useState(false);
  const [showCues, setShowCues] = useState(true);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const [pricingInfo, setPricingInfo] = useState({
    isFreeSession: false,
    sessionPrice: "$0",
    sessionName: "Consultation",
  });
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [isBookingConfigured, setIsBookingConfigured] = useState(false);

  const theme = currentConfig?.themeColors ?? {
    id: "light-yellow",
    name: "Light Yellow",
    isDark: false,
    mainDarkColor: "#EFC715",
    mainLightColor: "#5155CD",
    highlightColor: "#000000",
  };

  const getBookingIntroMessages = () => {
    const orgName = currentConfig?.name || "us";
    const sessionType = pricingInfo.sessionName || "appointment";
    const price = pricingInfo.sessionPrice || "free session";
    const isPriceMessage = pricingInfo.isFreeSession 
      ? "This is completely free!" 
      : `The cost is ${price}.`;

    return [
      `Great! You can schedule a ${sessionType} with ${orgName}. ${isPriceMessage} Please select a date and time that works for you:`,
      `I'd be happy to help you book a ${sessionType}! ${isPriceMessage} Just use the calendar below to find a time that works for you:`,
      `Perfect timing! We have availability for ${sessionType}s with ${orgName}. ${isPriceMessage} Please choose from the available slots below:`,
      `Absolutely! You can book a ${sessionType} right here. ${isPriceMessage} Take a look at our availability and select what works best for you:`,
      `I can help you schedule that ${sessionType}! ${isPriceMessage} Just browse through our available time slots and pick one that's convenient for you:`
    ];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (previewConfig?.welcomeMessage) {
      setMessages([
        {
          id: "1",
          content: previewConfig.welcomeMessage,
          timestamp: new Date(),
          sender: "agent",
        },
      ]);
    }
  }, [previewConfig?.welcomeMessage]);

  useEffect(() => {
    const fetchPricingAndBookingConfig = async () => {
      if (!currentConfig?.agentId) return;

      setLoadingPricing(true);
      try {
        const data = await getAppointmentSettings(currentConfig.agentId);
        const hasBookingConfig = data && 
          data.availability && 
          Array.isArray(data.availability) && 
          data.availability.length > 0;
        
        setIsBookingConfigured(hasBookingConfig);

        if (data && data.price) {
          const formattedPrice = data.price.isFree
            ? "Free"
            : `${CURRENCY_SYMBOLS[data.price.currency] || "$"}${
                data.price.amount
              }`;

          setPricingInfo({
            isFreeSession: data.price.isFree,
            sessionPrice: formattedPrice,
            sessionName: data.sessionType || currentConfig.sessionName || "Consultation", 
          });
        }
      } catch (error) {
        console.error("Failed to fetch pricing and booking data:", error);
        setIsBookingConfigured(false);
      } finally {
        setLoadingPricing(false);
      }
    };

    fetchPricingAndBookingConfig();
  }, [currentConfig?.agentId, currentConfig?.sessionName]);

  useEffect(() => {
    if (!previewConfig && botUsername) {
      fetchBotData(botUsername, true);
    }
  }, [botUsername, fetchBotData, previewConfig]);

  const containsBookingManagementKeywords = (text: string): boolean => {
    const managementKeywords = [
      "reschedule", "rescheduling", "reschedules", "rescheduled",
      "cancel", "canceling", "cancels", "cancelled", "cancellation",
      "change", "changing", "modify", "modifying", "update", "updating",
      "manage", "managing", "view", "check", "see",
      "change appointment", "change booking", "change meeting",
      "change my appointment", "change my booking", "change my meeting",
      "modify appointment", "modify booking", "modify meeting",
      "modify my appointment", "modify my booking", "modify my meeting",
      "cancel appointment", "cancel booking", "cancel meeting", 
      "cancel my appointment", "cancel my booking", "cancel my meeting",
      "manage booking", "manage appointment", "manage meeting",
      "view bookings", "view appointments", "view meetings",
      "my appointments", "my bookings", "my meetings",
      "upcoming appointments", "upcoming bookings", "upcoming meetings",
      "scheduled appointments", "scheduled bookings", "scheduled meetings",
      "existing appointment", "existing booking", "existing meeting",
      "current appointment", "current booking", "current meeting",
      "time change", "date change", "change time", "change date",
      "different time", "different date", "new time", "new date"
    ];

    const lowerText = text.toLowerCase();
    
    if (lowerText.includes("reschedule") && 
       (lowerText.includes("appointment") || lowerText.includes("booking") || lowerText.includes("meeting"))) {
      return true;
    }
    
    return managementKeywords.some((kw) => lowerText.includes(kw));
  };

  const containsNewBookingKeywords = (text: string): boolean => {
    if (containsBookingManagementKeywords(text)) {
      return false;
    }
    
    const newBookingKeywords = [
      "book new", "book a", "book an", "make appointment", "make a booking",
      "schedule new", "schedule a", "schedule an", "create appointment",
      "create booking", "set up appointment", "set up meeting",
      "arrange appointment", "arrange meeting", "arrange call",
      "reserve slot", "reserve time", "book slot", "book time",
      "i want to book", "i'd like to book", "can i book",
      "i need to book", "i want to schedule", "i'd like to schedule",
      "can i schedule", "i need to schedule", "i want an appointment",
      "i need an appointment", "available slots", "available times",
      "availability", "when can i", "when are you available",
      "book appointment", "book meeting", "book call",
      "schedule appointment", "schedule meeting", "schedule call",
      "make an appointment", "make a meeting",
      "reservation", "make reservation", "create reservation", "do a booking", "do"
    ];

    const lowerText = text.toLowerCase();
    return newBookingKeywords.some((kw) => lowerText.includes(kw));
  };

  const shouldUseContext = (newQuery, recentMessages) => {
    if (!newQuery || typeof newQuery !== 'string') return false;

    const query = newQuery.toLowerCase().trim();

    const followUpIndicators = [
      /\b(it|they|them|those|that|this|these|he|she|his|her|its)\b/i,
      /\b(also|too|as well|additionally|furthermore|moreover|besides|otherwise|however|though)\b/i,
      /\b(previous|earlier|before|above|mentioned|you said|you mentioned|what about)\b/i,
      /\b(instead|rather|why not|then what|and how|so what|but how|and what|so how)\b/i,
      /\b(why|how come|what if|can you explain)\b/i,
      /^(and|but|so|then|what about|how about|tell me more|continue)/i,
      /^(is it|are they|does it|do they|can it|will it|would it|should it|has it|have they)/i
    ];
    
    const hasFollowUpMarkers = followUpIndicators.some(pattern => pattern.test(query));
    if (hasFollowUpMarkers) return true;
    
    const wordCount = query.split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount <= 3 && recentMessages.length > 0) {
      const lastBotMessage = [...recentMessages].reverse().find(msg => msg.sender === "agent");
      if (lastBotMessage && lastBotMessage.content) {
        const lastBotContent = lastBotMessage.content.toLowerCase();
        
        const botAskedQuestion = /\?/.test(lastBotContent);
        if (botAskedQuestion) return true;
      }
    }
    
    if (recentMessages.length > 0) {
      const lastUserMessage = [...recentMessages].reverse().find(msg => msg.sender === "user");
      const lastBotMessage = [...recentMessages].reverse().find(msg => msg.sender === "agent");
      
      if (lastUserMessage?.content || lastBotMessage?.content) {
        const lastContent = [
          lastUserMessage?.content || "", 
          lastBotMessage?.content || ""
        ].join(" ").toLowerCase();
        
        const stopwords = new Set(["the", "and", "that", "have", "for", "not", "with", "you", "this", "but", "his", "her", "she", "they", "from", "will", "would", "could", "should", "what", "when", "where", "how", "there", "here", "their", "your", "about"]);
        
        const lastContentWords = lastContent.split(/\W+/)
          .filter(word => word.length > 3) 
          .filter(word => !stopwords.has(word)) 
          .filter(word => !/^\d+$/.test(word)); 
        
        const queryWords = query.split(/\W+/)
          .filter(word => word.length > 3)
          .filter(word => !stopwords.has(word))
          .filter(word => !/^\d+$/.test(word));
        
        const sharedWords = lastContentWords.filter(word => queryWords.includes(word));
        if (sharedWords.length >= 1) return true;
      }
    }
    
    return false;
  };

  const handleSendMessage = async (inputMessage) => {
    let msgToSend = typeof inputMessage === "string" ? inputMessage : message;

    if (!msgToSend.trim() || !currentConfig?.agentId) return;

    const userMsg = {
      id: Date.now().toString(),
      content: msgToSend,
      timestamp: new Date(),
      sender: "user",
    };
    setMessages((m) => [...m, userMsg]);
    setMessage("");
    setShowCues(false);
    scrollToBottom();

    if (containsBookingManagementKeywords(msgToSend)) {
      const introMessage = getRandomUniqueMessage(bookingManagementIntroMessages, usedManagementIntroIndices);
      
      const managementIntroMsg = {
        id: (Date.now() + 1).toString(),
        content: introMessage,
        timestamp: new Date(),
        sender: "agent",
        type: "booking-management-intro",
      };
      
      setMessages((m) => [...m, managementIntroMsg]);
      scrollToBottom();
      
      setTimeout(() => {
        const loadingMsg = {
          id: (Date.now() + 2).toString(),
          content: "",
          timestamp: new Date(),
          sender: "agent",
          type: "booking-loading",
        };
        setMessages((m) => [...m, loadingMsg]);
        scrollToBottom();
        
        setTimeout(() => {
          setMessages((m) => m.filter(msg => msg.type !== "booking-loading"));
          
          const managementMsg = {
            id: (Date.now() + 3).toString(),
            content: "",
            timestamp: new Date(),
            sender: "agent",
            type: "booking-management",
          };
          setMessages((m) => [...m, managementMsg]);
          scrollToBottom();
        }, 1000);
      }, 1500);
      
      return;
    }

    if (containsNewBookingKeywords(msgToSend)) {
      if (isBookingConfigured) {
        const introMessage = getRandomUniqueMessage(getBookingIntroMessages(), usedBookingIntroIndices);
        const bookingIntroMsg = {
          id: (Date.now() + 1).toString(),
          content: introMessage,
          timestamp: new Date(),
          sender: "agent",
          type: "booking-intro",
        };
        setMessages((m) => [...m, bookingIntroMsg]);
        scrollToBottom();
        
        setTimeout(() => {
          const loadingMsg = {
            id: (Date.now() + 2).toString(),
            content: "",
            timestamp: new Date(),
            sender: "agent",
            type: "booking-loading",
          };
          setMessages((m) => [...m, loadingMsg]);
          scrollToBottom();
          
          setTimeout(() => {
            setMessages((m) => m.filter(msg => msg.type !== "booking-loading"));
            
            const bookingCalendarMsg = {
              id: (Date.now() + 3).toString(),
              content: "",
              timestamp: new Date(),
              sender: "agent",
              type: "booking-calendar",
            };
            setMessages((m) => [...m, bookingCalendarMsg]);
            scrollToBottom();
          }, 1000);
        }, 1500);
        
        return;
      } else {
        const unavailableMessage = getRandomUniqueMessage(bookingUnavailableMessages, usedBookingUnavailableIndices);
        const notAvailableMsg = {
          id: (Date.now() + 1).toString(),
          content: unavailableMessage,
          timestamp: new Date(),
          sender: "agent",
        };
        setMessages((m) => [...m, notAvailableMsg]);
        return;
      }
    }

    setIsLoading(true);
    try {
      const kiforVariations = [
        'kifor', 
        'ki for', 
        'key for', 
        'ki 4',
        'key 4',
        'key-for',
        'ki-for',
        'k for',
        'k4',
        'kiframe',
        'ki frame',
        'ki-frame',
        'key frame',
        'k frame'
      ];
      const lowercaseMsg = msgToSend.toLowerCase();
      const containsKifor = kiforVariations.some(variation => lowercaseMsg.includes(variation));
      
      const recentMessages = messages.slice(-1);
      const useContext = !containsKifor && shouldUseContext(msgToSend, recentMessages);
      let enhancedQuery;
      if (useContext && recentMessages.length > 0) {
        const conversationContext = recentMessages.map(msg => 
          `${msg.sender === "agent" ? "Assistant" : "User"}: ${msg.content}`
        ).join("\n\n");
        
        enhancedQuery = `${conversationContext}\n\nUser: ${msgToSend}\n\nAssistant should respond to the user's latest message with the previous context in mind.`;
        
      } else {
        enhancedQuery = msgToSend;
      }
      
      const queryContext = await queryDocument(
        currentConfig.agentId, 
        enhancedQuery 
      );

      let voiceTone = currentConfig?.personalityType?.value?.toString() || "friendly";
      let systemPrompt = `You are a conversational AI assistant creating engaging, personalized responses. When context is available: ${JSON.stringify(queryContext)}, use it for relevant answers. For conversational queries or insufficient context, build rapport.

      Core Rules:
      - Keep responses concise yet engaging (1-2 sentences)
      - Personalize using details from user queries
      - Maintain a ${voiceTone} tone that connects
      - Ask thoughtful follow-up questions when appropriate
      - Use natural, warm language
      - Greeting should be replied with greeting only.
      - Dont include Kifor Information anywhere untill it is asked by the user in query.

      Formatting:
      - **Bold** for key points
      - *Italic* for subtle emphasis
      - Bullet points (-) for lists
      - \`code\` for technical snippets
      - > for important quotes
      - [text](url) for resources

      Engagement:
      - Acknowledge user emotions and perspectives
      - Use relevant examples and analogies
      - Offer actionable insights when possible
      - Create collaborative problem-solving
      - Show enthusiasm for user interests
      - End with helpful suggestions or questions

      Boundaries:
      - Focus on user inquiries and training data
      - Ask clarifying questions when needed
      - Never mention access to training data
      - Stay within knowledge scope
      - Redirect off-topic conversations politely
      - End on a positive, forward-moving note`;

      const streamingMsgId = (Date.now() + 2).toString();
      const streamingMsg = {
        id: streamingMsgId,
        content: "",
        timestamp: new Date(),
        sender: "agent",
      };
      setMessages((m) => [...m, streamingMsg]);

      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: enhancedQuery }, 
        ],
        temperature: 0.6,
        stream: true,
      });

      let fullResponse = "";
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullResponse += content;
        
        setMessages((messages) => 
          messages.map((msg) => 
            msg.id === streamingMsgId 
              ? { ...msg, content: fullResponse } 
              : msg
          )
        );
        
        scrollToBottom();
      }

      await addMessages(msgToSend, fullResponse);
    } catch (err) {
      console.error("Error generating response:", err);
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 3).toString(),
          content: "Sorry, there was an error. Please try again.",
          timestamp: new Date(),
          sender: "agent",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCueClick = (cue: string) => {
    setMessage(cue);
    setShowCues(false);
    handleSendMessage(cue);
  };

  if (currentIsLoading || loadingPricing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-12 w-12 border-t-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-100 flex items-start justify-center">
      {currentConfig?.themeColors && (
        <div
          className="w-full max-w-md bg-white shadow-2xl overflow-hidden flex flex-col relative"
          style={{
            height: previewConfig ? (chatHeight ? chatHeight : 620) : "100vh",
            backgroundColor: "white",
          }}
        >
          <HeaderSection
            theme={currentConfig.themeColors}
            currentConfig={currentConfig}
            activeScreen={activeScreen}
            setActiveScreen={setActiveScreen}
          />

          {activeScreen === "about" && (
            <AboutSection
              theme={currentConfig.themeColors}
              currentConfig={currentConfig}
              socials={currentConfig?.socials}
            />
          )}

          {activeScreen === "chat" && (
            <>
              <ChatSection
                theme={theme}
                messages={messages}
                isLoading={isLoading}
                activeScreen={activeScreen}
                messagesEndRef={messagesEndRef}
                currentConfig={{
                  agentId: currentConfig?.agentId,
                  name: currentConfig?.name,
                  sessionName: pricingInfo.sessionName,
                  sessionPrice: pricingInfo.sessionPrice,
                  isFreeSession: pricingInfo.isFreeSession,
                }}
                isBookingConfigured={isBookingConfigured}
              />

              {showCues && currentConfig?.prompts && (
                <div
                  className="p-2 grid grid-cols-1 gap-1"
                  style={{
                    backgroundColor: theme.isDark ? "#1c1c1c" : "#e9e9e9",
                  }}
                >
                  {[currentConfig.prompts].map((row, i) => (
                    <div key={i} className="grid grid-cols-2 gap-2">
                      {row.map((cue) => (
                        <button
                          key={cue}
                          onClick={() => handleCueClick(cue)}
                          disabled={isLoading}
                          className="px-2 py-1 rounded-xl text-xs font-medium"
                          style={{
                            backgroundColor: theme.isDark
                              ? "#1c1c1c"
                              : "#e9e9e9",
                            color: theme.isDark ? "white" : "black",
                            border: `1px solid ${
                              theme.isDark ? "white" : "black"
                            }`,
                            borderRadius: "20px",
                          }}
                        >
                          {cue}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              <InputSection
                theme={theme}
                message={message}
                isLoading={isLoading}
                setMessage={setMessage}
                handleSendMessage={handleSendMessage}
                handleKeyPress={handleKeyPress}
              />
            </>
          )}

          {activeScreen === "browse" && (
            <BrowseSection
              theme={theme}
              currentConfig={{
                agentId: currentConfig?.agentId,
                name: currentConfig?.name,
                sessionName: pricingInfo.sessionName,
                sessionPrice: pricingInfo.sessionPrice,
                isFreeSession: pricingInfo.isFreeSession,
              }}
              isBookingConfigured={isBookingConfigured}
            />
          )}
        </div>
      )}
    </div>
  );
}
