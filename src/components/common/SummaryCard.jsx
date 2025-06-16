// src/components/common/SummaryCard.jsx
import React from 'react';

const SummaryCard = ({ title, value, icon, cardColor = '#ffffff', textColor = '#333' }) => {
  return (
    <div style={{ ...styles.card, backgroundColor: cardColor }}>
      {icon && <div style={styles.iconWrapper}>{icon}</div>}
      <div style={styles.textWrapper}>
        <h3 style={{ ...styles.title, color: textColor }}>{title}</h3>
        <p style={{ ...styles.value, color: textColor }}>{value}</p>
      </div>
    </div>
  );
};

const styles = {
  card: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    margin: '10px', // Tambahkan margin agar tidak terlalu rapat
    minWidth: '200px', // Lebar minimum kartu
    flex: 1, // Agar kartu bisa mengisi ruang jika ada beberapa dalam satu baris
  },
  iconWrapper: {
    fontSize: '2.5em', // Ukuran ikon
    marginRight: '20px',
    color: '#555', // Warna ikon default, bisa di-override oleh prop icon
  },
  textWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    margin: '0 0 5px 0',
    fontSize: '1em',
    fontWeight: '600',
  },
  value: {
    margin: 0,
    fontSize: '1.8em',
    fontWeight: 'bold',
  },
};

export default SummaryCard;