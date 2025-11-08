<template>
  <div class="analysis-page py-4">
    <div class="container-fluid">
      <div class="row g-3">
        <div class="col-lg-7 col-xl-8">
          <div class="board-container bg-dark-secondary p-3 rounded shadow-lg mb-3">
            <h5 class="text-light mb-2">Analysis Board</h5>
            <div class="chessboard-wrapper">
              <TheChessboard
                :board-config="boardConfig"
                :fen="currentFen"
                :last-move="lastMoveHighlight"
                @board-created="(api) => (boardAPI = api)"
                @move="handleBoardMove"
                style="width: 100%; height: auto; aspect-ratio: 1 / 1;"
              />
            </div>
            <div class="board-controls text-center mt-2">
               <button class="btn btn-sm btn-outline-secondary" @click="resetBoard" title="Reset Board"><i class="fas fa-redo-alt"></i></button>
               <button class="btn btn-sm btn-outline-secondary" @click="firstMove" title="Start"><i class="fas fa-step-backward"></i></button>
               <button class="btn btn-sm btn-outline-secondary" @click="prevMove" title="Previous Move"><i class="fas fa-chevron-left"></i></button>
               <button class="btn btn-sm btn-outline-secondary" @click="nextMove" title="Next Move"><i class="fas fa-chevron-right"></i></button>
               <button class="btn btn-sm btn-outline-secondary" @click="lastMove" title="End"><i class="fas fa-step-forward"></i></button>
               <button class="btn btn-sm btn-outline-secondary" @click="flipBoard" title="Flip Board"><i class="fas fa-sync-alt"></i> Flip</button>
            </div>
          </div>
          
          <!-- PGN Input moved below board -->
          <div class="pgn-fen-input-section bg-dark-secondary p-3 rounded shadow-lg">
            <h6 class="text-light mb-2">Load Game/Position</h6>
            <textarea class="form-control form-control-sm bg-dark text-light border-secondary" rows="3" placeholder="Paste PGN or FEN here..." v-model="pgnInput"></textarea>
            <button class="btn btn-sm btn-primary mt-2 w-100" @click="loadPgnOrFen">Load Game/Position</button>
          </div>
        </div>

        <div class="col-lg-5 col-xl-4">
          <div class="analysis-sidebar bg-dark-secondary p-3 rounded shadow-lg">
            <h5 class="text-light mb-2 d-flex justify-content-between align-items-center">
              <span>Engine Analysis & Moves</span>
              <div class="d-flex gap-2">
                <button 
                  class="btn btn-sm btn-outline-info"
                  @click="startGameReview"
                  :disabled="isReviewRunning || mainLineHistory.length === 0"
                  :title="mainLineHistory.length === 0 ? 'Load a game first' : 'Analyze entire game'"
                >
                  <i class="fas fa-chart-line"></i> Review
                </button>
                <button 
                  class="btn btn-sm"
                  :class="isEngineOn ? 'btn-outline-success' : 'btn-outline-danger'"
                  @click="toggleEngine"
                  :title="isEngineOn ? 'Turn Engine Off' : 'Turn Engine On'"
                >
                  <i class="fas fa-power-off"></i>
                </button>
              </div>
            </h5>
            <div class="evaluation-bar-placeholder mb-2" title="Evaluation from White's perspective">
              <div class="bar" :style="{ width: evalBarStyle.width, backgroundColor: evalBarStyle.color }"></div>
              <span class="eval-text">{{ currentEvaluation }} <small v-if="evalDepth > 0 && isEngineOn">(Depth: {{ evalDepth }})</small></span>
            </div>
            <div class="engine-output-display mb-3">
               <div v-if="isReviewRunning" class="review-progress">
                 <div class="progress mb-2">
                   <div 
                     class="progress-bar progress-bar-striped progress-bar-animated bg-info" 
                     :style="{ width: reviewProgress + '%' }"
                   >
                     {{ reviewProgress }}%
                   </div>
                 </div>
                 <p class="text-center text-muted small">
                   Analyzing move {{ currentReviewMoveIndex + 1 }} of {{ mainLineHistory.length }}...
                 </p>
               </div>
               <div v-else-if="engineOutput.length > 0 && isEngineOn">
                 <div v-for="(line, index) in engineOutput" :key="index" class="engine-line">
                    {{ line }}
                 </div>
               </div>
               <p v-else-if="!isEngineOn" class="placeholder-text small text-muted">Engine is turned off.</p>
               <p v-else-if="!isEngineThinking && !error" class="placeholder-text small text-muted">Make a move or load a game to start analysis.</p>
               <p v-else-if="isEngineThinking" class="placeholder-text small text-muted">Engine is thinking...</p>
               <p v-else-if="error" class="placeholder-text small text-danger">{{ error || 'Engine error' }}</p>
            </div>
            
            <div class="move-list-display mb-3">
              <div v-if="gameReview" class="game-review-report">
                <div class="review-header">
                  <h6 class="text-warning mb-3">
                    <i class="fas fa-clipboard-check"></i> Game Review Report
                    <button 
                      class="btn btn-sm btn-outline-secondary float-end" 
                      @click="closeReview" 
                      title="Close Report"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </h6>
                </div>

                <div class="review-summary mb-3">
                  <!-- Player Headers -->
                  <div class="players-header mb-3">
                    <div class="player-info">
                      <div class="player-name text-light fw-bold">{{ pgnHeaders?.White || 'White' }}</div>
                      <div class="accuracy-badge" :class="getAccuracyClass(gameReview.white.accuracy)">
                        {{ gameReview.white.accuracy }}%
                      </div>
                    </div>
                    <div class="player-info">
                      <div class="player-name text-light fw-bold">{{ pgnHeaders?.Black || 'Black' }}</div>
                      <div class="accuracy-badge" :class="getAccuracyClass(gameReview.black.accuracy)">
                        {{ gameReview.black.accuracy }}%
                      </div>
                    </div>
                  </div>

                  <!-- Stats Table -->
                  <div class="stats-table">
                    <!-- TODO: Add Brilliant and Great moves later -->
                    <!-- <div class="stat-row">
                      <div class="stat-label">Brilliant</div>
                      <div class="stat-value white-stat">{{ gameReview.white.brilliant }}</div>
                      <div class="stat-icon">
                        <i class="fas fa-gem" style="color: #00ffff;"></i>
                      </div>
                      <div class="stat-value black-stat">{{ gameReview.black.brilliant }}</div>
                    </div>

                    <div class="stat-row">
                      <div class="stat-label">Great</div>
                      <div class="stat-value white-stat">{{ gameReview.white.great }}</div>
                      <div class="stat-icon">
                        <i class="fas fa-bolt" style="color: #00d4ff;"></i>
                      </div>
                      <div class="stat-value black-stat">{{ gameReview.black.great }}</div>
                    </div> -->

                    <div class="stat-row">
                      <div class="stat-label">Best</div>
                      <div class="stat-value white-stat">{{ gameReview.white.best }}</div>
                      <div class="stat-icon">
                        <i class="fas fa-star text-success"></i>
                      </div>
                      <div class="stat-value black-stat">{{ gameReview.black.best }}</div>
                    </div>

                    <div class="stat-row">
                      <div class="stat-label">Excellent</div>
                      <div class="stat-value white-stat">{{ gameReview.white.excellent }}</div>
                      <div class="stat-icon">
                        <i class="fas fa-thumbs-up text-info"></i>
                      </div>
                      <div class="stat-value black-stat">{{ gameReview.black.excellent }}</div>
                    </div>

                    <div class="stat-row">
                      <div class="stat-label">Good</div>
                      <div class="stat-value white-stat">{{ gameReview.white.good }}</div>
                      <div class="stat-icon">
                        <i class="fas fa-check-circle text-primary"></i>
                      </div>
                      <div class="stat-value black-stat">{{ gameReview.black.good }}</div>
                    </div>

                    <div class="stat-row">
                      <div class="stat-label">Inaccuracy</div>
                      <div class="stat-value white-stat">{{ gameReview.white.inaccuracies }}</div>
                      <div class="stat-icon">
                        <i class="fas fa-question-circle text-warning"></i>
                      </div>
                      <div class="stat-value black-stat">{{ gameReview.black.inaccuracies }}</div>
                    </div>

                    <div class="stat-row">
                      <div class="stat-label">Mistake</div>
                      <div class="stat-value white-stat">{{ gameReview.white.mistakes }}</div>
                      <div class="stat-icon">
                        <i class="fas fa-exclamation-circle text-danger"></i>
                      </div>
                      <div class="stat-value black-stat">{{ gameReview.black.mistakes }}</div>
                    </div>

                    <div class="stat-row">
                      <div class="stat-label">Blunder</div>
                      <div class="stat-value white-stat">{{ gameReview.white.blunders }}</div>
                      <div class="stat-icon">
                        <i class="fas fa-times-circle text-dark-red"></i>
                      </div>
                      <div class="stat-value black-stat">{{ gameReview.black.blunders }}</div>
                    </div>
                  </div>

                  <!-- Average Loss -->
                  <div class="avg-loss-row mt-3">
                    <div class="avg-loss-item">
                      <span class="text-muted small">Avg Loss:</span>
                      <span class="text-light">{{ gameReview.white.avgCentipawnLoss.toFixed(1) }} cp</span>
                    </div>
                    <div class="avg-loss-item">
                      <span class="text-muted small">Avg Loss:</span>
                      <span class="text-light">{{ gameReview.black.avgCentipawnLoss.toFixed(1) }} cp</span>
                    </div>
                  </div>
                </div>

                <div class="review-moves-list">
                  <h6 class="text-light mb-2">Notable Moves:</h6>
                  <div class="notable-moves-container">
                    <div 
                      v-for="(annotation, index) in gameReview.annotations" 
                      :key="index" 
                      class="notable-move-item"
                      :class="'notable-' + annotation.classification"
                      @click="navigateHistory(annotation.moveIndex)"
                    >
                      <div class="move-classification">
                        <span class="badge" :class="getClassificationBadge(annotation.classification)">
                          {{ annotation.classification }}
                        </span>
                      </div>
                      <div class="move-details">
                        <strong>{{ annotation.moveNumber }}{{ annotation.color === 'w' ? '.' : '...' }} {{ annotation.move }}</strong>
                        <span class="eval-change ms-2 text-danger">
                          {{ annotation.evalChange > 0 ? '+' : '' }}{{ annotation.evalChange }}
                        </span>
                      </div>
                      <div class="best-move-suggestion small text-muted">
                        Best: {{ annotation.bestMove }}
                      </div>
                    </div>
                    <div v-if="gameReview.annotations.length === 0" class="text-center text-muted small py-3">
                      No significant mistakes found. Great game!
                    </div>
                  </div>
                </div>
              </div>

              <div v-else-if="pgnHeaders" class="pgn-headers">
                <p><strong>Event:</strong> {{ pgnHeaders.Event || '?' }}</p>
                <p><strong>White:</strong> {{ pgnHeaders.White || '?' }}</p>
                <p><strong>Black:</strong> {{ pgnHeaders.Black || '?' }}</p>
                <p><strong>Result:</strong> {{ pgnHeaders.Result || '*' }}</p>
              </div>

             <div v-if="gameMoveTree.length > 0 && !gameReview" class="move-list-content">
                <PgnMoveTree
                  v-for="(move, index) in gameMoveTree"
                  :key="`root-${index}-${move.moveNumber}`"
                  :moveData="move"
                  :currentFen="currentFen"
                  :activePath="activeMovePath"
                  :basePath="[]" 
                  @select-move="handleMoveSelection"
                />
              </div>
              
              <div v-else-if="!pgnHeaders && !gameReview" class="placeholder-text small text-muted">
                Move list will appear here...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';
