import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { useBotConfig } from "../../../../store/useBotConfig";
import { getTransactions, payOutStripe } from "../../../../lib/serverActions";
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

const Income = () => {
  const { activeBotData } = useBotConfig();
  const { clientData, adminId } = useAdminStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isCashoutLoading, setIsCashoutLoading] = useState(false);

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = transactions.slice(startIndex, endIndex);

  useEffect(() => {
    if (activeBotData) {
      fetchTransactions(currentPage);
    }
    // eslint-disable-next-line
  }, [activeBotData, currentPage]);

  const fetchTransactions = async (page: number) => {
    if (!activeBotData) return;
    try {
      setIsLoadingTransactions(true);
      const response = await getTransactions(activeBotData.agentId, page);
      setTransactions(response.orders);
      setHasNextPage(response.hasNext);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch transactions");
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleStripeCashout = async () => {
    if (!adminId) return;
    setIsCashoutLoading(true);
    try {
      const res = await payOutStripe(adminId);
      if (res.error) {
        toast.error(res.result || "Cashout failed");
      } else {
        toast.success("Cashout successful!");
        // Optionally refresh balance here
      }
    } catch (err: any) {
      toast.error(err.message || "Cashout failed");
    } finally {
      setIsCashoutLoading(false);
    }
  };

  // Dummy chart data for now
  const chartLabels = [
    "Jan 1",
    "Feb 1",
    "Mar 1",
    "Apr 1",
    "May 1",
    "Jun 1",
    "Jul 1",
    "Aug 1",
    "Sep 1",
    "Oct 1",
    "Nov 1",
    "Dec 1",
  ];

  return (
    <div
      className="p-6 w-full min-h-screen bg-[#F8F9FF] overflow-y-auto"
      style={{ maxHeight: "100vh" }}
    >
      <h1 className="text-2xl font-bold mb-6">Income</h1>
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Chart and Cashout */}
        <div className="flex-1 bg-white rounded-lg shadow p-6 flex flex-col min-h-[320px]">
          <div className="font-semibold text-lg mb-2">Total Revenue</div>
          {/* Placeholder for chart */}
          <div className="flex-1 border border-gray-200 rounded-lg bg-white mb-4 flex items-end">
            <div className="w-full flex items-end h-40">
              {/* Simple bar chart placeholder */}
              {chartLabels.map((label, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center justify-end"
                >
                  <div className="w-6 bg-blue-200 rounded-t h-8 mb-1"></div>
                  <span className="text-xs text-gray-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Cashout */}
        <div className="w-full lg:w-80 bg-[#F3F5FF] rounded-lg shadow p-6 flex flex-col gap-4">
          <div className="font-semibold text-base mb-2">
            Available for Cashout
          </div>
          <div className="text-3xl font-bold mb-2">
            {clientData?.payoutBalance?.pending / 100} USD
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Available</span>
              <span className="font-bold">
                {" "}
                {clientData?.payoutBalance?.available
                  ? clientData?.payoutBalance?.available / 100
                  : 0}{" "}
                USD
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Pending</span>
              <span className="font-bold">
                {" "}
                {clientData?.payoutBalance?.pending / 100} USD
              </span>
            </div>
          </div>
          <div>
            <button
              className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleStripeCashout}
              disabled={
                clientData?.payoutBalance?.available === 0 || isCashoutLoading
              }
            >
              {isCashoutLoading ? "Processing..." : "CASH OUT"}
            </button>
          </div>
        </div>
      </div>
      {/* Payments Log */}
      <div className="bg-[#5B6BFF] rounded-t-lg p-4 mt-8">
        <h2 className="text-lg font-semibold text-white mb-2">Payments Log</h2>
        <div
          className="overflow-x-auto"
          style={{ maxHeight: "30vh", overflowY: "auto" }}
        >
          <table className="min-w-full bg-white rounded-lg">
            <thead>
              <tr className="bg-black text-white text-sm">
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Contact Details</th>
                <th className="px-4 py-2 text-left">Order</th>
                <th className="px-4 py-2 text-left">Qty</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Payment Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingTransactions ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  </td>
                </tr>
              ) : currentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                currentTransactions.map((transaction) => {
                  const item = transaction.items[0] || {};
                  return (
                    <tr
                      key={transaction._id}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-4 py-2 font-semibold text-xs">
                        {transaction.shipping?.name || "Customer Name"}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <div>{transaction.userEmail}</div>
                        <div>Ph: {transaction.shipping?.phone}</div>
                      </td>
                      <td className="px-4 py-2   text-blue-600 font-medium cursor-pointer">
                        {item.title || "Product Name"}
                      </td>
                      <td className="px-4 py-2">
                        Qty: {item.quantity || "XX"}
                      </td>
                      <td className="px-4 py-2">
                        {transaction.currency} {item.price}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="text-blue-500 font-semibold cursor-pointer">
                          Amount
                        </div>
                        <div className="text-xs text-gray-500">
                          Paid via{" "}
                          {transaction.paymentMethod === "FIAT"
                            ? "Stripe"
                            : transaction.paymentMethod}
                          <br />
                          {new Date(
                            transaction.createdAt
                          ).toLocaleDateString()}{" "}
                          {new Date(transaction.createdAt).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="mt-4 flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoadingTransactions}
            className="px-3 py-1 rounded border border-white text-white bg-[#5B6BFF] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-white">Page {currentPage}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNextPage || isLoadingTransactions}
            className="px-3 py-1 rounded border border-white text-white bg-[#5B6BFF] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Income;
