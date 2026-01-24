<template>
  <div class="knockout-page">
    <div class="container">
      <div class="admin-auth-bar d-flex justify-content-between align-items-center py-2 px-3">
        <div class="auth-status">
          <span v-if="user" class="text-warning small">
            ● {{ isManager ? 'Organizer' : 'Arbiter' }}: {{ user.email }}
          </span>
        </div>
        <button v-if="!user" @click="showLoginModal = true" class="btn btn-sm btn-outline-warning">Arbiter
          Login</button>
        <button v-else @click="handleLogout" class="btn btn-sm btn-danger">Logout</button>
      </div>

      <div class="page-header text-center mb-5">
        <h1 class="tournament-title">{{ tournamentTitle }}</h1>
        <p class="tournament-subtitle">{{ info.format || info.Format || 'Tournament Details' }}</p>
      </div>

      <div v-if="isManager && lifecycleStatus !== 'LOCKED'"
        class="organizer-panel p-3 mb-4 rounded border border-warning bg-dark shadow">
        <h5 class="text-warning border-bottom border-secondary pb-2 mb-3">Organizer Controls</h5>
        <div class="d-flex flex-wrap gap-2 justify-content-center">
          <button v-if="lifecycleStatus === 'START' || lifecycleStatus === 'READY_FOR_NEXT'"
            @click="handleLifecycleAction" :disabled="isProcessing" class="btn btn-success">
            <i class="fas" :class="isProcessing ? 'fa-spinner fa-spin' : 'fa-play'"></i>
            {{ lifecycleStatus === 'START' ? 'Start Tournament' : 'Generate Next Round' }}
          </button>

          <button v-if="lifecycleStatus !== 'START'" @click="revertToPreviousRound" :disabled="isProcessing"
            class="btn btn-outline-danger">
            <i class="fas fa-undo me-2"></i> Revert Current Round
          </button>

          <button v-if="lifecycleStatus === 'READY_TO_FINISH'" @click="finishTournament" :disabled="isProcessing"
            class="btn btn-gold">
            <i class="fas fa-trophy me-2"></i> Finish & Lock
          </button>
        </div>
      </div>

      <ul class="nav nav-tabs nav-fill" id="tournamentTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="info-tab" data-bs-toggle="tab" data-bs-target="#info-pane" type="button"
            role="tab">Information</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="participants-tab" data-bs-toggle="tab" data-bs-target="#participants-pane"
            type="button" role="tab">Participants</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="bracket-tab" data-bs-toggle="tab" data-bs-target="#bracket-pane" type="button"
            role="tab">Bracket</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="gallery-tab" data-bs-toggle="tab" data-bs-target="#gallery-pane" type="button"
            role="tab">Gallery</button>
        </li>
      </ul>

      <div class="tab-content mt-4" id="tournamentTabContent">
        <div class="tab-pane fade show active p-4" id="info-pane" role="tabpanel">
          <h2 class="tab-title">Tournament Overview</h2>
          <p class="tournament-description">{{ info.description || info.TournamentDescription }}</p>
          <hr class="my-4">
          <div class="row">
            <div class="col-md-6">
              <h4 class="details-subtitle">Key Details</h4>
              <ul class="list-unstyled details-list">
                <li v-if="info.format || info.Format"><strong>Format:</strong> {{ info.format || info.Format }}</li>
                <li v-if="info.venue || info.Venue"><strong>Venue:</strong> {{ info.venue || info.Venue }}</li>
                <li v-if="info.chief_arbiter || info.ChiefArbiter"><strong>Chief Arbiter:</strong> {{ info.chief_arbiter
                  || info.ChiefArbiter }}</li>
                <li v-if="info.arbiters || info.Arbiters"><strong>Arbiters:</strong> {{ info.arbiters || info.Arbiters
                }}</li>
                <li v-if="info.time_control || info.TimeControl"><strong>Time Control:</strong> {{ info.time_control ||
                  info.TimeControl }}</li>
              </ul>
            </div>
            <div class="col-md-6">
              <h4 class="details-subtitle">Important Documents</h4>
              <div v-if="documents.length > 0" class="list-group">
                <a v-for="doc in documents" :key="doc.Title" :href="doc.Link" target="_blank"
                  class="list-group-item list-group-item-action">
                  <i class="fas fa-file-alt me-2"></i> {{ doc.Title }}
                </a>
              </div>
              <p v-else>No documents available.</p>
            </div>
          </div>
        </div>

        <div class="tab-pane fade p-4" id="participants-pane" role="tabpanel">
          <h3 class="text-center mb-3">Participants</h3>
          <div class="table-responsive">
            <table class="table table-dark table-striped table-hover">
              <thead>
                <tr>
                  <th>Seed</th>
                  <th>Name</th>
                  <th>Rating</th>
                  <th>Title</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in participants" :key="p.roll_no || p.PlayerID">
                  <td>{{ p.seed || p.Seed || '-' }}</td>
                  <td>
                    <span @click="showPlayerRecords(p)" class="clickable-name">
                      {{ p.name || p.Name }}
                    </span>
                  </td>
                  <td>{{ p.rating || p.Rating || '-' }}</td>
                  <td>{{ p.title || p.Title || '-' }}</td>
                </tr>
                <tr v-if="participants.length === 0">
                  <td colspan="4" class="text-center text-muted">No participants found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="tab-pane fade p-4" id="bracket-pane" role="tabpanel">
          <h3 class="text-center mb-3">Tournament Bracket</h3>
          <div class="knockout-bracket">
            <div v-for="round in bracketRounds" :key="round.name" class="bracket-round">
              <h4 class="round-title">{{ round.name }}</h4>
              <div class="round-matches">
                <div v-for="match in round.matches" :key="match.MatchID" class="matchup">
                  <div class="match-participant" :class="{ 'winner': match.Result === 'Player 1 wins' }">
                    <span @click="showPlayerRecords(getParticipantDetails(match.PlayerA_ID))" class="clickable-name">
                      {{ getParticipantDetails(match.PlayerA_ID).name || getParticipantDetails(match.PlayerA_ID).Name }}
                    </span>
                    <span class="score">{{ getScore(match.Score, 'A') }}</span>
                  </div>
                  <div class="match-participant" :class="{ 'winner': match.Result === 'Player 2 wins' }">
                    <span @click="showPlayerRecords(getParticipantDetails(match.PlayerB_ID))" class="clickable-name">
                      {{ getParticipantDetails(match.PlayerB_ID).name || getParticipantDetails(match.PlayerB_ID).Name }}
                    </span>
                    <span class="score">{{ getScore(match.Score, 'B') }}</span>
                  </div>
                  <div v-if="isArbiter && lifecycleStatus !== 'LOCKED' && isCurrentRound(match)"
                    class="p-2 border-top border-secondary text-center">
                    <button @click="openEditModal(match)" class="btn btn-xxs btn-outline-warning w-100">Update
                      Score</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="tab-pane fade p-4" id="gallery-pane" role="tabpanel">
          <div v-if="gallery.length > 0" class="photo-gallery">
            <a v-for="(photo, index) in gallery" :key="index" :href="photo.image_url || photo.Image_URL" target="_blank"
              rel="noopener noreferrer">
              <img :src="photo.image_url || photo.Image_URL" :alt="photo.caption || 'Tournament Photo ' + (index + 1)">
            </a>
          </div>
          <p v-else class="text-center text-muted">No photos have been added yet.</p>
        </div>
      </div>
    </div>

    <div v-if="showLoginModal" class="modal-backdrop" @click.self="showLoginModal = false">
      <div class="modal-container login-modal">
        <div class="modal-header">
          <h5 class="modal-title">Arbiter Authentication</h5>
          <button @click="showLoginModal = false" class="btn-close btn-close-white"></button>
        </div>
        <div class="modal-body">
          <input v-model="loginEmail" type="email" class="form-control bg-dark text-white border-secondary mb-3"
            placeholder="Email">
          <input v-model="loginPassword" type="password" class="form-control bg-dark text-white border-secondary mb-3"
            placeholder="Password">
          <button @click="handleLogin" :disabled="isLoggingIn" class="btn btn-warning w-100">Sign In</button>
        </div>
      </div>
    </div>

    <div v-if="showEditModal" class="modal-backdrop" @click.self="showEditModal = false">
      <div class="modal-container">
        <div class="modal-header">
          <h5 class="modal-title">Update Match Result</h5>
          <button @click="showEditModal = false" class="btn-close btn-close-white"></button>
        </div>
        <div class="modal-body">
          <p class="small text-muted mb-3">Board {{ selectedMatch.MatchNumber }} - {{ selectedMatch.Round }}</p>
          <select v-model="editForm.result" class="form-select bg-dark text-white border-secondary mb-3">
            <option value="Player 1 wins">Player 1 wins</option>
            <option value="Player 2 wins">Player 2 wins</option>
            <option value="Draw">Draw</option>
          </select>
          <input v-model="editForm.score" type="text" class="form-control bg-dark text-white border-secondary mb-3"
            placeholder="Score (e.g. 1-0)">
          <button @click="submitResultUpdate" class="btn btn-warning w-100">Update Match</button>
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
import { ref, computed, onMounted } from 'vue';
import { supabase } from '@/lib/supabase';

