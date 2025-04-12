import React from "react";
import { LogIn, User, Upload, Bot } from "lucide-react";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Bot className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-semibold">GobblChat</span>
          </div>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </button>
            ) : (
              <button
                onClick={() => setIsLoggedIn(true)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
              >
                <LogIn className="h-5 w-5" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
