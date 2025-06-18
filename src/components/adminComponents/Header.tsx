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
    background: #cdcdcd;
    border: 1px solid #7d7d7d;
    color: #7d7d7d;
    cursor: not-allowed;
  }
  &:disabled::before {
    background: #cdcdcd;
    border: 1px solid #7d7d7d;
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
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");

  //Handeling agentDetails refresh when change trigger
  const hook1 = useServerHook({ initHook: true });

  // Helper to get teams
  const allTeams: Team[] = useMemo(() => {
    const myTeam: Team = {
      teamName: "My Team",
      teamId: "my-team",
      role: "owner",
      email: adminEmail || "",
      agents: agents || [],
    };
    return [myTeam, ...(clientData?.otherTeams || [])];
  }, [agents, clientData, adminEmail, activeBotId]);

  const selectedTeam = allTeams.find((t) => t.teamId === selectedTeamId);
  const selectedAgent =
    selectedTeam?.agents.find((a) => a.agentId === activeBotId) || null;

  // Simplified team selection logic
  useEffect(() => {
    if (allTeams.length === 0) return;

    const urlParams = new URLSearchParams(window.location.search);
    const teamParam = urlParams.get("team");

    // Priority 1: URL parameter
    if (teamParam && allTeams.some((team) => team.teamId === teamParam)) {
      setSelectedTeamId(teamParam);
      return;
    }

    // Priority 2: activeTeamId from store
    if (activeTeamId) {
      const matchingTeam = allTeams.find(
        (team) =>
          team.teamId === activeTeamId ||
          (team.teamId === "my-team" && activeTeamId === adminId)
      );
      if (matchingTeam) {
        setSelectedTeamId(matchingTeam.teamId);
        return;
      }
    }

    // Priority 3: Default to first team
    if (selectedTeamId === "" && allTeams.length > 0) {
      setSelectedTeamId(allTeams[0].teamId);
    }
  }, [allTeams, activeTeamId, adminId, selectedTeamId]);

  // Initialize team selection when admin state changes
  useEffect(() => {
    if (
      isAdminLoggedIn &&
      adminId &&
      allTeams.length > 0 &&
      selectedTeamId === ""
    ) {
      // Default to "my-team" for logged in admin
      setSelectedTeamId("my-team");
    }
  }, [isAdminLoggedIn, adminId, allTeams, selectedTeamId]);

  // Handle clicking outside dropdown to close it
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTeamSelect = (teamId: string) => {
    // Validate that the team exists
    const teamExists = allTeams.some((team) => team.teamId === teamId);
    if (!teamExists) {
      console.error("Team not found:", teamId);
      return;
    }

    setSelectedTeamId(teamId);
    const newActiveTeamId = teamId === "my-team" ? adminId : teamId;

    // Update the store
    setActiveTeamId(newActiveTeamId);

    // Reset agent selection when changing teams
    setActiveBotId(null);

    // Close dropdown
    setIsDropdownOpen(false);

    // Navigate to all agents page with team parameter
    navigate(`/admin/all-agents?team=${teamId}`);
  };

  const handleAgentSelect = (agentId: string, teamId: string) => {
    // Set the agent
    setActiveBotId(agentId);

    // Update team if needed
    const newActiveTeamId = teamId === "my-team" ? adminId : teamId;
    if (activeTeamId !== newActiveTeamId) {
      setActiveTeamId(newActiveTeamId);
    }

    // Close dropdown
    setIsDropdownOpen(false);

    // Clear any editing state
    localStorage.removeItem("editingProduct");

    // Navigate to overview
    navigate("/admin/dashboard/overview");
  };

  return (
    <header
      className="bg-white relative border-b border-gray-200 shadow-lg z-[30]"
      style={{ backgroundColor: "#eaefff" }}
    >
      <div className="flex justify-between items-center px-6 py-2">
        <div
          className={`flex items-center gap-4
          ${isAllAgentsPage ? "ml-12 lg:ml-0" : "ml-12 lg:ml-0"}
          `}
        >
          <div className="" ref={dropdownRef}>
            <div className="flex items-center">
              {/* Team Dropdown */}
              <div className="relative mr-4 z-[100]">
                <button
                  onClick={() =>
                    setIsDropdownOpen(
                      isDropdownOpen === "team" ? false : "team"
                    )
                  }
                  className={`w-28 md:w-44 truncate whitespace-nowrap flex items-center justify-between space-x-2 px-2 py-2 text-[14px] font-medium text-black hover:bg-[#92A3FF]
                      ${isDropdownOpen ? "bg-[#92A3FF]" : "bg-none"}
                    `}
                >
                  <span>
                    {selectedTeam ? selectedTeam.teamName : "Select Team"}
                  </span>
                  {isDropdownOpen ? (
                    <ChevronUp
                      style={{ strokeWidth: "3px" }}
                      className="w-4 h-4 text-black"
                    />
                  ) : (
                    <ChevronDown
                      style={{ strokeWidth: "3px" }}
                      className="w-4 h-4 text-black"
                    />
                  )}
                </button>
                {isDropdownOpen === "team" && (
                  <div className="w-28 md:w-44 truncate whitespace-nowrap absolute z-[100] top-[46px] pb-4 shadow-lg bg-[#000]">
                    <h1 className="team-heading px-3  py-2 text-[12px] text-white">
                      Teams
                    </h1>
                    {allTeams.map((team) => (
                      <div
                        key={team.teamId}
                        className={`px-2 mx-3 py-2 text-[12px] text-white cursor-pointer hover:bg-[#4D65FF] ${
                          selectedTeamId === team.teamId ? "bg-[#4D65FF]" : ""
                        }`}
                        onClick={() => handleTeamSelect(team.teamId)}
                      >
                        {team.teamName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Agent Dropdown */}
              <div className="sm:relative z-[100]">
                <button
                  onClick={() =>
                    setIsDropdownOpen(
                      isDropdownOpen === "agent" ? false : "agent"
                    )
                  }
                  className={`w-16 md:w-44 truncate whitespace-nowrap flex items-center justify-between space-x-2 px-2 py-2 text-[14px] font-medium text-black hover:bg-[#92A3FF]
                      ${isDropdownOpen ? "bg-[#92A3FF]" : "bg-none"}
                    `}
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
                  <span className="hidden md:block">
                    {selectedAgent ? selectedAgent.name : "Select Agent"}
                  </span>
                  {isDropdownOpen ? (
                    <ChevronUp
                      style={{ strokeWidth: "3px" }}
                      className="w-4 h-4 text-black"
                    />
                  ) : (
                    <ChevronDown
                      style={{ strokeWidth: "3px" }}
                      className="w-4 h-4 text-black"
                    />
                  )}
                </button>
                {isDropdownOpen === "agent" && selectedTeam && (
                  <div className="min-w-[100%] px-4 sm:px-0 xs:w-44 truncate whitespace-nowrap absolute z-[40] top-[58px] sm:top-[48px] left-0 shadow-lg bg-[#000]">
                    <h1 className="team-heading px-3 py-2 text-[12px] text-white">
                      Agent
                    </h1>
                    {selectedTeam.agents.map((agent: AdminAgent) => (
                      <div
                        key={agent.agentId}
                        className={`flex items-center px-2 mx-3 py-2 text-[12px] text-white cursor-pointer hover:bg-[#4D65FF] ${
                          agent.agentId === activeBotId ? "bg-[#4D65FF]" : ""
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
                      className="border-t border-white mt-4 flex items-center gap-2 py-2 px-4 cursor-pointer hover:bg-[#4D65FF]"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/admin/dashboard/create-bot");
                      }}
                    >
                      <Plus className="w-3 h-3 text-white" />
                      <span className="para-font text-[12px] text-white">
                        NEW AGENT
                      </span>
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
                <div className="relative hiddden xs:block">
                  {/* Bottom layer for shadow effect */}
                  <div className="absolute  bg-[#6aff97]  top-[3px] left-[3px] w-full h-full border border-black "></div>
                  {/* Main button */}
                  <button
                    onClick={() => navigate("/admin/dashboard/create-bot")}
                    className="relative bg-[#6aff97] text-black font-normal px-4 py-1 border border-black flex items-center gap-1"
                  >
                    <span className="whitespace-nowrap">+ NEW </span>

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
