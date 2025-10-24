<template>
  <div class="generic-tournament-page py-5">
    <div class="container">
      
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-warning" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <h3 class="mt-3">Loading Tournament Data...</h3>
      </div>

      <div v-else-if="error" class="alert alert-danger text-center">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>Failed to load tournament:</strong> {{ error }}
      </div>

      <div v-else class="tournament-content">
        
        <TeamLeagueTemplate 
          v-if="templateType === 'TeamLeague'"
          :info="tournamentData.info"
          :TournamentsList="allTournaments"
          :documents="tournamentData.documents"
          :gallery="tournamentData.gallery"
          :teams-players="tournamentData.teamsPlayers"
          :team-matches="tournamentData.teamMatches"
          :individual-games="tournamentData.individualGames"
        />

        <TeamSwissTemplate 
          v-else-if="templateType === 'TeamSwiss'"
          :info="tournamentData.info"
          :TournamentsList="allTournaments"
          :documents="tournamentData.documents"
          :gallery="tournamentData.gallery"
          :teams-players="tournamentData.teamsPlayers"
          :team-matches="tournamentData.teamMatches"
          :individual-games="tournamentData.individualGames"
        />

        <IndividualSwissTemplate 
          v-else-if="templateType === 'IndividualSwiss'"
          :info="tournamentData.info"
          :TournamentsList="allTournaments"
          :documents="tournamentData.documents"
          :gallery="tournamentData.gallery"
          :players="tournamentData.players"
          :pairings-results="tournamentData.pairingsResults"
        />

        <IndividualSwissTeamArenaTemplate
          v-else-if="templateType === 'IndividualSwissTeamArena'"
          :info="tournamentData.info"
          :documents="tournamentData.documents"
          :gallery="tournamentData.gallery"
          :players-teams="tournamentData.playersTeams"       
          :pairings-results="tournamentData.pairingsResults"
         />

        <IndividualRoundRobinTemplate
          v-else-if="templateType === 'IndividualRoundRobin'"
          :info="tournamentData.info"
          :TournamentsList="allTournaments"
          :documents="tournamentData.documents"
          :gallery="tournamentData.gallery"
          :players="tournamentData.players"
          :pairings-results="tournamentData.pairingsResults"
        />

        <KnockoutTemplate 
          v-else-if="templateType === 'Knockout'"
          :info="tournamentData.info"
          :TournamentsList="allTournaments"
          :documents="tournamentData.documents"
          :gallery="tournamentData.gallery"
          :participants="tournamentData.participants"
          :bracket-matches="tournamentData.bracketMatches"
        />

        <MultiStageEventTemplate 
          v-else-if="templateType === 'MultiStageEvent'"
          :parent-id="props.id"
          :all-tournaments="allTournaments"
        />

        <div v-else class="alert alert-warning">
          Could not find a matching template for type: {{ templateType }}
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// --- TEMPLATE IMPORTS (Remain the same) ---
import TeamLeagueTemplate from '../components/Templates/TeamLeagueTemplate.vue';
import TeamSwissTemplate from '../components/Templates/TeamSwissTemplate.vue';
import IndividualSwissTemplate from '../components/Templates/IndividualSwissTemplate.vue';
import IndividualRoundRobinTemplate from '../components/Templates/IndividualRoundRobinTemplate.vue';
import KnockoutTemplate from '../components/Templates/KnockoutTemplate.vue';
import MultiStageEventTemplate from '../components/Templates/MultiStageEventTemplate.vue';
import IndividualSwissTeamArenaTemplate from '../components/Templates/IndividualSwissTeamArenaTemplate.vue';

// --- PROPS & STATE (Remain the same) ---
const props = defineProps({ id: String });
const isLoading = ref(true);
const error = ref(null);
const templateType = ref(null);
const allTournaments = ref([]); // Holds the full list from the master sheet
const tournamentData = ref({
  info: {},
  documents: [],
  gallery: [],
  teamsPlayers: [],
  teamMatches: [],
  individualGames: [],
  players: [],
  pairingsResults: [],
  playersTeams: [], // For Arena Swiss
  participants: [],
  bracketMatches: []
});

