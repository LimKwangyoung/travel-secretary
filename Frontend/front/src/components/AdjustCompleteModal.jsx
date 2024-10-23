import { React, useState, useEffect } from 'react';
import { Modal, Box, Typography, Backdrop, Fade, TextField } from '@mui/material';
import { useTripStore } from '@/stores/tripStore';
import CloseIcon from '@mui/icons-material/Close';
import { usePaymentStore } from '@/stores/paymentStore';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import styles from "./styles/OngoingModal.module.css";

import FlightIcon from "@mui/icons-material/Flight";
import HotelIcon from "@mui/icons-material/Hotel";
import AttractionsIcon from "@mui/icons-material/Attractions";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import CafeIcon from "@mui/icons-material/LocalCafe";
import EtcIcon from "@mui/icons-material/MoreHoriz";

const AdjustCompleteModal = ({ isOpen, onClose, resultPayments, paymentId }) => {
  const tripDetailInfo = useTripStore((state) => state.tripDetailInfo);
  const getPartPayment = usePaymentStore((state) => state.getPartPayment);

  const [resultPayment, setResultPayment] = useState(null);
  const [partPayment, setPartPayment] = useState(null);

  // paymentId에 따른 정산 결과 내역
  useEffect(() => {
    if (isOpen) {
      setResultPayment(resultPayments.find((payment) => payment.payment_id === paymentId));
      setPartPayment(getPartPayment(paymentId));
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      console.log(resultPayment)
    }
  }, [isOpen, resultPayment])

  useEffect(() => {
    if (isOpen) {
      console.log(partPayment)
    }
  }, [isOpen, partPayment])

  // userId에 따른 이름 반환
  const matchUserName = (userId) => {
    const matchMember = tripDetailInfo.members.find((member) => member.id == userId);
    return matchMember ? `${matchMember.last_name}${matchMember.first_name}` : '';
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
        <div
          className={styles.box}
          onClick={(e) => e.stopPropagation()} // Modal 내부 클릭 시 이벤트 전파 방지
        >
          <CloseIcon
            className={styles.closeBtn}
            fontSize="large"
            onClick={onClose}
          />

          {/* 결제 상세 내역 */}
          <div className={styles.allContent}>
            {partPayment && (
              <div className={styles.content}>
                <div className={styles.category}>
                  {categoryIcons[partPayment.category]}
                </div>
                <div className={styles.brandName}>{partPayment.brand_name}</div>
                <div className={styles.payRecord}>
                  <div className={styles.payDate}>
                    {formatPayDate(partPayment.pay_date)}
                  </div>
                  <div className={styles.payTime}>{partPayment.pay_time}</div>
                </div>
              </div>
            )}

            {/* 멤버별 정산 내역 */}
            <div className={styles.memberList}>
              {resultPayment && resultPayment.bills.map((bill, index) => (
                <div className={styles.member} key={index}>
                  <div className={styles.memberName} style={{
                    color: bill && bill.remain_cost > 0 ? 'crimson' : 'black',
                  }}>
                    {matchUserName(bill.user_id)}
                  </div>
                  <TextField
                    disabled
                    variant="outlined"
                    defaultValue={bill.cost}
                    className={styles.customTextField}
                    InputProps={{
                      style: {
                        height: "40px", // 원하는 높이로 조정
                        width: "120px", // 원하는 너비로 조정
                      },
                    }}
                    inputProps={{
                      style: {
                        backgroundColor: "lightgrey",
                        padding: "8px",
                        borderRadius: "5px",
                        textAlign: "right", // 텍스트를 오른쪽 정렬
                      },
                    }}
                  />
                </div>
              ))}
            </div>
            {/* {bill.remain_cost !== 0 && <WarningAmberIcon sx={{ color: 'orange' }} />} */}
            <div className={styles.alertContainer}>
              {resultPayment && !resultPayment.bills.every((calculate) => calculate.remain_cost === 0) && (
                <>
                  <WarningAmberIcon sx={{ color: 'crimson' }} />&nbsp;미정산 알림&nbsp;<WarningAmberIcon sx={{ color: 'crimson' }} />
                  <div className={styles.alert}>
                    {resultPayment.bills
                      .filter((calculate) => calculate.remain_cost !== 0).map((calculate) => {
                        const member = tripDetailInfo.members.find((member) => member.id === calculate.user_id);
                        return (
                          <div className={styles.alertUser} key={calculate.user_id}>
                            <span style={{ 'color': 'crimson' }}>{member.last_name}{member.first_name}</span>
                            님이 &nbsp;
                            <span style={{ 'color': 'crimson' }}>{calculate.remain_cost}원</span>
                            &nbsp;정산에 실패했습니다.
                          </div>
                        );
                      })}
                  </div>
                </>
              )}
            </div>


          </div>
        </div>
      </Fade>
    </Modal>
  )
}

export default AdjustCompleteModal;