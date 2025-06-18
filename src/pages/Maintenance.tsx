import React from "react";
import { Loader } from "lucide-react";

const Maintenance: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <Loader className="w-16 h-16 mx-auto animate-spin text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          We'll be back soon!
        </h1>
        <p className="text-gray-600 mb-6">
          We're currently performing scheduled maintenance to improve our
          services. Please check back later.
        </p>
        <div className="text-sm text-gray-500">
          Expected duration: 1-2 hours
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