const props = defineProps({
  info: Object,
  participants: Array,
  bracketMatches: Array,
  TournamentsList: { type: Array, default: () => [] },
  gallery: Array,
  documents: Array
});

const emit = defineEmits(['refresh']);
const isProcessing = ref(false);
const user = ref(null);
const isArbiter = ref(false);
const isManager = ref(false);

// Missing Refs for Modals
const showLoginModal = ref(false);
const loginEmail = ref('');
const loginPassword = ref('');
const isLoggingIn = ref(false);

const showEditModal = ref(false);
const selectedMatch = ref(null);
const editForm = ref({ result: 'Draw', score: '' });

const showRecordModal = ref(false);
const modalTitle = ref('');
const modalRecords = ref([]);

// --- EDGE FUNCTION INVOCATION ---
async function handleLifecycleAction() {
  const tId = props.info.tournament_id || props.info.TournamentID;
  isProcessing.value = true;

  try {
    // Get fresh session
    const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
    if (sessionError || !session) {
      throw new Error("You must be logged in. Please log in again.");
    }

    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const functionUrl = `${supabaseUrl}/functions/v1/tournament-pairings`;

    console.log('[DEBUG] Calling edge function with token in body...');
    console.log('[DEBUG] Action:', lifecycleStatus.value);

    // Use anon key for Authorization header (required by relay), pass user token in body
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      },
      body: JSON.stringify({
        tournament_id: tId,
        action: lifecycleStatus.value,
        access_token: session.access_token
      })
    });

    console.log('[DEBUG] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[DEBUG] Error response:', errorText);
      try {
        const errJson = JSON.parse(errorText);
        throw new Error(errJson.error || errJson.message || errorText);
      } catch {
        throw new Error(errorText || `HTTP ${response.status}`);
      }
    }

    const data = await response.json();
    emit('refresh');
  } catch (err) {
    console.error('[DEBUG] Error:', err);
    alert("Pairing Error: " + err.message);
  } finally {
    isProcessing.value = false;
  }
}

