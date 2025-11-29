import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/debug',
    name: 'Debug',
    component: () => import('@/views/DebugConsole.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/adventure/:goalId',
    name: 'AdventurePlan',
    component: () => import('@/views/AdventurePlan.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/calendar/:goalId',
    name: 'CalendarView',
    component: () => import('@/views/CalendarView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router

