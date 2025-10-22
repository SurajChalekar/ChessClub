<template>
  <div class="tournaments-page">
    <section class="tournaments-hero position-relative overflow-hidden">
      <div class="hero-background"></div>
      <div class="chess-pattern-bg"></div>
      <div class="container position-relative z-3">
        <div class="row justify-content-center text-center">
          <div class="col-lg-8">
            <div class="hero-content py-5 d-flex flex-column align-items-center">
              <div class="hero-badge mb-4">
                <span class="badge bg-gradient-danger px-4 py-3 fs-6 rounded-pill">
                  <i class="fas fa-chess-king me-2"></i>Tournament Arena
                </span>
              </div>
              <h1 class="hero-title mb-4">
                <span class="chess-icon">🏆</span>
                <span class="text-glow">Tournaments</span>
              </h1>
              <p class="hero-subtitle mb-4">
                Browse ongoing, upcoming, and past events hosted by the club.
              </p>
              <div class="hero-stats d-flex justify-content-center gap-4 flex-wrap">
                <div class="stat-item">
                  <div class="stat-number">{{ ongoingTournaments.length }}</div>
                  <div class="stat-label">Ongoing Battles</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ upcomingTournaments.length }}</div>
                  <div class="stat-label">Upcoming Events</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ pastTournaments.length }}</div>
                  <div class="stat-label">Completed Events</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="tournament-sections py-5 bg-dark-chess">
      <div class="container">
        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-warning" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3">Loading the latest tournaments...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger text-center">
          <i class="fas fa-exclamation-triangle me-2"></i>
          <strong>Failed to load tournaments:</strong> {{ error }}
        </div>
        
        <div v-else>
          <div class="ongoing-section mb-5">
            <h2 class="section-title text-center mb-4">Ongoing Battles <i class="fas fa-flag-checkered"></i></h2>
            <div v-if="ongoingTournaments.length > 0" class="row row-cols-1 row-cols-lg-2 g-4">
              <div v-for="tournament in ongoingTournaments" :key="tournament.TournamentID" class="col">
                <TournamentCard :tournament="tournament" category="ongoing" @view-details="handleViewDetails(tournament)" />
              </div>
            </div>
            <p v-else class="text-center text-muted">No battles are currently raging.</p>
          </div>

          <hr class="tournament-divider my-5" />

          <div class="upcoming-section mb-5">
            <h2 class="section-title text-center mb-4">Upcoming Challenges <i class="fas fa-calendar-alt"></i></h2>
            <div v-if="upcomingTournaments.length > 0" class="upcoming-list-scroll chess-shadow p-3">
              <div class="row row-cols-1 row-cols-lg-2 g-3">
                <div v-for="tournament in upcomingTournaments" :key="tournament.TournamentID" class="col">
                  <TournamentCard :tournament="tournament" category="upcoming" @view-details="handleViewDetails(tournament)" />
                </div>
              </div>
            </div>
            <p v-else class="text-center text-muted">No upcoming tournaments scheduled yet.</p>
          </div>

          <hr class="tournament-divider my-5" />

          <div class="past-section">
            <h2 class="section-title text-center mb-4">
              <button class="btn btn-dark-outline-gold w-100 py-3" type="button" data-bs-toggle="collapse" data-bs-target="#pastTournamentsCollapse" aria-expanded="false" aria-controls="pastTournamentsCollapse">
                Past Tournaments <i class="fas fa-history me-2"></i> ({{ pastTournaments.length }})
              </button>
            </h2>
            <div class="collapse" id="pastTournamentsCollapse">
              <div v-if="pastTournaments.length > 0" class="row row-cols-1 row-cols-lg-3 g-3 p-3 chess-shadow">
                <div v-for="tournament in pastTournaments" :key="tournament.TournamentID" class="col">
                  <TournamentCard :tournament="tournament" category="past" @view-details="handleViewDetails(tournament)" />
                </div>
              </div>
              <p v-else class="text-center text-muted py-4">No past tournaments recorded.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import TournamentCard from './TournamentCard.vue';

const router = useRouter();
const allTournaments = ref([]);
const isLoading = ref(true);
const error = ref(null);

