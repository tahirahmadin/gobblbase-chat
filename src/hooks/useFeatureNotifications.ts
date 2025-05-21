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
  ) => void;
  featuresShown: boolean;
  resetFeaturesShown: () => void;
}

export function useFeatureNotifications(
  isBookingConfigured: boolean,
  hasProducts: boolean,
  customerLeadFlag?: boolean,
  isQueryable?: boolean
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
    ) => {
      // Prevent rapid re-renders by checking last update time
      const now = Date.now();
      if (now - stateRef.current.lastUpdate < 100) {
        return;
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
        return;
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

      if (isBookingConfigured) {
        availableFeatures.push("booking appointments");
      }
      if (hasProducts) {
        availableFeatures.push("browsing our products");
      }
      if (customerLeadFlag) {
        availableFeatures.push("contacting us directly");
      }
      if (isQueryable) {
        availableFeatures.push("answering questions about our knowledge base");
      }

      if (availableFeatures.length === 0) {
        return;
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
    },
    [isBookingConfigured, hasProducts, customerLeadFlag, isQueryable]
  );

  return {
    showFeatureNotifications,
    featuresShown,
    resetFeaturesShown,
  };
}
