import React from "react";
import {
  RefreshCw,
  Filter,
  Download,
  MessageSquare,
  Users,
} from "lucide-react";
import { getChatLogs } from "../lib/serverActions";
import { useUserStore } from "../store/useUserStore";
import { ChatLog } from "../types";

interface ActivityTab {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export default function Activity() {
  const [activeTab, setActiveTab] = React.useState("chat-logs");
  const [chatLogs, setChatLogs] = React.useState<ChatLog[]>([]);
  const [selectedChat, setSelectedChat] = React.useState<ChatLog | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const { activeAgentId } = useUserStore();

  const tabs: ActivityTab[] = [
    {
      id: "chat-logs",
      name: "Chat Logs",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    { id: "leads", name: "Leads", icon: <Users className="h-5 w-5" /> },
  ];

  const fetchChatLogs = async () => {
    if (!activeAgentId) return;

    setIsLoading(true);
    try {
      const logs = await getChatLogs(activeAgentId);
      setChatLogs(logs);
    } catch (error) {
      console.error("Error fetching chat logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchChatLogs();
  }, [activeAgentId]);

  const handleRefresh = () => {
    fetchChatLogs();
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Left sidebar */}
      <div className="flex">
        <div className="w-64 pr-8">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-md w-full
                  ${
                    activeTab === tab.id
                      ? "text-purple-600 bg-purple-50"
                      : "text-gray-600 hover:bg-gray-50"
                  }
                `}
              >
                <span
                  className={`mr-3 ${
                    activeTab === tab.id ? "text-purple-600" : "text-gray-400"
                  }`}
                >
                  {tab.icon}
                </span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Chat logs
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </button>
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </button>
                  <button className="inline-flex items-center px-3 py-1.5 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
              ) : chatLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <MessageSquare className="h-12 w-12 mb-4" />
                  <p className="text-lg">No chats found</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-6">
                  {/* Chat list */}
                  <div className="col-span-1 border-r border-gray-200 pr-6">
                    <div className="space-y-2">
                      {chatLogs.map((chat) => (
                        <button
                          key={chat._id}
                          onClick={() => setSelectedChat(chat)}
                          className={`w-full text-left p-3 rounded-lg ${
                            selectedChat?._id === chat._id
                              ? "bg-purple-50 text-purple-700"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium truncate">
                              {chat.userLogs[0].content.slice(0, 8)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(chat.createdDate).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate mt-1">
                            {chat.content || "No messages"}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chat messages */}
                  <div className="col-span-2 pl-6">
                    {selectedChat ? (
                      <div className="space-y-4">
                        {selectedChat.userLogs.map((message, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg ${
                              message.role === "user"
                                ? "bg-indigo-50 text-indigo-700 ml-8"
                                : "bg-gray-50 text-gray-700"
                            }`}
                          >
                            <p>{message.content}</p>
                            <div className="mt-1 text-xs text-gray-500">
                              {new Date(message.timestamp).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <MessageSquare className="h-12 w-12 mb-4" />
                        <p className="text-lg">
                          Select a chat to view messages
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
