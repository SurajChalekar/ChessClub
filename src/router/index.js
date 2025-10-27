import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import { auth } from '../firebase'

import Tournament from '../views/Tournament.vue' 
import GenericTournament from '../views/GenericTournament.vue'
import Analysis from '../views/Analysis.vue'
import Profile from '../views/Profile.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/anouncements',
    name: 'anouncements',
    component: () => import('../views/Announcements.vue')
  },
  { path: '/bot-mobile', name: 'bot-mobile', component: () => import('../views/BotMobile.vue'), meta: { requiresAuth: true } },
  { path: '/bot', name: 'bot', component: () => import('../views/Bot.vue'), meta: { requiresAuth: true, specialNavbar: true } },

  {
    path: '/tournament',
    name: 'tournament-overview',
    component: Tournament
  },
  
  {
    path: '/tournaments/:id',           
    name: 'generic-tournament-details', 
    component: GenericTournament,      
    props: true                         
  },
  { path: '/analysis', name: 'analysis', component: Analysis },
  { path: '/profile', name: 'profile', component: Profile },
 
  { path: '/puzzle-mobile', name: 'puzzle-mobile', component: () => import('../views/PuzzlesMobile.vue'), meta: { requiresAuth: true } },
  { path: '/puzzles', name: 'puzzles', component: () => import('../views/Puzzles.vue'), meta: { requiresAuth: true, specialNavbar: true } }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// Your router.beforeEach guard remains the same
router.beforeEach((to, from, next) => {
  const user = auth.currentUser
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!user) {
      alert('You must be logged in to access this page!')
      next('/')
      return
    }
  }
  const isMobile = window.innerWidth <= 768
  if (to.path === '/puzzles' && isMobile) {
    next('/puzzle-mobile')
    return
  }
  if (to.path === '/puzzle-mobile' && !isMobile) {
    next('/puzzles')
    return
  }
  if (to.path === '/bot' && isMobile) {
    next('/bot-mobile')
    return
  }
  if (to.path === '/bot-mobile' && !isMobile) {
    next('/bot')
    return
  }
  next()
})

export default router