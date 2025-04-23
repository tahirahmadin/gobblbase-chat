import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getAgentDetails,
  updateAgentUsername,
  uploadProfilePicture,
} from "../lib/serverActions";
import { toast } from "react-hot-toast";

interface BotConfig {
  agentId: string;
  username: string;
  name: string;
  logo: string;

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
  themeColors: {
    headerColor: string;
    headerTextColor: string;
    headerNavColor: string;
    headerIconColor: string;
    chatBackgroundColor: string;
    bubbleAgentBgColor: string;
    bubbleAgentTextColor: string;
    bubbleAgentTimeTextColor: string;
    bubbleUserBgColor: string;
    bubbleUserTextColor: string;
    bubbleUserTimeTextColor: string;
    inputCardColor: string;
    inputBackgroundColor: string;
    inputTextColor: string;
  };
}

interface BotConfigState {
  activeBotId: string | null;
  activeBotData: BotConfig | null;

  isLoading: boolean;
  error: string | null;

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

      isLoading: false,
      error: null,

      setActiveBotId: (id) => set({ activeBotId: id }),
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

          // Extract only the required fields from the response
          const cleanConfig: BotConfig = {
            agentId: response.agentId,
            username: response.username,
            name: response.name,
            logo: response.logo,
            calendlyUrl: response.calendlyUrl,
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
          };
          set({ activeBotData: cleanConfig, isLoading: false });
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
            set({
              activeBotData: {
                ...get().activeBotData,
                username: inputUsername,
              },
            });
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
            set({
              activeBotData: {
                ...get().activeBotData,
                logo: response,
              },
            });
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
