<template>
  <div class="tournament-card card h-100 border-start border-4 shadow-lg" :class="cardClass">
    <div class="card-body d-flex flex-column">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <h5 v-if="tournament.TournamentName && tournament.TournamentName.trim()" class="card-title tournament-title">{{ tournament.TournamentName }}</h5>
        <span class="badge rounded-pill text-uppercase" :class="badgeClass">{{ category }}</span>
      </div>
      
      <p v-if="tournament.Description && tournament.Description.trim()" class="card-text">{{ tournament.Description }}</p>

      <div class="tournament-details-grid mt-4">

        <div class="detail-item" v-if="tournament.Participants && tournament.Participants.trim() !== ''">
          <i class="fas fa-users text-info"></i>
          <div>
            <div class="detail-label">Participants</div>
            <div class="detail-value">{{ tournament.Participants }}</div>
          </div>
        </div>

        <div class="detail-item" v-if="tournament.PrizeFund && tournament.PrizeFund.trim() !== ''">
          <i class="fas fa-trophy text-warning"></i> 
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

      <!-- This container ensures the button is at the bottom -->
      <div class="mt-auto pt-3">
        <div class="d-flex justify-content-end align-items-center border-top border-secondary pt-3">
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

const displayDate = computed(() => {
  if (props.tournament.Date_Status && props.tournament.Date_Status.trim() !== '') {
    return props.tournament.Date_Status;
  }
  if (props.tournament.Date && props.tournament.Date.trim() !== '') {
    return props.tournament.Date;
  }
  return null;
});
</script>

<style scoped>
.tournament-card {
  background: linear-gradient(145deg, #222227, #1a1a1e);
  color: #e0e0e0;
  border-radius: 12px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.tournament-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
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
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3); /* NEW: Added text shadow */
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

/* Make sure the bottom border is less prominent */
.border-secondary {
    border-color: rgba(255, 255, 255, 0.1) !important;
}


/* ================================== */
/* == MOBILE RESPONSIVE STYLES == */
/* ================================== */

@media (max-width: 767px) {
  .tournament-card .tournament-title {
    font-size: 1.25rem; /* Smaller title on mobile */
  }

  .tournament-card .card-text {
    min-height: auto; /* Allow text height to be natural */
    font-size: 0.95rem;
  }

  .tournament-details-grid {
    gap: 0.75rem; /* Tighter gap on mobile */
  }

  .detail-item {
    gap: 0.75rem; /* Tighter gap for icon and text */
  }

  .tournament-card .detail-value {
    font-size: 1rem; /* Slightly smaller detail font */
  }

  /* NEW: Make all buttons full width for easy tapping */
  .tournament-card .btn {
    width: 100%;
    font-size: 1rem;
    padding: 0.75rem;
  }
}
</style>