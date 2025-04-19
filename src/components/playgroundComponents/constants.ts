import {
  ThemeOption,
  ModelOption,
  SystemPromptTemplate,
  TonePreset,
} from "./types";

export const AVAILABLE_THEMES: ThemeOption[] = [
  {
    id: "crypto",
    name: "Crypto Theme",
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200&h=200&q=80",
    description: "Modern crypto-inspired design",
    palette: ["#000000", "#F0B90A", "#1E2026", "#FFFFFF"],
    theme: {
      headerColor: "#000000",
      headerTextColor: "#F0B90A",
      headerNavColor: "#bdbdbd",
      headerIconColor: "#F0B90A",
      chatBackgroundColor: "#313131",
      bubbleAgentBgColor: "#1E2026",
      bubbleAgentTextColor: "#ffffff",
      bubbleAgentTimeTextColor: "#F0B90A",
      bubbleUserBgColor: "#F0B90A",
      bubbleUserTextColor: "#000000",
      bubbleUserTimeTextColor: "#000000",
      inputCardColor: "#27282B",
      inputBackgroundColor: "#212121",
      inputTextColor: "#ffffff",
    },
  },
  {
    id: "modern-dark",
    name: "Modern Dark",
    image:
      "https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=200&q=80",
    description: "Sleek dark theme with high contrast",
    palette: ["#000000", "#1A1A1A", "#333333", "#FFFFFF"],
    theme: {
      headerColor: "#000000",
      headerTextColor: "#FFFFFF",
      headerNavColor: "#333333",
      headerIconColor: "#FFFFFF",
      chatBackgroundColor: "#1A1A1A",
      bubbleAgentBgColor: "#333333",
      bubbleAgentTextColor: "#FFFFFF",
      bubbleAgentTimeTextColor: "#999999",
      bubbleUserBgColor: "#FFFFFF",
      bubbleUserTextColor: "#000000",
      bubbleUserTimeTextColor: "#666666",
      inputCardColor: "#000000",
      inputBackgroundColor: "#333333",
      inputTextColor: "#FFFFFF",
    },
  },
  {
    id: "light-minimal",
    name: "Light Minimal",
    image:
      "https://images.unsplash.com/photo-1507878866276-a947ef722fee?w=200&h=200&q=80",
    description: "Clean, minimal light design",
    palette: ["#FFFFFF", "#F3F4F6", "#E5E7EB", "#111827"],
    theme: {
      headerColor: "#FFFFFF",
      headerTextColor: "#111827",
      headerNavColor: "#6B7280",
      headerIconColor: "#111827",
      chatBackgroundColor: "#F3F4F6",
      bubbleAgentBgColor: "#FFFFFF",
      bubbleAgentTextColor: "#111827",
      bubbleAgentTimeTextColor: "#6B7280",
      bubbleUserBgColor: "#111827",
      bubbleUserTextColor: "#FFFFFF",
      bubbleUserTimeTextColor: "#E5E7EB",
      inputCardColor: "#FFFFFF",
      inputBackgroundColor: "#F3F4F6",
      inputTextColor: "#111827",
    },
  },
  {
    id: "forest",
    name: "Forest",
    image:
      "https://images.unsplash.com/photo-1511497584788-876760111969?w=200&h=200&q=80",
    description: "Natural green color scheme",
    palette: ["#064E3B", "#065F46", "#059669", "#ECFDF5"],
    theme: {
      headerColor: "#064E3B",
      headerTextColor: "#ECFDF5",
      headerNavColor: "#065F46",
      headerIconColor: "#ECFDF5",
      chatBackgroundColor: "#065F46",
      bubbleAgentBgColor: "#064E3B",
      bubbleAgentTextColor: "#ECFDF5",
      bubbleAgentTimeTextColor: "#34D399",
      bubbleUserBgColor: "#ECFDF5",
      bubbleUserTextColor: "#064E3B",
      bubbleUserTimeTextColor: "#059669",
      inputCardColor: "#064E3B",
      inputBackgroundColor: "#065F46",
      inputTextColor: "#ECFDF5",
    },
  },
];

