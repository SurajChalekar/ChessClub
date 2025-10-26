<template>
  <section class="profile-content py-5">
  <div class="container">
    <div class="row g-4">

      <div class="col-lg-8">
        <div v-if="isListLoading" class="text-center text-warning py-5 profile-placeholder">
          <div class="spinner-border" role="status"></div>
          <p class="mt-2">Loading member and tournament lists...</p>
        </div>

        <div v-if="error" class="alert alert-danger text-center">
          {{ error }}
        </div>

        <div v-if="!isListLoading && !myProfile" class="text-center text-muted py-5 profile-placeholder">
          <i class="fas fa-user-slash fa-3x mb-3"></i>
          <h4 class="text-white">Profile Not Found</h4>
          <p>Your email ({{ auth.currentUser?.email }}) was not found in the Club Members sheet.</p>
          <p>Please contact an admin to be added.</p>
        </div>
        
        <div v-if="displayedProfile" class="profile-card-container">
          <div class="profile-card bg-dark-secondary rounded shadow-lg p-4 p-md-5 mb-4">
            
            <button v-if="searchResult" @click="showMyProfile" class="btn btn-sm btn-outline-warning mb-3">
              <i class="fas fa-arrow-left me-2"></i>Back to My Profile
            </button>
            
            <div class="row g-4 align-items-center">
              <div class="col-md-4 text-center">
                <img 
                  :src="displayedProfile.ProfileImageURL || 'https://placehold.co/150x150/2a2a2a/FFD700?text=No+Photo'" 
                  alt="Profile Picture" 
                  class="profile-img img-fluid rounded-circle border border-warning border-3"
                >
              </div>
              <div class="col-md-8">
                <h2 class="profile-name text-warning mb-1">{{ displayedProfile.PlayerName }}</h2>
                <h4 v-if="displayedProfile.Title" class="profile-title text-danger mb-3">{{ displayedProfile.Title }}</h4>
                <p class="profile-bio text-light fs-5">{{ displayedProfile.Bio || 'No bio available.' }}</p>
                <hr class="border-warning opacity-25">
                <div class="profile-stats d-flex justify-content-around">
                    <div class="stat-item text-center">
                        <div class="stat-label">Rating</div>
                        <div class="stat-value text-info">{{ displayedProfile.Rating || 'N/A' }}</div>
                    </div>
                    <div class="stat-item text-center">
                        <div class="stat-label">Joined</div>
                        <div class="stat-value">{{ displayedProfile.JoinedDate || 'N/A' }}</div>
                    </div>
                </div>
              </div>
            </div>
          </div> <div class="tournament-history bg-dark-secondary rounded shadow-lg p-4 p-md-5">
            <h3 class="section-title text-center mb-4">Past Tournament Performance</h3>
            
            <div v-if="isHistoryLoading" class="text-center text-warning py-3">
              <div class="spinner-border spinner-border-sm" role="status"></div>
              <p class="mt-2 mb-0">Scanning tournament archives...</p>
            </div>

            <div v-else-if="!isHistoryLoading && displayedHistory.length > 0">
              <ul class="list-group list-group-flush">
                <li v-for="item in displayedHistory" :key="item.tournamentName" class="list-group-item bg-transparent text-light">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 class="history-title mb-0">{{ item.tournamentName }}</h5>
                      <small v-if="item.team" class="history-team text-muted">Team: {{ item.team }}</small>
                    </div>
                    <span class="history-score text-warning fs-4 fw-bold">{{ item.points }}/{{ item.total }}</span>
                  </div>
                </li>
              </ul>
            </div>

            <div v-else-if="!isHistoryLoading && displayedHistory.length === 0">
              <p class="text-center text-muted">No past tournament data found for this player.</p>
            </div>

          </div> </div> </div>

      <div class="col-lg-4">
        <div class="search-sidebar bg-dark-secondary rounded shadow-lg p-4">
          <h4 class="section-title text-center mb-4">Find Player</h4>
          
          <div class="position-relative">
            <div class="input-group">
              <input
                type="text"
                class="form-control bg-dark text-light border-secondary"
                placeholder="Search by name or PlayerID..."
                aria-label="Search player"
                v-model="searchQuery"
                @focus="searchPerformed = true" 
                @blur="() => setTimeout(() => searchPerformed = false, 200)"
              >
              <button class="btn btn-outline-warning" type="button" @click="performSearch">
                <i class="fas fa-search"></i>
              </button>
            </div>
            
            <div 
              v-if="liveSearchResults.length > 0 && searchQuery.length > 1 && searchPerformed" 
              class="search-results list-group"
            >
              <button
                type="button"
                v-for="player in liveSearchResults"
                :key="player.PlayerID"
                class="list-group-item list-group-item-action list-group-item-dark"
                @mousedown="selectPlayer(player)"
              >
                <strong>{{ player.PlayerName }}</strong>
                <span class="text-muted small d-block player-id">{{ player.PlayerID }}</span>
              </button>
            </div>
            
            <div
              v-if="liveSearchResults.length === 0 && searchQuery.length > 1 && searchPerformed"
              class="search-results list-group"
            >
              <span class="list-group-item list-group-item-dark text-muted">No players found.</span>
            </div>
          </div>
          
        </div>
      </div>

    </div>
  </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'; // Import computed
