<template>
  <div class="individual-swiss-page">
    <div class="container">
      <div class="page-header text-center mb-5">
        <h1 class="tournament-title">{{ info.TournamentName || 'Tournament' }}</h1>
        <p class="tournament-subtitle">{{ info.Format || 'Tournament Details' }}</p>
      </div>

      <ul class="nav nav-tabs nav-fill" id="tournamentTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="info-tab" data-bs-toggle="tab" data-bs-target="#info-pane" type="button" role="tab">Information</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="standings-tab" data-bs-toggle="tab" data-bs-target="#standings-pane" type="button" role="tab">Standings</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="pairings-tab" data-bs-toggle="tab" data-bs-target="#pairings-pane" type="button" role="tab">Pairings</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="gallery-tab" data-bs-toggle="tab" data-bs-target="#gallery-pane" type="button" role="tab">Gallery</button>
        </li>
      </ul>

      <div class="tab-content mt-4" id="tournamentTabContent">
        <div class="tab-pane fade show active p-4" id="info-pane" role="tabpanel">
          <h2 class="tab-title">Tournament Overview</h2>
          <p class="tournament-description">{{ info.TournamentDescription }}</p>
          <hr class="my-4">
          <div class="row">
            <div class="col-md-6">
              <h4 class="details-subtitle">Key Details</h4>
              <ul class="list-unstyled details-list">
                <li v-if="info.Format"><strong>Format:</strong> {{ info.Format }}</li>
                <li v-if="info.Venue"><strong>Venue:</strong> {{ info.Venue }}</li>
                <li v-if="info.ChiefArbiter"><strong>Chief Arbiter:</strong> {{ info.ChiefArbiter }}</li>
                <li v-if="info.Arbiters"><strong>Arbiters:</strong> {{ info.Arbiters }}</li>
                <li v-if="info.TimeControl"><strong>Time Control:</strong> {{ info.TimeControl }}</li>
              </ul>
            </div>
            <div class="col-md-6">
              <h4 class="details-subtitle">Important Documents</h4>
              <div v-if="documents.length > 0" class="list-group">
                <a v-for="doc in documents" :key="doc.Title" :href="doc.Link" target="_blank" class="list-group-item list-group-item-action">
                  <i class="fas fa-file-alt me-2"></i> {{ doc.Title }}
                </a>
              </div>
              <p v-else>No documents available.</p>
            </div>
          </div>
        </div>
        
        <div class="tab-pane fade p-4" id="standings-pane" role="tabpanel">
          <h3 class="text-center mb-3">Individual Standings</h3>
          <table class="table table-dark table-hover align-middle text-center">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Rating</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="player in individualStandings" :key="player.PlayerID">
                <td>{{ player.rank }}</td>
                <td class="clickable-name">{{ player.PlayerName }}</td>
                <td>{{ player.Rating }}</td>
                <td>{{ player.points.toFixed(1) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="tab-pane fade p-4" id="pairings-pane" role="tabpanel">
          <div class="d-flex justify-content-center mb-4">
            <select class="form-select form-select-lg w-auto bg-dark text-warning" v-model="selectedRound">
              <option v-for="round in uniqueRounds" :key="round" :value="round">Round {{ round }}</option>
            </select>
          </div>
          
          <table class="table table-dark table-hover align-middle text-center pairing-table">
            <thead>
              <tr>
                <th>Board</th>
                <th>White Player</th>
                <th>Result</th>
                <th>Black Player</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pairing in pairingsForSelectedRound" :key="pairing.PairingID">
                <td>{{ pairing.Board }}</td>
                <td class="text-white">{{ getPlayerDetails(pairing.White_PlayerID).PlayerName }}</td>
                <td class="text-warning fw-bold">{{ pairing.Result }}</td>
                <td class="text-white">{{ getPlayerDetails(pairing.Black_PlayerID).PlayerName }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="tab-pane fade p-4" id="gallery-pane" role="tabpanel">
          <div v-if="gallery.length > 0" class="photo-gallery">
            <a v-for="(photo, index) in gallery" :key="index" :href="photo.Image_URL" target="_blank" rel="noopener noreferrer">
              <img :src="photo.Image_URL" :alt="photo.Caption || 'Tournament Photo ' + (index + 1)">
            </a>
          </div>
          <p v-else class="text-center text-muted">No photos have been added yet.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// --- 1. DEFINE PROPS (identical to Swiss) ---
const props = defineProps({
  info: Object,
  documents: Array,
  gallery: Array,
  players: Array,
  pairingsResults: Array
});

// --- 2. LOGIC (identical to Swiss for now) ---
const selectedRound = ref(1);

const getPlayerDetails = (playerId) => {
  return props.players.find(p => p.PlayerID === playerId) || { PlayerName: 'BYE', Rating: '' };
};

const individualStandings = computed(() => {
  if (!props.players.length) return [];
  const playersData = {};
  
  props.players.forEach(p => {
    playersData[p.PlayerID] = { ...p, points: 0 };
  });

  props.pairingsResults.forEach(game => {
    const white = playersData[game.White_PlayerID];
    const black = playersData[game.Black_PlayerID];

    if (game.Result === '1-0' && white) { white.points += 1; }
    else if (game.Result === '0-1' && black) { black.points += 1; }
    else if (game.Result.includes('1/2') || game.Result.includes('0.5')) {
      if (white) white.points += 0.5;
      if (black) black.points += 0.5;
    }
  });

  const sorted = Object.values(playersData).sort((a, b) => b.points - a.points || b.Rating - a.Rating);
  return sorted.map((player, index) => ({ ...player, rank: index + 1 }));
});

const uniqueRounds = computed(() => {
    const rounds = props.pairingsResults.map(m => parseInt(m.Round)).filter(r => !isNaN(r));
    if (rounds.length === 0) return [1];
    const maxRound = Math.max(...rounds);
    return Array.from({length: maxRound}, (_, i) => i + 1);
});

const pairingsForSelectedRound = computed(() => {
  return props.pairingsResults
    .filter(m => m.Round == selectedRound.value)
    .sort((a, b) => a.Board - b.Board);
});

</script>

<style scoped>
/* All styles copied from IndividualSwissTemplate */
.individual-swiss-page {
  background: linear-gradient(135deg, #0a0a0a, #1a1a2e, #2a0a1e, #1a1a2e, #0a0a0a);
  background-size: 400% 400%;
  color: #e0e0e0;
  min-height: 100vh;
}
.tournament-title {
  font-size: 3.5rem; font-weight: 900;
  background: linear-gradient(45deg, #FFD700, #f0c000, #C0C0C0);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
}
.tournament-subtitle { font-size: 1.25rem; color: rgba(255, 255, 255, 0.7); }
.nav-tabs { border-bottom: 2px solid rgba(255, 215, 0, 0.2); }
.nav-tabs .nav-link { color: rgba(255, 255, 255, 0.7); background: transparent; border: none; border-bottom: 2px solid transparent; transition: all 0.3s ease; }
.nav-tabs .nav-link:hover { color: #FFD700; }
.nav-tabs .nav-link.active { color: #FFD700; background-color: rgba(255, 215, 0, 0.05); border-bottom: 2px solid #FFD700; }
.tab-content { background-color: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 0 0 15px 15px; }
.tab-title, .details-subtitle { color: #FFD700; }
.list-group-item { background: rgba(255,255,255,0.05); border-color: rgba(255,215,0,0.2); color: #e0e0e0; }
.list-group-item:hover { background-color: rgba(255, 215, 0, 0.1); color: #FFD700; }
.table thead { background: linear-gradient(45deg, #FFD700, #e6b200); color: #1a1a1a; }
.table tbody tr:hover { background-color: rgba(255, 215, 0, 0.1); }
.clickable-name { cursor: pointer; text-decoration: underline dotted rgba(255, 215, 0, 0.5); }
.clickable-name:hover { color: #FFD700; }
.pairing-table td { padding: 1rem 0.5rem; }
.photo-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
.photo-gallery img { width: 100%; height: 200px; object-fit: cover; border-radius: 10px; }
</style>