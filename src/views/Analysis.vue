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
        </div>

        <div class="col-lg-5 col-xl-4">
          <div class="analysis-sidebar bg-dark-secondary p-3 rounded shadow-lg">
            <h5 class="text-light mb-2 d-flex justify-content-between align-items-center">
              <span>Engine Analysis & Moves</span>
              <span v-if="isEngineThinking" class="spinner-border spinner-border-sm text-warning" role="status" title="Engine is thinking..."></span>
            </h5>
            <div class="evaluation-bar-placeholder mb-2" title="Evaluation from White's perspective">
              <div class="bar" :style="{ width: evalBarStyle.width, backgroundColor: evalBarStyle.color }"></div>
              <span class="eval-text">{{ currentEvaluation }} <small v-if="evalDepth > 0">(Depth: {{ evalDepth }})</small></span>
            </div>
            <div class="engine-output-display mb-3">
               <div v-if="engineOutput.length > 0">
                 <div v-for="(line, index) in engineOutput" :key="index" class="engine-line">
                    {{ line }}
                 </div>
               </div>
               <p v-else-if="!isEngineThinking && !error" class="placeholder-text small text-muted">Make a move or load a game to start analysis.</p>
               <p v-else-if="isEngineThinking" class="placeholder-text small text-muted">Engine is thinking...</p>
               <p v-else-if="error" class="placeholder-text small text-danger">{{ error || 'Engine error' }}</p>
            </div>
            <div class="move-list-display mb-3">
               <pre>{{ gamePgn || 'Move list...' }}</pre>
            </div>
            <div class="pgn-fen-input">
                <textarea class="form-control form-control-sm bg-dark text-light border-secondary" rows="3" placeholder="Paste PGN or FEN here..." v-model="pgnInput"></textarea>
                <button class="btn btn-sm btn-primary mt-2 w-100" @click="loadPgnOrFen">Load Game/Position</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import { TheChessboard } from 'vue3-chessboard'; // Correct Named Import
import 'vue3-chessboard/style.css'; // Import default styles
import { Chess } from 'chess.js';
// DO NOT import stockfish.js here

// --- State ---
const game = ref(new Chess());
const currentFen = ref(game.value.fen());
const boardAPI = ref(null);
const boardConfig = reactive({
  coordinates: true,
  viewOnly: false,
  highlight: { lastMove: true, check: true },
  animation: { enabled: true, duration: 300 },
});
const lastMoveHighlight = ref([]);
const pgnInput = ref('');
const gamePgn = ref('');
const moveHistory = ref([]);
const currentMoveIndex = ref(-1);

// --- Engine State ---
const stockfish = ref(null);
const engineOutput = ref([]);
const currentEvaluation = ref('+0.00');
const evalDepth = ref(0);
const isEngineThinking = ref(false);
const evalBarStyle = ref({ width: '50%', color: '#f8f9fa' });
const error = ref(null); // Added error ref
const fenBeingAnalyzed = ref(null);

// --- Helper Functions (Defined BEFORE onMounted/watch) ---

const updatePgnAndHistory = () => {
  gamePgn.value = game.value.pgn({ maxWidth: 70, newline: '\n' });
  moveHistory.value = game.value.history({ verbose: true });
};

const updateEvalBar = (evalValue) => {
    const maxDisplayEval = 5.0;
    const clampedEval = Math.max(-maxDisplayEval, Math.min(maxDisplayEval, evalValue));
    const percentage = 50 + (clampedEval / maxDisplayEval) * 50;
    evalBarStyle.value.width = `${percentage}%`;
    evalBarStyle.value.color = percentage >= 50 ? '#f8f9fa' : '#343a40';
};

