import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Brain,
  MessageSquare,
  Palette,
  FileText,
  Briefcase,
  Package,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";

interface SubNavItem {
  name: string;
  path: string;
}

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  expandable?: boolean;
  subItems?: SubNavItem[];
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: "/admin/dashboard",
    expandable: true,
    subItems: [
      { name: "Profile", path: "/admin/dashboard/profile" },
      { name: "Brain", path: "/admin/dashboard/brain" },
      { name: "Voice", path: "/admin/dashboard/voice" },
      { name: "Theme", path: "/admin/dashboard/theme" },
      { name: "Welcome Text", path: "/admin/dashboard/welcome" },
      { name: "Prompts", path: "/admin/dashboard/prompts" },
    ],
  },
  {
    name: "Business",
    icon: <Briefcase className="w-5 h-5" />,
    path: "/admin/business",
    expandable: true,
    subItems: [
      { name: "Payments", path: "/admin/business/payments" },
      { name: "Integrations", path: "/admin/business/integrations" },
      { name: "Embed", path: "/admin/business/embed" },
    ],
  },
  {
    name: "Offerings",
    icon: <Package className="w-5 h-5" />,
    path: "/admin/offerings",
    expandable: true,
    subItems: [
      { name: "Add New", path: "/admin/offerings/add" },
      { name: "Manage", path: "/admin/offerings/manage" },
      { name: "Calendar", path: "/admin/offerings/calendar" },
      { name: "Policies", path: "/admin/offerings/policies" },
    ],
  },
  {
    name: "CRM",
    icon: <Users className="w-5 h-5" />,
    path: "/admin/crm",
    expandable: true,
    subItems: [
      { name: "Customer Leads", path: "/admin/crm/leads" },
      { name: "Chat Logs", path: "/admin/crm/chat-logs" },
    ],
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedTabs, setExpandedTabs] = useState<string[]>([]);

  const toggleTab = (tabName: string) => {
    setExpandedTabs((prev) =>
      prev.includes(tabName)
        ? prev.filter((tab) => tab !== tabName)
        : [...prev, tabName]
    );
  };

  const isTabExpanded = (tabName: string) => expandedTabs.includes(tabName);

  return (
    <div className="w-64 bg-black min-h-screen text-white p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-bold">kifor.ai</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <div key={item.name} className="space-y-1">
            <button
              onClick={() => {
                if (item.expandable) {
                  toggleTab(item.name);
                } else {
                  navigate(item.path);
                }
              }}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span>{item.name}</span>
              </div>
              {item.expandable && (
                <div className="text-gray-400">
                  {isTabExpanded(item.name) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              )}
            </button>

            {item.expandable && isTabExpanded(item.name) && (
              <div className="ml-4 pl-4 border-l border-gray-700 space-y-1">
                {item.subItems?.map((subItem) => (
                  <button
                    key={subItem.path}
                    onClick={() => navigate(subItem.path)}
                    className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                      location.pathname === subItem.path
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:bg-gray-800"
                    }`}
                  >
                    {subItem.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="space-y-2 pt-4 border-t border-gray-700">
        <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
          Upgrade Plan
        </button>

        <button
          className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
          onClick={() => {
            /* Add logout logic */
          }}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
