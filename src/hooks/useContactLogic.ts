import { useState, Dispatch, SetStateAction } from 'react';
import { ChatMessage } from '../types';
import { getRandomContactIntroMessage } from '../utils/MessageTemplates';
import { containsContactKeywords } from '../utils/MessageUtils';
import { 
  LeadCollectionStage, 
  LeadData,
  startLeadCollection, 
  handleLeadCollectionResponse, 
  isInLeadCollectionMode 
} from '../utils/leadCollectionUtils';

export interface UseContactLogicReturn {
  leadCollectionStage: LeadCollectionStage;
  leadData: LeadData;
  handleContactRequest: (
    msgToSend: string, 
    setMessages: Dispatch<SetStateAction<ChatMessage[]>>, 
    scrollToBottom: () => void,
    customerLeadFlag?: boolean
  ) => Promise<boolean>;
  isInLeadCollectionMode: () => boolean;
}

export function useContactLogic(agentId?: string): UseContactLogicReturn {
  const [leadCollectionStage, setLeadCollectionStage] = useState<LeadCollectionStage>(LeadCollectionStage.NOT_COLLECTING);
  const [leadData, setLeadData] = useState<LeadData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  
  const handleContactRequest = async (
    msgToSend: string, 
    setMessages: Dispatch<SetStateAction<ChatMessage[]>>, 
    scrollToBottom: () => void,
    customerLeadFlag?: boolean
  ): Promise<boolean> => {
    if (isInLeadCollectionMode(leadCollectionStage)) {
      if (!agentId) return false;
      
      const isHandled = await handleLeadCollectionResponse(
        msgToSend,
        leadCollectionStage,
        setLeadCollectionStage,
        leadData,
        setLeadData,
        setMessages,
        agentId,
        scrollToBottom
      );

      return isHandled;
    }
    
    if (containsContactKeywords(msgToSend)) {
      if (customerLeadFlag) {
        startLeadCollection(
          setMessages,
          setLeadCollectionStage,
          scrollToBottom
        );
        return true;
      }
      // If contact form is not enabled, let AI handle it
      return false;
    }
    
    return false;
  };
  
  return {
    leadCollectionStage,
    leadData,
    handleContactRequest,
    isInLeadCollectionMode: () => isInLeadCollectionMode(leadCollectionStage)
  };
}