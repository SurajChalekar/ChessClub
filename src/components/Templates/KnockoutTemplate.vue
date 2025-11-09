<template>
  <div class="knockout-page">
    <div class="container">
      <div class="page-header text-center mb-5">
        <h1 class="tournament-title">{{ tournamentTitle }}</h1>
        <p class="tournament-subtitle">{{ info.Format || 'Tournament Details' }}</p>
      </div>

      <ul class="nav nav-tabs nav-fill" id="tournamentTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="info-tab" data-bs-toggle="tab" data-bs-target="#info-pane" type="button" role="tab">Information</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="bracket-tab" data-bs-toggle="tab" data-bs-target="#bracket-pane" type="button" role="tab">Bracket</button>
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
        
        <div class="tab-pane fade p-4" id="bracket-pane" role="tabpanel">
          <h3 class="text-center mb-3">Tournament Bracket</h3>
          <div class="knockout-bracket">
            <div v-for="round in bracketRounds" :key="round.name" class="bracket-round">
              <h4 class="round-title">{{ round.name }}</h4>
              <div v-for="match in round.matches" :key="match.MatchID" class="matchup">
                <div class="match-participant" :class="{ 'winner': match.Result === 'Player A Won' }">
                  <span @click="showPlayerRecords(getParticipantDetails(match.PlayerA_ID))" class="clickable-name">{{ getParticipantDetails(match.PlayerA_ID).Name }}</span>
                  <span class="score">{{ getScore(match.Score, 'A') }}</span>
                </div>
                <div class="match-participant" :class="{ 'winner': match.Result === 'Player B Won' }">
                  <span @click="showPlayerRecords(getParticipantDetails(match.PlayerB_ID))" class="clickable-name">{{ getParticipantDetails(match.PlayerB_ID).Name }}</span>
                  <span class="score">{{ getScore(match.Score, 'B') }}</span>
                </div>
              </div>
            </div>
          </div>
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

    <div v-if="showRecordModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h5 class="modal-title">{{ modalTitle }}</h5>
          <button @click="closeModal" type="button" class="btn-close btn-close-white"></button>
        </div>
        <div class="modal-body">
          <p v-if="modalRecords.length === 0" class="text-center">No match data available.</p>
          <table v-else class="table table-dark table-sm table-striped">
            <thead>
              <tr>
                <th>Stage</th>
                <th>Opponent</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in modalRecords" :key="record.id">
                <td>{{ record.stage }}</td>
                <td>{{ record.opponentName }}</td>
                <td>{{ record.result }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// --- 1. DEFINE PROPS ---
const props = defineProps({
  info: Object,
  documents: Array,
  gallery: Array,
  participants: Array, // Note: This uses 'participants' prop
  bracketMatches: Array, // Note: This uses 'bracketMatches' prop
  TournamentsList: { type: Array, default: () => [] }
});

// --- 2. LOGIC ---
const showRecordModal = ref(false);
const modalTitle = ref('');
const modalRecords = ref([]);
const isPlayerRecord = ref(false);
const isTeamRecord = ref(false);
const getParticipantDetails = (playerId) => {
  // Use props.participants
  return props.participants.find(p => p.PlayerID === playerId) || { Name: 'TBD' };
};

const getScore = (scoreString, player) => {
  if (!scoreString || !scoreString.includes('-')) return '';
  const parts = scoreString.split('-');
  return player === 'A' ? parts[0] : parts[1];
};

const bracketRounds = computed(() => {
  const rounds = {};
  
  // Group matches by round
  props.bracketMatches.forEach(match => {
    if (!rounds[match.Round]) {
      rounds[match.Round] = { name: match.Round, matches: [] };
    }
    rounds[match.Round].matches.push(match);
  });
  
  // Sort matches within each round
  for (const round of Object.values(rounds)) {
    round.matches.sort((a, b) => a.MatchNumber - b.MatchNumber);
  }
  
  return Object.values(rounds);
});

// Tournament title lookup
const tournamentTitle = computed(() => {
  const list = props.TournamentsList || [];
  if (Array.isArray(list) && list.length && props.info) {
    const id = props.info.TournamentID || props.info.id || props.info.ID;
    if (id) {
      const m = list.find(t => String(t.TournamentID || t.id || t.ID) === String(id));
      if (m) return m.TournamentName || m.Name || m.title || props.info.TournamentName;
    }
  }
  return props.info?.TournamentName || 'Tournament';
});

// --- MODAL FUNCTIONS ---
const showPlayerRecords = (participant) => {
  if (!participant || participant.Name === 'TBD') return;
  
  modalTitle.value = `Match History: ${participant.Name}`;
  modalRecords.value = props.bracketMatches
    .filter(match => match.PlayerA_ID === participant.PlayerID || match.PlayerB_ID === participant.PlayerID)
    .map(match => {
      const isPlayerA = match.PlayerA_ID === participant.PlayerID;
      const opponentID = isPlayerA ? match.PlayerB_ID : match.PlayerA_ID;
      const opponent = getParticipantDetails(opponentID);

      let matchOutcome = '-';
      if (match.Result === 'Draw') matchOutcome = 'Draw';
      else if ((isPlayerA && match.Result === 'Player A Won') || (!isPlayerA && match.Result === 'Player B Won'))
        matchOutcome = 'Win';
      else if ((isPlayerA && match.Result === 'Player B Won') || (!isPlayerA && match.Result === 'Player A Won'))
        matchOutcome = 'Loss';

      return {
        id: match.MatchID,
        stage: match.Round,
        opponentName: opponent.Name,
        result: matchOutcome,
      };
    })
    .sort((a, b) => {
      // Define bracket stage order
      const stageOrder = ['Round of 16', 'Quarterfinals', 'Semifinals', 'Final', '3rd Place'];
      const indexA = stageOrder.indexOf(a.stage);
      const indexB = stageOrder.indexOf(b.stage);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      return String(a.stage).localeCompare(String(b.stage));
    });

  isPlayerRecord.value = true;
  isTeamRecord.value = false;
  showRecordModal.value = true;
};

const closeModal = () => {
  showRecordModal.value = false;
};

</script>

<style scoped>
.knockout-page {
  background: linear-gradient(135deg, #0a0a0a, #1a1a2e, #2a0a1e, #1a1a2e, #0a0a0a);
  color: #e0e0e0; min-height: 100vh;
}
.tournament-title { font-size: 3.5rem; font-weight: 900; background: linear-gradient(45deg, #FFD700, #f0c000, #C0C0C0); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.tournament-subtitle { font-size: 1.25rem; color: rgba(255, 255, 255, 0.7); }
.nav-tabs { border-bottom: 2px solid rgba(255, 215, 0, 0.2); }
.nav-tabs .nav-link { color: rgba(255, 255, 255, 0.7); background: transparent; border: none; border-bottom: 2px solid transparent; transition: all 0.3s ease; }
.nav-tabs .nav-link:hover { color: #FFD700; }
.nav-tabs .nav-link.active { color: #FFD700; background-color: rgba(255, 215, 0, 0.05); border-bottom: 2px solid #FFD700; }
.tab-content { background-color: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 0 0 15px 15px; }
.tab-title, .details-subtitle { color: #FFD700; }
.list-group-item { background: rgba(255,255,255,0.05); border-color: rgba(255,215,0,0.2); color: #e0e0e0; }
.list-group-item:hover { background-color: rgba(255, 215, 0, 0.1); color: #FFD700; }
.photo-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
.photo-gallery img { width: 100%; height: 200px; object-fit: cover; border-radius: 10px; }

/* New Bracket Styles */
.knockout-bracket {
  display: flex;
  overflow-x: auto;
  padding: 1rem;
}
.bracket-round {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  flex-shrink: 0;
  margin-right: 3rem;
  min-width: 200px;
}
.round-title {
  color: #FFD700;
  text-align: center;
  margin-bottom: 1rem;
}
.matchup {
  background: #212529;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #444;
}
.match-participant {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  color: #aaa;
  border-bottom: 1px solid #333;
}
.match-participant:last-child {
  border-bottom: none;
}
.match-participant.winner {
  color: #FFD700;
  font-weight: bold;
}
.score {
  font-weight: bold;
}
.clickable-name {
  cursor: pointer;
  text-decoration: underline dotted rgba(255, 215, 0, 0.5);
  transition: all 0.2s ease;
}
.clickable-name:hover {
  color: #FFD700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.7);
  transform: scale(1.05);
}

/* Modal Styles */
@keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes modal-fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background-color: rgba(0, 0, 0, 0.8); backdrop-filter: blur(5px);
  display: flex; justify-content: center; align-items: center; z-index: 1050;
  animation: fade-in-up 0.3s ease;
}
.modal-container {
  background: #212529; border: 1px solid #FFD700; border-radius: 10px; color: #e0e0e0;
  width: 90%; max-width: 600px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.3);
  animation: modal-fade-in 0.4s ease-out;
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center; padding: 1rem;
  background: linear-gradient(45deg, rgba(255, 215, 0, 0.1), transparent);
  border-bottom: 1px solid #FFD700;
}
.modal-title { color: #FFD700; margin-bottom: 0; text-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
.modal-body { padding: 1rem; max-height: 70vh; overflow-y: auto; }
</style>