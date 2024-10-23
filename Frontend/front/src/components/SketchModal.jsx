import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "@/axios";
import { Modal, Backdrop, Fade, Button, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useErrorStore } from "@/stores/errorStore"; // useErrorStore import

import styles from "./styles/SketchModal.module.css";

const SketchModal = ({ isOpen, onClose, tripId, imageUrl, onSave }) => {
  const { setError } = useErrorStore(); // errorStore에서 setError 사용

  // 새롭게 생성한 AI 스케치 이미지 url
  const [sketchUrl, setSketchUrl] = useState("");

  // 업로드한 이미지
  const [fileName, setFileName] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");

  // 로딩 진행
  const [loadingState, setLoadingState] = useState(false);

  // 이미지 url 초기화
  useEffect(() => {
    if (!isOpen) {
      setSketchUrl("");
      setFileName("");
      setUploadedUrl("");
      setLoadingState(false);
    }
  }, [isOpen]);

  const uploadFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      setUploadedImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const createImage = async () => {
    setLoadingState(true);

    if (uploadedImage) {
      try {
        const formData = new FormData();
        formData.append("image", uploadedImage);
        formData.append("index", 0); // Vintage Comic
        const responsePost = await axios.post(
          "https://www.ailabapi.com/api/image/effects/ai-anime-generator",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "ailabapi-api-key":
                "ukN2hKIGKbTYy9rsB7lLP7zM3XETJaZp5tOvR4H81x5bCwWSMLGc04FQqnji02mj",
            },
          }
        );

        const taskId = responsePost.data.task_id;
        await getResult(taskId);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingState(false);
      }
    }
  };

  const getResult = async (taskId) => {
    return new Promise((resolve) => {
      const intervalId = setInterval(async () => {
        try {
          const responseGet = await axios.get(
            "https://www.ailabapi.com/api/common/query-async-task-result",
            {
              headers: {
                "ailabapi-api-key":
                  "ukN2hKIGKbTYy9rsB7lLP7zM3XETJaZp5tOvR4H81x5bCwWSMLGc04FQqnji02mj",
              },
              params: {
                task_id: taskId,
              },
            }
          );

          const taskStatus = responseGet.data.task_status;

          // 이미지 생성 완료
          if (taskStatus === 2) {
            setSketchUrl(responseGet.data.data.result_url);
            clearInterval(intervalId);
            resolve();
          } else if (taskStatus === 1) {
            console.log("Task is still processing.");
          } else {
            clearInterval(intervalId);
            resolve();
          }
        } catch (error) {
          clearInterval(intervalId);
          console.error(error);
          resolve();
        }
      }, 5000);
    });
  };

  // 이미지 저장 및 알림 처리
  const saveImage = async () => {
    if (sketchUrl.length > 0) {
      try {
        await axiosInstance.post("/trips/save_image/", {
          trip_id: tripId,
          image_url: sketchUrl,
        });
        onClose(); // 모달 닫기
        setError("이미지가 성공적으로 저장되었습니다."); // 성공 메시지 표시
        if (onSave) onSave(); // 부모 컴포넌트의 여행 데이터 갱신 콜백 호출
      } catch (error) {
        console.error(error);
      }
    }
  };

  let imageContent;
  if (sketchUrl.length > 0) {
    imageContent = (
      <img
        src={sketchUrl}
        alt="AI Sketch"
        style={{ maxWidth: "100%", maxHeight: "250px" }}
      />
    );
  } else if (uploadedUrl.length > 0) {
    imageContent = (
      <img
        src={uploadedUrl}
        alt="Uploaded"
        style={{ maxWidth: "100%", maxHeight: "250px" }}
      />
    );
  } else if (imageUrl) {
    imageContent = (
      <img
        src={imageUrl}
        alt="AI Sketch"
        style={{ maxWidth: "100%", maxHeight: "250px" }}
      />
    );
  }

  let imageButton;
  if (loadingState) {
    imageButton = <CircularProgress size="50px" />;
  } else if (sketchUrl.length > 0) {
    imageButton = (
      <Button
        className={styles.saveBtn}
        variant="contained"
        size="large"
        onClick={saveImage}
      >
        사진 저장
      </Button>
    );
  } else {
    imageButton = (
      <Button
        className={styles.saveBtn}
        variant="contained"
        size="large"
        onClick={createImage}
      >
        사진 생성
      </Button>
    );
  }

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={isOpen}>
        <div className={styles.box}>
          <CloseIcon
            className={styles.closeBtn}
            fontSize="large"
            onClick={onClose}
          />
          <div className={styles.modalTitle}>AI 스케치</div>

          <div className={styles.content}>
            {/* AI 스케치 이미지 또는 업로드한 이미지 미리보기 */}
            {imageContent}
          </div>

          {/* 이미지 업로드 버튼 */}
          {!loadingState && (
            <div className={styles.fileUpload}>
              <div className={styles.fileName}>
                {fileName || "파일을 선택해주세요"}
              </div>
              <Button component="label" startIcon={<CloudUploadIcon />}>
                <input type="file" hidden onChange={uploadFile} />
              </Button>
            </div>
          )}

          {/* 사진 생성 또는 저장 버튼 */}
          {imageButton}
        </div>
      </Fade>
    </Modal>
  );
};

export default SketchModal;
