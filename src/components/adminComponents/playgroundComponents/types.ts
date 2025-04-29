export interface Theme {
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
}

export interface ThemeOption {
  id: string;
  name: string;
  image: string;
  description: string;
  palette: string[];
  theme: Theme;
}

export interface ModelOption {
  id: string;
  name: string;
  image: string;
  contextWindow: string;
  description: string;
  traits: string[];
  details: string;
}

export interface SystemPromptTemplate {
  id: string;
  name: string;
  image: string;
  description: string;
  prompt: string;
}

export interface TonePreset {
  id: string;
  name: string;
  image: string;
  description: string;
  traits: string[];
  prompt: string;
}
