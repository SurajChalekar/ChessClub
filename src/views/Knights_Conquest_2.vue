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
                    <td>{{ team.rank }}</td><td>{{ team.TeamName }}</td><td>{{ team.matchPoints }}</td><td>{{ team.gamePoints.toFixed(1) }}</td>
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
                    <td>{{ player.rank }}</td><td>{{ player.PlayerName }}</td><td>{{ player.TeamName }}</td><td>{{ player.points.toFixed(1) }}</td>
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
              <div class="pairing-header">{{ pairing.TeamA.TeamName }} vs {{ pairing.TeamB.TeamName }}</div>
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
                  <ul><li v-for="player in team.players" :key="player.PlayerID">{{ player.PlayerName }}</li></ul>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

defineProps({ id: String });

// --- ⚙️ CONFIGURATION: Fill these in ---
// --- State Management ---
const isLoading = ref(true);
const tournamentInfo = ref({});
const documents = ref([]);
const playersAndTeams = ref([]);
const teamMatches = ref([]);
const individualGames = ref([]);
const photos = ref([]);
const activeStandingsView = ref('team');
const selectedRound = ref(1);

// --- NEW Helper Function to fetch and parse CSV data ---
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
      const values = line.split(',');
      headers.forEach((header, index) => {
        rowObject[header] = values[index] ? values[index].trim().replace(/"/g, '') : '';
      });
      return rowObject;
    }).filter(Boolean);
    return data;
  } catch (error) {
    console.error(`Failed to fetch or parse sheet data from ${url}:`, error);
    throw error;
  }
}

// --- Helper Functions (Unchanged) ---
const getTeamDetails = (teamId) => {
  const teamMember = playersAndTeams.value.find(p => p.TeamID === teamId);
  return teamMember ? { TeamName: teamMember.TeamName, TeamID: teamId } : { TeamName: 'Unknown', TeamID: teamId };
};

const getPlayerDetails = (playerId) => playersAndTeams.value.find(p => p.PlayerID === playerId) || { PlayerName: 'Unknown' };

// --- Computed Properties for Display (Unchanged) ---
const teamStandings = computed(() => {
  if (!playersAndTeams.value.length || !teamMatches.value.length) return [];
  const teamsData = {};
  const uniqueTeams = [...new Map(playersAndTeams.value.map(p => [p.TeamID, p])).values()];
  uniqueTeams.forEach(team => {
    teamsData[team.TeamID] = { TeamID: team.TeamID, TeamName: team.TeamName, matchPoints: 0, gamePoints: 0 };
  });
  teamMatches.value.forEach(match => {
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

// --- UPDATED Data Fetching ---
const fetchAllTournamentData = async () => {
  isLoading.value = true;
  try {
    const sheetUrls = {
      KC_Info:           'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRUcvxBFbPWUVY9f2QgT_fsdUAjoubfVJYrYEkV7-kbs-EX89GDn0dHaMXMumNH-JJuaHC31KcV6jE/pub?gid=779715765&single=true&output=csv',
      KC_Documents:      'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRUcvxBFbPWUVY9f2QgT_fsdUAjoubfVJYrYEkV7-kbs-EX89GDn0dHaMXMumNH-JJuaHC31KcV6jE/pub?gid=983488171&single=true&output=csv',
      KC_Teams_Players:  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRUcvxBFbPWUVY9f2QgT_fsdUAjoubfVJYrYEkV7-kbs-EX89GDn0dHaMXMumNH-JJuaHC31KcV6jE/pub?gid=0&single=true&output=csv',
      KC_Team_Matches:   'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRUcvxBFbPWUVY9f2QgT_fsdUAjoubfVJYrYEkV7-kbs-EX89GDn0dHaMXMumNH-JJuaHC31KcV6jE/pub?gid=280372676&single=true&output=csv',
      KC_Individual_Games: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRUcvxBFbPWUVY9f2QgT_fsdUAjoubfVJYrYEkV7-kbs-EX89GDn0dHaMXMumNH-JJuaHC31KcV6jE/pub?gid=502918467&single=true&output=csv',
      KC_Photos:         'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRUcvxBFbPWUVY9f2QgT_fsdUAjoubfVJYrYEkV7-kbs-EX89GDn0dHaMXMumNH-JJuaHC31KcV6jE/pub?gid=1829396058&single=true&output=csv',
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
    
    // Assign fetched data to the reactive state variables
    tournamentInfo.value = infoData[0] || {}; // KC_Info is likely a single row
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
/* Main page styles */
.knights-conquest-page { background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%); color: #e0e0e0; min-height: 100vh; }
.tournament-title { font-size: 3.5rem; font-weight: 900; background: linear-gradient(45deg, #FFD700, #C0C0C0); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 20px rgba(255, 215, 0, 0.4); }
.tournament-subtitle { font-size: 1.25rem; color: rgba(255, 255, 255, 0.7); }

/* Tab Styling */
.nav-tabs { border-bottom: 2px solid #FFD700; }
.nav-tabs .nav-link { color: rgba(255, 255, 255, 0.7); background-color: transparent; border: none; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.3s ease; font-weight: 600; }
.nav-tabs .nav-link:hover { color: #FFD700; border-bottom-color: rgba(255, 215, 0, 0.5); }
.nav-tabs .nav-link.active { color: #FFD700; background-color: rgba(255, 215, 0, 0.05); border-bottom: 2px solid #FFD700; }
.tab-content { background-color: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 0 0 15px 15px; }

/* Info Pane */
.tab-title, .details-subtitle { color: #FFD700; }
.list-group-item { background-color: rgba(255, 255, 255, 0.05); border-color: rgba(255, 215, 0, 0.2); color: #e0e0e0; }
.list-group-item:hover { background-color: rgba(255, 215, 0, 0.1); color: #FFD700; }

/* Standings Pane */
.btn-check:checked+.btn-outline-warning { background-color: #FFD700; color: #0a0a0a; font-weight: 700; }
.table thead { background: linear-gradient(45deg, #FFD700, #e6b200); color: #1a1a1a; text-transform: uppercase; }

/* Pairings Pane */
.pairing-card { background-color: #212529; border-radius: 10px; margin-bottom: 1rem; border: 1px solid #444; }
.pairing-header { background-color: #343a40; padding: 0.75rem; font-weight: bold; border-bottom: 1px solid #444; }
.pairing-card .list-group-item { background: transparent; color: #e0e0e0; display: flex; justify-content: space-between; align-items: center; }
.board-number { font-weight: bold; color: #adb5bd; }

/* Playoffs Pane */
.playoff-bracket { display: flex; justify-content: space-around; }
.round { display: flex; flex-direction: column; justify-content: center; gap: 2rem; }
.round-title { text-align: center; color: #FFD700; }
.matchup { background: #212529; padding: 1rem; border-radius: 5px; border-left: 3px solid #FFD700;}
.matchup span { float: right; font-weight: bold; }

/* Teams Pane */
.accordion-item { background-color: #212529; border-color: #444; }
.accordion-button { background-color: #343a40; color: #e0e0e0; font-weight: bold; }
.accordion-button:not(.collapsed) { background-color: #FFD700; color: #1a1a1a; }
.accordion-button:focus { box-shadow: none; }

/* Gallery Pane */
.photo-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
.photo-gallery img { width: 100%; height: 200px; object-fit: cover; border-radius: 10px; transition: transform 0.3s ease, box-shadow 0.3s ease; }
.photo-gallery img:hover { transform: scale(1.05); box-shadow: 0 5px 20px rgba(255, 215, 0, 0.4); }
</style>