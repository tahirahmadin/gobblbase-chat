import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Copy,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useBotConfig } from "../../../../store/useBotConfig";
import {
  updateAgentPaymentSettings,
  getTransactions,
} from "../../../../lib/serverActions";
import { toast } from "react-hot-toast";

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
  const [currency, setCurrency] = useState("USD");
  const [preferredMethod, setPreferredMethod] = useState("Stripe");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Payment method states
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [stripeId, setStripeId] = useState("");
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
  const [razorpayId, setRazorpayId] = useState("");
  const [usdtEnabled, setUsdtEnabled] = useState(false);
  const [usdtAddress, setUsdtAddress] = useState("");
  const [usdcEnabled, setUsdcEnabled] = useState(false);
  const [usdcAddress, setUsdcAddress] = useState("");

  // Selected chains for crypto
  const [selectedUsdtChains, setSelectedUsdtChains] = useState<string[]>([]);
  const [selectedUsdcChains, setSelectedUsdcChains] = useState<string[]>([]);

  useEffect(() => {
    if (activeBotData) {
      setCurrency(activeBotData.currency || "USD");
      setPreferredMethod(activeBotData.preferredPaymentMethod || "Stripe");

      // Initialize payment methods
      if (activeBotData.paymentMethods) {
        setStripeEnabled(activeBotData.paymentMethods.stripe.enabled);
        setStripeId(activeBotData.paymentMethods.stripe.accountId);
        setRazorpayEnabled(activeBotData.paymentMethods.razorpay.enabled);
        setRazorpayId(activeBotData.paymentMethods.razorpay.accountId);
        setUsdtEnabled(activeBotData.paymentMethods.usdt.enabled);
        setUsdtAddress(activeBotData.paymentMethods.usdt.walletAddress);
        setUsdcEnabled(activeBotData.paymentMethods.usdc.enabled);
        setUsdcAddress(activeBotData.paymentMethods.usdc.walletAddress);
        setSelectedUsdtChains(activeBotData.paymentMethods.usdt.chains);
        setSelectedUsdcChains(activeBotData.paymentMethods.usdc.chains);
      }

      // Fetch transactions
      fetchTransactions();
    }
  }, [activeBotData]);

  const fetchTransactions = async () => {
    if (!activeBotData) return;

    try {
      setIsLoadingTransactions(true);
      const data = await getTransactions(activeBotData.agentId);
      // Map data to ensure it matches Transaction interface
      const mapped = (data || []).map((t: any) => ({
        _id: t._id,
        agentId: t.agentId,
        createdAt: t.createdAt,
        currency: t.currency,
        items: t.items || [],
        orderId: t.orderId,
        paymentId: t.paymentId,
        paymentMethod: t.paymentMethod,
        paymentStatus: t.paymentStatus,
        status: t.status,
        totalAmount: t.totalAmount,
        updatedAt: t.updatedAt,
        user: t.user,
        userEmail: t.userEmail,
        shipping: t.shipping,
      }));
      setTransactions(mapped);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      toast.error(error.message || "Failed to fetch transactions");
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSave = async () => {
    if (!activeBotData) {
      toast.error("No agent selected");
      return;
    }

    // Validate required fields for enabled payment methods
    if (stripeEnabled && !stripeId) {
      toast.error("Please enter Stripe Account ID");
      return;
    }
    if (razorpayEnabled && !razorpayId) {
      toast.error("Please enter Razorpay Account ID");
      return;
    }
    if (usdtEnabled && !usdtAddress) {
      toast.error("Please enter USDT Wallet Address");
      return;
    }
    if (usdcEnabled && !usdcAddress) {
      toast.error("Please enter USDC Wallet Address");
      return;
    }

    try {
      setIsSaving(true);
      await updateAgentPaymentSettings(activeBotData.agentId, {
        currency,
        preferredPaymentMethod: preferredMethod,
        paymentMethods: {
          stripe: {
            enabled: stripeEnabled,
            accountId: stripeEnabled ? stripeId : "",
          },
          razorpay: {
            enabled: razorpayEnabled,
            accountId: razorpayEnabled ? razorpayId : "",
          },
          usdt: {
            enabled: usdtEnabled,
            walletAddress: usdtEnabled ? usdtAddress : "",
            chains: usdtEnabled ? selectedUsdtChains : [],
          },
          usdc: {
            enabled: usdcEnabled,
            walletAddress: usdcEnabled ? usdcAddress : "",
            chains: usdcEnabled ? selectedUsdcChains : [],
          },
        },
      });
      setRefetchBotData();
      toast.success("Payment settings updated successfully");
    } catch (error: any) {
      console.error("Error updating payment settings:", error);
      toast.error(error.message || "Failed to update payment settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChainToggle = (chain: string, isUsdt: boolean) => {
    const setChains = isUsdt ? setSelectedUsdtChains : setSelectedUsdcChains;
    const currentChains = isUsdt ? selectedUsdtChains : selectedUsdcChains;

    if (currentChains.includes(chain)) {
      setChains(currentChains.filter((c) => c !== chain));
    } else {
      setChains([...currentChains, chain]);
    }
  };

  // Calculate pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = transactions.slice(startIndex, endIndex);

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
                <option value="Stripe" disabled={!stripeEnabled}>
                  Stripe
                </option>
                <option value="Razorpay" disabled={!razorpayEnabled}>
                  Razorpay
                </option>
                <option value="USDT" disabled={!usdtEnabled}>
                  USDT
                </option>
                <option value="USDC" disabled={!usdcEnabled}>
                  USDC
                </option>
              </select>
            </div>
          </div>

          {/* Stripe */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Stripe</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={stripeEnabled}
                  onChange={(e) => setStripeEnabled(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div
              className={`bg-green-50 p-3 rounded-md relative ${
                !stripeEnabled ? "opacity-50" : ""
              }`}
            >
              <p className="text-xs text-gray-600 mb-2">
                Paste your Stripe Seller ID & connect your existing account
              </p>
              <div className="text-xs font-mono bg-white p-2 rounded border border-green-200 break-all">
                <input
                  type="text"
                  value={stripeId}
                  onChange={(e) => setStripeId(e.target.value)}
                  placeholder="Enter Stripe Account ID"
                  className="w-full bg-transparent focus:outline-none"
                  disabled={!stripeEnabled}
                />
              </div>
              <div className="absolute right-2 top-2 flex space-x-1">
                <button
                  onClick={() => setStripeId("")}
                  className="p-1 bg-white rounded shadow-sm hover:bg-gray-50"
                  disabled={!stripeEnabled}
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
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

          {/* USDT (Crypto) */}
          {/* <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">USDT (Crypto)</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={usdtEnabled}
                  onChange={(e) => setUsdtEnabled(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className={`space-y-2 ${!usdtEnabled ? "opacity-50" : ""}`}>
              <p className="text-xs text-gray-600">
                Connect your wallet and select your accepted chains
              </p>
              <div className="flex">
                <input
                  type="text"
                  value={usdtAddress}
                  onChange={(e) => setUsdtAddress(e.target.value)}
                  placeholder="Paste wallet address..."
                  className="flex-1 border border-gray-300 rounded-l px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!usdtEnabled}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "USDT on Eth",
                  "USDT on Base",
                  "USDT on BSC",
                  "USDT on Solana",
                ].map((chain) => (
                  <button
                    key={chain}
                    onClick={() => handleChainToggle(chain, true)}
                    disabled={!usdtEnabled}
                    className={`px-3 py-1 text-xs border rounded ${
                      selectedUsdtChains.includes(chain)
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-gray-300 hover:bg-gray-50"
                    } ${!usdtEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {chain}
                  </button>
                ))}
              </div>
            </div>
          </div> */}

          {/* USDC (Crypto) */}
          {/* <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">USDC (Crypto)</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={usdcEnabled}
                  onChange={(e) => setUsdcEnabled(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div
              className={`bg-green-50 p-3 rounded-md relative ${
                !usdcEnabled ? "opacity-50" : ""
              }`}
            >
              <p className="text-xs text-gray-600 mb-2">
                Connect your wallet and select your accepted chains
              </p>
              <div className="text-xs font-mono bg-white p-2 rounded border border-green-200 break-all">
                <input
                  type="text"
                  value={usdcAddress}
                  onChange={(e) => setUsdcAddress(e.target.value)}
                  placeholder="Enter USDC Wallet Address"
                  className="w-full bg-transparent focus:outline-none"
                  disabled={!usdcEnabled}
                />
              </div>
              <div className="absolute right-2 top-2 flex space-x-1">
                <button
                  onClick={() => handleCopy(usdcAddress)}
                  className="p-1 bg-white rounded shadow-sm hover:bg-gray-50"
                  disabled={!usdcEnabled}
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setUsdcAddress("")}
                  className="p-1 bg-white rounded shadow-sm hover:bg-gray-50"
                  disabled={!usdcEnabled}
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  "USDC on Eth",
                  "USDC on Base",
                  "USDC on BSC",
                  "USDC on Solana",
                ].map((chain) => (
                  <button
                    key={chain}
                    onClick={() => handleChainToggle(chain, false)}
                    disabled={!usdcEnabled}
                    className={`px-3 py-1 text-xs border rounded ${
                      selectedUsdcChains.includes(chain)
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-gray-300 hover:bg-gray-50"
                    } ${!usdcEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {chain}
                  </button>
                ))}
              </div>
            </div>
          </div> */}

          {/* Save Button */}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-semibold transition-colors ${
                isSaving ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                "SAVE"
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
              onClick={fetchTransactions}
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

        {isLoadingTransactions ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center text-white py-8">
            <p>No transactions found</p>
          </div>
        ) : (
          <>
            <div className="space-y-6 ">
              {currentTransactions.map((transaction) => {
                const item = transaction.items[0] || {};
                return (
                  <div
                    key={transaction._id}
                    className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-base text-gray-900 mb-1">
                          {transaction.shipping.name || "Customer Name"}
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
                      <a className="text-blue-600 text-sm font-medium  cursor-pointer">
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded-full bg-white text-blue-500 border border-blue-200 hover:bg-blue-100 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-full border font-medium ${
                          page === currentPage
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-white text-blue-500 border-blue-200"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-1 rounded-full bg-white text-blue-500 border border-blue-200 hover:bg-blue-100 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Payments;
