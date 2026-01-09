import React, { useState } from "react";
import { useAuth } from "../stores/useAuth";
import { useProfile } from "../hooks/useProfile";
import Sidebar from "./Sidebar";
import DailyCaseList from "./DailyCaseList";
import AIDraftingSidebar from "./AIDraftingSidebar";

export default function Dashboard() {
  const { isLoggedIn } = useAuth();
  const {
    profile,
    isLoading: profileLoading,
    error: profileError,
  } = useProfile();
  const [selectedCase, setSelectedCase] = useState(null);
  const [showAIDrafting, setShowAIDrafting] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to access the dashboard
          </h2>
          <p className="text-gray-600">
            You need to be authenticated to view this page.
          </p>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error loading profile
          </h2>
          <p className="text-gray-600">{profileError.message}</p>
        </div>
      </div>
    );
  }

  const handleCaseSelect = (caseItem) => {
    setSelectedCase(caseItem);
    setShowAIDrafting(true);
  };

  const handleCloseAIDrafting = () => {
    setShowAIDrafting(false);
    setSelectedCase(null);
  };

  return (
    <div className="flex">
      {/* Daily Case List */}
      <div className={`flex-1 ${showAIDrafting ? "lg:mr-96" : ""}`}>
        <DailyCaseList onCaseSelect={handleCaseSelect} />
      </div>

      {/* AI Drafting Sidebar */}
      {showAIDrafting && selectedCase && (
        <AIDraftingSidebar
          selectedCase={selectedCase}
          onClose={handleCloseAIDrafting}
        />
      )}
    </div>
  );
}
