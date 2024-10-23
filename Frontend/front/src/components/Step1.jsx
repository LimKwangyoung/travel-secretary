import React, { useState } from 'react';
import { Chip } from '@mui/material';
import styles from './styles/Steps.module.css';
import { useErrorStore } from '@/stores/errorStore'; // 에러 스토어 가져오기

const StepOne = ({ formData, updateFormData }) => {
  const [countryInput, setCountryInput] = useState('');
  const setError = useErrorStore((state) => state.setError); // 에러 설정 함수
  const today = new Date().toISOString().split('T')[0];
  // 국가 추가 함수
  const addCountry = () => {
    const currentLocations = formData.locations || [];

    if (countryInput && !currentLocations.some((loc) => loc.country === countryInput)) {
      updateFormData({
        locations: [...currentLocations, { country: countryInput }],
      });
      setCountryInput('');
    }
  };

  const removeCountry = (index) => {
    const updatedLocations = formData.locations.filter((_, i) => i !== index);
    updateFormData({ locations: updatedLocations });
  };

  // 날짜 변경 함수
  const handleStartDateChange = (e) => {
    const startDate = e.target.value;
    if (formData.end_date && new Date(startDate) > new Date(formData.end_date)) {
      setError('시작일이 종료일보다 늦습니다!'); // 에러 스토어에 오류 메시지 설정
    } else {
      updateFormData({ start_date: startDate });
    }
  };

  const handleEndDateChange = (e) => {
    const endDate = e.target.value;
    if (formData.start_date && new Date(endDate) < new Date(formData.start_date)) {
      setError('종료일이 시작일보다 빠릅니다!'); // 에러 스토어에 오류 메시지 설정
    } else {
      updateFormData({ end_date: endDate });
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.first}>
        <div className={styles.question}>어디로 여행을 떠나시나요?</div>
        
        {/* 국가 입력 */}
        <div className={styles.country}>
          <input
            type="text"
            placeholder="국가명 입력"
            value={countryInput}
            onChange={(e) => setCountryInput(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && addCountry()} // Enter 키로 국가 추가
          />
        </div>

        {/* 선택된 국가 리스트 */}
        <div className={styles.chipContainer}>
          {formData.locations && formData.locations.length > 0 && (
            formData.locations.map((location, index) => (
              <Chip
                key={index}
                label={location.country}
                onDelete={() => removeCountry(index)}
                variant="outlined"  // 테두리 있는 스타일
                color="primary"     // 색상 설정
              />
            ))
          )}
        </div>
      </div>

      <div className={styles.second}>
        <div className={styles.question}>
          언제 여행을 떠나시나요?
          <p className={styles.subtitle}>자택 출발/도착 기준</p>
        </div>
        {/* 날짜 입력 */}
        <div className={styles.dates}>
          <input
            type="date"
            placeholder="Start Date"
            value={formData.start_date || ''}  // formData.start_date가 없는 경우 빈 문자열 처리
            onChange={handleStartDateChange}  // start_date 유효성 검사 포함
          />
          <input
            type="date"
            placeholder="End Date"
            value={formData.end_date || ''}  // formData.end_date가 없는 경우 빈 문자열 처리
            onChange={handleEndDateChange}  // end_date 유효성 검사 포함
            min={formData.start_date}
          />
        </div>
      </div>
    </div>
  );
};

export default StepOne;
