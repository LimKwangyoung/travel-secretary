import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdClose } from 'react-icons/md';
import StepOne from '../components/Step1';
import StepTwo from '../components/Step2';
import StepThree from '../components/Step3';
import StepFour from '../components/Step4';
import styles from '@/styles/TripCreatePage.module.css';
import { useErrorStore } from '../stores/errorStore'; // Error Store 가져오기

const TripCreatePage = () => {
  const [step, setStep] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const navigate = useNavigate();
  const { setError } = useErrorStore(); // 에러 메시지 설정 함수 가져오기
  const [formData, setFormData] = useState({
    locations: [],
    start_date: '',
    end_date: '',
    members: [],
    trip_name: '',
    bank_account: '',
    bank_name: '',
  });

  // 폼 데이터 업데이트 함수
  const updateFormData = (newData) => {
    setFormData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  // 각 스텝별 필수 입력값 검증
  const validateStep = () => {
    switch (step) {
      case 0: // Step 1: 국가, 날짜, 목적지 검증
        if (!formData.locations.length || !formData.start_date || !formData.end_date) {
          setError('국가, 날짜, 또는 목적지를 입력해주세요.'); // 에러 메시지 설정
          return false;
        }
        return true;
      case 1: // Step 2: 여행 이름 및 멤버 검증
        if (!formData.trip_name) {
          setError('여행 이름과 참여 인원을 입력해주세요.');
          return false;
        }
        return true;
      case 2: // Step 3: 정산 계좌 검증
        if (!formData.bank_account) {
          setError('정산 계좌를 입력해주세요.');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  const cancelTrip = () => setShowCancelModal(true);
  const closeCancelModal = () => setShowCancelModal(false);

  // formData를 초기 상태로 되돌림
  const clearTrip = () => {
    setFormData({
      locations: [],
      dates: { start: '', end: '' },
      members: [],
      tripName: '',
      bankAccount: '',
    });
    setShowCancelModal(false); // 취소 모달 닫기
    navigate('/trip'); // 페이지 이동
  };


  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepOne formData={formData} updateFormData={updateFormData} />;
      case 1:
        return <StepTwo formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <StepThree formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <StepFour formData={formData} onTripCreated={() => console.log("created trips")} />;
      default:
        return null;
    }
  };

  return (
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.back}>
              {step > 0 && <MdArrowBack className={styles.btns} size={30} onClick={prevStep} />}
            </div>
            <div className={styles.cancel}>
              <MdClose className={styles.btns} size={30} onClick={cancelTrip} />
            </div>
          </div>

          <div className={styles.main}>{renderStep()}</div>

          <div className={styles.bottom}>
            {step < 3 && (
              <button className={styles.nextBtn} onClick={nextStep}>
                다 &nbsp; 음
              </button>
            )}
          </div>

        {showCancelModal && (
          <div className={styles.modal}>
            <div className={styles.modalContainer}>
              <div className={styles.modalMessage}>
                <span>여행 생성을 취소하시겠습니까?</span>
              </div>
              <div className={styles.modalBtns}>
                <button className={styles.modalBtn} onClick={clearTrip}>
                  네
                </button>
                <button className={styles.modalBtn} onClick={closeCancelModal}>
                  아니오
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
  );
};

export default TripCreatePage;
