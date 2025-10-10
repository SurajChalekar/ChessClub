<template>
    <div class="tournament-card card h-100 border-start border-4 shadow-lg" :class="cardClass">
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
                <h5 class="card-title tournament-title">{{ tournament.icon }} {{ tournament.name }}</h5>
                <span class="badge rounded-pill text-uppercase" :class="badgeClass">{{ category }}</span>
            </div>
            
            <p class="card-text">{{ tournament.description }}</p>

            <div class="tournament-details-grid mt-4">
                <div class="detail-item" style="padding-left: 10px;">
                    <i class="fas fa-users text-info"></i>
                    <div>
                        <div class="detail-label">Participants</div>
                        <div class="detail-value">{{ tournament.participants }}/{{ tournament.maxParticipants }}</div>
                    </div>
                </div>
            </div>

            <div class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top border-secondary">
                
                <button 
                    class="btn btn-sm" 
                    :class="actionButtonClass"
                    @click="$emit('view-details', tournament.id)"
                    :disabled="category === 'past'"
                >
                    <i :class="{'fa-chart-line': tournament.isFeatured, 'fa-info-circle': !tournament.isFeatured}" class="fas me-2"></i>
                    {{ tournament.isFeatured ? 'View Standings' : 'View Details' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'; // <-- CORRECTED IMPORT

const props = defineProps({
    tournament: Object,
    category: String // 'ongoing', 'upcoming', or 'past'
});

defineEmits(['move-to', 'view-details']);

const badgeClass = computed(() => ({
    'bg-danger': props.category === 'ongoing',
    'bg-success': props.category === 'upcoming',
    'bg-secondary': props.category === 'past',
}));

const cardClass = computed(() => ({
    'border-warning': props.category === 'ongoing',
    'border-success': props.category === 'upcoming',
    'border-secondary': props.category === 'past',
    'opacity-75': props.category === 'past',
}));

const actionButtonClass = computed(() => {
    if (props.tournament.isFeatured && props.category === 'ongoing') {
        return 'btn-warning';
    } else if (props.category === 'ongoing') {
        return 'btn-outline-danger';
    } else if (props.category === 'upcoming') {
        return 'btn-outline-success';
    }
    return 'btn-outline-secondary';
});
</script>

<style scoped>
.tournament-card {
    background: linear-gradient(145deg, #181818, #2a2a2a);
    color: #e0e0e0;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.tournament-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(2, 90, 241, 0.918);
}

.tournament-card .card-text {
  /* The !important flag ensures this rule will always be applied */
  color: #e4f711 !important; 

  min-height: 48px; 
}
.tournament-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: #f90707;
}

.tournament-details-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.detail-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.2rem;
}

.detail-value {
    font-weight: 600;
    color: #e0e0e0;
    font-size: 1rem;
}
</style>