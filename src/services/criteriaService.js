// src/services/criteriaService.js
import apiClient from './apiClient'; // Gunakan instance axios yang sudah dikonfigurasi

const API_PATH = '/criteria'; // Path relatif terhadap baseURL di apiClient

const getAllCriteria = async () => {
  try {
    const response = await apiClient.get(API_PATH);
    return response.data; // Backend mengembalikan array objek kriteria
  } catch (error) {
    console.error("Error fetching criteria:", error.response?.data || error.message);
    throw error.response?.data || { message: 'Gagal mengambil data kriteria dari server.' };
  }
};

const updateCriteria = async (id, criteriaData) => { // criteriaData biasanya { weight: newWeight }
  try {
    const response = await apiClient.put(`${API_PATH}/${id}`, criteriaData);
    return response.data; // Backend mengembalikan { message: '...', criterion: {...} }
  } catch (error) {
    console.error(`Error updating criterion ${id}:`, error.response?.data || error.message);
    throw error.response?.data || { message: `Gagal mengupdate kriteria ID ${id}.` };
  }
};

const criteriaService = {
  getAllCriteria,
  updateCriteria,
};

export default criteriaService;