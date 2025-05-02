import { useEffect } from "react";
import { useBotConfig } from "../store/useBotConfig";

export const useServerHook = ({ initHook = false }: { initHook: boolean }) => {
  const { fetchBotData, activeBotId, refetchBotData, setActiveBotId } =
    useBotConfig();

  useEffect(() => {
    if (activeBotId && initHook) {
      console.log("activeBotId", activeBotId);

      console.log("initHook", initHook);
      fetchBotData(activeBotId, false);
    }
  }, [refetchBotData, activeBotId, setActiveBotId, initHook]);
};
