import { useEffect } from "react";
import { useBotConfig } from "../store/useBotConfig";
import { useAdminStore } from "../store/useAdminStore";

export const useServerHook = ({ initHook = false }: { initHook: boolean }) => {
  const { activeBotId, refetchBotData, fetchBotData, setActiveBotId } =
    useBotConfig();
  const { agents, adminId, fetchAllAgents, isAgentsLoaded } = useAdminStore();

  //Fetch all agents when adminId is available
  useEffect(() => {
    console.log("adminId");
    console.log(adminId);
    console.log(initHook);
    console.log(isAgentsLoaded);
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
      const found =
        storedAgentId && agents.find((a) => a.agentId === storedAgentId);
      if (found) {
        setActiveBotId(found.agentId);
      } else if (activeBotId === null) {
        setActiveBotId(agents[0].agentId);
      }
    }
  }, [agents, setActiveBotId, initHook]);

  // useEffect(() => {
  //   if (
  //     isAgentsLoaded &&
  //     agents.length > 0 &&
  //     activeBotId !== null &&
  //     initHook
  //   ) {
  //     const index = agents.findIndex((agent) => agent.agentId === activeBotId);
  //     if (index === -1) {
  //       console.log("2. Setting active bot id");
  //       setActiveBotId(agents[0].agentId);
  //     }
  //   }
  // }, [agents, setActiveBotId, initHook, isAgentsLoaded]);

  useEffect(() => {
    if (activeBotId && initHook) {
      console.log("3. Refetch bot data");
      fetchBotData(activeBotId, false);
    }
  }, [refetchBotData, activeBotId, initHook]);
};
