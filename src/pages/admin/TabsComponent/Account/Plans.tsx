import React, { useState, useEffect, useRef } from "react";
import {
  getPlans,
  subscribeToPlan,
  getStripeBillingSession,
} from "../../../../lib/serverActions";
import { useAdminStore } from "../../../../store/useAdminStore";
import { toast } from "react-hot-toast";
import { Check, ChevronRight, Loader2, X } from "lucide-react";
import styled from "styled-components";
const WhiteBackground = styled.span`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 60%;
  position: relative;
  z-index: 10;
  width: fit-content;

  span {
    font-family: "DM Sans", sans-serif;
    font-size: clamp(9px, 4vw, 16px);
    font-weight: 600;
    background: white;
    border: 1px solid black;
    width: fit-content;
    height: 100%;
    width: 100%;
    color: black;
    padding: 4vh 2vw;
    border-radius: 60px;
    @media (max-width: 600px) {
      border-radius: 30px;
      padding: 2vh 2vw 2vh 6vw;
    }
    &::before {
      content: "";
      position: absolute;
      transform: translate(-0.4rem, -0.05rem);
      bottom: 0px;
      left: 0;
      width: 0;
      height: 0;
      border-left: 24px solid transparent;
      border-right: 24px solid transparent;
      border-bottom: 24px solid white;
      z-index: 0;
      @media (max-width: 600px) {
        transform: translate(-0.5rem, -0.05rem);
        border-left: 28px solid transparent;
        border-right: 28px solid transparent;
        border-bottom: 28px solid white;
      }
    }
    &::after {
      content: "";
      position: absolute;
      transform: translate(-0.5rem, 0rem);
      bottom: 0px;
      left: 0;
      width: 0;
      height: 0;
      border-left: 30px solid transparent;
      border-right: 30px solid transparent;
      border-bottom: 30px solid black;
      z-index: -4;
      @media (max-width: 600px) {
        transform: translate(-0.65rem, 0);
        border-left: 30px solid transparent;
        border-right: 30px solid transparent;
        border-bottom: 30px solid black;
      }
    }
  }
`;
const PurpleBackground = styled.span`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  position: relative;
  z-index: 10;
  @media (max-width: 600px) {
    padding: 1vh 0 1vh 0;
  }
  span {
    width: fit-content;
    font-family: "DM Sans", sans-serif;
    font-size: clamp(9px, 4vw, 16px);
    font-weight: 600;
    height: 100%;
    border: 1px solid black;
    padding: 1.5vh 2vw;
    background: #aeb8ff;
    color: black;
    border-radius: 40px;
    position: relative;
    &::before {
      content: "";
      position: absolute;
      transform: translate(0.5rem, 0.01rem);
      bottom: 0px;
      right: 0;
      width: 0;
      height: 0;
      border-left: 24px solid transparent;
      border-right: 24px solid transparent;
      border-bottom: 24px solid #aeb8ff;
      z-index: 0;
    }
    &::after {
      content: "";
      position: absolute;
      transform: translate(0.6rem, 0.04rem);
      bottom: 0px;
      right: 0;
      width: 0;
      height: 0;
      border-left: 30px solid transparent;
      border-right: 30px solid transparent;
      border-bottom: 30px solid black;
      z-index: -4;
    }
  }
`;
const GreenBackground = styled.span`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  position: relative;
  z-index: 10;
  @media (max-width: 600px) {
    padding: 1vh 0 1vh 0;
  }
  span {
    width: fit-content;
    font-family: "DM Sans", sans-serif;
    font-size: clamp(9px, 4vw, 16px);
    font-weight: 600;
    height: 100%;
    border: 1px solid black;
    padding: 1.5vh 2vw;
    background: #6aff97;
    color: black;
    border-radius: 40px;
    position: relative;
    &::before {
      content: "";
      position: absolute;
      transform: translate(0.5rem, 0.01rem);
      bottom: 0px;
      right: 0;
      width: 0;
      height: 0;
      border-left: 24px solid transparent;
      border-right: 24px solid transparent;
      border-bottom: 24px solid #6aff97;
      z-index: 0;
    }
    &::after {
      content: "";
      position: absolute;
      transform: translate(0.6rem, 0.04rem);
      bottom: 0px;
      right: 0;
      width: 0;
      height: 0;
      border-left: 30px solid transparent;
      border-right: 30px solid transparent;
      border-bottom: 30px solid black;
      z-index: -4;
    }
  }
`;

