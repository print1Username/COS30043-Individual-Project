import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import SignUpView from '@/views/SignUpView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'

import DashboardView from '@/views/dashboard/DashboardView.vue'
import ProfileView from '@/views/dashboard/ProfileView.vue'
import ProductsView from '@/views/dashboard/products/ProductsView.vue'
import CreateProductView from '@/views/dashboard/products/CreateProductView.vue'
import FollowerView from '@/views/dashboard/FollowerView.vue'
import HistoryView from '@/views/dashboard/HistoryView.vue'
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
    {
      path: '/dashboard/products',
      name: 'products',
      component: ProductsView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/dashboard/products/create',
      name: 'products-create',
      component: CreateProductView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/dashboard/followers',
      name: 'followers',
      component: FollowerView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/dashboard/history',
      name: 'history',
      component: HistoryView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/dashboard/profile',
      name: 'profile',
      component: ProfileView,
      meta: {
        requiresAuth: true,
      },
    },
  ],
})

router.beforeEach(async (to) => {
  // Preserve Supabase email redirect exchange first
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

  // Preserve reset-request guard
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

  // Determine session state
  let session = null
  try {
    session = await getCurrentSession()
  } catch (err) {
    session = null
  }

  // Define auth-only pages (login-related)
  const authPages = ['/login', '/signup', '/forgot', '/reset']

  if (session) {
    // If logged in and trying to access auth pages, redirect to dashboard
    if (authPages.includes(to.path)) {
      return { path: '/dashboard', replace: true }
    }

    // Allow all other pages (including `/` home)
    return true
  }

  // No session: allow public pages (including home and auth pages),
  // but block pages that explicitly require auth
  if (to.meta && to.meta.requiresAuth) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
      replace: true,
    }
  }

  return true
})

export default router
