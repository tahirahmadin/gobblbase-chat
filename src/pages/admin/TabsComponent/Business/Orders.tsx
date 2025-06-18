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
    <div className="w-[100vw] lg:w-full overflow-x-hidden h-[100%] overflow-y-auto">
      <h2 className="text-xl lg:text-2xl font-semibold lg:w-[98%] mx-auto px-6 pt-8 pb-4 lg:p-6">
        Orders Dashboard
      </h2>
      <div className="bg-[#EEEEEE] border border-gray-200 lg:w-[95%] mx-auto px-6 pt-8 pb-24 md:pb-4 lg:p-6 ">
        {/* products order in mob  table for large file  */}
        <div className="hidden md:block w-full max-w-full max-h-[calc(100vh-220px)] overflow-y-auto rounded-lg overflow-y-auto">
          <div className="relative">
            <div className="overflow-x-auto">
              <div className="min-w-[800px] ">
                <table className="w-full rounded-lg overflow-hidden text-base  border-separate border-spacing-y-2">
                  <thead className="sticky top-0  rounded-t-lg bg-[#CEFFDC] z-5">
                    <tr className="">
                      <th className="py-1.5 px-2 text-left text-sm rounded-l-[12px] text-center whitespace-nowrap">
                        ORDER
                      </th>
                      <th className="py-1.5 px-2 text-left text-sm text-center whitespace-nowrap">
                        DATE/TIME
                      </th>
                      <th className="py-1.5 px-2 text-left text-sm text-center whitespace-nowrap">
                        CUSTOMER
                      </th>
                      <th className="py-2 px-2 lg:py-3 lg:px-4 font-semibold whitespace-nowrap">
                        Product
                      </th>
                      <th className=" py-1.5 px-2 text-left text-sm rounded-r-[12px] text-center whitespace-nowrap">
                        AMOUNT
                      </th>
                      {/* <th className=" py-1.5 px-2 text-left text-sm rounded-r-[12px] text-center whitespace-nowrap">
                        ACTIONS
                      </th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-4 px-2 lg:px-4 text-center"
                        >
                          Loading orders...
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-4 px-2 lg:px-4 text-center"
                        >
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
                            <td className="py-1.5 px-2 text-sm rounded-l-[12px] text-center whitespace-nowrap">
                              #{order.orderId}
                            </td>
                            <td className="py-1.5 px-2 text-sm text-center w-fit whitespace-nowrap">
                              <div>{date}</div>
                              <div className="text-xs text-gray-500">
                                {time}
                              </div>
                            </td>
                            <td className="py-1.5 px-2 text-sm text-center w-fit whitespace-nowrap">
                              <div className="text-[1rem]">
                                {order.shipping?.name}
                              </div>
                              <div className="text-[0.8rem]">
                                {order.userEmail}
                              </div>
                              <div className="text-[0.8rem]">
                                {order.shipping?.phone}
                              </div>
                            </td>
                            <td className="py-1.5 px-2 text-sm text-center w-fit">
                              {order.items.map((item, i) => (
                                <div key={i}>
                                  <span className="mr-1 truncat text-[1rem]">
                                    {item.title}
                                  </span>
                                  <div className="whitespace-nowrap text-[0.8rem]">
                                    Price:{" "}
                                    {order.totalAmount === 0
                                      ? "FREE"
                                      : `${item.price} ${order.currency}`}
                                  </div>
                                </div>
                              ))}
                            </td>
                            <td className="py-1.5 px-2 text-center whitespace-nowrap">
                              <div className="font-semibold text-sm">
                                {order.totalAmount / 100} {order.currency}
                              </div>
                              {order.totalAmount != 0 && (
                                <p className="text-sm">
                                  Pay with {order.paymentMethod}
                                </p>
                              )}
                            </td>
                            {/* <td className="py-1.5 px-2 rounded-r-[12px] text-center whitespace-nowrap ">
                              <button className="bg-[#FF9797] text-[#000] w-24 py-1 rounded-full border border-[#000] text-sm">
                                Cancel
                              </button>
                            </td> */}
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

        {/* products order in mob */}
        <div className="flex md:hidden flex-col gap-10">
          {isLoading ? (
            <h1 className="text-[1.5rem] text-black bg-white border rounded-lg p-4 flex flex-col gap-4">
              Loading Products
            </h1>
          ) : orders.length === 0 ? (
            <h1 className="text-[1.5rem] text-black bg-white border rounded-lg p-4 flex flex-col gap-4">
              No Products Founds
            </h1>
          ) : (
            orders.map((order) => {
              const { date, time } = formatDate(order.createdAt);
              return (
                <div
                  className="relative bg-white border rounded-lg p-4 flex flex-col gap-4"
                  key={order._id}
                >
                  <div className="top-order-id bg-[#CEFFDC] border border-black px-2 rounded-full absolute -top-[0.8rem] left-2">
                    Order: {order.orderId}
                  </div>

                  <div className="person-details flex flex-row [@media(max-width:380px)]:flex-col gap-4 items-start justify-between pt-4">
                    <div>
                      <h1 className="main-font uppercase text-[1rem] font-[500]">
                        {order.shipping.name}
                      </h1>
                      <h2 className="main-font text-[0.8rem] font-[500]">
                        {order.userEmail}
                      </h2>
                      <h2 className="main-font text-[0.8rem] font-[500]">
                        {order.shipping.phone}
                      </h2>
                    </div>
                    <div className="date-time">
                      <div>{date}</div>
                      <div className="text-xs text-gray-500">{time}</div>
                    </div>
                  </div>

                  <div className="product-and-price py-4 border-t border-black border-b">
                    {order.items.map((item, i) => (
                      <div key={i} className="">
                        <div className="flex items-center justify-between">
                          <span className="truncat">
                            Qty: {i + 1} {item.title}
                          </span>
                          <span className="whitespace-nowrap">
                            {item.price} {order.currency}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* tahir bhai this is for cancel order button and for total amount  */}
                  {/* <div className="actions flex-col xs:flex-row flex items-center justify-between gap-4 py-4">
                    <div className="pay-with-method flex items-center gap-2">
                       <span>$amount</span>
                       <span>Paid Via Stripe</span>
                    </div>
                    <div className="flex gap-1.5 items-center justify-center flex-row [@media(max-width:370px)]:flex-col">
                      <h2 className="">ACTIONS</h2>
                      <button
                            className="bg-[#FF9797] text-[#000] w-24 py-2 rounded-full border-2 border-[#000] text-sm font-semibold"
                          >
                            Cancel
                      </button>
                    </div>
                  </div> */}
                </div>
              );
            })
          )}
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
    </div>
  );
};

export default Orders;
