<template>
  <div class="knights-conquest-page">
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
          <button class="nav-link" id="standings-tab" data-bs-toggle="tab" data-bs-target="#standings-pane" type="button" role="tab">Standings</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="pairings-tab" data-bs-toggle="tab" data-bs-target="#pairings-pane" type="button" role="tab">Pairings</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="teams-tab" data-bs-toggle="tab" data-bs-target="#teams-pane" type="button" role="tab">Teams</button>
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
            <div class="d-flex justify-content-center mb-4">
              <div class="btn-group" role="group">
                <input type="radio" class="btn-check" name="standingsToggle" id="teamToggle" autocomplete="off" :checked="activeStandingsView === 'team'" @change="activeStandingsView = 'team'">
                <label class="btn btn-outline-warning" for="teamToggle">Team Standings</label>
                <input type="radio" class="btn-check" name="standingsToggle" id="individualToggle" autocomplete="off" :checked="activeStandingsView === 'individual'" @change="activeStandingsView = 'individual'">
                <label class="btn btn-outline-warning" for="individualToggle">Individual Leaderboard</label>
              </div>
            </div>
            <div v-if="activeStandingsView === 'team'">
              <h3 class="text-center mb-3">Team Points Table</h3>
              <table class="table table-dark table-hover align-middle text-center">
                <thead><tr><th>Rank</th><th>Team</th><th>Match Points</th><th>Tie-Breaks</th></tr></thead>
                <tbody>
                  <tr v-for="team in teamStandings" :key="team.TeamID">
                    <td>{{ team.rank }}</td>
                    <td @click="showTeamRecords(team)" class="clickable-name">{{ team.TeamName }}</td>
                    <td>{{ team.matchPoints }}</td>
                    <td>{{ team.gamePoints.toFixed(1) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="activeStandingsView === 'individual'">
              <h3 class="text-center mb-3">Individual Leaderboard</h3>
              <table class="table table-dark table-hover align-middle text-center">
                <thead><tr><th>Rank</th><th>Player</th><th>Team</th><th>Points</th></tr></thead>
                <tbody>
                  <tr v-for="player in individualStandings" :key="player.PlayerID">
                    <td>{{ player.rank }}</td>
                    <td @click="showPlayerRecords(player)" class="clickable-name">
                      {{ player.PlayerName }}
                      <span v-if="player.PlayerType === 'Captain'" class="captain-tag"> (C)</span>
                    </td>
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
            <div v-for="pairing in pairingsForSelectedRound" :key="pairing.TeamMatchID" class="pairing-card">
              <div class="pairing-header">
                <span>{{ pairing.TeamA.TeamName }}</span>
                <span class="team-score">{{ pairing.TeamA_Score }} - {{ pairing.TeamB_Score }}</span>
                <span>{{ pairing.TeamB.TeamName }}</span>
              </div>
              <ul class="list-group list-group-flush">
                <li v-for="game in pairing.games" :key="game.BoardNumber" class="list-group-item">
                  <span class="board-number">Board {{ game.BoardNumber }}</span>
                  <span>{{ game.WhitePlayer.PlayerName }}</span>
                  <span class="text-warning mx-2">{{ game.Result }}</span>
                  <span>{{ game.BlackPlayer.PlayerName }}</span>
                </li>
              </ul>
            </div>
        </div>
        
        <div class="tab-pane fade p-4" id="teams-pane" role="tabpanel">
            <div class="accordion" id="teamsAccordion">
              <div v-for="team in teamsList" :key="team.TeamID" class="accordion-item">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="'#collapse' + team.TeamID">
                    {{ team.TeamName }}
                  </button>
                </h2>
                <div :id="'collapse' + team.TeamID" class="accordion-collapse collapse" data-bs-parent="#teamsAccordion">
                  <div class="accordion-body">
                    <h5>Players</h5>
                    <ul>
                      <li v-for="player in team.players" :key="player.PlayerID" @click="showPlayerRecords(player)">
                        {{ player.PlayerName }}
                        <span v-if="player.PlayerType === 'Captain'" class="captain-tag"> (C)</span>
                        <span v-if="player.PlayerType === 'Owner'" class="captain-tag"> (Owner)</span>
                      </li>
                    </ul>
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
              <tr v-if="isPlayerRecord">
                <th>Round</th>
                <th>Opponent</th>
                <th>Color</th>
                <th>Result</th>
              </tr>
              <tr v-if="isTeamRecord">
                <th>Round</th>
                <th>Opponent Team</th>
                <th>Score</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in modalRecords" :key="record.id">
                <template v-if="isPlayerRecord">
                  <td>{{ record.round }}</td>
                  <td>{{ record.opponentName }}</td>
                  <td>{{ record.color }}</td>
                  <td>{{ record.result }}</td>
                </template>
                <template v-if="isTeamRecord">
                  <td>{{ record.round }}</td>
                  <td>{{ record.opponentTeamName }}</td>
                  <td>{{ record.score }}</td>
                  <td>{{ record.result }}</td>
                </template>
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
  teamsPlayers: Array,
  teamMatches: Array,
  individualGames: Array,
  TournamentsList: { type: Array, default: () => [] }
});

