import { create } from 'zustand';

export const useErrorStore = create((set) => ({
  errorMessage: '',
  showErrorModal: false,

  setError: (message) => set({ errorMessage: message, showErrorModal: true }),

  clearError: () => set({ errorMessage: '', showErrorModal: false }),
}));