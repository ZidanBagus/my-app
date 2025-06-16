// src/services/selectionService.js
import apiClient from './apiClient'; // Gunakan instance axios yang sudah dikonfigurasi

const API_PATH = '/selection'; // Path relatif terhadap baseURL di apiClient

const startSelectionProcess = async () => {
  try {
    // Tidak perlu mengirim body untuk implementasi kita saat ini
    const response = await apiClient.post(`${API_PATH}/start`);
    return response.data; // Backend akan mengembalikan { message, totalProcessed, recommended, notRecommended }
  } catch (error) {
    console.error("Error starting selection process:", error.response?.data || error.message);
    throw error.response?.data || { message: 'Gagal memulai proses seleksi.' };
  }
};

const selectionService = {
  startSelectionProcess,
};

export default selectionService;