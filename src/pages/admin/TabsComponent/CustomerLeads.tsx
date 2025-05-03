import React, { useState } from "react";

const mockLeads = Array.from({ length: 18 }).map((_, i) => ({
  name: "First Name Last Name",
  email: "company@email.com",
  phone: "1234567890",
}));

const PAGE_SIZE = 8;

const CustomerLeads = () => {
  const [formEnabled, setFormEnabled] = useState(true);
  const [fields, setFields] = useState({
    name: true,
    email: true,
    phone: true,
  });
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(mockLeads.length / PAGE_SIZE);
  const paginatedLeads = mockLeads.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleFieldChange = (field: keyof typeof fields) => {
    setFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="flex p-8 min-h-[500px]">
      {/* Left Panel */}
      <div className="w-80 mr-8 flex flex-col">
        <h2 className="text-lg font-semibold mb-2">Customer Leads</h2>
        <p className="text-sm text-gray-500 mb-6">
          Set up your contact form and collect inbound leads from visitors
        </p>
        <div className="flex items-center mb-6">
          <button
            className={`w-40 h-12 rounded-full text-lg font-medium shadow border border-gray-200 transition-all ${
              formEnabled
                ? "bg-blue-100 text-black"
                : "bg-gray-100 text-gray-400"
            }`}
            style={{ outline: "none" }}
            disabled={!formEnabled}
          >
            Contact Form
          </button>
          <label className="ml-4 relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formEnabled}
              onChange={() => setFormEnabled((v) => !v)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-green-400 transition-all"></div>
            <div
              className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                formEnabled ? "translate-x-5" : ""
              }`}
            ></div>
          </label>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2">Contact Form Fields</h3>
          <p className="text-xs text-gray-500 mb-4">
            Select your desired categories. All selected fields will be
            compulsory.
          </p>
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer">
              <span
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 transition-all ${
                  fields.name
                    ? "bg-green-200 border-green-500"
                    : "bg-gray-100 border-gray-300"
                }`}
              >
                {fields.name && (
                  <span className="w-3 h-3 bg-green-600 rounded-full"></span>
                )}
              </span>
              <span className="text-base">Name</span>
              <input
                type="checkbox"
                checked={fields.name}
                onChange={() => handleFieldChange("name")}
                className="hidden"
              />
            </label>
            <label className="flex items-center cursor-pointer">
              <span
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 transition-all ${
                  fields.email
                    ? "bg-green-200 border-green-500"
                    : "bg-gray-100 border-gray-300"
                }`}
              >
                {fields.email && (
                  <span className="w-3 h-3 bg-green-600 rounded-full"></span>
                )}
              </span>
              <span className="text-base">Email Address</span>
              <input
                type="checkbox"
                checked={fields.email}
                onChange={() => handleFieldChange("email")}
                className="hidden"
              />
            </label>
            <label className="flex items-center cursor-pointer">
              <span
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 transition-all ${
                  fields.phone
                    ? "bg-green-200 border-green-500"
                    : "bg-gray-100 border-gray-300"
                }`}
              >
                {fields.phone && (
                  <span className="w-3 h-3 bg-green-600 rounded-full"></span>
                )}
              </span>
              <span className="text-base">Phone Number</span>
              <input
                type="checkbox"
                checked={fields.phone}
                onChange={() => handleFieldChange("phone")}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
      {/* Right Panel */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold mb-4">Form Responses</h2>
        <div className="bg-white rounded-xl shadow p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-black text-white text-base">
                <th className="py-3 px-6 font-medium text-left rounded-tl-xl">
                  NAME
                </th>
                <th className="py-3 px-6 font-medium text-left">
                  EMAIL ADDRESS
                </th>
                <th className="py-3 px-6 font-medium text-left rounded-tr-xl">
                  PHONE NUMBER
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeads.map((lead, idx) => (
                <tr
                  key={idx}
                  className="bg-blue-50 text-base border-b border-blue-100 last:border-b-0"
                >
                  <td className="py-3 px-6">{lead.name}</td>
                  <td className="py-3 px-6">{lead.email}</td>
                  <td className="py-3 px-6">{lead.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="flex justify-center items-center py-4 bg-white border-t border-gray-200">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 border border-gray-200 mr-2 disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              &#60;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`w-8 h-8 flex items-center justify-center rounded-full mx-1 text-base font-medium border transition-all ${
                  page === p
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                }`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 border border-gray-200 ml-2 disabled:opacity-50"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              &#62;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLeads;
