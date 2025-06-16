// src/services/reportService.js
import apiClient from './apiClient'; // Gunakan instance axios yang sudah dikonfigurasi

const API_PATH = '/reports'; // Path relatif terhadap baseURL di apiClient

// Mengambil semua hasil seleksi dengan opsi filter, pagination, dan sorting
// Parameter fetchAll ditambahkan
const getAllSelectionResults = async (params = {}) => { 
  // params bisa berisi: { page, limit, search, status, sortBy, sortOrder, fetchAll }
  try {
    // Pastikan params dikirim dengan benar
    const response = await apiClient.get(`${API_PATH}/results`, { params });
    console.log("REPORT_SERVICE: Data hasil seleksi diterima. Params:", params, "Response:", response.data);
    return response.data; // Backend akan mengembalikan { totalItems, results, totalPages, currentPage, summary }
  } catch (error) {
    console.error("REPORT_SERVICE: Error fetching selection results:", error.response?.data || error.message);
    throw error.response?.data || { message: 'Gagal mengambil data laporan hasil seleksi.' };
  }
};

const reportService = {
  getAllSelectionResults,
};

export default reportService;