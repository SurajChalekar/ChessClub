<template>
  <nav class="navbar navbar-expand-lg navbar-dark fixed-top shadow-lg" data-bs-theme="dark">
    <div class="container">
      <!-- Brand -->
      <router-link to="/" class="navbar-brand d-flex align-items-center">
        <span class="chess-icon">♔</span>
        <span class="brand-text ms-2">IISER TVM Chess Club</span>
      </router-link>

      <!-- Mobile Toggle -->
      <button
        class="navbar-toggler custom-toggler"
        type="button"
        @click="menuOpen = !menuOpen"
        :aria-expanded="menuOpen.toString()"
        aria-label="Toggle navigation"
      >
        <span class="toggler-line"></span>
        <span class="toggler-line"></span>
        <span class="toggler-line"></span>
      </button>

      <!-- Collapsible Content -->
      <div :class="['collapse navbar-collapse', { show: menuOpen }]">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link
              to="/"
              class="nav-link nav-link-custom"
              active-class="active"
              exact-active-class="active"
              @click="menuOpen = false"
            >Home</router-link>
          </li>
          <li class="nav-item">
            <router-link
              to="/profile"
              class="nav-link nav-link-custom"  
              active-class="active"
              @click="menuOpen = false"
            >Profile</router-link>
          </li>
          <li class="nav-item">
            <router-link
              to="/anouncements"
              class="nav-link nav-link-custom"
              active-class="active"
              @click="menuOpen = false"
            >Announcements</router-link>
          </li>
          <li class="nav-item">
            <router-link
              to="/tournament"
              class="nav-link nav-link-custom"
              active-class="active"
              @click="menuOpen = false"
            >Tournaments</router-link>
          </li>
          <li class="nav-item">
            <router-link
              to="/analysis"
              class="nav-link nav-link-custom" 
              active-class="active"
              @click="menuOpen = false"
            >Analysis</router-link>
          </li>
          <li class="nav-item">
            <router-link
              to="/bot"
              class="nav-link nav-link-custom"
              active-class="active"
              @click="menuOpen = false"
            >Bot</router-link>
          </li>
          <li class="nav-item">
            <router-link
              to="/puzzles"
              class="nav-link nav-link-custom"
              active-class="active"
              @click="menuOpen = false"
            >Puzzle</router-link>
          </li>
        </ul>

        <div class="auth-buttons d-flex align-items-center ms-lg-3">
          <template v-if="!isLoggedIn">
            <button class="btn auth-btn signup-btn" @click="loginWithGoogle">Sign In</button>
          </template>
          <template v-else>
            <button class="btn auth-btn login-btn" @click="logout">Log Out</button>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth, provider } from '@/firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'

const router = useRouter()
const menuOpen = ref(false)
const isLoggedIn = ref(false)

onAuthStateChanged(auth, user => (isLoggedIn.value = !!user))

const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    if (!user.email.endsWith('@iisertvm.ac.in')) {
      alert('Only IISER TVM emails are allowed.')
      await signOut(auth)
      return
    }
    alert(`Welcome ${user.displayName || user.email}!`)
  } catch (e) {
    console.error(e)
    alert('Login failed.')
  }
}

const logout = async () => {
  try {
    await signOut(auth)
    alert('You have been logged out.')
    router.push('/')
  } catch (e) {
    console.error(e)
  }
}
</script>

<style scoped>
/* Navbar Base Styling */
.navbar {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(15, 15, 25, 0.98) 100%) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 193, 7, 0.1);
  padding: 1rem 0;
  transition: all 0.3s ease;
}

/* Brand Styling */
.navbar-brand {
  color: #ffffff !important;
  text-decoration: none;
  font-weight: 900;
  font-size: 1.8rem;
  position: relative;
  padding: 0.5rem 1rem;
  border-radius: 15px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.brand-text {
  background: linear-gradient(45deg, #ffc107, #ff6b35);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-left: 0.5rem;
}

.chess-icon {
  color: #ffc107;
  font-size: 1.3em;
  text-shadow: 0 0 15px rgba(255, 193, 7, 0.7);
  animation: crownPulse 3s ease-in-out infinite;
  display: inline-block;
}

.navbar-brand:hover {
  transform: translateY(-2px);
}

.navbar-brand:hover .chess-icon {
  transform: rotate(15deg) scale(1.1);
  text-shadow: 0 0 25px rgba(255, 193, 7, 0.9);
}

/* Navigation Links */
.nav-link-custom {
  color: rgba(255, 255, 255, 0.8) !important;
  font-weight: 600;
  padding: 0.7rem 1.2rem !important;
  margin: 0 0.2rem;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
}

.nav-link-custom::before {
  content: '';
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
  z-index: 0;
}

.nav-link-custom:hover {
  color: #ffc107 !important;
  transform: translateY(-3px);
}

.nav-link-custom:hover::before {
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

.nav-link-custom.active::before {
  opacity: 0.7;
  transform: scale(1);
}

/* Auth Buttons Container */
.auth-buttons {
  display: flex;
  gap: 0.8rem;
  align-items: center;
}

/* Auth Button Base */
.auth-btn {
  font-weight: 700;
  padding: 0.6rem 1.5rem;
  border-radius: 25px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
}

/* Login Button */
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

/* Sign Up Button */
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
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.5);
}

/* Custom Mobile Toggle */
.custom-toggler {
  border: none;
  padding: 4px 8px;
  background: transparent;
  position: relative;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.custom-toggler:focus {
  box-shadow: none;
}

.toggler-line {
  display: block;
  width: 25px;
  height: 3px;
  background: linear-gradient(45deg, #ffc107, #ff6b35);
  margin: 4px 0;
  border-radius: 2px;
  transition: all 0.3s ease;
  transform-origin: center;
}

.custom-toggler:hover .toggler-line {
  background: linear-gradient(45deg, #ff6b35, #dc3545);
}

.custom-toggler[aria-expanded="true"] .toggler-line:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.custom-toggler[aria-expanded="true"] .toggler-line:nth-child(2) {
  opacity: 0;
}

.custom-toggler[aria-expanded="true"] .toggler-line:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

/* Critical: Ensure collapse works */
.collapse {
  display: none;
}

.collapse.show {
  display: block !important;
}

/* Mobile Styles */
@media (max-width: 991.98px) {
  .navbar-collapse {
    background: linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(15, 15, 25, 0.99) 100%);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    margin-top: 1rem;
    border-radius: 15px;
    border: 1px solid rgba(255, 193, 7, 0.1);
    padding: 1.5rem;
  }

  .navbar-nav {
    text-align: center;
    padding: 0.5rem 0;
  }

  .nav-item {
    margin: 0.3rem 0;
  }

  .nav-link-custom {
    padding: 1rem 1.5rem !important;
    margin: 0.2rem 0;
    width: 100%;
    text-align: center;
  }

  .auth-buttons {
    flex-direction: column;
    margin-top: 1.5rem;
    width: 100%;
    gap: 0.8rem;
  }

  .auth-btn {
    width: 100%;
    padding: 1rem 1.5rem;
  }

  .navbar-brand {
    font-size: 1.5rem;
  }
}

@media (max-width: 576px) {
  .navbar-brand {
    font-size: 1.3rem;
    padding: 0.3rem 0.8rem;
  }

  .brand-text {
    margin-left: 0.3rem;
  }

  .chess-icon {
    font-size: 1.1em;
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

/* Remove default navbar toggler icon */
.navbar-toggler-icon {
  display: none;
}
</style>