<template>
  <div class="tournaments-page">
    <section class="tournaments-hero position-relative overflow-hidden">
      <div class="hero-background"></div>
      <div class="chess-pattern-bg"></div>
      <div class="container position-relative z-3">
        <div class="row justify-content-center text-center" style="min-height: 65vh;">
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

const SPREADSHEET_ID = '1-Na0JSr6l74JfN-tcqWVTpPrHTpM0nZRQdMTADE3n9g';
const API_KEY = 'AIzaSyAwbUc_sb6qo-N9lrb0Vvl2MjmpUSES_Rc';
const SHEET_NAME = 'TournamentsList';

const router = useRouter();
const tournaments = ref([]);
const isLoading = ref(true);
const error = ref(null);

const ongoingTournaments = computed(() => tournaments.value.filter(t => t.Status === 'Ongoing'));
const upcomingTournaments = computed(() => tournaments.value.filter(t => t.Status === 'Upcoming'));
const pastTournaments = computed(() => tournaments.value.filter(t => t.Status === 'Completed'));

const fetchTournaments = async () => {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Network response was not ok (${response.status}): ${errorData.error.message}`);
        }
        const data = await response.json();
        console.log('Fetched tournament data:', data);
        if (!data.values || data.values.length <= 1) {
            tournaments.value = [];
            return;
        }
        const headers = data.values[0];
        const rows = data.values.slice(1);
        tournaments.value = rows.map(row => {
            const tournamentObject = {};
            headers.forEach((header, index) => {
                tournamentObject[header] = row[index] || '';
            });
            return tournamentObject;
        });
    } catch (e) {
        console.error('Failed to fetch tournaments:', e);
        error.value = e.message;
    } finally {
        isLoading.value = false;
    }
};

const handleViewDetails = (tournament) => {
    // ADD THIS LINE FOR TESTING:
    alert('Button clicked for: ' + tournament.TournamentName);

    // The rest of the function remains the same
    if (tournament.PageType === 'KnightsConquest') {
        router.push({ 
            name: 'knights-conquest-details', 
            params: { id: tournament.TournamentID } 
        });
    } else {
        router.push({ 
            name: 'tournament-details', 
            params: { id: tournament.TournamentID } 
        });
    }
};

onMounted(() => {
    document.title = 'Tournament Arena - Overview';
    fetchTournaments();
});
</script>

<style scoped>
.tournaments-page {
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%);
    color: #e0e0e0;
}
.tournaments-hero {
    background: radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0a0a0a 100%);
    padding: 6rem 0;
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

/* --- CORRECTED HERO STYLES --- */
.hero-title {
    font-size: 4.5rem;
    font-weight: 900;
    letter-spacing: -1px;
    margin-bottom: 1.5rem;
}
.text-glow {
    background: linear-gradient(45deg, #ff8800, #ffc837); /* Vibrant Orange/Yellow */
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 30px rgba(255, 165, 0, 0.7);
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
/* --- END CORRECTED HERO STYLES --- */

@keyframes titlePulse {
  0%, 100% { 
    text-shadow: 0 0 30px rgba(255, 165, 0, 0.6);
  }
  50% { 
    text-shadow: 0 0 50px rgba(255, 165, 0, 0.9);
  }
}
@keyframes heroShift { 0% { transform: translateX(-2px); } 100% { transform: translateX(2px); } }

.bg-dark-chess { background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="%230f0f0f"/><rect width="40" height="40" fill="%231a1a1a"/><rect x="40" y="40" width="40" height="40" fill="%231a1a1a"/></svg>') repeat; background-size: 80px 80px; }
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
</style>