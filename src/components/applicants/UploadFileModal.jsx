// src/components/applicants/UploadFileModal.jsx
import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { InfoCircleFill } from 'react-bootstrap-icons'; // Ikon untuk alert

const UploadFileModal = ({ show, onHide, onFileUpload }) => { // Props: show, onHide
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const handleFileChange = (event) => { /* ... logika sama ... */ const file = event.target.files[0]; if (file) { const allowedTypes = [ 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel' ]; if (allowedTypes.includes(file.type)) { setSelectedFile(file); setFileError(''); } else { setSelectedFile(null); setFileError('Format file tidak didukung. Harap unggah file Excel (.xlsx atau .xls).'); } } else { setSelectedFile(null); } };
  const handleUpload = () => { /* ... logika sama ... */ if (selectedFile) { onFileUpload(selectedFile); } else { setFileError('Harap pilih file terlebih dahulu.'); } };
  const handleCloseAndReset = () => { setSelectedFile(null); setFileError(''); onHide(); };

  return (
    <Modal show={show} onHide={handleCloseAndReset} centered size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">Unggah Data Pendaftar (Excel)</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="formFileUpload" className="mb-3">
          <Form.Label className="fw-medium">Pilih File Excel (.xlsx atau .xls)</Form.Label>
          <Form.Control 
            type="file" 
            accept=".xlsx, .xls"
            onChange={handleFileChange} 
            isInvalid={!!fileError}
          />
          {selectedFile && <Form.Text className="text-muted mt-1 d-block">File terpilih: {selectedFile.name}</Form.Text>}
          <Form.Control.Feedback type="invalid">{fileError}</Form.Control.Feedback>
        </Form.Group>

        <Alert variant="info" className="mt-3"> {/* Menggunakan Alert Bootstrap */}
          <Alert.Heading as="h6" className="fw-semibold d-flex align-items-center">
            <InfoCircleFill className="me-2"/>Instruksi Format File
          </Alert.Heading>
          <hr />
          <p className="mb-1 small">
            Pastikan file Excel Anda memiliki header kolom yang sesuai pada baris pertama.
            Contoh header yang dikenali (case tidak sensitif, urutan tidak masalah):
          </p>
          <ul className="mb-0 small ps-3">
            <li><strong>Nama Lengkap</strong> (atau variasi seperti "Nama")</li>
            <li><strong>IPK</strong></li>
            <li><strong>Penghasilan</strong> (Isi dengan kategori: "Rendah", "Sedang", "Tinggi")</li>
            <li><strong>Tanggungan</strong> (atau "Jumlah Tanggungan Orang Tua")</li>
            <li><strong>Ikut Organisasi</strong> (Isi dengan "Ikut" atau "Tidak Ikut"/kosong)</li>
            <li><strong>Ikut UKM</strong> (Isi dengan "Ikut" atau "Tidak Ikut"/kosong)</li>
          </ul>
           <p className="mt-2 mb-0 small">Data pendaftar dimulai dari baris kedua.</p>
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleCloseAndReset}>
          Batal
        </Button>
        <Button variant="primary" onClick={handleUpload} disabled={!selectedFile}>
          Unggah File
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UploadFileModal;