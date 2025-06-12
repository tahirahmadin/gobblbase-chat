import { useState, useEffect, Dispatch, SetStateAction, useCallback } from "react";
import { ChatMessage } from "../types";

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

  const [featureMessageShown, setFeatureMessageShown] = useState<boolean>(getMessageShown());
  const [featuresChanged, setFeaturesChanged] = useState<boolean>(false);
  
  const checkFeature = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true' || value === '1';
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'object' && value !== null) return true;
    return false;
  };

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
    
    if (checkFeature(isQueryable)) {
      features.push("Answering questions about our knowledge base");
    }
    
    if (features.length === 0) {
      return "";
    }
    
    const messageIndex = Math.floor(Math.random() * featureNotificationMessages.length);
    const baseMessage = featureNotificationMessages[messageIndex];
    const content = baseMessage + "\n" + features.join(" ");
    
    return content;
  }, [isBookingConfigured, hasProducts, customerLeadFlag, isQueryable, checkFeature]);
  
  const updateFeatures = useCallback(() => {
    setFeaturesChanged(true);
  }, []);
  
  const showFeatureNotification = useCallback((
    setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
    scrollToBottom: () => void
  ) => {
    const featureMessage = generateFeatureMessage();
    if (!featureMessage) {
      return;
    }
    
    const currentFeatureCount = (featureMessage.match(/\b(Booking appointments|Browsing our products|Contacting us|Answering questions about our knowledge base)\b/g) || []).length;
    
    setMessages(messages => {
      const existingFeatureMessage = messages.find(msg => 
        msg.sender === "agent" && 
        (msg.content.includes("capabilities include") || 
         msg.content.includes("I can help you with") ||
         msg.content.includes("I'm here to help with") ||
         msg.type === "features-combined")
      );
      
      if (existingFeatureMessage) {
        const existingFeatureCount = (existingFeatureMessage.content.match(/\b(Booking appointments|Browsing our products|Contacting us|Answering questions about our knowledge base)\b/g) || []).length;
        const shouldUpdate = currentFeatureCount > existingFeatureCount;
        
        if (shouldUpdate) {
          const updatedMessages = messages.filter(msg => {
            const isFeatureMessage = (
              msg.sender === "agent" && 
              (msg.content.includes("capabilities include") || 
               msg.content.includes("I can help you with") ||
               msg.content.includes("I'm here to help with") ||
               msg.type === "features-combined" ||
               (msg.id && String(msg.id).includes("features")))
            );
            return !isFeatureMessage;
          });
          
          const newFeatureMsg: ChatMessage = {
            id: "features-" + Date.now().toString(),
            content: featureMessage,
            timestamp: new Date(),
            sender: "agent",
            type: "features-combined", 
          };
          
          scrollToBottom();
          return [...updatedMessages, newFeatureMsg];
        } else {
          return messages;
        }
      } else {
        const featureMsg: ChatMessage = {
          id: "features-" + Date.now().toString(),
          content: featureMessage,
          timestamp: new Date(),
          sender: "agent",
          type: "features-combined", 
        };
        
        return [...messages, featureMsg];
      }
    });
    
    setFeatureMessageShown(true);
    setMessageShown(true);
    scrollToBottom();
  }, [generateFeatureMessage, getMessageShown, setMessageShown]);
  
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
