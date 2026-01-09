import React, { useEffect, useState } from "react";
import { useCases } from "../hooks/useCases";
import { useCaseStore } from "../stores/useCaseStore";
import CaseDetailsModal from "./CaseDetailsModal";

export default function DailyCaseList({ onCaseSelect }) {
  const [selectedCaseForDetails, setSelectedCaseForDetails] = useState(null);
  const { cases, isLoading, error, refetch } = useCases();
  const { clients, fetchClients } = useCaseStore();

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : "Unknown Client";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const handleViewCase = (caseItem) => {
    setSelectedCaseForDetails(caseItem);
  };

  const handleCloseCaseDetails = () => {
    setSelectedCaseForDetails(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">
          Error loading cases: {error.message}
        </p>
        <button
          onClick={refetch}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Daily Case List</h2>
        <p className="text-sm text-gray-600 mt-1">
          Manage your cases and hearings
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CNR Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parties
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Hearing
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cases.map((caseItem) => (
              <tr key={caseItem.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {caseItem.cnrNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getClientName(caseItem.clientId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(caseItem.nextHearing)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      caseItem.status
                    )}`}
                  >
                    {caseItem.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => onCaseSelect(caseItem)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Select
                  </button>
                  <button
                    onClick={() => handleViewCase(caseItem)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    View
                  </button>
                  <button className="text-gray-600 hover:text-gray-900">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cases.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No cases found.</p>
        </div>
      )}

      <CaseDetailsModal
        caseItem={selectedCaseForDetails}
        isOpen={!!selectedCaseForDetails}
        onClose={handleCloseCaseDetails}
      />
    </div>
  );
}
