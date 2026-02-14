<template>
  <div class="arena-swiss-page">
    <div class="container">
      <div class="page-header text-center mb-5">
        <h1 class="tournament-title">{{ info.TournamentName || 'Tournament' }}</h1>
        <p class="tournament-subtitle">{{ info.Format || 'Individual Swiss Team Arena' }}</p>
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
              <p v-else class="text-center text-muted">No documents available.</p>
            </div>
          </div>
        </div>

        <div class="tab-pane fade p-4" id="standings-pane" role="tabpanel">
          <div class="d-flex justify-content-center mb-4">
            <div class="btn-group" role="group">
              <input type="radio" class="btn-check" name="standingsToggleArena" id="teamToggleArena" autocomplete="off" :checked="activeStandingsView === 'team'" @change="activeStandingsView = 'team'">
              <label class="btn btn-outline-warning" for="teamToggleArena">Team Standings</label>
              <input type="radio" class="btn-check" name="standingsToggleArena" id="individualToggleArena" autocomplete="off" :checked="activeStandingsView === 'individual'" @change="activeStandingsView = 'individual'">
              <label class="btn btn-outline-warning" for="individualToggleArena">Individual Leaderboard</label>
            </div>
          </div>

          <div v-if="activeStandingsView === 'team'">
            <h3 class="text-center mb-3">Team Standings (Cumulative Points)</h3>
            <table class="table table-dark table-hover align-middle text-center">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Team</th>
                  <th>Total Points</th>
                  </tr>
              </thead>
              <tbody>
                <tr v-for="team in teamStandings" :key="team.TeamID">
                  <td>{{ team.rank }}</td>
                  <td class="clickable-name">{{ team.TeamName }}</td>
                  <td>{{ team.totalPoints.toFixed(1) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="activeStandingsView === 'individual'">
            <h3 class="text-center mb-3">Individual Leaderboard</h3>
            <table class="table table-dark table-hover align-middle text-center">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Team</th>
                  <th>Points</th>
                  </tr>
              </thead>
              <tbody>
                <tr v-for="player in individualStandings" :key="player.PlayerID">
                  <td>{{ player.rank }}</td>
                  <td @click="showPlayerRecords(player)" class="clickable-name">{{ player.PlayerName }}</td>
                  <td>{{ player.TeamName }}</td>
                  <td>{{ player.points.toFixed(1) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
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
                <th>White Player (Team)</th>
                <th>Result</th>
                <th>Black Player (Team)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pairing in pairingsForSelectedRound" :key="pairing.PairingID">
                <td>{{ pairing.Board }}</td>
                <td class="text-white">
                  {{ getPlayerDetails(pairing.White_PlayerID).PlayerName }}
                  <small class="text-muted">({{ getPlayerDetails(pairing.White_PlayerID).TeamName }})</small>
                </td>
                <td class="text-warning fw-bold">{{ pairing.Result }}</td>
                <td class="text-white">
                   {{ getPlayerDetails(pairing.Black_PlayerID).PlayerName }}
                   <small class="text-muted">({{ getPlayerDetails(pairing.Black_PlayerID).TeamName }})</small>
                </td>
              </tr>
            </tbody>
          </table>
           <p v-if="pairingsForSelectedRound.length === 0" class="text-center text-muted mt-4">
              No pairings found for this round.
            </p>
        </div>

        <div class="tab-pane fade p-4" id="gallery-pane" role="tabpanel">
          <div v-if="gallery.length > 0" class="photo-gallery">
            <a v-for="(photo, index) in gallery" :key="index" :href="photo.Image_URL" target="_blank" rel="noopener noreferrer">
              <img :src="photo.Image_URL" :alt="photo.Caption || 'Tournament Photo ' + (index + 1)">
            </a>
          </div>
          <p v-else class="text-center text-muted">No photos available.</p>
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
                <th>Round</th>
                <th>Opponent</th>
                <th>Color</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in modalRecords" :key="record.id">
                <td>{{ record.round }}</td>
                <td>{{ record.opponentName }}</td>
                <td>{{ record.color }}</td>
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

// --- PROPS ---
const props = defineProps({
  info: Object, // From Info tab
  documents: Array, // From Documents tab
  gallery: Array, // From Gallery tab
  playersTeams: Array, // From Players_Teams tab
  pairingsResults: Array // From Pairings_Results tab
});

// --- STATE ---
const activeStandingsView = ref('team'); // Default view is team standings
const selectedRound = ref(1);

const showRecordModal = ref(false);
const modalTitle = ref('');
const modalRecords = ref([]);
const isPlayerRecord = ref(false);
const isTeamRecord = ref(false);

// --- COMPUTED: UTILITY ---
const getPlayerDetails = (playerId) => {
  // Finds player details including team name from the playersTeams prop
  return props.playersTeams?.find(p => p.PlayerID === playerId) || { PlayerName: 'BYE', TeamName: '-', Rating: '' };
};

// --- COMPUTED: DATA PROCESSING ---
const individualStandings = computed(() => {
  // Calculates individual points based on pairingsResults
  if (!props.playersTeams?.length || !props.pairingsResults?.length) return [];
  const playersData = {};

  // Initialize playersData with info from playersTeams
  props.playersTeams.forEach(p => {
    playersData[p.PlayerID] = { ...p, points: 0 };
  });

  // Calculate points from pairingsResults
  props.pairingsResults.forEach(game => {
    const white = playersData[game.White_PlayerID];
    const black = playersData[game.Black_PlayerID];

    if (game.Result === '1-0' && white) { white.points += 1; }
    else if (game.Result === '0-1' && black) { black.points += 1; }
    else if (game.Result === '1/2-1/2' || game.Result === '0.5-0.5') {
      if (white) white.points += 0.5;
      if (black) black.points += 0.5;
    }
    // Handle Byes (e.g., if Result is '1-0' and Black_PlayerID is empty/null/BYE)
    else if (game.Result === '1-0' && white && !game.Black_PlayerID) { white.points += 1; }
    // Handle Forfeits, etc. if needed
  });

  // Sort individuals by points, then rating (higher is better)
  const sorted = Object.values(playersData).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    // Add other tie-breaks here (e.g., Buchholz, Rating)
    return (b.Rating || 0) - (a.Rating || 0);
  });

  return sorted.map((player, index) => ({ ...player, rank: index + 1 }));
});

const teamStandings = computed(() => {
  // Calculates team standings by summing individual points
  if (!props.playersTeams?.length) return [];
  const teamsData = {};

  // Use individualStandings which already has calculated points
  const individuals = individualStandings.value;

  individuals.forEach(player => {
    if (!teamsData[player.TeamID]) {
      teamsData[player.TeamID] = {
        TeamID: player.TeamID,
        TeamName: player.TeamName,
        totalPoints: 0,
        players: [] // Optional: store players in the team
      };
    }
    teamsData[player.TeamID].totalPoints += player.points;
    teamsData[player.TeamID].players.push(player); // Add player to team list
  });

  // Sort teams by total points (higher is better)
  const sorted = Object.values(teamsData).sort((a, b) => {
      // Primary Sort: Total Points
      if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
      }
      // Add secondary team tie-breaks if necessary (e.g., highest individual score)
      return 0; // Maintain original order if tied
  });


  return sorted.map((team, index) => ({ ...team, rank: index + 1 }));
});

const uniqueRounds = computed(() => {
  // Finds unique round numbers from pairingsResults
    if (!props.pairingsResults) return [1];
    const rounds = props.pairingsResults.map(m => parseInt(m.Round)).filter(r => !isNaN(r));
    if (rounds.length === 0) return [1];
    const maxRound = Math.max(...rounds);
    return Array.from({length: maxRound}, (_, i) => i + 1); // Array [1, 2, ..., maxRound]
});

const pairingsForSelectedRound = computed(() => {
  // Filters pairings for the selected round
  if (!props.pairingsResults) return [];
  return props.pairingsResults
    .filter(m => parseInt(m.Round) == selectedRound.value)
    .sort((a, b) => parseInt(a.Board) - parseInt(b.Board)); // Sort by board number
});

// --- MODAL FUNCTIONS ---
const showPlayerRecords = (player) => {
  modalTitle.value = `Match History: ${player.PlayerName}`;
  modalRecords.value = props.pairingsResults
    .filter(game => game.White_PlayerID === player.PlayerID || game.Black_PlayerID === player.PlayerID)
    .map(game => {
      const isWhite = game.White_PlayerID === player.PlayerID;
      const opponentID = isWhite ? game.Black_PlayerID : game.White_PlayerID;
      const opponent = getPlayerDetails(opponentID);

      let gameOutcome = '-';
      if (game.Result === '1/2-1/2' || game.Result === '0.5-0.5') gameOutcome = 'Draw';
      else if ((isWhite && game.Result === '1-0') || (!isWhite && game.Result === '0-1'))
        gameOutcome = 'Win';
      else if ((isWhite && game.Result === '0-1') || (!isWhite && game.Result === '1-0'))
        gameOutcome = 'Loss';

      return {
        id: game.PairingID,
        round: game.Round,
        opponentName: opponent.PlayerName,
        color: isWhite ? 'White' : 'Black',
        result: gameOutcome,
      };
    })
    .sort((a, b) => {
      const roundA = parseInt(a.round);
      const roundB = parseInt(b.round);
      if (!isNaN(roundA) && !isNaN(roundB)) return roundA - roundB;
      return String(a.round).localeCompare(String(b.round));
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
/* Scoped styles - can reuse styles from IndividualSwiss or TeamLeague */
.arena-swiss-page {
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
.clickable-name { cursor: pointer; text-decoration: underline dotted rgba(255, 215, 0, 0.5); transition: all 0.2s ease; }
.clickable-name:hover { color: #FFD700; text-shadow: 0 0 8px rgba(255, 215, 0, 0.7); transform: scale(1.05); }
.pairing-table td { padding: 0.8rem 0.5rem; vertical-align: middle; }
.pairing-table small { font-size: 0.8em; }
.photo-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
.photo-gallery img { width: 100%; height: 200px; object-fit: cover; border-radius: 10px; }
.btn-check:checked+.btn-outline-warning {
  background-color: #FFD700; color: #0a0a0a; font-weight: 700;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
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