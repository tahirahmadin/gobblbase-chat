import {
  ModelOption,
  SystemPromptTemplate,
  TonePreset,
  ThemeOption,
} from "./../types";

export const AVAILABLE_THEMES: ThemeOption[] = [
  {
    id: "light-yellow",
    name: "Light Yellow",
    image:
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=200&h=200&q=80",
    description:
      "Bright and friendly, this sunny palette brings clarity and optimism to any chat interface.",
    palette: ["#fff6a0", "#5155CD", "#000000", "#ffffff"],
    theme: {
      isDark: false,
      mainDarkColor: "#EFC715",
      mainLightColor: "#5155CD",
      highlightColor: "#000000",
    },
  },
  {
    id: "lime-green",
    name: "Lime Green",
    image:
      "https://images.unsplash.com/photo-1610878180933-c1d97663cb9d?w=200&h=200&q=80",
    description:
      "Fresh and energetic with vibrant greens — perfect for nature-themed or eco-friendly bots.",
    palette: ["#C2E539", "#A88D16", "#26300B", "#ffffff"],
    theme: {
      isDark: false,
      mainDarkColor: "#C2E539",
      mainLightColor: "#A88D16",
      highlightColor: "#26300B",
    },
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    image:
      "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=200&h=200&q=80",
    description:
      "Warm and inviting, this orange theme channels the glow of golden hour.",
    palette: ["#FF975F", "#70BCDF", "#006587", "#ffffff"],
    theme: {
      isDark: false,
      mainDarkColor: "#FF975F",
      mainLightColor: "#70BCDF",
      highlightColor: "#006587",
    },
  },
  {
    id: "purple-pink",
    name: "Purple Pink",
    image:
      "https://images.unsplash.com/photo-1603984871071-66c79459f19b?w=200&h=200&q=80",
    description:
      "Playful and dreamy, blending soft purples and pinks for a whimsical UI.",
    palette: ["#d16bd7", "#DAAA33", "#EE15C6", "#000000"],
    theme: {
      isDark: false,
      mainDarkColor: "#d16bd7",
      mainLightColor: "#DAAA33",
      highlightColor: "#EE15C6",
    },
  },
  {
    id: "sky-blue",
    name: "Sky Blue",
    image:
      "https://images.unsplash.com/photo-1529676468690-0376b3e4792d?w=200&h=200&q=80",
    description:
      "Clean, calm, and professional — inspired by clear skies and open space.",
    palette: ["#ABC3FF", "#4A68EC", "#001C9A", "#000000"],
    theme: {
      isDark: false,
      mainDarkColor: "#ABC3FF",
      mainLightColor: "#4A68EC",
      highlightColor: "#001C9A",
    },
  },
  {
    id: "dark-blue",
    name: "Dark Blue",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=200&q=80",
    description:
      "A deep and bold theme with electric blues and sharp contrasts for a tech-forward experience.",
    palette: ["#4220cd", "#91a3ff", "#ffcc16", "#000000"],
    theme: {
      isDark: true,
      mainDarkColor: "#4220cd",
      mainLightColor: "#91a3ff",
      highlightColor: "#ffcc16",
    },
  },
  {
    id: "teal-green",
    name: "Teal Green",
    image:
      "https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?w=200&h=200&q=80",
    description:
      "Mystical and bold, this theme evokes starlit skies and late-night coding sessions.",
    palette: ["#16598F", "#B6DFFF", "#D2FF4B", "#000000"],
    theme: {
      isDark: true,
      mainDarkColor: "#16598F",
      mainLightColor: "#B6DFFF",
      highlightColor: "#D2FF4B",
    },
  },
  {
    id: "teal-ocean",
    name: "Teal Ocean",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=200&q=80",
    description:
      "Inspired by ocean depths and coastal calm — ideal for relaxed and focused chats.",
    palette: ["#004F4A", "#CFFFE0", "#35FFB5", "#000000"],
    theme: {
      isDark: true,
      mainDarkColor: "#004F4A",
      mainLightColor: "#CFFFE0",
      highlightColor: "#35FFB5",
    },
  },
  {
    id: "muted-blue",
    name: "Muted Blue",
    image:
      "https://images.unsplash.com/photo-1603575448363-c3ee33c46e2e?w=200&h=200&q=80",
    description:
      "Soft and balanced tones of blue and pink for a modern, relaxed vibe.",
    palette: ["#003A79", "#A6CBFF", "#398CFF", "#000000"],
    theme: {
      isDark: true,
      mainDarkColor: "#003A79",
      mainLightColor: "#A6CBFF",
      highlightColor: "#398CFF",
    },
  },
  {
    id: "forest-green",
    name: "Forest Green",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=200&h=200&q=80",
    description:
      "Grounded in nature, this earthy green palette brings tranquility and focus.",
    palette: ["#12776B", "#C6C6C6", "#FE5D45", "#000000"],
    theme: {
      isDark: true,
      mainDarkColor: "#12776B",
      mainLightColor: "#C6C6C6",
      highlightColor: "#FE5D45",
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
