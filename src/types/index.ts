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
  type?: MessageType;
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
  teamId: string;
  username: string;
  logo: string;
  name: string;
  personalityType?: {
    name: string;
  };
  isQueryable: boolean;
}

export type MessageType =
  | "booking"
  | "booking-intro"
  | "booking-loading"
  | "booking-calendar"
  | "booking-management-intro"
  | "booking-management"
  | "products-intro"
  | "products-loading"
  | "products-display"
  | "contact-intro"
  | "contact-loading"
  | "contact-form"
  | "welcome";

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
  creditsCost: number;
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
  clientId: string;
  whatsappNumber: {
    countryCode: string;
    number: string;
  };
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
  customHandles: { label: string; url: string }[];
  prompts: string[];
  generatedPrompts: string[];
  promotionalBanner: string | null;
  isPromoBannerEnabled: boolean;
  isQueryable: boolean;
  isActive: boolean;
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
      isActivated: boolean;
      accountId: string;
    };
    razorpay: {
      enabled: boolean;
      accountId: string;
      isActivated: boolean;
    };
    crypto: {
      enabled: boolean;
      isActivated: boolean;
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

export type ProductType =
  | "physicalProduct"
  | "digitalProduct"
  | "Service"
  | "Event";
export interface Product {
  _id: string;
  productId: string;
  title: string;
  description?: string;
  price: number;
  type: ProductType;
  images: string[];
  category: string;
  priceType: "paid" | "free";
  quantityType?: "variedSizes" | "unlimited" | "limited";
  variedQuantities?: Record<string, number>;
  checkType?: string;
  quantity?: number;
  address?: string;
  locationType?: "online" | "offline";
  fileFormat?: string;
  slots?: Array<{
    date: string;
    start: string;
    end: string;
    seatType: "unlimited" | "limited";
    seats: number;
  }>;
  ctaButton?: string;
}

export interface SocialMediaLinks {
  instagram: string;
  twitter: string;
  tiktok: string;
  facebook: string;
  youtube: string;
  linkedin: string;
  snapchat: string;
  link: string;
}

export interface UserDetails {
  _id: string;
  email: string;
  name?: string;
  avatar?: string;
  signUpVia: {
    via: string;
    handle: string;
  };
  shipping: {
    name: string;
    email: string;
    phone: string;
    country: string;
    address1: string;
    address2: string;
    city: string;
    zipcode: string;
  };
}

export interface AnalyticsData {
  bookingsReceived: number;
  dailyIncome: Record<string, number>;
  leadsReceived: number;
  ordersReceived: number;
  totalIncome: number;
  planId: string;
  totalCredits: number;
  availableCredits: number;
}

export interface QueryDocumentResponse {
  context: any; // You might want to define a more specific type based on the actual response
  calendlyUrl?: string;
}

export interface ExtractContentResponse {
  success: boolean;
  content?: string;
  error?: string;
  platform?: string;
}

export interface AvailabilityDay {
  day: string;
  available: boolean;
  timeSlots: {
    startTime: string;
    endTime: string;
  }[];
}

export interface SignUpResult {
  _id: string;
  signUpVia: {
    via: string;
    handle: string;
  };
  agents: any[];
}

export interface SignUpClientResponse {
  error: boolean;
  result: string | SignUpResult;
}

export interface UserLog {
  role: string;
  content: string;
  timestamp?: string;
}

export interface UpdateUserLogsParams {
  userId: string;
  sessionId: string;
  agentId: string;
  newUserLogs: UserLog[];
}

export interface AddProductData {
  file: File;
  title: string;
  description: string;
  image: string;
  price: string;
  about: string;
  agentId: string;
}

export interface Document {
  documentId: string;
  title: string;
  addedAt: string;
  updatedAt: string;
}

export interface DocumentListResponse {
  error: boolean;
  result:
    | {
        agentId: string;
        agentName: string;
        documentCount: number;
        documents: Document[];
      }
    | string;
}

export interface DocumentResponse {
  error: boolean;
  result:
    | {
        message: string;
        agentId: string;
        documentId: string;
        title: string;
        size?: number;
      }
    | string;
}

export interface RemoveDocumentResponse {
  error: boolean;
  result:
    | {
        message: string;
        agentId: string;
        documentId: string;
        remainingDocumentCount: number;
      }
    | string;
}

export interface PlanData {
  id: string;
  name: string;
  price: number;
  currency: string;
  credits: number;
  recurrence: string;
  description: string;
  isCurrentPlan: boolean;
  features: string[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface BookingPayload {
  agentId: string;
  userId: string;
  email?: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  userTimezone?: string;
  name?: string;
  phone?: string;
  notes?: string;
}

export interface PolicyContent {
  enabled: boolean;
  content: string;
}

export interface AgentPoliciesResponse {
  error: boolean;
  result: {
    shipping: PolicyContent;
    returns: PolicyContent;
    privacy: PolicyContent;
    terms: PolicyContent;
    [key: string]: PolicyContent;
  };
}

export interface CustomerLead {
  name: string;
  email: string;
  phone: string;
  queryMessage: string;
  createdAt: string;
}

export interface AdminUser {
  _id: string;
  email: string;
  name?: string;
  role: "user" | "admin";
  createdAt: string;
  lastLogin: string;
}
