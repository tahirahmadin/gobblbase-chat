import React, { useState, useEffect } from "react";
import { useBotConfig } from "../../../store/useBotConfig";
import { getTransactions } from "../../../lib/serverActions";
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
  __v: number;
}

const Orders = () => {
  const { activeBotData } = useBotConfig();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = async () => {
    if (!activeBotData) return;

    try {
      setIsLoading(true);
      const data = await getTransactions(activeBotData.agentId);
      setOrders(data);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error(error.message || "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeBotData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };
  };

  return (
    <div className="p-2 lg:p-8 w-full">
      <h2 className="text-xl lg:text-2xl font-semibold mb-4 lg:mb-6">
        Orders Dashboard
      </h2>
      <div className="w-full max-w-full overflow-hidden">
        <div className="relative">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
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
                      ITEMS
                    </th>
                    <th className="py-2 px-2 lg:py-3 lg:px-4 font-semibold whitespace-nowrap">
                      AMOUNT
                    </th>
                    <th className="py-2 px-2 lg:py-3 lg:px-4 font-semibold whitespace-nowrap">
                      ACTION
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
                          className="bg-white border-b border-gray-200 last:border-b-0"
                        >
                          <td className="py-2 px-2 lg:py-4 lg:px-4 align-top font-medium whitespace-nowrap">
                            #{order.orderId}
                          </td>
                          <td className="py-2 px-2 lg:py-4 lg:px-4 align-top whitespace-nowrap">
                            <div>{date}</div>
                            <div className="text-xs text-gray-500">{time}</div>
                          </td>
                          <td className="py-2 px-2 lg:py-4 lg:px-4 align-top whitespace-nowrap">
                            <div className="font-medium">{order.user}</div>
                            <div className="text-xs text-gray-500">
                              {order.userEmail}
                            </div>
                          </td>
                          <td className="py-2 px-2 lg:py-4 lg:px-4 align-top">
                            {order.items.map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center text-xs lg:text-sm"
                              >
                                <span className="mr-1 truncate max-w-[100px] lg:max-w-[200px]">
                                  {item.title}
                                </span>
                                <span className="whitespace-nowrap">
                                  {item.price} {order.currency}
                                </span>
                              </div>
                            ))}
                          </td>
                          <td className="py-2 px-2 lg:py-4 lg:px-4 align-top whitespace-nowrap">
                            <div className="font-medium">
                              {order.totalAmount / 100} {order.currency}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.paymentStatus}
                            </div>
                          </td>
                          <td className="py-2 px-2 lg:py-4 lg:px-4 align-top whitespace-nowrap">
                            <button className="bg-white border border-red-300 text-red-500 rounded px-2 py-1 hover:bg-red-100 transition text-xs lg:text-sm font-medium">
                              Cancel
                            </button>
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
    </div>
  );
};

export default Orders;
