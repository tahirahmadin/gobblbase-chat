import React, { useState, useEffect, useRef } from "react";
import {
  getPlans,
  subscribeToPlan,
  getStripeBillingSession,
} from "../../../../lib/serverActions";
import { useAdminStore } from "../../../../store/useAdminStore";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
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
    background: #AEB8FF;
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
      border-bottom: 24px solid #AEB8FF;
      z-index: 0;
      @media (max-width: 600px) {
        transform: translate(0.5rem, -0.05rem);
        border-left: 28px solid transparent;
        border-right: 28px solid transparent;
        border-bottom: 28px solid #AEB8FF;
      }
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
      @media (max-width: 600px) {
        transform: translate(0.65rem, 0);
        border-left: 30px solid transparent;
        border-right: 30px solid transparent;
        border-bottom: 30px solid black;
      }
    }
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
  const { adminId } = useAdminStore();
  const [billing, setBilling] = useState("monthly");
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingLoading, setBillingLoading] = useState(false);
  const [upgradingPlanId, setUpgradingPlanId] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPlans = async () => {
    if (!adminId) return;

    try {
      const response = await getPlans(adminId);

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
    if (!adminId) return;

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
  }, [adminId]);

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

  const handleUpgrade = async (planId: string) => {
    if (!adminId) return;

    try {
      setUpgradingPlanId(planId);

      // Get Stripe session URL
      const response = await subscribeToPlan(adminId, planId);

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

  return (
    <div className="p-6 overflow-auto h-full w-full">
      <div className="flex flex-row justify-between items-center gap-4 mb-8 flex-col lg:flex-row">
         <div className="heading-content text-black w-full px-4 sm:px-0 [@media(max-width:600px)]:flex [@media(max-width:600px)]:flex-col [@media(max-width:600px)]:items-center [@media(max-width:600px)]:text-center ">
              <WhiteBackground >
                <span style={{width: "fit-content", padding:"1vh 2vw"}}>
                  <h2 className="main-font relative z-10 font-[800] text-[1.2rem]">Plans & Pricing</h2> 
                </span>
              </WhiteBackground>
                <p className="para-font text-[0.8rem] font-[400] mt-4 [@media(min-width:601px)]:w-[70%]">Maximize your business potential with Sayy - everything you need to grow your business, the AI way.</p>
          </div>

        <div className="flex items-center gap-2">
          <button
            className="px-4 py-1 rounded-2xl border border-purple-600 font-semibold whitespace-nowrap bg-black text-white hover:bg-purple-700 transition-colors duration-200 focus:outline-none"
            onClick={async () => {
              if (!adminId) return;
              try {
                setBillingLoading(true);
                const url = await getStripeBillingSession(adminId);
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
              f.startsWith("Everything in")
            );
            const features = plan.features.filter(
              (f) => !f.startsWith("Everything in")
            );

            return (
              <div
                id={`plan-${plan.id}`}
                key={plan.id}
                className="flex flex-col items-center border bg-[#D4DEFF] border-black px-6 pb-8 min-h-[600px] relative"
              >
                {/* Header */}
                  <div className="w-full flex flex-col items-center mt-2 py-2 mb-2 ">
                      <PurpleBackground>
                          <span style={{width: "80%", padding:"1vh 2vw", margin: "0 auto"}}>
                            <h1 className="relative z-10 text-center">{plan.type}</h1>
                        </span>
                      </PurpleBackground>
                  </div>
                {/* Price */}
                <div className="text-4xl font-bold text-black">
                  {plan.price === 0 ? "$0" : `$${plan.price}`}
                </div>
                <div className="text-gray-600 mb-4 text-base">per month</div>

                {/* Upgrade Button */}
                <button
                  disabled={
                    isCurrentPlanAnyRecurrence(plan) || isUpgrading(plan.id)
                  }
                  onClick={() => handleUpgrade(plan.id)}
                  className={`w-full px-6 py-2 font-bold rounded-lg uppercase mb-4 shadow border
                    ${
                      isCurrentPlanAnyRecurrence(plan)
                        ? "bg-gray-300 text-gray-600 cursor-default"
                        : isUpgrading(plan.id)
                        ? "bg-green-200 text-black border-green-700 cursor-wait"
                        : isLowerTierPlan(plan)
                        ? "bg-yellow-300 hover:bg-yellow-400 text-black border-yellow-700"
                        : "bg-green-300 hover:bg-green-400 text-black border-green-700"
                    }
                  `}
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
                </button>

                {/* Divider */}
                <div className="w-full bg-black my-2 h-[3px]"></div>

                {/* Pill - separated and with extra margin */}
                {pillFeature && (
                  <div className="bg-white w-full flex justify-center mb-4">
                    <span className="flex items-center gap-1 bg-white rounded-full px-6 py-2 text-base font-medium text-black shadow-lg border border-gray-200">
                      Everything in
                      <span className="font-bold ml-1">
                        {pillFeature.match(/in\s+(\w+)/)?.[1]}
                      </span>
                      <span className="text-lg font-bold text-blue-600 ml-1">
                        +
                      </span>
                    </span>
                  </div>
                )}

                {/* Features */}
                <div className="w-full flex flex-col gap-2 mt-2">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="mt-0.5 text-md text-black">✔️</span>
                      <span className="text-base text-black text-sm leading-tight">
                        {feature}
                      </span>
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
