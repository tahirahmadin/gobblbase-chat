import React, { useState, useEffect } from "react";
import { RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
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
  const { activeBotData, setRefetchBotData } = useBotConfig();
  const { adminId, clientData, refetchClientData } = useAdminStore();
  const [currency, setCurrency] = useState("USD");
  const [preferredMethod, setPreferredMethod] = useState("stripe");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
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

  // Calculate pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = transactions.slice(startIndex, endIndex);

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

  useEffect(() => {
    if (activeBotData) {
      // Fetch transactions
      fetchTransactions(currentPage);
    }
  }, [activeBotData, currentPage]);

  const fetchTransactions = async (page: number) => {
    if (!activeBotData) return;

    try {
      setIsLoadingTransactions(true);
      const response = await getTransactions(activeBotData.agentId, page);
      setTransactions(response.orders);
      setHasNextPage(response.hasNext);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      toast.error(error.message || "Failed to fetch transactions");
    } finally {
      setIsLoadingTransactions(false);
    }
  };

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

  const handleEnableCrypto = async () => {
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
        cryptoEnabled,
        cryptoAddress,
        validChainIds
      );
      toast.success(result.message);
      refetchClientData(); // Refresh client data to update UI
    } catch (error: any) {
      toast.error(error.message || "Failed to enable crypto payment");
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
    <div className="container flex flex-col lg:flex-row min-h-screen w-full bg-white">
      {/* Payment Methods Configuration */}
      <div className="w-full lg:w-2/3 p-4 lg:p-6 overflow-y-auto lg:h-screen min-h-[50vh]">
        <div className="bg-white pb-4 z-10">
          <h2 className="text-xl font-bold text-black">Payment Methods</h2>
        </div>

        <div className="space-y-6 py-4 pb-20">
          <div className="text-md font-semibold">
            Currency & Preferred Method
          </div>
          {/* Currency and Preferred Method Selection */}
          <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full lg:w-32 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD</option>
                <option value="AED">AED</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Preferred Method
              </label>
              <select
                value={preferredMethod}
                onChange={(e) => setPreferredMethod(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full lg:w-32 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="stripe" disabled={!stripeEnabled}>
                  Stripe
                </option>
                <option value="razorpay" disabled={!razorpayEnabled}>
                  Razorpay
                </option>
                <option value="crypto" disabled={!cryptoEnabled}>
                  Crypto
                </option>
              </select>
            </div>
          </div>
          <div className="flex justify-start items-center">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>

          {/* Stripe Configuration */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585 1.02 3.445 1.664 3.445 2.775 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Stripe Payments
                    </h3>
                    <p className="text-sm text-gray-500">
                      Accept credit card payments securely
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isStripeEnabled}
                    onChange={(e) => handleEnableStripe()}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {isStripeActive ? (
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4">
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
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Account ID: {stripeId}</span>
                  </div>
                </div>
              ) : !isStripeEnabled ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">
                          Stripe Payments Disabled
                        </h4>
                        <p className="mt-1 text-sm text-yellow-700">
                          Enable Stripe to start accepting credit card payments.
                          After enabling, you'll need to complete the KYC
                          process to verify your business identity.
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
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">
                          Complete KYC Process
                        </h4>
                        <p className="mt-1 text-sm text-blue-700">
                          Stripe payments are enabled but require KYC
                          verification. This is a mandatory step to ensure
                          secure payment processing and compliance with
                          financial regulations.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedKYC}
                    disabled={isLoadingStripe}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingStripe ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
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
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                        {clientData?.paymentMethods?.stripe?.reasons?.status ===
                          "PENDING_VERIFICATION" && <span>VISIT STRIPE</span>}
                        {clientData?.paymentMethods?.stripe?.reasons?.status !=
                          "PENDING_VERIFICATION" && (
                          <span>PROCEED WITH KYC</span>
                        )}
                      </>
                    )}
                  </button>

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
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Crypto Payments
                    </h3>
                    <p className="text-sm text-gray-500">
                      Accept cryptocurrency payments
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={cryptoEnabled}
                    onChange={(e) => setCryptoEnabled(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div
                className={`space-y-6 ${!cryptoEnabled ? "opacity-50" : ""}`}
              >
                {cryptoEnabled ? (
                  <>
                    <div className="bg-blue-50 rounded-lg p-4">
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
                            Add your wallet address and select the
                            cryptocurrency networks you want to accept payments
                            from.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Wallet Address
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cryptoAddress}
                            onChange={(e) => setCryptoAddress(e.target.value)}
                            placeholder="Enter your wallet address..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                            disabled={!cryptoEnabled}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Supported Networks
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {[
                            { id: "0x2105", name: "USDT on Base", icon: "🌐" },
                            { id: "0x38", name: "USDT on BSC", icon: "🔗" },
                            // {
                            //   id: "0x61",
                            //   name: "USDT on BSC Testnet",
                            //   icon: "🧪",
                            // },
                          ].map((chain) => (
                            <button
                              key={chain.id}
                              onClick={() => handleChainToggle(chain.id)}
                              disabled={!cryptoEnabled}
                              className={`flex items-center space-x-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
                                selectedCryptoChains.includes(chain.id)
                                  ? "bg-blue-50 border-blue-200 text-blue-700"
                                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
                              } ${
                                !cryptoEnabled
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              <span className="text-lg">{chain.icon}</span>
                              <span>{chain.name}</span>
                              {selectedCryptoChains.includes(chain.id) && (
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
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleEnableCrypto}
                        disabled={!hasCryptoChanges || isSaving}
                        className={`flex items-center space-x-2 px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-semibold transition-colors ${
                          !hasCryptoChanges || isSaving
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <svg
                        className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-gray-800">
                          Enable Crypto Payments
                        </h4>
                        <p className="mt-1 text-sm text-gray-600">
                          Toggle the switch above to enable cryptocurrency
                          payments. You'll need to provide your wallet address
                          and select supported networks.
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
    </div>
  );
};

export default Payments;
