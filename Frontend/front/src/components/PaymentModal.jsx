import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton'; 
import CloseIcon from '@mui/icons-material/Close'; 
import { useMutation, useQueryClient } from 'react-query'; // react-query 추가
import axiosInstance from '@/axios'; // axiosInstance import
import { usePaymentStore } from '@/stores/paymentStore'; // paymentStore import
import { useTripStore } from '@/stores/tripStore'; // tripStore import
import styles from "./styles/PaymentModal.module.css";
import { useUserStore } from '@/stores/userStore'

const PaymentModal = ({ isOpen, onClose, tripDetailInfo }) => {
  const { tripId } = useParams();
  const userAccount = useUserStore((state) => state.userAccount);
  const setPayments = usePaymentStore((state) => state.setPayments); // paymentStore의 setPayments 함수

  const [amount, setAmount] = useState('');
  const [brandName, setBrandName] = useState('');
  const [payDate, setPayDate] = useState('');
  const [payTime, setPayTime] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const queryClient = useQueryClient(); // react-query queryClient

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    if (isOpen) {
      // 오늘 날짜를 yyyy-MM-dd 형식으로 설정
      const today = new Date().toISOString().split('T')[0];
      // 현재 시간을 HH:mm 형식으로 설정
      const now = new Date().toLocaleTimeString('it-IT').slice(0, 5);

      setPayDate(today);
      setPayTime(now);
    }
  }, [isOpen]);


  // 결제 내역 POST 요청 (prepare, cash 결제 구분)
  const { mutate: addPayment } = useMutation(
    (newPayment) => {
      const endpoint = tabIndex === 0 ? '/payments/prepare/' : '/payments/';
      return axiosInstance.post(endpoint, newPayment);
    },
    {
      onSuccess: async () => {
        // 결제 성공 후, 결제 목록을 다시 가져옴
        const response = await axiosInstance.get('/payments/list/', {
          params: { trip_id: tripId },
        });

        const paymentsData = response.data;

        // 결제 내역 갱신
        const updatedPaymentsData = paymentsData.payments_list.map(payment => {
          const bills = tripDetailInfo.members.map(member => ({
            cost: 0,
            bank_account: member.bank_account,
          }));

          return {
            ...payment,
            bills,
            checked: false,
          };
        });

        setPayments(updatedPaymentsData); // paymentStore에 결제 내역 업데이트
      },
      onError: (error) => {
        console.error('결제 내역 추가 오류:', error);
      }
    }
  );

  // 결제 내역 추가 핸들러
  const handleSubmit = () => {
    const newPayment = {
      trip_id: Number(tripId),
      amount: Number(amount),
      brand_name: brandName,
      bank_account: userAccount.bankAccount,
      pay_date: payDate,
      pay_time: payTime,
    };

    // 결제 요청 보내기
    addPayment(newPayment);
    onClose(); // 모달 닫기
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box className={styles.box}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
          }}
        >
          <CloseIcon />
        </IconButton>

        <div className={styles.title}>결제 내역 추가</div>
        
        <div className={styles.content}>
          <Tabs value={tabIndex} onChange={handleTabChange} aria-label="payment type tabs">
            <Tab label="사전 결제" sx={{
      fontFamily: '"Spoqa Han Sans Neo", sans-serif !important'
    }} />
            <Tab className={styles.fontChange} label="현금 결제" sx={{
      fontFamily: '"Spoqa Han Sans Neo", sans-serif !important'
    }} />
          </Tabs>

          {tabIndex === 0 && (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="내용"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                sx={{
                  "& .MuiInputBase-input": {
                    fontFamily: '"Spoqa Han Sans Neo", sans-serif !important',
                  },
                  "& .MuiFormLabel-root": {
                    fontFamily: '"Spoqa Han Sans Neo", sans-serif !important',
                  },
                  marginBottom: "-5px", // 간격 조정
                }}
              />

              <TextField
                fullWidth
                margin="normal"
                label="금액"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                sx={{
                  "& .MuiInputBase-input": {
                    fontFamily: '"Spoqa Han Sans Neo", sans-serif !important',
                  },
                  "& .MuiFormLabel-root": {
                    fontFamily: '"Spoqa Han Sans Neo", sans-serif !important',
                  },
                  marginBottom: "-5px", // 간격 조정
                }}
              />
            </>
          )}

          {tabIndex === 1 && (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="내용"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                sx={{
                  "& .MuiInputBase-input": {
                    fontFamily: '"Spoqa Han Sans Neo", sans-serif !important',
                  },
                  "& .MuiFormLabel-root": {
                    fontFamily: '"Spoqa Han Sans Neo", sans-serif !important',
                  },
                  marginBottom: "-5px", // 간격 조정
                }}
              />

              <TextField
                fullWidth
                margin="normal"
                label="금액"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                sx={{
                  "& .MuiInputBase-input": {
                    fontFamily: '"Spoqa Han Sans Neo", sans-serif !important',
                  },
                  "& .MuiFormLabel-root": {
                    fontFamily: '"Spoqa Han Sans Neo", sans-serif !important',
                  },
                  marginBottom: "-5px", // 간격 조정
                }}
              />

              <TextField
                fullWidth
                margin="normal"
                type="date"
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                sx={{
                  "& .MuiInputBase-input": {
                    fontFamily: '"Spoqa Han Sans Neo", sans-serif !important',
                  },
                  "& .MuiFormLabel-root": {
                    fontFamily: '"Spoqa Han Sans Neo", sans-serif !important',
                  },
                  marginBottom: "-5px", // 간격 조정
                }}
              />

              <TextField
                fullWidth
                margin="normal"
                type="time"
                value={payTime}
                onChange={(e) => setPayTime(e.target.value)}
                sx={{
                  "& .MuiInputBase-input": {
                    fontFamily: '"Spoqa Han Sans Neo", sans-serif !important',
                  },
                  "& .MuiFormLabel-root": {
                    fontFamily: '"Spoqa Han Sans Neo", sans-serif !important',
                  },
                  marginBottom: "-5px", // 간격 조정
                }}
              />
            </>
          )}
        </div>

        <div className={styles.adjustContainer}>
          <Button className={styles.adjustBtn} onClick={handleSubmit}>
            추가하기
          </Button>
        </div>
      </Box>
    </Modal>
  );
};


export default PaymentModal;
