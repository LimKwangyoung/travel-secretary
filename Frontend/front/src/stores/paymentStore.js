import { create } from 'zustand';
import axiosInstance from '@/axios';

export const usePaymentStore = create((set, get) => ({
  // 결제 내역
  payments: [],

  // 결제 내역 저장
  setPayments: (paymentsInfo) => set(() => ({
    payments: paymentsInfo,
  })),

  // tripId에 따른 여행 결제내역 axios 요청
  fetchPayments: async (tripId) => {
    try {
      const response = await axiosInstance.get('/payments/list/', {
        params: {
          trip_id: tripId
        }
      });
      const { data } = response;
      return data;
    } catch (error) {
      console.log(error);
    }
  },

  // 정산을 위해 체크한 결제 계산 내역
  finalPayments: {},

  setFinalPayments: (tripId) => set(() => ({
    finalPayments: {
      trip_id: tripId,
      payments: [],
    }
  })),

  // 체크한 결제 내역 추가
  addFinalPayments: (paymentId) => set((state) => ({
    finalPayments: {
      ...state.finalPayments,
      payments: [
        ...state.finalPayments.payments,
        { payment_id: paymentId, bills: [] }
      ]
    }
  })),

  // 체크 해제한 결제 내역 삭제
  removeFinalPayments: (paymentId) => set((state) => ({
    finalPayments: {
      ...state.finalPayments,
      payments: state.finalPayments.payments.filter(payment => payment.payment_id !== paymentId)
    }
  })),

  // 체크한 결제 내역 업데이트
  updateFinalPayments: (paymentId, updatedBills) => set((state) => ({
    finalPayments: {
      ...state.finalPayments,
      payments: state.finalPayments.payments.map(payment => {
        if (payment.payment_id === paymentId) {
          return {
            ...payment,
            bills: updatedBills
          };
        }
        return payment;
      })
    }
  })),

  // paymentId에 따른 결제 내역 조회하기
  getPartPayment: (paymentId) => {
    const payment = get().payments.find(payment => payment.id === paymentId);
    return payment
  },
}));

