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
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-6">Orders Dashboard</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-green-100 text-gray-700 text-left">
              <th className="py-3 px-4 font-semibold">ORDER NO.</th>
              <th className="py-3 px-4 font-semibold">DATE/TIME</th>
              <th className="py-3 px-4 font-semibold">NAME</th>
              <th className="py-3 px-4 font-semibold">ORDER</th>
              <th className="py-3 px-4 font-semibold">AMOUNT</th>
              <th className="py-3 px-4 font-semibold">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-4 px-4 text-center">
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 px-4 text-center">
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
                    <td className="py-4 px-4 align-top text-lg font-medium">
                      #{order.orderId}
                    </td>
                    <td className="py-4 px-4 align-top">
                      <div>{date}</div>
                      <div className="text-xs text-gray-500">{time}</div>
                    </td>
                    <td className="py-4 px-4 align-top">
                      <div className="font-semibold">{order.user}</div>
                      <div className="text-xs text-gray-500">
                        {order.userEmail}
                      </div>
                    </td>
                    <td className="py-4 px-4 align-top">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center text-sm">
                          <span className="mr-1">{item.title}</span>
                          <span>
                            {item.price} {order.currency}
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="py-4 px-4 align-top">
                      <div className="text-lg font-semibold">
                        {order.totalAmount / 100} {order.currency}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.paymentStatus}
                      </div>
                    </td>
                    <td className="py-4 px-4 align-top">
                      <button className="bg-white border border-red-300 text-red-500 rounded-md px-4 py-1 hover:bg-red-100 transition text-sm font-medium">
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
  );
};

export default Orders;
