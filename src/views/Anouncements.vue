<template>
  <div class="events-page">
    <section class="events-hero position-relative overflow-hidden">
      <div class="hero-background"></div>
      <div class="chess-pattern-bg"></div>
      <div class="container position-relative z-3">
        <div class="row justify-content-center text-center" style="min-height: 65vh;">
          <div class="col-lg-8">
            <div class="hero-content py-5">
              <div class="hero-badge mb-4">
                <span class="badge bg-gradient-danger px-4 py-3 fs-6 rounded-pill">
                  <i class="fas fa-bullhorn me-2"></i>Latest Updates
                </span>
              </div>
              <h1 class="hero-title mb-4">
                <span class="chess-icon">📢</span>
                <span class="text-glow">Announcements</span>
              </h1>
              <p class="hero-subtitle mb-4">
                All urgent and latest news regarding the club is posted here.
              </p>
              <div class="hero-stats d-flex justify-content-center gap-4 flex-wrap">
                <div class="stat-item">
                  <div class="stat-number">1</div>
                  <div class="stat-label">Important News</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="filter-section py-4" style="display: none;">
      <div class="container">
        </div>
    </section>

    <section class="events-content py-5">
      <div class="container">
        <div class="row mb-5" v-if="featuredEvents.length">
          <div class="col-12">
            <div class="section-header text-center mb-4">
              <div class="section-badge mb-3">
                <span class="badge bg-warning text-dark px-4 py-2 rounded-pill">
                  <i class="fas fa-exclamation-triangle me-2"></i>Pinned Notice
                </span>
              </div>
            </div>

            <div v-for="item in featuredEvents" :key="item.id" class="featured-event-card mb-4">
              <div class="featured-bg"></div>
              <div class="row align-items-center">
                <div class="col-lg-8">
                  <div class="featured-content p-5">
                    <h2 class="featured-title mb-3">{{ item.title }}</h2>
                    <p class="featured-description mb-4">{{ item.description }}</p>
                    <div class="featured-details d-flex flex-wrap gap-4 mb-4">
                      <div class="detail-item">
                        <i class="fas fa-calendar-alt me-2"></i>
                        <strong>{{ formatDate(item.date) }}</strong>
                      </div>
                      <div class="detail-item">
                        <i class="fas fa-clock me-2"></i>
                        <strong>{{ item.time }}</strong>
                      </div>
                      <div class="detail-item">
                        <i class="fas fa-users me-2"></i>
                        <strong>{{ item.participants }} members</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <div class="section-header text-center mb-5 mt-5">
              <h2 class="section-title">Latest Communiques</h2>
              <p class="section-subtitle">All announcements, sorted from newest to oldest.</p>
            </div>
          </div>
        </div>

        <div class="events-grid">
          <div 
            v-for="event in filteredEvents" 
            :key="event.id" 
            class="event-card shadow-lg"
          >
            <div class="card-glow"></div>
            <div class="event-header">
              <div class="event-info">
                <h3 class="event-title">{{ event.title }}</h3>
                <div class="event-badges">
                  <span class="badge" :class="getTypeBadgeClass(event.type)">
                    {{ event.type }}
                  </span>
                  <span class="badge" :class="getLevelBadgeClass(event.level)">
                    {{ event.level }}
                  </span>
                </div>
              </div>
              <div class="event-icon">{{ event.icon }}</div>
            </div>

            <p class="event-description">{{ event.description }}</p>
            
            <hr class="my-3 opacity-25">

            <div class="event-details mt-3">
              <div class="detail-row">
                <i class="fas fa-calendar-alt me-2 text-warning"></i>
                <span>Posted On: <strong>{{ formatDate(event.date) }}</strong></span>
              </div>
              <div class="detail-row">
                <i class="fas fa-tag me-2 text-info"></i>
                <span>Category: <strong>{{ event.location }}</strong></span>
              </div>
              <div class="detail-row">
                <i class="fas fa-users me-2 text-success"></i>
                <span>Participants: <strong>{{ event.participants }}+</strong></span>
              </div>
            </div>
          </div>

          <div v-if="filteredEvents.length === 0" class="col-12 text-center py-5">
            <div class="text-glow display-4 mb-3">🛡️</div>
            <h4 class="text-white">No communiques match your current filter.</h4>
            <button @click="resetFilters" class="btn btn-outline-warning mt-3">Clear Filters</button>
          </div>
        </div>

      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const selectedType = ref('all')
