import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton'; 
import CloseIcon from '@mui/icons-material/Close'; 
import { Grid2, Typography } from '@mui/material';

import styles from "./styles/MBTIModal.module.css";

import aja from '@/assets/images/ping/아자핑.png'; //항공
import koja from '@/assets/images/ping/코자핑.png'; //숙소
import dajo from '@/assets/images/ping/다조핑.png'; //식비
import moya from '@/assets/images/ping/모야핑.png'; //관광
import singsing from '@/assets/images/ping/씽씽핑.png'; //교통
import teobeol from '@/assets/images/ping/떠벌핑.png'; //카페
import fla from '@/assets/images/ping/플라핑.png'; //쇼핑
import hachu from '@/assets/images/ping/하츄핑.png'; //기타

const MBTIModal = ({ isOpen, onClose }) => {
  const mbtiCharacters = [
    {
      id: 1,
      name: '아자핑 ✈️',
      img: aja,
      description: `항상 용기를 가지고 새로운 모험에 도전하는 걸 좋아하죠.<br />
여러분도 하늘을 나는 비행기처럼 자유롭게 여행하고 싶지 않나요?<br />
함께 다양한 곳을 탐험하고 멋진 경험을 나누어요!<br />
모험을 시작될 준비가 되었나요? 🚀`,
    },
    {
      id: 2,
      name: '코자핑 🌙',
      img: koja,
      description: `사람들을 잠재우고 꿈을 만들어줘요.<br />
편안한 숙소에서 여유롭게 시간을 보내는 것을 즐겨요.<br />
여러분도 저와 함께 조용한 곳에서 푹 쉬며 에너지를 충전하고 싶으신가요?<br />
우리 함께 아늑한 숙소에서 편안한 시간을 보내며 소중한 꿈을 나누어요! 🏡`,
    },
    {
      id: 3,
      name: '다조핑 🍽️',
      img: dajo,
      description: `음식을 사랑해요. 특히 맛있는 것을 함께 나누는 시간은 정말 소중하죠.<br />
여러분도 맛있는 음식을 함께 즐기고 싶지 않나요?<br />
우리 모두 다 같이 앉아 맛있는 음식을 나누며 즐거운 시간을 보내요! 🥗🍰`,
    },
    {
      id: 4,
      name: '모야핑 🔍',
      img: moya,
      description: `궁금한 모든 것을 탐험해요!<br />
작고 귀여운 것들을 살펴보며 새로운 발견을 하는 게 정말 즐거워요.<br />
여러분도 저와 함께 멋진 관광지를 탐험하고 싶지 않나요?<br />
흥미진진한 여행을 떠나서 새로운 것을 알아가는 기회를 함께 나누어요! 🌍🏞️`,
    },
    {
      id: 5,
      name: '씽씽핑 🚀',
      img: singsing,
      description: `빠른 속도를 사랑하며 킥보드를 타고 이곳저곳을 탐험하는 것을 좋아해요!<br />
여러분도 저처럼 신나는 모험과 빠른 여행을 즐기시나요?<br />
함께 스피드를 즐기며 세상을 탐험해봐요! 💨`,
    },
    {
      id: 6,
      name: '떠벌핑 ☕',
      img: teobeol,
      description: `사람들의 숨겨진 이야기들을 듣는 것이 재미있지만, 카페에서 느긋하게 차를 마시며 이야기를 나누는 것도 좋아해요.<br />
여러분도 아늑한 카페에 가서 소소한 비밀들을 나누고 싶으신가요?<br />
우리 함께 즐거운 시간을 보내며 서로의 이야기를 나눠봐요! 🎉💬`,
    },
    {
      id: 7,
      name: '플라핑 🌸',
      img: fla,
      description: `쇼핑은 저에게 꽃을 고르는 즐거움처럼 기분 좋은 경험이랍니다!<br />
새로운 패션 아이템을 찾아서 나만의 스타일을 꽃피우는 것이 재미있어요.<br />
여러분도다양한 아이템을 탐험하며 멋진 스타일을 만들어보고 싶지 않나요?<br />
함께 즐거운 쇼핑을 하며 새로운 매력을 발견해봐요! 🌼🛍️`,
    },
    {
      id: 8,
      name: '하츄핑 💖',
      img: hachu,
      description: `애교가 넘치는 저와 함께, 사랑하는 친구들과 따뜻한 순간들을 만들어봐요.<br />
여러분도 사랑을 주고받는 순간들이 얼마나 소중한지 알고 계시죠?<br />
우리 함께 서로의 사랑을 나누며 행복한 시간을 보내봐요! 🌟💕`,
    },
  ];

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box className={styles.box} sx={{ ...modalStyle }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
          }}
        >
          <CloseIcon />
        </IconButton>

        <div className={styles.title}>소BTI</div>
        
        <Box className={styles.content}>
          {mbtiCharacters.map((character) => (
            <div key={character.id} className={styles.mbtiRow}>
              <div>
                <img src={character.img} alt={character.name} className={styles.mbtiImage} />
              </div>
              <div className={styles.mbtiText}>
                <div className={styles.name}>
                  <span className={styles.idx}>{character.id}</span>
                  {character.name}
                </div>
                <Typography variant="body2" className={styles.explanation} dangerouslySetInnerHTML={{ __html: character.description }}>
                </Typography>
              </div>
            </div>
          ))}
        </Box>
      </Box>
    </Modal>
  );
};

// 모달 스타일
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 350,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
};

export default MBTIModal;
