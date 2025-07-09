import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaFileAlt, FaTrash, FaDownload } from 'react-icons/fa';
import thumbnail from '../../Assets/thumbnail.png'; // Keep if used for fallback
import thumbnailImg from '../../Assets/thumbnail.png'; // Keep if used for fallback
import leafyBg from '../../Assets/leafy-bg.png';
import NeoModal from '../NeoModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Card = ({ docObj, documentId, name, thumbnail, handleDelete, handleDownload, template = false, projectId }) => {
  const navigate = useNavigate();
  const [deleteTemplateModal, setDeleteTemplateModal] = useState(false);

  const handleEdit = () => {
    toast.info('Edit functionality would be implemented here');
  };

  const handleCreateDocuments = async () => {
    if (!docObj.projectId || docObj.projectId === 'undefined') {
      toast.error('Project ID is missing!');
      return;
    }
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate(`/export/${documentId}?projectId=${docObj.projectId}`);
    } catch (error) {
      toast.error('Failed to create document. Please try again.');
    }
  };

  const confirmDelete = () => {
    handleDelete(documentId);
    setDeleteTemplateModal(false);
    toast.success(`${template ? 'Document' : 'Template'} has been deleted`);
  };

  return (
    <div
      className="relative w-72 h-96 overflow-hidden rounded-2xl shadow-lg flex flex-col justify-between bg-white transition hover:shadow-xl group" // Adjusted width, height, and shadow for consistency
      style={{
        backgroundImage: `url(${leafyBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <ToastContainer />
      {/* Floating Delete Icon */}
      <button
        className="absolute top-4 right-4 bg-white rounded-full shadow-md p-2 z-20 hover:bg-gray-100 transition" // Adjusted padding and shadow for a smaller icon
        style={{ fontSize: '1rem', lineHeight: 1 }}
        onClick={() => setDeleteTemplateModal(true)}
        title="Delete"
      >
        <FaTrash />
      </button>

      {/* Card Image/Preview - Top Section */}
      {/* The background image covers the top part, and the white content box sits on top */}
      <div className="flex-1 flex flex-col items-center justify-center pt-8 px-4 relative z-10">
        <div
          className="w-full h-48  rounded-xl shadow-sm flex items-center justify-center overflow-hidden p-2 mt-3" // Reduced padding around image
          // Removed inline style height/width if they conflict with tailwind classes, using tailwind h-48 w-full
        >
          {docObj.thumbnail ? (
            <img src={`data:image/png;base64,${docObj.thumbnail}`} alt={docObj.fileName} className="object-contain h-full w-full" />
          ) : (
            <img src={thumbnailImg} className="object-contain h-full w-full" alt="No preview" />
          )}
        </div>
      </div>

      {/* Card Bottom (Project Name and Actions) */}
      <div className="bg-white rounded-b-2xl px-6 pt-4 pb-6 flex flex-col items-start w-full min-h-[100px]"> {/* Increased pt for more space above text */}
        <div className="text-xl font-bold text-gray-900 mb-2 truncate overflow-hidden whitespace-nowrap w-full" title={docObj.fileName}>{docObj.fileName || 'Projects name'}</div>

        <div className="flex w-full justify-between gap-4 mt-2 h-10">
          {docObj.type === 'document' ? (
            <>
            <button
                className="flex-1 flex flex-col items-center justify-center py-2 rounded-xl hover:bg-gray-100 transition text-blue-700 font-semibold text-base"
                onClick={() => navigate(`/document/${docObj._id}`)}
            >
                <FaFileAlt className="text-md mb-1" />
                View
            </button>
                    <button
                className="flex-1 flex flex-col items-center justify-center py-2 rounded-xl hover:bg-gray-100 transition text-blue-700 font-semibold text-base"
                onClick={() => handleDownload(docObj)}
                    >
                <FaDownload className="text-md mb-1" />
                Download
                    </button>
                    <button
                className="flex-1 flex flex-col items-center justify-center py-2 rounded-xl hover:bg-gray-100 transition text-blue-700 font-semibold text-base"
                onClick={() => setDeleteTemplateModal(true)}
                    >
                <FaTrash className="text-md mb-1" />
                Delete
                    </button>
            </>
          ) : docObj.type === 'project' ? (
            <>
                    <button
                className="flex-1 flex flex-col items-center justify-center py-2 rounded-xl hover:bg-gray-100 transition text-blue-700 font-semibold text-base"
                onClick={() => alert('Edit Project')}
                    >
                <FaEdit className="text-md mb-1" />
                Edit Project
                    </button>
                    <button
                className="flex-1 flex flex-col items-center justify-center py-2 rounded-xl hover:bg-gray-100 transition text-blue-700 font-semibold text-base"
                onClick={() => setDeleteTemplateModal(true)}
                    >
                <FaTrash className="text-md mb-1" />
                Delete Project
                    </button>
            </>
          ) : (
            <>
              <div className='flex-1'>
                  <button
                  className="flex-1 flex flex-col items-center justify-center py-2 rounded-xl hover:bg-gray-100 transition text-blue-700 font-semibold text-base"
                  onClick={handleEdit}
                  >
                  <FaEdit className="text-md mb-1" />
                  Edit
                  </button>
                </div>
              <div className='flex-2'>
                <button
                  className="flex-1 flex flex-col items-center justify-center py-2 rounded-xl hover:bg-gray-100 transition text-blue-700 font-semibold text-base"
                  onClick={handleCreateDocuments}
                  disabled={!docObj.projectId}
                  style={!docObj.projectId ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  title={!docObj.projectId ? 'Cannot create document: No project linked.' : ''}
                >
                  <FaFileAlt className="text-md mb-1" />
                  Create
                </button>
              </div>
            </>
            )}
          </div>
        </div>
      <NeoModal isOpen={deleteTemplateModal} onClose={() => setDeleteTemplateModal(false)} handleDelete={confirmDelete}>
        <div className="p-6 bg-white max-w-sm mx-auto rounded-lg shadow-xl"> {/* Added rounded and shadow for modal */}
         <h5 className="text-lg font-semibold text-center mb-4">Are you sure?</h5>
          <p className="text-center mb-6">You want to delete the {template ? 'document' : 'template'}?</p>
         <div className="flex justify-center space-x-4">
           <button
             className="inline-flex justify-center px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
             onClick={() => setDeleteTemplateModal(false)}
           >
             Cancel
           </button>
           <button
             className="inline-flex justify-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={confirmDelete}
           >
             Yes
           </button>
         </div>
       </div>
      </NeoModal>
        </div>
  );
};

const TemplateCards = ({ documents, handleDeleteTemplate, handleDownload, template = false, projectId }) => {
  return (
    // Adjusted gap and max-width for better responsiveness and spacing
    // The `grid-cols` will make it responsive.
    // The `gap-x-8` (or similar) will control horizontal spacing.
    // The `gap-y-12` will control vertical spacing.
    <div id="template-card-container" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12 max-w-7xl mx-auto justify-items-center p-4 sm:p-6 md:p-8">
      {documents.map((doc) => (
        <Card
          docObj={doc}
          key={doc._id}
          documentId={doc._id}
          name={doc.fileName}
          thumbnail={doc.thumbnail}
          handleDelete={handleDeleteTemplate}
          handleDownload={handleDownload}
          template={template}
          projectId={doc.projectId}
        />
      ))}
    </div>
  );
};

export default TemplateCards;