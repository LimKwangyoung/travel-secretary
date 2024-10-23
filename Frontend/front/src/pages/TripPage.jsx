import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/TripPage.module.css';

import { useUserStore } from '@/stores/userStore';
import { useTripStore } from '@/stores/tripStore';
import { usePastTripStore } from '@/stores/pastTripStore';
import { useFutureTripStore } from '@/stores/futureTripStore';

import SketchModal from '@/components/SketchModal';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const TripPage = () => {
  const userInfo = useUserStore((state) => state.userInfo);
  const fetchTrips = useTripStore((state) => state.fetchTrips);

  // Trip 상태
  const pastTrips = usePastTripStore((state) => state.pastTrips);
  const futureTrips = useFutureTripStore((state) => state.futureTrips);
  const currentTrip = useTripStore((state) => state.currentTrip);

  useEffect(() => {
    const fetchData = async () => {
      if (!pastTrips.length && !futureTrips.length && !currentTrip.id) {
        // 여행 데이터가 없을 때만 API 호출
        try {
          await fetchTrips();
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchData();
  }, [fetchTrips, pastTrips, futureTrips, currentTrip]);

  // AI 스케치 모달 창
  const [isSketchOpen, setisSketchOpen] = useState(false);
  const [sketchTripId, setSketchTripId] = useState(null);
  const [sketchImageUrl, setSketchImageUrl] = useState('');

  const navigate = useNavigate();

  const toCreate = () => {
    navigate('/trip/create');
  };

  const toDetail = (tripId) => {
    navigate(`/trip/${tripId}`);
  };

  const toGallery = (tripId) => {
    navigate(`/gallery/${tripId}`);
  };

  const openModal = (event, tripId, imageUrl) => {
    event.stopPropagation();
    setisSketchOpen(true);
    setSketchTripId(tripId);
    setSketchImageUrl(imageUrl);
  };

  const closeModal = () => {
    setisSketchOpen(false);
  };

  // 날짜 계산
  const dayDifference = (startDate, endDate) => {
    const calculatedDayDifference = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    return calculatedDayDifference === 0 ? 1 : calculatedDayDifference;
  };

  const handleProfileClick = () => {
    if (currentTrip.id) {
      navigate(`/trip/${currentTrip.id}`);
    } else {
      toCreate();
    }
  };

  const handleTripDataUpdate = async () => {
    try {
      await fetchTrips(); // 여행 데이터를 다시 불러옴
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
  };

  return (
    <div className={styles.mainContainer}>
      {/* 사용자 프로필 */}
      <div className={styles.upper}>
        <div className={styles.profile} >
          {userInfo.profileImage && <img src={userInfo.profileImage} alt={userInfo.nickName} className={styles.tripCircleImage} onClick={handleProfileClick} />}
          <IconButton className={styles.createButton} onClick={toCreate}>
            <AddIcon />
          </IconButton>
        </div>

        {/* 미래 여행 */}
        {futureTrips.map((trip, index) => (
          <div className={styles.futureTripContainer} key={index} onClick={() => toDetail(trip.id)}>
            <div className={styles.futureTrip}>
              {trip.image_url && <img src={trip.image_url} alt={trip.trip_name} className={styles.tripCircleImage} />}
            </div>
            <div className={styles.tripName}>{trip.tripName}</div> 
          </div>
        ))}
      </div>

      {/* 과거 여행 */}
      <div className={styles.past}>
        {pastTrips.length > 0 ? (
          [...pastTrips]
            .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))  // 종료일 기준으로 최신순 정렬
            .map((trip, index) => (
              <div key={index} className={styles.pastTrip} onClick={() => toGallery(trip.id)}>
                {trip.image_url && <img src={trip.image_url} alt={trip.tripName} className={styles.tripImage} />}
                <div className={styles.pastTripContent}>
                  <div className={styles.location}>
                    {trip.tripName}
                  </div>
                  <div className={styles.dateLength}>
                    {dayDifference(trip.startDate, trip.endDate) - 1}박 {dayDifference(trip.startDate, trip.endDate)}일
                  </div>
                  <div className={styles.date}>시작일 : {trip.startDate}</div>
                  <div className={styles.date}>종료일 : {trip.endDate}</div>
                </div>
                <IconButton className={styles.sketchBtn} onClick={(event) => openModal(event, trip.id, trip.imageUrl)}>
                  <AddPhotoAlternateIcon />
                </IconButton>
              </div>
            ))
        ) : (
          <div className={styles.noPastTrips}>과거 여행 기록이 없습니다.</div>
        )}
      </div>

      <SketchModal isOpen={isSketchOpen} onClose={closeModal} tripId={sketchTripId} imageUrl={sketchImageUrl} onSave={handleTripDataUpdate} />
    </div>
  );
};

export default TripPage;
