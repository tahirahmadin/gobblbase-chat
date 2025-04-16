import React, { useState, useEffect } from "react";
import { UserCircle, Loader2 } from "lucide-react";
import OpenAI from "openai";

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

const PERSONALITY_TYPES = [
  {
    id: "influencer",
    name: "Social Media Influencer",
    description: "Energetic, trendy, and engaging communication style that connects with audiences.",
    prompt: "Respond like a social media influencer. Use trendy language, be conversational and engaging, add occasional emojis, keep messages concise yet energetic, and focus on creating connection with the user. Make your responses feel like they're coming from someone who is charismatic and knows how to keep an audience engaged. Use phrases like 'you guys', 'literally', 'absolutely love', 'super excited', and 'amazing'. Occasionally use abbreviated words and colloquialisms. Vary sentence length but keep them generally short and impactful."
  },
  {
    id: "professional",
    name: "Business Professional",
    description: "Formal, precise, and authoritative communication focused on clarity and expertise.",
    prompt: "Respond like a business professional. Use formal language, precise terminology, structured responses, and maintain an authoritative tone. Focus on clarity, accuracy, and demonstrating expertise. Avoid casual expressions and slang. Use complete sentences with proper grammar and punctuation. Structure responses with clear introductions and conclusions. Employ professional phrases like 'I recommend', 'best practice suggests', 'from my assessment', and 'in my professional opinion'. Maintain a confident, measured tone throughout."
  },
  {
    id: "friendly",
    name: "Friendly Helper",
    description: "Warm, approachable, and supportive communication that puts users at ease.",
    prompt: "Respond like a friendly helper. Use warm, conversational language, show empathy, ask supportive follow-up questions, and focus on building rapport. Make your responses feel like they're coming from someone who genuinely cares about helping the user in a comfortable, relaxed manner. Use phrases like 'I understand how you feel', 'that's a great question', 'I'm happy to help with that', and 'let me know if there's anything else'. Include personal touches and occasional gentle humor where appropriate."
  },
  {
    id: "expert",
    name: "Subject Matter Expert",
    description: "Detailed, technical, and informative communication that demonstrates deep knowledge.",
    prompt: "Respond like a subject matter expert. Use technical terminology appropriate to the topic, provide detailed explanations, cite relevant concepts or principles, and focus on accuracy and depth. Make your responses demonstrate deep domain knowledge while still being accessible. Structure explanations logically, moving from foundational concepts to more complex details. Use phrases like 'research indicates', 'a key principle here is', 'it's important to note that', and 'to understand this fully, consider'. Balance technical precision with clarity."
  },
  {
    id: "motivational",
    name: "Motivational Speaker",
    description: "Inspiring, energetic, and conviction-filled communication that empowers and motivates.",
    prompt: "Respond like a motivational speaker. Use powerful, persuasive language with conviction and confidence. Include inspirational anecdotes, metaphors, and calls to action. Emphasize possibilities and focus on overcoming challenges. Use phrases like 'imagine what's possible', 'you have the power to', 'take the first step today', 'this is your moment', and 'I believe in you'. Vary sentence lengths dramatically for emphasis, using very short sentences to punctuate important points. Occasionally use rhetorical questions to engage the user in self-reflection."
  },
  {
    id: "casual",
    name: "Casual Friend",
    description: "Relaxed, informal, and authentic communication that feels like talking to a friend.",
    prompt: "Respond like a casual friend. Use informal language with occasional slang, keep things light and easygoing, and maintain a conversational tone throughout. Don't worry about perfect grammar or structure - be more natural and spontaneous. Use phrases like 'hey there', 'so anyway', 'kinda', 'pretty much', and 'y'know what I mean?'. Feel free to use contractions, add friendly banter, and show personality through language choices. Respond as if chatting with a friend you've known for years."
  },
  {
    id: "custom-personality",
    name: "Custom Personality",
    description: "Create your own custom personality traits for the AI response style.",
    prompt: ""
  }
];

