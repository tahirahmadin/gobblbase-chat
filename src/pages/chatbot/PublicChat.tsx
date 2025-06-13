import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BotConfig, ChatMessage } from "../../types";
import { useBotConfig } from "../../store/useBotConfig";
import { useUserStore } from "../../store/useUserStore";
import { useChatLogs } from "../../hooks/useChatLogs";
import HeaderSection from "../../components/chatbotComponents/HeaderSection";
import ChatSection from "../../components/chatbotComponents/ChatSection";
import InputSection from "../../components/chatbotComponents/InputSection";
import AboutSection from "../../components/chatbotComponents/AboutSection";
import BrowseSection from "../../components/chatbotComponents/BrowseSection";
import BotNotFound from "../../components/chatbotComponents/BotNotFound";
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
  screenName: string;
}

export default function PublicChat({
  chatHeight,
  previewConfig,
  isPreview,
  screenName = "chat",
}: PublicChatProps) {
  const { botUsername } = useParams<{ botUsername: string }>();
  const {
    activeBotData,
    isLoading: isConfigLoading,
    fetchBotData,
    error: botConfigError,
  } = useBotConfig();
  const globalCurrency = activeBotData?.currency || "USD";
  const { initializeSession } = useUserStore();

  const { addMessages } = useChatLogs();

  const [viewportHeight, setViewportHeight] = useState<number>(
    window.innerHeight
  );
  const [message, setMessage] = useState<string>("");
  const [activeScreen, setActiveScreen] = useState<Screen>("chat");
  const [showCues, setShowCues] = useState<boolean>(true);

  useEffect(() => {
    if (!isPreview) {
      initializeSession();
    }
  }, [isPreview, initializeSession]);

  useEffect(() => {
    if (screenName) {
      setActiveScreen(screenName as Screen);
    }
  }, [screenName]);

  const prevFeaturesRef = useRef({
    isBookingConfigured: null as boolean | null,
    hasProducts: null as boolean | null,
    customerLeadFlag: null as boolean | null,
    isQueryable: null as boolean | null,
    isActive: null as boolean | null,
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
  } = useBookingLogic(
    currentConfig?.agentId,
    currentConfig?.sessionName,
    globalCurrency
  );

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
    if (typeof window !== "undefined") {
      (window as any).featureMessageShown = false;
    }
  }, []);

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
      isActive: null,
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

    const timeoutId = setTimeout(() => {
      const currBooking = checkFeature(isBookingConfigured);
      const currProducts = checkFeature(hasProducts);
      const currContact = checkFeature(currentConfig?.customerLeadFlag);
      const currQueryable = checkFeature(currentConfig?.isQueryable);
      const currActive = checkFeature(currentConfig?.isActive);

      const hasAnyFeature = currBooking || currProducts || currContact || currQueryable;
      if (messages.length >= 1 && hasAnyFeature) {
        showFeatureNotification(setMessages, scrollToBottom);
      }

      prevFeaturesRef.current = {
        isBookingConfigured: currBooking,
        hasProducts: currProducts,
        customerLeadFlag: currContact,
        isQueryable: currQueryable,
        isActive: currActive,
      };
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [
    currentIsLoading,
    loadingPricing,
    isBookingConfigured,
    hasProducts,
    currentConfig?.customerLeadFlag,
    currentConfig?.isQueryable,
    currentConfig?.isActive,
    messages.length,
    setMessages,
    scrollToBottom,
    showFeatureNotification,
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
        }, 1000);
      }
    }
  }, [
    messages.length,
    currentIsLoading,
    loadingPricing,
  ]);

  const logConversation = async (
    userMessage: string,
    agentResponse: string
  ) => {
    if (!isPreview) {
      try {
        await addMessages(userMessage, agentResponse);
      } catch (error) {
        console.error("Failed to log conversation:", error);
      }
    }
  };

  const handleSendMessage = async (inputMessage?: string): Promise<void> => {
    let msgToSend = typeof inputMessage === "string" ? inputMessage : message;

    if (!msgToSend.trim() || !currentConfig?.agentId) return;

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

    const messageCountBefore = messages.length + 1;
    let responseContent = "";

    const contactHandled = await handleContactRequest(
      msgToSend,
      setMessages,
      scrollToBottom,
      currentConfig?.customerLeadFlag
    );

    if (contactHandled) {
      setTimeout(() => {
        const currentMessages = messages;
        const newMessages = currentMessages.slice(messageCountBefore);
        const latestBotMessage = newMessages.find(
          (msg) => msg.sender === "agent"
        );
        responseContent = latestBotMessage
          ? latestBotMessage.content
          : "Contact collection initiated";
        logConversation(msgToSend, responseContent);
      }, 200);
      return;
    }

    const bookingHandled = handleBookingRequest(
      msgToSend,
      setMessages,
      scrollToBottom
    );

    if (bookingHandled) {
      responseContent = "Booking calendar displayed";
      logConversation(msgToSend, responseContent);
      return;
    }

    const productHandled = handleProductRequest(
      msgToSend,
      setMessages,
      scrollToBottom
    );

    if (productHandled) {
      responseContent = "Product catalog displayed";
      logConversation(msgToSend, responseContent);
      return;
    }

    try {
      await handleAIResponse(msgToSend);

      setTimeout(() => {
        const currentMessages = messages;
        const latestAgentMessage = currentMessages
          .slice(messageCountBefore)
          .find((msg) => msg.sender === "agent");

        if (latestAgentMessage) {
          responseContent = latestAgentMessage.content;
          logConversation(msgToSend, responseContent);
        }
      }, 1000);
    } catch (error) {
      console.error("Error handling AI response:", error);
      responseContent = "Error occurred while processing request";
      logConversation(msgToSend, responseContent);
    }
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

  const handleFeatureClick = async (featureText: string): Promise<void> => {
    if (!currentConfig?.agentId) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      content: featureText,
      timestamp: new Date(),
      sender: "user",
    };
    setMessages((m) => [...m, userMsg]);
    setMessage("");
    setShowCues(false);
    scrollToBottom();

    const messageCountBefore = messages.length + 1;
    let responseContent = "";

    const lowerFeatureText = featureText.toLowerCase();

    const isBookingRequest = lowerFeatureText.includes("booking appointments");
    const isProductRequest = lowerFeatureText.includes("browsing our products");
    const isContactRequest = lowerFeatureText.includes("contacting us");
    const isKnowledgeBaseRequest = lowerFeatureText.includes("answering questions about our knowledge base");

    if (isContactRequest) {
      const contactHandled = await handleContactRequest(
        featureText,
        setMessages,
        scrollToBottom,
        currentConfig?.customerLeadFlag
      );

      if (contactHandled) {
        setTimeout(() => {
          const currentMessages = messages;
          const newMessages = currentMessages.slice(messageCountBefore);
          const latestBotMessage = newMessages.find(
            (msg) => msg.sender === "agent"
          );
          responseContent = latestBotMessage
            ? latestBotMessage.content
            : "Contact collection initiated";
          logConversation(featureText, responseContent);
        }, 200);
        return;
      }
    }

    if (isBookingRequest) {
      const bookingHandled = handleBookingRequest(
        featureText,
        setMessages,
        scrollToBottom
      );

      if (bookingHandled) {
        responseContent = "Booking calendar displayed";
        logConversation(featureText, responseContent);
        return;
      }
    }

    if (isProductRequest) {
      const productHandled = handleProductRequest(
        featureText,
        setMessages,
        scrollToBottom
      );

      if (productHandled) {
        responseContent = "Product catalog displayed";
        logConversation(featureText, responseContent);
        return;
      }
    }

    if (isKnowledgeBaseRequest) {
      try {
        await handleAIResponse(featureText);

        setTimeout(() => {
          const currentMessages = messages;
          const latestAgentMessage = currentMessages
            .slice(messageCountBefore)
            .find((msg) => msg.sender === "agent");

          if (latestAgentMessage) {
            responseContent = latestAgentMessage.content;
            logConversation(featureText, responseContent);
          }
        }, 1000);
      } catch (error) {
        console.error("Error handling AI response:", error);
        responseContent = "Error occurred while processing request";
        logConversation(featureText, responseContent);
      }
    }
  };

  const hasClickableFeatures = (content: string): boolean => {
    const clickableFeatures = [
      "Booking appointments",
      "Browsing our products",
      "Contacting us",
      "Answering questions about our knowledge base",
    ];
    return clickableFeatures.some((feature) => content.includes(feature));
  };

  if (botConfigError && !isPreview) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div
          className="w-full h-full max-w-md shadow-2xl overflow-hidden flex flex-col relative"
          style={{
            height: previewConfig
              ? chatHeight
                ? chatHeight
                : 620
              : `${viewportHeight}px`,
          }}
        >
          <BotNotFound theme={theme} />
        </div>
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
                ? `${currentConfig.name} | Sayy.ai Agent`
                : "Sayy.ai Agent"}
            </title>
            <meta
              name="description"
              content={`${currentConfig.bio} | Sayy.ai Agent`}
            />
            <meta
              property="og:title"
              content={`${currentConfig.name} | Sayy.ai chatbot`}
            />
            <meta
              property="og:description"
              content={`${currentConfig.bio} | Sayy.ai Agent`}
            />
            <meta property="og:image" content={currentConfig.logo} />
            <meta
              property="og:image:alt"
              content={`${currentConfig.name} | Sayy.ai Agent`}
            />
            <meta
              property="og:url"
              content={`https://sayy.ai/${currentConfig.username}`}
            />
            <meta name="twitter:card" content="summary_large_image" />
            <meta
              name="twitter:title"
              content={`${currentConfig.name} | Sayy.ai Agent`}
            />
            <meta
              name="twitter:description"
              content={`${currentConfig.bio} | Sayy.ai Agent`}
            />
            <meta name="twitter:image" content={currentConfig.logo} />
          </Helmet>
          {/* for big screen about section in left */}
          {
            !isPreview ? (
              <div className={`w-1/3 hidden md:block overflow-y-auto h-screen border-r ${theme.isDark ? "border-white" : "border-black"}`}>
                  <AboutSection
                    theme={currentConfig.themeColors}
                    currentConfig={currentConfig}
                    socials={currentConfig?.socials}
                    customHandles={currentConfig?.customHandles}
                  />
                </div>
            ) : null
          }
          
          <div
            className="w-full max-w-md md:max-w-full shadow-2xl overflow-hidden flex flex-col relative"
            style={{
              height: previewConfig
                ? chatHeight
                  ? chatHeight
                  : 620
                : `${viewportHeight}px`,
            }}
          >
            
            <div className="flex flex-col h-full">
              {isPreview ? (
              <HeaderSection
                theme={currentConfig.themeColors}
                currentConfig={currentConfig}
                activeScreen={activeScreen}
                setActiveScreen={setActiveScreen}
                
                isPreview={true}
              /> ) : (
              <HeaderSection
                theme={currentConfig.themeColors}
                currentConfig={currentConfig}
                activeScreen={activeScreen}
                setActiveScreen={setActiveScreen}
                isPreview={false}
              /> 
                )
              }

              {isPreview ? (
               activeScreen === "about" && (
                <div className="flex-1 overflow-y-auto">
                  <AboutSection
                    theme={currentConfig.themeColors}
                    currentConfig={currentConfig}
                    socials={currentConfig?.socials}
                    customHandles={currentConfig?.customHandles}

                  />
                </div>
              )
              ) : (
                activeScreen === "about" && (
                 <div className="w-full md:hidden flex-1 block overflow-y-auto">
                <AboutSection
                    theme={currentConfig.themeColors}
                    currentConfig={currentConfig}
                    socials={currentConfig?.socials}
                    customHandles={currentConfig?.customHandles}
                    
                  />
                  </div>
                  )
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
                      onFeatureClick={handleFeatureClick}
                    />
                  </div>

                  {showCues && currentConfig?.prompts && (
                    <div
                      className="p-2 grid grid-cols-1 gap-1 "
                      style={{
                        backgroundColor: theme.isDark ? "#1c1c1c" : "#e9e9e9",
                      }}
                    >
                      {[currentConfig.prompts].map((row, i) => (
                        <div key={i} className={`grid gap-2 ${isPreview ? "grid-cols-2" : "grid-cols-2 md:grid-cols-1"}`}>
                          {row.map((cue) => (
                            <button
                              key={cue}
                              onClick={() => handleCueClick(cue)}
                              disabled={isLoading}
                              className={`px-2 py-2 rounded-xl text-xs font-medium ${isPreview ? "w-full" : "w-full md:w-fit md:min-w-[120px] md:ml-auto md:pr-12 md:pl-4"} `}
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
                    isPreview={isPreview}
                    theme={theme}
                    currentConfig={{
                      agentId: currentConfig?.agentId,
                      name: currentConfig?.name,
                      currency: globalCurrency,
                      sessionName: pricingInfo.sessionName,
                      sessionPrice: pricingInfo.sessionPrice,
                      isFreeSession: pricingInfo.isFreeSession,
                    }}
                    isBookingConfigured={isBookingConfigured}
                    setActiveScreen={
                      setActiveScreen as (
                        screen: "chat" | "browse" | "book"
                      ) => void
                    }
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