const UpgradeButton = styled.button<{
  current?: boolean;
  upgrading?: boolean;
  lowerTier?: boolean;
}>`
  position: relative;
  background: ${(props) =>
    props.current
      ? "#6AFF97"
      : props.upgrading
      ? "#FFFC45"
      : props.lowerTier
      ? "#000000" // yellow-300
      : "#FFFC45"};

  cursor: ${(props) =>
    props.current ? "default" : props.upgrading ? "wait" : "pointer"};
  color: ${(props) =>
    props.current
      ? "#000"
      : props.upgrading
      ? "#000"
      : props.lowerTier
      ? "#fff"
      : "#000"};
  padding: 0.6vh 1vw;
  border: 2px solid black;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 15px);
  border-color: ${(props) =>
    props.upgrading ? "#000  " : props.lowerTier ? "#000" : "#000"};

  &:hover {
    background: ${(props) =>
      props.lowerTier
        ? "rgba(0, 0, 0, 1)" // yellow-400
        : !props.current && !props.upgrading
        ? "rgba(255, 252, 69, 1)" // green-400
        : ""};
  }
  &::before {
    content: "";
    position: absolute;
    top: 5px;
    right: -5px;
    width: 100%;
    height: 100%;
    border: 2px solid #000000;
    z-index: -1; // place it behind the button
    background: ${(props) =>
      props.current
        ? "#6AFF97" // gray-300
        : props.upgrading
        ? "#FFFC45" // green-200
        : props.lowerTier
        ? "#white" // yellow-300
        : "#FFFC45"}; // green-300
  }
  @media (max-width: 600px) {
    min-width: 100px;
  }
  &:disabled {
    cursor: not-allowed;
  }
`;
interface PlanData {
  id: string;
  name: string;
  price: number;
  totalPrice: number;
  currency: string;
  recurrence: string;
  credits: number;
  description: string;
  features: string[];
  isCurrentPlan: boolean;
  type: string;
}

