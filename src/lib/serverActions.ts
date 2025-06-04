import axios from "axios";
import {
  AdminAgent,
  AnalyticsData,
  CreateNewAgentResponse,
  Theme,
  UserDetails,
} from "../types";
import { backendApiUrl } from "../utils/constants";

let apiUrl = backendApiUrl;
interface QueryDocumentResponse {
  context: any; // You might want to define a more specific type based on the actual response
  calendlyUrl?: string;
}

interface ExtractContentResponse {
  success: boolean;
  content?: string;
  error?: string;
  platform?: string;
}

interface AvailabilityDay {
  day: string;
  available: boolean;
  timeSlots: {
    startTime: string;
    endTime: string;
  }[];
}

interface SignUpResult {
  _id: string;
  signUpVia: {
    via: string;
    handle: string;
  };
  agents: any[];
}

interface SignUpClientResponse {
  error: boolean;
  result: string | SignUpResult;
}

interface UserLog {
  role: string;
  content: string;
  timestamp?: string;
}

interface UpdateUserLogsParams {
  userId: string;
  sessionId: string;
  agentId: string;
  newUserLogs: UserLog[];
}

interface AddProductData {
  file: File;
  title: string;
  description: string;
  image: string;
  price: string;
  about: string;
  agentId: string;
}

interface Document {
  documentId: string;
  title: string;
  addedAt: string;
  updatedAt: string;
}

interface DocumentListResponse {
  error: boolean;
  result:
    | {
        agentId: string;
        agentName: string;
        documentCount: number;
        documents: Document[];
      }
    | string;
}

export interface DocumentResponse {
  error: boolean;
  result:
    | {
        message: string;
        agentId: string;
        documentId: string;
        title: string;
        size?: number;
      }
    | string;
}

export interface RemoveDocumentResponse {
  error: boolean;
  result:
    | {
        message: string;
        agentId: string;
        documentId: string;
        remainingDocumentCount: number;
      }
    | string;
}

interface PlanData {
  id: string;
  name: string;
  price: number;
  currency: string;
  credits: number;
  recurrence: string;
  description: string;
  isCurrentPlan: boolean;
}

export async function extractContentFromURL(
  url: string
): Promise<ExtractContentResponse> {
  try {
    const response = await axios.post(`${apiUrl}/content/extract`, {
      url,
    });

    return response.data;
  } catch (error) {
    console.error("Error extracting content from URL:", error);
    return {
      success: false,
      error: "Failed to extract content from URL",
    };
  }
}

export async function createNewAgentWithDocumentId(
  clientId: string,
  name: string,
  personalityType: { name: string; value: string[] },
  themeColors: {
    mainDarkColor: string;
    mainLightColor: string;
    highlightColor: string;
    isDark: boolean;
  }
): Promise<CreateNewAgentResponse> {
  try {
    const response = await axios.post(`${apiUrl}/milvus/create-new-agent`, {
      clientId: clientId,
      name: name,
      personalityType: personalityType,
      themeColors: themeColors,
    });

    return response.data;
  } catch (error) {
    console.error("Error creating agent:", error);
    return {
      error: true,
      result: error instanceof Error ? error.message : "Failed to create agent",
    };
  }
}

export async function addDocumentToAgent(
  agentId: string,
  textContent: string,
  documentTitle?: string,
  documentSize?: number
): Promise<DocumentResponse> {
  try {
    const calculatedSize =
      documentSize || new TextEncoder().encode(textContent).length;
    const response = await axios.post(`${apiUrl}/milvus/add-document`, {
      agentId,
      textContent,
      documentTitle: documentTitle || "Untitled Document",
      documentSize: calculatedSize,
    });

    return response.data;
  } catch (error) {
    console.error("Error adding document:", error);
    return {
      error: true,
      result: error instanceof Error ? error.message : "Failed to add document",
    };
  }
}

export async function removeDocumentFromAgent(
  agentId: string,
  documentId: string
): Promise<RemoveDocumentResponse> {
  try {
    const response = await axios.post(`${apiUrl}/milvus/remove-document`, {
      agentId,
      documentId,
    });

    return response.data;
  } catch (error) {
    console.error("Error removing document:", error);
    return {
      error: true,
      result:
        error instanceof Error ? error.message : "Failed to remove document",
    };
  }
}

export async function updateDocumentInAgent(
  agentId: string,
  documentId: string,
  textContent: string,
  documentTitle?: string
): Promise<DocumentResponse> {
  try {
    const response = await axios.post(`${apiUrl}/milvus/update-document`, {
      agentId,
      documentId,
      textContent,
      documentTitle,
    });

    return response.data;
  } catch (error) {
    console.error("Error updating document:", error);
    return {
      error: true,
      result:
        error instanceof Error ? error.message : "Failed to update document",
    };
  }
}

export async function listAgentDocuments(
  agentId: string
): Promise<DocumentListResponse> {
  try {
    const response = await axios.get(
      `${apiUrl}/milvus/list-documents/${agentId}`
    );

    return response.data;
  } catch (error) {
    console.error("Error listing documents:", error);
    return {
      error: true,
      result:
        error instanceof Error ? error.message : "Failed to list documents",
    };
  }
}

