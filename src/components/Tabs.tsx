import React from "react";
import { MessageSquare, Activity, Link, Settings, Zap } from "lucide-react";

interface Tab {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
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
    <div className="border-r border-gray-100">
      <nav className="h-full max-w-[200px] min-w-[180px]">
        <div className="flex flex-col space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center space-x-2 py-4 px-4 border-l-2 font-medium text-sm transition-all duration-200
                ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600 bg-primary-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }
              `}
            >
              <span
                className={`
                  ${activeTab === tab.id ? "text-primary-600" : "text-gray-400"}
                `}
              >
                {tab.icon}
              </span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
