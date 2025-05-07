import React, { useEffect, useState } from "react";
import { getChatLogs } from "../../../lib/serverActions";
import { useBotConfig } from "../../../store/useBotConfig";
import { ChatLog } from "../../../types";

const PAGE_SIZE = 3;

const ChatLogs = () => {
  const { activeBotId } = useBotConfig();
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatLog | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!activeBotId) return;
      setIsLoading(true);
      setError(null);
      try {
        const logs = await getChatLogs(activeBotId);
        setChatLogs(logs);
        setSelectedChat(logs.length > 0 ? logs[0] : null);
      } catch (err: any) {
        setError("Failed to fetch chat logs");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, [activeBotId]);

  const totalPages = Math.ceil(chatLogs.length / PAGE_SIZE);
  const paginatedSessions = chatLogs.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="p-8">
      <h2 className="text-lg font-semibold mb-4">Chat Logs</h2>
      <div
        className="flex bg-white rounded-lg shadow p-4"
        style={{ minHeight: 500 }}
      >
        {/* Left: Chat Sessions */}
        <div className="w-1/3 border-r pr-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              Loading...
            </div>
          ) : error ? (
            <div className="text-red-500 p-4">{error}</div>
          ) : chatLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              No chats found
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {paginatedSessions.map((session) => (
                  <div
                    key={session._id}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedChat?._id === session._id
                        ? "bg-green-100 border border-green-300"
                        : "bg-gray-100"
                    }`}
                    onClick={() => setSelectedChat(session)}
                  >
                    <div className="font-semibold text-green-700">Guest</div>
                    <div className="text-xs text-gray-600">
                      {session.userLogs[
                        session.userLogs.length - 1
                      ]?.content.slice(0, 60) || "No messages"}
                    </div>
                    <div className="text-xs text-right text-green-400">
                      {new Date(session.createdDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              <div className="flex justify-center items-center mt-4 space-x-2">
                <button
                  className="px-2 py-1 rounded bg-gray-200"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  {"<"}
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      className={`px-2 py-1 rounded ${
                        page === p ? "bg-blue-400 text-white" : "bg-gray-200"
                      }`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  className="px-2 py-1 rounded bg-gray-200"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  {">"}
                </button>
              </div>
            </>
          )}
        </div>
        {/* Right: Chat Conversation */}
        <div className="w-2/3 pl-8 flex flex-col space-y-4 bg-blue-50 rounded-lg p-2">
          {selectedChat ? (
            selectedChat.userLogs.length > 0 ? (
              selectedChat.userLogs.map((msg, idx) =>
                msg.role === "agent" ? (
                  <div key={idx} className="flex">
                    <div className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg max-w-xs">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div key={idx} className="flex justify-end">
                    <div className="bg-black text-white px-4 py-2 rounded-lg max-w-xs">
                      {msg.content}
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                No messages in this chat
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              Select a chat to view messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatLogs;
