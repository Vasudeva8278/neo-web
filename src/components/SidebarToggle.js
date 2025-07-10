import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { MdOutlineMenuOpen, MdArrowForwardIos } from "react-icons/md";

const SidebarToggle = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  // Determine context
  const isTemplatesPage = location.pathname.startsWith("/Neo");
  const isDocumentsPage = location.pathname.startsWith("/NeoDocements");

  // Example nav items
  const navItems = [
    { label: "Home", path: "/", icon: "🏠" },
    { label: "Projects", path: "/projects", icon: "📁" },
    { label: "Templates", path: "/Neo", icon: "📄" },
    { label: "Docs", path: "/NeoDocements", icon: "📑" },
  ];

  return (
    <>
      {/* Floating open button */}
      {!sidebarOpen && (
        <button
          className="fixed top-6 left-2 z-50 bg-white text-black rounded-full shadow-lg p-2 hover:bg-gray-200 transition"
          onClick={() => setSidebarOpen(true)}
        >
          <MdArrowForwardIos size={24} />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 z-40 h-screen transition-all duration-300
          ${sidebarOpen ? "w-64 bg-white border-r border-gray-200" : "w-0"}
          overflow-x-hidden
        `}
        style={{ minWidth: sidebarOpen ? "16rem" : "0" }}
      >
        {/* Close button */}
        {sidebarOpen && (
          <button
            className="absolute top-4 right-[-18px] z-50 bg-black text-white rounded-full shadow-lg p-1 hover:bg-gray-800 transition"
            onClick={() => setSidebarOpen(false)}
            title="Close sidebar"
          >
            <MdOutlineMenuOpen size={24} />
          </button>
        )}

        {/* Sidebar content */}
        <div className={`transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"} px-6 pt-8`}> 
          {/* Context-aware parent */}
          {isTemplatesPage && <div className="font-bold text-lg mb-4">Projects</div>}
          {isDocumentsPage && <div className="font-bold text-lg mb-4">Templates</div>}
          {/* Example nav items */}
          <ul className="space-y-4">
            {navItems.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-gray-700 hover:text-blue-600 cursor-pointer">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default SidebarToggle; 