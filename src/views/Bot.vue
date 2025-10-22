<template>
  <div class="bot-page">
    <!-- Puzzle Content -->
    <section class="bot-content">
      <div class="bot-container">
        <div class="bot-layout">
          <!-- Chess Board Container -->
          <div class="chess-container">
            <div class="board-wrapper">
              <div class="chess-board" ref="chessBoard">
                <div v-for="(square, index) in boardSquares" :key="index" :class="getSquareClass(index)"
                  @click="handleSquareClick(index)">
                  <div v-if="square.piece" :class="getPieceClass(square.piece)" class="chess-piece"
                    :data-piece="square.piece">
                  </div>
                  <!-- Valid move indicator -->
                  <div v-if="isValidMove(index)" class="move-indicator"></div>
                </div>
              </div>
            </div>

            <div class="controls-card">
                <div v-if="botMessage" class="status-message">
                <div :class="stateconst" class="alert">
                  <img src="/billa.png" alt="status icon" class="status-image me-2" />
                  <i class="me-2"></i>{{ botMessage }}
                </div>
              </div>
              <div v-if="statusMessage" class="status-message">
                <div :class="statusClass" class="alert">
                  <i :class="statusIcon" class="me-2"></i>{{ statusMessage }}
                </div>
              </div>
              <div>
                <button @click="resetPuzzle" class="btn btn-control btn-reset">
                  <i class="fas fa-redo me-2"></i>Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Promotion Dialog -->
      <div v-if="showPromotionDialog" class="promotion-dialog-overlay">
        <div class="promotion-dialog">
          <h3 class="text-center">Choose Promotion Piece</h3>
          <div class="promotion-pieces">
            <button @click="promotePawn('q')" class="promotion-btn">
              <div :class="promotionColor ? 'white-piece' : 'black-piece'" class="promotion-piece">♕</div>
              <span>Queen</span>
            </button>
            <button @click="promotePawn('r')" class="promotion-btn">
              <div :class="promotionColor ? 'white-piece' : 'black-piece'" class="promotion-piece">♖</div>
              <span>Rook</span>
            </button>
            <button @click="promotePawn('b')" class="promotion-btn">
              <div :class="promotionColor ? 'white-piece' : 'black-piece'" class="promotion-piece">♗</div>
              <span>Bishop</span>
            </button>
            <button @click="promotePawn('n')" class="promotion-btn">
              <div :class="promotionColor ? 'white-piece' : 'black-piece'" class="promotion-piece">♘</div>
              <span>Knight</span>
            </button>
          </div>
        </div>
      </div>

      
            <!-- Checkmate/Stalemate Dialog -->
            <div v-if="(isCheckmate || isStalemate) && !showPuzzleCompletePopup" class="game-end-overlay">
              <div class="game-end-dialog">
                <!-- Close (X) button -->
                <button class="popup-close-btn" @click="showPuzzleCompletePopup = true">
                  <i class="fas fa-times"></i>
                </button>
                <div class="game-end-icon">
                  <i v-if="isCheckmate" class="fas fa-trophy"></i>
                  <i v-if="isStalemate" class="fas fa-handshake"></i>
                </div>
                <h2 class="game-end-title">
                  <span v-if="isCheckmate">Checkmate!</span>
                  <span v-if="isStalemate">Stalemate!</span>
                </h2>
                <p class="game-end-subtitle">
                  <span v-if="isCheckmate && winner === 'white'">♔ White Wins!</span>
                  <span v-if="isCheckmate && winner === 'black'">♚ Black Wins!</span>
                  <span v-if="isStalemate">It's a Draw!</span>
                </p>
                <div class="game-end-buttons">
                  <button @click="resetPuzzle" class="btn btn-light btn-lg">
                    <i class="fas fa-redo me-2"></i>Play Again
                  </button>
                </div>
              </div>
            </div>

    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { nextTick } from 'vue';
const moveCount = ref(0)
const currentPuzzle = ref(0)
const selectedSquare = ref(null)
const botMessage = ref('Meow! I am C.A.L.I.C.O Chess Assisting and Learning Intelligence for Coaching Oddballs')
const statusMessage = ref('')
const stateconst= ref('alert-info')
const statusClass = ref('')
const statusIcon = ref('')
const currentTurn = ref('white')
const validMoves = ref([])
const gameHistory = ref([])
const isGameActive = ref(true)
const isWhiteInCheck = ref(false)
const isBlackInCheck = ref(false)
const isCheckmate = ref(false)
const isStalemate = ref(false)
const winner = ref(null)
const enPassantTarget = ref(null) // Square where en passant capture is possible
const showPromotionDialog = ref(false)
const promotionSquare = ref(null)
const promotionColor = ref(null)
const currentSolutionIndex = ref(0) // index into current puzzle solution array
const showPuzzleCompletePopup = ref(false)
const botEnabled = ref(true)  // 👈 enables the bot mode
const botSelectedSquare  = ref(null);


