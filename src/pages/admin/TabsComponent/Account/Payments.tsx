import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { useBotConfig } from "../../../../store/useBotConfig";
import {
  getTransactions,
  enableStripePayment,
  completeStripeOnboarding,
  updateClientPaymentSettings,
  enableCryptoPayment,
} from "../../../../lib/serverActions";
import { toast } from "react-hot-toast";
import { useAdminStore } from "../../../../store/useAdminStore";

interface Transaction {
  _id: string;
  agentId: string;
  createdAt: string;
  currency: string;
  items: Array<{
    _id: string;
    productId: number;
    type: string;
    title?: string;
    quantity?: number;
    price?: number;
    // Add more fields as needed
  }>;
  orderId: number;
  paymentId: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  totalAmount: number;
  updatedAt: string;
  user: string;
  userEmail: string;
  shipping: {
    name: string;
    email: string;
    phone: string;
    country: string;
    address1: string;
  };
}

const Payments = () => {
  const { adminId, clientData, refetchClientData } = useAdminStore();
  const [currency, setCurrency] = useState("USD");
  const [preferredMethod, setPreferredMethod] = useState("stripe");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const [hasCryptoChanges, setHasCryptoChanges] = useState(false);

  // Payment method states
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [stripeId, setStripeId] = useState("");
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
  const [razorpayId, setRazorpayId] = useState("");
  const [cryptoEnabled, setCryptoEnabled] = useState(false);
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [selectedCryptoChains, setSelectedCryptoChains] = useState<string[]>(
    []
  );

  const [isStripeEnabled, setIsStripeEnabled] = useState(false);
  const [isStripeActive, setIsStripeActive] = useState(false);
  const [isLoadingStripe, setIsLoadingStripe] = useState(false);

  // drop down options for currency and preferred methodconst [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const currencies = ["USD", "AED", "EUR", "GBP", "INR"];
  const [isMethodOpen, setIsMethodOpen] = useState(false);

  useEffect(() => {
    if (clientData) {
      //Stripe States
      setIsStripeEnabled(clientData.paymentMethods.stripe.enabled);
      setIsStripeActive(clientData.paymentMethods.stripe.isActivated);

      //Other Payment Methods States
      setStripeId(clientData.paymentMethods.stripe.accountId);
      setRazorpayEnabled(clientData.paymentMethods.razorpay.enabled);
      setRazorpayId(clientData.paymentMethods.razorpay.accountId);
      setCryptoEnabled(clientData.paymentMethods.crypto.enabled);
      setCryptoAddress(clientData.paymentMethods.crypto.walletAddress);
      setSelectedCryptoChains(clientData.paymentMethods.crypto.chains);
      setCurrency(clientData.currency || "USD");
      setPreferredMethod(clientData.preferredPaymentMethod || "stripe");
      setHasCryptoChanges(false);
    }
  }, [clientData]);

  // Add effect to track crypto changes
  useEffect(() => {
    if (clientData) {
      const hasChanges =
        cryptoEnabled !== clientData.paymentMethods.crypto.enabled ||
        cryptoAddress !== clientData.paymentMethods.crypto.walletAddress ||
        JSON.stringify(selectedCryptoChains) !==
          JSON.stringify(clientData.paymentMethods.crypto.chains);

      setHasCryptoChanges(hasChanges);
    }
  }, [cryptoEnabled, cryptoAddress, selectedCryptoChains, clientData]);

  const handleSave = async () => {
    if (!adminId) {
      toast.error("No adminId available");
      return;
    }

    try {
      setIsSaving(true);
      await updateClientPaymentSettings(adminId, currency, preferredMethod);
      refetchClientData();
      toast.success("Payment settings updated successfully");
    } catch (error: any) {
      console.error("Error updating payment settings:", error);
      toast.error(error.message || "Failed to update payment settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChainToggle = (chainId: string) => {
    // Convert any decimal chain ID to hex if needed
    const hexChainId = chainId.startsWith("0x")
      ? chainId
      : `0x${parseInt(chainId).toString(16)}`;

    if (selectedCryptoChains.includes(hexChainId)) {
      setSelectedCryptoChains(
        selectedCryptoChains.filter((c: string) => c !== hexChainId)
      );
    } else {
      setSelectedCryptoChains([...selectedCryptoChains, hexChainId]);
    }
    setHasCryptoChanges(true);
  };

  const handleEnableCrypto = async (enableFlag: boolean) => {
    if (!adminId) {
      toast.error("No client selected");
      return;
    }

    if (!cryptoAddress) {
      toast.error("Please enter a wallet address");
      return;
    }

    if (selectedCryptoChains.length === 0) {
      toast.error("Please select at least one chain");
      return;
    }

    try {
      // Filter out any empty strings and ensure we only have valid chain IDs
      const validChainIds = selectedCryptoChains.filter(
        (id) => id && id.trim() !== ""
      );

      if (validChainIds.length === 0) {
        toast.error("Please select at least one valid chain");
        return;
      }

      const result = await enableCryptoPayment(
        adminId,
        enableFlag,
        cryptoAddress,
        validChainIds
      );
      toast.success(result.message);
      refetchClientData(); // Refresh client data to update UI
    } catch (error: any) {
      toast.error("Failed to enable crypto payment");
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleEnableStripe = async () => {
    if (!adminId) {
      toast.error("No client selected");
      return;
    }

    setIsLoadingStripe(true);
    try {
      const result = await enableStripePayment(adminId, !isStripeEnabled);
      setIsStripeEnabled(result);
      refetchClientData();
    } catch (error: any) {
      toast.error("Failed to enable Stripe payments");
    } finally {
      setIsLoadingStripe(false);
    }
  };

  const handleProceedKYC = async () => {
    if (!adminId) {
      toast.error("No client selected");
      return;
    }

    setIsLoadingStripe(true);
    try {
      const result = await completeStripeOnboarding(adminId);
      if (result) {
        window.open(result, "_blank", "noopener,noreferrer");
      } else {
        throw new Error("Failed to get onboarding URL");
      }
    } catch (error: any) {
      toast.error("Failed to start Stripe onboarding");
    } finally {
      setIsLoadingStripe(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white h-full overflow-y-auto">
      {/* Payment Methods Configuration */}
      <div className="w-full lg:h-screen min-h-[50vh]">
        <div className="bg-white pb-4 z-10 px-6 lg:px-12 pt-12">
          <h2 className="text-xl font-bold text-black">Payment Methods</h2>
        </div>

        <div className="space-y-6 lg:px-12 pb-28">
          {/* Currency and Preferred Method Selection */}
          <div className="flex flex-col flex-wrap lg:flex-row lg:space-x-12 space-y-4 lg:space-y-0">
            <div className="flex flex-col items-start sm:flex-row sm:items-center gap-2 px-6 lg:px-0">
              <label className="para-font block text-[1rem] text-black whitespace-nowrap">
                Currency
              </label>
              <div className="relative w-40 lg:w-48  flex items-center">
                <button
                  onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                  className="w-full px-3 py-2 border border-[#7D7D7D] text-sm focus:outline-none rounded-sm flex justify-between items-center bg-white"
                >
                  {currency}
                </button>
                <div className="icon bg-[#AEB8FF] px-2 py-2 border border-[#7D7D7D] border-l-0">
                  <ChevronDown
                    size={20}
                    className={`text-[#000000] stroke-[3px] transition-transform  ${
                      isCurrencyOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {isCurrencyOpen && (
                  <div className="absolute z-10 mt-1 top-8 w-full bg-white border border-[#7D7D7D] shadow-sm rounded-sm">
                    {currencies.map((curr) => (
                      <button
                        key={curr}
                        onClick={() => {
                          setCurrency(curr);
                          setIsCurrencyOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                          currency === curr ? "bg-[#AEB8FF]" : ""
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-start sm:flex-row sm:items-center gap-2 px-6 lg:px-0">
              <label className="para-font block text-[1rem] text-black whitespace-nowrap">
                Preferred Method
              </label>
              <div className="relative w-40 lg:w-48 flex items-center">
                <button
                  onClick={() => setIsMethodOpen(!isMethodOpen)}
                  className="w-full px-3 py-2 border border-[#7D7D7D] text-sm focus:outline-none rounded-sm flex justify-between items-center bg-white"
                >
                  {preferredMethod.charAt(0).toUpperCase() +
                    preferredMethod.slice(1)}
                </button>
                <div className="icon bg-[#AEB8FF] px-2 py-2 border border-[#7D7D7D] border-l-0">
                  <ChevronDown
                    size={20}
                    className={`text-[#000000] stroke-[3px] transition-transform  ${
                      isMethodOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {isMethodOpen && (
                  <div className="absolute z-10 mt-1 top-8 w-full bg-white border border-[#7D7D7D] shadow-sm rounded-sm">
                    {[
                      {
                        label: "Stripe",
                        value: "stripe",
                        enabled: stripeEnabled,
                      },
                      {
                        label: "Razorpay",
                        value: "razorpay",
                        enabled: razorpayEnabled,
                      },
                      {
                        label: "Crypto",
                        value: "crypto",
                        enabled: cryptoEnabled,
                      },
                    ].map(({ label, value, enabled }) => (
                      <button
                        key={value}
                        disabled={!enabled}
                        onClick={() => {
                          if (enabled) {
                            setPreferredMethod(value);
                            setIsMethodOpen(false);
                          }
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                          !enabled
                            ? "text-gray-400 cursor-not-allowed"
                            : "hover:bg-gray-100"
                        } ${preferredMethod === value ? "bg-[#AEB8FF]" : ""}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="w-fit flex justify-start items-center relative z-10 ml-6 lg:ml-0 lg:mt-4">
              <div className="absolute top-[4px] left-[4px] bg-[#6AFF97] w-full h-full border border-black"></div>
              <button
                onClick={handleSave}
                className="z-10 px-6 py-2 bg-[#6AFF97] border border-black text-sm font-semibold transition-colors disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>

          {/* Stripe Configuration */}
          <div className="pt-6 px-6 lg:px-0 border-y border-black pb-6 lg:border-none">
            <div className="flex items-center bg-[#EAEFFF] p-4 rounded-xl justify-between mb-6 w-1/1 sm:w-1/2 lg:w-1/3">
              <h3 className="text-lg font-semibold text-gray-900">
                Stripe Payments
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isStripeEnabled}
                  onChange={(e) => handleEnableStripe()}
                />
                <div className="w-11 h-6 bg-[#CDCDCD] peer-focus:outline-none peer-focus:ring-none peer-focus:ring-none rounded-full border border-black peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[0px] after:left-[0px] after:bg-white after:border-black after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#6AFF97]"></div>
              </label>
            </div>

            {isStripeActive ? (
              <div className="space-y-4">
                <div className="bg-green-50 w-full lg:w-1/1 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-green-800">
                        Stripe Account Active
                      </h4>
                      <p className="mt-1 text-sm text-green-700">
                        Your Stripe account is fully configured and ready to
                        accept payments. You can now start processing credit
                        card transactions from your customers.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4 text-sm text-black">
                  <span className="para-font text-[1rem]">
                    Connected Account
                  </span>
                  <span className="py-2 px-2 bg-[#CEFFDC] w-full lg:w-1/4 border-2 border-[#6AFF97]">
                    {stripeId}
                  </span>
                  {/* disconnect button is active  */}
                  <div className="w-fit flex justify-start items-center relative z-10">
                    <div className="absolute top-[4px] left-[4px] bg-[#6AFF97] w-full h-full border border-black"></div>
                    <button className="z-10 px-6 py-2 bg-[#6AFF97] border border-black text-sm font-semibold transition-colors disabled:cursor-not-allowed">
                      Disconnect
                    </button>
                  </div>
                </div>
              </div>
            ) : !isStripeEnabled ? (
              <div className="space-y-4">
                <div className="bg-yellow-50 w-full lg:w-1/1 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">
                        Stripe Payments Disabled
                      </h4>
                      <p className="mt-1 text-sm text-yellow-700">
                        Enable Stripe to start accepting credit card payments.
                        After enabling, you'll need to complete the KYC process
                        to verify your business identity.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Setup takes about 10-15 minutes</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="bg-blue-50 w-full lg:w-1/1 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">
                        Complete KYC Process
                      </h4>
                      <p className="mt-1 text-sm text-blue-700">
                        Stripe payments are enabled but require KYC
                        verification. This is a mandatory step to ensure secure
                        payment processing and compliance with financial
                        regulations.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="relative w-fit z-10">
                  <div className="absolute top-[4px] left-[4px] w-full h-full -z-10 bg-[#6AFF97] border border-black"></div>
                  <button
                    onClick={handleProceedKYC}
                    disabled={isLoadingStripe}
                    className="w-full z-10 flex items-center justify-center space-x-2 px-6 py-3 bg-[#6AFF97] border border-black text-sm font-semibold transition-colors disabled:cursor-not-allowed"
                  >
                    {isLoadingStripe ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        {clientData?.paymentMethods?.stripe?.reasons?.status ===
                          "PENDING_VERIFICATION" && <span>VISIT STRIPE</span>}
                        {clientData?.paymentMethods?.stripe?.reasons?.status !=
                          "PENDING_VERIFICATION" && (
                          <span className="whitespace-nowrap">
                            PROCEED WITH KYC
                          </span>
                        )}
                      </>
                    )}
                  </button>
                </div>

                {clientData?.paymentMethods?.stripe?.reasons &&
                  clientData.paymentMethods.stripe.reasons?.reasons?.length >
                    0 && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex items-center space-x-2 mb-3">
                        <svg
                          className="w-5 h-5 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <h4 className="text-sm font-semibold text-red-800">
                          {clientData?.paymentMethods?.stripe?.reasons
                            ?.status === "DOCUMENTS_PENDING" &&
                            "Complete following Details"}
                          {clientData?.paymentMethods?.stripe?.reasons
                            ?.status === "ERROR" && "Fix following errors"}
                          {clientData?.paymentMethods?.stripe?.reasons
                            ?.status === "PENDING_VERIFICATION" &&
                            "Stripe is verifying following"}
                        </h4>
                      </div>
                      <ul className="space-y-2">
                        {clientData?.paymentMethods?.stripe?.reasons?.reasons?.map(
                          (reason: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start space-x-2 text-sm text-red-700"
                            >
                              <span className="mt-1">•</span>
                              <span>{reason}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Razorpay */}
          {/* <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Razorpay</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={razorpayEnabled}
                  onChange={(e) => setRazorpayEnabled(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div
              className={`space-y-2 ${!razorpayEnabled ? "opacity-50" : ""}`}
            >
              <p className="text-xs text-gray-600">
                Paste your Razorpay Seller ID & connect your existing account
              </p>
              <div className="flex">
                <input
                  type="text"
                  value={razorpayId}
                  onChange={(e) => setRazorpayId(e.target.value)}
                  placeholder="Paste your Seller ID..."
                  className="flex-1 border border-gray-300 rounded-l px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!razorpayEnabled}
                />
              </div>
            </div>
          </div> */}

          {/* Crypto Configuration */}
          <div className="pt-4 px-6 lg:px-0 border-b border-black pb-8 lg:border-none">
            <div className="flex items-center bg-[#EAEFFF] p-4 rounded-xl justify-between mb-6 w-1/1 sm:w-1/2 lg:w-1/3">
              <h3 className="text-lg font-semibold text-gray-900">
                Crypto Payments
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={cryptoEnabled}
                  onChange={(e) => {
                    handleEnableCrypto(e.target.checked);
                  }}
                />
                <div className="w-11 h-6 bg-[#CDCDCD] peer-focus:outline-none peer-focus:ring-none peer-focus:ring-none rounded-full border border-black peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[0px] after:left-[0px] after:bg-white after:border-black after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#6AFF97]"></div>
              </label>
            </div>

            <div className={`space-y-6`}>
              {cryptoEnabled ? (
                <>
                  <div className="bg-blue-50 w-1/1 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <svg
                        className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">
                          Configure Your Wallet
                        </h4>
                        <p className="mt-1 text-sm text-blue-700">
                          Add your wallet address and select the cryptocurrency
                          networks you want to accept payments from.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 ">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Connect your wallet and select your accepted chains
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="relative w-full lg:w-1/3">
                          <input
                            type="text"
                            value={cryptoAddress}
                            onChange={(e) => setCryptoAddress(e.target.value)}
                            placeholder="Enter your wallet address..."
                            className={`w-full border border-[#7d7d7d] px-4 py-2.5 text-sm focus:outline-none focus:border-transparent disabled:bg-gray-50
                                ${
                                  hasCryptoChanges
                                    ? "border-2 border-[#6AFF97] bg-[#CEFFDC] focus:ring-2 focus:ring-[#6AFF97]"
                                    : "focus:ring-2 focus:ring-[#7d7d7d]"
                                }`}
                            disabled={!cryptoEnabled}
                          />
                        </div>

                        <div className="relative w-fit z-10">
                          <div className="absolute top-[4px] left-[4px] bg-[#6AFF97] w-full h-full -z-10 border border-black"></div>
                          <button
                            onClick={() => handleEnableCrypto(true)}
                            disabled={!hasCryptoChanges || isSaving}
                            className={`bg-[#6AFF97] border border-black z-10 px-6 py-2.5 text-sm font-semibold transition-colors ${
                              !hasCryptoChanges || isSaving
                                ? "cursor-not-allowed"
                                : ""
                            }`}
                          >
                            {isSaving ? (
                              <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                <span>Saving...</span>
                              </>
                            ) : (
                              <span>Save</span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-4 items-start sm:items-center pt-8 lg:pt-0">
                      <label className="block para-font text-[1rem] font-medium text-gray-700">
                        Select
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { id: "0x2105", name: "USDT on Base", icon: "🌐" },
                          { id: "0x38", name: "USDT on BSC", icon: "🔗" },
                          {
                            id: "0x61",
                            name: "USDT on BSC Testnet",
                            icon: "🧪",
                          },
                        ].map((chain) => (
                          <button
                            key={chain.id}
                            onClick={() => handleChainToggle(chain.id)}
                            disabled={!cryptoEnabled}
                            className={`flex items-center space-x-2 px-4 py-1 border rounded-full text-sm font-medium transition-colors ${
                              selectedCryptoChains.includes(chain.id)
                                ? "bg-black border-[#AEB8FF] text-[#AEB8FF]"
                                : "border-[#7D7D7D] text-black hover:bg-gray-50"
                            } ${
                              !cryptoEnabled
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <span>{chain.name}</span>
                            {/* {selectedCryptoChains.includes(chain.id) && (
                                <svg
                                  className="w-4 h-4 text-blue-500 ml-auto"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )} */}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-yellow-50  rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">
                        Enable Crypto Payments
                      </h4>
                      <p className="mt-1 text-sm text-yellow-700">
                        Toggle the switch above to enable cryptocurrency
                        payments. You'll need to provide your wallet address and
                        select supported networks.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