import { Chess } from 'chess.js';
import { parse } from '@mliebelt/pgn-parser';
import PgnMoveTree from '../components/PgnMoveTree.vue';

// --- State ---
const game = ref(new Chess());
const currentFen = ref(game.value.fen());
const boardAPI = ref(null);
const boardConfig = reactive({
  coordinates: true,
  viewOnly: false,
  orientation: 'white',
  highlight: { lastMove: true, check: true },
  animation: { enabled: true, duration: 300 },
});
const lastMoveHighlight = ref([]);
const pgnInput = ref('');
const mainLineHistory = ref([]);
const currentMoveIndex = ref(-1);

// --- PGN/HISTORY STATE ---
const pgnAst = ref(null);
const gameMoveTree = ref([]);
const activeMovePath = ref([]);
const mainLinePlys = ref([]);

// --- Engine State ---
const stockfish = ref(null);
const engineOutput = ref([]);
const currentEvaluation = ref('+0.00');
const evalDepth = ref(0);
const isEngineThinking = ref(false);
const evalBarStyle = ref({ width: '50%', color: '#f8f9fa' });
const error = ref(null);
const fenBeingAnalyzed = ref(null);
const pgnHeaders = ref(null);
const isEngineOn = ref(true);

// --- Game Review State ---
const gameReview = ref(null);
const isReviewRunning = ref(false);
const reviewProgress = ref(0);
const currentReviewMoveIndex = ref(0);
const reviewAnalyses = ref([]);

const updatePgnAndHistory = () => {
  mainLineHistory.value = game.value.history({ verbose: true });
  currentMoveIndex.value = mainLineHistory.value.length - 1;
};

const toggleEngine = () => {
    isEngineOn.value = !isEngineOn.value;
    if (isEngineOn.value) {
        analyzePosition();
    } else {
        if (stockfish.value) stockfish.value.postMessage('stop');
        engineOutput.value = [];
        currentEvaluation.value = '+0.00';
        evalDepth.value = 0;
    }
};

const flipBoard = () => {
  boardConfig.orientation = boardConfig.orientation === 'white' ? 'black' : 'white';
};

const updateEvalBar = (evalValue) => {
    const maxDisplayEval = 5.0;
    const clampedEval = Math.max(-maxDisplayEval, Math.min(maxDisplayEval, evalValue));
    const percentage = 50 + (clampedEval / maxDisplayEval) * 50;
    evalBarStyle.value.width = `${percentage}%`;
    evalBarStyle.value.color = percentage >= 50 ? '#f8f9fa' : '#343a40';
};

