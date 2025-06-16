// src/pages/ApplicantManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ApplicantFormModal from '../components/applicants/ApplicantFormModal.jsx';
import UploadFileModal from '../components/applicants/UploadFileModal.jsx';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal.jsx'; // Impor modal konfirmasi
import { 
    Table, 
    Button, 
    ButtonGroup, 
    Spinner, 
    Alert, 
    InputGroup, 
    Form as BootstrapForm, 
    Card, 
    Row, 
    Col, 
    Pagination,
    Dropdown // Untuk opsi item per halaman yang lebih rapi
} from 'react-bootstrap';
import { PersonPlusFill, Upload, PencilSquare, Trash3Fill, Search, InfoCircleFill } from 'react-bootstrap-icons';
import applicantService from '../services/applicantService';
import { toast } from 'react-toastify';

const ApplicantManagementPage = () => {
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState(null);
  
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [applicantToDelete, setApplicantToDelete] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchApplicants = useCallback(async (page = 1, search = '', limit = itemsPerPage) => {
    if (applicants.length === 0 && !search && page === 1) setIsLoading(true);
    else setIsTableLoading(true);
    setError('');
    try {
      const params = { page, limit, search };
      const data = await applicantService.getAllApplicants(params);
      setApplicants(data.applicants || []);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.totalItems || 0);
      setCurrentPage(data.currentPage || 1);
    } catch (err) {
      const fetchError = err.message || 'Gagal memuat data pendaftar.';
      setError(fetchError);
      toast.error(fetchError, { position: "top-center" });
      setApplicants([]); 
    } finally {
      setIsLoading(false);
      setIsTableLoading(false);
    }
  }, [itemsPerPage, applicants.length]); // applicants.length sebagai dep untuk re-trigger loading awal

  useEffect(() => {
    fetchApplicants(currentPage, searchTerm, itemsPerPage);
  }, [fetchApplicants, currentPage, searchTerm, itemsPerPage]);

  const handleAddApplicant = () => { setEditingApplicant(null); setIsAddModalOpen(true); };
  const handleUploadApplicants = () => { setIsUploadModalOpen(true); };
  const handleEditApplicant = (applicant) => { setEditingApplicant(applicant); setIsAddModalOpen(true);};

  const handleDeleteClick = (applicant) => {
    setApplicantToDelete(applicant);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteApplicant = async () => {
    if (!applicantToDelete) return;
    const toastId = toast.loading("Menghapus data pendaftar...", {position: "top-center"});
    setIsTableLoading(true);
    try {
      await applicantService.deleteApplicant(applicantToDelete.id);
      toast.update(toastId, {render: `Data pendaftar "${applicantToDelete.nama}" berhasil dihapus!`, type: "success", isLoading: false, autoClose: 3000});
      
      // Logika untuk pindah halaman jika item terakhir dihapus
      const newTotalItems = totalItems - 1;
      const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages); // Pindah ke halaman terakhir yang baru
      } else if (newTotalItems === 0) {
        setCurrentPage(1); // Kembali ke halaman 1 jika semua data habis
        setApplicants([]); // Kosongkan data di UI
        setTotalItems(0);
        setTotalPages(0);
      }
       else {
        fetchApplicants(currentPage, searchTerm, itemsPerPage); // Refresh halaman saat ini
      }
    } catch (err) {
      toast.update(toastId, {render: err.message || 'Gagal menghapus data pendaftar.', type: "error", isLoading: false, autoClose: 5000});
    } finally {
        setShowDeleteConfirmModal(false);
        setApplicantToDelete(null);
        // setIsTableLoading(false); // fetchApplicants sudah handle ini
    }
  };

  const handleFormSubmit = async (formData, id) => {
    if (!formData.nama || String(formData.nama).trim() === "" || formData.ipk === null || formData.ipk === undefined || String(formData.ipk).trim() === "" || !formData.penghasilanOrtu || formData.penghasilanOrtu === "" || formData.jmlTanggungan === null || formData.jmlTanggungan === undefined || String(formData.jmlTanggungan).trim() === "" || !formData.ikutOrganisasi || !formData.ikutUKM) {
        toast.error("Validasi Gagal: Semua field yang ditandai * wajib diisi.", { position: "top-center" });
        return; 
    }
    const dataToSend = { nama: String(formData.nama).trim(), ipk: parseFloat(String(formData.ipk).replace(',', '.')), penghasilanOrtu: formData.penghasilanOrtu, jmlTanggungan: parseInt(formData.jmlTanggungan), ikutOrganisasi: formData.ikutOrganisasi, ikutUKM: formData.ikutUKM, };
    
    const action = id ? "Memperbarui" : "Menambah";
    const toastId = toast.loading(`${action} data pendaftar...`, { position: "top-center" });
    setIsTableLoading(true); 

    try {
      if (id) {
        const result = await applicantService.updateApplicant(id, dataToSend);
        toast.update(toastId, { render: result.message || 'Data pendaftar berhasil diperbarui!', type: "success", isLoading: false, autoClose: 3000 });
      } else {
        const result = await applicantService.createApplicant(dataToSend);
        toast.update(toastId, { render: result.message || 'Data pendaftar baru berhasil ditambahkan!', type: "success", isLoading: false, autoClose: 3000 });
      }
      setIsAddModalOpen(false); 
      setEditingApplicant(null); 
      // Jika tambah baru, idealnya ke halaman terakhir jika ada banyak halaman, atau halaman 1
      // Untuk edit, tetap di halaman saat ini.
      fetchApplicants(id ? currentPage : 1, searchTerm, itemsPerPage); 
    } catch (err) {
        const errorMessage = err.details ? err.details.map(e => `${e.path || 'Error'}: ${e.message}`).join('\n') : (err.message || 'Gagal menyimpan data pendaftar.');
        toast.update(toastId, { render: `Error: ${errorMessage}`, type: "error", isLoading: false, autoClose: 5000 });
    } finally {
        setIsTableLoading(false);
    }
  };
  
  const handleFileUploadSubmit = async (file) => {
    const toastId = toast.loading("Mengunggah dan memproses file Excel...", { position: "top-center" });
    setIsTableLoading(true);
    try {
      const result = await applicantService.uploadApplicantsFile(file);
      toast.update(toastId, { render: result.message || `${result.importedCount} data berhasil diimpor.`, type: "success", isLoading: false, autoClose: 3000 });
      setIsUploadModalOpen(false);
      fetchApplicants(1, '', itemsPerPage); // Refresh ke halaman pertama
    } catch (err) {
      toast.update(toastId, { render: `Error: ${err.message || 'Gagal mengunggah file.'}`, type: "error", isLoading: false, autoClose: 5000 });
    } finally {
        setIsTableLoading(false);
    }
  };
  
  const handleSearchChange = (event) => { setSearchTerm(event.target.value); setCurrentPage(1); };
  const handlePageChange = (pageNumber) => { if (pageNumber >= 1 && pageNumber <= totalPages && !isTableLoading) { setCurrentPage(pageNumber); }};
  const handleItemsPerPageChange = (value) => { setItemsPerPage(parseInt(value)); setCurrentPage(1); };
  
  const renderPaginationItems = () => {
    if (totalPages <= 1) return null;
    let items = []; const maxPagesToShow = 3; let startPage, endPage;
    if (totalPages <= maxPagesToShow + 2) { startPage = 1; endPage = totalPages; } 
    else { if (currentPage <= Math.ceil(maxPagesToShow / 2) +1 ) { startPage = 1; endPage = maxPagesToShow; } 
    else if (currentPage + Math.floor(maxPagesToShow / 2) >= totalPages -1 ) { startPage = totalPages - maxPagesToShow + 1; endPage = totalPages; } 
    else { startPage = currentPage - Math.floor(maxPagesToShow / 2); endPage = currentPage + Math.floor(maxPagesToShow / 2) ; } }
    items.push(<Pagination.First key="first" onClick={() => handlePageChange(1)} disabled={currentPage === 1 || isTableLoading} />);
    items.push(<Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || isTableLoading} />);
    if (startPage > 1) { items.push(<Pagination.Item key={1} onClick={() => handlePageChange(1)} disabled={isTableLoading}>{1}</Pagination.Item>); if (startPage > 2) { items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />); } }
    for (let number = startPage; number <= endPage; number++) { items.push( <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)} disabled={isTableLoading}> {number} </Pagination.Item> ); }
    if (endPage < totalPages) { if (endPage < totalPages - 1) { items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />); } items.push(<Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)} disabled={isTableLoading}>{totalPages}</Pagination.Item>); }
    items.push(<Pagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || isTableLoading} />);
    items.push(<Pagination.Last key="last" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages || isTableLoading} />);
    return items;
  };

  return (
    <>
      <Row className="align-items-center mb-4 g-3">
        <Col md>
          <h1 className="h2 fw-bolder text-dark mb-0">Manajemen Data Pendaftar</h1>
        </Col>
        <Col md="auto">
          <ButtonGroup>
            <Button variant="success" onClick={handleAddApplicant} title="Tambah Pendaftar Baru">
              <PersonPlusFill className="me-1 me-md-2" /> <span className="d-none d-md-inline">Tambah</span>
            </Button>
            <Button variant="info" onClick={handleUploadApplicants} title="Unggah Data dari Excel">
              <Upload className="me-1 me-md-2" /> <span className="d-none d-md-inline">Unggah</span>
            </Button>
          </ButtonGroup>
        </Col>
      </Row>

      {error && <Alert variant="danger" className="py-2" onClose={() => setError('')} dismissible>{error}</Alert>} 
      
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-light border-bottom-0 pt-3 pb-0 px-4">
          <Row className="align-items-center g-2">
            <Col xs={12} md={5} lg={4} className="mb-2 mb-md-0">
                <h5 className="fw-medium mb-lg-2">Daftar Pendaftar</h5>
            </Col>
            <Col xs={12} sm={7} md={4} lg={5} className="mb-2 mb-md-0">
                <InputGroup size="sm">
                    <InputGroup.Text id="search-addon"><Search /></InputGroup.Text>
                    <BootstrapForm.Control
                        type="text"
                        placeholder="Cari nama pendaftar..."
                        aria-label="Cari pendaftar"
                        aria-describedby="search-addon"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </InputGroup>
            </Col>
            <Col xs={12} sm={5} md={3} lg={3} className="d-flex justify-content-sm-end align-items-center mb-2 mb-md-0">
                <BootstrapForm.Label htmlFor="itemsPerPageSelect" className="me-2 small text-nowrap mb-0">Tampil:</BootstrapForm.Label>
                <BootstrapForm.Select 
                    id="itemsPerPageSelect"
                    size="sm" 
                    value={itemsPerPage} 
                    onChange={(e) => handleItemsPerPageChange(e.target.value)}
                    style={{maxWidth: '75px'}}
                >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                </BootstrapForm.Select>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="text-center p-5"><Spinner animation="border" variant="primary" style={{width: '3rem', height: '3rem'}} /><p className="mt-3 text-muted">Memuat data pendaftar...</p></div>
          ) : applicants.length === 0 && !isTableLoading ? (
            <Alert variant="light" className="text-center m-3 rounded-3 border">
                <InfoCircleFill size={28} className="mb-2 text-muted"/>
                <p className="mb-0">
                    {searchTerm ? "Tidak ada pendaftar yang cocok dengan pencarian Anda." : "Belum ada data pendaftar untuk ditampilkan."}
                </p>
            </Alert>
          ) : (
            <>
            {isTableLoading && <div className="text-center py-3 border-bottom"><Spinner size="sm" animation="border" variant="secondary" className="me-2"/> Memperbarui data...</div>}
            <div className="table-responsive"> {/* Membuat tabel responsif dengan scroll horizontal jika perlu */}
              <Table striped bordered hover className="mb-0 align-middle small">
                <thead className="table-light">
                  <tr>
                    <th style={{width: '5%'}} className="text-center">No</th>
                    <th style={{width: '25%'}}>Nama</th>
                    <th style={{width: '10%'}} className="text-center">IPK</th>
                    <th style={{width: '20%'}}>Penghasilan Ortu</th>
                    <th style={{width: '10%'}} className="text-center">Tangg.</th>
                    <th style={{width: '10%'}} className="text-center">Org.</th>
                    <th style={{width: '10%'}} className="text-center">UKM</th>
                    <th style={{width: '10%', minWidth: '100px'}} className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((applicant, index) => (
                    <tr key={applicant.id}>
                      <td className="text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="fw-medium">{applicant.nama}</td>
                      <td className="text-center">{typeof applicant.ipk === 'number' ? applicant.ipk.toFixed(2) : applicant.ipk}</td>
                      <td>{applicant.penghasilanOrtu}</td>
                      <td className="text-center">{applicant.jmlTanggungan}</td>
                      <td className="text-center">{applicant.ikutOrganisasi}</td>
                      <td className="text-center">{applicant.ikutUKM}</td>
                      <td className="text-center">
                        <ButtonGroup size="sm">
                          <Button variant="outline-primary" onClick={() => handleEditApplicant(applicant)} title="Edit Pendaftar">
                            <PencilSquare />
                          </Button>
                          <Button variant="outline-danger" onClick={() => handleDeleteClick(applicant)} title="Hapus Pendaftar">
                            <Trash3Fill />
                          </Button>
                        </ButtonGroup>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            </>
          )}
        </Card.Body>
        {applicants.length > 0 && totalPages > 1 && !isLoading && (
            <Card.Footer className="bg-light border-top-0 py-2 px-4 d-flex flex-column flex-sm-row justify-content-sm-between align-items-center">
                <div className="small text-muted mb-2 mb-sm-0">
                    Menampilkan {Math.min(((currentPage - 1) * itemsPerPage) + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} pendaftar
                </div>
                <Pagination size="sm" className="mb-0">
                    {renderPaginationItems()}
                </Pagination>
            </Card.Footer>
        )}
      </Card>

      {isAddModalOpen && ( <ApplicantFormModal show={isAddModalOpen} onHide={() => { setIsAddModalOpen(false); setEditingApplicant(null); }} onSubmit={handleFormSubmit} applicantData={editingApplicant} /> )}
      {isUploadModalOpen && ( <UploadFileModal show={isUploadModalOpen} onHide={() => setIsUploadModalOpen(false)} onFileUpload={handleFileUploadSubmit} /> )}
      {applicantToDelete && ( <DeleteConfirmationModal show={showDeleteConfirmModal} onHide={() => { setShowDeleteConfirmModal(false); setApplicantToDelete(null); }} onConfirm={confirmDeleteApplicant} title="Konfirmasi Hapus Pendaftar" message={`Apakah Anda yakin ingin menghapus data pendaftar atas nama "${applicantToDelete.nama}"?`} /> )}
    </>
  );
};

export default ApplicantManagementPage;