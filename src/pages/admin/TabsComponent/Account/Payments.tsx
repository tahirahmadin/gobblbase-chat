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
    }
  }, [clientData]);

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
    if (selectedCryptoChains.includes(chainId)) {
      setSelectedCryptoChains(
        selectedCryptoChains.filter((c: string) => c !== chainId)
      );
    } else {
      setSelectedCryptoChains([...selectedCryptoChains, chainId]);
    }
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
      const result = await enableStripePayment(adminId);
      setIsStripeEnabled(true);
      toast.success(result.message);
    } catch (error: any) {
      toast.error(error.message || "Failed to enable Stripe payments");
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
      toast.error(error.message || "Failed to start Stripe onboarding");
    } finally {
      setIsLoadingStripe(false);
    }
  };

  return (
    <div className="container flex flex-col lg:flex-row min-h-screen w-full bg-white">
      {/* Payment Methods Configuration */}
      <div className="w-full lg:w-1/2 p-4 lg:p-6 overflow-y-auto lg:h-screen min-h-[50vh]">
        <div className="bg-white pb-4 z-10">
          <h2 className="text-xl font-bold text-black">Payment Methods</h2>
        </div>

        <div className="space-y-6 mt-4 pb-20">
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
                <option value="GBP">INR</option>
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

          {/* Stripe Configuration */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium">Stripe Configuration</h3>
                {isStripeEnabled && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
              </div>
            </div>

            {isStripeActive ? (
              <div className="space-y-4">
                <div className="flex items-start space-x-3 text-sm text-gray-600">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <p>
                    You have successfully configured Stripe payments. Your
                    account is fully set up and ready to accept payments from
                    your customers.
                  </p>
                </div>
              </div>
            ) : !isStripeEnabled ? (
              <div className="space-y-4">
                <div className="flex items-start space-x-3 text-sm text-gray-600">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <p>
                    Enable Stripe payments to start accepting credit card
                    payments from your customers. You'll need to complete the
                    KYC process after enabling Stripe.
                  </p>
                </div>
                <button
                  onClick={handleEnableStripe}
                  disabled={isLoadingStripe}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingStripe ? "Enabling..." : "Enable Stripe Payments"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start space-x-3 text-sm text-gray-600">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                  <p>
                    Stripe payments are enabled. Complete the KYC process to
                    start accepting payments. This is required by Stripe to
                    verify your business identity.
                  </p>
                </div>
                <button
                  onClick={handleProceedKYC}
                  disabled={isLoadingStripe}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingStripe ? "Loading..." : "Proceed with KYC"}
                </button>
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Crypto Payments</span>
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
            <div className={`space-y-2 ${!cryptoEnabled ? "opacity-50" : ""}`}>
              <p className="text-xs text-gray-600">
                Connect your wallet and select your accepted chains
              </p>
              <div className="flex">
                <input
                  type="text"
                  value={cryptoAddress}
                  onChange={(e) => setCryptoAddress(e.target.value)}
                  placeholder="Paste wallet address..."
                  className="flex-1 border border-gray-300 rounded-l px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!cryptoEnabled}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "1", name: "USDT on Eth" },
                  { id: "8453", name: "USDT on Base" },
                  { id: "56", name: "USDT on BSC" },
                  { id: "97", name: "USDT on BSC Testnet" },
                ].map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => handleChainToggle(chain.id)}
                    disabled={!cryptoEnabled}
                    className={`px-3 py-1 text-xs border rounded ${
                      selectedCryptoChains.includes(chain.id)
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-gray-300 hover:bg-gray-50"
                    } ${!cryptoEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {chain.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Enable Crypto Button */}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleEnableCrypto}
              disabled={isSaving}
              className={`px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-semibold transition-colors ${
                isSaving ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Enabling...</span>
                </div>
              ) : (
                "Enable Crypto"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Payments Log */}
      <div className="w-full lg:w-1/2 bg-blue-500 p-4 lg:p-6 overflow-y-auto lg:h-screen min-h-[50vh] hidden lg:block">
        <div className="z-10 bg-blue-500 pb-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Payments Log</h2>
            <button
              onClick={() => fetchTransactions(currentPage)}
              disabled={isLoadingTransactions}
              className="p-2 bg-white rounded-full hover:bg-gray-100 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  isLoadingTransactions ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>

        <div className="w-full max-w-full max-h-[calc(100vh-220px)] overflow-y-auto rounded-lg">
          {isLoadingTransactions ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center text-white py-8">
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {transactions.map((transaction) => {
                const item = transaction.items[0] || {};
                return (
                  <div
                    key={transaction._id}
                    className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-base text-gray-900 mb-1">
                          {transaction.shipping?.name || "Customer Name"}
                        </p>
                        <p className="text-xs text-gray-600">
                          {transaction.userEmail}
                        </p>
                        <p className="text-xs text-gray-600">
                          Ph :{" "}
                          <span className="font-mono">
                            {transaction.shipping?.phone}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 mb-1">
                          {new Date(transaction.createdAt).toLocaleDateString()}{" "}
                          &nbsp;
                          {new Date(transaction.createdAt).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </p>
                        <a className="text-blue-500 text-sm font-semibold cursor-pointer">
                          {transaction.totalAmount / 100} {transaction.currency}
                        </a>
                        <p className="text-xs text-gray-500 mt-1">
                          Paid via{" "}
                          {transaction.paymentMethod === "FIAT"
                            ? "Stripe"
                            : transaction.paymentMethod}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-end mt-2">
                      <a className="text-blue-600 text-sm font-medium cursor-pointer">
                        {item.title || "Product Name"}
                      </a>
                      <div className="flex flex-row items-center gap-4">
                        <div className="text-xs text-gray-500">
                          Qty: {item.quantity || "XX"}
                        </div>
                        <div className="text-base font-semibold text-gray-800">
                          {transaction.currency} {item.price}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-end mt-1">
                      <div className="flex flex-col items-end">
                        Total Amount
                      </div>
                      <div className="text-base font-semibold text-gray-800">
                        {transaction.currency} {transaction.totalAmount / 100}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="mt-4 flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoadingTransactions}
            className="px-3 py-1 rounded border border-white text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-white">Page {currentPage}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNextPage || isLoadingTransactions}
            className="px-3 py-1 rounded border border-white text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payments;
