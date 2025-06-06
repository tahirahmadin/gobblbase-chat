import React, { useEffect, useState } from "react";
import { getChatLogs } from "../../../../lib/serverActions";
import { useBotConfig } from "../../../../store/useBotConfig";
import { ChatLog } from "../../../../types";
import ReactMarkdown from "react-markdown";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  return (
    <div className="p-0 md:p-8 w-screen md:w-full pt-4 h-full pb-8 overflow-y-auto">
      <h2 className="text-[1.5rem] mt-4 text-center md:text-start font-semibold mb-4 px-4 md:px-0">Chat Logs</h2>
      <div className="flex flex-col md:border border-black px-2 md:px-0 md:flex-row rounded-xl h-full md:h-[calc(100vh-12rem)] md:max-h-[800px] md:max-h-none w-full">
        {/* Left: Chat Sessions */}
        <div
          className={`w-full border border-black md:border-none py-2 md:w-1/3 rounded-xl md:rounded-r-none border-b md:border-b-0 md:border-r pb-4 flex flex-col h-[70vh] md:h-full bg-[#D4DEFF] ${
            isMobileChatOpen ? "hidden md:flex" : ""
          }`}
        >
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
              <div className="flex-1 space-y-2 min-h-0 px-2">
                {paginatedSessions.map((session) => (
                  <div
                    key={session._id}
                    className={`p-2 rounded-lg cursor-pointer transition-all ${
                      selectedChat?._id === session._id
                        ? "bg-green-100 border border-green-300"
                        : "bg-gray-100"
                    }`}
                    onClick={() => {
                      setSelectedChat(session);
                      setIsMobileChatOpen(true); // open chat on mobile
                    }}
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
              <div className="flex justify-center items-center mt-2 space-x-1 py-2 overflow-x-auto">
                <button
                  className="w-8 h-8 flex bg-[#4D65FF] items-center justify-center rounded-full text-white disabled:bg-[#CDCDCD]"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft size={20} style={{ strokeWidth: "4px" }} />
                </button>
                {getPaginationRange().map((p, index) =>
                  typeof p === "string" ? (
                    <span key={`ellipsis-${index}`} className="px-2">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      className={`para-font w-8 h-8 flex items-center justify-center rounded-md font-semibold transition-all ${
                        page === p
                          ? "bg-white text-black border-2 border-black"
                          : "text-[#4D65FF] hover:bg-blue-50"
                      }`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  className="w-8 h-8 flex bg-[#4D65FF] items-center justify-center rounded-full text-white disabled:bg-[#CDCDCD]"
                  disabled={page === Math.ceil(chatLogs.length / PAGE_SIZE)}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight size={20} style={{ strokeWidth: "4px" }} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Back Button for Mobile */}
        <div className={`${isMobileChatOpen ? "flex mt-8" : "hidden"} md:hidden`}>
          <button
            onClick={() => setIsMobileChatOpen(false)}
            className="text-sm mb-2"
          >
            <span className="flex items-center">
              <ChevronLeft size={20} style={{color: "black" , strokeWidth: "3px"}} />
              <h1 className="main-font text-[01rem] text-black">Back</h1>
            </span>
          </button>
        </div>
        <div className={`${isMobileChatOpen ? "flex justify-between px-4 py-2 border-2 border-[#6AFF97]" : "hidden"} md:hidden bg-[#CEFFDC] rounded-full`}>
              <div className="text-[#7D7D7D] font-semibold">Guest</div>
              <div className="text-sm text-[#7D7D7D] mt-1">
                {selectedChat && new Date(selectedChat.createdDate).toLocaleDateString()}
             </div>
        </div>
        {/* Right: Chat Conversation */}
        <div
          className={`${
            isMobileChatOpen ? "flex h-full" : "hidden"
          } scrollbar-custom md:flex border border-black md:border-none rounded-r-xl w-full md:w-2/3 pl-0 md:pl-8 flex-col space-y-4 bg-blue-50 rounded-lg p-2 mt-2 md:mt-0 md:mt-0 h-[50vh] md:h-full pb-[50px] overflow-y-auto`}
        >
          {selectedChat ? (
            selectedChat.userLogs.length > 0 ? (
              <div className="flex-1 space-y-4 min-h-0 px-2">
                {selectedChat.userLogs.map((msg, idx) =>
                  msg.role === "agent" ? (
                    <div key={idx} className="flex p-1">
                      <div className="bg-gray-300 text-gray-800 px-3 py-2 rounded-lg max-w-[85%] md:max-w-xs text-sm break-words whitespace-pre-wrap">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
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