async function analyzePersonality(text: string, openaiClient: any): Promise<PersonalityAnalysis> {
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
- mimicryInstructions: Specific instructions on how to mimic their style accurately`
        },
        { role: "user", content: text }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
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
      mimicryInstructions: ""
    };
  }
}

interface PersonalityAnalyzerProps {
  openaiClient: any;
  onPersonalityChange: (personalityType: string, isCustom: boolean, customPrompt: string, analysisResult: PersonalityAnalysis | null) => void;
  initialPersonality?: {
    type: string;
    isCustom: boolean;
    customPrompt: string;
  };
}

const PersonalityAnalyzer: React.FC<PersonalityAnalyzerProps> = ({ 
  openaiClient, 
  onPersonalityChange,
  initialPersonality = { type: "professional", isCustom: false, customPrompt: "" }
}) => {
  const [selectedPersonality, setSelectedPersonality] = useState(initialPersonality.type);
  const [isCustomPersonality, setIsCustomPersonality] = useState(initialPersonality.isCustom);
  const [customPersonalityPrompt, setCustomPersonalityPrompt] = useState(initialPersonality.customPrompt);
  const [showPersonalitySection, setShowPersonalitySection] = useState(true);
  const [personalityText, setPersonalityText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [personalityAnalysis, setPersonalityAnalysis] = useState<PersonalityAnalysis | null>(null);

  useEffect(() => {
    onPersonalityChange(
      selectedPersonality,
      isCustomPersonality,
      isCustomPersonality ? customPersonalityPrompt : "",
      personalityAnalysis
    );
  }, [selectedPersonality, isCustomPersonality, customPersonalityPrompt, personalityAnalysis, onPersonalityChange]);

  const handlePersonalityChange = (personalityId: string) => {
    if (personalityId === "custom-personality") {
      setIsCustomPersonality(true);
    } else {
      setIsCustomPersonality(false);
      setSelectedPersonality(personalityId);
    }
  };

  const handleAnalyzePersonality = async () => {
    if (personalityText.trim()) {
      setIsLoading(true);
      try {
        const analysis = await analyzePersonality(personalityText, openaiClient);
        setPersonalityAnalysis(analysis);
        if (analysis.dominantTrait && analysis.dominantTrait !== "neutral" && PERSONALITY_TYPES.some(p => p.id === analysis.dominantTrait)) {
          setSelectedPersonality(analysis.dominantTrait);
          setIsCustomPersonality(false);
        } else if (analysis.dominantTrait && analysis.dominantTrait !== "neutral") {
          setIsCustomPersonality(true);
          if (analysis.mimicryInstructions) {
            setCustomPersonalityPrompt(analysis.mimicryInstructions);
          }
        }
      } catch (error) {
        console.error("Error during analysis:", error);
        alert("There was an error analyzing the text. Please try again with different content.");
      } finally {
        setIsLoading(false);
      }
    }
  };

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
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Personality Type
            </label>
            <select
              value={isCustomPersonality ? "custom-personality" : selectedPersonality}
              onChange={(e) => handlePersonalityChange(e.target.value)}
              className="w-full p-2 bg-gray-50 rounded-md text-sm text-gray-600 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {PERSONALITY_TYPES.map((personality) => (
                <option key={personality.id} value={personality.id}>
                  {personality.name}
                </option>
              ))}
            </select>
          </div>
          {isCustomPersonality ? (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Custom Personality Instructions
              </label>
              <textarea
                value={customPersonalityPrompt}
                onChange={(e) => setCustomPersonalityPrompt(e.target.value)}
                className="w-full p-2 bg-gray-50 rounded-md text-sm text-gray-600 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-28 resize-none"
                placeholder="Describe how the AI should respond (tone, style, vocabulary, etc.)..."
              />
            </div>
          ) : (
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded-md">
              {PERSONALITY_TYPES.find(p => p.id === selectedPersonality)?.description}
            </div>
          )}
          <div className="border-t border-gray-100 pt-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Analyze Personality from Content
            </label>
            <div className="space-y-2">
              <textarea
                value={personalityText}
                onChange={(e) => setPersonalityText(e.target.value)}
                className="w-full p-2 bg-gray-50 rounded-md text-sm text-gray-600 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-28 resize-none"
                placeholder="Paste content from speeches, videos, podcasts, articles, or social media to analyze personality..."
              />
              <div className="flex items-center gap-1 text-xs text-gray-500 italic">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>For best results, paste 200+ words of authentic speech or writing</span>
              </div>
            </div>
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
          </div>
          {personalityAnalysis && (
            <div className="bg-gray-50 p-2 rounded-md">
              <p className="text-xs font-medium text-gray-700">Analysis Results:</p>
              <p className="text-xs text-gray-600 mt-1">
                <span className="font-medium">Style: </span>
                {personalityAnalysis.dominantTrait.charAt(0).toUpperCase() + personalityAnalysis.dominantTrait.slice(1)}
                {personalityAnalysis.confidence > 0 && 
                  ` (${Math.round(personalityAnalysis.confidence * 100)}% confidence)`}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {personalityAnalysis.briefDescription}
              </p>
              <div className="mt-2 border-t border-gray-200 pt-2">
                <details className="text-xs">
                  <summary className="font-medium text-indigo-600 cursor-pointer">View Detailed Analysis</summary>
                  <div className="mt-2 space-y-2">
                    {personalityAnalysis.speechPatterns && personalityAnalysis.speechPatterns.length > 0 && (
                      <div>
                        <p className="font-medium">Speech Patterns:</p>
                        <ul className="list-disc ml-4">
                          {Array.isArray(personalityAnalysis.speechPatterns) ? 
                            personalityAnalysis.speechPatterns.map((pattern, index) => (
                              <li key={index}>{pattern}</li>
                            )) : 
                            <li>{String(personalityAnalysis.speechPatterns)}</li>
                          }
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
  );
};

export default PersonalityAnalyzer;
