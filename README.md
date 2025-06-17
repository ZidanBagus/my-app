# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:
# SPK Beasiswa Mahasiswa - Frontend

Aplikasi antarmuka pengguna (UI) untuk Sistem Pendukung Keputusan (SPK) Penerimaan Beasiswa. Dibangun sebagai _Single Page Application_ (SPA) menggunakan **React.js** dan dirancang untuk menyediakan pengalaman pengguna yang modern, interaktif, dan responsif bagi administrator.

---

## ✨ Fitur Utama

-   **Dashboard Analitis:** Visualisasi data komprehensif dengan 6 grafik (Doughnut & Bar Charts) untuk menampilkan distribusi hasil seleksi berdasarkan setiap kriteria.
-   **Notifikasi Pendaftar Baru:** Sistem proaktif memberitahu admin jika ada pendaftar baru yang belum diproses.
-   **Manajemen Data Pendaftar:** Fungsionalitas CRUD (Create, Read, Update, Delete) penuh dengan tabel data yang mendukung pencarian, sorting, dan pagination.
-   **Upload Massal via Excel:** Mempercepat input data pendaftar melalui unggahan file `.xlsx` atau `.xls`.
-   **Manajemen Kriteria & Bobot:** Antarmuka untuk mengelola kriteria seleksi dan bobot informatifnya.
-   **Proses Seleksi Interaktif:** Halaman khusus untuk memulai proses klasifikasi C4.5 di backend.
-   **Laporan Dinamis:** Menampilkan hasil seleksi dengan filter, sorting, pagination, dan fitur ekspor ke **Excel** dan **PDF**.
-   **Antarmuka Responsif:** Dibangun dengan **React Bootstrap** untuk tampilan optimal di desktop, tablet, dan mobile.
-   **Notifikasi Modern:** Menggunakan **React-Toastify** untuk umpan balik aksi pengguna yang non-intrusif.
-   **Autentikasi Aman:** Alur login terproteksi dan manajemen sesi pengguna melalui `AuthContext`.

---

## 🛠️ Teknologi & Library

-   Framework: [React.js](https://reactjs.org/) (dibuat dengan [Vite](https://vitejs.dev/))
-   UI Library: [React Bootstrap](https://react-bootstrap.github.io/) & [Bootstrap 5](https://getbootstrap.com/)
-   Routing: [React Router DOM](https://reactrouter.com/)
-   Manajemen State: [React Context API](https://reactjs.org/docs/context.html)
-   HTTP Client: [Axios](https://axios-http.com/)
-   Visualisasi Data: [Chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/)
-   Notifikasi: [React-Toastify](https://fkhadra.github.io/react-toastify/introduction)
-   Ikon: [React Bootstrap Icons](https://icons.getbootstrap.com/)
-   Ekspor Data:
    -   [XLSX (SheetJS)](https://sheetjs.com/) (Untuk Excel)
    -   [jsPDF](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jspdf-autotable) (Untuk PDF)

---

🚀 Persiapan dan Instalasi

Pastikan Anda memiliki **Node.js** (versi 18 atau lebih baru) dan **npm** terinstal.

1. Clone Repositori
```bash
git clone [https://github.com/NAMA_USER_ANDA/spk-beasiswa-frontend.git](https://github.com/NAMA_USER_ANDA/spk-beasiswa-frontend.git)
cd spk-beasiswa-frontend
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
