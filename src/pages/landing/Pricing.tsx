import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  font-family: "DM Sans", sans-serif;
  background: #f5f6fa;
  min-height: 100vh;
  overflow-x: hidden;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 32px 18px 24px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
`;

const Logo = styled.div`
  font-weight: 700;
  font-size: 1.4rem;
  letter-spacing: -1px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 24px;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const NavLink = styled.button`
  background: none;
  border: none;
  font-size: 1rem;
  color: #333;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const LoginButton = styled.button`
  background: #fff;
  border: 1px solid #bdbdbd;
  border-radius: 6px;
  padding: 7px 18px;
  font-size: 1rem;
  cursor: pointer;
`;

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  isCurrentPlan?: boolean;
}

const Pricing = () => {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const getPlanDisplayName = (name: string): string => {
    return name.replace("(YEARLY)", "");
  };

  const plans: Plan[] = [
    {
      id: "starter",
      name: "STARTER",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        "1 AI Agent",
        "Basic Chat Features",
        "Email Support",
        "Basic Analytics",
        "Up to 100 messages/month",
      ],
    },
    {
      id: "solo",
      name: "SOLO",
      monthlyPrice: 29,
      yearlyPrice: 19,
      features: [
        "Everything in STARTER",
        "2 AI Agents",
        "Advanced Chat Features",
        "Priority Support",
        "Advanced Analytics",
        "Up to 1,000 messages/month",
      ],
    },
    {
      id: "pro",
      name: "PRO",
      monthlyPrice: 99,
      yearlyPrice: 79,
      features: [
        "Everything in SOLO",
        "5 AI Agents",
        "Custom Branding",
        "API Access",
        "24/7 Support",
        "Unlimited Messages",
      ],
    },
    {
      id: "business",
      name: "BUSINESS",
      monthlyPrice: 499,
      yearlyPrice: 399,
      features: [
        "Everything in PRO",
        "Unlimited AI Agents",
        "Custom Development",
        "Dedicated Support",
        "SLA Guarantee",
        "Custom Integrations",
      ],
    },
  ];

  return (
    <Container>
      <Header>
        <Logo>
          <span onClick={() => navigate("/")}>kifor</span>
          <NavLink onClick={() => navigate("/pricing")}>Pricing</NavLink>
        </Logo>
        <NavLinks>
          <LoginButton onClick={() => navigate("/admin")}>
            Login/Sign up
          </LoginButton>
        </NavLinks>
      </Header>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
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
              >
                Yearly
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-8">
            {plans.map((plan) => {
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
                    {plan[
                      billing === "monthly" ? "monthlyPrice" : "yearlyPrice"
                    ] === 0
                      ? "$0"
                      : `$${
                          plan[
                            billing === "monthly"
                              ? "monthlyPrice"
                              : "yearlyPrice"
                          ]
                        }`}
                  </div>
                  <div className="text-gray-600 mb-4 text-base">
                    per {billing === "monthly" ? "month" : "year"}
                  </div>

                  {/* Upgrade Button */}
                  <button
                    disabled={isCurrent}
                    onClick={() => navigate("/admin")}
                    className={`w-full px-6 py-2 font-bold rounded-lg uppercase mb-4 shadow border
                      ${
                        isCurrent
                          ? "bg-gray-300 text-gray-600 cursor-default"
                          : "bg-green-300 hover:bg-green-400 text-black border-green-700"
                      }
                    `}
                  >
                    Get Started
                  </button>

                  {/* Divider */}
                  <div className="w-full bg-black my-2 h-[3px]"></div>

                  {/* Pill - separated and with extra margin */}
                  {pillFeature && (
                    <div className=" w-full flex justify-center mb-4">
                      <span className="flex items-center gap-1 bg-white rounded-full px-6 py-2 text-base font-medium text-black shadow-lg border border-gray-200">
                        Everything in
                        <span className="font-bold ml-1 text-sm">
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
        </div>
      </div>
    </Container>
  );
};

export default Pricing;
