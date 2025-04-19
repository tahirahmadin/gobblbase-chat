import React from "react";
import {
  Bot,
  Activity,
  Settings,
  Link,
  FileText,
  Briefcase,
} from "lucide-react";

interface Tab {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Tabs({ activeTab, setActiveTab }: TabsProps) {
  const tabs: Tab[] = [
    { id: "playground", name: "Playground", icon: <Bot className="h-5 w-5" /> },
    {
      id: "activity",
      name: "Activity",
      icon: <Activity className="h-5 w-5" />,
    },
    {
      id: "integration",
      name: "Integration",
      icon: <Link className="h-5 w-5" />,
    },
    {
      id: "services",
      name: "Services",
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      id: "settings",
      name: "Settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <nav className="space-y-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            flex items-center px-3 py-2 text-sm font-medium rounded-md w-full
            ${
              activeTab === tab.id
                ? "text-white bg-gray-800"
                : "text-gray-600 hover:bg-gray-50"
            }
          `}
        >
          <span
            className={`mr-3 ${
              activeTab === tab.id ? "text-white" : "text-gray-400"
            }`}
          >
            {tab.icon}
          </span>
          {tab.name}
        </button>
      ))}
    </nav>
  );
}
