import React, { useState, useEffect } from "react";
import { useBotConfig } from "../../store/useBotConfig";
import { toast } from "react-hot-toast";
import { Download, RefreshCw } from "lucide-react";
import { backendApiUrl } from "../../utils/constants";

interface Lead {
  id: string;
  formId: string;
  formName: string;
  submittedAt: string;
  data: Record<string, string>;
}

const LeadsList: React.FC = () => {
  const { activeBotId } = useBotConfig();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    formId: "",
    dateFrom: "",
    dateTo: "",
  });

  const fetchLeads = async () => {
    if (!activeBotId) {
      toast.error("Please select a bot first");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `${backendApiUrl}/form/get-leads/${activeBotId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch leads");
      }
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to fetch leads");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [activeBotId]);

  const handleExport = async () => {
    if (!activeBotId) {
      toast.error("Please select a bot first");
      return;
    }
    try {
      const response = await fetch(
        `${backendApiUrl}/form/export-leads/${activeBotId}`,
        {
          method: "GET",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to export leads");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting leads:", error);
      toast.error("Failed to export leads");
    }
  };

  const filteredLeads = leads.filter((lead) => {
    if (filters.formId && lead.formId !== filters.formId) return false;
    if (
      filters.dateFrom &&
      new Date(lead.submittedAt) < new Date(filters.dateFrom)
    )
      return false;
    if (filters.dateTo && new Date(lead.submittedAt) > new Date(filters.dateTo))
      return false;
    return true;
  });

  if (!activeBotId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            No Bot Selected
          </h2>
          <p className="text-gray-500">Please select a bot to view leads</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Submitted Leads</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleExport}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={fetchLeads}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Form
              </label>
              <select
                value={filters.formId}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, formId: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Forms</option>
                {Array.from(new Set(leads.map((lead) => lead.formId))).map(
                  (formId) => (
                    <option key={formId} value={formId}>
                      {leads.find((lead) => lead.formId === formId)?.formName}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Form
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <RefreshCw className="h-6 w-6 text-gray-400 animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No leads found
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {lead.formName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(lead.submittedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="space-y-1">
                        {Object.entries(lead.data).map(([key, value]) => (
                          <div key={key} className="flex">
                            <span className="font-medium text-gray-900 mr-2">
                              {key}:
                            </span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeadsList;
