<template>
    <div v-if="tournament" class="tournament-details-page bg-dark-chess py-5">
        <div class="container">
            <h1 class="text-center section-title mb-3">{{ tournament.name }}: Live Standings</h1>
            <p class="text-center text-warning mb-5">Current Phase: Round 2/7 (Tournament ID: {{ tournament.id }})</p>
            
            <div class="standings-card mt-5">
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
                        <table class="table table-dark table-hover align-middle text-center standings-table mb-0 shadow-lg">
                            <thead class="table-gradient">
                                <tr>
                                    <th v-for="(col, index) in columns" :key="index" class="standings-header-cell text-uppercase">{{ col }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(row, rowIndex) in rows" :key="rowIndex" class="standings-row" :class="getRowClass(rowIndex)">
                                    <td v-for="(cell, colIndex) in row" :key="colIndex" class="standings-cell">
                                        <span v-if="colIndex === 0" class="rank-indicator"><span>{{ cell }}</span></span>
                                        <span v-else>{{ cell }}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else class="text-center text-muted py-5">
                        <p>No standings data available yet for this tournament.</p>
                    </div>
                </div>
            </div>
            
            <div class="text-center mt-5">
                <button class="btn btn-lg btn-outline-light" @click="router.go(-1)">
                    <i class="fas fa-arrow-left me-2"></i> Back to Tournament Overview
                </button>
            </div>
        </div>
    </div>
    <div v-else class="loading-state text-center py-5">
        <div class="spinner-border text-light" role="status"></div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router';
import { initialTournaments } from '../data/T1.js';

const props = defineProps({
    id: [String, Number] 
});

const router = useRouter();

const tournament = ref(null); // Will hold the data for the current tournament
const isLoading = ref(true);
const isRefreshing = ref(false);
const columns = ref([]);
const rows = ref([]);

onMounted(() => {
    // Find the specific tournament using the ID from the route prop.
    // The '==' is used intentionally here for loose comparison between string (from URL) and number.
    const foundTournament = initialTournaments.find(t => t.id == props.id);

    if (foundTournament) {
        tournament.value = foundTournament;
        document.title = `${tournament.value.name} - Standings`;
        if (tournament.value.isFeatured) {
            fetchStandings();
        } else {
            // For other tournaments, maybe show a "coming soon" or different data
            console.log("This tournament does not have live standings data.");
            isLoading.value = false;
        }
    } else {
        // If no tournament is found, redirect back to the overview page
        console.error(`Tournament with ID ${props.id} not found.`);
        router.push({ name: 'tournament-overview' });
    }
});

const getRowClass = (index) => {
    if (index === 0) return 'champion-row';
    if (index === 1) return 'second-place-row';
    if (index === 2) return 'third-place-row';
    return '';
};

const refreshStandings = async () => {
    isRefreshing.value = true;
    await new Promise(resolve => setTimeout(resolve, 1000));
    await fetchStandings();
    isRefreshing.value = false;
};

const fetchStandings = async () => {
    // In a real app, this URL could come from the tournament object itself
    // e.g., const sheetUrl = tournament.value.standingsUrl;
    const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTRWCgc3OdW0FHFovxqB-YQdD-mo4Vy470TA5ckiJHnYae9UOp8DmZPe-qs8jnMI90wHGndgnt4oNFh/pub?output=csv";
    
    try {
        const response = await fetch(sheetUrl + "&cacheBust=" + new Date().getTime());
        const csv = await response.text();
        const lines = csv.split("\n").map(line => line.split(","));
        columns.value = lines[0].filter(c => c.trim() !== '');
        rows.value = lines.slice(1).filter(row => row.some(cell => cell.trim() !== ''));
    } catch (error) {
        console.error("Error fetching CSV:", error);
        // Fallback data is great for demos
        columns.value = ['Rank', 'Player', 'Rating', 'Points', 'Wins', 'Losses', 'Draws'];
        rows.value = [
            ['1', 'ShadowMaster99', '2150', '8.5', '8', '0', '1'],
            ['2', 'DarkKnight_X', '2087', '8.0', '7', '1', '1'],
            ['3', 'ChessReaper', '1995', '7.5', '7', '1', '1'],
            ['4', 'VoidPlayer', '1876', '7.0', '6', '2', '1'],
            ['5', 'NightWarrior', '1923', '6.5', '6', '2', '1']
        ];
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
/* All styles remain the same, ensuring visual consistency */
.tournament-details-page {
    background: linear-gradient(135deg, #050505 0%, #101820 50%, #050505 100%);
    min-height: 100vh;
}
.section-title {
    background: linear-gradient(45deg, #dc0404, #ef0505);
    -webkit-background-clip: text;
    background-clip: text; /* Add this line */
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 10px rgba(7, 1, 1, 0.942);
    font-weight: 800;
}
.standings-card {
    background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
    border: 1px solid rgba(255, 55, 0, 0.749);
    border-radius: 25px;
    padding: 2rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
.standings-header {
    border-bottom: 1px solid rgb(200, 90, 5);
    padding-bottom: 1rem;
}
.standings-title {
    color: #cf4d06;
    font-weight: 700;
}
.table-gradient {
    background: linear-gradient(90deg, #010505, #dc3545);
    color: #0a0a0a;
}
.standings-header-cell {
    color: #d2cf0c;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 0.9rem;
    padding: 1rem;
    border: none;
    border-bottom: 2px solid rgba(255, 193, 7, 0.3);
}
.champion-row {
    background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
    font-weight: 700;
    color: #FFD700;
}
.second-place-row {
    background: linear-gradient(135deg, rgba(192, 192, 192, 0.1) 0%, rgba(169, 169, 169, 0.05) 100%);
    color: #c0c0c0;
}
.third-place-row {
    background: linear-gradient(135deg, rgba(205, 127, 50, 0.1) 0%, rgba(184, 115, 51, 0.05) 100%);
    color: #cd7f32;
}
</style>