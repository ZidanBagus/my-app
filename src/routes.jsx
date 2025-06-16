// src/routes.jsx
import React from 'react';

// Import komponen halaman yang sudah dibuat
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ApplicantManagementPage from './pages/ApplicantManagementPage.jsx'; // TAMBAHKAN IMPORT INI
import CriteriaManagementPage from './pages/CriteriaManagementPage.jsx'; // TAMBAHKAN IMPORT INI
import SelectionProcessPage from './pages/SelectionProcessPage.jsx'; // TAMBAHKAN IMPORT INI
import ReportPage from './pages/ReportPage.jsx'; // TAMBAHKAN IMPORT INI



// Komponen placeholder untuk halaman yang belum dibuat
const PlaceholderComponent = ({ pageName }) => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>{pageName}</h1>
    <p>Halaman ini dalam tahap pembuatan.</p>
  </div>
);

// Halaman yang masih menggunakan placeholder

const routes = [
  // Rute untuk halaman login
  { path: '/', element: <LoginPage />, exact: true, isPrivate: false },
  { path: '/login', element: <LoginPage />, exact: true, isPrivate: false },

  // Rute untuk halaman dashboard
  { path: '/dashboard', element: <DashboardPage />, exact: true, isPrivate: true },

  // Rute untuk halaman lain yang masih placeholder
  { path: '/applicants', element: <ApplicantManagementPage />, exact: true, isPrivate: true },
  { path: '/criteria', element: <CriteriaManagementPage />, exact: true, isPrivate: true },
  { path: '/selection', element: <SelectionProcessPage />, exact: true, isPrivate: true },
  { path: '/reports', element: <ReportPage />, exact: true, isPrivate: true },

  // Anda bisa tambahkan rute untuk halaman Not Found (404) di sini nanti
  // Contoh: { path: '*', element: <NotFoundPage /> }
];

export default routes;