const selectedLevel = ref('all')

const events = ref([
  { // 👑 IMPORTANT NEWS (PINNED) - ICON: QUEEN
    id: 1,
    title: "Knight's Conquest",
    date: '09-09-2025', 
    time: 'Saturday:21:30, Sunday 15:00',
    type: 'Open League Championship',
    level: 'All',
    description: 'IPL-like Franchise based featured league tournament of IISER TVM',
    participants: 53,
    location: 'CDH 2',
    status: 'Ongoing',
    featured: true, 
    icon: '♛' // 🎯 Queen Icon
  },
  {
    id: 4,
    title: "ITSAV",
    date: '10-17-2025', 
    time: 'Friday:21:00, Sunday 15:00',
    type: 'Open Arena Championship',
    level: 'All',
    description: 'The ultimate test of chess supremacy. Battle of 4 teams in a 10v10v10v10 swiss Arena conquest. Winner takes the crown.',
    participants: 47,
    location: 'CDH 2',
    status: 'Completed',
    featured: true, 
    icon: '♛'
  },
  /*{ // ♟️ LATEST COMMUNIQUE (Newest) - ICON: PAWN
    id: 4,
    title: '📅 Coming Soon',
    date: '2025-10-02', 
    time: '20:00',
    type: 'tournament',
    level: 'advanced',
    description: 'Congratulations to all participants! The final standings and prize distribution for the Winter Blitz Challenge are now officially published. Check the club forum for the full breakdown.',
    participants: 12,
    maxParticipants: 64,
    prizePool: 10000,
    location: 'Tournament News',
    status: 'open',
    featured: false,
    icon: '♟️' // 🎯 Pawn Icon
  },*/
  { // ♟️ LATEST COMMUNIQUE (Older) - ICON: PAWN
    id: 3,
    title: '📚 Weekly Chess Learning Sessions',
    date: '2025-09-25', 
    time: '15:00',
    type: 'Interactive Workshop',
    level: 'Beginner and Newbie',
    description: 'We are thrilled to announce a learning series on chess lessons, open to members of Beginners and Newbie Level.',
    participants: 20,
    location: 'CDH-2',
    status: 'Ongoing',
    featured: false,
    icon: '♟️' // 🎯 Pawn Icon
  },
  { // ♟️ LATEST COMMUNIQUE (Oldest) - ICON: PAWN
    id: 2,
    title: 'Chess Club Introduction Session',
    date: '2025-09-13', 
    time: '16:40',
    type: 'Introduction and Intearaction',
    level: 'ALl',
    description: "Introduction session for all freshers to get a glimpse of functioning of chess club, it's activities and Future plans ",
    participants: 20,
    location: 'CDH-2',
    status: 'Conducted',
    featured: false,
    icon: '♟️' // 🎯 Pawn Icon
  },
])

const parseDDMMYYYY = (d) => {
  if (!d) return new Date(0);
  const m = String(d).match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  const alt = new Date(d);
  return isNaN(alt.getTime()) ? new Date(0) : alt;
};

const featuredEvents = computed(() => {
  const featured = events.value.filter(e => e.featured);
  return featured.sort((a, b) => parseDDMMYYYY(b.date) - parseDDMMYYYY(a.date));
});
const upcomingEvents = computed(() => events.value.filter(event => new Date(event.date) > new Date()))
const totalParticipants = computed(() => events.value.reduce((sum, event) => sum + event.participants, 0))

const filteredEvents = computed(() => {
  let list = events.value.filter(event => {
    // Exclude any featured items and apply user filters
    const isFeatured = !!event.featured;
    const typeMatch = selectedType.value === 'all' || event.type === selectedType.value;
    const levelMatch = selectedLevel.value === 'all' || event.level === selectedLevel.value || event.level === 'all';
    return typeMatch && levelMatch && !isFeatured;
  })

  // Sorts the list by date, newest date first (descending)
  list.sort((a, b) => new Date(b.date) - new Date(a.date))
  
  return list
})

const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

const getTypeBadgeClass = (type) => {
  const classes = {
    tournament: 'bg-primary',
    workshop: 'bg-info',
    championship: 'bg-danger'
  }
  return classes[type] || 'bg-secondary'
}

