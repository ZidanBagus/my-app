// src/components/applicants/ApplicantFormModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';

const ApplicantFormModal = ({ show, onHide, onSubmit, applicantData }) => {
  const initialFormData = {
    nama: '', 
    ipk: '', 
    penghasilanOrtu: '', // Default ke string kosong agar "Pilih Kategori..." terpilih
    jmlTanggungan: '', 
    ikutOrganisasi: 'Tidak', 
    ikutUKM: 'Tidak',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) { 
        if (applicantData) {
            setFormData({
                nama: applicantData.nama || '',
                ipk: applicantData.ipk || '',
                penghasilanOrtu: applicantData.penghasilanOrtu || '', 
                jmlTanggungan: applicantData.jmlTanggungan || '',
                ikutOrganisasi: applicantData.ikutOrganisasi || 'Tidak',
                ikutUKM: applicantData.ikutUKM || 'Tidak',
            });
        } else {
            setFormData(initialFormData); 
        }
        setErrors({});
    }
  }, [applicantData, show]);

  const handleChange = (e) => {
    const { name, value } = e.target; // Pastikan elemen input memiliki atribut 'name'
    // console.log(`handleChange: name=${name}, value=${value}`); // Untuk debugging handleChange
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    console.log("APPLICANT_FORM_MODAL: Memulai validateForm dengan formData:", formData);
    const newErrors = {};
    
    // Validasi Nama
    if (!formData.nama || String(formData.nama).trim() === "") {
        newErrors.nama = 'Nama lengkap tidak boleh kosong.';
    }
    
    // Validasi IPK
    if (formData.ipk === null || formData.ipk === undefined || String(formData.ipk).trim() === "") {
        newErrors.ipk = 'IPK tidak boleh kosong.';
    } else {
        const ipkNum = parseFloat(String(formData.ipk).replace(',', '.'));
        if (isNaN(ipkNum) || ipkNum < 0 || ipkNum > 4) {
            newErrors.ipk = 'IPK harus berupa angka antara 0.00 dan 4.00.';
        }
    }
    
    // Validasi Penghasilan Orang Tua
    if (!formData.penghasilanOrtu || String(formData.penghasilanOrtu).trim() === "") { 
        newErrors.penghasilanOrtu = 'Kategori penghasilan orang tua wajib dipilih.';
    }
    
    // Validasi Jumlah Tanggungan
    if (formData.jmlTanggungan === null || formData.jmlTanggungan === undefined || String(formData.jmlTanggungan).trim() === "") {
        newErrors.jmlTanggungan = 'Jumlah tanggungan tidak boleh kosong.';
    } else {
        const tanggunganNum = parseInt(formData.jmlTanggungan);
        if (isNaN(tanggunganNum) || tanggunganNum < 0) {
            newErrors.jmlTanggungan = 'Jumlah tanggungan harus angka positif atau nol.';
        }
    }

    // ikutOrganisasi dan ikutUKM memiliki default value dan berupa <select>,
    // jadi validasi 'kosong' biasanya tidak diperlukan kecuali jika value="" adalah opsi.
    // Kita sudah set default "Tidak".

    console.log("APPLICANT_FORM_MODAL: Hasil validasi newErrors:", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitInternal = (e) => { 
    e.preventDefault();
    console.log("APPLICANT_FORM_MODAL: handleSubmitInternal dipanggil.");
    if (validateForm()) {
      console.log("APPLICANT_FORM_MODAL: Form valid. Memanggil onSubmit prop dengan data:", formData);
      onSubmit(formData, applicantData ? applicantData.id : null);
    } else {
      console.warn("APPLICANT_FORM_MODAL: Form TIDAK valid. Errors:", errors);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">
          {applicantData ? 'Edit Data Pendaftar' : 'Tambah Data Pendaftar'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {Object.values(errors).some(error => error) && (
             <Alert variant="danger" className="py-2 small mb-3">
                Harap perbaiki isian yang ditandai error.
            </Alert>
        )}

        <Form id="applicantFormInternalInModal" onSubmit={handleSubmitInternal} noValidate> {/* Beri ID unik untuk form */}
          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="modalFormNama"> {/* ID control diubah agar unik jika ada form lain */}
                <Form.Label>Nama Lengkap <span className="text-danger">*</span></Form.Label>
                {/* PASTIKAN ATRIBUT 'name' DI SINI ADALAH "nama" */}
                <Form.Control type="text" name="nama" value={formData.nama} onChange={handleChange} isInvalid={!!errors.nama} />
                <Form.Control.Feedback type="invalid">{errors.nama}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="modalFormIpk">
                <Form.Label>IPK (0.00 - 4.00) <span className="text-danger">*</span></Form.Label>
                <Form.Control type="number" step="0.01" name="ipk" value={formData.ipk} onChange={handleChange} isInvalid={!!errors.ipk} />
                <Form.Control.Feedback type="invalid">{errors.ipk}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="modalFormPenghasilanOrtu">
                <Form.Label>Penghasilan Orang Tua <span className="text-danger">*</span></Form.Label>
                <Form.Select name="penghasilanOrtu" value={formData.penghasilanOrtu} onChange={handleChange} isInvalid={!!errors.penghasilanOrtu}>
                  <option value="">Pilih Kategori...</option>
                  <option value="Rendah">Rendah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Tinggi">Tinggi</option>
                  <option value="Tidak Diketahui">Tidak Diketahui</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.penghasilanOrtu}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="modalFormJmlTanggungan">
                <Form.Label>Jumlah Tanggungan <span className="text-danger">*</span></Form.Label>
                <Form.Control type="number" name="jmlTanggungan" value={formData.jmlTanggungan} onChange={handleChange} isInvalid={!!errors.jmlTanggungan} min="0"/>
                <Form.Control.Feedback type="invalid">{errors.jmlTanggungan}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="modalFormIkutOrganisasi">
                <Form.Label>Ikut Organisasi Kampus? <span className="text-danger">*</span></Form.Label>
                <Form.Select name="ikutOrganisasi" value={formData.ikutOrganisasi} onChange={handleChange}>
                  <option value="Tidak">Tidak</option>
                  <option value="Ya">Ya</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="modalFormIkutUKM">
                <Form.Label>Ikut UKM? <span className="text-danger">*</span></Form.Label>
                <Form.Select name="ikutUKM" value={formData.ikutUKM} onChange={handleChange}>
                  <option value="Tidak">Tidak</option>
                  <option value="Ya">Ya</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Batal
        </Button>
        <Button variant="primary" type="submit" form="applicantFormInternalInModal"> 
          {applicantData ? 'Simpan Perubahan' : 'Simpan Pendaftar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ApplicantFormModal;