<template>
  <div class="knights-conquest-page py-5">
    <div class="container">
      <div class="page-header text-center mb-5">
        <h1 class="tournament-title">Knight's Conquest</h1>
        <p class="tournament-subtitle">The Premier Franchise League</p>
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
          <button class="nav-link" id="playoffs-tab" data-bs-toggle="tab" data-bs-target="#playoffs-pane" type="button" role="tab">Playoffs</button>
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
          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-warning" role="status"></div><p class="mt-3">Loading Information...</p>
          </div>
          <div v-else>
            <h2 class="tab-title">Tournament Overview</h2>
            <p class="tournament-description">{{ tournamentInfo.TournamentDescription }}</p>
            <hr class="my-4">
            <div class="row">
              <div class="col-md-6">
                <h4 class="details-subtitle">Key Details</h4>
                <ul class="list-unstyled details-list">
                  <li v-if="tournamentInfo.Format"><strong>Format:</strong> {{ tournamentInfo.Format }}</li>
                  <li v-if="tournamentInfo.Venue"><strong>Venue:</strong> {{ tournamentInfo.Venue }}</li>
                  <li v-if="tournamentInfo.ChiefArbiter"><strong>Chief Arbiter:</strong> {{ tournamentInfo.ChiefArbiter }}</li>
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
        </div>
        
        <div class="tab-pane fade p-4" id="standings-pane" role="tabpanel">
            <div v-if="isLoading" class="text-center py-5">
              <div class="spinner-border text-warning" role="status"></div><p class="mt-3">Calculating Standings...</p>
            </div>
          <div v-else>
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
                <thead><tr><th>Rank</th><th>Team</th><th>Match Points</th><th>Tie-Break (Game Pts)</th></tr></thead>
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
                    <span v-if="player.Captain" class="captain-tag"> (C)</span>
                    </td>
                    <td>{{ player.TeamName }}</td>
                    <td>{{ player.points.toFixed(1) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="tab-pane fade p-4" id="pairings-pane" role="tabpanel">
            <div v-if="isLoading" class="text-center py-5">
              <div class="spinner-border text-warning" role="status"></div><p class="mt-3">Loading Pairings...</p>
            </div>
          <div v-else>
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
        </div>
        <div class="tab-pane fade p-4" id="playoffs-pane" role="tabpanel">
            <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-warning" role="status"></div><p class="mt-3">Loading Playoffs...</p>
          </div>
          <div v-else class="playoff-bracket">
            <div class="round semifinals">
              <h4 class="round-title">Semifinals</h4>
              <div v-for="match in playoffMatches.semifinals" :key="match.TeamMatchID" class="matchup">
                  <div><strong>{{match.TeamA.TeamName}}</strong> <span>{{match.TeamA_Score}}</span></div>
                  <div><strong>{{match.TeamB.TeamName}}</strong> <span>{{match.TeamB_Score}}</span></div>
              </div>
            </div>
            <div class="round finals">
              <h4 class="round-title">Final</h4>
              <div v-for="match in playoffMatches.final" :key="match.TeamMatchID" class="matchup">
                  <div><strong>{{match.TeamA.TeamName}}</strong> <span>{{match.TeamA_Score}}</span></div>
                  <div><strong>{{match.TeamB.TeamName}}</strong> <span>{{match.TeamB_Score}}</span></div>
              </div>
            </div>
              <div class="round third-place">
              <h4 class="round-title">3rd/4th Place</h4>
              <div v-for="match in playoffMatches.thirdPlace" :key="match.TeamMatchID" class="matchup">
                  <div><strong>{{match.TeamA.TeamName}}</strong> <span>{{match.TeamA_Score}}</span></div>
                  <div><strong>{{match.TeamB.TeamName}}</strong> <span>{{match.TeamB_Score}}</span></div>
              </div>
            </div>
          </div>
        </div>
        <div class="tab-pane fade p-4" id="teams-pane" role="tabpanel">
            <div v-if="isLoading" class="text-center py-5">
              <div class="spinner-border text-warning" role="status"></div><p class="mt-3">Loading Teams...</p>
            </div>
          <div v-else class="accordion" id="teamsAccordion">
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
                     <span v-if="player.Captain" class="captain-tag"> (C)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="tab-pane fade p-4" id="gallery-pane" role="tabpanel">
            <div v-if="isLoading" class="text-center py-5">
              <div class="spinner-border text-warning" role="status"></div><p class="mt-3">Loading Photos...</p>
        </div>
        <div v-else-if="photos.length > 0" class="photo-gallery">
          <a v-for="(photo, index) in photos" :key="index" :href="photo.Image_URL" target="_blank" rel="noopener noreferrer">
            <img :src="photo.Image_URL" :alt="'Tournament Photo ' + (index + 1)">
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
import { ref, onMounted, computed } from 'vue';

defineProps({ id: String });

const isLoading = ref(true);
const tournamentInfo = ref({});
const documents = ref([]);
const playersAndTeams = ref([]);
const teamMatches = ref([]);
const individualGames = ref([]);
const photos = ref([]);
const activeStandingsView = ref('team');
const selectedRound = ref(1);

const showRecordModal = ref(false);
const modalTitle = ref('');
const modalRecords = ref([]);
const isPlayerRecord = ref(false);
const isTeamRecord = ref(false);

// Find the old fetchAndParseSheet function and replace it with this new one

async function fetchAndParseSheet(url) {
  if (!url || url.startsWith('PASTE_URL')) {
    return [];
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network error: ${response.status} - ${response.statusText}`);
    }
    const csvText = await response.text();
    const lines = csvText.split(/\r?\n/);
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const data = lines.slice(1).map(line => {
      if (!line.trim()) return null;
      const rowObject = {};
      
      // This is the new, more robust parser for a single line.
      // It splits by commas but correctly ignores commas inside double quotes.
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

      headers.forEach((header, index) => {
        if (values[index]) {
          // This removes quotes ONLY from the beginning and end of the string,
          // which is the correct way to handle CSV fields.
          rowObject[header] = values[index].trim().replace(/^"|"$/g, '');
        } else {
          rowObject[header] = '';
        }
      });
      return rowObject;
    }).filter(Boolean);
    return data;
  } catch (error) {
    console.error(`Failed to fetch or parse sheet data from ${url}:`, error);
    throw error;
  }
}

const getTeamDetails = (teamId) => {
  const teamMember = playersAndTeams.value.find(p => p.TeamID === teamId);
  return teamMember ? { TeamName: teamMember.TeamName, TeamID: teamId } : { TeamName: 'Unknown', TeamID: teamId };
};

const getPlayerDetails = (playerId) => playersAndTeams.value.find(p => p.PlayerID === playerId) || { PlayerName: 'Unknown' };

const teamStandings = computed(() => {
  if (!playersAndTeams.value.length || !teamMatches.value.length) return [];
  const teamsData = {};
  const uniqueTeams = [...new Map(playersAndTeams.value.map(p => [p.TeamID, p])).values()];
  uniqueTeams.forEach(team => {
    teamsData[team.TeamID] = { TeamID: team.TeamID, TeamName: team.TeamName, matchPoints: 0, gamePoints: 0 };
  });
  teamMatches.value.forEach(match => {
    if (match.Stage !== 'League') return;
    const scoreA = parseFloat(match.TeamA_Score) || 0;
    const scoreB = parseFloat(match.TeamB_Score) || 0;
    if (teamsData[match.TeamA_ID]) teamsData[match.TeamA_ID].gamePoints += scoreA;
    if (teamsData[match.TeamB_ID]) teamsData[match.TeamB_ID].gamePoints += scoreB;
    if (scoreA > scoreB) { if (teamsData[match.TeamA_ID]) teamsData[match.TeamA_ID].matchPoints += 2; }
    else if (scoreB > scoreA) { if (teamsData[match.TeamB_ID]) teamsData[match.TeamB_ID].matchPoints += 2; }
    else { 
      if (teamsData[match.TeamA_ID]) teamsData[match.TeamA_ID].matchPoints += 1;
      if (teamsData[match.TeamB_ID]) teamsData[match.TeamB_ID].matchPoints += 1;
    }
  });
  const sorted = Object.values(teamsData).sort((a, b) => b.matchPoints - a.matchPoints || b.gamePoints - a.gamePoints);
  return sorted.map((team, index) => ({ ...team, rank: index + 1 }));
});

const individualStandings = computed(() => {
  if (!playersAndTeams.value.length || !individualGames.value.length) return [];
  const playersData = {};
  playersAndTeams.value.forEach(p => {
    playersData[p.PlayerID] = { ...p, points: 0 };
  });
  individualGames.value.forEach(game => {
    const teamMatch = teamMatches.value.find(tm => tm.TeamMatchID === game.TeamMatchID);
    if (!teamMatch || teamMatch.Stage !== 'League') return;

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
    const leagueMatches = teamMatches.value.filter(m => m.Stage === 'League');
    const rounds = leagueMatches.map(m => parseInt(m.Round)).filter(r => !isNaN(r));
    if (rounds.length === 0) return [1];
    return [...new Set(rounds)].sort((a, b) => a - b);
});

const pairingsForSelectedRound = computed(() => {
  if (!teamMatches.value.length) return [];
  return teamMatches.value
    .filter(m => m.Round == selectedRound.value && m.Stage === 'League')
    .map(match => ({
      ...match,
      TeamA: getTeamDetails(match.TeamA_ID),
      TeamB: getTeamDetails(match.TeamB_ID),
      games: individualGames.value
        .filter(g => g.TeamMatchID === match.TeamMatchID)
        .map(game => ({
          ...game,
          WhitePlayer: getPlayerDetails(game.White_PlayerID),
          BlackPlayer: getPlayerDetails(game.Black_PlayerID),
        }))
        .sort((a, b) => a.BoardNumber - b.BoardNumber)
    }));
});

const playoffMatches = computed(() => {
    if (!teamMatches.value.length) return { semifinals: [], final: [], thirdPlace: [] };
    const matches = teamMatches.value
        .filter(m => m.Stage !== 'League')
        .map(match => ({...match, TeamA: getTeamDetails(match.TeamA_ID), TeamB: getTeamDetails(match.TeamB_ID)}));
    return {
        semifinals: matches.filter(m => m.Stage === 'Semifinal'),
        final: matches.filter(m => m.Stage === 'Final'),
        thirdPlace: matches.filter(m => m.Stage === '3rd_Place'),
    }
});

const teamsList = computed(() => {
    if (!playersAndTeams.value.length) return [];
    const teams = {};
    playersAndTeams.value.forEach(p => {
        if (!teams[p.TeamID]) {
            teams[p.TeamID] = { TeamID: p.TeamID, TeamName: p.TeamName, players: [] };
        }
        teams[p.TeamID].players.push(p);
    });
    return Object.values(teams);
});

const showPlayerRecords = (player) => {
  modalTitle.value = `Match History: ${player.PlayerName}`;
  modalRecords.value = individualGames.value
    .map(game => {
        const teamMatch = teamMatches.value.find(tm => tm.TeamMatchID === game.TeamMatchID);
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
  modalRecords.value = teamMatches.value
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

const fetchAllTournamentData = async () => {
  isLoading.value = true;
  try {
    const sheetUrls = {
      KC_Info:             'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRUcvxBFbPWUVY9f2QgT_fsdUAjoubfVJYrYEkV7-kbs-EX89GDn0dHaMXMumNH-JJuaHC31KcV6jE/pub?gid=779715765&single=true&output=csv',
      KC_Documents:        'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRUcvxBFbPWUVY9f2QgT_fsdUAjoubfVJYrYEkV7-kbs-EX89GDn0dHaMXMumNH-JJuaHC31KcV6jE/pub?gid=983488171&single=true&output=csv',
      KC_Teams_Players:    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRUcvxBFbPWUVY9f2QgT_fsdUAjoubfVJYrYEkV7-kbs-EX89GDn0dHaMXMumNH-JJuaHC31KcV6jE/pub?gid=0&single=true&output=csv',
      KC_Team_Matches:     'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRUcvxBFbPWUVY9f2QgT_fsdUAjoubfVJYrYEkV7-kbs-EX89GDn0dHaMXMumNH-JJuaHC31KcV6jE/pub?gid=280372676&single=true&output=csv',
      KC_Individual_Games: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRUcvxBFbPWUVY9f2QgT_fsdUAjoubfVJYrYEkV7-kbs-EX89GDn0dHaMXMumNH-JJuaHC31KcV6jE/pub?gid=502918467&single=true&output=csv',
      KC_Photos:           'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRUcvxBFbPWUVY9f2QgT_fsdUAjoubfVJYrYEkV7-kbs-EX89GDn0dHaMXMumNH-JJuaHC31KcV6jE/pub?gid=1829396058&single=true&output=csv',
    };

    const [
      infoData,
      documentsData,
      teamsPlayersData,
      teamMatchesData,
      individualGamesData,
      photosData
    ] = await Promise.all([
      fetchAndParseSheet(sheetUrls.KC_Info),
      fetchAndParseSheet(sheetUrls.KC_Documents),
      fetchAndParseSheet(sheetUrls.KC_Teams_Players),
      fetchAndParseSheet(sheetUrls.KC_Team_Matches),
      fetchAndParseSheet(sheetUrls.KC_Individual_Games),
      fetchAndParseSheet(sheetUrls.KC_Photos),
    ]);
    
    tournamentInfo.value = infoData[0] || {};
    documents.value = documentsData;
    playersAndTeams.value = teamsPlayersData;
    teamMatches.value = teamMatchesData;
    individualGames.value = individualGamesData;
    photos.value = photosData;

  } catch (error) {
    console.error("Failed to fetch all tournament data:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchAllTournamentData();
});
</script>

<style scoped>
/* --- 🎨 ANIMATIONS & ENHANCEMENTS 🎨 --- */
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

/* Main page styles */
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

/* Tab Styling */
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

/* Info Pane */
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

/* Standings Pane */
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
/* Staggered animation for table rows */
.table tbody tr:nth-child(1) { animation-delay: 0.05s; }
.table tbody tr:nth-child(2) { animation-delay: 0.1s; }
.table tbody tr:nth-child(3) { animation-delay: 0.15s; }
.table tbody tr:nth-child(4) { animation-delay: 0.2s; }
.table tbody tr:nth-child(5) { animation-delay: 0.25s; }

/* Style for clickable names */
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

/* Pairings & Playoffs Pane */
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
/* Find and replace your existing .pairing-header and .team-score rules with this block */

.pairing-header {
  background: linear-gradient(90deg, #2c2c34, #1e1e24); /* Darker, subtle gradient */
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #444;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2em; /* Slightly larger font */
  box-shadow: inset 0 -5px 10px rgba(0,0,0,0.3); /* Inner shadow for depth */
}

/* This is for the team name spans */
.pairing-header > span {
    flex: 1; /* Allows names to take available space */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis; /* Prevents long names from breaking the layout */
    font-weight: 600;
}

.pairing-header > span:first-child {
    text-align: left; /* Align Team A to the left */
    color: #e0e0e0;
}

.pairing-header > span:last-child {
    text-align: right; /* Align Team B to the right */
    color: #e0e0e0;
}

/* This is the new, "cooler" score box */
.team-score {
  text-align: center;
    flex: 0 0 auto; /* Prevents the score box from shrinking or growing */
    color: #FFD700; /* Dark, readable text */
    background: linear-gradient(45deg, #4b0101, #2408a5); /* Golden gradient */
    padding: 0.5rem 1.2rem;
    border-radius: 8px; /* Rounded corners */
    margin: 0 1.5rem; /* Generous space from the team names */
    font-size: 1.1em;
    font-weight: 900; /* Extra bold */
    border: 2px solid #fff; /* A crisp white border */
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.5); /* A golden glow */
    position: relative;
    left: 44px;
}
/* --- ✨ REVISED PAIRINGS STYLES FOR ALIGNMENT ✨ --- */
.pairing-card .list-group-item {
  background: transparent;
  color: #e0e0e0;
  display: grid; /* Use Grid instead of Flexbox */
  grid-template-columns: auto 1fr auto 1fr; /* 4 columns: Board | White Player | Result | Black Player */
  align-items: center;
  gap: 1.5rem; /* Adjust space between columns */
  padding: 0.75rem 1.5rem;
}

/* Align the text within the new grid columns */
.pairing-card .list-group-item > span:nth-child(2) {
  text-align: right; /* White player's name aligns to the right */
}

.pairing-card .list-group-item > span:nth-child(3) { /* The score */
  justify-self: center; /* The score centers itself in its column */
  font-weight: bold;
}

.pairing-card .list-group-item > span:nth-child(4) {
  text-align: left; /* Black player's name aligns to the left */
}
.board-number { font-weight: bold; color: #adb5bd; }

/* --- ✨ ENHANCED TEAMS PANE STYLES ✨ --- */
.accordion-item { 
  background-color: #1a1a1a; /* Darker background for more depth */
  border: 1px solid rgba(255, 215, 0, 0.3); /* Golden border */
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
  background: linear-gradient(90deg, #3a3a3a, #2a2a2a); /* Subtle gradient */
  color: #FFD700; /* Golden text for team names */
  font-weight: bold; 
  padding: 1rem 1.5rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  font-size: 0.5em;
  border: none; /* Remove default button border */
}
.accordion-button::after { /* Bootstrap accordion arrow */
    filter: invert(80%) sepia(100%) saturate(500%) hue-rotate(0deg) brightness(120%) contrast(100%); /* Golden arrow */
    transition: transform 0.3s ease-in-out;
}
.accordion-button:not(.collapsed) { 
  background: linear-gradient(90deg, #FFD700, #e6b200); /* Golden background when open */
  color: #1a1a1a; /* Dark text when open */
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5); /* Glow when open */
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
}
.accordion-button:not(.collapsed)::after {
    filter: none; /* Reset arrow filter when open */
    transform: rotate(-180deg);
}
.accordion-button:focus { 
  outline: none; /* Remove default focus outline */
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.7); /* Stronger focus glow */
}

.accordion-body {
  background-color: #282828; /* Slightly lighter than item background */
  border-top: 1px solid rgba(255, 215, 0, 0.1);
  border-radius: 0 0 10px 10px;
  padding: 1rem 1.5rem;
}
.accordion-body h5 {
    color: #FFD700; /* Golden color for "Players" title */
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
  background-color: rgba(0, 0, 0, 0.3); /* Darker player background */
  padding: 0.6rem 1rem;
  margin-bottom: 0.3rem;
  border-radius: 5px;
  border-left: 3px solid #FFD700;
  transition: all 0.2s ease-in-out;
  display: flex; /* Allow inline elements like (C) */
  align-items: center;
}
.accordion-body li:hover {
  background-color: rgba(255, 215, 0, 0.15); /* More prominent hover background */
  color: #FFD700;
  transform: translateX(8px); /* More pronounced slide effect */
  border-left-color: #fff;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); /* Golden glow on hover */
}
.captain-tag {
  color: #c0c0c0; /* Slightly desaturated gold for contrast */
  font-weight: bold;
  font-size: 0.8em; /* Smaller, less intrusive */
  margin-left: 6px;
  letter-spacing: 0.5px;
  background-color: rgba(255, 215, 0, 0.1); /* Subtle background for the tag */
  padding: 2px 6px;
  border-radius: 3px;
}
/* --- END OF ENHANCED TEAMS PANE STYLES --- */


/* REVERTED GALLERY STYLES */
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

/* MODAL STYLES */
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