const getLevelBadgeClass = (level) => {
  const classes = {
    beginner: 'bg-success',
    intermediate: 'bg-warning',
    advanced: 'bg-danger',
    all: 'bg-secondary'
  }
  return classes[level] || 'bg-secondary'
}

const resetFilters = () => {
  selectedType.value = 'all'
  selectedLevel.value = 'all'
}

onMounted(() => {
  document.title = 'IISER-TVM Chess Club - Announcements'
})
</script>

<style scoped>
/* Global Styles */
.events-page {
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%);
  color: #e0e0e0;
  min-height: 100vh;
  padding-top: 0px;
}

/* Hero Section */
.events-hero {
  background: radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0a0a0a 100%);
  padding: 6rem 0;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(45deg, transparent 40%, rgba(220, 53, 69, 0.05) 50%, transparent 60%),
    linear-gradient(-45deg, transparent 40%, rgba(255, 193, 7, 0.05) 50%, transparent 60%);
  animation: heroShift 20s ease-in-out infinite alternate;
}

.chess-pattern-bg {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 80px),
    repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(220,53,69,0.02) 40px, rgba(220,53,69,0.02) 80px);
  opacity: 0.3;
}

.hero-title {
  font-size: 4rem;
  font-weight: 900;
  letter-spacing: -2px;
}

.text-glow {
  background: linear-gradient(45deg, #dc3545, #ffc107, #f72585);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 40px rgba(220, 53, 69, 0.5);
  animation: titlePulse 4s ease-in-out infinite;
}

.hero-subtitle {
  font-size: 1.3rem;
  opacity: 0.9;
  line-height: 1.8;
  max-width: 600px;
  margin: 0 auto;
}

.chess-icon {
  font-size: 1.1em;
  margin-right: 15px;
  filter: drop-shadow(0 0 15px rgba(220, 53, 69, 0.7));
}

/* Hero Stats */
.hero-stats .stat-item {
  text-align: center;
  padding: 1rem;
}

.hero-stats .stat-number {
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(45deg, #ffc107, #dc3545);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: block;
}

.hero-stats .stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Filter Section */
.filter-section {
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border-bottom: 1px solid rgba(255, 193, 7, 0.1);
}

.filter-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 193, 7, 0.2);
  border-radius: 20px;
  padding: 2rem;
}


  
.filter-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffc107;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dark-select {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 193, 7, 0.3);
  color: #e0e0e0;
  border-radius: 10px;
  min-width: 150px;
}

.dark-select:focus {
  background: rgba(0, 0, 0, 0.7);
  border-color: #ffc107;
  box-shadow: 0 0 15px rgba(255, 193, 7, 0.3);
}

/* Featured Event */
.featured-event-card {
  background: linear-gradient(135deg, #2a1810 0%, #1a0f0a 70%, #0a0a0a 100%);
  border: 2px solid rgba(255, 193, 7, 0.3);
  border-radius: 25px;
  overflow: hidden;
  position: relative;
}

.featured-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(255, 193, 7, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(220, 53, 69, 0.1) 0%, transparent 50%);
}