const handleEngineMessage = (message) => {
    if (typeof message !== 'string') return;
    if (message.startsWith('info')) {
        const parts = message.split(' ');
        const depthIndex = parts.indexOf('depth');
        const scoreIndex = parts.indexOf('score');
        const pvIndex = parts.indexOf('pv');
        if (depthIndex > -1) evalDepth.value = parseInt(parts[depthIndex + 1]);

        let EvalType = '';
        let EvalValue = 0;
        if (scoreIndex > -1) {
            EvalType = parts[scoreIndex + 1];
            EvalValue = parseInt(parts[scoreIndex + 2]);
        }

        const fenTurn = fenBeingAnalyzed.value.split(' ')[1]; 
        const isWhiteTurnInAnalyzedFen = (fenTurn === 'w');
        if (!isWhiteTurnInAnalyzedFen && EvalType === 'cp') EvalValue = -EvalValue;

        if (EvalType === 'cp') {
            const evalInPawns = (EvalValue / 100.0).toFixed(2);
            currentEvaluation.value = (EvalValue >= 0 ? '+' : '') + evalInPawns;
            updateEvalBar(EvalValue / 100.0); 
        } else if (EvalType === 'mate') {
            const mateIn = isWhiteTurnInAnalyzedFen ? EvalValue : -EvalValue;
            currentEvaluation.value = `#${mateIn}`;
            updateEvalBar(mateIn > 0 ? 10 : -10);
        }

        if (pvIndex > -1) {
             const pvMoveList = parts.slice(pvIndex + 1); 
             if (pvMoveList.length > 0) {
                 const sandboxGame = new Chess(fenBeingAnalyzed.value);
                 let sanLine = "";
                 let moveNumber = sandboxGame.moveNumber();
                 for (const uciMove of pvMoveList) {
                     try {
                         // Convert UCI to move object
                         const from = uciMove.substring(0, 2);
                         const to = uciMove.substring(2, 4);
                         const promotion = uciMove.length > 4 ? uciMove[4] : undefined;
                         
                         const moveResult = sandboxGame.move({ from, to, promotion });
                         if (moveResult) {
                             if (moveResult.color === 'w') {
                                 sanLine += `${moveNumber}. `;
                                 moveNumber++;
                             }
                             sanLine += `${moveResult.san} `;
                         } else break;
                     } catch (e) {
                         break;
                     }
                 }
                 engineOutput.value[0] = `Best line (Depth ${evalDepth.value}): ${sanLine.trim()}`;
             }
        }
    } else if (message.startsWith('bestmove')) {
        isEngineThinking.value = false;
        console.log("Bestmove received:", message);
    } else if (message === 'readyok') {
         isEngineThinking.value = false;
         console.log("Engine readyok received.");
         analyzePosition();
    }
};

const analyzePosition = () => {
    if (!stockfish.value || !isEngineOn.value || isReviewRunning.value) return;
    fenBeingAnalyzed.value = currentFen.value;
    engineOutput.value = [];
    isEngineThinking.value = true;
    currentEvaluation.value = '...';
    evalDepth.value = 0;
    stockfish.value.postMessage('stop');
    stockfish.value.postMessage(`position fen ${fenBeingAnalyzed.value}`);
    stockfish.value.postMessage('go depth 15');  // Normal analysis depth
    console.log(`Sent FEN to Stockfish: ${fenBeingAnalyzed.value}`);
};

const initializeStockfish = () => {
    try {
        console.log("Initializing MODERN Stockfish (v17.1 Lite)...");
        isEngineThinking.value = true;
        error.value = null;
        const stockfishWorkerFile = 'stockfish-17.1-lite-single-03e3232.js'; 
        stockfish.value = new Worker(stockfishWorkerFile);
        console.log(`Stockfish Worker created from: ${stockfishWorkerFile}`);
        stockfish.value.addEventListener('message', (e) => {
            handleEngineMessage(e.data);
        });
        stockfish.value.addEventListener('error', (e) => {
            console.error("Stockfish Worker Error:", e);
            error.value = "Stockfish engine worker failed to load or crashed.";
            isEngineThinking.value = false;
        });
        stockfish.value.postMessage('uci');
        stockfish.value.postMessage('isready');
        stockfish.value.postMessage('ucinewgame');
        stockfish.value.postMessage('setoption name MultiPV value 1');
    } catch (err) {
        console.error("Failed to initialize Stockfish Worker:", err);
        error.value = `Failed to create Stockfish worker. Make sure '${stockfishWorkerFile}' is in the /public folder.`;
        isEngineThinking.value = false;
    }
};

const handleBoardMove = (move) => {
  try {
    const result = game.value.move({ from: move.from, to: move.to, promotion: 'q' });
    if (result === null) { 
      console.warn('Invalid move attempted on board:', move);
      boardAPI.value?.setPosition(currentFen.value);
      return; 
    }
    
    boardAPI.value?.setShapes([]);
    
    const newPgn = game.value.pgn();
    const pgnAstResult = parse(newPgn);
    
    if (pgnAstResult && pgnAstResult.length > 0) {
      const parsedGame = pgnAstResult[0];
      
      const fenGame = new Chess();
      if (parsedGame.tags?.FEN) fenGame.load(parsedGame.tags.FEN);
      enrichMovesWithFen(parsedGame.moves, fenGame);

      gameMoveTree.value = parsedGame.moves;
      pgnHeaders.value = parsedGame.tags;
    } else {
      gameMoveTree.value = [];
      pgnHeaders.value = null;
    }
    
    mainLineHistory.value = game.value.history({ verbose: true });
    mainLinePlys.value = mainLineHistory.value.map(m => m.ply);
    const newPath = mainLinePlys.value;
    currentMoveIndex.value = mainLineHistory.value.length - 1;
    
    navigateToState({ fen: game.value.fen(), path: newPath, san: result.san });

    console.log('Valid move made:', result.san);
    
  } catch (error) {
     console.error("Error processing board move:", error);
     if (boardAPI.value) boardAPI.value.setPosition(game.value.fen());
  }
};

function enrichMovesWithFen(moves, chessInstance, basePly = 0) {
  for (const move of moves) {
    try {
      const moveResult = chessInstance.move(move.notation.notation);
      
      if (moveResult) {
        move.notation.fen = chessInstance.fen(); 
        move.san = moveResult.san;
        move.ply = chessInstance.history().length + basePly;
        
        if (moveResult.color === 'w') {
          move.moveNumber = moveResult.moveNumber;
        } else {
          move.moveNumber = null;
        }
        move.color = moveResult.color;

        if (move.next) {
          enrichMovesWithFen([move.next], chessInstance, basePly);
        }
        
        if (move.variations) {
          move.variations.forEach(variation => {
            const variationGame = new Chess(moveResult.before); 
            const newBasePly = (chessInstance.history().length - 1) + basePly;
            enrichMovesWithFen(variation, variationGame, newBasePly);
          });
        }
      } else {
         console.warn(`Skipping invalid move during FEN enrichment: ${move.notation.notation}`);
      }
    } catch (e) {
      console.warn(`Error enriching move ${move.notation.notation}:`, e);
    }
  }
}

