import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Briefcase,
  Package,
  Users,
  LogOut,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { useAdminStore } from "../../store/useAdminStore";
import { useUserStore } from "../../store/useUserStore";
import { useBotConfig } from "../../store/useBotConfig";

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
    name: "Agent Setup",
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: "/admin/dashboard",
    expandable: true,
    subItems: [
      { name: "All Agents", path: "/admin/all-agents" },
      { name: "Profile", path: "/admin/dashboard/profile" },
      { name: "Brain/PDF", path: "/admin/dashboard/brain" },
      { name: "AI Model", path: "/admin/dashboard/ai-model" },
      { name: "Voice", path: "/admin/dashboard/voice" },
      { name: "Theme", path: "/admin/dashboard/theme" },
      { name: "Welcome Text", path: "/admin/dashboard/welcome" },
      { name: "Prompts", path: "/admin/dashboard/prompts" },
    ],
  },
  {
    name: "Operations",
    icon: <Briefcase className="w-5 h-5" />,
    path: "/admin/operations",
    expandable: true,
    subItems: [
      { name: "Orders", path: "/admin/operations/orders" },
      { name: "Payments", path: "/admin/operations/payments" },
      { name: "Email", path: "/admin/operations/email" },
      { name: "Integrations", path: "/admin/operations/integrations" },
      { name: "Embed", path: "/admin/operations/embed" },
    ],
  },
  {
    name: "Commerce",
    icon: <Package className="w-5 h-5" />,
    path: "/admin/commerce",
    expandable: true,
    subItems: [
      { name: "Add New", path: "/admin/commerce/add" },
      { name: "Manage", path: "/admin/commerce/manage" },
      { name: "Calendar", path: "/admin/commerce/calendar" },
      { name: "Policies", path: "/admin/commerce/policies" },
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
  {
    name: "Account",
    icon: <Users className="w-5 h-5" />,
    path: "/admin/account",
    expandable: true,
    subItems: [
      // { name: "Billing", path: "/admin/account/billing" },
      { name: "Plans", path: "/admin/account/plans" },
      { name: "Usage", path: "/admin/account/usage" },
    ],
  },
];

// LogoutModal component (popup style above button)
const LogoutModal = ({
  open,
  onClose,
  onConfirm,
  email,
  photo,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  email: string | null;
  photo?: string | null;
}) => {
  if (!open) return null;
  return (
    <div className="absolute bottom-14 left-0 w-full flex justify-center z-50">
      <div className="relative w-72 bg-blue-600 rounded-lg shadow-xl flex flex-col items-center animate-fade-in">
        {/* Arrow */}
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 overflow-hidden">
          <div
            className="w-4 h-4 bg-blue-600 rotate-45 mx-auto shadow-xl"
            style={{ marginTop: "2px" }}
          ></div>
        </div>

        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="flex flex-row items-center justify-center">
            {/* Avatar */}
            {photo ? (
              <img
                src={photo}
                alt="Profile"
                className="w-8 h-8 rounded-full mt-4 mb-2 object-cover border-2 border-white shadow"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mt-4 mb-2 text-xl text-gray-500 border-2 border-white shadow">
                ?
              </div>
            )}
            {/* Email */}
            <div className="text-white text-base truncate px-2 w-full text-center text-xs">
              {email}
            </div>
          </div>{" "}
          {/* Divider */}
          <div className="w-full border-t border-blue-400 my-2" />
          {/* Confirm button */}
          <button
            className="w-11/12 bg-white text-blue-600 font-semibold px-4 py-2 rounded mb-2 hover:bg-blue-100 transition"
            onClick={onConfirm}
          >
            Confirm Logout
          </button>
          <button
            className="text-white text-sm mb-3 underline w-11/12"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedTabs, setExpandedTabs] = useState<string[]>([]);
  const { adminLogout } = useAdminStore();
  const { logout: userLogout } = useUserStore();
  const { clearBotConfig } = useBotConfig();
  const { activeBotId } = useBotConfig();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { adminEmail } = useAdminStore();
  const { activeBotData } = useBotConfig();

  const toggleTab = (tabName: string) => {
    setExpandedTabs((prev) =>
      prev.includes(tabName)
        ? prev.filter((tab) => tab !== tabName)
        : [...prev, tabName]
    );
  };

  const isTabExpanded = (tabName: string) => expandedTabs.includes(tabName);

  // Sidebar logic: if no agent selected, show only Agent Setup > All Agents
  if (location.pathname === "/admin/all-agents") {
    return (
      <div className="w-64 bg-black min-h-screen text-white p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-bold">kifor.ai</h1>
        </div>
        <nav className="flex-1 space-y-2 overflow-y-auto">
          <div className="space-y-1">
            <button
              onClick={() => toggleTab("Agent Setup")}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors`}
            >
              <div className="flex items-center space-x-3">
                <LayoutDashboard className="w-5 h-5" />
                <span>Agent Setup</span>
              </div>
              <div className="text-gray-400">
                {isTabExpanded("Agent Setup") ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            </button>
            {isTabExpanded("Agent Setup") && (
              <div className="ml-4 pl-4 border-l border-gray-700 space-y-1">
                <button
                  onClick={() => navigate("/admin/all-agents")}
                  className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === "/admin/all-agents"
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  All Agents
                </button>
              </div>
            )}
          </div>
        </nav>
        <div className="space-y-2 pt-4 border-t border-gray-700">
          <div className="relative inline-block">
            <div className="absolute top-1 left-1 w-full h-full bg-black rounded"></div>
            <div className="relative inline-block">
              {/* Bottom layer for shadow effect */}
              <div className="absolute top-1 left-1 w-full h-full border border-[#6aff97] "></div>

              {/* Main button */}
              <button
                onClick={() => navigate("/admin/account/plans")}
                className="relative bg-black text-white font-semibold px-4 py-2 border border-[#6aff97]"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
          <div className="relative">
            <button
              className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
              onClick={() => setShowLogoutModal(true)}
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
            <LogoutModal
              open={showLogoutModal}
              onClose={() => setShowLogoutModal(false)}
              onConfirm={() => {
                userLogout();
                adminLogout();
                clearBotConfig();
                navigate("/admin");
              }}
              email={adminEmail}
              photo={activeBotData?.logo || null}
            />
          </div>
        </div>
      </div>
    );
  }

  // If agent is selected, show full sidebar
  return (
    <div className="w-64 bg-black h-screen text-white p-4 flex flex-col  overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-xl font-bold">kifor.ai</h1>
      </div>
      <nav className="flex-1 space-y-2 ">
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
        <div className="relative inline-block">
          <div className="absolute top-1 left-1 w-full h-full bg-[#6aff97] rounded"></div>
          <div className="relative inline-block">
            {/* Bottom layer for shadow effect */}
            <div className="absolute top-1 left-1 w-full h-full border border-black "></div>

            {/* Main button */}
            <button
              onClick={() => navigate("/admin/account/plans")}
              className="relative bg-[#6aff97] text-black font-semibold px-4 py-2 border border-black"
            >
              Upgrade Plan
            </button>
          </div>
        </div>
        <div className="relative">
          <button
            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
            onClick={() => setShowLogoutModal(true)}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
          <LogoutModal
            open={showLogoutModal}
            onClose={() => setShowLogoutModal(false)}
            onConfirm={() => {
              userLogout();
              adminLogout();
              clearBotConfig();
              navigate("/admin");
            }}
            email={adminEmail}
            photo={activeBotData?.logo || null}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