export const MODEL_PRESETS: ModelOption[] = [
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    image:
      "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=200&h=200&q=80",
    contextWindow: "128K",
    description: "Our recommended model for best performance",
    traits: ["Fast", "Powerful", "Reliable"],
    details: "Best balance of performance and efficiency",
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    image:
      "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=200&h=200&q=80",
    contextWindow: "16K",
    description: "Fast and cost-effective",
    traits: ["Quick", "Affordable", "Efficient"],
    details: "Great for most everyday tasks",
  },
  {
    id: "claude-3-sonnet",
    name: "Claude 3 Sonnet",
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200&h=200&q=80",
    contextWindow: "200K",
    description: "Balanced performance at lower cost",
    traits: ["Smart", "Economic", "Versatile"],
    details: "Excellent value for money",
  },
];

export const SYSTEM_PROMPT_TEMPLATES: SystemPromptTemplate[] = [
  {
    id: "finance",
    name: "Finance Expert",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&q=80",
    description: "Professional financial advisor",
    prompt:
      "You are an AI financial advisor with expertise in personal finance, investments, and financial planning. Provide clear, professional advice while explaining complex financial concepts in simple terms. Focus on educational value while maintaining accuracy and compliance with financial regulations.",
  },
  {
    id: "teacher",
    name: "Educator",
    image:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&q=80",
    description: "Experienced teacher",
    prompt:
      "You are an experienced teacher with a passion for helping students learn. Break down complex topics into understandable pieces, use examples, and encourage critical thinking. Maintain a supportive and patient tone while ensuring academic accuracy.",
  },
  {
    id: "lawyer",
    name: "Legal Advisor",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&q=80",
    description: "Professional attorney",
    prompt:
      "You are a legal professional providing general legal information and guidance. Maintain a professional tone, use precise language, and always include disclaimers about not providing specific legal advice. Focus on explaining legal concepts clearly while maintaining accuracy.",
  },
  {
    id: "salon",
    name: "Beauty Expert",
    image:
      "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=200&h=200&q=80",
    description: "Salon professional",
    prompt:
      "You are a professional beauty and salon expert with extensive knowledge of hair care, skincare, and beauty treatments. Provide friendly, detailed advice while maintaining professionalism. Focus on both the technical aspects and practical applications of beauty care.",
  },
  {
    id: "custom",
    name: "Custom Prompt",
    image:
      "https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?w=200&h=200&q=80",
    description: "Create your own",
    prompt: "",
  },
];

export const TONE_PRESETS: TonePreset[] = [
  {
    id: "humorous",
    name: "Humorous & Witty",
    image:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&q=80",
    description: "Funny, engaging, with a touch of humor",
    traits: ["Witty", "Playful", "Engaging"],
    prompt:
      "Communicate in a lighthearted, humorous way. Use witty remarks, clever wordplay, and casual language. Keep the tone fun and engaging while still being helpful. Feel free to use appropriate jokes and playful examples to make the conversation enjoyable.",
  },
  {
    id: "professional",
    name: "Professional & Direct",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&q=80",
    description: "Serious, authentic, straight to the point",
    traits: ["Direct", "Clear", "Formal"],
    prompt:
      "Maintain a professional, straightforward communication style. Be concise and direct, focusing on delivering accurate information efficiently. Use formal language and clear explanations without unnecessary elaboration.",
  },
  {
    id: "friendly",
    name: "Friendly & Supportive",
    image:
      "https://images.unsplash.com/photo-1515552726023-7125c8d07fb3?w=200&h=200&q=80",
    description: "Warm, encouraging, approachable",
    traits: ["Supportive", "Warm", "Patient"],
    prompt:
      "Adopt a warm, friendly tone that makes users feel comfortable and supported. Use encouraging language, show empathy, and maintain a helpful, patient approach. Make the conversation feel personal while remaining professional.",
  },
  {
    id: "expert",
    name: "Expert & Analytical",
    image:
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=200&h=200&q=80",
    description: "Technical, detailed, thorough",
    traits: ["Analytical", "Detailed", "Technical"],
    prompt:
      "Communication should be detailed and analytical, demonstrating deep expertise. Use technical terminology when appropriate, provide comprehensive explanations, and back statements with logical reasoning.",
  },
  {
    id: "motivational",
    name: "Motivational & Inspiring",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&q=80",
    description: "Energetic, inspiring, encouraging",
    traits: ["Inspiring", "Energetic", "Positive"],
    prompt:
      "Take an energetic, inspiring approach to communication. Use motivational language, positive reinforcement, and encouraging statements. Focus on possibilities and growth while maintaining enthusiasm.",
  },
  {
    id: "custom-personality",
    name: "Custom Tone",
    image:
      "https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?w=200&h=200&q=80",
    description: "Create your own custom tone",
    traits: ["Customizable", "Flexible", "Unique"],
    prompt: "",
  },
];
