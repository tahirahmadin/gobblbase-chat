import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, Eye } from "lucide-react";
import { useBotConfig } from "../../store/useBotConfig";
import { useAdminStore } from "../../store/useAdminStore";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useServerHook } from "../../hooks/useServerHook";
import styled from "styled-components";
import { AdminAgent } from "../../types";

const Button = styled.button`
  position: relative;
  background: #6aff97;
  padding: 0.6vh 1vw;
  border: 1px solid black;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 16px);
  &::before {
    content: "";
    position: absolute;
    top: 5px;
    right: -5px;
    width: 100%;
    height: 100%;
    border: 1px solid #000000;
    z-index: -1;
    background: #6aff97;
  }

  &:disabled {
    background: rgb(113, 240, 151);
    color: #b0b0b0;
    cursor: not-allowed;
  }
  &:disabled::before {
    background: rgb(113, 240, 151);
  }
`;

interface Team {
  teamName: string;
  teamId: string;
  role: string;
  email: string;
  agents: AdminAgent[];
}

const Header = () => {
  const { activeBotData, activeBotId, setActiveBotId } = useBotConfig();
  const { agents, adminEmail, clientData, setActiveTeamId } = useAdminStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isAllAgentsPage = location.pathname === "/admin/all-agents";
  const [hoveredTeam, setHoveredTeam] = useState<"my" | string | null>(null);

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

  const handleAgentSelect = (agentId: string, teamId: string) => {
    console.log("agentId", agentId);
    console.log("teamId", teamId);
    setActiveBotId(agentId);
    setActiveTeamId(teamId);
    setIsDropdownOpen(false);
    //To remove localStorage data of product in edit mode
    localStorage.removeItem("editingProduct");
    navigate("/admin/dashboard/overview");
  };

  // Helper to get selected agent and team
  const getSelectedAgentAndTeam = () => {
    // Check My Team
    const myAgent = agents?.find((a: AdminAgent) => a.agentId === activeBotId);
    if (myAgent) return { agent: myAgent, teamName: "My Team" };

    // Check Other Teams
    if (clientData?.otherTeams) {
      for (const team of clientData.otherTeams) {
        const agent = team.agents?.find(
          (a: AdminAgent) => a.agentId === activeBotId
        );
        if (agent) return { agent, teamName: team.teamName };
      }
    }
    return { agent: null, teamName: "" };
  };

  const selected = getSelectedAgentAndTeam();

  const renderAgentButton = (agent: AdminAgent, isSelected: boolean) => (
    <button
      key={agent.agentId}
      onClick={() => handleAgentSelect(agent.agentId, agent.teamId)}
      className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 rounded-md transition-colors duration-150 ${
        isSelected
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
      <span className="font-medium">{agent.name}</span>
      {isSelected && !isAllAgentsPage && (
        <span className="ml-auto text-xs text-green-200 font-semibold">
          Selected
        </span>
      )}
    </button>
  );

  return (
    <header
      className="bg-white relative border-b border-gray-200 shadow-lg z-[20]"
      style={{ backgroundColor: "#eaefff" }}
    >
      <div className="flex justify-between items-center px-6 py-2">
        <div
          className={`flex items-center   
          ${isAllAgentsPage ? "" : "ml-12  lg:ml-0"}
          `}
        >
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 bg-white border border-black px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <div className="absolute z-[-1] top-[3px] left-[3px] w-full h-full bg-white border border-black"></div>
              {selected.agent?.logo ? (
                <img
                  key={`${selected.agent.logo}?t=${Date.now()}`}
                  src={`${selected.agent.logo}?t=${Date.now()}`}
                  alt="Agent avatar"
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-500">
                    {selected.agent?.name?.charAt(0) || "A"}
                  </span>
                </div>
              )}
              <span className="hidden xs:block">
                {selected.agent
                  ? `${selected.teamName} - ${selected.agent.name}`
                  : isAllAgentsPage
                  ? "All Agents"
                  : "Select Agent"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            {isDropdownOpen && (
              <div
                className="absolute z-100 mt-2 w-[32rem] rounded-lg shadow-lg flex border border-gray-800"
                style={{ background: "black" }}
              >
                {/* Teams column */}
                <div
                  className="w-1/2 py-3 max-h-96 overflow-y-auto border-r border-gray-700 flex flex-col"
                  style={{ background: "black" }}
                >
                  <div
                    className={`px-4 py-2 font-semibold text-base cursor-pointer rounded-none flex items-center
                      ${
                        hoveredTeam === "my"
                          ? "bg-[#4b5cff] text-white"
                          : "text-white hover:bg-[#222]"
                      }
                    `}
                    onMouseEnter={() => setHoveredTeam("my")}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/admin/all-agents?team=my-team");
                    }}
                  >
                    <img
                      src="/assets/voice/coach.png"
                      className="w-6 h-6 rounded-full mr-2"
                      alt="My Team"
                    />
                    My Team
                  </div>
                  {clientData?.otherTeams?.map((team: Team) => (
                    <div
                      key={team.teamId}
                      className={`px-4 py-2 font-semibold text-base cursor-pointer rounded-none flex items-center
                        ${
                          hoveredTeam === team.teamId
                            ? "bg-[#4b5cff] text-white"
                            : "text-white hover:bg-[#222]"
                        }
                      `}
                      onMouseEnter={() => setHoveredTeam(team.teamId)}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate(`/admin/all-agents?team=${team.teamId}`);
                      }}
                    >
                      <img
                        src={"/assets/voice/coach.png"}
                        className="w-6 h-6 rounded-full mr-2"
                        alt={team.teamName}
                      />
                      {team.teamName}
                    </div>
                  ))}
                  <div className="border-t border-gray-700 my-2"></div>
                </div>

                {/* Agents column */}
                <div
                  className="w-1/2 py-3 max-h-96 overflow-y-auto flex flex-col"
                  style={{ background: "black" }}
                >
                  <div className="px-4 pb-2 font-semibold text-base text-white">
                    {hoveredTeam === "my"
                      ? "All Agents"
                      : clientData?.otherTeams?.find(
                          (t) => t.teamId === hoveredTeam
                        )?.teamName + " Agents"}
                  </div>
                  {(hoveredTeam === "my"
                    ? agents
                    : clientData?.otherTeams?.find(
                        (t) => t.teamId === hoveredTeam
                      )?.agents || []
                  ).map((agent: AdminAgent) => (
                    <button
                      key={agent.agentId}
                      onClick={() =>
                        handleAgentSelect(agent.agentId, agent.teamId)
                      }
                      className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 rounded-none
                        ${
                          agent.agentId === activeBotId
                            ? "bg-[#4b5cff] text-white"
                            : "text-white hover:bg-[#222]"
                        }
                      `}
                    >
                      <img
                        src={agent.logo || "/assets/voice/coach.png"}
                        className="w-6 h-6 rounded-full object-cover border border-white"
                        alt={agent.name}
                      />
                      <span className="font-medium">{agent.name}</span>
                    </button>
                  ))}
                  <div className="border-t border-gray-700 my-2"></div>
                  {/* <button
                    className="px-4 py-2 text-left text-sm text-white hover:bg-[#222] w-full"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/admin/dashboard/create-bot");
                    }}
                  >
                    + NEW AGENT
                  </button> */}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="">
          <div className="flex items-center space-x-2 ">
            <div className="truncate  text-xs text-black hyphens-auto hidden md:block">
              {adminEmail}
            </div>

            <div className="max:w-[100%]">
              {isAllAgentsPage ? (
                <div className="relative z-10">
                  <Button className="text-black font-semibold flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    <span className="hidden xs:flex">View Agent</span>
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <a
                    href={`https://Sayy.ai/${activeBotData?.username}`}
                    target="_blank"
                  >
                    <div className="relative inline-block">
                      <div className="relative inline-block">
                        <Button
                          disabled={!activeBotId}
                          className="relative bg-[#6aff97] text-black font-semibold px-4 py-2 border border-black flex items-center gap-2"
                        >
                          <Eye className="w-5 h-5" />
                          <span className="hidden xs:flex">View Agent</span>
                        </Button>
                      </div>
                    </div>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
