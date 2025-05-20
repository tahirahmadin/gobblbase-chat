import React, { useState, useEffect } from "react";
import { getPlans, subscribeToPlan } from "../../lib/serverActions";
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
}

const Plans = () => {
  const { adminId } = useAdminStore();
  const [billing, setBilling] = useState("monthly");
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);

  const [upgradingPlanId, setUpgradingPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (!adminId) return;

    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await getPlans(adminId);
        setPlans(response as PlanData[]);

        const currentPlan = (response as PlanData[]).find(
          (plan) => plan.isCurrentPlan
        );
        if (currentPlan) {
          setBilling(currentPlan.recurrence.toLowerCase());
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast.error("Failed to load plans");
        setLoading(false);
      }
    };

    fetchPlans();
  }, [adminId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      toast.success("Payment successful! Your plan has been updated.");
      // Optionally, refresh plans here
    }
  }, []);

  const getPlanDisplayName = (name: string): string => {
    return name.replace("(YEARLY)", "");
  };

  const getPlanTierLevel = (planName: string): number => {
    const name = planName.replace("(YEARLY)", "");
    if (name === "STARTER") return 1;
    if (name === "SOLO") return 2;
    if (name === "PRO") return 3;
    if (name === "BUSINESS") return 4;
    return 0;
  };

  const getCurrentPlanInfo = () => {
    const currentPlan = plans.find((plan) => plan.isCurrentPlan);
    if (!currentPlan) return { tier: 0, isYearly: false };

    const tier = getPlanTierLevel(currentPlan.name);
    const isYearly = currentPlan.recurrence.toLowerCase() === "yearly";

    return { tier, isYearly };
  };

  const getPlanAction = (
    plan: PlanData
  ): "upgrade" | "downgrade" | "current" => {
    if (plan.isCurrentPlan) return "current";

    const { tier: currentTier, isYearly: currentIsYearly } =
      getCurrentPlanInfo();
    const planTier = getPlanTierLevel(plan.name);
    const planIsYearly = plan.recurrence.toLowerCase() === "yearly";

    if (planTier > currentTier) return "upgrade";

    if (planTier < currentTier) return "downgrade";

    if (planTier === currentTier) {
      if (planIsYearly && !currentIsYearly) return "upgrade";
      if (!planIsYearly && currentIsYearly) return "downgrade";
    }

    return "downgrade";
  };

  const getYearlySavings = (plan: PlanData): number => {
    if (plan.recurrence.toLowerCase() !== "yearly") return 0;

    const monthlyPlanName = plan.name.replace("(YEARLY)", "");
    const monthlyPlan = plans.find((p) => p.name === monthlyPlanName);

    if (monthlyPlan) {
      const monthlyAnnualCost = monthlyPlan.price * 12;
      const savingsPercentage = Math.round(
        (1 - plan.totalPrice / monthlyAnnualCost) * 100
      );
      return savingsPercentage > 0 ? savingsPercentage : 0;
    }

    return 0;
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
      console.log(stripeUrl);
      // Redirect to Stripe payment page
      window.location.href = stripeUrl;
    } catch (error) {
      console.error("Error changing plan:", error);
      toast.error("Failed to change plan");
    } finally {
      setUpgradingPlanId(null);
    }
  };

  const isUpgrading = (planId: string): boolean => {
    return upgradingPlanId === planId;
  };

  return (
    <div className="p-6 overflow-auto h-full w-full">
      <div className="flex flex-row justify-between items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold">Plans & Pricing</h2>
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

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-8">
          {filteredPlans.map((plan) => {
            const isCurrent = plan.isCurrentPlan;
            const displayName = getPlanDisplayName(plan.name);

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
                    {displayName}
                  </span>
                </div>

                {/* Price */}
                <div className="text-4xl font-extrabold">
                  {plan.price === 0 ? "$0" : `$${plan.price}`}
                </div>
                <div className="text-gray-600 mb-4 text-base">per month</div>

                {/* Upgrade Button */}
                <button
                  disabled={isCurrent || isUpgrading(plan.id)}
                  onClick={() => handleUpgrade(plan.id)}
                  className={`w-full px-6 py-2 font-bold rounded-lg uppercase mb-4 shadow border
                    ${
                      isCurrent
                        ? "bg-gray-300 text-gray-600 cursor-default"
                        : isUpgrading(plan.id)
                        ? "bg-green-200 text-black border-green-700 cursor-wait"
                        : "bg-green-300 hover:bg-green-400 text-black border-green-700"
                    }
                  `}
                >
                  {isCurrent ? (
                    "CURRENT PLAN"
                  ) : isUpgrading(plan.id) ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Upgrading...
                    </span>
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
