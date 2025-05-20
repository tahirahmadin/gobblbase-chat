import React, { useState, useEffect } from "react";
import { getClientUsage } from "../../lib/serverActions";
import { useAdminStore } from "../../store/useAdminStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

interface ClientUsageData {
  creditsInfo: {
    totalCredits: number;
    availableCredits: number;
  };
  usage: {
    agentUsage: {
      totalTokensUsed: number;
      usageData: {
        _id: string;
        clientId: string;
        agentId: string;
        date: string;
        totalTokensUsed: number;
      }[];
      agentId: string;
      agentName: string;
    }[];
    totalTokensUsedAllAgents: number;
    planId: string;
    agentLimit: number;
  };
  totalAgentCount: number;
}

interface DailyUsage {
  day: number;
  month: string;
  year: number;
  date: string;
  usage: number;
  agentId: string;
}

const Usage = () => {
  const { adminId } = useAdminStore();

  const [selectedAgent, setSelectedAgent] = useState("All Agents");
  const [timeFrame, setTimeFrame] = useState("All Time");
  const [currentPlan, setCurrentPlan] = useState("");
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [agentsUsed, setAgentsUsed] = useState(0);
  const [totalAgents, setTotalAgents] = useState(0);
  const [usageData, setUsageData] = useState<ClientUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [agentLimit, setAgentLimit] = useState(0);
  const [agentsList, setAgentsList] = useState<{ id: string; name: string }[]>(
    []
  );
  const [usageHistory, setUsageHistory] = useState<
    { date: string; usage: number }[]
  >([]);
  const [selectedAgentTokens, setSelectedAgentTokens] = useState(0);
  const [allDailyUsage, setAllDailyUsage] = useState<DailyUsage[]>([]);
  const [dataInitialized, setDataInitialized] = useState(false);

  useEffect(() => {
    const currentYear = new Date().getFullYear();

    const initialData = [
      { date: "2022", usage: 0 },
      { date: "2023", usage: 0 },
      { date: "2024", usage: 0 },
      { date: currentYear.toString(), usage: 5000 },
      { date: (currentYear + 1).toString(), usage: 0 },
    ];

    setUsageHistory(initialData);
  }, []);

  useEffect(() => {
    const fetchUsageData = async () => {
      if (!adminId) return;

      try {
        setLoading(true);
        const usageData = await getClientUsage(adminId);

        if (usageData) {
          setUsageData(usageData);

          setTotalCredits(usageData.creditsInfo.totalCredits);
          setCreditsUsed(usageData.usage.totalTokensUsedAllAgents);

          setCurrentPlan(usageData.usage.planId);
          setAgentLimit(usageData.usage.agentLimit);

          setTotalAgents(usageData.totalAgentCount);

          const agents = usageData.usage.agentUsage.map((agent) => ({
            id: agent.agentId,
            name: agent.agentName,
          }));
          setAgentsList(agents);

          setAgentsUsed(usageData.totalAgentCount);

          const dailyUsageCollection: DailyUsage[] = [];

          usageData.usage.agentUsage.forEach((agent) => {
            agent.usageData.forEach((dayData) => {
              const dateStr = dayData.date;
              const dateParts = /(\d{2})([A-Z]{3})(\d{4})/.exec(dateStr);

              if (dateParts) {
                const [_, dayStr, monthStr, yearStr] = dateParts;
                const day = parseInt(dayStr);
                const year = parseInt(yearStr);

                dailyUsageCollection.push({
                  day,
                  month: monthStr,
                  year,
                  date: dateStr,
                  usage: dayData.totalTokensUsed,
                  agentId: agent.agentId,
                });
              }
            });
          });

          setAllDailyUsage(dailyUsageCollection);

          generateUsageHistory(usageData, "All Agents", timeFrame);
          setDataInitialized(true);
        }
      } catch (err) {
        console.error("Error fetching usage data:", err);
        toast.error("Failed to load usage data");
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, [adminId]);

  useEffect(() => {
    if (dataInitialized && usageData) {
      generateUsageHistory(usageData, selectedAgent, timeFrame);
    }
  }, [dataInitialized]);

  const getMonthName = (monthAbbr: string) => {
    const monthMap: { [key: string]: string } = {
      JAN: "January",
      FEB: "February",
      MAR: "March",
      APR: "April",
      MAY: "May",
      JUN: "June",
      JUL: "July",
      AUG: "August",
      SEP: "September",
      OCT: "October",
      NOV: "November",
      DEC: "December",
    };

    return monthMap[monthAbbr] || monthAbbr;
  };

  const getMonthIndex = (monthAbbr: string) => {
    const monthMap: { [key: string]: number } = {
      JAN: 0,
      FEB: 1,
      MAR: 2,
      APR: 3,
      MAY: 4,
      JUN: 5,
      JUL: 6,
      AUG: 7,
      SEP: 8,
      OCT: 9,
      NOV: 10,
      DEC: 11,
    };

    return monthMap[monthAbbr] || 0;
  };

  const getWeekLabel = (day: number) => {
    if (day >= 1 && day <= 7) return 7;
    if (day >= 8 && day <= 14) return 14;
    if (day >= 15 && day <= 21) return 21;
    return 28;
  };

  const generateUsageHistory = (
    data: ClientUsageData,
    agent: string,
    timeFrame: string
  ) => {
    if (!data) return;

    let agentDailyUsage: DailyUsage[] = [];
    let selectedAgentId = "";

    if (agent === "All Agents") {
      agentDailyUsage = [...allDailyUsage];
      setCreditsUsed(data.usage.totalTokensUsedAllAgents);
      setAgentsUsed(data.totalAgentCount);
      setSelectedAgentTokens(data.usage.totalTokensUsedAllAgents);
    } else {
      const selectedAgentData = data.usage.agentUsage.find(
        (a) => a.agentName === agent
      );

      if (selectedAgentData) {
        selectedAgentId = selectedAgentData.agentId;
        agentDailyUsage = allDailyUsage.filter(
          (usage) => usage.agentId === selectedAgentId
        );

        setCreditsUsed(selectedAgentData.totalTokensUsed);
        setAgentsUsed(1);
        setSelectedAgentTokens(selectedAgentData.totalTokensUsed);
      } else {
        agentDailyUsage = [];
        setCreditsUsed(0);
        setAgentsUsed(0);
        setSelectedAgentTokens(0);
      }
    }

    let currentMonth = "MAY";
    let currentYear = new Date().getFullYear();

    if (agentDailyUsage.length > 0) {
      const sortedDates = [...agentDailyUsage].sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        if (a.month !== b.month)
          return getMonthIndex(b.month) - getMonthIndex(a.month);
        return b.day - a.day;
      });

      currentMonth = sortedDates[0].month;
      currentYear = sortedDates[0].year;
    }

    const currentMonthName = getMonthName(currentMonth);

    let result: { date: string; usage: number }[] = [];

    switch (timeFrame) {
      case "Today": {
        const lastDays: { date: string; usage: number }[] = [];

        const daysInCurrentMonth = agentDailyUsage
          .filter((d) => d.month === currentMonth && d.year === currentYear)
          .map((d) => d.day);

        const maxDay =
          daysInCurrentMonth.length > 0
            ? Math.max(...daysInCurrentMonth)
            : new Date().getDate();

        const startDay = Math.max(1, maxDay - 6);

        for (let day = startDay; day <= maxDay; day++) {
          const dayUsage = agentDailyUsage
            .filter(
              (d) =>
                d.day === day &&
                d.month === currentMonth &&
                d.year === currentYear
            )
            .reduce((sum, d) => sum + d.usage, 0);

          lastDays.push({
            date: `${currentMonthName.substring(0, 3)} ${day}`,
            usage: dayUsage,
          });
        }

        result = lastDays;
        break;
      }

      case "This Week": {
        const weekLabels = [7, 14, 21, 28];

        const weeklyData = weekLabels.map((day) => ({
          date: `${currentMonthName.substring(0, 3)} ${day}`,
          usage: 0,
        }));

        agentDailyUsage
          .filter((d) => d.month === currentMonth && d.year === currentYear)
          .forEach((dayData) => {
            const weekLabel = getWeekLabel(dayData.day);
            const weekIndex = weekLabels.indexOf(weekLabel);

            if (weekIndex !== -1) {
              weeklyData[weekIndex].usage += dayData.usage;
            }
          });

        result = weeklyData;
        break;
      }

      case "This Month": {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        const monthlyData = months.map((month, index) => {
          const monthAbbr = month.toUpperCase().substring(0, 3);
          const monthUsage = agentDailyUsage
            .filter((d) => d.month === monthAbbr && d.year === currentYear)
            .reduce((sum, d) => sum + d.usage, 0);

          return {
            date: month,
            usage: monthUsage,
          };
        });

        result = monthlyData;
        break;
      }

      case "This Year": {
        const yearlyData = [];
        const startYear = 2022;
        const endYear = currentYear + 1;

        for (let year = startYear; year <= endYear; year++) {
          const yearUsage = agentDailyUsage
            .filter((d) => d.year === year)
            .reduce((sum, d) => sum + d.usage, 0);

          yearlyData.push({
            date: year.toString(),
            usage: yearUsage,
          });
        }

        result = yearlyData;
        break;
      }

      case "All Time":
      default: {
        const allTimeData = [];
        const startYear = 2022;
        const endYear = currentYear + 1;

        for (let year = startYear; year <= endYear; year++) {
          const yearUsage = agentDailyUsage
            .filter((d) => d.year === year)
            .reduce((sum, d) => sum + d.usage, 0);

          allTimeData.push({
            date: year.toString(),
            usage: yearUsage,
          });
        }

        result = allTimeData;
        break;
      }
    }

    if (result.length > 0) {
      setUsageHistory(result);
    }
  };

  const formatAgentLimit = (limit: number) => {
    return limit === 9999 ? "Unlimited" : limit.toString();
  };

  const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const agentName = e.target.value;
    setSelectedAgent(agentName);
    if (usageData) {
      generateUsageHistory(usageData, agentName, timeFrame);
    }
  };

  const handleTimeFrameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimeFrame = e.target.value;
    setTimeFrame(newTimeFrame);
    if (usageData) {
      generateUsageHistory(usageData, selectedAgent, newTimeFrame);
    }
  };

  const navigate = useNavigate();
  const navigateToPlans = () => {
    navigate("/admin/account/plans");
  };

  const maxUsage = Math.max(...usageHistory.map((day) => day.usage), 1);

  if (loading && !usageData) {
    return (
      <div className="p-8 max-w-6xl mx-auto flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-row justify-between items-center gap-4 mb-4">
        <h1 className="text-xl font-bold">Usage</h1>
        {/* Filters */}
        <div className="flex flex-row gap-2">
          <select
            className="border border-blue-300 rounded px-3 py-2 bg-blue-100 text-gray-800 mb-2"
            value={selectedAgent}
            onChange={handleAgentChange}
          >
            <option>All Agents</option>
            {agentsList.map((agent) => (
              <option key={agent.id}>{agent.name}</option>
            ))}
          </select>
          <select
            className="border border-blue-300 rounded px-3 py-2 bg-blue-100 text-gray-800 mb-2"
            value={timeFrame}
            onChange={handleTimeFrameChange}
          >
            <option>All Time</option>
            <option>This Year</option>
            <option>This Month</option>
            <option>This Week</option>
            <option>Today</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        {/* Current Plan */}
        <div className="bg-green-100 rounded-lg p-4 flex flex-col justify-between w-56">
          <span className="text-xs text-gray-600 mb-1">Current Plan</span>
          <span className="font-bold text-lg mb-3">
            {currentPlan || "FREE"}
          </span>
          <button
            onClick={navigateToPlans}
            className="bg-white border border-green-300 text-green-900 font-semibold px-4 py-1 rounded shadow hover:bg-green-200 w-full"
          >
            VIEW
          </button>
        </div>

        {/* Credits Used */}
        <div className="bg-blue-100 rounded-lg p-4 flex-1 flex flex-col justify-between">
          <div className="flex items-center mb-2">
            <span className="text-2xl font-bold mr-2">{creditsUsed}</span>
            <span className="text-gray-700">
              / {totalCredits.toLocaleString()} Credits used
            </span>
          </div>
          <div className="w-full h-2 bg-white rounded-full">
            <div
              className="h-2 bg-blue-500 rounded-full"
              style={{
                width: `${
                  totalCredits > 0 ? (creditsUsed / totalCredits) * 100 : 0
                }%`,
              }}
            ></div>
          </div>
        </div>

        {/* Agents Used */}
        <div className="bg-blue-100 rounded-lg p-4 flex-1 flex flex-col justify-between">
          <div className="flex items-center mb-2">
            <span className="text-2xl font-bold mr-2">{agentsUsed}</span>
            <span className="text-gray-700">
              / {formatAgentLimit(agentLimit)} Agents
            </span>
          </div>
          <div className="w-full h-2 bg-white rounded-full">
            <div
              className={`h-2 rounded-full ${
                agentLimit === 9999 ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{
                width:
                  agentLimit === 9999
                    ? "100%" // For unlimited plans, show a full green bar
                    : selectedAgent === "All Agents"
                    ? `${Math.min((totalAgents / agentLimit) * 100, 100)}%`
                    : `${
                        usageData &&
                        usageData.usage.totalTokensUsedAllAgents > 0
                          ? (selectedAgentTokens /
                              usageData.usage.totalTokensUsedAllAgents) *
                            100
                          : 0
                      }%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Usage History */}
      <div>
        <h3 className="text-lg font-bold mb-2">Usage History</h3>
        <div className="border rounded-lg bg-white min-h-[220px] mb-2 overflow-hidden">
          {/* Chart */}
          <div className="pt-6 px-4 h-44 flex items-end justify-around">
            {usageHistory.map((day, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-end h-full"
              >
                <div className="text-xs text-gray-500 mb-1 min-h-[16px]">
                  {day.usage > 0 ? day.usage + " tokens" : ""}
                </div>
                <div
                  className="w-16 bg-blue-400 rounded-t"
                  style={{
                    height: `${(day.usage / maxUsage) * 80}%`,
                    minHeight: day.usage > 0 ? "4px" : "0",
                  }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex border-t bg-blue-50 text-gray-700 text-sm">
            {usageHistory.map((day, index) => (
              <div
                key={index}
                className="flex-1 text-center py-2 px-1 truncate"
              >
                {day.date}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Usage;
