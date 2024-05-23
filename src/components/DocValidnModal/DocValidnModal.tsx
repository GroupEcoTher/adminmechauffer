import { useState } from "react";
import Modal from 'react-modal';

interface DocValidnModalProps {
  identityDocumentUrl: string;
  taxNoticeUrl: string;
  modalIsOpen: boolean;
  setModalIsOpen: (isOpen: boolean) => void;
  onValidate: (isVerified: boolean) => void;
}

const DocValidnModal: React.FC<DocValidnModalProps> = ({ identityDocumentUrl, taxNoticeUrl, modalIsOpen, setModalIsOpen, onValidate }) => {
  const [isVerified, setIsVerified] = useState(false);

  const handleValidate = () => {
    setIsVerified(true);
    onValidate(true);
    setModalIsOpen(false);
  };

  const handleClose = () => {
    setModalIsOpen(false);
  };

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={handleClose}
      contentLabel="Document Validation Modal"
    >
      <h2>Document Validation</h2>
      <div>
        <h3>Identity Document</h3>
        <img src={identityDocumentUrl} alt="Identity Document" />
      </div>
      <div>
        <h3>Tax Notice</h3>
        <img src={taxNoticeUrl} alt="Tax Notice" />
      </div>
      <button onClick={handleValidate}>Validate</button>
      <button onClick={handleClose}>Close</button>
    </Modal>
  );
};

export default DocValidnModal;