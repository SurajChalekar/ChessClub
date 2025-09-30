<template>
    <div class="tournaments-page">
        <!-- Hero Section -->
        <section class="tournaments-hero position-relative overflow-hidden">
            <div class="hero-background"></div>
            <div class="battle-pattern"></div>
            <div class="container position-relative z-3">
                <div class="row justify-content-center text-center">
                    <div class="col-lg-8">
                        <div class="hero-content py-5">
                            <div class="hero-badge mb-4">
                                <span class="badge bg-gradient-danger px-4 py-3 fs-6 rounded-pill">
                                    <i class="fas fa-sword me-2"></i>Battle Arena Active
                                </span>
                            </div>
                            <h1 class="hero-title mb-4">
                                <span class="battle-icon">⚔️</span>
                                <span class="text-glow">Tournament Battles</span>
                            </h1>
                            <p class="hero-subtitle mb-5">
                                Enter the crucible where legends are forged and champions are crowned.
                                Only the strongest warriors shall claim victory and eternal glory.
                            </p>
                            <div class="hero-stats row g-4 justify-content-center text-center">
                                <div class="col-md-3 col-6">
                                    <div class="stat-card">
                                        <div class="stat-number">{{ activeTournaments }}</div>
                                        <div class="stat-label">Active Battles</div>
                                    </div>
                                </div>
                                <div class="col-md-3 col-6">
                                    <div class="stat-card">
                                        <div class="stat-number">40</div>
                                        <div class="stat-label">Warriors Fighting</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Tournament Filter -->


        <!-- Standings Section -->
        <section class="standings-section py-5">
            <div class="container">
                <div class="section-header text-center mb-5">
                    <div class="section-badge mb-3">
                        <span class="badge bg-warning text-dark px-4 py-2 rounded-pill">
                            <i class="fas fa-trophy me-2"></i>Hall of Champions
                        </span>
                    </div>
                    <h2 class="section-title">Current Tournament Standings</h2>
                    <p class="section-subtitle">Witness the rise and fall of chess legends</p>
                </div>

                <div class="standings-card">
                    <div class="standings-header">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h4 class="standings-title mb-0">
                                <i class="fas fa-crown me-2 text-warning"></i>
                                Live Tournament Rankings
                            </h4>
                            <div class="refresh-btn">
                                <button class="btn btn-outline-warning btn-sm" @click="refreshStandings">
                                    <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': isRefreshing }"></i>
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="table-container">
                        <div v-if="isLoading" class="loading-state text-center py-5">
                            <div class="spinner-border text-warning mb-3" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p class="text-muted">Loading battle standings...</p>
                        </div>

                        <div v-else-if="columns.length > 0" class="table-responsive">
                            <table
                                class="table table-dark table-hover align-middle text-center standings-table mb-0 shadow-lg">
                                <thead class="table-gradient">
                                    <tr>
                                        <th v-for="(col, index) in columns" :key="index"
                                            class="standings-header-cell text-uppercase">
                                            {{ col }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(row, rowIndex) in rows" :key="rowIndex" class="standings-row"
                                        :class="getRowClass(rowIndex)">
                                        <td v-for="(cell, colIndex) in row" :key="colIndex" class="standings-cell">
                                            <span v-if="colIndex === 0" class="rank-indicator">
                                                <span>{{ cell }}</span>
                                            </span>
                                            <span v-else>{{ cell }}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Reactive data
const isLoading = ref(true)
const isRefreshing = ref(false)
const columns = ref([])
const rows = ref([])

// Tournament data
const tournaments = ref([
    {
        id: 1,
        name: 'The Shadow Crown Championship',
        status: 'registration',
        type: 'championship',
        participants: 87,
        maxParticipants: 128,
        prizePool: 25000,
        startDate: '2025-10-31',
        duration: '3 days',
        description: 'The ultimate battle for chess supremacy. Face the darkness and emerge victorious or be consumed by defeat.',
        icon: '👑',
        featured: true,
        rules: [
            'FIDE tournament rules apply',
            'Time control: 90 minutes + 30 second increment',
            'Swiss system, 9 rounds',
            'Minimum rating: 1800 ELO',
            'No electronic devices allowed',
            'Professional arbiters present'
        ]
    }
])


const activeTournaments = computed(() => tournaments.value.filter(t => t.status === 'active' || t.status === 'registration').length)

// Methods

const getRowClass = (index) => {
    if (index === 0) return 'champion-row'
    if (index === 1) return 'second-place-row'
    if (index === 2) return 'third-place-row'
    return ''
}


const refreshStandings = async () => {
    isRefreshing.value = true
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    await fetchStandings()
    isRefreshing.value = false
}

const fetchStandings = async () => {
    const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTRWCgc3OdW0FHFovxqB-YQdD-mo4Vy470TA5ckiJHnYae9UOp8DmZPe-qs8jnMI90wHGndgnt4oNFh/pub?output=csv"

    try {
        const response = await fetch(sheetUrl + "&cacheBust=" + new Date().getTime())
        const csv = await response.text()
        const lines = csv.split("\n").map(line => line.split(","))
        columns.value = lines[0]
        rows.value = lines.slice(1).filter(row => row.some(cell => cell.trim() !== ''))
    } catch (error) {
        console.error("Error fetching CSV:", error)
        // Fallback mock data
        columns.value = ['Rank', 'Player', 'Rating', 'Points', 'Wins', 'Losses', 'Draws']
        rows.value = [
            ['1', 'ShadowMaster99', '2150', '8.5', '8', '0', '1'],
            ['2', 'DarkKnight_X', '2087', '8.0', '7', '1', '1'],
            ['3', 'ChessReaper', '1995', '7.5', '7', '1', '1'],
            ['4', 'VoidPlayer', '1876', '7.0', '6', '2', '1'],
            ['5', 'NightWarrior', '1923', '6.5', '6', '2', '1']
        ]
    } finally {
        isLoading.value = false
    }
}

// Lifecycle
onMounted(() => {
    document.title = 'IISER-TVM Chess Club'
    fetchStandings()
})
</script>

<style scoped>
/* Table Header Gradient */
.table-gradient {
    background: linear-gradient(90deg, #ffc107, #dc3545);
    color: #fff;
}

.table-dark {
    background-color: #1c1c1c;
    border-radius: 12px;
    overflow: hidden;
}

/* Hover highlight */
.table-hover tbody tr:hover {
    background-color: rgba(255, 193, 7, 0.1);
    transform: scale(1.01);
    transition: all 0.2s ease-in-out;
}

/* Rounded & glowing cells */
.standings-cell {
    padding: 1rem;
    border: none;
    font-weight: 500;
}

.standings-header-cell {
    font-weight: 700;
    font-size: 0.9rem;
    letter-spacing: 1px;
}

/* Champion glow */
.champion-row {
    background: rgba(255, 215, 0, 0.1) !important;
    font-weight: 700;
}

.second-place-row {
    background: rgba(192, 192, 192, 0.1) !important;
}

.third-place-row {
    background: rgba(205, 127, 50, 0.1) !important;
}

/* Rank icons */
.rank-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Global Styles */
.tournaments-page {
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%);
    color: #e0e0e0;
    min-height: 100vh;
    padding-top: 0px;
}

/* Hero Section */
.tournaments-hero {
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

.battle-pattern {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
        repeating-linear-gradient(30deg, transparent, transparent 30px, rgba(220, 53, 69, 0.03) 30px, rgba(220, 53, 69, 0.03) 60px),
        repeating-linear-gradient(-30deg, transparent, transparent 30px, rgba(255, 193, 7, 0.03) 30px, rgba(255, 193, 7, 0.03) 60px);
    opacity: 0.4;
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
}

.battle-icon {
    font-size: 1.1em;
    margin-right: 15px;
    filter: drop-shadow(0 0 15px rgba(220, 53, 69, 0.7));
}

/* Hero Stats */
.stat-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 193, 7, 0.2);
    border-radius: 15px;
    padding: 1.5rem 1rem;
    text-align: center;
    transition: all 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-5px);
    border-color: rgba(255, 193, 7, 0.4);
    box-shadow: 0 10px 30px rgba(255, 193, 7, 0.1);
}

