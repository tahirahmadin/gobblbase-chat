import React, { useState } from "react";

const Usage = () => {
  // Placeholder state
  const [agent, setAgent] = useState("All Agents");
  const [time, setTime] = useState("All Time");
  const creditsUsed = 8;
  const totalCredits = 100;
  const agentsUsed = 1;
  const totalAgents = 1;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Usage</h2>
      <div className="flex flex-wrap gap-4 mb-8 items-center">
        {/* Current Plan */}
        <div className="bg-green-100 rounded-lg p-4 flex flex-col justify-between min-w-[200px]">
          <span className="text-xs text-gray-600 mb-1">Current Plan</span>
          <span className="font-bold text-lg mb-2">STARTER</span>
          <button className="bg-white border border-green-300 text-green-900 font-semibold px-4 py-1 rounded shadow hover:bg-green-200">
            VIEW
          </button>
        </div>
        {/* Credits Used */}
        <div className="bg-blue-100 rounded-lg p-4 flex-1 min-w-[220px] flex flex-col justify-between">
          <div className="flex items-center mb-2">
            <span className="text-2xl font-bold mr-2">{creditsUsed}</span>
            <span className="text-gray-700">/ {totalCredits} Credits used</span>
          </div>
          <div className="w-full h-2 bg-white rounded-full">
            <div
              className="h-2 bg-blue-500 rounded-full"
              style={{ width: `${(creditsUsed / totalCredits) * 100}%` }}
            ></div>
          </div>
        </div>
        {/* Agents Used */}
        <div className="bg-blue-100 rounded-lg p-4 flex-1 min-w-[180px] flex flex-col justify-between">
          <div className="flex items-center mb-2">
            <span className="text-2xl font-bold mr-2">{agentsUsed}</span>
            <span className="text-gray-700">/ {totalAgents} Agents</span>
          </div>
          <div className="w-full h-2 bg-blue-500 rounded-full"></div>
        </div>
        {/* Filters */}
        <div className="flex flex-col gap-2 ml-auto min-w-[220px]">
          <select
            className="border border-blue-300 rounded px-3 py-2 bg-blue-100 text-gray-800 mb-2"
            value={agent}
            onChange={(e) => setAgent(e.target.value)}
          >
            <option>All Agents</option>
            <option>Agent 1</option>
          </select>
          <select
            className="border border-blue-300 rounded px-3 py-2 bg-blue-100 text-gray-800"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          >
            <option>All Time</option>
            <option>This Month</option>
            <option>This Week</option>
          </select>
        </div>
      </div>
      {/* Usage History */}
      <div>
        <h3 className="text-lg font-bold mb-2">Usage History</h3>
        <div className="border rounded-lg bg-white min-h-[220px] mb-2">
          {/* Placeholder for chart/graph */}
          <div className="h-40"></div>
          <div className="flex border-t bg-blue-50 text-gray-700 text-sm">
            <div className="flex-1 text-center py-2">May 1</div>
            <div className="flex-1 text-center py-2">May 2</div>
            <div className="flex-1 text-center py-2">May 3</div>
            <div className="flex-1 text-center py-2">May 4</div>
            <div className="flex-1 text-center py-2">May 5</div>
            <div className="flex-1 text-center py-2">May 6</div>
            <div className="flex-1 text-center py-2">May 7</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Usage;
