import React, { useState, useEffect } from "react";
import {
  UserCircle,
  Loader2,
  Link,
  Youtube,
  Twitter,
  Instagram,
  FileText,
} from "lucide-react";
import OpenAI from "openai";

import {extractContentFromURL} from "../lib/serverActions";

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

export const PERSONALITY_TYPES  = [
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
}) => {
  const [selectedPersonality, setSelectedPersonality] = useState(
    initialPersonality.type
  );
  const [isCustomPersonality, setIsCustomPersonality] = useState(
    initialPersonality.isCustom
  );
  const [customPersonalityPrompt, setCustomPersonalityPrompt] = useState(
    initialPersonality.customPrompt
  );
  const [showPersonalitySection, setShowPersonalitySection] = useState(true);
  const [activeCustomTab, setActiveCustomTab] = useState<
    "instructions" | "analyze"
  >("instructions");

  const [personalityUrl, setPersonalityUrl] = useState(initialUrl);
  const [personalityText, setPersonalityText] = useState(initialContent);
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [contentSource, setContentSource] = useState<"manual" | "url">(
    initialUrl ? "url" : "manual"
  );
  const [extractedPlatform, setExtractedPlatform] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [personalityAnalysis, setPersonalityAnalysis] = useState<
    PersonalityAnalysis | null
  >(null);

  const [backendStatus, setBackendStatus] = useState<
    "unknown" | "online" | "offline"
  >("unknown");

  // check backend once
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

  const handlePersonalityChange = (id: string) => {
    const custom = id === "custom-personality";
    setIsCustomPersonality(custom);
    setSelectedPersonality(id);
    
    // Don't clear content when changing personality type
    // Only clear analysis result
    setPersonalityAnalysis(null);

    onPersonalityChange(
      id, 
      custom, 
      custom ? customPersonalityPrompt : "", 
      null, 
      personalityUrl, 
      personalityText
    );
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
      setExtractedPlatform(result.platform || null);
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

  const handleAnalyzePersonality = async () => {
    if (!personalityText.trim()) return;
    setIsLoading(true);
    try {
      const analysis = await analyzePersonality(personalityText, openaiClient);
      setPersonalityAnalysis(analysis);

      // Don't automatically change selected personality based on analysis result
      // Only suggest it in the analysis results display but keep current selection

      // If we have mimicry instructions and we're using custom personality mode, 
      // update the custom prompt
      if (isCustomPersonality && analysis.mimicryInstructions) {
        setCustomPersonalityPrompt(analysis.mimicryInstructions);
      }

      // Report the analysis but don't change personality type automatically
      onPersonalityChange(
        selectedPersonality,
        isCustomPersonality,
        isCustomPersonality ? 
          (analysis.mimicryInstructions || customPersonalityPrompt) : 
          customPersonalityPrompt,
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

  // If personality is changed externally, update URL and content
  useEffect(() => {
    if (initialPersonality) {
      setSelectedPersonality(initialPersonality.type);
      setIsCustomPersonality(initialPersonality.isCustom);
      setCustomPersonalityPrompt(initialPersonality.customPrompt);
    }
  }, [initialPersonality]);

  // If url or content is changed externally, update state
  useEffect(() => {
    if (initialUrl !== undefined) {
      setPersonalityUrl(initialUrl);
    }
    if (initialContent !== undefined) {
      setPersonalityText(initialContent);
      setContentSource(initialUrl ? "url" : "manual");
    }
  }, [initialUrl, initialContent]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Personality Settings
        </span>
        <button
          onClick={() => setShowPersonalitySection(!showPersonalitySection)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <UserCircle className="h-4 w-4" />
          {showPersonalitySection ? "Hide" : "Show"}
        </button>
      </div>

      {showPersonalitySection && (
        <div className="space-y-3">
          {/* Personality Type Selector */}
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
            >
              {PERSONALITY_TYPES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Predefined description */}
          {!isCustomPersonality && (
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded-md">
              {
                PERSONALITY_TYPES.find((p) => p.id === selectedPersonality)
                  ?.description
              }
            </div>
          )}

          {/* Custom instructions / analyze tab */}
          {isCustomPersonality && (
            <div className="space-y-3 border-t border-gray-100 pt-3">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveCustomTab("instructions")}
                  className={`px-4 py-2 -mb-px font-medium ${
                    activeCustomTab === "instructions"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Instructions
                </button>
                <button
                  onClick={() => setActiveCustomTab("analyze")}
                  className={`px-4 py-2 -mb-px font-medium ${
                    activeCustomTab === "analyze"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Analyze Content
                </button>
              </div>

              {activeCustomTab === "instructions" ? (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Custom Personality Instructions
                  </label>
                  <textarea
                    value={customPersonalityPrompt}
                    onChange={(e) =>
                      handleCustomPromptChange(e.currentTarget.value)
                    }
                    className="w-full p-2 bg-gray-50 rounded-md text-sm text-gray-600 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 h-28 resize-none"
                    placeholder="Describe how the AI should respond..."
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {/* URL bar */}
                  {backendStatus !== "online" && (
                    <div className="mb-2 text-xs flex items-center text-orange-500 bg-orange-50 p-2 rounded-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
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

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                        {getUrlPlatformIcon()}
                      </div>
                      <input
                        type="url"
                        value={personalityUrl}
                        onChange={(e) => setPersonalityUrl(e.currentTarget.value)}
                        className="w-full pl-8 pr-2 py-2 bg-gray-50 rounded-md text-sm text-gray-600 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter YouTube, Twitter, Instagram, or blog URL..."
                      />
                    </div>
                    <button
                      onClick={handleFetchFromUrl}
                      disabled={
                        isUrlLoading ||
                        !personalityUrl.trim() ||
                        backendStatus !== "online"
                      }
                      className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md text-sm hover:bg-indigo-200 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {isUrlLoading ? (
                        <span className="flex items-center justify-center gap-1">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading...
                        </span>
                      ) : (
                        "Extract Content"
                      )}
                    </button>
                  </div>
                  {urlError && <p className="text-xs text-red-500">{urlError}</p>}

                  {contentSource === "url" && personalityText && (
                    <div className="text-xs text-green-600 flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
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
                      <span>
                        Content successfully extracted from{" "}
                        {extractedPlatform?.[0].toUpperCase() +
                          extractedPlatform?.slice(1)}
                      </span>
                    </div>
                  )}

                  <textarea
                    value={personalityText}
                    onChange={handleTextChange}
                    className="w-full p-2 bg-gray-50 rounded-md text-sm text-gray-600 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-28 resize-none"
                    placeholder={
                      contentSource === "url"
                        ? "Extracted content (edit if needed)..."
                        : "Or paste content here to analyze personality..."
                    }
                  />

                  <button
                    onClick={handleAnalyzePersonality}
                    disabled={isLoading || !personalityText.trim()}
                    className="mt-3 w-full bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md text-sm hover:bg-indigo-200 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-1">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </span>
                    ) : (
                      "Analyze Writing Style & Patterns"
                    )}
                  </button>

                  {personalityAnalysis && (
                    <div className="bg-gray-50 p-2 rounded-md">
                      <p className="text-xs font-medium text-gray-700">
                        Analysis Results:
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        <span className="font-medium">Style: </span>
                        {personalityAnalysis.dominantTrait.charAt(0).toUpperCase() +
                          personalityAnalysis.dominantTrait.slice(1)}
                        {personalityAnalysis.confidence > 0 &&
                          ` (${Math.round(
                            personalityAnalysis.confidence * 100
                          )}% confidence)`}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {personalityAnalysis.briefDescription}
                      </p>
                      <div className="mt-2 border-t border-gray-200 pt-2">
                        <details className="text-xs">
                          <summary className="font-medium text-indigo-600 cursor-pointer">
                            View Detailed Analysis
                          </summary>
                          <div className="mt-2 space-y-2">
                            {personalityAnalysis.speechPatterns.length > 0 && (
                              <div>
                                <p className="font-medium">Speech Patterns:</p>
                                <ul className="list-disc ml-4">
                                  {personalityAnalysis.speechPatterns.map(
                                    (p, i) => (
                                      <li key={i}>{p}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                            {personalityAnalysis.vocabularyStyle && (
                              <div>
                                <p className="font-medium">Vocabulary Style:</p>
                                <p>{personalityAnalysis.vocabularyStyle}</p>
                              </div>
                            )}
                            {personalityAnalysis.sentenceStructure && (
                              <div>
                                <p className="font-medium">Sentence Structure:</p>
                                <p>{personalityAnalysis.sentenceStructure}</p>
                              </div>
                            )}
                            {personalityAnalysis.emotionalTone && (
                              <div>
                                <p className="font-medium">Emotional Tone:</p>
                                <p>{personalityAnalysis.emotionalTone}</p>
                              </div>
                            )}
                            {personalityAnalysis.uniqueMannerisms && (
                              <div>
                                <p className="font-medium">Unique Mannerisms:</p>
                                <p>{personalityAnalysis.uniqueMannerisms}</p>
                              </div>
                            )}
                          </div>
                        </details>
                      </div>
                    </div>
                  )}
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