const handleEngineMessage = (message) => {
    // console.log("Engine:", message); // Log all messages for debugging

    if (typeof message !== 'string') return;

    if (message.startsWith('info')) {
        const parts = message.split(' ');
        const depthIndex = parts.indexOf('depth');
        const scoreIndex = parts.indexOf('score');
        const pvIndex = parts.indexOf('pv');
        if (depthIndex > -1) {
            evalDepth.value = parseInt(parts[depthIndex + 1]);
        }

        let EvalType = '';
        let EvalValue = 0; 

        if (scoreIndex > -1) {
            EvalType = parts[scoreIndex + 1]; // 'cp' or 'mate'
            EvalValue = parseInt(parts[scoreIndex + 2]);
        }

        // --- THIS IS THE FIX ---
        // Determine the turn from the FEN that was ACTUALLY analyzed,
        // not from the main game.value, which is at the latest move.
       const fenTurn = fenBeingAnalyzed.value.split(' ')[1]; 
        const isWhiteTurnInAnalyzedFen = (fenTurn === 'w');
        // --- END FIX ---
        

        // Adjust score for display (always show from White's perspective)
        // If it was Black's turn in the FEN, the score is from Black's perspective, so invert it.
        if (!isWhiteTurnInAnalyzedFen && EvalType === 'cp') { 
            EvalValue = -EvalValue; // Invert score
        }

        // Update evaluation display
        if (EvalType === 'cp') {
            const evalInPawns = (EvalValue / 100.0).toFixed(2);
            currentEvaluation.value = (EvalValue >= 0 ? '+' : '') + evalInPawns;
            updateEvalBar(EvalValue / 100.0); 

        } else if (EvalType === 'mate') {
            // Mate scores are also relative to the FEN's turn
            const mateIn = isWhiteTurnInAnalyzedFen ? EvalValue : -EvalValue;
            currentEvaluation.value = `#${mateIn}`;
            updateEvalBar(mateIn > 0 ? 10 : -10);
        }

        // --- (This SAN conversion logic is from our previous fix) ---
        if (pvIndex > -1) {
             const pvMoveList = parts.slice(pvIndex + 1); 
             
             if (pvMoveList.length > 0) {
                 const sandboxGame = new Chess(currentFen.value);
                 let sanLine = "";
                 let moveNumber = sandboxGame.moveNumber();
                 
                 for (const uciMove of pvMoveList) {
                     const moveResult = sandboxGame.move(uciMove);
                     
                     if (moveResult) {
                         if (moveResult.color === 'w') {
                             sanLine += `${moveNumber}. `;
                             moveNumber++;
                         }
                         sanLine += `${moveResult.san} `;
                     } else {
                         break;
                     }
                 }
                 engineOutput.value[0] = `Best line (Depth ${evalDepth.value}): ${sanLine.trim()}`;
             }
        }
        // --- END SAN CONVERSION ---

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
    if (!stockfish.value) return;
    fenBeingAnalyzed.value = currentFen.value;
    engineOutput.value = [];
    isEngineThinking.value = true;
    currentEvaluation.value = '...';
    evalDepth.value = 0;

    stockfish.value.postMessage('stop');
    stockfish.value.postMessage(`position fen ${currentFen.value}`);
    stockfish.value.postMessage('go depth 15');
    console.log(`Sent FEN to Stockfish: ${currentFen.value}`);
};

const initializeStockfish = () => {
    try {
        console.log("Initializing MODERN Stockfish (v17.1 Lite)...");
        isEngineThinking.value = true;
        error.value = null;

        // Use the exact filename you copied to the /public folder
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

        // Send initial UCI commands
        stockfish.value.postMessage('uci');
        stockfish.value.postMessage('isready');
        stockfish.value.postMessage('ucinewgame');
        
        // This lite version doesn't need the 'EvalFile' command
        
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
    if (result === null) { console.warn('Invalid move attempted:', move); return; }

    boardAPI.value?.setShapes([]); // Clear any old nav highlights
    currentFen.value = game.value.fen(); // This triggers the watcher
    lastMoveHighlight.value = [move.from, move.to];
    updatePgnAndHistory();
    currentMoveIndex.value = moveHistory.value.length - 1;
    console.log('Valid move made:', result.san);
    
  } catch (error) {
     console.error("Error processing board move:", error);
if (boardAPI.value) boardAPI.value.setPosition(game.value.fen());  }
};

const loadPgnOrFen = () => {
  const input = pgnInput.value.trim();
  const tempGame = new Chess();
  let loaded = false;

  try {
    loaded = tempGame.loadPgn(input);
    if (!loaded) throw new Error("loadPgn returned false");
    console.log("Loaded as PGN");
  } catch (e) {
    console.log("Not valid PGN or empty, trying FEN...");
    try {
      tempGame.load(input); // Handles FEN
      loaded = true;
      console.log("Loaded as FEN");
    } catch (e2) {
      console.error("Invalid PGN or FEN:", e2);
      alert("Invalid PGN or FEN string.");
      return;
    }
  }

  if (loaded) {
    game.value = tempGame;
    currentFen.value = game.value.fen(); // This will trigger the watcher
    lastMoveHighlight.value = [];
    updatePgnAndHistory();
    currentMoveIndex.value = moveHistory.value.length - 1;
    pgnInput.value = '';
    // Watcher will trigger analyzePosition()
    console.log("Game/Position loaded successfully.");
  }
};

const resetBoard = () => {
  game.value.reset();
  currentFen.value = game.value.fen(); // Triggers watcher
  lastMoveHighlight.value = [];
  updatePgnAndHistory();
  currentMoveIndex.value = -1;
};

const navigateHistory = (index) => {
    if (index < -1 || index >= moveHistory.value.length) return;
    currentMoveIndex.value = index;
    let newFen = '';
    let newHighlight = [];

    if (index === -1) {
        const tempGame = new Chess();
        newFen = tempGame.fen();
        newHighlight = [];
    } else {
        const tempGame = new Chess();
        for (let i = 0; i <= index; i++) { tempGame.move(moveHistory.value[i]); }
        newFen = tempGame.fen();
        const lastMoveData = moveHistory.value[index];
        newHighlight = [lastMoveData.from, lastMoveData.to];
    }

    lastMoveHighlight.value = newHighlight;
    if (currentFen.value !== newFen) {
        currentFen.value = newFen; // This triggers the watcher
    }
};

const firstMove = () => navigateHistory(-1);
const prevMove = () => navigateHistory(currentMoveIndex.value - 1);
const nextMove = () => navigateHistory(currentMoveIndex.value + 1);
const lastMove = () => navigateHistory(moveHistory.value.length - 1);

const flipBoard = () => {
  if (boardAPI.value) {
    boardAPI.value.toggleOrientation();
  }
};

// Function to handle keyboard input
const handleKeydown = (event) => {
  // Don't navigate if the user is typing in the PGN/FEN textarea
  if (event.target.tagName.toLowerCase() === 'textarea') {
    return;
  }

  // Prevent browser scroll on arrow keys
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault();
      prevMove();
      break;
    case 'ArrowRight':
      event.preventDefault();
      nextMove();
      break;
    case 'ArrowUp': // Bonus: Go to start
      event.preventDefault();
      firstMove();
      break;
    case 'ArrowDown': // Bonus: Go to end
      event.preventDefault();
      lastMove();
      break;
  }
};

