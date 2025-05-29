import React, { useEffect, useState } from "react";
import { getChatLogs } from "../../../../lib/serverActions";
import { useBotConfig } from "../../../../store/useBotConfig";
import { ChatLog } from "../../../../types";
import ReactMarkdown from "react-markdown";

const PAGE_SIZE = 3;

const ChatLogs = () => {
  const { activeBotId } = useBotConfig();
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatLog | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPaginationRange = () => {
    const totalPages = Math.ceil(chatLogs.length / PAGE_SIZE);
    const delta = 1; // Number of pages to show on each side of current page
    const range: (number | string)[] = [];

    for (
      let i = Math.max(1, page - delta);
      i <= Math.min(totalPages, page + delta);
      i++
    ) {
      range.push(i);
    }

    // Add first page if not in range
    if (typeof range[0] === "number" && range[0] > 1) {
      range.unshift(1);
      if (typeof range[1] === "number" && range[1] > 2) {
        range.splice(1, 0, "...");
      }
    }

    // Add last page if not in range
    const lastIndex = range.length - 1;
    const secondLastIndex = lastIndex - 1;
    if (typeof range[lastIndex] === "number" && range[lastIndex] < totalPages) {
      if (
        typeof range[secondLastIndex] === "number" &&
        range[secondLastIndex] < totalPages - 1
      ) {
        range.splice(lastIndex, 0, "...");
      }
      range.push(totalPages);
    }

    return range;
  };

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
    <div className="p-0 md:p-8 w-screen md:w-full pt-4">
      <h2 className="text-lg font-semibold mb-4 px-4 md:px-0">Chat Logs</h2>
      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow p-2 md:p-4 h-[calc(100vh-12rem)] max-h-[800px] md:max-h-none w-full">
        {/* Left: Chat Sessions */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r pb-4 md:pb-0 pr-0 md:pr-4 flex flex-col h-[40vh] md:h-full">
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
            <div className="flex flex-col h-full">
              <div className="flex-1  space-y-2 min-h-0 px-2">
                {paginatedSessions.map((session) => (
                  <div
                    key={session._id}
                    className={`p-2 rounded-lg cursor-pointer transition-all ${
                      selectedChat?._id === session._id
                        ? "bg-green-100 border border-green-300"
                        : "bg-gray-100"
                    }`}
                    onClick={() => setSelectedChat(session)}
                  >
                    <div className="font-semibold text-green-700">Guest</div>
                    <div className="text-xs text-gray-600 truncate">
                      <ReactMarkdown>
                        {session.userLogs[
                          session.userLogs.length - 1
                        ]?.content.slice(0, 60) || "No messages"}
                      </ReactMarkdown>
                    </div>
                    <div className="text-xs text-right text-green-400">
                      {new Date(session.createdDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              <div className="flex justify-center items-center mt-2 space-x-1 py-2 bg-white overflow-x-auto">
                <button
                  className="px-2 py-1 rounded bg-gray-200 min-w-[32px] disabled:opacity-50"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  {"<"}
                </button>
                {getPaginationRange().map((p, index) =>
                  typeof p === "string" ? (
                    <span key={`ellipsis-${index}`} className="px-2">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      className={`px-2 py-1 rounded min-w-[32px] ${
                        page === p ? "bg-blue-400 text-white" : "bg-gray-200"
                      }`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  className="px-2 py-1 rounded bg-gray-200 min-w-[32px] disabled:opacity-50"
                  disabled={page === Math.ceil(chatLogs.length / PAGE_SIZE)}
                  onClick={() => setPage(page + 1)}
                >
                  {">"}
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Right: Chat Conversation */}
        <div className="w-full md:w-2/3 pl-0 md:pl-8 flex flex-col space-y-4 bg-blue-50 rounded-lg p-2 mt-4 md:mt-0 h-[50vh] md:h-full pb-[50px] overflow-y-auto">
          {selectedChat ? (
            selectedChat.userLogs.length > 0 ? (
              <div className="flex-1  space-y-4 min-h-0 px-2">
                {selectedChat.userLogs.map((msg, idx) =>
                  msg.role === "agent" ? (
                    <div key={idx} className="flex p-1">
                      <div className="bg-gray-300 text-gray-800 px-3 py-2 rounded-lg max-w-[85%] md:max-w-xs text-sm break-words whitespace-pre-wrap">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>{" "}
                        <div className="text-xs text-left text-gray-900 font-semibold">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={idx} className="flex justify-end p-1">
                      <div className="bg-black text-white px-3 py-2 rounded-lg max-w-[85%] md:max-w-xs text-sm break-words whitespace-pre-wrap">
                        <div>{msg.content}</div>
                        <div className="text-xs text-left text-gray-200 font-semibold">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
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
