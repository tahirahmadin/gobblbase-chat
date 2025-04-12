import React, { useState } from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import FileUpload from './components/FileUpload';
import Activity from './components/Activity';
import Integration from './components/Integration';

function App() {
  const [activeTab, setActiveTab] = useState('create');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'create':
        return <FileUpload />;
      case 'activity':
        return <Activity />;
      case 'integrate':
        return <Integration />;
      case 'settings':
        return <div className="p-4">Settings panel coming soon...</div>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderTabContent()}
      </main>
    </div>
  );
}

export default App;
