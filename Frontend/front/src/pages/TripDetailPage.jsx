import { React, useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { eachDayOfInterval, format, isSameDay } from "date-fns";
import { MdArrowBack } from 'react-icons/md';
import SearchIcon from '@mui/icons-material/Search';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import styles from '@/styles/TripDetailPage.module.css';
import Payment from "@/components/Payment";
import TripInfoModal from '@/components/TripInfoModal';
import LoadingPage from '@/pages/LoadingPage';

import { useTripStore } from '@/stores/tripStore';
import { usePaymentStore } from '@/stores/paymentStore';
import { useUserStore } from "@/stores/userStore";

const TripDetailPage = () => {
  const userInfo = useUserStore((state) => state.userInfo);
  const fetchTripDetail = useTripStore((state) => state.fetchTripDetail);
  const setTripDetailInfo = useTripStore((state) => state.setTripDetailInfo);
  const tripDetailInfo = useTripStore((state) => state.tripDetailInfo);
  const setUserBudget = useUserStore((state) => state.setUserBudget);
  const fetchPayments = usePaymentStore((state) => state.fetchPayments);
  const setPayments = usePaymentStore((state) => state.setPayments);
  const setFinalPayments = usePaymentStore((state) => state.setFinalPayments);
  
  const [loading, setLoading] = useState(true);
  const { tripId } = useParams();
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState('all');
  const [isTripInfoOpen, setisTripInfoOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [tripDetailData, paymentsData] = await Promise.all([
        fetchTripDetail(tripId),
        fetchPayments(tripId),
      ]);
      
      setUserBudget(paymentsData);
      const updatedPaymentsData = paymentsData.payments_list.map(payment => {
        const bills = tripDetailData.members.map(member => ({
          cost: 0,
          bank_account: member.bank_account,
        }));

        return {
          ...payment,
          bills,
          checked: false,
        };
      });

      setTripDetailInfo(tripId, tripDetailData);
      setPayments(updatedPaymentsData);
      setFinalPayments(tripId);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tripId]);

  const goBack = () => {
    navigate('/trip');
  }

  const clickDate = (date) => {
    setSelectedDate(date);
  }

  const openTripInfoModal = () => {
    setisTripInfoOpen(true);
  }

  const closeTripInfoModal = () => {
    setisTripInfoOpen(false);
  }

  if (loading) {
    return <LoadingPage />;
  }

  const tripDays = eachDayOfInterval({
    start: new Date(tripDetailInfo.startDate),
    end: new Date(tripDetailInfo.endDate),
  });

  return (
    <div className={styles.container}>
      {/* 뒤로가기 */}
      <div className={styles.header}>
        <div className={styles.back}>
          <MdArrowBack className={styles.btns} size={30} onClick={goBack} />
        </div>
        <div className={styles.search}>
          <SearchIcon 
            className={styles.searchIcon} 
            onClick={openTripInfoModal} 
            style={{ fontSize: 30 }}
          />
        </div>
      </div>

      {/* 여행 상세 정보 모달 */}
      <TripInfoModal isOpen={isTripInfoOpen} onClose={closeTripInfoModal} refreshData={fetchData} />

      {/* 프로필 */}
      <div className={styles.profile}>
        <div>{userInfo.profileImage && <img src={userInfo.profileImage} alt={userInfo.nickName} className={styles.circleImage} />}</div>
        <div className={styles.profileStatus}>
          {userInfo.nickName} 님은<br /><div className={styles.tripName}>{tripDetailInfo.tripName}</div> 여행 중 &nbsp;
        </div>
      </div>

      {/* 여행 일자 */}
      <div className={styles.pickContainer}>
        <div className={styles.all} onClick={() => clickDate('all')}>
          <div className={styles.upper}>&nbsp;</div>
          <div className={`${styles.middle} ${selectedDate === 'all' ? styles.pickCircle : ''}`}>A</div>
          <div className={styles.bottom}>ALL</div>
        </div>
        <div className={styles.prepare} onClick={() => clickDate('prepare')}>
          <div className={styles.upper}>&nbsp;</div>
          <div className={`${styles.middle} ${selectedDate === 'prepare' ? styles.pickCircle : ''}`}>P</div>
          <div className={styles.bottom}>준비</div>
        </div>

        {/* 날짜 스크롤 */}
        <div className={styles.dayScroll}>
          {tripDays.map((date, index) => (
            <div className={styles.dayContainer} key={index} onClick={() => clickDate(date)}>
              <div className={styles.upper}>{format(date, "EEE")}</div>
              <div className={`${styles.middle} ${isSameDay(selectedDate, date) ? styles.pickCircle : ''}`}>
                {format(date, "d")}
              </div>
              <div className={styles.bottom}>{format(date, "M")}월</div>
            </div>
          ))}
        </div>
      </div>

      {/* 결제 내역 */}
      <div className={styles.payment}>
        <Payment selectedDate={selectedDate} />
      </div>
    </div>
  );
};

export default TripDetailPage;