// --- 2. ALL COMPUTED PROPERTIES AND LOGIC ---
const activeStandingsView = ref('team');
const selectedRound = ref(1);

const showRecordModal = ref(false);
const modalTitle = ref('');
const modalRecords = ref([]);
const isPlayerRecord = ref(false);
const isTeamRecord = ref(false);

const getTeamDetails = (teamId) => {
  const teamMember = props.teamsPlayers.find(p => p.TeamID === teamId);
  return teamMember ? { TeamName: teamMember.TeamName, TeamID: teamId } : { TeamName: 'Unknown', TeamID: teamId };
};

const getPlayerDetails = (playerId) => {
  return props.teamsPlayers.find(p => p.PlayerID === playerId) || { PlayerName: 'Unknown' };
};

const teamStandings = computed(() => {
  if (!props.teamsPlayers.length || !props.teamMatches.length) return [];
  const teamsData = {};
  const uniqueTeams = [...new Map(props.teamsPlayers.map(p => [p.TeamID, p])).values()];
  
  uniqueTeams.forEach(team => {
    teamsData[team.TeamID] = { TeamID: team.TeamID, TeamName: team.TeamName, matchPoints: 0, gamePoints: 0 };
  });

  props.teamMatches.forEach(match => {
    const scoreA = parseFloat(match.TeamA_Score) || 0;
    const scoreB = parseFloat(match.TeamB_Score) || 0;

    if (teamsData[match.TeamA_ID]) teamsData[match.TeamA_ID].gamePoints += scoreA;
    if (teamsData[match.TeamB_ID]) teamsData[match.TeamB_ID].gamePoints += scoreB;

    if (match.MatchResult === 'Team A Won') {
      if (teamsData[match.TeamA_ID]) teamsData[match.TeamA_ID].matchPoints += 2;
    } else if (match.MatchResult === 'Team B Won') {
      if (teamsData[match.TeamB_ID]) teamsData[match.TeamB_ID].matchPoints += 2;
    } else if (match.MatchResult === 'Draw') {
      if (teamsData[match.TeamA_ID]) teamsData[match.TeamA_ID].matchPoints += 1;
      if (teamsData[match.TeamB_ID]) teamsData[match.TeamB_ID].matchPoints += 1;
    }
  });
  
  // Swiss has different tie-breaks, but we'll use this for now
  const sorted = Object.values(teamsData).sort((a, b) => b.matchPoints - a.matchPoints || b.gamePoints - a.gamePoints);
  return sorted.map((team, index) => ({ ...team, rank: index + 1 }));
});

const individualStandings = computed(() => {
  if (!props.teamsPlayers.length || !props.individualGames.length) return [];
  const playersData = {};
  
  props.teamsPlayers.forEach(p => {
    playersData[p.PlayerID] = { ...p, points: 0 };
  });

  props.individualGames.forEach(game => {
    const white = playersData[game.White_PlayerID];
    const black = playersData[game.Black_PlayerID];

    if (game.Result === '1-0' && white) { white.points += 1; }
    else if (game.Result === '0-1' && black) { black.points += 1; }
    else if (game.Result.includes('1/2') || game.Result.includes('0.5')) {
      if (white) white.points += 0.5;
      if (black) black.points += 0.5;
    }
  });

  const sorted = Object.values(playersData).sort((a, b) => b.points - a.points);
  return sorted.map((player, index) => ({ ...player, rank: index + 1 }));
});

