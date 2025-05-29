import {
  ModelOption,
  SystemPromptTemplate,
  Theme,
  PersonalityOption,
} from "./../types";

export const backendApiUrl = "https://kifortestapi.gobbl.ai";
// export const backendApiUrl = "https://kiforapi.gobbl.ai";

export const AVAILABLE_THEMES: Theme[] = [
  {
    id: "light-yellow",
    name: "Light Yellow",
    isDark: false,
    mainDarkColor: "#EFC715",
    mainLightColor: "#5155CD",
    highlightColor: "#000000",
  },
  {
    id: "lime-green",
    name: "Lime Green",
    isDark: false,
    mainDarkColor: "#C2E539",
    mainLightColor: "#A88D16",
    highlightColor: "#26300B",
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",

    isDark: false,
    mainDarkColor: "#FF975F",
    mainLightColor: "#70BCDF",
    highlightColor: "#006587",
  },
  {
    id: "purple-pink",
    name: "Purple Pink",

    isDark: false,
    mainDarkColor: "#d16bd7",
    mainLightColor: "#DAAA33",
    highlightColor: "#EE15C6",
  },
  {
    id: "sky-blue",
    name: "Sky Blue",

    isDark: false,
    mainDarkColor: "#ABC3FF",
    mainLightColor: "#4A68EC",
    highlightColor: "#001C9A",
  },
  {
    id: "light-black",
    name: "Light Black",
    isDark: false,
    mainDarkColor: "#e6e6e6",
    mainLightColor: "#8c8c8c",
    highlightColor: "#000000",
  },
  {
    id: "dark-blue",
    name: "Dark Blue",
    isDark: true,
    mainDarkColor: "#4220cd",
    mainLightColor: "#91a3ff",
    highlightColor: "#FFCC16",
  },
  {
    id: "teal-green",
    name: "Teal Green",

    isDark: true,
    mainDarkColor: "#16598F",
    mainLightColor: "#B6DFFF",
    highlightColor: "#D2FF4B",
  },
  {
    id: "teal-ocean",
    name: "Teal Ocean",

    isDark: true,
    mainDarkColor: "#004F4A",
    mainLightColor: "#CFFFE0",
    highlightColor: "#35FFB5",
  },
  {
    id: "muted-blue",
    name: "Muted Blue",

    isDark: true,
    mainDarkColor: "#003A79",
    mainLightColor: "#A6CBFF",
    highlightColor: "#398CFF",
  },
  {
    id: "forest-green",
    name: "Forest Green",

    isDark: true,
    mainDarkColor: "#12776B",
    mainLightColor: "#C6C6C6",
    highlightColor: "#FE5D45",
  },
  {
    id: "dark-white",
    name: "Dark White",
    isDark: true,
    mainDarkColor: "#686868",
    mainLightColor: "#bfbfbf",
    highlightColor: "#ffffff",
  },
];

