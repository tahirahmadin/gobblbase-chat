import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Copy,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useBotConfig } from "../../../store/useBotConfig";
import {
  updateAgentPaymentSettings,
  getTransactions,
} from "../../../lib/serverActions";
import { toast } from "react-hot-toast";

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  productName: string;
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
      setTransactions(data);
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
    <div className="container grid grid-cols-2 gap-6 w-full bg-white p-6">
      {/* Payment Methods Configuration */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>

        {/* Currency and Preferred Method Selection */}
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-32 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD</option>
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
              className="border border-gray-300 rounded px-3 py-2 w-32 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                onClick={() => handleCopy(stripeId)}
                className="p-1 bg-white rounded shadow-sm hover:bg-gray-50"
                disabled={!stripeEnabled}
              >
                <Copy className="w-3 h-3" />
              </button>
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
        <div className="space-y-2">
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
          <div className={`space-y-2 ${!razorpayEnabled ? "opacity-50" : ""}`}>
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
        </div>

        {/* USDT (Crypto) */}
        <div className="space-y-2">
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
        </div>

        {/* USDC (Crypto) */}
        <div className="space-y-2">
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
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
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

      {/* Payments Log */}
      <div className="bg-blue-500 rounded-lg p-6">
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
            <div className="space-y-4">
              {currentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{transaction.productName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 capitalize">
                        {transaction.status}
                      </p>
                      <button className="text-blue-500 text-sm hover:text-blue-600">
                        Invoice
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <p className="text-gray-600">
                      Transaction ID: {transaction.id}
                    </p>
                    <div className="flex items-center space-x-4">
                      <p className="font-medium">
                        {transaction.currency} {transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-full ${
                          page === currentPage
                            ? "bg-white text-blue-500 font-medium"
                            : "text-white"
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
                  className="p-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
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