const uniqueRounds = computed(() => {
    const rounds = props.teamMatches.map(m => parseInt(m.Round)).filter(r => !isNaN(r));
    if (rounds.length === 0) return [1];
    return [...new Set(rounds)].sort((a, b) => a - b);
});

const pairingsForSelectedRound = computed(() => {
  if (!props.teamMatches.length) return [];
  return props.teamMatches
    .filter(m => m.Round == selectedRound.value)
    .map(match => ({
      ...match,
      TeamA: getTeamDetails(match.TeamA_ID),
      TeamB: getTeamDetails(match.TeamB_ID),
      games: props.individualGames
        .filter(g => g.TeamMatchID === match.TeamMatchID)
        .map(game => ({
          ...game,
          WhitePlayer: getPlayerDetails(game.White_PlayerID),
          BlackPlayer: getPlayerDetails(game.Black_PlayerID),
        }))
        .sort((a, b) => a.BoardNumber - b.BoardNumber)
    }));
});

const teamsList = computed(() => {
    if (!props.teamsPlayers.length) return [];
    const teams = {};
    props.teamsPlayers.forEach(p => {
        if (!teams[p.TeamID]) {
            teams[p.TeamID] = { TeamID: p.TeamID, TeamName: p.TeamName, players: [] };
        }
        teams[p.TeamID].players.push(p);
    });
    Object.values(teams).forEach(team => {
      team.players.sort((a, b) => {
        if (a.PlayerType === 'Captain' && b.PlayerType !== 'Captain') return -1;
        if (a.PlayerType !== 'Captain' && b.PlayerType === 'Captain') return 1;
        if (a.PlayerType === 'Owner' && b.PlayerType !== 'Owner') return 1;
        if (a.PlayerType !== 'Owner' && b.PlayerType === 'Owner') return -1;
        return a.PlayerName.localeCompare(b.PlayerName);
      });
    });
    return Object.values(teams);
});


// --- 3. ALL METHODS ---
const showPlayerRecords = (player) => {
  modalTitle.value = `Match History: ${player.PlayerName}`;
  modalRecords.value = props.individualGames
    .map(game => {
        const teamMatch = props.teamMatches.find(tm => tm.TeamMatchID === game.TeamMatchID);
        return { ...game, round: teamMatch ? teamMatch.Round : 'N/A' };
    })
    .filter(game => game.White_PlayerID === player.PlayerID || game.Black_PlayerID === player.PlayerID)
    .map(game => {
      const isWhite = game.White_PlayerID === player.PlayerID;
      const opponentID = isWhite ? game.Black_PlayerID : game.White_PlayerID;
      const opponent = getPlayerDetails(opponentID);
      return {
        id: game.GameID,
        round: game.round,
        opponentName: opponent.PlayerName,
        color: isWhite ? 'White' : 'Black',
        result: game.Result,
      };
    })
    .sort((a, b) => a.round - b.round);

  isPlayerRecord.value = true;
  isTeamRecord.value = false;
  showRecordModal.value = true;
};

const showTeamRecords = (team) => {
  modalTitle.value = `Match History: ${team.TeamName}`;
  modalRecords.value = props.teamMatches
    .filter(match => match.TeamA_ID === team.TeamID || match.TeamB_ID === team.TeamID)
    .map(match => {
      const isTeamA = match.TeamA_ID === team.TeamID;
      const opponentID = isTeamA ? match.TeamB_ID : match.TeamA_ID;
      const opponentTeam = getTeamDetails(opponentID);
      const score = isTeamA ? `${match.TeamA_Score} - ${match.TeamB_Score}` : `${match.TeamB_Score} - ${match.TeamA_Score}`;
      return {
        id: match.TeamMatchID,
        round: match.Round || match.Stage,
        opponentTeamName: opponentTeam.TeamName,
        score: score,
        result: match.MatchResult
      };
    })
    .sort((a,b) => a.round - b.round);
  
  isPlayerRecord.value = false;
  isTeamRecord.value = true;
  showRecordModal.value = true;
};

