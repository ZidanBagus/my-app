// src/components/layout/MainLayout.jsx
import React from 'react';
import AppNavbar from './Navbar.jsx'; // Gunakan AppNavbar yang sudah di-refactor
import { Container } from 'react-bootstrap';

const MainLayout = ({ children }) => {
  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
      <AppNavbar />
      <Container 
        as="main" 
        fluid // Gunakan fluid agar padding bisa kita kontrol penuh
        className="py-4 px-3 px-lg-4 flex-grow-1" // py-4, px responsif, flex-grow-1 agar mengisi sisa tinggi
        style={{ backgroundColor: '#f4f6f8' }} // Warna latar konten utama yang lembut
      >
        {children}
      </Container>
      <footer className="bg-light text-center text-muted py-3 border-top mt-auto"> {/* mt-auto agar footer ke bawah jika konten pendek */}
        <Container>
          &copy; {new Date().getFullYear()} SPK Beasiswa App. Hak Cipta Dilindungi.
        </Container>
      </footer>
    </div>
  );
};

export default MainLayout;