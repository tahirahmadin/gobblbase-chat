// ==================== Types ====================
import {
  AdminAgent,
  AnalyticsData,
  CreateNewAgentResponse,
  Theme,
  UserDetails,
  QueryDocumentResponse,
  ExtractContentResponse,
  AvailabilityDay,
  SignUpClientResponse,
  UpdateUserLogsParams,
  AddProductData,
  DocumentListResponse,
  DocumentResponse,
  RemoveDocumentResponse,
  PlanData,
  TimeSlot,
  BookingPayload,
  AgentPoliciesResponse,
  CustomerLead,
} from "../types";

// ==================== Utils ====================
import axios from "axios";
import CryptoJS from "crypto-js";
import { backendApiUrl } from "../utils/constants";

// ==================== Constants ====================
let apiUrl = import.meta.env.PROD ? backendApiUrl : "/api";

// ==================== Encryption & Security ====================

/**
 * Encrypts input data using AES encryption
 * @param inputBodyData - The data to be encrypted
 * @returns Object containing encrypted data
 */
export const getCipherText = (inputBodyData: any) => {
  try {
    let secretKey = import.meta.env.VITE_ENCRYPTION_KEY;
    if (!secretKey) {
      throw new Error("Encryption key not found");
    }

    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(inputBodyData), key, {
      mode: CryptoJS.mode.ECB,
    });

    return { data: encrypted.toString() };
  } catch (error) {
    console.error("Error in encryption:", error);
    throw error;
  }
};

/**
 * Generates HMAC message for API security
 * @param inputBodyData - The data to generate HMAC for
 * @returns Object containing HMAC hash and timestamp
 */
const getHmacMessageFromBody = (inputBodyData: string) => {
  try {
    const apiSecret = import.meta.env.VITE_HMAC_KEY;
    if (!apiSecret) {
      throw new Error("HMAC key not found");
    }

    const currentTimestamp = (Date.now() / 1000).toString();
    const hmacHash = CryptoJS.HmacSHA256(
      inputBodyData + currentTimestamp,
      apiSecret
    ).toString();

    return {
      hmacHash: hmacHash,
      currentTimestamp: currentTimestamp,
    };
  } catch (error) {
    console.error("Error generating HMAC:", error);
    return null;
  }
};

// ==================== Functions ====================

export async function signUpClient(
  via: string,
  handle: string
): Promise<SignUpClientResponse> {
  try {
    let url = `${apiUrl}/client/signupClient`;
    let dataObj = {
      via,
      handle,
    };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });

    if (!response.data) {
      throw new Error("No data received from server");
    }

    return response.data;
  } catch (error) {
    console.error("Error signing up client:", error);
    return {
      error: true,
      result: "Failed to sign up client",
    };
  }
}

export async function signUpUser(
  via: string,
  handle: string
): Promise<SignUpClientResponse> {
  try {
    let url = `${apiUrl}/user/signupUser`;
    let dataObj = {
      via,
      handle,
    };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });

    if (!response.data) {
      throw new Error("No data received from server");
    }

    return response.data;
  } catch (error) {
    console.error("Error signing up client:", error);
    throw new Error("Failed to sign up client");
  }
}

export async function getUserDetails(userId: string): Promise<UserDetails> {
  try {
    let requestParams = `userId=${userId}`;
    let url = `${apiUrl}/user/getUserDetails?${requestParams}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };
    const response = await axios.get(url, { headers: axiosHeaders });

    if (response.data.error) {
      throw new Error(response.data.result || "Failed to fetch user details");
    }

    return response.data.result;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
}
export async function fetchClientAgents(
  clientId: string
): Promise<AdminAgent[]> {
  try {
    let requestParams = `clientId=${clientId}`;
    let url = `${apiUrl}/client/agents?${requestParams}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.get(url, { headers: axiosHeaders });
    if (response.data.error) {
      throw new Error("Failed to fetch client agents");
    }
    return response.data.result;
  } catch (error) {
    console.error("Error fetching client agents:", error);
    throw new Error("Failed to fetch client agents");
  }
}

