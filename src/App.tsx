import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Tabs from "./components/Tabs";
import FileUpload from "./components/FileUpload";
import Activity from "./components/Activity";
import Integration from "./components/Integration";
import Playground from "./components/Playground";
import AgentsList from "./components/AgentsList";
import { useUserStore } from "./store/useUserStore";
import { ArrowLeft } from "lucide-react";

function App() {
  const [activeTab, setActiveTab] = useState("create");
  const [isCreating, setIsCreating] = useState(false);
  const { activeAgentId, agents, isLoggedIn, setActiveAgentId } =
    useUserStore();

  // If not logged in, redirect to create tab
  useEffect(() => {
    if (!isLoggedIn) {
      setActiveTab("create");
    }
  }, [isLoggedIn]);

  const renderTabContent = () => {
    if (activeTab === "create") {
      // Always show AgentsList if no agent is selected
      if (!activeAgentId) {
        if (isCreating) {
          return (
            <div className="space-y-4">
              <button
                onClick={() => setIsCreating(false)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Agents
              </button>
              <FileUpload onCancel={() => setIsCreating(false)} />
            </div>
          );
        }
        return <AgentsList onStartCreating={() => setIsCreating(true)} />;
      }

      // If an agent is selected, find it and show Playground
      const agent = agents.find((a) => a.agentId === activeAgentId);
      if (agent) {
        return (
          <div className="space-y-4">
            <button
              onClick={() => setActiveAgentId(null)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Agents
            </button>
            <Playground agentId={activeAgentId} />
          </div>
        );
      }

      // Fallback to AgentsList if agent not found
      return <AgentsList onStartCreating={() => setIsCreating(true)} />;
    }

    switch (activeTab) {
      case "activity":
        return <Activity />;
      case "integrate":
        return <Integration />;
      case "settings":
        return <div className="p-4">Settings panel coming soon...</div>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderTabContent()}
      </main>
    </div>
  );
}

export default App;
