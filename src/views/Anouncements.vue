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
                  <div class="stat-number">{{ featuredEvents.length }}</div>
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
        
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-warning" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Loading...</span>
          </div>
          <h4 class="mt-3 text-white">Loading Announcements...</h4>
        </div>

        <div v-if="error" class="text-center py-5">
          <div class="text-glow display-4 mb-3">⚠️</div>
          <h4 class="text-white">Failed to load announcements.</h4>
          <p class="text-muted">{{ error }}</p>
        </div>

        <div v-if="!loading && !error">
          
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
                <div class="row align-items-start position-relative">
                  <div class="col-lg-8">
                    <div class="featured-content p-5">
                      <div class="d-flex justify-content-between mb-2">
                        <div class="event-badges">
                          <span class="badge" :class="getTypeBadgeClass(item.type)">
                            {{ item.type }}
                          </span>
                          <span class="badge" :class="getLevelBadgeClass(item.level)">
                            {{ item.level }}
                          </span>
                        </div>
                      </div>
                      <div class="featured-icon-wrapper">
                        <div class="featured-icon-animated" v-if="item.icon">{{ item.icon }}</div>
                      </div>

                      <h2 class="featured-title mb-3">{{ item.title }}</h2>
                      <p class="featured-description mb-4">{{ item.description }}</p>
                      <div class="featured-details d-flex flex-wrap gap-4 mb-4">
                        <div class="detail-item" v-if="item.start_date">
                          <i class="fas fa-calendar-alt me-2"></i>
                          <strong v-if="!item.end_date">{{ formatDate(item.start_date) }}</strong>
                          <strong v-else>{{ formatDate(item.start_date) }} to {{ formatDate(item.end_date) }}</strong>
                        </div>
                        <div class="detail-item" v-if="item.time">
                          <i class="fas fa-clock me-2"></i>
                          <strong>{{ item.time }}</strong>
                        </div>
                        <div class="detail-item" v-if="item.participants">
                          <i class="fas fa-users me-2"></i>
                          <strong>{{ item.participants }} members</strong>
                        </div>
                      </div>
                      <a v-if="item.link && item.link_text" :href="item.link" target="_blank" rel="noopener noreferrer" class="btn btn-warning featured-btn px-4 py-2">
                        {{ item.link_text }}
                        <span class="btn-shine"></span>
                      </a>
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
                <div class="detail-row" v-if="event.start_date">
                  <i class="fas fa-calendar-alt me-2 text-warning"></i>
                  <span v-if="!event.end_date">
                    Posted On: <strong>{{ formatDate(event.start_date) }}</strong>
                  </span>
                  <span v-else>
                    Duration: <strong>{{ formatDate(event.start_date) }} to {{ formatDate(event.end_date) }}</strong>
                  </span>
                </div>
                
                <div class="detail-row" v-if="event.location">
                  <i class="fas fa-tag me-2 text-info"></i>
                  <span>Category: <strong>{{ event.location }}</strong></span>
                </div>
                
                <div class="detail-row" v-if="event.participants">
                  <i class="fas fa-users me-2 text-success"></i>
                  <span>Participants: <strong>{{ event.participants }}+</strong></span>
                </div>
              </div>

              <a v-if="event.link && event.link_text" :href="event.link" target="_blank" rel="noopener noreferrer" class="btn btn-outline-warning mt-3 w-100">
                {{ event.link_text }}
              </a>
            </div>

            <div v-if="!loading && !error && events.length === 0" class="col-12 text-center py-5">
              <div class="text-glow display-4 mb-3">🛡️</div>
              <h4 class="text-white">No announcements found.</h4>
              <p class="text-muted">Check back later for new updates!</p>
            </div>
            
            <div v-if="!loading && !error && events.length > 0 && filteredEvents.length === 0" class="col-12 text-center py-5">
              <div class="text-glow display-4 mb-3">🛡️</div>
              <h4 class="text-white">No communiques match your current filter.</h4>
              <button @click="resetFilters" class="btn btn-outline-warning mt-3">Clear Filters</button>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// --- 1. STATE ---
const events = ref([])
const loading = ref(true)
const error = ref(null)

const selectedType = ref('all')
const selectedLevel = ref('all')

// --- 2. DATA FETCHING ---

// !!! PASTE YOUR "PUBLISH TO WEB" .TSV LINK HERE !!!
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSXKR8fjcvYBwbZNjWj0b2f6wK7csX3ZW5-dHlFZJZRFZUBSisySWpO_zggkCtc4_e9xPsdp1KV1xQC/pub?output=tsv'

/**
 * FIXED: A robust TSV-to-JSON parser.
 * This reads Tab-Separated Values to avoid errors with commas.
 * It also converts headers to lowercase and filters drafts.
 */
