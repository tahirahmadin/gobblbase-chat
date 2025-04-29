export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  fileUrl?: string;
}

export interface CreateNewAgentResponse {
  error: boolean;
  result: {
    success: boolean;
    message: string;
    collectionName: string;
    agentId: string;
  };
}

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  sender: "user" | "agent";
}

export interface ChatLog {
  _id: string;
  userId: string;
  agentId: string;
  content: string;
  createdDate: string;
  lastUpdatedAt: string;
  sessionId: string;
  userLogs: {
    role: string;
    content: string;
    timestamp: string;
  }[];
  __v: number;
}

export interface Agent {
  name: string;
  agentId: string;
  username?: string;
  logo?: string;
  calendlyUrl?: string;
  systemPrompt?: string;
  model?: string;
  personalityType?: string;
  personalityPrompt?: string;
}

export interface AdminAgent {
  agentId: string;
  username: string;
  logo: string;
  name: string;
}

//Theme Types
export interface Theme {
  headerBgColor: string;
  headerIconBgColor: string;
  headerIconTextColor: string;
  headerTextColor: string;
  headerAdStripBgColor: string;
  headerAdStripColor: string;
  headerTabActiveColor: string;
  headerTabInactiveColor: string;

  chatBackgroundColor: string;
  chatTimeTextColor: string;

  bubbleAgentBgColor: string;
  bubbleAgentTextColor: string;

  bubbleUserBgColor: string;
  bubbleUserTextColor: string;

  inputCardColor: string;
  inputBackgroundColor: string;
  inputTextColor: string;

  mainLightBackgroundColor: string;
  mainLightTextColor: string;
  mainDarkBackgroundColor: string;
  mainDarkTextColor: string;
}
