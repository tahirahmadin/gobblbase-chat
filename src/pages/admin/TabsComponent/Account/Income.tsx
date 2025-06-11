import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
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
      className="p-4 sm:p-6 w-screen lg:w-full min-h-screen bg-[#F8F9FF] overflow-y-auto"
      style={{ maxHeight: "100vh", paddingBottom: 70 }}
    >
      <h1 className="main-font text-[1.6rem] text-center lg:text-start font-bold my-4 sm:mb-6 ">
        Income
      </h1>
      <div className="flex flex-col-reverse lg:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Chart and Cashout */}
        <div className="flex-1 bg-white shadow flex flex-col min-h-[280px] sm:min-h-[320px]">
          {/* Placeholder for chart */}
          <div className="flex-1 border border-black bg-white flex flex-col justify-between">
            <div className="font-semibold text-base sm:text-lg mt-2 ml-4">
              Total Revenue
            </div>

            {/* Make chart scrollable horizontally */}
            <div className="w-full overflow-x-auto">
              <div className="flex w-[200px] min-w-full items-end">
                {chartLabels.map((label, idx) => (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center justify-end px-2"
                  >
                    <div className="w-4 sm:w-6 bg-blue-200 rounded-t h-6 sm:h-8 mb-1"></div>
                    <span className="text-[10px] whitespace-nowrap sm:text-xs text-gray-400">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cashout */}
        <div className="w-full lg:w-[480px] bg-[#EAEFFF] p-4 sm:p-6 flex flex-col gap-6 mx-auto">
          {/* Top Row: Label and Main Balance */}
          <div className="flex flex-col xs:flex-row items-start justify-between mb-2">
            <div className="para-font font-semibold text-[1rem] sm:text-[1.2rem] min-w-[150px]">
              Available for
              <br />
              Cashout
            </div>
            <div
              className="bg-white px-8 py-2 min-w-[220px] w-full flex items-center justify-end"
              style={{ boxShadow: "inset 0 4px 4px rgba(0, 0, 0, 0.25)" }}
            >
              <span className="text-2xl md:text-3xl font-bold tracking-tight">
                $
                {clientData?.payoutBalance?.available
                  ? (clientData.payoutBalance.available / 100).toFixed(2)
                  : "0.00"}
              </span>
            </div>
          </div>

          {/* Stripe Section */}
          <div>
            <div className="font-semibold text-lg mb-2">Stripe</div>
            <div className="border border-black rounded p-3 mb-2">
              <div className="flex flex-row flex-wrap items-center justify-between gap-2 p-2">
                <div className="flex flex-col items-start min-w-[120px]">
                  <span className="text-base">Available Bal.</span>
                  <span className="text-xl font-semibold">
                    $
                    {clientData?.payoutBalance?.available
                      ? (clientData.payoutBalance.available / 100).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
                <div className="flex flex-col items-start min-w-[120px]">
                  <span className="text-base">Pending Bal.</span>
                  <span className="text-xl font-semibold">
                    $
                    {clientData?.payoutBalance?.pending
                      ? (clientData.payoutBalance.pending / 100).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
                <div className="relative z-10 w-fit">
                  <div className="absolute top-[4px] left-[4px] w-full h-full bg-[#6AFF97] border border-black"></div>
                  <button
                    className="relative whitespace-nowrap  px-4 py-2 bg-[#6AFF97] border border-black text-lg font-semibold hover:bg-[#4eea7a] transition-all shadow-none"
                    onClick={handleStripeCashout}
                    disabled={
                      clientData?.payoutBalance?.available === 0 ||
                      isCashoutLoading
                    }
                  >
                    {isCashoutLoading ? "Processing..." : "CASH OUT"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Razorpay Section */}
          <div>
            <div className="font-semibold text-lg mb-2">Razorpay</div>
            <div className="border border-black rounded p-2">
              <div className="flex flex-row flex-wrap items-center justify-between gap-2 p-2">
                <div className="flex flex-col items-start min-w-[120px]">
                  <span className="text-base">Available Bal.</span>
                  <span className="text-xl font-semibold">$0.00</span>
                </div>
                <div className="flex flex-col items-start min-w-[120px]">
                  <span className="text-base">Pending Bal.</span>
                  <span className="text-xl font-semibold">$0.00</span>
                </div>
                <div className="relative z-10">
                  <div className="absolute top-[4px] left-[4px] w-full h-full bg-[#6AFF97] border border-black"></div>
                  <button
                    className="relative px-4 py-2 bg-[#6AFF97] border border-black text-lg font-semibold hover:bg-[#4eea7a] transition-all shadow-none"
                    disabled
                  >
                    CASH OUT
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Payments Log */}
      <div className="bg-[#D4DEFF] rounded-lg mt-6 sm:mt-8">
        <h2 className="text-base bg-[#4D65FF] p-2 sm:text-lg rounded-t-lg font-semibold text-white mb-2">
          Payments Log
        </h2>
        {/* table for desktop  */}
        <div
          className="overflow-x-auto -mx-3 sm:mx-0 hidden sm:flex"
          style={{ maxHeight: "100%" }}
        >
          <div className="min-w-full w-[200px] inline-block align-middle p-3 sm:p-4">
            <div className="w-full overflow-x-auto">
              <table className="w-full rounded-lg border-separate border-spacing-y-2">
                <thead>
                  <tr className="bg-black text-white text-xs sm:text-sm">
                    <th className="py-2 px-2 lg:py-3 lg:px-6 text-left font-medium rounded-l-xl">
                      Customer
                    </th>
                    <th className="px-2 sm:px-4 py-2 text-left">Contact</th>
                    <th className="px-2 sm:px-4 py-2 text-left">Order</th>
                    <th className="px-2 sm:px-4 py-2 text-left">Qty</th>
                    <th className="px-2 sm:px-4 py-2 text-left">Price</th>
                    <th className="py-2 px-2 lg:py-3 lg:px-6 text-right font-medium rounded-r-xl">
                      Payment
                    </th>
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
                      <td
                        colSpan={6}
                        className="text-center py-8 text-gray-500"
                      >
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    currentTransactions.map((transaction) => {
                      const item = transaction.items[0] || {};
                      return (
                        <tr
                          key={transaction._id}
                          className="border-b bg-white last:border-b-0"
                        >
                          <td className="rounded-l-xl px-2 sm:px-4 py-2 font-semibold text-[10px] sm:text-xs">
                            {transaction.shipping?.name || "Customer Name"}
                          </td>
                          <td className="px-2 sm:px-4 py-2 text-[10px] sm:text-sm">
                            <div>{transaction.userEmail}</div>
                            <div>Ph: {transaction.shipping?.phone}</div>
                          </td>
                          <td className="px-2 sm:px-4 py-2 text-[10px] sm:text-sm text-blue-600 font-medium cursor-pointer">
                            {item.title || "Product Name"}
                          </td>
                          <td className="px-2 sm:px-4 py-2 text-[10px] sm:text-sm">
                            Qty: {item.quantity || "XX"}
                          </td>
                          <td className="px-2 sm:px-4 py-2 text-[10px] sm:text-sm">
                            {transaction.currency} {item.price}
                          </td>
                          <td className="rounded-r-xl px-2 sm:px-4 py-2 text-right">
                            <div className="text-blue-500 font-semibold text-[10px] sm:text-sm cursor-pointer">
                              Amount
                            </div>
                            <div className="text-[8px] sm:text-xs text-gray-500">
                              {new Date(
                                transaction.createdAt
                              ).toLocaleDateString()}{" "}
                              {new Date(
                                transaction.createdAt
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* table for mobile  */}
      <div className="mob-transaction flex flex-col sm:hidden w-full overflow-x-auto">
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
                    <div className="flex flex-col gap-4">
                      <div
                        key={transaction._id}
                        className="bg-white w-[95%] mx-auto flex flex-col sm:flex-row justify-between p-4 rounded-lg mt-4"
                      >
                        <div className="left">
                          <h1 className="font-semibold text-[1.2rem]">
                            {transaction.shipping?.name || "Customer Name"}
                          </h1>
                          
                          <h2 className="truncate">{transaction.userEmail}</h2>
                          <h2>Ph: {transaction.shipping?.phone}</h2>
                          <h2 className="text-blue-600 text-[1.2rem] font-medium cursor-pointer">
                            {item.title || "Product Name"}
                          </h2>
                          
                        </div>
                        <div className="right text-right mt-8">
                          <span className="date text-grey-100 text-[0.9rem] flex gap-4 items-center justify-end">
                            
                            <p>{new Date(transaction.createdAt).toLocaleDateString()}</p>
                            <p>{new Date(transaction.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}</p>
                          </span>
                          <div className="text-blue-600 text-[1.1rem] font-medium cursor-pointer">Amount</div>
                          <div className="text-grey-100 text-[0.9rem]">
                            Paid via{" "}
                            {transaction.paymentMethod === "FIAT"
                              ? "Stripe"
                              : transaction.paymentMethod}
                          </div>
                          <div className="flex items-center justify-end gap-4 font-semibold">
                            <p> Qty: {item.quantity || "XX"}</p>
                            <p>
                              {transaction.currency} {item.price}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
      </div>
        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-4 py-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoadingTransactions}
            className="w-8 h-8 flex bg-[#4D65FF] items-center justify-center rounded-full text-white disabled:bg-[#CDCDCD]"
          >
            <ChevronLeft size={20} style={{ strokeWidth: "4px" }} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`para-font w-8 h-8 flex items-center justify-center rounded-md font-semibold transition-all ${
                currentPage === p
                  ? "bg-white text-black border-2 border-black"
                  : "text-[#4D65FF] hover:bg-blue-50"
              }`}
              onClick={() => setCurrentPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNextPage || isLoadingTransactions}
            className="w-8 h-8 flex bg-[#4D65FF] items-center justify-center rounded-full text-white disabled:bg-[#CDCDCD]"
          >
            <ChevronRight size={20} style={{ strokeWidth: "4px" }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Income;
