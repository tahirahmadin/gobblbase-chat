import { create } from "zustand";
import {
  getAgentDetails,
  updateAgentUsername,
  uploadProfilePicture,
} from "../lib/serverActions";
import { toast } from "react-hot-toast";
import { Theme, BotConfig } from "../types";

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
  clearBotConfig: () => void;
}

export const useBotConfig = create<BotConfigState>()((set, get) => {
  // On initialization, try to get agentId from localStorage
  let initialAgentId: string | null = null;
  if (typeof window !== "undefined") {
    initialAgentId = localStorage.getItem("activeBotId");
  }

  return {
    activeBotId: initialAgentId,
    activeBotData: null,
    refetchBotData: 0,
    isLoading: false,
    error: null,
    setRefetchBotData: () => set({ refetchBotData: get().refetchBotData + 1 }),
    setActiveBotId: async (id) => {
      console.log("Setting activeBotId to:", id);
      if (typeof window !== "undefined") {
        if (id) {
          localStorage.setItem("activeBotId", id);
        } else {
          localStorage.removeItem("activeBotId");
        }
      }
      set({ activeBotId: id });
    },
    clearBotConfig: () => {
      set({
        activeBotId: null,
        activeBotData: null,
        refetchBotData: 0,
        isLoading: false,
        error: null,
      });
      if (typeof window !== "undefined") {
        localStorage.removeItem("activeBotId");
      }
    },
    setActiveBotData: (data) => set({ activeBotData: data }),
    fetchBotData: async (
      agentIdOrUsername: string,
      isFetchByUsername: boolean
    ) => {
      try {
        console.log("Fetching bot data for:", agentIdOrUsername);
        set({ isLoading: true, error: null });
        let response = await getAgentDetails(
          agentIdOrUsername,
          isFetchByUsername
        );
        set({
          activeBotId: response.agentId,
          activeBotData: response,
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
  };
});
