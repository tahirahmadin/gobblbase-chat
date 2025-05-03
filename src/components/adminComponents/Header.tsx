import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useBotConfig } from "../../store/useBotConfig";
import { useAdminStore } from "../../store/useAdminStore";
import { useNavigate } from "react-router-dom";
import { useServerHook } from "../../hooks/useServerHook";

interface Agent {
  agentId: string;
  name: string;
  logo?: string;
}

const Header = () => {
  const { activeBotData, activeBotId, setActiveBotId } = useBotConfig();
  const { agents, adminId, fetchAllAgents } = useAdminStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  //Handeling agentDetails refresh when change trigger
  const hook1 = useServerHook({ initHook: true });

  console.log("activeBotId");
  console.log(activeBotId);
  console.log(activeBotData);

  useEffect(() => {
    if (agents.length > 0) {
      setActiveBotId(agents[0].agentId);
    }
  }, [agents, setActiveBotId]);

  // useEffect(() => {
  //   if (adminId) {
  //     fetchAllAgents();
  //   }
  // }, [adminId, fetchAllAgents]);

  useEffect(() => {
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
  }, []);

  const handleAgentSelect = (agentId: string) => {
    setActiveBotId(agentId);
    setIsDropdownOpen(false);
    navigate("/admin/dashboard/profile");
  };

  return (
    <header
      className="bg-white border-b border-gray-200 shadow-lg z-10"
      style={{ backgroundColor: "#eaefff" }}
    >
      <div className="flex justify-between items-center px-6 py-3">
        <div className="flex items-center space-x-4">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {activeBotData?.logo ? (
                <img
                  src={activeBotData.logo}
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
              <span>{activeBotData?.name || "Select Agent"}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1 max-h-64 overflow-y-auto">
                  {agents?.map((agent: Agent) => (
                    <button
                      key={agent.agentId}
                      onClick={() => handleAgentSelect(agent.agentId)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2
                        ${agent.agentId === activeBotId ? "bg-gray-50" : ""}`}
                    >
                      {agent.logo ? (
                        <img
                          src={agent.logo}
                          alt={`${agent.name} avatar`}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">
                            {agent.name?.charAt(0) || "A"}
                          </span>
                        </div>
                      )}
                      <span
                        className={`${
                          agent.agentId === activeBotId ? "font-medium" : ""
                        }`}
                      >
                        {agent.name}
                      </span>
                      {agent.agentId === activeBotId && (
                        <span className="ml-auto text-xs text-green-500">
                          Selected
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Upgrade Plan
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
