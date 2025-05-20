import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useCartStore } from '../store/useCartStore';
import { ChatMessage, Product } from '../types';
import { 
  getRandomProductIntroMessage,
  getRandomProductUnavailableMessage
} from '../utils/MessageTemplates';
import { containsProductKeywords } from '../utils/MessageUtils';

export interface UseProductsLogicReturn {
  products: Product[];
  handleProductRequest: (
    msgToSend: string, 
    setMessages: Dispatch<SetStateAction<ChatMessage[]>>, 
    scrollToBottom: () => void
  ) => boolean;
  hasProducts: boolean;
}

export function useProductsLogic(agentId?: string): UseProductsLogicReturn {
  const { products, getProductsInventory } = useCartStore();
  
  useEffect(() => {
    if (agentId) {
      getProductsInventory(agentId);
    }
  }, [agentId, getProductsInventory]);
  
  const handleProductRequest = (
    msgToSend: string, 
    setMessages: Dispatch<SetStateAction<ChatMessage[]>>, 
    scrollToBottom: () => void
  ): boolean => {
    if (!containsProductKeywords(msgToSend)) {
      return false;
    }
    
    if (products && products.length > 0) {
      const introMessage = getRandomProductIntroMessage();

      const productIntroMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: introMessage,
        timestamp: new Date(),
        sender: "agent",
        type: "products-intro",
      };

      setMessages((m) => [...m, productIntroMsg]);
      scrollToBottom();

      setTimeout(() => {
        const loadingMsg: ChatMessage = {
          id: (Date.now() + 2).toString(),
          content: "",
          timestamp: new Date(),
          sender: "agent",
          type: "products-loading",
        };
        setMessages((m) => [...m, loadingMsg]);
        scrollToBottom();

        setTimeout(() => {
          setMessages((m) =>
            m.filter((msg) => msg.type !== "products-loading")
          );

          const productsMsg: ChatMessage = {
            id: (Date.now() + 3).toString(),
            content: "",
            timestamp: new Date(),
            sender: "agent",
            type: "products-display",
          };
          setMessages((m) => [...m, productsMsg]);
          scrollToBottom();
        }, 1000);
      }, 1500);

      return true;
    } else {
      const unavailableMessage = getRandomProductUnavailableMessage();
      const notAvailableMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: unavailableMessage,
        timestamp: new Date(),
        sender: "agent",
      };
      setMessages((m) => [...m, notAvailableMsg]);
      return true;
    }
  };
  
  return {
    products,
    handleProductRequest,
    hasProducts: products && products.length > 0
  };
}