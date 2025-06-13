import { useEffect } from "react";
import { useBotConfig } from "../store/useBotConfig";
import { useAdminStore } from "../store/useAdminStore";

export const useServerHook = ({ initHook = false }: { initHook: boolean }) => {
  const { activeBotId, refetchBotData, fetchBotData, setActiveBotId } =
    useBotConfig();
  const {
    agents,
    adminId,
    fetchAllAgents,
    isAgentsLoaded,
    setActiveTeamId,
    activeTeamId,
    refetchClientData,
  } = useAdminStore();

  //Fetch all agents when adminId is available
  useEffect(() => {
    if (adminId && initHook && !isAgentsLoaded) {
      console.log("1. Fetching all agents while not loaded");
      fetchAllAgents();
    }
  }, [adminId, fetchAllAgents, initHook, isAgentsLoaded, activeBotId]);

  useEffect(() => {
    // On reload, check localStorage for agentId and set if valid
    if (agents.length > 0 && initHook) {
      let storedAgentId: string | null = null;
      if (typeof window !== "undefined") {
        storedAgentId = localStorage.getItem("activeBotId");
      }
      const inTeamAgentFound =
        storedAgentId && agents.find((a) => a.agentId === storedAgentId);
      console.log("agents", agents);
      console.log("inTeamAgentFound", inTeamAgentFound);

      if (inTeamAgentFound) {
        setActiveBotId(inTeamAgentFound.agentId);
        if (activeTeamId !== inTeamAgentFound.teamId) {
          setActiveTeamId(inTeamAgentFound.teamId);
        }
      } else if (activeBotId === null) {
        setActiveBotId(agents[0].agentId);
        if (activeTeamId !== agents[0].teamId) {
          setActiveTeamId(agents[0].teamId);
        }
      }
    }
  }, [agents, setActiveBotId, initHook, activeTeamId]);

  useEffect(() => {
    if (activeBotId && initHook) {
      fetchBotData(activeBotId, false);
    }
  }, [refetchBotData, activeBotId, initHook]);
  useEffect(() => {
    if (activeTeamId && initHook) {
      refetchClientData();
    }
  }, [activeTeamId]);
};
