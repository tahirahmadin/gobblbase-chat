import React from "react";

const mockOrders = [
  {
    orderNo: "101",
    date: "DD MM YY",
    time: "HH:MM",
    name: "Full Name",
    email: "email@company.com",
    phone: "+999999999999",
    items: [
      { qty: 1, name: "ABC Item", amount: "$$" },
      { qty: 2, name: "Product Name", amount: "$$" },
    ],
    total: "$$$",
    status: "Paid via Stripe",
  },
  {
    orderNo: "101",
    date: "DD MM YY",
    time: "HH:MM",
    name: "Full Name",
    email: "email@company.com",
    phone: "+999999999999",
    items: [
      { qty: 1, name: "ABC Item", amount: "$$" },
      { qty: 2, name: "Product Name", amount: "$$" },
    ],
    total: "$$$",
    status: "Paid via Stripe",
  },
  {
    orderNo: "101",
    date: "DD MM YY",
    time: "HH:MM",
    name: "Full Name",
    email: "email@company.com",
    phone: "+999999999999",
    items: [
      { qty: 1, name: "ABC Item", amount: "$$" },
      { qty: 2, name: "Product Name", amount: "$$" },
    ],
    total: "$$$",
    status: "Paid via Stripe",
  },
];

const Orders = () => {
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
            {mockOrders.map((order, idx) => (
              <tr
                key={idx}
                className="bg-white border-b border-gray-200 last:border-b-0"
              >
                <td className="py-4 px-4 align-top text-lg font-medium">
                  {order.orderNo}
                </td>
                <td className="py-4 px-4 align-top">
                  <div>{order.date}</div>
                  <div className="text-xs text-gray-500">{order.time}</div>
                </td>
                <td className="py-4 px-4 align-top">
                  <div className="font-semibold">{order.name}</div>
                  <div className="text-xs text-gray-500">{order.email}</div>
                  <div className="text-xs text-gray-500">{order.phone}</div>
                </td>
                <td className="py-4 px-4 align-top">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center text-sm">
                      <span className="mr-1">Qty: {item.qty}</span>
                      <span className="mr-1">{item.name}</span>
                      <span>{item.amount}</span>
                    </div>
                  ))}
                </td>
                <td className="py-4 px-4 align-top">
                  <div className="text-lg font-semibold">{order.total}</div>
                  <div className="text-xs text-gray-500">{order.status}</div>
                </td>
                <td className="py-4 px-4 align-top">
                  <button className="bg-white border border-red-300 text-red-500 rounded-md px-4 py-1 hover:bg-red-100 transition text-sm font-medium">
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