const loadPgnOrFen = () => {
  console.log('=== LOADING PGN/FEN ===');
  const input = pgnInput.value.trim();
  console.log('Input length:', input.length);
  console.log('Input preview:', input.substring(0, 100));
  
  if (!input) {
    alert("Please paste a PGN or FEN string first.");
    return;
  }

  const tempGame = new Chess();
  let loaded = false;
  let parsedGame = null;

  try {
    console.log('Attempting to parse as PGN...');
    const pgnAstResult = parse(input); 
    if (!pgnAstResult || pgnAstResult.length === 0) {
      throw new Error("PGN parser returned empty result.");
    }
    
    console.log('PGN parsed successfully!');
    parsedGame = pgnAstResult[0];
    console.log('Parsed game tags:', parsedGame.tags);
    console.log('Parsed game moves count:', parsedGame.moves ? parsedGame.moves.length : 0);
    console.log('First move structure:', parsedGame.moves[0]);
    console.log('First move has .next?', parsedGame.moves[0]?.next !== undefined);
    console.log('Second move in array:', parsedGame.moves[1]);
    
    pgnAst.value = pgnAstResult;
    pgnHeaders.value = parsedGame.tags;

    const fenGame = new Chess();
    if (parsedGame.tags?.FEN) {
      fenGame.load(parsedGame.tags.FEN);
      console.log('Loaded custom starting FEN');
    }
    enrichMovesWithFen(parsedGame.moves, fenGame);
    gameMoveTree.value = parsedGame.moves;
    console.log('gameMoveTree set with', gameMoveTree.value.length, 'root moves');
    
    if (parsedGame.tags?.FEN) {
        tempGame.load(parsedGame.tags.FEN);
    }
    
    console.log('Replaying moves into tempGame...');
    let moveCount = 0;
    
    // Check if moves are in array format or linked list format
    if (parsedGame.moves.length > 1) {
      // All moves are in the array as siblings
      console.log('Moves are in array format, replaying all...');
      for (const move of parsedGame.moves) {
        console.log(`Replaying move ${moveCount + 1}: ${move.notation.notation}`);
        try {
          tempGame.move(move.notation.notation);
          moveCount++;
        } catch (e) {
          console.error(`Failed to replay move ${move.notation.notation}:`, e);
          break;
        }
      }
    } else {
      // Moves are in linked list format with .next
      console.log('Moves are in linked list format, following .next...');
      let currentMove = parsedGame.moves[0];
      while (currentMove) {
        console.log(`Replaying move ${moveCount + 1}: ${currentMove.notation.notation}`);
        try {
          tempGame.move(currentMove.notation.notation);
          moveCount++;
        } catch (e) {
          console.error(`Failed to replay move ${currentMove.notation.notation}:`, e);
          break;
        }
        currentMove = currentMove.next;
      }
    }
    
    console.log(`Replayed ${moveCount} moves into tempGame`);
    console.log('tempGame.history() length:', tempGame.history().length);
    console.log('tempGame.history():', tempGame.history().join(' '));
    
    loaded = true;
    console.log("Loaded as PGN using @mliebelt/pgn-parser");

  } catch (e) {
    console.log("Not valid PGN, trying FEN...", e.message);
    try {
      tempGame.load(input);
      loaded = true;
      pgnAst.value = null;
      gameMoveTree.value = [];
      pgnHeaders.value = null;
      console.log("Loaded as FEN");
    } catch (e2) {
      console.error("Invalid PGN or FEN:", e2.message);
      alert("Invalid PGN or FEN string. Please check your input.");
      return;
    }
  }

  if (loaded) {
    game.value = tempGame;
    mainLineHistory.value = game.value.history({ verbose: true });
    mainLinePlys.value = mainLineHistory.value.map(m => m.ply); 
    currentMoveIndex.value = mainLineHistory.value.length - 1;
    
    console.log("=== PGN LOADED ===");
    console.log("Total moves in game:", mainLineHistory.value.length);
    console.log("First 5 moves:", mainLineHistory.value.slice(0, 5).map(m => m.san));
    console.log("mainLinePlys:", mainLinePlys.value.slice(0, 10));
    
    const lastMove = mainLineHistory.value[mainLineHistory.value.length - 1];
    navigateToState({ 
      fen: game.value.fen(), 
      path: mainLinePlys.value, 
      san: lastMove?.san 
    });
    
    pgnInput.value = '';
    console.log("Game/Position loaded successfully.");
  }
};

const resetBoard = () => {
  game.value.reset();
  currentFen.value = game.value.fen();
  lastMoveHighlight.value = [];
  pgnHeaders.value = null;
  gameMoveTree.value = [];
  activeMovePath.value = [];
  mainLineHistory.value = [];
  mainLinePlys.value = [];
  currentMoveIndex.value = -1;
};

const handleMoveSelection = ({ fen, san, path }) => {
  console.log("Selected move from tree:", san, "FEN:", fen, "Path:", path);
  navigateToState({ fen, san, path });
};

const navigateToState = ({ fen, path, san }) => {
  currentFen.value = fen;
  activeMovePath.value = path;

  // Sync with main line index
  if (path.length === 0) {
    currentMoveIndex.value = -1;
  } else {
    const lastPlyInPath = path[path.length - 1];
    currentMoveIndex.value = mainLinePlys.value.indexOf(lastPlyInPath);
  }

  const tempGame = new Chess(fen);
  const history = tempGame.history({ verbose: true });
  const lastMove = history[history.length - 1];
  if (lastMove) {
    lastMoveHighlight.value = [lastMove.from, lastMove.to];
  } else {
    lastMoveHighlight.value = [];
  }
  
  if (boardAPI.value && boardAPI.value.getFen() !== fen) {
      boardAPI.value.setPosition(fen);
  }
};

// --- Game Review Functions ---
const startGameReview = async () => {
  console.log('=== STARTING GAME REVIEW ===');
  console.log('mainLineHistory length:', mainLineHistory.value.length);
  console.log('mainLineHistory content:', mainLineHistory.value.map(m => m.san).join(' '));
  console.log('game.value.history() length:', game.value.history().length);
  console.log('game.value.history():', game.value.history().join(' '));
  
  // Create a snapshot of the history to work with
  const historySnapshot = [...mainLineHistory.value];
  console.log('Created history snapshot with', historySnapshot.length, 'moves');
  
  if (historySnapshot.length === 0) {
    console.error('No moves in history!');
    alert('Please load a game first!');
    return;
  }
  if (!stockfish.value) {
    console.error('Stockfish not initialized!');
    alert('Engine not initialized!');
    return;
  }

  console.log('Starting review of', historySnapshot.length, 'moves');
  isReviewRunning.value = true;
  reviewProgress.value = 0;
  currentReviewMoveIndex.value = 0;
  reviewAnalyses.value = [];
  gameReview.value = null;

  // Analyze each position
  for (let i = 0; i < historySnapshot.length; i++) {
    console.log(`\n--- Analyzing move ${i + 1}/${historySnapshot.length} ---`);
    currentReviewMoveIndex.value = i;
    reviewProgress.value = Math.round(((i + 1) / historySnapshot.length) * 100);

    // Build position up to this move
    const tempGame = new Chess();
    if (pgnHeaders.value?.FEN) {
      tempGame.load(pgnHeaders.value.FEN);
      console.log('Loaded starting FEN:', pgnHeaders.value.FEN);
    }
    
    for (let j = 0; j < i; j++) {
      const move = historySnapshot[j];
      console.log(`Replaying move ${j}: ${move.san}`);
      tempGame.move(move);
    }

    const positionBeforeMove = tempGame.fen();
    const moveData = historySnapshot[i];
    console.log(`Position before move ${moveData.san}:`, positionBeforeMove);

    // Analyze the position BEFORE the move
    console.log(`Sending position to engine for analysis...`);
    const analysis = await analyzePositionForReview(positionBeforeMove, moveData);
    console.log(`Analysis result:`, analysis);
    reviewAnalyses.value.push(analysis);
  }

  console.log('\n=== REVIEW COMPLETE ===');
  console.log('Total analyses collected:', reviewAnalyses.value.length);
  
  // Generate report
  generateGameReport();
  isReviewRunning.value = false;
  
  // Re-enable engine analysis for current position
  if (isEngineOn.value) {
    analyzePosition();
  }
};

