<template>
    <div class="tournaments-page">
        <section class="tournaments-hero position-relative overflow-hidden">
            <div class="hero-background"></div>
            <div class="battle-pattern"></div>
            <div class="container position-relative z-3">
                <div class="row justify-content-center text-center">
                    <div class="col-lg-8">
                        <div class="hero-content py-5">
                            <div class="hero-badge mb-4">
                                <span class="badge bg-gradient-danger px-4 py-3 fs-6 rounded-pill">
                                    <i class="fas fa-chess-king me-2"></i>The Gauntlet is Set
                                </span>
                            </div>
                            <h1 class="hero-title mb-4">
                                <span class="battle-icon">♔</span>
                                <span class="text-glow">The Royal Arena</span>
                            </h1>
                            <p class="hero-subtitle mb-5">
                                Enter the crucible where legends are forged and champions are crowned.
                                Only the strongest warriors shall claim victory and eternal glory.
                            </p>
                            <div class="hero-stats row g-4 justify-content-center text-center">
                                <div class="col-md-3 col-6">
                                    <div class="stat-card">
                                        <div class="stat-number">{{ ongoingTournaments.length }}</div>
                                        <div class="stat-label">Ongoing Battles</div>
                                    </div>
                                </div>
                                <div class="col-md-3 col-6">
                                    <div class="stat-card">
                                        <div class="stat-number">{{ upcomingTournaments.length }}</div>
                                        <div class="stat-label">Upcoming Events</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="tournament-sections py-5 bg-dark-chess">
            <div class="container">

                <div class="ongoing-section mb-5">
                    <h2 class="section-title text-center mb-4">Ongoing Battles <i class="fas fa-flag-checkered"></i></h2>
                    <div class="row row-cols-1 row-cols-lg-2 g-4">
                        <div v-for="tournament in ongoingTournaments" :key="tournament.id" class="col">
                            <TournamentCard :tournament="tournament" category="ongoing" @move-to="moveTournament" @view-details="handleViewDetails" />
                        </div>
                    </div>
                </div>

                <hr class="tournament-divider my-5" />

                <div class="upcoming-section mb-5">
                    <h2 class="section-title text-center mb-4">Upcoming Challenges <i class="fas fa-calendar-alt"></i></h2>
                    <div class="upcoming-list-scroll chess-shadow p-3">
                        <div class="row row-cols-1 row-cols-lg-2 g-3">
                            <div v-for="tournament in upcomingTournaments" :key="tournament.id" class="col">
                                <TournamentCard :tournament="tournament" category="upcoming" @move-to="moveTournament" @view-details="handleViewDetails" />
                            </div>
                        </div>
                        <p v-if="upcomingTournaments.length === 0" class="text-center">No upcoming tournaments scheduled yet.</p>
                    </div>
                </div>

                <hr class="tournament-divider my-5" />

                <div class="past-section">
                    <h2 class="section-title text-center mb-4">
                        <button class="btn btn-dark-outline-gold w-100 py-3" type="button" data-bs-toggle="collapse" data-bs-target="#pastTournamentsCollapse" aria-expanded="false" aria-controls="pastTournamentsCollapse">
                            Past Tournaments <i class="fas fa-history me-2"></i> ({{ pastTournaments.length }})
                        </button>
                    </h2>
                    <div class="collapse" id="pastTournamentsCollapse">
                        <div class="row row-cols-1 row-cols-lg-3 g-3 p-3 chess-shadow">
                            <div v-for="tournament in pastTournaments" :key="tournament.id" class="col">
                                <TournamentCard :tournament="tournament" category="past" @move-to="moveTournament" @view-details="handleViewDetails" />
                            </div>
                        </div>
                        <p v-if="pastTournaments.length === 0" class="text-center text-muted py-4">No past tournaments recorded.</p>
                    </div>
                </div>

            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { initialTournaments } from '../data/T1.js';
import TournamentCard from './TournamentCard.vue'; // <-- This import is crucial

const router = useRouter();

const tournaments = ref(initialTournaments);

const ongoingTournaments = computed(() =>
    tournaments.value.filter(t => t.status === 'ongoing' || t.status === 'active')
);
const upcomingTournaments = computed(() =>
    tournaments.value.filter(t => t.status === 'scheduled' || t.status === 'registration')
);
const pastTournaments = computed(() =>
    tournaments.value.filter(t => t.status === 'completed')
);

