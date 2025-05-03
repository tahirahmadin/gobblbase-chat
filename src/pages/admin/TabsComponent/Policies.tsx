import React, { useState, ChangeEvent } from "react";
import { Plus } from "lucide-react";

interface Policy {
  id: string;
  name: string;
  enabled: boolean;
}

const Policies = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [policyText, setPolicyText] = useState("");
  const [activePolicy, setActivePolicy] = useState("shipping");
  const [policies, setPolicies] = useState<Policy[]>([
    { id: "shipping", name: "Shipping Policy", enabled: false },
    { id: "returns", name: "Returns & Refunds", enabled: false },
    { id: "privacy", name: "Privacy Policy", enabled: false },
    { id: "terms", name: "Terms & Conditions", enabled: false },
  ]);
  const [customPolicies, setCustomPolicies] = useState<Policy[]>([]);
  const [newPolicyName, setNewPolicyName] = useState("");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handlePolicyToggle = (id: string) => {
    setPolicies(
      policies.map((policy) =>
        policy.id === id ? { ...policy, enabled: !policy.enabled } : policy
      )
    );
    setActivePolicy(id);
  };

  const handleCustomPolicyToggle = (id: string) => {
    setCustomPolicies(
      customPolicies.map((policy) =>
        policy.id === id ? { ...policy, enabled: !policy.enabled } : policy
      )
    );
  };

  const handleAddCustomPolicy = () => {
    if (newPolicyName.trim()) {
      const newPolicy = {
        id: Date.now().toString(),
        name: newPolicyName.trim(),
        enabled: false,
      };
      setCustomPolicies([...customPolicies, newPolicy]);
      setNewPolicyName("");
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      // Handle file upload logic here
      console.log("Uploading file:", selectedFile);
    }
  };

  const handleUpdate = () => {
    if (policyText.trim()) {
      // Handle policy text update logic here
      console.log("Updating policy text:", policyText);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Terms & Policies
        </h1>
        <p className="text-gray-600 mt-1">
          Upload your business policies for seamless agent communication
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Policy List */}
        <div className="col-span-4 space-y-3">
          {/* Default Policies */}
          {policies.map((policy) => (
            <button
              key={policy.id}
              onClick={() => handlePolicyToggle(policy.id)}
              className="w-full flex items-center justify-between px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <span className="text-sm text-gray-700">{policy.name}</span>
              <div
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  policy.enabled ? "bg-green-500" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                    policy.enabled ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </div>
            </button>
          ))}

          {/* Custom Section */}
          <div className="mt-6">
            <h2 className="text-xs font-semibold text-gray-900 mb-3">CUSTOM</h2>
            {customPolicies.map((policy) => (
              <button
                key={policy.id}
                onClick={() => handleCustomPolicyToggle(policy.id)}
                className="w-full flex items-center justify-between px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors mb-2"
              >
                <span className="text-sm text-gray-700">{policy.name}</span>
                <div
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    policy.enabled ? "bg-green-500" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                      policy.enabled ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </div>
              </button>
            ))}

            {/* Add Custom Policy Input */}
            <div className="flex items-center mt-2">
              <input
                type="text"
                value={newPolicyName}
                onChange={(e) => setNewPolicyName(e.target.value)}
                placeholder="Name"
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleAddCustomPolicy}
                className="ml-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Policy Content */}
        <div className="col-span-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="space-y-4">
              {/* File Upload */}
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="policy-file"
                  />
                  <label
                    htmlFor="policy-file"
                    className="inline-block px-4 py-2 bg-white border border-gray-200 rounded-l-lg text-sm cursor-pointer hover:bg-gray-50"
                  >
                    Upload File
                  </label>
                  <button className="px-4 py-2 bg-green-500 text-white rounded-r-lg text-sm hover:bg-green-600 transition-colors">
                    UPLOAD
                  </button>
                </div>
              </div>

              {/* Text Input */}
              <div>
                <div className="text-sm text-gray-600 mb-2">Or Type/Paste</div>
                <div className="space-y-2">
                  <textarea
                    value={policyText}
                    onChange={(e) => setPolicyText(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full h-40 px-4 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="flex justify-end">
                    <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors">
                      UPDATE
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