const analyzePositionForReview = (fen, moveData) => {
  console.log(`[analyzePositionForReview] Starting analysis for ${moveData.san}`);
  
  return new Promise((resolve) => {
    let evalScore = null;
    let bestMove = null;
    let depth = 0;
    let bestDepthScore = null;
    let bestDepthMove = null;
    let maxDepthReached = 0;
    let infoCount = 0;

    const messageHandler = (e) => {
      const message = e.data;
      if (typeof message !== 'string') return;

      if (message.startsWith('info')) {
        infoCount++;
        if (infoCount % 10 === 0) {
          console.log(`[Engine] Received ${infoCount} info messages for ${moveData.san}`);
        }
        
        const parts = message.split(' ');
        const depthIndex = parts.indexOf('depth');
        const scoreIndex = parts.indexOf('score');
        const pvIndex = parts.indexOf('pv');

        if (depthIndex > -1) {
          depth = parseInt(parts[depthIndex + 1]);
          if (depth > maxDepthReached) {
            maxDepthReached = depth;
            console.log(`[Engine] Reached depth ${depth} for ${moveData.san}`);
          }
        }

        if (scoreIndex > -1) {
          const evalType = parts[scoreIndex + 1];
          let evalValue = parseInt(parts[scoreIndex + 2]);

          // Adjust score for display (from White's perspective always)
          const fenTurn = fen.split(' ')[1];
          const isWhiteTurn = fenTurn === 'w';

          if (evalType === 'cp') {
            evalScore = isWhiteTurn ? evalValue : -evalValue;
            // Keep track of best depth evaluation
            if (depth >= maxDepthReached - 1) {
              bestDepthScore = evalScore;
            }
          } else if (evalType === 'mate') {
            const mateValue = isWhiteTurn ? evalValue : -evalValue;
            evalScore = mateValue > 0 ? 10000 : -10000;
            bestDepthScore = evalScore;
          }
        }

        if (pvIndex > -1 && parts[pvIndex + 1]) {
          bestMove = parts[pvIndex + 1];
          if (depth >= maxDepthReached - 1) {
            bestDepthMove = bestMove;
          }
        }
      } else if (message.startsWith('bestmove')) {
        console.log(`[Engine] Bestmove received for ${moveData.san}: ${message}`);
        stockfish.value.removeEventListener('message', messageHandler);
        
        // Use the best depth score if available
        const finalScore = bestDepthScore !== null ? bestDepthScore : evalScore;
        const finalMove = bestDepthMove || bestMove;
        
        console.log(`[analyzePositionForReview] Complete for ${moveData.san}: eval=${finalScore}, bestMove=${finalMove}, depth=${maxDepthReached}, infoMessages=${infoCount}`);
        resolve({ evalScore: finalScore, bestMove: finalMove, depth: maxDepthReached, moveData });
      }
    };

    console.log(`[Engine] Sending commands for ${moveData.san}:`);
    console.log(`  - stop`);
    console.log(`  - position fen ${fen}`);
    console.log(`  - go depth 15`);
    
    stockfish.value.addEventListener('message', messageHandler);
    stockfish.value.postMessage('stop');
    stockfish.value.postMessage(`position fen ${fen}`);
    stockfish.value.postMessage('go depth 16');  // Deep analysis for game review
  });
};

const generateGameReport = () => {
  const whiteStats = {
    brilliant: 0,
    great: 0,
    best: 0,
    excellent: 0,
    good: 0,
    inaccuracies: 0,
    mistakes: 0,
    blunders: 0,
    totalLoss: 0,
    moveCount: 0,
    avgCentipawnLoss: 0
  };
  const blackStats = { ...whiteStats };
  const annotations = [];

  console.log('Generating game report from', reviewAnalyses.value.length, 'analyses');

  for (let i = 0; i < reviewAnalyses.value.length; i++) {
    const current = reviewAnalyses.value[i];
    const moveData = current.moveData;
    const color = moveData.color;
    const stats = color === 'w' ? whiteStats : blackStats;

    stats.moveCount++;

    // Get the evaluation AFTER the move was played
    let evalAfterMove = null;
    if (i + 1 < reviewAnalyses.value.length) {
      evalAfterMove = reviewAnalyses.value[i + 1].evalScore;
    } else {
      // Last move - we can't compare, so skip it
      continue;
    }

    const evalBeforeMove = current.evalScore;
    console.log(`Move ${i}: ${moveData.san}, color=${color}, before=${evalBeforeMove}, after=${evalAfterMove}`);

    if (evalBeforeMove !== null && evalAfterMove !== null) {
      // Calculate centipawn loss from the player's perspective
      // For white: losing material means eval goes down (positive to less positive)
      // For black: losing material means eval goes up (negative to less negative)
      let centipawnLoss;
      if (color === 'w') {
        // White's perspective: loss is when eval decreases
        centipawnLoss = evalBeforeMove - evalAfterMove;
      } else {
        // Black's perspective: loss is when eval increases (becomes more positive for white)
        centipawnLoss = evalAfterMove - evalBeforeMove;
      }

      // Only count actual losses (when position got worse)
      if (centipawnLoss > 0) {
        stats.totalLoss += centipawnLoss;
      }

      // TODO: Implement Brilliant (!!) and Great (!) moves logic later
      // Brilliant move conditions:
      // 1. Must be a sacrifice (piece value loss in material)
      // 2. Must be the best or nearly best move (centipawnLoss <= 10)
      // 3. Position should not be bad after the move (evalAfterMove > -200)
      // 4. Should not be completely winning before (evalBeforeMove < 500)
      //
      // Great move conditions:
      // 1. Must be the best move (centipawnLoss <= 5)
      // 2. Must be the ONLY good move (we'll approximate this by checking if it's significantly better)
      // 3. Not a simple recapture
      
      let classification = 'best';
      
      // Classify the move based on centipawn loss
      if (centipawnLoss <= 15) {
        classification = 'best';
        stats.best++;
      } else if (centipawnLoss <= 30) {
        classification = 'excellent';
        stats.excellent++;
      } else if (centipawnLoss <= 60) {
        classification = 'good';
        stats.good++;
      } else if (centipawnLoss <= 120) {
        classification = 'inaccuracy';
        stats.inaccuracies++;
        annotations.push({
          moveIndex: i,
          moveNumber: moveData.moveNumber || Math.floor(i / 2) + 1,
          color: color,
          move: moveData.san,
          evalChange: Math.round(centipawnLoss),
          classification: 'inaccuracy',
          bestMove: convertUciToSan(current.bestMove, i)
        });
      } else if (centipawnLoss <= 300) {
        classification = 'mistake';
        stats.mistakes++;
        annotations.push({
          moveIndex: i,
          moveNumber: moveData.moveNumber || Math.floor(i / 2) + 1,
          color: color,
          move: moveData.san,
          evalChange: Math.round(centipawnLoss),
          classification: 'mistake',
          bestMove: convertUciToSan(current.bestMove, i)
        });
      } else {
        classification = 'blunder';
        stats.blunders++;
        annotations.push({
          moveIndex: i,
          moveNumber: moveData.moveNumber || Math.floor(i / 2) + 1,
          color: color,
          move: moveData.san,
          evalChange: Math.round(centipawnLoss),
          classification: 'blunder',
          bestMove: convertUciToSan(current.bestMove, i)
        });
      }
    }
  }

  whiteStats.avgCentipawnLoss = whiteStats.moveCount > 0 ? whiteStats.totalLoss / whiteStats.moveCount : 0;
  blackStats.avgCentipawnLoss = blackStats.moveCount > 0 ? blackStats.totalLoss / blackStats.moveCount : 0;

  // Calculate accuracy with increased drop rate (1.3x more sensitive)
  // accuracy = 100 - (avgLoss / 3.85) - drops 1.3x faster than before
  // Previous was /5, now /3.85 (5/1.3 ≈ 3.85)
  whiteStats.accuracy = Math.max(0, Math.min(100, 100 - (whiteStats.avgCentipawnLoss / 3.5))).toFixed(1);
  blackStats.accuracy = Math.max(0, Math.min(100, 100 - (blackStats.avgCentipawnLoss / 3.5))).toFixed(1);

  gameReview.value = {
    white: whiteStats,
    black: blackStats,
    annotations: annotations.sort((a, b) => b.evalChange - a.evalChange)
  };
};

