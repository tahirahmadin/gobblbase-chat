import React, { useState, useEffect } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import { AdminAgent } from "../../types";
import { useNavigate, useLocation } from "react-router-dom";
import { useBotConfig } from "../../store/useBotConfig";
import { mainDomainUrl, PERSONALITY_OPTIONS } from "../../utils/constants";
import { ChevronDown, ChevronRight, Trash2, X } from "lucide-react";

const placeholderAvatar = "/assets/voice/expert.png";

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  agentName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  agentName: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-semibold mb-4">Delete Agent</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{agentName}</span>? This action cannot
          be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const AllAgents: React.FC = () => {
  const {
    agents,
    totalAgents,
    deleteAgent,
    fetchAllAgents,
    isLoading,
    clientData,
    activeTeamId,
    adminId,
    setActiveTeamId,
    refetchClientData,
  } = useAdminStore();
  const { setActiveBotId, activeBotId } = useBotConfig();
  const navigate = useNavigate();
  const location = useLocation();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  // Team dropdown state
  const [selectedTeam, setSelectedTeam] = useState<string>("my-team");
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false);

  // Sync selectedTeam with activeTeamId from store and URL params
  useEffect(() => {
    if (isUpdatingUrl) return; // Skip if we're updating URL programmatically

    const params = new URLSearchParams(location.search);
    const teamParam = params.get("team");

    // Priority 1: URL parameter
    if (teamParam) {
      setSelectedTeam(teamParam);
      return;
    }

    // Priority 2: activeTeamId from store
    if (activeTeamId) {
      // If activeTeamId is the adminId, it means "my-team"
      if (activeTeamId === adminId) {
        setSelectedTeam("my-team");
      } else {
        // Check if activeTeamId matches any other team
        const team = clientData?.otherTeams?.find(
          (t) => t.teamId === activeTeamId
        );
        if (team) {
          setSelectedTeam(activeTeamId);
        } else {
          setSelectedTeam("my-team");
        }
      }
      return;
    }

    // Priority 3: Default to "my-team"
    setSelectedTeam("my-team");
  }, [location.search, activeTeamId, adminId, clientData, isUpdatingUrl]);

  // Update URL when selectedTeam changes (but not from URL params)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentTeamParam = params.get("team");

    // Only update URL if it's different from current URL param
    if (currentTeamParam !== selectedTeam) {
      setIsUpdatingUrl(true);
      const newParams = new URLSearchParams(location.search);
      if (selectedTeam === "my-team") {
        newParams.delete("team");
      } else {
        newParams.set("team", selectedTeam);
      }

      const newUrl = `${location.pathname}${
        newParams.toString() ? `?${newParams.toString()}` : ""
      }`;
      navigate(newUrl, { replace: true });

      // Reset the flag after a short delay
      setTimeout(() => setIsUpdatingUrl(false), 100);
    }
  }, [selectedTeam, location.search, location.pathname, navigate]);

  // Build dropdown options
  const teamOptions = React.useMemo(() => {
    if (!clientData) return [{ label: "My Team", value: "my-team" }];
    return [
      { label: "My Team", value: "my-team" },
      ...(clientData.otherTeams || []).map((team) => ({
        label: team.teamName,
        value: team.teamId,
      })),
    ];
  }, [clientData]);

  // Get agents for selected team
  const displayedAgents = React.useMemo(() => {
    if (selectedTeam === "my-team") return agents;
    const team = clientData?.otherTeams?.find((t) => t.teamId === selectedTeam);
    return team?.agents || [];
  }, [selectedTeam, agents, clientData]);

  const handleEdit = async (agentId: string, isQueryable: boolean) => {
    await setActiveBotId(agentId);
    if (isQueryable) {
      navigate("/admin/dashboard/overview");
    } else {
      navigate("/admin/dashboard/profile");
    }
  };

  const handleDeleteClick = (agentId: string, agentName: string) => {
    setAgentToDelete({ id: agentId, name: agentName });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!agentToDelete) return;

    try {
      await deleteAgent(agentToDelete.id);
      await fetchAllAgents();
      refetchClientData();
      if (activeBotId === agentToDelete.id) {
        setActiveBotId(null);
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setAgentToDelete(null);
    }
  };

  const getPersonalityImage = (agent: AdminAgent) => {
    if (agent.logo) return agent.logo;
    if (agent.personalityType?.name) {
      const personality = PERSONALITY_OPTIONS.find(
        (p) => p.title === agent.personalityType?.name
      );
      if (personality) return personality.image;
    }
    return placeholderAvatar;
  };

  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".team-dropdown")) {
        setIsTeamDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex flex-col items-start sm:flex-row sm:justify-between gap-4 mb-6">
        {/* Team filter dropdown */}
        {/* <div className="flex items-center gap-2 team-dropdown">
          <label htmlFor="team-select" className="font-medium text-lg mr-2">
            Team
          </label>

          <div className="relative w-40 lg:w-48 flex items-center">
            <button
              onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
              className="truncate whitespace-nowrap w-full px-3 py-2 border border-[#7D7D7D] text-sm focus:outline-none rounded-sm flex justify-between items-center bg-white"
            >
              {teamOptions.find((t) => t.value === selectedTeam)?.label ||
                "Select Team"}
            </button>
            <div className="icon bg-[#AEB8FF] px-2 py-2 border border-[#7D7D7D] border-l-0">
              <ChevronDown
                size={20}
                className={`text-[#000000] stroke-[3px] transition-transform ${
                  isTeamDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {isTeamDropdownOpen && (
              <div className="absolute z-10 mt-1 top-8 w-full bg-white border border-[#7D7D7D] shadow-sm rounded-sm">
                {teamOptions.map((team) => (
                  <button
                    key={team.value}
                    onClick={() => {
                      setSelectedTeam(team.value);
                      setIsTeamDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      selectedTeam === team.value ? "bg-[#AEB8FF]" : ""
                    }`}
                  >
                    {team.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div> */}
        <div className="whitespace-nowrap flex items-center gap-4">
          <h2 className="text-xl font-semifold">
            Total Agents: {displayedAgents.length}
          </h2>
        </div>
      </div>
      {displayedAgents.length === 0 && (
        <div className="mt-24 px-6 py-6 md:px-12 min-h-[35vh] flex flex-col-reverse items-center md:flex-row w-fit md:mx-auto md:w-[80%]lg:w-[60%] rounded-[10px] bg-gradient-to-r from-[#EAEFFF] to-[#AEB8FF] shadow-[0_8px_8px_0_rgba(0,0,0,0.4)]">
          <div className="left-content w-[100%] flex flex-col justify-center py-12">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Active AI-mployees
            </h3>
            <p className="text-black mb-6">
              Create an AI agent to start automating your customer interactions
              and growing your business.
            </p>
            <div className="relative z-10 w-fit mt-4">
              <div className="absolute top-1 left-1 w-full h-full bg-[#6AFF97] border border-black -z-10"></div>
              <button
                onClick={() => navigate("/admin/dashboard/create-bot")}
                disabled={isLoading}
                className="flex items-center justify-between min-w-[200px]  px-2 py-2 bg-[#6AFF97] text-black font-semibold border border-black relative"
              >
                <span className="font-[500]">Create New Agent</span>
                <span>
                  <ChevronRight
                    className="w-4 h-4 text-black"
                    style={{ strokeWidth: "3px" }}
                  />
                </span>
              </button>
            </div>
          </div>
          <div className="right-img">
            <img
              src="/assets/no-agent-goobl.svg"
              width={"100%"}
              height={"100%"}
              alt=""
            />
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {displayedAgents.length > 0 &&
          displayedAgents.map((agent: AdminAgent) => (
            <div
              key={agent.agentId}
              className="relative bg-[#eaefff] max-w-[300px] rounded-lg flex flex-col items-center px-4 py-6"
            >
              <div className="absolute top-2 right-2">
                <Trash2
                  className="w-6 h-6 text-red-500 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(
                      agent.agentId,
                      agent.name || "Agent Name"
                    );
                  }}
                />
              </div>
              <img
                src={getPersonalityImage(agent)}
                alt="Agent Avatar"
                className="w-24 h-24 rounded-full mb-4 border-4 border-white shadow"
              />
              <div className="font-semibold text-lg text-center">
                {agent.name || "Agent Name"}
              </div>
              <a href={`${mainDomainUrl}/${agent.username}`} target="_blank">
                <div className="text-sm text-blue-500 mb-2">Visit agent</div>
              </a>
              <div className="flex gap-2 mt-2">
                <div className="relative inline-block">
                  <div className="absolute top-1 left-1 w-full h-full bg-[#AEB8FF] rounded"></div>
                  <div className="relative inline-block">
                    {/* Bottom layer for shadow effect */}
                    <div className="absolute top-1 left-1 w-full h-full border border-black "></div>
                    {/* Main button */}
                    <button
                      onClick={() =>
                        handleEdit(agent.agentId, agent.isQueryable)
                      }
                      disabled={isLoading || deletingId === agent.agentId}
                      className="relative bg-[#AEB8FF] text-black font-regular px-4 py-2 border border-black text-sm"
                    >
                      SELECT AGENT
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setAgentToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        agentName={agentToDelete?.name || ""}
      />
    </div>
  );
};

export default AllAgents;