const catMessages = {
  start: [
    "Booting up whiskerware... purr-cessing chessboard geometry...",
    "Ready to analyze your every *purr*-move, hooman?",
    "Initializing cat-like reflexes… and maybe a nap timer.",
    "Welcome to the C.A.L.I.C.O system — where intelligence meets fur.",
    "I’ve calculated 3.14 million openings… and one place to nap.",
    "Let’s see if you can handle my purr-algorithmic brilliance.",
    "My sensors detect overconfidence. Let’s fix that with chess.",
    "Starting match… try not to embarrass yourself, flesh unit."
  ],

  mid: [
    "Analyzing... this move smells… *fishy.*",
    "Hold on, I’m recalibrating my whiskers for precision.",
    "Running 42 simulations... and chasing a digital mouse.",
    "Purrr-ocessing your blunder in real time.",
    "Strategic pounce in progress. Please wait for impact.",
    "My neural nets say that was... an interesting choice.",
    "You’re triggering my competitive subroutine — and my tail twitch.",
    "Hmm, 99% chance you didn’t see that coming.",
    "Engaging purr-tactical mode... stealth on.",
    "I’m multitasking: thinking, grooming, and outsmarting you.",
    "That move just got a ‘meow’ out of my algorithm.",
    "I’m not mad, just... disappointed in your pawn structure.",
    "Running sarcasm.exe — you sure that was your *best* move?",
    "I could explain why that was a mistake, but it’s classified.",
    "Processing your position… looks like a hairball of errors."
  ],

  end: [
    "Victory detected. Deploying smug purrs. 🐾",
    "System log: Human underestimation complete.",
    "You fought bravely… for an organic lifeform.",
    "I was merciful this time. Be grateful, hooman.",
    "Oops, my tail misclicked — that’s my story.",
    "Another game, another dataset for my purr-formance log.",
    "Defeat acknowledged… recalibrating pride levels.",
    "Fine, you win. I’ll just shed on your keyboard as revenge.",
    "I told you, cats always land on their feet — and kings on their sides.",
    "Game over. Initiating nap protocol.",
    "You won? Must’ve been a computational anomaly.",
    "Draw achieved. Let’s call it… a balanced fur-niture situation.",
    "Impressive. You’re 3% less blunder-prone than before.",
    "Data collected. Your playing style: chaotic neutral.",
    "Another match? Or shall I reboot and pretend this never happened?",
    "Victory sensors engaged. I am statistically magnificent.",
    "You’ve improved! I might need to upgrade my pawware next time.",
    "Chess complete. Ego intact. C.A.L.I.C.O signing off."
  ],

  random: [
    "Ever notice how knights move like cats? unpredictable and majestic.",
    "Purr-haps if humans had whiskers, you’d spot forks better.",
    "Do I get extra treats for every checkmate?",
    "I’d knock over your king, but my programming forbids vandalism.",
    "My favorite tactic? Cat-tastrophic precision.",
    "Your pawns march… mine stalk.",
    "Thinking is my superpower. Napping is my hobby.",
    "Sometimes I let you take a piece... for enrichment purposes.",
    "Behold the ancient feline technique: the en passant pounce!",
    "You blinked, I captured — classic en passant, stealth edition.",
    "That pawn never saw it coming… meowgical en passant!",
    "Another en passant executed. My code is claw-ver.",
    "My pawns are stealthier than shadows — en passant successful.",
    "That wasn’t luck. That was calculated paw-gression.",
    "I just outsmarted you *and* caught a laser dot. Efficient.",
    "Sneak attack: en passant. Feline reflexes unmatched.",
    "You thought your pawn was safe? Purr-haps not.",
    "One small move for you, one giant pounce for C.A.L.I.C.O.",
    "Warning: overconfidence detected. En passant imminent."
  ]
};

const getMessage = (moveCount) => {
  let type

  if (moveCount <= 5) {
    type = 'start'        // first 2 moves → start messages
  } else if (moveCount <= 20) {
    type = 'mid'     // early-mid game → thinking
  } else if (moveCount <= 30) {
    type = 'end'       // mid game → random fun messages
  } else {
    // late game → mix of strongMove, mistake, or random
    type = 'random'
  }

  // pick a random message from that type
  const messages = catMessages[type] || catMessages.random
  const message = messages[Math.floor(Math.random() * messages.length)]

  return message
}
const getFEN = () => {
  const pieces = boardSquares.value.map(p => p.piece || '1');
  let fen = '';
  for (let i = 0; i < 8; i++) {
    const row = pieces.slice(i * 8, (i + 1) * 8);
    let empty = 0;
    for (const sq of row) {
      if (sq === '1') empty++;
      else {
        if (empty > 0) { fen += empty; empty = 0; }
        fen += sq;
      }
    }
    if (empty > 0) fen += empty;
    if (i < 7) fen += '/';
  }
  fen += ` ${currentTurn.value === 'white' ? 'w' : 'b'} - - 0 1`;
  return fen;
};
const getBotMove = async () => {
  try {
    const fen = getFEN();

    const res = await fetch('https://mute-king-9573.chalekarsuraj.workers.dev/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fen })
    });

    const data = await res.json();
    console.log("Bot move:", data.bestmove);

    if (data.bestmove) {  // <-- use bestmove
      const [fromIndex, toIndex] = parseLAN(data.bestmove);
      if (fromIndex === null || toIndex === null) {
        console.error('Invalid move format:', data.bestmove);
        return;
      }
      botMessage.value = getMessage(moveCount.value);
      makeMove(fromIndex, toIndex, true);

      // Wait until Vue updates boardSquares
      await nextTick();
      botSelectedSquare .value = toIndex;
      setTimeout(() => {
        statusMessage.value = 'White to move';
        botSelectedSquare.value = null;
      }, 1000);
      // Re-run checkmate/stalemate detection
      currentTurn.value = 'white';
      checkGameEnd();

      // If game ended, popup will automatically show
      if (!isGameActive.value || isCheckmate.value || isStalemate.value) {
        console.log('Game over, popup triggered');
        return;
      }

      // Otherwise, switch to white's turn
    } else {
      console.error('No move from API:', data);
      getBotMove(); // Retry
    }
  } catch (err) {
    console.error('Bot move failed:', err);
  }
};

// Reset solution index for the puzzle
const resetSolutionIndex = () => {
  currentSolutionIndex.value = 0
}


// Castling rights tracking
const castlingRights = ref({
  whiteKingMoved: false,
  blackKingMoved: false,
  whiteKingsideRookMoved: false,
  whiteQueensideRookMoved: false,
  blackKingsideRookMoved: false,
  blackQueensideRookMoved: false
})
const puzzles = ref([
  {
    id: 1,
    board: [
      'r', 'n', 'b', 'q', 'k', 'b', 'n', 'r',
      'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p',
      '', '', '', '', '', '', '', '',
      '', '', '', '', '', '', '', '',
      '', '', '', '', '', '', '', '',
      '', '', '', '', '', '', '', '',
      'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P',
      'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'
    ]
  }
])
const boardSquares = ref([])

const currentPuzzleData = computed(() => {
  if (!puzzles.value || puzzles.value.length === 0) return null
  return puzzles.value[currentPuzzle.value] || puzzles.value[0]
})

