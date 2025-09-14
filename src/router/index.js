import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/Home.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/events',
      name: 'events',
      // Lazy loading for better performance
      component: () => import('../views/Events.vue')
    },
    {
      path: '/tournament',
      name: 'tournament',
      component: () => import('../views/Tournament.vue')
    }
  ]
})

export default router