export async function getClient(clientId: string) {
  try {
    let requestParams = `clientId=${clientId}`;
    let url = `${apiUrl}/client/getClient?${requestParams}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.get(url, { headers: axiosHeaders });

    if (response.data.error) {
      throw new Error(response.data.result || "Failed to fetch client data");
    }

    return response.data.result;
  } catch (error) {
    console.error("Error fetching client data:", error);
    throw error;
  }
}

export async function getClientAnalytics(
  clientId: string
): Promise<AnalyticsData> {
  try {
    let requestParams = `clientId=${clientId}`;
    let url = `${apiUrl}/client/getAnalytics?${requestParams}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.get(url, { headers: axiosHeaders });

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

// ************** AGENT RELATED FUNCTIONS ************** //
export async function getAgentDetails(
  inputParam: string | null,
  isfetchByUsername: boolean
) {
  try {
    // Check if we have at least one parameter
    if (!inputParam) {
      throw new Error("Either agentId or username must be provided");
    }
    let requestParams = `inputParam=${inputParam}&isfetchByUsername=${isfetchByUsername}`;
    let url = `${apiUrl}/agent/getAgentDetails?${requestParams}`;

    let hmacResponse = getHmacMessageFromBody(requestParams);
    if (!hmacResponse) {
      return null;
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };
    const response = await axios.get(url, { headers: axiosHeaders });

    if (response.data.error) {
      throw new Error(response.data.result || "Error fetching agent details");
    }

    return response.data.result;
  } catch (error) {
    console.error("Error fetching agent details:", error);
    throw error;
  }
}

export async function updateAgentUsername(agentId: string, username: string) {
  try {
    let url = `${apiUrl}/agent/updateAgentUsername`;
    let dataObj = { agentId, agentName: username };
    let encryptedData = getCipherText(dataObj);
    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
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

    let url = `${apiUrl}/agent/uploadAgentLogo`;

    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data.result;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
}

export async function updateBotTheme(agentId: string, inputTheme: Theme) {
  try {
    let url = `${apiUrl}/agent/updateAgentTheme`;
    let dataObj = {
      agentId: agentId,
      themeColors: inputTheme,
    };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });

    if (response.data.error) {
      throw new Error("Error updating agent details");
    }
    return response.data.result;
  } catch (error) {
    console.error("Error updating agent details:", error);
    throw error;
  }
}

export async function deleteAgent(
  agentId: string,
  userId?: string
): Promise<void> {
  try {
    let url = `${apiUrl}/agent/deleteAgent`;
    let dataObj = { agentId, userId };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });

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

export async function getTransactions(
  agentId: string,
  page: number
): Promise<{ orders: any[]; hasNext: boolean }> {
  try {
    let url = `${apiUrl}/agent/getAgentOrders?agentId=${agentId}&page=${page}`;
    let requestParams = `agentId=${agentId}&page=${page}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.get(url, { headers: axiosHeaders });

    return response.data.result;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
}

export async function updateSocialHandles(
  agentId: string,
  socials: Record<string, string>
): Promise<boolean> {
  try {
    let url = `${apiUrl}/agent/updateSocialHandles`;
    let dataObj = { agentId, socials };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    await axios.post(url, encryptedData, { headers: axiosHeaders });
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
    let url = `${apiUrl}/agent/updateAgentNameAndBio`;

    let dataObj = { agentId, name, bio };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });

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
    let url = `${apiUrl}/agent/updateAgentPromoBanner`;
    let dataObj = { agentId, promotionalBanner, isPromoBannerEnabled };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    await axios.post(url, encryptedData, { headers: axiosHeaders });
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
    let url = `${apiUrl}/agent/updateAgentVoicePersonality`;
    let dataObj = { agentId, personalityType };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    await axios.post(url, encryptedData, { headers: axiosHeaders });
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
    let url = `${apiUrl}/agent/updateAgentWelcomeMessage`;
    let dataObj = { agentId, welcomeMessage };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    await axios.post(url, encryptedData, { headers: axiosHeaders });
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
    let url = `${apiUrl}/agent/updateAgentPrompts`;
    let dataObj = { agentId, prompts };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    await axios.post(url, encryptedData, { headers: axiosHeaders });
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
    let url = `${apiUrl}/agent/updateAgentBrain`;
    let dataObj = { agentId, language, smartenUpAnswers };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    await axios.post(url, encryptedData, { headers: axiosHeaders });
    return true;
  } catch (error) {
    console.error("Error updating agent brain:", error);
    throw new Error("Failed to update agent brain");
  }
}

export async function getChatLogs(agentId: string) {
  try {
    let requestParams = `agentId=${agentId}`;
    let url = `${apiUrl}/agent/getAgentChatLogs?${requestParams}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      return null;
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.get(url, { headers: axiosHeaders });

    if (response.data.error) {
      throw new Error("Error fetching chat logs");
    }
    return response.data.result;
  } catch (error) {
    console.error("Error fetching chat logs:", error);
    throw error;
  }
}

export async function updateUserLogs(params: UpdateUserLogsParams) {
  try {
    let url = `${apiUrl}/agent/updateUserLogs`;
    let encryptedData = getCipherText(params);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      return null;
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });

    if (response.data.error) {
      throw new Error("Error updating user logs");
    }
    return response.data.result;
  } catch (error) {
    console.error("Error updating user logs:", error);
    throw error;
  }
}

