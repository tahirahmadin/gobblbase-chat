import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { useBotConfig } from "../../store/useBotConfig";
import { useAdminStore } from "../../store/useAdminStore";
import { Link, useNavigate } from "react-router-dom";
import { useServerHook } from "../../hooks/useServerHook";

interface Agent {
  agentId: string;
  name: string;
  logo?: string;
}

const Header = () => {
  const { activeBotData, activeBotId, setActiveBotId } = useBotConfig();
  const { agents, adminEmail, adminId, fetchAllAgents } = useAdminStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  //Handeling agentDetails refresh when change trigger
  const hook1 = useServerHook({ initHook: true });

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const handleAgentSelect = (agentId: string) => {
    setActiveBotId(agentId);
    setIsDropdownOpen(false);
    //To remove localStorage data of product in edit mode
    localStorage.removeItem("editingProduct");
    navigate("/admin/dashboard/profile");
  };

  return (
    <header
      className="bg-white border-b border-gray-200 shadow-lg z-10"
      style={{ backgroundColor: "#eaefff" }}
    >
      <div className="flex justify-between items-center px-6 py-2">
        <div className="flex items-center  pl-[40px] md:pl-0">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {activeBotData?.logo ? (
                <img
                  key={`${activeBotData.logo}?t=${Date.now()}`}
                  src={`${activeBotData.logo}?t=${Date.now()}`}
                  alt="Agent avatar"
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-500">
                    {activeBotData?.name?.charAt(0) || "A"}
                  </span>
                </div>
              )}
              <span className="hidden xs:block">
                {activeBotData?.name || "Select Agent"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            {isDropdownOpen && (
              <div className="absolute z-20 mt-2 w-72 rounded-lg shadow-lg bg-[#4b5cff] ring-1 ring-black ring-opacity-5 border border-blue-300">
                <div className="py-3 max-h-72 overflow-y-auto">
                  <div className="px-4 pb-2 text-white font-semibold text-base">
                    YOUR AGENTS
                  </div>
                  {agents?.map((agent: Agent) => (
                    <button
                      key={agent.agentId}
                      onClick={() => handleAgentSelect(agent.agentId)}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 rounded-md transition-colors duration-150
                        ${
                          agent.agentId === activeBotId
                            ? "bg-white bg-opacity-20 border border-white text-white"
                            : "hover:bg-blue-600 text-white"
                        }`}
                    >
                      {agent.logo ? (
                        <img
                          key={`${agent.logo}?t=${Date.now()}`}
                          src={`${agent.logo}?t=${Date.now()}`}
                          alt={`${agent.name} avatar`}
                          className="w-6 h-6 rounded-full object-cover border border-white"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">
                            {agent.name?.charAt(0) || "A"}
                          </span>
                        </div>
                      )}
                      <span className=" font-medium">{agent.name}</span>
                      {agent.agentId === activeBotId && (
                        <span className="ml-auto text-xs text-green-200 font-semibold">
                          Selected
                        </span>
                      )}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/admin/dashboard/create-bot");
                    }}
                    className="bg-green-400 hover:bg-green-500 text-black font-semibold px-4 py-2 rounded-lg w-[90%] mx-auto mt-3 block shadow"
                  >
                    CREATE NEW
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="">
          <div className="flex items-center space-x-2">
            <div className="relative inline-block">
              <div className="absolute top-1 left-1 w-full h-full bg-[#6aff97] rounded"></div>
              <div className="relative inline-block">
                {/* Bottom layer for shadow effect */}
                <div className="absolute top-1 left-1 w-full h-full border border-black "></div>
              </div>
            </div>
            <div
              className="truncate w-full flex items-center space-x-1 px-2 py-1 rounded-lg"
              style={{
                border: "1px solid #bdbdbd",
                backgroundColor: "#effdf4",
              }}
            >
              <div>
                <div className="truncate w-[80%] text-xs text-black font-semibold">
                  {adminEmail}
                </div>
                <a
                  href={`https://kifor.ai/${activeBotData?.username}`}
                  target="_blank"
                >
                  <div className="text-sm text-[#1C4ED8]">Visit chatbot</div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
