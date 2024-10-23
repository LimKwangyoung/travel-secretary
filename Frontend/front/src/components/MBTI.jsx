import React, { useEffect, useRef, useState } from 'react';
import { Chip } from '@mui/material';
import ReactECharts from 'echarts-for-react'; // ECharts for React
import axiosInstance from '@/axios'; // axiosInstance import
import { useParams } from 'react-router-dom';
import styles from './styles/MBTI.module.css';
import InfoIcon from '@mui/icons-material/Info';
import MBTIModal from '@/components/MBTIModal';
import aja from '@/assets/images/ping/아자핑.png'; //항공

const Chart = () => {
  const [isMBTIOpen, setisMBTIOpen] = useState(false);

  const openModal = (event) => {
    event.stopPropagation();
    setisMBTIOpen(true);
  };

  const closeModal = () => {
    setisMBTIOpen(false);
  };
  

  return (
    <div className={styles.trip}>
      <div className={styles.title}>
        👑 소BTI
        {/*  아이콘  */}
        <div className={styles.icon}>
          <InfoIcon className={styles.infoIcon} onClick={(event) => openModal(event)} />
        </div>
      </div>
      <div className={styles.content}>
        {/*  캐릭터  */}
        <div className={styles.character}>
          <img className={styles.characterImg} src={aja} alt="아자핑" />
          <div className={styles.characterInfo}>
            <div>당신의 소BTI 캐릭터는</div>
            <div className={styles.myCharacter}>아자핑</div>
            <div className={styles.myChip}>
              <Chip variant="outlined" color="primary" label="#항공마일리지왕" />
              <Chip variant="outlined" color="primary" label="#하늘길애호가" />
            </div>
          </div>
        </div>
      </div>

      <MBTIModal isOpen={isMBTIOpen} onClose={closeModal} />
    </div>
  );
};

export default Chart;
