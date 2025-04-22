import { create } from "zustand";
import { persist } from "zustand/middleware";
import { signUpUser, getAgentDetails, getProducts } from "../lib/serverActions";
import { toast } from "react-hot-toast";
import { Agent } from "../types";

interface Product {
  _id: string;
  title: string;
  image: string;
  price: string;
  description: string;
  about?: string;
}

interface BotConfig {
  agentId: string;
  username: string;
  name: string;
  logo: string;
  calendlyUrl: string;
  stripeAccountId: string;
  currency: string;
  model: string;
  systemPrompt: string;
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
  isBotUserLoggedIn: boolean;
  botUserEmail: string | null;
  botUserId: string | null;
  activeBotId: string | null;
  activeBotUsername: string | null;
  currentBotData: Agent | null;
  config: BotConfig | null;
  isLoading: boolean;
  error: string | null;
  products: Product[];
  isProductsLoading: boolean;
  productsError: string | null;
  setBotUserEmail: (email: string) => void;
  setBotUserId: (id: string) => void;
  setIsBotUserLoggedIn: (status: boolean) => void;
  setActiveBotId: (id: string | null) => void;
  setActiveBotUsername: (username: string | null) => void;
  setCurrentBotData: (data: Agent | null) => void;
  handleGoogleLoginSuccess: (credentialResponse: any) => Promise<void>;
  handleGoogleLoginError: () => void;
  botUserLogout: () => void;
  fetchConfig: (username: string) => Promise<void>;
  fetchProducts: (agentId: string) => Promise<void>;
}

export const useBotConfig = create<BotConfigState>()(
  persist(
    (set, get) => ({
      isBotUserLoggedIn: false,
      botUserEmail: null,
      botUserId: null,
      activeBotId: null,
      activeBotUsername: null,
      currentBotData: null,
      config: null,
      isLoading: false,
      error: null,
      products: [],
      isProductsLoading: false,
      productsError: null,
      setBotUserEmail: (email) => set({ botUserEmail: email }),
      setBotUserId: (id) => set({ botUserId: id }),
      setIsBotUserLoggedIn: (status) => set({ isBotUserLoggedIn: status }),
      setActiveBotId: (id) => set({ activeBotId: id }),
      setActiveBotUsername: (username) => set({ activeBotUsername: username }),
      setCurrentBotData: (data) => set({ currentBotData: data }),
      handleGoogleLoginSuccess: async (credentialResponse: any) => {
        try {
          // Decode the JWT token to get user info
          const base64Url = credentialResponse.credential.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join("")
          );

          const userInfo = JSON.parse(jsonPayload);
          set({ botUserEmail: userInfo.email, isBotUserLoggedIn: true });

          // Call the signUpUser API
          const response = await signUpUser("google", userInfo.email);

          if (response.error) {
            toast.error("Failed to complete bot user signup process");
            console.error("Bot user signup failed:", response.result);
          } else {
            // Store the botUserId from the response
            if (typeof response.result !== "string" && response.result._id) {
              set({ botUserId: response.result._id });
            }
            toast.success("Successfully signed in as bot user!");
            console.log("Bot user signed in successfully:", response.result);
          }
        } catch (error) {
          console.error("Error during bot user Google login:", error);
          toast.error("An error occurred during bot user login");
        }
      },
      handleGoogleLoginError: () => {
        console.log("Bot User Login Failed");
        toast.error("Google login failed for bot user");
      },
      botUserLogout: () => {
        set({
          isBotUserLoggedIn: false,
          botUserEmail: null,
          botUserId: null,
          activeBotId: null,
          activeBotUsername: null,
          currentBotData: null,
          config: null,
          products: [],
        });
        toast.success("Bot user logged out successfully");
      },
      fetchConfig: async (username: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await getAgentDetails(null, username);
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
            themeColors: response.themeColors,
          };
          set({ config: cleanConfig, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          toast.error("Failed to fetch bot configuration");
        }
      },
      fetchProducts: async (agentId: string) => {
        try {
          set({ isProductsLoading: true, productsError: null });
          const response = await getProducts(agentId);
          set({ products: response, isProductsLoading: false });
        } catch (error) {
          set({
            productsError: (error as Error).message,
            isProductsLoading: false,
          });
          toast.error("Failed to fetch products");
        }
      },
    }),
    {
      name: "bot-config-storage", // unique name for localStorage key
    }
  )
);
