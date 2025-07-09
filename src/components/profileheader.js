import React, { useContext, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import photo from "../Assets/general_profile.png";
import { AuthContext } from "../context/AuthContext";

const SIDEBAR_WIDTH = "w-20"; // Tailwind class for sidebar width
const SIDEBAR_MARGIN = "ml-20"; // Tailwind class for header left margin

const ProfileHeader = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [showName, setShowName] = useState(false);

  return (
    <div className="w-full flex justify-between items-center fixed top-0 left-0 right-0 z-30 bg-white" style={{ height: '60px' }}>
      {/* Search Bar */}
      <div className="relative max-w-xl flex-1 ml-24">
        <input
          type="text"
          placeholder="Search for template/documents"
          className="w-full pl-12 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-transparent text-gray-700 bg-[#f5f6fa] border-2 border-gray-200"
        />
      </div>
      {/* Profile Section */}
      <div
        className="flex items-center gap-2 sm:gap-3 mr-2 sm:mr-10 cursor-pointer relative"
        onClick={() => navigate("/profile")}
        title="Go to Profile"
        onMouseEnter={() => setShowName(true)}
        onMouseLeave={() => setShowName(false)}
        onTouchStart={() => setShowName((prev) => !prev)}
      >
        {/* Crown Icon (optional) */}
      
        {/* Avatar */}
        <img
          src={user?.profilePic || photo}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover"
        />
        {/* Name and Subtext: only show as tooltip on desktop */}
        {showName && (
          <div className="hidden sm:flex absolute left-12 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded px-3 py-2 flex-col items-start z-50 min-w-[120px]">
            <span className="font-semibold text-gray-800 text-sm">{user?.name || "User"}</span>
            <span className="text-xs text-gray-400">{user?.email || ""}</span>
          </div>
        )}
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
};

export default ProfileHeader;