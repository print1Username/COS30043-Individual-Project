import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import SignUpView from '@/views/SignUpView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'

import DashboardView from '@/views/dashboard/DashboardView.vue'
import { exchangeCodeForSession, getCurrentSession } from '@/lib/auth'

function getPasswordResetRequest() {
  try {
    return JSON.parse(localStorage.getItem('passwordResetRequested') || 'null')
  } catch {
    localStorage.removeItem('passwordResetRequested')
    return null
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUpView,
    },
    {
      path: '/forgot',
      name: 'forgot',
      component: ForgotPasswordView,
    },
    {
      path: '/reset',
      name: 'reset',
      component: ResetPasswordView,
      meta: {
        requiresResetRequest: true,
      },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: {
        requiresAuth: true,
      },
    },
  ],
})

router.beforeEach(async (to) => {
  if (to.query.code) {
    await exchangeCodeForSession(window.location.href)
    return {
      path: to.path,
      query: Object.fromEntries(
        Object.entries(to.query).filter(([key]) => !['code', 'state'].includes(key)),
      ),
      hash: '',
      replace: true,
    }
  }

  if (to.meta.requiresResetRequest) {
    const resetRequest = getPasswordResetRequest()

    if (!resetRequest || resetRequest.expiresAt < Date.now()) {
      localStorage.removeItem('passwordResetRequested')
      console.info('[auth:failed] Reset page blocked: no recent forgot-password request')

      return {
        path: '/forgot',
      }
    }

    return true
  }

  if (!to.meta.requiresAuth) {
    return true
  }

  const session = await getCurrentSession()

  if (session) {
    return true
  }

  return {
    path: '/login',
    query: {
      redirect: to.fullPath,
    },
  }
})

export default router
