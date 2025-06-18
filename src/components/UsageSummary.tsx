import React from "react";
import { CreditCard, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { useUsageData } from "../hooks/useUsageData";

interface UsageSummaryProps {
  className?: string;
  showDetails?: boolean;
  showWarnings?: boolean;
}

const UsageSummary: React.FC<UsageSummaryProps> = ({
  className = "",
  showDetails = false,
  showWarnings = true,
}) => {
  const {
    creditsUsed,
    totalCredits,
    availableCredits,
    creditsUsagePercentage,
    totalAgents,
    agentLimit,
    agentUsagePercentage,
    totalTokens,
    isLoading,
    formatAgentLimit,
    getUsageStatus,
  } = useUsageData();

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const status = getUsageStatus();

  const getCreditsColor = () => {
    if (status.credits === "critical")
      return "from-red-50 to-red-100 border-red-200";
    if (status.credits === "warning")
      return "from-yellow-50 to-yellow-100 border-yellow-200";
    return "from-blue-50 to-blue-100 border-blue-200";
  };

  const getAgentsColor = () => {
    if (status.agents === "critical")
      return "from-red-50 to-red-100 border-red-200";
    if (status.agents === "warning")
      return "from-yellow-50 to-yellow-100 border-yellow-200";
    return "from-green-50 to-green-100 border-green-200";
  };

  const getProgressColor = (type: "credits" | "agents") => {
    if (type === "credits") {
      if (status.credits === "critical") return "bg-red-600";
      if (status.credits === "warning") return "bg-yellow-600";
      return "bg-blue-600";
    }
    if (type === "agents") {
      if (status.agents === "critical") return "bg-red-600";
      if (status.agents === "warning") return "bg-yellow-600";
      return "bg-green-600";
    }
  };

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
    >
      {/* Credits Usage */}
      <div
        className={`bg-gradient-to-br ${getCreditsColor()} rounded-lg p-4 border`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              Credits Used
            </span>
          </div>
          <div className="flex items-center gap-1">
            {showWarnings && status.credits !== "normal" && (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            )}
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {creditsUsed.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">
              / {totalCredits.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                "credits"
              )}`}
              style={{ width: `${Math.min(creditsUsagePercentage, 100)}%` }}
            ></div>
          </div>
          {showDetails && (
            <div className="text-xs text-gray-600">
              Available: {availableCredits.toLocaleString()} credits
            </div>
          )}
        </div>
      </div>

      {/* Agents Usage */}
      <div
        className={`bg-gradient-to-br ${getAgentsColor()} rounded-lg p-4 border`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              Active Agents
            </span>
          </div>
          <div className="flex items-center gap-1">
            {showWarnings && status.agents !== "normal" && (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            )}
            <div className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
              {agentLimit === 9999
                ? "Unlimited"
                : `${totalAgents}/${agentLimit}`}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {totalAgents}
            </span>
            <span className="text-sm text-gray-500">
              / {formatAgentLimit(agentLimit)}
            </span>
          </div>
          {agentLimit !== 9999 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                  "agents"
                )}`}
                style={{ width: `${Math.min(agentUsagePercentage, 100)}%` }}
              ></div>
            </div>
          )}
          {showDetails && (
            <div className="text-xs text-gray-600">
              {agentLimit === 9999
                ? "Unlimited agent capacity"
                : `${agentLimit - totalAgents} agents remaining`}
            </div>
          )}
        </div>
      </div>

      {/* Total Tokens */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-purple-600 rounded-full mr-2 flex items-center justify-center">
              <span className="text-white text-xs font-bold">T</span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              Total Tokens
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {totalTokens.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">tokens</span>
          </div>
          {showDetails && (
            <div className="text-xs text-gray-600">Across all agents</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsageSummary;
