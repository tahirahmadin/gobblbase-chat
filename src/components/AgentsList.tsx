import React, { useEffect, useState } from "react";
import { Bot, Plus, Trash2 } from "lucide-react";
import { deleteAgent } from "../lib/serverActions";
import { useAdminStore } from "../store/useAdminStore";
import { useBotConfig } from "../store/useBotConfig";

interface AgentsListProps {
  onStartCreating?: () => void;
}

export default function AgentsList({ onStartCreating }: AgentsListProps) {
  const { agents, adminId, fetchAllAgents } = useAdminStore();
  const { activeBotId, setActiveBotId } = useBotConfig();
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (adminId) {
      fetchAllAgents();
    }
  }, [adminId, fetchAllAgents]);

  const handleDeleteAgent = async (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAgentToDelete(agentId);
  };

  const confirmDelete = async () => {
    if (!agentToDelete) return;

    try {
      await deleteAgent(agentToDelete);
      await fetchAllAgents();
      if (activeBotId === agentToDelete) {
        setActiveBotId(null);
      }
    } catch (error) {
      console.error("Failed to delete agent:", error);
    } finally {
      setAgentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setAgentToDelete(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Your Agents</h2>
        {onStartCreating && (
          <button
            onClick={onStartCreating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Agent
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <div
            key={agent.agentId}
            onClick={() => setActiveBotId(agent.agentId)}
            className={`relative bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-[1.02] border border-gray-100 ${
              activeBotId === agent.agentId
                ? "ring-2 ring-gray-900 shadow-lg"
                : "shadow-sm hover:shadow-md"
            }`}
          >
            <div className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {agent.logo ? (
                    <img
                      src={agent.logo}
                      alt={`${agent.name} logo`}
                      className="h-16 w-16 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-900 flex items-center justify-center shadow-sm">
                      <Bot className="h-8 w-8 text-gray-100" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 truncate">
                    {agent.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {agent.username
                      ? `@${agent.username}`
                      : `ID: ${agent.agentId}`}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={(e) => handleDeleteAgent(agent.agentId, e)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full shadow-sm"
              title="Delete agent"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {agentToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Agent
            </h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete this agent? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
