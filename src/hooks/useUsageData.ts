import { useAdminStore } from "../store/useAdminStore";
import { useMemo } from "react";

export const useUsageData = () => {
  const { clientUsage, activeTeamId, fetchClientUsage } = useAdminStore();

  const usageStats = useMemo(() => {
    if (!clientUsage) {
      return {
        creditsUsed: 0,
        totalCredits: 0,
        availableCredits: 0,
        creditsUsagePercentage: 0,
        totalAgents: 0,
        agentLimit: 0,
        agentUsagePercentage: 0,
        totalTokens: 0,
        isLoading: true,
      };
    }

    const { creditsInfo, usage, totalAgentCount } = clientUsage;
    const creditsUsed = creditsInfo.totalCredits - creditsInfo.availableCredits;
    const creditsUsagePercentage =
      creditsInfo.totalCredits > 0
        ? (creditsUsed / creditsInfo.totalCredits) * 100
        : 0;
    const agentUsagePercentage =
      usage.agentLimit > 0 && usage.agentLimit !== 9999
        ? (totalAgentCount / usage.agentLimit) * 100
        : 0;

    return {
      creditsUsed,
      totalCredits: creditsInfo.totalCredits,
      availableCredits: creditsInfo.availableCredits,
      creditsUsagePercentage,
      totalAgents: totalAgentCount,
      agentLimit: usage.agentLimit,
      agentUsagePercentage,
      totalTokens: usage.totalTokensUsedAllAgents,
      isLoading: false,
    };
  }, [clientUsage]);

  const agentUsage = useMemo(() => {
    if (!clientUsage?.usage.agentUsage) {
      return [];
    }

    return clientUsage.usage.agentUsage.map((agent) => ({
      id: agent.agentId,
      name: agent.agentName,
      tokensUsed: agent.totalTokensUsed,
      sessions: agent.usageData.length,
      usagePercentage:
        clientUsage.usage.totalTokensUsedAllAgents > 0
          ? (agent.totalTokensUsed /
              clientUsage.usage.totalTokensUsedAllAgents) *
            100
          : 0,
    }));
  }, [clientUsage]);

  const formatAgentLimit = (limit: number) => {
    return limit === 9999 ? "Unlimited" : limit.toString();
  };

  const isNearLimit = (type: "credits" | "agents") => {
    if (type === "credits") {
      return usageStats.creditsUsagePercentage >= 80;
    }
    if (type === "agents") {
      return usageStats.agentUsagePercentage >= 80;
    }
    return false;
  };

  const getUsageStatus = () => {
    const status = {
      credits: "normal" as "normal" | "warning" | "critical",
      agents: "normal" as "normal" | "warning" | "critical",
    };

    if (usageStats.creditsUsagePercentage >= 90) {
      status.credits = "critical";
    } else if (usageStats.creditsUsagePercentage >= 75) {
      status.credits = "warning";
    }

    if (usageStats.agentUsagePercentage >= 90) {
      status.agents = "critical";
    } else if (usageStats.agentUsagePercentage >= 75) {
      status.agents = "warning";
    }

    return status;
  };

  return {
    ...usageStats,
    agentUsage,
    formatAgentLimit,
    isNearLimit,
    getUsageStatus,
    refetch: () => activeTeamId && fetchClientUsage({ clientId: activeTeamId }),
  };
};
