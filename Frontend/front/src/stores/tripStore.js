import { create } from 'zustand';
import axiosInstance from '@/axios';
import { usePastTripStore } from '@/stores/pastTripStore';
import { useFutureTripStore } from '@/stores/futureTripStore';

export const useTripStore = create((set) => ({
  // 현재 여행 정보
  currentTrip: {},

  // 현재 여행 정보 저장
  setCurrentTrip: (tripInfo) => set(() => ({
    currentTrip: Array.isArray(tripInfo) && tripInfo.length > 0
      ? {
        id: tripInfo[0].id,
        startDate: tripInfo[0].start_date,
        endDate: tripInfo[0].end_date,
        tripName: tripInfo[0].trip_name,
        imageUrl: tripInfo[0].image_url,
        locations: tripInfo[0].locations,
      }
      : {},
  })),

  // 여행 정보 axios 요청
  fetchTrips: async () => {
    try {
      const response = await axiosInstance.get('/trips/list/');
      const { data } = response;
      // 과거, 현재, 미래 여행 정보 저장
      usePastTripStore.getState().setPastTrips(data.past_trips);
      useTripStore.getState().setCurrentTrip(data.current_trips);
      useFutureTripStore.getState().setFutureTrips(data.future_trips);
    } catch (error) {
      console.log(error)
    }
  },

  // tripId에 따른 여행 상세 정보
  tripDetailInfo: {},

  // tripId에 따른 여행 상세 정보 저장
  setTripDetailInfo: (tripId, tripInfo) => set(() => ({
    tripDetailInfo: typeof tripInfo === 'object' && tripInfo !== null
      ? {
        id: tripId,
        startDate: tripInfo.start_date,
        endDate: tripInfo.end_date,
        imageUrl: tripInfo.image_url,
        locations: tripInfo.locations,
        members: tripInfo.members,
        tripName: tripInfo.trip_name
      }
      : {},
  })),

  // tripId에 따른 여행 상세 정보 axios 요청
  fetchTripDetail: async (tripId) => {
    try {
      const response = await axiosInstance.get('/trips/detail/', {
        params: {
          trip_id: tripId
        }
      });
      const { data } = response;

      // 여행 상세 정보 저장
      // useTripStore.getState().setTripDetailInfo(data);
      return data
    } catch (error) {
      console.log(error)
    }
  },

  // tripId에 따른 여행 결제내역
  // paymentsInitialData: {},

  // tripId에 따른 여행 결제내역 저장
  // setPayments: (paymentInfo) => set(() => ({
    // paymentsInitialData: Array.isArray(paymentInfo) && paymentInfo.length > 0
    //   ? paymentInfo
    //   : [],
  //   paymentsInitialData: paymentInfo,
  // })),
}));

//   addPayment: (payment) => set((state) => ({
//     payments: [...state.payments, payment],
//   })),

//   updateMember: (memberId, updatedMember) => set((state) => ({
//     members: state.members.map((member) =>
//       member.id === memberId ? { ...member, ...updatedMember } : member
//     ),
//   })),

//   clearTrip: () => set(() => ({
//     locations: [],
//     members: [],
//     payments: [],
//     startDate: '',
//     endDate: '',
//   })),
// }));

// const initializeTrip = () => {
//   useTripStore.getState().setTrip(
//     ['South Korea', 'Japan'],
//     [
//       { id: 'member1', account: '123-456' },
//       { id: 'member2', account: '789-012' }
//     ],
//     '2024-09-01',
//     '2024-09-10'
//   );
// };

// const addPayment = () => {
//   useTripStore.getState().addPayment({
//     id: 'payment1',
//     amount: 100,
//     memberId: 'member1',
//     description: 'Dinner'
