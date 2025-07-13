import React, { useState, useRef, useEffect, useContext } from "react";
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
} from "../services/templateApi";
import {
  deleteDocument1,
  downloadDocument1,
  getDocumentsWithTemplateNames,
} from "../services/documentApi";
import SearchHeader from "./SearchHeader";
import { AuthContext } from "../context/AuthContext";
import { Sparkles } from 'lucide-react';
import GenerateDocument from './GenerateDocument';
import NeoModal from './NeoModal';

const NeoDocements = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [allDocuments, setAllDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const contentRef = useRef(null);
  const [conversionStatus, setConversionStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const EXECUTIVE_ROLE_ID = "68621597db15fbb9bbd2f838";
  const EXPERT_ROLE_ID = "68621581db15fbb9bbd2f836";
  const isExecutive = user && user.role === EXECUTIVE_ROLE_ID;
  const isExpert = user && user.role === EXPERT_ROLE_ID;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayPage, setDisplayPage] = useState("");

  const openModal = (page) => {
    setDisplayPage(page);
    setIsModalOpen(true);
  };

  const handleSelectDocument = (docId) => {
    navigate(`/document/${docId}`);
  };

  const handleExport = (docId) => {
    navigate(`/export/${docId}`);
  };

  const handleProjects = () => {
    navigate(`/projects`);
  };

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

  const onGetFile = async (file) => {
    setFile(file);
    setUploading(true);

    const container = document.getElementById("container");
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
      console.log("docx: finished");
      console.log(container.innerHTML);

      const images = container.querySelectorAll("img");
      if (images.length > 0) {
        for (let img of images) {
          const response = await fetch(img.src);
          const blob = await response.blob();
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

              if (
                [...images].every((image) =>
                  image.src.startsWith("data:image/png")
                )
              ) {
                convertFiled(container.innerHTML, file);
              }
            };

            image.src = reader.result;
          };

          reader.readAsDataURL(blob);
        }
      } else {
        convertFiled(container.innerHTML, file);
      }

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
    }
  };

  useEffect(() => {
    fetchAllDocuments();
  }, []);

  const fetchAllDocuments = async () => {
    try {
      setLoading(true);
      
      // Fetch only documents with template names
      const documentsResponse = await getDocumentsWithTemplateNames();

      // Add type identifier for documents
      const documents = (documentsResponse || []).map(doc => ({ ...doc, type: 'document' }));
      
      setAllDocuments(documents);
      
    } catch (error) {
      setError("Failed to fetch documents");
      console.error("Failed to fetch documents", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (doc_id) => {
    console.log("Deleting document", doc_id);
    try {
      const response = await deleteDocument1(doc_id);
      if (response) {
        setAllDocuments((prevDocuments) =>
          prevDocuments.filter((doc) => doc._id !== doc_id)
        );
        alert("Document deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete document", error);
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
        const result = response;
        handleSelectDocument(result._id);

        setConversionStatus(
          `Conversion successful! Content: ${result.content}`
        );
      } else {
        setConversionStatus("Conversion failed. Please try again.");
      }
    } catch (error) {
      setConversionStatus("An error occurred during conversion.");
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
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  if (isExecutive || isExpert) {
    return (
      <div className='flex flex-col w-full p-8'>
        <SearchHeader />
        <div className='w-full max-w-6xl space-y-4 mx-auto'>
          <div className="flex flex-col sm:flex-row items-center gap-2 justify-between mb-4">
            <h2 className='text-2xl font-semibold mb-4 text-left'>All Documents</h2>
            <p className='text-gray-600 mb-4'>
              Total: {allDocuments.length} documents
            </p>
          </div>
          <div className='rounded-xl p-6'>
            {loading && <div className="text-center py-8">Loading documents...</div>}
            {error && <div className="text-red-500 text-center py-8">{error}</div>}
            
            {!loading && !error && allDocuments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No documents found.
              </div>
            )}
            
            {!loading && !error && allDocuments.length > 0 && (
              <TemplateCards
                documents={allDocuments}
                template={true}
                handleDeleteTemplate={handleDeleteDocument}
                handleDownload={handleDocumentDownload}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex w-[100%] '>
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
              className='ml-2 text-sm text-gray-700 py-2'
              onClick={handleProjects}
            >
              Projects
            </div>
          </div>
          <div className='flex items-center w-full pl-3 mt-2 hover:bg-blue-100 rounded-lg'>
            <RiLayout4Line className='w-5 h-5' />
            <div className='ml-2 text-sm text-gray-700  py-2'>Template</div>
          </div>
        </div>
      </div>

      <div className='flex flex-col w-full m-2'>
        <div className='flex flex-col p-4 space-y-8'>
          <div className='w-full max-w-5xl'>
            <div className='flex justify-center'>
            </div>
          </div>
        </div>
        <div className='w-full space-y-4 '>
          <div className="flex flex-col sm:flex-row items-center gap-2 justify-between mb-4">
            <h2 className='text-2xl font-semibold mb-4 text-left'>All Documents</h2>
            <p className='text-gray-600 mb-4'>
              Total: {allDocuments.length} documents
            </p>
            <button
              onClick={() => openModal('generateDocs')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors shadow-md text-sm"
            >
              <Sparkles className="w-5 h-5" />
              Generate Documents
            </button>
          </div>
          <NeoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <React.Suspense fallback={<div className="p-4">Loading...</div>}>
              {(() => {
                try {
                  if (displayPage === 'generateDocs') {
                    return <GenerateDocument onClose={() => setIsModalOpen(false)} value={''} hasProject={false} />;
                  }
                  return <div className="p-4 text-gray-500">No content selected.</div>;
                } catch (err) {
                  console.error('Error rendering modal content:', err);
                  return <div className="p-4 text-red-500">An error occurred while loading the modal content.</div>;
                }
              })()}
            </React.Suspense>
          </NeoModal>
          <div className='rounded-xl p-6 w-full'>
            {loading && <div className="text-center py-8">Loading documents...</div>}
            {error && <div className="text-red-500 text-center py-8">{error}</div>}
            
            {!loading && !error && allDocuments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No documents found.
              </div>
            )}
            
            {!loading && !error && allDocuments.length > 0 && (
              <TemplateCards
                documents={allDocuments}
                template={true}
                handleDeleteTemplate={handleDeleteDocument}
                handleDownload={handleDocumentDownload}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeoDocements; 