.stat-number {
    font-size: 2.2rem;
    font-weight: 900;
    background: linear-gradient(45deg, #ffc107, #dc3545);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: block;
    margin-bottom: 0.5rem;
}

.stat-label {
    font-size: 0.9rem;
    opacity: 0.8;
    text-transform: uppercase;
    letter-spacing: 1px;
}

/* Filter Section */
.tournament-filter {
    background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
    border-bottom: 1px solid rgba(255, 193, 7, 0.1);
}

.filter-panel {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 193, 7, 0.2);
    border-radius: 20px;
    padding: 2rem;
}

.filter-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
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
    min-width: 180px;
}

.dark-select:focus {
    background: rgba(0, 0, 0, 0.7);
    border-color: #ffc107;
    box-shadow: 0 0 15px rgba(255, 193, 7, 0.3);
}

/* Tournament Grid */
.tournaments-content {
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
    font-size: 1.2rem;
    opacity: 0.8;
}

.tournaments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

/* Tournament Cards */
.tournament-card-active {
    border-color: rgba(220, 53, 69, 0.4);
    box-shadow: 0 0 30px rgba(220, 53, 69, 0.2);
}

.tournament-card-registration {
    border-color: rgba(40, 167, 69, 0.4);
    box-shadow: 0 0 30px rgba(40, 167, 69, 0.2);
}

