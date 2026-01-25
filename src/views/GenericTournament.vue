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

        <TeamLeagueTemplate v-if="templateType === 'TeamLeague'" :info="tournamentData.info"
          :TournamentsList="allTournaments" :documents="tournamentData.documents" :gallery="tournamentData.gallery"
          :teams-players="tournamentData.teamsPlayers" :team-matches="tournamentData.teamMatches"
          :individual-games="tournamentData.individualGames" />

        <TeamSwissTemplate v-else-if="templateType === 'TeamSwiss'" :info="tournamentData.info"
          :TournamentsList="allTournaments" :documents="tournamentData.documents" :gallery="tournamentData.gallery"
          :teams-players="tournamentData.teamsPlayers" :team-matches="tournamentData.teamMatches"
          :individual-games="tournamentData.individualGames" />

        <IndividualSwissTemplate v-else-if="templateType === 'IndividualSwiss'" :info="tournamentData.info"
          :TournamentsList="allTournaments" :documents="tournamentData.documents" :gallery="tournamentData.gallery"
          :players="tournamentData.players" :pairings-results="tournamentData.pairingsResults" />

        <IndividualSwissTeamArenaTemplate v-else-if="templateType === 'IndividualSwissTeamArena'"
          :info="tournamentData.info" :documents="tournamentData.documents" :gallery="tournamentData.gallery"
          :players-teams="tournamentData.playersTeams" :pairings-results="tournamentData.pairingsResults" />

        <IndividualRoundRobinTemplate v-else-if="templateType === 'IndividualRoundRobin'" :info="tournamentData.info"
          :TournamentsList="allTournaments" :documents="tournamentData.documents" :gallery="tournamentData.gallery"
          :players="tournamentData.players" :pairings-results="tournamentData.pairingsResults" />

        <KnockoutTemplate v-else-if="templateType === 'Knockout'" :info="tournamentData.info"
          :TournamentsList="allTournaments" :documents="tournamentData.documents" :gallery="tournamentData.gallery"
          :participants="tournamentData.participants" :bracket-matches="tournamentData.bracketMatches"
          @refresh="fetchFromSupabase(props.id)" />
        <MultiStageEventTemplate v-else-if="templateType === 'MultiStageEvent'" :parent-id="props.id"
          :all-tournaments="allTournaments" />

        <div v-else class="alert alert-warning">
          Could not find a matching template for type: {{ templateType }}
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// --- STEP 2 INTEGRATION: Import Supabase Client ---
import { supabase } from '@/lib/supabase';

// --- TEMPLATE IMPORTS ---
import TeamLeagueTemplate from '../components/Templates/TeamLeagueTemplate.vue';
import TeamSwissTemplate from '../components/Templates/TeamSwissTemplate.vue';
import IndividualSwissTemplate from '../components/Templates/IndividualSwissTemplate.vue';
import IndividualRoundRobinTemplate from '../components/Templates/IndividualRoundRobinTemplate.vue';
import KnockoutTemplate from '../components/Templates/KnockoutTemplate.vue';
import MultiStageEventTemplate from '../components/Templates/MultiStageEventTemplate.vue';
import IndividualSwissTeamArenaTemplate from '../components/Templates/IndividualSwissTeamArenaTemplate.vue';

// --- PROPS & STATE ---
const props = defineProps({ id: String });
const isLoading = ref(true);
const error = ref(null);
const templateType = ref(null);
const allTournaments = ref([]);
const tournamentData = ref({
  info: {},
  documents: [],
  gallery: [],
  teamsPlayers: [],
  teamMatches: [],
  individualGames: [],
  players: [],
  pairingsResults: [],
  playersTeams: [],
  participants: [],
  bracketMatches: []
});

// --- MASTER LIST URL ---
const MASTER_TOURNAMENT_LIST_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTR0IoPJT90A5D4QX8zfnB6-v8OB5i1KXD7j2yfGA4eFnNRuXel-nYkaEWtcSw7ZqxD3LnK5_Q3lTpy/pub?gid=0&single=true&output=csv';

const REQUIRED_SHEET_NAMES = {
  TeamLeague: ['Info', 'Documents', 'Gallery', 'Teams_Players', 'Team_Matches', 'Individual_Games'],
  TeamSwiss: ['Info', 'Documents', 'Gallery', 'Teams_Players', 'Team_Matches', 'Individual_Games'],
  IndividualSwiss: ['Info', 'Documents', 'Gallery', 'Players', 'Pairings_Results'],
  IndividualRoundRobin: ['Info', 'Documents', 'Gallery', 'Players', 'Pairings_Results'],
  Knockout: ['Info', 'Documents', 'Gallery', 'Participants', 'Bracket_Matches'],
  IndividualSwissTeamArena: ['Info', 'Documents', 'Gallery', 'Players_Teams', 'Pairings_Results']
};

const DATA_KEY_MAP = {
  'Info': 'info',
  'Documents': 'documents',
  'Gallery': 'gallery',
  'Teams_Players': 'teamsPlayers',
  'Team_Matches': 'teamMatches',
  'Individual_Games': 'individualGames',
  'Players': 'players',
  'Pairings_Results': 'pairingsResults',
  'Players_Teams': 'playersTeams',
  'Participants': 'participants',
  'Bracket_Matches': 'bracketMatches'
};

