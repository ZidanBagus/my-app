// src/components/layout/Navbar.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Impor Link dari react-router-dom
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext'; // Sesuaikan path jika perlu
import {
  HouseDoorFill,
  PeopleFill,
  ListCheck,
  UiChecksGrid,
  FileEarmarkBarGraphFill,
  BoxArrowRight,
  PersonCircle // Ikon untuk user
} from 'react-bootstrap-icons';

const AppNavbar = () => {
  const navigate = useNavigate();
  const { currentUser, logout: contextLogout } = useAuth(); // Dapatkan currentUser dan logout dari context

  const handleLogout = () => {
    contextLogout(); // Panggil fungsi logout dari context
    navigate('/login', { replace: true, state: { message: "Anda telah berhasil logout." } }); // Redirect ke login dengan pesan
  };

  // Tentukan nama pengguna untuk ditampilkan
  const usernameDisplay = currentUser ? currentUser.namaLengkap || currentUser.username : "Pengguna";

  return (
    <Navbar bg="light" variant="light" expand="lg" className="shadow-sm sticky-top py-2">
      <Container fluid className="px-3 px-lg-4">
        <Navbar.Brand 
          as={Link} 
          to={currentUser ? "/dashboard" : "/login"} // Arahkan ke dashboard jika login, ke login jika tidak
          className="fw-bolder text-primary fs-5 me-4" // fs-5 lebih besar, fw-bolder
          style={{ textDecoration: 'none' }}
        >
          {/* Ganti dengan logo Anda jika ada */}
          {/* <img src="/logo.svg" width="30" height="30" className="d-inline-block align-top me-2" alt="Logo Aplikasi" /> */}
          SPK Beasiswa
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav">
          {currentUser && ( // Hanya tampilkan Navigasi utama jika sudah login
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/dashboard" className="fw-medium me-lg-1 d-flex align-items-center">
                <HouseDoorFill size={18} className="me-2" />Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/applicants" className="fw-medium me-lg-1 d-flex align-items-center">
                <PeopleFill size={18} className="me-2" />Pendaftar
              </Nav.Link>
              <Nav.Link as={Link} to="/criteria" className="fw-medium me-lg-1 d-flex align-items-center">
                <ListCheck size={18} className="me-2" />Kriteria
              </Nav.Link>
              <Nav.Link as={Link} to="/selection" className="fw-medium me-lg-1 d-flex align-items-center">
                <UiChecksGrid size={18} className="me-2" />Proses Seleksi
              </Nav.Link>
              <Nav.Link as={Link} to="/reports" className="fw-medium d-flex align-items-center">
                <FileEarmarkBarGraphFill size={18} className="me-2" />Laporan
              </Nav.Link>
            </Nav>
          )}
          <Nav className="ms-auto align-items-center">
            {currentUser ? ( // Tampilkan dropdown user jika sudah login
              <NavDropdown
                title={
                  <>
                    <PersonCircle size={22} className="me-1 text-primary" /> 
                    <span className="fw-semibold">{usernameDisplay}</span> {/* Nama pengguna lebih tebal */}
                  </>
                }
                id="user-dropdown"
                align="end" // Dropdown rata kanan
              >
                {/* Tambahkan item lain jika perlu, misalnya link ke profil */}
                {/* <NavDropdown.Item as={Link} to="/profile">
                  <GearFill className="me-2"/> Profil Saya
                </NavDropdown.Item>
                <NavDropdown.Divider /> */}
                <NavDropdown.Item onClick={handleLogout} className="text-danger fw-medium d-flex align-items-center"> {/* text-danger untuk logout */}
                  <BoxArrowRight size={18} className="me-2"/> Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              // Tampilkan tombol login jika belum login dan bukan di halaman login
              // Ini opsional, karena PublicRoute/ProtectedRoute seharusnya sudah menangani redirect
              // Mungkin tidak perlu tombol login eksplisit di navbar jika sudah ada halaman login khusus
              window.location.pathname !== '/login' && (
                 <Nav.Link as={Link} to="/login" className="fw-medium btn btn-outline-primary btn-sm">
                    Login
                 </Nav.Link>
              )
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;