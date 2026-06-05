import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      userSession: null,
      tickets: [],
      clientTickets: [],
      emailOutbox: [],
      toast: { show: false, message: '', type: 'success' },
      isRegulationsOpen: false,

      setUserSession: (userSession) => set({ userSession }),
      setTickets: (tickets) => set({ tickets }),
      setClientTickets: (clientTickets) => set({ clientTickets }),
      setIsRegulationsOpen: (isRegulationsOpen) => set({ isRegulationsOpen }),
      addEmailOutbox: (message) =>
        set((state) => ({ emailOutbox: [message, ...state.emailOutbox] })),
      showToast: (message, type = 'success') => {
        set({ toast: { show: true, message, type } });
        window.setTimeout(() => {
          set({ toast: { show: false, message: '', type: 'success' } });
        }, 4000);
      },
      logout: () =>
        set({
          userSession: null,
          tickets: [],
          clientTickets: [],
        }),
    }),
    {
      name: 'epc_session',
      partialize: (state) => ({ userSession: state.userSession }),
    },
  ),
);