export async function createNewAgent(
  clientId: string,
  name: string,
  personalityType: { name: string; value: string[] },
  themeColors: {
    mainDarkColor: string;
    mainLightColor: string;
    highlightColor: string;
    isDark: boolean;
  }
): Promise<CreateNewAgentResponse> {
  try {
    const response = await axios.post(`${apiUrl}/milvus/create-new-agent`, {
      clientId: clientId,
      name: name,
      personalityType: personalityType,
      themeColors: themeColors,
    });

    return response.data;
  } catch (error) {
    console.error("Error processing document:", error);
    throw new Error("Failed to process document");
  }
}

export async function queryDocument(
  agentId: string,
  query: string
): Promise<QueryDocumentResponse> {
  try {
    const response = await axios.post(`${apiUrl}/milvus/query-document`, {
      agentId,
      query,
    });

    return response.data.result;
  } catch (error) {
    console.error("Error querying document:", error);
    throw new Error("Failed to query document");
  }
}

export async function signUpClient(
  via: string,
  handle: string
): Promise<SignUpClientResponse> {
  try {
    const response = await axios.post(`${apiUrl}/client/signupClient`, {
      via,
      handle,
    });

    if (!response.data) {
      throw new Error("No data received from server");
    }

    return response.data;
  } catch (error) {
    console.error("Error signing up client:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      // Handle different types of errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        return {
          error: true,
          result: "Authentication failed. Please log in again.",
        };
      } else if (error.response?.status === 429) {
        return {
          error: true,
          result: "Too many requests. Please try again later.",
        };
      } else if (error.response?.status === 500) {
        return {
          error: true,
          result: "Server error. Please try again later.",
        };
      }

      return {
        error: true,
        result: error.response?.data?.message || "Failed to sign up client",
      };
    }
    return {
      error: true,
      result:
        error instanceof Error ? error.message : "Failed to sign up client",
    };
  }
}

export async function signUpUser(
  via: string,
  handle: string
): Promise<SignUpClientResponse> {
  try {
    const response = await axios.post(`${apiUrl}/user/signupUser`, {
      via,
      handle,
    });

    return response.data;
  } catch (error) {
    console.error("Error signing up client:", error);
    throw new Error("Failed to sign up client");
  }
}

export async function fetchClientAgents(
  clientId: string
): Promise<AdminAgent[]> {
  try {
    const response = await axios.get(
      `${apiUrl}/client/agents?clientId=${clientId}`
    );
    if (response.data.error) {
      throw new Error("Failed to fetch client agents");
    }
    return response.data.result;
  } catch (error) {
    console.error("Error fetching client agents:", error);
    throw new Error("Failed to fetch client agents");
  }
}

export async function getAgentDetails(
  inputParam: string | null,
  isfetchByUsername: boolean
) {
  try {
    // Check if we have at least one parameter
    if (!inputParam) {
      throw new Error("Either agentId or username must be provided");
    }

    const response = await axios.get(
      `${apiUrl}/client/getAgentDetails?inputParam=${inputParam}&isfetchByUsername=${isfetchByUsername}`
    );

    if (response.data.error) {
      throw new Error(response.data.result || "Error fetching agent details");
    }

    return response.data.result;
  } catch (error) {
    console.error("Error fetching agent details:", error);
    throw error;
  }
}

export async function updateBotTheme(agentId: string, inputTheme: Theme) {
  try {
    const body = {
      themeColors: inputTheme,
    };

    const response = await axios.put(
      `${apiUrl}/client/updateAgentTheme/${agentId}`,
      body
    );

    if (response.data.error) {
      throw new Error("Error updating agent details");
    }
    return response.data.result;
  } catch (error) {
    console.error("Error updating agent details:", error);
    throw error;
  }
}

export async function updateAgentDetails(
  agentId: string,
  details: {
    model: string;
    systemPrompt: string;
    username?: string;
    logo?: string;
    calendlyUrl?: string;
    personalityType?: string;
    isCustomPersonality?: boolean;
    customPersonalityPrompt?: string;
    personalityAnalysis?: any;
    lastPersonalityUrl?: string;
    lastPersonalityContent?: string;
    themeColors?: any;
    [key: string]: any;
  }
) {
  try {
    const body = {
      model: details.model,
      systemPrompt: details.systemPrompt,
      username: details.username,
      logo: details.logo,
      calendlyUrl: details.calendlyUrl,
      personalityType: details.personalityType,
      isCustomPersonality: details.isCustomPersonality,
      customPersonalityPrompt: details.customPersonalityPrompt,
      personalityAnalysis: details.personalityAnalysis,
      lastPersonalityUrl: details.lastPersonalityUrl,
      lastPersonalityContent: details.lastPersonalityContent,
      themeColors: details.themeColors,
    };

    const response = await axios.put(
      `${apiUrl}/client/updateAgent/${agentId}`,
      body
    );

    if (response.data.error) {
      throw new Error("Error updating agent details");
    }
    return response.data.result;
  } catch (error) {
    console.error("Error updating agent details:", error);
    throw error;
  }
}

export async function deleteAgent(agentId: string): Promise<void> {
  try {
    // Use POST instead of DELETE to avoid CORS issues
    const response = await axios.post(
      `${apiUrl}/client/deleteAgentPost/${agentId}`
    );

    if (response.data.error) {
      throw new Error(response.data.result || "Error deleting agent");
    }

    console.log("Agent deleted successfully:", response.data.result);
    return response.data.result;
  } catch (error) {
    console.error("Error deleting agent:", error);
    throw error;
  }
}