export async function updateCustomerLeadFlag(
  agentId: string,
  isEnabled: boolean
): Promise<boolean> {
  try {
    let url = `${apiUrl}/agent/changeCustomerLeadFlag`;
    let dataObj = { agentId, isEnabled };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return true;
  } catch (error) {
    console.error("Error updating customer lead flag:", error);
    throw new Error("Failed to update customer lead flag");
  }
}

export async function getCustomerLeads(
  agentId: string
): Promise<CustomerLead[]> {
  try {
    let requestParams = `agentId=${agentId}`;
    let url = `${apiUrl}/agent/getCustomerLeads?${requestParams}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.get(url, { headers: axiosHeaders });

    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data.result;
  } catch (error) {
    console.error("Error fetching customer leads:", error);
    throw new Error("Failed to fetch customer leads");
  }
}

export async function getAgentPolicies(
  agentId: string
): Promise<AgentPoliciesResponse> {
  try {
    let requestParams = `agentId=${agentId}`;
    let url = `${apiUrl}/agent/getAgentPolicies?${requestParams}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.get(url, { headers: axiosHeaders });

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
    let url = `${apiUrl}/agent/updateAgentModel`;
    let dataObj = { agentId, model: modelName };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
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
    let url = `${apiUrl}/agent/updateAgentGeneratedPrompts`;
    let dataObj = { agentId, prompts: generatedPrompts };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });
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
    let url = `${apiUrl}/agent/saveCustomerLeads`;
    let dataObj = { agentId, newLead: lead };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
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

export async function updateAgentPolicy(
  agentId: string,
  policyId: string,
  enabled: boolean,
  content: string
): Promise<boolean> {
  try {
    let url = `${apiUrl}/agent/updateAgentPolicy`;
    let dataObj = { agentId, policyId, enabled, content };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return true;
  } catch (error) {
    console.error("Error updating agent policy:", error);
    throw error;
  }
}

export async function updateCustomHandles(
  agentId: string,
  customHandles: { label: string; url: string }[]
): Promise<boolean> {
  try {
    let url = `${apiUrl}/agent/updateCustomHandles`;
    let dataObj = { agentId, customHandles };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    await axios.post(url, encryptedData, { headers: axiosHeaders });
    return true;
  } catch (error) {
    console.error("Error updating custom handles:", error);
    throw new Error("Failed to update custom links");
  }
}
export async function submitWhatsapp(
  agentId: string,
  countryCode: string,
  number: string
): Promise<boolean> {
  try {
    let url = `${apiUrl}/agent/updateWhatsappNumber`;
    let dataObj = { agentId, whatsappNumber: { countryCode, number } };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
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

// ************** DOCUMENT OR BRAIN FUNCTIONS ************** //
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
    let url = `${apiUrl}/milvus/create-new-agent`;
    let dataObj = {
      clientId: clientId,
      name: name,
      personalityType: personalityType,
      themeColors: themeColors,
    };
    let encryptedData = getCipherText(dataObj);
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));
    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };
    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });
    return response.data;
  } catch (error) {
    console.error("Error processing document:", error);
    throw new Error("Failed to process document");
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
    let url = `${apiUrl}/milvus/create-new-agent`;
    let dataObj = {
      clientId: clientId,
      name: name,
      personalityType: personalityType,
      themeColors: themeColors,
    };
    let requestParams = JSON.stringify(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, dataObj, { headers: axiosHeaders });

    return response.data;
  } catch (error) {
    console.error("Error creating agent:", error);
    return {
      error: true,
      result: {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create agent",
        collectionName: "",
        agentId: "",
      },
    };
  }
}

