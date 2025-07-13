import React, { useState, useRef, useEffect } from "react";
import { MdKeyboardArrowDown, MdArrowDropDown } from "react-icons/md";
import { RiMenuFill, RiLayout4Line } from "react-icons/ri";
import { IoNotifications } from "react-icons/io5";
import { BsSearch } from "react-icons/bs";
import {
  FaUpload,
  FaFileAlt,
  FaRegFolderOpen,
  FaDownload,
  FaTrash,
} from "react-icons/fa";
import { GoHome } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import CanvasThumbnails from "./CanvasThumbnails";
import photo from "../Assets/photo.png";
import * as docx from "docx-preview";
import TemplateCards from "./Template/TemplateCards";
import axios from "axios";
import {
  createNeoTemplate,
  deleteTemplateById,
  getAllTemplates,
  updateTemplate,
} from "../services/templateApi";
import {
  deleteDocument1,
  downloadDocument1,
  getDocumentsWithTemplateNames,
  createDocument,
} from "../services/documentApi";
import SearchHeader from "./SearchHeader";
import { Sparkles, FileText, Plus } from 'lucide-react';
import DesignTemplate from './DesignTemplate';
import NeoModal from './NeoModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NeoTemplate = ({ projectId }) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [docTemplates, setDocTemplates] = useState([]);
  const contentRef = useRef(null);
  const [conversionStatus, setConversionStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayPage, setDisplayPage] = useState("");
  const [selectedProject, setSelectedProject] = useState(projectId || '');
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Initialize project selection
  useEffect(() => {
    if (projectId) {
      setSelectedProject(projectId);
    }
  }, [projectId]);

  // Fetch data on component mount
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchTemplates(), fetchDocuments()]);
      } catch (error) {
        setError("Failed to load data");
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);

  const openModal = (page, template = null) => {
    setDisplayPage(page);
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDisplayPage("");
    setEditingTemplate(null);
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  // Navigation handlers
  const handleSelectDocument = (docId) => {
    navigate(`/document/${docId}`);
  };

  const handleExport = (docId) => {
    navigate(`/export/${docId}`);
  };

  const handleProjects = () => {
    navigate(`/projects`);
  };

  // Edit functionality
  const handleEditTemplate = async (templateId) => {
    try {
      const templateToEdit = documents.find(doc => doc._id === templateId);
      if (templateToEdit) {
        // Navigate to edit page or open edit modal
        navigate(`/document/${templateId}?mode=edit`);
        toast.success('Opening template for editing...');
      } else {
        toast.error('Template not found!');
      }
    } catch (error) {
      console.error('Error opening template for edit:', error);
      toast.error('Failed to open template for editing');
    }
  };

  // Create functionality
  const handleCreateFromTemplate = async (templateId, projectId = null) => {
    try {
      const template = documents.find(doc => doc._id === templateId);
      if (!template) {
        toast.error('Template not found!');
        return;
      }

      if (!projectId && !selectedProject) {
        toast.error('Please select a project first!');
        return;
      }

      const targetProjectId = projectId || selectedProject;

      // Create new document from template
      const createData = {
        templateId: templateId,
        projectId: targetProjectId,
        fileName: `${template.fileName}_copy_${Date.now()}`,
        content: template.content
      };

      toast.info('Creating document from template...');
      
      // Navigate to export page to create the document
      navigate(`/export/${templateId}?projectId=${targetProjectId}&mode=create`);
      
    } catch (error) {
      console.error('Error creating document from template:', error);
      toast.error('Failed to create document from template');
    }
  };

  // Create new blank template
  const handleCreateNewTemplate = () => {
    openCreateModal();
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      onGetFile(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onGetFile(file);
    }
  };

  // File processing
  const onGetFile = async (file) => {
    setFile(file);
    setUploading(true);

    const container = document.getElementById("container");
    if (!container) return;
    
    container.innerHTML = "";

    const options = {
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false,
      ignoreFonts: false,
      breakPages: true,
      ignoreLastRenderedPageBreak: true,
      renderHeaders: true,
      renderFooters: true,
      renderFootnotes: true,
      renderEndnotes: true,
    };

    try {
      await docx.renderAsync(file, container, null, options);
      
      // Convert images to Base64
      const images = container.querySelectorAll("img");
      if (images.length > 0) {
        await Promise.all(Array.from(images).map(convertImageToBase64));
      }
      
      convertFiled(container.innerHTML, file);

      // Set container height for pagination
      const pages = container.querySelectorAll(".docx-page");
      if (pages.length > 0) {
        const totalHeight = Array.from(pages).reduce(
          (height, page) => height + page.scrollHeight,
          0
        );
        container.style.height = `${totalHeight}px`;
      }
    } catch (error) {
      console.error("docx rendering error:", error);
      setUploading(false);
    }
  };

  const convertImageToBase64 = async (img) => {
    try {
      const response = await fetch(img.src);
      const blob = await response.blob();
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const image = new Image();

          image.onload = () => {
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);
            img.src = canvas.toDataURL("image/png");
            resolve();
          };

          image.src = reader.result;
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image:", error);
    }
  };

  // API calls
  const fetchDocuments = async () => {
    try {
      const response = await getDocumentsWithTemplateNames();
      setDocTemplates(response);
    } catch (error) {
      console.error("Failed to fetch documents", error);
      throw error;
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await getAllTemplates();
      setDocuments(response);
      
      const sortedData = response.sort((a, b) => {
        if (!a.updatedTime) return 1;
        if (!b.updatedTime) return -1;
        return new Date(b.updatedTime) - new Date(a.updatedTime);
      });
      setRecentDocuments(sortedData);
    } catch (error) {
      console.error("Failed to fetch templates", error);
      throw error;
    }
  };

  const handleDeleteTemplate = async (docId) => {
    try {
      const response = await deleteTemplateById(docId);
      if (response) {
        setDocuments((prevDocuments) =>
          prevDocuments.filter((doc) => doc._id !== docId)
        );
        toast.success("Template deleted successfully");
      } else {
        throw new Error(`Failed to delete template.`);
      }
    } catch (error) {
      console.error("Failed to delete template", error);
      toast.error("Failed to delete template");
    }
  };

  const handleDeleteDocument = async (doc_id) => {
    try {
      const response = await deleteDocument1(doc_id);
      if (response) {
        await Promise.all([fetchTemplates(), fetchDocuments()]);
        toast.success("Document deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete document", error);
      toast.error("Failed to delete document");
    }
  };

  const convertFiled = async (content, file) => {
    setConversionStatus("Converting...");
    const formData = new FormData();
    formData.append("docxFile", file);
    formData.append("content", content);

    try {
      const response = await createNeoTemplate(formData);
      if (response) {
        setUploading(false);
        handleSelectDocument(response._id);
        setConversionStatus(`Conversion successful! Content: ${response.content}`);
        toast.success("Template created successfully!");
      } else {
        setConversionStatus("Conversion failed. Please try again.");
        toast.error("Conversion failed. Please try again.");
      }
    } catch (error) {
      setConversionStatus("An error occurred during conversion.");
      setUploading(false);
      toast.error("An error occurred during conversion.");
    }
  };

  const handleDocumentDownload = async (docObj) => {
    try {
      const id = docObj._id;
      const fileName = docObj.fileName;
      const response = await downloadDocument1(id);

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName.trim() + ".docx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Document downloaded successfully!");
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document");
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex w-[100%] min-h-screen bg-gray-50'>
      <ToastContainer />
      
      {/* Sidebar - Hidden for now */}
      <div className='hidden flex flex-col items-start border-r border-gray-200'>
        <div className='flex items-center w-64 h-20 border-b border-gray-300'>
          <img
            src={photo}
            alt='Profile'
            className='w-12 h-12 rounded-full ml-2'
          />
          <div className='flex flex-col ml-4'>
            <div className='text-sm font-semibold'>Kevin Rangel</div>
            <div className='text-xs'>Admin</div>
          </div>
          <MdArrowDropDown className='w-6 h-6 ml-4' />
        </div>
        <div className='mt-4 w-64 px-3'>
          <div className='flex items-center w-full pl-3 hover:bg-blue-100 rounded-lg'>
            <GoHome className='w-5 h-5' />
            <div className='ml-2 text-sm font-semibold py-2'>Home</div>
          </div>
          <div className='flex items-center w-full pl-3 mt-2 hover:bg-blue-100 rounded-lg'>
            <FaRegFolderOpen className='w-5 h-5' />
            <div
              className='ml-2 text-sm text-gray-700 py-2 cursor-pointer'
              onClick={handleProjects}
            >
              Projects
            </div>
          </div>
          <div className='flex items-center w-full pl-3 mt-2 hover:bg-blue-100 rounded-lg'>
            <RiLayout4Line className='w-5 h-5' />
            <div className='ml-2 text-sm text-gray-700 py-2'>Template</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex flex-col w-full'>
  
        
        {/* Hidden Upload Section */}
        <div
          className='bg-gradient-to-r from-purple-500 to-blue-500 h-52 rounded-lg mt-4 ml-4 p-10 hidden'
          style={{ height: "220px" }}
        >
          <div className="relative w-[500px] mx-auto">
            <BsSearch className="absolute h-max top-1/2 left-5 transform -translate-y-1/2 pointer-events-none" />
            <input
              className="w-full pl-10 py-2 border border-gray-300 rounded-full text-sm outline-none"
              placeholder="Search"
            />
          </div>

          <div className="flex mt-4">
            <div className="flex flex-col items-center mb-4 w-full">
              <div
                className={`flex flex-col items-center justify-center w-52 h-24 border-gray-500 shadow-lg rounded-lg text-white mx-4 ${
                  isDragging ? "border-green-500 bg-blue-100" : "border-white"
                }`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-center py-10 relative w-full mb-10">
                  <input
                    type="file"
                    name="docxFile"
                    accept=".docx, .pdf"
                    onChange={handleFileChange}
                    className="opacity-0 absolute inset-0 cursor-pointer border border-gray-300 shadow-lg shadow-white"
                  />
                  <button className="mt-2 px-4 py-2 text-white rounded hover:bg-blue-700 justify-between">
                    <FaUpload className="m-6 mb-1 text-white" />
                    <span>Upload</span>
                  </button>
                </div>
              </div>
              {uploading && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
                  <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
                </div>
              )}
              <div
                id="container"
                style={{
                  overflowY: "auto",
                  border: "1px solid #ccc",
                  marginTop: "20px",
                  padding: "20px",
                  position: "relative",
                  display: "none",
                }}
                ref={contentRef}
              ></div>
            </div>
          </div>
        </div>

        {/* Templates Section */}
        <div className='flex-1 p-4 lg:p-8'>
          <div className='max-w-full mx-auto'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4'>
              <h2 className='text-3xl font-bold text-gray-900'>Templates</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => openModal('designTemplates')}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md"
                >
                  <FileText className="w-5 h-5" />
                  Design Template
                </button>
               
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Templates Grid */}
            {!loading && (
              <div className="w-full flex justify-center">
                <div className="template-grid w-full ml-14 overflow-hidden">
                  <TemplateCards
                    documents={documents}
                    handleDeleteTemplate={handleDeleteTemplate}
                    handleDownload={handleDocumentDownload}
                    handleEdit={handleEditTemplate}
                    handleCreate={handleCreateFromTemplate}
                    template={false}
                    projectId={selectedProject}
                  />
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && documents.length === 0 && (
              <div className="text-center py-20">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No templates found</h3>
                <p className="text-gray-500 mb-6">Create your first template to get started</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => openModal('designTemplates')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Design Template
                  </button>
                  <button
                    onClick={handleCreateNewTemplate}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Create New Template
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload Section with hidden display */}
        <div className="hidden">
          <div
            className={`flex flex-col items-center justify-center w-52 h-24 border-gray-500 shadow-lg rounded-lg text-white mx-4 ${
              isDragging ? "border-green-500 bg-blue-100" : "border-white"
            }`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className='text-center py-10 relative w-full mb-10'>
              <input
                type='file'
                name='docxFile'
                accept='.docx, .pdf'
                onChange={handleFileChange}
                className='opacity-0 absolute inset-0 cursor-pointer border border-gray-300 shadow-lg shadow-white'
              />
              <button className='mt-2 px-4 py-2 text-white rounded hover:bg-blue-700 justify-between'>
                <FaUpload className='m-6 mb-1 text-white' />
                <span>Upload</span>
              </button>
            </div>
          </div>
          {uploading && (
            <div className='fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50'>
              <div className='loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32'></div>
            </div>
          )}
          <div
            id='container'
            style={{
              overflowY: "auto",
              border: "1px solid #ccc",
              marginTop: "20px",
              padding: "20px",
              position: "relative",
              display: "none",
            }}
            ref={contentRef}
          ></div>
        </div>

        {/* Design Template Modal */}
        <NeoModal isOpen={isModalOpen} onClose={closeModal}>
          <React.Suspense fallback={
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }>
            {(() => {
              try {
                if (displayPage === 'designTemplates') {
                  return (
                    <DesignTemplate 
                      onClose={closeModal} 
                      value={selectedProject} 
                      hasProject={false}
                      editingTemplate={editingTemplate}
                    />
                  );
                }
                return (
                  <div className="p-8 text-center text-gray-500">
                    No content selected.
                  </div>
                );
              } catch (err) {
                console.error('Error rendering modal content:', err);
                return (
                  <div className="p-8 text-center text-red-500">
                    An error occurred while loading the modal content.
                  </div>
                );
              }
            })()}
          </React.Suspense>
        </NeoModal>

        {/* Create Template Modal */}
        <NeoModal isOpen={isCreateModalOpen} onClose={closeCreateModal}>
          <div className="p-6 bg-white max-w-md mx-auto rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Create New Template</h3>
            <p className="text-gray-600 mb-6">Choose how you want to create your new template:</p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  closeCreateModal();
                  openModal('designTemplates');
                }}
                className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Design Template</div>
                  <div className="text-sm text-gray-500">Create using our design tools</div>
                </div>
              </button>
              <button
                onClick={() => {
                  closeCreateModal();
                  document.querySelector('input[name="docxFile"]')?.click();
                }}
                className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaUpload className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">Upload Document</div>
                  <div className="text-sm text-gray-500">Upload a DOCX file</div>
                </div>
              </button>
            </div>
            <button
              onClick={closeCreateModal}
              className="mt-4 w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </NeoModal>
      </div>
    </div>
  );
};

export default NeoTemplate;