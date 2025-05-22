import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BotConfig, ChatMessage } from "../../types";
import { useBotConfig } from "../../store/useBotConfig";
import { useUserStore } from "../../store/useUserStore";
import HeaderSection from "../../components/chatbotComponents/HeaderSection";
import ChatSection from "../../components/chatbotComponents/ChatSection";
import InputSection from "../../components/chatbotComponents/InputSection";
import AboutSection from "../../components/chatbotComponents/AboutSection";
import BrowseSection from "../../components/chatbotComponents/BrowseSection";
import { useBookingLogic } from "../../hooks/useBookingLogic";
import { useProductsLogic } from "../../hooks/useProductsLogic";
import { useContactLogic } from "../../hooks/useContactLogic";
import { useChatMessages } from "../../hooks/useChatMessages";
import { useFeatureNotifications } from "../../hooks/useFeatureNotifications";

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
  const { initializeSession } = useUserStore();

  const [viewportHeight, setViewportHeight] = useState<number>(
    window.innerHeight
  );
  const [message, setMessage] = useState<string>("");
  const [activeScreen, setActiveScreen] = useState<Screen>("chat");
  const [showCues, setShowCues] = useState<boolean>(true);

  // Initialize user session
  useEffect(() => {
    if (!isPreview) {
      initializeSession();
    }
  }, [isPreview, initializeSession]);

  const prevFeaturesRef = useRef({
    isBookingConfigured: null as boolean | null,
    hasProducts: null as boolean | null,
    customerLeadFlag: null as boolean | null,
    isQueryable: null as boolean | null,
  });

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
    handleBookingRequest,
  } = useBookingLogic(currentConfig?.agentId, currentConfig?.sessionName);

  const { handleProductRequest, hasProducts } = useProductsLogic(
    currentConfig?.agentId
  );

  const { handleContactRequest } = useContactLogic(currentConfig?.agentId);

  const {
    messages,
    setMessages,
    isLoading,
    messagesEndRef,
    scrollToBottom,
    handleAIResponse,
  } = useChatMessages(
    currentConfig?.welcomeMessage || "Hi! How may I help you?",
    currentConfig
  );

  const { showFeatureNotification, resetFeatures, updateFeatures } =
    useFeatureNotifications(
      isBookingConfigured,
      hasProducts,
      currentConfig?.customerLeadFlag,
      currentConfig?.isQueryable
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

  useEffect(() => {
    resetFeatures();
    prevFeaturesRef.current = {
      isBookingConfigured: null,
      hasProducts: null,
      customerLeadFlag: null,
      isQueryable: null,
    };
  }, [resetFeatures, currentConfig?.agentId]);

  const checkFeature = (value: any): boolean => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string")
      return value.toLowerCase() === "true" || value === "1";
    if (typeof value === "number") return value === 1;
    if (typeof value === "object" && value !== null) return true;
    return false;
  };

  useEffect(() => {
    if (currentIsLoading || loadingPricing) {
      return;
    }

    const currBooking = checkFeature(isBookingConfigured);
    const currProducts = checkFeature(hasProducts);
    const currContact = checkFeature(currentConfig?.customerLeadFlag);
    const currQueryable = checkFeature(currentConfig?.isQueryable);

    const bookingChanged =
      prevFeaturesRef.current.isBookingConfigured !== null &&
      prevFeaturesRef.current.isBookingConfigured !== currBooking;
    const productsChanged =
      prevFeaturesRef.current.hasProducts !== null &&
      prevFeaturesRef.current.hasProducts !== currProducts;
    const contactChanged =
      prevFeaturesRef.current.customerLeadFlag !== null &&
      prevFeaturesRef.current.customerLeadFlag !== currContact;
    const queryableChanged =
      prevFeaturesRef.current.isQueryable !== null &&
      prevFeaturesRef.current.isQueryable !== currQueryable;

    if (
      bookingChanged ||
      productsChanged ||
      contactChanged ||
      queryableChanged
    ) {
      console.log("Features changed:", {
        bookingBefore: prevFeaturesRef.current.isBookingConfigured,
        bookingNow: currBooking,
        productsBefore: prevFeaturesRef.current.hasProducts,
        productsNow: currProducts,
        contactBefore: prevFeaturesRef.current.customerLeadFlag,
        contactNow: currContact,
        queryableBefore: prevFeaturesRef.current.isQueryable,
        queryableNow: currQueryable,
      });

      updateFeatures();

      if (messages.length >= 1) {
        showFeatureNotification(setMessages, scrollToBottom);
      }
    }

    prevFeaturesRef.current = {
      isBookingConfigured: currBooking,
      hasProducts: currProducts,
      customerLeadFlag: currContact,
      isQueryable: currQueryable,
    };
  }, [
    currentIsLoading,
    loadingPricing,
    isBookingConfigured,
    hasProducts,
    currentConfig?.customerLeadFlag,
    currentConfig?.isQueryable,
    updateFeatures,
    showFeatureNotification,
    messages.length,
    setMessages,
    scrollToBottom,
  ]);

  useEffect(() => {
    if (currentIsLoading || loadingPricing) {
      return;
    }

    const hasAnyFeature =
      checkFeature(isBookingConfigured) ||
      checkFeature(hasProducts) ||
      checkFeature(currentConfig?.customerLeadFlag) ||
      checkFeature(currentConfig?.isQueryable);

    if (messages.length >= 1 && hasAnyFeature) {
      const hasFeatureMessage = messages.some(
        (msg) =>
          msg.sender === "agent" &&
          (msg.content.includes("capabilities include") ||
            msg.content.includes("I can help you with") ||
            msg.content.includes("I'm here to help with"))
      );

      if (!hasFeatureMessage) {
        setTimeout(() => {
          showFeatureNotification(setMessages, scrollToBottom);
        }, 100);
      }
    }
  }, [
    messages,
    currentIsLoading,
    loadingPricing,
    isBookingConfigured,
    hasProducts,
    currentConfig?.customerLeadFlag,
    currentConfig?.isQueryable,
    showFeatureNotification,
    setMessages,
    scrollToBottom,
  ]);

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
        <>
          <Helmet>
            <title>
              {currentConfig.name
                ? `${currentConfig.name} | KiFor.ai chatbot`
                : "KiFor.ai chatbot"}
            </title>
          </Helmet>
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
                    customHandles={currentConfig?.customHandles}
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
                      currency: currentConfig.currency,
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
        </>
      )}
    </div>
  );
}
