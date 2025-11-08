<template>
  <div class="home">
    <section class="hero-section position-relative overflow-hidden">
      <div class="hero-background"></div>
      <div class="chess-pattern"></div>
      <div class="container-fluid position-relative z-3">
        <div class="row align-items-center min-vh-100">
          <div class="col-lg-8 col-xl-6 mx-auto text-center">
            <div class="hero-content py-5">
              <h1 class="hero-title mb-4">
                <span class="chess-icon">♔</span>
                <span class="text-glow">IISER TVM Chess Club</span>
              </h1>
              <p class="hero-subtitle mb-5">
                Master the art of Sacrifice. Join our elite community of chess
                players and elevate your game beyond mortal limits.
              </p>
              <div
                class="hero-buttons d-flex gap-4 justify-content-center flex-wrap"
              >
                <router-link
                  to="/tournament"
                  class="btn btn-glow btn-warning btn-lg px-5 py-3"
                >
                  <i class="fas fa-trophy me-2"></i>Tournaments
                  <div class="btn-shine"></div>
                </router-link>
                <router-link
                  to="/anouncements"
                  class="btn btn-outline-neon btn-lg px-5 py-3"
                >
                  <i class="fas fa-calendar-alt me-2"></i>View Anouncements
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="floating-pieces">
        <div class="chess-piece piece-1">♛</div>
        <div class="chess-piece piece-2">♜</div>
        <div class="chess-piece piece-3">♝</div>
        <div class="chess-piece piece-4">♞</div>
        <div class="chess-piece piece-5">♟</div>
      </div>
    </section>

    <section class="features-section py-5">
      <div class="container">
        <div class="section-header text-center mb-5">
          <h2 class="section-title mb-4">Dominate the Board</h2>
          <p class="section-subtitle">
            Experience the perfect fusion of tactical brilliance, strategic
            mastery.
          </p>
        </div>

        <div class="row g-4">
          <div class="col-lg-4 col-md-6">
            <div class="feature-card h-100">
              <div class="card-glow"></div>
              <div class="card-body text-center p-5">
                <div class="feature-icon mb-4">
                  <span class="chess-symbol">♕</span>
                </div>
                <h4 class="card-title mb-3">Beginner Mentorship</h4>
                <p class="card-text">
                  Learn from basics and improve your skills
                </p>
              </div>
            </div>
          </div>

          <div class="col-lg-4 col-md-6">
            <div class="feature-card h-100">
              <div class="card-glow"></div>
              <div class="card-body text-center p-5">
                <div class="feature-icon mb-4">
                  <span class="chess-symbol text-danger">♖</span>
                </div>
                <h4 class="card-title mb-3">Elite Tournaments</h4>
                <p class="card-text">
                  Battle in high-stakes tournaments where only the strongest
                  survive.
                </p>
              </div>
            </div>
          </div>

          <div class="col-lg-4 col-md-6 mx-auto mx-lg-0">
            <div class="feature-card h-100">
              <div class="card-glow"></div>
              <div class="card-body text-center p-5">
                <div class="feature-icon mb-4">
                  <span class="chess-symbol text-info">♗</span>
                </div>
                <h4 class="card-title mb-3">Advanced Training</h4>
                <p class="card-text">
                  Become part of elite circle of chess club. Practise weekly
                  against Top players.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="stats-section py-5 position-relative overflow-hidden">
      <div class="stats-bg"></div>
      <div class="container position-relative z-2">
        <div class="row text-center g-4">
          <div class="col-lg-3 col-md-6">
            <div class="stat-item">
              <div class="stat-number">300+</div>
              <div class="stat-label">Knights</div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="stat-item">
              <div class="stat-number">8</div>
              <div class="stat-label">Masters</div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="stat-item">
              <div class="stat-number">10+</div>
              <div class="stat-label">Battles Won</div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="stat-item">
              <div class="stat-number">9+</div>
              <div class="stat-label">Years of Passion for Chess</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="events-section py-5">
      <div class="container">
        <div class="section-header text-center mb-5">
          <h2 class="section-title mb-4">The Arena Awaits</h2>
          <p class="section-subtitle">
            Join the Tournaments and show your Brilliance in these legendary
            contests
          </p>
        </div>
        <div class="hero-stats row g-4 justify-content-center text-center">
          <div class="col-lg-6">
            <div class="event-card h-100">
              <div class="card-header">
                <div class="event-type">👑 IISM</div>
              </div>
              <div class="card-body p-4">
                <h5 class="card-title">Inter-IISER Sports Meet</h5>
                <h5></h5>
                <div class="event-date mb-3">
                  <i class="fas fa-calendar-alt me-2"></i>December, 2025
                </div>
                <p class="card-text">The ultimate test of chess supremacy.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section py-5 position-relative overflow-hidden">
      <div class="cta-bg"></div>
      <div class="container position-relative z-3">
        <div class="row">
          <div class="col-lg-8 mx-auto text-center">
            <div class="cta-content">
              <h2 class="cta-title mb-4">Become a Member now</h2>
              <p class="cta-subtitle mb-5">
                Your journey into chess mastery begins with a single move.
              </p>
              <button
                class="btn btn-cta btn-lg px-5 py-3"
                @click="loginWithGoogle"
              >
                <i class="fas fa-chess-king me-2"></i>Join the Club
                <div class="btn-shine"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <footer class="site-footer py-5">
      <div class="container text-center">
        <p class="mb-2">
          &copy; 2025 IISER TVM Chess Club. All Rights Reserved.
        </p>
        <p class="credits mb-0">
          Co-developed by: Suraj Chalekar & Shubham Sharma
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

