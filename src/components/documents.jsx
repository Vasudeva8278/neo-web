import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TemplateCards from "./Template/TemplateCards";
import {
  deleteTemplate,
  getHomePageTemplates,
} from "../services/templateApi";
import {
  deleteDocument,
  downloadDocument,
  getHomePageDocuments,
} from "../services/documentApi";

const Documents = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [docTemplates, setDocTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const projectData = location.state?.data;

  const fetchDocuments = async () => {
    if (!projectData?._id) return;

    try {
      const response = await getHomePageDocuments(projectData._id);
      const data = response;
      setDocTemplates(data);
    } catch (error) {
      setError("Failed to fetch documents");
      console.error("Failed to fetch documents", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    if (!projectData?._id) return;

    try {
      const response = await getHomePageTemplates(projectData._id);
      const data = response;
      console.log(data);
      setDocuments(data);
    } catch (error) {
      setError("Failed to fetch documents");
      console.error("Failed to fetch documents", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectData) {
      fetchTemplates();
      fetchDocuments();
    }
  }, [projectData]);

  // Early return if projectData is not available
  if (!projectData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">No project data available. Please navigate from the projects page.</p>
          <button
            onClick={() => navigate('/projects')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Projects
          </button>
        </div>
      </div>
    );
  }

  const handleDeleteTemplate = async (docId) => {
    if (!projectData?._id) return;

    console.log(`Deleting `, docId);
    try {
      const response = await deleteTemplate(projectData._id, docId);
      if (response.status === 204) {
        setDocuments((prevDocuments) =>
          prevDocuments.filter((doc) => doc._id !== docId)
        );
        alert("Document deleted successfully");
      } else {
        throw new Error(`Failed to delete document.`);
      }
    } catch (error) {
      console.error("Failed to delete document", error);
    }
  };

  const handleDeleteDocument = async (doc_id) => {
    if (!projectData?._id) return;

    console.log("deleting document", doc_id);
    const response = await deleteDocument(projectData._id, doc_id);
    if (response) {
      fetchTemplates();
      fetchDocuments();
    }
  };

  const handleDocumentDownload = async (docObj) => {
    try {
      const id = docObj._id;
      const fileName = docObj.fileName;
      const response = await downloadDocument(id, fileName);

      const blob = new Blob([response], {
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

  return (
    <div className='flex'>
      <div className='flex flex-col w-full'>
        <div className='flex text-gray-400 text-xs p-3'>
          {projectData?.projectName || 'Unknown Project'} - Documents
        </div>
        
        <div className='flex flex-col p-4 space-y-8'>
          {/* Templates Section */}
          <div className='w-full max-w-5xl'>
            <h2 className='text-2xl font-semibold mb-4 text-left'>
              Saved Templates for {projectData?.projectName || 'Unknown Project'}
            </h2>
            <div className='flex justify-center'>
              {loading && <div>Loading...</div>}
              {error && <div className="text-red-500">{error}</div>}
              <TemplateCards
                documents={documents}
                handleDeleteTemplate={handleDeleteTemplate}
                projectId={projectData?._id}
              />
            </div>
          </div>

          {/* Documents Section */}
          <div className='w-full max-w-5xl gap-x-4 space-y-4 ml-4'>
            <h2 className='text-2xl font-semibold mb-4 text-left'>
              Documents with Template Names
            </h2>
            <div className='flex justify-center gap-x-8 gap-y-8'>
              {loading && <div>Loading...</div>}
              {error && <div className="text-red-500">{error}</div>}
              <TemplateCards
                projectId={projectData?._id}
                documents={docTemplates}
                template={true}
                handleDeleteTemplate={handleDeleteDocument}
                handleDownload={handleDocumentDownload}
                className='border p-4 rounded-lg shadow-md'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents; 