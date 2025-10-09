import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import { auth } from '../firebase'

import Tournament from '../views/Tournament.vue' 
import TournamentDetails from '../views/TournamentDetails.vue' 
// CORRECTED: Importing your specific tournament component
import KnightsConquest2 from '../views/Knights_Conquest_2.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/anouncements', name: 'anouncements', component: () => import('../views/Anouncements.vue') },
  { path: '/tournament', name: 'tournament-overview', component: Tournament },
  // Route for generic tournament pages
  { path: '/tournament/:id', name: 'tournament-details', component: TournamentDetails, props: true },
  // CORRECTED: Specific route for the Knight's Conquest page
  {
    path: '/tournament/knights-conquest/:id',
    name: 'knights-conquest-details',
    component: KnightsConquest2,
    props: true
  },
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
  next()
})

export default router