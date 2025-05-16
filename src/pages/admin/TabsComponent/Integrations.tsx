import React, { useState, useEffect } from "react";
import { CheckCircle2, Check, ExternalLink, Database } from "lucide-react";
import { useBotConfig } from "../../../store/useBotConfig";
import { toast } from "react-hot-toast";
import { getAgentDetails } from "../../../lib/serverActions";

interface ZohoConfig {
  clientId: string;
  clientSecret: string;
  orgId: string;
}

const Integrations: React.FC = () => {
  const { activeBotId } = useBotConfig();
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
  const [showEditConfig, setShowEditConfig] = useState(false);
  const [showConfigForm, setShowConfigForm] = useState(false);

  // Check initial ZOHO status
  // useEffect(() => {
  //   const checkZohoStatus = async () => {
  //     if (!activeBotId) return;
  //     try {
  //       const agentDetails = await getAgentDetails(activeBotId, false);
  //       setIsAuthenticated(
  //         agentDetails?.services?.includes("ZOHO_INVENTORY") || false
  //       );
  //     } catch (error) {
  //       console.error("Error checking ZOHO status:", error);
  //     }
  //   };

  //   checkZohoStatus();
  // }, [activeBotId]);

  const handleDisconnect = async (integrationId: string) => {
    // TODO: Implement disconnection logic
    console.log(`Disconnecting from ${integrationId}`);
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

  // const startPolling = () => {
  //   setIsPolling(true);
  //   let attempts = 0;
  //   const maxAttempts = 10; // 30 seconds total (3 seconds * 10 attempts)

  //   const poll = async () => {
  //     if (attempts >= maxAttempts) {
  //       setIsPolling(false);
  //       if (pollingTimeout) clearTimeout(pollingTimeout);
  //       toast.error("Authentication timed out. Please try again.");
  //       return;
  //     }

  //     try {
  //       const agentDetails = await getAgentDetails(activeBotId || "", false);
  //       if (agentDetails?.services?.includes("ZOHO_INVENTORY")) {
  //         setIsAuthenticated(true);
  //         setIsPolling(false);
  //         if (pollingTimeout) clearTimeout(pollingTimeout);
  //         toast.success("ZOHO Books integration completed successfully!");
  //         return;
  //       }
  //     } catch (error) {
  //       console.error("Error polling agent details:", error);
  //     }

  //     attempts++;
  //     const timeout = setTimeout(poll, 3000); // Poll every 3 seconds
  //     setPollingTimeout(timeout);
  //   };

  //   poll();
  // };

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

  const handleEditConfig = () => {
    setShowEditConfig(true);
    setCurrentStep(1);
    setIsConfigSubmitted(false);
    setIsAuthenticated(false);
  };

  const renderZohoCard = () => {
    return (
      <div className="p-6 space-y-4">
        {/* Zoho Card */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">ZOHO Books</h3>
              <p className="text-sm text-gray-500">
                Connect your ZOHO Books account to manage inventory and orders
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="flex items-center text-green-600">
                  <CheckCircle2 className="h-5 w-5 mr-1" />
                  Connected
                </span>
                <button
                  onClick={() => {
                    setShowEditConfig(true);
                    setShowConfigForm(true);
                  }}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50"
                >
                  Edit Configuration
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfigForm(true)}
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
              >
                Connect
              </button>
            )}
          </div>
        </div>

        {/* WhatsApp Business Card */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 opacity-60">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">WhatsApp Business</h3>
              <p className="text-sm text-gray-500">
                Connect your WhatsApp Business account for messaging
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Telegram Card */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 opacity-60">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Telegram Messaging</h3>
              <p className="text-sm text-gray-500">
                Connect your Telegram bot for messaging
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* SMS Card */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 opacity-60">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">SMS</h3>
              <p className="text-sm text-gray-500">
                Connect your SMS gateway for text messaging
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Shopify Card */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 opacity-60">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.5 0C5.6 0 0 5.6 0 12.5S5.6 25 12.5 25 25 19.4 25 12.5 19.4 0 12.5 0zm0 22.5c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10z" />
                <path d="M12.5 5c-4.1 0-7.5 3.4-7.5 7.5s3.4 7.5 7.5 7.5 7.5-3.4 7.5-7.5-3.4-7.5-7.5-7.5zm0 12.5c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Shopify</h3>
              <p className="text-sm text-gray-500">
                Connect your Shopify store for e-commerce integration
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderZohoIntegration = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {showEditConfig
                ? "Edit ZOHO Books Configuration"
                : "ZOHO Books Integration"}
            </h2>
            <p className="mt-2 text-gray-600">
              {showEditConfig
                ? "Update your ZOHO Books configuration"
                : "Follow these steps to connect your ZOHO Books account"}
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
                    {showEditConfig
                      ? "Update Configuration"
                      : "Submit Configuration"}
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
    <div className="space-y-6 p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-black">Integrations</h2>
        <p className="text-sm font-[500] text-gray-600 mt-1">
          Connect your different services to enhance your bot's capabilities
        </p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {!showConfigForm ? renderZohoCard() : renderZohoIntegration()}
      </div>
    </div>
  );
};

export default Integrations;
