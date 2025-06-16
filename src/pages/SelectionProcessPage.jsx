// src/pages/SelectionProcessPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, ProgressBar, Alert, ListGroup, Row, Col, Spinner } from 'react-bootstrap';
import { PlayCircleFill, HourglassSplit, CheckCircleFill, ExclamationTriangleFill, InfoCircleFill, ArrowClockwise, FileEarmarkBarGraphFill } from 'react-bootstrap-icons'; // Tambah ikon
import { Link } from 'react-router-dom'; // Impor Link
import selectionService from '../services/selectionService';
import applicantService from '../services/applicantService';
import { toast } from 'react-toastify'; // Impor toast

// Komponen untuk animasi loading yang lebih menarik (opsional)
const ProcessingAnimation = () => (
  <div className="text-center my-4">
    <Spinner animation="grow" variant="primary" className="me-2" />
    <Spinner animation="grow" variant="info" className="me-2" />
    <Spinner animation="grow" variant="success" />
    <p className="mt-3 mb-1 fw-semibold fs-5 text-primary">Sedang Memproses Data Seleksi...</p>
    <p className="text-muted small">Ini mungkin membutuhkan beberapa saat, mohon jangan tutup halaman ini.</p>
  </div>
);

const SelectionProcessPage = () => {
  const [processStatus, setProcessStatus] = useState('idle'); // 'idle', 'processing', 'completed', 'error'
  const [selectionResults, setSelectionResults] = useState(null);
  const [error, setError] = useState(''); // Hanya untuk error fetch data awal jika ada
  // processLog tidak lagi dipakai, akan digantikan toast
  const [totalApplicants, setTotalApplicants] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);
  // progress tidak lagi dipakai, karena proses utama di backend

  const fetchApplicantCount = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const data = await applicantService.getAllApplicants({ page: 1, limit: 1 });
      setTotalApplicants(data.totalItems || 0);
    } catch (err) {
      console.error("SELECTION_PAGE: Gagal mengambil jumlah pendaftar:", err);
      setError("Tidak dapat mengambil data jumlah pendaftar.");
      setTotalApplicants(0);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchApplicantCount();
  }, [fetchApplicantCount]);

  const resetProcess = () => {
    setProcessStatus('idle');
    setSelectionResults(null);
    setError(''); // Reset error juga
    fetchApplicantCount();
  };

  const handleStartProcess = async () => {
    if (totalApplicants === 0 && !isLoadingData) {
      toast.warn("Tidak ada data pendaftar untuk diproses.", { position: "top-center" });
      return;
    }

    setProcessStatus('processing');
    setSelectionResults(null);
    setError('');
    
    const toastId = toast.loading(`Memulai proses seleksi untuk ${totalApplicants} pendaftar...`, { position: "top-center" });

    try {
      const results = await selectionService.startSelectionProcess();
      
      setSelectionResults(results);
      setProcessStatus('completed');
      toast.update(toastId, { 
        render: results.message || 'Proses seleksi telah selesai!', 
        type: "success", 
        isLoading: false, 
        autoClose: 5000 // Lebih lama agar terbaca
      });
    } catch (err) {
      const errorMessage = err.message || 'Terjadi kesalahan saat menjalankan proses seleksi.';
      setError(errorMessage); // Set error state untuk ditampilkan di Alert error utama jika perlu
      setProcessStatus('error');
      toast.update(toastId, { 
        render: `Proses seleksi gagal: ${errorMessage}`, 
        type: "error", 
        isLoading: false, 
        autoClose: 7000 // Lebih lama untuk error
      });
      console.error("Error selama proses seleksi di frontend:", err);
    }
  };

  return (
    <>
      <Row className="align-items-center mb-4 g-3">
        <Col md>
         <h1 className="h2 fw-bolder text-dark mb-0">Proses Seleksi Penerima Beasiswa</h1>
        </Col>
        <Col md="auto">
          {/* Tombol reset selalu bisa diakses kecuali saat sedang processing */}
          <Button 
            variant="outline-secondary" 
            onClick={resetProcess} 
            size="sm" 
            disabled={processStatus === 'processing'}
            title="Mulai Ulang Proses atau Segarkan Data Pendaftar"
          >
            <ArrowClockwise className="me-2"/> 
            {processStatus === 'processing' ? 'Sedang Proses...' : (isLoadingData ? 'Memuat Data...' : 'Mulai Ulang / Refresh')}
          </Button>
        </Col>
      </Row>
      
      {/* Alert untuk error fetch jumlah pendaftar */}
      {error && processStatus === 'idle' && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Card className="shadow-sm mb-4 border-0">
        <Card.Body className="p-4">
          <Card.Title as="h5" className="fw-semibold mb-3">Kontrol Proses Seleksi</Card.Title>
          <Alert variant="light" className="border d-flex align-items-start"> {/* Light variant dengan border */}
            <InfoCircleFill size={28} className="me-3 mt-1 text-info flex-shrink-0"/> {/* text-info */}
            <div>
              Klik tombol di bawah untuk memulai proses seleksi. Proses ini akan **menghapus hasil seleksi sebelumnya** (jika ada) dan menjalankan ulang klasifikasi berdasarkan data pendaftar dan aturan C4.5 yang telah diatur di backend.
              <br />
              {isLoadingData ? (
                <span className="d-inline-flex align-items-center">
                    <Spinner animation="border" size="sm" as="span" className="me-1"/> Memuat info pendaftar...
                </span>
              ) : (
                <>Total pendaftar siap diproses: <strong>{totalApplicants}</strong>.</>
              )}
            </div>
          </Alert>
          <div className="d-grid gap-2 mt-4"> {/* mt-4 untuk jarak */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartProcess}
              disabled={processStatus === 'processing' || isLoadingData || (totalApplicants === 0 && !isLoadingData)}
              className="fw-medium"
            >
              {processStatus === 'processing' ? (
                <><Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" className="me-2"/> SEDANG MEMPROSES...</>
              ) : (
                <><PlayCircleFill className="me-2" /> MULAI PROSES SELEKSI</>
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Tampilkan bagian status/hasil jika proses pernah dimulai atau ada error */}
      {processStatus !== 'idle' && (
        <Card className="shadow-sm border-0">
          <Card.Header as="h5" className="fw-semibold bg-light border-bottom-0 pt-3 pb-2 px-4">Status dan Hasil Proses</Card.Header>
          <Card.Body className="p-4">
            {processStatus === 'processing' && (
              <ProcessingAnimation /> // Komponen animasi loading kustom
            )}
            {processStatus === 'completed' && selectionResults && (
              <Alert variant="success" className="shadow-sm">
                <Alert.Heading as="h4" className="d-flex align-items-center">
                    <CheckCircleFill className="me-2" size={28}/>{selectionResults.message}
                </Alert.Heading>
                <hr />
                <Row className="text-center">
                    <Col md={4} className="mb-2 mb-md-0">
                        <div>Total Diproses</div>
                        <div className="fs-3 fw-bold">{selectionResults.totalProcessed}</div>
                    </Col>
                    <Col md={4} className="mb-2 mb-md-0">
                        <div>Direkomendasikan</div>
                        <div className="fs-3 fw-bold text-success">{selectionResults.recommended}</div>
                    </Col>
                    <Col md={4}>
                        <div>Tidak Direkomendasikan</div>
                        <div className="fs-3 fw-bold text-danger">{selectionResults.notRecommended}</div>
                    </Col>
                </Row>
                <hr />
                <div className="text-center mt-3">
                    <Button as={Link} to="/reports" variant="outline-success">
                        <FileEarmarkBarGraphFill className="me-2"/> Lihat Laporan Detail
                    </Button>
                </div>
              </Alert>
            )}
            {processStatus === 'error' && ( // Tampilkan error jika status adalah 'error'
              <Alert variant="danger" className="shadow-sm">
                <ExclamationTriangleFill className="me-2" /><strong>Proses Gagal:</strong> {error || "Terjadi kesalahan tidak diketahui."}
              </Alert>
            )}
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default SelectionProcessPage;