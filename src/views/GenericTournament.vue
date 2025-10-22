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

// --- 1. IMPORT ALL TEMPLATES ---
// (App will error until these are created, which is normal)
import TeamLeagueTemplate from '../components/Templates/TeamLeagueTemplate.vue';
import TeamSwissTemplate from '../components/Templates/TeamSwissTemplate.vue';
import IndividualSwissTemplate from '../components/Templates/IndividualSwissTemplate.vue';
import IndividualRoundRobinTemplate from '../components/Templates/IndividualRoundRobinTemplate.vue';
import KnockoutTemplate from '../components/Templates/KnockoutTemplate.vue';
import MultiStageEventTemplate from '../components/Templates/MultiStageEventTemplate.vue';


// --- 2. PROPS & STATE ---
const props = defineProps({
  id: String 
});

const isLoading = ref(true);
const error = ref(null);
const templateType = ref(null);
const allTournaments = ref([]); // Holds the full list from the master sheet

// This object holds data for all standard templates
const tournamentData = ref({
  info: {},
  documents: [],
  gallery: [],
  // Team templates
  teamsPlayers: [],
  teamMatches: [],
  individualGames: [],
  // Individual templates
  players: [],
  pairingsResults: [],
  // Knockout template
  participants: [],
  bracketMatches: []
});

// --- 3. GOOGLE SHEET URLs & GIDs ---

const MASTER_TOURNAMENT_LIST_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTR0IoPJT90A5D4QX8zfnB6-v8OB5i1KXD7j2yfGA4eFnNRuXel-nYkaEWtcSw7ZqxD3LnK5_Q3lTpy/pub?gid=0&single=true&output=csv';

// *** IMPORTANT ***
// You MUST update the placeholder GIDs below with your REAL GIDs from your sheets.
const GID_MAP = {
  TeamLeague: {
    info: '779715765',          // (from KC2)
    documents: '983488171',    // (from KC2)
    gallery: '1829396058',     // (from KC2 - changed to Gallery)
    teamsPlayers: '0',         // (from KC2)
    teamMatches: '280372676',  // (from KC2)
    individualGames: '502918467' // (from KC2)
  },
  TeamSwiss: {
    // These likely share the same structure as TeamLeague
    info: '779715765',
    documents: '983488171',
    gallery: '1829396058',
    teamsPlayers: '0',
    teamMatches: '280372676',
    individualGames: '502918467'
  },
  IndividualSwiss: {
    // !!! UPDATE THESE PLACEHOLDER GIDs !!!
    info: '100000001',          // Placeholder
    documents: '100000002',    // Placeholder
    gallery: '100000003',      // Placeholder
    players: '100000004',      // Placeholder
    pairingsResults: '100000005' // Placeholder
  },
  IndividualRoundRobin: {
    // These likely share the same structure as IndividualSwiss
    info: '100000001',
    documents: '100000002',
    gallery: '100000003',
    players: '100000004',
    pairingsResults: '100000005'
  },
  Knockout: {
    // !!! UPDATE THESE PLACEHOLDER GIDs !!!
    info: '200000001',          // Placeholder
    documents: '200000002',    // Placeholder
    gallery: '200000003',      // Placeholder
    participants: '200000004', // Placeholder
    bracketMatches: '200000005' // Placeholder
  }
};

// --- 4. SHARED CSV PARSING FUNCTION ---
async function fetchAndParseSheet(url) {
  if (!url) {
    throw new Error("No URL provided to fetchAndParseSheet");
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
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      headers.forEach((header, index) => {
        rowObject[header] = values[index] ? values[index].trim().replace(/^"|"$/g, '') : '';
      });
      return rowObject;
    }).filter(Boolean);
    return data;
  } catch (e) {
    console.error(`Failed to fetch or parse sheet data from ${url}:`, e);
    throw e;
  }
}

// --- 5. MAIN DATA FETCHING LOGIC ---
onMounted(() => {
  fetchGenericTournamentData();
});

async function fetchGenericTournamentData() {
  try {
    isLoading.value = true;
    error.value = null;

    // 1. Fetch the Master Tournament List
    allTournaments.value = await fetchAndParseSheet(MASTER_TOURNAMENT_LIST_URL);

    // 2. Find the *one* tournament we need
    const currentTournament = allTournaments.value.find(t => t.TournamentID === props.id);

    if (!currentTournament) {
      throw new Error(`Tournament with ID "${props.id}" not found in the master list.`);
    }

    // 3. Get the TemplateType
    templateType.value = currentTournament.TemplateType;

    if (!templateType.value) {
      throw new Error(`No TemplateType provided for tournament ID "${props.id}".`);
    }

    // 4. Update document title
    document.title = currentTournament.TournamentName || 'Tournament Details';
    
    // --- 5. SPECIAL CASE: MultiStageEvent ---
    // This template doesn't fetch its own data. It just needs the full
    // tournament list to find its children, which we already have.
    if (templateType.value === 'MultiStageEvent') {
      isLoading.value = false;
      return; // We are done!
    }

    // --- 6. STANDARD TEMPLATES: Fetch all sheet data ---
    const sheetUrl = currentTournament.SheetURL;
    if (!sheetUrl) {
      throw new Error(`No SheetURL provided for tournament ID "${props.id}".`);
    }

    const baseUrl = sheetUrl.split('?')[0];
    const gidsToFetch = GID_MAP[templateType.value];
    if (!gidsToFetch) {
      throw new Error(`No GID_MAP defined for template type: "${templateType.value}"`);
    }

    const fetchPromises = [];
    const dataKeys = [];

    for (const [key, gid] of Object.entries(gidsToFetch)) {
      const tabUrl = `${baseUrl}?gid=${gid}&single=true&output=csv`;
      fetchPromises.push(fetchAndParseSheet(tabUrl));
      dataKeys.push(key);
    }

    const allTabData = await Promise.all(fetchPromises);

    // 7. Store the fetched data
    allTabData.forEach((data, index) => {
      const key = dataKeys[index];
      
      // Remember: 'Info' tab has one row, so we take the first object
      if (key === 'info') {
        tournamentData.value[key] = data[0] || {};
      } else {
        tournamentData.value[key] = data;
      }
    });

    // Ensure the 'info' object always contains values from the master list
    // (so templates can reliably read TournamentName / TournamentID).
    if (currentTournament) {
      tournamentData.value.info = {
        ...currentTournament,
        ...(tournamentData.value.info || {})
      };
    }

  } catch (e) {
    console.error(e);
    error.value = e.message;
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.generic-tournament-page {
  background: #111;
  color: #eee;
  min-height: 100vh;
}
</style>