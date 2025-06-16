// src/pages/DashboardPage.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Container, Card, Row, Col, Spinner, Alert, Placeholder, Button } from 'react-bootstrap';
import { 
    PeopleFill, BarChartSteps, InfoCircleFill, ListTask, 
    PieChartFill, PersonPlusFill, CalendarWeekFill, LightningChargeFill, GraphUp,
    Diagram3Fill, // Atau ikon yang lebih sesuai untuk Organisasi
    PuzzleFill    // Atau ikon lain yang sesuai untuk UKM
} from 'react-bootstrap-icons';
import { useNavigate, Link } from 'react-router-dom';
import applicantService from '../services/applicantService';
import criteriaService from '../services/criteriaService';
import reportService from '../services/reportService';
import { useAuth } from '../contexts/AuthContext'; // Pastikan path ini benar

// Impor untuk Chart.js
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, Title,
  CategoryScale, LinearScale, BarElement
} from 'chart.js';
import { Doughnut, Bar, getElementAtEvent } from 'react-chartjs-2'; 
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Aktifkan jika ingin label di chart dan sudah diinstal

// Registrasi komponen dan plugin Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement, ChartDataLabels); // Jika pakai datalabels
// ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement);


const SummaryCard = ({ title, value, icon, variant = 'light', textVariant = 'dark', isLoading, cardClassName = '' }) => {
  return (
    <Card bg={variant} text={textVariant.toLowerCase()} className={`shadow-sm h-100 border-0 ${cardClassName}`}>
      <Card.Body className="d-flex align-items-center p-3">
        <div className={`fs-1 me-3 text-${textVariant} opacity-75`}>{icon}</div>
        <div>
          <Card.Subtitle className={`mb-1 text-uppercase small fw-bold ${textVariant === 'white' ? 'text-white-75' : 'text-muted'}`}>{title}</Card.Subtitle>
          {isLoading ? (
            <Placeholder as={Card.Title} animation="glow" className="mb-0">
              <Placeholder xs={8} size="lg" />
            </Placeholder>
          ) : (
            <Card.Title as="h2" className={`fw-bolder mb-0 ${textVariant ? `text-${textVariant}` : ''}`}>{String(value)}</Card.Title>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

// Fungsi helper untuk membuat data default chart batang
const createDefaultBarChartData = (labelsArray, type = 'stacked') => {
    const datasets = [
        { label: 'Direkomendasikan', data: Array(labelsArray.length).fill(0), backgroundColor: 'rgba(40, 167, 69, 0.75)', borderColor: 'rgba(40, 167, 69, 1)', borderWidth: 1 },
        { label: 'Tidak Direkomendasikan', data: Array(labelsArray.length).fill(0), backgroundColor: 'rgba(220, 53, 69, 0.75)', borderColor: 'rgba(220, 53, 69, 1)', borderWidth: 1 }
    ];
    if (type === 'stacked') {
        datasets[0].stack = 'Stack 0';
        datasets[1].stack = 'Stack 0';
    } else { // Untuk grouped, stack berbeda
        datasets[0].stack = 'Direkomendasikan'; 
        datasets[1].stack = 'Tidak Direkomendasikan';
    }
    return { labels: labelsArray, datasets };
};

// Fungsi helper untuk opsi dasar chart batang
const getBaseChartOptions = (titleText, xAxisLabel = '', yAxisLabel = 'Jumlah Pendaftar', enableDataLabels = false, type = 'bar') => {
    const isGrouped = type === 'grouped';
    const options = {
        responsive: true, maintainAspectRatio: false, indexAxis: 'x',
        scales: { 
            x: { stacked: !isGrouped, title: { display: true, text: xAxisLabel, font: {weight: '500', size: 12} }, ticks:{font:{size:11}} }, 
            y: { stacked: !isGrouped, title: { display: true, text: yAxisLabel, font: {weight: '500', size: 12} }, beginAtZero: true, ticks: { stepSize: 1, precision: 0, font:{size:11} } }, 
        },
        plugins: { 
            legend: { position: 'top', labels: { padding: 15, font: {size: 12}, usePointStyle: true, pointStyle: 'circle'} }, 
            title: { display: true, text: titleText, font: { size: 17, weight: '600' }, color: '#343a40', padding: { top: 10, bottom: 20 } }, 
            tooltip: { mode: 'index', intersect: false, bodyFont: {size: 12}, titleFont: {size: 13}, backgroundColor: 'rgba(0,0,0,0.8)', titleColor: '#fff', bodyColor: '#fff', padding: 10, boxPadding: 6, cornerRadius: 4 },
            datalabels: { 
                display: enableDataLabels, 
                color: (context) => {
                    const datasetColor = context.dataset.backgroundColor;
                    if (typeof datasetColor === 'string' && datasetColor.startsWith('rgba')) {
                        const rgb = datasetColor.match(/\d+/g);
                        if (rgb && rgb.length >= 3) {
                            const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
                            return brightness > 125 ? '#333' : '#fff'; 
                        }
                    }
                    return '#fff'; 
                }, 
                align: 'center', 
                anchor: 'center', 
                font: { weight: 'bold', size: 10 }, 
                formatter: (value) => { return value > 0 ? value : ''; } 
            }
        },
    };
    return options;
};


const DashboardPage = () => {
  const defaultIpkLabels = ['<3.00', '3.00-3.25', '3.26-3.50', '3.51-3.75', '>3.75'];
  const defaultPenghasilanLabels = ['Rendah', 'Sedang', 'Tinggi', 'Tidak Diketahui'];
  const defaultTanggunganLabels = ['0-1', '2', '3', '4', '>4'];
  const defaultBinaryLabels = ['Ya', 'Tidak'];

  const [dashboardData, setDashboardData] = useState({
    statusProsesSeleksi: 'Memuat...', jumlahKriteria: 0,
    summaryHasilSeleksi: { recommended: 0, notRecommended: 0, total: 0 },
    applicantStats: { totalApplicants: 0, applicantsToday: 0, applicantsLast7Days: 0 },
    ipkDistribution: createDefaultBarChartData(defaultIpkLabels, 'stacked'),
    penghasilanDistribution: createDefaultBarChartData(defaultPenghasilanLabels, 'stacked'),
    tanggunganDistribution: createDefaultBarChartData(defaultTanggunganLabels, 'stacked'),
    organisasiDistribution: createDefaultBarChartData(defaultBinaryLabels, 'grouped'),
    ukmDistribution: createDefaultBarChartData(defaultBinaryLabels, 'grouped'),
    lastSelectionDate: null, newApplicantsSinceLastSelection: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  
  const navigate = useNavigate();
  const doughnutChartRef = useRef(null); 

  const { currentUser } = useAuth() || {};
  const username = currentUser ? currentUser.namaLengkap || currentUser.username : "Admin SPK"; 

  const processIpkDistribution = (selectionResults) => { const labels = defaultIpkLabels; const defaultData = createDefaultBarChartData(labels, 'stacked'); if (!selectionResults || selectionResults.length === 0) return defaultData; const ipkRanges = {}; labels.forEach(l => ipkRanges[l] = { recommended: 0, notRecommended: 0 }); selectionResults.forEach(item => { const ipk = parseFloat(item.ipk); let range = ''; if (ipk < 3.0) range = '<3.00'; else if (ipk >= 3.0 && ipk <= 3.25) range = '3.00-3.25'; else if (ipk >= 3.26 && ipk <= 3.50) range = '3.26-3.50'; else if (ipk >= 3.51 && ipk <= 3.75) range = '3.51-3.75'; else if (ipk > 3.75) range = '>3.75'; if (range && ipkRanges[range]) { if (item.statusKelulusan === 'Direkomendasikan') ipkRanges[range].recommended++; else if (item.statusKelulusan === 'Tidak Direkomendasikan') ipkRanges[range].notRecommended++; } }); return { labels, datasets: [ { ...defaultData.datasets[0], data: labels.map(l => ipkRanges[l].recommended) }, { ...defaultData.datasets[1], data: labels.map(l => ipkRanges[l].notRecommended) } ], }; };
  const processPenghasilanDistribution = (selectionResults) => { const labels = defaultPenghasilanLabels; const defaultData = createDefaultBarChartData(labels, 'stacked'); if (!selectionResults || selectionResults.length === 0) return defaultData; const penghasilanCategories = {}; labels.forEach(l => penghasilanCategories[l] = { recommended: 0, notRecommended: 0 }); selectionResults.forEach(item => { const category = item.penghasilanOrtu || 'Tidak Diketahui'; if (penghasilanCategories[category]) { if (item.statusKelulusan === 'Direkomendasikan') penghasilanCategories[category].recommended++; else if (item.statusKelulusan === 'Tidak Direkomendasikan') penghasilanCategories[category].notRecommended++; } else { if (item.statusKelulusan === 'Direkomendasikan') penghasilanCategories['Tidak Diketahui'].recommended++; else if (item.statusKelulusan === 'Tidak Direkomendasikan') penghasilanCategories['Tidak Diketahui'].notRecommended++; } }); return { labels, datasets: [ { ...defaultData.datasets[0], data: labels.map(l => penghasilanCategories[l].recommended) }, { ...defaultData.datasets[1], data: labels.map(l => penghasilanCategories[l].notRecommended) } ], }; };
  const processTanggunganDistribution = (selectionResults) => { 
    const labels = defaultTanggunganLabels; 
    const defaultData = createDefaultBarChartData(labels, 'stacked'); 
    if (!selectionResults || selectionResults.length === 0) return defaultData; 
    const tanggunganCounts = {}; 
    labels.forEach(l => tanggunganCounts[l] = { recommended: 0, notRecommended: 0 }); 
    selectionResults.forEach(item => { 
        const tanggungan = parseInt(item.jmlTanggungan); 
        let category = ''; 
        if (tanggungan <= 1) category = '0-1';
        else if (tanggungan === 2) category = '2'; 
        else if (tanggungan === 3) category = '3'; 
        else if (tanggungan === 4) category = '4'; 
        else if (tanggungan > 4) category = '>4'; 
        
        if (tanggunganCounts[category]) { 
            if (item.statusKelulusan === 'Direkomendasikan') { tanggunganCounts[category].recommended++; } 
            else if (item.statusKelulusan === 'Tidak Direkomendasikan') { tanggunganCounts[category].notRecommended++; } 
        } else { 
            if (item.statusKelulusan === 'Direkomendasikan') { tanggunganCounts[labels[0]].recommended++; } // Fallback ke kategori pertama jika tidak cocok
            else if (item.statusKelulusan === 'Tidak Direkomendasikan') { tanggunganCounts[labels[0]].notRecommended++; }
        }
    }); 
    return { labels, datasets: [ { ...defaultData.datasets[0], data: labels.map(l => tanggunganCounts[l].recommended) }, { ...defaultData.datasets[1], data: labels.map(l => tanggunganCounts[l].notRecommended) } ], }; 
  };
  const processOrganisasiDistribution = (selectionResults) => { const labels = defaultBinaryLabels; const defaultData = createDefaultBarChartData(labels, 'grouped'); if (!selectionResults || selectionResults.length === 0) return defaultData; const counts = { 'Ya': { recommended: 0, notRecommended: 0 }, 'Tidak': { recommended: 0, notRecommended: 0 } }; selectionResults.forEach(item => { const ikut = item.ikutOrganisasi === 'Ya' ? 'Ya' : 'Tidak'; if (item.statusKelulusan === 'Direkomendasikan') counts[ikut].recommended++; else if (item.statusKelulusan === 'Tidak Direkomendasikan') counts[ikut].notRecommended++; }); return { labels, datasets: [ { ...defaultData.datasets[0], data: labels.map(l => counts[l].recommended), backgroundColor: 'rgba(23, 162, 184, 0.75)', borderColor: 'rgba(23, 162, 184, 1)' }, { ...defaultData.datasets[1], data: labels.map(l => counts[l].notRecommended), backgroundColor: 'rgba(255, 193, 7, 0.75)', borderColor: 'rgba(255, 193, 7, 1)' } ] }; };
  const processUkmDistribution = (selectionResults) => { const labels = defaultBinaryLabels; const defaultData = createDefaultBarChartData(labels, 'grouped'); if (!selectionResults || selectionResults.length === 0) return defaultData; const counts = { 'Ya': { recommended: 0, notRecommended: 0 }, 'Tidak': { recommended: 0, notRecommended: 0 } }; selectionResults.forEach(item => { const ikut = item.ikutUKM === 'Ya' ? 'Ya' : 'Tidak'; if (item.statusKelulusan === 'Direkomendasikan') counts[ikut].recommended++; else if (item.statusKelulusan === 'Tidak Direkomendasikan') counts[ikut].notRecommended++; }); return { labels, datasets: [ { ...defaultData.datasets[0], data: labels.map(l => counts[l].recommended), backgroundColor: 'rgba(108, 117, 125, 0.75)', borderColor: 'rgba(108, 117, 125, 1)'}, { ...defaultData.datasets[1], data: labels.map(l => counts[l].notRecommended), backgroundColor: 'rgba(222, 226, 230, 0.75)', borderColor: 'rgba(200, 200, 200, 1)',borderDash: [5, 5] } ] }; };

  const fetchDataForDashboard = useCallback(async () => { 
    setIsLoading(true); setError(''); 
    try { 
      const [applicantStatsRes, criteriaRes, reportResAllData] = await Promise.allSettled([ 
        applicantService.getApplicantStats(), 
        criteriaService.getAllCriteria(), 
        reportService.getAllSelectionResults({ status: 'semua', limit: 100000, sortBy: 'tanggalSeleksi', sortOrder: 'DESC' }) 
      ]); 
      
      let newApplicantStats = dashboardData.applicantStats; 
      if (applicantStatsRes.status === 'fulfilled' && applicantStatsRes.value) {
        newApplicantStats = applicantStatsRes.value;
      } else if (applicantStatsRes.status === 'rejected') {
        console.error("Dashboard: Gagal mengambil applicantStats:", applicantStatsRes.reason?.message || applicantStatsRes.reason);
      }
      
      let totalKriteria = dashboardData.jumlahKriteria; 
      if (criteriaRes.status === 'fulfilled' && criteriaRes.value) {
        totalKriteria = criteriaRes.value.length || 0;
      } else if (criteriaRes.status === 'rejected') {
        console.error("Dashboard: Gagal mengambil criteriaRes:", criteriaRes.reason?.message || criteriaRes.reason);
      }
      
      let statusSeleksi = dashboardData.statusProsesSeleksi; 
      let summaryHasil = dashboardData.summaryHasilSeleksi; 
      let ipkDist = dashboardData.ipkDistribution; 
      let penghasilanDist = dashboardData.penghasilanDistribution; 
      let tanggunganDist = dashboardData.tanggunganDistribution; 
      let organisasiDist = dashboardData.organisasiDistribution; 
      let ukmDist = dashboardData.ukmDistribution; 
      let lastSelectionDate = dashboardData.lastSelectionDate; 
      let newApplicantsCount = dashboardData.newApplicantsSinceLastSelection; 

      if (reportResAllData.status === 'fulfilled' && reportResAllData.value) { 
        const allResults = reportResAllData.value.results || []; 
        if (reportResAllData.value.summary) summaryHasil = reportResAllData.value.summary; 
        else if (allResults.length > 0) { summaryHasil.total = allResults.length; summaryHasil.recommended = allResults.filter(r => r.statusKelulusan === 'Direkomendasikan').length; summaryHasil.notRecommended = allResults.filter(r => r.statusKelulusan === 'Tidak Direkomendasikan').length; } 
        if (summaryHasil.total > 0 && allResults.length > 0) { 
            lastSelectionDate = new Date(allResults[0].tanggalSeleksi); 
            statusSeleksi = `Selesai (Terakhir: ${lastSelectionDate.toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'})})`; 
            if (applicantService.getAllApplicants && newApplicantStats.totalApplicants > 0) { 
                try { 
                    const allApplicantsRes = await applicantService.getAllApplicants({ limit: newApplicantStats.totalApplicants + 50 }); 
                    if (allApplicantsRes.applicants) newApplicantsCount = allApplicantsRes.applicants.filter(app => new Date(app.createdAt) > lastSelectionDate).length; 
                } catch (e) {console.warn("Tidak dapat mengambil semua pendaftar untuk perbandingan tanggal:", e)} 
            } 
        } 
        ipkDist = processIpkDistribution(allResults); 
        penghasilanDist = processPenghasilanDistribution(allResults); 
        tanggunganDist = processTanggunganDistribution(allResults); 
        organisasiDist = processOrganisasiDistribution(allResults); 
        ukmDist = processUkmDistribution(allResults); 
      } else if (reportResAllData.status === 'rejected') {
          console.warn("Dashboard: Gagal mengambil data laporan untuk chart.", reportResAllData.reason?.message || reportResAllData.reason);
      }
      
      setDashboardData({ 
        statusProsesSeleksi: statusSeleksi, 
        jumlahKriteria: totalKriteria, 
        summaryHasilSeleksi: summaryHasil, 
        applicantStats: newApplicantStats, 
        ipkDistribution: ipkDist, 
        penghasilanDistribution: penghasilanDist, 
        tanggunganDistribution: tanggunganDist, 
        organisasiDistribution: organisasiDist, 
        ukmDistribution: ukmDist, 
        lastSelectionDate: lastSelectionDate, 
        newApplicantsSinceLastSelection: newApplicantsCount 
      }); 
    } catch (err) { 
        console.error("Dashboard: Error kritis saat fetch data:", err); 
        setError('Gagal memuat sebagian atau semua data dashboard.'); 
    } 
    finally { setIsLoading(false); } 
  }, []); // <--- Ganti dari [dashboardData] menjadi []

  useEffect(() => { 
      const today = new Date(); 
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }; 
      setCurrentDate(today.toLocaleDateString('id-ID', options)); 
      fetchDataForDashboard(); 
  }, [fetchDataForDashboard]);
  
  const doughnutChartData = { labels: ['Direkomendasikan', 'Tidak Direkomendasikan'], datasets: [ { label: 'Status Kelulusan', data: [ dashboardData.summaryHasilSeleksi.recommended, dashboardData.summaryHasilSeleksi.notRecommended ], backgroundColor: [ 'rgba(25, 135, 84, 0.8)', 'rgba(220, 53, 69, 0.8)', ], borderColor: [ 'rgba(25, 135, 84, 1)', 'rgba(220, 53, 69, 1)', ], borderWidth: 1, hoverOffset: 8, }, ], };
  const onDoughnutChartClick = (event) => { if (!doughnutChartRef.current) return; const elements = getElementAtEvent(doughnutChartRef.current, event); if (elements && elements.length > 0) { const { index } = elements[0]; const clickedLabel = doughnutChartData.labels[index]; if (clickedLabel === 'Direkomendasikan') navigate('/reports?status=Direkomendasikan'); else if (clickedLabel === 'Tidak Direkomendasikan') navigate('/reports?status=Tidak Direkomendasikan'); } };
  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    onClick: onDoughnutChartClick,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: 'Hasil Seleksi (Global)',
        font: { size: 16, weight: '600' },
        color: '#343a40',
        padding: { top: 10, bottom: 15 }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) { label += ': '; }
            if (context.parsed !== null) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const value = context.raw;
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
              label += value + ' (' + percentage + ')';
            }
            return label;
          }
        },
        bodyFont: { size: 12 },
        titleFont: { size: 13 },
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        boxPadding: 6,
        cornerRadius: 4
      },
      datalabels: {
        display: true,
        color: '#fff',
        font: { weight: 'bold', size: 14 },
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
          if (!total) return '';
          const percentage = (value / total) * 100;
          return percentage > 0 ? percentage.toFixed(1) + '%' : '';
        }
      }
    }
  };
  
  const ipkChartOptions = getBaseChartOptions('Distribusi IPK', 'Rentang IPK', 'Jumlah Pendaftar', false, 'stacked');
  const penghasilanChartOptions = getBaseChartOptions('Distribusi Penghasilan Ortu', 'Kategori Penghasilan', 'Jumlah Pendaftar', false, 'stacked');
  const tanggunganChartOptions = getBaseChartOptions('Distribusi Jml. Tanggungan', 'Jumlah Tanggungan', 'Jumlah Pendaftar', false, 'stacked');
  const organisasiChartOptions = getBaseChartOptions('Keikutsertaan Organisasi', 'Status Ikut Organisasi', 'Jumlah Pendaftar', false, 'grouped');
  const ukmChartOptions = getBaseChartOptions('Keikutsertaan UKM', 'Status Ikut UKM', 'Jumlah Pendaftar', false, 'grouped');

  const renderChartCard = (title, chartData, chartOptions, chartType = 'bar', icon = <GraphUp/>, chartRefProp = null, onChartClickProp = undefined) => {
    const ChartComponent = chartType === 'doughnut' ? Doughnut : Bar;
    const chartHeight = chartType === 'doughnut' ? '260px' : '240px';
    const noDataAvailable = !chartData || !chartData.datasets || chartData.datasets.every(dataset => !dataset.data || dataset.data.every(d => d === 0));

    return (
      <Card className="shadow-sm border-0 h-100">
        <Card.Header as="h6" className="fw-semibold bg-light border-bottom-0 pt-3 pb-2 px-3 d-flex align-items-center text-truncate">
            {React.cloneElement(icon, { className: "me-2 text-primary opacity-75 flex-shrink-0", size:20 })}
            <span className="text-truncate">{title}</span>
        </Card.Header> 
        <Card.Body className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px', maxHeight:'320px', position: 'relative' }}> 
            {isLoading && noDataAvailable ? ( 
                <div className="text-center"><Spinner animation="border" size="sm" variant="secondary" /><p className="mt-2 small text-muted">Memuat data...</p></div> 
            ) : dashboardData.summaryHasilSeleksi.total > 0 && !noDataAvailable ? ( 
                <div style={{ width: '100%', height: chartHeight, padding: '5px' }}> 
                    <ChartComponent 
                        ref={chartRefProp} 
                        data={chartData} 
                        options={chartOptions} 
                        onClick={onChartClickProp} 
                    /> 
                </div> 
            ) : ( 
                <div className="text-center text-muted p-3"> 
                    <InfoCircleFill size={24} className="mb-2"/> 
                    <p className="mb-0 small">Belum ada data hasil seleksi yang relevan.</p>
                </div> 
            )} 
        </Card.Body> 
      </Card>
    );
  };

  return (
    <Container fluid className="pt-3 pb-4">
      <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center mb-4 pb-3 border-bottom"> 
        <div> <h1 className="h2 fw-bolder text-dark mb-1">Selamat Datang, {username}!</h1> <p className="text-muted mb-2 mb-md-0 fs-sm">{currentDate}</p> </div> 
      </div>
      {error && <Alert variant="danger" className="mb-3" onClose={() => setError('')} dismissible>{error}</Alert>}
      {dashboardData.lastSelectionDate && dashboardData.newApplicantsSinceLastSelection > 0 && ( <Alert variant="primary" className="mb-4 shadow-sm border-0"> <Alert.Heading as="h5" className="d-flex align-items-center fw-semibold"> <LightningChargeFill className="me-2"/> Pendaftar Baru Menunggu Diproses! </Alert.Heading> <p className="mb-2 small"> Ada <strong>{dashboardData.newApplicantsSinceLastSelection} pendaftar baru</strong> sejak proses seleksi terakhir pada {new Date(dashboardData.lastSelectionDate).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}. </p> <hr className="my-2"/> <div className="d-flex justify-content-end"> <Button as={Link} to="/selection" variant="primary" size="sm"> Proses Seleksi Sekarang </Button> </div> </Alert> )}
      
      <Row xs={1} sm={2} md={3} lg={3} xl={5} className="g-3 mb-4"> 
        <Col><SummaryCard title="Total Pendaftar" value={dashboardData.applicantStats.totalApplicants} icon={<PeopleFill />} variant="primary" textVariant="white" isLoading={isLoading} cardClassName="border-primary border-start border-5"/></Col> 
        <Col><SummaryCard title="Pendaftar Hari Ini" value={dashboardData.applicantStats.applicantsToday} icon={<PersonPlusFill />} variant="info" textVariant="white" isLoading={isLoading} cardClassName="border-info border-start border-5"/></Col> 
        <Col><SummaryCard title="Pendaftar 7 Hr Terakhir" value={dashboardData.applicantStats.applicantsLast7Days} icon={<CalendarWeekFill />} variant="secondary" textVariant="white" isLoading={isLoading} cardClassName="border-secondary border-start border-5"/></Col> 
        <Col><SummaryCard title="Status Seleksi" value={dashboardData.statusProsesSeleksi} icon={<BarChartSteps />} variant="warning" textVariant="dark" isLoading={isLoading} cardClassName="border-warning border-start border-5"/></Col> 
        <Col><SummaryCard title="Jml Kriteria" value={dashboardData.jumlahKriteria} icon={<ListTask />} variant="success" textVariant="white" isLoading={isLoading} cardClassName="border-success border-start border-5"/></Col> 
      </Row>

      {/* Tata Letak Chart: 3 Chart per baris di layar besar (lg & xl) */}
      <Row className="g-3 mb-4">
        <Col md={12} lg={4} className="d-flex">
          {renderChartCard("Hasil Seleksi Global", doughnutChartData, doughnutChartOptions , 'doughnut', <PieChartFill/>, doughnutChartRef, onDoughnutChartClick)}
        </Col>
        <Col md={12} lg={4} className="d-flex">
          {renderChartCard("Distribusi IPK", dashboardData.ipkDistribution, ipkChartOptions, 'bar', <GraphUp/>)}
        </Col>
        <Col md={12} lg={4} className="d-flex">
          {renderChartCard("Distribusi Penghasilan", dashboardData.penghasilanDistribution, penghasilanChartOptions, 'bar', <GraphUp/>)}
        </Col>
      </Row>
      <Row className="g-3 mb-4">
        <Col md={12} lg={4} className="d-flex">
          {renderChartCard("Distribusi Jml. Tanggungan", dashboardData.tanggunganDistribution, tanggunganChartOptions, 'bar', <GraphUp/>)}
        </Col>
        <Col md={12} lg={4} className="d-flex">
          {renderChartCard("Partisipasi Organisasi", dashboardData.organisasiDistribution, organisasiChartOptions, 'bar', <Diagram3Fill/>)}
        </Col>
        <Col md={12} lg={4} className="d-flex">
          {renderChartCard("Partisipasi UKM", dashboardData.ukmDistribution, ukmChartOptions, 'bar', <PuzzleFill/>)}
        </Col>
      </Row>

      <Row className="mt-3"> <Col> <Card className="shadow-sm border-0"> <Card.Header as="h5" className="fw-semibold bg-light border-bottom-0 pt-3 pb-2 px-4"> <InfoCircleFill className="me-2 text-primary opacity-75"/> Informasi Aplikasi </Card.Header> <Card.Body className="p-4"> <p className="text-muted mb-3 small"> Sistem Pendukung Keputusan ini membantu dalam proses seleksi penerimaan beasiswa menggunakan metode C4.5. Pastikan data selalu terbarui untuk hasil yang optimal. </p> <Alert variant="light" className="mt-3 border p-3 mb-0"> <Alert.Heading as="h6" className="fw-semibold">Tips Penggunaan:</Alert.Heading> <ul className="mb-0 small ps-3 text-muted"> <li>Perbarui data pendaftar secara berkala.</li> <li>Jalankan proses seleksi setelah ada penambahan data pendaftar yang signifikan.</li> <li>Gunakan halaman laporan untuk melihat detail dan mengekspor hasil.</li> </ul> </Alert> </Card.Body> </Card> </Col> </Row>
    </Container>
  );
};

export default DashboardPage;