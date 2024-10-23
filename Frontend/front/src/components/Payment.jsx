import { React, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import axiosInstance from '@/axios.js';
import { useMutation } from "react-query";
import { useTripStore } from "@/stores/tripStore";
import { useUserStore } from "@/stores/userStore";
import { usePaymentStore } from "@/stores/paymentStore";
import styles from "./styles/Payment.module.css";
import OngoingModal from "@/components/OngoingModal";
import AdjustModal from "@/components/AdjustModal";
import Checkbox from "@mui/material/Checkbox";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FlightIcon from "@mui/icons-material/Flight";
import HotelIcon from "@mui/icons-material/Hotel";
import AttractionsIcon from "@mui/icons-material/Attractions";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import CafeIcon from "@mui/icons-material/LocalCafe";
import EtcIcon from "@mui/icons-material/MoreHoriz";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { blue } from "@mui/material/colors";
import PaymentModal from './PaymentModal';

const Payment = ({ selectedDate }) => {
  const userInfo = useUserStore((state) => state.userInfo);
  const tripDetailInfo = useTripStore((state) => state.tripDetailInfo);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const payments = usePaymentStore((state) => state.payments);
  const setPayments = usePaymentStore((state) => state.setPayments);
  const fetchPayments = usePaymentStore((state) => state.fetchPayments);  // fetchPayments 함수

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const addFinalPayments = usePaymentStore((state) => state.addFinalPayments);
  const removeFinalPayments = usePaymentStore((state) => state.removeFinalPayments);

  const { tripId } = useParams(); // tripId 가져오기

  // 사전 결제내역 POST 요청
  const { mutate: mutatePrepare } = useMutation(
    (newPayment) => axiosInstance.post('/payments/prepare/', newPayment),
    {
      onSuccess: () => {
        // 결제 내역이 추가된 후 결제 목록을 다시 가져옴
        fetchPayments(tripId);
      },
    }
  );

  // 현금 결제내역 POST 요청
  const { mutate: mutateCash } = useMutation(
    (newCashPayment) => axiosInstance.post('/payments/', newCashPayment),
    {
      onSuccess: () => {
        // 결제 내역이 추가된 후 결제 목록을 다시 가져옴
        fetchPayments(tripId);
      },
    }
  );

  const handleAddPreparePayment = (newPayment) => {
    mutatePrepare(newPayment);
  };

  // 현금 결제 내역 추가
  const handleAddCashPayment = (newCashPayment) => {
    mutateCash(newCashPayment);
  };

  // 정산 여부 판단
  const [isCompleted, setIsCompleted] = useState(0);

  // 선택한 상세 결제 내역 Id
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  // 최종 정산 금액
  const [totalAmount, setTotalAmount] = useState(0);

  // 결제내역 상세 정보 모달 창
  const [isOngoingOpen, setisOngoingOpen] = useState(false);

  // 체크한 결제내역 정산 모달 창
  const [isAdjustOpen, setisAdjustOpen] = useState(false);

  const openOngoingModal = (paymentId) => {
    setSelectedPaymentId(paymentId);
    setisOngoingOpen(true);
  };

  const closeOngoingModal = () => {
    setisOngoingOpen(false);
  };

  const openAdjustModal = () => {
    setisAdjustOpen(true);
  };

  const closeAdjustModal = () => {
    setisAdjustOpen(false);
  };

  // 카테고리별 아이콘 매핑
  const categoryIcons = {
    항공: (
      <FlightIcon
        fontSize="large"
        sx={{ color: isCompleted === 1 ? "gray" : "black" }}
      />
    ),
    숙소: (
      <HotelIcon
        fontSize="large"
        sx={{ color: isCompleted === 1 ? "gray" : "black" }}
      />
    ),
    관광: (
      <AttractionsIcon
        fontSize="large"
        sx={{ color: isCompleted === 1 ? "gray" : "black" }}
      />
    ),
    식비: (
      <RestaurantIcon
        fontSize="large"
        sx={{ color: isCompleted === 1 ? "gray" : "black" }}
      />
    ),
    쇼핑: (
      <ShoppingBagIcon
        fontSize="large"
        sx={{ color: isCompleted === 1 ? "gray" : "black" }}
      />
    ),
    교통: (
      <DirectionsCarIcon
        fontSize="large"
        sx={{ color: isCompleted === 1 ? "gray" : "black" }}
      />
    ),
    카페: (
      <CafeIcon
        fontSize="large"
        sx={{ color: isCompleted === 1 ? "gray" : "black" }}
      />
    ),
    기타: (
      <EtcIcon
        fontSize="large"
        sx={{ color: isCompleted === 1 ? "gray" : "black" }}
      />
    ),
  };

  // 필터링된 결제 항목
  const filteredPayments = (payments || [])
    .filter((payment) => {
      const tripStartDateMidnight = new Date(tripDetailInfo.startDate);
      tripStartDateMidnight.setHours(0, 0, 0, 0); // 여행 시작일의 자정을 기준으로 설정

      // console.log(tripStartDateMidnight)

      if (selectedDate === "all") {
        return true;
      } else if (selectedDate === "prepare") {
        return new Date(`${payment.pay_date}T${payment.pay_time}`).getTime() == new Date(tripStartDateMidnight).getTime();
      } else {
        return (
          new Date(`${payment.pay_date}T${payment.pay_time}`).getTime() !== new Date(tripStartDateMidnight).getTime() && new Date(payment.pay_date).toDateString() === new Date(selectedDate).toDateString()
        );
      }
    })
    .filter((payment) => payment.is_completed === isCompleted);

  // 결제 항목을 날짜별로 그룹화하면서 날짜 순서대로 정렬
  const groupPaymentsByDate = (paymentsInfo) => {
    const grouped = paymentsInfo.reduce((acc, paymentInfo) => {
      const date = paymentInfo.pay_date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(paymentInfo);
      return acc;
    }, {});

    // 날짜를 기준으로 그룹화된 객체의 키를 정렬
    const sortedKeys = Object.keys(grouped).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    return sortedKeys.reduce((sortedAcc, date) => {
      sortedAcc[date] = grouped[date];
      return sortedAcc;
    }, {});
  };

  // 날짜별로 그룹화된 결제 항목
  const groupedPayments = groupPaymentsByDate(filteredPayments);

  // 정산 내역 체크
  const handleCheck = (paymentId, amount) => {
    const updatedPaymentsData = payments.map((payment) => {
      if (payment.id === paymentId) {
        const checked = !payment.checked;
        if (checked) {
          setTotalAmount((prev) => prev + amount);
          addFinalPayments(paymentId);
        } else {
          setTotalAmount((prev) => prev - amount);
          removeFinalPayments(paymentId);
        }
        return { ...payment, checked };
      }
      return payment;
    });

    setPayments(updatedPaymentsData);
  };

  return (
    <div className={styles.container}>
      {/* 탭 버튼 */}
      <div className={styles.tabContainer} style={{ position: 'relative' }}>
        <button
          className={`${styles.tab} ${isCompleted === 0 ? styles.active : ""}`}
          onClick={() => setIsCompleted(0)}
        >
          미정산
        </button>
        <button
          className={`${styles.tab} ${isCompleted === 1 ? styles.active : ""}`}
          onClick={() => setIsCompleted(1)}
        >
          정산 완료
        </button>
      </div>

      {/* 결제 내역 */}
      <div className={styles.payContainer}>
        <div className={styles.payAdd} onClick={openModal}>
          <div>
            결제 내역 추가하기
          </div>
          <IconButton
            className={styles.addButton}
            sx={{
              borderRadius: "30px",
              padding: 0,
              backgroundColor: 'grey',
              color: 'white', // 아이콘 색상을 흰색으로 설정
            }}
          >
            <AddIcon />
          </IconButton>
        </div>
          <PaymentModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onSubmitPrepare={handleAddPreparePayment}  // 여행 전 결제 내역 처리
            onSubmitCash={handleAddCashPayment}  // 현금 결제 내역 처리
            tripDetailInfo={tripDetailInfo}
          />
        {Object.keys(groupedPayments).map((date) => (
          <div key={date} className={styles.dateGroup}>
            {/* 날짜 표시 */}
            <div className={styles.dateHeader}>
              {format(new Date(date), "MM월 dd일 (E)", { locale: ko })}{" "}
              {/* 'EEEE'로 요일을 한글로 표시 */}
            </div>

            {groupedPayments[date].map((payment) => (
              <div key={payment.id} className={styles.payContent}>
                <div
                  className={styles.pay}
                  onClick={() => openOngoingModal(payment.id)}
                >
                  <div className={styles.categoryArea}>
                    {categoryIcons[payment.category] || (
                      <span>{payment.category}</span>
                    )}
                  </div>
                  <div className={styles.costArea}>
                    <div
                      className={`${styles.amount} ${isCompleted === 1 ? styles.completed : ""
                        }`} // isCompleted가 1이면 completed 클래스 추가
                    >
                      {payment.amount.toLocaleString()} {!payment.is_completed && payment.calculates.length > 0 && (<WarningAmberIcon sx={{ color: 'orange' }} />)}
                    </div>
                    <div className={styles.brandName}>{payment.brand_name}</div>
                  </div>
                </div>

                {/* 미정산 상태에서만 checkArea 표시 */}
                <div className={styles.checkArea}>
                  {payment.user_id == userInfo.id && (
                    <Checkbox
                      checked={payment.is_completed == 1 ? true : payment.checked}
                      disabled={!!payment.is_completed}
                      onChange={() => handleCheck(payment.id, payment.amount)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className={styles.adjustContainer}>
        <button className={styles.adjustBtn} onClick={openAdjustModal}>
          {totalAmount.toLocaleString()}원 &nbsp; 정산하기
        </button>
      </div>

      {/* 결제내역 상세 정보 모달 창 */}
      <OngoingModal
        isOpen={isOngoingOpen}
        onClose={closeOngoingModal}
        paymentId={selectedPaymentId}
        isCompleted={isCompleted}
      />

      {/* 결제내역 상세 정보 모달 창 */}
      <AdjustModal
        isOpen={isAdjustOpen}
        onClose={closeAdjustModal}
        totalAmount={totalAmount}
      />
    </div>
  );
};

export default Payment;
