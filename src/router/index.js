import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import { auth } from '../firebase' // import Firebase auth

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/anouncements',
    name: 'anouncements',
    component: () => import('../views/Anouncements.vue')
  },
  {
    path: '/tournament',
    name: 'tournament',
    component: () => import('../views/Tournament.vue')
  },
  {
    path: '/puzzles',
    name: 'puzzles',
    component: () => import('../views/Puzzles.vue'),
    meta: { requiresAuth: true, specialNavbar: true } 
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
  const user = auth.currentUser

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!user) {
      // Redirect to home if not logged in
      alert('You must be logged in to access this page!')
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