export async function listAgentDocuments(
  agentId: string
): Promise<DocumentListResponse> {
  try {
    let requestParams = `agentId=${agentId}`;
    let url = `${apiUrl}/milvus/list-documents?${requestParams}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.get(url, { headers: axiosHeaders });
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

export async function addDocumentToAgent(
  agentId: string,
  textContent: string,
  documentTitle?: string,
  documentSize?: number,
  videoMetadata?: any
): Promise<DocumentResponse> {
  try {
    let url = `${apiUrl}/milvus/add-document`;
    let dataObj = {
      agentId,
      textContent,
      documentTitle: documentTitle || "Untitled Document",
      documentSize:
        documentSize || new TextEncoder().encode(textContent).length,
      videoMetadata: videoMetadata || undefined,
    };
    
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };
    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });

    console.log("🔍 Backend response:", response.data);
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
    let url = `${apiUrl}/milvus/remove-document`;
    let dataObj = { agentId, documentId };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };
    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
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
    let url = `${apiUrl}/milvus/update-document`;
    let dataObj = { agentId, documentId, textContent, documentTitle };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };
    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
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

export async function queryDocument(
  agentId: string,
  query: string
): Promise<QueryDocumentResponse> {
  try {
    let url = `${apiUrl}/milvus/query-document`;
    let dataObj = { agentId, query };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };
    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });
    return response.data.result;
  } catch (error) {
    console.error("Error querying document:", error);
    throw new Error("Failed to query document");
  }
}

// ==================== Booking Functions ====================

export async function getIntegratedServices(agentId: string) {
  try {
    let requestParams = `agentId=${agentId}`;
    let url = `${apiUrl}/client/getServices?${requestParams}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.get(url, { headers: axiosHeaders });
    if (response.data.error) {
      throw new Error("Failed to fetch integrated services");
    }
    return response.data.result;
  } catch (error) {
    console.error("Error fetching integrated services:", error);
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
    let url = `${apiUrl}/appointment/settings`;
    let dataObj = payload;
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });
    if (response.data.error) throw new Error(response.data.error);
    return response.data;
  } catch (error) {
    console.error("Error updating appointment settings:", error);
    throw error;
  }
}

export async function getAppointmentSettings(agentId: string) {
  try {
    let requestParams = `agentId=${agentId}`;
    let url = `${apiUrl}/appointment/settings?${requestParams}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.get(url, { headers: axiosHeaders });
    if (response.data.error) throw new Error(response.data.error);
    return response.data.result;
  } catch (error) {
    console.error("Error fetching appointment settings:", error);
    throw error;
  }
}

export async function getAvailableSlots(
  agentId: string,
  date: string,
  userTimezone?: string // Added userTimezone parameter
): Promise<TimeSlot[]> {
  try {
    let requestParams = `agentId=${agentId}&date=${date}&userTimezone=${userTimezone}`;
    let url = `${apiUrl}/appointment/available-slots?${requestParams}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.get(url, { headers: axiosHeaders });
    if (response.data.error) throw new Error(response.data.error);
    return response.data.result as TimeSlot[];
  } catch (error) {
    console.error("Error fetching available slots:", error);
    throw error;
  }
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
    let url = `${apiUrl}/appointment/update-unavailable-dates`;
    let dataObj = { agentId, unavailableDates, datesToMakeAvailable };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

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
    let requestParams = `agentId=${agentId}&userTimezone=${userTimezone}`;
    let url = `${apiUrl}/appointment/day-wise-availability?${requestParams}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.get(url, { headers: axiosHeaders });
    if (response.data.error) throw new Error(response.data.error);
    return response.data.result || {};
  } catch (error) {
    console.error("Error fetching day-wise availability:", error);
    return {};
  }
}

export async function getUnavailableDates(agentId: string): Promise<string[]> {
  try {
    let requestParams = `agentId=${agentId}`;
    let url = `${apiUrl}/appointment/unavailable-dates?${requestParams}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.get(url, { headers: axiosHeaders });
    if (response.data.error) throw new Error(response.data.error);
    return response.data.result || [];
  } catch (error) {
    console.error("Error fetching unavailable dates:", error);
    return [];
  }
}

