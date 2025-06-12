import React, { useState, ChangeEvent, useEffect } from "react";
import { useBotConfig } from "../../../../store/useBotConfig";
import toast from "react-hot-toast";
import { getAgentPolicies } from "../../../../lib/serverActions";
import { backendApiUrl } from "../../../../utils/constants";
import styled from "styled-components";
const Button = styled.button`
  position: relative;
  background: #6AFF97;
  padding: 0.6vh 1vw;
  border: 1px solid black;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 15px);
  font-weight: 400;
  font-family: "DM Sans", sans-serif;
  min-width: 120px;

  &::before {
    content: "";
    position: absolute;
    top: 4px;
    right: -4px;
    width: 100%;
    height: 100%;
    border: 1px solid #000000;
    z-index: -1;
    background: #6AFF97;
  }

  &:disabled {
    background: #6aff97;
    cursor: not-allowed;
    color: black;
  }
  &:disabled::before {
    background: #6AFF97;
  }
`;
interface Policy {
  id: string;
  name: string;
  enabled: boolean;
}

const Policies = () => {
  const { activeBotId } = useBotConfig();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [policyContents, setPolicyContents] = useState<{
    [key: string]: string;
  }>({
    shipping: "",
    returns: "",
    privacy: "",
    terms: "",
  });
  const [activePolicy, setActivePolicy] = useState("shipping");
  const [policies, setPolicies] = useState<Policy[]>([
    { id: "shipping", name: "Shipping Policy", enabled: true },
    { id: "returns", name: "Returns & Refunds", enabled: false },
    { id: "privacy", name: "Privacy Policy", enabled: false },
    { id: "terms", name: "Terms & Conditions", enabled: false },
  ]);
  const activeIndex = policies.findIndex((p) => p.id === activePolicy);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPolicies = async () => {
      if (!activeBotId) return;
      setIsLoading(true);
      try {
        const response = await getAgentPolicies(activeBotId);
        if (response.error) throw new Error("Failed to fetch policies");

        const data = response.result;
        const defaultIds = ["shipping", "returns", "privacy", "terms"];
        const newPolicyContents: { [key: string]: string } = {};
        const newPolicies: Policy[] = [];

        Object.entries(data).forEach(([policyId, policyData]) => {
          if (defaultIds.includes(policyId)) {
            newPolicies.push({
              id: policyId,
              name:
                policyId.charAt(0).toUpperCase() +
                policyId.slice(1) +
                " Policy",
              enabled: policyData.enabled,
            });
            newPolicyContents[policyId] = policyData.content || "";
          }
        });

        // Ensure all default policies are present
        defaultIds.forEach((id) => {
          if (!newPolicies.find((p) => p.id === id)) {
            newPolicies.push({
              id,
              name: id.charAt(0).toUpperCase() + id.slice(1) + " Policy",
              enabled: false,
            });
            newPolicyContents[id] = "";
          }
        });

        setPolicies(newPolicies);
        setPolicyContents(newPolicyContents);
        // Set the first enabled policy as active, or default to 'shipping'
        const firstEnabled = newPolicies.find((p) => p.enabled);
        setActivePolicy(firstEnabled ? firstEnabled.id : "shipping");
      } catch (err) {
        toast.error("Failed to fetch policies");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPolicies();
  }, [activeBotId]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleToggleEnable = (id: string) => {
    setPolicies((policies) =>
      policies.map((policy) =>
        policy.id === id ? { ...policy, enabled: !policy.enabled } : policy
      )
    );
  };

  const handleSelectPolicy = (id: string) => {
    const index = policies.findIndex((p) => p.id === id);
    if (index <= activeIndex + 2) {
      setActivePolicy(id);
    }
  };

  const handleUpdate = async () => {
    if (!activeBotId) {
      toast.error("No agent selected");
      return;
    }
    setIsUpdating(true);
    const content = policyContents[activePolicy];
    const selected = policies.find((p) => p.id === activePolicy);
    const enabled = selected ? selected.enabled : false;
    try {
      const res = await fetch(`${backendApiUrl}/client/updateAgentPolicy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: activeBotId,
          enabled,
          policyId: activePolicy,
          content,
        }),
      });
      if (!res.ok) throw new Error("Failed to update policy");
      toast.success("Policy updated successfully");
    } catch (err) {
      toast.error("Failed to update policy");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePolicyTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setPolicyContents({ ...policyContents, [activePolicy]: e.target.value });
  };

  const currentPolicyText = policyContents[activePolicy] || "";

  return (
    <div className="max-full mx-auto h-full overflow-scroll">
      <div className="mt-4 p-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Terms & Policies
        </h1>
        <p className="text-gray-600 mt-1">
          Upload your business policies for seamless agent communication
        </p>
      </div>

        {/* Sidebar */}
        <div className="flex w-full flex-shrink-0 flex-col items-start md:pt-8 px-0 md:px-2 overflow-hidden pb-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Loading policies...
            </div>
          ) : (
            policies.map((policy , i) => {

              const isCompleted = i < activeIndex;
              const isActive = policy.id === activePolicy;
              return (
                <div
                  key={policy.id}
                  className="mb-4 flex flex-col md:flex-row gap-4 items-start justify-start w-full relative"
                  onClick={() => handleSelectPolicy(policy.id)}
                >
                    <div className={`flex justify-between items-center px-4 border h-12 z-30 mx-6 md:mx-2 ${
                      isActive && policy.enabled
                        ? "bg-[#CEFFDC] border-[#000000] w-[80%] md:w-[30%] text-white rounded-[12px]"
                        : isActive 
                        ? "bg-[#EAEFFF] border-[#000000] w-[80%] md:w-[30%] text-white rounded-[12px]"
                        : "bg-[transparent] border-[#000000] w-[80%] md:w-[30%] text-white rounded-[12px]"
                        }`}>

                        <div>
                          <span className="para-font text-[1rem] text-black font-[500]">{policy.name}</span>
                        </div>
                        <label className="flex items-center cursor-pointer ml-2">
                          <input
                            type="checkbox"
                            checked={policy.enabled}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleToggleEnable(policy.id);
                            }}
                            className="sr-only peer"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="w-11 h-6 bg-[#CDCDCD] border border-black rounded-full relative transition-colors duration-200 peer-checked:bg-green-400">
                            <div
                              className={`absolute border border-black  -top-[1px] -left-[2px] w-[24px] h-[24px] bg-white rounded-full shadow transition-transform duration-200 ${
                                policy.enabled ? "translate-x-[24px]" : ""
                              }`}
                            ></div>
                          </div>
                        </label>
                    </div>
                    {/* Main Panel */}
                    {/* Only show content for active step */}
                    {isActive && <div className="z-10 bg-[#EAEFFF] md:rounded-lg p-3 mx-auto w-full md:w-[70%]">
                      <div className="rounded-lg px-3 py-6 flex flex-col xs:flex-row items-start gap-4 whitespace-nowrap">
                          {/* Text Input */}
                            <div className="para-font text-[0.9rem] text-black">Enter {policy.name}:</div>
                            <div className="space-y-2 w-full">
                              <textarea
                                value={currentPolicyText}
                                onChange={handlePolicyTextChange}
                                placeholder="Type your message..."
                                className="w-full h-40 px-4 py-2 text-sm border border-[#7D7D7D] resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                              <div className="flex justify-end relative z-10">
                                <Button
                                  onClick={handleUpdate}
                                  className=""
                                  disabled={isUpdating}
                                >
                                  {isUpdating ? "UPDATING..." : "UPDATE"}
                                </Button>
                              </div>
                            </div>
                        </div>
                    </div>}
                </div>
              );
            })
          )}
        </div>
    </div>
  );
};

export default Policies;
