import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // useNavigate 추가
import axiosInstance from '@/axios.js';
import { useUserStore } from '@/stores/userStore'; // userStore import
import styles from '@/styles/InvitePage.module.css'; // 스타일 파일

const InvitePage = () => {
  const { tripId } = useParams(); // URL에서 tripId 가져오기
  const navigate = useNavigate(); // 리다이렉트용 useNavigate 훅
  const { userToken } = useUserStore(); // userStore에서 userToken 가져오기

  const [bankAccounts, setBankAccounts] = useState([]); // 계좌 목록 상태
  const [selectedAccount, setSelectedAccount] = useState(''); // 선택된 계좌 번호
  const [selectedBankName, setSelectedBankName] = useState(''); // 선택된 은행 이름
  const [budget, setBudget] = useState(''); // 예산 입력 상태
  const [loading, setLoading] = useState(true); // 로딩 상태

  // 페이지 로딩 시 토큰이 없으면 메인 페이지로 리다이렉트
  useEffect(() => {
    if (!userToken) {
      navigate('/'); // 메인 페이지로 리다이렉트
    }
  }, [userToken, navigate]);

  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        const response = await axiosInstance.get('/bank_accounts/');
        setBankAccounts(response.data); // 계좌 목록을 state에 저장
        setLoading(false); // 로딩 완료
      } catch (error) {
        console.error('Error fetching bank accounts:', error);
        setLoading(false); // 오류 발생 시에도 로딩 완료
      }
    };

    fetchBankAccounts(); // 컴포넌트가 마운트될 때 계좌 목록 요청
  }, []);

  // 계좌 선택 시 처리
  const toggleAccount = (account) => {
    if (selectedAccount === account.accountNo) {
      setSelectedAccount(''); // 선택 해제
      setSelectedBankName(''); // 은행 이름도 초기화
    } else {
      setSelectedAccount(account.accountNo); // 계좌 선택
      setSelectedBankName(account.bankName); // 은행 이름 설정
    }
  };

  const handleBudgetChange = (e) => {
    setBudget(e.target.value); // 예산 설정
  };

  const handleSubmit = () => {
    // POST 요청에 포함할 request body
    const payload = {
      trip_id: tripId,
      budget,
      bank_account: selectedAccount,
      bank_name: selectedBankName,
    };

    axiosInstance.post('/trips/invite/', payload)
      .then(response => {
        console.log('Invite accepted:', response.data);
        // 성공 시 처리 로직
      })
      .catch(error => {
        console.error('Error accepting invite:', error);
        // 오류 처리
      });
  };

  return (
    <div className={styles.mainContainer}>
      {loading ? (
        <div className={styles.content}>계좌 목록을 불러오는 중...</div>
      ) : (
        <>
          <div className={styles.content}>
            <div className={styles.question}>어떤 계좌를 사용하시나요?</div>
            <div className={styles.accountListContainer}>
              <ul className={styles.accountList}>
                {bankAccounts.map((account, index) => {
                  const isSelected = selectedAccount === account.accountNo;
                  return (
                    <li
                      key={index}
                      className={`${styles.accountItem} ${isSelected ? styles.selected : ''}`}
                      onClick={() => toggleAccount(account)}
                    >
                      {account.bankName}: {account.accountNo}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className={styles.content}>
            <div className={styles.question}>예산을 설정해주세요</div>
            <div className={styles.budget}>
              <input
                type="number"
                placeholder="예산 입력"
                value={budget}
                onChange={handleBudgetChange}
                className={styles.budgetInput}
              />
            </div>
          </div>
          
          <div className={styles.acceptContainer}>
            <button onClick={handleSubmit} className={styles.acceptBtn}>
              초대 수락하기
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default InvitePage;