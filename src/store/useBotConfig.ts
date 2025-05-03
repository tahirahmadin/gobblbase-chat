import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getAgentDetails,
  updateAgentUsername,
  uploadProfilePicture,
} from "../lib/serverActions";
import { toast } from "react-hot-toast";
import { Theme } from "../types";

interface BotConfig {
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
  promotionalBanner: string | null;
  isPromoBannerEnabled: boolean;
  logo: string;
  sessionName: string;

  stripeAccountId: string;
  currency: string;

  isCustomPersonality: boolean;
  customPersonalityPrompt: string;
  lastPersonalityContent: string;
  lastPersonalityUrl: string;
  personalityAnalysis: any;
  personalityType: string;
  systemPrompt: string;
  model: string;

  themeColors: Theme;

  // Voice Personality
  voicePersonality: string;
  customVoiceName?: string;
  customVoiceCharacteristics?: string;
  customVoiceExamples?: string;

  // Welcome Message
  welcomeMessage: string;

  // Brain
  language: string;
  smartenUpAnswers: string[];

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

interface BotConfigState {
  activeBotId: string | null;
  activeBotData: BotConfig | null;

  isLoading: boolean;
  error: string | null;

  refetchBotData: number;
  setRefetchBotData: () => void;

  setActiveBotId: (id: string | null) => void;
  setActiveBotData: (data: BotConfig | null) => void;
  fetchBotData: (
    agentIdOrUsername: string,
    isFetchByUsername: boolean
  ) => Promise<void>;
  updateBotUsernameViaStore: (
    inputBotId: string,
    inputUsername: string
  ) => Promise<void>;
  updateBotLogoViaStore: (
    inputBotId: string,
    inputProfilePicture: File
  ) => Promise<void>;
}

export const useBotConfig = create<BotConfigState>()(
  persist(
    (set, get) => ({
      activeBotId: null,
      activeBotData: null,
      refetchBotData: 0,

      isLoading: false,
      error: null,

      setRefetchBotData: () =>
        set({ refetchBotData: get().refetchBotData + 1 }),
      setActiveBotId: async (id) => {
        console.log("Setting activeBotId to:", id);

        set({ activeBotId: id });

        if (id) {
          try {
            set({ isLoading: true, error: null });
            console.log("Fetching data for bot ID:", id);

            // Fetch the bot data
            let response = await getAgentDetails(id, false);

            // Extract only the required fields from the response
            const cleanConfig: BotConfig = {
              agentId: response.agentId,
              username: response.username,
              name: response.name,
              bio: response.bio || "",
              logo: response.logo,
              stripeAccountId: response.stripeAccountId,
              currency: response.currency,
              model: response.model,
              systemPrompt: response.systemPrompt,
              personalityType: response.personalityType,
              themeColors: response.themeColors,
              customPersonalityPrompt: response.customPersonalityPrompt,
              isCustomPersonality: response.isCustomPersonality,
              lastPersonalityContent: response.lastPersonalityContent,
              lastPersonalityUrl: response.lastPersonalityUrl,
              personalityAnalysis: response.personalityAnalysis,
              socials: response.socials || {
                instagram: "",
                tiktok: "",
                twitter: "",
                facebook: "",
                youtube: "",
                linkedin: "",
                snapchat: "",
                link: "",
              },
              promotionalBanner: response.promotionalBanner || "",
              isPromoBannerEnabled: response.isPromoBannerEnabled || false,
              voicePersonality: response.voicePersonality || "friend",
              customVoiceName: response.customVoiceName,
              customVoiceCharacteristics: response.customVoiceCharacteristics,
              customVoiceExamples: response.customVoiceExamples,
              welcomeMessage: response.welcomeMessage || "",
              language: response.language,
              smartenUpAnswers: response.smartenUpAnswers,
              preferredPaymentMethod: response.preferredPaymentMethod,
              sessionName: response.sessionName || "Consultation",
              prompts: response.prompts || [],
              paymentMethods: {
                stripe: {
                  enabled: response.stripe?.enabled || false,
                  accountId: response.stripe?.accountId || "",
                },
                razorpay: {
                  enabled: response.razorpay?.enabled || false,
                  accountId: response.razorpay?.accountId || "",
                },
                usdt: {
                  enabled: response.usdt?.enabled || false,
                  walletAddress: response.usdt?.walletAddress || "",
                  chains: response.usdt?.chains || [],
                },
                usdc: {
                  enabled: response.usdc?.enabled || false,
                  walletAddress: response.usdc?.walletAddress || "",
                  chains: response.usdc?.chains || [],
                },
              },
            };

            if (get().activeBotId === id) {
              console.log("Setting activeBotData for ID:", id, cleanConfig);
              set({ activeBotData: cleanConfig, isLoading: false });
            }
          } catch (error) {
            console.error("Error fetching bot data:", error);
            if (get().activeBotId === id) {
              set({ error: (error as Error).message, isLoading: false });
              toast.error("Failed to fetch bot configuration");
            }
          }
        } else {
          set({ activeBotData: null });
        }
      },

      setActiveBotData: (data) => set({ activeBotData: data }),

      fetchBotData: async (
        agentIdOrUsername: string,
        isFetchByUsername: boolean
      ) => {
        try {
          set({ isLoading: true, error: null });
          let response = await getAgentDetails(
            agentIdOrUsername,
            isFetchByUsername
          );

          set({
            activeBotData: response,
          });
          set({
            activeBotId: response.agentId,
            isLoading: false,
          });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          toast.error("Failed to fetch bot configuration");
        }
      },

      updateBotUsernameViaStore: async (
        inputBotId: string,
        inputUsername: string
      ) => {
        try {
          const response = await updateAgentUsername(inputBotId, inputUsername);
          if (response.error) {
            toast.error(response.error);
          } else {
            const currentData = get().activeBotData;
            if (currentData) {
              set({
                activeBotData: {
                  ...currentData,
                  username: inputUsername,
                },
              });
            }
          }
        } catch (error) {
          console.error("Error updating username:", error);
        }
      },
      updateBotLogoViaStore: async (
        inputBotId: string,
        inputProfilePicture: File
      ) => {
        try {
          const response = await uploadProfilePicture(
            inputBotId,
            inputProfilePicture
          );
          if (response.error) {
            toast.error(response.error);
          } else {
            const currentData = get().activeBotData;
            if (currentData) {
              set({
                activeBotData: {
                  ...currentData,
                  logo: response,
                },
              });
            }
          }
        } catch (error) {
          console.error("Error updating username:", error);
        }
      },
    }),
    {
      name: "bot-config-storage",
    }
  )
);
