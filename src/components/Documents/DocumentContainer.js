import React, { useState, useEffect } from "react";
import axios from "axios";
import DocumentView from "./DocumentView";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/solid";
import { useLocation, useParams } from "react-router-dom";
import {  getDocumentsListByTemplateId } from "../../services/documentApi";

function DocumentContainer() {
  const [documents, setDocuments] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get('projectId');

  useEffect(() => {
    const fetchDocuments = async () => {
      // Validate required parameters
      if (!id || !projectId) {
        setError('Missing required parameters: template ID or project ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching documents for:', { projectId, templateId: id });
        
        const response = await getDocumentsListByTemplateId(projectId, id);
        
        if (!response) {
          setError('No response received from server');
          setDocuments([]);
          return;
        }

        const templateName = response?.templateName;
        const data = response?.documents || [];
        
        if (data.length === 0) {
          setError('No documents found for this template');
        }
        
        setDocuments(data);
        console.log('Documents loaded successfully:', data.length);
        
      } catch (error) {
        console.error("Failed to fetch documents", error);
        
        let errorMessage = 'Failed to fetch documents';
        if (error.response?.status === 404) {
          errorMessage = 'Template not found';
        } else if (error.response?.status === 400) {
          errorMessage = 'Invalid request parameters';
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error occurred';
        }
        
        setError(errorMessage);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [id, projectId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading documents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600 text-center">
          <p className="text-lg font-semibold">Error</p>
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

  if (documents.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-lg">No documents available</p>
          <p className="text-gray-600">Try creating a new document</p>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    if (currentIndex < documents.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleBack = () => {
    // Handle navigation back to a previous route or view
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          className={`border px-4 py-2 rounded ${currentIndex === 0 ? 'border-gray-400 text-gray-400' : 'border-blue-600 text-blue-600 hover:bg-blue-100'}`}
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ArrowLeftIcon className="w-5 h-5 inline-block mr-2" /> Previous
        </button>
        <span className="text-gray-600">{currentIndex + 1} / {documents.length}</span>
        <button
          className={`border px-4 py-2 rounded ${currentIndex === documents.length - 1 ? 'border-gray-400 text-gray-400' : 'border-blue-600 text-blue-600 hover:bg-blue-100'}`}
          onClick={handleNext}
          disabled={currentIndex === documents.length - 1}
        >
          Next <ArrowRightIcon className="w-5 h-5 inline-block ml-2" />
        </button>
      </div>

      {documents.length > 0 && (
        <DocumentView id={documents[currentIndex]._id} templateId={id}/>
      )}
    </div>
  );
}

export default DocumentContainer;
