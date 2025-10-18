<template>
    <div class="tournament-card card h-100 border-start border-4 shadow-lg" :class="cardClass">
        <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-3">
                <h5 v-if="tournament.TournamentName && tournament.TournamentName.trim()" class="card-title tournament-title">{{ tournament.TournamentName }}</h5>
                <span class="badge rounded-pill text-uppercase" :class="badgeClass">{{ category }}</span>
            </div>
            
            <p v-if="tournament.Description && tournament.Description.trim()" class="card-text">{{ tournament.Description }}</p>

            <div class="tournament-details-grid mt-4">
                <div class="detail-item" style="padding-left: 10px;">
                    <i class="fas fa-users text-info"></i>
                    <div>
                        <div class="detail-label">Prize Pool</div>
                        <div class="detail-value">{{ tournament.PrizeFund }}</div>
                    </div>
                </div>
            </div>

            <div v-if="tournament.Status && tournament.Status.trim()" class="mt-3">
                <strong>Status:</strong> {{ tournament.Status }}
            </div>
            
            <div v-if="displayDate" class="mt-1">
                <strong>Date:</strong> {{ displayDate }}
            </div>

            <div v-if="tournament.Location && tournament.Location.trim()" class="mt-1">
                <strong>Location:</strong> {{ tournament.Location }}
            </div>

            <div class="d-flex justify-content-end align-items-center mt-auto pt-3 border-top border-secondary">
                <a v-if="category === 'upcoming' && tournament.RegistrationLink" :href="tournament.RegistrationLink" target="_blank" class="btn btn-success">
                    <i class="fas fa-user-plus me-2"></i> Register Now
                </a>
                <button v-else-if="category === 'ongoing'" class="btn btn-warning" @click="$emit('view-details', tournament)">
                    <i class="fas fa-chart-line me-2"></i> View Standings
                </button>
                <button v-else-if="category === 'past'" class="btn btn-outline-secondary" @click="$emit('view-details', tournament)">
                    <i class="fas fa-archive me-2"></i> View Results
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    tournament: Object,
    category: String
});

defineEmits(['view-details']);

const badgeClass = computed(() => ({
    'bg-danger': props.category === 'ongoing',
    'bg-success': props.category === 'upcoming',
    'bg-secondary': props.category === 'past',
}));

const cardClass = computed(() => ({
    'border-warning': props.category === 'ongoing',
    'border-success': props.category === 'upcoming',
    'border-secondary': props.category === 'past',
}));

// --- MODIFICATION 2: Added 'displayDate' computed property ---
// This checks for Date_Status first, then falls back to Date
const displayDate = computed(() => {
  if (props.tournament.Date_Status && props.tournament.Date_Status.trim() !== '') {
    return props.tournament.Date_Status;
  }
  if (props.tournament.Date && props.tournament.Date.trim() !== '') {
    return props.tournament.Date;
  }
  return null; // Don't show the date field if both are empty
});
</script>

<style scoped>
/* All your existing styles remain unchanged */
.tournament-card {
  background: linear-gradient(145deg, #181818, #2a2a2a);
  color: #e0e0e0;
  border-radius: 12px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.tournament-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 123, 255, 0.25);
}

.tournament-card .card-body {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.tournament-card .tournament-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #FFD700 !important;
}

.tournament-card .card-text {
  color: #cccccc !important;
  min-height: 48px;
  flex-grow: 1;
}

.tournament-card .detail-label {
  font-size: 0.8rem;
  color: #a0a0a0 !important;
  text-transform: uppercase;
}

.tournament-card .detail-value {
  font-weight: 600;
  color: #ffffff !important;
  font-size: 1.1rem;
}

.tournament-card .detail-item i {
  color: #FFD700;
  font-size: 1.2rem;
}

.tournament-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}
</style>