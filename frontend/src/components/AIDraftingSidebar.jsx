import React, { useState } from "react";
import { useDrafts } from "../hooks/useDrafts";

const DRAFT_TYPES = [
  { value: "bail", label: "Bail Application" },
  { value: "bail_urgent", label: "Urgent Bail Application" },
  { value: "bail_anticipatory", label: "Anticipatory Bail Application" },
  { value: "notice", label: "Legal Notice" },
  { value: "notice_eviction", label: "Eviction Notice" },
  { value: "notice_recovery", label: "Recovery Notice" },
  { value: "petition", label: "Petition" },
  { value: "petition_divorce", label: "Divorce Petition" },
  { value: "petition_maintenance", label: "Maintenance Petition" },
];

export default function AIDraftingSidebar({ selectedCase, onClose }) {
  const { drafts, isLoading, error, generateDraft, isGenerating } = useDrafts(
    selectedCase.id
  );
  const [selectedType, setSelectedType] = useState("bail");

  const handleGenerateDraft = () => {
    generateDraft(selectedType);
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg border-l border-gray-200 z-50">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">AI Drafting</h3>
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

        {/* Case Info */}
        <div className="p-6 border-b border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Selected Case</h4>
          <p className="text-sm text-gray-600">CNR: {selectedCase.cnrNumber}</p>
          <p className="text-sm text-gray-600">Title: {selectedCase.title}</p>
        </div>

        {/* Draft Generation */}
        <div className="p-6 border-b border-gray-200">
          <h4 className="font-medium text-gray-900 mb-4">Generate New Draft</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Draft Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DRAFT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleGenerateDraft}
              disabled={isGenerating}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                "Generate Draft"
              )}
            </button>
          </div>
        </div>

        {/* Drafts List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <h4 className="font-medium text-gray-900 mb-4">Generated Drafts</h4>

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}

            {error && (
              <div className="text-center py-4">
                <p className="text-red-600 text-sm">
                  Error loading drafts: {error.message}
                </p>
              </div>
            )}

            {!isLoading && !error && drafts.length === 0 && (
              <p className="text-gray-500 text-sm">No drafts generated yet.</p>
            )}

            <div className="space-y-4">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {draft.templateType}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(draft.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                    {draft.content.length > 200
                      ? `${draft.content.substring(0, 200)}...`
                      : draft.content}
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <button className="text-xs text-blue-600 hover:text-blue-800">
                      View Full
                    </button>
                    <button className="text-xs text-green-600 hover:text-green-800">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
