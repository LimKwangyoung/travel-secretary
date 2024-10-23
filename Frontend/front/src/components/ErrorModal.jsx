import React from 'react';
import { useErrorStore } from '@/stores/errorStore';
import styles from './styles/ErrorModal.module.css';

const ErrorModal = () => {
  const { errorMessage, showErrorModal, clearError } = useErrorStore();

  if (!showErrorModal) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContainer}>
        <div className={styles.modalMessage}>
          <span>{errorMessage}</span>
        </div>
        <div className={styles.modalBtns}>
          <button className={styles.modalBtn} onClick={clearError}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
