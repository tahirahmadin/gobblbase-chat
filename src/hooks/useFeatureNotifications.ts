import { useState, useRef, Dispatch, SetStateAction, useCallback } from "react";
import { ChatMessage } from "../types";

// Template messages for feature notifications - make sure they match your tone
const featureNotificationMessages = [
  "I can help you with {{features}}.",
  "I'm here to help with {{features}}.",
  "My capabilities include {{features}}.",
];

// Initialize window properties only once
if (typeof window !== "undefined") {
  if (!window.hasOwnProperty("featuresMessageShown")) {
    (window as any).featuresMessageShown = false;
  }
  if (!window.hasOwnProperty("featuresMessageContent")) {
    (window as any).featuresMessageContent = "";
  }
  if (!window.hasOwnProperty("featuresMessageId")) {
    (window as any).featuresMessageId = "";
  }
}

export interface UseFeatureNotificationsReturn {
  showFeatureNotifications: (
    setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
    scrollToBottom: () => void
  ) => boolean; 
  featuresShown: boolean;
  resetFeaturesShown: () => void;
  hasAnyFeatures: boolean; 
}

export function useFeatureNotifications(
  isBookingConfigured: boolean | undefined,
  hasProducts: boolean | undefined,
  customerLeadFlag?: boolean | undefined,
  isQueryable?: boolean | undefined
): UseFeatureNotificationsReturn {
  // Use a single ref to track all internal state
  const stateRef = useRef({
    featuresShown:
      typeof window !== "undefined"
        ? (window as any).featuresMessageShown
        : false,
    isShowingFeatures: false,
    lastUpdate: Date.now(),
  });

  // console.log("Feature check values:", {
  //   isBookingConfigured,
  //   hasProducts,
  //   customerLeadFlag,
  //   isQueryable
  // });
  
  const hasBooking = !!isBookingConfigured;
  const hasProductFeature = !!hasProducts;
  const hasContactFeature = !!customerLeadFlag;
  const hasKnowledgeBase = !!isQueryable;
  
  const hasAnyFeatures = !!(
    hasBooking ||
    hasProductFeature ||
    hasContactFeature ||
    hasKnowledgeBase
  );
  
  // console.log("hasAnyFeatures result:", hasAnyFeatures);

  // Only use state for UI updates
  const [featuresShown, setFeaturesShown] = useState<boolean>(
    stateRef.current.featuresShown
  );

  const resetFeaturesShown = useCallback(() => {
    stateRef.current = {
      ...stateRef.current,
      featuresShown: false,
      isShowingFeatures: false,
      lastUpdate: Date.now(),
    };
    setFeaturesShown(false);

    if (typeof window !== "undefined") {
      (window as any).featuresMessageShown = false;
      (window as any).featureMessageAnimated = false;
      (window as any).featuresMessageContent = "";
      (window as any).featuresMessageId = "";
    }
  }, []);

  const showFeatureNotifications = useCallback(
    (
      setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
      scrollToBottom: () => void
    ): boolean => {
      console.log("showFeatureNotifications called, checking for features...");
      
      if (!hasAnyFeatures) {
        console.log("No features available, marking as shown without displaying message");
        if (!stateRef.current.featuresShown) {
          stateRef.current.featuresShown = true;
          setFeaturesShown(true);
          
          if (typeof window !== "undefined") {
            (window as any).featuresMessageShown = true;
          }
        }
        return false;
      }

      // Prevent rapid re-renders by checking last update time
      const now = Date.now();
      if (now - stateRef.current.lastUpdate < 100) {
        return false;
      }

      // Check if features are already shown
      if (
        stateRef.current.featuresShown ||
        stateRef.current.isShowingFeatures
      ) {
        // Restore message if it exists
        if (
          typeof window !== "undefined" &&
          (window as any).featuresMessageShown &&
          (window as any).featuresMessageContent &&
          (window as any).featuresMessageId
        ) {
          setMessages((messages) => {
            if (
              messages.some(
                (msg) => msg.id === (window as any).featuresMessageId
              )
            ) {
              return messages;
            }

            const restoredMsg: ChatMessage = {
              id: (window as any).featuresMessageId,
              content: (window as any).featuresMessageContent,
              timestamp: new Date(),
              sender: "agent",
            };

            return [...messages, restoredMsg];
          });

          scrollToBottom();
        }
        return true;
      }

      // Update state ref
      stateRef.current = {
        ...stateRef.current,
        featuresShown: true,
        isShowingFeatures: true,
        lastUpdate: now,
      };
      setFeaturesShown(true);

      // Collect available features
      const availableFeatures: string[] = [];

      if (hasBooking) {
        console.log("Adding booking feature");
        availableFeatures.push("booking appointments");
      }
      if (hasProductFeature) {
        console.log("Adding products feature");
        availableFeatures.push("browsing our products");
      }
      if (hasContactFeature) {
        console.log("Adding contact feature");
        availableFeatures.push("contacting us directly");
      }
      if (hasKnowledgeBase) {
        console.log("Adding knowledge base feature");
        availableFeatures.push("answering questions about our knowledge base");
      }

      if (availableFeatures.length === 0) {
        if (typeof window !== "undefined") {
          (window as any).featuresMessageShown = true;
        }
        return false;
      }

      // Format features message
      let featuresContent = "";
      if (availableFeatures.length === 1) {
        featuresContent = availableFeatures[0];
      } else if (availableFeatures.length === 2) {
        featuresContent = `${availableFeatures[0]} and ${availableFeatures[1]}`;
      } else {
        const lastFeature = availableFeatures.pop();
        featuresContent = `${availableFeatures.join(", ")}, and ${lastFeature}`;
      }

      // Generate message
      const messageIndex = Math.floor(
        Math.random() * featureNotificationMessages.length
      );
      const messageTemplate = featureNotificationMessages[messageIndex];
      const finalMessage = messageTemplate.replace(
        "{{features}}",
        featuresContent
      );

      const featuresMsgId = "features-" + now.toString();

      // Update window state
      if (typeof window !== "undefined") {
        (window as any).featuresMessageShown = true;
        (window as any).featuresMessageContent = finalMessage;
        (window as any).featuresMessageId = featuresMsgId;
      }

      // Create and add message
      const featuresMsg: ChatMessage = {
        id: featuresMsgId,
        content: finalMessage,
        timestamp: new Date(),
        sender: "agent",
      };

      setMessages((messages) => [...messages, featuresMsg]);
      scrollToBottom();
      return true;
    },
    [isBookingConfigured, hasProducts, customerLeadFlag, isQueryable, hasAnyFeatures]
  );

  return {
    showFeatureNotifications,
    featuresShown,
    resetFeaturesShown,
    hasAnyFeatures, 
  };
}
