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
      <button 
        class="navbar-toggler custom-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarContent" 
        aria-controls="navbarContent" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
      >
        <span class="toggler-line"></span>
        <span class="toggler-line"></span>
        <span class="toggler-line"></span>
      </button>

      <!-- Navigation Content -->
      <div class="collapse navbar-collapse" id="navbarContent">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link 
              to="/" 
              class="nav-link nav-link-custom" 
              active-class="active"
              exact-active-class="active"
            >
              <span class="nav-text">Home</span>
              <div class="nav-glow"></div>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link 
              to="/events" 
              class="nav-link nav-link-custom" 
              active-class="active"
            >
              <span class="nav-text">Events</span>
              <div class="nav-glow"></div>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link 
              to="/tournament" 
              class="nav-link nav-link-custom" 
              active-class="active"
            >
              <span class="nav-text">Tournaments</span>
              <div class="nav-glow"></div>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

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
  pointer-events: none;
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

/* CTA Button */
.nav-cta-btn {
  background: transparent;
  border: 2px solid #ffc107;
  color: #ffc107;
  font-weight: 700;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.nav-cta-btn:hover {
  background: rgba(255, 193, 7, 0.1);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(255, 193, 7, 0.3);
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.6s ease;
}

.nav-cta-btn:hover .btn-shine {
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

  .nav-cta-btn {
    margin: 1rem auto 0.5rem auto;
    display: block;
    width: fit-content;
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

<script setup>
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  // Add scroll effect
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