import { useState, useRef, Dispatch, SetStateAction, useEffect } from 'react';
import { ChatMessage } from '../types';

// Template messages for feature notifications - make sure they match your tone
const featureNotificationMessages = [
  "I can help you with {{features}}.",
  "I'm here to help with {{features}}.",
  "My capabilities include {{features}}.",
];

if (typeof window !== 'undefined') {
  if (!window.hasOwnProperty('featuresMessageShown')) {
    (window as any).featuresMessageShown = false;
  }
  
  if (!window.hasOwnProperty('featuresMessageContent')) {
    (window as any).featuresMessageContent = "";
  }
  
  if (!window.hasOwnProperty('featuresMessageId')) {
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
  const [featuresShown, setFeaturesShown] = useState<boolean>(
    typeof window !== 'undefined' ? (window as any).featuresMessageShown : false
  );
  
  const isShowingFeatures = useRef<boolean>(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFeaturesShown((window as any).featuresMessageShown);
    }
  }, []);

  const isWelcomeMessageAnimated = (): boolean => {
    if (typeof window !== 'undefined') {
      return (window as any).welcomeMessageAnimated === true;
    }
    return false;
  };

  const areFeaturesMessageShown = (): boolean => {
    if (typeof window !== 'undefined') {
      return (window as any).featuresMessageShown === true;
    }
    return false;
  };

  const resetFeaturesShown = () => {
    setFeaturesShown(false);
    isShowingFeatures.current = false;
    
    if (typeof window !== 'undefined') {
      (window as any).featuresMessageShown = false;
      (window as any).featureMessageAnimated = false;
      (window as any).featuresMessageContent = "";
      (window as any).featuresMessageId = "";
    }
  };

  const showFeatureNotifications = (
    setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
    scrollToBottom: () => void
  ) => {
    if (featuresShown || isShowingFeatures.current || areFeaturesMessageShown()) {
      
      if (typeof window !== 'undefined' && 
          (window as any).featuresMessageShown && 
          (window as any).featuresMessageContent && 
          (window as any).featuresMessageId) {
            
        setMessages(messages => {
          if (messages.some(msg => msg.id === (window as any).featuresMessageId)) {
            return messages;
          }
          
          const restoredMsg: ChatMessage = {
            id: (window as any).featuresMessageId,
            content: (window as any).featuresMessageContent,
            timestamp: new Date(),
            sender: "agent"
          };
          
          return [...messages, restoredMsg];
        });
        
        scrollToBottom();
      }
      
      return;
    }

    if (!isWelcomeMessageAnimated()) {
      console.log("Welcome message still animating, postponing feature notifications");
      
      setTimeout(() => {
        showFeatureNotifications(setMessages, scrollToBottom);
      }, 500);
      
      return;
    }

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
    
    const featuresMsgId = "features-" + Date.now().toString();
    
    if (typeof window !== 'undefined') {
      (window as any).featuresMessageShown = true;
      (window as any).featuresMessageContent = finalMessage;
      (window as any).featuresMessageId = featuresMsgId;
    }
    
    const featuresMsg: ChatMessage = {
      id: featuresMsgId,
      content: finalMessage,
      timestamp: new Date(),
      sender: "agent"
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
