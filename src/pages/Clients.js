import React, { useContext, useEffect, useState } from "react";
import { getAllClients } from "../services/clientsApi";
import { useNavigate } from "react-router-dom";
import { FaUserPlus, FaFolder, FaEllipsisV, FaSearch } from "react-icons/fa";
import { ProjectContext } from "../context/ProjectContext";
import NeoModal from "../components/NeoModal";
import { motion } from "framer-motion";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { projects } = useContext(ProjectContext);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getAllClients();
        setClients(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleClientClick = (client) => {
    navigate("/viewclient", { state: { client } });
  };

  const handleCreateClient = (projectData) => {
    navigate("/viewAllHighlights", {
      state: { project: projectData },
    });
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-sm">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Error Loading Clients</h3>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Clients</h1>
              <p className="text-sm text-gray-500">Manage your client portfolio</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
              onClick={() => setIsModalOpen(true)}
            >
              <FaUserPlus className="mr-2" />
              Add Client
            </motion.button>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Client Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredClients.map((client) => (
            <motion.div
              key={client._id}
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-lg shadow p-4 sm:p-5 cursor-pointer transition"
              onClick={() => handleClientClick(client)}
            >
              <div className="flex justify-between items-start">
                <div className="p-2 bg-blue-50 rounded-md">
                  <FaFolder className="h-5 w-5 text-blue-500" />
                </div>
                <button className="text-gray-400 hover:text-gray-600 text-sm">
                  <FaEllipsisV />
                </button>
              </div>
              <h3 className="mt-4 text-base sm:text-lg font-medium text-gray-900 truncate">{client.name}</h3>
              <div className="mt-2 text-sm text-gray-500">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {client.documents.length} Documents
                </span>
              </div>
              <div className="mt-3 text-xs text-gray-400">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📁</div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900">No clients found</h3>
            <p className="mt-1 text-gray-500 text-sm">Try adjusting your search terms</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <NeoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-4 sm:p-6 w-full max-w-md mx-auto">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
            Add New Client
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="projectSelect" className="block text-sm font-medium text-gray-700 mb-1">
                Select Project
              </label>
              <select
                id="projectSelect"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => setSelectedProject(e.target.value)}
                value={selectedProject}
              >
                <option value="">Choose a project</option>
                {projects.map((project) => (
                  <option key={project._id} value={JSON.stringify(project)}>
                    {project.projectName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2 sm:space-x-3">
              <button
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                onClick={() => selectedProject && handleCreateClient(JSON.parse(selectedProject))}
                disabled={!selectedProject}
              >
                Create Client
              </motion.button>
            </div>
          </div>
        </div>
      </NeoModal>
    </div>
  );
};

export default Clients;
