import React, { useEffect, useState } from "react";
import { useBotConfig } from "../../../../store/useBotConfig";
import { PERSONALITY_OPTIONS } from "../../../../utils/constants";
import styled from "styled-components";
import { getClientAnalytics } from "../../../../lib/serverActions";
import { useAdminStore } from "../../../../store/useAdminStore";
import { AnalyticsData } from "../../../../types";
import { useNavigate } from "react-router-dom";

const timeButton = [
  { id: "Income", value: "1D" },
  { id: "Orders Received", value: "7D" },
  { id: "Credits Used", value: "30D" },
  { id: "Leads", value: "Custom" },
];

const Button = styled.button`
  position: relative;
  background: #4d65ff;
  padding: 0.2vh 1vw;
  border: 2px solid black;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 15px);
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
  const [selectedLabel, setSelectedLabel] = useState("Income");
  const [selectedButton, setSelectedButton] = useState(timeButton[0]?.id || "");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { activeBotId, activeBotData } = useBotConfig();
  const { adminId, clientData } = useAdminStore();
  const [agentPicture, setAgentPicture] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!adminId) return;

      try {
        setIsLoading(true);
        setError(null);
        const data = await getClientAnalytics(adminId);
        setAnalyticsData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch analytics"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [adminId]);

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

  const analytics = [
    {
      label: "Income",
      value: analyticsData?.totalIncome,
    },
    {
      label: "Orders Received",
      value: analyticsData?.ordersReceived,
    },
    {
      label: "Credits Used",
      value: 0,
    },
    {
      label: "Leads",
      value: analyticsData?.leadsReceived,
    },
    {
      label: "Bookings",
      value: analyticsData?.bookingsReceived,
    },
  ];

  return (
    <div className="overflow-scroll h-[100%]">
      {/* Top Section: Agent Info and Plan */}
      <div className="p-6 flex flex-col sm:flex-row sm:items-end lg:items-start xl:items-end gap-6 sm:gap-2 md:gap-6 mb-6 items-start justify-between">
        <div>
          {/* Profile Image Upload */}
          <div className="flex items-center pb-2 gap-4">
            <div className="w-16 h-16 lg:h-16 lg:w-16 shadow-[1px_1px_4px_0_#0C0C0D0D] outline outline-[1px] outline-offset-4 rounded-full bg-white flex items-center justify-center overflow-hidden">
              <img
                src={agentPicture || ""}
                alt="Agent"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="font-semibold text-lg">
              {activeBotData?.name || "Agent Name"}
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-2 mt-3">
            {/* current plan */}
            <div className="flex justify-between items-center gap-16 border border-gray-400 rounded-lg px-3 py-3">
              <div className="text-xs flex flex-col items-start justify-center">
                <span className="whitespace-nowrap text-gray-500 font-semibold text-sm">
                  Current Plan
                </span>
                <span className="font-medium text-lg">
                  {analyticsData?.planId}
                </span>
              </div>
              <div className="relative z-10">
                <Button
                  onClick={() => {
                    navigate("/admin/account/plans");
                  }}
                  style={{
                    background: "#6aff97",
                    color: "#000",
                    minWidth: 100,
                  }}
                >
                  Upgrade
                </Button>
              </div>
            </div>
            {/* payments setup */}
            <div className="flex justify-between items-center gap-16 border border-gray-400 rounded-lg px-3 py-3">
              <div className="text-xs flex flex-col items-start justify-center">
                <span className="whitespace-nowrap text-gray-500 font-semibold text-sm">
                  Payments Setup
                </span>
                <span className="font-medium text-lg">
                  {clientData?.paymentMethods.stripe.isActivated
                    ? "Stripe"
                    : "None"}
                </span>
              </div>
              <div className="relative z-10">
                <Button
                  onClick={() => {
                    navigate("/admin/account/payments");
                  }}
                  style={{
                    background: "#6aff97",
                    color: "#000",
                    minWidth: 100,
                  }}
                >
                  Modify
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 lg:flex-col xl:flex-row w-full sm:w-fit">
          <div className="flex flex-col items-center bg-[#EAEFFF] rounded-lg px-4 py-8 sm:py-4 min-w-36 w-full sm:w-fit">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg
                className="absolute top-[-1.5px] left-[-2px]"
                width="52"
                height="52"
                viewBox="0 0 71 71"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g filter="url(#filter0_d_5068_3436)">
                  <rect
                    x="9.27344"
                    y="9.53906"
                    width="50.1885"
                    height="50.1885"
                    rx="25.0943"
                    fill="white"
                  />
                  <rect
                    x="9.77344"
                    y="10.0391"
                    width="49.1885"
                    height="49.1885"
                    rx="24.5943"
                    stroke="black"
                  />
                </g>
                <path
                  d="M34.8312 6.60821C53.8154 8.29096 61.9708 22.7212 62.4349 36.7213"
                  stroke="#4D65FF"
                  stroke-width="5"
                  stroke-linecap="round"
                />
                <g filter="url(#filter1_d_5068_3436)">
                  <rect
                    x="3.5"
                    y="3.76562"
                    width="61.7356"
                    height="61.7356"
                    rx="30.8678"
                    stroke="black"
                  />
                </g>
              </svg>
              <span className="text-sm font-semibold z-10">25%</span>
            </div>
            <div className="text-xs text-black my-2 text-center ">
              Agent Smartness
            </div>
            <div className="relative z-10">
              <Button
                onClick={() => {
                  navigate("/admin/dashboard/brain");
                }}
                style={{
                  background: "#6aff97",
                  color: "#000",
                }}
              >
                Smarten
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center bg-[#EAEFFF] rounded-lg px-4 py-8 sm:py-4 min-w-36 w-full sm:w-fit">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg
                className="absolute top-[-1.5px] left-[-2px]"
                width="52"
                height="52"
                viewBox="0 0 71 71"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g filter="url(#filter0_d_5068_3436)">
                  <rect
                    x="9.27344"
                    y="9.53906"
                    width="50.1885"
                    height="50.1885"
                    rx="25.0943"
                    fill="white"
                  />
                  <rect
                    x="9.77344"
                    y="10.0391"
                    width="49.1885"
                    height="49.1885"
                    rx="24.5943"
                    stroke="black"
                  />
                </g>
                <path
                  d="M34.8312 6.60821C53.8154 8.29096 61.9708 22.7212 62.4349 36.7213"
                  stroke="#4D65FF"
                  stroke-width="5"
                  stroke-linecap="round"
                />
                <g filter="url(#filter1_d_5068_3436)">
                  <rect
                    x="3.5"
                    y="3.76562"
                    width="61.7356"
                    height="61.7356"
                    rx="30.8678"
                    stroke="black"
                  />
                </g>
              </svg>
              <span className="text-sm font-semibold z-10">25%</span>
            </div>
            <div className="text-xs text-black my-2 text-center">
              Brain Capacity
            </div>
            <div className="relative z-10">
              <Button
                onClick={() => {
                  navigate("/admin/dashboard/brain");
                }}
                style={{
                  background: "#6aff97",
                  color: "#000",
                }}
              >
                Modify
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Analytics Section */}
      <div className="p-6 bg-[#e9edfc] sm:rounded-xl">
        {/* <div className="flex gap-2 mb-4 justify-center sm:justify-start">
          {timeButton.map((timeBtn) => (
            <button
              key={timeBtn.id}
              className={`px-4 py-1 rounded font-semibold rounded-lg
                ${
                  selectedButton === timeBtn.id
                    ? "bg-black text-[#AEB8FF]"
                    : "bg-transparent border border-black text-black"
                }
              `}
              onClick={() => setSelectedButton(timeBtn.id)}
            >
              {timeBtn.value}
            </button>
          ))}
        </div> */}
        <div className="mb-4 font-semibold text-lg">Your Analytics</div>

        {isLoading ? (
          <div className="flex justify-center items-center h-56">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4">{error}</div>
        ) : (
          <>
            <div className="flex gap-4 mb-6 flex-wrap">
              {analytics.map((item) => (
                <div
                  key={item.label}
                  onClick={() => setSelectedLabel(item.label)}
                  className={`rounded-lg px-6 py-4 flex flex-col items-center min-w-[160px] w-full xs:w-fit cursor-pointer transition-colors border
                    ${
                      selectedLabel === item.label
                        ? "bg-[#AEB8FF] border-[#4D65FF]"
                        : "bg-[#D4DEFF] border-[#AEB8FF]"
                    }`}
                >
                  <div className="text-2xl font-semibold">{item.value}</div>
                  <div className="text-xs text-black mt-1">{item.label}</div>
                </div>
              ))}
            </div>
            {/* Chart Placeholder */}
            <div className="bg-white rounded border border-gray-300 h-56 flex items-center justify-center">
              <span className="text-gray-400">Charts Coming Soon</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Overview;
