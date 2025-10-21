<template>
  <div class="knights-conquest-page py-5">
    <div class="container">
      <div class="page-header text-center mb-5">
        <h1 class="tournament-title">
          {{ info.TournamentName || "Tournament" }}
        </h1>
        <p class="tournament-subtitle">
          {{ info.Format || "Tournament Details" }}
        </p>
      </div>

      <ul class="nav nav-tabs nav-fill" id="tournamentTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            class="nav-link active"
            id="info-tab"
            data-bs-toggle="tab"
            data-bs-target="#info-pane"
            type="button"
            role="tab"
          >
            Information
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            id="standings-tab"
            data-bs-toggle="tab"
            data-bs-target="#standings-pane"
            type="button"
            role="tab"
          >
            Standings
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            id="pairings-tab"
            data-bs-toggle="tab"
            data-bs-target="#pairings-pane"
            type="button"
            role="tab"
          >
            Pairings
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            id="playoffs-tab"
            data-bs-toggle="tab"
            data-bs-target="#playoffs-pane"
            type="button"
            role="tab"
          >
            Playoffs
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            id="teams-tab"
            data-bs-toggle="tab"
            data-bs-target="#teams-pane"
            type="button"
            role="tab"
          >
            Teams
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            id="gallery-tab"
            data-bs-toggle="tab"
            data-bs-target="#gallery-pane"
            type="button"
            role="tab"
          >
            Gallery
          </button>
        </li>
      </ul>

      <div class="tab-content mt-4" id="tournamentTabContent">
        <div class="tab-pane fade show active p-4" id="info-pane" role="tabpanel">
          <h2 class="tab-title">Tournament Overview</h2>
          <p class="tournament-description">{{ info.TournamentDescription }}</p>
          <hr class="my-4" />
          <div class="row">
            <div class="col-md-6">
              <h4 class="details-subtitle">Key Details</h4>
              <ul class="list-unstyled details-list">
                <li v-if="info.Format">
                  <strong>Format:</strong> {{ info.Format }}
                </li>
                <li v-if="info.Venue">
                  <strong>Venue:</strong> {{ info.Venue }}
                </li>
                <li v-if="info.ChiefArbiter">
                  <strong>Chief Arbiter:</strong> {{ info.ChiefArbiter }}
                </li>
                <li v-if="info.Arbiters">
                  <strong>Arbiters:</strong> {{ info.Arbiters }}
                </li>
                <li v-if="info.TimeControl">
                  <strong>Time Control:</strong> {{ info.TimeControl }}
                </li>
              </ul>
            </div>
            <div class="col-md-6">
              <h4 class="details-subtitle">Important Documents</h4>
              <div v-if="documents.length > 0" class="list-group">
                <a
                  v-for="doc in documents"
                  :key="doc.Title"
                  :href="doc.Link"
                  target="_blank"
                  class="list-group-item list-group-item-action"
                >
                  <i class="fas fa-file-alt me-2"></i> {{ doc.Title }}
                </a>
              </div>
              <p v-else class="text-center text-muted">No documents available.</p>
            </div>
          </div>
        </div>

      <div class="tab-pane fade p-4" id="standings-pane" role="tabpanel">
  <div class="standings-desktop-toggle d-flex justify-content-center mb-4">
    <div class="btn-group" role="group">
      <input
        type="radio"
        class="btn-check"
        name="standingsToggleDesktop"
        id="teamToggle"
        autocomplete="off"
        :checked="activeStandingsView === 'team'"
        @change="activeStandingsView = 'team'"
      />
      <label class="btn btn-outline-warning" for="teamToggle">Team Standings</label>
      
      <input
        type="radio"
        class="btn-check"
        name="standingsToggleDesktop"
        id="individualToggle"
        autocomplete="off"
        :checked="activeStandingsView === 'individual'"
        @change="activeStandingsView = 'individual'"
      />
      <label class="btn btn-outline-warning" for="individualToggle">Individual Leaderboard</label>
    </div>
  </div>

  <div class="standings-select-wrapper">
    <select v-model="activeStandingsView" class="standings-select">
      <option value="team">Team Standings</option>
      <option value="individual">Individual Leaderboard</option>
    </select>
  </div>


  <div v-if="activeStandingsView === 'team'">
    <h3 class="text-center mb-3">Team Points Table</h3>
    <div class="table-responsive table-sticky-col">
      <table class="table table-dark table-hover align-middle text-center">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Team</th>
            <th>Match Points</th>
            <th>Tie-Breaks</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="team in teamStandings" :key="team.TeamID">
            <td>{{ team.rank }}</td>
            <td @click="showTeamRecords(team)" class="clickable-name">
              {{ team.TeamName }}
            </td>
            <td>{{ team.matchPoints }}</td>
            <td>{{ team.gamePoints.toFixed(1) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-if="activeStandingsView === 'individual'">
    <h3 class="text-center mb-3">Individual Leaderboard (All Stages)</h3>
    <table class="table table-dark table-hover align-middle text-center individual-leaderboard-table">
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
            <select
              class="form-select form-select-lg w-auto bg-dark text-warning"
              v-model="selectedPairingRoundOrStage"
            >
              <option
                v-for="item in uniqueRoundsAndStagesForPairings"
                :key="item"
                :value="item"
              >
                {{ typeof item === "number" ? `Round ${item}` : item }}
              </option>
            </select>
          </div>
          <div
            v-for="pairing in pairingsForSelectedRoundOrStage"
            :key="pairing.TeamMatchID"
            class="pairing-card"
          >
            <div class="pairing-header">
              <span>{{ pairing.TeamA.TeamName }}</span>
              <span class="team-score"
                >{{ pairing.TeamA_Score }} - {{ pairing.TeamB_Score }}</span
              >
              <span>{{ pairing.TeamB.TeamName }}</span>
            </div>
            <ul class="list-group list-group-flush">
              <li
                v-for="game in pairing.games"
                :key="game.BoardNumber"
                class="list-group-item"
              >
                <span class="board-number">Board {{ game.BoardNumber }}</span>
                <span>{{ game.WhitePlayer.PlayerName }}</span>
                <span class="text-warning mx-2">{{ game.Result }}</span>
                <span>{{ game.BlackPlayer.PlayerName }}</span>
              </li>
            </ul>
          </div>
          <p
            v-if="pairingsForSelectedRoundOrStage.length === 0"
            class="text-center text-muted mt-4"
          >
            No pairings found for this selection.
          </p>
        </div>
        
        <div class="tab-pane fade p-4" id="playoffs-pane" role="tabpanel">
            <h2 class="tab-title text-center mb-4">Playoff Bracket</h2>
            <div v-if="hasPlayoffs" class="playoff-container">
                <div class="round semifinals">
                    <h4 class="round-title">Semifinals</h4>
                    <div class="matches">
                        <div v-for="match in playoffMatches.semifinals" :key="match.TeamMatchID" class="matchup">
                            <div class="participant" :class="{ 'winner': match.MatchResult === 'Team A Won' }">
                                {{ match.TeamA.TeamName }} <span>{{ match.TeamA_Score }}</span>
                            </div>
                            <div class="participant" :class="{ 'winner': match.MatchResult === 'Team B Won' }">
                                {{ match.TeamB.TeamName }} <span>{{ match.TeamB_Score }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="round finals">
                    <div v-if="playoffMatches.final.length > 0">
                        <h4 class="round-title">Final</h4>
                        <div class="matches">
                            <div v-for="match in playoffMatches.final" :key="match.TeamMatchID" class="matchup final">
                                <div class="participant" :class="{ 'winner': match.MatchResult === 'Team A Won' }">
                                    {{ match.TeamA.TeamName }} <span>{{ match.TeamA_Score }}</span>
                                </div>
                                <div class="participant" :class="{ 'winner': match.MatchResult === 'Team B Won' }">
                                    {{ match.TeamB.TeamName }} <span>{{ match.TeamB_Score }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div v-if="playoffMatches.thirdPlace.length > 0">
                        <h4 class="round-title">3rd/4th Place</h4> 
                        <div class="matches">
                            <div v-for="match in playoffMatches.thirdPlace" :key="match.TeamMatchID" class="matchup third-place">
                                <div class="participant" :class="{ 'winner': match.MatchResult === 'Team A Won' }">
                                    {{ match.TeamA.TeamName }} <span>{{ match.TeamA_Score }}</span>
                                </div>
                                <div class="participant" :class="{ 'winner': match.MatchResult === 'Team B Won' }">
                                    {{ match.TeamB.TeamName }} <span>{{ match.TeamB_Score }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <p v-else class="text-center text-muted">Playoff matches have not been determined yet.</p>
        </div>
        <div class="tab-pane fade p-4" id="teams-pane" role="tabpanel">
          <div class="accordion" id="teamsAccordion">
            <div v-for="team in teamsList" :key="team.TeamID" class="accordion-item">
              <h2 class="accordion-header">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  :data-bs-target="'#collapse' + team.TeamID"
                >
                  {{ team.TeamName }}
                </button>
              </h2>
              <div
                :id="'collapse' + team.TeamID"
                class="accordion-collapse collapse"
                data-bs-parent="#teamsAccordion"
              >
                <div class="accordion-body">
                  <div v-if="team.owners.length > 0" class="player-group">
                    <h5>Owner</h5>
                    <ul>
                      <li
                        v-for="owner in team.owners"
                        :key="owner.PlayerID"
                        class="owner-item"
                        @click="showPlayerRecords(owner)"
                      >
                        {{ owner.PlayerName }}
                      </li>
                    </ul>
                  </div>

                  <div v-if="team.captains.length > 0" class="player-group mt-3">
                    <h5>Captain</h5>
                    <ul>
                      <li
                        v-for="captain in team.captains"
                        :key="captain.PlayerID"
                        class="captain-item"
                        @click="showPlayerRecords(captain)"
                      >
                        {{ captain.PlayerName }} (C) </li>
                    </ul>
                  </div>

                  <div class="player-group mt-3">
                    <h5>Players</h5>
                    <ul v-if="team.players.length > 0">
                      <li
                        v-for="player in team.players"
                        :key="player.PlayerID"
                        @click="showPlayerRecords(player)"
                      >
                        {{ player.PlayerName }}
                      </li>
                    </ul>
                    <p v-else class="text-muted small">No other players listed.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="tab-pane fade p-4" id="gallery-pane" role="tabpanel">
          <div v-if="gallery.length > 0" class="photo-gallery">
            <a
              v-for="(photo, index) in gallery"
              :key="index"
              :href="photo.Image_URL"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                :src="photo.Image_URL"
                :alt="photo.Caption || 'Tournament Photo ' + (index + 1)"
              />
            </a>
          </div>
          <p v-else class="text-center text-muted">
            No photos available for this tournament yet.
          </p>
        </div>
      </div>
    </div>

    <div v-if="showRecordModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h5 class="modal-title">{{ modalTitle }}</h5>
          <button
            @click="closeModal"
            type="button"
            class="btn-close btn-close-white"
          ></button>
        </div>
        <div class="modal-body">
          <p v-if="modalRecords.length === 0" class="text-center">
            No match data available.
          </p>
          <table v-else class="table table-dark table-sm table-striped">
            <thead>
              <tr v-if="isPlayerRecord">
                <th>Stage</th>
                <th>Opponent</th>
                <th>Color</th>
                <th>Result</th>
              </tr>
              <tr v-if="isTeamRecord">
                <th>Stage</th>
                <th>Opponent Team</th>
                <th>Score</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in modalRecords" :key="record.id">
                <template v-if="isPlayerRecord">
                  <td>
                    {{ typeof record.round === "number" ? `R${record.round}` : record.round }}
                  </td>
                  <td>{{ record.opponentName }}</td>
                  <td>{{ record.color }}</td>
                  <td>{{ record.result }}</td>
                </template>
                <template v-if="isTeamRecord">
                  <td>
                    {{ typeof record.round === "number" ? `R${record.round}` : record.round }}
                  </td>
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
import { ref, computed } from "vue";

// --- PROPS ---
const props = defineProps({
  info: Object,
  documents: Array,
  gallery: Array,
  teamsPlayers: Array,
  teamMatches: Array,
  individualGames: Array,
});

// --- STATE ---
const activeStandingsView = ref("team");
const selectedPairingRoundOrStage = ref(1);
const showRecordModal = ref(false);
const modalTitle = ref("");
const modalRecords = ref([]);
const isPlayerRecord = ref(false);
const isTeamRecord = ref(false);

// --- COMPUTED: UTILITY FUNCTIONS ---
const getTeamDetails = (teamId) => {
  const teamMember = props.teamsPlayers?.find((p) => p.TeamID === teamId);
  return teamMember
    ? { TeamName: teamMember.TeamName, TeamID: teamId }
    : { TeamName: "TBD", TeamID: teamId };
};

const getPlayerDetails = (playerId) => {
  return props.teamsPlayers?.find((p) => p.PlayerID === playerId) || { PlayerName: "Unknown" };
};

// --- COMPUTED: DATA PROCESSING ---
const teamStandings = computed(() => {
  if (!props.teamsPlayers?.length || !props.teamMatches?.length) return [];
  const teamsData = {};

  // Initialize teamsData from unique teams found in players list
  const uniqueTeamsMap = new Map();
  props.teamsPlayers.forEach((p) => {
    if (!uniqueTeamsMap.has(p.TeamID)) {
      uniqueTeamsMap.set(p.TeamID, { TeamID: p.TeamID, TeamName: p.TeamName });
      teamsData[p.TeamID] = { TeamID: p.TeamID, TeamName: p.TeamName, matchPoints: 0, gamePoints: 0 };
    }
  });

  props.teamMatches.forEach((match) => {
    // Only count League matches for standings
    if (match.Stage !== "League") return;

    const scoreA = parseFloat(match.TeamA_Score) || 0;
    const scoreB = parseFloat(match.TeamB_Score) || 0;

    // Ensure teams exist in teamsData before updating
    if (teamsData[match.TeamA_ID]) teamsData[match.TeamA_ID].gamePoints += scoreA;
    if (teamsData[match.TeamB_ID]) teamsData[match.TeamB_ID].gamePoints += scoreB;

    if (match.MatchResult === "Team A Won") {
      if (teamsData[match.TeamA_ID]) teamsData[match.TeamA_ID].matchPoints += 2;
    } else if (match.MatchResult === "Team B Won") {
      if (teamsData[match.TeamB_ID]) teamsData[match.TeamB_ID].matchPoints += 2;
    } else if (match.MatchResult === "Draw") {
      if (teamsData[match.TeamA_ID]) teamsData[match.TeamA_ID].matchPoints += 1;
      if (teamsData[match.TeamB_ID]) teamsData[match.TeamB_ID].matchPoints += 1;
    }
  });

  const sorted = Object.values(teamsData).sort(
    (a, b) => b.matchPoints - a.matchPoints || b.gamePoints - a.gamePoints
  );
  return sorted.map((team, index) => ({ ...team, rank: index + 1 }));
});

const individualStandings = computed(() => {
  if (!props.teamsPlayers?.length || !props.individualGames?.length) return [];
  const playersData = {};

  props.teamsPlayers.forEach((p) => {
    playersData[p.PlayerID] = { ...p, points: 0, TeamName: p.TeamName }; // Ensure TeamName is included
  });

  props.individualGames.forEach((game) => {
    const teamMatch = props.teamMatches.find((tm) => tm.TeamMatchID === game.TeamMatchID);
    if (!teamMatch) return; // Game must belong to a match

    const white = playersData[game.White_PlayerID];
    const black = playersData[game.Black_PlayerID];

    if (game.Result === "1-0" && white) white.points += 1;
    else if (game.Result === "0-1" && black) black.points += 1;
    else if (game.Result === "1/2-1/2" || game.Result === "0.5-0.5") {
      if (white) white.points += 0.5;
      if (black) black.points += 0.5;
    }
  });

  const sorted = Object.values(playersData).sort((a, b) => b.points - a.points);
  return sorted.map((player, index) => ({ ...player, rank: index + 1 }));
});


// --- NEW PLAYOFFS/PAIRINGS LOGIC ---
const uniqueRoundsAndStagesForPairings = computed(() => {
  if (!props.teamMatches) return [1];
  const rounds = new Set();
  const stages = new Set();
  
  props.teamMatches.forEach((match) => {
    if (match.Stage === 'League' && match.Round && !isNaN(parseInt(match.Round))) {
      rounds.add(parseInt(match.Round));
    } else if (match.Stage && match.Stage !== 'League') {
      stages.add(match.Stage);
    }
  });

  const sortedRounds = [...rounds].sort((a, b) => a - b);
  // Define a logical order for playoff stages
  const stageOrder = ['Semifinal', 'Semi Final 1', 'Semi Final 2', '3rd_Place', '3rd/4th Place', 'Final'];
  const sortedStages = [...stages].sort((a, b) => {
    let indexA = stageOrder.indexOf(a);
    let indexB = stageOrder.indexOf(b);
    if (indexA === -1) indexA = Infinity;
    if (indexB === -1) indexB = Infinity;
    // Fallback to string compare if both are not in the list
    if (indexA === Infinity && indexB === Infinity) return a.localeCompare(b);
    return indexA - indexB;
  });

  return [...sortedRounds, ...sortedStages];
});

const playoffMatches = computed(() => {
    if (!props.teamMatches?.length) return { semifinals: [], final: [], thirdPlace: [] };
    
    const matches = props.teamMatches
      .filter(m => m.Stage && m.Stage !== 'League')
      .map(match => ({...match, TeamA: getTeamDetails(match.TeamA_ID), TeamB: getTeamDetails(match.TeamB_ID)}));
    
    // Use robust filtering to catch "Semifinal", "Semi Final 1", etc.
    const semifinals = matches.filter(m => m.Stage.includes('Semi'));
    const final = matches.filter(m => m.Stage.includes('Final'));
    const thirdPlace = matches.filter(m => m.Stage.includes('3rd'));

    return { semifinals, final, thirdPlace };
});

const hasPlayoffs = computed(() => {
  return (
    playoffMatches.value.semifinals.length > 0 ||
    playoffMatches.value.final.length > 0 ||
    playoffMatches.value.thirdPlace.length > 0
  );
});
// --- END OF NEW PLAYOFFS LOGIC ---


const pairingsForSelectedRoundOrStage = computed(() => {
  if (!props.teamMatches) return [];
  const selection = selectedPairingRoundOrStage.value;

  return props.teamMatches
    .filter((match) => {
      if (typeof selection === "number") {
        return parseInt(match.Round) === selection && match.Stage === "League";
      } else {
        return match.Stage === selection;
      }
    })
    .map((match) => ({
      ...match,
      TeamA: getTeamDetails(match.TeamA_ID),
      TeamB: getTeamDetails(match.TeamB_ID),
      games: (props.individualGames || [])
        .filter((g) => g.TeamMatchID === match.TeamMatchID)
        .map((game) => ({
          ...game,
          WhitePlayer: getPlayerDetails(game.White_PlayerID),
          BlackPlayer: getPlayerDetails(game.Black_PlayerID),
        }))
        .sort((a, b) => parseInt(a.BoardNumber) - parseInt(b.BoardNumber)),
    }));
});

const teamsList = computed(() => {
  if (!props.teamsPlayers?.length) return [];
  const teamsMap = new Map();

  // Group players by team and separate by type
  props.teamsPlayers.forEach((p) => {
    if (!teamsMap.has(p.TeamID)) {
      teamsMap.set(p.TeamID, {
        TeamID: p.TeamID,
        TeamName: p.TeamName,
        captains: [],
        owners: [],
        players: [],
      });
    }
    const team = teamsMap.get(p.TeamID);
    if (p.PlayerType === "Captain") team.captains.push(p);
    else if (p.PlayerType === "Owner") team.owners.push(p);
    else team.players.push(p);
  });

  // Sort players within each group
  teamsMap.forEach((team) => {
    team.captains.sort((a, b) => a.PlayerName.localeCompare(b.PlayerName));
    team.owners.sort((a, b) => a.PlayerName.localeCompare(b.PlayerName));
    team.players.sort((a, b) => a.PlayerName.localeCompare(b.PlayerName));
  });

  // Get team performance ranks from teamStandings
  const standings = teamStandings.value;
  const rankMap = new Map(
    standings.map((t) => [
      t.TeamID,
      { rank: t.rank, matchPoints: t.matchPoints, gamePoints: t.gamePoints },
    ])
  );

  const teamsArray = Array.from(teamsMap.values());

  // Sort teams based on rank, then match points, then game points
  teamsArray.sort((a, b) => {
    const teamAStats = rankMap.get(a.TeamID) || {
      rank: Infinity,
      matchPoints: -1,
      gamePoints: -1,
    };
    const teamBStats = rankMap.get(b.TeamID) || {
      rank: Infinity,
      matchPoints: -1,
      gamePoints: -1,
    };

    if (teamAStats.rank !== teamBStats.rank) return teamAStats.rank - teamBStats.rank;
    if (teamAStats.matchPoints !== teamBStats.matchPoints)
      return teamBStats.matchPoints - teamAStats.matchPoints;
    if (teamAStats.gamePoints !== teamBStats.gamePoints)
      return teamBStats.gamePoints - teamAStats.gamePoints;
    return 0;
  });

  return teamsArray;
});

// --- METHODS ---
const showPlayerRecords = (player) => {
  modalTitle.value = `Match History: ${player.PlayerName}`;
  modalRecords.value = (props.individualGames || [])
    .map((game) => {
      const teamMatch = props.teamMatches.find(
        (tm) => tm.TeamMatchID === game.TeamMatchID
      );
      return {
        ...game,
        round: teamMatch ? teamMatch.Round || teamMatch.Stage : "N/A",
      };
    })
    .filter(
      (game) =>
        game.White_PlayerID === player.PlayerID ||
        game.Black_PlayerID === player.PlayerID
    )
    .map((game) => {
      const isWhite = game.White_PlayerID === player.PlayerID;
      const opponentID = isWhite ? game.Black_PlayerID : game.White_PlayerID;
      const opponent = getPlayerDetails(opponentID);

      let gameOutcome = "-";
      if (game.Result === "1/2-1/2" || game.Result === "0.5-0.5") gameOutcome = "Draw";
      else if ((isWhite && game.Result === "1-0") || (!isWhite && game.Result === "0-1"))
        gameOutcome = "Win";
      else if ((isWhite && game.Result === "0-1") || (!isWhite && game.Result === "1-0"))
        gameOutcome = "Loss";

      return {
        id: game.GameID,
        round: game.round,
        opponentName: opponent.PlayerName,
        color: isWhite ? "White" : "Black",
        result: gameOutcome,
      };
    })
    .sort((a, b) => {
      const roundA = parseInt(a.round);
      const roundB = parseInt(b.round);
      if (!isNaN(roundA) && !isNaN(roundB)) return roundA - roundB;
      if (!isNaN(roundA) && isNaN(roundB)) return -1;
      if (isNaN(roundA) && !isNaN(roundB)) return 1;
      return String(a.round).localeCompare(String(b.round));
    });

  isPlayerRecord.value = true;
  isTeamRecord.value = false;
  showRecordModal.value = true;
};

const showTeamRecords = (team) => {
  modalTitle.value = `Match History: ${team.TeamName}`;
  modalRecords.value = (props.teamMatches || [])
    .filter(
      (match) => match.TeamA_ID === team.TeamID || match.TeamB_ID === team.TeamID
    )
    .map((match) => {
      const isTeamA = match.TeamA_ID === team.TeamID;
      const opponentID = isTeamA ? match.TeamB_ID : match.TeamA_ID;
      const opponentTeam = getTeamDetails(opponentID);
      const score = isTeamA
        ? `${match.TeamA_Score} - ${match.TeamB_Score}`
        : `${match.TeamB_Score} - ${match.TeamA_Score}`;

      let matchOutcome = "-";
      if (match.MatchResult === "Draw") matchOutcome = "Draw";
      else if (
        (isTeamA && match.MatchResult === "Team A Won") ||
        (!isTeamA && match.MatchResult === "Team B Won")
      )
        matchOutcome = "Win";
      else if (
        (isTeamA && match.MatchResult === "Team B Won") ||
        (!isTeamA && match.MatchResult === "Team A Won")
      )
        matchOutcome = "Loss";

      return {
        id: match.TeamMatchID,
        round: match.Round || match.Stage,
        opponentTeamName: opponentTeam.TeamName,
        score: score,
        result: matchOutcome,
      };
    })
    .sort((a, b) => {
      const roundA = parseInt(a.round);
      const roundB = parseInt(b.round);
      if (!isNaN(roundA) && !isNaN(roundB)) return roundA - roundB;
      if (!isNaN(roundA) && isNaN(roundB)) return -1;
      if (isNaN(roundA) && !isNaN(roundB)) return 1;
      return String(a.round).localeCompare(String(b.round));
    });

  isPlayerRecord.value = false;
  isTeamRecord.value = true;
  showRecordModal.value = true;
};

const closeModal = () => {
  showRecordModal.value = false;
};
</script>

<style scoped>
  /* --- BASE & COMMON STYLES --- */
  @keyframes background-pan { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  @keyframes title-glow { 0%, 100% { text-shadow: 0 0 10px rgba(255, 215, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.2); } 50% { text-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.5); } }
  @keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes modal-fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

  .knights-conquest-page { background: linear-gradient(135deg, #0a0a0a, #1a1a2e, #2a0a1e, #1a1a2e, #0a0a0a); background-size: 400% 400%; color: #e0e0e0; min-height: 100vh; animation: background-pan 25s ease infinite; }
  .tournament-title { font-size: 3.5rem; font-weight: 900; background: linear-gradient(45deg, #FFD700, #f0c000, #C0C0C0); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: title-glow 5s ease-in-out infinite; }
  .tournament-subtitle { font-size: 1.25rem; color: rgba(255, 255, 255, 0.7); }
  .nav-tabs { border-bottom: 2px solid rgba(255, 215, 0, 0.2); }
  .nav-tabs .nav-link { color: rgba(255, 255, 255, 0.7); background-color: transparent; border: none; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.3s ease; font-weight: 600; position: relative; }
  .nav-tabs .nav-link:hover { color: #FFD700; border-bottom-color: rgba(255, 215, 0, 0.5); }
  .nav-tabs .nav-link.active { color: #FFD700; background-color: rgba(255, 215, 0, 0.05); border-bottom: 2px solid #FFD700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
  .tab-content { background-color: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 0 0 15px 15px; backdrop-filter: blur(5px); }
  .tab-title, .details-subtitle { color: #FFD700; text-shadow: 0 0 5px rgba(255, 215, 0, 0.4); }

  /* --- Info Pane --- */
  #info-pane .list-group-item { background-color: rgba(255, 255, 255, 0.05); border-color: rgba(255, 215, 0, 0.2); color: #e0e0e0; transition: all 0.3s ease; }
  #info-pane .list-group-item:hover { background-color: rgba(255, 215, 0, 0.1); color: #FFD700; transform: translateX(5px); }

  /* --- Standings Pane --- */
  #standings-pane .btn-check:checked+.btn-outline-warning { background-color: #FFD700; color: #0a0a0a; font-weight: 700; box-shadow: 0 0 15px rgba(255, 215, 0, 0.5); }
  #standings-pane .table thead { background: linear-gradient(45deg, #FFD700, #e6b200); color: #1a1a1a; text-transform: uppercase; }
  #standings-pane .table tbody tr { animation: fade-in-up 0.5s ease-out both; }
  #standings-pane .table tbody tr:nth-child(even) { background-color: rgba(255,255,25Next,0.02); }
  #standings-pane .table tbody tr:hover { background-color: rgba(255, 215, 0, 0.1); }
  #standings-pane .clickable-name { cursor: pointer; text-decoration: underline dotted rgba(255, 215, 0, 0.5); transition: all 0.2s ease; }
  #standings-pane .clickable-name:hover { color: #FFD700; text-shadow: 0 0 8px rgba(255, 215, 0, 0.7); transform: scale(1.05); }

  /*
  =============================================================
  == VISIBILITY FIX ==
  This hides the mobile dropdown on desktop.
  =============================================================
  */
  .standings-select-wrapper {
    display: none !important; /* MODIFIED: Added !important */
  }

  /* --- Pairings Pane --- */
  .pairing-card { background-color: #212529; border-radius: 10px; margin-bottom: 1rem; border: 1px solid #444; transition: all 0.3s ease; }
  .pairing-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.4), 0 0 15px rgba(255, 215, 0, 0.2); border-color: #FFD700; }
  .pairing-header { background: linear-gradient(90deg, #2c2c34, #1e1e24); padding: 0.75rem 1.5rem; border-bottom: 1px solid #444; display: flex; justify-content: space-between; align-items: center; font-size: 1.2em; box-shadow: inset 0 -5px 10px rgba(0,0,0,0.3); }
  .pairing-header > span { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 600; }
  .pairing-header > span:first-child { text-align: left; color: #e0e0e0; }
  .pairing-header > span:last-child { text-align: right; color: #e0e0e0; }
  .team-score { text-align: center; flex: 0 0 auto; color: #FFD700; background: linear-gradient(45deg, #4b0101, #2408a5); padding: 0.5rem 1.2rem; border-radius: 8px; margin: 0 1.5rem; font-size: 1.1em; font-weight: 900; border: 2px solid #fff; box-shadow: 0 0 15px rgba(255, 215, 0, 0.5); position: relative; left: 44px; }
  .pairing-card .list-group-item { background: transparent; color: #e0e0e0; display: grid; grid-template-columns: auto 1fr auto 1fr; align-items: center; gap: 1.5rem; padding: 0.75rem 1.5rem; }
  .pairing-card .list-group-item > span:nth-child(2) { text-align: right; }
  .pairing-card .list-group-item > span:nth-child(3) { justify-self: center; font-weight: bold; }
  .pairing-card .list-group-item > span:nth-child(4) { text-align: left; }
  .board-number { font-weight: bold; color: #adb5bd; }

  /* --- Teams Pane --- */
  #teams-pane .accordion-item { background-color: #1a1a1a; border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 10px; margin-bottom: 0.75rem; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); transition: all 0.3s ease; }
  #teams-pane .accordion-item:hover { box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4), 0 0 15px rgba(255, 215, 0, 0.2); transform: translateY(-2px); }
  #teams-pane .accordion-button { background: linear-gradient(90deg, #3a3a3a, #2a2a2a); color: #FFD700; font-weight: bold; padding: 1rem 1.5rem; border-radius: 10px; transition: all 0.3s ease; font-size:0.5em;border: none; }
  #teams-pane .accordion-button::after { filter: invert(80%) sepia(100%) saturate(500%) hue-rotate(0deg) brightness(120%) contrast(100%); transition: transform 0.3s ease-in-out; }
  #teams-pane .accordion-button:not(.collapsed) { background: linear-gradient(90deg, #FFD700, #e6b200); color: #1a1a1a; box-shadow: 0 0 15px rgba(255, 215, 0, 0.5); border-bottom: 1px solid rgba(0, 0, 0, 0.2); }
  #teams-pane .accordion-button:not(.collapsed)::after { filter: none; transform: rotate(-180deg); }
  #teams-pane .accordion-button:focus { outline: none; box-shadow: 0 0 10px rgba(255, 215, 0, 0.7); }
  #teams-pane .accordion-body { background-color: #282828; border-top: 1px solid rgba(255, 215, 0, 0.1); border-radius: 0 0 10px 10px; padding: 1rem 1.5rem; }
  #teams-pane .player-group h5 { color: #adb5bd; font-size: 0.9em; text-transform: uppercase; border-bottom: 1px solid rgba(255, 215, 0, 0.2); padding-bottom: 0.3rem; margin-bottom: 0.75rem; }
  #teams-pane .accordion-body ul { list-style-type: none; padding-left: 0; margin-bottom: 0; }
  #teams-pane .accordion-body li { cursor: pointer; color: #f0f0f0; background-color: rgba(0, 0, 0, 0.3); padding: 0.6rem 1rem; margin-bottom: 0.4rem; border-radius: 5px; border-left: 3px solid #6c757d; transition: all 0.2s ease-in-out; display: flex; align-items: center; }
  #teams-pane .accordion-body li:hover { background-color: rgba(255, 255, 255, 0.1); color: #fff; transform: translateX(5px); border-left-color: #fff; }
  #teams-pane .accordion-body li.owner-item { border-left-color: #dc3545; font-weight: bold; }
  #teams-pane .accordion-body li.owner-item:hover { background-color: rgba(220, 53, 69, 0.2); color: #ffc107; border-left-color: #ffc107; }
  #teams-pane .accordion-body li.captain-item { border-left-color: #FFD700; }
  #teams-pane .accordion-body li.captain-item:hover { background-color: rgba(255, 215, 0, 0.15); color: #FFD700; border-left-color: #fff; }
  .captain-tag, .owner-tag { color: #c0c0c0; font-weight: bold; font-size: 0.8em; margin-left: 6px; }

  /* --- Playoffs Pane --- */
  .playoff-container { display: flex; justify-content: center; gap: 5rem; padding: 1rem; overflow-x: auto; position: relative; }
  .round { display: flex; flex-direction: column; flex-shrink: 0; width: 280px; position: relative; }
  .round.semifinals { justify-content: space-around; }
  .round.finals { justify-content: space-around; }
  .round-title { color: #FFD700; text-align: center; font-weight: 700; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 1px; }
  .matches { display: flex; flex-direction: column; gap: 3rem; }
  .matchup { position: relative; width: 100%; background: linear-gradient(145deg, #2a2a3a, #1e1e24); border-radius: 8px; border: 1px solid #555; box-shadow: 0 4px 15px rgba(0,0,0,0.3); overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease; }
  .matchup:hover { transform: translateY(-5px) scale(1.03); box-shadow: 0 8px 30px rgba(0,0,0,0.5), 0 0 15px rgba(255, 215, 0, 0.3); }
  .round.semifinals .matches { flex-grow: 1; justify-content: space-around; }
  .round.finals > div { flex-grow: 1; display: flex; flex-direction: column; justify-content: center; }
  .matchup { position: relative; width: 100%; background-color: #212529; border-radius: 8px; border: 1px solid #555; box-shadow: 0 4px 15px rgba(0,0,0,0.3); overflow: hidden; background: linear-gradient(to bottom, rgba(75, 1, 1, 0.9), rgba(36, 8, 165, 0.9)); }
  .participant { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 1rem; color: #e0e0e0; font-size: 0.9em; border-bottom: 1px solid #555; transition: all 0.2s ease; height: 2.5rem; box-sizing: border-box; }
  .participant:last-child { border-bottom: none; }
  .participant.winner { color: #FFD700; font-weight: bold; text-shadow: 0 0 8px rgba(255, 215, 0, 0.3); }
  .participant span { font-weight: bold; background-color: rgba(0,0,0,0.3); padding: 0.15rem 0.5rem; border-radius: 4px; min-width: 28px; text-align: center; }
  .participant.winner span { background-color: rgba(255, 215, 0, 0.2); color: #FFD700; text-shadow: none; }
  .matchup::before, .matchup::after { content: ''; position: absolute; background-color: #ffd700; z-index: 0; }
  .semifinals .matchup::after { right: -2.5rem; width: 2.5rem; height: 2px; }
  .semifinals .matchup::before { right: -2.5rem; width: 2px; z-index: -1; }
  .semifinals .matchup:first-child::after { top: calc(1.25rem - 1px); }
  .semifinals .matchup:first-child::before { top: calc(3.75rem - 1px); height: calc(50vh); height: calc(100% + 3rem + 2.5rem); }
  .semifinals .matchup:last-child::after { top: calc(1.25rem - 1px); }
  .semifinals .matchup:last-child::before { top: calc(3.75rem - 1px); }
  .semifinals .matchup:last-child::after { height: calc(100% + 3rem + 2.5rem); bottom: calc(1.25rem - 1px); top: auto; }
  .finals .matchup::before { left: -2.5rem; width: 2.5rem; height: 2px; }
  .round.finals div:first-child .round-title::before { content: '\1F3C6'; display: inline-block; margin-right: 0.5rem; font-size: 1.2em; transform: translateY(2px); }
  .finals .matchup.final::before { top: calc(1.25rem - 1px); }
  .finals .matchup.final::after { content: ''; position: absolute; background-color: #ffd700; left: -2.5rem; width: 2.5rem; height: 2px; top: calc(3.75rem - 1px); }
  .finals .matchup.third-place::before { top: calc(1.25rem - 1px); }
  .finals .matchup.third-place::after { content: ''; position: absolute; background-color: #ffd700; left: -2.5rem; width: 2.5rem; height: 2px; top: calc(3.75rem - 1px); }

  /* --- Gallery Pane --- */
  #gallery-pane .photo-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
  #gallery-pane .photo-gallery img { width: 100%; height: 200px; object-fit: cover; border-radius: 10px; transition: transform 0.3s ease, box-shadow 0.3s ease; }
  #gallery-pane .photo-gallery img:hover { transform: scale(1.05); box-shadow: 0 5px 20px rgba(255, 215, 0, 0.4); }

  /* --- MODAL STYLES --- */
  .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.8); backdrop-filter: blur(5px); display: flex; justify-content: center; align-items: center; z-index: 1050; animation: fade-in-up 0.3s ease; }
  .modal-container { background: #212529; border: 1px solid #FFD700; border-radius: 10px; color: #e0e0e0; width: 90%; max-width: 600px; box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.3); animation: modal-fade-in 0.4s ease-out; }
  .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: linear-gradient(45deg, rgba(255, 215, 0, 0.1), transparent); border-bottom: 1px solid #FFD700; }
  .modal-title { color: #FFD700; margin-bottom: 0; text-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
  .modal-body { padding: 1rem; max-height: 70vh; overflow-y: auto; }


  /* ============================================= */
  /* == RESPONSIVE ADJUSTMENTS FOR MOBILE == */
  /* ============================================= */

  @media (max-width: 767px) {

    /* --- General Typography & Layout --- */
    .tournament-title {
      font-size: 2.2rem;
    }
    .tournament-subtitle {
      font-size: 1rem;
    }
    .tab-content {
      padding: 1rem;
    }

    /* --- Nav Tabs --- */
    .nav-tabs {
      flex-wrap: nowrap;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      padding-bottom: 2px;
    }
    .nav-tabs .nav-link {
      white-space: nowrap;
    }

    /* --- Info Pane --- */
    #info-pane .details-subtitle {
      text-align: center;
    }
    #info-pane .list-group-item {
      text-align: center;
      justify-content: center;
    }
    #info-pane .list-group-item:hover {
      transform: none;
    }

    /* =============================================
    STANDINGS PANE
    ============================================= */
    
    /* 1. Hide desktop buttons on mobile */
    .standings-desktop-toggle {
      display: none !important; /* MODIFIED: Added !important */
    }

    /* 2. Show the mobile dropdown wrapper */
    .standings-select-wrapper {
      display: block !important; /* MODIFIED: Added !important */
      margin-bottom: 1rem;
      position: relative;
    }
    
    .standings-select {
      width: 100%;
      background-color: #1a1a1a;
      color: #FFD700;
      border: 1px solid rgba(255, 215, 0, 0.3);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      background-image: url('data:image/svg+xml;utf8,<svg fill="%23FFD700" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
      background-repeat: no-repeat;
      background-position: right 1rem center;
      background-size: 1.2em;
      overflow-anchor: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .standings-select:focus {
      outline: none;
      border-color: #FFD700;
      box-shadow: inset 0 0 10px rgba(255, 215, 0, 0.7);
    }

    /* 3. Team Table (Sticky Scroll) */
    #standings-pane .table-responsive {
      display: block;
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      border: 1px solid rgba(255, 215, 0, 0.2);
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    }
    
    #standings-pane .table {
      white-space: nowrap; 
      font-size: 0.68rem;
      margin-bottom: 0;
    }
    #standings-pane .table th,
  #standings-pane .table td {
    padding: 0.75rem 0.6rem;
    vertical-align: middle;
  }

    /* 4. Individual Table (Leaderboard Card) */
    .individual-leaderboard-table {
      font-size: 1rem;
      white-space: normal;
    }
    
    .individual-leaderboard-table thead {
      display: none; /* Hide desktop header */
    }

    .individual-leaderboard-table tr {
      display: grid;
      grid-template-columns: 3rem 1fr; /* Reduced rank column */
      grid-template-rows: auto auto auto;
      grid-template-areas:
        "rank player"
        "rank team"
        "rank points";
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 215, 0, 0.2);
      border-radius: 8px;
      margin-bottom: 0.75rem; /* Reduced margin */
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    }

    .individual-leaderboard-table td {
      display: flex;
      padding: 0.4rem 0.75rem; /* Reduced padding */
      border: none;
      text-align: left;
      white-space: normal;
    }

    /* Rank (Column 1) */
    .individual-leaderboard-table td:first-child {
      grid-area: rank;
      font-size: 1.5rem; /* Reduced font size */
      font-weight: 700;
      color: #FFD700;
      align-items: center;
      justify-content: center;
      border-right: 1px solid rgba(255, 215, 0, 0.2);
    }

    /* Player (Column 2) */
    .individual-leaderboard-table td:nth-child(2) {
      grid-area: player;
      font-size: 1rem; /* Reduced font size */
      font-weight: 600;
      padding-top: 0.6rem; /* Reduced padding */
      padding-bottom: 0.25rem;
      cursor: pointer;
      text-decoration: underline dotted rgba(255, 215, 0, 0.7);
      transition: color 0.2s ease;
    }
    
    .individual-leaderboard-table td:nth-child(2):hover {
      color: #FFD700;
    }
    
    /* Team & Points (Cols 3 & 4) */
    .individual-leaderboard-table td:nth-child(3),
    .individual-leaderboard-table td:nth-child(4) {
      font-size: 0.85rem; /* Reduced font size */
      opacity: 0.8;
    }

    .individual-leaderboard-table td:nth-child(3) {
      grid-area: team;
    }

    /* Points (Column 4) */
    .individual-leaderboard-table td:nth-child(4) {
      grid-area: points;
      padding-bottom: 0.6rem; /* Reduced padding */
    }
    
    /* Labels for Team and Points */
    .individual-leaderboard-table td:nth-child(3)::before {
      content: "Team: ";
      font-weight: 600;
      opacity: 0.7;
      margin-right: 0.5rem;
    }
    .individual-leaderboard-table td:nth-child(4)::before {
      content: "Points: ";
      font-weight: 600;
      opacity: 0.7;
      margin-right: 0.5rem;
    }

    /* --- Pairings Pane --- */
    .pairing-header {
      flex-direction: column;
      padding: 1rem;
      gap: 0.75rem;
      text-align: center;
      border-bottom: 2px solid rgba(255, 215, 0, 0.3);
    }
    .pairing-header > span {
      text-align: center !important; 
      font-size: 1.4rem;
      font-weight: 700;
      white-space: normal;
      padding: 0.5rem;
      border-radius: 6px;
      text-shadow: 0 1px 3px rgba(0,0,0,0.5);
      width: 100%;
    }
    .pairing-header > span:first-child { 
      order: 1;
      background: linear-gradient(135deg, rgba(75, 1, 1, 0.9), rgba(120, 1, 1, 0.7));
      border: 1px solid rgba(220, 53, 69, 0.5);
    }
    .pairing-header > span:last-child { 
      order: 3;
      background: linear-gradient(135deg, rgba(36, 8, 165, 0.9), rgba(50, 15, 200, 0.7));
      border: 1px solid rgba(13, 110, 253, 0.5);
    }
    .team-score {
      position: static;
      margin: 0;
      order: 2;
      font-size: 2rem;
      padding: 0.25rem 1.5rem;
      box-shadow: 0 0 15px rgba(255, 215, 0, 0.7);
      font-weight: 900;
      background: #0a0a0a;
      border: 2px solid #FFD700;
    }
    .pairing-card .list-group-item {
      display: grid;
      grid-template-areas:
        'board board board'
        'playerA result playerB';
      grid-template-columns: 1fr auto 1fr;
      gap: 0.5rem 0.5rem;
      padding: 1rem 0.75rem;
      font-size: 1rem;
      white-space: normal;
      border-bottom: 1px solid #333;
    }
    .pairing-card .list-group-item:last-child {
      border-bottom: none;
    }
    .board-number {
      grid-area: board;
      justify-self: center;
      font-size: 0.9rem;
      padding-bottom: 0.5rem;
      color: #FFD700;
      text-align: center;
      width: 100%;
    }
    .pairing-card .list-group-item > span:nth-child(2) {
      grid-area: playerA;
      text-align: right;
      font-weight: 600;
    }
    .pairing-card .list-group-item > span:nth-child(3) {
      grid-area: result;
      justify-self: center;
      font-weight: 900;
      font-size: 1.1rem;
      color: #FFD700;
      background: rgba(0,0,0,0.4);
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      min-width: 40px;
      text-align: center;
    }
    .pairing-card .list-group-item > span:nth-child(4) {
      grid-area: playerB;
      text-align: left;
      font-weight: 600;
    }

    /* --- Teams Pane --- */
    #teams-pane .accordion-button {
      font-size: 1rem;
      padding: 1rem;
    }
    #teams-pane .accordion-body {
      padding: 1rem;
    }
    #teams-pane .accordion-body li {
      padding: 0.5rem 0.75rem;
    }
    #teams-pane .accordion-item:hover {
      transform: none;
    }

    /* --- Playoffs Pane --- */
    .playoff-container {
      flex-direction: column;
      gap: 1.5rem;
      padding: 1rem 0.5rem;
      overflow-x: hidden;
    }
    .round {
      width: 100%;
    }
    .matches {
      gap: 1.5rem;
    }
    .round.semifinals,
    .round.finals {
      justify-content: flex-start;
    }
    .round.finals > div {
      flex-grow: 0;
    }
    .matchup:hover {
      transform: none;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }

    /* --- DISABLE ALL PLAYOFF CONNECTING LINES --- */
    .matchup::before,
    .matchup::after,
    .semifinals .matchup::after,
    .semifinals .matchup::before,
    .semifinals .matchup:first-child::after,
    .semifinals .matchup:first-child::before,
    .semifinals .matchup:last-child::after,
    .semifinals .matchup:last-child::before,
    .finals .matchup::before,
    .finals .matchup.final::before,
    .finals .matchup.final::after,
    .finals .matchup.third-place::before,
    .finals .matchup.third-Glace::after {
      content: none !important;
      display: none !important;
    }

    /* --- Gallery Pane --- */
    #gallery-pane .photo-gallery {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }
    #gallery-pane .photo-gallery img {
      height: 120px;
    }
    #gallery-pane .photo-gallery img:hover {
      transform: none;
      box-shadow: none;
    }
  }
</style>