import { useEffect } from "react";
import { useBotConfig } from "../store/useBotConfig";
import { useAdminStore } from "../store/useAdminStore";

export const useServerHook = ({ initHook = false }: { initHook: boolean }) => {
  const { activeBotId, refetchBotData, fetchBotData, setActiveBotId } =
    useBotConfig();
  const { agents, adminId, fetchAllAgents, isAgentsLoaded } = useAdminStore();

  //Fetch all agents when adminId is available
  useEffect(() => {
    if (adminId && initHook && !isAgentsLoaded) {
      console.log("1. Fetching all agents while not loaded");
      fetchAllAgents();
    }
  }, [adminId, fetchAllAgents, initHook, isAgentsLoaded]);

  useEffect(() => {
    if (isAgentsLoaded && agents.length > 0 && activeBotId === null) {
      console.log("2. Setting active bot id");
      setActiveBotId(agents[0].agentId);
    }
  }, [agents, setActiveBotId]);

  useEffect(() => {
    if (isAgentsLoaded && agents.length > 0 && activeBotId !== null) {
      const index = agents.findIndex((agent) => agent.agentId === activeBotId);
      console.log(index);
      console.log(agents);
      if (index === -1) {
        console.log("2. Setting active bot id");
        setActiveBotId(agents[0].agentId);
      }
    }
  }, [agents, setActiveBotId, isAgentsLoaded]);

  useEffect(() => {
    if (activeBotId && initHook) {
      console.log("3. Fetching bot data");
      console.log(activeBotId);
      fetchBotData(activeBotId, false);
    }
  }, [refetchBotData, activeBotId, initHook]);
};
