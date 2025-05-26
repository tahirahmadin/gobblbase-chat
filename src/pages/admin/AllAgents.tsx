import React, { useState } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import { AdminAgent } from "../../types";
import { useNavigate } from "react-router-dom";
import { useBotConfig } from "../../store/useBotConfig";
import { PERSONALITY_OPTIONS } from "../../utils/constants";

const placeholderAvatar = "/assets/voice/expert.png";

const AllAgents: React.FC = () => {
  const { agents, totalAgents, deleteAgent, fetchAllAgents, isLoading } =
    useAdminStore();
  const { setActiveBotId } = useBotConfig();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleEdit = async (agentId: string) => {
    await setActiveBotId(agentId);
    navigate("/admin/dashboard/profile");
  };

  const handleDelete = async (agentId: string) => {
    setDeletingId(agentId);
    try {
      await deleteAgent(agentId);
      await fetchAllAgents();
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
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
            className="bg-[#eaefff] rounded-lg flex flex-col items-center px-8 py-6"
          >
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
                    EDIT
                  </button>
                </div>
              </div>

              <div className="relative inline-block">
                <div className="absolute top-1 left-1 w-full h-full bg-[#ffffff] rounded"></div>
                <div className="relative inline-block">
                  {/* Bottom layer for shadow effect */}
                  <div className="absolute top-1 left-1 w-full h-full border border-black "></div>

                  {/* Main button */}
                  <button
                    onClick={() => setPendingDeleteId(agent.agentId)}
                    disabled={isLoading || deletingId === agent.agentId}
                    className="relative bg-[#ffffff] text-black font-regular px-4 py-2 border border-black text-sm"
                  >
                    {deletingId === agent.agentId ? "DELETING..." : "DELETE"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {pendingDeleteId && (
        <div className="border border-red-400 p-6 rounded mt-8">
          <h3 className="text-black mb-2 text-md font-semibold">
            Warning: Permanent Deletion
          </h3>
          <p className="mb-4 text-black text-sm">
            Deleting your agent will permanently remove all related data and
            configurations. This action is irreversible.
            <br />
            Are you certain you want to proceed with deletion?
          </p>

          <div className="flex flex-row justify-end gap-2">
            <div className="relative inline-block">
              <div className="absolute top-1 left-1 w-full h-full bg-red-500 rounded"></div>
              <div className="relative inline-block">
                {/* Bottom layer for shadow effect */}
                <div className="absolute top-1 left-1 w-full h-full border border-black "></div>

                {/* Main button */}
                <button
                  onClick={async () => {
                    if (pendingDeleteId) {
                      await handleDelete(pendingDeleteId);
                    }
                  }}
                  disabled={isLoading || deletingId === pendingDeleteId}
                  className="relative bg-red-500 text-black font-semibold px-4 py-2 border border-black"
                >
                  {deletingId === pendingDeleteId
                    ? "DELETING..."
                    : "DELETE AGENT"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAgents;