// --- REVERT & FINISH ---
async function revertToPreviousRound() {
  if (!confirm("Erase all matches in the current round?")) return;
  const maxR = Math.max(...props.bracketMatches.map(m => m.round_number || 0));
  await supabase.from('matches').delete().eq('tournament_id', props.info.tournament_id).eq('round_number', maxR);
  emit('refresh');
}

async function finishTournament() {
  if (!confirm("Finalize and lock results?")) return;
  await supabase.from('tournament_info').update({ status: 'completed' }).eq('tournament_id', props.info.tournament_id);
  emit('refresh');
}

// --- AUTHENTICATION ---
onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    user.value = session.user;
    const { data } = await supabase.from('staff').select('role').eq('email', session.user.email).maybeSingle();
    if (data) {
      isArbiter.value = true;
      if (data.role === 'manager') isManager.value = true;
    }
  }
});

// --- MAPPING & UTILITIES ---
const lifecycleStatus = computed(() => {
  if (props.info.status === 'completed') return 'LOCKED';
  if (props.bracketMatches.length === 0) return 'START';
  const maxR = Math.max(...props.bracketMatches.map(m => m.round_number || 0));
  const current = props.bracketMatches.filter(m => (m.round_number || 0) === maxR);
  if (current.every(m => m.result)) {
    return (current.length === 1 && maxR > 1) ? 'READY_TO_FINISH' : 'READY_FOR_NEXT';
  }
  return 'IN_PROGRESS';
});

