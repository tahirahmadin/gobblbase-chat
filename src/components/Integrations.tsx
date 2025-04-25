import React, { useState, useEffect } from "react";
import {
  Building2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Check,
  ExternalLink,
} from "lucide-react";
import { useBotConfig } from "../store/useBotConfig";
import { toast } from "react-hot-toast";
import { getAgentDetails } from "../lib/serverActions";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isConnected: boolean;
}

interface ZohoConfig {
  clientId: string;
  clientSecret: string;
  orgId: string;
}

const Integrations: React.FC = () => {
  const { activeBotId } = useBotConfig();
  const [activeIntegration, setActiveIntegration] = useState<string | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [zohoConfig, setZohoConfig] = useState<ZohoConfig>({
    clientId: "",
    clientSecret: "",
    orgId: "",
  });
  const [isConfigSubmitted, setIsConfigSubmitted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingTimeout, setPollingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const integrations: Integration[] = [
    {
      id: "zoho-books",
      name: "ZOHO Books",
      description:
        "Connect your ZOHO Books account to manage invoices and payments",
      icon: <Building2 className="h-6 w-6" />,
      isConnected: false,
    },
  ];
  //   https://api-console.zoho.in/
  const handleDisconnect = async (integrationId: string) => {
    // TODO: Implement disconnection logic
    console.log(`Disconnecting from ${integrationId}`);
    setActiveIntegration(null);
    setCurrentStep(1);
    setIsConfigSubmitted(false);
    setIsAuthenticated(false);
    setZohoConfig({
      clientId: "",
      clientSecret: "",
      orgId: "",
    });
  };

  const handleConfigSubmit = async () => {
    if (!activeBotId) {
      toast.error("No active agent selected");
      return;
    }

    try {
      const response = await fetch("https://rag.gobbl.ai/zoho/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentId: activeBotId,
          clientId: zohoConfig.clientId,
          clientSecret: zohoConfig.clientSecret,
          redirectUri: "https://rag.gobbl.ai/zoho/callback",
          orgId: zohoConfig.orgId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit configuration");
      }

      setIsConfigSubmitted(true);
      setCurrentStep(2);
      toast.success("Configuration submitted successfully");
    } catch (error) {
      toast.error("Failed to submit configuration");
      console.error(error);
    }
  };

  const startPolling = () => {
    setIsPolling(true);
    let attempts = 0;
    const maxAttempts = 10; // 30 seconds total (3 seconds * 10 attempts)

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setIsPolling(false);
        if (pollingTimeout) clearTimeout(pollingTimeout);
        toast.error("Authentication timed out. Please try again.");
        return;
      }

      try {
        const agentDetails = await getAgentDetails(activeBotId || "", true);
        if (agentDetails?.services?.includes("ZOHO")) {
          setIsAuthenticated(true);
          setIsPolling(false);
          if (pollingTimeout) clearTimeout(pollingTimeout);
          toast.success("ZOHO Books integration completed successfully!");
          return;
        }
      } catch (error) {
        console.error("Error polling agent details:", error);
      }

      attempts++;
      const timeout = setTimeout(poll, 3000); // Poll every 3 seconds
      setPollingTimeout(timeout);
    };

    poll();
  };

  const handleAuth = () => {
    if (!activeBotId) {
      toast.error("No active agent selected");
      return;
    }

    window.open(
      `https://rag.gobbl.ai/zoho/auth?agentId=${activeBotId}`,
      "_blank"
    );
    startPolling();
  };

  // Cleanup polling on component unmount
  useEffect(() => {
    return () => {
      if (pollingTimeout) {
        clearTimeout(pollingTimeout);
      }
    };
  }, [pollingTimeout]);

  const renderZohoIntegration = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800">
              ZOHO Books Integration
            </h2>
            <p className="mt-2 text-gray-600">
              Follow these steps to connect your ZOHO Books account
            </p>
          </div>
          <div className="p-6">
            {/* Step 1: Configuration */}
            <div
              className={`mb-8 ${
                currentStep >= 1 ? "opacity-100" : "opacity-50"
              }`}
            >
              <div className="flex items-center mb-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep > 1 ? "bg-green-500" : "bg-gray-200"
                  }`}
                >
                  {currentStep > 1 ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    "1"
                  )}
                </div>
                <h3 className="ml-3 text-lg font-medium">
                  Step 1: Configuration
                </h3>
              </div>
              {currentStep === 1 && (
                <div className="ml-11 space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md mb-4">
                    <p className="text-sm text-blue-800">
                      To get your Client ID and Client Secret, visit the ZOHO
                      API Console:
                    </p>
                    <a
                      href="https://api-console.zoho.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      https://api-console.zoho.in/
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Client ID
                    </label>
                    <input
                      type="text"
                      value={zohoConfig.clientId}
                      onChange={(e) =>
                        setZohoConfig({
                          ...zohoConfig,
                          clientId: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Client Secret
                    </label>
                    <input
                      type="password"
                      value={zohoConfig.clientSecret}
                      onChange={(e) =>
                        setZohoConfig({
                          ...zohoConfig,
                          clientSecret: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Organization ID
                    </label>
                    <input
                      type="text"
                      value={zohoConfig.orgId}
                      onChange={(e) =>
                        setZohoConfig({ ...zohoConfig, orgId: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <button
                    onClick={handleConfigSubmit}
                    className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
                  >
                    Submit Configuration
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Redirect URL */}
            <div
              className={`mb-8 ${
                currentStep >= 2 ? "opacity-100" : "opacity-50"
              }`}
            >
              <div className="flex items-center mb-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep > 2 ? "bg-green-500" : "bg-gray-200"
                  }`}
                >
                  {currentStep > 2 ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    "2"
                  )}
                </div>
                <h3 className="ml-3 text-lg font-medium">
                  Step 2: Configure Redirect URL
                </h3>
              </div>
              {currentStep === 2 && (
                <div className="ml-11 space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-600">
                      Please add the following redirect URL to your ZOHO Books
                      dashboard:
                    </p>
                    <code className="mt-2 block p-2 bg-white rounded border border-gray-200 text-sm">
                      https://rag.gobbl.ai/zoho/callback
                    </code>
                  </div>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
                  >
                    Next Step
                  </button>
                </div>
              )}
            </div>

            {/* Step 3: Authentication */}
            <div
              className={`mb-8 ${
                currentStep >= 3 ? "opacity-100" : "opacity-50"
              }`}
            >
              <div className="flex items-center mb-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isAuthenticated ? "bg-green-500" : "bg-gray-200"
                  }`}
                >
                  {isAuthenticated ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    "3"
                  )}
                </div>
                <h3 className="ml-3 text-lg font-medium">
                  Step 3: Authenticate
                </h3>
              </div>
              {currentStep === 3 && !isAuthenticated && (
                <div className="ml-11 space-y-4">
                  <button
                    onClick={handleAuth}
                    disabled={isPolling}
                    className={`px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 ${
                      isPolling ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isPolling ? "Authenticating..." : "Authenticate with ZOHO"}
                  </button>
                  {isPolling && (
                    <div className="flex items-center text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      <span className="text-sm">
                        Checking authentication status...
                      </span>
                    </div>
                  )}
                </div>
              )}
              {isAuthenticated && (
                <div className="ml-11">
                  <div className="flex items-center text-green-600">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    <span>ZOHO Books integration completed successfully!</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800">Integrations</h2>
          <p className="mt-2 text-gray-600">
            Connect your favorite services to enhance your bot's capabilities
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white rounded-lg border border-gray-200">
                    {integration.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {integration.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {integration.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {integration.isConnected ? (
                    <>
                      <span className="flex items-center text-green-600">
                        <CheckCircle2 className="h-5 w-5 mr-1" />
                        Connected
                      </span>
                      <button
                        onClick={() => handleDisconnect(integration.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setActiveIntegration(integration.id)}
                      className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeIntegration === "zoho-books" && renderZohoIntegration()}
    </div>
  );
};

export default Integrations;
