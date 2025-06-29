import React, { useState, useEffect, useRef } from "react";
import { useAdminStore } from "../../../../store/useAdminStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ChevronDown,
  Loader2,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
} from "lucide-react";
import { getStripeBillingSession } from "../../../../lib/serverActions";
import { useUsageData } from "../../../../hooks/useUsageData";

const timeFrames = [
  "All Time",
  "This Year",
  "This Month",
  "This Week",
  "Today",
];

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

interface ClientData {
  availableCredits: number;
  creditsPerMonth: number;
  planId: string;
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
  const { adminId, clientUsage, fetchClientUsage, clientData, activeTeamId } =
    useAdminStore();

  const {
    creditsUsed,
    totalCredits,
    availableCredits,
    totalAgents,
    agentLimit,
    totalTokens,
    formatAgentLimit,
  } = useUsageData();

  const [selectedAgent, setSelectedAgent] = useState("All Agents");
  const [timeFrame, setTimeFrame] = useState("All Time");
  const [currentPlan, setCurrentPlan] = useState("");
  const [agentsUsed, setAgentsUsed] = useState(0);
  const [usageData, setUsageData] = useState<ClientUsageData | null>(null);

  const [loading, setLoading] = useState(true);
  const [agentsList, setAgentsList] = useState<{ id: string; name: string }[]>(
    []
  );
  const [usageHistory, setUsageHistory] = useState<
    { date: string; usage: number }[]
  >([]);
  const [selectedAgentTokens, setSelectedAgentTokens] = useState(0);
  const [allDailyUsage, setAllDailyUsage] = useState<DailyUsage[]>([]);
  const [dataInitialized, setDataInitialized] = useState(false);