const closeModal = () => {
  showRecordModal.value = false;
};

// --- Tournament title lookup ---
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
</script>

<style scoped>
/* All styles are copied from TeamLeagueTemplate */
@keyframes background-pan {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes title-glow {
  0% { text-shadow: 0 0 10px rgba(255, 215, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.2); }
  50% { text-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.5); }
  100% { text-shadow: 0 0 10px rgba(255, 215, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.2); }
}
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes modal-fade-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.knights-conquest-page {
  background: linear-gradient(135deg, #0a0a0a, #1a1a2e, #2a0a1e, #1a1a2e, #0a0a0a);
  background-size: 400% 400%;
  color: #e0e0e0;
  min-height: 100vh;
  animation: background-pan 25s ease infinite;
}
.tournament-title {
  font-size: 3.5rem;
  font-weight: 900;
  background: linear-gradient(45deg, #FFD700, #f0c000, #C0C0C0);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: title-glow 5s ease-in-out infinite;
}
.tournament-subtitle { font-size: 1.25rem; color: rgba(255, 255, 255, 0.7); }
.nav-tabs { border-bottom: 2px solid rgba(255, 215, 0, 0.2); }
.nav-tabs .nav-link { 
  color: rgba(255, 255, 255, 0.7); 
  background-color: transparent; 
  border: none;
  border-bottom: 2px solid transparent; 
  margin-bottom: -2px; 
  transition: all 0.3s ease; 
  font-weight: 600; 
  position: relative;
}
.nav-tabs .nav-link:hover { color: #FFD700; border-bottom-color: rgba(255, 215, 0, 0.5); }
.nav-tabs .nav-link.active { 
  color: #FFD700; 
  background-color: rgba(255, 215, 0, 0.05); 
  border-bottom: 2px solid #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}
.tab-content { 
  background-color: rgba(0, 0, 0, 0.3); 
  border: 1px solid rgba(255, 215, 0, 0.2); 
  border-radius: 0 0 15px 15px; 
  backdrop-filter: blur(5px);
}
.tab-title, .details-subtitle { color: #FFD700; text-shadow: 0 0 5px rgba(255, 215, 0, 0.4); }
.list-group-item { 
  background-color: rgba(255, 255, 255, 0.05); 
  border-color: rgba(255, 215, 0, 0.2); 
  color: #e0e0e0; 
  transition: all 0.3s ease;
}
.list-group-item:hover { 
  background-color: rgba(255, 215, 0, 0.1); 
  color: #FFD700; 
  transform: translateX(5px);
}
.btn-check:checked+.btn-outline-warning { 
  background-color: #FFD700; 
  color: #0a0a0a; 
  font-weight: 700; 
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
}
.table thead { 
  background: linear-gradient(45deg, #FFD700, #e6b200); 
  color: #1a1a1a; 
  text-transform: uppercase; 
}
.table tbody tr {
  animation: fade-in-up 0.5s ease-out;
  animation-fill-mode: both;
}
.table tbody tr:nth-child(even) { background-color: rgba(255,255,255,0.02); }
.table tbody tr:hover { background-color: rgba(255, 215, 0, 0.1); }
.table tbody tr:nth-child(1) { animation-delay: 0.05s; }
.table tbody tr:nth-child(2) { animation-delay: 0.1s; }
.table tbody tr:nth-child(3) { animation-delay: 0.15s; }
.table tbody tr:nth-child(4) { animation-delay: 0.2s; }
.table tbody tr:nth-child(5) { animation-delay: 0.25s; }
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
.pairing-card, .matchup {
  background-color: #212529;
  border-radius: 10px;
  margin-bottom: 1rem;
  border: 1px solid #444;
  transition: all 0.3s ease;
}
.pairing-card:hover, .matchup:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.4), 0 0 15px rgba(255, 215, 0, 0.2);
  border-color: #FFD700;
}
.pairing-header {
  background: linear-gradient(90deg, #2c2c34, #1e1e24);
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #444;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2em;
  box-shadow: inset 0 -5px 10px rgba(0,0,0,0.3);
}
.pairing-header > span {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 600;
}
.pairing-header > span:first-child {
    text-align: left;
    color: #e0e0e0;
}
.pairing-header > span:last-child {
    text-align: right;
    color: #e0e0e0;
}
.team-score {
  text-align: center;
    flex: 0 0 auto;
    color: #FFD700; 
    background: linear-gradient(45deg, #4b0101, #2408a5);
    padding: 0.5rem 1.2rem;
    border-radius: 8px;
    margin: 0 1.5rem;
    font-size: 1.1em;
    font-weight: 900;
    border: 2px solid #fff;
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
    position: relative;
    left: 44px;
}
.pairing-card .list-group-item {
  background: transparent;
  color: #e0e0e0;
  display: grid; 
  grid-template-columns: auto 1fr auto 1fr; 
  align-items: center;
  gap: 1.5rem;
  padding: 0.75rem 1.5rem;
}
.pairing-card .list-group-item > span:nth-child(2) {
  text-align: right; 
}
.pairing-card .list-group-item > span:nth-child(3) { 
  justify-self: center; 
  font-weight: bold;
}
.pairing-card .list-group-item > span:nth-child(4) {
  text-align: left;
}
.board-number { font-weight: bold; color: #adb5bd; }
.accordion-item { 
  background-color: #1a1a1a; 
  border: 1px solid rgba(255, 215, 0, 0.3); 
  border-radius: 10px;
  margin-bottom: 0.75rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}
.accordion-item:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4), 0 0 15px rgba(255, 215, 0, 0.2);
    transform: translateY(-2px);
}
.accordion-button { 
  background: linear-gradient(90deg, #3a3a3a, #2a2a2a); 
  color: #FFD700; 
  font-weight: bold; 
  padding: 1rem 1.5rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  font-size: 1em;
  border: none;
}
.accordion-button::after { 
    filter: invert(80%) sepia(100%) saturate(500%) hue-rotate(0deg) brightness(120%) contrast(100%);
    transition: transform 0.3s ease-in-out;
}
.accordion-button:not(.collapsed) { 
  background: linear-gradient(90deg, #FFD700, #e6b200);
  color: #1a1a1a;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
}
.accordion-button:not(.collapsed)::after {
    filter: none;
    transform: rotate(-180deg);
}
.accordion-button:focus { 
  outline: none;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.7);
}
.accordion-body {
  background-color: #282828;
  border-top: 1px solid rgba(255, 215, 0, 0.1);
  border-radius: 0 0 10px 10px;
  padding: 1rem 1.5rem;
}
.accordion-body h5 {
    color: #FFD700;
    margin-bottom: 1rem;
    font-size: 1em;
    text-transform: uppercase;
}
.accordion-body ul {
  list-style-type: none;
  padding-left: 0;
}
.accordion-body li {
  cursor: pointer;
  color: #f0f0f0;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 0.6rem 1rem;
  margin-bottom: 0.3rem;
  border-radius: 5px;
  border-left: 3px solid #FFD700;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
}
.accordion-body li:hover {
  background-color: rgba(255, 215, 0, 0.15);
  color: #FFD700;
  transform: translateX(8px);
  border-left-color: #fff;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}
.captain-tag {
  color: #c0c0c0;
  font-weight: bold;
  font-size: 0.8em;
  margin-left: 6px;
  letter-spacing: 0.5px;
  background-color: rgba(255, 215, 0, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
}
.photo-gallery { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); 
  gap: 1rem; 
}
.photo-gallery img { 
  width: 100%; 
  height: 200px; 
  object-fit: cover; 
  border-radius: 10px; 
  transition: transform 0.3s ease, box-shadow 0.3s ease; 
}
.photo-gallery img:hover { 
  transform: scale(1.05); 
  box-shadow: 0 5px 20px rgba(255, 215, 0, 0.4); 
}
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  animation: fade-in-up 0.3s ease;
}
.modal-container {
  background: #212529;
  border: 1px solid #FFD700;
  border-radius: 10px;
  color: #e0e0e0;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.3);
  animation: modal-fade-in 0.4s ease-out;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(45deg, rgba(255, 215, 0, 0.1), transparent);
  border-bottom: 1px solid #FFD700;
}
.modal-title {
  color: #FFD700;
  margin-bottom: 0;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
}
.modal-body {
  padding: 1rem;
  max-height: 70vh;
  overflow-y: auto;
}
</style>