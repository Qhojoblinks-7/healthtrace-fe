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

// UI Store - sidebar, notifications, intake header edit state
export const useUIStore = create((set) => ({
  sidebarOpen: true,
  notificationOpen: false,
  isEditingIntake: false,
  showLocationDropdown: false,
  tempLocation: '',
  tempName: '',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setNotificationOpen: (open) => set({ notificationOpen: open }),
  setIsEditingIntake: (editing) => set({ isEditingIntake: editing }),
  setShowLocationDropdown: (show) => set({ showLocationDropdown: show }),
  setTempLocation: (location) => set({ tempLocation: location }),
  setTempName: (name) => set({ tempName: name }),
  resetIntakeDraft: () => set({ tempLocation: '', tempName: '', isEditingIntake: false, showLocationDropdown: false }),
}))

// Screening Store - volunteer form state
export const useScreeningStore = create((set) => ({
  currentScreening: null,
  screeningFormData: {},
  formFields: {
    full_name: '',
    age: '',
    gender: '',
    phone_number: '',
    height_cm: '',
    weight_kg: '',
    systolic_bp: '',
    diastolic_bp: '',
    glucose_level: '',
  },
  setCurrentScreening: (screening) => set({ currentScreening: screening }),
  updateFormData: (data) => set((state) => ({ 
    screeningFormData: { ...state.screeningFormData, ...data } 
  })),
  setFormField: (field, value) => set((state) => ({
    formFields: { ...state.formFields, [field]: value }
  })),
  setFormFields: (fields) => set((state) => ({
    formFields: { ...state.formFields, ...fields }
  })),
  resetFormData: () => set({ 
    screeningFormData: {},
    formFields: {
      full_name: '',
      age: '',
      gender: '',
      phone_number: '',
      height_cm: '',
      weight_kg: '',
      systolic_bp: '',
      diastolic_bp: '',
      glucose_level: '',
    }
  }),
}))

// Session Store - volunteer session metadata
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

// Settings Store - all settings page state
export const useSettingsStore = create((set) => ({
  lastCacheClear: null,
  isExporting: false,
  isClearingCache: false,
  profile: {
    firstName: 'Dr. Smith',
    lastName: '',
    email: 'dr.smith@healthtrace.com',
    phone: '+1 (555) 123-4567',
    department: 'General Practice',
    specialization: 'Primary Care',
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    criticalAlerts: true,
    dailySummary: true,
    newPatientAlerts: true,
    consultationReminders: true,
  },
  display: {
    darkMode: false,
    compactView: false,
    showAnimations: true,
    sidebarCollapsed: false,
  },
  system: {
    autoRefresh: true,
    refreshInterval: 30,
    defaultPageSize: 20,
    enableAnalytics: true,
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    auditLogging: true,
  },
  setLastCacheClear: (date) => set({ lastCacheClear: date }),
  setIsExporting: (val) => set({ isExporting: val }),
  setIsClearingCache: (val) => set({ isClearingCache: val }),
  setProfile: (profile) => set({ profile }),
  setNotifications: (notifications) => set({ notifications }),
  setDisplay: (display) => set({ display }),
  setSystem: (system) => set({ system }),
  setSecurity: (security) => set({ security }),
}))

// Reports Store - reports page filters and pagination
export const useReportsStore = create((set) => ({
  searchQuery: '',
  statusFilter: 'all',
  dateFilter: 'all',
  page: 1,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setDateFilter: (filter) => set({ dateFilter: filter }),
  setPage: (page) => set({ page }),
  resetFilters: () => set({ searchQuery: '', statusFilter: 'all', dateFilter: 'all', page: 1 }),
}))

// Triage Store - triage page state
export const useTriageStore = create((set) => ({
  currentPage: 1,
  setCurrentPage: (page) => set({ currentPage: page }),
}))

// Consultation Store - clinical consultation state
export const useConsultationStore = create((set) => ({
  doctorAdvice: '',
  requiresSpecialist: false,
  setDoctorAdvice: (advice) => set({ doctorAdvice: advice }),
  setRequiresSpecialist: (requires) => set({ requiresSpecialist: requires }),
  resetConsultation: () => set({ doctorAdvice: '', requiresSpecialist: false }),
}))

// Validation Store - form validation errors
export const useValidationStore = create((set) => ({
  errors: {},
  setErrors: (errors) => set({ errors }),
  clearErrors: () => set({ errors: {} }),
  setFieldError: (field, error) => set((state) => ({ errors: { ...state.errors, [field]: error } })),
  clearFieldError: (field) => set((state) => {
    const newErrors = { ...state.errors }
    delete newErrors[field]
    return { errors: newErrors }
  }),
}))
