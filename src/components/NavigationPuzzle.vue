<template>
  <div>
    <!-- Sidebar Navigation -->
    <nav class="sidebar" :class="{ 'sidebar-open': isSidebarOpen }">
      <div class="sidebar-backdrop"></div>
      
      <!-- Brand/Logo -->
      <div class="sidebar-header">
        <router-link to="/" class="sidebar-brand">
          <span class="brand-container">
            <span class="chess-icon">♔</span>
            <span class="brand-text">IISER TVM Chess Club</span>
            <div class="brand-glow"></div>
          </span>
        </router-link>
      </div>

      <!-- Navigation Links -->
      <ul class="sidebar-nav">
        <li class="nav-item">
          <router-link to="/" class="nav-link-custom" active-class="active" exact-active-class="active">
            <span class="nav-text">Home</span>
            <div class="nav-glow"></div>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/anouncements" class="nav-link-custom" active-class="active">
            <span class="nav-text">Announcements</span> 
            <div class="nav-glow"></div>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/tournament" class="nav-link-custom" active-class="active">
            <span class="nav-text">Tournaments</span>
            <div class="nav-glow"></div>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/bot" class="nav-link-custom" active-class="active">
            <span class="nav-text">Bot</span>
            <div class="nav-glow"></div>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/puzzles" class="nav-link-custom" active-class="active">
            <span class="nav-text">Puzzle</span>
            <div class="nav-glow"></div>
          </router-link>
        </li>
      </ul>

      <!-- Auth Buttons -->
      <div class="auth-buttons">
        <template v-if="!isLoggedIn">
          <button class="btn auth-btn signup-btn" @click="loginWithGoogle">
            <span class="btn-text">Sign In</span>
            <div class="btn-shine"></div>
          </button>
        </template>
        <template v-else>
          <button class="btn auth-btn login-btn" @click="logout">
            <span class="btn-text">Log Out</span>
            <div class="btn-shine"></div>
          </button>
        </template>
      </div>
    </nav>

    <!-- Mobile Toggle Button -->
    <button class="sidebar-toggle" @click="toggleSidebar" :class="{ 'sidebar-open': isSidebarOpen }">
      <span class="toggler-line"></span>
      <span class="toggler-line"></span>
      <span class="toggler-line"></span>
    </button>

    <!-- Overlay for mobile -->
    <div class="sidebar-overlay" :class="{ 'active': isSidebarOpen }" @click="closeSidebar"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, provider } from '@/firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'

const router = useRouter()
const isLoggedIn = ref(false)
const isSidebarOpen = ref(false)
const errorMessage = ref('')
const userEmail = ref('')

// Track login state
onAuthStateChanged(auth, (user) => {
  isLoggedIn.value = !!user
})

// Log out function
const logout = async () => {
  try {
    await signOut(auth)
    alert('You have been logged out.')
    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Google Sign-In
const loginWithGoogle = async () => {
  errorMessage.value = ''
  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    
    if (!user.email.endsWith('@iisertvm.ac.in')) {
      alert('Only IISER TVM emails are allowed.')
      errorMessage.value = 'Only IISER TVM emails are allowed.'
      await signOut(auth)
      return
    }

    userEmail.value = user.email
    alert(`Welcome ${user.displayName || user.email}!`)
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Login failed. Please try again.'
  }
}

// Toggle sidebar
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}
</script>

<style scoped>
/* Sidebar Base Styling */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 200px;
  background: linear-gradient(180deg, rgba(26, 26, 46, 0.95) 0%, rgba(15, 15, 25, 0.98) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 193, 7, 0.1);
  padding: 2rem 0;
  transition: transform 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    linear-gradient(180deg, transparent 0%, rgba(255, 193, 7, 0.02) 50%, transparent 100%),
    radial-gradient(circle at 50% 10%, rgba(220, 53, 69, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 50% 90%, rgba(0, 212, 255, 0.03) 0%, transparent 50%);
  animation: sidebarBackgroundShift 15s ease-in-out infinite alternate;
}

/* Sidebar Header */
.sidebar-header {
  padding: 0 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 193, 7, 0.1);
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
}

.sidebar-brand {
  color: #ffffff !important;
  text-decoration: none;
  font-weight: 900;
  font-size: 1.4rem;
  display: block;
  position: relative;
  padding: 0.8rem;
  border-radius: 15px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.brand-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  z-index: 2;
}

