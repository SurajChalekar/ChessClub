<template>
  <nav class="navbar navbar-expand-lg navbar-dark fixed-top shadow-lg" data-bs-theme="dark">
    <div class="navbar-backdrop"></div>
    <div class="container position-relative">
      <!-- Brand/Logo -->
      <router-link to="/" class="navbar-brand">
        <span class="brand-container">
          <span class="chess-icon">♔</span>
          <span class="brand-text">IISER TVM Chess Club</span>
          <div class="brand-glow"></div>
        </span>
      </router-link>

      <!-- Mobile Toggle Button -->
      <button class="navbar-toggler custom-toggler" type="button" data-bs-toggle="collapse"
        data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false"
        aria-label="Toggle navigation">
        <span class="toggler-line"></span>
        <span class="toggler-line"></span>
        <span class="toggler-line"></span>
      </button>

      <!-- Navigation Content -->
      <div class="collapse navbar-collapse" id="navbarContent">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link to="/" class="nav-link nav-link-custom" active-class="active" exact-active-class="active">
              <span class="nav-text">Home</span>
              <div class="nav-glow"></div>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/anouncements" class="nav-link nav-link-custom" active-class="active">
              <span class="nav-text">Announcements</span> 
              <div class="nav-glow"></div>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/tournament" class="nav-link nav-link-custom" active-class="active">
              <span class="nav-text">Tournaments</span>
              <div class="nav-glow"></div>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/puzzles" class="nav-link nav-link-custom" active-class="active">
              <span class="nav-text">Puzzle</span>
              <div class="nav-glow"></div>
            </router-link>
          </li>
        </ul>

        <!-- Auth Buttons -->
        <div class="auth-buttons ms-lg-3">
          <template v-if="!isLoggedIn">
            <!-- Sign Up can also trigger signInWithGoogle or same modal -->
            <button class="btn auth-btn signup-btn" @click="loginWithGoogle">
              <span class="nav-text">SignIn</span>

              <div class="btn-shine"></div>
            </button>
            <!-- Join Modal -->
          </template>

          <!-- Log Out Button -->
          <template v-else>
            <button class="btn auth-btn login-btn" @click="logout">
              <span class="btn-text">Log Out</span>
              <div class="btn-shine"></div>
            </button>
          </template>
        </div>

      </div>
    </div>
  </nav>


</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

import { auth, provider } from '@/firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'

const router = useRouter()
const isLoggedIn = ref(false)

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
    router.push('/') // redirect to home after logout
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
    console.log(user.email.endsWith('@iisertvm.ac.in'))
    // Restrict only IISER TVM emails
    if (!user.email.endsWith('@iisertvm.ac.in')) {
      alert('Only IISER TVM emails are allowed.')
      errorMessage.value = 'Only IISER TVM emails are allowed.'
      await signOut(auth) // log them out immediately
      return
    }

    userEmail.value = user.email
    alert(`Welcome ${user.displayName || user.email}!`)

  } catch (error) {
    console.error(error)
    errorMessage.value = 'Login failed. Please try again.'
  }
}
// Scroll effect
onMounted(() => {
  const navbar = document.querySelector('.navbar')

  const handleScroll = () => {
    if (window.scrollY > 100) {
      navbar.classList.add('scrolled')
    } else {
      navbar.classList.remove('scrolled')
    }
  }

  window.addEventListener('scroll', handleScroll)

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
})
</script>

<style scoped>
/* === Modal Styling === */
.dark-modal {
  background: linear-gradient(135deg, rgba(20, 20, 30, 0.95), rgba(10, 10, 15, 0.98));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 193, 7, 0.25);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 193, 7, 0.2);
  animation: modalFadeIn 0.4s ease-out;
  overflow: hidden;
}

/* Header */
.dark-modal .modal-header {
  border-bottom: 1px solid rgba(255, 193, 7, 0.15);
  background: rgba(255, 193, 7, 0.05);
  color: #ffc107;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.dark-modal .modal-title i {
  color: #ffc107;
  text-shadow: 0 0 8px rgba(255, 193, 7, 0.7);
}

/* Inputs */
.dark-input {
  display: block;
  width: 100%;
  /* Full width */
  padding: 0.9rem 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 193, 7, 0.3);
  color: #fff;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.dark-input:focus {
  border-color: #ffc107;
  box-shadow: 0 0 12px rgba(255, 193, 7, 0.4);
  outline: none;
}


/* Labels */
.form-label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.4rem;
}

/* Submit Button */
.btn-glow {
  background: linear-gradient(135deg, #ffc107, #ff6b35);
  color: #000;
  font-weight: 800;
  border-radius: 12px;
  border: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.btn-glow:hover {
  background: linear-gradient(135deg, #ff6b35, #dc3545);
  color: #fff;
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.4);
}

.btn-glow i {
  color: #000;
  transition: color 0.3s ease;
}

.btn-glow:hover i {
  color: #fff;
}

/* Close Button */
.btn-close-white {
  filter: invert(1) brightness(1.5);
  opacity: 0.7;
}

.btn-close-white:hover {
  opacity: 1;
}

/* Animation */
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #111;
  padding: 2rem;
  border-radius: 10px;
  color: #fff;
  text-align: center;
}

.modal-content input {
  padding: 0.5rem;
  margin: 1rem 0;
  width: 80%;
  border-radius: 5px;
  border: none;
}

.modal-buttons button {
  margin: 0 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
}

/* Navbar Base Styling */
.navbar {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(15, 15, 25, 0.98) 100%) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 193, 7, 0.1);
  padding: 1rem 0;
  transition: all 0.3s ease;
}

.navbar-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    linear-gradient(90deg, transparent 0%, rgba(255, 193, 7, 0.02) 50%, transparent 100%),
    radial-gradient(circle at 10% 50%, rgba(220, 53, 69, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 90% 50%, rgba(0, 212, 255, 0.03) 0%, transparent 50%);
  animation: navbackgroundShift 15s ease-in-out infinite alternate;
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

.brand-container {
  position: relative;
  display: flex;
  align-items: center;
  z-index: 2;
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

.navbar-brand:hover .brand-glow {
  opacity: 1;
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
  transform: translateY(-3px);
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

.btn-text {
  position: relative;
  z-index: 2;
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

/* Button Shine Effect */
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

/* Scroll Effect */
.navbar.scrolled {
  background: linear-gradient(135deg, rgba(10, 10, 10, 0.98) 0%, rgba(26, 26, 46, 0.99) 100%) !important;
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-bottom-color: rgba(255, 193, 7, 0.2);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
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

  0%,
  100% {
    transform: scale(1);
    text-shadow: 0 0 15px rgba(255, 193, 7, 0.7);
  }

  50% {
    transform: scale(1.05);
    text-shadow: 0 0 25px rgba(255, 193, 7, 0.9), 0 0 35px rgba(255, 107, 53, 0.5);
  }
}

@keyframes navbackgroundShift {
  0% {
    background-position: 0% 50%;
  }

  100% {
    background-position: 100% 50%;
  }
}

/* Smooth Transitions */
* {
  transition: all 0.3s ease;
}

/* Remove default navbar toggler */
.navbar-toggler-icon {
  display: none;
}
</style>
