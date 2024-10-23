import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set) => ({
      // 토큰
      userToken: '',
      budget: {
        initialBudget: 0,
        usedBudget: 0,
        remainBudget: 0,
      },
      // 토큰 저장
      setUserToken: (token) => set(() => ({
        userToken: token,
      })),

      // 유저 정보
      userInfo: {},
      userAccount: {},

      // 유저 정보 저장
      setUserInfo: (userInfo) => set(() => ({
        userInfo: {
          id: userInfo.id,
          nickName: userInfo.properties.nickname,
          profileImage: userInfo.properties.profile_image,
        },
      })),

      setUserAccount: (bankAccount) => set(() => ({
        userAccount: {
          bankName: bankAccount.bankName, // 기존 userInfo 정보 유지
          bankAccount: bankAccount.accountNo // bankAccount 업데이트
        },
      })),

      // 예산 정보 업데이트
      setUserBudget: (budgets) => set(() => ({
        budget: {
          initialBudget: budgets.budget.initial_budget || 0,
          usedBudget: budgets.budget.used_budget || 0,
          remainBudget: budgets.budget.remain_budget || 0,
        },
      })),

      setInitialBudget: (budgetData) => set((state) => ({
        budget: {
          initialBudget: budgetData,
          usedBudget: state.budget.usedBudget || 0,
          remainBudget: state.budget.remainBudget || 0, 
        }
      }))
    }),
    {
      name: 'user-storage', // localStorage에 저장될 key 이름
      storage: {
        getItem: (name) => JSON.parse(localStorage.getItem(name)),  // 역직렬화
        setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value)),  // 직렬화
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
