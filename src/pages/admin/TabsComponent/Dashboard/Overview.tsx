import React, { useEffect, useState } from "react";
import { useBotConfig } from "../../../../store/useBotConfig";
import { PERSONALITY_OPTIONS } from "../../../../utils/constants";
import styled from "styled-components";

const analytics = [
  { label: "Income", value: "$21.00" },
  { label: "Orders Received", value: "123" },
  { label: "Credits Used", value: "16/2000" },
  { label: "Leads", value: "12" },
  { label: "Bookings", value: "32" },
];

const Button = styled.button`
  position: relative;
  background: #4d65ff;
  padding: 0.6vh 1vw;
  border: 2px solid black;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 16px);
  color: white;
  &::before {
    content: "";
    position: absolute;
    top: 5px;
    right: -5px;
    width: 100%;
    height: 100%;
    border: 2px solid #000000;
    z-index: -1; // place it behind the button
    background: #6aff97;
  }
  @media (max-width: 600px) {
    min-width: 100px;
  }
  &:disabled {
    background: #d4deff;
    color: #b0b0b0;
    cursor: not-allowed;
  }
  &:disabled::before {
    background: #d4deff;
  }
`;

const Overview = () => {
  const { activeBotId, activeBotData } = useBotConfig();

  const [agentPicture, setAgentPicture] = useState<string | null>(null);
  useEffect(() => {
    if (activeBotData?.logo) {
      if (agentPicture === activeBotData?.logo) {
        return;
      }
      const logoWithTimestamp = `${activeBotData.logo}?t=${Date.now()}`;
      setAgentPicture(logoWithTimestamp);
    } else if (activeBotData?.personalityType?.name) {
      let voiceName = activeBotData.personalityType.name;

      const logoObj = PERSONALITY_OPTIONS.find(
        (model) => model.title === voiceName
      );

      if (logoObj) {
        setAgentPicture(logoObj.image);
      } else {
        setAgentPicture(
          "https://t4.ftcdn.net/jpg/08/04/36/29/360_F_804362990_0n7bGLz9clMBi5ajG52k8OAUQTneMbj4.jpg"
        );
      }
    }
  }, [activeBotData]);
  return (
    <div className="p-6">
      {/* Top Section: Agent Info and Plan */}
      <div className="flex gap-6 mb-6 items-start justify-between">
        <div>
          {/* Profile Image Upload */}
          <div className="flex items-center pb-2 gap-4">
            <div className="w-16 h-16 lg:h-16 lg:w-16 shadow-[1px_1px_4px_0_#0C0C0D0D] outline outline-[1px] outline-offset-4 rounded-full bg-white flex items-center justify-center overflow-hidden">
              <img
                src={agentPicture}
                alt="Agent"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="font-semibold text-lg">Agent Name</div>
          </div>
          <div className="flex flex-row gap-2 mt-3">
            <div className="flex flex-row justify-between items-center gap-4 border border-gray-400 rounded-lg px-3 py-5">
              <div className="  text-xs flex flex-col items-start justify-center ">
                <span className="text-gray-500 font-semibold text-sm">
                  Current Plan
                </span>
                <span className="font-medium text-lg">Solo</span>
              </div>

              <Button
                onClick={null}
                style={{
                  background: "#6aff97",
                  color: "#000",
                  minWidth: 100,
                  height: 40,
                }}
              >
                Upgrade
              </Button>
            </div>
            <div className="flex flex-row justify-between items-center gap-4 border border-gray-400 rounded-lg px-3 py-5">
              <div className="  text-xs flex flex-col items-start justify-center ">
                <span className="text-gray-500 font-semibold text-sm">
                  Payments Setup
                </span>
                <span className="font-medium text-lg">Stripe</span>
              </div>

              <Button
                onClick={null}
                style={{
                  background: "#6aff97",
                  color: "#000",
                  minWidth: 100,
                  height: 40,
                }}
              >
                Modify
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col items-center bg-white border border-gray-200 rounded p-4 w-36">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="absolute top-0 left-0" width="48" height="48">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="#4d65ff"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="125.6"
                  strokeDashoffset="94.2"
                />
              </svg>
              <span className="text-lg font-semibold">25%</span>
            </div>
            <div className="text-xs text-gray-500 mb-2 text-center ">
              Agent Smartness
            </div>
            <button className="bg-[#6aff97] border border-black rounded px-2 py-1 text-xs font-semibold mt-2">
              Smarten
            </button>
          </div>
          <div className="flex flex-col items-center bg-white border border-gray-200 rounded p-4 w-32">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="absolute top-0 left-0" width="48" height="48">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="#4d65ff"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="125.6"
                  strokeDashoffset="94.2"
                />
              </svg>
              <span className="text-lg font-semibold">25%</span>
            </div>
            <div className="text-xs text-gray-500 mb-2">Brain Capacity</div>
            <button className="bg-[#6aff97] border border-black rounded px-2 py-1 text-xs font-semibold mt-2">
              Modify
            </button>
          </div>
        </div>
      </div>
      {/* Analytics Section */}
      <div className="bg-[#e9edfc] rounded-xl p-6">
        {/* <div className="flex gap-2 mb-4">
          <button className="bg-black text-white px-4 py-1 rounded font-semibold">
            1d
          </button>
          <button className="bg-white border border-gray-300 px-4 py-1 rounded font-semibold">
            7d
          </button>
          <button className="bg-white border border-gray-300 px-4 py-1 rounded font-semibold">
            30d
          </button>
          <button className="bg-white border border-gray-300 px-4 py-1 rounded font-semibold">
            Custom
          </button>
        </div> */}
        <div className="mb-4 font-semibold text-lg">Your Analytics</div>
        <div className="flex gap-4 mb-6 flex-wrap">
          {analytics.map((item) => (
            <div
              key={item.label}
              className="bg-[#bfcfff] rounded-lg px-6 py-4 flex flex-col items-center min-w-[160px]"
            >
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="text-xs text-gray-700 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
        {/* Chart Placeholder */}
        <div className="bg-white rounded border border-gray-300 h-56 flex items-center justify-center">
          <span className="text-gray-400">[Analytics Chart]</span>
        </div>
      </div>
    </div>
  );
};

export default Overview;
