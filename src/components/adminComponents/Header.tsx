import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, ChevronUp, Eye, Plus } from "lucide-react";
import { useBotConfig } from "../../store/useBotConfig";
import { useAdminStore } from "../../store/useAdminStore";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useServerHook } from "../../hooks/useServerHook";
import styled from "styled-components";
import { AdminAgent } from "../../types";
import { mainDomainUrl } from "../../utils/constants";

const Button = styled.button`
  position: relative;
  background: #6aff97;
  padding: 0.6vh 1vw;
  border: 1px solid black;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 15px);
  font-weight: 500;
  font-family: "DM Sans", sans-serif;
  &::before {
    content: "";
    position: absolute;
    top: 4px;
    right: -4px;
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
  const {
    agents,
    adminEmail,
    clientData,
    setActiveTeamId,
    isAdminLoggedIn,
    activeTeamId,
  } = useAdminStore();
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isAllAgentsPage = location.pathname === "/admin/all-agents";
  const [hoveredTeam, setHoveredTeam] = useState<"my" | string | null>(null);

  //Handeling agentDetails refresh when change trigger
  const hook1 = useServerHook({ initHook: true });

  useEffect(() => {
    if (!isTeamDropdownOpen) return;
    if (!isAgentDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsTeamDropdownOpen(false);
        setIsAgentDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isTeamDropdownOpen, isAgentDropdownOpen]);

  useEffect(() => {
    if (!activeBotId && isAdminLoggedIn && activeTeamId) {
      navigate("/admin/all-agents");
    }
  }, [activeBotId, isAdminLoggedIn, activeTeamId]);

  const handleAgentSelect = (agentId: string, teamId: string) => {
    console.log("agentId", agentId);
    console.log("teamId", teamId);
    setActiveBotId(agentId);
    setActiveTeamId(teamId);
    setIsAgentDropdownOpen(false);
    setIsTeamDropdownOpen(false);
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
  const [hoveredTeamOffsetY, setHoveredTeamOffsetY] = useState<number>(0);

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
          className={`flex items-center    gap-4
          ${isAllAgentsPage ? "" : "ml-12  lg:ml-0"}
          `}
        >
          {/* team dropdown  */}
          <div className={`relative w-full ${isTeamDropdownOpen ? "bg-[#92A3FF]" : "bg-none"}`} ref={dropdownRef}>
            <button
              onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
              className={` flex w-44 items-center justify-between gap-4 px-2 py-2 text-sm font-medium text-black
                    
                `}
            >
              <span className="hidden xs:block">
                {/* {selected.agent
                  ? `${selected.teamName} - ${selected.agent.name}`
                  : isAllAgentsPage
                  ? "All Agents"
                  : "Select Agent"} */}
                Team Name
              </span>
              {
                isTeamDropdownOpen ? (
                  <ChevronUp style={{strokeWidth: "3px"}} className="w-4 h-4 text-black" />
                ) : (
                  <ChevronDown style={{strokeWidth: "3px"}} className="w-4 h-4 text-black" />
                )
              }
              
            </button>
            {isTeamDropdownOpen && (
              <div
                className=" w-44 absolute min-w-fit z-[10] mt-2 shadow-lg flex flex-col md:flex-row"
                style={{ background: "#000" }}
              >
                {/* Teams column */}
                <div className="w-full whitespace-nowrap py-3 px-2 max-h-96 overflow-none flex flex-col shadow-[0_8px_8px_0_rgba(0,0,0,0.25)] z-20">
                  <div
                    className={`para-font px-2 py-2 font-normal text-[14px] cursor-pointer rounded-none flex items-center
                      ${
                        hoveredTeam === "my"
                          ? "bg-[#4D65FF] text-white"
                          : "text-white hover:bg-[#222]"
                      }
                    `}
                    onMouseEnter={(e) => {
                      setHoveredTeam("my");
                      setHoveredTeamOffsetY(e.currentTarget.offsetTop);
                    }}
                    onClick={() => {
                      setIsTeamDropdownOpen(false);
                      navigate("/admin/all-agents?team=my-team");
                    }}
                  >
                    My Team
                  </div>
                  {clientData?.otherTeams?.map((team: Team) => (
                    <div
                      key={team.teamId}
                      className={`para-font px-2 py-2 mb-4 font-normal text-[14px] cursor-pointer flex items-center
                        ${
                          hoveredTeam === team.teamId
                            ? "bg-[#4D65FF] text-white"
                            : "text-white hover:bg-[#4D65FF] rounded-none"
                        }
                      `}
                      onMouseEnter={(e) => {
                        setHoveredTeam(team.teamId);
                        setHoveredTeamOffsetY(e.currentTarget.offsetTop);
                      }}
                      onClick={() => {
                        setIsTeamDropdownOpen(false);
                        navigate(`/admin/all-agents?team=${team.teamId}`);
                      }}
                    >
                      {team.teamName}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* agent dropdown  */}
          <div  className={`relative w-full ${isAgentDropdownOpen ? "bg-[#92A3FF]" : "bg-none"}`} ref={dropdownRef}>
            <button
              onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
              className={` flex w-44 items-center justify-between gap-4 px-2 py-2 text-sm font-medium text-black
                        `}
            >
              <span className="hidden xs:block">Agent Name</span>
              {
                isAgentDropdownOpen ? (
                  <ChevronUp style={{strokeWidth: "3px"}} className="w-4 h-4 text-black" />
                ) : (
                  <ChevronDown style={{strokeWidth: "3px"}} className="w-4 h-4 text-black" />
                )
              }
            </button>
            {isAgentDropdownOpen && (
              <div
                className="w-44 absolute z-[10] mt-2 shadow-lg flex flex-col md:flex-row"
                style={{ background: "#000" }}
              >
                <div className="w-full whitespace-nowrap py-3 px-2 max-h-96 overflow-y-auto flex flex-col shadow-[0_8px_8px_0_rgba(0,0,0,0.25)] z-20">
                  <div className="px-2 pb-2 font-semibold text-base text-white">
                    {hoveredTeam === null
                      ? "Agents"
                      : hoveredTeam === "my"
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
                      className={`w-full text-left px-2 py-2 text-sm flex items-center space-x-2 
                          ${
                            agent.agentId === activeBotId
                              ? "bg-[#4D65FF] text-white"
                              : "text-white hover:bg-[#4D65FF] rounded-none"
                          }`}
                    >
                      <img
                        src={agent.logo || "/assets/voice/coach.png"}
                        className="w-6 h-6 rounded-full object-cover border border-white"
                        alt={agent.name}
                      />
                      <span className="font-medium">{agent.name}</span>
                    </button>
                  ))}
                  <div className="border-t mt-4 border-gray-700 flex items-center gap-2 pt-2 ">
                    <span>
                      <Plus className="w-4 h-4"></Plus>{" "}
                    </span>
                    <span className="para-font">NEW TEAM</span>
                  </div>
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
                <div className="relative">
                  {/* Bottom layer for shadow effect */}
                  <div className="absolute  bg-[#6aff97]  top-[3px] left-[3px] w-full h-full border border-black "></div>
                  {/* Main button */}
                  <button
                    onClick={() => navigate("/admin/dashboard/create-bot")}
                    className="relative bg-[#6aff97] text-black font-normal px-4 py-1 border border-black flex items-center gap-1"
                  >
                    <span>+ NEW </span>

                    <span className="hidden sm:block"> AGENT </span>
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <a
                    href={`${mainDomainUrl}/${activeBotData?.username}`}
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
