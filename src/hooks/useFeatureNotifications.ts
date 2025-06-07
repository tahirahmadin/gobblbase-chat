import { useState, useEffect, Dispatch, SetStateAction, useCallback } from "react";
import { ChatMessage } from "../types";

// Template messages for feature notifications
const featureNotificationMessages = [
  "I can help you with:",
  "I'm here to help with:",
  "My capabilities include:",
];

export interface UseFeatureNotificationsReturn {
  showFeatureNotification: (
    setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
    scrollToBottom: () => void
  ) => void;
  resetFeatures: () => void;
  updateFeatures: () => void;
}

export function useFeatureNotifications(
  isBookingConfigured: boolean | undefined | null,
  hasProducts: boolean | undefined | null,
  customerLeadFlag: boolean | undefined | null,
  isQueryable: boolean | undefined | null,
): UseFeatureNotificationsReturn {
  // Window state to track across renders
  const getMessageShown = () => {
    if (typeof window !== "undefined") {
      return (window as any).featureMessageShown === true;
    }
    return false;
  };
  
  const setMessageShown = (value: boolean) => {
    if (typeof window !== "undefined") {
      (window as any).featureMessageShown = value;
    }
  };

  // Simple state to track if features notification has been shown
  const [featureMessageShown, setFeatureMessageShown] = useState<boolean>(getMessageShown());
  const [featuresChanged, setFeaturesChanged] = useState<boolean>(false);
  
  // More robust feature checking
  const checkFeature = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true' || value === '1';
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'object' && value !== null) return true;
    return false;
  };

  // Generate the feature notification message
  const generateFeatureMessage = useCallback(() => {
    const features: string[] = [];
    
    if (checkFeature(isBookingConfigured)) {
      features.push("Booking appointments");
    }
    
    if (checkFeature(hasProducts)) {
      features.push("Browsing our products");
    }
    
    if (checkFeature(customerLeadFlag)) {
      features.push("Contacting us");
    }
    
    // Special handling for knowledge base feature - it comes with starting text
    const hasKnowledgeBase = checkFeature(isQueryable);
    
    if (features.length === 0 && !hasKnowledgeBase) {
      return "";
    }
    
    // Get random template message
    const messageIndex = Math.floor(Math.random() * featureNotificationMessages.length);
    const baseMessage = featureNotificationMessages[messageIndex];
    
    // Create the content with line break separation
    let content = baseMessage;
    
    if (hasKnowledgeBase) {
      content += "\nAnswering questions about our knowledge base";
      if (features.length > 0) {
        content += " " + features.join(" ");
      }
    } else {
      content += "\n" + features.join(" ");
    }
    
    return content;
  }, [isBookingConfigured, hasProducts, customerLeadFlag, isQueryable, checkFeature]);
  
  // Update features state
  const updateFeatures = useCallback(() => {
    setFeaturesChanged(true);
  }, []);
  
  // Show feature notification in chat
  const showFeatureNotification = useCallback((
    setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
    scrollToBottom: () => void
  ) => {
    const featureMessage = generateFeatureMessage();
    if (!featureMessage) {
      return;
    }
    
    if (featureMessageShown || getMessageShown()) {
      if (featuresChanged) {
        setMessages(messages => {
          const updatedMessages = messages.filter(msg => 
            !(msg.sender === "agent" && 
              (msg.content.includes("capabilities include") || 
               msg.content.includes("I can help you with") ||
               msg.content.includes("I'm here to help with")))
          );
          
          const newFeatureMsg: ChatMessage = {
            id: "features-" + Date.now().toString(),
            content: featureMessage,
            timestamp: new Date(),
            sender: "agent",
            type: "features-combined", 
          };
          
          return [...updatedMessages, newFeatureMsg];
        });
        
        scrollToBottom();
        setFeaturesChanged(false);
      }
      return;
    }
    
    const featureMsg: ChatMessage = {
      id: "features-" + Date.now().toString(),
      content: featureMessage,
      timestamp: new Date(),
      sender: "agent",
      type: "features-combined", 
    };
    
    setMessages(messages => {
      // Check if we already have a feature message in the chat
      const hasFeatureMessage = messages.some(msg => 
        msg.sender === "agent" && 
        (msg.content.includes("capabilities include") || 
         msg.content.includes("I can help you with") ||
         msg.content.includes("I'm here to help with"))
      );
      
      if (hasFeatureMessage) {
        return messages; 
      }
      
      return [...messages, featureMsg];
    });
    
    setFeatureMessageShown(true);
    setMessageShown(true);
    scrollToBottom();
  }, [featureMessageShown, featuresChanged, generateFeatureMessage, getMessageShown, setMessageShown]);
  
  const resetFeatures = useCallback(() => {
    setFeatureMessageShown(false);
    setMessageShown(false);
    setFeaturesChanged(false);
  }, []);
  
  return {
    showFeatureNotification,
    resetFeatures,
    updateFeatures
  };
}
