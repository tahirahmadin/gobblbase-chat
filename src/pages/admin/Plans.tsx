import React, { useState, useEffect } from "react";
import { getPlans, subscribeToPlan } from "../../lib/serverActions";
import { useAdminStore } from "../../store/useAdminStore";
import { toast } from "react-hot-toast";

interface PlanData {
  id: string;
  name: string;
  price: number;
  currency: string;
  recurrence: string;
  credits: number;
  description: string;
  isCurrentPlan: boolean;
}

const Plans = () => {
  const { adminId } = useAdminStore();
  const [billing, setBilling] = useState("monthly");
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (!adminId) return;
    
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const planData = await getPlans(adminId);
        setPlans(planData);
        
        // Set default billing cycle based on current plan
        const currentPlan = planData.find(plan => plan.isCurrentPlan);
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

  const filteredPlans = plans.filter(plan => 
    plan.recurrence.toLowerCase() === billing.toLowerCase()
  );

  // Add proper type for the parameter
  const getYearlyDiscount = (monthlyName: string): number => {
    const monthlyPlan = plans.find(p => p.name === monthlyName);
    const yearlyPlan = plans.find(p => p.name === `${monthlyName}(YEARLY)`);
    
    if (monthlyPlan && yearlyPlan) {
      const monthlyAnnualCost = monthlyPlan.price * 12;
      const yearlyCost = yearlyPlan.price;
      const savingsPercentage = Math.round((1 - (yearlyCost / monthlyAnnualCost)) * 100);
      return savingsPercentage;
    }
    return 0;
  };

  const handleUpgrade = async (planId: string) => {
    if (!adminId) return;
    
    try {
      setUpgrading(true);
      await subscribeToPlan(adminId, planId);
      
      // Refresh the plans data to reflect changes
      const updatedPlans = await getPlans(adminId);
      setPlans(updatedPlans);
      
      toast.success("Successfully upgraded your plan!");
    } catch (error) {
      console.error("Error upgrading plan:", error);
      toast.error("Failed to upgrade plan");
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Plans & Pricing</h2>
      
      <div className="flex items-center mb-8">
        <button
          className={`px-4 py-2 rounded-l-full border border-blue-600 font-semibold focus:outline-none ${
            billing === "monthly"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600"
          }`}
          onClick={() => setBilling("monthly")}
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
        >
          Yearly
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {filteredPlans.map((plan) => {
            const isPlanCurrent = plan.isCurrentPlan;
            const isYearly = billing === "yearly";
            const planName = isYearly ? plan.name.replace("(YEARLY)", "") : plan.name;
            const discount = isYearly ? getYearlyDiscount(planName) : 0;
            
            return (
              <div
                key={plan.id}
                className={`rounded-xl p-6 relative flex flex-col items-center border-2 transition-all ${
                  isPlanCurrent
                    ? "bg-green-100 border-green-300 shadow-lg"
                    : "bg-blue-100 border-blue-200"
                }`}
              >
                {isPlanCurrent && (
                  <span className="absolute -top-4 left-4 bg-black text-white text-xs px-3 py-1 rounded-full shadow">
                    Current Plan
                  </span>
                )}
                
                <h3 className="text-lg font-bold mb-2">{planName}</h3>
                
                <div className="text-3xl font-extrabold mb-1">
                  {plan.price === 0 ? "Free" : `$${plan.price}`}
                </div>
                
                <div className="text-gray-500 mb-4">
                  per {plan.recurrence}
                </div>
                
                {isYearly && discount > 0 && (
                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full mb-3">
                    Save {discount}%
                  </div>
                )}
                
                <div className="text-sm font-medium mb-2">
                  {plan.credits.toLocaleString()} credits per {plan.recurrence}
                </div>
                
                <p className="text-sm text-gray-600 mb-6">
                  {plan.description}
                </p>

                {!isPlanCurrent ? (
                  <button 
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading}
                    className="mt-auto px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded shadow transition"
                  >
                    {upgrading ? "Processing..." : plan.price === 0 ? "SIGN UP" : "UPGRADE"}
                  </button>
                ) : (
                  <button 
                    disabled
                    className="mt-auto px-6 py-2 bg-gray-300 text-gray-600 font-semibold rounded shadow cursor-default"
                  >
                    CURRENT PLAN
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