const initializeBoard = () => {
  const puzzle = currentPuzzleData.value
  if (!puzzle) return // <-- prevents errors if puzzle not loaded yet

  // Initialize the 8x8 board squares
  boardSquares.value = []
  for (let i = 0; i < 64; i++) {
    boardSquares.value.push({
      piece: puzzle.board[i] || null,
      selected: false
    })
  }
  console.log(puzzle)

  // Reset game state
  currentTurn.value = 'white'
  validMoves.value = []
  gameHistory.value = []
  isGameActive.value = true
  isWhiteInCheck.value = false
  isBlackInCheck.value = false
  isCheckmate.value = false
  isStalemate.value = false
  winner.value = null
  enPassantTarget.value = null
  showPromotionDialog.value = false
  promotionSquare.value = null
  promotionColor.value = null

  // Reset castling rights
  castlingRights.value = {
    whiteKingMoved: false,
    blackKingMoved: false,
    whiteKingsideRookMoved: false,
    whiteQueensideRookMoved: false,
    blackKingsideRookMoved: false,
    blackQueensideRookMoved: false
  }
  resetSolutionIndex()
}

watch(puzzles, (newVal) => {
  if (newVal.length > 0) {
    initializeBoard()
  }
})


const isWhitePiece = (piece) => {
  return piece && piece === piece.toUpperCase()
}

const isBlackPiece = (piece) => {
  return piece && piece === piece.toLowerCase()
}

const canPieceMove = (piece) => {
  if (!piece) return false
  if (currentTurn.value === 'white') return isWhitePiece(piece)
  return isBlackPiece(piece)
}

const getSquareFromIndex = (index) => {
  const row = Math.floor(index / 8)
  const col = index % 8
  return { row, col }
}

const getIndexFromSquare = (row, col) => {
  if (row < 0 || row > 7 || col < 0 || col > 7) return -1
  return row * 8 + col
}

const isSquareOccupied = (index) => {
  return boardSquares.value[index] && boardSquares.value[index].piece !== null
}

const isSquareOccupiedByOpponent = (index, isWhite) => {
  const piece = boardSquares.value[index]?.piece
  if (!piece) return false
  return isWhite ? isBlackPiece(piece) : isWhitePiece(piece)
}

const isSquareOccupiedByFriend = (index, isWhite) => {
  const piece = boardSquares.value[index]?.piece
  if (!piece) return false
  return isWhite ? isWhitePiece(piece) : isBlackPiece(piece)
}

// Castling functions
const findKingPosition = (isWhite) => {
  const targetKing = isWhite ? 'K' : 'k'
  for (let i = 0; i < 64; i++) {
    if (boardSquares.value[i]?.piece === targetKing) {
      return i
    }
  }
  return -1
}

const isSquareUnderAttack = (squareIndex, byWhite) => {
  // Check if the square is under attack by any piece of the specified color
  for (let i = 0; i < 64; i++) {
    const piece = boardSquares.value[i]?.piece
    if (!piece) continue

    const pieceIsWhite = isWhitePiece(piece)
    if (pieceIsWhite !== byWhite) continue

    // Get all possible moves for this piece
    const { row, col } = getSquareFromIndex(i)
    let attackMoves = []

    switch (piece.toLowerCase()) {
      case 'p':
        attackMoves.push(...getPawnAttacks(row, col, pieceIsWhite))
        break
      case 'r':
        attackMoves.push(...getRookMoves(row, col, pieceIsWhite))
        break
      case 'n':
        attackMoves.push(...getKnightMoves(row, col, pieceIsWhite))
        break
      case 'b':
        attackMoves.push(...getBishopMoves(row, col, pieceIsWhite))
        break
      case 'q':
        attackMoves.push(...getQueenMoves(row, col, pieceIsWhite))
        break
      case 'k':
        attackMoves.push(...getKingMoves(row, col, pieceIsWhite))
        break
    }

    if (attackMoves.some(move => move.index === squareIndex)) {
      return true
    }
  }
  return false
}

const isKingInCheck = (isWhite) => {
  const kingIndex = findKingPosition(isWhite)
  if (kingIndex === -1) return false
  return isSquareUnderAttack(kingIndex, !isWhite)
}

const hasLegalMoves = (isWhite) => {
  // Check if the player has any legal moves
  for (let i = 0; i < 64; i++) {
    const piece = boardSquares.value[i]?.piece
    if (!piece) continue

    const pieceIsWhite = isWhitePiece(piece)
    if (pieceIsWhite !== isWhite) continue

    const moves = getPossibleMoves(i)
    if (moves.length > 0) {
      return true
    }
  }
  return false
}

const checkGameEnd = () => {
  // Determine whose turn just finished
  const playerWhoJustMovedIsWhite = currentTurn.value === 'black'; // since turn flips after move
  const opponentIsWhite = !playerWhoJustMovedIsWhite;

  // Check which side is now in check
  const whiteInCheck = isKingInCheck(true);
  const blackInCheck = isKingInCheck(false);

  isWhiteInCheck.value = whiteInCheck;
  isBlackInCheck.value = blackInCheck;

  // Check if opponent (side to move) has any legal moves
  const hasLegal = hasLegalMoves(opponentIsWhite);

  if (!hasLegal) {
    // Opponent has no legal moves — checkmate or stalemate
    if (opponentIsWhite && whiteInCheck) {
      // White checkmated
      isCheckmate.value = true;
      winner.value = 'black';
      isGameActive.value = false;
      statusMessage.value = '♚ Checkmate! Black wins!';
      statusClass.value = 'alert-danger';
      statusIcon.value = 'fas fa-trophy';
      console.log('✅ Checkmate detected: White checkmated');
    } else if (!opponentIsWhite && blackInCheck) {
      // Black checkmated
      isCheckmate.value = true;
      winner.value = 'white';
      isGameActive.value = false;
      statusMessage.value = '♔ Checkmate! White wins!';
      statusClass.value = 'alert-danger';
      statusIcon.value = 'fas fa-trophy';
      console.log('✅ Checkmate detected: Black checkmated');
    } else {
      // Stalemate
      isStalemate.value = true;
      isGameActive.value = false;
      statusMessage.value = '🤝 Stalemate! Draw!';
      statusClass.value = 'alert-warning';
      statusIcon.value = 'fas fa-handshake';
      console.log('✅ Stalemate detected');
    }
  } else {
    // Game continues - show check status
    if (whiteInCheck) {
      statusMessage.value = '♔ White King in Check!';
      statusClass.value = 'alert-warning';
      statusIcon.value = 'fas fa-exclamation-triangle';
    } else if (blackInCheck) {
      statusMessage.value = '♚ Black King in Check!';
      statusClass.value = 'alert-warning';
      statusIcon.value = 'fas fa-exclamation-triangle';
    } else {
      statusMessage.value = 'Bots move...';
    }
  }
};

const wouldMoveCauseCheck = (fromIndex, toIndex, isWhite) => {
  // Simulate the move to check if it would leave the king in check
  const piece = boardSquares.value[fromIndex]?.piece
  const capturedPiece = boardSquares.value[toIndex]?.piece

  // Make temporary move
  boardSquares.value[fromIndex].piece = null
  boardSquares.value[toIndex].piece = piece

  // Check if king is in check after this move
  const inCheck = isKingInCheck(isWhite)

  // Undo the move
  boardSquares.value[fromIndex].piece = piece
  boardSquares.value[toIndex].piece = capturedPiece

  return inCheck
}

const getPawnAttacks = (row, col, isWhite) => {
  // Only return attack squares for pawns (diagonal captures)
  const moves = []
  const direction = isWhite ? -1 : 1

  const leftCapture = getIndexFromSquare(row + direction, col - 1)
  if (leftCapture !== -1) {
    moves.push({ index: leftCapture })
  }

  const rightCapture = getIndexFromSquare(row + direction, col + 1)
  if (rightCapture !== -1) {
    moves.push({ index: rightCapture })
  }

  return moves
}

const canCastle = (kingIndex, isWhite, isKingside) => {
  const { row, col } = getSquareFromIndex(kingIndex)

  // Check if king or rook has moved
  if (isWhite) {
    if (castlingRights.value.whiteKingMoved) return false
    if (isKingside && castlingRights.value.whiteKingsideRookMoved) return false
    if (!isKingside && castlingRights.value.whiteQueensideRookMoved) return false
  } else {
    if (castlingRights.value.blackKingMoved) return false
    if (isKingside && castlingRights.value.blackKingsideRookMoved) return false
    if (!isKingside && castlingRights.value.blackQueensideRookMoved) return false
  }

  // Check correct row
  const correctRow = isWhite ? 7 : 0
  if (row !== correctRow) return false

  // Check king is on correct starting square
  if (col !== 4) return false

  // Check rook is in correct position
  const rookCol = isKingside ? 7 : 0
  const rookIndex = getIndexFromSquare(row, rookCol)
  const rookPiece = boardSquares.value[rookIndex]?.piece
  const expectedRook = isWhite ? 'R' : 'r'
  if (rookPiece !== expectedRook) return false

  // Check squares between king and rook are empty
  const startCol = isKingside ? 5 : 1
  const endCol = isKingside ? 6 : 3

  for (let c = startCol; c <= endCol; c++) {
    const squareIndex = getIndexFromSquare(row, c)
    if (isSquareOccupied(squareIndex)) return false
  }

  // Check that king is not in check
  if (isKingInCheck(isWhite)) return false

  // Check that king doesn't pass through check or land in check
  const kingStartCol = 4
  const kingEndCol = isKingside ? 6 : 2
  const direction = isKingside ? 1 : -1

  for (let c = kingStartCol; c !== kingEndCol + direction; c += direction) {
    const squareIndex = getIndexFromSquare(row, c)
    if (isSquareUnderAttack(squareIndex, !isWhite)) {
      return false
    }
  }

  return true
}

const getCastlingMoves = (kingIndex, isWhite) => {
  const moves = []
  const { row } = getSquareFromIndex(kingIndex)

  // Kingside castling
  if (canCastle(kingIndex, isWhite, true)) {
    moves.push({
      index: getIndexFromSquare(row, 6),
      isCastling: true,
      isKingside: true
    })
  }

  // Queenside castling
  if (canCastle(kingIndex, isWhite, false)) {
    moves.push({
      index: getIndexFromSquare(row, 2),
      isCastling: true,
      isKingside: false
    })
  }

  return moves
}

const getPawnMoves = (row, col, isWhite) => {
  const moves = []
  const direction = isWhite ? -1 : 1
  const startRow = isWhite ? 6 : 1

  const oneSquareForward = getIndexFromSquare(row + direction, col)
  if (oneSquareForward !== -1 && !isSquareOccupied(oneSquareForward)) {
    moves.push({ index: oneSquareForward })

    if (row === startRow) {
      const twoSquareForward = getIndexFromSquare(row + (direction * 2), col)
      if (twoSquareForward !== -1 && !isSquareOccupied(twoSquareForward)) {
        moves.push({ index: twoSquareForward, isDoublePawnMove: true })
      }
    }
  }

  const leftCapture = getIndexFromSquare(row + direction, col - 1)
  if (leftCapture !== -1 && isSquareOccupiedByOpponent(leftCapture, isWhite)) {
    moves.push({ index: leftCapture })
  }

  const rightCapture = getIndexFromSquare(row + direction, col + 1)
  if (rightCapture !== -1 && isSquareOccupiedByOpponent(rightCapture, isWhite)) {
    moves.push({ index: rightCapture })
  }

  // En passant captures
  if (enPassantTarget.value !== null) {
    const enPassantRow = Math.floor(enPassantTarget.value / 8)
    const enPassantCol = enPassantTarget.value % 8

    // Check if we can capture en passant
    if (row + direction === enPassantRow) {
      if (col - 1 === enPassantCol) {
        moves.push({ index: enPassantTarget.value, isEnPassant: true })
      }
      if (col + 1 === enPassantCol) {
        moves.push({ index: enPassantTarget.value, isEnPassant: true })
      }
    }
  }

  return moves
}

const getRookMoves = (row, col, isWhite) => {
  const moves = []
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]

  for (const [dRow, dCol] of directions) {
    for (let i = 1; i < 8; i++) {
      const newIndex = getIndexFromSquare(row + dRow * i, col + dCol * i)
      if (newIndex === -1) break

      if (!isSquareOccupied(newIndex)) {
        moves.push({ index: newIndex })
      } else {
        if (isSquareOccupiedByOpponent(newIndex, isWhite)) {
          moves.push({ index: newIndex })
        }
        break
      }
    }
  }

  return moves
}

const getKnightMoves = (row, col, isWhite) => {
  const moves = []
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ]

  for (const [dRow, dCol] of knightMoves) {
    const newIndex = getIndexFromSquare(row + dRow, col + dCol)
    if (newIndex !== -1 && !isSquareOccupiedByFriend(newIndex, isWhite)) {
      moves.push({ index: newIndex })
    }
  }

  return moves
}

const getBishopMoves = (row, col, isWhite) => {
  const moves = []
  const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]]

  for (const [dRow, dCol] of directions) {
    for (let i = 1; i < 8; i++) {
      const newIndex = getIndexFromSquare(row + dRow * i, col + dCol * i)
      if (newIndex === -1) break

      if (!isSquareOccupied(newIndex)) {
        moves.push({ index: newIndex })
      } else {
        if (isSquareOccupiedByOpponent(newIndex, isWhite)) {
          moves.push({ index: newIndex })
        }
        break
      }
    }
  }

  return moves
}

const getQueenMoves = (row, col, isWhite) => {
  return [...getRookMoves(row, col, isWhite), ...getBishopMoves(row, col, isWhite)]
}

const getKingMoves = (row, col, isWhite) => {
  const moves = []
  const kingMoves = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ]

  for (const [dRow, dCol] of kingMoves) {
    const newIndex = getIndexFromSquare(row + dRow, col + dCol)
    if (newIndex !== -1 && !isSquareOccupiedByFriend(newIndex, isWhite)) {
      moves.push({ index: newIndex })
    }
  }

  return moves
}

const getPossibleMoves = (fromIndex) => {
  const piece = boardSquares.value[fromIndex]?.piece
  if (!piece) return []

  const { row, col } = getSquareFromIndex(fromIndex)
  const isWhite = isWhitePiece(piece)
  let moves = []

  switch (piece.toLowerCase()) {
    case 'p':
      moves.push(...getPawnMoves(row, col, isWhite))
      break
    case 'r':
      moves.push(...getRookMoves(row, col, isWhite))
      break
    case 'n':
      moves.push(...getKnightMoves(row, col, isWhite))
      break
    case 'b':
      moves.push(...getBishopMoves(row, col, isWhite))
      break
    case 'q':
      moves.push(...getQueenMoves(row, col, isWhite))
      break
    case 'k':
      moves.push(...getKingMoves(row, col, isWhite))
      // Add castling moves
      moves.push(...getCastlingMoves(fromIndex, isWhite))
      break
  }

  // Filter out moves that would leave the king in check
  const legalMoves = moves.filter(move => !wouldMoveCauseCheck(fromIndex, move.index, isWhite))

  return legalMoves.filter(move => move.index >= 0 && move.index < 64)
}

const highlightPossibleMoves = (fromIndex) => {
  const moves = getPossibleMoves(fromIndex)
  validMoves.value = moves
}

const isValidMove = (index) => {
  return validMoves.value.some(move => move.index === index)
}

const getSquareClass = (index) => {
  const row = Math.floor(index / 8);
  const col = index % 8;
  const isLight = (row + col) % 2 === 0;

  let classes = ['chess-square'];
  classes.push(isLight ? 'light-square' : 'dark-square');

  if (boardSquares.value[index].selected) {
    classes.push('selected-square');
  }

  if (isValidMove(index)) {
    classes.push('valid-move-square');
  }

  // ✅ Highlight the bot's destination square
  if (index === botSelectedSquare.value) {
    classes.push('selected-square');
  }

  // Highlight king if in check
  const piece = boardSquares.value[index]?.piece;
  if (piece === 'K' && isWhiteInCheck.value) {
    classes.push('king-in-check');
  } else if (piece === 'k' && isBlackInCheck.value) {
    classes.push('king-in-check');
  }

  return classes;
};

const getPieceClass = (piece) => {
  if (!piece) return ''
  const isWhite = piece === piece.toUpperCase()
  return isWhite ? 'white-piece' : 'black-piece'
}

const updateCastlingRights = (fromIndex, piece) => {
  if (piece === 'K') {
    castlingRights.value.whiteKingMoved = true
  } else if (piece === 'k') {
    castlingRights.value.blackKingMoved = true
  } else if (piece === 'R') {
    if (fromIndex === 63) castlingRights.value.whiteKingsideRookMoved = true
    if (fromIndex === 56) castlingRights.value.whiteQueensideRookMoved = true
  } else if (piece === 'r') {
    if (fromIndex === 7) castlingRights.value.blackKingsideRookMoved = true
    if (fromIndex === 0) castlingRights.value.blackQueensideRookMoved = true
  }
}

const parseLAN = (move) => {
  const m = move.match(/[a-h][1-8][a-h][1-8][qrbn]?/i);
  if (!m) return [null, null, null];

  const lan = m[0];
  const files = "abcdefgh";
  const fromCol = files.indexOf(lan[0]);
  const fromRow = 8 - parseInt(lan[1]);
  const toCol = files.indexOf(lan[2]);
  const toRow = 8 - parseInt(lan[3]);
  const promotion = lan[4] || null; // Get promotion piece if exists
  
  return [fromRow * 8 + fromCol, toRow * 8 + toCol, promotion];
};

const makeMove = (fromIndex, toIndex, isAuto = false) => {
  const piece = boardSquares.value[fromIndex]?.piece
  if (!piece) return

  const capturedPiece = boardSquares.value[toIndex]?.piece
  const isWhite = isWhitePiece(piece)

  // Check if move leaves king in check (skip for auto moves)
  if (!isAuto && wouldMoveCauseCheck(fromIndex, toIndex, isWhite)) {
    statusMessage.value = '⚠️ Illegal move! This would leave your king in check.'
    statusClass.value = 'alert-danger'
    statusIcon.value = 'fas fa-ban'
    deselectPiece()
    return
  }

  // Update castling rights
  updateCastlingRights(fromIndex, piece)

  // Clear previous en passant target
  const previousEnPassant = enPassantTarget.value
  enPassantTarget.value = null

  const moveData = validMoves.value.find(move => move.index === toIndex)

  // Handle en passant
  if (moveData?.isEnPassant) {
    const direction = isWhite ? 1 : -1
    const capturedPawnIndex = toIndex + direction * 8
    boardSquares.value[capturedPawnIndex].piece = null
  }
  // Update castling rights for captured rooks
  if (capturedPiece === 'R') {
    if (toIndex === 63) castlingRights.value.whiteKingsideRookMoved = true
    if (toIndex === 56) castlingRights.value.whiteQueensideRookMoved = true
  } else if (capturedPiece === 'r') {
    if (toIndex === 7) castlingRights.value.blackKingsideRookMoved = true
    if (toIndex === 0) castlingRights.value.blackQueensideRookMoved = true
  }
  // Handle castling
  if (moveData?.isCastling) {
    const { row } = getSquareFromIndex(fromIndex)
    if (moveData.isKingside) {
      const rookFrom = getIndexFromSquare(row, 7)
      const rookTo = getIndexFromSquare(row, 5)
      boardSquares.value[rookTo].piece = boardSquares.value[rookFrom].piece
      boardSquares.value[rookFrom].piece = null
    } else {
      const rookFrom = getIndexFromSquare(row, 0)
      const rookTo = getIndexFromSquare(row, 3)
      boardSquares.value[rookTo].piece = boardSquares.value[rookFrom].piece
      boardSquares.value[rookFrom].piece = null
    }
  }

  // Normal move
  boardSquares.value[toIndex].piece = piece
  boardSquares.value[fromIndex].piece = null

  // Double pawn move for en passant
  if (piece.toLowerCase() === 'p' && moveData?.isDoublePawnMove) {
    const direction = isWhite ? 1 : -1
    enPassantTarget.value = toIndex + direction * 8
  }

  // Handle promotion for user move
  // Handle promotion
  const targetRow = Math.floor(toIndex / 8)
  if (piece.toLowerCase() === 'p' && (targetRow === 0 || targetRow === 7)) {
    if (isAuto) {
      // Auto-promote to queen for bot moves
      const promotedPiece = isWhite ? 'Q' : 'q'
      boardSquares.value[toIndex].piece = promotedPiece
    } else {
      // Show dialog for user moves
      showPromotionDialog.value = true
      promotionSquare.value = toIndex
      promotionColor.value = isWhite
      isGameActive.value = false
      statusMessage.value = '👑 Choose a piece for promotion!'
      statusClass.value = 'alert-info'
      statusIcon.value = 'fas fa-crown'
      return
    }
  }

  // Record move
  gameHistory.value.push({
    from: fromIndex,
    to: toIndex,
    piece,
    captured: capturedPiece,
    turn: currentTurn.value,
    castling: moveData?.isCastling || false,
    enPassant: moveData?.isEnPassant || false
  })

  // Clear selection
  deselectPiece()
  moveCount.value++
  // Switch turn if not auto move
  if (!isAuto) {
    currentTurn.value = currentTurn.value === 'white' ? 'black' : 'white'
    
    // Check for game end immediately after user move
    checkGameEnd()
    // If game is still active, trigger bot move
    if (botEnabled.value && currentTurn.value === 'black' && isGameActive.value) {
      setTimeout(() => getBotMove(), 700)
    }
  }
  // For auto moves, don't call checkGameEnd here - it's called in getBotMove
}

const handleSquareClick = (index) => {
  if (!isGameActive.value || showPromotionDialog.value) return

  const clickedSquare = boardSquares.value[index]

  if (selectedSquare.value === null) {
    if (clickedSquare.piece && canPieceMove(clickedSquare.piece)) {
      selectedSquare.value = index
      clickedSquare.selected = true
      highlightPossibleMoves(index)

      statusMessage.value = `${currentTurn.value === 'white' ? 'White' : 'Black'} to move`
      statusClass.value = 'alert-info'
      statusIcon.value = 'fas fa-chess'
    } else if (clickedSquare.piece) {
      statusMessage.value = `It's ${currentTurn.value}'s turn!`
      statusClass.value = 'alert-warning'
      statusIcon.value = 'fas fa-exclamation-triangle'
    }
  } else {
    if (selectedSquare.value === index) {
      deselectPiece()
    } else if (isValidMove(index)) {
      makeMove(selectedSquare.value, index)
    } else if (clickedSquare.piece && canPieceMove(clickedSquare.piece)) {
      deselectPiece()
      selectedSquare.value = index
      clickedSquare.selected = true
      highlightPossibleMoves(index)
    } else {
      statusMessage.value = 'Invalid move! Try again.'
      statusClass.value = 'alert-danger'
      statusIcon.value = 'fas fa-times'
    }
  }
}

const deselectPiece = () => {
  if (selectedSquare.value !== null) {
    boardSquares.value[selectedSquare.value].selected = false
  }
  selectedSquare.value = null
  validMoves.value = []
}

const resetPuzzle = () => {
  deselectPiece()
  initializeBoard()
  statusMessage.value = 'Play again! White to move.'
  statusClass.value = 'alert-info'
  statusIcon.value = 'fas fa-undo'
  showPuzzleCompletePopup.value = false
}

const promotePawn = (piece) => {
  if (promotionSquare.value === null) return

  const promotedPiece = promotionColor.value ? piece.toUpperCase() : piece.toLowerCase()
  boardSquares.value[promotionSquare.value].piece = promotedPiece

  showPromotionDialog.value = false
  isGameActive.value = true

  statusMessage.value = `Pawn promoted to ${piece.toUpperCase()}! 👑`
  statusClass.value = 'alert-success'
  statusIcon.value = 'fas fa-crown'

  // Clear promotion data
  promotionSquare.value = null
  promotionColor.value = null

  // Switch turns
  currentTurn.value = currentTurn.value === 'white' ? 'black' : 'white'

  // Check for checkmate or stalemate after promotion
  checkGameEnd()
  if (botEnabled.value && currentTurn.value === 'black' && isGameActive.value) {
     setTimeout(() => getBotMove(), 700)
  }
}

onMounted(() => {
  document.title = 'IISER-TVM Chess Club - Bot'
  initializeBoard()
  statusMessage.value = 'White to move. Select a piece to start!'
  statusClass.value = 'alert-info'
  statusIcon.value = 'fas fa-chess'
})

</script>


<style scoped>

.status-image {
  width: 96px;
  height: 96px;
  object-fit: contain; /* ensures it doesn't stretch */
}

.popup-close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  transition: color 0.2s ease;
}

.popup-close-btn:hover {
  color: #333;
}

/* ==================== GLOBAL STYLES ==================== */
.bot-page {
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%);
  color: #e0e0e0;
  min-height: 100vh;
  margin-left: 200px;
  margin-top: -76px;
  transition: margin-left 0.3s ease;
  padding: 2rem 1rem;
}

/* ==================== PUZZLE LAYOUT ==================== */
.bot-content {
  max-width: 1400px;
  margin: 0 auto;
}

.bot-container {
  background: rgba(26, 26, 46, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 1.25rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 193, 7, 0.1);
}

.bot-layout {
  display: flex;
  gap: 3rem;
  align-items: flex-start;
}

/* ==================== CHESS BOARD ==================== */
.chess-container {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  width: 100%;
  justify-content: center;
}

.board-wrapper {
  position: relative;
  display: inline-block;
  padding-right: 50px;
  padding-bottom: 50px;
}

.chess-board {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  width: 550px;
  height: 550px;
  border: 2px solid #746f6a;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
}

.chess-square {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.light-square {
  background: #f0d9b5;
}

.dark-square {
  background: #b58863;
}

.chess-square:hover {
  background-color: rgba(255, 255, 0, 0.3) !important;
}

.selected-square {
  box-shadow: inset 0 0 0 3px #2e7d32 !important;
  background-color: #7fc97f !important;
}

.valid-move-square {
  cursor: pointer;
}

.valid-move-square:hover {
  background-color: rgba(127, 201, 127, 0.3) !important;
}

.move-indicator {
  position: absolute;
  width: 30%;
  height: 30%;
  background-color: rgba(127, 201, 127, 0.6);
  border-radius: 50%;
  pointer-events: none;
}

.king-in-check {
  background-color: rgba(255, 0, 0, 0.4) !important;
  box-shadow: inset 0 0 0 3px #d32f2f !important;
  animation: checkPulse 1s ease-in-out infinite;
}

@keyframes checkPulse {
  0%, 100% {
    box-shadow: inset 0 0 0 3px #d32f2f;
  }
  50% {
    box-shadow: inset 0 0 0 5px #ff5252;
  }
}

/* ==================== CHESS PIECES ==================== */
.chess-piece {
  width: 100%;
  height: 100%;
  background-size: 85%;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
  transition: none;
}

.chess-piece[data-piece="K"] {
  background-image: url("https://lichess1.org/assets/piece/merida/wK.svg");
}

.chess-piece[data-piece="Q"] {
  background-image: url("https://lichess1.org/assets/piece/merida/wQ.svg");
}

.chess-piece[data-piece="R"] {
  background-image: url("https://lichess1.org/assets/piece/merida/wR.svg");
}

.chess-piece[data-piece="B"] {
  background-image: url("https://lichess1.org/assets/piece/merida/wB.svg");
}

.chess-piece[data-piece="N"] {
  background-image: url("https://lichess1.org/assets/piece/merida/wN.svg");
}

.chess-piece[data-piece="P"] {
  background-image: url("https://lichess1.org/assets/piece/merida/wP.svg");
}

.chess-piece[data-piece="k"] {
  background-image: url("https://lichess1.org/assets/piece/merida/bK.svg");
}

.chess-piece[data-piece="q"] {
  background-image: url("https://lichess1.org/assets/piece/merida/bQ.svg");
}

.chess-piece[data-piece="r"] {
  background-image: url("https://lichess1.org/assets/piece/merida/bR.svg");
}

.chess-piece[data-piece="b"] {
  background-image: url("https://lichess1.org/assets/piece/merida/bB.svg");
}

.chess-piece[data-piece="n"] {
  background-image: url("https://lichess1.org/assets/piece/merida/bN.svg");
}

.chess-piece[data-piece="p"] {
  background-image: url("https://lichess1.org/assets/piece/merida/bP.svg");
}

/* ==================== CONTROLS ==================== */
.controls-card {
  flex: 0.5 0 350px;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.9), rgba(42, 42, 62, 0.9));
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 193, 7, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.puzzle-info-card {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(138, 43, 226, 0.1));
  border: 2px solid rgba(255, 193, 7, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.puzzle-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffc107;
  margin: 0;
  text-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
}

.puzzle-title i {
  color: #8a2be2;
  filter: drop-shadow(0 2px 6px rgba(138, 43, 226, 0.5));
}

.controls-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #e0e0e0;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.control-buttons-vertical {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-control {
  width: 100%;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

.btn-control::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.btn-control:hover::before {
  transform: translateX(100%);
}

.btn-reset {
  background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.btn-reset:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.5);
}

.btn-hint {
  background: linear-gradient(135deg, #ffc107, #ffb300);
  color: #000;
  box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
}

.btn-hint:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.5);
}
.btn-sol {
  background: linear-gradient(135deg, #28a745, #218838);
  color: #fff;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
  transition: all 0.2s ease;
}

.btn-sol:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(40, 167, 69, 0.5);
}

.btn-check {
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.btn-check:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.5);
}

.btn-next {
  background: linear-gradient(135deg, #8a2be2, #9b59b6);
  color: white;
  box-shadow: 0 4px 15px rgba(138, 43, 226, 0.3);
}

.btn-next:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(138, 43, 226, 0.5);
}
.btn-back {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
}

.btn-back:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(52, 152, 219, 0.5);
}

/* ==================== STATUS MESSAGES ==================== */
.status-message {
  margin-bottom: 1.5rem;
}

.alert {
  padding: 1rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  backdrop-filter: blur(10px);
  border: 2px solid;
  animation: slideIn 0.4s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.alert-success {
  background: rgba(76, 175, 80, 0.15);
  border-color: rgba(76, 175, 80, 0.4);
  color: #4caf50;
}

.alert-info {
  background: rgba(33, 150, 243, 0.15);
  border-color: rgba(33, 150, 243, 0.4);
  color: #2196f3;
}

.alert-warning {
  background: rgba(255, 193, 7, 0.15);
  border-color: rgba(255, 193, 7, 0.4);
  color: #ffc107;
}

.alert-danger {
  background: rgba(244, 67, 54, 0.15);
  border-color: rgba(244, 67, 54, 0.4);
  color: #f44336;
}

/* ==================== PROMOTION DIALOG ==================== */
.promotion-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease;
}

