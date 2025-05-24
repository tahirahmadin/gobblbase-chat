import React, { useState, useEffect } from "react";
import {
  updateCustomerLeadFlag,
  getCustomerLeads,
} from "../../../../lib/serverActions";
import { useBotConfig } from "../../../../store/useBotConfig";
import toast from "react-hot-toast";

const PAGE_SIZE = 8;

const CustomerLeads = () => {
  const { activeBotId, activeBotData } = useBotConfig();
  const [formEnabled, setFormEnabled] = useState(
    activeBotData?.customerLeadFlag || false
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [fields, setFields] = useState({
    name: true,
    email: true,
    phone: true,
    queryMessage: true,
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (activeBotData) {
      setFormEnabled(activeBotData.customerLeadFlag);
    }
  }, [activeBotData]);

  useEffect(() => {
    fetchLeads();
  }, [activeBotId]);

  const fetchLeads = async () => {
    if (!activeBotId) return;

    try {
      setIsLoading(true);
      const fetchedLeads = await getCustomerLeads(activeBotId);
      setLeads(fetchedLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to fetch leads");
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(leads.length / PAGE_SIZE);
  const paginatedLeads = leads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFieldChange = (field: keyof typeof fields) => {
    // setFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFormToggle = async () => {
    if (!activeBotId) {
      toast.error("No agent selected");
      return;
    }
    try {
      setIsUpdating(true);
      await updateCustomerLeadFlag(activeBotId, !formEnabled);
      setFormEnabled(!formEnabled);
    } catch (error) {
      console.error("Failed to update form status:", error);
      toast.error("Failed to update form status");
      setFormEnabled(formEnabled);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:p-8 min-h-[500px] h-screen overflow-y-auto">
      {/* Left Panel */}
      <div className="w-full lg:w-80 lg:mr-8 flex flex-col mb-8 lg:mb-0 p-4">
        <h2 className="text-lg font-bold text-black mb-2">Customer Leads</h2>
        <p className="text-sm text-black font-medium mb-6">
          Set up your contact form and collect inbound leads from visitors
        </p>
        <div className="flex items-center mb-6">
          <button
            className={`w-40 h-12 rounded-full text-lg font-medium shadow border border-gray-200 transition-all bg-blue-100 text-black`}
            style={{ outline: "none" }}
          >
            Contact Form
          </button>
          <label className="ml-4 relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formEnabled}
              onChange={handleFormToggle}
              className="sr-only peer"
              disabled={isUpdating}
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
          <h3 className="text-md font-semibold mb-2">Contact Form Fields</h3>
          <p className="text-xs text-gray-800 mb-4">
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
            <label className="flex items-center cursor-pointer">
              <span
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 transition-all ${
                  fields.queryMessage
                    ? "bg-green-200 border-green-500"
                    : "bg-gray-100 border-gray-300"
                }`}
              >
                {fields.queryMessage && (
                  <span className="w-3 h-3 bg-green-600 rounded-full"></span>
                )}
              </span>
              <span className="text-base">Query Message</span>
              <input
                type="checkbox"
                checked={fields.queryMessage}
                onChange={() => handleFieldChange("queryMessage")}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
      {/* Right Panel */}
      <div className="flex-1 w-screen lg:w-full px-4 sm:px-0 p-4">
        <h2 className="text-lg font-semibold mb-4">Form Responses</h2>

        <div className="bg-white rounded-xl shadow overflow-hidden w-full">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : leads.length === 0 ? (
            <div className="flex justify-center items-center h-64 text-gray-500">
              No leads collected yet
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-black text-white text-sm lg:text-base">
                      <th className="py-2 px-4 lg:py-3 lg:px-6 text-left font-medium rounded-tl-xl">
                        NAME
                      </th>
                      <th className="py-2 px-4 lg:py-3 lg:px-6 text-left font-medium">
                        EMAIL ADDRESS
                      </th>
                      <th className="py-2 px-4 lg:py-3 lg:px-6 text-left font-medium">
                        PHONE NUMBER
                      </th>
                      <th className="py-2 px-4 lg:py-3 lg:px-6 text-left font-medium rounded-tr-xl">
                        QUERY MESSAGE
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLeads.map((lead, idx) => (
                      <tr
                        key={idx}
                        className="bg-blue-50 text-sm lg:text-base border-b border-blue-100 last:border-b-0"
                      >
                        <td className="py-2 px-4 lg:py-3 lg:px-6">
                          {lead.name}
                        </td>
                        <td className="py-2 px-4 lg:py-3 lg:px-6">
                          {lead.email}
                        </td>
                        <td className="py-2 px-4 lg:py-3 lg:px-6">
                          {lead.phone}
                        </td>
                        <td className="py-2 px-4 lg:py-3 lg:px-6">
                          {lead.queryMessage}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center py-4 bg-white border-t border-gray-200">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 border border-gray-200 mr-2 disabled:opacity-50"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  &#60;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
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
                  )
                )}
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 border border-gray-200 ml-2 disabled:opacity-50"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  &#62;
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerLeads;