export async function updateUserLogs(params: UpdateUserLogsParams) {
  try {
    const response = await axios.post(
      `${apiUrl}/client/updateUserLogs`,
      params
    );

    if (response.data.error) {
      throw new Error("Error updating user logs");
    }
    return response.data.result;
  } catch (error) {
    console.error("Error updating user logs:", error);
    throw error;
  }
}

export async function getChatLogs(agentId: string) {
  try {
    const response = await axios.get(
      `${apiUrl}/client/getAgentChatLogs/${agentId}`
    );

    if (response.data.error) {
      throw new Error("Error fetching chat logs");
    }
    return response.data.result;
  } catch (error) {
    console.error("Error fetching chat logs:", error);
    throw error;
  }
}

export async function getIntegratedServices(agentId: string) {
  try {
    const response = await axios.get(
      `${apiUrl}/client/getServices?agentId=${agentId}`
    );
    if (response.data.error) {
      throw new Error("Failed to fetch integrated services");
    }
    return response.data.result;
  } catch (error) {
    console.error("Error fetching integrated services:", error);
    throw error;
  }
}

export async function updateAgentUsername(agentId: string, username: string) {
  try {
    const response = await axios.post(`${apiUrl}/client/updateAgentUsername`, {
      agentId,
      agentName: username,
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data.result;
  } catch (error) {
    console.error("Error updating agent username:", error);
    throw error;
  }
}

export async function uploadProfilePicture(
  agentId: string,
  profilePicture: File
) {
  try {
    const formData = new FormData();
    formData.append("agentId", agentId);
    formData.append("file", profilePicture);

    const response = await axios.post(
      `${apiUrl}/client/uploadAgentLogo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data.result;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
}

export async function updateCalendlyUrl(agentId: string, calendlyUrl: string) {
  try {
    const response = await axios.post(`${apiUrl}/client/updateCalendlyUrl`, {
      agentId,
      calendlyUrl,
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data.result;
  } catch (error) {
    console.error("Error updating Calendly URL:", error);
    throw error;
  }
}

export async function updateAppointmentSettings(payload: {
  agentId: string;
  bookingType: string;
  bookingsPerSlot: number;
  meetingDuration: number;
  bufferTime: number;
  breaks: { startTime: string; endTime: string }[];
  availability: AvailabilityDay[];
  locations: string[];
  timezone: string;
  price: {
    isFree: boolean;
    amount: number;
    currency: string;
  };
}) {
  try {
    const response = await axios.post(
      `${apiUrl}/appointment/settings`,
      payload
    );
    if (response.data.error) throw new Error(response.data.error);
    return response.data;
  } catch (error) {
    console.error("Error updating appointment settings:", error);
    throw error;
  }
}

export async function getAppointmentSettings(agentId: string) {
  try {
    const response = await axios.get(
      `${apiUrl}/appointment/settings?agentId=${agentId}`
    );
    if (response.data.error) throw new Error(response.data.error);
    return response.data.result;
  } catch (error) {
    console.error("Error fetching appointment settings:", error);
    throw error;
  }
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export async function getAvailableSlots(
  agentId: string,
  date: string,
  userTimezone?: string // Added userTimezone parameter
): Promise<TimeSlot[]> {
  const response = await axios.get(`${apiUrl}/appointment/available-slots`, {
    params: { agentId, date, userTimezone }, // Add userTimezone to params
  });
  if (response.data.error) {
    throw new Error(response.data.result || "No slots found");
  }
  // backend returns result: [ { startTime, endTime }, ... ]
  return response.data.result as TimeSlot[];
}

export interface BookingPayload {
  agentId: string;
  userId: string;
  email?: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  userTimezone?: string;
  name?: string;
  phone?: string;
  notes?: string;
}

export async function bookAppointment(payload: BookingPayload): Promise<any> {
  const response = await axios.post(`${apiUrl}/appointment/book`, payload);
  if (response.data.error) throw new Error(response.data.error);
  return response.data.result;
}

export async function updateUnavailableDates(
  agentId: string,
  unavailableDates: Array<{
    date: string;
    startTime: string;
    endTime: string;
    allDay: boolean;
    timezone?: string;
    timeSlots?: Array<{ start: string; end: string }>;
  }>,
  datesToMakeAvailable?: string[]
): Promise<any> {
  try {
    console.log("updateUnavailableDates called with:", {
      agentId,
      unavailableDates,
      datesToMakeAvailable,
    });

    const response = await axios.post(
      `${apiUrl}/appointment/update-unavailable-dates`,
      {
        agentId,
        unavailableDates,
        datesToMakeAvailable,
      }
    );

    console.log("API response:", response.data);

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data.result;
  } catch (error) {
    console.error("Error updating unavailable dates:", error);

    // Log more details about the error
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    throw error;
  }
}

export async function getDayWiseAvailability(
  agentId: string,
  userTimezone?: string // Added userTimezone parameter
): Promise<Record<string, boolean>> {
  try {
    const response = await axios.get(
      `${apiUrl}/appointment/day-wise-availability`,
      {
        params: { agentId, userTimezone },
      }
    );
    if (response.data.error) throw new Error(response.data.error);
    return response.data.result || {};
  } catch (error) {
    console.error("Error fetching day-wise availability:", error);
    return {};
  }
}

export async function getUnavailableDates(agentId: string): Promise<string[]> {
  try {
    const response = await axios.get(
      `${apiUrl}/appointment/unavailable-dates?agentId=${agentId}`
    );
    if (response.data.error) throw new Error(response.data.error);
    return response.data.result || [];
  } catch (error) {
    console.error("Error fetching unavailable dates:", error);
    return [];
  }
}

export async function getBookings(agentId: string) {
  try {
    const response = await axios.get(
      `${apiUrl}/appointment/bookings?agentId=${agentId}`
    );
    if (response.data.error) throw new Error(response.data.error);
    return response.data.result;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
}

export async function cancelBooking(bookingId: string) {
  try {
    const response = await axios.post(`${apiUrl}/appointment/cancel-booking`, {
      bookingId,
    });
    if (response.data.error) throw new Error(response.data.error);
    return response.data.result;
  } catch (error) {
    console.error("Error cancelling booking:", error);
    throw error;
  }
}

export const addProduct = async (data: AddProductData) => {
  try {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("image", data.image);
    formData.append("price", data.price);
    formData.append("about", data.about);
    formData.append("agentId", data.agentId);

    const response = await fetch(`${apiUrl}/product/addProduct`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to add product");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const deleteProduct = async (id: string, agentId: string) => {
  try {
    const response = await axios.delete(`${apiUrl}/product/deleteProduct`, {
      data: {
        productId: id,
        agentId,
      },
    });

    if (response.data.error) {
      throw new Error("Failed to delete product");
    }

    return response.data.result;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

export const getProducts = async (agentId: string) => {
  // try {
  //   let url = `https://rag.gobbl.ai/zoho/items?agentId=${agentId}`;
  //   const response = await axios.get(url);
  //   if (response.data.error) {
  //     throw new Error("Failed to fetch products");
  //   }
  //   return response.data.result;
  // } catch (error) {
  //   console.error("Error fetching products:", error);
  //   throw error;
  // }
};

export const updateProductImage = async (data: {
  file: File;
  agentId: string;
  productId: string;
}) => {
  try {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("agentId", data.agentId);
    formData.append("productId", data.productId);

    const response = await axios.post(
      `${apiUrl}/product/updateProductImage`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.error) {
      throw new Error("Failed to update product image");
    }

    return response.data.result;
  } catch (error) {
    console.error("Error updating product image:", error);
    throw error;
  }
};

export const updateStripeAccountIdCurrency = async (data: {
  agentId: string;
  stripeAccountId: string;
  currency: string;
}) => {
  try {
    const response = await axios.post(
      `${apiUrl}/client/updateStripeAccountIdCurrency`,
      data
    );

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data.result;
  } catch (error) {
    console.error("Error updating Stripe account ID and currency:", error);
    throw new Error("Failed to update Stripe account ID and currency");
  }
};

export const getTransactions = async (
  agentId: string,
  page: number
): Promise<{ orders: any[]; hasNext: boolean }> => {
  try {
    const response = await axios.get(
      `${apiUrl}/client/getAgentOrders?agentId=${agentId}&page=${page}`
    );
    return response.data.result;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
};

export const payOutStripe = async (clientId: string) => {
  try {
    const response = await axios.post(`${apiUrl}/client/payOut`, { clientId });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      return {
        error: true,
        result:
          error.response?.data?.result ||
          error.message ||
          "Failed to cash out via Stripe",
      };
    }
    return {
      error: true,
      result:
        error instanceof Error
          ? error.message
          : "Failed to cash out via Stripe",
    };
  }
};

export async function getUserDetails(userId: string): Promise<UserDetails> {
  try {
    const response = await axios.get(
      `${apiUrl}/user/getUserDetails?userId=${userId}`
    );

    if (response.data.error) {
      throw new Error(response.data.result || "Failed to fetch user details");
    }

    return response.data.result;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
}

export interface AdminUser {
  _id: string;
  email: string;
  name?: string;
  role: "user" | "admin";
  createdAt: string;
  lastLogin: string;
}

export async function updateSocialHandles(
  agentId: string,
  socials: Record<string, string>
): Promise<boolean> {
  try {
    await axios.post(`${apiUrl}/client/updateSocialHandles`, {
      agentId,
      socials,
    });
    return true;
  } catch (error) {
    console.error("Error updating social handles:", error);
    throw new Error("Failed to update social handles");
  }
}

export async function updateAgentNameAndBio(
  agentId: string,
  name?: string,
  bio?: string
) {
  try {
    const response = await axios.post(
      `${apiUrl}/client/updateAgentNameAndBio`,
      {
        agentId,
        name,
        bio,
      }
    );

    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data.result;
  } catch (error) {
    console.error("Error updating agent name and bio:", error);
    throw error;
  }
}

export async function updatePromotionalBanner(
  agentId: string,
  promotionalBanner?: string,
  isPromoBannerEnabled?: boolean
): Promise<boolean> {
  try {
    await axios.post(`${apiUrl}/client/updateAgentPromoBanner`, {
      agentId,
      promotionalBanner,
      isPromoBannerEnabled,
    });
    return true;
  } catch (error) {
    console.error("Error updating promotional banner:", error);
    throw new Error("Failed to update promotional banner");
  }
}

export async function updateAgentVoicePersonality(
  agentId: string,
  personalityType: {
    name: string;
    value: string[];
  }
): Promise<boolean> {
  try {
    await axios.post(`${apiUrl}/client/updateAgentVoicePersonality`, {
      agentId,
      personalityType,
    });
    return true;
  } catch (error) {
    console.error("Error updating voice personality:", error);
    throw new Error("Failed to update voice personality");
  }
}

export async function updateAgentWelcomeMessage(
  agentId: string,
  welcomeMessage: string
): Promise<boolean> {
  try {
    await axios.post(`${apiUrl}/client/updateAgentWelcomeMessage`, {
      agentId,
      welcomeMessage,
    });
    return true;
  } catch (error) {
    console.error("Error updating welcome message:", error);
    throw new Error("Failed to update welcome message");
  }
}

export async function updateAgentPrompts(
  agentId: string,
  prompts: string[]
): Promise<boolean> {
  try {
    await axios.post(`${apiUrl}/client/updateAgentPrompts`, {
      agentId,
      prompts,
    });
    return true;
  } catch (error) {
    console.error("Error updating prompts:", error);
    throw new Error("Failed to update prompts");
  }
}

export async function updateAgentBrain(
  agentId: string,
  language?: string,
  smartenUpAnswers?: string[] | Record<string, string>
): Promise<boolean> {
  try {
    await axios.post(`${apiUrl}/client/updateAgentBrain`, {
      agentId,
      language,
      smartenUpAnswers,
    });
    return true;
  } catch (error) {
    console.error("Error updating agent brain:", error);
    throw new Error("Failed to update agent brain");
  }
}

export async function updateClientPaymentSettings(
  clientId: string,
  currency: string,
  preferredMethod: string
): Promise<boolean> {
  try {
    await axios.post(`${apiUrl}/client/updateCurrencyAndPreferredMethod`, {
      clientId,
      currency,
      preferredMethod,
    });
    return true;
  } catch (error) {
    console.error("Error updating payment settings:", error);
    throw new Error("Failed to update payment settings");
  }
}

export async function updateCustomerLeadFlag(
  agentId: string,
  isEnabled: boolean
): Promise<boolean> {
  try {
    const response = await axios.post(
      `${apiUrl}/client/changeCustomerLeadFlag`,
      {
        agentId,
        isEnabled,
      }
    );

    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return true;
  } catch (error) {
    console.error("Error updating customer lead flag:", error);
    throw new Error("Failed to update customer lead flag");
  }
}

interface CustomerLead {
  name: string;
  email: string;
  phone: string;
  queryMessage: string;
  createdAt: string;
}

export async function getCustomerLeads(
  agentId: string
): Promise<CustomerLead[]> {
  try {
    const response = await axios.get(
      `${apiUrl}/client/getCustomerLeads/${agentId}`
    );

    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data.result;
  } catch (error) {
    console.error("Error fetching customer leads:", error);
    throw new Error("Failed to fetch customer leads");
  }
}

interface PolicyContent {
  enabled: boolean;
  content: string;
}

interface AgentPoliciesResponse {
  error: boolean;
  result: {
    shipping: PolicyContent;
    returns: PolicyContent;
    privacy: PolicyContent;
    terms: PolicyContent;
    [key: string]: PolicyContent;
  };
}

export async function getAgentPolicies(
  agentId: string
): Promise<AgentPoliciesResponse> {
  try {
    const response = await axios.get(
      `${apiUrl}/client/getAgentPolicies/${agentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching agent policies:", error);
    throw error;
  }
}

export async function updateAgentModel(
  agentId: string,
  modelName: string
): Promise<any> {
  try {
    const response = await axios.put(`${apiUrl}/client/updateAgentModel`, {
      agentId,
      model: modelName,
    });
    if (response.data.error) {
      throw new Error(response.data.result || "Failed to update model");
    }
    return response.data.result;
  } catch (error) {
    console.error("Error updating agent model:", error);
    throw error;
  }
}

export async function updateGeneratedPrompts(
  agentId: string,
  generatedPrompts: string[]
): Promise<boolean> {
  try {
    const response = await axios.post(
      `${apiUrl}/client/updateAgentGeneratedPrompts`,
      {
        agentId,
        prompts: generatedPrompts,
      }
    );
    return true;
  } catch (error) {
    console.error("Error updating generated prompts:", error);
    return false;
  }
}

export async function saveCustomerLead(
  agentId: string,
  lead: {
    name: string;
    email: string;
    phone: string;
    queryMessage: string;
    createdAt: string;
  }
): Promise<{ error: boolean; result?: string }> {
  try {
    const response = await axios.post(`${apiUrl}/client/saveCustomerLeads`, {
      agentId,
      newLead: lead,
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return { error: false, result: response.data.result };
  } catch (error) {
    console.error("Error saving customer lead:", error);
    return {
      error: true,
      result:
        error instanceof Error ? error.message : "Failed to save customer lead",
    };
  }
}

export async function getPlans(clientId: string): Promise<PlanData[]> {
  try {
    const response = await axios.get(`${apiUrl}/client/getPlans/${clientId}`);

    if (response.data.error) {
      throw new Error("Failed to fetch plans");
    }

    return response.data.result;
  } catch (error) {
    console.error("Error fetching plans:", error);
    throw error;
  }
}

export async function subscribeToPlan(
  clientId: string,
  planId: string
): Promise<any> {
  try {
    const response = await axios.post(
      `${apiUrl}/product/subscribeOrChangePlan`,
      {
        clientId,
        planId,
      }
    );

    if (response.data.error) {
      throw new Error(response.data.error || "Failed to subscribe to plan");
    }

    return response.data.result;
  } catch (error) {
    console.error("Error subscribing to plan:", error);
    throw error;
  }
}

export async function getClient(clientId: string) {
  try {
    const response = await axios.get(
      `${apiUrl}/client/getClient?clientId=${clientId}`
    );

    if (response.data.error) {
      throw new Error(response.data.result || "Failed to fetch client data");
    }

    return response.data.result;
  } catch (error) {
    console.error("Error fetching client data:", error);
    throw error;
  }
}

export async function updateClientBillingDetails(
  clientId: string,
  billingDetails: {
    "Individual/Organization Name": string;
    Email: string;
    Country: string;
    State: string;
    "Zip Code": string;
    "Address Line 1": string;
    "Address Line 2": string;
  }
): Promise<any> {
  try {
    const response = await axios.post(
      `${apiUrl}/client/updateClientBillingDetails`,
      {
        clientId,
        billingDetails,
      }
    );

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data.result;
  } catch (error) {
    console.error("Error updating billing details:", error);
    throw new Error("Failed to update billing details");
  }
}

export async function updateClientBillingMethod(
  clientId: string,
  billingMethod: Array<{
    cardType: string;
    cardNumber: number;
    expiry: string;
    default: boolean;
  }>
): Promise<any> {
  try {
    const response = await axios.post(
      `${apiUrl}/client/updateClientBillingMethod`,
      {
        clientId,
        billingMethod,
      }
    );

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data.result;
  } catch (error) {
    console.error("Error updating billing method:", error);
    throw new Error("Failed to update billing method");
  }
}

export const updateProduct = async (data: {
  productId: string;
  title: string;
  description: string;
  price: string;
  about?: string;
  agentId: string;
  stock: number;
}) => {
  try {
    const response = await axios.put(`${apiUrl}/product/updateProduct`, data);

    if (response.data.error) {
      throw new Error("Failed to update product");
    }

    return response.data.result;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export async function getClientUsage(clientId: string) {
  try {
    const response = await fetch(`${apiUrl}/client/getClientUsage/${clientId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch client usage data");
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.result || "Failed to fetch client usage data");
    }

    return data.result;
  } catch (error) {
    console.error("Error fetching client usage data:", error);
    throw error;
  }
}

export async function getUserBookingHistory(userId: string, agentId: string) {
  try {
    const response = await axios.get(`${apiUrl}/appointment/user-bookings`, {
      params: { userId, agentId },
    });

    if (response.data.error) {
      console.error("API error:", response.data.result);
      return [];
    }

    return response.data.result || [];
  } catch (error) {
    console.error("Error fetching booking history:", error);
    return [];
  }
}

export async function userRescheduleBooking(payload: {
  bookingId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  userTimezone: string;
  notes?: string;
}): Promise<any> {
  try {
    const response = await axios.post(
      `${apiUrl}/appointment/user-reschedule`,
      payload
    );

    if (response.data.error) {
      throw new Error(response.data.result || "Failed to reschedule booking");
    }

    return response.data;
  } catch (error) {
    console.error("Error rescheduling booking:", error);
    throw error;
  }
}

export async function getBookingForReschedule(
  bookingId: string,
  userId: string
): Promise<any> {
  try {
    const response = await axios.get(
      `${apiUrl}/appointment/booking-for-reschedule`,
      {
        params: { bookingId, userId },
      }
    );

    if (response.data.error) {
      throw new Error(
        response.data.result || "Failed to fetch booking details"
      );
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching booking for reschedule:", error);
    throw error;
  }
}

export async function cancelUserBooking(bookingId: string, userId: string) {
  try {
    const response = await axios.post(`${apiUrl}/appointment/cancel-booking`, {
      bookingId,
    });

    if (response.data.error) {
      throw new Error(response.data.result || "Failed to cancel booking");
    }

    return response.data.result;
  } catch (error) {
    console.error("Error cancelling user booking:", error);
    throw error;
  }
}

export async function sendRescheduleRequestEmail(payload: {
  bookingId: string;
  email: string;
  rescheduleLink: string;
  agentName: string;
  date: string;
  startTime: string;
  endTime: string;
  userTimezone: string;
}): Promise<any> {
  try {
    const response = await axios.post(
      `${apiUrl}/appointment/send-reschedule-email`,
      payload
    );

    if (response.data.error) {
      throw new Error(
        response.data.result || "Failed to send reschedule email"
      );
    }

    return response.data;
  } catch (error) {
    console.error("Error sending reschedule email:", error);
    throw error;
  }
}

export async function getMainProducts(agentId: string) {
  try {
    const response = await fetch(
      `${apiUrl}/product/getProducts?agentId=${agentId}`
    );
    if (!response.ok) throw new Error("Failed to fetch products");
    const data = await response.json();
    return data.result || [];
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
}

// Delete main product by productId and agentId
export async function deleteMainProduct(productId: string, agentId: string) {
  try {
    const response = await axios.delete(`${apiUrl}/product/deleteProduct`, {
      data: { productId, agentId },
    });
    return response.data;
  } catch (err) {
    console.error("Error deleting product:", err);
    throw err;
  }
}

export const pauseProduct = async (productId: string, isPaused: boolean) => {
  try {
    const response = await axios.post(`${apiUrl}/product/pauseProduct`, {
      productId,
      isPaused,
    });

    if (response.data.error) {
      throw new Error("Failed to update product status");
    }

    return true;
  } catch (error) {
    console.error("Error updating product status:", error);
    throw error;
    return false;
  }
};

export async function getMainProductsForUser(agentId: string) {
  try {
    const response = await fetch(
      `${apiUrl}/user/getAgentProducts?agentId=${agentId}`
    );
    if (!response.ok) throw new Error("Failed to fetch products");
    const data = await response.json();
    return data.result || [];
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
}

// EMAIL TEMPLATES

/**
 * Fetch email templates for a given agentId
 * @param agentId string
 * @returns Promise<any>
 */
export async function getEmailTemplates(agentId: string): Promise<any> {
  try {
    const response = await axios.get(`${apiUrl}/email/getEmailTemplates`, {
      params: { agentId },
    });
    if (response.data.error) {
      throw new Error(
        response.data.result || "Failed to fetch email templates"
      );
    }
    return response.data.result;
  } catch (error) {
    console.error("Error fetching email templates:", error);
    throw error;
  }
}

/**
 * Update email templates for a given agentId
 * @param agentId string
 * @param updatedData Array<any>
 * @returns Promise<any>
 */
export async function updateEmailTemplates(
  agentId: string,
  updatedData: any,
  emailTemplateId: string
): Promise<any> {
  try {
    const response = await axios.post(`${apiUrl}/email/updateEmailTemplates`, {
      agentId,
      updatedData,
      emailTemplateId,
    });
    if (response.data.error) {
      throw new Error(
        response.data.result || "Failed to update email templates"
      );
    }
    return response.data.result;
  } catch (error) {
    console.error("Error updating email templates:", error);
    throw error;
  }
}

// --- REFACTORED PRODUCT ENDPOINTS ---

export async function savePhysicalProduct(
  form: any,
  agentId: string,
  productId?: string
) {
  let formData = new FormData();
  formData.append("type", "physicalProduct");
  formData.append("agentId", agentId);
  if (productId) {
    formData.append("productId", productId);
  }

  formData.append("file", form.thumbnail);
  formData.append("title", form.title);
  formData.append("description", form.description);
  formData.append("category", form.category);
  formData.append("price", form.price);
  formData.append("priceType", form.priceType);
  formData.append("quantity", form.quantity);
  formData.append(
    "quantityUnlimited",
    form.quantityType === "unlimited" ? "true" : "false"
  );
  formData.append("quantityType", form.quantityType);
  formData.append("ctaButton", form.cta);
  if (form.variedQuantities) {
    formData.append("variedQuantities", JSON.stringify(form.variedQuantities));
  }
  form.images.forEach((img: File | null, idx: number) => {
    if (img) formData.append(`image${idx + 1}`, img);
  });
  if (form.customerDetails) {
    formData.append(
      "checkOutCustomerDetails",
      JSON.stringify(form.customerDetails)
    );
  }
  const response = await fetch(`${apiUrl}/product/addPhysicalProduct`, {
    method: "POST",
    body: formData,
  });
  return await response.json();
}

export async function saveDigitalProduct(
  form: any,
  agentId: string,
  productId?: string
) {
  let formData = new FormData();
  formData.append("type", "digitalProduct");
  formData.append("agentId", agentId);
  if (productId) {
    formData.append("productId", productId);
  }
  if (form.thumbnail) {
    formData.append("file", form.thumbnail);
  }
  formData.append("title", form.title);
  formData.append("description", form.description);
  formData.append("category", form.category);
  formData.append("price", form.price);
  formData.append("priceType", form.priceType);
  formData.append("quantity", form.quantity);
  formData.append(
    "quantityUnlimited",
    form.quantityType === "unlimited" ? "true" : "false"
  );
  formData.append("quantityType", form.quantityType);
  formData.append("ctaButton", form.cta);
  form.images.forEach((img: File | null, idx: number) => {
    if (img) formData.append(`image${idx + 1}`, img);
  });
  if (form.fileFormat) {
    formData.append("fileFormat", form.fileFormat);
  }
  if (form.file) formData.append("digitalFile", form.file);
  if (form.fileUrl) formData.append("fileUrl", form.fileUrl);
  if (form.uploadType) formData.append("uploadType", form.uploadType);
  if (form.customerDetails) {
    formData.append(
      "checkOutCustomerDetails",
      JSON.stringify(form.customerDetails)
    );
  }
  const response = await fetch(`${apiUrl}/product/addDigitalProduct`, {
    method: "POST",
    body: formData,
  });
  return await response.json();
}

export async function saveServiceProduct(
  form: any,
  agentId: string,
  productId?: string
) {
  let formData = new FormData();
  formData.append("type", "Service");
  formData.append("agentId", agentId);
  if (productId) {
    formData.append("productId", productId);
  }
  formData.append("file", form.thumbnail);
  formData.append("title", form.title);
  formData.append("description", form.description);
  formData.append("category", form.category);
  formData.append("price", form.price);
  formData.append("priceType", form.priceType);
  formData.append("quantity", form.quantity);
  formData.append(
    "quantityUnlimited",
    form.quantityType === "unlimited" ? "true" : "false"
  );
  formData.append("quantityType", form.quantityType);
  formData.append("ctaButton", form.cta);
  formData.append("locationType", form.locationType);
  if (form.address) {
    formData.append("address", form.address);
  }
  form.images.forEach((img: File | null, idx: number) => {
    if (img) formData.append(`image${idx + 1}`, img);
  });
  if (form.customerDetails) {
    formData.append(
      "checkOutCustomerDetails",
      JSON.stringify(form.customerDetails)
    );
  }
  const response = await fetch(`${apiUrl}/product/addService`, {
    method: "POST",
    body: formData,
  });
  return await response.json();
}

export async function saveEventProduct(
  form: any,
  agentId: string,
  productId?: string
) {
  let formData = new FormData();
  formData.append("type", "Event");
  formData.append("agentId", agentId);
  if (productId) {
    formData.append("productId", productId);
  }
  formData.append("file", form.thumbnail);
  formData.append("title", form.title);
  formData.append("description", form.description);
  formData.append("category", form.category);
  formData.append("eventType", form.eventType);
  formData.append("price", form.price);
  formData.append("priceType", form.priceType);
  formData.append("ctaButton", form.cta);
  if (form.slots && form.slots[0]) {
    formData.append("slotDate", form.slots[0].date);
    formData.append("slotStart", form.slots[0].start);
    formData.append("slotEnd", form.slots[0].end);
    formData.append("seatType", form.slots[0].seatType);
    formData.append("seats", form.slots[0].seats);
  }
  formData.append("timeZone", form.timeZone);
  if (form.slots) {
    formData.append("slots", JSON.stringify(form.slots));
  }
  form.images.forEach((img: File | null, idx: number) => {
    if (img) formData.append(`image${idx + 1}`, img);
  });
  if (form.customerDetails) {
    formData.append(
      "checkOutCustomerDetails",
      JSON.stringify(form.customerDetails)
    );
  }
  const response = await fetch(`${apiUrl}/product/addEvent`, {
    method: "POST",
    body: formData,
  });
  return await response.json();
}

export async function getStripeBillingSession(
  clientId: string
): Promise<string> {
  try {
    const response = await axios.get(`${apiUrl}/product/createBillingSession`, {
      params: { clientId },
    });
    if (response.data.error) {
      throw new Error(
        response.data.error || "Failed to create billing session"
      );
    }
    return response.data.result; // Assuming the URL is in result
  } catch (error) {
    console.error("Error creating Stripe billing session:", error);
    throw error;
  }
}

export async function updateCustomHandles(
  agentId: string,
  customHandles: { label: string; url: string }[]
): Promise<boolean> {
  try {
    await axios.post(`${apiUrl}/client/updateCustomHandles`, {
      agentId,
      customHandles,
    });
    return true;
  } catch (error) {
    console.error("Error updating custom handles:", error);
    throw new Error("Failed to update custom links");
  }
}

export async function enableStripePayment(
  clientId: string,
  isStripeEnabled: boolean
): Promise<boolean> {
  try {
    const response = await axios.post(`${apiUrl}/client/enableStripePayment`, {
      clientId,
      enabled: isStripeEnabled,
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data.result;
  } catch (error) {
    console.error("Error enabling Stripe payments:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to enable Stripe payments"
    );
  }
}

export async function completeStripeOnboarding(
  clientId: string
): Promise<string | null> {
  try {
    const response = await axios.post(
      `${apiUrl}/client/completeStripeOnboarding`,
      {
        clientId,
      }
    );

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data.result;
  } catch (error) {
    console.error("Error completing Stripe onboarding:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to complete Stripe onboarding"
    );
  }
}

export async function enableCryptoPayment(
  clientId: string,
  isEnabled: boolean,
  walletAddress: string,
  chainIds: string[]
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await axios.post(`${apiUrl}/client/enableCryptoPayment`, {
      clientId,
      isEnabled,
      walletAddress,
      chainIds,
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return {
      success: true,
      message: "Crypto payments enabled successfully",
    };
  } catch (error) {
    console.error("Error enabling crypto payments:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to enable crypto payments",
    };
  }
}

/**
 * Submit WhatsApp number for an agent
 * @param agentId string
 * @param countryCode string (e.g. '+971')
 * @param number string (phone number without country code)
 * @returns Promise<boolean>
 */
export async function submitWhatsapp(
  agentId: string,
  countryCode: string,
  number: string
): Promise<boolean> {
  try {
    const response = await axios.post(`${apiUrl}/client/updateWhatsappNumber`, {
      agentId,
      whatsappNumber: {
        countryCode,
        number,
      },
    });
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return true;
  } catch (error) {
    console.error("Error submitting WhatsApp number:", error);
    return false;
  }
}

/**
 * Fetch analytics for a given clientId
 * @param clientId string
 * @returns Promise<AnalyticsData>
 */
export async function getClientAnalytics(
  clientId: string
): Promise<AnalyticsData> {
  try {
    const response = await axios.get(`${apiUrl}/client/getAnalytics`, {
      params: { clientId },
    });

    if (response.data.error) {
      throw new Error(response.data.result || "Failed to fetch analytics");
    }

    return response.data.result;
  } catch (error) {
    console.error("Error fetching analytics:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch analytics data"
    );
  }
}
