import React, { useState, useEffect } from "react";
import axiosInstance from "@/axios.js"; // Axios 인스턴스 가져오기
import LoadingPage from "@/pages/LoadingPage";
import loadingImg from "@/assets/images/load/loading.gif";
import successImg from "@/assets/images/load/check.png";
import { useErrorStore } from "@/stores/errorStore"; // 에러 스토어 가져오기
import { useUserStore } from "@/stores/userStore"; // userStore 가져오기
import styles from "./styles/Steps.module.css";
import { useNavigate } from "react-router-dom";

const StepFour = ({ formData, onTripCreated }) => {
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 관리
  const [isSuccess, setIsSuccess] = useState(false); // 성공 여부 상태 관리
  const setError = useErrorStore((state) => state.setError); // 에러 상태 설정 함수
  const userInfo = useUserStore((state) => state.userInfo); // userInfo 가져오기
  const navigate = useNavigate();
  console.log(formData);
  // 컴포넌트가 마운트될 때 여행 생성 요청을 자동으로 보냄
  useEffect(() => {
    const handleSubmit = async () => {
      // userInfo를 members에 추가 (uuid는 빈 문자열로 설정)
      const updatedFormData = {
        ...formData,
        members: [
          ...(formData.members || []),
          {
            id: userInfo.id,
            profile_nickname: userInfo.nickName,
            profile_thumbnail_image: userInfo.profileImage,
            uuid: "", // uuid는 빈 문자열로 설정
          },
        ],
      };

      try {
        // 1.2초 후에 여행 생성 요청을 보냄
        setTimeout(async () => {
          const response = await axiosInstance.post("/trips/", updatedFormData);
          console.log("Trip Created:", response.data);
          setIsSuccess(true); // 성공 상태 설정
          setIsLoading(false); // 로딩 완료

          // 2초 후 여행 완료 콜백 호출
          setTimeout(() => {
            onTripCreated();
            const tripId = response.data.id; // 응답에서 tripId 추출
            navigate(`/trip/${tripId}`);
          }, 2000); // 여행 생성 완료 3초간 표시
        }, 1200); // 1.2초 지연
      } catch (error) {
        console.error("Error creating trip:", error);
        setError("여행 생성에 실패했습니다. 다시 시도해주세요.");
        setIsLoading(false);
      }
    };

    setIsLoading(true); // "여행 생성 중" 상태 설정
    handleSubmit(); // 여행 생성 요청 실행
  }, [formData, userInfo, setError, onTripCreated]);

  // if (isLoading) {
  //   return <LoadingPage />; // 로딩 페이지 출력
  // }

  return (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.sixth}>
          <img
            src={loadingImg}
            className={styles.loadingImg}
            alt="여행 생성 중..."
          />
          <p className={styles.loadingMsg}>여행 생성 중..</p>
        </div>
      ) : isSuccess ? (
        <div className={styles.sixth}>
          <img
            src={successImg}
            className={styles.successImg}
            alt="여행 생성 완료"
          />
          <p className={styles.successMsg}>여행 생성 완료!</p>
        </div>
      ) : (
        <p>여행 생성 중 문제가 발생했습니다.</p> // 에러 처리
      )}
    </div>
  );
};

export default StepFour;
