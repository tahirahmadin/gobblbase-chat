import React, { useState } from "react";
import {
  ArrowRight,
  Copy,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface PaymentLog {
  customerName: string;
  customerEmail: string;
  date: string;
  productName: string;
  quantity: number;
  cost: number;
}

const Payments = () => {
  const [currency, setCurrency] = useState("USD");
  const [preferredMethod, setPreferredMethod] = useState("Stripe");
  const [stripeId, setStripeId] = useState("");
  const [razorpayId, setRazorpayId] = useState("");
  const [usdtAddress, setUsdtAddress] = useState("");
  const [usdcAddress, setUsdcAddress] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Mock payment logs data
  const paymentLogs: PaymentLog[] = [
    {
      customerName: "Customer Name",
      customerEmail: "user@email.com",
      date: "02/08/2024",
      productName: "Product Name",
      quantity: 1,
      cost: 99.99,
    },
    // Add more mock data as needed
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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
              <option value="Stripe">Stripe</option>
              <option value="Razorpay">Razorpay</option>
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
        </div>

        {/* Stripe */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Stripe</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="bg-green-50 p-3 rounded-md relative">
            <p className="text-xs text-gray-600 mb-2">
              Paste your Stripe Seller ID & connect your existing account
            </p>
            <div className="text-xs font-mono bg-white p-2 rounded border border-green-200 break-all">
              {stripeId ||
                "e7key234567key234567key234567key234567key234567key234567"}
            </div>
            <div className="absolute right-2 top-2 flex space-x-1">
              <button
                onClick={() => handleCopy(stripeId)}
                className="p-1 bg-white rounded shadow-sm hover:bg-gray-50"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={() => setStripeId("")}
                className="p-1 bg-white rounded shadow-sm hover:bg-gray-50"
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
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="space-y-2">
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
              />
              <button className="bg-green-500 text-white px-4 rounded-r hover:bg-green-600">
                Save
              </button>
            </div>
          </div>
        </div>

        {/* USDT (Crypto) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">USDT (Crypto)</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="space-y-2">
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
              />
              <button className="bg-green-500 text-white px-4 rounded-r hover:bg-green-600">
                Save
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">
                USDT on Eth
              </button>
              <button className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">
                USDT on Base
              </button>
              <button className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">
                USDT on BSC
              </button>
              <button className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">
                USDT on Solana
              </button>
            </div>
          </div>
        </div>

        {/* USDC (Crypto) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">USDC (Crypto)</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="bg-green-50 p-3 rounded-md relative">
            <p className="text-xs text-gray-600 mb-2">
              Connect your wallet and select your accepted chains
            </p>
            <div className="text-xs font-mono bg-white p-2 rounded border border-green-200 break-all">
              {usdcAddress || "0x1234...5678"}
            </div>
            <div className="absolute right-2 top-2 flex space-x-1">
              <button
                onClick={() => handleCopy(usdcAddress)}
                className="p-1 bg-white rounded shadow-sm hover:bg-gray-50"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={() => setUsdcAddress("")}
                className="p-1 bg-white rounded shadow-sm hover:bg-gray-50"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50">
                USDC on Eth
              </button>
              <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50">
                USDC on Base
              </button>
              <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50">
                USDC on BSC
              </button>
              <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50">
                USDC on Solana
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Log */}
      <div className="bg-blue-500 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Payments Log</h2>
        <div className="space-y-4">
          {paymentLogs.map((log, index) => (
            <div key={index} className="bg-white rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{log.customerName}</p>
                  <p className="text-sm text-gray-500">{log.customerEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{log.date}</p>
                  <button className="text-blue-500 text-sm hover:text-blue-600">
                    Invoice
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <p className="text-gray-600">{log.productName}</p>
                <div className="flex items-center space-x-4">
                  <p>Qty: {log.quantity}</p>
                  <p className="font-medium">${log.cost}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="p-1 rounded-full bg-blue-600 text-white hover:bg-blue-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <button className="w-8 h-8 rounded-full bg-white text-blue-500 font-medium">
              1
            </button>
            <button className="w-8 h-8 rounded-full text-white">2</button>
            <button className="w-8 h-8 rounded-full text-white">3</button>
          </div>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="p-1 rounded-full bg-blue-600 text-white hover:bg-blue-700"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payments;
