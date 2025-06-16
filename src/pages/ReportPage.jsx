// src/pages/ReportPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
    Table, Button, ButtonGroup, Form as BootstrapForm, InputGroup, Card, 
    Row, Col, Alert, Spinner, Pagination 
} from 'react-bootstrap';
import { 
    Download, FilterSquare, BarChartLineFill, CheckCircleFill, XCircleFill, InfoCircleFill,
    FiletypePdf, FileEarmarkSpreadsheetFill, SortAlphaDown, SortAlphaUp, SortNumericDown, SortNumericUp
} from 'react-bootstrap-icons';
import reportService from '../services/reportService';
import { toast } from 'react-toastify';

const ReportPage = () => {
  const location = useLocation(); 
  const navigate = useNavigate(); 

  const getQueryParam = useCallback((paramName) => {
    const params = new URLSearchParams(location.search);
    return params.get(paramName);
  }, [location.search]);

  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState(() => ({
    status: getQueryParam('status') || 'semua', 
    searchTerm: getQueryParam('search') || '',
    sortBy: getQueryParam('sortBy') || 'tanggalSeleksi',
    sortOrder: getQueryParam('sortOrder') || 'DESC'
  }));

  const [summary, setSummary] = useState({ total: 0, recommended: 0, notRecommended: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const fetchReportData = useCallback(async (page, currentFilters) => {
    setIsLoading(true); 
    setError('');
    try {
      const params = { 
        page, 
        limit: itemsPerPage, 
        ...currentFilters, 
        fetchAll: 'false' 
      };
      const data = await reportService.getAllSelectionResults(params);
      setReportData(data.results || []);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.totalItems || 0); 
      setCurrentPage(data.currentPage || 1);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err) { 
      const fetchError = err.message || 'Gagal memuat data laporan.';
      setError(fetchError); 
      toast.error(fetchError, { position: "top-center" });
      setReportData([]); 
      setSummary({ total: 0, recommended: 0, notRecommended: 0 }); 
    } 
    finally { setIsLoading(false); }
  }, [itemsPerPage]);

  useEffect(() => {
    const statusFromURL = getQueryParam('status') || 'semua';
    const searchTermFromURL = getQueryParam('search') || '';
    const sortByFromURL = getQueryParam('sortBy') || 'tanggalSeleksi';
    const sortOrderFromURL = getQueryParam('sortOrder') || 'DESC';
    const pageFromURL = parseInt(getQueryParam('page')) || 1;

    if (statusFromURL !== filters.status || 
        searchTermFromURL !== filters.searchTerm || 
        sortByFromURL !== filters.sortBy || 
        sortOrderFromURL !== filters.sortOrder ||
        pageFromURL !== currentPage) {
      
      setFilters({
          status: statusFromURL,
          searchTerm: searchTermFromURL,
          sortBy: sortByFromURL,
          sortOrder: sortOrderFromURL
      });
      setCurrentPage(pageFromURL);
    }
  }, [location.search, getQueryParam, filters, currentPage]);

  useEffect(() => {
    fetchReportData(currentPage, filters);
  }, [currentPage, filters, fetchReportData]);

  const updateURL = (newFilters, newPage) => {
    const searchParams = new URLSearchParams();
    if (newPage && newPage !== 1) searchParams.set('page', String(newPage));
    if (newFilters.status && newFilters.status !== 'semua') searchParams.set('status', newFilters.status);
    if (newFilters.searchTerm) searchParams.set('search', newFilters.searchTerm);
    if (newFilters.sortBy && newFilters.sortBy !== 'tanggalSeleksi') searchParams.set('sortBy', newFilters.sortBy);
    if (newFilters.sortOrder && newFilters.sortOrder !== 'DESC') searchParams.set('sortOrder', newFilters.sortOrder);
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    updateURL({ ...filters, [name]: value }, 1); 
  };
  
  const handleSortChange = (newSortBy) => {
    const newOrder = filters.sortBy === newSortBy && filters.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    updateURL({ ...filters, sortBy: newSortBy, sortOrder: newOrder }, 1); 
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && !isLoading) {
      updateURL(filters, pageNumber); 
    }
  };
  
  const exportData = async (format) => {
    if (totalItems === 0 && !isLoading) { 
      toast.info("Tidak ada data yang cocok dengan filter untuk diekspor.", { position: "top-center" });
      return;
    }
    setIsExporting(true);
    const toastId = toast.loading(`Mempersiapkan data untuk ekspor ${format.toUpperCase()}...`, {position: "top-center"});
    try {
      const paramsForExport = { ...filters, fetchAll: 'true' };
      const allFilteredData = await reportService.getAllSelectionResults(paramsForExport);
      
      if (!allFilteredData.results || allFilteredData.results.length === 0) {
          toast.update(toastId, {render: "Tidak ditemukan data untuk diekspor.", type: "info", isLoading: false, autoClose: 4000});
          return;
      }
      toast.update(toastId, {render: `Membuat dokumen ${format.toUpperCase()}...`, isLoading: true});
      const date = new Date();
      const timestamp = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}`;
      
      if (format === 'excel') {
        const dataToExport = allFilteredData.results.map(item => ({
          'Nama Pendaftar': item.namaPendaftar, 'IPK': item.ipk, 'Penghasilan Ortu': item.penghasilanOrtu, 
          'Jml Tanggungan': item.jmlTanggungan, 'Ikut Organisasi': item.ikutOrganisasi, 'Ikut UKM': item.ikutUKM,
          'Status Kelulusan': item.statusKelulusan, 'Alasan Keputusan': item.alasanKeputusan || '-',
          'Tanggal Seleksi': new Date(item.tanggalSeleksi).toLocaleDateString('id-ID'),
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Hasil Seleksi");
        XLSX.writeFile(workbook, `Laporan_Seleksi_${timestamp}.xlsx`);
      } else if (format === 'pdf') {
        const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
        const tableColumn = ["No", "Nama Pendaftar", "IPK", "Penghasilan", "Tangg.", "Org.", "UKM", "Status", "Alasan Keputusan"];
        const tableRows = [];
        allFilteredData.results.forEach((item, index) => {
          const rowData = [
              index + 1,
              String(item.namaPendaftar || '-'),
              String(item.ipk?.toFixed(2) || '0.00'),
              String(item.penghasilanOrtu || '-'),
              String(item.jmlTanggungan || '0'),
              String(item.ikutOrganisasi || '-'),
              String(item.ikutUKM || '-'),
              String(item.statusKelulusan || '-'),
              String(item.alasanKeputusan || '-'),
          ];
          tableRows.push(rowData);
        });

        doc.setFontSize(18); 
        doc.text("Laporan Hasil Seleksi Beasiswa", 40, 40);
        doc.setFontSize(11); 
        doc.setTextColor(100);
        doc.text(`Filter Status: ${filters.status}`, 40, 60);
        if (filters.searchTerm) doc.text(`Filter Pencarian: "${filters.searchTerm}"`, 40, 75);
        
        autoTable(doc, {
            head: [tableColumn], 
            body: tableRows, 
            startY: 90, 
            theme: 'striped',
            styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' }, 
            headStyles: { fillColor: [22, 160, 133], fontSize: 8 },
            columnStyles: { 8: { cellWidth: 200 } } 
        });
        
        doc.save(`Laporan_Seleksi_${timestamp}.pdf`);
      }
      toast.update(toastId, {render: `Dokumen ${format.toUpperCase()} berhasil dibuat!`, type: "success", isLoading: false, autoClose: 3000});
    } catch (err) {
        console.error(`Error saat mengekspor data ke ${format}:`, err);
        toast.update(toastId, {render: `Gagal mengekspor data: ${err.message || "Error tidak diketahui"}`, type: "error", isLoading: false, autoClose: 5000});
    } finally {
        setIsExporting(false); 
    }
  };
  
  const SortIcon = ({ fieldName }) => {
    if (filters.sortBy !== fieldName) return null;
    if (['ipk', 'jmlTanggungan'].includes(fieldName)) {
        return filters.sortOrder === 'ASC' ? <SortNumericUp size={14} className="ms-1 text-primary"/> : <SortNumericDown size={14} className="ms-1 text-primary"/>;
    }
    return filters.sortOrder === 'ASC' ? <SortAlphaUp size={14} className="ms-1 text-primary"/> : <SortAlphaDown size={14} className="ms-1 text-primary"/>;
  };

  const renderPaginationItems = () => {
    if (totalPages <= 1) return null;
    let items = [];
    const maxPagesToShow = 3; 
    let startPage, endPage;

    if (totalPages <= maxPagesToShow + 2) { 
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= Math.ceil(maxPagesToShow / 2) + 1 ) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + Math.floor(maxPagesToShow / 2) >= totalPages - 1 ) {
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - Math.floor(maxPagesToShow / 2);
        endPage = currentPage + Math.floor(maxPagesToShow / 2) ;
      }
    }

    items.push(<Pagination.First key="first" onClick={() => handlePageChange(1)} disabled={currentPage === 1 || isLoading || isExporting} />);
    items.push(<Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || isLoading || isExporting} />);

    if (startPage > 1) {
      items.push(<Pagination.Item key={1} onClick={() => handlePageChange(1)} disabled={isLoading || isExporting}>{1}</Pagination.Item>);
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
      }
    }

    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)} disabled={isLoading || isExporting}>
          {number}
        </Pagination.Item>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
      }
      items.push(<Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)} disabled={isLoading || isExporting}>{totalPages}</Pagination.Item>);
    }
    
    items.push(<Pagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || isLoading || isExporting} />);
    items.push(<Pagination.Last key="last" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages || isLoading || isExporting} />);
    
    return items;
  };

  return (
    <>
      <Row className="align-items-center mb-4 g-3"> 
        <Col md> <h1 className="h2 fw-bolder text-dark mb-0">Laporan Hasil Seleksi Beasiswa</h1> </Col> 
        <Col md="auto"> 
            <ButtonGroup>
                <Button variant="success" onClick={() => exportData('excel')} disabled={isLoading || isExporting || totalItems === 0}>
                    {isExporting ? <Spinner as="span" animation="border" size="sm" className="me-2"/> : <FileEarmarkSpreadsheetFill className="me-2"/>}
                    Ekspor Excel
                </Button>
                <Button variant="danger" onClick={() => exportData('pdf')} disabled={isLoading || isExporting || totalItems === 0}>
                    {isExporting ? <Spinner as="span" animation="border" size="sm" className="me-2"/> : <FiletypePdf className="me-2"/>}
                    Ekspor PDF
                </Button>
            </ButtonGroup>
        </Col> 
      </Row>
      
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible className="py-2">{error}</Alert>}

      <Card className="shadow-sm mb-4 border-0">
        <Card.Header className="bg-light border-bottom-0 pt-3 pb-2 px-4"> <h5 className="fw-medium mb-0 d-flex align-items-center"> <FilterSquare className="me-2 text-primary opacity-75"/>Filter Laporan </h5> </Card.Header> 
        <Card.Body className="p-4"> 
            <BootstrapForm> 
                <Row className="g-3 align-items-end"> 
                    <Col xs={12} md={6} lg={4}> 
                        <BootstrapForm.Group controlId="statusFilter"> 
                            <BootstrapForm.Label className="small fw-medium">Status Kelulusan</BootstrapForm.Label> 
                            <BootstrapForm.Select name="status" value={filters.status} onChange={handleFilterChange} disabled={isLoading || isExporting}> 
                                <option value="semua">Semua Status</option> 
                                <option value="Direkomendasikan">Direkomendasikan</option> 
                                <option value="Tidak Direkomendasikan">Tidak Direkomendasikan</option> 
                            </BootstrapForm.Select> 
                        </BootstrapForm.Group> 
                    </Col> 
                    <Col xs={12} md={6} lg={8}> 
                        <BootstrapForm.Group controlId="searchTerm"> 
                            <BootstrapForm.Label className="small fw-medium">Cari Nama Pendaftar</BootstrapForm.Label> 
                            <BootstrapForm.Control type="text" name="searchTerm" placeholder="Masukkan nama pendaftar..." value={filters.searchTerm} onChange={handleFilterChange} disabled={isLoading || isExporting}/> 
                        </BootstrapForm.Group> 
                    </Col> 
                </Row> 
            </BootstrapForm> 
        </Card.Body> 
      </Card>

      <Row className="g-3 mb-4"> 
        <Col md={4}><Card bg="primary" text="white" className="shadow-sm border-0 h-100"><Card.Body className="text-center py-3"><BarChartLineFill size={28} className="mb-2 opacity-75"/><Card.Title as="h6" className="text-uppercase small mb-1">Total Hasil (Sesuai Filter)</Card.Title>{isLoading && summary.total === 0 ? <Spinner animation="border" size="sm"/> : <div className="fs-4 fw-bold">{summary.total}</div>}</Card.Body></Card></Col> 
        <Col md={4}><Card bg="success" text="white" className="shadow-sm border-0 h-100"><Card.Body className="text-center py-3"><CheckCircleFill size={28} className="mb-2 opacity-75"/><Card.Title as="h6" className="text-uppercase small mb-1">Direkomendasikan (Sesuai Filter)</Card.Title>{isLoading && summary.total === 0 ? <Spinner animation="border" size="sm"/> : <div className="fs-4 fw-bold">{summary.recommended}</div>}</Card.Body></Card></Col> 
        <Col md={4}><Card bg="danger" text="white" className="shadow-sm border-0 h-100"><Card.Body className="text-center py-3"><XCircleFill size={28} className="mb-2 opacity-75"/><Card.Title as="h6" className="text-uppercase small mb-1">Tdk. Direkomendasikan (Sesuai Filter)</Card.Title>{isLoading && summary.total === 0 ? <Spinner animation="border" size="sm"/> : <div className="fs-4 fw-bold">{summary.notRecommended}</div>}</Card.Body></Card></Col>
      </Row>
      
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-light border-bottom-0 pt-3 pb-2 px-4"> 
            <h5 className="fw-medium mb-0">Detail Hasil Seleksi (Halaman {currentPage})</h5> 
        </Card.Header> 
        <Card.Body className="p-0">
            {isLoading && reportData.length === 0 ? ( <div className="text-center p-5"><Spinner animation="border" variant="primary" style={{width: '3rem', height: '3rem'}} /><p className="mt-3 text-muted">Memuat data laporan...</p></div> ) : 
            !isLoading && reportData.length === 0 ? ( <Alert variant="light" className="text-center m-3 rounded-3 border"> <InfoCircleFill size={28} className="mb-2 text-muted"/> <p className="mb-0"> {filters.searchTerm || filters.status !== 'semua' ? "Tidak ada data yang sesuai dengan filter saat ini." : "Belum ada data hasil seleksi."} </p> </Alert> ) : 
            ( <> {isLoading && <div className="text-center py-3 border-bottom"><Spinner size="sm" animation="border" variant="secondary" className="me-2"/> Memperbarui data...</div>} 
            <div className="table-responsive">
                <Table striped bordered hover className="mb-0 align-middle small"> 
                    <thead className="table-light"> 
                        <tr> 
                            <th style={{width: '4%'}} className="text-center">No</th> 
                            <th onClick={() => handleSortChange('namaPendaftar')} style={{cursor: 'pointer'}}>Nama <SortIcon fieldName="namaPendaftar"/></th> 
                            <th onClick={() => handleSortChange('ipk')} style={{cursor: 'pointer'}} className="text-center">IPK <SortIcon fieldName="ipk"/></th> 
                            <th>Penghasilan</th> 
                            <th onClick={() => handleSortChange('jmlTanggungan')} style={{cursor: 'pointer'}} className="text-center">Tangg. <SortIcon fieldName="jmlTanggungan"/></th> 
                            <th className="text-center">Org.</th> 
                            <th className="text-center">UKM</th> 
                            <th onClick={() => handleSortChange('statusKelulusan')} style={{cursor: 'pointer'}}>Status <SortIcon fieldName="statusKelulusan"/></th> 
                            <th style={{minWidth: '250px'}}>Alasan Keputusan</th> 
                            <th onClick={() => handleSortChange('tanggalSeleksi')} style={{cursor: 'pointer'}}>Tgl Seleksi <SortIcon fieldName="tanggalSeleksi"/></th> 
                        </tr> 
                    </thead>
                    <tbody> 
                        {reportData.map((item, index) => ( 
                            <tr key={item.id}> 
                                <td className="text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td> 
                                <td className="fw-medium">{item.namaPendaftar}</td> 
                                <td className="text-center">{typeof item.ipk === 'number' ? item.ipk.toFixed(2) : item.ipk}</td> 
                                <td>{item.penghasilanOrtu}</td> 
                                <td className="text-center">{item.jmlTanggungan}</td> 
                                <td className="text-center">{item.ikutOrganisasi}</td> 
                                <td className="text-center">{item.ikutUKM}</td> 
                                <td style={{ color: item.statusKelulusan === 'Direkomendasikan' ? 'var(--bs-success)' : 'var(--bs-danger)', fontWeight: 'bold' }}> {item.statusKelulusan} </td> 
                                <td className="small">{item.alasanKeputusan || '-'}</td> 
                                <td>{new Date(item.tanggalSeleksi).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric'})}</td> 
                            </tr> 
                        ))} 
                    </tbody>
                </Table>
            </div>
            </>
            )}
        </Card.Body>
        {reportData.length > 0 && totalPages > 1 && !isLoading && (
            <Card.Footer className="bg-light border-top-0 py-2 px-4 d-flex flex-column flex-sm-row justify-content-sm-between align-items-center"> 
                <div className="small text-muted mb-2 mb-sm-0">
                    Menampilkan data {Math.max(1, ((currentPage - 1) * itemsPerPage) + 1)} - {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} hasil
                </div>
                <Pagination size="sm" className="mb-0">
                    {renderPaginationItems()}
                </Pagination>
            </Card.Footer>
        )}
      </Card>
    </>
  );
};

export default ReportPage;