import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';

import './index.css'
import HomePage from './pages/HomePage.jsx'
import SubProfessionsPage from './pages/SubProfessionsPage.jsx';
import DetailsPage from './pages/DetailsPage.jsx';


const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage/>,
  },
  {
    path: "/domain/:domainId",
    element: <SubProfessionsPage/>,
  },
  {
    path: "/profession/:professionId",
    element: <DetailsPage/>,
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
