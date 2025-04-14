import React, { useEffect } from "react";
import { Bot, Plus } from "lucide-react";
import { useUserStore } from "../store/useUserStore";

interface AgentsListProps {
  onStartCreating: () => void;
}

export default function AgentsList({ onStartCreating }: AgentsListProps) {
  const {
    agents,
    activeAgentId,
    setActiveAgentId,
    clientId,
    fetchAndSetAgents,
  } = useUserStore();

  useEffect(() => {
    if (clientId) {
      fetchAndSetAgents();
    }
  }, [clientId, fetchAndSetAgents]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Your Agents</h2>
        <button
          onClick={onStartCreating}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create New Agent
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <div
            key={agent.agentId}
            onClick={() => setActiveAgentId(agent.agentId)}
            className={`relative rounded-lg border p-6 cursor-pointer transition-all duration-200 ${
              activeAgentId === agent.agentId
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {agent.name}
                </h3>
                <p className="text-sm text-gray-500">ID: {agent.agentId}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
