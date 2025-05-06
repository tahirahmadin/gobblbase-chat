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

type ExtendedChatMessage = ChatMessage & { type?: "booking" };

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Default cues if no prompts are provided
const DEFAULT_CUES: string[][] = [
  [
    "Pizza hut se meri call ki sales pitch btao?",
    "Bamboo Spoons kitni stock mein hain abhi?",
  ],
];

type Screen = "about" | "chat" | "browse";

// Currency symbols mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  CAD: "C$",
  AUD: "A$",
  JPY: "¥",
};

export default function PublicChat({
  previewConfig,
}: {
  previewConfig: BotConfig | null;
}) {
  const { botUsername } = useParams();
  const {
    activeBotData: config,
    isLoading: isConfigLoading,
    fetchBotData,
  } = useBotConfig();

  // use preview or fetched config
  const currentConfig = previewConfig ? previewConfig : config;
  const currentIsLoading = previewConfig ? false : isConfigLoading;

  console.log("currentConfig");
  console.log(currentConfig);

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

  // Pricing state
  const [pricingInfo, setPricingInfo] = useState({
    isFreeSession: false,
    sessionPrice: "$0",
    sessionName: "Consultation",
  });
  const [loadingPricing, setLoadingPricing] = useState(false);

  // safe themeColors fallback
  const theme = currentConfig?.themeColors ?? {
    id: "light-yellow",
    name: "Light Yellow",
    isDark: false,
    mainDarkColor: "#EFC715",
    mainLightColor: "#5155CD",
    highlightColor: "#000000",
  };

  // Scroll to bottom when loading state changes (for streaming text)
  useEffect(() => {
    if (!isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (previewConfig?.welcomeMessage) {
      setMessages([
        {
          id: "1",
          content: previewConfig?.welcomeMessage || "Hi! How may I help you?",
          timestamp: new Date(),
          sender: "agent",
        },
      ]);
    }
  }, [previewConfig?.welcomeMessage]);

  // Enhanced scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch pricing information from settings
  useEffect(() => {
    const fetchPricing = async () => {
      if (!currentConfig?.agentId) return;

      setLoadingPricing(true);
      try {
        const data = await getAppointmentSettings(currentConfig.agentId);
        console.log("Fetched settings for pricing:", data);

        if (data && data.price) {
          const formattedPrice = data.price.isFree
            ? "Free"
            : `${CURRENCY_SYMBOLS[data.price.currency] || "$"}${
                data.price.amount
              }`;

          setPricingInfo({
            isFreeSession: data.price.isFree,
            sessionPrice: formattedPrice,
            sessionName: currentConfig.sessionName || "Consultation",
          });
          console.log("Dynamic price info set:", formattedPrice);
        }
      } catch (error) {
        console.error("Failed to fetch pricing data:", error);
      } finally {
        setLoadingPricing(false);
      }
    };

    fetchPricing();
  }, [currentConfig?.agentId]);

  // fetch config on mount/params change
  useEffect(() => {
    if (!previewConfig && botUsername) {
      fetchBotData(botUsername, true);
    }
  }, [botUsername, fetchBotData, previewConfig]);

  const handleSendMessage = async (
    inputMessage?: string | React.MouseEvent<HTMLButtonElement>
  ) => {
    let msgToSend = typeof inputMessage === "string" ? inputMessage : message;

    if (!msgToSend.trim() || !config?.agentId) return;

    // user message
    const userMsg: ExtendedChatMessage = {
      id: Date.now().toString(),
      content: msgToSend,
      timestamp: new Date(),
      sender: "user",
    };
    setMessages((m) => [...m, userMsg]);
    setMessage("");
    setIsLoading(true);
    setShowCues(false);
    scrollToBottom(); // Scroll immediately after user message

    // detect booking intent
    const text = msgToSend.toLowerCase();
    const isBookingRequest = [
      "book",
      "appointment",
      "meeting",
      "schedule",
    ].some((kw) => text.includes(kw));

    if (isBookingRequest) {
      // inject booking embed
      const bookingMsg: ExtendedChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "",
        timestamp: new Date(),
        sender: "agent",
        type: "booking",
      };
      setMessages((m) => [...m, bookingMsg]);
      setIsLoading(false);
      return;
    }

    try {
      // fetch RAG context
      // let productContext = "";
      // if (products.length > 0) {
      //   productContext = `Here are the products available: ${JSON.stringify(
      //     products
      //   )}`;
      // }
      const queryContext = await queryDocument(config.agentId, msgToSend);
      let voiceTone = currentConfig?.personalityType.value.toString();
      let systemPrompt = `You are a concise AI assistant.  Use context when relevant:\n${JSON.stringify(
        queryContext
      )} to answer the user's question when relevant. If the context doesn't contain the answer or if the query is conversational, respond appropriately.\nRules:\n- Answer in 1-2 plain sentences only.\n- Do not add extra explanation, greetings, or conclusions.\n- No special characters, markdown, or formatting. Give outputs in following tone: ${voiceTone}`;

      let basePrompt = systemPrompt;

      basePrompt += `\nRules: 
      - Use markdown formatting for better readability:
        * Use **bold** for emphasis
        * Use *italic* for subtle emphasis
        * Use bullet points (-) for lists
        * Use [link text](url) for links
        * Use \`code\` for code snippets
        * Use > for quotes
      - Keep responses concise (1-2 sentences)
      - No extra greetings or formatting`;

      console.log(systemPrompt);
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
    } catch (err) {
      console.error(err);
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
      {/* Simulated Mobile Frame */}

      {currentConfig?.themeColors && (
        <div
          className="w-full max-w-md bg-white shadow-2xl  overflow-hidden flex flex-col relative"
          style={{
            height: previewConfig ? 700 : "100vh",
            backgroundColor: "white", // white mobile shell
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
                currentConfig={currentConfig || { name: "KiFor Bot" }}
                messagesEndRef={messagesEndRef}
              />

              {/* cues */}
              {showCues && (
                <div
                  className="p-2 grid grid-cols-1 gap-1"
                  style={{
                    backgroundColor: theme.isDark ? "#1c1c1c" : "#e9e9e9",
                  }}
                >
                  {(currentConfig?.prompts?.length
                    ? [currentConfig.prompts]
                    : DEFAULT_CUES
                  ).map((row, i) => (
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
            />
          )}
        </div>
      )}
    </div>
  );
}
