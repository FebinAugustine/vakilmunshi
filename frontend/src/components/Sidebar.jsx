import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../stores/useAuth";

export default function Sidebar({ profile, onClose }) {
  const { logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg hidden md:block">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">VakilMunshi</h1>

        {/* Profile Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {profile?.fullName
                  ? profile.fullName.charAt(0).toUpperCase()
                  : profile?.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {profile?.fullName || "Advocate"}
              </p>
              <p className="text-xs text-gray-500">{profile?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <Link
            to="/dashboard"
            onClick={onClose}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
              location.pathname === "/dashboard" || location.pathname === "/"
                ? "text-gray-900 bg-gray-100"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Dashboard
          </Link>

          <Link
            to="/clients"
            onClick={onClose}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
              location.pathname === "/clients"
                ? "text-gray-900 bg-gray-100"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            Clients
          </Link>

          <Link
            to="/profile"
            onClick={onClose}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
              location.pathname === "/profile"
                ? "text-gray-900 bg-gray-100"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Profile
          </Link>
        </nav>

        {/* Logout Button */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg w-full"
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