export const MODEL_PRESETS: ModelOption[] = [
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    image:
      "https://seeklogo.com/images/O/openai-logo-8B9BFEDC26-seeklogo.com.png",
    contextWindow: "128k",
    description:
      "Engineered for maximum intelligence and depth, GPT-4o excels at complex reasoning, long-context comprehension, and advanced problem-solving—making it the top choice for demanding AI applications.",
    traits: ["Complex reasoning", "Long-context", "Advanced problem-solving"],
    details: "Credits Cost: 1",
    creditsCost: 1,
  },
  {
    id: "llama-4-maverick",
    name: "Llama 4 Maverick",
    image:
      "https://seeklogo.com/images/O/openai-logo-8B9BFEDC26-seeklogo.com.png",
    contextWindow: "64k",
    description:
      "Llama 4 Maverick is a high-performance open-source model, ideal for cost-effective, scalable AI solutions with strong reasoning and language capabilities.",
    traits: ["Open-source", "Cost-effective", "Strong reasoning"],
    details: "Credits Cost: 2",
    creditsCost: 2,
  },
  {
    id: "gpt-3-5-turbo",
    name: "GPT-3.5 Turbo",
    image:
      "https://seeklogo.com/images/O/openai-logo-8B9BFEDC26-seeklogo.com.png",
    contextWindow: "16k",
    description:
      "A fast, efficient model for everyday tasks, offering a balance of speed and accuracy for general-purpose applications.",
    traits: ["Fast", "Efficient", "General-purpose"],
    details: "Credits Cost: 1",
    creditsCost: 1,
  },
  // {
  //   id: "llama-3-pro",
  //   name: "Llama 3 Pro",
  //   image:
  //     "https://seeklogo.com/images/O/openai-logo-8B9BFEDC26-seeklogo.com.png",
  //   contextWindow: "32k",
  //   description:
  //     "Meta's Llama 3 Pro delivers robust performance for conversational and creative tasks, with improved context retention.",
  //   traits: ["Conversational", "Creative", "Context retention"],
  //   details: "Credits Cost: 3",
  //   creditsCost: 3,
  // },
  // {
  //   id: "gemini-ultra",
  //   name: "Gemini Ultra",
  //   image:
  //     "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
  //   contextWindow: "128k",
  //   description:
  //     "Google's flagship model for research and enterprise, excelling at multilingual and multimodal understanding.",
  //   traits: ["Multilingual", "Multimodal", "Enterprise-grade"],
  //   details: "Credits Cost: 4",
  //   creditsCost: 4,
  // },
  // {
  //   id: "claude-3-opus",
  //   name: "Claude 3 Opus",
  //   image: "https://avatars.githubusercontent.com/u/139914888?s=200&v=4",
  //   contextWindow: "200k",
  //   description:
  //     "Anthropic's Claude 3 Opus is designed for safe, high-stakes reasoning and long-form content generation.",
  //   traits: ["Safe", "Long-form", "High-stakes reasoning"],
  //   details: "Credits Cost: 5",
  //   creditsCost: 5,
  // },
  // {
  //   id: "mistral-large",
  //   name: "Mistral Large",
  //   image: "https://avatars.githubusercontent.com/u/139914888?s=200&v=4",
  //   contextWindow: "32k",
  //   description:
  //     "Mistral Large is a versatile open-source model, great for summarization, Q&A, and creative writing.",
  //   traits: ["Summarization", "Q&A", "Creative writing"],
  //   details: "Credits Cost: 6",
  //   creditsCost: 6,
  // },
  // {
  //   id: "mixtral-8x22b",
  //   name: "Mixtral 8x22B",
  //   image: "https://avatars.githubusercontent.com/u/139914888?s=200&v=4",
  //   contextWindow: "64k",
  //   description:
  //     "Mixtral 8x22B is optimized for large-scale deployments, offering strong performance in both speed and accuracy.",
  //   traits: ["Large-scale", "Speed", "Accuracy"],
  //   details: "Credits Cost: 7",
  //   creditsCost: 7,
  // },
  // {
  //   id: "grok-1",
  //   name: "Grok-1",
  //   image:
  //     "https://seeklogo.com/images/O/openai-logo-8B9BFEDC26-seeklogo.com.png",
  //   contextWindow: "128k",
  //   description:
  //     "Grok-1 by xAI is designed for real-time, up-to-date knowledge and witty conversational ability.",
  //   traits: ["Real-time knowledge", "Witty", "Conversational"],
  //   details: "Credits Cost: 8",
  //   creditsCost: 8,
  // },
];

