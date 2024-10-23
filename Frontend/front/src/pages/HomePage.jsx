import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import styles from '@/styles/HomePage.module.css';
import kakao from '@/assets/images/kakao.png';
import TripPage from './TripPage';

const HomePage = () => {
  const toTrip = () => {
    window.location.href = 'https://j11a204.p.ssafy.io/api/auth/login/kakao/';
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.top}>
        <div className={styles.first}>정산부터 소비관리까지</div>
        <div className={styles.second}>나만의 여행비서</div>
      </div>
      <div className={styles.middle}>
        <img className={styles.mainImg} src="../../public/main.png" alt="main logo" />
      </div>
      <div className={styles.bottom}>
        <div className={styles.third}>여행에서 가장 쉬운 정산 서비스</div>
        <div className={styles.title}>요&nbsp;&nbsp;뜨</div>
        <div className={styles.login}>
          <button onClick={toTrip}>
            <img src={kakao} alt="kakao" />
            카카오톡 로그인
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;