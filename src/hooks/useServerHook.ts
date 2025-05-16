import { useEffect } from "react";
import { useBotConfig } from "../store/useBotConfig";

export const useServerHook = ({ initHook = false }: { initHook: boolean }) => {
  const { fetchBotData, activeBotId, refetchBotData } = useBotConfig();

  useEffect(() => {
    if (activeBotId && initHook) {
      console.log("initHook", initHook);
      console.log("activeBotId", activeBotId);
      fetchBotData(activeBotId, false);
    }
  }, [refetchBotData, activeBotId, initHook]);
};
