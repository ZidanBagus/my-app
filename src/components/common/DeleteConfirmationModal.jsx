// src/components/common/DeleteConfirmationModal.jsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { ExclamationTriangleFill } from 'react-bootstrap-icons';

const DeleteConfirmationModal = ({ show, onHide, onConfirm, title, message, confirmButtonText = "Ya, Hapus", cancelButtonText = "Batal", confirmVariant = "danger" }) => {
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <ExclamationTriangleFill className={`me-2 text-${confirmVariant}`} size={24} /> 
          {title || "Konfirmasi Penghapusan"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message || "Apakah Anda yakin ingin menghapus item ini? Aksi ini tidak dapat diurungkan."}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          {cancelButtonText}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm}>
          {confirmButtonText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationModal;