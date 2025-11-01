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
              <button 
                class="btn btn-sm"
                :class="isEngineOn ? 'btn-outline-success' : 'btn-outline-danger'"
                @click="toggleEngine"
                :title="isEngineOn ? 'Turn Engine Off' : 'Turn Engine On'"
              >
                <i class="fas fa-power-off"></i>
              </button>
            </h5>
            <div class="evaluation-bar-placeholder mb-2" title="Evaluation from White's perspective">
              <div class="bar" :style="{ width: evalBarStyle.width, backgroundColor: evalBarStyle.color }"></div>
              <span class="eval-text">{{ currentEvaluation }} <small v-if="evalDepth > 0 && isEngineOn">(Depth: {{ evalDepth }})</small></span>
            </div>
            <div class="engine-output-display mb-3">
               <div v-if="engineOutput.length > 0 && isEngineOn">
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
              <div v-if="pgnHeaders" class="pgn-headers">
                <p><strong>Event:</strong> {{ pgnHeaders.Event || '?' }}</p>
                <p><strong>White:</strong> {{ pgnHeaders.White || '?' }}</p>
                <p><strong>Black:</strong> {{ pgnHeaders.Black || '?' }}</p>
                <p><strong>Result:</strong> {{ pgnHeaders.Result || '*' }}</p>
              </div>

             <div v-if="gameMoveTree.length > 0" class="move-list-content">
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
              
              <div v-else-if="!pgnHeaders" class="placeholder-text small text-muted">
                Move list will appear here...
              </div>
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
                     const moveResult = sandboxGame.move(uciMove);
                     if (moveResult) {
                         if (moveResult.color === 'w') {
                             sanLine += `${moveNumber}. `;
                             moveNumber++;
                         }
                         sanLine += `${moveResult.san} `;
                     } else break;
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
    if (!stockfish.value || !isEngineOn.value) return;
    fenBeingAnalyzed.value = currentFen.value;
    engineOutput.value = [];
    isEngineThinking.value = true;
    currentEvaluation.value = '...';
    evalDepth.value = 0;
    stockfish.value.postMessage('stop');
    stockfish.value.postMessage(`position fen ${fenBeingAnalyzed.value}`);
    stockfish.value.postMessage('go depth 15');
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
  const input = pgnInput.value.trim();
  if (!input) {
    alert("Please paste a PGN or FEN string first.");
    return;
  }

  const tempGame = new Chess();
  let loaded = false;
  let parsedGame = null;

  try {
    const pgnAstResult = parse(input); 
    if (!pgnAstResult || pgnAstResult.length === 0) {
      throw new Error("PGN parser returned empty result.");
    }
    
    parsedGame = pgnAstResult[0];
    pgnAst.value = pgnAstResult;
    pgnHeaders.value = parsedGame.tags;

    const fenGame = new Chess();
    if (parsedGame.tags?.FEN) {
      fenGame.load(parsedGame.tags.FEN);
    }
    enrichMovesWithFen(parsedGame.moves, fenGame);
    gameMoveTree.value = parsedGame.moves;
    
    if (parsedGame.tags?.FEN) {
        tempGame.load(parsedGame.tags.FEN);
    }
    let currentMove = parsedGame.moves[0];
    while (currentMove) {
      tempGame.move(currentMove.notation.notation);
      currentMove = currentMove.next;
    }
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
    if (stockfish.value && isEngineOn.value) {
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
  min-height: 150px;
  font-size: 0.9em; /* Base font size */
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
  background-color: #FFD700;
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

.summary-card { border: 1px solid #444; }
.stats .badge { font-size: 0.7rem; padding: 0.25rem 0.4rem; }
.bg-dark-red { background-color: #8b0000 !important; }

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