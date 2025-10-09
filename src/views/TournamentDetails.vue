<template>
  <div class="tournament-details-page py-5">
    <div class="container">
      <div v-if="isLoading" class="text-center">
        <div class="spinner-border text-warning" role="status"></div>
        <p class="mt-3">Loading Tournament Details...</p>
      </div>

      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div v-else-if="tournament" class="details-card">
        <div class="card-header">
          <h1 class="card-title">{{ tournament.TournamentName }}</h1>
          <span class="badge" :class="statusBadgeClass">{{ tournament.Status }}</span>
        </div>
        <div class="card-body">
          <p class="description">{{ tournament.Description }}</p>
          <hr class="my-4">
          <div class="details-grid">
            <div v-if="tournament.Date" class="detail-item">
              <span class="detail-label"><i class="fas fa-calendar-alt me-2"></i>Date</span>
              <span class="detail-value">{{ tournament.Date }}</span>
            </div>
            <div v-if="tournament.Location" class="detail-item">
              <span class="detail-label"><i class="fas fa-map-marker-alt me-2"></i>Location</span>
              <span class="detail-value">{{ tournament.Location }}</span>
            </div>
            <div v-if="tournament.Type" class="detail-item">
              <span class="detail-label"><i class="fas fa-sitemap me-2"></i>Type</span>
              <span class="detail-value">{{ tournament.Type }}</span>
            </div>
            <div v-if="tournament.Rounds" class="detail-item">
              <span class="detail-label"><i class="fas fa-hashtag me-2"></i>Rounds</span>
              <span class="detail-value">{{ tournament.Rounds }}</span>
            </div>
            <div v-if="tournament.PrizeFund" class="detail-item">
              <span class="detail-label"><i class="fas fa-trophy me-2"></i>Prize Fund</span>
              <span class="detail-value">{{ tournament.PrizeFund }}</span>
            </div>
          </div>
        </div>
        <div class="card-footer text-center">
          <button class="btn btn-outline-light" @click="router.back()">
            <i class="fas fa-arrow-left me-2"></i> Back to List
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// We get the ID from the URL as a prop
const props = defineProps({
  id: String
});

const route = useRoute();
const router = useRouter();

// Configuration for Google Sheets
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // The ID for your main TournamentsList
const API_KEY = 'YOUR_API_KEY';
const SHEET_NAME = 'TournamentsList';

// Component State
const tournament = ref(null);
const isLoading = ref(true);
const error = ref(null);

const fetchTournamentDetails = async () => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch tournament list.");

    const data = await response.json();
    if (!data.values || data.values.length <= 1) throw new Error("No tournaments found in the sheet.");

    const headers = data.values[0];
    const rows = data.values.slice(1);

    const allTournaments = rows.map(row => {
      const tournamentObject = {};
      headers.forEach((header, index) => {
        tournamentObject[header] = row[index] || '';
      });
      return tournamentObject;
    });

    // Find the specific tournament that matches the ID from the URL
    const foundTournament = allTournaments.find(t => t.TournamentID === props.id);

    if (foundTournament) {
      tournament.value = foundTournament;
      document.title = tournament.value.TournamentName;
    } else {
      throw new Error(`Tournament with ID "${props.id}" not found.`);
    }

  } catch (e) {
    console.error(e);
    error.value = e.message;
  } finally {
    isLoading.value = false;
  }
};

// Computed property for the status badge color
const statusBadgeClass = computed(() => {
  if (!tournament.value) return 'bg-secondary';
  switch (tournament.value.Status) {
    case 'Ongoing': return 'bg-danger';
    case 'Upcoming': return 'bg-success';
    case 'Completed': return 'bg-secondary';
    default: return 'bg-info';
  }
});

onMounted(() => {
  fetchTournamentDetails();
});
</script>

<style scoped>
.tournament-details-page {
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%);
  color: #e0e0e0;
  min-height: calc(100vh - 76px); /* Adjust for navbar height */
  display: flex;
  align-items: center;
}

.details-card {
  background: linear-gradient(145deg, #181818, #2a2a2a);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  overflow: hidden;
}

.card-header {
  padding: 2rem;
  background-color: rgba(0,0,0,0.2);
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #FFD700;
}

.card-body {
  padding: 2rem;
}

.description {
  font-size: 1.1rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.8);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.detail-item {
  background: rgba(0,0,0,0.2);
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.5rem;
}

.detail-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
}

.card-footer {
  background-color: rgba(0,0,0,0.2);
  border-top: 1px solid rgba(255, 215, 0, 0.2);
  padding: 1.5rem;
}
</style>