.brand-text {
  background: linear-gradient(45deg, #ffc107, #ff6b35);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.chess-icon {
  color: #ffc107;
  font-size: 2.5em;
  text-shadow: 0 0 15px rgba(255, 193, 7, 0.7);
  animation: crownPulse 3s ease-in-out infinite;
  display: block;
}

.brand-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, rgba(255, 193, 7, 0.1) 0%, transparent 70%);
  border-radius: 15px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sidebar-brand:hover .brand-glow {
  opacity: 1;
}

.sidebar-brand:hover {
  transform: translateY(-2px);
}

.sidebar-brand:hover .chess-icon {
  transform: rotate(15deg) scale(1.1);
  text-shadow: 0 0 25px rgba(255, 193, 7, 0.9);
}

/* Sidebar Navigation */
.sidebar-nav {
  list-style: none;
  padding: 0 1rem;
  margin: 0;
  flex-grow: 1;
  position: relative;
  z-index: 2;
}

.nav-item {
  margin: 0.5rem 0;
}

.nav-link-custom {
  color: rgba(255, 255, 255, 0.8) !important;
  font-weight: 600;
  padding: 1rem 1.2rem !important;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  display: block;
  text-decoration: none;
}

.nav-text {
  position: relative;
  z-index: 2;
}

.nav-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255, 193, 7, 0.1), rgba(220, 53, 69, 0.1));
  border-radius: 12px;
  opacity: 0;
  transition: all 0.3s ease;
  transform: scale(0.8);
}

.nav-link-custom:hover {
  color: #ffc107 !important;
  transform: translateX(5px);
}

.nav-link-custom:hover .nav-glow {
  opacity: 1;
  transform: scale(1);
}

.nav-link-custom.active {
  color: #ffc107 !important;
  font-weight: 700;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.2);
}

.nav-link-custom.active .nav-glow {
  opacity: 0.7;
  transform: scale(1);
}

/* Auth Buttons */
.auth-buttons {
  padding: 1.5rem 1rem;
  border-top: 1px solid rgba(255, 193, 7, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  position: relative;
  z-index: 2;
}

.auth-btn {
  font-weight: 700;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  border: 2px solid transparent;
  width: 100%;
}

.btn-text {
  position: relative;
  z-index: 2;
}

.login-btn {
  background: transparent;
  border-color: rgba(255, 193, 7, 0.5);
  color: #ffc107;
}

.login-btn:hover {
  background: rgba(255, 193, 7, 0.1);
  border-color: #ffc107;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 193, 7, 0.3);
}

.signup-btn {
  background: linear-gradient(135deg, #ffc107 0%, #ff6b35 100%);
  border-color: transparent;
  color: #000;
  font-weight: 800;
  box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
}

.signup-btn:hover {
  background: linear-gradient(135deg, #ff6b35 0%, #dc3545 100%);
  color: #fff;
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.5);
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.auth-btn:hover .btn-shine {
  left: 100%;
}

/* Mobile Toggle Button */
.sidebar-toggle {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(15, 15, 25, 0.98) 100%);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: none;
}

.sidebar-toggle:hover {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 107, 53, 0.2) 100%);
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.3);
}

.toggler-line {
  display: block;
  width: 25px;
  height: 3px;
  background: linear-gradient(45deg, #ffc107, #ff6b35);
  margin: 4px 0;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.sidebar-toggle.sidebar-open .toggler-line:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.sidebar-toggle.sidebar-open .toggler-line:nth-child(2) {
  opacity: 0;
}

.sidebar-toggle.sidebar-open .toggler-line:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

/* Sidebar Overlay */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.sidebar-overlay.active {
  opacity: 1;
  visibility: visible;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
  }

  .sidebar-toggle {
    display: block;
  }
}

@media (min-width: 769px) {
  .sidebar-toggle {
    display: none;
  }

  .sidebar-overlay {
    display: none;
  }
}

/* Animations */
@keyframes crownPulse {
  0%, 100% {
    transform: scale(1);
    text-shadow: 0 0 15px rgba(255, 193, 7, 0.7);
  }
  50% {
    transform: scale(1.05);
    text-shadow: 0 0 25px rgba(255, 193, 7, 0.9), 0 0 35px rgba(255, 107, 53, 0.5);
  }
}

@keyframes sidebarBackgroundShift {
  0% {
    background-position: 50% 0%;
  }
  100% {
    background-position: 50% 100%;
  }
}

/* Scrollbar Styling */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 193, 7, 0.3);
  border-radius: 10px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 193, 7, 0.5);
}
</style>