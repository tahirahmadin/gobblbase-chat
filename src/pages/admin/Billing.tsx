import React, { useState } from "react";

const Billing = () => {
  // Placeholder state for form fields and cards
  const [details, setDetails] = useState({
    name: "",
    email: "",
    country: "United States of America",
    state: "",
    address1: "",
    address2: "",
    zipcode: "",
  });
  const [cards] = useState([
    { type: "Visa", last4: "1234", exp: "11/29", default: true },
    { type: "Mastercard", last4: "1234", exp: "11/29", default: false },
  ]);
  const [history] = useState([
    { id: 102, date: "DD MM YYYY", amount: "$100", status: "pay" },
    { id: 101, date: "DD MM YYYY", amount: "$100", status: "paid" },
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Billing Details */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Billing Details</h2>
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1">
                <label className="block font-medium mb-1">
                  Individual/Organisation Name
                </label>
                <input
                  className="w-full border rounded px-3 py-2 mb-2"
                  placeholder="Type your name or brand"
                />
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1">
                  Billing Email Address
                </label>
                <input
                  className="w-full border rounded px-3 py-2 mb-2"
                  placeholder="Type your email..."
                />
              </div>
              <div className="flex items-end">
                <button className="bg-green-200 hover:bg-green-300 text-green-900 font-semibold px-6 py-2 rounded shadow w-full md:w-auto">
                  SAVE
                </button>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1">
                <label className="block font-medium mb-1">Country</label>
                <select className="w-full border rounded px-3 py-2 mb-2">
                  <option>United States of America</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1">State</label>
                <input
                  className="w-full border rounded px-3 py-2 mb-2"
                  placeholder=""
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1">
                <label className="block font-medium mb-1">Address</label>
                <input
                  className="w-full border rounded px-3 py-2 mb-2"
                  placeholder="Address Line 1..."
                />
                <input
                  className="w-full border rounded px-3 py-2 mb-2"
                  placeholder="Address Line 2..."
                />
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1">
                  Zipcode (if applicable)
                </label>
                <input
                  className="w-full border rounded px-3 py-2 mb-2"
                  placeholder="Type your Pincode..."
                />
                <div className="flex items-end mt-2">
                  <button className="bg-green-200 hover:bg-green-300 text-green-900 font-semibold px-6 py-2 rounded shadow w-full md:w-auto">
                    SAVE
                  </button>
                </div>
              </div>
            </div>
          </div>
          <hr className="my-8" />
          {/* Billing History */}
          <h3 className="text-lg font-bold mb-4">Billing History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-green-50 rounded-lg">
              <thead>
                <tr className="text-left text-gray-700">
                  <th className="px-4 py-2">INVOICE NO.</th>
                  <th className="px-4 py-2">CREATED</th>
                  <th className="px-4 py-2">AMOUNT</th>
                  <th className="px-4 py-2">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id} className="border-t border-green-100">
                    <td className="px-4 py-2">{row.id}</td>
                    <td className="px-4 py-2">{row.date}</td>
                    <td className="px-4 py-2">{row.amount}</td>
                    <td className="px-4 py-2">
                      {row.status === "pay" ? (
                        <button className="bg-green-200 hover:bg-green-300 text-green-900 font-semibold px-6 py-1 rounded shadow">
                          PAY
                        </button>
                      ) : (
                        <span className="text-gray-700">Paid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Billing Method */}
        <div>
          <div className="bg-blue-100 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 bg-blue-400 rounded-t-lg text-white px-4 py-2 -mx-6 -mt-6">
              Billing Method
            </h3>
            <div className="mb-4">
              <div className="text-gray-700 font-semibold mb-2">
                Payment Cards
              </div>
              <div className="space-y-3">
                {cards.map((card, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg p-4 flex items-center justify-between border-2 border-blue-200 relative"
                  >
                    <div>
                      <div className="font-semibold">&lt;Card Type&gt;</div>
                      <div className="text-gray-500">
                        XXXX XXXX XXXX {card.last4}
                      </div>
                    </div>
                    <div className="text-gray-500 text-sm">Exp. {card.exp}</div>
                    {card.default && (
                      <span className="absolute top-2 right-2 bg-black text-white text-xs px-3 py-1 rounded-full">
                        Default Card
                      </span>
                    )}
                  </div>
                ))}
                <button className="w-full flex items-center justify-center border-2 border-blue-300 rounded-lg py-2 text-blue-700 font-semibold bg-blue-50 hover:bg-blue-200">
                  <span className="mr-2 text-xl">+</span> Add Card
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
