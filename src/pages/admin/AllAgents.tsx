import React, { useState, useEffect } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import { AdminAgent } from "../../types";
import { useNavigate } from "react-router-dom";
import { useBotConfig } from "../../store/useBotConfig";
import { PERSONALITY_OPTIONS } from "../../utils/constants";
import {
  Delete,
  DeleteIcon,
  LucideDelete,
  Trash,
  Trash2,
  X,
} from "lucide-react";

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
  const { agents, totalAgents, deleteAgent, fetchAllAgents, isLoading } =
    useAdminStore();
  const { setActiveBotId, activeBotId } = useBotConfig();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleEdit = async (agentId: string) => {
    await setActiveBotId(agentId);
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
        <h2 className="text-xl font-bold">Total Agents: {totalAgents}</h2>

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {agents.map((agent: AdminAgent) => (
          <div
            key={agent.agentId}
            className="relative bg-[#eaefff] rounded-lg flex flex-col items-center px-8 py-6"
          >
            <div className="absolute top-2 right-2">
              <Trash2
                className="w-6 h-6 text-red-500 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(agent.agentId, agent.name || "Agent Name");
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
            <a href={`https://Sayy.ai/${agent.username}`} target="_blank">
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
                    onClick={() => handleEdit(agent.agentId)}
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
