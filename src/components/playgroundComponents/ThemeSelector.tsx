import React from "react";
import { ThemeOption, Theme } from "./types";
import { AVAILABLE_THEMES } from "./constants";
import { Bot } from "lucide-react";

interface ThemeSelectorProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  logo?: string;
  agentName: string;
  activeAgentUsername?: string | null;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  theme,
  setTheme,
  logo,
  agentName,
  activeAgentUsername,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-900">
            Select Theme
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {AVAILABLE_THEMES.map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => setTheme(themeOption.theme)}
              className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
                theme === themeOption.theme
                  ? "border-black"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start p-4 space-x-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={themeOption.image}
                    alt={themeOption.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  {theme === themeOption.theme && (
                    <div className="absolute -top-1 -right-1 bg-black rounded-full p-1">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {themeOption.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {themeOption.description}
                  </p>

                  {/* Color Palette Preview */}
                  <div className="flex space-x-2">
                    {themeOption.palette.map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded-full shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Theme Preview */}
              <div className="mt-3 border-t border-gray-100 p-4 bg-gray-50">
                <div
                  className="rounded-lg overflow-hidden"
                  style={{ backgroundColor: themeOption.theme.headerColor }}
                >
                  <div className="p-4">
                    <div className="flex items-center space-x-4">
                      {logo ? (
                        <img
                          src={logo}
                          alt={`${agentName} logo`}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <Bot className="h-8 w-8 text-black" />
                      )}
                      <div>
                        <h3
                          className="text-base font-medium"
                          style={{ color: themeOption.theme.headerTextColor }}
                        >
                          {agentName}
                        </h3>
                        <p
                          className="text-xs text-left"
                          style={{ color: themeOption.theme.headerTextColor }}
                        >
                          @{activeAgentUsername}
                        </p>
                      </div>
                    </div>

                    {/* Navigation Bar */}
                    <div
                      className="mt-3 flex items-center justify-between text-xs"
                      style={{ color: themeOption.theme.headerTextColor }}
                    >
                      <div className="flex items-center justify-between space-x-2">
                        Chat
                      </div>
                      <div
                        className="flex items-center justify-between space-x-2"
                        style={{ color: themeOption.theme.headerNavColor }}
                      >
                        Book
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        Browse
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
