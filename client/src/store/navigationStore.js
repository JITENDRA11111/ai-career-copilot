import { create } from 'zustand';

export const useNavigationStore = create((set) => ({
  isTaskActive: false,
  setIsTaskActive: (active) => set({ isTaskActive: active }),
  
  showWarningModal: false,
  pendingPath: null,
  setShowWarningModal: (show, path = null) => set({ showWarningModal: show, pendingPath: path }),
}));
