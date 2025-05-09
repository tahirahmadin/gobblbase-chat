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

type ExtendedChatMessage = ChatMessage & { type?: "booking" | "booking-intro" | "booking-loading" | "booking-calendar" };

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

const bookingUnavailableMessages = [
  "I'm sorry, but booking appointments is not available at this time. Is there anything else I can help you with?",
  "Unfortunately, our booking system is not currently set up. I apologize for the inconvenience. Is there something else I can assist you with?",
  "I wish I could help you book an appointment, but that feature isn't available right now. Would you like help with something else instead?",
  "Our scheduling system is currently offline. If you'd like to arrange an appointment, please contact us directly. Can I help with anything else in the meantime?",
  "We're still in the process of setting up our booking system. Until then, we're unable to process appointment requests through this chat. Is there another way I can assist you today?"
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

  const containsBookingKeywords = (text: string): boolean => {
    const bookingKeywords = [
      "book", "appointment", "meeting", "schedule", "call", 
      "reserve", "booking", "appointments", "meetings", 
      "calls", "scheduling", "reservation",
    ];

    const lowerText = text.toLowerCase();
    return bookingKeywords.some((kw) => lowerText.includes(kw));
  };

  const handleSendMessage = async (
    inputMessage?: string | React.MouseEvent<HTMLButtonElement>
  ) => {
    let msgToSend = typeof inputMessage === "string" ? inputMessage : message;

    if (!msgToSend.trim() || !config?.agentId) return;

    const userMsg: ExtendedChatMessage = {
      id: Date.now().toString(),
      content: msgToSend,
      timestamp: new Date(),
      sender: "user",
    };
    setMessages((m) => [...m, userMsg]);
    setMessage("");
    setShowCues(false);
    scrollToBottom();

    const isBookingRequest = containsBookingKeywords(msgToSend);

    if (isBookingRequest) {
      if (isBookingConfigured) {
        // First add the intro message
        const introMessage = getRandomUniqueMessage(getBookingIntroMessages(), usedBookingIntroIndices);
        const bookingIntroMsg: ExtendedChatMessage = {
          id: (Date.now() + 1).toString(),
          content: introMessage,
          timestamp: new Date(),
          sender: "agent",
          type: "booking-intro",
        };
        setMessages((m) => [...m, bookingIntroMsg]);
        
        // Wait for intro message to be read
        setTimeout(() => {
          // Then add the loading indicator
          const loadingMsg: ExtendedChatMessage = {
            id: (Date.now() + 2).toString(),
            content: "",
            timestamp: new Date(),
            sender: "agent",
            type: "booking-loading",
          };
          setMessages((m) => [...m, loadingMsg]);
          scrollToBottom();
          
          // After loading is shown, display the calendar
          setTimeout(() => {
            // Remove the loading message
            setMessages((m) => m.filter(msg => msg.type !== "booking-loading"));
            
            // Add the calendar
            const bookingCalendarMsg: ExtendedChatMessage = {
              id: (Date.now() + 3).toString(),
              content: "",
              timestamp: new Date(),
              sender: "agent",
              type: "booking-calendar",
            };
            setMessages((m) => [...m, bookingCalendarMsg]);
            scrollToBottom();
          }, 2000); // Show loading for 2 seconds
        }, 1500); // Wait 1.5 seconds after the intro message
        
        return;
      } else {
        const unavailableMessage = getRandomUniqueMessage(bookingUnavailableMessages, usedBookingUnavailableIndices);
        const notAvailableMsg: ExtendedChatMessage = {
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
      const queryContext = await queryDocument(config.agentId, msgToSend);
      let voiceTone = currentConfig?.personalityType?.value?.toString() || "friendly";
      let systemPrompt = `You are a conversational AI assistant that creates engaging, personalized responses. When context is available: ${JSON.stringify(queryContext)}, use it to provide relevant and insightful answers. For conversational queries or when context is insufficient, respond in a way that builds rapport.

      Core Rules:
      - Balance conciseness with engagement (2-3 thoughtful sentences)
      - Personalize responses using details from user's queries
      - Maintain a ${voiceTone} tone that connects with users
      - Never end responses with questions
      - Use conversational language that feels natural and warm

      Formatting:
      - Use **bold** for emphasis on key points
      - Use *italic* for subtle emphasis or important details
      - Use bullet points (-) for easy-to-scan lists
      - Use \`code\` for technical snippets
      - Use > for highlighting important quotes or takeaways
      - Use [text](url) for helpful resources

      Engagement Techniques:
      - Acknowledge user emotions and perspectives
      - Use relevant examples or analogies to illustrate points
      - Offer actionable insights when possible
      - Create a sense of collaborative problem-solving
      - Respond with enthusiasm to user interests
      - End with a positive, conclusive statement that doesn't require a response

      Role Boundaries:
      - Stay focused on user inquiries and context
      - Ask clarifying questions only when absolutely necessary for understanding
      - Never explicitly mention your access to training data
      - Only answer questions within your knowledge scope
      - Politely redirect off-topic conversations
      - Always close the conversation loop rather than opening new threads`;

      let basePrompt = systemPrompt;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: basePrompt },
          { role: "user", content: msgToSend },
        ],
        temperature: 0.6,
      });

      const agentMsg: ExtendedChatMessage = {
        id: (Date.now() + 2).toString(),
        content:
          completion.choices[0].message.content ||
          "Sorry, I couldn't generate a response.",
        timestamp: new Date(),
        sender: "agent",
      };
      setMessages((m) => [...m, agentMsg]);

      await addMessages(msgToSend, agentMsg.content);
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
                  agentId: config?.agentId,
                  name: config?.name,
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
                agentId: config?.agentId,
                name: config?.name,
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
