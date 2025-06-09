import React, { useState, useEffect } from "react";
import {
  updateCustomerLeadFlag,
  getCustomerLeads,
} from "../../../../lib/serverActions";
import { useBotConfig } from "../../../../store/useBotConfig";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 8;

const CustomerLeads = () => {
  const { activeBotId, activeBotData, setRefetchBotData } = useBotConfig();
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
      setRefetchBotData();
    } catch (error) {
      console.error("Failed to update form status:", error);
      toast.error("Failed to update form status");
      setFormEnabled(formEnabled);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
     <div
      className="p-4 sm:p-6 w-screen lg:w-full min-h-screen bg-[#F8F9FF] overflow-y-auto"
      style={{ maxHeight: "100vh", paddingBottom: 70 }}
    >
      <div className="flex flex-col lg:flex-row gap-4 overflow-y-auto">
        {/* Left Panel */}
        <div className="w-full lg:w-[30%] lg:mr-8 flex flex-col mb-2 lg:mb-0 p-2 lg:p-4">
          <h2 className="text-[2rem] font-bold text-black mb-2">Customer Leads</h2>
          <p className="text-sm text-black font-medium mb-6">
            Set up your contact form and collect inbound leads from visitors
          </p>
          <div className="flex items-center justify-between mb-6 px-4 bg-[#EAEFFF] rounded-[14px]">
            <button
              className={`h-12 rounded-full text-lg font-medium transition-all~ text-black`}
              style={{ outline: "none" }}
            >
              Contact Form
            </button>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formEnabled}
                onChange={handleFormToggle}
                className="sr-only peer "
                disabled={isUpdating}
              />
              <div className="w-11 h-6 bg-gray-200 border border-black peer-focus:outline-none rounded-full peer peer-checked:bg-green-400 transition-all"></div>
              <div
                className={`absolute border border-black left-0.0 top-0.0 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 ${
                  formEnabled ? "translate-x-5" : ""
                }`}
              ></div>
            </label>
          </div>
          <div>
            <h3 className="text-md font-semibold">
              Contact Form Fields
            </h3>
            <p className="text-sm text-gray-800 mb-2 lg:mb-4">
              Select your desired categories. All selected fields will be
              compulsory.
            </p>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  className={`relative w-[20px] h-[20px] shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.25)] rounded-full flex items-center justify-center border border-[#000000] p-3
                          ${fields.name ? "bg-[#CEFFDC]" : "bg-[#CDCDCD]"}
                            `}
                >
                  {fields.name && (
                    <div className="absolute top-1 left-1 w-4 h-4 bg-[#6AFF97] rounded-full flex items-center justify-center border border-[#000000]" />
                  )}
                </div>
                <span className="text-base">Name</span>
                <input
                  type="checkbox"
                  checked={fields.name}
                  onChange={() => handleFieldChange("name")}
                  className="hidden"
                />
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  className={`relative w-[20px] h-[20px] shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.25)] rounded-full flex items-center justify-center border border-[#000000] p-3
                          ${fields.email ? "bg-[#CEFFDC]" : "bg-[#CDCDCD]"}
                            `}
                >
                  {fields.email && (
                    <div className="absolute top-1 left-1 w-4 h-4 bg-[#6AFF97] rounded-full flex items-center justify-center border border-[#000000]" />
                  )}
                </div>
                <span className="text-base">Email Address</span>
                <input
                  type="checkbox"
                  checked={fields.email}
                  onChange={() => handleFieldChange("email")}
                  className="hidden"
                />
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  className={`relative w-[20px] h-[20px] shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.25)] rounded-full flex items-center justify-center border border-[#000000] p-3
                          ${fields.phone ? "bg-[#CEFFDC]" : "bg-[#CDCDCD]"}
                            `}
                >
                  {fields.phone && (
                    <div className="absolute top-1 left-1 w-4 h-4 bg-[#6AFF97] rounded-full flex items-center justify-center border border-[#000000]" />
                  )}
                </div>
                <span className="text-base">Phone Number</span>
                <input
                  type="checkbox"
                  checked={fields.phone}
                  onChange={() => handleFieldChange("phone")}
                  className="hidden"
                />
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  className={`relative w-[20px] h-[20px] shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.25)] rounded-full flex items-center justify-center border border-[#000000] p-3
                          ${fields.queryMessage ? "bg-[#CEFFDC]" : "bg-[#CDCDCD]"}
                            `}
                >
                  {fields.queryMessage && (
                    <div className="absolute top-1 left-1 w-4 h-4 bg-[#6AFF97] rounded-full flex items-center justify-center border border-[#000000]" />
                  )}
                </div>
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
        <div className="flex-1 w-100 lg:w-[70%] mt-4 px-2 lg:px-0 overflow-y-auto">
          <h2 className="text-lg font-semibold ">Form Responses</h2>

          <div className="min-w-full w-[100px] inline-block align-middle">
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
                <div className="w-full overflow-x-auto">
                  <table className="w-full rounded-lg border-separate border-spacing-y-2">
                    <thead>
                      <tr className="bg-black text-white text-[15px] lg:text-base">
                        <th className="py-2 px-2 lg:py-3 lg:px-6 text-left font-medium rounded-l-xl">
                          NAME
                        </th>
                        <th className="py-2 px-2 lg:py-3 lg:px-6 text-left font-medium">
                          EMAIL ADDRESS
                        </th>
                        <th className="py-2 px-2 lg:py-3 lg:px-6 text-left font-medium">
                          PHONE NUMBER
                        </th>
                        <th className="py-2 px-2 lg:py-3 lg:px-6 text-left font-medium rounded-r-xl">
                          QUERY MESSAGE
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedLeads.map((lead, idx) => (
                        <tr
                          key={idx}
                          className={` py-3 border border-black rounded-xl text-[14px] lg:text-base
                              ${idx % 2 === 0 ? "bg-[#D4DEFF]" : "bg-[#EAEFFF]"
                              }
                            `}
                        >
                          <td className="py-2 px-2 lg:py-3 lg:px-6 rounded-l-xl">
                            {lead.name}
                          </td>
                          <td className="py-2 px-2 lg:py-3 lg:px-6 ">
                            {lead.email}
                          </td>
                          <td className="py-2 px-2 lg:py-3 lg:px-6">
                            {lead.phone}
                          </td>
                          <td className="py-2 px-2 lg:py-3 lg:px-6 rounded-r-xl">
                            {lead.queryMessage}
                          </td>
                        </tr> 
                      ))}
                      <tr>
                        <td colSpan={4}>
                          {/* Pagination */}
                          <div className="flex justify-center items-center gap-4 py-4">
                            <button
                              className="w-8 h-8 flex bg-[#4D65FF] items-center justify-center rounded-full text-white disabled:bg-[#CDCDCD]"
                              disabled={page === 1}
                              onClick={() => setPage(page - 1)}
                            >
                              <ChevronLeft size={20} style={{strokeWidth: "4px"}} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                              (p) => (
                                <button
                                  key={p}
                                  className={`para-font w-8 h-8 flex items-center justify-center rounded-md font-semibold transition-all ${
                                    page === p
                                      ? "bg-white text-black border-2 border-black"
                                      : "text-[#4D65FF] hover:bg-blue-50"
                                  }`}
                                  onClick={() => setPage(p)}
                                >
                                  {p}
                                </button>
                              )
                            )}
                            <button
                              className="w-8 h-8 flex bg-[#4D65FF] items-center justify-center rounded-full text-white disabled:bg-[#CDCDCD]"
                              disabled={page === totalPages}
                              onClick={() => setPage(page + 1)}
                            >
                              <ChevronRight size={20} style={{strokeWidth: "4px"}} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLeads;