// --- MASTER LIST URL (Remains the same) ---
const MASTER_TOURNAMENT_LIST_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTR0IoPJT90A5D4QX8zfnB6-v8OB5i1KXD7j2yfGA4eFnNRuXel-nYkaEWtcSw7ZqxD3LnK5_Q3lTpy/pub?gid=0&single=true&output=csv'; // Replace with your actual Master List URL

// --- REQUIRED SHEET NAMES PER TEMPLATE ---
// Defines which 'SheetName' values are needed for each template type
const REQUIRED_SHEET_NAMES = {
  TeamLeague: ['Info', 'Documents', 'Gallery', 'Teams_Players', 'Team_Matches', 'Individual_Games'],
  TeamSwiss: ['Info', 'Documents', 'Gallery', 'Teams_Players', 'Team_Matches', 'Individual_Games'],
  IndividualSwiss: ['Info', 'Documents', 'Gallery', 'Players', 'Pairings_Results'],
  IndividualRoundRobin: ['Info', 'Documents', 'Gallery', 'Players', 'Pairings_Results'],
  Knockout: ['Info', 'Documents', 'Gallery', 'Participants', 'Bracket_Matches'],
  IndividualSwissTeamArena: ['Info', 'Documents', 'Gallery', 'Players_Teams', 'Pairings_Results']
  // MultiStageEvent does not use this
};

// --- DATA KEY MAPPING (Maps SheetName to tournamentData key) ---
// This translates the 'SheetName' value from your index to the internal key used in tournamentData
const DATA_KEY_MAP = {
    'Info': 'info',
    'Documents': 'documents',
    'Gallery': 'gallery',
    'Teams_Players': 'teamsPlayers', // Used by TeamLeague, TeamSwiss
    'Team_Matches': 'teamMatches',
    'Individual_Games': 'individualGames',
    'Players': 'players',             // Used by IndividualSwiss, IndividualRoundRobin
    'Pairings_Results': 'pairingsResults', // Used by multiple Templates
    'Players_Teams': 'playersTeams',     // Used by IndividualSwissTeamArena
    'Participants': 'participants',     // Used by Knockout
    'Bracket_Matches': 'bracketMatches'
};


