import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import { auth } from '../firebase' // import Firebase auth

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
    name: 'tournament-overview', // New, distinct name for the main page
    component: Tournament // Using the directly imported component: Tournament.vue
  },
  
  // --- 2. DYNAMIC DETAILS/STANDINGS PAGE ---
  {
    path: '/tournament/:id', // URL pattern to match /tournament/1, /tournament/42, etc.
    name: 'tournament-details', // Name used for programmatic navigation (router.push)
    component: TournamentDetails, // Using the directly imported component: TournamentDetails.vue
    props: true // ESSENTIAL: Passes the ':id' from the URL as a prop to TournamentDetails.vue
  },
  // ---------------------------------------------

  {
    path: '/puzzles',
    name: 'puzzles',
    component: () => import('../views/Puzzles.vue'),
    meta: { requiresAuth: true } // 🔒 mark as protected
  }
]

const router = createRouter({
  // Using Hash history mode based on your original file
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
  const user = auth.currentUser

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!user) {
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