// src/services/authService.js
import apiClient from './apiClient.js'; // Impor instance axios yang sudah dikonfigurasi

// Path relatif terhadap baseURL yang sudah di-set di apiClient.js
// baseURL kita adalah 'http://localhost:5001/api', jadi API_URL_AUTH menjadi '/auth/'
const API_URL_AUTH = '/auth/'; 

const login = async (username, password) => {
  try {
    // Menggunakan apiClient, bukan axios langsung.
    // Path sekarang hanya endpoint spesifik, bukan URL lengkap.
    const response = await apiClient.post(API_URL_AUTH + 'login', {
      username,
      password,
    });

    // Jika login berhasil dan backend mengembalikan token dan data user
    if (response.data && response.data.token && response.data.user) {
      // Simpan token dan data user ke localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
      // Anda bisa juga mengupdate state global di sini jika menggunakan Redux/Zustand,
      // tapi untuk Context API, pembaruan state biasanya dilakukan di dalam AuthContext.
    }
    return response.data; // Kembalikan seluruh data respons (termasuk user dan token)
  } catch (error) {
    // apiClient.interceptors.response seharusnya sudah menangani error global seperti 401,
    // tapi kita tetap bisa melempar error spesifik dari sini jika perlu.
    // error.response.data biasanya berisi pesan error dari backend.
    throw error.response?.data || { message: 'Login gagal. Terjadi kesalahan jaringan atau server tidak merespons.' };
  }
};

const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  // Tidak perlu memanggil API backend untuk logout jika menggunakan JWT stateless,
  // kecuali jika backend Anda menyimpan daftar token aktif/blacklist.
  // Untuk kesederhanaan, kita hanya hapus token di sisi klien.
  console.log("User logged out from authService.");
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  try {
    if (userStr) return JSON.parse(userStr);
  } catch (e) {
    console.error("Error parsing user data dari localStorage:", e);
    localStorage.removeItem('user'); // Hapus data korup
    return null;
  }
  return null;
};

const getToken = () => {
  return localStorage.getItem('token');
};

// Fungsi untuk mengambil data user terbaru dari server menggunakan token yang ada.
// Berguna untuk validasi token saat aplikasi dimuat atau untuk refresh data user.
const fetchCurrentUserFromServer = async () => {
    const token = getToken(); // Mengambil token dari localStorage
    if (!token) {
        console.log("fetchCurrentUserFromServer: Tidak ada token, user tidak diautentikasi.");
        return null; // Tidak perlu request jika tidak ada token
    }

    try {
        // apiClient sudah otomatis menambahkan header Authorization dengan token ini via interceptor.
        const response = await apiClient.get(API_URL_AUTH + 'me');
        
        // Jika berhasil, update data user di localStorage
        if (response.data) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data user dari server (fetchCurrentUserFromServer):", error.response?.data || error.message);
        // Interceptor di apiClient seharusnya sudah menangani error 401 (misalnya dengan logout otomatis).
        // Jika tidak, kita bisa tambahkan penanganan di sini:
        // if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        //   logout(); // Panggil logout dari service ini
        // }
        return null;
    }
};

// Objek yang akan diekspor, berisi semua fungsi layanan autentikasi
const authService = {
  login,
  logout,
  getCurrentUser,
  getToken,
  fetchCurrentUserFromServer,
};

export default authService;