import { auth, provider } from '@/firebase'
import { signInWithPopup, signOut } from 'firebase/auth'

const errorMessage = ref('')
const userEmail = ref('')

// Google Sign-In
const loginWithGoogle = async () => {
  errorMessage.value = ''
  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user
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
    console.error('Login error:', error)
    errorMessage.value = `Login failed: ${error.message || error.code || 'Please try again.'}`
    alert(errorMessage.value)
  }
}
// Page effects
onMounted(() => {
  document.title = 'IISER-TVM Chess Club'

  const pieces = document.querySelectorAll('.chess-piece')
  pieces.forEach((piece, index) => {
    piece.style.animationDelay = `${index * 2}s`
  })
})
</script>

<style scoped>
/* Global Dark Theme */
.home {
  background-color: #0a0a0a;
  color: #e0e0e0;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* Hero Section */
.hero-section {
  min-height: 100vh;
  position: relative;
  background: radial-gradient(
    ellipse at center,
    #1a1a2e 0%,
    #16213e 50%,
    #0a0a0a 100%
  );
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
      45deg,
      transparent 40%,
      rgba(255, 193, 7, 0.03) 50%,
      transparent 60%
    ),
    linear-gradient(
      -45deg,
      transparent 40%,
      rgba(220, 53, 69, 0.03) 50%,
      transparent 60%
    );
  animation: backgroundShift 20s ease-in-out infinite alternate;
}

.chess-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 50px,
      rgba(255, 255, 255, 0.01) 50px,
      rgba(255, 255, 255, 0.01) 100px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 50px,
      rgba(255, 255, 255, 0.01) 50px,
      rgba(255, 255, 255, 0.01) 100px
    );
  opacity: 0.3;
}

.hero-title {
  font-size: 4.5rem;
  font-weight: 900;
  letter-spacing: -2px;
  margin-bottom: 2rem;
}

.text-glow {
  background: linear-gradient(45deg, #ffc107, #ff6b35, #f72585);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(255, 193, 7, 0.5);
  animation: titleGlow 3s ease-in-out infinite alternate;
}

.hero-subtitle {
  font-size: 1.4rem;
  line-height: 1.8;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.chess-icon {
  font-size: 1.2em;
  margin-right: 15px;
  color: #ffc107;
  filter: drop-shadow(0 0 10px rgba(255, 193, 7, 0.7));
}

/* Floating Chess Pieces */
.floating-pieces {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.chess-piece {
  position: absolute;
  font-size: 3rem;
  color: rgba(255, 193, 7, 0.1);
  animation: float 15s linear infinite;
}

.piece-1 {
  top: 20%;
  left: 10%;
  animation-duration: 20s;
}

.piece-2 {
  top: 60%;
  right: 15%;
  animation-duration: 25s;
  animation-direction: reverse;
}

.piece-3 {
  top: 80%;
  left: 20%;
  animation-duration: 18s;
}

.piece-4 {
  top: 30%;
  right: 25%;
  animation-duration: 22s;
  animation-direction: reverse;
}

.piece-5 {
  top: 70%;
  left: 70%;
  animation-duration: 16s;
}

/* Buttons */
.btn-glow {
  position: relative;
  overflow: hidden;
  border: none;
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.3);
  transition: all 0.3s ease;
}

.btn-glow:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(255, 193, 7, 0.6);
}

.btn-outline-neon {
  border: 2px solid #00d4ff;
  color: #00d4ff;
  background: transparent;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.btn-outline-neon:hover {
  background: rgba(0, 212, 255, 0.1);
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
  transform: translateY(-3px);
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.6s ease;
}

.btn-glow:hover .btn-shine {
  left: 100%;
}

/* Feature Cards */
.features-section {
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
  padding: 8rem 0;
}

.feature-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border: 1px solid rgba(255, 193, 7, 0.1);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
}

.feature-card:hover {
  transform: translateY(-15px) scale(1.02);
  border-color: rgba(255, 193, 7, 0.4);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at center,
    rgba(255, 193, 7, 0.1) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
}

.feature-card:hover .card-glow {
  opacity: 1;
}

.chess-symbol {
  font-size: 4rem;
  color: #ffc107;
  text-shadow: 0 0 20px rgba(255, 193, 7, 0.5);
  display: block;
  margin: 0 auto;
}

/* Stats Section */
.stats-section {
  background: #0a0a0a;
  padding: 6rem 0;
}

.stats-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    rgba(220, 53, 69, 0.05),
    rgba(255, 193, 7, 0.05)
  );
}

