import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService, UserResponse, LoginDTO, RegisterDTO } from '@/services/auth.service'

export interface AuthState {
  token: string | null
  user: UserResponse | null
  isLoading: boolean
  hasHydrated: boolean
  error: string | null
  isAuthenticated: boolean

  // Actions
  login: (data: LoginDTO) => Promise<void>
  register: (data: RegisterDTO) => Promise<void>
  logout: () => void
  clearError: () => void
  setHasHydrated: (value: boolean) => void
  setUser: (user: UserResponse | null) => void
  setToken: (token: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoading: false,
      hasHydrated: false,
      error: null,
      isAuthenticated: false,

      login: async (data: LoginDTO) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.login(data)

          set({
            token: response.data.token ?? 'session',
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error: unknown) {
          const err = error as { message: string }
          set({
            error: err?.message || 'Error desconocido',
            isLoading: false,
            isAuthenticated: false
          })
          throw error
        }
      },

      register: async (data: RegisterDTO) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.register(data)

          set({
            token: response.data.token ?? 'session',
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error: unknown) {
          const err = error as { message: string }
          set({
            error: err?.message || 'Error desconocido',
            isLoading: false,
            isAuthenticated: false
          })
          throw error
        }
      },

      logout: () => {
        authService.logout()
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        })
      },

      clearError: () => {
        set({ error: null })
      },

      setHasHydrated: (value: boolean) => {
        set({ hasHydrated: value })
      },

      setUser: (user: UserResponse | null) => {
        set({ user, isAuthenticated: Boolean(user) })
      },

      setToken: (token: string | null) => {
        set({ token })
      }
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
        if (state?.isAuthenticated && !state?.token) {
          state?.setToken('session')
        }
      }
    }
  )
)
