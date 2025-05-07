import React, { useState } from "react";

const plans = [
  {
    name: "STARTER",
    price: 0,
    features: ["feature 1", "feature 2", "feature 3"],
    current: true,
  },
  {
    name: "SOLO",
    price: 29,
    features: ["Everything in Free +", "feature 1", "feature 2"],
    current: false,
  },
  {
    name: "PRO",
    price: 0,
    features: [],
    current: false,
  },
  {
    name: "BUSINESS",
    price: 0,
    features: [],
    current: false,
  },
];

const Plans = () => {
  const [billing, setBilling] = useState("Monthly");

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Plans & Pricing</h2>
      <div className="flex items-center mb-8">
        <button
          className={`px-4 py-2 rounded-l-full border border-blue-600 font-semibold focus:outline-none ${
            billing === "Monthly"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600"
          }`}
          onClick={() => setBilling("Monthly")}
        >
          Monthly
        </button>
        <button
          className={`px-4 py-2 rounded-r-full border border-blue-600 font-semibold focus:outline-none ${
            billing === "Yearly"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600"
          }`}
          onClick={() => setBilling("Yearly")}
        >
          Yearly
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {plans.map((plan, idx) => (
          <div
            key={plan.name}
            className={`rounded-xl p-6 relative flex flex-col items-center border-2 transition-all ${
              plan.current
                ? "bg-green-100 border-green-300 shadow-lg"
                : "bg-blue-100 border-blue-200"
            }`}
          >
            {plan.current && (
              <span className="absolute -top-4 left-4 bg-black text-white text-xs px-3 py-1 rounded-full shadow">
                Current Plan
              </span>
            )}
            <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
            <div className="text-3xl font-extrabold mb-1">
              {plan.price === 0 ? "$0" : `$${plan.price}`}
            </div>
            <div className="text-gray-500 mb-4">per month</div>
            <ul className="mb-6 space-y-2 w-full">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center">
                  <span className="mr-2 text-green-600">✔</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {!plan.current && (
              <button className="mt-auto px-6 py-2 bg-green-200 hover:bg-green-300 text-green-900 font-semibold rounded shadow">
                UPGRADE
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plans;
