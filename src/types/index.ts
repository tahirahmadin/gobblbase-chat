export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  fileUrl?: string;
}

export interface CreateNewAgentResponse {
  error: boolean;
  result: {
    success: boolean;
    message: string;
    collectionName: string;
    agentId: string;
  };
}

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  sender: "user" | "agent";
}

export interface ChatLog {
  _id: string;
  userId: string;
  agentId: string;
  content: string;
  createdDate: string;
  lastUpdatedAt: string;
  sessionId: string;
  userLogs: {
    role: string;
    content: string;
    timestamp: string;
  }[];
  __v: number;
}

export interface Agent {
  name: string;
  agentId: string;
  username?: string;
  logo?: string;
  calendlyUrl?: string;
  systemPrompt?: string;
  model?: string;
  personalityType?: string;
  personalityPrompt?: string;
}

export interface AdminAgent {
  agentId: string;
  username: string;
  logo: string;
  name: string;
}

//Theme Types

export interface Theme {
  id: string;
  name: string;
  isDark: boolean;
  mainDarkColor: string;
  mainLightColor: string;
  highlightColor: string;
}

export interface ModelOption {
  id: string;
  name: string;
  image: string;
  contextWindow: string;
  description: string;
  traits: string[];
  details: string;
}

export interface SystemPromptTemplate {
  id: string;
  name: string;
  image: string;
  description: string;
  prompt: string;
}

export interface TonePreset {
  id: string;
  name: string;
  image: string;
  description: string;
  traits: string[];
  prompt: string;
}
export interface BotConfig {
  agentId: string;
  username: string;
  name: string;
  bio: string;
  socials: {
    instagram: string;
    tiktok: string;
    twitter: string;
    facebook: string;
    youtube: string;
    linkedin: string;
    snapchat: string;
    link: string;
  };
  prompts: string[];
  generatedPrompts: string[];
  promotionalBanner: string | null;
  isPromoBannerEnabled: boolean;
  isQueryable: boolean;
  logo: string;
  sessionName: string;

  stripeAccountId: string;
  currency: string;
  systemPrompt: string;
  model: string;
  themeColors: Theme;

  // Voice Personality
  personalityType: {
    name: string;
    value: string[];
  };

  // Welcome Message
  welcomeMessage: string;

  // Brain
  language: string;
  smartenUpAnswers: string[];

  customerLeadFlag: boolean;

  // Payment Settings
  preferredPaymentMethod: string;
  paymentMethods: {
    stripe: {
      enabled: boolean;
      accountId: string;
    };
    razorpay: {
      enabled: boolean;
      accountId: string;
    };
    usdt: {
      enabled: boolean;
      walletAddress: string;
      chains: string[];
    };
    usdc: {
      enabled: boolean;
      walletAddress: string;
      chains: string[];
    };
  };
}

export interface PersonalityOption {
  id: string;
  title: string;
  image: string;
  traits: string[];
  isCustom?: boolean;
}

export type ProductType = "physical" | "digital" | "service" | "event";
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  type: "digital" | "service" | "event" | "physical";
  images?: string[];
  thumbnail?: string;
}
