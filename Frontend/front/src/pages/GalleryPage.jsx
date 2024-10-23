import React from "react";
import PreviousTrip from "../components/PreviousTrip";
import Chart from "../components/Chart";
import MBTI from "../components/MBTI";
import { MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import LoadingPage from '@/pages/LoadingPage'
import styles from "@/styles/GalleryPage.module.css";

const GalleryPage = () => {
  const navigate = useNavigate();
  const goBack = () => {
    navigate("/trip");
  };

  return (
    <div className={styles.mainContainer}>
      {/* 뒤로가기 */}
      <div className={styles.header}>
        <div className={styles.back}>
          <MdArrowBack className={styles.btns} size={30} onClick={goBack} />
        </div>
      </div>
      <PreviousTrip />
      <Chart /> {/* Chart에서 payments 데이터를 직접 불러옴 */}
      <MBTI />
    </div>
  );
};

export default GalleryPage;