export async function getBookings(agentId: string) {
  try {
    let requestParams = `agentId=${agentId}`;
    let url = `${apiUrl}/appointment/bookings?${requestParams}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.get(url, { headers: axiosHeaders });
    if (response.data.error) throw new Error(response.data.error);
    return response.data.result;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
}

export async function cancelBooking(bookingId: string) {
  try {
    let url = `${apiUrl}/appointment/cancel-booking`;
    let dataObj = { bookingId };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });

    if (response.data.error) throw new Error(response.data.error);
    return response.data.result;
  } catch (error) {
    console.error("Error cancelling booking:", error);
    throw error;
  }
}

export async function getUserBookingHistory(userId: string, agentId: string) {
  try {
    let requestParams = `userId=${userId}&agentId=${agentId}`;
    let url = `${apiUrl}/appointment/user-bookings?${requestParams}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.get(url, { headers: axiosHeaders });
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
    let url = `${apiUrl}/appointment/user-reschedule`;
    let dataObj = payload;
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });

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
    let dataObj = {
      bookingId,
      userId
    };
    let encryptedData = getCipherText(dataObj);

    let requestParams = `data=${encodeURIComponent(encryptedData.data)}`;
    let url = `${apiUrl}/appointment/booking-for-reschedule?${requestParams}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.get(url, { headers: axiosHeaders });

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
    let url = `${apiUrl}/appointment/cancel-booking`;
    let dataObj = { bookingId, userId };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed t o generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
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
    let url = `${apiUrl}/appointment/send-reschedule-email`;
    let dataObj = payload;
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });

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

export async function bookAppointment(payload: BookingPayload): Promise<any> {
  try {
    let url = `${apiUrl}/appointment/book`;
    let dataObj = payload;
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };
    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });

    if (response.data.error) throw new Error(response.data.error);
    return response.data.result;
  } catch (error) {
    console.error("Error booking appointment:", error);
    throw error;
  }
}

// ************** PRODUCT FUNCTIONS ************** //
export async function getMainProducts(agentId: string) {
  try {
    let requestParams = `agentId=${agentId}`;
    let url = `${apiUrl}/product/getProducts?${requestParams}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.get(url, { headers: axiosHeaders });
    if (response.data.error) throw new Error("Failed to fetch products");
    return response.data.result || [];
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
}

export async function deleteMainProduct(productId: string) {
  try {
    let url = `${apiUrl}/product/deleteProduct`;
    let dataObj = { productId };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.delete(url, {
      data: encryptedData,
      headers: axiosHeaders,
    });
    return response.data;
  } catch (err) {
    console.error("Error deleting product:", err);
    throw err;
  }
}