.stat-number {
  font-size: 4rem;
  font-weight: 900;
  background: linear-gradient(45deg, #ffc107, #dc3545);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

.stat-label {
  font-size: 1.2rem;
  opacity: 0.8;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* Events Section */
.events-section {
  background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
  padding: 8rem 0;
}

.event-card {
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s ease;
}

.event-card:hover {
  transform: translateY(-10px);
  border-color: rgba(255, 193, 7, 0.3);
}

.event-card .card-header {
  background: linear-gradient(135deg, #dc3545, #8b1538);
  border: none;
  padding: 1.5rem;
}

.event-type {
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
}

.event-date {
  color: #ffc107;
  font-weight: 600;
}

/* CTA Section */
.cta-section {
  background: radial-gradient(
    ellipse at center,
    #2a1810 0%,
    #1a0f0a 70%,
    #0a0a0a 100%
  );
  padding: 8rem 0;
}

.cta-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
      circle at 20% 30%,
      rgba(255, 193, 7, 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 70%,
      rgba(220, 53, 69, 0.1) 0%,
      transparent 50%
    );
}

.cta-title {
  font-size: 3.5rem;
  font-weight: 900;
  background: linear-gradient(45deg, #ffc107, #dc3545, #6f42c1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cta-subtitle {
  font-size: 1.3rem;
  opacity: 0.9;
  max-width: 500px;
  margin: 0 auto;
}

.btn-cta {
  background: linear-gradient(45deg, #ffc107, #ff6b35);
  border: none;
  color: #000;
  font-weight: bold;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(255, 193, 7, 0.3);
  transition: all 0.3s ease;
}

.btn-cta:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(255, 193, 7, 0.5);
}

/* NEW: Footer Section */
.site-footer {
  background-color: #050505; /* A slightly darker black for separation */
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #a0a0a0; /* Muted color, doesn't grab attention */
  font-size: 0.9rem;
}

.site-footer .credits {
  font-size: 1rem;
  opacity: 0.89;
  transition: all 0.3s ease;
}

.site-footer .credits:hover {
  opacity: 1;
  color: #ffc107; /* Add a little "glow" on hover */
}

/* Modal */
.dark-modal {
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border: 1px solid rgba(255, 193, 7, 0.2);
  border-radius: 20px;
  color: #e0e0e0;
}

.dark-modal .modal-header {
  border-bottom: 1px solid rgba(255, 193, 7, 0.2);
  background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);
}

.dark-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 193, 7, 0.2);
  color: #e0e0e0;
  border-radius: 10px;
}

.dark-input:focus {
  background: rgba(255, 255, 255, 0.08);
  border-color: #ffc107;
  box-shadow: 0 0 10px rgba(255, 193, 7, 0.3);
  color: #fff;
}

/* Section Headers */
.section-title {
  font-size: 3rem;
  font-weight: 900;
  background: linear-gradient(45deg, #ffc107, #dc3545);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-size: 1.2rem;
  opacity: 0.8;
  max-width: 600px;
  margin: 0 auto;
}

/* Animations */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.1;
  }

  50% {
    transform: translateY(-30px) rotate(180deg);
    opacity: 0.3;
  }
}

@keyframes titleGlow {
  0% {
    text-shadow: 0 0 20px rgba(255, 193, 7, 0.5);
  }

  100% {
    text-shadow: 0 0 40px rgba(255, 193, 7, 0.8),
      0 0 60px rgba(220, 53, 69, 0.3);
  }
}

@keyframes backgroundShift {
  0% {
    transform: translateX(-5px);
  }

  100% {
    transform: translateX(5px);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.8rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .section-title {
    font-size: 2.2rem;
  }

  .cta-title {
    font-size: 2.5rem;
  }

  .chess-piece {
    font-size: 2rem;
  }

  .stat-number {
    font-size: 3rem;
  }
}

@media (max-width: 576px) {
  .hero-title {
    font-size: 2.2rem;
  }

  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }

  .hero-buttons .btn {
    width: 100%;
    max-width: 280px;
  }
}
</style>