const displayableTournaments = computed(() => {
  return allTournaments.value.filter(t => t.DisplayStatus === 'Primary');
});

const ongoingTournaments = computed(() => displayableTournaments.value.filter(t => t.Status === 'Ongoing'));
const upcomingTournaments = computed(() => displayableTournaments.value.filter(t => t.Status === 'Upcoming'));
const pastTournaments = computed(() => displayableTournaments.value.filter(t => t.Status === 'Completed'));


const fetchTournaments = async () => {
  const url = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTR0IoPJT90A5D4QX8zfnB6-v8OB5i1KXD7j2yfGA4eFnNRuXel-nYkaEWtcSw7ZqxD3LnK5_Q3lTpy/pub?gid=0&single=true&output=csv`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Network response was not ok (${response.status}): ${errorText}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split(/\r?\n/);

    if (lines.length <= 1) {
      allTournaments.value = [];
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1);

    allTournaments.value = rows.map(line => {
      if (!line.trim()) return null; 
      const tournamentObject = {};
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

      headers.forEach((header, index) => {
        if (values[index]) {
          tournamentObject[header] = values[index].trim().replace(/^"|"$/g, '');
        } else {
          tournamentObject[header] = '';
        }
      });
      return tournamentObject;
    }).filter(Boolean);

  } catch (e) {
    console.error('Failed to fetch tournaments:', e);
    error.value = e.message; 
  } finally {
    isLoading.value = false;
  }
};

const handleViewDetails = (tournament) => {
  router.push({ 
    name: 'generic-tournament-details', 
    params: { id: tournament.TournamentID } 
  });
};

onMounted(() => {
  document.title = 'Tournament Arena - Overview';
  fetchTournaments();
});
</script>

<style scoped>
/* All your existing styles remain unchanged */
.tournaments-page {
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%);
  color: #e0e0eD;
}
.tournaments-hero {
  background: radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0a0a0a 100%);
  padding: 6rem 0;
}
.tournaments-hero .row {
  min-height: 65vh;
}
.hero-background {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(45deg, transparent 40%, rgba(220, 53, 69, 0.05) 50%, transparent 60%), linear-gradient(-45deg, transparent 40%, rgba(255, 193, 7, 0.05) 50%, transparent 60%);
  animation: heroShift 20s ease-in-out infinite alternate;
}
.chess-pattern-bg {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background-image: repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 80px), repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(220,53,69,0.02) 40px, rgba(220,53,69,0.02) 80px);
  opacity: 0.3;
}

/* Fixes badge icon alignment */
.hero-badge .badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem; 
}

.hero-title {
  font-size: 4.5rem;
  font-weight: 900;
  letter-spacing: -1px;
  margin-bottom: 1.5rem;
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
  font-weight: 400;
  opacity: 0.9;
  line-height: 1.8;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}
.chess-icon {
  font-size: 0.9em;
  margin-right: 15px;
  filter: drop-shadow(0 0 20px rgba(255, 165, 0, 0.7));
}
.hero-stats .stat-item {
  text-align: center;
  padding: 1rem;
}
.hero-stats .stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(45deg, #ffc107, #FFD700);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  display: block;
}
.hero-stats .stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 1px;
}
@keyframes titlePulse {
  0%, 100% { 
    text-shadow: 0 0 30px rgba(255, 165, 0, 0.6);
  }
  50% { 
    text-shadow: 0 0 50px rgba(255, 165, 0, 0.9);
  }
}
@keyframes heroShift { 0% { transform: translateX(-2px); } 100% { transform: translateX(2px); } }

.bg-dark-chess { background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="%230f0f0f"/><rect width="40" height="40" fill="%231a1a1a"/><rect x="40" y="40" width="40" height="40" fill="%231a1a1a"/></svg>') repeat; background-size: 80px 80px; }
.section-title { background: linear-gradient(45deg, #FFD700, #e6b200); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 10px rgba(255, 215, 0, 0.3); font-weight: 800; }
.tournament-divider { border-top: 3px solid rgba(255, 215, 0, 0.3); opacity: 1; margin: 4rem 0; }
.upcoming-list-scroll { max-height: 500px; overflow-y: auto; padding-right: 15px; border: 1px solid rgba(255, 215, 0, 0.1); border-radius: 15px; }
.upcoming-list-scroll::-webkit-scrollbar { width: 8px; }
.upcoming-list-scroll::-webkit-scrollbar-track { background: #1a1a1a; border-radius: 4px; }
.upcoming-list-scroll::-webkit-scrollbar-thumb { background: #FFD700; border-radius: 4px; }
.upcoming-list-scroll::-webkit-scrollbar-thumb:hover { background: #e6b200; }
.chess-shadow { box-shadow: 0 0 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 215, 0, 0.05); }
.btn-dark-outline-gold { color: #FFD700; border-color: #FFD700; background-color: rgba(255, 215, 0, 0.05); font-size: 1.5rem; font-weight: 700; transition: all 0.3s ease; border-radius: 12px; }
.btn-dark-outline-gold:hover { color: #0a0a0a; background-color: #FFD700; border-color: #FFD700; transform: translateY(-2px); box-shadow: 0 5px 20px rgba(255, 215, 0, 0.4); }

/* When Past Tournaments is expanded, tone down the glow so it's not overpowering */
.btn-dark-outline-gold[aria-expanded="true"] {
  transform: none; /* avoid floating effect when expanded */
  background-color: rgba(255,215,0,0.08); /* subtle background */
  color: #FFD700;
  border-color: rgba(255,215,0,0.25);
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.16) !important; /* much softer glow */
}

/* Also reduce focus ring/glow when expanded to keep it subtle */
.btn-dark-outline-gold[aria-expanded="true"]:focus {
  box-shadow: 0 2px 10px rgba(255,215,0,0.18) !important;
  outline: none;
}


/* ============================================= */
/* == RESPONSIVE ADJUSTMENTS FOR MOBILE/TABLET == */
/* ============================================= */

/* Tablet (Medium Screens) */
@media (max-width: 991px) {
  .tournaments-hero {
    padding: 5rem 0; 
  }
  .hero-title {
    font-size: 3.8rem; 
  }
  .hero-stats .stat-number {
    font-size: 2.3rem; 
  }
}

/* Mobile (Small Screens) */
@media (max-width: 767px) {
  .tournaments-hero {
    padding: 4rem 0; 
  }
  .tournaments-hero .row {
    min-height: auto; 
    padding-bottom: 2rem; 
  }

  /* Make badge smaller */
  .hero-badge .badge {
    font-size: 0.9rem;
    padding: 0.65rem 1rem;
  }

  /* Intentionally stack title & icon */
  .hero-title {
    font-size: 3rem; /* Tweak font size */
    letter-spacing: -0.5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem; /* Space between icon and text */
  }
  
  /* Center icon and remove side margin */
  .chess-icon {
    font-size: 2.5rem; /* Give icon explicit size */
    margin-right: 0; 
  }

  .hero-subtitle {
    font-size: 1.1rem; 
  }

  /* Beautify the stats section */
  .hero-stats {
    flex-direction: column;
    gap: 1rem !important; /* Space between stat items */
    width: 100%;
    padding: 0 1rem; /* Add side padding */
  }

  /* Turn stats into cards */
  .hero-stats .stat-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    text-align: left;
    padding: 1rem;
    background: rgba(255, 215, 0, 0.05); /* Faint gold bg */
    border-radius: 8px; 
    border-left: 4px solid #FFD700; /* Gold accent */
    margin-bottom: 0; /* Use gap instead of margin */
  }

  /* Style the stat number */
  .hero-stats .stat-number {
    font-size: 2.2rem; 
    margin-right: 1rem; /* Space between number and label */
    line-height: 1;
  }

  /* Style the stat label */
  .hero-stats .stat-label {
    font-size: 0.9rem;
    line-height: 1.2;
    opacity: 0.9; /* Make it a bit brighter */
  }

  .section-title {
    font-size: 2rem; 
  }
  .tournament-divider {
    margin: 2.5rem 0; 
  }
  .upcoming-list-scroll {
    max-height: 45vh; 
    padding-right: 5px; 
  }
  .btn-dark-outline-gold {
    font-size: 1.2rem; 
    padding: 0.75rem 1.25rem; 
  }
}
</style>