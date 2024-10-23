import { React, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Modal,
  Box,
  Typography,
  Backdrop,
  Fade,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { useTripStore } from "@/stores/tripStore";
import { usePaymentStore } from "@/stores/paymentStore";
import { useErrorStore } from '../stores/errorStore'; // Error Store 가져오기

import axiosInstance from "@/axios.js";

import styles from "./styles/AdjustModal.module.css";

import FlightIcon from "@mui/icons-material/Flight";
import HotelIcon from "@mui/icons-material/Hotel";
import AttractionsIcon from "@mui/icons-material/Attractions";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import CafeIcon from "@mui/icons-material/LocalCafe";
import EtcIcon from "@mui/icons-material/MoreHoriz";

const AdjustModal = ({ isOpen, onClose, totalAmount }) => {
  const tripDetailInfo = useTripStore((state) => state.tripDetailInfo);

  const payments = usePaymentStore((state) => state.payments);
  const setPayments = usePaymentStore((state) => state.setPayments);

  const finalPayments = usePaymentStore((state) => state.finalPayments);
  const setFinalPayments = usePaymentStore((state) => state.setFinalPayments);
  const addFinalPayments = usePaymentStore((state) => state.addFinalPayments);
  const updateFinalPayments = usePaymentStore(
    (state) => state.updateFinalPayments
  );

  // 렌더링 되는 결제 내역 정보
  const [renderedInfo, setRenderedInfo] = useState([]);

  // 렌더링 되는 멤버별 정산 내역 정보
  const [renderedMemberInfo, setRenderedMemberInfo] = useState(
    tripDetailInfo.members.map((member) => {
      return {
        // member: member.member,
        bankAccount: member.bank_account,
        cost: 0,
      };
    })
  );

  // 결제 내역 정보 렌더링
  useEffect(() => {
    if (isOpen) {
      setRenderedInfo([]);

      payments.forEach((payment) => {
        if (payment.checked) {
          setRenderedInfo((prevInfo) => [
            ...prevInfo,
            {
              category: payment.category,
              brandName: payment.brand_name,
              payDate: payment.pay_date,
              payTime: payment.pay_time,
            },
          ]);
        }
      });
    }
  }, [payments, isOpen]);

  // 멤버별 정산 내역 정보 렌더링
  useEffect(() => {
    if (isOpen) {
      setRenderedMemberInfo(
        tripDetailInfo.members.map((member) => {
          return {
            bankAccount: member.bank_account,
            cost: 0,
          };
        })
      );

      finalPayments.payments.forEach((finalPayment) => {
        const updatedBills = payments.find(
          (payment) => payment.id === finalPayment.payment_id
        ).bills;

        // 체크 표시를 하고 세부 가격을 설정하지 않았을 경우
        if (updatedBills.every(bill => bill.cost === 0)) {
          // 첫 정산일 경우
          if (payments.find((payment) => payment.id === finalPayment.payment_id).calculates.length === 0) {
            const paymentAmount = payments.find((payment) => payment.id === finalPayment.payment_id).amount;
            const baseCost = parseInt(paymentAmount / updatedBills.length);
            const totalCost = baseCost * updatedBills.length;

            const newUpdatedBills = updatedBills.map((bill, index) => ({
              ...bill,
              cost: index === 0 ? baseCost + paymentAmount - totalCost : baseCost,
            }))

            updateFinalPayments(finalPayment.payment_id, newUpdatedBills)
            newUpdatedBills.forEach(bill => {
              renderedMemberInfo.find(member => member.bankAccount === bill.bank_account).cost += bill.cost;
            });
            // 첫 정산이 아닐 경우
          } else {
            const newUpdatedBills = updatedBills.map((bill) => ({
              ...bill,
              cost: payments.find((payment) => payment.id === finalPayment.payment_id).calculates.find((calculate) => calculate.user_id == tripDetailInfo.members.find((member) => member.bank_account == bill.bank_account).id).cost,
            }))
            updateFinalPayments(finalPayment.payment_id, newUpdatedBills)
            newUpdatedBills.forEach(bill => {
              renderedMemberInfo.find(member => member.bankAccount === bill.bank_account).cost += bill.cost;
            });
          }
          // 세부 가격을 설정했을 경우
        } else {
          updateFinalPayments(finalPayment.payment_id, updatedBills);
          updatedBills.forEach((bill) => {
            renderedMemberInfo.find(
              (member) => member.bankAccount === bill.bank_account
            ).cost += bill.cost;
          });
        }
      });
    }
  }, [isOpen]);

  // 여행 멤버별 정산 금액 매칭
  const matchBankAccount = (bankAccount) => {
    return renderedMemberInfo.find((info) => info.bankAccount === bankAccount)
      .cost.toLocaleString();
  };

  const { setError } = useErrorStore(); // 에러 메시지 설정 함수 가져오기

  const navigate = useNavigate();
  const { tripId } = useParams();

  const goFinish = () => {
    if (finalPayments.payments.length > 0) {
      navigate(`/finish/${tripId}`);
    } else {
      onClose();
      setError('정산 내역을 선택해주세요.');
    }
  };

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
    <>
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
          <div className={styles.box}>
            <CloseIcon
              className={styles.closeBtn}
              fontSize="large"
              onClick={onClose}
            />
            <div className={styles.totalAmount}>
              {(totalAmount !== undefined && totalAmount !== null)
                ? totalAmount.toLocaleString()
                : '0'}&nbsp;원
            </div>

            {/* 정산 체크한 결제 내역 */}
            <div className={styles.allContent}>
              {renderedInfo.map((data, index) => (
                <div className={styles.content} key={index}>
                  <div className={styles.category}>
                    {categoryIcons[data.category]}
                  </div>
                  <div className={styles.brandName}>{data.brandName}</div>
                  <div className={styles.payRecord}>
                    <div className={styles.payDate}>
                      {formatPayDate(data.payDate)}
                    </div>
                    <div className={styles.payTime}>{data.payTime}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* 정산 멤버 */}
            <div className={styles.memberList}>
              {tripDetailInfo.members.map((member, index) => (
                <div className={styles.member} key={index}>
                  <div className={styles.memberName}>
                    {member.last_name}
                    {member.first_name}
                  </div>
                  <TextField
                    disabled
                    variant="outlined"
                    defaultValue={matchBankAccount(member.bank_account)}
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
                  &nbsp; 원
                </div>
              ))}
            </div>

            <div className={styles.adjustContainer}>
              <button className={styles.adjustBtn} onClick={goFinish}>
                정 산 하 기
              </button>
            </div>

          </div>
        </Fade>
      </Modal>
    </>
  );
};

export default AdjustModal;