  const agentDropdownRef = useRef(null);
  const timeDropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        agentDropdownRef.current &&
        !agentDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAgentDropdownOpen(false);
      }

      if (
        timeDropdownRef.current &&
        !timeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    if (activeTeamId) {
      fetchClientUsage({ clientId: activeTeamId });
    }
  }, [activeTeamId]);

  useEffect(() => {
    const fetchUsageData = async () => {
      if (!activeTeamId) return;

      try {
        setLoading(true);

        if (!clientUsage) return;
        setUsageData(clientUsage);
        setAgentsUsed(clientUsage.totalAgentCount);

        const agents = clientUsage.usage.agentUsage.map((agent) => ({
          id: agent.agentId,
          name: agent.agentName,
        }));
        setAgentsList(agents);

        const dailyUsageCollection: DailyUsage[] = [];

        clientUsage.usage.agentUsage.forEach((agent) => {
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

        if (clientData) {
          setCurrentPlan(clientData.planId);
        } else if (clientUsage.usage.planId) {
          setCurrentPlan(clientUsage.usage.planId);
        }

        generateUsageHistory(clientUsage, "All Agents", timeFrame);
        setDataInitialized(true);
      } catch (err) {
        console.error("Error fetching usage data:", err);
        toast.error("Failed to load usage data");
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, [activeTeamId, clientUsage]);

  useEffect(() => {
    if (dataInitialized && usageData) {
      generateUsageHistory(usageData, selectedAgent, timeFrame);
    }
  }, [dataInitialized]);

  useEffect(() => {
    if (clientUsage) setUsageData(clientUsage);
  }, [clientUsage]);

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

        setAgentsUsed(1);
        setSelectedAgentTokens(selectedAgentData.totalTokensUsed);
      } else {
        agentDailyUsage = [];
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

        const today = new Date();
        const todayDay = today.getDate();
        const todayYear = today.getFullYear();

        const monthNames = [
          "JAN",
          "FEB",
          "MAR",
          "APR",
          "MAY",
          "JUN",
          "JUL",
          "AUG",
          "SEP",
          "OCT",
          "NOV",
          "DEC",
        ];
        const todayMonth = monthNames[today.getMonth()];

        const startDay = Math.max(1, todayDay - 6);

        for (let day = startDay; day <= todayDay; day++) {
          const dayUsage = agentDailyUsage
            .filter(
              (d) =>
                d.day === day && d.month === todayMonth && d.year === todayYear
            )
            .reduce((sum, d) => sum + d.usage, 0);

          lastDays.push({
            date: `${getMonthName(todayMonth).substring(0, 3)} ${day}`,
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

  const handleAgentChange = (agentName: string) => {
    setSelectedAgent(agentName);
    if (usageData) {
      generateUsageHistory(usageData, agentName, timeFrame);
    }
  };

  const handleTimeFrameChange = (newTimeFrame: string) => {
    setTimeFrame(newTimeFrame);
    if (usageData) {
      generateUsageHistory(usageData, selectedAgent, newTimeFrame);
    }
  };

  const navigate = useNavigate();
  const navigateToPlans = () => {
    navigate("/admin/account/plans");
  };

  const handleBillingHistory = async () => {
    if (!activeTeamId || !adminId) return;
    try {
      setBillingLoading(true);
      const url = await getStripeBillingSession(adminId, activeTeamId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error("Failed to open Stripe Billing");
    } finally {
      setBillingLoading(false);
    }
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
    <div className="p-4 sm:p-6 mx-auto">
      <div className="mt-8 sm:mt-0 flex flex-col items-center sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h1 className="text-xl font-bold">Usage</h1>
        {/* Filters */}
        <div className="flex flex-row justify-center gap-2 w-full sm:w-auto">
          {/* agent drop down  */}
          <div
            className="relative w-30 xs:w-48 flex items-center z-[10]"
            ref={agentDropdownRef}
          >
            <button
              onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
              className="w-full px-3 py-2 border border-[#7D7D7D] text-sm focus:outline-none rounded-sm flex justify-between items-center bg-white"
            >
              {selectedAgent || "All Agents"}
            </button>
            <div
              onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
              className="icon bg-[#AEB8FF] px-2 py-2 border border-[#7D7D7D] border-l-0"
            >
              <ChevronDown
                size={20}
                className={`text-[#000000] stroke-[3px] transition-transform ${
                  isAgentDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>
            {isAgentDropdownOpen && (
              <div className="absolute z-10 mt-1 top-8 w-full bg-white border border-[#7D7D7D] shadow-sm rounded-sm">
                <button
                  onClick={() => {
                    handleAgentChange("All Agents");
                    setIsAgentDropdownOpen(false);
                  }}
                  className={`whitespace-nowrap w-full text-left px-3 py-2 text-sm hover:bg-blue-100 transition-colors ${
                    selectedAgent === "All Agents" ? "bg-[#AEB8FF]" : ""
                  }`}
                >
                  All Agents
                </button>
                {agentsList.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => {
                      handleAgentChange(agent.name);
                      setIsAgentDropdownOpen(false);
                    }}
                    className={`whitespace-nowrap w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      selectedAgent === agent.name ? "bg-[#AEB8FF]" : ""
                    }`}
                  >
                    {agent.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* all time drop down  */}
          <div
            className="relative w-30 xs:w-48 flex items-center z-[10]"
            ref={timeDropdownRef}
          >
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full px-3 py-2 border border-[#7D7D7D] text-sm focus:outline-none rounded-sm flex justify-between items-center bg-white"
            >
              {timeFrame}
            </button>
            <div className="icon bg-[#AEB8FF] px-2 py-2 border border-[#7D7D7D] border-l-0">
              <ChevronDown
                onClick={() => setIsOpen(!isOpen)}
                size={20}
                className={`text-[#000000] stroke-[3px] transition-transform  ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {isOpen && (
              <div className="absolute z-10 mt-1 top-8 w-full bg-white border border-[#7D7D7D] shadow-sm rounded-sm">
                {timeFrames.map((frame) => (
                  <button
                    key={frame}
                    onClick={() => {
                      handleTimeFrameChange(frame);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      timeFrame === frame ? "bg-[#AEB8FF]" : ""
                    }`}
                  >
                    {frame}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 w-full">
        {/* Current Plan */}
        <div className="bg-[#CEFFDC] rounded-lg p-4 flex flex-col justify-between flex-1 w-[220px] max-w-[100%] basis-[220px]">
          <span className="text-xs text-gray-600 mb-1">Current Plan</span>
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg">{currentPlan || "FREE"}</span>
            <div className="relative z-[5] ">
              <div className="absolute top-[3.5px] left-[3px] -z-10 bg-[#6AFF97] border border-black w-full h-full"></div>
              <button
                style={{
                  fontSize: "clamp(8px,4vw, 15px)",
                  fontWeight: "400",
                }}
                onClick={navigateToPlans}
                className="bg-[#6AFF97] para-font border border-black text-black px-4 py-1 min-w-[120px]"
              >
                VIEW
              </button>
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-[#CEFFDC] rounded-lg p-4 flex flex-col justify-between flex-1 w-[220px] max-w-[100%] basis-[220px]">
          <span className="text-xs text-gray-600 mb-1">Billing History</span>
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg">Stripe</span>
            <div className="relative z-[5] ">
              <div className="absolute top-[3.5px] left-[3px] -z-10 bg-[#6AFF97] border border-black w-full h-full"></div>
              <button
                style={{
                  fontSize: "clamp(8px,4vw, 15px)",
                  fontWeight: "400",
                }}
                onClick={handleBillingHistory}
                disabled={billingLoading}
                className="bg-[#6AFF97] para-font border border-black text-black px-4 py-1 min-w-[120px]"
              >
                {billingLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-3 w-4 animate-spin" /> Loading...
                  </span>
                ) : (
                  "VIEW"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Credits Used - Enhanced */}
        <div className="bg-[#D4DEFF] rounded-lg p-4 flex flex-col justify-between flex-1 w-[220px] max-w-[100%] basis-[220px]">
          <div className="flex items-center mb-2">
            <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
            <span className="text-2xl font-bold mr-2">
              {selectedAgent === "All Agents"
                ? creditsUsed.toLocaleString()
                : selectedAgentTokens.toLocaleString()}
            </span>
            <span className="text-gray-700">
              {selectedAgent === "All Agents"
                ? totalCredits > 0
                  ? `/ ${totalCredits.toLocaleString()} Credits used`
                  : "Credits used"
                : "Tokens used"}
            </span>
          </div>
          {selectedAgent === "All Agents" && totalCredits > 0 && (
            <div className="w-full h-3 bg-white rounded-full shadow-[inset_0_3px_3px_0_rgba(0,0,0,0.25)]">
              <div
                className="h-3 bg-[#4D65FF] border border-black rounded-full"
                style={{
                  width: `${
                    totalCredits > 0 ? (creditsUsed / totalCredits) * 100 : 0
                  }%`,
                }}
              ></div>
            </div>
          )}
          {selectedAgent === "All Agents" && (
            <div className="text-xs text-gray-600 mt-1">
              Available: {availableCredits.toLocaleString()} credits
            </div>
          )}
          {selectedAgent !== "All Agents" && (
            <div className="text-xs text-gray-600 mt-1">
              {selectedAgent} usage
            </div>
          )}
        </div>

        {/* Agents Used - Enhanced */}
        <div className="bg-[#D4DEFF] rounded-lg p-4 flex flex-col justify-between flex-1 w-[220px] max-w-[100%] basis-[220px]">
          <div className="flex items-center mb-2">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            <span className="text-2xl font-bold mr-2">{agentsUsed}</span>
            <span className="text-gray-700">
              {selectedAgent === "All Agents"
                ? `/ ${formatAgentLimit(agentLimit)} Agents`
                : "Agent"}
            </span>
          </div>
          {selectedAgent === "All Agents" && (
            <div className="w-full h-3 bg-white rounded-full shadow-[inset_0_3px_3px_0_rgba(0,0,0,0.25)]">
              <div
                className={`h-3 rounded-full ${
                  agentLimit === 9999
                    ? "bg-green-500"
                    : "bg-[#4D65FF] border border-black"
                }`}
                style={{
                  width:
                    agentLimit === 9999
                      ? "100%"
                      : `${Math.min((totalAgents / agentLimit) * 100, 100)}%`,
                }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {/* Agent Usage Breakdown - New Section */}
      {selectedAgent === "All Agents" && usageData && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-4">Agent Usage Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usageData.usage.agentUsage.map((agent) => (
              <div
                key={agent.agentId}
                className="bg-white border rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">
                    {agent.agentName}
                  </h4>
                  <span className="text-sm text-gray-500">
                    ID: {agent.agentId.slice(0, 8)}...
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Total Tokens Used:
                    </span>
                    <span className="font-semibold">
                      {agent.totalTokensUsed.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Usage Sessions:
                    </span>
                    <span className="font-semibold">
                      {agent.usageData.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          usageData.usage.totalTokensUsedAllAgents > 0
                            ? (agent.totalTokensUsed /
                                usageData.usage.totalTokensUsedAllAgents) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {usageData.usage.totalTokensUsedAllAgents > 0
                      ? `${(
                          (agent.totalTokensUsed /
                            usageData.usage.totalTokensUsedAllAgents) *
                          100
                        ).toFixed(1)}% of total usage`
                      : "0% of total usage"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage History */}
      <div className="w-[92vw] lg:w-full">
        <h3 className="text-lg font-bold mb-2">Usage History</h3>
        <div className="border rounded-lg bg-white min-h-[220px] mb-2 w-[200px] min-w-full overflow-x-auto">
          {/* Chart */}
          <div className="">
            <div
              className={`pt-6 px-4 h-44 flex items-end gap-2`}
              style={{ minWidth: 0 }}
            >
              {usageHistory.map((day, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center justify-end h-full ${
                    usageHistory.length <= 7 ? "flex-1" : "min-w-[48px]"
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1 min-h-[16px] whitespace-nowrap">
                    {day.usage > 0 ? day.usage + " tokens" : ""}
                  </div>
                  <div
                    className="w-8 sm:w-16 bg-blue-400 rounded-t"
                    style={{
                      height: `${(day.usage / maxUsage) * 80}%`,
                      minHeight: day.usage > 0 ? "4px" : "0",
                    }}
                  ></div>
                </div>
              ))}
            </div>
            <div
              className={`flex border-t bg-blue-50 text-gray-700 text-sm gap-2 px-4`}
              style={{ minWidth: 0 }}
            >
              {usageHistory.map((day, index) => (
                <div
                  key={index}
                  className={`text-center py-2 px-1 whitespace-nowrap ${
                    usageHistory.length <= 7 ? "flex-1" : "min-w-[48px]"
                  }`}
                >
                  {day.date}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Usage;
