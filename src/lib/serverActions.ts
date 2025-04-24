import axios from "axios";
import { AdminAgent, CreateNewAgentResponse } from "../types";

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
interface SignUpClientResponse {
  error: boolean;
  result:
    | {
        _id: string;
        signUpVia: {
          via: string;
          handle: string;
        };
        agents: any[];
      }
    | string;
}

interface Agent {
  name: string;
  agentId: string;
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

interface StripeConfig {
  isEnabled: boolean;
  sellerId: string;
  currency: string;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  productName: string;
}

export async function extractContentFromURL(
  url: string
): Promise<ExtractContentResponse> {
  try {
    const response = await axios.post("https://rag.gobbl.ai/content/extract", {
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

export async function createNewAgent(
  clientId: string,
  name: string,
  textContent: string
): Promise<CreateNewAgentResponse> {
  try {
    const response = await axios.post(
      "https://rag.gobbl.ai/milvus/create-new-agent",
      {
        textContent: textContent,
        clientId: clientId,
        name: name,
      }
    );

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
    const response = await axios.post(
      "https://rag.gobbl.ai/milvus/query-document",
      {
        agentId,
        query,
      }
    );

    return response.data;
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
    const response = await axios.post(
      "https://rag.gobbl.ai/client/signupClient",
      {
        body: {
          via,
          handle,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error signing up client:", error);
    throw new Error("Failed to sign up client");
  }
}

export async function signUpUser(
  via: string,
  handle: string
): Promise<SignUpClientResponse> {
  try {
    const response = await axios.post("https://rag.gobbl.ai/user/signupUser", {
      body: {
        via,
        handle,
      },
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
      `https://rag.gobbl.ai/client/agents/${clientId}`
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
      `https://rag.gobbl.ai/client/getAgentDetails?inputParam=${inputParam}&isfetchByUsername=${isfetchByUsername}`
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

    console.log("🛰 Sending updateAgentDetails body:", body);

    const response = await axios.put(
      `https://rag.gobbl.ai/client/updateAgent/${agentId}`,
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
    const response = await axios.delete(
      `https://rag.gobbl.ai/client/deleteAgent/${agentId}`
    );

    if (response.data.error) {
      throw new Error("Error deleting agent");
    }
  } catch (error) {
    console.error("Error deleting agent:", error);
    throw error;
  }
}

export async function updateUserLogs(params: UpdateUserLogsParams) {
  try {
    const response = await axios.post(
      "https://rag.gobbl.ai/client/updateUserLogs",
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
      `https://rag.gobbl.ai/client/getAgentChatLogs/${agentId}`
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
      `https://rag.gobbl.ai/client/getServices?agentId=${agentId}`
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
    const response = await axios.post(
      "https://rag.gobbl.ai/client/updateAgentUsername",
      {
        agentId,
        agentName: username,
      }
    );

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
      "https://rag.gobbl.ai/client/uploadAgentLogo",
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
    const response = await axios.post(
      "https://rag.gobbl.ai/client/updateCalendlyUrl",
      {
        agentId,
        calendlyUrl,
      }
    );

    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data.result;
  } catch (error) {
    console.error("Error updating Calendly URL:", error);
    throw error;
  }
}

export async function checkUsernameAvailability(
  username: string
): Promise<boolean> {
  try {
    // We'll use a temporary ID for checking availability
    const tempAgentId = "check-availability";
    await updateAgentUsername(tempAgentId, username);
    return true;
  } catch (error) {
    // If there's an error, the username is not available
    return false;
  }
}

export async function updateAppointmentSettings(payload: {
  agentId: string;
  bookingType: string;
  bookingsPerSlot: number;
  meetingDuration: number;
  bufferTime: number;
  lunchBreak: { start: string; end: string };
  availability: AvailabilityDay[];
  locations: string[];
  timezone: string; // Added timezone field
}) {
  try {
    const response = await axios.post(
      "https://rag.gobbl.ai/appointment/settings",
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
      `https://rag.gobbl.ai/appointment/settings?agentId=${agentId}`
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
  const response = await axios.get(
    `https://rag.gobbl.ai/appointment/available-slots`,
    {
      params: { agentId, date, userTimezone }, // Add userTimezone to params
    }
  );
  if (response.data.error) {
    throw new Error(response.data.result || "No slots found");
  }
  // backend returns result: [ { startTime, endTime }, ... ]
  return response.data.result as TimeSlot[];
}

export interface BookingPayload {
  agentId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  userTimezone?: string; // Added userTimezone field
}

export async function bookAppointment(payload: BookingPayload): Promise<any> {
  const response = await axios.post(
    `https://rag.gobbl.ai/appointment/book`,
    payload
  );
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
  }>
): Promise<any> {
  try {
    const response = await axios.post(
      "https://rag.gobbl.ai/appointment/update-unavailable-dates",
      {
        agentId,
        unavailableDates,
      }
    );
    if (response.data.error) throw new Error(response.data.error);
    return response.data.result;
  } catch (error) {
    console.error("Error updating unavailable dates:", error);
    throw error;
  }
}

export async function getDayWiseAvailability(
  agentId: string,
  userTimezone?: string // Added userTimezone parameter
): Promise<Record<string, boolean>> {
  try {
    const response = await axios.get(
      `https://rag.gobbl.ai/appointment/day-wise-availability`,
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
      `https://rag.gobbl.ai/appointment/unavailable-dates?agentId=${agentId}`
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
      `https://rag.gobbl.ai/appointment/bookings?agentId=${agentId}`
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
    const response = await axios.post(
      "https://rag.gobbl.ai/appointment/cancel-booking",
      { bookingId }
    );
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

    const response = await fetch("https://rag.gobbl.ai/product/addProduct", {
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
    const response = await axios.put(
      "https://rag.gobbl.ai/product/updateProduct",
      data
    );

    if (response.data.error) {
      throw new Error("Failed to update product");
    }

    return response.data.result;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (id: string, agentId: string) => {
  try {
    const response = await axios.delete(
      `https://rag.gobbl.ai/product/deleteProduct`,
      {
        data: {
          productId: id,
          agentId,
        },
      }
    );

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
  try {
    const response = await axios.get(
      `https://rag.gobbl.ai/product/getProducts?agentId=${agentId}`
    );

    if (response.data.error) {
      throw new Error("Failed to fetch products");
    }

    return response.data.result;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
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
      "https://rag.gobbl.ai/product/updateProductImage",
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
      "https://rag.gobbl.ai/client/updateStripeAccountIdCurrency",
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
  agentId: string
): Promise<Transaction[]> => {
  try {
    const response = await axios.get(
      `https://rag.gobbl.ai/client/getAgentOrders?agentId=${agentId}`
    );
    return response.data.result;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
};

interface UserDetails {
  _id: string;
  email: string;
  name?: string;
  avatar?: string;
  signUpVia: {
    via: string;
    handle: string;
  };
}

export async function getUserDetails(userId: string): Promise<UserDetails> {
  try {
    const response = await axios.get(
      `https://rag.gobbl.ai/user/getUserDetails?userId=${userId}`
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