const convertUciToSan = (uciMove, moveIndex) => {
  if (!uciMove) return '?';
  try {
    const tempGame = new Chess();
    if (pgnHeaders.value?.FEN) {
      tempGame.load(pgnHeaders.value.FEN);
    }
    for (let i = 0; i < moveIndex; i++) {
      tempGame.move(mainLineHistory.value[i]);
    }
    
    // Convert UCI format (e2e4) to chess.js format
    const from = uciMove.substring(0, 2);
    const to = uciMove.substring(2, 4);
    const promotion = uciMove.length > 4 ? uciMove.substring(4) : undefined;
    
    const result = tempGame.move({ from, to, promotion });
    return result ? result.san : uciMove;
  } catch (e) {
    console.warn('Failed to convert UCI to SAN:', uciMove, e);
    return uciMove;
  }
};

const closeReview = () => {
  gameReview.value = null;
  reviewAnalyses.value = [];
};

const getClassificationBadge = (classification) => {
  const badges = {
    'brilliant': 'bg-brilliant',
    'great': 'bg-great',
    'best': 'bg-success',
    'excellent': 'bg-info',
    'good': 'bg-primary',
    'inaccuracy': 'bg-warning',
    'mistake': 'bg-danger',
    'blunder': 'bg-dark-red'
  };
  return badges[classification] || 'bg-secondary';
};

const getAccuracyClass = (accuracy) => {
  const acc = parseFloat(accuracy);
  if (acc >= 90) return 'accuracy-excellent';
  if (acc >= 80) return 'accuracy-good';
  if (acc >= 70) return 'accuracy-ok';
  return 'accuracy-poor';
};

// --- NAVIGATION FUNCTIONS (Like your attached code) ---
const navigateHistory = (index) => {
    if (index < -1 || index >= mainLineHistory.value.length) return;
    currentMoveIndex.value = index;
    let newFen = '';
    let newHighlight = [];
    let newPath = [];

    if (index === -1) {
        const startFen = (pgnHeaders.value?.FEN) || new Chess().fen();
        newFen = startFen;
        newHighlight = [];
        newPath = [];
    } else {
        const tempGame = new Chess();
        if (pgnHeaders.value?.FEN) {
          tempGame.load(pgnHeaders.value.FEN);
        }
        
        for (let i = 0; i <= index; i++) { 
          tempGame.move(mainLineHistory.value[i]); 
        }
        newFen = tempGame.fen();
        const lastMoveData = mainLineHistory.value[index];
        newHighlight = [lastMoveData.from, lastMoveData.to];
        newPath = mainLinePlys.value.slice(0, index + 1);
    }

    lastMoveHighlight.value = newHighlight;
    activeMovePath.value = newPath;
    
    if (currentFen.value !== newFen) {
        currentFen.value = newFen;
    }
};

const firstMove = () => navigateHistory(-1);
const prevMove = () => navigateHistory(currentMoveIndex.value - 1);
const nextMove = () => navigateHistory(currentMoveIndex.value + 1);
const lastMove = () => navigateHistory(mainLineHistory.value.length - 1);

const handleKeydown = (event) => {
  if (event.target.tagName.toLowerCase() === 'textarea') return;
  switch (event.key) {
    case 'ArrowLeft': event.preventDefault(); prevMove(); break;
    case 'ArrowRight': event.preventDefault(); nextMove(); break;
    case 'ArrowUp': event.preventDefault(); firstMove(); break;
    case 'ArrowDown': event.preventDefault(); lastMove(); break;
  }
};

onMounted(() => {
  document.title = 'Analysis Board';
  updatePgnAndHistory();
  initializeStockfish();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  if (stockfish.value) {
    stockfish.value.postMessage('quit');
    stockfish.value.terminate();
    console.log("Stockfish terminated.");
  }
  window.removeEventListener('keydown', handleKeydown);
});

watch(currentFen, (newFen) => {
    if (boardAPI.value && boardAPI.value.getFen() !== newFen) {
        boardAPI.value.setPosition(newFen);
    }
    if (stockfish.value && isEngineOn.value && !isReviewRunning.value) {
        analyzePosition();
    }
});
</script>

<style scoped>
/* --- Base Page Style --- */
.analysis-page {
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%);
  color: #e0e0e0;
  min-height: calc(100vh - 56px);
}
/* --- Container Styling --- */
.bg-dark-secondary {
  background: linear-gradient(145deg, #181818, #2a2a2a);
  border: 1px solid rgba(255, 215, 0, 0.15);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
}
.bg-dark-secondary:hover {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7), 0 0 15px rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.3);
}
.board-container, .analysis-sidebar {
  min-height: 400px;
  max-height: calc(100vh - 56px - 2rem - 2rem); 
  display: flex;
  flex-direction: column;
}