import { auth } from '@/firebase';
import { onAuthStateChanged } from "firebase/auth";

// --- STATE ---
const allPlayers = ref([]);
const allTournamentsList = ref([]);
const searchQuery = ref('');
const lastQuery = ref('');
const searchResult = ref(null); // Holds the found *searched* player
const myProfile = ref(null); // Holds the *logged-in user's* profile
const displayedProfile = ref(null); // The profile currently being shown
const displayedHistory = ref([]);
const searchPerformed = ref(false); // Flag to show/hide search dropdown
const isListLoading = ref(true);
const isHistoryLoading = ref(false);
const error = ref(null);
// We no longer need searchError, it's handled by the dropdown

// --- CONFIGURATION ---
const PROFILE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXXoxwbItOcDtty4QKH7PZVeO2dZTizbcTWeptay7RqrChD_gqSGpO1L2WSVri_YF_EeyA-taAqecv/pub?gid=0&single=true&output=csv'; 
const MASTER_TOURNAMENT_LIST_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTR0IoPJT90A5D4QX8zfnB6-v8OB5i1KXD7j2yfGA4eFnNRuXel-nYkaEWtcSw7ZqxD3LnK5_Q3lTpy/pub?gid=0&single=true&output=csv';

// --- CSV PARSING FUNCTION ---
async function fetchAndParseSheet(url) {
  if (!url || url.startsWith('YOUR_')) {
    throw new Error("A required Sheet URL is missing in the script setup.");
  }
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Network error: ${response.status} - ${response.statusText}`);

    const csvText = await response.text();
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');

    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.slice(1).map(line => {
      const rowObject = {};
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      headers.forEach((header, index) => {
        if (header) {
          rowObject[header] = values[index] ? values[index].trim().replace(/^"|"$/g, '') : '';
        }
      });
      return rowObject;
    });
    return data;
  } catch (e) {
    console.error(`Failed to fetch or parse sheet data from ${url}:`, e);
    throw e;
  }
}

// --- LIFECYCLE HOOK ---
onMounted(() => {
  document.title = 'Player Profiles - IISER TVM Chess Club';
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await loadInitialData(user.email);
    } else {
      error.value = "Please log in to view your profile.";
      isListLoading.value = false;
    }
  });
});

// --- NEW: COMPUTED PROPERTY FOR LIVE SEARCH ---
const liveSearchResults = computed(() => {
  if (searchQuery.value.length < 2) {
    return []; // Don't search until at least 2 chars are typed
  }
  
  const query = searchQuery.value.toLowerCase();
  
  return allPlayers.value.filter(player => {
    const nameMatch = player.PlayerName && player.PlayerName.toLowerCase().includes(query);
    const idMatch = player.PlayerID && player.PlayerID.toLowerCase().includes(query);
    return nameMatch || idMatch;
  }).slice(0, 5); // Limit to showing 5 results
});

// --- METHODS ---
async function loadInitialData(userEmail) {
  try {
    isListLoading.value = true;
    error.value = null;
    const [players, tournaments] = await Promise.all([
      fetchAndParseSheet(PROFILE_SHEET_URL),
      fetchAndParseSheet(MASTER_TOURNAMENT_LIST_URL)
    ]);
    allPlayers.value = players;
    allTournamentsList.value = tournaments;
    console.log(`Loaded ${allPlayers.value.length} players and ${allTournamentsList.value.length} tournaments.`);
    loadMyProfile(userEmail);
  } catch (e) {
    error.value = e.message;
  } finally {
    isListLoading.value = false;
  }
}

function loadMyProfile(userEmail) {
  if (!userEmail) {
    error.value = "Could not get user email from login.";
    return;
  }
  const foundProfile = allPlayers.value.find(player => 
    player.Email && player.Email.toLowerCase() === userEmail.toLowerCase()
  );
  if (foundProfile) {
    myProfile.value = foundProfile;
    displayedProfile.value = myProfile.value;
    fetchPlayerHistory(myProfile.value.PlayerID);
  } else {
    console.warn(`User ${userEmail} not found in Club_Members sheet.`);
  }
}

// --- UPDATED: Search button now just selects the top result ---
const performSearch = () => {
  if (liveSearchResults.value.length > 0) {
    // Select the first item in the dropdown
    selectPlayer(liveSearchResults.value[0]);
  }
};

// --- NEW: Function to handle clicking a search result ---
const selectPlayer = (player) => {
  searchResult.value = player; // Set this to show the "Back to My Profile" button
  displayedProfile.value = player; // Change the display
  fetchPlayerHistory(player.PlayerID); // Fetch new history
  searchQuery.value = ''; // Clear the search bar
  searchPerformed.value = false; // Hide the dropdown
};

// --- NEW: Function to go back to your own profile ---
const showMyProfile = () => {
    searchResult.value = null; // Clear the search result
    searchQuery.value = '';
    searchPerformed.value = false;
    displayedProfile.value = myProfile.value; // Switch display back
    fetchPlayerHistory(myProfile.value.PlayerID); // Re-fetch "My" history
};

// --- History Fetching Function (Unchanged) ---
async function fetchPlayerHistory(playerID) {
  if (!playerID) return;
  isHistoryLoading.value = true;
  displayedHistory.value = [];
  const history = [];
  const pastTournaments = allTournamentsList.value.filter(t => 
      (t.Status === 'Completed' || t.Status === 'Ongoing') &&
      (t.DisplayStatus === 'Primary' || !t.DisplayStatus)
  );

  for (const tournament of pastTournaments) {
    let performance = {
        tournamentName: tournament.TournamentName,
        points: 0,
        total: 0,
        team: null
    };
    let playerFound = false;

    try {
      const sheetIndexUrl = tournament.SheetURL;
      if (!sheetIndexUrl) continue;
      const sheetIndexData = await fetchAndParseSheet(sheetIndexUrl);
      
      const urlMap = new Map();
      sheetIndexData.forEach(row => {
        if (row.SheetName && row.CSV_URL) {
          urlMap.set(row.SheetName, row.CSV_URL);
        }
      });

      const templateType = tournament.TemplateType;
      let playersData = [], gamesData = [];
      let playersUrl, gamesUrl;

      if (templateType === 'TeamLeague' || templateType === 'TeamSwiss') {
        playersUrl = urlMap.get('Teams_Players');
        gamesUrl = urlMap.get('Individual_Games');
      } else if (templateType === 'IndividualSwissTeamArena') {
        playersUrl = urlMap.get('Players_Teams');
        gamesUrl = urlMap.get('Pairings_Results');
      } else if (templateType === 'IndividualSwiss' || templateType === 'IndividualRoundRobin') {
        playersUrl = urlMap.get('Players');
        gamesUrl = urlMap.get('Pairings_Results');
      } else if (templateType === 'Knockout') {
         continue;
      }
      
      if (playersUrl) playersData = await fetchAndParseSheet(playersUrl);
      if (gamesUrl) gamesData = await fetchAndParseSheet(gamesUrl);

      const playerInfo = playersData.find(p => p.PlayerID === playerID);
      if (playerInfo) {
          playerFound = true;
          if (playerInfo.TeamName) {
            performance.team = playerInfo.TeamName;
          }
      }

      if (playerFound) {
          let points = 0;
          let total = 0;
          
          const gameList = gamesData.filter(
            game => (game.White_PlayerID === playerID || game.Black_PlayerID === playerID) && (game.Result)
          );

          total = gameList.length;

          gameList.forEach(game => {
              if (game.White_PlayerID === playerID) {
                  if (game.Result === '1-0') points += 1;
                  if (game.Result.includes('1/2') || game.Result.includes('0.5')) points += 0.5;
              } else if (game.Black_PlayerID === playerID) {
                  if (game.Result === '0-1') points += 1;
                  if (game.Result.includes('1/2') || game.Result.includes('0.5')) points += 0.5;
              }
          });
          
          if (total > 0) {
              performance.points = points;
              performance.total = total;
              history.push(performance);
          }
      }
    } catch (err) {
      console.warn(`Could not fetch history for ${tournament.TournamentName}: ${err.message}`);
    }
  }

  displayedHistory.value = history.sort((a, b) => b.tournamentName.localeCompare(a.tournamentName));
  isHistoryLoading.value = false;
}
</script>

<style scoped>
/* Base page style */
.profile-page {
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%);
  color: #e0e0e0;
  min-height: 100vh;
}

/* Hero section styles */
.profile-hero {
  background: radial-gradient(ellipse at center, #1a1a2e 0%, #10342a 50%, #0a0a0a 100%);
  padding: 4rem 0;
  min-height: auto;
}
.hero-background { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(45deg, transparent 40%, rgba(25, 135, 84, 0.05) 50%, transparent 60%), linear-gradient(-45deg, transparent 40%, rgba(13, 202, 240, 0.05) 50%, transparent 60%); animation: heroShift 18s ease-in-out infinite alternate; }
.chess-pattern-bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.01) 35px, rgba(255,255,255,0.01) 70px), repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(25,135,84,0.01) 35px, rgba(25,135,84,0.01) 70px); opacity: 0.2; }
.hero-title { font-size: 3.5rem; font-weight: 900; letter-spacing: -1px; }
.text-glow-success { background: linear-gradient(45deg, #198754, #20c997); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 30px rgba(25, 135, 84, 0.5); animation: titlePulseSuccess 4s ease-in-out infinite; }
.hero-subtitle { font-size: 1.2rem; opacity: 0.8; line-height: 1.7; max-width: 600px; margin: 0 auto; }
.chess-icon { font-size: 1em; margin-right: 10px; filter: drop-shadow(0 0 15px rgba(25, 135, 84, 0.6)); }

/* Keyframes */
@keyframes heroShift { 0% { transform: translateX(-1px); } 100% { transform: translateX(1px); } }
@keyframes titlePulseSuccess { 0%, 100% { text-shadow: 0 0 30px rgba(25, 135, 84, 0.4); } 50% { text-shadow: 0 0 50px rgba(25, 135, 84, 0.7); } }

/* Content Section */
.profile-content {
   background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
}

/* Search Sidebar */
.search-sidebar {
  background: linear-gradient(145deg, #181818, #2a2a2a);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 15px;
  position: sticky; /* Makes the search bar stick while scrolling history */
  top: 7rem; /* Adjust based on your navbar height + padding */
}

/* Search Bar */
.input-group .form-control {
    border-right: 0;
}
.input-group .form-control:focus {
    box-shadow: 0 0 0 0.25rem rgba(255, 193, 7, 0.25);
    border-color: #6c757d;
}
.input-group .btn-outline-warning {
    border-left: 0;
}

/* --- Live Search Dropdown --- */
.search-results {
  position: absolute;
  top: 100%; /* Position right below the input group */
  left: 0;
  right: 0;
  z-index: 100;
  border-top: none;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  max-height: 300px;
  overflow-y: auto;
}
.search-results .list-group-item {
  background-color: #2a2a2a;
  border-color: rgba(255, 255, 255, 0.1);
  color: #eee;
}
.search-results .list-group-item:hover,
.search-results .list-group-item:focus {
  background-color: #343a40;
  color: #FFD700; /* Gold text on hover */
}

/* --- Live Search Dropdown --- */
/* ... (existing .search-results rules) ... */

.search-results .list-group-item .player-id {
  color: #20d4f8 !important; /* A light gray, change as desired */
  /* Or use a gold color: */
  /* color: #FFD700 !important; */
  /* opacity: 0.8; */
}

/* Profile Card */
.bg-dark-secondary {
  background: linear-gradient(145deg, #181818, #2a2a2a);
}
.profile-card, .tournament-history, .profile-placeholder {
  border: 1px solid rgba(255, 215, 0, 0.2);
  animation: fadeIn 0.5s ease-out;
}
.profile-img {
  width: 150px;
  height: 150px;
  object-fit: cover;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}
.profile-name {
  font-weight: 700;
}
.profile-title {
  font-weight: 400;
  font-size: 1.25rem;
}
.profile-bio {
  font-size: 1.1rem;
  font-style: italic;
  opacity: 0.9;
}
.stat-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #adb5bd;
  letter-spacing: 1px;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
}

/* Tournament History */
.section-title {
  background: linear-gradient(45deg, #198754, #20c997);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 10px rgba(25, 135, 84, 0.3);
  font-weight: 800;
  font-size: 2.2rem;
}
.tournament-history .section-title { /* A more neutral title for the history box */
  background: linear-gradient(45deg, #FFD700, #e6b200);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}
.search-sidebar .section-title { /* Title for the search box */
   background: linear-gradient(45deg, #FFD700, #e6b200);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  font-size: 1.8rem;
}


.list-group-item {
  border-bottom: 1px solid rgba(255, 215, 0, 0.1);
  padding: 1rem 0.5rem;
}
.list-group-item:last-child {
  border-bottom: none;
}
.history-title {
  color: #eee;
  font-size: 1.1rem;
  font-weight: 600;
}
.history-team {
  font-style: italic;
}
.history-score {
  font-family: 'Courier New', Courier, monospace;
}


@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>