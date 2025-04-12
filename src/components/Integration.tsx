import React from 'react';
import { Code, Share, Puzzle } from 'lucide-react';

interface IntegrationTab {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export default function Integration() {
  const [activeTab, setActiveTab] = React.useState('embed');
  const [selectedOption, setSelectedOption] = React.useState('iframe');

  const tabs: IntegrationTab[] = [
    { id: 'embed', name: 'Embed', icon: <Code className="h-5 w-5" /> },
    { id: 'share', name: 'Share', icon: <Share className="h-5 w-5" /> },
    { id: 'integrations', name: 'Integrations', icon: <Puzzle className="h-5 w-5" /> },
  ];

  const iframeCode = `<iframe
  src="https://www.chatbase.co/chatbot-iframe/SSPuv803dm7NvdZjDap5O"
  width="100%"
  style="height: 100%; min-height: 700px"
  frameborder="0"
></iframe>`;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex">
        {/* Left sidebar */}
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
              <h2 className="text-xl font-semibold text-gray-800">Embed</h2>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Embed options */}
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer ${
                      selectedOption === 'bubble' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedOption('bubble')}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={selectedOption === 'bubble'}
                        onChange={() => setSelectedOption('bubble')}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <h3 className="font-medium">Embed a chat bubble</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Recommended</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            Recommended
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Embed a chat bubble on your website. Allows you to use all the advanced features of the agent.
                    </p>
                  </div>

                  <div 
                    className={`p-4 border rounded-lg cursor-pointer ${
                      selectedOption === 'iframe' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedOption('iframe')}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={selectedOption === 'iframe'}
                        onChange={() => setSelectedOption('iframe')}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <h3 className="font-medium">Embed the iframe directly</h3>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Add the agent anywhere on your website
                    </p>
                  </div>
                </div>

                {/* Code section */}
                <div className="mt-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-700">www.chatbase.co</h4>
                      <button 
                        className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
                        onClick={() => navigator.clipboard.writeText(iframeCode)}
                      >
                        <Code className="h-4 w-4" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap">{iframeCode}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}