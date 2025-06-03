import { useState, useEffect, Dispatch, SetStateAction, useCallback } from "react";
import { ChatMessage } from "../types";

// Template messages for feature notifications
const featureNotificationMessages = [
  "I can help you with {{features}}.",
  "I'm here to help with {{features}}.",
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
      features.push("booking appointments");
    }
    
    if (checkFeature(hasProducts)) {
      features.push("browsing our products");
    }
    
    if (checkFeature(customerLeadFlag)) {
      features.push("contacting us");
    }
    
    if (checkFeature(isQueryable)) {
      features.push("answering questions about our knowledge base");
    }
    
    if (features.length === 0) {
      return "";
    }
    
    let featuresContent = "";
    if (features.length === 1) {
      featuresContent = features[0];
    } else if (features.length === 2) {
      featuresContent = `${features[0]} and ${features[1]}`;
    } else {
      const lastFeature = features[features.length - 1];
      featuresContent = `${features.slice(0, -1).join(", ")}, and ${lastFeature}`;
    }
    
    const messageIndex = Math.floor(Math.random() * featureNotificationMessages.length);
    return featureNotificationMessages[messageIndex].replace("{{features}}", featuresContent);
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
