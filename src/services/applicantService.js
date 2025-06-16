// src/services/applicantService.js
import apiClient from './apiClient'; // Gunakan instance axios yang sudah dikonfigurasi

const API_PATH = '/applicants'; // Path dasar untuk endpoint pendaftar

// 1. Mengambil semua pendaftar (dengan pagination dan search)
const getAllApplicants = async (params = {}) => { // params bisa berisi { page, limit, search }
  try {
    console.log("APPLICANT_SERVICE: getAllApplicants dipanggil dengan params:", params);
    const response = await apiClient.get(API_PATH, { params });
    return response.data; // Backend mengembalikan { totalItems, applicants, totalPages, currentPage }
  } catch (error) {
    console.error("APPLICANT_SERVICE: Error fetching applicants:", error.response?.data || error.message);
    throw error.response?.data || { message: 'Gagal mengambil data pendaftar.' };
  }
};

// 2. Mengambil detail satu pendaftar berdasarkan ID
const getApplicantById = async (id) => {
  try {
    console.log(`APPLICANT_SERVICE: getApplicantById dipanggil untuk ID: ${id}`);
    const response = await apiClient.get(`${API_PATH}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`APPLICANT_SERVICE: Error fetching applicant ${id}:`, error.response?.data || error.message);
    throw error.response?.data || { message: `Gagal mengambil data pendaftar ID ${id}.` };
  }
};

// 3. Membuat pendaftar baru (individual)
const createApplicant = async (applicantData) => {
  try {
    console.log("APPLICANT_SERVICE: createApplicant dipanggil dengan data:", applicantData);
    const response = await apiClient.post(API_PATH, applicantData);
    return response.data; // Backend mengembalikan { message, applicant }
  } catch (error) {
    console.error("APPLICANT_SERVICE: Error creating applicant:", error.response?.data || error.message);
    throw error.response?.data || { message: 'Gagal menambah data pendaftar.' };
  }
};

// 4. Mengupdate data pendaftar berdasarkan ID
const updateApplicant = async (id, applicantData) => {
  try {
    console.log(`APPLICANT_SERVICE: updateApplicant dipanggil untuk ID: ${id} dengan data:`, applicantData);
    const response = await apiClient.put(`${API_PATH}/${id}`, applicantData);
    return response.data; // Backend mengembalikan { message, applicant }
  } catch (error) {
    console.error(`APPLICANT_SERVICE: Error updating applicant ${id}:`, error.response?.data || error.message);
    throw error.response?.data || { message: `Gagal mengupdate data pendaftar ID ${id}.` };
  }
};

// 5. Menghapus data pendaftar berdasarkan ID
const deleteApplicant = async (id) => {
  try {
    console.log(`APPLICANT_SERVICE: deleteApplicant dipanggil untuk ID: ${id}`);
    const response = await apiClient.delete(`${API_PATH}/${id}`);
    return response.data; // Backend mengembalikan { message }
  } catch (error) {
    console.error(`APPLICANT_SERVICE: Error deleting applicant ${id}:`, error.response?.data || error.message);
    throw error.response?.data || { message: `Gagal menghapus data pendaftar ID ${id}.` };
  }
};

// 6. Mengunggah file Excel data pendaftar
const uploadApplicantsFile = async (file) => {
  const formData = new FormData();
  formData.append('excelFile', file); // 'excelFile' harus cocok dengan nama field di backend (multer)
  console.log("APPLICANT_SERVICE: uploadApplicantsFile dipanggil dengan file:", file.name);

  try {
    const response = await apiClient.post(`${API_PATH}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Penting untuk file upload
      },
    });
    return response.data; // Backend mengembalikan { message, importedCount }
  } catch (error) {
    console.error("APPLICANT_SERVICE: Error uploading applicants file:", error.response?.data || error.message);
    throw error.response?.data || { message: 'Gagal mengunggah file pendaftar.' };
  }
};

// 7. Mengambil statistik pendaftar (untuk Dashboard)
const getApplicantStats = async () => {
  try {
    console.log("APPLICANT_SERVICE: getApplicantStats dipanggil");
    // Memanggil endpoint baru '/stats/summary' yang relatif terhadap API_PATH
    const response = await apiClient.get(`${API_PATH}/stats/summary`); 
    return response.data; // { totalApplicants, applicantsToday, applicantsLast7Days }
  } catch (error) {
    console.error("APPLICANT_SERVICE: Error fetching applicant stats:", error.response?.data || error.message);
    throw error.response?.data || { message: 'Gagal mengambil statistik pendaftar.' };
  }
};


const applicantService = {
  getAllApplicants,
  getApplicantById,
  createApplicant,
  updateApplicant,
  deleteApplicant,
  uploadApplicantsFile,
  getApplicantStats, // Tambahkan fungsi baru ke objek yang diekspor
};

export default applicantService;