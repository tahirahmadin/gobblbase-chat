import React from 'react';
import { RefreshCw, Filter, Download, MessageSquare, Users } from 'lucide-react';

interface ActivityTab {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export default function Activity() {
  const [activeTab, setActiveTab] = React.useState('chat-logs');

  const tabs: ActivityTab[] = [
    { id: 'chat-logs', name: 'Chat Logs', icon: <MessageSquare className="h-5 w-5" /> },
    { id: 'leads', name: 'Leads', icon: <Users className="h-5 w-5" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Left sidebar */}
      <div className="flex">
        <div className="w-64 pr-8">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-md w-full
                  ${activeTab === tab.id
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:bg-gray-50'}
                `}
              >
                <span className={`mr-3 ${activeTab === tab.id ? 'text-purple-600' : 'text-gray-400'}`}>
                  {tab.icon}
                </span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Chat logs</h2>
                <div className="flex space-x-3">
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </button>
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </button>
                  <button className="inline-flex items-center px-3 py-1.5 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <MessageSquare className="h-12 w-12 mb-4" />
                <p className="text-lg">No chats found</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}