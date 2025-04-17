import React from "react";
import { MessageSquare, Activity, Link, Settings, Zap } from "lucide-react";

interface Tab {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface TabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function Tabs({ activeTab, onTabChange }: TabsProps) {
  const tabs: Tab[] = [
    {
      id: "playground",
      name: "Playground",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      id: "activity",
      name: "Activity",
      icon: <Activity className="h-5 w-5" />,
    },
    { id: "integrate", name: "Integrate", icon: <Link className="h-5 w-5" /> },
    {
      id: "settings",
      name: "Settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