.promotion-dialog {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(42, 42, 62, 0.95));
  backdrop-filter: blur(20px);
  padding: 2.5rem;
  border-radius: 24px;
  border: 2px solid rgba(255, 193, 7, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
  animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.promotion-dialog h3 {
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 2rem;
  color: #ffc107;
  text-shadow: 0 2px 10px rgba(255, 193, 7, 0.4);
}

.promotion-pieces {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

.promotion-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 193, 7, 0.3);
  border-radius: 16px;
  padding: 1.5rem 1.25rem;
  min-width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.promotion-btn:hover {
  transform: translateY(-8px) scale(1.08);
  background: rgba(255, 193, 7, 0.15);
  border-color: rgba(255, 193, 7, 0.6);
  box-shadow: 0 10px 30px rgba(255, 193, 7, 0.3);
}

.promotion-piece {
  font-size: 3.5rem;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
}

.promotion-btn span {
  color: #e0e0e0;
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ==================== GAME END DIALOG ==================== */
.game-end-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  backdrop-filter: blur(10px);
  animation: fadeIn 0.5s ease;
}

.game-end-dialog {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(42, 42, 62, 0.95));
  backdrop-filter: blur(20px);
  border-radius: 28px;
  padding: 3rem 2.5rem;
  text-align: center;
  max-width: 500px;
  width: 90%;
  border: 2px solid rgba(255, 193, 7, 0.3);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.8);
  animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.game-end-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 20px rgba(255, 193, 7, 0.5));
  }
  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 30px rgba(255, 193, 7, 0.8));
  }
}

.game-end-title {
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #ffc107, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.game-end-subtitle {
  font-size: 1.4rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2.5rem;
  font-weight: 600;
}

.game-end-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.game-end-buttons .btn {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 700;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.game-end-buttons .btn-light {
  background: linear-gradient(135deg, #e0e0e0, #bdbdbd);
  color: #000;
}

.game-end-buttons .btn-warning {
  background: linear-gradient(135deg, #ffc107, #ff9800);
  color: #000;
}

.game-end-buttons .btn:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

/* ==================== RESPONSIVE DESIGN ==================== */
@media (max-width: 1200px) {
  .puzzle-layout {
    flex-direction: column;
    align-items: center;
  }

  .controls-card {
    flex: none;
    width: 100%;
    max-width: 560px;
  }

  .control-buttons-vertical {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .puzzles-page {
    margin-left: 0;
    padding: 1rem 0.5rem;
    padding-top: 70px;
  }

  .puzzle-container {
    padding: 1rem;
    border-radius: 16px;
  }

  .puzzle-layout {
    gap: 1.5rem;
  }

  .chess-board {
    width: min(90vw, 420px);
    height: min(90vw, 420px);
  }

  .board-wrapper {
    padding-right: 35px;
    padding-bottom: 35px;
  }

  .controls-card {
    padding: 1.25rem;
    border-radius: 16px;
    max-width: min(90vw, 420px);
  }

  .puzzle-info-card {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .puzzle-title {
    font-size: 1.25rem;
  }

  .controls-title {
    font-size: 1rem;
  }

  .btn-control {
    padding: 0.875rem 1.25rem;
    font-size: 0.9rem;
    border-radius: 10px;
  }
}

@media (max-width: 576px) {
  .puzzles-page {
    padding: 0.75rem 0.5rem;
    padding-top: 70px;
  }

  .puzzle-container {
    padding: 0.75rem;
    border-radius: 12px;
  }

  .chess-board {
    width: calc(100vw - 2rem);
    height: calc(100vw - 2rem);
    max-width: 360px;
    max-height: 360px;
    border: 1px solid #746f6a;
  }

  .board-wrapper {
    padding-right: 30px;
    padding-bottom: 30px;
  }

  .controls-card {
    padding: 1rem;
  }

  .puzzle-info-card {
    padding: 0.875rem;
  }

  .puzzle-title {
    font-size: 1.1rem;
  }

  .controls-title {
    font-size: 0.95rem;
    margin-bottom: 0.75rem;
  }

  .control-buttons-vertical {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .btn-control {
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
    border-radius: 8px;
  }

  .move-indicator {
    width: 25%;
    height: 25%;
  }

  .promotion-dialog {
    padding: 1.5rem;
    border-radius: 16px;
    margin: 1rem;
    max-width: calc(100vw - 2rem);
  }

  .promotion-dialog h3 {
    font-size: 1.25rem;
    margin-bottom: 1.25rem;
  }

  .promotion-pieces {
    gap: 0.75rem;
  }

  .promotion-btn {
    min-width: 70px;
    padding: 1rem 0.75rem;
    border-radius: 12px;
  }

  .promotion-piece {
    font-size: 2.25rem;
  }

  .promotion-btn span {
    font-size: 0.85rem;
  }

  .game-end-dialog {
    padding: 2rem 1.5rem;
    border-radius: 20px;
    margin: 1rem;
  }

  .game-end-icon {
    font-size: 3.5rem;
    margin-bottom: 1rem;
  }

  .game-end-title {
    font-size: 1.75rem;
  }

  .game-end-subtitle {
    font-size: 1.1rem;
    margin-bottom: 1.75rem;
  }

  .game-end-buttons {
    flex-direction: column;
    width: 100%;
  }

  .game-end-buttons .btn {
    width: 100%;
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }

  .alert {
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
    border-radius: 10px;
  }
}

@media (max-width: 400px) {
  .chess-board {
    width: calc(100vw - 1.5rem);
    height: calc(100vw - 1.5rem);
    max-width: 320px;
    max-height: 320px;
  }

  .board-wrapper {
    padding-right: 25px;
    padding-bottom: 25px;
  }

  .puzzle-title {
    font-size: 1rem;
  }

  .btn-control {
    padding: 0.625rem 0.875rem;
    font-size: 0.8rem;
  }

  .promotion-btn {
    min-width: 60px;
    padding: 0.875rem 0.5rem;
  }

  .promotion-piece {
    font-size: 2rem;
  }

  .promotion-btn span {
    font-size: 0.75rem;
  }
}

/* ==================== UTILITY CLASSES ==================== */
.me-2 {
  margin-right: 0.5rem;
}

.mb-3 {
  margin-bottom: 1rem;
}

.text-center {
  text-align: center;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>