/* --- Titles --- */
.board-container h5,
.analysis-sidebar h5 {
  font-weight: 700;
  background: linear-gradient(45deg, #FFD700, #e6b200);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
  border-bottom: 1px solid rgba(255, 215, 0, 0.1);
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
}
.board-container h5 {
  text-align: center;
}
.analysis-sidebar h5 .btn {
  padding: .1rem .4rem;
  font-size: .75rem;
}

/* --- Chessboard --- */
.chessboard-wrapper {
  width: 100%;
  max-width: 510px; /* Your fixed width */
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chessboard-wrapper > :deep(div) {
  width: 100% !important; 
  height: auto !important;
  aspect-ratio: 1 / 1;
}

/* --- Board Controls --- */
.board-controls {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 0.5rem;
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}
.board-controls .btn {
  color: #adb5bd;
  background: #343a40;
  border: 1px solid #555;
  transition: all 0.2s ease;
}
.board-controls .btn:hover {
  color: #FFD700;
  background-color: #495057;
  border-color: #FFD700;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(255, 215, 0, 0.1);
}

/* --- Evaluation Bar --- */
.evaluation-bar-placeholder {
  height: 24px;
  background-color: #1a1a1a;
  border-radius: 4px;
  display: flex;
  align-items: center;
  overflow: hidden;
  position: relative;
  border: 1px solid #444;
}
.evaluation-bar-placeholder .bar {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  background-color: #FFD700;
}
.evaluation-bar-placeholder .bar[style*="background-color: rgb(52, 58, 64)"] {
  background: linear-gradient(90deg, #4b0101, #2408a5); 
}
.evaluation-bar-placeholder .eval-text {
  position: absolute;
  left: 0; right: 0; top: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 0.85em;
  font-weight: 700;
  mix-blend-mode: normal;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
}
.evaluation-bar-placeholder .eval-text small {
  font-size: 0.9em;
  opacity: 0.8;
  margin-left: 5px;
}

/* --- Engine Output --- */
.engine-output-display {
  background-color: #1c1c1c;
  border-radius: 8px;
  padding: 0.75rem;
  overflow-y: auto;
  font-family: monospace;
  color: #ccc;
  border: 1px solid #444;
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.2);
  min-height: 60px;
  font-size: 0.85em;
  flex-shrink: 0;
}
.engine-line {
  white-space: pre-wrap;
  word-break: break-all;
  margin-bottom: 0.2rem;
  padding: 2px 4px;
  border-radius: 3px;
  transition: background-color 0.2s ease;
  font-size: 0.85em;
}
.engine-line:hover {
  background-color: rgba(255, 215, 0, 0.05);
}
.review-progress {
  padding: 1rem;
}
.progress {
  background-color: #1a1a1a;
  height: 20px;
}

/* --- Move List Display --- */
.move-list-display {
  background-color: #1c1c1c;
  border-radius: 8px;
  padding: 0.75rem;
  overflow-y: auto;
  color: #ccc;
  border: 1px solid #444;
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.2);
  min-height: 200px;
  max-height: 500px; /* Increased max height */
  font-size: 0.9em;
  flex-grow: 1;
  line-height: 1.6;
}
.move-list-content {
  font-family: 'Roboto Mono', monospace;
  word-wrap: break-word;
  font-size: 1.1em; /* Larger font for moves */
  line-height: 1.7;
}
.pgn-headers {
  font-size: 0.8rem;
  font-family: Arial, sans-serif;
  color: #adb5bd;
  border-bottom: 1px solid #444;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
}
.pgn-headers p {
  margin: 0;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.placeholder-text {
  color: #6c757d;
  font-weight: bold;
  text-align: center;
  font-size: 0.9em;
  font-family: Arial, sans-serif;
}

/* --- PGN Input Area --- */
.pgn-fen-input-section {
  margin-top: 1rem;
}
.pgn-fen-input-section h6 {
  color: #FFD700;
  font-weight: 600;
  font-size: 0.9rem;
}
.pgn-fen-input-section textarea,
.pgn-fen-input textarea {
  resize: none;
  font-family: monospace;
  background-color: #1c1c1c;
  border-color: #444;
  color: #eee;
}
.pgn-fen-input-section textarea:focus,
.pgn-fen-input textarea:focus {
  background-color: #2c2c2c;
  border-color: #FFD700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
  color: #fff;
}
.pgn-fen-input-section .btn-primary,
.pgn-fen-input .btn-primary {
  background-color: #FFD700;
  border-color: #FFD700;
  color: #111;
  font-weight: 700;
  transition: all 0.2s ease;
}
.pgn-fen-input-section .btn-primary:hover,
.pgn-fen-input .btn-primary:hover {
  background-color: #e6b200;
  border-color: #e6b200;
  color: #000;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 215, 0, 0.2);
}
.pgn-fen-input .btn-info {
  background-color: #17a2b8;
  border-color: #17a2b8;
  color: #fff;
  font-weight: 700;
  transition: all 0.2s ease;
}
.pgn-fen-input .btn-info:hover {
  background-color: #138496;
  border-color: #117a8b;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(23, 162, 184, 0.3);
}
.pgn-fen-input .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* --- Scrollbars --- */
.engine-output-display::-webkit-scrollbar,
.move-list-display::-webkit-scrollbar {
  width: 8px;
}
.engine-output-display::-webkit-scrollbar-track,
.move-list-display::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}
.engine-output-display::-webkit-scrollbar-thumb,
.move-list-display::-webkit-scrollbar-thumb {
  background-color: #FFD700;
  border-radius: 4px;
}
.engine-output-display::-webkit-scrollbar-thumb:hover,
.move-list-display::-webkit-scrollbar-thumb:hover {
  background-color: #e6b200;
}

/* --- Thinking indicator --- */
.analysis-sidebar h5 .spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.2em;
}

/* ========================================
   MOBILE RESPONSIVE STYLES
   ======================================== */

/* Tablets and smaller (landscape) */
@media (max-width: 991.98px) {
  .analysis-page {
    padding: 0.5rem 0 !important;
  }
  
  .board-container, .analysis-sidebar {
    max-height: none;
    margin-bottom: 1rem;
  }
  
  .chessboard-wrapper {
    max-width: 100%;
  }
  
  .board-controls {
    padding: 0.75rem;
  }
  
  .board-controls .btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }
  
  .analysis-sidebar h5 {
    font-size: 1rem;
  }
  
  .move-list-display {
    max-height: 400px;
    min-height: 150px;
  }
}