const isCurrentRound = (match) => {
  // Use a fallback to 0 to prevent NaN errors in the Final round
  const maxR = Math.max(...props.bracketMatches.map(m => Number(m.round_number) || 0));
  const currentMatchRound = Number(match.round_number);

  // Debug log to help you verify in the console
  console.log(`[DEBUG] Comparing Match Round ${currentMatchRound} to Max Round ${maxR}`);

  return currentMatchRound === maxR;
};

const getParticipantDetails = (id) => {
  if (!id) return { Name: 'BYE', name: 'BYE' };
  return props.participants.find(p => p.roll_no === id || p.PlayerID === id) || { Name: 'TBD', name: 'TBD' };
};

const bracketRounds = computed(() => {
  const roundMap = {};

  // 1. Group by Round Number first (stable identifier)
  props.bracketMatches.forEach(m => {
    const rNum = m.round_number || (typeof m.round === 'number' ? m.round : parseInt(m.round.replace(/^\D+/g, ''))) || 0;

    if (!roundMap[rNum]) {
      roundMap[rNum] = {
        num: rNum,
        matches: []
      };
    }

    roundMap[rNum].matches.push({
      MatchID: m.match_id || m.MatchID,
      Round: rNum, // Temporary, will be updated below
      round_number: rNum, // Needed for isCurrentRound check
      MatchNumber: m.board || m.MatchNumber,
      PlayerA_ID: m.player1_roll_no || m.PlayerA_ID,
      PlayerB_ID: m.player2_roll_no || m.PlayerB_ID,
      Score: m.score || '0-0',
      Result: m.result
    });
  });

  // 2. Determine Round Names based on match count
  return Object.values(roundMap).map(round => {
    const matchCount = round.matches.length;
    let displayName = `Round ${round.num}`;

    if (matchCount === 1) displayName = "Finals";
    else if (matchCount === 2) displayName = "Semifinals";
    else if (matchCount === 4) displayName = "Quarter-finals";

    // Update the round name in the local match objects (if needed for display elsewhere)
    round.matches.forEach(m => m.Round = displayName);

    // Sort matches by board order to prevent visual reshuffling
    round.matches.sort((a, b) => a.MatchNumber - b.MatchNumber);

    return {
      name: displayName,
      num: round.num,
      matches: round.matches
    };
  }).sort((a, b) => a.num - b.num);
});

const getScore = (s, p) => {
  if (!s || !s.includes('-')) return '';
  return p === 'A' ? s.split('-')[0] : s.split('-')[1];
};

// --- MODAL & INTERACTION LOGIC ---
const handleLogin = async () => {
  isLoggingIn.value = true;
  const { error } = await supabase.auth.signInWithPassword({
    email: loginEmail.value,
    password: loginPassword.value,
  });
  isLoggingIn.value = false;
  if (error) {
    alert(error.message);
  } else {
    showLoginModal.value = false;
    location.reload();
  }
};

const openEditModal = (match) => {
  selectedMatch.value = match;
  editForm.value = {
    result: match.Result || 'Draw',
    score: match.Score || ''
  };
  showEditModal.value = true;
};

const submitResultUpdate = async () => {
  if (!selectedMatch.value) return;

  const { error } = await supabase
    .from('matches')
    .update({
      result: editForm.value.result,
      score: editForm.value.score
    })
    .eq('match_id', selectedMatch.value.MatchID);

  if (error) {
    alert('Error updating match: ' + error.message);
  } else {
    showEditModal.value = false;
    emit('refresh');
  }
};

