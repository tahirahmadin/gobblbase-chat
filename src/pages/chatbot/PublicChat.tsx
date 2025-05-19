import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { BotConfig, ChatMessage } from "../../types";
import { useBotConfig } from "../../store/useBotConfig";
import HeaderSection from "../../components/chatbotComponents/HeaderSection";
import ChatSection from "../../components/chatbotComponents/ChatSection";
import InputSection from "../../components/chatbotComponents/InputSection";
import AboutSection from "../../components/chatbotComponents/AboutSection";
import BrowseSection from "../../components/chatbotComponents/BrowseSection";
import { useBookingLogic } from "../../hooks/useBookingLogic";
import { useProductsLogic } from "../../hooks/useProductsLogic";
import { useContactLogic } from "../../hooks/useContactLogic";
import { useChatMessages } from "../../hooks/useChatMessages";

type Screen = "about" | "chat" | "browse";

interface PublicChatProps {
  chatHeight: string | null;
  previewConfig: BotConfig | null;
  isPreview: boolean;
}

export default function PublicChat({
  chatHeight,
  previewConfig,
  isPreview,
}: PublicChatProps) {
  const { botUsername } = useParams<{ botUsername: string }>();
  const {
    activeBotData,
    isLoading: isConfigLoading,
    fetchBotData,
  } = useBotConfig();
  
  const [viewportHeight, setViewportHeight] = useState<number>(window.innerHeight);
  const [message, setMessage] = useState<string>("");
  const [activeScreen, setActiveScreen] = useState<Screen>("chat");
  const [showCues, setShowCues] = useState<boolean>(true);

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentConfig = isPreview ? previewConfig : activeBotData;
  const currentIsLoading = previewConfig ? false : isConfigLoading;

  const {
    isBookingConfigured,
    pricingInfo,
    loadingPricing,
    handleBookingRequest
  } = useBookingLogic(
    currentConfig?.agentId, 
    currentConfig?.sessionName
  );
  
  const {
    handleProductRequest,
  } = useProductsLogic(currentConfig?.agentId);
  
  const {
    handleContactRequest
  } = useContactLogic(currentConfig?.agentId);
  
  const {
    messages,
    setMessages,
    isLoading,
    messagesEndRef,
    scrollToBottom,
    handleAIResponse
  } = useChatMessages(
    currentConfig?.welcomeMessage || "Hi! How may I help you?",
    currentConfig
  );

  const theme = currentConfig?.themeColors ?? {
    id: "light-yellow",
    name: "Light Yellow",
    isDark: false,
    mainDarkColor: "#EFC715",
    mainLightColor: "#5155CD",
    highlightColor: "#000000",
  };

  useEffect(() => {
    if (!previewConfig && botUsername) {
      fetchBotData(botUsername, true);
    }
  }, [botUsername, previewConfig, fetchBotData]);

  const handleSendMessage = async (inputMessage?: string): Promise<void> => {
    let msgToSend = typeof inputMessage === "string" ? inputMessage : message;

    if (!msgToSend.trim() || !currentConfig?.agentId) return;

    // Add user message to chat
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      content: msgToSend,
      timestamp: new Date(),
      sender: "user",
    };
    setMessages((m) => [...m, userMsg]);
    setMessage("");
    setShowCues(false);
    scrollToBottom();

    // Process contact requests first (including lead collection)
    const contactHandled = await handleContactRequest(
      msgToSend, 
      setMessages, 
      scrollToBottom, 
      currentConfig?.customerLeadFlag
    );
    
    if (contactHandled) return;

    // Process booking-related messages
    const bookingHandled = handleBookingRequest(
      msgToSend, 
      setMessages, 
      scrollToBottom
    );
    
    if (bookingHandled) return;

    // Process product-related messages
    const productHandled = handleProductRequest(
      msgToSend, 
      setMessages, 
      scrollToBottom
    );
    
    if (productHandled) return;

    await handleAIResponse(msgToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCueClick = (cue: string): void => {
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
    <div className="w-full flex items-start justify-center">
      {currentConfig?.themeColors && (
        <div
          className="w-full max-w-md shadow-2xl overflow-hidden flex flex-col relative"
          style={{
            height: previewConfig
              ? chatHeight
                ? chatHeight
                : 620
              : `${viewportHeight}px`,
          }}
        >
          <div className="flex flex-col h-full">
            <HeaderSection
              theme={currentConfig.themeColors}
              currentConfig={currentConfig}
              activeScreen={activeScreen}
              setActiveScreen={setActiveScreen}
            />

            {activeScreen === "about" && (
              <div className="flex-1 overflow-y-auto">
                <AboutSection
                  theme={currentConfig.themeColors}
                  currentConfig={currentConfig}
                  socials={currentConfig?.socials}
                />
              </div>
            )}

            {activeScreen === "chat" && (
              <>
                <div
                  className="flex-1 overflow-y-auto"
                  style={{
                    backgroundColor: theme.isDark ? "#1c1c1c" : "#e9e9e9",
                  }}
                >
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
                    setActiveScreen={setActiveScreen}
                  />
                </div>

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

                <div className="sticky bottom-0">
                  <InputSection
                    theme={theme}
                    message={message}
                    isLoading={isLoading}
                    setMessage={setMessage}
                    handleSendMessage={handleSendMessage}
                    handleKeyPress={handleKeyPress}
                  />
                </div>
              </>
            )}

            {activeScreen === "browse" && (
              <div className="flex-1 overflow-y-auto">
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
                  setActiveScreen={setActiveScreen}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