// --- HYBRID FETCHING: SUPABASE LOGIC ---
async function fetchFromSupabase(tournamentId) {
  console.log(`[DEBUG] Initializing Supabase Fetch for TournamentID: ${tournamentId}`);
  try {
    // 1. Fetch info separately to handle the ".single()" error gracefully
    const { data: infoData, error: infoError } = await supabase
      .from('tournament_info')
      .select('*')
      .eq('tournament_id', tournamentId)
      .maybeSingle(); // Use maybeSingle to avoid 406 errors if not found

    if (infoError) console.warn("[DEBUG] tournament_info fetch warning:", infoError);

    // 2. Fetch the rest in parallel
    const [matchesReq, participantsReq, galleryReq] = await Promise.all([
      supabase.from('matches').select('*').eq('tournament_id', tournamentId).order('round', { ascending: true }),
      supabase.from('participants').select('*').eq('tournament_id', tournamentId),
      supabase.from('gallery').select('*').eq('tournament_id', tournamentId)
    ]);

    // Check for critical errors in the required tables
    if (matchesReq.error) throw matchesReq.error;
    if (participantsReq.error) throw participantsReq.error;

    // Mapping to internal structure
    tournamentData.value.info = infoData || {};
    tournamentData.value.participants = participantsReq.data || [];
    tournamentData.value.gallery = galleryReq.data || [];
    tournamentData.value.bracketMatches = matchesReq.data || [];

    console.log('[DEBUG] Supabase Data Mapped Successfully:', {
      infoFound: !!infoData,
      matchesCount: tournamentData.value.bracketMatches.length,
      participantsCount: tournamentData.value.participants.length
    });

  } catch (err) {
    console.error("[DEBUG] Supabase Fetch Critical Error:", err);
    throw new Error(`Supabase Error: ${err.message}`);
  }
}

// --- SHARED CSV PARSING FUNCTION ---
async function fetchAndParseSheet(url, isInfoTab = false) {
  if (!url) throw new Error("No URL provided to fetchAndParseSheet");
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Network error: ${response.status}`);

    const csvText = await response.text();
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');

    if (lines.length === 0) return isInfoTab ? {} : [];

    if (isInfoTab) {
      if (lines.length < 2) return {};
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const values = lines[1].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      const infoObject = {};
      headers.forEach((header, index) => {
        if (header) {
          infoObject[header] = values[index] ? values[index].trim().replace(/^"|"$/g, '') : '';
        }
      });
      return infoObject;
    }

    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.slice(1).map(line => {
      const rowObject = {};
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      headers.forEach((header, index) => {
        if (header) rowObject[header] = values[index] ? values[index].trim().replace(/^"|"$/g, '') : '';
      });
      return rowObject;
    });
    return data;
  } catch (e) {
    throw e;
  }
}

// --- MAIN DATA FETCHING LOGIC ---
onMounted(() => {
  fetchGenericTournamentData();
});

async function fetchGenericTournamentData() {
  try {
    isLoading.value = true;
    error.value = null;

    // Reset state
    Object.keys(tournamentData.value).forEach(key => {
      tournamentData.value[key] = key === 'info' ? {} : [];
    });

    // 1. Fetch Master List
    console.log("[DEBUG] Fetching Master Tournament List...");
    allTournaments.value = await fetchAndParseSheet(MASTER_TOURNAMENT_LIST_URL);

    // 2. Find Current Tournament
    const currentTournament = allTournaments.value.find(t => t.TournamentID === props.id);
    if (!currentTournament) throw new Error(`Tournament ID "${props.id}" not found.`);

    console.log(`[DEBUG] Tournament Found. Source: ${currentTournament.DataSource || 'Google Sheets'}`);

    // --- BRANCHING LOGIC: SUPABASE vs GOOGLE SHEETS ---
    if (currentTournament.DataSource === 'Supabase') {
      await fetchFromSupabase(props.id);
      templateType.value = currentTournament.TemplateType;
      document.title = currentTournament.TournamentName || 'Tournament Details';

      // Fallback for Title from Master List if Supabase Info is empty
      if (!tournamentData.value.info.TournamentName) {
        tournamentData.value.info.TournamentName = currentTournament.TournamentName;
      }

      isLoading.value = false;
      return;
    }

    // --- DEFAULT: GOOGLE SHEETS LOGIC ---
    templateType.value = currentTournament.TemplateType;
    document.title = currentTournament.TournamentName || 'Tournament Details';

    if (templateType.value === 'MultiStageEvent') {
      isLoading.value = false;
      return;
    }

    const sheetIndexUrl = currentTournament.SheetURL;
    if (!sheetIndexUrl) throw new Error(`No SheetURL for tournament ID "${props.id}".`);

    const sheetIndexData = await fetchAndParseSheet(sheetIndexUrl);
    const urlMap = new Map();
    sheetIndexData.forEach(row => {
      if (row.SheetName && row.CSV_URL) urlMap.set(row.SheetName, row.CSV_URL);
    });

    const requiredNames = REQUIRED_SHEET_NAMES[templateType.value];
    if (!requiredNames) throw new Error(`No requirements for template: "${templateType.value}"`);

    const fetchPromises = [];
    const dataKeys = [];

    for (const sheetName of requiredNames) {
      const specificTabUrl = urlMap.get(sheetName);
      const dataKey = DATA_KEY_MAP[sheetName];

      if (specificTabUrl && dataKey) {
        fetchPromises.push(fetchAndParseSheet(specificTabUrl, sheetName === 'Info'));
        dataKeys.push(dataKey);
      }
    }

    if (fetchPromises.length > 0) {
      const allTabData = await Promise.all(fetchPromises);
      allTabData.forEach((data, index) => {
        tournamentData.value[dataKeys[index]] = data;
      });
      console.log("[DEBUG] Google Sheets Data Loaded Successfully");
    }

    if (!tournamentData.value.info.TournamentName && currentTournament.TournamentName) {
      tournamentData.value.info.TournamentName = currentTournament.TournamentName;
    }

  } catch (e) {
    console.error("[DEBUG] GenericTournament Fetch Error:", e);
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