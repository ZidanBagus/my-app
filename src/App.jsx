// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'; // Tambahkan useLocation
import { Spinner } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth } from './contexts/AuthContext.jsx'; // Pastikan path ini benar
import MainLayout from './components/layout/MainLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';

// Impor semua komponen halaman yang akan digunakan dalam rute privat
import DashboardPage from './pages/DashboardPage.jsx';
import ApplicantManagementPage from './pages/ApplicantManagementPage.jsx';
import CriteriaManagementPage from './pages/CriteriaManagementPage.jsx';
import SelectionProcessPage from './pages/SelectionProcessPage.jsx';
import ReportPage from './pages/ReportPage.jsx';

const privateAppRoutes = [
  { path: "/dashboard", element: <DashboardPage /> }, // isPrivate tidak lagi diperlukan di sini karena dibungkus ProtectedRoute
  { path: "/applicants", element: <ApplicantManagementPage /> },
  { path: "/criteria", element: <CriteriaManagementPage /> },
  { path: "/selection", element: <SelectionProcessPage /> },
  { path: "/reports", element: <ReportPage /> },
  { path: "/", element: <Navigate to="/dashboard" replace /> }, // Default untuk rute privat
];

const ProtectedRoute = () => {
  const { currentUser, isLoadingAuth } = useAuth();
  const location = useLocation(); // Dapatkan objek location saat ini

  if (isLoadingAuth) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="info" style={{width: '3rem', height: '3rem'}} /> 
        <span className="ms-3 fs-5">Memeriksa Sesi...</span>
      </div>
    );
  }

  if (!currentUser) {
    // Simpan path yang ingin diakses sebelum redirect ke login
    // Hanya simpan pathname dan search string, bukan seluruh objek window.location
    const fromLocation = {
        pathname: location.pathname,
        search: location.search,
    };
    console.log("ProtectedRoute: User tidak login, redirect ke /login dari", fromLocation);
    return <Navigate to="/login" replace state={{ from: fromLocation, message: "Anda harus login untuk mengakses halaman ini." }} />;
  }
  
  // Jika sudah login, render MainLayout dengan Outlet untuk konten halaman privat
  return <MainLayout><Outlet /></MainLayout>;
};

const PublicRoute = () => {
  const { currentUser, isLoadingAuth } = useAuth();
  if (isLoadingAuth) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="secondary" style={{width: '3rem', height: '3rem'}} />
        <span className="ms-3 fs-5">Memuat...</span>
      </div>
    );
  }
  // Jika belum login, render Outlet untuk konten halaman publik (LoginPage)
  // Jika sudah login, arahkan ke dashboard
  return !currentUser ? <Outlet /> : <Navigate to="/dashboard" replace />;
};


function App() {
  const { isLoadingAuth } = useAuth(); 

  if (isLoadingAuth) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
        <Spinner animation="grow" variant="primary" style={{width: '4rem', height: '4rem'}}/>
        <p className="mt-3 mb-0 fs-4 text-muted">Memuat Aplikasi SPK Beasiswa...</p>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          {privateAppRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
          {/* Jika tidak ada rute privat lain yang cocok, bisa jadi 404 di dalam MainLayout atau redirect ke dashboard */}
           <Route path="*" element={<Navigate to="/dashboard" replace />} /> 
        </Route>
        
        {/* Fallback paling akhir jika tidak ada rute yang cocok sama sekali dan tidak dalam Protected/Public route */}
        {/* Ini mungkin tidak akan pernah tercapai jika Public/Protected sudah menangani semua path */}
        {/* <Route 
            path="*" 
            element={<Navigate to={localStorage.getItem('token') ? "/dashboard" : "/login"} replace />} 
        /> */}
      </Routes>
      <ToastContainer
        position="top-center"
        autoClose={3500} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        limit={3}
      />
    </>
  );
}

export default App;