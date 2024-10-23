import { React, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PaymentDeleteModal from "./PaymentDeleteModal";
import {
  Modal,
  Box,
  Typography,
  Backdrop,
  Fade,
  TextField,
  Button
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axiosInstance from '@/axios.js'
import { useUserStore } from '@/stores/userStore';
import { useTripStore } from '@/stores/tripStore';
import { usePaymentStore } from '@/stores/paymentStore';
import { useErrorStore } from '../stores/errorStore'; // Error Store 가져오기
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { ButtonGroup } from '@mui/material';
import styles from "./styles/OngoingModal.module.css";

import FlightIcon from "@mui/icons-material/Flight";
import HotelIcon from "@mui/icons-material/Hotel";
import AttractionsIcon from "@mui/icons-material/Attractions";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import CafeIcon from "@mui/icons-material/LocalCafe";
import EtcIcon from "@mui/icons-material/MoreHoriz";

const OngoingModal = ({ isOpen, onClose, paymentId, isCompleted }) => {
  const userInfo = useUserStore((state) => state.userInfo);

  const tripDetailInfo = useTripStore((state) => state.tripDetailInfo);

  // 결제 내역 상세 정보
  const [partPayment, setPartPayment] = useState({});
  const getPartPayment = usePaymentStore((state) => state.getPartPayment);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const payments = usePaymentStore((state) => state.payments);
  const setPayments = usePaymentStore((state) => state.setPayments);

  // 고정된 멤버들의 bank_account를 저장하는 배열
  const [fixedMembers, setFixedMembers] = useState([]);

  const handleDeletePayment = async () => {
    try {
      await axiosInstance.post(`/payments/delete/`, { payment_id: paymentId });
      setPayments(payments.filter(payment => payment.id !== paymentId));  // 삭제된 결제 내역을 로컬에서 제거
      setShowDeleteModal(false);
      onClose();  // 모달 닫기
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  // 삭제 확인 모달 열기
  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  // 삭제 확인 모달 닫기
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  useEffect(() => {
    if (isOpen) {
      setPartPayment(getPartPayment(paymentId));
    }
  }, [isOpen, paymentId, getPartPayment]);


  useEffect(() => {
    if (isOpen && isCompleted && Array.isArray(partPayment.calculates) && partPayment.calculates.length > 0) {
      setPartPayment((prev) => ({
        ...prev,
        bills: partPayment.calculates.map((calculate) => ({
          cost: calculate.cost,
          bank_account: tripDetailInfo.members.find((member) => member.id === calculate.user_id)?.bank_account || '',
        })),
      }));
    }
  }, [isOpen, isCompleted, partPayment.calculates, tripDetailInfo.members]);


  // 여행 멤버 수만큼 나누어 저장
  useEffect(() => {
    if (isOpen && !isCompleted) {
      const currentPayment = payments.find(payment => payment.id === paymentId);
      if (currentPayment && currentPayment.bills.every(bill => bill.cost === 0)) {
        if (partPayment.amount && typeof partPayment.amount === 'number' && tripDetailInfo.members.length > 0) {
          const baseCost = Math.floor(partPayment.amount / tripDetailInfo.members.length);
          const totalCost = baseCost * tripDetailInfo.members.length;

          setPartPayment((prev) => ({
            ...prev,
            bills: tripDetailInfo.members.map((member, index) => ({
              cost: index === 0 ? baseCost + partPayment.amount - totalCost : baseCost,
              bank_account: member.bank_account,
            })),
          }));
        }
      }
    }
  }, [isOpen, isCompleted, payments, paymentId, partPayment.amount, tripDetailInfo.members]);


  // useEffect(() => {
  //   console.log(partPayment)
  // }, [partPayment])

  // 여행 멤버별 정산 금액 매칭
  const matchBankAccount = (bankAccount, userId) => {
    let cost = 0;

    if (!isCompleted) {
      const targetBill = (partPayment.bills || []).find(
        (bill) => bill.bank_account === bankAccount
      );
      cost = targetBill ? targetBill.cost : 0;
    } else {
      const targetBill = (partPayment.calculates || []).find(
        (calculate) => calculate.user_id === userId
      );
      cost = targetBill ? targetBill.cost : 0;
    }

    return isNaN(cost) ? 0 : cost; // NaN 방지
  };



  // 여행 멤버별 정산 금액 조정
  const handleCostChange = (bankAccount, inputCost) => {
    const fixedCost = inputCost === '' ? 0 : parseInt(inputCost);
    if (isNaN(fixedCost)) {
      return;
    }

    // 현재 수정된 bank_account가 fixedMembers에 없으면 추가
    if (!fixedMembers.includes(bankAccount)) {
      setFixedMembers((prev) => [...prev, bankAccount]);
    }

    // 특정 멤버의 cost만 업데이트
    setPartPayment((prevPayment) => {
      const updatedBills = prevPayment.bills.map((bill) => {
        if (bill.bank_account === bankAccount) {
          return { ...bill, cost: fixedCost }; // 수정된 멤버의 cost만 업데이트
        }
        return bill; // 나머지는 그대로 유지
      });

      return { ...prevPayment, bills: updatedBills };
    });
  };
  // const handleCostChange = (bankAccount, inputCost) => {
  //   const fixedCost = inputCost === '' ? 0 : parseInt(inputCost);
  //   if (isNaN(fixedCost)) {
  //     return;
  //   }

  //   // 현재 수정된 bank_account가 fixedMembers에 없으면 추가
  //   if (!fixedMembers.includes(bankAccount)) {
  //     setFixedMembers((prev) => [...prev, bankAccount]);
  //   }

  //   // 고정되지 않은 멤버들을 필터링
  //   const remainingMembers = partPayment.bills.filter(
  //     (bill) => !fixedMembers.includes(bill.bank_account) && bill.bank_account !== bankAccount
  //   );

  //   let remainingCost;
  //   const fixedTotal = partPayment.bills
  //     .filter((bill) => fixedMembers.includes(bill.bank_account))
  //     .reduce((acc, member) => acc + member.cost, 0);

  //   if (partPayment.calculates.length === 0) {
  //     remainingCost = partPayment.amount - fixedCost - fixedTotal;
  //   } else {
  //     remainingCost = partPayment.calculates.reduce((acc, calculate) => acc + calculate.remain_cost, 0) - fixedCost - fixedTotal;
  //   }

  //   const evenCost = Math.floor(remainingCost / remainingMembers.length);
  //   const remainder = remainingCost % remainingMembers.length; // 1원 차이

  //   setPartPayment((prevPayment) => {
  //     const updatedBills = prevPayment.bills.map((bill, index) => {
  //       if (bill.bank_account === bankAccount) {
  //         // 입력된 금액을 조정 중인 사람의 cost 업데이트
  //         return { ...bill, cost: fixedCost };
  //       } else if (!fixedMembers.includes(bill.bank_account)) {
  //         // 첫 번째 엔빵 대상자가 수정한 사람일 경우, 그 다음 사람에게 1원 차액 할당
  //         const isFirstMember = index === 0 && remainingMembers[0].bank_account === bankAccount;
  //         const isSecondMember = index === 1 && remainingMembers[1]?.bank_account !== bankAccount;
  //         return {
  //           ...bill,
  //           cost: evenCost + ((isFirstMember || isSecondMember) ? remainder : 0), // 첫 번째 사람 또는 그 다음 사람에게 1원 차액 할당
  //         };
  //       } else {
  //         // 고정된 멤버는 기존 cost 유지
  //         return bill;
  //       }
  //     });

  //     return { ...prevPayment, bills: updatedBills };
  //   });
  // };

  // userId에 따른 이름 반환
  const matchUserName = () => {
    const matchMember = tripDetailInfo.members.find(
      (member) => Number(member.id) === Number(partPayment.user_id)
    );
    return matchMember
      ? `${matchMember.last_name}${matchMember.first_name}`
      : "";
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

  // 모달 창이 닫힐 때 payments에 저장하기
  // if (partPayment.bills.reduce((acc, bill) => acc + bill.cost, 0) === partPayment.amount)
  // useEffect(() => {
  //   if (!isOpen && partPayment.bills) {
  //     if (partPayment.bills.reduce((acc, bill) => acc + bill.cost, 0) !== partPayment.amount) {
  //       return
  //     }

  //     setPayments(
  //       payments.map((payment) =>
  //         payment.id === partPayment.id ? partPayment : payment
  //       )
  //     );
  //     setFixedMembers([]);
  //   }
  // }, [isOpen]);

  const { setError } = useErrorStore(); // 에러 메시지 설정 함수 가져오기
  const applyAdjust = () => {
    if (partPayment.bills.reduce((acc, bill) => acc + bill.cost, 0) !== partPayment.amount) {
      onClose();
      setError('정산 금액이 맞지 않습니다.');
      return
    }

    setPayments(
      payments.map((payment) =>
        payment.id === partPayment.id ? partPayment : payment
      )
    );
    setFixedMembers([]);
    onClose()
  }

  if (!isOpen) return null;

  // 결제 당사자가 아닐 경우
  if (userInfo.id != partPayment.user_id) {
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
          <div className={styles.box}>
            {/* <CloseIcon
              className={styles.closeBtn}
              fontSize="large"
              onClick={onClose}
            /> */}
            <div className={styles.totalAmount}>
              {(partPayment.amount !== undefined && partPayment.amount !== null)
                ? partPayment.amount.toLocaleString()
                : '0'}&nbsp;원
            </div>


            {/* 정산 체크한 결제 내역 */}
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

            {/* 정산 멤버 */}
            <div className={styles.memberList}>
              {partPayment.calculates && partPayment.calculates.length > 0 &&
                <>
                  {tripDetailInfo.members.map((member, index) => (
                    <div className={styles.member} key={index}>
                      <div className={styles.memberName} style={{
                        color: partPayment.calculates.length &&
                          partPayment.calculates.find((calculate) => calculate.user_id == member.id).remain_cost > 0 ? 'crimson' : 'black',
                      }}>
                        {/* {partPayment.calculates.length &&
                          partPayment.calculates.find((calculate) => calculate.user_id == member.id).remain_cost > 0 &&
                          <WarningAmberIcon sx={{ color: 'orange' }} />} */}
                        {member.last_name}
                        {member.first_name}
                      </div>
                      <TextField
                        disabled
                        variant="outlined"
                        value={isNaN(matchBankAccount(member.bank_account, member.id)) ? '' : matchBankAccount(member.bank_account, member.id)}
                        onChange={(e) => handleCostChange(member.bank_account, e.target.value)}
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
                      <div className={styles.won}>
                        &nbsp; 원
                      </div>
                    </div>
                  ))}
                </>
              }
            </div>


            {<div className={styles.memberAlert}>
              결제 당사자 <div className={styles.payMember}>{matchUserName()}</div>님만<br />{isCompleted ? '수정' : '정산'}할 수 있어요
            </div>
            }

            <div className={styles.alertContainer}>
              {partPayment.calculates && !partPayment.calculates.every((calculate) => calculate.remain_cost === 0) && (
                <>
                  <WarningAmberIcon sx={{ color: 'crimson' }} />&nbsp;미정산 알림&nbsp;<WarningAmberIcon sx={{ color: 'crimson' }} />
                  <div className={styles.alert}>
                    {partPayment.calculates
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
        </Fade>
      </Modal>
    )
  }

  // 결제 당사자일 경우
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
        <div className={styles.box}>
          {/* <CloseIcon
            className={styles.closeBtn}
            fontSize="large"
            onClick={onClose}
          /> */}
          <div className={styles.totalAmount}>
            {(partPayment.amount !== undefined && partPayment.amount !== null)
              ? partPayment.amount.toLocaleString()
              : '0'}&nbsp;원
          </div>


          {/* 정산 체크한 결제 내역 */}
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

          {/* 정산 멤버 */}
          <div className={styles.memberList}>
            {tripDetailInfo.members.map((member, index) => {
              const calculate = partPayment.calculates.find((calculate) => Number(calculate.user_id) === Number(member.id));
              return (
                <div className={styles.member} key={index}>
                  <div className={styles.memberName} style={{
                    color: calculate && calculate.remain_cost > 0 ? 'crimson' : 'black',
                  }}>
                    {member.last_name}
                    {member.first_name}
                  </div>
                  <TextField
                    // disabled={isCompleted === 1}
                    variant="outlined"
                    value={isNaN(matchBankAccount(member.bank_account, member.id)) ? '' : matchBankAccount(member.bank_account, member.id)}
                    onChange={(e) => handleCostChange(member.bank_account, e.target.value)}
                    className={styles.customTextField}
                    InputProps={{
                      style: {
                        height: "40px", // 원하는 높이로 조정
                        width: "120px", // 원하는 너비로 조정
                      },
                    }}
                    inputProps={{
                      style: {
                        backgroundColor: "gainsboro",
                        padding: "8px",
                        borderRadius: "5px",
                        textAlign: "right", // 텍스트를 오른쪽 정렬
                      },
                    }}
                  />
                  &nbsp; 원
                </div>
              );
            })}
          </div>

          <div className={styles.alertContainer}>
            {partPayment.calculates && !partPayment.calculates.every((calculate) => calculate.remain_cost === 0) && (
              <>
                <WarningAmberIcon sx={{ color: 'crimson' }} />&nbsp;미정산 알림&nbsp;<WarningAmberIcon sx={{ color: 'crimson' }} />
                <div className={styles.alert}>
                  {partPayment.calculates
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
          
          {!isCompleted && (
            <div className={styles.deleteButtonContainer}>
              <button
                onClick={applyAdjust}
                className={styles.okButton}  // className을 사용하여 스타일 적용
              >
                확인
              </button>
            
              <button
                onClick={openDeleteModal}
                className={styles.deleteButton}  // className을 사용하여 스타일 적용
              >
                삭제
              </button>
            
              <PaymentDeleteModal
                showDeleteModal={showDeleteModal}
                onConfirm={handleDeletePayment}  // 네 클릭 시 결제 삭제
                onCancel={closeDeleteModal}  // 닫기 클릭 시 삭제 모달 닫기
              />
            </div>
          
          )}
        </div>
      </Fade>
    </Modal >
  );
};

export default OngoingModal;
