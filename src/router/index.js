import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import { auth } from '../firebase'

// --- CORRECTED IMPORTS: Using singular component names ---
import Tournament from '../views/Tournament.vue' 
import TournamentDetails from '../views/TournamentDetails.vue' 
// -----------------------------

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

  // --- 1. MAIN TOURNAMENT OVERVIEW PAGE ---
  {
    path: '/tournament',
    name: 'tournament-overview',
    component: Tournament
  },
  
  // --- 2. DYNAMIC DETAILS/STANDINGS PAGE ---
  {
    path: '/tournament/:id',
    name: 'tournament-details',
    component: TournamentDetails,
    props: true
  },

  // --- PUZZLE PAGES ---
  {
    path: '/puzzle-mobile',
    name: 'puzzle-mobile',
    component: () => import('../views/PuzzlesMobile.vue'),
    meta: { requiresAuth: true } 
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
  routes,

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// ✅ Combined navigation guard (auth + device redirect)
router.beforeEach((to, from, next) => {
  const user = auth.currentUser

  // ---- Authentication Guard ----
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!user) {
      alert('You must be logged in to access this page!')
      next('/')
      return
    }
  }

  // ---- Responsive Redirect ----
  const isMobile = window.innerWidth <= 768

  // If visiting /puzzles on mobile → redirect to /puzzle-mobile
  if (to.path === '/puzzles' && isMobile) {
    next('/puzzle-mobile')
    return
  }

  // If visiting /puzzle-mobile on desktop → redirect to /puzzles
  if (to.path === '/puzzle-mobile' && !isMobile) {
    next('/puzzles')
    return
  }

  next()
})

export default router
