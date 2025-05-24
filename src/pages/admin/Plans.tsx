import React, { useState, useEffect, useRef } from "react";
import {
  getPlans,
  subscribeToPlan,
  getStripeBillingSession,
} from "../../lib/serverActions";
import { useAdminStore } from "../../store/useAdminStore";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

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
      const stripeUrl = await subscribeToPlan(adminId, planId);

      // Start polling for plan updates
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      pollingIntervalRef.current = setInterval(async () => {
        await fetchPlans();
      }, 5000); // Poll every 5 seconds

      // Redirect to Stripe payment page
      window.open(stripeUrl, "_blank", "noopener,noreferrer");
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

    const planHierarchy = ["STARTER", "SOLO", "PRO", "BUSINESS"];
    const currentPlanIndex = planHierarchy.indexOf(currentPlan.type);
    const planIndex = planHierarchy.indexOf(plan.type);

    return planIndex <= currentPlanIndex;
  };

  return (
    <div className="p-6 overflow-auto h-full w-full">
      <div className="flex flex-row justify-between items-center gap-4 mb-8 flex-col lg:flex-row">
        <h2 className="text-2xl font-bold text-left">Plans & Pricing</h2>
        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 rounded-2xl border border-purple-600 font-semibold bg-black text-white hover:bg-purple-700 transition-colors duration-200 focus:outline-none"
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
                <Loader2 className="h-4 w-4 animate-spin" /> Loading Billing...
              </span>
            ) : (
              "Billing History"
            )}
          </button>
          <div className="flex items-center">
            <button
              className={`px-4 py-2 rounded-l-full border border-blue-600 font-semibold focus:outline-none transition-colors duration-200 ${
                billing === "monthly"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-600"
              }`}
              onClick={() => setBilling("monthly")}
              disabled={upgradingPlanId !== null}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 rounded-r-full border border-blue-600 font-semibold focus:outline-none transition-colors duration-200 ${
                billing === "yearly"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-600"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-8">
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
                key={plan.id}
                className="flex flex-col items-center rounded-[32px] border-2 bg-blue-50 border-blue-200 px-6 pb-8 min-h-[600px] relative"
              >
                {/* Header */}
                <div className="w-full flex flex-col items-center rounded-[32px] bg-[#cfd7fa] mt-2 py-2 mb-2">
                  <span className="text-lg font-bold tracking-wide uppercase">
                    {plan.type}
                  </span>
                </div>

                {/* Price */}
                <div className="text-4xl font-extrabold">
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