.featured-title {
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(45deg, #ffc107, #dc3545);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.featured-description {
  font-size: 1.1rem;
  line-height: 1.7;
  opacity: 0.9;
}

.featured-details .detail-item {
  color: #e0e0e0;
  font-size: 0.95rem;
}

.featured-btn {
  position: relative;
  overflow: hidden;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.featured-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.featured-icon {
  filter: drop-shadow(0 0 30px rgba(255, 193, 7, 0.5));
  animation: iconFloat 6s ease-in-out infinite;
}

/* Events Grid */
.events-content {
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
}

.section-title {
  font-size: 3rem;
  font-weight: 900;
  background: linear-gradient(45deg, #ffc107, #dc3545);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-size: 1.1rem;
  opacity: 0.8;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

/* Event Cards */
.event-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
}

.event-card:hover {
  transform: translateY(-10px) scale(1.02);
  border-color: rgba(255, 193, 7, 0.4);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(255, 193, 7, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.event-card:hover .card-glow {
  opacity: 1;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.event-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.event-badges .badge {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.4rem 0.8rem;
}

.event-icon {
  font-size: 2.5rem;
  opacity: 0.7;
  filter: grayscale(50%);
  transition: all 0.3s ease;
}

.event-card:hover .event-icon {
  opacity: 1;
  filter: grayscale(0%);
  transform: scale(1.1);
}

.event-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffc107;
  margin-bottom: 1rem;
}

.event-description {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  font-size: 0.95rem;
}

.event-details {
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.detail-row:last-child {
  margin-bottom: 0;
}

/* Progress Bar */
.progress-label {
  font-size: 0.85rem;
  font-weight: 600;
}

.dark-progress {
  height: 8px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark-progress .progress-bar {
  border-radius: 10px;
}

/* Buttons */
.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.6s ease;
}

.featured-btn:hover .btn-shine,
.btn:hover .btn-shine {
  left: 100%;
}

/* Responsive */
@media (max-width: 768px) {
  .events-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .hero-title {
    font-size: 2.8rem;
  }
  
  .featured-title {
    font-size: 2rem;
  }

  /* Make featured visual visible on mobile and center it above content */
  .featured-visual { display: block; text-align: center; padding: 1rem 0; }
  .featured-icon { font-size: 3.5rem; display: inline-block; }

  .featured-event-card .row {
    display: flex;
    flex-direction: column;
  }
  .featured-event-card .col-lg-4 { display: block; }
  .featured-content { padding: 1.25rem; }
  
  .filter-card {
    padding: 1.5rem;
  }
  
  .filter-group {
    width: 100%;
    margin-bottom: 1rem;
  }
  
  .dark-select {
    width: 100%;
    min-width: auto;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .hero-stats {
    flex-direction: column;
    gap: 1rem !important; /* Space between stat items */
    width: 100%;
    padding: 0 1rem; /* Add side padding */
  }

  .hero-stats .stat-item {
   display: flex;
    align-items: center;
    justify-content: flex-start;
    text-align: left;
    padding: 1rem;
    background: rgba(255, 215, 0, 0.05); /* Faint gold bg */
    border-radius: 8px; 
    border-left: 4px solid #FFD700; /* Gold accent */
    margin-bottom: 0;
  }

  .hero-stats .stat-number {
    font-size: 3.2rem !important;
    font-weight: 900;
    color: #ff8a00;
    -webkit-text-fill-color: unset;
    margin: 20px ;
    line-height: 1;
  }

 .hero-stats .stat-label {
    font-size: 1.3rem;
    line-height: 1.2;
    opacity: 0.9; /* Make it a bit brighter */
  }



  .events-grid {
    grid-template-columns: 1fr;
  }
  
  .event-card {
    padding: 1.5rem;
  }
  
  .hero-title {
    font-size: 2.2rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
}

/* Tablet specific adjustments: 769px - 1024px */
@media (min-width: 769px) and (max-width: 1024px) {
  /* Slightly reduce the hero title for tablets */
  .hero-title {
    font-size: 3.2rem;
  }

  /* Featured card tweaks: show visual on tablets and keep a comfortable side-by-side layout */
  .featured-title {
    font-size: 2.2rem;
  }
  .featured-visual { display: block; text-align: center; padding: 1rem 0; }
  .featured-icon { font-size: 4rem; display: inline-block; }

  .featured-event-card .row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }
  /* Ensure the visual column (hidden on small) is visible on tablet */
  .featured-event-card .col-lg-4 { display: block; }
  .featured-content { padding: 2.5rem; }

  /* Hero stats: keep horizontal but increase spacing a bit */
  .hero-stats {
    flex-direction: row;
    gap: 2rem;
    justify-content: center;
    align-items: center;
    width: auto;
    padding: 0;
  }
  .hero-stats .stat-number {
    font-size: 3rem;
  }
  .hero-stats .stat-item {
    padding: 0.75rem 1rem;
    background: transparent;
    border-left: none;
    border-radius: 8px;
  }

  /* Events grid: two columns on tablet for better balance */
  .events-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.75rem;
  }
  .event-card {
    padding: 1.75rem;
  }

  .section-title { font-size: 2.6rem; }
}

/* Animations */
@keyframes titlePulse {
  0%, 100% { 
    text-shadow: 0 0 40px rgba(220, 53, 69, 0.5);
  }
  50% { 
    text-shadow: 0 0 60px rgba(220, 53, 69, 0.8), 0 0 80px rgba(255, 193, 7, 0.3);
  }
}

@keyframes heroShift {
  0% { transform: translateX(-2px); }
  100% { transform: translateX(2px); }
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

/* Color Utilities */
.text-purple { color: #8b5cf6; }
</style>