// --- Lifecycle Hooks (must be AFTER functions they call) ---
onMounted(() => {
  document.title = 'Analysis Board';
  updatePgnAndHistory(); // Now defined above
  initializeStockfish();
  
  // --- ADD THIS LINE ---
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  // Correctly terminate the worker
  if (stockfish.value) {
    stockfish.value.postMessage('quit');
    stockfish.value.terminate();
    console.log("Stockfish terminated.");
  }
  
  // --- ADD THIS LINE ---
  window.removeEventListener('keydown', handleKeydown);
});

// --- Watchers (must be AFTER functions they call) ---
// --- Watchers (must be AFTER functions they call) ---
watch(currentFen, (newFen) => {
    // Force the board to update its position.
    // This is more reliable than just relying on the prop.
    if (boardAPI.value) {
        boardAPI.value.setPosition(newFen);
    }
    
    // Automatically analyze new positions
    if (stockfish.value) {
        analyzePosition(); // Now defined above
    }
});
</script>

<style scoped>
/* --- Base Page Style --- */
.analysis-page {
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%);
  color: #e0e0e0;
  min-height: calc(100vh - 56px); /* Adjust based on your navbar height */
}

/* --- Container Styling --- */
.bg-dark-secondary {
  background: linear-gradient(145deg, #181818, #2a2a2a); /* Darker gradient */
  border: 1px solid rgba(255, 215, 0, 0.15); /* Faint gold border */
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5); /* Deeper shadow */
  transition: all 0.3s ease; /* Added for hover */
}

/* --- Add hover glow to containers --- */
.bg-dark-secondary:hover {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7), 0 0 15px rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.3);
}

