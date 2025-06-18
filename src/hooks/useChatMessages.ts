import {
  useState,
  useEffect,
  useRef,
  Dispatch,
  SetStateAction,
  RefObject,
} from "react";
import { useChatLogs } from "./useChatLogs";
import { ChatMessage, BotConfig } from "../types";
import { shouldUseContext } from "../utils/MessageUtils";
import { queryDocument } from "../lib/serverActions";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface UseChatMessagesReturn {
  messages: ChatMessage[];
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
  scrollToBottom: () => void;
  handleAIResponse: (msgToSend: string) => Promise<boolean>;
}

export function useChatMessages(
  initialMessage: string | undefined,
  currentConfig: BotConfig | null
): UseChatMessagesReturn {
  const { addMessages } = useChatLogs();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1", // Using ID "1" for welcome message
      content: initialMessage || "Hi! How may I help you?",
      timestamp: new Date(),
      sender: "agent",
      type: "welcome", // Adding a type to identify this as a welcome message
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const welcomeMessageRef = useRef<string | undefined>(initialMessage);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update welcome message when it changes
  useEffect(() => {
    // Only update if the initialMessage has actually changed
    if (initialMessage && initialMessage !== welcomeMessageRef.current) {
      welcomeMessageRef.current = initialMessage;

      // Reset message state with new welcome message
      setMessages([
        {
          id: "1", // Always use "1" for welcome message
          content: initialMessage,
          timestamp: new Date(),
          sender: "agent",
          type: "welcome", // Mark as welcome message
        },
      ]);

      // Clear any welcome message animation flags from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith("animated_1") || key.startsWith("animated_welcome"))
        ) {
          localStorage.removeItem(key);
        }
      }
    }
  }, [initialMessage]);

  const handleAIResponse = async (msgToSend: string): Promise<boolean> => {
    if (!currentConfig?.agentId) return false;

    // Check if the bot is queryable
    if (currentConfig.isQueryable === false) {
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 3).toString(),
          content:
            "This bot is currently disabled. Please contact the administrator to enable it.",
          timestamp: new Date(),
          sender: "agent",
        },
      ]);
      return true; // Return true since we handled the message
    }

    // Check if the bot is active
    if (currentConfig.isActive === false) {
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 3).toString(),
          content:
            "Credits exhausted. Kindly ask administrator to refill credits/upgrade plan.",
          timestamp: new Date(),
          sender: "agent",
        },
      ]);
      return false;
    }

    setIsLoading(true);
    try {
      const recentMessages = messages.slice(-1);
      const useContext = shouldUseContext(msgToSend, recentMessages);
      let enhancedQuery: string;

      if (useContext && recentMessages.length > 0) {
        const conversationContext = recentMessages
          .map(
            (msg) =>
              `${msg.sender === "agent" ? "Assistant" : "User"}: ${msg.content}`
          )
          .join("\n\n");

        enhancedQuery = `${conversationContext}\n\nUser: ${msgToSend}\n\nAssistant should respond to the user's latest message with the previous context in mind.`;
      } else {
        enhancedQuery = msgToSend;
      }

      const queryContext = await queryDocument(
        currentConfig.agentId,
        enhancedQuery
      );

      let voiceTone =
        currentConfig?.personalityType?.value?.toString() || "friendly";
      let systemPrompt = `You are a conversational AI assistant creating engaging, personalized responses. When context is available: ${JSON.stringify(
        queryContext
      )}, use it for relevant answers. For conversational queries or insufficient context, build rapport.

      Core Rules:
      - Keep responses concise yet engaging (1-2 sentences)
      - Personalize using details from user queries
      - Maintain a ${voiceTone} tone that connects
      - Ask thoughtful follow-up questions when appropriate
      - Use natural, warm language
      - Greeting should be replied with greeting only.

      Formatting:
      - **Bold** for key points
      - *Italic* for subtle emphasis
      - Bullet points (-) for lists
      - \`code\` for technical snippets
      - > for important quotes
      - [text](url) for resources

      Engagement:
      - Acknowledge user emotions and perspectives
      - Use relevant examples and analogies
      - Offer actionable insights when possible
      - Create collaborative problem-solving
      - Show enthusiasm for user interests
      - End with helpful suggestions or questions

      Boundaries:
      - Focus on user inquiries and training data
      - Ask clarifying questions when needed
      - Never mention access to training data
      - Stay within knowledge scope
      - Redirect off-topic conversations politely
      - End on a positive, forward-moving note`;

      const streamingMsgId = (Date.now() + 2).toString();
      const streamingMsg: ChatMessage = {
        id: streamingMsgId,
        content: "",
        timestamp: new Date(),
        sender: "agent",
      };
      setMessages((m) => [...m, streamingMsg]);

      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: enhancedQuery },
        ],
        temperature: 0.6,
        stream: true,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullResponse += content;

        setMessages((messages) =>
          messages.map((msg) =>
            msg.id === streamingMsgId ? { ...msg, content: fullResponse } : msg
          )
        );

        scrollToBottom();
      }

      await addMessages(msgToSend, fullResponse);
      return true;
    } catch (err) {
      console.error("Error generating response:", err);
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 3).toString(),
          content: "Sorry, there was an error. Please try again.",
          timestamp: new Date(),
          sender: "agent",
        },
      ]);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    setMessages,
    isLoading,
    messagesEndRef,
    scrollToBottom,
    handleAIResponse,
  };
}
