import axios from 'axios';
import { useUserStore } from '@/stores/userStore';

// Axios 기본 설정
const axiosInstance = axios.create({
  baseURL: 'https://j11a204.p.ssafy.io/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    // const token = useUserStore((state) => state.userToken);
    const token = useUserStore.getState().userToken;
    if (token.length > 0) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// // 응답 인터셉터 (예: 에러 처리)
// axiosInstance.interceptors.response.use(
//   (response) => response, // 성공적인 응답
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       // 인증 실패 시 처리 (예: 로그인 페이지로 리다이렉트)
//       console.log('Unauthorized, redirecting to login...');
//       // window.location.href = '/login';  // 필요 시 리다이렉트
//     }
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;