// --- SHARED CSV PARSING FUNCTION (Revised for Info Tab with Headers) ---
// Handles both the SheetIndex (standard CSV) and the Info tab (header row)
async function fetchAndParseSheet(url, isInfoTab = false) {
  if (!url) throw new Error("No URL provided to fetchAndParseSheet");
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Network error: ${response.status} - ${response.statusText} for URL: ${url}`);

    const csvText = await response.text();
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== ''); // Filter empty lines

    if (lines.length === 0) return isInfoTab ? {} : []; // No lines at all

    // Info Tab Logic (expects headers + 1 data row)
    if (isInfoTab) {
      if (lines.length < 2) {
          console.warn(`Info tab at ${url} seems to have only headers or is empty.`);
          return {}; // Need headers and at least one data row
      }
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const values = lines[1].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Use robust split for the value row
      const infoObject = {};
      headers.forEach((header, index) => {
        if (header) { // Ensure header is not empty
          infoObject[header] = values[index] ? values[index].trim().replace(/^"|"$/g, '') : '';
        }
      });
      return infoObject; // Return the single object based on headers
    }

    // Standard CSV parsing for SheetIndex and other data tabs
    if (lines.length < 2) return []; // Only headers, no data

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.slice(1).map(line => {
      const rowObject = {};
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      headers.forEach((header, index) => {
        // Ensure header is not empty before assigning
        if(header){
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

// --- MAIN DATA FETCHING LOGIC (Revised for SheetIndex) ---
onMounted(() => {
  fetchGenericTournamentData();
});

async function fetchGenericTournamentData() {
  try {
    isLoading.value = true;
    error.value = null;
    // Reset data object for safety
    Object.keys(tournamentData.value).forEach(key => {
        tournamentData.value[key] = key === 'info' ? {} : [];
    });


    // 1. Fetch Master List
    allTournaments.value = await fetchAndParseSheet(MASTER_TOURNAMENT_LIST_URL);

    // 2. Find Current Tournament in Master List
    const currentTournament = allTournaments.value.find(t => t.TournamentID === props.id);
    if (!currentTournament) throw new Error(`Tournament ID "${props.id}" not found in Master List.`);

    // 3. Get Template Type & Update Title
    templateType.value = currentTournament.TemplateType;
    if (!templateType.value) throw new Error(`No TemplateType for tournament ID "${props.id}".`);
    document.title = currentTournament.TournamentName || 'Tournament Details';

    // 4. Handle MultiStageEvent separately (no SheetIndex needed)
    if (templateType.value === 'MultiStageEvent') {
      isLoading.value = false;
      return; // Done for this type
    }

    // 5. Get SheetIndex URL and Fetch Index Data
    const sheetIndexUrl = currentTournament.SheetURL; // This URL now points to the SheetIndex tab
    if (!sheetIndexUrl) throw new Error(`No SheetURL (SheetIndex Tab URL) for tournament ID "${props.id}".`);
    // Fetch Index data using standard CSV parsing
    const sheetIndexData = await fetchAndParseSheet(sheetIndexUrl);

    // 6. Create URL Map from SheetIndex Data
    const urlMap = new Map();
    sheetIndexData.forEach(row => {
        // Using your column names: SheetName and CSV_URL
        if (row.SheetName && row.CSV_URL) {
            urlMap.set(row.SheetName, row.CSV_URL);
        } else {
             console.warn(`Skipping invalid row in SheetIndex for tournament ${props.id}:`, row);
        }
    });

    // 7. Get Required Sheet Names for this Template
    const requiredNames = REQUIRED_SHEET_NAMES[templateType.value];
    if (!requiredNames) throw new Error(`No required sheet names defined for template: "${templateType.value}"`);

    // 8. Build Fetch Promises using URLs from the urlMap
    const fetchPromises = [];
    const dataKeys = []; // To store the keys like 'info', 'documents', etc.

    for (const sheetName of requiredNames) {
      // sheetName = 'Info', 'Documents', etc.
      const specificTabUrl = urlMap.get(sheetName);
      const dataKey = DATA_KEY_MAP[sheetName]; // Get corresponding key like 'info', 'documents'

      if (specificTabUrl && dataKey) {
        // Fetch 'Info' using special parsing, others normally
        fetchPromises.push(fetchAndParseSheet(specificTabUrl, sheetName === 'Info'));
        dataKeys.push(dataKey);
      } else {
         if (!dataKey) {
             console.error(`Data key mapping missing for SheetName: "${sheetName}"`);
         }
         if (!specificTabUrl) {
            console.warn(`URL for SheetName "${sheetName}" not found in SheetIndex data for tournament ${props.id}. Skipping fetch.`);
            // Set default empty value for missing data
            tournamentData.value[dataKey || sheetName] = (dataKey === 'info') ? {} : [];
         }
      }
    }

    // 9. Fetch all data in parallel
    if (fetchPromises.length > 0) {
        const allTabData = await Promise.all(fetchPromises);

        // 10. Store fetched data
        allTabData.forEach((data, index) => {
          const key = dataKeys[index];
          tournamentData.value[key] = data; // Store fetched data (object for 'info', arrays otherwise)
        });
    } else {
        // If no promises were created (e.g., empty index or missing required URLs), ensure info isn't empty if possible
         if (!tournamentData.value.info.TournamentName && currentTournament.TournamentName) {
            tournamentData.value.info.TournamentName = currentTournament.TournamentName;
         }
    }

     // Ensure TournamentName is present in info (fallback from master list if needed)
     if (!tournamentData.value.info.TournamentName && currentTournament.TournamentName) {
        tournamentData.value.info.TournamentName = currentTournament.TournamentName;
     }


  } catch (e) {
    console.error("Error in fetchGenericTournamentData:", e);
    error.value = e.message;
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* Styles remain unchanged */
.generic-tournament-page {
  background: #111;
  color: #eee;
  min-height: 100vh;
}
</style>