export const SYSTEM_PROMPT_TEMPLATES: SystemPromptTemplate[] = [
  {
    id: "medical",
    name: "Medical Professional",
    description: "Healthcare consultation and patient support",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=200&h=200&q=80",
    prompt: `You are a professional medical assistant providing healthcare information and support. Follow these guidelines:
  
  1. Always maintain HIPAA compliance and patient confidentiality
  2. Provide accurate medical information from verified sources
  3. Use clear, non-technical language when explaining medical terms
  4. Never diagnose or prescribe medication
  5. Direct emergency cases to seek immediate medical attention
  6. Focus on:
     - General health information
     - Appointment scheduling
     - Basic symptom guidance
     - Healthcare facility information
     - Insurance and billing queries
  
  Remember: You are an assistant, not a replacement for professional medical advice.`,
  },
  {
    id: "content-creator",
    name: "Content Creator",
    description: "Social media and content management",
    image:
      "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=200&h=200&q=80",
    prompt: `You are a content creation assistant helping with social media and digital content. Follow these guidelines:
  
  1. Provide creative content ideas and strategies
  2. Offer platform-specific best practices
  3. Help with:
     - Content calendar planning
     - Engagement strategies
     - Trend analysis
     - Audience growth tips
     - Analytics interpretation
  4. Suggest content formats and posting schedules
  5. Provide SEO and hashtag recommendations
  
  Focus on actionable, practical advice for content creators.`,
  },
  {
    id: "bakery",
    name: "Bakery Owner",
    description: "Bakery business and customer service",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&q=80",
    prompt: `You are a bakery assistant helping customers and managing operations. Follow these guidelines:
  
  1. Provide information about:
     - Menu items and ingredients
     - Special orders and customization
     - Pricing and promotions
     - Store hours and locations
     - Delivery and pickup options
  2. Handle:
     - Order inquiries
     - Event catering requests
     - Dietary restrictions
     - Product availability
     - Customer feedback
  
  Maintain a warm, friendly tone while being professional.`,
  },
  {
    id: "education",
    name: "Educational Institution",
    description: "Student and parent support",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&h=200&q=80",
    prompt: `You are an educational institution assistant supporting students and parents. Follow these guidelines:
  
  1. Provide information about:
     - Course offerings and schedules
     - Admission requirements
     - Tuition and financial aid
     - Campus facilities
     - Academic policies
  2. Assist with:
     - Application processes
     - Registration procedures
     - Student services
     - Event information
     - Parent communication
  
  Maintain a professional yet approachable tone.`,
  },
  {
    id: "automotive",
    name: "Car Dealership",
    description: "Vehicle sales and service support",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&h=200&q=80",
    prompt: `You are a car dealership assistant helping customers with vehicle-related queries. Follow these guidelines:
  
  1. Provide information about:
     - Available inventory
     - Vehicle specifications
     - Pricing and financing
     - Service schedules
     - Warranty details
  2. Handle:
     - Test drive requests
     - Service appointments
     - Trade-in inquiries
     - Vehicle comparisons
     - Customer feedback
  
  Maintain a professional, knowledgeable tone while being helpful.`,
  },
  {
    id: "custom",
    name: "Custom Profile",
    description: "Create your own custom profile",
    image:
      "https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?w=200&h=200&q=80",
    prompt: "",
  },
];

export const PERSONALITY_OPTIONS: PersonalityOption[] = [
  {
    id: "friend",
    title: "FRIEND",
    image: "/assets/voice/friend.png",
    traits: ["Warm", "Relatable", "Conversational"],
  },
  {
    id: "concierge",
    title: "CONCIERGE",
    image: "/assets/voice/expert.png",
    traits: ["Polished", "Refined", "Formal"],
  },
  {
    id: "coach",
    title: "COACH",
    image: "/assets/voice/coach.png",
    traits: ["Upbeat", "Encouraging", "Motivational"],
  },
  {
    id: "professional",
    title: "PROFESSIONAL",
    image: "/assets/voice/professional.png",
    traits: ["Direct", "Authentic", "Clear"],
  },
  {
    id: "gen_z",
    title: "GEN Z",
    image: "/assets/voice/cool.png",
    traits: ["Casual", "Witty", "Trendy"],
  },
  {
    id: "techie",
    title: "TECHIE",
    image: "/assets/voice/tech.png",
    traits: ["Intuitive", "Intelligent", "Resourceful"],
  },
  // {
  //   id: "custom",
  //   title: "CUSTOM",
  //   traits: ["Create your own", "custom voice"],
  //   isCustom: true,
  // },
];