.tournament-card-completed {
    opacity: 0.7;
    border-color: rgba(108, 117, 125, 0.4);
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

.tournament-card:hover .card-glow {
    opacity: 1;
}

.tournament-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
}

.tournament-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.tournament-badges .badge {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0.5rem 1rem;
    border-radius: 20px;
}

.tournament-icon {
    font-size: 3rem;
    opacity: 0.7;
    filter: grayscale(30%);
    transition: all 0.3s ease;
}

.tournament-card:hover .tournament-icon {
    opacity: 1;
    filter: grayscale(0%);
    transform: scale(1.1) rotate(5deg);
}

.tournament-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffc107;
    margin-bottom: 1rem;
    line-height: 1.3;
}

.tournament-description {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
}

.tournament-details {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 15px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1.5rem;
}

.detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.detail-item i {
    font-size: 1.2rem;
    width: 24px;
    text-align: center;
}

.detail-label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.2rem;
}

.detail-value {
    font-weight: 600;
    color: #e0e0e0;
}

.icon-warning {
    color: #ffc107;
}

.icon-info {
    color: #17a2b8;
}

.icon-success {
    color: #28a745;
}

.icon-danger {
    color: #dc3545;
}

/* Progress Bar */
.participation-progress {
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.progress-header {
    font-size: 0.9rem;
    font-weight: 600;
}

.progress-label {
    color: rgba(255, 255, 255, 0.8);
}

.progress-percentage {
    color: #ffc107;
    font-weight: 700;
}

.dark-progress {
    height: 10px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
}

.dark-progress .progress-bar {
    border-radius: 10px;
    transition: width 0.3s ease;
}

/* Tournament Rules */
.tournament-rules {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.rules-title {
    color: #ffc107;
    font-weight: 600;
    margin-bottom: 0.8rem;
}

.rules-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.rules-list li {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 0.3rem;
    padding-left: 1rem;
    position: relative;
}

.rules-list li:before {
    content: '⚔️';
    position: absolute;
    left: 0;
    top: 0;
    font-size: 0.7rem;
    opacity: 0.6;
}

/* Action Buttons */
.tournament-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-action {
    position: relative;
    overflow: hidden;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
}

.btn-glow {
    box-shadow: 0 5px 20px rgba(255, 193, 7, 0.2);
}

.btn-glow:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(255, 193, 7, 0.4);
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

.btn-action:hover .btn-shine {
    left: 100%;
}

/* Standings Section */
.standings-section {
    background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
    padding: 6rem 0;
}

.standings-card {
    background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
    border: 1px solid rgba(255, 193, 7, 0.2);
    border-radius: 25px;
    padding: 2rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.standings-header {
    border-bottom: 1px solid rgba(255, 193, 7, 0.2);
    padding-bottom: 1rem;
}

.standings-title {
    color: #ffc107;
    font-weight: 700;
}

.table-container {
    margin-top: 1.5rem;
}

.standings-table {
    color: #e0e0e0;
}

.standings-table thead {
    background: linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%);
}

.standings-header-cell {
    color: #ffc107;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 0.9rem;
    padding: 1rem;
    border: none;
    border-bottom: 2px solid rgba(255, 193, 7, 0.3);
}

.standings-row {
    transition: all 0.3s ease;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.standings-row:hover {
    background: rgba(255, 193, 7, 0.05);
    transform: scale(1.01);
}

.champion-row {
    background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
}

.second-place-row {
    background: linear-gradient(135deg, rgba(192, 192, 192, 0.1) 0%, rgba(169, 169, 169, 0.05) 100%);
}

.third-place-row {
    background: linear-gradient(135deg, rgba(205, 127, 50, 0.1) 0%, rgba(184, 115, 51, 0.05) 100%);
}

.standings-cell {
    padding: 1rem;
    border: none;
    font-weight: 500;
}

.rank-indicator {
    display: flex;
    align-items: center;
    font-weight: 700;
}

.text-silver {
    color: #c0c0c0;
}

.text-bronze {
    color: #cd7f32;
}

.bg-purple {
    background-color: #6f42c1;
}

/* Loading and No Data States */
.loading-state,
.no-data-state {
    color: rgba(255, 255, 255, 0.6);
}

.spinner-border {
    width: 3rem;
    height: 3rem;
}

.no-data-icon {
    opacity: 0.3;
}

/* Responsive Design */
@media (max-width: 768px) {
    .tournaments-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .hero-title {
        font-size: 2.8rem;
    }

    .section-title {
        font-size: 2.2rem;
    }

    .tournament-card {
        padding: 1.5rem;
    }

    .detail-grid {
        grid-template-columns: 1fr;
        gap: 0.8rem;
    }

    .filter-panel {
        padding: 1.5rem;
    }

    .filter-item {
        width: 100%;
        margin-bottom: 1rem;
    }

    .dark-select {
        width: 100%;
        min-width: auto;
    }

    .hero-stats {
        gap: 1rem;
    }

    .stat-number {
        font-size: 1.8rem;
    }
}

@media (max-width: 576px) {
    .tournament-card {
        padding: 1rem;
    }

    .hero-title {
        font-size: 2.2rem;
    }

    .section-title {
        font-size: 1.8rem;
    }

    .tournament-title {
        font-size: 1.3rem;
    }

    .tournament-badges {
        flex-direction: column;
        align-items: flex-start;
    }

    .standings-table {
        font-size: 0.85rem;
    }

    .standings-header-cell,
    .standings-cell {
        padding: 0.5rem;
    }
}

/* Animations */
@keyframes titlePulse {

    0%,
    100% {
        text-shadow: 0 0 40px rgba(220, 53, 69, 0.5);
    }

    50% {
        text-shadow: 0 0 60px rgba(220, 53, 69, 0.8), 0 0 80px rgba(255, 193, 7, 0.3);
    }
}

@keyframes heroShift {
    0% {
        transform: translateX(-2px);
    }

    100% {
        transform: translateX(2px);
    }
}

/* Custom Scrollbar */
.table-responsive::-webkit-scrollbar {
    height: 8px;
}

.table-responsive::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
}

.table-responsive::-webkit-scrollbar-thumb {
    background: linear-gradient(90deg, #ffc107, #dc3545);
    border-radius: 4px;
}

.table-responsive::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(90deg, #dc3545, #ffc107);
}
</style>