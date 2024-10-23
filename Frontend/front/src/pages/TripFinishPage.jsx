import React, { useEffect, useState } from 'react';
import styles from '@/styles/TripFinishPage.module.css';
import checkImage from '@/assets/images/load/check.png';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import axiosInstance from '@/axios.js';
import { useUserStore } from '@/stores/userStore';
import { useTripStore } from '@/stores/tripStore';
import { usePaymentStore } from '@/stores/paymentStore';
import LoadingPage from '@/pages/LoadingPage'; // LoadingPage 컴포넌트 가져오기
import AdjustCompleteModal from '@/components/AdjustCompleteModal';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import successImg from "@/assets/images/load/check.png";

import FlightIcon from "@mui/icons-material/Flight";
import HotelIcon from "@mui/icons-material/Hotel";
import AttractionsIcon from "@mui/icons-material/Attractions";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import CafeIcon from "@mui/icons-material/LocalCafe";
import EtcIcon from "@mui/icons-material/MoreHoriz";

const TripFinishPage = () => {
  const userInfo = useUserStore((state) => state.userInfo);

  const getPartPayment = usePaymentStore((state) => state.getPartPayment);
  const finalPayments = usePaymentStore((state) => state.finalPayments);

  // 정산 결과
  const [resultPayments, setResultPayments] = useState([]);
  const [resultBudget, setResultBudget] = useState([]);
  const [resultBalance, setResultBalance] = useState('');

  // 총 정산 금액
  const [totalSuccessAmount, setTotalSuccessAmount] = useState(0);
  const [totalFailAmount, setTotalFailAmount] = useState(0);

  // 개인 정산 금액
  const [successAmount, setsuccessAmount] = useState(0);
  const [failAmount, setfailsAmount] = useState(0);

  // 선택한 상세 정산 내역 Id
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  // useEffect(() => {
  //   console.log('finalPayments', finalPayments);
  // }, [finalPayments])

  // useEffect(() => {
  //   console.log('getPartPayment', getPartPayment(1))
  // }, [getPartPayment(1)])

  // useEffect(() => {
  //   console.log('resultPayments', resultPayments)
  // }, [resultPayments])

  useEffect(() => {
    // 결제 정산 요청
    if (finalPayments.payments) {
      const sendAdjustment = async () => {
        try {
          const response = await axiosInstance.post('/payments/adjustment/', finalPayments);
          // console.log(response)
          setResultPayments(response.data.payments);
          setResultBudget(response.data.budget);
          setResultBalance(parseInt(response.data.balance));
        } catch (error) {
          console.log(error);
        }
      }
      sendAdjustment();
    };
  }, [finalPayments]);

  useEffect(() => {
    let totalSuccessCost = 0;
    let totalFailCost = 0;
    let successCost = 0;
    let failCost = 0;
    if (resultPayments) {
      resultPayments.forEach(payment => {
        payment.bills.forEach(bill => {
          totalSuccessCost += bill.cost - bill.remain_cost;
          totalFailCost += bill.remain_cost;
          if (bill.user_id == userInfo.id) {
            successCost += (bill.cost - bill.remain_cost);
            failCost += bill.remain_cost
          }
        });
      });
    }
    setTotalSuccessAmount(totalSuccessCost);
    setTotalFailAmount(totalFailCost);
    setsuccessAmount(successCost);
    setfailsAmount(failCost);
  }, [resultPayments])

  // paymentId에 따른 결제 내역의 정산 여부
  const isAdjusted = (paymentId) => {
    const resultPayment = resultPayments.find(payment => payment.payment_id === paymentId);
    return resultPayment.bills.every(bill => bill.is_complete) ? true : false;
  }

  // 카테고리별 아이콘 매핑
  const categoryIcons = {
    항공: <FlightIcon fontSize="large" />,
    숙소: <HotelIcon fontSize="large" />,
    관광: <AttractionsIcon fontSize="large" />,
    식비: <RestaurantIcon fontSize="large" />,
    쇼핑: <ShoppingBagIcon fontSize="large" />,
    교통: <DirectionsCarIcon fontSize="large" />,
    카페: <CafeIcon fontSize="large" />,
    기타: <EtcIcon fontSize="large" />,
  };

  // 날짜 포맷팅 함수
  const formatPayDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1; // 월은 0부터 시작하므로 +1
    const day = date.getDate();
    return `${month}월 ${day}일`;
  };

  // 정산 상세 정보 모달 창
  const [isAdjustCompleteOpen, setisAdjustCompleteOpen] = useState(false);

  const openisAdjustCompleteModal = (paymentId) => {
    setSelectedPaymentId(paymentId);
    setisAdjustCompleteOpen(true);
  };

  const closeisAdjustCompleteModal = () => {
    setisAdjustCompleteOpen(false);
  };

  const navigate = useNavigate();
  const goBack = () => {
    navigate(-1);
  }

  if (!totalSuccessAmount) return <LoadingPage />

  return (
    <div className={styles.container}>
      {/* 뒤로가기 */}
      <div className={styles.header}>
        <div className={styles.back}>
          <MdArrowBack className={styles.btns} size={30} onClick={goBack} />
        </div>
      </div>

      {/* 정산완료 */}
      <div className={styles.complete}>
        <div className={styles.completeImg}><img src={checkImage} alt="체크" /></div>
        <div className={styles.completeAmount}>{totalSuccessAmount.toLocaleString()} 원</div>
        <div className={styles.completeMsg}>정 산 완 료</div>

        {totalFailAmount > 0 && (
          <div className={styles.fail}>
            <WarningAmberIcon sx={{ color: 'crimson' }} />&nbsp;
            <span className={styles.failAmount}>{totalFailAmount.toLocaleString()} 원을 못받으셨어요</span>
          </div>
        )}
      </div>

      {/* 내 정보 */}
      <div className={styles.myData}>
        <div className={styles.myName}>{userInfo.nickName} 님의 여행 소비 정보</div>
        
        <div className={styles.expense}>
          <div>전체 지출</div>
          <div>{resultBudget.used_budget?.toLocaleString()} 원</div>
        </div>
        
        <div className={styles.expense}>
          <div>이번 지출</div>
          <div>{successAmount.toLocaleString()} 원</div>
        </div>
        
        <div className={styles.progress}>
          <div 
            className={styles.progressBar} 
            style={{ width: resultBudget.initial_budget > 0 
              ? `${Math.floor((resultBudget.used_budget / resultBudget.initial_budget) * 100)}%` 
              : '0%' }}
          >
            <span className={styles.percentage}>
              {resultBudget.initial_budget > 0 
                ? Math.floor((resultBudget.used_budget / resultBudget.initial_budget) * 100) + "%"
                : "0%"}
            </span>
          </div>
        </div>
        
        <div className={styles.balance}>
          <div>예산 잔고</div>
          <div>{resultBudget.remain_budget?.toLocaleString()} 원</div>
        </div>
        <div className={styles.balance}>
          <div>계좌 잔고</div>
          <div>{resultBalance.toLocaleString()} 원</div>
        </div>
        
      </div>

      {/* <p>{totalSuccessAmount} {totalFailAmount}</p>
      <p>{successAmount} {failAmount}</p>
      <p>초기 예산: {resultBudget.initial_budget} 원</p>
      <p>사용된 예산: {resultBudget.used_budget} 원</p>
      <p>남은 예산: {resultBudget.remain_budget} 원</p>
      잔고: {resultBalance} */}


      {/* 세부 내역 */}
      <div className={styles.allContent}>
        {resultPayments.map((payment) => (
          <div className={styles.content} key={payment.payment_id} onClick={() => openisAdjustCompleteModal(payment.payment_id)}>
            <div className={styles.category}>
              {categoryIcons[getPartPayment(payment.payment_id).category]}
            </div>
            <div className={styles.brandName}>{getPartPayment(payment.payment_id).brand_name}</div>
            <div className={styles.payRecord}>
              <div className={styles.payDate}>
                {formatPayDate(getPartPayment(payment.payment_id).pay_date)}
              </div>
              <div className={styles.payTime}>{getPartPayment(payment.payment_id).pay_time}</div>
            </div>
            <div className={styles.isAdjusted}>
              {isAdjusted(payment.payment_id)}
            </div>
          </div>
        ))}
      </div>

      <AdjustCompleteModal isOpen={isAdjustCompleteOpen} onClose={closeisAdjustCompleteModal} resultPayments={resultPayments} paymentId={selectedPaymentId} />
    </div>
  );
};

export default TripFinishPage;