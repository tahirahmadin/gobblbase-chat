import { useState, useRef, Dispatch, SetStateAction } from 'react';
import { ChatMessage } from '../types';

// Template messages for feature notifications - make sure they match your tone
const featureNotificationMessages = [
  "I can help you with {{features}}. How can I assist you today?",
  "I'm here to help with {{features}}. What can I do for you?",
  "My capabilities include {{features}}. How may I help you?",
];

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
  const [featuresShown, setFeaturesShown] = useState<boolean>(false);
  // Use a ref to ensure we don't show multiple messages
  const isShowingFeatures = useRef<boolean>(false);

  const resetFeaturesShown = () => {
    setFeaturesShown(false);
    isShowingFeatures.current = false;
  };

  const showFeatureNotifications = (
    setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
    scrollToBottom: () => void
  ) => {
    // Check both the state and the ref to be extra safe
    if (featuresShown || isShowingFeatures.current) {
      console.log("Features already shown or in progress, skipping");
      return;
    }

    // Set both state and ref immediately
    setFeaturesShown(true);
    isShowingFeatures.current = true;
    
    // Log the call for debugging
    console.log("showFeatureNotifications called, features set to shown");
    
    // Collect the available features
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
    
    // If no features are available, do nothing
    if (availableFeatures.length === 0) {
      console.log("No features available, skipping notification");
      return;
    }
    
    // Format the features message based on how many features are available
    let featuresContent = "";
    
    if (availableFeatures.length === 1) {
      featuresContent = availableFeatures[0];
    } else if (availableFeatures.length === 2) {
      featuresContent = `${availableFeatures[0]} and ${availableFeatures[1]}`;
    } else {
      const lastFeature = availableFeatures.pop();
      featuresContent = `${availableFeatures.join(', ')}, and ${lastFeature}`;
    }
    
    // Get a single random message template and insert the features
    const messageIndex = Math.floor(Math.random() * featureNotificationMessages.length);
    const messageTemplate = featureNotificationMessages[messageIndex];
    const finalMessage = messageTemplate.replace('{{features}}', featuresContent);
    
    console.log("Adding features message:", finalMessage);
    
    // Add a single message directly, without loading animation
    const featuresMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: finalMessage,
      timestamp: new Date(),
      sender: "agent",
      // Using normal message type to ensure consistent styling
      // type: "features-combined",
    };
    
    setMessages(messages => [...messages, featuresMsg]);
    scrollToBottom();
  };

  return {
    showFeatureNotifications,
    featuresShown,
    resetFeaturesShown
  };
}
