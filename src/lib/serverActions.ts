import axios from "axios";
import { CreateNewAgentResponse } from "../types";

interface QueryDocumentResponse {
  context: any; // You might want to define a more specific type based on the actual response
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

export async function createNewAgent(
  textContent: string,
  name: string,
  clientId: string
): Promise<CreateNewAgentResponse> {
  try {
    const response = await axios.post(
      "https://rag.gobbl.ai/milvus/create-new-agent ",
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
