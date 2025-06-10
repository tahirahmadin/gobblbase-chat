import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";
import { useAdminStore } from "../../store/useAdminStore";
import { useUserStore } from "../../store/useUserStore";
import { useBotConfig } from "../../store/useBotConfig";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isAllAgentsPage = location.pathname === "/admin/all-agents";

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Menu Button */}

      {!isAllAgentsPage ? (
        <div className="lg:hidden fixed top-2 left-4 z-50  ">
          <button
            className="bg-white p-2 relative text-black border border-black"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          >
            <div className="absolute z-[-1] left-1 top-1 bg-white w-full h-full border border-black"></div>
            {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      ) : (
        <button className="hidden"></button>
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          isMobileSidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 w-64 bg-black">
          <Sidebar onClose={() => setIsMobileSidebarOpen(false)} />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