const showPlayerRecords = (player) => {
  if (!player || (player.name === 'BYE' && player.Name === 'BYE') || (player.name === 'TBD' && player.Name === 'TBD')) return;

  modalTitle.value = `Match History: ${player.name || player.Name}`;

  // Filter matches involving this player
  const pId = player.roll_no || player.PlayerID;
  const records = props.bracketMatches.filter(m =>
    (m.player1_roll_no || m.PlayerA_ID) === pId ||
    (m.player2_roll_no || m.PlayerB_ID) === pId
  ).map(m => {
    const isP1 = (m.player1_roll_no || m.PlayerA_ID) === pId;
    const opponentId = isP1 ? (m.player2_roll_no || m.PlayerB_ID) : (m.player1_roll_no || m.PlayerA_ID);
    const opponent = getParticipantDetails(opponentId);

    // Calculate readable result
    let resultText = m.result || 'Pending';
    if (m.result === 'Player 1 wins') {
      const p1Id = m.player1_roll_no || m.PlayerA_ID;
      const p1Name = getParticipantDetails(p1Id).name || getParticipantDetails(p1Id).Name;
      resultText = `${p1Name} won`;
    } else if (m.result === 'Player 2 wins') {
      const p2Id = m.player2_roll_no || m.PlayerB_ID;
      const p2Name = getParticipantDetails(p2Id).name || getParticipantDetails(p2Id).Name;
      resultText = `${p2Name} won`;
    }

    return {
      id: m.match_id || m.MatchID,
      stage: m.round || m.Round,
      opponentName: opponent.name || opponent.Name,
      result: resultText
    };
  });

  modalRecords.value = records;
  showRecordModal.value = true;
};

const closeModal = () => {
  showRecordModal.value = false;
  showEditModal.value = false;
  showLoginModal.value = false;
};

const tournamentTitle = computed(() => props.info.TournamentName || 'Tournament');

const handleLogout = async () => { await supabase.auth.signOut(); location.reload(); };
</script>

<style scoped>
/* Preservation of Existing Styles + Admin UI Additions */
.btn-xxs {
  padding: 0.1rem 0.4rem;
  font-size: 0.65rem;
}

.admin-auth-bar {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  margin-bottom: 10px;
  padding: 5px 15px;
}

.login-modal {
  max-width: 400px;
}

.knockout-page {
  background: linear-gradient(135deg, #0a0a0a, #1a1a2e, #2a0a1e, #1a1a2e, #0a0a0a);
  color: #e0e0e0;
  min-height: 100vh;
}

.tournament-title {
  font-size: 3.5rem;
  font-weight: 900;
  background: linear-gradient(45deg, #FFD700, #f0c000, #C0C0C0);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.tournament-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.7);
}

.nav-tabs {
  border-bottom: 2px solid rgba(255, 215, 0, 0.2);
}

.nav-tabs .nav-link {
  color: rgba(255, 255, 255, 0.7);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.nav-tabs .nav-link:hover {
  color: #FFD700;
}

.nav-tabs .nav-link.active {
  color: #FFD700;
  background-color: rgba(255, 215, 0, 0.05);
  border-bottom: 2px solid #FFD700;
}

.tab-content {
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 0 0 15px 15px;
}

.tab-title,
.details-subtitle {
  color: #FFD700;
}

.list-group-item {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 215, 0, 0.2);
  color: #e0e0e0;
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
}

.knockout-bracket {
  display: flex;
  overflow-x: auto;
  padding: 1rem;
}

.bracket-round {
  display: flex;
  flex-direction: column;
  /* Removed justify-content: space-around; */
  flex-shrink: 0;
  margin-right: 3rem;
  min-width: 200px;
}

.round-matches {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  flex-grow: 1;
  /* Take up all available vertical space */
  gap: 1rem;
  /* Enforce minimum space between matches */
}

.round-title {
  color: #FFD700;
  text-align: center;
  margin-bottom: 1rem;
}

.matchup {
  background: #212529;
  border-radius: 8px;
  /* Removed margin-bottom: 1.5rem; to rely on space-around */
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
}

.modal-container {
  background: #212529;
  border: 1px solid #FFD700;
  border-radius: 10px;
  color: #e0e0e0;
  width: 90%;
  max-width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #FFD700;
}

.modal-title {
  color: #FFD700;
}

.modal-body {
  padding: 1rem;
  max-height: 70vh;
  overflow-y: auto;
}
</style>