export async function pauseProduct(productId: string, isPaused: boolean) {
  try {
    let url = `${apiUrl}/product/pauseProduct`;
    let dataObj = { productId, isPaused };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
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
}

export async function getMainProductsForUser(agentId: string) {
  try {
    let requestParams = `agentId=${agentId}`;
    let url = `${apiUrl}/user/getAgentProducts?${requestParams}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.get(url, { headers: axiosHeaders });
    if (response.data.error) throw new Error("Failed to fetch products");
    return response.data.result || [];
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
}

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
  let url = `${apiUrl}/product/addPhysicalProduct`;

  let currentTimestamp = new Date().getTime();
  let dataObj = { timestamp: currentTimestamp.toString() };

  let encryptedData = getCipherText(dataObj);

  formData.append("encryptedData", JSON.stringify(encryptedData));

  const response = await axios.post(url, formData, {
    headers: {
      Timestamp: currentTimestamp.toString(),
    },
  });

  if (response.data.error) {
    throw new Error("Failed to save physical product");
  }

  return {
    error: false,
    result: response.data.result,
  };
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
  let currentTimestamp = new Date().getTime();
  let dataObj = { timestamp: currentTimestamp.toString() };

  let encryptedData = getCipherText(dataObj);

  let url = `${apiUrl}/product/addDigitalProduct`;
  formData.append("encryptedData", JSON.stringify(encryptedData));

  const response = await axios.post(url, formData, {
    headers: {
      Timestamp: currentTimestamp.toString(),
    },
  });

  if (response.data.error) {
    throw new Error("Failed to save physical product");
  }

  return {
    error: false,
    result: response.data.result,
  };
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
  let currentTimestamp = new Date().getTime();
  let dataObj = { timestamp: currentTimestamp.toString() };

  let encryptedData = getCipherText(dataObj);

  let url = `${apiUrl}/product/addService`;
  formData.append("encryptedData", JSON.stringify(encryptedData));

  const response = await axios.post(url, formData, {
    headers: {
      Timestamp: currentTimestamp.toString(),
    },
  });

  if (response.data.error) {
    throw new Error("Failed to save physical product");
  }

  return {
    error: false,
    result: response.data.result,
  };
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
  let currentTimestamp = new Date().getTime();
  let dataObj = { timestamp: currentTimestamp.toString() };

  let encryptedData = getCipherText(dataObj);

  let url = `${apiUrl}/product/addEvent`;
  formData.append("encryptedData", JSON.stringify(encryptedData));

  const response = await axios.post(url, formData, {
    headers: {
      Timestamp: currentTimestamp.toString(),
    },
  });

  if (response.data.error) {
    throw new Error("Failed to save physical product");
  }

  return {
    error: false,
    result: response.data.result,
  };
}

// ************** PAYMENT FUNCTIONS ************** //
export async function payOutStripe(clientId: string) {
  try {
    let url = `${apiUrl}/client/payOut`;
    let dataObj = { clientId };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data;
  } catch (error: any) {
    return {
      error: true,
      result: "Failed to cash out via Stripe",
    };
  }
}

export async function getStripeBillingSession(
  clientId: string
): Promise<string> {
  try {
    let requestParams = `clientId=${clientId}`;
    let url = `${apiUrl}/product/createBillingSession?${requestParams}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.get(url, { headers: axiosHeaders });

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

export async function enableStripePayment(
  clientId: string,
  isStripeEnabled: boolean
): Promise<boolean> {
  try {
    let url = `${apiUrl}/client/enableStripePayment`;
    let dataObj = { clientId, enabled: isStripeEnabled };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
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
    let url = `${apiUrl}/client/completeStripeOnboarding`;
    let dataObj = { clientId };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });

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
    let url = `${apiUrl}/client/enableCryptoPayment`;
    let dataObj = { clientId, isEnabled, walletAddress, chainIds };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
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

export async function updateClientPaymentSettings(
  clientId: string,
  currency: string,
  preferredMethod: string
): Promise<boolean> {
  try {
    let url = `${apiUrl}/client/updateCurrencyAndPreferredMethod`;
    let dataObj = { clientId, currency, preferredMethod };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return true;
  } catch (error) {
    console.error("Error updating payment settings:", error);
    throw new Error("Failed to update payment settings");
  }
}

export async function getPlans(clientId: string): Promise<PlanData[]> {
  try {
    let requestParams = `clientId=${clientId}`;
    let url = `${apiUrl}/client/getPlans?${requestParams}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.get(url, { headers: axiosHeaders });
    if (response.data.error) throw new Error("Failed to fetch plans");
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
    let url = `${apiUrl}/product/subscribeOrChangePlan`;
    let dataObj = { clientId, planId };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });
    if (response.data.error) throw new Error("Failed to subscribe to plan");
    return response.data.result;
  } catch (error) {
    console.error("Error subscribing to plan:", error);
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
    let url = `${apiUrl}/client/updateClientBillingDetails`;
    let dataObj = { clientId, billingDetails };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });
    if (response.data.error)
      throw new Error("Failed to update billing details");
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
    let url = `${apiUrl}/client/updateClientBillingMethod`;
    let dataObj = { clientId, billingMethod };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });
    if (response.data.error) throw new Error("Failed to update billing method");
    return response.data.result;
  } catch (error) {
    console.error("Error updating billing method:", error);
    throw new Error("Failed to update billing method");
  }
}

export async function getClientUsage(clientId: string) {
  try {
    let requestParams = `clientId=${clientId}`;
    let url = `${apiUrl}/client/getClientUsage?${requestParams}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.get(url, { headers: axiosHeaders });
    if (response.data.error) {
      throw new Error(
        response.data.result || "Failed to fetch client usage data"
      );
    }

    return response.data.result;
  } catch (error) {
    console.error("Error fetching client usage data:", error);
    throw error;
  }
}

// ************** EMAIL TEMPLATES ************** //
export async function getEmailTemplates(agentId: string): Promise<any> {
  try {
    let requestParams = `agentId=${agentId}`;
    let url = `${apiUrl}/email/getEmailTemplates?${requestParams}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.get(url, { headers: axiosHeaders });
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

export async function updateEmailTemplates(
  agentId: string,
  updatedData: any,
  emailTemplateId: string
): Promise<any> {
  try {
    let url = `${apiUrl}/email/updateEmailTemplates`;
    let dataObj = { agentId, updatedData, emailTemplateId };
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating email templates:", error);
    throw error;
  }
}

// ************** ADMIN SUPPORT LOGS ************** //
export async function getAdminSupportLogs(clientId: string) {
  try {
    let requestParams = `clientId=${clientId}`;
    let url = `${apiUrl}/admin/getAdminSupportLogs?${requestParams}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);
    if (!hmacResponse) {
      return null;
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    let response = await axios
      .get(url, { headers: axiosHeaders })
      .then((res) => res.data);

    if (response.error) {
      throw new Error(response.error);
    }
    return response.result;
  } catch (error) {
    console.error("Error fetching admin chat logs:", error);
    throw error;
  }
}

export async function updateAdminChatLog(params: {
  newUserLog: any[];
  clientId: string;
}) {
  try {
    let url = `${apiUrl}/admin/updateChatLog`;

    //Encrypted data
    let encryptedData = getCipherText(params);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));

    if (!hmacResponse) {
      return null;
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating admin chat log:", error);
    throw error;
  }
}

export async function inviteTeamMember(
  dataObj: any
): Promise<{ error: boolean; result: string }> {
  try {
    let url = `${apiUrl}/client/inviteTeamMember`;
    let encryptedData = getCipherText(dataObj);

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(JSON.stringify(encryptedData));
    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.post(url, encryptedData, {
      headers: axiosHeaders,
    });

    if (!response.data) {
      throw new Error("No data received from server");
    }
    return response.data;
  } catch (error) {
    console.error("Error inviting team member:", error);
    return {
      error: true,
      result: "Failed to invite team member",
    };
  }
}

export async function getTeamInvites(clientId: string) {
  try {
    let requestParams = `clientId=${clientId}`;
    let url = `${apiUrl}/client/getMyInvites?${requestParams}`;

    // HMAC Response
    let hmacResponse = getHmacMessageFromBody(requestParams);

    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC");
    }
    let axiosHeaders = {
      HMAC: hmacResponse.hmacHash,
      Timestamp: hmacResponse.currentTimestamp,
    };

    const response = await axios.get(url, { headers: axiosHeaders });
    if (response.data.error) {
      throw new Error(response.data.result || "Failed to fetch invites");
    }
    return response.data.result;
  } catch (error) {
    console.error("Error fetching team invites:", error);
    throw error;
  }
}
