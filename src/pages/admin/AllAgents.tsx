import React, { useState } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import { AdminAgent } from "../../types";
import { useNavigate } from "react-router-dom";
import { useBotConfig } from "../../store/useBotConfig";

const placeholderAvatar =
  "https://cdn-icons-png.flaticon.com/512/616/616408.png";

const AllAgents: React.FC = () => {
  const { agents, totalAgents, deleteAgent, fetchAllAgents, isLoading } =
    useAdminStore();
  const { setActiveBotId } = useBotConfig();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = async (agentId: string) => {
    await setActiveBotId(agentId);
    navigate("/admin/dashboard/profile");
  };

  const handleDelete = async (agentId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this agent? This action cannot be undone."
      )
    )
      return;
    setDeletingId(agentId);
    try {
      await deleteAgent(agentId);
      await fetchAllAgents();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Total Agents: {totalAgents}</h2>
        <button
          className="bg-green-400 hover:bg-green-500 text-black font-semibold px-4 py-2 rounded-lg shadow"
          onClick={() => navigate("/admin/dashboard/create-bot")}
          disabled={isLoading}
        >
          + NEW AGENT
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {agents.map((agent: AdminAgent) => (
          <div
            key={agent.agentId}
            className="bg-[#eaefff] rounded-lg shadow flex flex-col items-center p-6 border border-gray-200"
          >
            <img
              src={agent.logo || placeholderAvatar}
              alt="Agent Avatar"
              className="w-24 h-24 rounded-full mb-4 border-4 border-white shadow"
            />
            <div className="font-semibold text-lg mb-2 text-center">
              {agent.name || "Agent Name"}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow text-sm font-medium"
                onClick={() => handleEdit(agent.agentId)}
                disabled={isLoading || deletingId === agent.agentId}
              >
                EDIT
              </button>
              <button
                className="bg-white border border-gray-400 hover:bg-gray-100 text-gray-800 px-4 py-2 rounded shadow text-sm font-medium"
                onClick={() => handleDelete(agent.agentId)}
                disabled={isLoading || deletingId === agent.agentId}
              >
                {deletingId === agent.agentId ? "DELETING..." : "DELETE"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllAgents;
