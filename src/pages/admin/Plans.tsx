import React, { useState, useEffect } from "react";
import { getPlans, subscribeToPlan } from "../../lib/serverActions";
import { useAdminStore } from "../../store/useAdminStore";
import { toast } from "react-hot-toast";

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
        
        const currentPlan = (response as PlanData[]).find(plan => plan.isCurrentPlan);
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
    const currentPlan = plans.find(plan => plan.isCurrentPlan);
    if (!currentPlan) return { tier: 0, isYearly: false };
    
    const tier = getPlanTierLevel(currentPlan.name);
    const isYearly = currentPlan.recurrence.toLowerCase() === "yearly";
    
    return { tier, isYearly };
  };

  const getPlanAction = (plan: PlanData): 'upgrade' | 'downgrade' | 'current' => {
    if (plan.isCurrentPlan) return 'current';
    
    const { tier: currentTier, isYearly: currentIsYearly } = getCurrentPlanInfo();
    const planTier = getPlanTierLevel(plan.name);
    const planIsYearly = plan.recurrence.toLowerCase() === "yearly";
    
    if (planTier > currentTier) return 'upgrade';
    
    if (planTier < currentTier) return 'downgrade';
    
    if (planTier === currentTier) {
      if (planIsYearly && !currentIsYearly) return 'upgrade';
      if (!planIsYearly && currentIsYearly) return 'downgrade';
    }
    
    return 'downgrade';
  };

  const getYearlySavings = (plan: PlanData): number => {
    if (plan.recurrence.toLowerCase() !== "yearly") return 0;
    
    const monthlyPlanName = plan.name.replace("(YEARLY)", "");
    const monthlyPlan = plans.find(p => p.name === monthlyPlanName);
    
    if (monthlyPlan) {
      const monthlyAnnualCost = monthlyPlan.price * 12;
      const savingsPercentage = Math.round((1 - (plan.totalPrice / monthlyAnnualCost)) * 100);
      return savingsPercentage > 0 ? savingsPercentage : 0;
    }
    
    return 0;
  };

  const filteredPlans = plans.filter(plan => 
    plan.recurrence.toLowerCase() === billing.toLowerCase()
  );

  const handleUpgrade = async (planId: string) => {
    if (!adminId) return;
    
    try {
      setUpgradingPlanId(planId);
      
      await subscribeToPlan(adminId, planId);
      
      const response = await getPlans(adminId);
      setPlans(response as PlanData[]);
      
      toast.success("Successfully changed your plan!");
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
    <div className="p-8 overflow-auto h-full w-full">
      <h2 className="text-2xl font-bold mb-6">Plans & Pricing</h2>
      
      <div className="flex items-center mb-8">
        <button
          className={`px-4 py-2 rounded-l-full border border-blue-600 font-semibold focus:outline-none ${
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
          className={`px-4 py-2 rounded-r-full border border-blue-600 font-semibold focus:outline-none ${
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

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-8">
          {filteredPlans.map((plan) => {
            const isPlanCurrent = plan.isCurrentPlan;
            const isYearly = plan.recurrence.toLowerCase() === "yearly";
            const displayName = getPlanDisplayName(plan.name);
            const planAction = getPlanAction(plan);
            const yearlySavings = getYearlySavings(plan);
            
            let bgColor = "bg-blue-100";
            let borderColor = "border-blue-200";
            
            if (isPlanCurrent) {
              bgColor = "bg-green-100";
              borderColor = "border-green-300";
            }
            
            return (
              <div
                key={plan.id}
                className={`rounded-xl p-6 pt-10 relative flex flex-col items-center border-2 transition-all ${bgColor} ${borderColor} ${isPlanCurrent ? "shadow-lg" : ""}`}
              >
                {isPlanCurrent && (
                  <span className="absolute top-2 right-4 bg-black text-white text-xs px-3 py-1 rounded-full shadow">
                    Current plan
                  </span>
                )}
                {displayName === "STARTER" && !isPlanCurrent && (
                  <span className="absolute top-2 left-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow">
                    Starter plan
                  </span>
                )}
                
                <h3 className="text-xl font-bold mb-2">{displayName}</h3>
                
                <div className="text-3xl font-extrabold mb-1">
                  {plan.price === 0 ? "$0" : `$${plan.price}`}
                </div>
                
                <div className="text-gray-500 mb-4 text-sm">
                  {plan.description}
                </div>
                
                {yearlySavings > 0 && (
                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full mb-3">
                    Save {yearlySavings}%
                  </div>
                )}
                
                <div className="w-full mb-6 flex-grow">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start mb-2">
                      <div className="text-green-500 mr-2 mt-1 flex-shrink-0">✓</div>
                      <div className="text-sm">{feature}</div>
                    </div>
                  ))}
                </div>

                {isPlanCurrent ? (
                  <button 
                    disabled
                    className="w-full px-6 py-2 bg-gray-300 text-gray-600 font-bold rounded uppercase cursor-default"
                  >
                    CURRENT PLAN
                  </button>
                ) : (
                  <button 
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isUpgrading(plan.id) || upgradingPlanId !== null}
                    className={`w-full px-6 py-2 text-center font-bold rounded uppercase ${
                      isUpgrading(plan.id) 
                        ? "bg-gray-400 text-white"
                        : "bg-green-400 hover:bg-green-500 text-white"
                    }`}
                  >
                    {isUpgrading(plan.id) 
                      ? "Processing..." 
                      : planAction === 'upgrade' ? "UPGRADE" : "DOWNGRADE"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Plans;
