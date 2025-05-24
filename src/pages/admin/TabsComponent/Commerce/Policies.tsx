import React, { useState, ChangeEvent, useEffect } from "react";
import { useBotConfig } from "../../../../store/useBotConfig";
import toast from "react-hot-toast";
import { getAgentPolicies } from "../../../../lib/serverActions";
import { backendApiUrl } from "../../../../utils/constants";

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
    setActivePolicy(id);
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
    <div className="max-full mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Terms & Policies
        </h1>
        <p className="text-gray-600 mt-1">
          Upload your business policies for seamless agent communication
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
        {/* Sidebar */}
        <div className="md:col-span-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Loading policies...
            </div>
          ) : (
            policies.map((policy) => (
              <div
                key={policy.id}
                className={`flex items-center justify-between px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                  activePolicy === policy.id
                    ? "bg-green-50 border-green-500"
                    : "bg-white border-gray-200"
                }`}
                onClick={() => handleSelectPolicy(policy.id)}
              >
                <div>
                  <span className="text-sm text-gray-700">{policy.name}</span>
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
                  <div className="w-11 h-6 bg-gray-200 rounded-full relative transition-colors duration-200 peer-checked:bg-green-400">
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                        policy.enabled ? "translate-x-5" : ""
                      }`}
                    ></div>
                  </div>
                </label>
              </div>
            ))
          )}
        </div>

        {/* Main Panel */}
        <div className="md:col-span-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="space-y-4">
              {/* Text Input */}
              <div>
                <div className="text-sm text-gray-600 mb-2">
                  Enter policy content:
                </div>
                <div className="space-y-2">
                  <textarea
                    value={currentPolicyText}
                    onChange={handlePolicyTextChange}
                    placeholder="Type your message..."
                    className="w-full h-40 px-4 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleUpdate}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                      disabled={isUpdating}
                    >
                      {isUpdating ? "UPDATING..." : "UPDATE"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Policies;
