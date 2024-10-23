import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/axios.js'

import { useUserStore } from '@/stores/userStore';

const KakaoCallbackPage = () => {
  // kakao 코드
  const code = new URL(window.location.href).searchParams.get('code');

  const setUserToken = useUserStore((state) => state.setUserToken);
  const setUserInfo = useUserStore((state) => state.setUserInfo);

  const navigate = useNavigate();

  useEffect(() => {
    const sendCode = async () => {
      try {
        // 토큰 발급
        const response = await axiosInstance.post('/accounts/get_token/', {
          code: code
        });

        const { data } = response;

        setUserToken(data.token);
        setUserInfo(data.user_info);
        navigate('/trip');
      } catch (error) {
        console.log(error)
      }
    };

    sendCode();
  }, [code, setUserToken, navigate]);

  return (
    <></>
  )
};

export default KakaoCallbackPage;