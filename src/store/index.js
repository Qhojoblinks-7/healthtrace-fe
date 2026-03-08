import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Auth Store
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'healthtrace-auth',
    }
  )
)

// UI Store
export const useUIStore = create((set) => ({
  sidebarOpen: true,
  theme: 'light',
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
}))

// Screening Store - for form state
export const useScreeningStore = create((set) => ({
  currentScreening: null,
  screeningFormData: {},
  
  setCurrentScreening: (screening) => set({ currentScreening: screening }),
  updateFormData: (data) => set((state) => ({ 
    screeningFormData: { ...state.screeningFormData, ...data } 
  })),
  resetFormData: () => set({ screeningFormData: {} }),
}))

// Session Store - for IntakeHeader (volunteer session info)
export const useSessionStore = create(
  persist(
    (set) => ({
      volunteerName: '',
      location: '',
      sessionStartTime: null,
      
      setVolunteerName: (name) => set({ volunteerName: name }),
      setLocation: (location) => set({ location }),
      startSession: () => set({ sessionStartTime: new Date().toISOString() }),
      endSession: () => set({ volunteerName: '', location: '', sessionStartTime: null }),
    }),
    {
      name: 'healthtrace-session',
    }
  )
)