const moveTournament = (id, targetCategory) => {
    const tournament = tournaments.value.find(t => t.id === id);
    if (tournament) {
        const newStatus = targetCategory === 'ongoing' ? 'active' : targetCategory === 'upcoming' ? 'scheduled' : 'completed';
        tournament.status = newStatus;
    }
};

const handleViewDetails = (tournamentId) => {
    const tournament = tournaments.value.find(t => t.id === tournamentId);
    if (tournament) {
        router.push({ name: 'tournament-details', params: { id: tournamentId } });
    }
};

onMounted(() => {
    document.title = 'Tournament Arena - Overview';
});
</script>

<style scoped>
/* All styles remain the same */
.tournaments-page {
    background: linear-gradient(135deg, #050505 0%, #101820 50%, #050505 100%);
    color: #e0e0e0;
    min-height: 100vh;
}

.tournaments-hero {
    background: radial-gradient(ellipse at center, #101820 0%, #0a0a0a 100%);
    padding: 6rem 0;
}

.hero-background {
    background:
        linear-gradient(45deg, transparent 40%, rgba(255, 215, 0, 0.05) 50%, transparent 60%),
        linear-gradient(-45deg, transparent 40%, rgba(220, 53, 69, 0.05) 50%, transparent 60%);
    animation: heroShift 20s ease-in-out infinite alternate;
}

.battle-pattern {
    background-image:
        repeating-linear-gradient(30deg, transparent, transparent 30px, rgba(255, 215, 0, 0.03) 30px, rgba(255, 215, 0, 0.03) 60px),
        repeating-linear-gradient(-30deg, transparent, transparent 30px, rgba(220, 53, 69, 0.03) 30px, rgba(220, 53, 69, 0.03) 60px);
    opacity: 0.4;
}

.text-glow {
    background: linear-gradient(45deg, #FFD700, #C0C0C0, #B87333);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
}

.battle-icon {
    filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.7));
}

.stat-number {
    background: linear-gradient(45deg, #FFD700, #dc3545);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    display: block;
    margin-bottom: 0.5rem;
}

.bg-dark-chess {
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="%230f0f0f"/><rect width="40" height="40" fill="%231a1a1a"/><rect x="40" y="40" width="40" height="40" fill="%231a1a1a"/></svg>') repeat;
    background-size: 80px 80px;
    background-blend-mode: overlay;
}

.section-title {
    background: linear-gradient(45deg, #FFD700, #e6b200);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
    font-weight: 800;
}

.tournament-divider {
    border-top: 3px solid rgba(255, 215, 0, 0.3);
    opacity: 1;
    margin: 4rem 0;
}

.upcoming-list-scroll {
    max-height: 500px;
    overflow-y: auto;
    padding-right: 15px;
    border: 1px solid rgba(255, 215, 0, 0.1);
    border-radius: 15px;
}

.upcoming-list-scroll::-webkit-scrollbar {
    width: 8px;
}
.upcoming-list-scroll::-webkit-scrollbar-track {
    background: #1a1a1a;
    border-radius: 4px;
}
.upcoming-list-scroll::-webkit-scrollbar-thumb {
    background: #FFD700;
    border-radius: 4px;
}
.upcoming-list-scroll::-webkit-scrollbar-thumb:hover {
    background: #e6b200;
}

.chess-shadow {
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 215, 0, 0.05);
}

.btn-dark-outline-gold {
    color: #FFD700;
    border-color: #FFD700;
    background-color: rgba(255, 215, 0, 0.05);
    font-size: 1.5rem;
    font-weight: 700;
    transition: all 0.3s ease;
    border-radius: 12px;
}

.btn-dark-outline-gold:hover {
    color: #0a0a0a;
    background-color: #FFD700;
    border-color: #FFD700;
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(255, 215, 0, 0.4);
}

@keyframes heroShift {
    0% { transform: translateX(-2px); }
    100% { transform: translateX(2px); }
}

@keyframes titlePulse {
    0%, 100% { text-shadow: 0 0 40px rgba(220, 53, 69, 0.5); }
    50% { text-shadow: 0 0 60px rgba(220, 53, 69, 0.8), 0 0 80px rgba(255, 193, 7, 0.3); }
}
</style>