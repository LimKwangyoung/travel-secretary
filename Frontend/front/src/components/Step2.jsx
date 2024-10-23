import React, { useState, useEffect } from 'react';
import axiosInstance from '@/axios'; // axiosInstance import
import { Chip, Avatar } from '@mui/material'; // Chip과 Avatar 컴포넌트 import
import styles from './styles/Steps.module.css';
import kakao from '@/assets/images/kakao.png';

const StepTwo = ({ formData, updateFormData }) => {
  const [friends, setFriends] = useState([]); // friends 데이터 관리할 상태
  const [showDropdown, setShowDropdown] = useState(false); // 드롭다운 상태 관리

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axiosInstance.get('/accounts/friend/');
        setFriends(response.data); // 응답 데이터를 friends에 저장
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    fetchFriends(); // 컴포넌트가 마운트될 때 friends 데이터 가져옴
  }, []);

  const toggleMember = (friend) => {
    const isSelected = formData.members.some(member => member.profile_nickname === friend.profile_nickname);

    if (isSelected) {
      // 선택 해제
      const updatedMembers = formData.members.filter(member => member.profile_nickname !== friend.profile_nickname);
      updateFormData({ members: updatedMembers });
    } else {
      // 선택 추가
      const updatedMembers = [...formData.members, friend]; // friend 전체 데이터를 members에 추가
      updateFormData({ members: updatedMembers });
    }
  };

  const removeMember = (index) => {
    const updatedMembers = formData.members.filter((_, i) => i !== index);
    updateFormData({ members: updatedMembers });
  };

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown); // 드롭다운 토글
  };

  return (
    <div className={styles.mainContainer}>

      <div className={styles.third}>
        <div className={styles.question}>어떤 여행을 떠나시나요?</div>
        
        <div className={styles.nickname}>
          {/* 여행 이름 입력 */}
          <input
            type="text"
            placeholder="여행 별칭 입력"
            value={formData.trip_name}
            onChange={(e) => updateFormData({ trip_name: e.target.value })}
          />
        </div>
      </div>


      <div className={styles.fourth}>
        <div className={styles.question}>누구와 여행을 떠나시나요?</div>

        {/* 선택된 멤버 리스트 및 프로필 사진 */}
        <div className={styles.chipContainer}>
          {formData.members.map((member, index) => (
            <Chip
              key={index}
              avatar={<Avatar alt={member.profile_nickname} src={member.profile_thumbnail_image} />}
              label={member.profile_nickname}
              onDelete={() => removeMember(index)} // 삭제 버튼 클릭 시 멤버 삭제
              className={styles.memberChip}
            />
          ))}
        </div>
        
        <div className={styles.candidates}>
          {/* 친구 초대하기 버튼 */}
          <button onClick={handleDropdownToggle} className={styles.inviteButton}>
            <img src={kakao} alt="kakao" />
            멤버 초대하기
          </button>

          {/* 드롭다운 형식으로 친구 선택 */}
          {showDropdown && (
            <div className={styles.dropdownContainer}>
              <div className={styles.friendListContainer}>
                {friends.length > 0 ? (
                  <ul className={styles.friendList}>
                    {friends.map((friend, index) => {
                      const isSelected = formData.members.some(member => member.profile_nickname === friend.profile_nickname);
                      return (
                        <li 
                          key={index}
                          className={`${styles.friendItem} ${isSelected ? styles.selected : ''}`} // 선택 시 스타일 변경
                          onClick={() => toggleMember(friend)}
                        >
                          <img src={friend.profile_thumbnail_image} alt={friend.profile_nickname} className={styles.friendImage} />
                          {friend.profile_nickname}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p>친구 목록을 불러오는 중입니다...</p>
                )}
              </div>
            </div>
          )}
        </div>
      

      </div>

    </div>
  );
};

export default StepTwo;
