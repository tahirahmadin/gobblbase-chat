import React from "react";
import {
  Activity,
  Code2,
  Settings,
  ShoppingBag,
  Wrench,
  Calendar,
  Link,
  Puzzle,
} from "lucide-react";

export interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: "playground",
      name: "Playground",
      icon: <Code2 className="h-5 w-5" />,
    },
    {
      id: "activity",
      name: "Activity",
      icon: <Activity className="h-5 w-5" />,
    },
    {
      id: "booking",
      name: "Booking",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      id: "products",
      name: "Products",
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      id: "integration",
      name: "Embedded",
      icon: <Link className="h-5 w-5" />,
    },
    {
      id: "integrations",
      name: "Integrations",
      icon: <Puzzle className="h-5 w-5" />,
    },
    // {
    //   id: "services",
    //   name: "Services",
    //   icon: <ShoppingBag className="h-5 w-5" />,
    // },
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
          className={`${
            activeTab === tab.id
              ? "bg-gray-900 text-gray-100"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          } flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
        >
          <span
            className={`${
              activeTab === tab.id ? "text-gray-100" : "text-gray-400"
            } mr-3`}
          >
            {tab.icon}
          </span>
          {tab.name}
        </button>
      ))}
    </nav>
  );
};

export default Tabs;
