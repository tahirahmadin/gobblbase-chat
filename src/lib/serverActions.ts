import axios from "axios";
import { CreateNewAgentResponse } from "../types";

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

export async function fetchClientAgents(clientId: string): Promise<Agent[]> {
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
  agentId: string | null,
  username: string | null
) {
  try {
    const response = await fetch(
      `https://rag.gobbl.ai/client/getAgentDetails?agentId=${agentId}&username=${username}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch agent details");
    }
    const data = await response.json();
    if (data.error) {
      throw new Error("Error fetching agent details");
    }
    return data.result;
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

export async function deleteAgent(agentId: string) {
  try {
    const response = await axios.delete(
      `https://rag.gobbl.ai/client/deleteAgent/${agentId}`
    );

    if (response.data.error) {
      throw new Error("Error deleting agent");
    }
    return response.data.result;
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
