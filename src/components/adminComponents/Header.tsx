import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, Eye, Plus } from "lucide-react";
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
    adminId,
  } = useAdminStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState<
    false | "team" | "agent"
  >(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isAllAgentsPage = location.pathname === "/admin/all-agents";
  const [hoveredTeam, setHoveredTeam] = useState<"my" | string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");

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

  // useEffect(() => {
  //   if (!activeBotId && isAdminLoggedIn && activeTeamId) {
  //     navigate("/admin/all-agents");
  //   }
  // }, [activeBotId, isAdminLoggedIn, activeTeamId]);

  useEffect(() => {
    if (activeBotId && activeBotData && isAdminLoggedIn && activeTeamId) {
      if (activeBotData.isQueryable) {
        navigate("/admin/dashboard/overview");
      } else {
        navigate("/admin/dashboard/profile");
      }
    }
  }, [activeBotId, activeBotData, isAdminLoggedIn, activeTeamId]);

  // Helper to get teams
  const allTeams: Team[] = useMemo(() => {
    const myTeam: Team = {
      teamName: "My Team",
      teamId: "my-team",
      role: "owner",
      email: adminEmail,
      agents: agents || [],
    };
    return [myTeam, ...(clientData?.otherTeams || [])];
  }, [agents, clientData, adminEmail]);

  // Set default selected team on mount or when teams change
  useEffect(() => {
    if (selectedTeamId === "" && allTeams.length > 0) {
      let tid = allTeams[0].teamId;
      setSelectedTeamId(tid ? tid : "");
    }
  }, [allTeams, selectedTeamId]);

  const selectedTeam = allTeams.find((t) => t.teamId === selectedTeamId);
  const selectedAgent =
    selectedTeam?.agents.find((a) => a.agentId === activeBotId) || null;

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeamId(teamId);
    setActiveTeamId(teamId === "my-team" ? adminId : teamId);
    setActiveBotId(""); // Reset agent selection
    setIsDropdownOpen(false);
    navigate(`/admin/all-agents?team=${teamId}`);
  };

  const handleAgentSelect = (agentId: string, teamId: string) => {
    setActiveBotId(agentId);
    setActiveTeamId(teamId === "my-team" ? adminId : teamId);
    setIsDropdownOpen(false);
    localStorage.removeItem("editingProduct");
    navigate("/admin/dashboard/overview");
  };

  const [hoveredTeamOffsetY, setHoveredTeamOffsetY] = useState<number>(0);

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
            <div className="flex items-center">
              {/* Team Dropdown */}
              <div className="relative mr-4">
                <button
                  onClick={() =>
                    setIsDropdownOpen(
                      isDropdownOpen === "team" ? false : "team"
                    )
                  }
                  className="flex items-center space-x-2 bg-white border border-black px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <span>
                    {selectedTeam ? selectedTeam.teamName : "Select Team"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                {isDropdownOpen === "team" && (
                  <div className="absolute z-[10] mt-2 w-48 shadow-lg bg-[#EAEFFF]">
                    {allTeams.map((team) => (
                      <div
                        key={team.teamId}
                        className={`px-4 py-2 cursor-pointer hover:bg-[#CEFFDC] ${
                          selectedTeamId === team.teamId ? "bg-[#CEFFDC]" : ""
                        }`}
                        onClick={() => handleTeamSelect(team.teamId)}
                      >
                        <img
                          src={"/assets/voice/coach.png"}
                          className="w-6 h-6 rounded-full mr-2 inline-block"
                          alt={team.teamName}
                        />
                        {team.teamName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Agent Dropdown */}
              <div className="relative">
                <button
                  onClick={() =>
                    setIsDropdownOpen(
                      isDropdownOpen === "agent" ? false : "agent"
                    )
                  }
                  className="flex items-center space-x-2 bg-white border border-black px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={!selectedTeam}
                >
                  {selectedAgent?.logo ? (
                    <img
                      key={`${selectedAgent.logo}?t=${Date.now()}`}
                      src={`${selectedAgent.logo}?t=${Date.now()}`}
                      alt="Agent avatar"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">
                        {selectedAgent?.name?.charAt(0) || "A"}
                      </span>
                    </div>
                  )}
                  <span>
                    {selectedAgent ? selectedAgent.name : "Select Agent"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                {isDropdownOpen === "agent" && selectedTeam && (
                  <div className="absolute z-[10] mt-2 w-60 shadow-lg bg-[#EAEFFF]">
                    {selectedTeam.agents.map((agent: AdminAgent) => (
                      <div
                        key={agent.agentId}
                        className={`px-4 py-2 cursor-pointer flex items-center hover:bg-[#CEFFDC] ${
                          agent.agentId === activeBotId ? "bg-[#CEFFDC]" : ""
                        }`}
                        onClick={() =>
                          handleAgentSelect(agent.agentId, selectedTeam.teamId)
                        }
                      >
                        <img
                          src={agent.logo || "/assets/voice/coach.png"}
                          className="w-6 h-6 rounded-full object-cover border border-white mr-2"
                          alt={agent.name}
                        />
                        <span className="font-medium">{agent.name}</span>
                      </div>
                    ))}
                    <div
                      className="border-t border-gray-700 flex items-center gap-2 pt-2 px-4 cursor-pointer hover:bg-[#CEFFDC]"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/admin/dashboard/create-bot");
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="para-font">NEW AGENT</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
