import React, { useState, useEffect } from "react";
import {
  UserCircle,
  Loader2,
  Link,
  Youtube,
  Twitter,
  Instagram,
  FileText,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import OpenAI from "openai";

import { extractContentFromURL } from "../lib/serverActions";

interface PersonalityAnalysis {
  dominantTrait: string;
  confidence: number;
  briefDescription: string;
  speechPatterns: string[];
  vocabularyStyle: string;
  sentenceStructure: string;
  emotionalTone: string;
  uniqueMannerisms: string;
  mimicryInstructions?: string;
}

export const PERSONALITY_TYPES = [
  {
    id: "influencer",
    name: "Social Media Influencer",
    description:
      "Energetic, trendy, and engaging communication style that connects with audiences.",
    prompt:
      "Respond like a social media influencer. Use trendy language, be conversational and engaging, add occasional emojis, keep messages concise yet energetic, and focus on creating connection with the user. Make your responses feel like they're coming from someone who is charismatic and knows how to keep an audience engaged. Use phrases like 'you guys', 'literally', 'absolutely love', 'super excited', and 'amazing'. Occasionally use abbreviated words and colloquialisms. Vary sentence length but keep them generally short and impactful.",
  },
  {
    id: "professional",
    name: "Business Professional",
    description:
      "Formal, precise, and authoritative communication focused on clarity and expertise.",
    prompt:
      "Respond like a business professional. Use formal language, precise terminology, structured responses, and maintain an authoritative tone. Focus on clarity, accuracy, and demonstrating expertise. Avoid casual expressions and slang. Use complete sentences with proper grammar and punctuation. Structure responses with clear introductions and conclusions. Employ professional phrases like 'I recommend', 'best practice suggests', 'from my assessment', and 'in my professional opinion'. Maintain a confident, measured tone throughout.",
  },
  {
    id: "friendly",
    name: "Friendly Helper",
    description:
      "Warm, approachable, and supportive communication that puts users at ease.",
    prompt:
      "Respond like a friendly helper. Use warm, conversational language, show empathy, ask supportive follow‑up questions, and focus on building rapport. Make your responses feel like they're coming from someone who genuinely cares about helping the user in a comfortable, relaxed manner. Use phrases like 'I understand how you feel', 'that's a great question', 'I'm happy to help with that', and 'let me know if there's anything else'. Include personal touches and occasional gentle humor where appropriate.",
  },
  {
    id: "expert",
    name: "Subject Matter Expert",
    description:
      "Detailed, technical, and informative communication that demonstrates deep knowledge.",
    prompt:
      "Respond like a subject matter expert. Use technical terminology appropriate to the topic, provide detailed explanations, cite relevant concepts or principles, and focus on accuracy and depth. Make your responses demonstrate deep domain knowledge while still being accessible. Structure explanations logically, moving from foundational concepts to more complex details. Use phrases like 'research indicates', 'a key principle here is', 'it's important to note that', and 'to understand this fully, consider'. Balance technical precision with clarity.",
  },
  {
    id: "motivational",
    name: "Motivational Speaker",
    description:
      "Inspiring, energetic, and conviction‑filled communication that empowers and motivates.",
    prompt:
      "Respond like a motivational speaker. Use powerful, persuasive language with conviction and confidence. Include inspirational anecdotes, metaphors, and calls to action. Emphasize possibilities and focus on overcoming challenges. Use phrases like 'imagine what's possible', 'you have the power to', 'take the first step today', 'this is your moment', and 'I believe in you'. Vary sentence lengths dramatically for emphasis, using very short sentences to punctuate important points. Occasionally use rhetorical questions to engage the user in self‑reflection.",
  },
  {
    id: "casual",
    name: "Casual Friend",
    description:
      "Relaxed, informal, and authentic communication that feels like talking to a friend.",
    prompt:
      "Respond like a casual friend. Use informal language with occasional slang, keep things light and easy‑going, and maintain a conversational tone throughout. Don't worry about perfect grammar or structure—be more natural and spontaneous. Use phrases like 'hey there', 'so anyway', 'kinda', 'pretty much', and 'y'know what I mean?'. Feel free to use contractions, add friendly banter, and show personality through language choices. Respond as if chatting with a friend you've known for years.",
  },
  {
    id: "custom-personality",
    name: "Custom Personality",
    description:
      "Create your own custom personality traits for the AI response style.",
    prompt: "",
  },
];

const URL_PATTERNS = {
  youtube: /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})(\S*)?$/,
  twitter: /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/[0-9]+(\S*)?$/,
  instagram: /^(https?:\/\/)?(www\.)?(instagram\.com)\/(p|reel)\/([a-zA-Z0-9_-]+)(\S*)?$/,
  blog: /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+\/([\w-\/]*)$/,
};

