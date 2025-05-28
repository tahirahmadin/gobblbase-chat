import React, { useState, useEffect } from "react";
import { useBotConfig } from "../../../../store/useBotConfig";
import { getTransactions } from "../../../../lib/serverActions";
import { toast } from "react-hot-toast";

interface Order {
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
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

const Orders = () => {
  const { activeBotData } = useBotConfig();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchOrders = async (page: number) => {
    if (!activeBotData) return;

    try {
      setIsLoading(true);
      const response = await getTransactions(activeBotData.agentId, page);

      setOrders(response.orders);
      setHasNextPage(response.hasNext);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error(error.message || "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [activeBotData, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };
  };

  return (
    <div className="w-screen lg:w-full w-[100%] p-2 lg:p-6 ">
      <h2 className="text-xl lg:text-2xl font-semibold mb-4 lg:mb-6">
        Orders Dashboard
      </h2>

      <div className="w-full max-w-full max-h-[calc(100vh-220px)] overflow-y-auto rounded-lg border border-gray-200">
        <div className="relative">
          <div className="overflow-x-auto">
            <div className="min-w-[800px] ">
              <table className="w-full rounded-lg overflow-hidden text-sm lg:text-base">
                <thead>
                  <tr className="bg-green-100 text-gray-700 text-left">
                    <th className="py-2 px-2 lg:py-3 lg:px-4 font-semibold whitespace-nowrap">
                      ORDER
                    </th>
                    <th className="py-2 px-2 lg:py-3 lg:px-4 font-semibold whitespace-nowrap">
                      DATE
                    </th>
                    <th className="py-2 px-2 lg:py-3 lg:px-4 font-semibold whitespace-nowrap">
                      CUSTOMER
                    </th>
                    <th className="py-2 px-2 lg:py-3 lg:px-4 font-semibold whitespace-nowrap">
                      Product
                    </th>
                    <th className="py-2 px-2 lg:py-3 lg:px-4 font-semibold whitespace-nowrap">
                      AMOUNT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-4 px-2 lg:px-4 text-center">
                        Loading orders...
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 px-2 lg:px-4 text-center">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const { date, time } = formatDate(order.createdAt);
                      return (
                        <tr
                          key={order._id}
                          className="bg-white border-b border-gray-200 last:border-b-0 text-xs lg:text-sm "
                        >
                          <td className="py-2 px-2 lg:py-4 lg:px-4 align-top font-medium whitespace-nowrap">
                            #{order.orderId}
                          </td>
                          <td className="py-2 px-2 lg:py-4 lg:px-4 align-top whitespace-nowrap">
                            <div>{date}</div>
                            <div className="text-xs text-gray-500">{time}</div>
                          </td>
                          <td className="py-2 px-2 lg:py-4 lg:px-4 align-top whitespace-nowrap">
                            <div className="font-semibold">
                              {order.shipping?.name}
                            </div>
                            <div className="font-regular text-xs">
                              {order.userEmail}
                            </div>
                          </td>
                          <td className="py-2 px-2 lg:py-4 lg:px-4 align-top">
                            {order.items.map((item, i) => (
                              <div key={i}>
                                <div className="flex items-center text-xs lg:text-sm">
                                  <span className="mr-1 truncate max-w-[100px] lg:max-w-[200px]">
                                    {item.title}
                                  </span>
                                </div>
                                <div className="whitespace-nowrap text-xs">
                                  Price: {item.price} {order.currency}
                                </div>
                              </div>
                            ))}
                          </td>
                          <td className="py-2 px-2 lg:py-4 lg:px-4 align-top whitespace-nowrap">
                            <div className="font-semibold">
                              {order.totalAmount / 100} {order.currency}
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
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-center items-center space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">Page {currentPage}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNextPage || isLoading}
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Orders;