/* Ensure containers have a sensible default height behavior */
.board-container, .analysis-sidebar {
  min-height: 400px;
  /* Set a max-height based on viewport, but NOT a fixed height */
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
  margin-bottom: 1rem; /* Ensure consistent margin */
}

/* --- FIX: Center the board title --- */
.board-container h5 {
  text-align: center;
}

/* Wrapper to control board size */
.chessboard-wrapper {
  width: 100%;
  /* --- KEPT YOUR FIXED WIDTH --- */
  max-width: 510px; 
  
  margin: 0 auto; /* Center the wrapper */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Target the vue3-chessboard component itself */
.chessboard-wrapper > :deep(div) {
  /* Make the board fill its wrapper */
  width: 100% !important; 
  height: auto !important;
  aspect-ratio: 1 / 1; /* Keep it square */
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
  gap: 0.5rem; /* Handles spacing for all buttons */
}
.board-controls .btn {
  color: #adb5bd;
  background: #343a40;
  border: 1px solid #555;
  transition: all 0.2s ease;
}
.board-controls .btn:hover {
  color: #FFD700; /* Gold hover */
  background-color: #495057;
  border-color: #FFD700;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(255, 215, 0, 0.1);
}

/* --- Analysis Sidebar --- */

/* Evaluation Bar */
.evaluation-bar-placeholder {
  height: 24px; /* Slightly thicker */
  background-color: #1a1a1a; /* Very dark background */
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
  /* --- MODIFIED --- */
  background-color: #FFD700; /* Gold for White's advantage */
}
.evaluation-bar-placeholder .bar[style*="background-color: rgb(52, 58, 64)"] {
  /* --- MODIFIED --- */
  /* Use the dark gradient from your pairing cards */
  background: linear-gradient(90deg, #4b0101, #2408a5); 
}
.evaluation-bar-placeholder .eval-text {
  position: absolute;
  left: 0; right: 0; top: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  /* --- MODIFIED for readability on all backgrounds --- */
  color: #ff0000; /* Always white */
  font-size: 1em;
  font-weight: 900;
  mix-blend-mode: normal; /* Remove mix-blend-mode */
  text-shadow: 1px 1px 2px rgba(0,0,0,0.7); /* Stronger shadow */
}
.evaluation-bar-placeholder .eval-text small {
  font-size: 0.9em;
  opacity: 0.8;
  margin-left: 5px;
}

/* Engine Output & Move List */
.engine-output-display,
.move-list-display {
  background-color: #1c1c1c; /* Darker than sidebar bg */
  border-radius: 8px;
  padding: 0.75rem;
  overflow-y: auto;
  font-family: monospace;
  color: #ccc;
  border: 1px solid #444; /* Defined border */
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.2);
}
.engine-output-display {
  min-height: 60px;
  font-size: 0.85em;
  flex-shrink: 0; /* Don't let it shrink too much */
}
.engine-line {
  white-space: pre-wrap; /* Use pre-wrap for SAN */
  word-break: break-all;
  margin-bottom: 0.2rem;
  padding: 2px 4px;
  border-radius: 3px;
  transition: background-color 0.2s ease;
}
.engine-line:hover {
  background-color: rgba(255, 215, 0, 0.05); /* Faint gold hover */
}

.move-list-display {
  min-height: 150px;
  font-size: 0.9em;
  flex-grow: 1; /* This takes up the most space */
  white-space: pre-wrap;
  word-break: break-all;
}
.move-list-display pre {
    margin: 0;
    color: inherit;
    font-family: inherit;
    font-size: inherit;
}

/* PGN Input Area */
.pgn-fen-input textarea {
  resize: none;
  font-family: monospace;
  background-color: #1c1c1c;
  border-color: #444;
  color: #eee;
}
.pgn-fen-input textarea:focus {
  background-color: #2c2c2c;
  border-color: #FFD700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
  color: #fff;
}
.pgn-fen-input .btn-primary {
  background-color: #FFD700; /* Gold button */
  border-color: #FFD700;
  color: #111;
  font-weight: 700;
  transition: all 0.2s ease;
}
.pgn-fen-input .btn-primary:hover {
  background-color: #e6b200;
  border-color: #e6b200;
  color: #000;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 215, 0, 0.2);
}


/* Scrollbars */
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

/* Thinking indicator */
.analysis-sidebar h5 .spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.2em;
}
</style>