const Plans = () => {
  const { activeTeamId } = useAdminStore();
  const [billing, setBilling] = useState("monthly");
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingLoading, setBillingLoading] = useState(false);
  const [upgradingPlanId, setUpgradingPlanId] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPlans = async () => {
    if (!activeTeamId) return;

    try {
      const response = await getPlans(activeTeamId);

      const currentPlanId = response.find((plan) => plan.isCurrentPlan)?.id;
      const upgradedPlanId = plans.find((plan) => plan.isCurrentPlan)?.id;

      if (currentPlanId !== upgradedPlanId) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      }

      setPlans(response as PlanData[]);

      const currentPlan = (response as PlanData[]).find(
        (plan) => plan.isCurrentPlan
      );
      if (currentPlan) {
        setBilling(currentPlan.recurrence.toLowerCase());
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load plans");
    }
  };

  useEffect(() => {
    if (!activeTeamId) return;

    const initialFetch = async () => {
      try {
        setLoading(true);
        await fetchPlans();
        setLoading(false);
      } catch (error) {
        console.error("Error in initial fetch:", error);
        setLoading(false);
      }
    };

    initialFetch();
  }, [activeTeamId]);

  // Cleanup polling on component unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      toast.success("Payment successful! Your plan has been updated.");
      // Optionally, refresh plans here
    }
  }, []);

  // Find the current plan (any recurrence)
  const currentPlan = plans.find((p) => p.isCurrentPlan);

  // Helper: is this plan the current plan, regardless of recurrence?
  const isCurrentPlanAnyRecurrence = (plan: PlanData): boolean => {
    if (!currentPlan) return false;

    return currentPlan.id === plan.id;
  };

  const filteredPlans = plans.filter(
    (plan) => plan.recurrence.toLowerCase() === billing.toLowerCase()
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const handleUpgrade = async (planId: string) => {
    if (!activeTeamId) return;

    try {
      setUpgradingPlanId(planId);

      // Get Stripe session URL
      const response = await subscribeToPlan(activeTeamId, planId);

      const isBillingUrl = response.isUrl;
      const billingMessage = response.message;

      // Start polling for plan updates
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      if (isBillingUrl) {
        pollingIntervalRef.current = setInterval(async () => {
          await fetchPlans();
        }, 3000); // Poll every 5 seconds
        // Redirect to Stripe payment page
        window.open(billingMessage, "_blank", "noopener,noreferrer");
      } else {
        pollingIntervalRef.current = setInterval(async () => {
          await fetchPlans();
        }, 1000); // Poll every 5 seconds
        toast.success(billingMessage);
      }
    } catch (error) {
      console.error("Error changing plan:", error);
      toast.error(error?.response?.data?.result || "Failed to change plan");
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    } finally {
      setUpgradingPlanId(null);
    }
  };

  const isUpgrading = (planId: string): boolean => {
    return upgradingPlanId === planId;
  };

  const isLowerTierPlan = (plan: PlanData): boolean => {
    const currentPlan = plans.find((p) => p.isCurrentPlan);
    if (!currentPlan) return false;

    return currentPlan.totalPrice > plan.totalPrice;
  };
  const [selectedPlain, setSelectedPlain] = useState(filteredPlans[0]);
  const getPlanDisplayName = (name: string): string => {
    return name.replace("(YEARLY)", "");
  };
  return (
    <div className="py-6 sm:p-6 overflow-auto h-full w-full">
      <div className="flex flex-row justify-between items-center gap-4 mb-8 flex-col lg:flex-row">
        <div className="heading-content text-black w-full px-4 sm:px-0 [@media(max-width:600px)]:flex [@media(max-width:600px)]:flex-col [@media(max-width:600px)]:items-center [@media(max-width:600px)]:text-center ">
          <WhiteBackground>
            <span style={{ width: "fit-content", padding: "1vh 2vw" }}>
              <h2 className="main-font relative z-10 font-[800] text-[1.2rem]">
                Plans & Pricing
              </h2>
            </span>
          </WhiteBackground>
          <p className="para-font text-[1rem] font-[400] mt-4 [@media(min-width:601px)]:w-[70%]">
            Maximize your business potential with Sayy - everything <br /> you
            need to grow your business, the AI way.
          </p>
        </div>

        {/* btns in mobile  */}
        <div className="btns hidden [@media(max-width:600px)]:flex gap-2 py-4">
          {filteredPlans.map((plan) => {
            const displayName = getPlanDisplayName(plan.name);
            return (
              <button
                key={plan.id}
                onClick={() => {
                  const el = document.getElementById(`plan-${plan.id}`);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                  setSelectedPlain(plan);
                }}
                className="para-font bg-[#C1CFFF] min-w-[60px] px-2 py-1 rounded-md border border-black text-black text-[14px] font-bold border"
              >
                {displayName}
              </button>
            );
          })}
        </div>

        {/* line in mobile  */}
        <div className="line hidden [@media(max-width:600px)]:block h-[2px] bg-black w-full relative"></div>

        <div className="flex items-center gap-2 flex-col xs:flex-row">
          <button
            className="px-4 py-1 rounded-2xl border border-purple-600 font-semibold whitespace-nowrap bg-black text-white hover:bg-purple-700 transition-colors duration-200 focus:outline-none"
            onClick={async () => {
              if (!activeTeamId) return;
              try {
                setBillingLoading(true);
                const url = await getStripeBillingSession(activeTeamId);
                window.open(url, "_blank", "noopener,noreferrer");
              } catch (error) {
                toast.error("Failed to open Stripe Billing");
              } finally {
                setBillingLoading(false);
              }
            }}
            disabled={billingLoading}
          >
            {billingLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3 w-4 animate-spin" /> Loading Billing...
              </span>
            ) : (
              "Billing History"
            )}
          </button>
          <div className="flex items-center rounded-full border shadow-[inset_0_4px_4px_0_rgba(0,0,0,0.4)] [@media(max-width:600px)]:my-6 ">
            <button
              className={`px-4 py-1 rounded-full w-[100px] font-semibold focus:outline-none transition-colors duration-200 ${
                billing === "monthly"
                  ? "bg-blue-600 text-white border-2 border-black"
                  : "bg-transparent text-[#656565] border-[none]"
              }`}
              onClick={() => setBilling("monthly")}
              disabled={upgradingPlanId !== null}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-1 w-[100px] rounded-full font-[400] focus:outline-none transition-colors duration-200 ${
                billing === "yearly"
                  ? "bg-blue-600 text-white border-2 border-black"
                  : "bg-transparent text-[#656565] border-[none]"
              }`}
              onClick={() => setBilling("yearly")}
              disabled={upgradingPlanId !== null}
            >
              Yearly
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
          {filteredPlans.map((plan) => {
            // Extract "Everything in ..." pill and features
            const pillFeature = plan.features.find((f) =>
              f.startsWith("everything in")
            );
            const features = plan.features.filter(
              (f) => !f.startsWith("everything in")
            );

            return (
              <div
                id={`plan-${plan.id}`}
                key={plan.id}
                className={`flex flex-col items-center mx-10 sm:mx-0 gap-1 px-2 sm:px-4 py-8 min-h-[600px] relative ${
                  isCurrentPlanAnyRecurrence(plan)
                    ? "bg-[#CEFFDC] border-2 border-[#6AFF97] drop-shadow-[0_9px_9px_rgba(0,0,0,0.4)]"
                    : "bg-[#D4DEFF] border border-black"
                }`}
              >
                {isCurrentPlanAnyRecurrence(plan) && (
                  <span className="para-font font-[600] text-[#6AFF97] absolute -top-1 -left-4 bg-black px-2 py-1 rounded-full rotate-[-20deg]">
                    Current Plan
                  </span>
                )}
                {/* Header */}
                <div className="w-full flex flex-col items-center mt-2 py-2 mb-2 ">
                  {isCurrentPlanAnyRecurrence(plan) ? (
                    <GreenBackground>
                      <span
                        style={{
                          width: "80%",
                          padding: "1vh 2vw",
                          margin: "0 auto",
                        }}
                      >
                        <h1 className="relative z-10 text-center text-[1.3rem]">
                          {plan.type}
                        </h1>
                      </span>
                    </GreenBackground>
                  ) : (
                    <PurpleBackground>
                      <span
                        className="flex items-center justify-center gap-4"
                        style={{
                          width: "80%",
                          padding: "1vh 2vw",
                          margin: "0 auto",
                        }}
                      >
                        <h1 className="relative z-10 text-center text-[1.3rem]">
                          {plan.type}
                        </h1>
                        {plan.type === "PRO" && (
                          <h3 className="bg-white border border-[#0017A9] text-[#0017A9] text-sm font-semibold px-2 py-[2px] rounded-full">
                            Popular
                          </h3>
                        )}
                      </span>
                    </PurpleBackground>
                  )}
                </div>

                {/* Price */}
                <div className="para-font text-[2rem] font-bold text-black">
                  {plan.price === 0 ? "$0" : `$${plan.price}`}
                </div>

                <div className="para-font text-gray-600 mb-4 text-base">
                  per month
                </div>

                {/* Upgrade Button */}
                <div className="relative z-10">
                  <UpgradeButton
                    current={isCurrentPlanAnyRecurrence(plan)}
                    upgrading={isUpgrading(plan.id)}
                    lowerTier={isLowerTierPlan(plan)}
                    disabled={
                      isCurrentPlanAnyRecurrence(plan) || isUpgrading(plan.id)
                    }
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`w-full font-bold uppercase w-[180px]`}
                  >
                    {isCurrentPlanAnyRecurrence(plan) ? (
                      "CURRENT PLAN"
                    ) : isUpgrading(plan.id) ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {isLowerTierPlan(plan)
                          ? "Downgrading..."
                          : "Upgrading..."}
                      </span>
                    ) : isLowerTierPlan(plan) ? (
                      "DOWNGRADE"
                    ) : (
                      "UPGRADE"
                    )}
                  </UpgradeButton>
                </div>

                {/* Divider */}
                {isCurrentPlanAnyRecurrence(plan) ? (
                  <div className="w-full bg-[#000000] my-2 h-[3px] my-8"></div>
                ) : (
                  <div className="w-full bg-[#AEB8FF] my-2 h-[3px] my-8"></div>
                )}

                {selectedPlanId && !isCurrentPlanAnyRecurrence(plan) && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white w-full relative border-[10px] border-[#6AFF97] h-[90vh] w-[90vw] lg:w-[70vw] p-2 md:p-6 flex items-center gap-4">
                      {/* cancel button  */}
                      <div className="absolute right-4 top-4 ">
                        <div className="relative z-10">
                          <div className="absolute top-[3px] left-[3px] w-full h-full bg-white border border-black -z-10"></div>
                          <button
                            onClick={() => setSelectedPlanId(null)}
                            className="px-2 py-2 bg-white border border-black z-10"
                          >
                            <X
                              className="h-5 w-5 text-black"
                              style={{ strokeWidth: "4px" }}
                            />
                          </button>
                        </div>
                      </div>
                      <div className="left-content md:pl-8 flex flex-col gap-4 w-1/1 md:w-1/2 items-center px-4">
                        <h2 className="main-font text-[1.5rem] md:text-[2rem] para-font font-bold text-center md:text-left">
                          Your AI-mployee needs a Promotion!
                        </h2>
                        <p className="text-black para-font text-center md:text-left text-[0.9rem] md:text-[1.1rem] font-[500]">
                          You've reached the limit of your current plan. Upgrade
                          now to unlock more features and keep your AI agent
                          running smoothly.
                        </p>
                        <div className="right-content 1/2 block md:hidden">
                          <img
                            src="/assets/popup-mascot.png"
                            width={1000}
                            height={1000}
                            alt="plain-popup mascot"
                          />
                        </div>
                        {selectedPlan && (
                          <div className="relative z-10 flex gap-4 justify-center md:items-end md:mt-12 w-fit">
                            <div className="absolute top-[4px] left-[4px] w-full h-full bg-[#6AFF97] border border-black -z-10"></div>
                            <button
                              onClick={async () => {
                                await handleUpgrade(selectedPlan.id);
                                setSelectedPlanId(null);
                              }}
                              className="px-4 py-2 bg-[#6AFF97] border border-black md:w-[280px] flex justify-center md:justify-between"
                            >
                              {isCurrentPlanAnyRecurrence(selectedPlan) ? (
                                "CURRENT PLAN"
                              ) : isUpgrading(selectedPlan.id) ? (
                                <span className="flex items-center justify-center gap-2">
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                  {isLowerTierPlan(selectedPlan)
                                    ? "Downgrading..."
                                    : "Upgrading..."}
                                </span>
                              ) : isLowerTierPlan(selectedPlan) ? (
                                "DOWNGRADE"
                              ) : (
                                "UPGRADE MY PLAN"
                              )}
                              <span className="hidden md:inline-block">
                                <ChevronRight
                                  style={{ strokeWidth: "3px" }}
                                  className="h-5 w-5 text-black inline-block ml-2"
                                />
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="right-content 1/2 hidden md:block">
                        <img
                          src="/assets/popup-mascot.png"
                          width={1000}
                          height={1000}
                          alt="plain-popup mascot"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Pill - separated and with extra margin */}
                {pillFeature && (
                  <div className=" w-full flex justify-center mb-4">
                    <span className="flex items-center whitespace-nowrap gap-1 bg-[#EAEFFF] rounded-full px-6 py-1 text-base font-medium text-black shadow-lg border border-gray-200">
                      Everything in
                      <span className="font-bold ml-1 text-sm">
                        {pillFeature.match(/in\s+(\w+)/)?.[1]}
                      </span>
                      <span className="text-lg font-bold text-vl-600 ml-1">
                        +
                      </span>
                    </span>
                  </div>
                )}

                {/* Features */}
                <div className="w-full flex flex-col gap-2 mt-2">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="bg-white border-text-md text-black rounded-full p-[2px] border border-[#000000]">
                        <Check size={18} style={{ strokeWidth: "4px" }} />
                      </span>
                      <span className="para-font text-[16px]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Plans;
