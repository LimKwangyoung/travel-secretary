import React, { useState } from 'react';
import { Modal, Backdrop, Fade, IconButton, TextField, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useTripStore } from '@/stores/tripStore';
import { useUserStore } from '@/stores/userStore'; // userStore import
import { useParams } from 'react-router-dom'; // useParams import
import axiosInstance from '@/axios'; // axiosInstance import

import styles from './styles/TripInfoModal.module.css';

const TripInfoModal = ({ isOpen, onClose }) => {
  const tripDetailInfo = useTripStore((state) => state.tripDetailInfo);
  const { budget, setUserBudget, setInitialBudget, userInfo } = useUserStore((state) => state); // budget과 userInfo 가져오기
  const { tripId } = useParams(); // tripId 가져오기

  const [editMode, setEditMode] = useState(false); // 수정 모드 상태
  const [newBudget, setNewBudget] = useState(budget.initialBudget); // 새로운 예산 상태

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleSaveClick = async () => {
    try {
      // 새로운 예산 업데이트
      const numericBudget = parseInt(newBudget, 10); // newBudget을 숫자로 변환
  
      // POST 요청 데이터
      const postData = {
        trip_id: tripId,
        budget: numericBudget,
      };
  
      // /trips/invite/로 POST 요청 보내기
      const response = await axiosInstance.post('/trips/budget/', postData);
  
      setInitialBudget(response.data.budget);
      setEditMode(false); // 수정 모드 종료
    } catch (error) {
      console.error('Error sending budget data:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={isOpen}>
        <div className={styles.infoBox}>
          <CloseIcon className={styles.closeBtn} fontSize="large" onClick={onClose} />

          {/* 날짜 정보 */}
          <div className={styles.date}>
            <div className={styles.infoTitle}>📅 &nbsp;날짜</div>
            <div className={styles.infoDetail}>
              <div className={styles.startDate}>
                시작일 &nbsp;| &nbsp; <span className={styles.fullDate}>{tripDetailInfo.startDate}</span>
              </div>
              <div className={styles.endDate}>
                종료일 &nbsp;| &nbsp; <span className={styles.fullDate}>{tripDetailInfo.endDate}</span>
              </div>
            </div>
          </div>

          {/* 국가 정보 */}
          <div className={styles.country}>
            <div className={styles.infoTitle}>✈️ &nbsp;국가</div>
            <div className={styles.infoDetail}>
              {tripDetailInfo.locations.map((location, index) => (
                <div key={index} className={styles.infoMap}>
                  <div className={styles.countryName}>{location.country}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 예산 정보 */}
          <div className={styles.budget}>
            <div className={styles.infoTitle}>💰 &nbsp;예산</div>
            <div className={styles.infoDetail}>
            {!editMode ? (
              <>
                <div className={styles.infoBudget}>
                  초기 예산 | {Number(budget.initialBudget).toLocaleString()}원
                  <IconButton onClick={handleEditClick} size="small">
                    <EditIcon />
                  </IconButton>
                </div>
                <div className={styles.infoBudget}>소비 예산 | {Number(budget.usedBudget).toLocaleString()}원</div>
                <div className={styles.infoBudget}>잔여 예산 | {Number(budget.remainBudget).toLocaleString()}원</div>
              </>
              ) : (
                <div className={styles.editBudget}>
                  <TextField
                    label="초기 예산"
                    type="number"
                    variant="outlined"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    fullWidth
                  />

                  <div className={styles.saveContainer}>
                    <Button onClick={handleSaveClick} className={styles.saveBtn} sx={{
        fontFamily: '"Spoqa Han Sans Neo", sans-serif !important'
      }}>
                      저장하기
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Fade>
    </Modal>
  );
};

export default TripInfoModal;
