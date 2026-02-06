import { create } from 'zustand';
import type { Screen } from '../styles/kidTheme';
import { screens } from '../styles/kidTheme';

interface Modal {
  id: string;
  type: string;
  data?: unknown;
}

interface UIState {
  // Navigation
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;

  // Modals
  activeModal: Modal | null;
  openModal: (type: string, data?: unknown) => void;
  closeModal: () => void;

  // Loading states
  isLoading: boolean;
  loadingMessage: string | null;
  setLoading: (loading: boolean, message?: string) => void;

  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // Sidebar (for desktop)
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

let toastId = 0;
let modalId = 0;

export const useUIStore = create<UIState>((set) => ({
  // Navigation - default to dress-up screen
  activeScreen: screens.DRESS_UP,
  setActiveScreen: (screen) => set({ activeScreen: screen }),

  // Modals
  activeModal: null,
  openModal: (type, data) =>
    set({
      activeModal: {
        id: `modal-${++modalId}`,
        type,
        data,
      },
    }),
  closeModal: () => set({ activeModal: null }),

  // Loading
  isLoading: false,
  loadingMessage: null,
  setLoading: (loading, message) =>
    set({
      isLoading: loading,
      loadingMessage: loading ? message || null : null,
    }),

  // Toasts
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          ...toast,
          id: `toast-${++toastId}`,
        },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  // Sidebar
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

export default useUIStore;