/* Mobile devices (portrait) */
@media (max-width: 767.98px) {
  .analysis-page {
    padding: 0 !important;
  }
  
  .container-fluid {
    padding: 0.5rem;
  }
  
  /* Board styling */
  .board-container {
    padding: 0.75rem !important;
    margin-bottom: 0.75rem;
  }
  
  .board-container h5 {
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
  }
  
  .chessboard-wrapper {
    max-width: 100%;
    margin: 0 auto;
  }
  
  .board-controls {
    margin-top: 0.75rem;
    padding: 0.5rem;
    gap: 0.35rem;
  }
  
  .board-controls .btn {
    padding: 0.4rem 0.6rem;
    font-size: 0.85rem;
  }
  
  /* Sidebar styling */
  .analysis-sidebar {
    padding: 0.75rem !important;
  }
  
  .analysis-sidebar h5 {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .analysis-sidebar h5 .btn {
    padding: 0.15rem 0.5rem;
    font-size: 0.7rem;
  }
  
  /* Evaluation bar */
  .evaluation-bar-placeholder {
    height: 20px;
  }
  
  .evaluation-bar-placeholder .eval-text {
    font-size: 0.75em;
  }
  
  /* Engine output */
  .engine-output-display {
    min-height: 50px;
    font-size: 0.8em;
    padding: 0.5rem;
  }
  
  .engine-line {
    font-size: 0.8em;
  }
  
  /* Move list */
  .move-list-display {
    max-height: 300px;
    min-height: 120px;
    padding: 0.5rem;
    font-size: 0.85em;
  }
  
  .move-list-content {
    font-size: 1em;
  }
  
  .pgn-headers {
    font-size: 0.75rem;
  }
  
  /* Game Review - Mobile optimized */
  .review-header h6 {
    font-size: 0.9rem;
  }
  
  .players-header {
    padding: 0.5rem;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .player-info {
    width: 100%;
  }
  
  .player-name {
    font-size: 0.9rem;
  }
  
  .accuracy-badge {
    font-size: 0.95rem;
    padding: 0.3rem 0.6rem;
    min-width: 50px;
  }
  
  .stats-table {
    padding: 0.35rem;
  }
  
  .stat-row {
    grid-template-columns: 1fr 50px 40px 50px 1fr;
    padding: 0.5rem 0.35rem;
  }
  
  .stat-label {
    font-size: 0.8rem;
    padding-left: 0.25rem;
  }
  
  .stat-value {
    font-size: 0.95rem;
  }
  
  .white-stat, .black-stat {
    padding-left: 0.25rem;
    padding-right: 0.25rem;
  }
  
  .stat-icon {
    font-size: 1rem;
  }
  
  .avg-loss-row {
    padding: 0.5rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .avg-loss-item {
    width: 100%;
  }
  
  /* Notable moves */
  .notable-moves-container {
    max-height: 250px;
  }
  
  .notable-move-item {
    padding: 0.4rem;
    margin-bottom: 0.4rem;
  }
  
  .move-details {
    font-size: 0.85rem;
  }
  
  .eval-change {
    font-size: 0.75rem;
  }
  
  .best-move-suggestion {
    font-size: 0.75rem;
  }
  
  /* PGN Input */
  .pgn-fen-input-section {
    padding: 0.75rem !important;
    margin-top: 0.75rem;
  }
  
  .pgn-fen-input-section h6 {
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }
  
  .pgn-fen-input-section textarea {
    font-size: 0.8rem;
  }
  
  .pgn-fen-input-section .btn {
    padding: 0.5rem;
    font-size: 0.85rem;
  }
}

/* Small mobile devices */
@media (max-width: 575.98px) {
  .container-fluid {
    padding: 0.35rem;
  }
  
  .board-container, .analysis-sidebar, .pgn-fen-input-section {
    padding: 0.5rem !important;
    margin-bottom: 0.5rem;
  }
  
  .board-container h5, .analysis-sidebar h5 {
    font-size: 0.85rem;
  }
  
  .board-controls {
    gap: 0.25rem;
  }
  
  .board-controls .btn {
    padding: 0.35rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .stat-row {
    grid-template-columns: 0.8fr 45px 35px 45px 0.8fr;
    padding: 0.4rem 0.25rem;
  }
  
  .stat-label {
    font-size: 0.75rem;
  }
  
  .stat-value {
    font-size: 0.85rem;
  }
  
  .stat-icon {
    font-size: 0.9rem;
  }
  
  .player-name {
    font-size: 0.85rem;
  }
  
  .accuracy-badge {
    font-size: 0.85rem;
    padding: 0.25rem 0.5rem;
  }
}

/* Landscape orientation on mobile */
@media (max-width: 767.98px) and (orientation: landscape) {
  .board-container {
    max-width: 50%;
    float: left;
    margin-right: 0.5rem;
  }
  
  .analysis-sidebar {
    max-width: calc(50% - 0.5rem);
    float: right;
  }
  
  .pgn-fen-input-section {
    clear: both;
  }
  
  .move-list-display {
    max-height: 250px;
  }
}

/* --- Game Review Styles --- */
.game-review-report { max-height: 100%; overflow-y: auto; }
.review-header h6 {
  color: #FFD700;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
  padding-bottom: 0.5rem;
}
.review-header .btn-sm {
  --bs-btn-padding-y: .1rem; 
  --bs-btn-padding-x: .4rem; 
  --bs-btn-font-size: .75rem;
  --bs-btn-border-width: 1px;
}

/* Players Header */
.players-header {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid #444;
}
.player-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}
.player-name {
  font-size: 1rem;
  text-align: center;
}
.accuracy-badge {
  font-size: 1.1rem;
  font-weight: 700;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  min-width: 60px;
  text-align: center;
}
.accuracy-excellent { background-color: #28a745; color: white; }
.accuracy-good { background-color: #17a2b8; color: white; }
.accuracy-ok { background-color: #ffc107; color: black; }
.accuracy-poor { background-color: #dc3545; color: white; }

/* Stats Table */
.stats-table {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  border: 1px solid #444;
}
.stat-row {
  display: grid;
  grid-template-columns: 1fr 60px 50px 60px 1fr;
  align-items: center;
  padding: 0.6rem 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background-color 0.2s ease;
}
.stat-row:last-child {
  border-bottom: none;
}
.stat-row:hover {
  background-color: rgba(255, 215, 0, 0.05);
}
.stat-label {
  color: #aaa;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: left;
  padding-left: 0.5rem;
}
.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  text-align: center;
}
.white-stat {
  color: #FFD700;
  text-align: right;
  padding-right: 0.5rem;
}
.black-stat {
  color: #17a2b8;
  text-align: left;
  padding-left: 0.5rem;
}
.stat-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
}
.stat-icon i {
  filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.5));
}

/* Average Loss Row */
.avg-loss-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px solid #444;
}
.avg-loss-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
}

.text-dark-red { color: #ff4444 !important; }
.stats .badge { font-size: 0.7rem; padding: 0.25rem 0.4rem; }
.bg-dark-red { background-color: #8b0000 !important; }
.bg-brilliant { background: linear-gradient(135deg, #00ffff, #00d4ff) !important; color: #000 !important; }
.bg-great { background-color: #00d4ff !important; color: #000 !important; }

.notable-moves-container {
  max-height: 300px; /* Limit height */
  overflow-y: auto;
  padding-right: 5px;
}
.notable-move-item {
  background: rgba(0, 0, 0, 0.3);
  border-left: 3px solid #666;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.notable-move-item:hover {
  background: rgba(255, 215, 0, 0.05);
  transform: translateX(3px);
}
.notable-blunder { border-left-color: #8b0000; }
.notable-mistake { border-left-color: #dc3545; }
.notable-inaccuracy { border-left-color: #ffc107; }
.move-classification { margin-bottom: 0.25rem; }
.move-details { font-size: 0.95rem; color: #e0e0e0; }
.eval-change { font-size: 0.85rem; font-weight: bold; }
.best-move-suggestion { margin-top: 0.25rem; color: #aaa; }

.notable-moves-container::-webkit-scrollbar { width: 6px; }
.notable-moves-container::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.3); border-radius: 3px; }
.notable-moves-container::-webkit-scrollbar-thumb { background-color: #FFD700; border-radius: 3px; }
.notable-moves-container::-webkit-scrollbar-thumb:hover { background-color: #e6b200; }
</style>