async function analyzePersonality(
  text: string,
  openaiClient: any
): Promise<PersonalityAnalysis> {
  try {
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert in linguistic analysis, speech patterns, and personality profiling.

Your task is to deeply analyze the given text to extract the unique communication style, speech patterns, vocabulary choices, sentence structures, and overall persona of the author/speaker.

Follow these specific steps:
1. Identify frequent phrases, expressions, and speech patterns unique to this person
2. Note their vocabulary choices (formal/informal, technical/simple, trendy terms, catchphrases)
3. Analyze sentence structure (short/long, simple/complex)
4. Detect emotional tone patterns (enthusiastic, authoritative, friendly, etc.)
5. Identify any distinctive speech mannerisms or quirks
6. Detect their typical topic transitions and conversation flow

Provide your analysis in JSON format with these keys:
- dominantTrait: Main personality type (one of: 'influencer', 'professional', 'friendly', 'expert', 'motivational', 'casual', or 'neutral')
- confidence: Number between 0-1 indicating your certainty
- briefDescription: 1-2 sentences summarizing their communication style
- speechPatterns: Array of 3-5 distinctive speech patterns or phrases
- vocabularyStyle: Description of their word choice patterns
- sentenceStructure: How they typically construct sentences
- emotionalTone: Their emotional baseline and variations
- uniqueMannerisms: Any distinctive quirks or speech habits
- mimicryInstructions: Specific instructions on how to mimic their style accurately`,
        },
        { role: "user", content: text },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error("Error analyzing personality:", error);
    return {
      dominantTrait: "neutral",
      confidence: 0,
      briefDescription: "Could not analyze personality.",
      speechPatterns: [],
      vocabularyStyle: "",
      sentenceStructure: "",
      emotionalTone: "",
      uniqueMannerisms: "",
      mimicryInstructions: "",
    };
  }
}

interface PersonalityAnalyzerProps {
  openaiClient: any;
  onPersonalityChange: (
    personalityType: string,
    isCustom: boolean,
    customPrompt: string,
    analysisResult: PersonalityAnalysis | null,
    lastUrl: string,
    lastContent: string
  ) => void;
  initialPersonality?: { type: string; isCustom: boolean; customPrompt: string };
  initialUrl?: string;
  initialContent?: string;
  initialAnalysis?: PersonalityAnalysis | null;
  initialExtractedPlatform?: string | null;
}

const PersonalityAnalyzer: React.FC<PersonalityAnalyzerProps> = ({
  openaiClient,
  onPersonalityChange,
  initialPersonality = {
    type: "professional",
    isCustom: false,
    customPrompt: "",
  },
  initialUrl = "",
  initialContent = "",
  initialAnalysis = null,
  initialExtractedPlatform = null,
}) => {
  // Core personality state
  const [selectedPersonality, setSelectedPersonality] = useState(
    initialPersonality.type
  );
  const [isCustomPersonality, setIsCustomPersonality] = useState(
    initialPersonality.isCustom
  );
  const [customPersonalityPrompt, setCustomPersonalityPrompt] = useState(
    initialPersonality.customPrompt
  );
  
  // UI state
  const [showPersonalitySection, setShowPersonalitySection] = useState(true);
  
  // Custom personality flow state
  const [customPersonalityStep, setCustomPersonalityStep] = useState<
    "select-method" | "write-instructions" | "analyze-content" | "review-analysis"
  >(initialPersonality.isCustom && initialPersonality.customPrompt ? "write-instructions" : "select-method");
  
  // Content state
  const [personalityUrl, setPersonalityUrl] = useState(initialUrl);
  const [personalityText, setPersonalityText] = useState(initialContent);
  const [contentSource, setContentSource] = useState<"manual" | "url">(
    initialUrl ? "url" : "manual"
  );
  const [isContentFromUrl, setIsContentFromUrl] = useState(initialUrl ? true : false);
  const [extractedPlatform, setExtractedPlatform] = useState<string | null>(initialExtractedPlatform);
  
  // Loading and error states
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Analysis result
  const [personalityAnalysis, setPersonalityAnalysis] =
    useState<PersonalityAnalysis | null>(initialAnalysis);
  
  // Backend service state
  const [backendStatus, setBackendStatus] = useState<
    "unknown" | "online" | "offline"
  >("unknown");

  // Initialize from props
  useEffect(() => {
    setPersonalityAnalysis(initialAnalysis);
  }, [initialAnalysis]);

  useEffect(() => {
    setPersonalityUrl(initialUrl);
    setPersonalityText(initialContent);
  }, [initialUrl, initialContent]);

  useEffect(() => {
    setSelectedPersonality(initialPersonality.type);
    setIsCustomPersonality(initialPersonality.isCustom);
    setCustomPersonalityPrompt(initialPersonality.customPrompt);
  }, [initialPersonality]);

  useEffect(() => {
    setExtractedPlatform(initialExtractedPlatform);
  }, [initialExtractedPlatform]);

  // Initialize custom personality step based on props
  useEffect(() => {
    if (initialPersonality.isCustom) {
      if (initialAnalysis) {
        setCustomPersonalityStep("review-analysis");
      } else if (initialPersonality.customPrompt) {
        setCustomPersonalityStep("write-instructions");
      }
    } else {
      setCustomPersonalityStep("select-method");
    }
    
    setIsContentFromUrl(initialUrl ? true : false);
  }, [initialPersonality, initialAnalysis, initialUrl]);

  // Check backend status once
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("https://rag.gobbl.ai/content/health");
        setBackendStatus(res.ok ? "online" : "offline");
      } catch (error) {
        console.error("Error checking backend status:", error);
        setBackendStatus("offline");
      }
    };
    check();
  }, []);

  // Progress indicator for custom personality creation
  const getCustomStepProgress = () => {
    switch (customPersonalityStep) {
      case "select-method":
        return "Step 1 of 3";
      case "write-instructions":
      case "analyze-content":
        return "Step 2 of 3";
      case "review-analysis":
        return "Step 3 of 3";
      default:
        return "";
    }
  };

  // Helper functions
  function getPlatformType(url: string) {
    if (URL_PATTERNS.youtube.test(url)) return "youtube";
    if (URL_PATTERNS.twitter.test(url)) return "twitter";
    if (URL_PATTERNS.instagram.test(url)) return "instagram";
    if (URL_PATTERNS.blog.test(url)) return "blog";
    return "unknown";
  }
  
  function getUrlPlatformIcon() {
    switch (getPlatformType(personalityUrl)) {
      case "youtube":
        return <Youtube className="h-4 w-4 text-red-600" />;
      case "twitter":
        return <Twitter className="h-4 w-4 text-blue-400" />;
      case "instagram":
        return <Instagram className="h-4 w-4 text-pink-500" />;
      case "blog":
        return <FileText className="h-4 w-4 text-gray-600" />;
      default:
        return <Link className="h-4 w-4 text-gray-400" />;
    }
  }

  // Event handlers
  const handlePersonalityChange = (id: string) => {
    const custom = id === "custom-personality";
    setIsCustomPersonality(custom);
    setSelectedPersonality(id);
    
    // Reset custom method when switching away from custom
    if (!custom) {
      setCustomPersonalityStep("select-method");
      setPersonalityAnalysis(null);
    }

    onPersonalityChange(
      id, 
      custom, 
      custom ? customPersonalityPrompt : "", 
      custom ? personalityAnalysis : null, 
      personalityUrl, 
      personalityText
    );
  };

  const handleSetCustomMethod = (method: "manual" | "analyze") => {
    if (method === "manual") {
      setCustomPersonalityStep("write-instructions");
    } else {
      setCustomPersonalityStep("analyze-content");
    }
  };

  const handleBackToCustomOptions = () => {
    setCustomPersonalityStep("select-method");
    // Reset analysis when going back to custom options
    setPersonalityAnalysis(null);
  };

  const handleBackToPersonalityTypes = () => {
    // Reset all custom settings and go back to preset personalities
    handlePersonalityChange("professional");
  };

  const handleFetchFromUrl = async () => {
    if (!personalityUrl.trim()) {
      setUrlError("Please enter a valid URL");
      return;
    }
    if (backendStatus !== "online") {
      setUrlError("Extraction service offline");
      return;
    }
    setIsUrlLoading(true);
    setUrlError("");
    const result = await extractContentFromURL(personalityUrl);
    setIsUrlLoading(false);

    if (result.success && result.content) {
      setPersonalityText(result.content);
      setContentSource("url");
      setIsContentFromUrl(true);
      const platform = result.platform || getPlatformType(personalityUrl);
      setExtractedPlatform(platform);
      onPersonalityChange(
        selectedPersonality,
        isCustomPersonality,
        customPersonalityPrompt,
        personalityAnalysis,
        personalityUrl,
        result.content
      );
    } else {
      setUrlError(result.error || "Failed to extract content");
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const t = e.target.value;
    setPersonalityText(t);
    setContentSource("manual");
    onPersonalityChange(
      selectedPersonality,
      isCustomPersonality,
      customPersonalityPrompt,
      personalityAnalysis,
      personalityUrl,
      t
    );
  };

  const handleCustomPromptChange = (t: string) => {
    setCustomPersonalityPrompt(t);
    onPersonalityChange(
      selectedPersonality,
      true,
      t,
      personalityAnalysis,
      personalityUrl,
      personalityText
    );
  };

  const handleAnalyzePersonality = async () => {
    if (!personalityText.trim()) return;
    setIsLoading(true);
    try {
      const analysis = await analyzePersonality(personalityText, openaiClient);
      setPersonalityAnalysis(analysis);

      // If we have mimicry instructions, update the custom prompt
      if (analysis.mimicryInstructions) {
        setCustomPersonalityPrompt(analysis.mimicryInstructions);
      }

      // Move to the review step
      setCustomPersonalityStep("review-analysis");

      // Report the analysis
      onPersonalityChange(
        selectedPersonality,
        isCustomPersonality,
        analysis.mimicryInstructions || customPersonalityPrompt,
        analysis,
        personalityUrl,
        personalityText
      );
    } catch (error) {
      console.error("Error in personality analysis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-gray-700">
          Personality Settings
        </span>
      </div>

      {showPersonalitySection && (
        <div className="space-y-4">
          {/* Step 1: Personality Type Selector - Always visible */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Personality Type
            </label>
            <select
              value={
                isCustomPersonality ? "custom-personality" : selectedPersonality
              }
              onChange={(e) => handlePersonalityChange(e.target.value)}
              className="w-full p-2 bg-gray-50 rounded-md text-sm text-gray-600 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isCustomPersonality && customPersonalityStep !== "select-method"}
            >
              {PERSONALITY_TYPES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Predefined description - Show only for preset personalities */}
          {!isCustomPersonality && (
            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md">
              {
                PERSONALITY_TYPES.find((p) => p.id === selectedPersonality)
                  ?.description
              }
            </div>
          )}

          {/* Custom Personality Section */}
          {isCustomPersonality && (
            <div className="space-y-4 border-t border-gray-100 pt-3">
              
              {/* Progress indicator for custom personality */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-indigo-600">
                  {getCustomStepProgress()}
                </span>
                
                {customPersonalityStep !== "select-method" && (
                  <button
                    onClick={handleBackToCustomOptions}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    <ArrowLeft className="h-3 w-3 mr-1" />
                    Start over
                  </button>
                )}
              </div>
              
              {/* Step 2 - Option Selection: Choose custom personality method */}
              {customPersonalityStep === "select-method" && (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-gray-700">
                    How would you like to create your custom personality?
                  </p>
                  
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      onClick={() => handleSetCustomMethod("manual")}
                      className="flex flex-col items-start p-4 bg-gray-50 rounded-md border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 transition-colors text-left"
                    >
                      <div className="flex justify-between w-full mb-2">
                        <span className="text-sm font-medium text-gray-700">Write instructions</span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500">Manually specify how the AI should respond</p>
                    </button>
                    
                    <button
                      onClick={() => handleSetCustomMethod("analyze")}
                      className="flex flex-col items-start p-4 bg-gray-50 rounded-md border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 transition-colors text-left"
                    >
                      <div className="flex justify-between w-full mb-2">
                        <span className="text-sm font-medium text-gray-700">Analyze existing content</span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500">Create a personality based on writing samples</p>
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handlePersonalityChange("professional")}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center mt-2"
                  >
                    <ArrowLeft className="h-3 w-3 mr-1" />
                    Back to preset personalities
                  </button>
                </div>
              )}

              {/* Step 2 - Manual Entry: Custom personality instructions */}
              {customPersonalityStep === "write-instructions" && (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <button
                      onClick={handleBackToCustomOptions}
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center mr-3"
                    >
                      <ArrowLeft className="h-3 w-3 mr-1" />
                      Back
                    </button>
                    <p className="text-sm font-medium text-gray-700">
                      Write Custom Instructions
                    </p>
                  </div>
                  
                  <textarea
                    value={customPersonalityPrompt}
                    onChange={(e) =>
                      handleCustomPromptChange(e.currentTarget.value)
                    }
                    className="w-full p-3 bg-gray-50 rounded-md text-sm text-gray-600 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 h-36 resize-none"
                    placeholder="Describe how the AI should respond..."
                  />
                  
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-xs text-blue-700 font-medium mb-1">Tips for effective instructions:</p>
                    <ul className="text-xs text-blue-700 list-disc ml-4 space-y-1">
                      <li>Specify language style (formal, casual, technical)</li>
                      <li>Describe tone (enthusiastic, calm, authoritative)</li>
                      <li>Include example phrases or speech patterns</li>
                      <li>Mention specific vocabulary or terminology to use</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 2 - Analysis: Content analysis flow */}
              {customPersonalityStep === "analyze-content" && (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <button
                      onClick={handleBackToCustomOptions}
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center mr-3"
                    >
                      <ArrowLeft className="h-3 w-3 mr-1" />
                      Back
                    </button>
                    <p className="text-sm font-medium text-gray-700">
                      Analyze Content
                    </p>
                  </div>
                  
                  <div className="text-xs text-gray-600 mb-1">
                    Provide content to analyze. The AI will detect writing style, speech patterns, and vocabulary to create a matching personality.
                  </div>

                  {/* Backend status warning */}
                  {backendStatus !== "online" && (
                    <div className="mb-3 text-xs flex items-center text-orange-500 bg-orange-50 p-3 rounded-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span>
                        Content extraction service is{" "}
                        {backendStatus === "offline" ? "offline" : "not connected"}
                        . URL extraction may not work.
                      </span>
                    </div>
                  )}
                  
                  {/* Content Input Card */}
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    {/* URL Input Section */}
                    <div className="p-3 border-b border-gray-200">
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Extract from URL
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                            {getUrlPlatformIcon()}
                          </div>
                          <input
                            type="url"
                            value={personalityUrl}
                            onChange={(e) => {
                              setPersonalityUrl(e.currentTarget.value);
                              setIsContentFromUrl(false);
                            }}
                            className="w-full pl-8 pr-2 py-2 bg-gray-50 rounded-md text-sm text-gray-600 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Paste a URL (YouTube, Twitter, etc.)"
                          />
                        </div>
                        <button
                          onClick={handleFetchFromUrl}
                          disabled={
                            isUrlLoading ||
                            !personalityUrl.trim() ||
                            backendStatus !== "online"
                          }
                          className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:bg-indigo-300 whitespace-nowrap"
                        >
                          {isUrlLoading ? (
                            <span className="flex items-center justify-center gap-1">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading...
                            </span>
                          ) : (
                            "Extract"
                          )}
                        </button>
                      </div>
                      {urlError && <p className="text-xs text-red-500 mt-1">{urlError}</p>}
                      
                      {/* Extraction success message */}
                      {isContentFromUrl && contentSource === "url" && personalityText && (
                        <div className="text-xs text-green-600 flex items-center gap-1 mt-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {extractedPlatform ? (
                            <span className="font-medium">
                              Content extracted from{" "}
                              {`${extractedPlatform.charAt(0).toUpperCase()}${extractedPlatform.slice(1)}`}
                            </span>
                          ) : (
                            <span className="font-medium">Content successfully extracted</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Text Input Section */}
                    <div className="p-3">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-medium text-gray-700">
                          {isContentFromUrl ? "Review extracted content" : "Or paste content directly"}
                        </label>
                        {isContentFromUrl && (
                          <button 
                            onClick={() => {
                              setPersonalityText("");
                              setIsContentFromUrl(false);
                            }}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <textarea
                        value={personalityText}
                        onChange={(e) => {
                          handleTextChange(e);
                          setIsContentFromUrl(false);
                        }}
                        className="w-full p-3 bg-gray-50 rounded-md text-sm text-gray-600 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 h-36 resize-none"
                        placeholder="Type or paste content to analyze here..."
                      />
                    </div>
                  </div>
                  
                  {/* Analyze button */}
                  <button
                    onClick={handleAnalyzePersonality}
                    disabled={isLoading || !personalityText.trim()}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:bg-indigo-300"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Analyzing...
                      </span>
                    ) : (
                      "Analyze Writing Style & Create Personality"
                    )}
                  </button>
                </div>
              )}

              {/* Step 3 - Review Analysis: Analysis results & apply */}
              {customPersonalityStep === "review-analysis" && personalityAnalysis && (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <button
                      onClick={() => setCustomPersonalityStep("analyze-content")}
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center mr-3"
                    >
                      <ArrowLeft className="h-3 w-3 mr-1" />
                      Back
                    </button>
                    <p className="text-sm font-medium text-gray-700">
                      Analysis Results
                    </p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 bg-indigo-50 border-b border-indigo-100">
                      <div className="flex items-start">
                        <UserCircle className="h-8 w-8 text-indigo-600 mr-3 mt-1" />
                        <div>
                          <h3 className="text-sm font-semibold text-gray-800">
                            {personalityAnalysis.dominantTrait.charAt(0).toUpperCase() +
                              personalityAnalysis.dominantTrait.slice(1)} Style
                            {personalityAnalysis.confidence > 0 &&
                              ` (${Math.round(personalityAnalysis.confidence * 100)}% confidence)`}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {personalityAnalysis.briefDescription}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-xs font-medium text-gray-700 mb-1">Key Speech Patterns</h4>
                          <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                            {personalityAnalysis.speechPatterns.map((pattern, idx) => (
                              <li key={idx}>{pattern}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="pt-2">
                          <h4 className="text-xs font-medium text-gray-700 mb-1">Vocabulary Style</h4>
                          <p className="text-sm text-gray-600">{personalityAnalysis.vocabularyStyle}</p>
                        </div>
                        
                        <div className="pt-2">
                          <h4 className="text-xs font-medium text-gray-700 mb-1">Emotional Tone</h4>
                          <p className="text-sm text-gray-600">{personalityAnalysis.emotionalTone}</p>
                        </div>
                        
                        <details className="pt-2">
                          <summary className="text-xs font-medium text-indigo-600 cursor-pointer">
                            View More Details
                          </summary>
                          <div className="mt-2 space-y-3 pl-2 border-l-2 border-gray-100">
                            <div>
                              <h4 className="text-xs font-medium text-gray-700 mb-1">Sentence Structure</h4>
                              <p className="text-sm text-gray-600">{personalityAnalysis.sentenceStructure}</p>
                            </div>
                            
                            {personalityAnalysis.uniqueMannerisms && (
                              <div>
                                <h4 className="text-xs font-medium text-gray-700 mb-1">Unique Mannerisms</h4>
                                <p className="text-sm text-gray-600">{personalityAnalysis.uniqueMannerisms}</p>
                              </div>
                            )}
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>
                  
                  {/* Apply button */}
                  <button
                    onClick={() => {
                      // Apply the analysis by updating the custom prompt
                      if (personalityAnalysis.mimicryInstructions) {
                        setCustomPersonalityPrompt(personalityAnalysis.mimicryInstructions);
                        // Switch to manual editing mode after applying
                        setCustomPersonalityStep("write-instructions");
                        
                        // Also update parent component
                        onPersonalityChange(
                          selectedPersonality,
                          true,
                          personalityAnalysis.mimicryInstructions,
                          personalityAnalysis,
                          personalityUrl,
                          personalityText
                        );
                      }
                    }}
                    disabled={!personalityAnalysis.mimicryInstructions}
                    className="w-full bg-green-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Apply This Personality
                  </button>
                  
                  <button
                    onClick={() => setCustomPersonalityStep("analyze-content")}
                    className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors"
                  >
                    Try with Different Content
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonalityAnalyzer;