import React, { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import Tabs from "./components/Tabs";
import FileUpload from "./components/FileUpload";
import Activity from "./components/Activity";
import Integration from "./components/Integration";
import Playground from "./components/Playground";
import AgentsList from "./components/AgentsList";
import PublicChat from "./components/PublicChat";
import { useUserStore } from "./store/useUserStore";
import { ArrowLeft } from "lucide-react";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("playground");
  const [isCreating, setIsCreating] = useState(false);
  const { activeAgentId, agents, isLoggedIn, setActiveAgentId } =
    useUserStore();

  // If not logged in, redirect to create tab
  useEffect(() => {
    if (!isLoggedIn) {
      setActiveTab("playground");
    }
  }, [isLoggedIn]);

  const renderContent = () => {
    // If no agent is selected, show agents list
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

    // If an agent is selected, show tabs and their content
    const agent = agents.find((a) => a.agentId === activeAgentId);
    if (!agent) {
      return <AgentsList onStartCreating={() => setIsCreating(true)} />;
    }

    return (
      <div className="space-y-4">
        <button
          onClick={() => setActiveAgentId(null)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Agents
        </button>
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
        {renderTabContent()}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "playground":
        return activeAgentId ? <Playground agentId={activeAgentId} /> : null;
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chatbot/:agentId" element={<PublicChat />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
