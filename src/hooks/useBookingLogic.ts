import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { getAppointmentSettings } from '../lib/serverActions';
import { formatPrice } from '../utils/FormatUtils';
import { ChatMessage } from '../types';
import { 
  PricingInfo,
  getRandomBookingIntroMessage,
  getRandomBookingManagementIntroMessage,
  getRandomBookingUnavailableMessage
} from '../utils/MessageTemplates';
import {
  containsBookingManagementKeywords,
  containsNewBookingKeywords
} from '../utils/MessageUtils';

export interface UseBookingLogicReturn {
  isBookingConfigured: boolean;
  pricingInfo: PricingInfo;
  loadingPricing: boolean;
  handleBookingRequest: (
    msgToSend: string, 
    setMessages: Dispatch<SetStateAction<ChatMessage[]>>, 
    scrollToBottom: () => void
  ) => boolean;
  refreshPricingAndConfig: () => Promise<void>;
}

export function useBookingLogic(
  agentId?: string, 
  sessionName: string = "Consultation",
  globalCurrency: string = "USD" 
): UseBookingLogicReturn {
  const [isBookingConfigured, setIsBookingConfigured] = useState<boolean>(false);
  const [pricingInfo, setPricingInfo] = useState<PricingInfo>({
    isFreeSession: false,
    sessionPrice: "$0",
    sessionName: sessionName || "Consultation",
    organizationName: "us"
  });
  const [loadingPricing, setLoadingPricing] = useState<boolean>(false);

  // Function to fetch pricing and booking configuration
  const fetchPricingAndBookingConfig = async (): Promise<void> => {
    if (!agentId) return;

    setLoadingPricing(true);
    try {
      const data = await getAppointmentSettings(agentId);
      const hasBookingConfig =
        data &&
        data.availability &&
        Array.isArray(data.availability) &&
        data.availability.length > 0;

      setIsBookingConfigured(hasBookingConfig);

      if (data && data.price) {
        const formattedPrice = formatPrice(data.price);

        setPricingInfo({
          isFreeSession: data.price.isFree,
          sessionPrice: formattedPrice,
          sessionName: data.sessionType || sessionName || "Consultation",
          organizationName: data.name || "us",
          currency: data.price.currency || globalCurrency,
          amount: data.price.amount || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch pricing and booking data:", error);
      setIsBookingConfigured(false);
    } finally {
      setLoadingPricing(false);
    }
  };

  // Function to handle booking messages
  const handleBookingRequest = (
    msgToSend: string, 
    setMessages: Dispatch<SetStateAction<ChatMessage[]>>, 
    scrollToBottom: () => void
  ): boolean => {
    if (containsBookingManagementKeywords(msgToSend)) {
      // Handle booking management request
      const introMessage = getRandomBookingManagementIntroMessage();

      const managementIntroMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: introMessage,
        timestamp: new Date(),
        sender: "agent",
        type: "booking-management-intro",
      };

      setMessages((m) => [...m, managementIntroMsg]);
      scrollToBottom();

      setTimeout(() => {
        const loadingMsg: ChatMessage = {
          id: (Date.now() + 2).toString(),
          content: "",
          timestamp: new Date(),
          sender: "agent",
          type: "booking-loading",
        };
        setMessages((m) => [...m, loadingMsg]);
        scrollToBottom();

        setTimeout(() => {
          setMessages((m) => m.filter((msg) => msg.type !== "booking-loading"));

          const managementMsg: ChatMessage = {
            id: (Date.now() + 3).toString(),
            content: "",
            timestamp: new Date(),
            sender: "agent",
            type: "booking-management",
          };
          setMessages((m) => [...m, managementMsg]);
          scrollToBottom();
        }, 1000);
      }, 1500);

      return true;
    } else if (containsNewBookingKeywords(msgToSend)) {
      if (isBookingConfigured) {
        const introMessage = getRandomBookingIntroMessage(pricingInfo, globalCurrency);
        
        // Add debugging to verify the generated message
        console.log("Generated booking intro message:", introMessage);
        console.log("PricingInfo used:", pricingInfo);
        console.log("GlobalCurrency used:", globalCurrency);
        
        const bookingIntroMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: introMessage,
          timestamp: new Date(),
          sender: "agent",
          type: "booking-intro",
        };
        
        setMessages((m) => [...m, bookingIntroMsg]);
        scrollToBottom();

        setTimeout(() => {
          const loadingMsg: ChatMessage = {
            id: (Date.now() + 2).toString(),
            content: "",
            timestamp: new Date(),
            sender: "agent",
            type: "booking-loading",
          };
          setMessages((m) => [...m, loadingMsg]);
          scrollToBottom();

          setTimeout(() => {
            setMessages((m) =>
              m.filter((msg) => msg.type !== "booking-loading")
            );

            const bookingCalendarMsg: ChatMessage = {
              id: (Date.now() + 3).toString(),
              content: "",
              timestamp: new Date(),
              sender: "agent",
              type: "booking-calendar",
            };
            setMessages((m) => [...m, bookingCalendarMsg]);
            scrollToBottom();
          }, 1000);
        }, 1500);

        return true;
      } else {
        const unavailableMessage = getRandomBookingUnavailableMessage();
        
        const notAvailableMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: unavailableMessage,
          timestamp: new Date(),
          sender: "agent",
        };
        
        setMessages((m) => [...m, notAvailableMsg]);
        return true;
      }
    }

    return false;
  };

  // Initialize data fetching
  useEffect(() => {
    fetchPricingAndBookingConfig();
  }, [agentId, sessionName, globalCurrency]); 

  return {
    isBookingConfigured,
    pricingInfo,
    loadingPricing,
    handleBookingRequest,
    refreshPricingAndConfig: fetchPricingAndBookingConfig
  };
}