function tsvToJSON(tsv) {
  const lines = tsv.split(/\r?\n/)
  if (lines.length < 2) return [] // No data or headers

  const result = []
  // Get headers, trim, and convert to lowercase for robust matching
  const headers = lines[0].split('\t').map(h => h.trim().toLowerCase())

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // 1. Skip empty lines
    if (line.length === 0) {
      continue
    }
    
    const obj = {}
    const currentline = line.split('\t')

    // 2. Build the object
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j]
      const value = currentline[j] ? currentline[j].trim() : ''

      // Convert data types
      if (header === 'id' || header === 'participants') {
        obj[header] = Number(value) || 0 // Default to 0 if blank
      } 
      else if (header === 'featured' || header === 'draft') {
        // Handle 'TRUE', 'True', 'true'
        obj[header] = value.toUpperCase() === 'TRUE' 
      } else {
        obj[header] = value
      }
    }
    
    // 3. Filter out drafts and empty rows
    if (obj.draft === true) {
      continue
    }
    // Skip if it doesn't even have a title (likely an empty row)
    if (!obj.title || obj.title.length === 0) {
      continue
    }

    result.push(obj)
  }
  return result
}

onMounted(async () => {
  if (SHEET_URL === 'YOUR_NEW_TSV_LINK_GOES_HERE') {
    error.value = "Please update the SHEET_URL in the component's script."
    loading.value = false
    return
  }

  try {
    const response = await fetch(SHEET_URL)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const tsvText = await response.text()
    
    // Call the new TSV parser
    const jsonData = tsvToJSON(tsvText)
    
    // FIXED: Assign directly. Parser already filtered drafts/empty rows.
    events.value = jsonData
    
  } catch (e) {
    console.error('Error fetching sheet data:', e)
    error.value = 'Could not fetch or parse data from the Google Sheet.'
  } finally {
    loading.value = false
  }
})

// --- 3. COMPUTED PROPERTIES ---
// These computed props will now work correctly
// because the object keys are guaranteed to be lowercase.

const featuredEvents = computed(() => {
  const featured = events.value.filter(e => e.featured === true)
  return featured.sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
})

const filteredEvents = computed(() => {
  let list = events.value.filter(event => {
    const isFeatured = event.featured === true
    const typeMatch = selectedType.value === 'all' || event.type === selectedType.value
    const levelMatch = selectedLevel.value === 'all' || event.level === selectedLevel.value || event.level === 'all'
    return typeMatch && levelMatch && !isFeatured
  })

  list.sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
  
  return list
})

// --- 4. HELPER FUNCTIONS ---

const formatDate = (dateString) => {
  if (!dateString) return ''
  // Parse as local date (not UTC) to avoid off-by-one error
  // Accepts YYYY-MM-DD or YYYY/MM/DD
  const [y, m, d] = dateString.split(/[-\/]/).map(Number)
  if (!y || !m || !d) return dateString
  const date = new Date(y, m - 1, d)
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return date.toLocaleDateString(undefined, options)
}

const getTypeBadgeClass = (type) => {
  const classes = {
    'Tournament Update': 'bg-danger',
    'Learning Workshop': 'bg-primary',
    'Community Meet': 'bg-info',
    'Practice Session': 'bg-success',
  }
  return classes[type] || 'bg-secondary'
}

const getLevelBadgeClass = (level) => {
  const classes = {
    'Beginner': 'bg-success',
    'Intermediate': 'bg-warning',
    'Advanced': 'bg-danger',
    'All': 'bg-secondary'
  }
  return classes[level] || 'bg-secondary'
}

const resetFilters = () => {
  selectedType.value = 'all'
  selectedLevel.value = 'all'
}
</script>

<style scoped>
/* All your previous styles are unchanged */
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
/* Revert to previous spacing for featured-event-card */
.featured-event-card {
  background: linear-gradient(135deg, #2a1810 0%, #1a0f0a 70%, #0a0a0a 100%);
  border: 2px solid rgba(255, 193, 7, 0.3);
  border-radius: 25px;
  overflow: hidden;
  position: relative;
}
.featured-content {
  padding: 3rem;
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

/* Featured event icon wrapper and animation */
.featured-icon-wrapper {
  position: absolute;
  top: 50%;
  right: 4rem;
  transform: translateY(-50%);
  width: 8rem;
  height: 8rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.featured-icon-animated {
  font-size: 9rem;
  color: #ffc107;
  filter: drop-shadow(0 0 30px rgba(255, 193, 7, 0.3));
  animation: featuredIconFloat 5s ease-in-out infinite;
  opacity: 0.8;
  text-align: center;
}

@keyframes featuredIconFloat {
  0%, 100% { transform: translateY(0) rotate(0) scale(1); opacity: 0.7; }
  50% { transform: translateY(-12px) rotate(3deg) scale(1.06); opacity: 0.85; }
}

@media (max-width: 991px) {

    .hero-title {
    font-size: 2.8rem;
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

  .featured-icon {
  filter: drop-shadow(0 0 30px rgba(255, 193, 7, 0.5));
  animation: iconFloat 6s ease-in-out infinite;
}

/* Featured event icon wrapper and animation */
.featured-icon-wrapper {
  position: absolute;
  top: 15%;
  right: 2.5rem;
  transform: translateY(-50%);
  width: 4rem;
  height: 4rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.featured-icon-animated {
  font-size: 5rem;
  color: #ffc107;
  filter: drop-shadow(0 0 30px rgba(255, 193, 7, 0.3));
  animation: featuredIconFloat 5s ease-in-out infinite;
  opacity: 0.8;
  text-align: center;
}

@keyframes featuredIconFloat {
  0%, 100% { transform: translateY(0) rotate(0) scale(1); opacity: 0.7; }
  50% { transform: translateY(-12px) rotate(3deg) scale(1.06); opacity: 0.85; }
}
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

/* ... all other styles ... */
</style>