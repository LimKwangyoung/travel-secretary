import { create } from 'zustand';

// assets 폴더에서 이미지 불러오기
import img1 from '@/assets/images/random/img1.jpg';
import img2 from '@/assets/images/random/img2.jpg';
import img3 from '@/assets/images/random/img3.jpg';
import img4 from '@/assets/images/random/img4.jpg';
import img5 from '@/assets/images/random/img5.jpg';
import img6 from '@/assets/images/random/img6.jpg';
export const useFutureTripStore = create((set, get) => ({
  // 미래 여행 정보
  futureTrips: [],

  images: [img1, img2, img3, img4, img5, img6],
  imageIndex: 0,

  // 랜덤 이미지를 선택하는 함수
  getSequentialImage: () => {
    const images = get().images;
    const index = get().imageIndex;

    // 현재 인덱스에 해당하는 이미지 반환
    const selectedImage = images[index];

    // 인덱스 증가, 배열 끝에 도달하면 다시 0으로 순환
    set({ imageIndex: (index + 1) % images.length });

    return selectedImage;
  },

  // 미래 여행 정보 저장
  setFutureTrips: (tripInfo) => set(() => ({
    futureTrips: Array.isArray(tripInfo)
      ? tripInfo.map(trip => ({
        id: trip.id,
        startDate: trip.start_date,
        endDate: trip.end_date,
        tripName: trip.trip_name,
        locations: trip.locations,
        // 이미지가 없으면 랜덤 이미지 사용
        image_url: trip.image_url || get().getSequentialImage(),
      }))
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      : [],
  })),
}));