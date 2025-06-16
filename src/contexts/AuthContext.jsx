// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService'; // Pastikan path ini benar
import { Spinner } from 'react-bootstrap'; // Untuk tampilan loading

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Coba ambil data user dan token dari localStorage sebagai nilai awal
  // Ini berguna agar UI tidak "berkedip" dari logged-out ke logged-in saat refresh
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [token, setToken] = useState(() => authService.getToken());
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // State untuk menandakan proses validasi token awal

  useEffect(() => {
    // Fungsi untuk memvalidasi token yang ada di localStorage saat aplikasi pertama kali dimuat
    const validateExistingToken = async () => {
      console.log("AuthContext: Memulai validasi token awal...");
      const existingToken = authService.getToken(); // Dapatkan token dari service (localStorage)

      if (existingToken) {
        try {
          // Coba fetch data user menggunakan token yang ada.
          // authService.fetchCurrentUserFromServer() akan menggunakan apiClient yang memiliki interceptor
          // untuk menambahkan token ke header.
          const fetchedUser = await authService.fetchCurrentUserFromServer();
          
          if (fetchedUser) {
            console.log("AuthContext: Token valid, user berhasil di-fetch:", fetchedUser);
            setCurrentUser(fetchedUser);
            setToken(existingToken); // Token sudah ada, pastikan state context sinkron
          } else {
            // Jika fetchedUser null, berarti token mungkin tidak valid atau sesi di server tidak ada
            // authService.logout() mungkin sudah dipanggil oleh interceptor di apiClient atau di fetchCurrentUserFromServer
            console.log("AuthContext: Token tidak valid atau user tidak ditemukan, melakukan logout.");
            setCurrentUser(null);
            setToken(null);
            // Pastikan localStorage juga bersih jika fetch gagal karena token tidak valid
            if (localStorage.getItem('token')) { // Cek apakah logout sudah membersihkan
                 authService.logout();
            }
          }
        } catch (error) {
          // Error saat mencoba fetch user (misalnya network error, atau server error selain 401/403 yang sudah dihandle interceptor)
          console.error("AuthContext: Error saat validasi token awal dengan fetchCurrentUserFromServer:", error);
          setCurrentUser(null);
          setToken(null);
          authService.logout(); // Pastikan logout jika ada error
        }
      } else {
        console.log("AuthContext: Tidak ada token di localStorage saat aplikasi dimuat.");
        // Tidak ada token, tidak perlu melakukan apa-apa, user dianggap belum login
      }
      setIsLoadingAuth(false); // Selesai proses validasi token awal
      console.log("AuthContext: Validasi token awal selesai, isLoadingAuth:", false, "CurrentUser:", currentUser);
    };

    validateExistingToken();
  }, []); // Dependency array kosong agar hanya dijalankan sekali saat AuthProvider mount

  // Fungsi untuk dipanggil setelah login berhasil dari LoginPage
  const login = (userData, userToken) => {
    console.log("AuthContext: Fungsi login dipanggil dengan data:", userData);
    // authService.login sudah menyimpan ke localStorage
    setCurrentUser(userData);
    setToken(userToken);
    // Tidak perlu setIsLoadingAuth(false) di sini karena ini untuk proses login, bukan validasi awal
  };

  // Fungsi untuk logout
  const logout = () => {
    console.log("AuthContext: Fungsi logout dipanggil.");
    authService.logout(); // Membersihkan localStorage
    setCurrentUser(null);
    setToken(null);
    // Navigasi ke /login akan dihandle oleh ProtectedRoute atau komponen yang memanggil logout
  };

  // Jika masih dalam proses validasi token awal, tampilkan UI loading
  // Ini mencegah "kedipan" di mana pengguna sebentar terlihat logout lalu login
  if (isLoadingAuth) {
    console.log("AuthContext: Merender tampilan loading global (isLoadingAuth true)...");
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light"> {/* bg-light untuk kontras */}
        <Spinner animation="grow" variant="primary" style={{ width: '3rem', height: '3rem' }} /> {/* Spinner lebih besar */}
        <p className="ms-3 mt-3 mb-0 fs-5 text-muted">Memverifikasi sesi Anda...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, token, login, logout, isLoadingAuth }}>
      {/* Render children (yaitu <App />) hanya setelah validasi token awal selesai */}
      {children} 
    </AuthContext.Provider>
  );
};

// Hook kustom untuk menggunakan AuthContext dengan mudah
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) { // Atau null, tergantung nilai awal createContext
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};