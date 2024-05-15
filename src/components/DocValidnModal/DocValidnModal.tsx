import React, { useState } from 'react';
import Modal from 'react-modal';

const DocValidnModal = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');

  const openModal = (url) => {
    setDocumentUrl(url);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const validateDocument = () => {
    // Logic to validate the document
    closeModal();
  };

  const rejectDocument = () => {
    // Logic to reject the document
    closeModal();
  };

  return (
    <div>
      <button onClick={() => openModal('url_to_your_document')}>Voir</button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Document Validation Modal"
      >
        <h2>Valider ou refuser le document</h2>
        <div>
          <iframe src={documentUrl} width="100%" height="100%"></iframe>
          <button onClick={validateDocument}>Valider</button>
          <button onClick={rejectDocument}>Refuser</button>
        </div>
      </Modal>
    </div>
  );
};

export default DocValidnModal;