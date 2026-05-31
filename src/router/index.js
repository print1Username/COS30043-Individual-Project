import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import SignUpView from '@/views/SignUpView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import SearchPageView from '@/views/home/SearchPageView.vue'

import HomeView from '@/views/home/HomeView.vue'
import ProfileView from '@/views/home/ProfileView.vue'
import ProductsView from '@/views/home/products/ProductsView.vue'
import CreateProductView from '@/views/home/products/CreateProductView.vue'
import ProductsDetailsView from '@/views/home/products/ProductsDetailsView.vue'
import HistoryView from '@/views/home/HistoryView.vue'
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
      name: 'landing',
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
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/home/products',
      name: 'products',
      component: ProductsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/home/products/create',
      name: 'products-create',
      component: CreateProductView,
      meta: { requiresAuth: true },
    },
    {
      path: '/home/products/:id',
      name: 'products-details',
      component: ProductsDetailsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/home/history',
      name: 'history',
      component: HistoryView,
      meta: { requiresAuth: true },
    },
    {
      path: '/home/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/home/search',
      name: 'search',
      component: SearchPageView,
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
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
      return { path: '/forgot' }
    }
    return true
  }

  let session = null
  try {
    session = await getCurrentSession()
  } catch {
    session = null
  }

  const authPages = ['/login', '/signup', '/forgot', '/reset']

  if (session) {
    if (authPages.includes(to.path)) {
      return { path: '/home', replace: true }
    }
    return true
  }

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
