// src/pages/CriteriaManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { 
    Table, 
    Button, 
    Form as BootstrapForm, // Alias Form agar tidak bentrok jika ada Form lain
    InputGroup, 
    Alert, 
    Card, 
    Row, 
    Col, 
    Spinner,
    ButtonGroup // <-- PASTIKAN INI ADA DI SINI
} from 'react-bootstrap';
import { PencilSquare, Save, XCircle, ExclamationTriangleFill, InfoCircleFill } from 'react-bootstrap-icons';
import criteriaService from '../services/criteriaService';

// initialCriteria tidak dipakai lagi, data diambil dari API

const CriteriaManagementPage = () => {
  const [criteria, setCriteria] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRowId, setEditingRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({ weight: '' });
  const [isSaving, setIsSaving] = useState(false);

  const fetchCriteria = async () => {
    console.log("CRITERIA_PAGE: Memulai fetchCriteria...");
    setIsLoading(true);
    setError('');
    try {
      const data = await criteriaService.getAllCriteria();
      console.log("CRITERIA_PAGE: Data diterima dari service:", data);
      if (data && Array.isArray(data)) {
        setCriteria(data.map(c => ({ ...c, weight: parseFloat(c.weight), originalWeight: parseFloat(c.weight) })));
      } else {
        console.error("CRITERIA_PAGE: Data kriteria tidak valid atau bukan array:", data);
        setError('Format data kriteria tidak sesuai.');
        setCriteria([]);
      }
    } catch (err) {
      console.error("CRITERIA_PAGE: Error saat fetchCriteria:", err);
      setError(err.message || 'Gagal memuat data kriteria.');
      setCriteria([]);
    } finally {
      setIsLoading(false);
      console.log("CRITERIA_PAGE: fetchCriteria selesai, isLoading:", false);
    }
  };

  useEffect(() => {
    fetchCriteria();
  }, []);

  const handleEditClick = (criterion) => {
    console.log("CRITERIA_PAGE: handleEditClick dipanggil untuk criterion:", criterion);
    if (criterion && criterion.id !== undefined && criterion.weight !== undefined) {
      setEditingRowId(criterion.id);
      setEditFormData({ weight: String(criterion.weight || 0) }); 
      console.log("CRITERIA_PAGE: Mode edit aktif untuk ID:", criterion.id, "dengan form data:", { weight: String(criterion.weight || 0) });
    } else {
      console.error("CRITERIA_PAGE: handleEditClick dipanggil dengan criterion tidak valid:", criterion);
    }
  };

  const handleCancelClick = () => {
    console.log("CRITERIA_PAGE: handleCancelClick dipanggil");
    setEditingRowId(null);
    setEditFormData({ weight: '' });
  };

  const handleInputChange = (event) => {
    const { value } = event.target;
    console.log("CRITERIA_PAGE: handleInputChange, value:", value);
    setEditFormData({ weight: value });
  };
  
  const handleSaveClick = async (criterionId) => {
    console.log("CRITERIA_PAGE: handleSaveClick dipanggil untuk ID:", criterionId, "dengan formData:", editFormData);
    setIsSaving(true);
    setError('');
    
    const newWeightString = editFormData.weight;
    if (newWeightString === null || newWeightString === undefined || String(newWeightString).trim() === "") {
        alert('Bobot tidak boleh kosong.');
        setIsSaving(false);
        return;
    }

    const newWeightFloat = parseFloat(String(newWeightString).replace(',', '.'));

    if (isNaN(newWeightFloat) || newWeightFloat < 0 || newWeightFloat > 100) {
      alert('Bobot tidak valid. Harus berupa angka antara 0 dan 100.');
      setIsSaving(false);
      return;
    }
        
    try {
      const updatedCriterionData = await criteriaService.updateCriteria(criterionId, { weight: newWeightFloat });
      console.log("CRITERIA_PAGE: Data terupdate dari server:", updatedCriterionData);
      
      setCriteria(prevCriteria =>
        prevCriteria.map(c =>
          c.id === criterionId ? { ...updatedCriterionData.criterion, weight: parseFloat(updatedCriterionData.criterion.weight), originalWeight: parseFloat(updatedCriterionData.criterion.weight) } : c
        )
      );
      setEditingRowId(null);
      setEditFormData({ weight: '' });
      // alert(updatedCriterionData.message || 'Bobot berhasil diperbarui.'); // Notifikasi bisa lebih baik
    } catch (err) {
      console.error("CRITERIA_PAGE: Error saat handleSaveClick:", err);
      setError(err.message || `Gagal menyimpan perubahan untuk kriteria ID ${criterionId}.`);
      const criterionToRevert = criteria.find(c => c.id === criterionId);
      if (criterionToRevert) {
        setEditFormData({ weight: String(criterionToRevert.originalWeight) });
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  const totalWeight = criteria.reduce((sum, c) => sum + parseFloat(c.weight || 0), 0);

  if (isLoading && criteria.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Memuat data kriteria...</p>
      </div>
    );
  }
  
  if (error && criteria.length === 0) {
    return (
        <Container className="mt-4">
            <Alert variant="danger" onClose={() => {setError(''); fetchCriteria();}} dismissible>
                <Alert.Heading>Oops! Terjadi Kesalahan</Alert.Heading>
                <p>{error}</p>
                <Button variant="outline-danger" size="sm" onClick={fetchCriteria}>Coba Lagi</Button>
            </Alert>
        </Container>
    );
  }

  return (
    <>
      <Row className="align-items-center mb-4 g-3">
        <Col md>
          <h1 className="h2 fw-bolder text-dark mb-0">Pengaturan Kriteria Seleksi</h1>
        </Col>
        <Col md="auto">
             <Button variant="outline-secondary" size="sm" onClick={fetchCriteria} disabled={isLoading || isSaving}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={`bi bi-arrow-clockwise ${isLoading || isSaving ? 'animate-spin-icon' : ''}`} viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
                </svg> {isLoading ? 'Memuat...' : 'Refresh Data'}
            </Button>
        </Col>
      </Row>

      {error && criteria.length > 0 && 
        <Alert variant="warning" onClose={() => setError('')} dismissible className="py-2 small">
            Gagal memperbarui data: {error}
        </Alert>
      }

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-light border-bottom-0 pt-3 pb-2 px-4">
          <h5 className="fw-medium mb-0">Daftar Kriteria dan Bobot</h5>
        </Card.Header>
        <Card.Body className={criteria.length === 0 && !isLoading ? "p-0" : ""}>
          {criteria.length === 0 && !isLoading && !error && (
            <div className="text-center p-5 text-muted">
                <InfoCircleFill size={40} className="mb-3"/>
                <h4>Data Kriteria Kosong</h4>
                <p>Belum ada data kriteria yang tersedia atau gagal dimuat.</p>
            </div>
          )}
          {criteria.length > 0 && (
            <Table striped bordered hover responsive className="mb-0 align-middle">
                <thead className="table-light">
                <tr>
                    <th>Nama Kriteria</th>
                    <th>Deskripsi</th>
                    <th style={{width: '180px'}} className="text-center">Bobot (%)</th>
                    <th style={{width: '150px'}} className="text-center">Aksi</th>
                </tr>
                </thead>
                <tbody>
                {criteria.map((criterion) => (
                    <tr key={criterion.id}>
                    <td className="fw-medium">{criterion.namaKriteria}</td>
                    <td className="small text-muted">{criterion.deskripsi}</td>
                    <td className="text-center">
                        {editingRowId === criterion.id ? (
                        <InputGroup size="sm" style={{maxWidth: "120px", margin: "auto"}}>
                            <BootstrapForm.Control
                                type="number"
                                name="weight"
                                value={editFormData.weight}
                                onChange={handleInputChange}
                                step="0.1"
                                min="0"
                                max="100"
                                className="text-center"
                                disabled={isSaving}
                                autoFocus
                            />
                            <InputGroup.Text>%</InputGroup.Text>
                        </InputGroup>
                        ) : (
                        `${criterion.weight}%`
                        )}
                    </td>
                    <td className="text-center">
                        {editingRowId === criterion.id ? (
                        <ButtonGroup size="sm"> {/* <--- ButtonGroup DIGUNAKAN DI SINI */}
                            <Button variant="success" onClick={() => handleSaveClick(criterion.id)} title="Simpan" disabled={isSaving}>
                            {isSaving ? <Spinner as="span" animation="border" size="sm" /> : <Save />}
                            </Button>
                            <Button variant="outline-secondary" onClick={handleCancelClick} title="Batal" disabled={isSaving}>
                            <XCircle />
                            </Button>
                        </ButtonGroup>
                        ) : (
                        criterion.editable && (
                            <Button variant="outline-primary" size="sm" onClick={() => handleEditClick(criterion)} title="Edit Bobot" disabled={isSaving || editingRowId !== null}>
                            <PencilSquare className="me-1" /> Edit
                            </Button>
                        )
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
                <tfoot className="table-group-divider">
                <tr className="fw-bold table-light">
                    <td colSpan={2} className="text-end fs-6 pe-3">Total Bobot Keseluruhan:</td>
                    <td className="text-center fs-6">{totalWeight.toFixed(1)}%</td>
                    <td></td>
                </tr>
                </tfoot>
            </Table>
          )}
        </Card.Body>
        {(totalWeight > 100.01 || (totalWeight < 99.99 && totalWeight !== 0 && criteria.length > 0)) && !isLoading && (
          <Card.Footer className="bg-light border-top-0 py-2">
            {totalWeight > 100.01 && 
              <Alert variant="danger" className="mb-0 py-2 small text-center d-flex align-items-center justify-content-center">
                <ExclamationTriangleFill className="me-2"/> Peringatan: Total bobot melebihi 100%! Harap sesuaikan.
              </Alert>
            }
            {(totalWeight < 99.99 && totalWeight !== 0) &&
              <Alert variant="info" className="mb-0 py-2 small text-center d-flex align-items-center justify-content-center">
                <InfoCircleFill className="me-2"/> Info: Total bobot saat ini {totalWeight.toFixed(1)}%. Idealnya total bobot adalah 100%.
              </Alert>
            }
          </Card.Footer>
        )}
      </Card>
    </>
  );
};

export default CriteriaManagementPage;