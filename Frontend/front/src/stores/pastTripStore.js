import { create } from 'zustand';
import paris from '@/assets/images/paris.jpeg';
import bali from '@/assets/images/bali.jpeg';
import cambodia from '@/assets/images/cambodia.jpg';

export const usePastTripStore = create((set) => ({
  // 과거 여행 정보
  pastTrips: [
  ],

  // 과거 여행 정보 저장
  setPastTrips: (tripInfo) => set(() => ({
    pastTrips: Array.isArray(tripInfo)
      ? tripInfo.map(trip => ({
        id: trip.id,
        startDate: trip.start_date,
        endDate: trip.end_date,
        tripName: trip.trip_name,
        locations: trip.locations,
        image_url: trip.image_url || 'https://www.kagoshima-kankou.com/storage/tourism_themes/12/responsive_images/ElwnvZ2u5uZda7Pjcwlk4mMtr08kLNydT8zXA6Ie__1673_1115.jpeg',
      }))
      : [],
  })),
}));

