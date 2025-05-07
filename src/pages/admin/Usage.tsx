import React, { useState, useEffect } from "react";
import { getClientUsage } from "../../lib/serverActions";
import { useAdminStore } from "../../store/useAdminStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

// Interface for usage data from API
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
  };
  totalAgentCount: number;
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
  const [agentsList, setAgentsList] = useState<{id: string, name: string}[]>([]);
  const [usageHistory, setUsageHistory] = useState<{date: string, usage: number}[]>([]);
  const [selectedAgentTokens, setSelectedAgentTokens] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(""); 
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); 

  useEffect(() => {
    const systemYear = new Date().getFullYear();
    
    const initialData = [
      { date: "2022", usage: 0 },
      { date: "2023", usage: 0 },
      { date: "2024", usage: 0 },
      { date: systemYear.toString(), usage: 5000 }, 
      { date: (systemYear + 1).toString(), usage: 0 }
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
          
          setTotalAgents(usageData.totalAgentCount);
          
          const agents = usageData.usage.agentUsage.map(agent => ({
            id: agent.agentId,
            name: agent.agentName
          }));
          setAgentsList(agents);
          
          setAgentsUsed(usageData.totalAgentCount);
          
          if (usageData.usage.agentUsage.length > 0 && 
              usageData.usage.agentUsage[0].usageData && 
              usageData.usage.agentUsage[0].usageData.length > 0) {
            
            const dateStr = usageData.usage.agentUsage[0].usageData[0].date; 
            const dateParts = /(\d{2})([A-Z]{3})(\d{4})/.exec(dateStr);
            
            if (dateParts) {
              const [_, day, monthStr, year] = dateParts;
              setCurrentMonth(monthStr);
              setCurrentYear(parseInt(year));
            }
          }
          
          setTimeout(() => {
            generateUsageHistory(usageData, "All Agents", timeFrame);
          }, 100);
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

  const getMonthName = (monthAbbr: string) => {
    const monthMap: { [key: string]: string } = {
      'JAN': 'January',
      'FEB': 'February',
      'MAR': 'March',
      'APR': 'April',
      'MAY': 'May',
      'JUN': 'June',
      'JUL': 'July',
      'AUG': 'August',
      'SEP': 'September',
      'OCT': 'October',
      'NOV': 'November',
      'DEC': 'December'
    };
    
    return monthMap[monthAbbr] || monthAbbr;
  };

  const getMonthIndex = (monthAbbr: string) => {
    const monthMap: { [key: string]: number } = {
      'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
      'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
    };
    
    return monthMap[monthAbbr] || 0;
  };

  const generateUsageHistory = (data: ClientUsageData, agent: string, timeFrame: string) => {
    if (!data) return;
    
    if (!currentMonth && data.usage.agentUsage.length > 0 && 
        data.usage.agentUsage[0].usageData && 
        data.usage.agentUsage[0].usageData.length > 0) {
      
      const dateStr = data.usage.agentUsage[0].usageData[0].date;
      const dateParts = /(\d{2})([A-Z]{3})(\d{4})/.exec(dateStr);
      
      if (dateParts) {
        const [_, day, monthStr, year] = dateParts;
        setCurrentMonth(monthStr);
        setCurrentYear(parseInt(year));
      }
    }
    
    const monthToUse = currentMonth || 'APRIL'; 
    const yearToUse = currentYear || new Date().getFullYear(); 
    const monthName = getMonthName(monthToUse);
    const monthIndex = getMonthIndex(monthToUse);

    let relevantAgents = data.usage.agentUsage;
    let agentUsageAmount = data.usage.totalTokensUsedAllAgents;
    
    if (agent !== "All Agents") {
      const selectedAgentData = relevantAgents.find(a => a.agentName === agent);
      
      if (selectedAgentData) {
        agentUsageAmount = selectedAgentData.totalTokensUsed;
        setCreditsUsed(selectedAgentData.totalTokensUsed);
        setAgentsUsed(1);
        setSelectedAgentTokens(selectedAgentData.totalTokensUsed);
      } else {
        agentUsageAmount = 0;
        setCreditsUsed(0);
        setAgentsUsed(0);
        setSelectedAgentTokens(0);
      }
    } else {
      agentUsageAmount = data.usage.totalTokensUsedAllAgents;
      setCreditsUsed(data.usage.totalTokensUsedAllAgents);
      setAgentsUsed(data.totalAgentCount);
      setSelectedAgentTokens(data.usage.totalTokensUsedAllAgents);
    }
    
    let result: {date: string, usage: number}[] = [];
    
    switch (timeFrame) {
      case "Today":
        const today7Days = [];
        
        for (let i = 1; i <= 7; i++) {
          today7Days.push({
            date: `${monthName.substring(0, 3)} ${i}`,
            usage: i === 7 ? agentUsageAmount : 0 
          });
        }
        
        result = today7Days;
        break;
        
      case "This Week":
        const weekBreaks = [7, 14, 21, 28];
        const weeklyData = weekBreaks.map((weekDay, index) => ({
          date: `${monthName.substring(0, 3)} ${weekDay}`,
          usage: index === 0 ? agentUsageAmount : 0 
        }));
        
        result = weeklyData;
        break;
        
      case "This Month":
        const months = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        
        const monthData = months.map((month, index) => ({
          date: month,
          usage: index === monthIndex ? agentUsageAmount : 0 
        }));
        
        result = monthData;
        break;
        
      case "This Year":
        const years = [];
        
        for (let year = 2022; year <= yearToUse + 1; year++) {
          years.push({
            date: year.toString(),
            usage: year === yearToUse ? agentUsageAmount : 0 
          });
        }
        
        result = years;
        break;
        
      case "All Time":
        const allTimeYears = [];
        
        for (let year = 2022; year <= yearToUse + 1; year++) {
          allTimeYears.push({
            date: year.toString(),
            usage: year === yearToUse ? agentUsageAmount : 0
          });
        }
        
        result = allTimeYears;
        break;
        
      default:
        const defYears = [];
        
        for (let year = 2022; year <= yearToUse + 1; year++) {
          defYears.push({
            date: year.toString(),
            usage: year === yearToUse ? agentUsageAmount : 0
          });
        }
        
        result = defYears;
    }
    
    setUsageHistory(result);
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

  const maxUsage = Math.max(...usageHistory.map(day => day.usage), 1);

  if (loading && !usageData) {
    return (
      <div className="p-8 max-w-6xl mx-auto flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Usage</h1>
      
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Current Plan */}
        <div className="bg-green-100 rounded-lg p-4 flex flex-col justify-between w-56">
          <span className="text-xs text-gray-600 mb-1">Current Plan</span>
          <span className="font-bold text-lg mb-3">{currentPlan || "FREE"}</span>
          <button 
            onClick={navigateToPlans}
            className="bg-white border border-green-300 text-green-900 font-semibold px-4 py-1 rounded shadow hover:bg-green-200 w-full">
            VIEW
          </button>
        </div>
        
        {/* Credits Used */}
        <div className="bg-blue-100 rounded-lg p-4 flex-1 flex flex-col justify-between">
          <div className="flex items-center mb-2">
            <span className="text-2xl font-bold mr-2">{creditsUsed}</span>
            <span className="text-gray-700">/ {totalCredits} Credits used</span>
          </div>
          <div className="w-full h-2 bg-white rounded-full">
            <div
              className="h-2 bg-blue-500 rounded-full"
              style={{ width: `${totalCredits > 0 ? (creditsUsed / totalCredits) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
        
        {/* Agents Used */}
        <div className="bg-blue-100 rounded-lg p-4 flex-1 flex flex-col justify-between">
          <div className="flex items-center mb-2">
            <span className="text-2xl font-bold mr-2">{agentsUsed}</span>
            <span className="text-gray-700">/ {totalAgents} Agents</span>
          </div>
          <div className="w-full h-2 bg-white rounded-full">
            <div
              className="h-2 bg-blue-500 rounded-full"
              style={{ 
                width: selectedAgent === "All Agents" 
                  ? "100%" 
                  : `${usageData && usageData.usage.totalTokensUsedAllAgents > 0 
                      ? (selectedAgentTokens / usageData.usage.totalTokensUsedAllAgents) * 100 
                      : 0}%` 
              }}
            ></div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col gap-2 w-56">
          <select
            className="border border-blue-300 rounded px-3 py-2 bg-blue-100 text-gray-800 mb-2"
            value={selectedAgent}
            onChange={handleAgentChange}
          >
            <option>All Agents</option>
            {agentsList.map(agent => (
              <option key={agent.id}>{agent.name}</option>
            ))}
          </select>
          <select
            className="border border-blue-300 rounded px-3 py-2 bg-blue-100 text-gray-800"
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
      
      {/* Usage History */}
      <div>
        <h3 className="text-lg font-bold mb-2">Usage History</h3>
        <div className="border rounded-lg bg-white min-h-[220px] mb-2 overflow-hidden">
          {/* Chart */}
          <div className="pt-6 px-4 h-44 flex items-end justify-around">
            {usageHistory.map((day, index) => (
              <div key={index} className="flex flex-col items-center justify-end h-full">
                <div className="text-xs text-gray-500 mb-1 min-h-[16px]">
                  {day.usage > 0 ? day.usage + ' tokens' : ''}
                </div>
                <div 
                  className="w-16 bg-blue-400 rounded-t" 
                  style={{ 
                    height: `${(day.usage / maxUsage) * 80}%`, 
                    minHeight: day.usage > 0 ? '4px' : '0' 
                  }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex border-t bg-blue-50 text-gray-700 text-sm">
            {usageHistory.map((day, index) => (
              <div key={index} className="flex-1 text-center py-2 px-1 truncate">{day.date}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Usage;
