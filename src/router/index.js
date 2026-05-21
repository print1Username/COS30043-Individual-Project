import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import SignUpView from '@/views/SignUpView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'

import DashboardView from '@/views/dashboard/DashboardView.vue'
import { getCurrentSession } from '@/lib/auth'

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
