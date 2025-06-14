import React, { useState, useEffect } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import { AdminAgent } from "../../types";
import { useNavigate, useLocation } from "react-router-dom";
import { useBotConfig } from "../../store/useBotConfig";
import { mainDomainUrl, PERSONALITY_OPTIONS } from "../../utils/constants";
import { Trash2, X } from "lucide-react";

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
    // activeTeamId, // not needed for dropdown logic now
    // setActiveTeamId,
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

  // On mount, set selectedTeam from query param if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const teamParam = params.get("team");
    if (teamParam) setSelectedTeam(teamParam);
  }, [location.search]);

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

  const handleEdit = async (agentId: string, teamId: string) => {
    await setActiveBotId(agentId);
    setActiveTeamId(teamId);
    navigate("/admin/dashboard/overview");
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

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        {/* Team filter dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="team-select" className="font-medium text-lg mr-2">
            Team
          </label>
          <div className="relative">
            <div className="absolute top-1 left-1 w-full h-full bg-[#6AFF97] rounded-md"></div>
            <select
              id="team-select"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="relative px-4 py-2 bg-white border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#6AFF97] appearance-none cursor-pointer min-w-[180px]"
            >
              {teamOptions.map((team) => (
                <option key={team.value} value={team.value}>
                  {team.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">
            Total Agents: {displayedAgents.length}
          </h2>

          <div className="relative inline-block">
            <div className="absolute top-1 left-1 w-full h-full bg-[#6aff97] rounded"></div>
            <div className="relative inline-block">
              {/* Bottom layer for shadow effect */}
              <div className="absolute top-1 left-1 w-full h-full border border-black "></div>
              {/* Main button */}
              <button
                onClick={() => navigate("/admin/dashboard/create-bot")}
                disabled={isLoading}
                className="relative bg-[#6aff97] text-black font-semibold px-4 py-2 border border-black"
              >
                + NEW AGENT
              </button>
            </div>
          </div>
        </div>
      </div>
      {displayedAgents.length === 0 && (
        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex flex-col items-center justify-center py-12 max-w-[400px]">
            <div className="w-24 h-24 mb-6 relative">
              <div className="absolute inset-0 bg-[#D4DEFF] rounded-full border-2 border-black"></div>
              <div className="absolute inset-2 bg-white rounded-full border-2 border-black flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Agents Found
            </h3>
            <p className="text-gray-600 text-center  mb-6">
              Get started by creating your first AI agent. They'll help automate
              your tasks and boost your productivity.
            </p>
            <button
              onClick={() => navigate("/admin/dashboard/create-bot")}
              disabled={isLoading}
              className="px-6 py-3 bg-[#6AFF97] text-black font-semibold rounded-full border-2 border-black hover:bg-[#5AEF87] transition-colors duration-200 relative"
            >
              <div className="absolute top-1 left-1 w-full h-full bg-black rounded-full -z-10"></div>
              Create Your First Agent
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {displayedAgents.length > 0 &&
          displayedAgents.map((agent: AdminAgent) => (
            <div
              key={agent.agentId}
              className="relative bg-[#eaefff] rounded-lg flex flex-col items-center px-8 py-6"
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
                      onClick={() => handleEdit(agent.agentId, agent.teamId)}
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
