<template>
  <div class="multi-stage-page">
    <div class="container">
      <div class="page-header text-center mb-5">
        <h1 class="tournament-title">{{ parentTournament.TournamentName }}</h1>
        <p class="tournament-subtitle">Multi-Stage Event</p>
      </div>

      <ul class="nav nav-tabs nav-fill" id="tournamentTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="overall-tab" data-bs-toggle="tab" data-bs-target="#overall-pane" type="button" role="tab">Overall Standings</button>
        </li>
        <li v-for="child in childTournaments" :key="child.TournamentID" class="nav-item" role="presentation">
          <router-link 
            class="nav-link" 
            :to="{ name: 'generic-tournament-details', params: { id: child.TournamentID } }"
          >
            {{ child.TournamentName }}
          </router-link>
        </li>
      </ul>

      <div class="tab-content mt-4" id="tournamentTabContent">
        <div class="tab-pane fade show active p-4" id="overall-pane" role="tabpanel">
          <h3 class="text-center mb-3">Overall Combined Standings</h3>
          <div class="alert alert-info text-center">
            <strong>Coming Soon!</strong>
            <p>Logic to fetch and combine scores from all child events will be built here.</p>
          </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// --- 1. DEFINE PROPS ---
const props = defineProps({
  parentId: String,
  allTournaments: Array,
  TournamentsList: { type: Array, default: () => [] }
});

// --- 2. LOGIC ---
const sourceList = computed(() => (Array.isArray(props.TournamentsList) && props.TournamentsList.length ? props.TournamentsList : props.allTournaments || []));

const parentTournament = computed(() => {
  return sourceList.value.find(t => t.TournamentID === props.parentId) || {};
});
const childTournaments = computed(() => {
  return sourceList.value.filter(t => t.ParentEventID === props.parentId);
});

// Placeholder for combined standings logic
const overallStandings = computed(() => {
  return [];
});

</script>

<style scoped>
.multi-stage-page {
  background: linear-gradient(135deg, #0a0a0a, #1a1a2e, #2a0a1e, #1a1a2e, #0a0a0a);
  color: #e0e0e0; min-height: 100vh;
}
.tournament-title { font-size: 3.5rem; font-weight: 900; background: linear-gradient(45deg, #FFD700, #f0c000, #C0C0C0); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.tournament-subtitle { font-size: 1.25rem; color: rgba(255, 255, 255, 0.7); }
.nav-tabs { border-bottom: 2px solid rgba(255, 215, 0, 0.2); }
.nav-tabs .nav-link { color: rgba(255, 255, 255, 0.7); background: transparent; border: none; border-bottom: 2px solid transparent; transition: all 0.3s ease; }
.nav-tabs .nav-link:hover { color: #FFD700; }
.nav-tabs .nav-link.active,
.nav-tabs .nav-link.router-link-exact-active { 
  color: #FFD700; 
  background-color: rgba(255, 215, 0, 0.05); 
  border-bottom: 2px solid #FFD700; 
}
.tab-content { background-color: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 0 0 15px 15px; }
</style>