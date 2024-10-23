import React from 'react';
import styles from './styles/PaymentDeleteModal.module.css';

const PaymentDeleteModal = ({ showDeleteModal, onConfirm, onCancel }) => {
  if (!showDeleteModal) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContainer}>
        <div className={styles.modalMessage}>
          <span>결제 내역을 삭제하시겠습니까?</span>
        </div>
        <div className={styles.modalBtns}>
          <button className={styles.modalBtnYes} onClick={onConfirm}>
            네
          </button>
          <button className={styles.modalBtn} onClick={onCancel}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDeleteModal;