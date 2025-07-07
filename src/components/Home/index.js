import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navigation from "../Navigation";
import ProfileSettings from "../Profile/ProfileSettings";
import Dashboard from "../Dashboard/Dashboard";
import MainPage from "../MainPage";
import Homepage from "../Homepage";
import Neo from "../../components/Neo";
import DocxToTextConverter from "../Template/DocxToTextConverter";
import ExportComponent from "../Documents/ExportComponent";
import DocumentView from "../Documents/DocumentView";
import DocumentContainer from "../Documents/DocumentContainer";
import NeoTemplate from "../NeoTemplate";
import NeoDocements from "../NeoDocements";
import ProfileHeader from "../profileheader";
import ListofDocuments from "../Documents/ListofDocument";
import Projects from "../../pages/Projects";
import NeoProjectTemplates from "../NeoProjectTemplates";
import ViewTemplatesHighlights from "../Template/ViewTemplatesHighlights";
import Clients from "../../pages/Clients";
import ViewClient from "../../pages/ViewClient";
import LandingPage from "../../pages/LandingPage.tsx";
import UserManage from "../../pages/UserManage";
const Home = () => {
  // State to manage visibility of Navigation component
  const [isNavigationVisible, setIsNavigationVisible] = useState(true);

  // Function to toggle Navigation visibility
  const toggleNavigation = () => {
    setIsNavigationVisible((prevState) => !prevState);
  };

  return (
    <div className='flex flex-col h-screen'>
      <div>
      <ProfileHeader />
      </div>
     
      <div className='flex flex-1'>
        {isNavigationVisible && (
          <div className='w-3 sm:w-10 md:w-20'>
            <Navigation />
          </div>
        )}
        <div className='flex-1 p-2 overflow-auto bg-gray-50 ml-10 sm:ml-0 md:ml-0 rounded-3xl mt-16 border-2 border-gray-200'>
          <Routes>
            {localStorage.getItem('role') === 'admin' && (
              <Route path='/user-manage' element={<UserManage />} />
            )}
        
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/' element={<LandingPage />} />
            <Route path='/Neo' element={<NeoTemplate />} />
            <Route path='/NeoDocements' element={<NeoDocements />} />
            <Route path='/document/:id' element={<DocxToTextConverter />} />
            <Route path='/docview/:id' element={<DocumentView />} />
            <Route path='/docviewall/:id' element={<DocumentContainer />} />
            <Route path='/listView' element={<ListofDocuments />} />
            <Route
              path='/export/:id'
              element={
                <div>
                  <ExportComponent />
                </div>
              }
            />
            <Route path='/projects' element={<Projects />} />
            <Route path='/clients' element={<Clients />} />
            <Route path='/profile' element={<ProfileSettings />} />
            <Route path='/viewclient' element={<ViewClient />} />
            <Route path='/projects/:id' element={<NeoProjectTemplates />} />
            <Route path='/UserManage' element={<UserManage />} />
            <Route
           
              path='/viewAllHighlights'
              element={<ViewTemplatesHighlights />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Home;
