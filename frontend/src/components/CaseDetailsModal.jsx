import React, { useState } from "react";
import { useCases } from "../hooks/useCases";
import { useClients } from "../hooks/useClients";

export default function CaseDetailsModal({ caseItem, isOpen, onClose }) {
  const { updateCase, isUpdating } = useCases();
  const { clients } = useClients();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: caseItem?.title || "",
    status: caseItem?.status || "Pending",
    nextHearing: caseItem?.nextHearing
      ? new Date(caseItem.nextHearing).toISOString().split("T")[0]
      : "",
    caseContext: caseItem?.caseContext || "",
  });

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : "Unknown Client";
  };

  const handleSave = () => {
    const updateData = {
      title: formData.title,
      status: formData.status,
      nextHearing: formData.nextHearing ? new Date(formData.nextHearing) : null,
      caseContext: formData.caseContext,
    };
    updateCase({ id: caseItem.id, caseData: updateData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      title: caseItem?.title || "",
      status: caseItem?.status || "Pending",
      nextHearing: caseItem?.nextHearing
        ? new Date(caseItem.nextHearing).toISOString().split("T")[0]
        : "",
      caseContext: caseItem?.caseContext || "",
    });
    setIsEditing(false);
  };

  if (!isOpen || !caseItem) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Case Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNR Number
                </label>
                <p className="text-sm text-gray-900">{caseItem.cnrNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client
                </label>
                <p className="text-sm text-gray-900">
                  {getClientName(caseItem.clientId)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                {isEditing ? (
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                  </select>
                ) : (
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      caseItem.status.toLowerCase() === "active"
                        ? "bg-green-100 text-green-800"
                        : caseItem.status.toLowerCase() === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {caseItem.status}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Hearing
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.nextHearing}
                    onChange={(e) =>
                      setFormData({ ...formData, nextHearing: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm text-gray-900">
                    {caseItem.nextHearing
                      ? new Date(caseItem.nextHearing).toLocaleDateString()
                      : "N/A"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Case Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Case Title
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm text-gray-900">{caseItem.title}</p>
            )}
          </div>

          {/* Case Context */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Case Context & Notes
            </label>
            {isEditing ? (
              <textarea
                value={formData.caseContext}
                onChange={(e) =>
                  setFormData({ ...formData, caseContext: e.target.value })
                }
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter case details, arguments, and important notes..."
              />
            ) : (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {caseItem.caseContext || "No case context available."}
                </p>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Timeline</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(caseItem.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Updated
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(caseItem.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
                >
                  Edit Case
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
