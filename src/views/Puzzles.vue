<template>
  <div class="puzzles-page">
    <!-- Hero Section -->
    <section class="puzzles-hero position-relative overflow-hidden">
      <div class="hero-background"></div>
      <div class="chess-pattern-bg"></div>
      <div class="container position-relative z-3">
        <div class="row justify-content-center text-center">
          <div class="col-lg-8">
            <div class="hero-content py-5">
              <div class="hero-badge mb-4">
                <span class="badge bg-gradient-warning px-4 py-3 fs-6 rounded-pill">
                  <i class="fas fa-brain me-2"></i>Mind Sharpening Challenges
                </span>
              </div>
              <h1 class="hero-title mb-4">
                <span class="chess-icon">🧩</span>
                <span class="text-glow">Chess Puzzles</span>
              </h1>
              <p class="hero-subtitle mb-4">
                Test your tactical prowess with mind-bending puzzles. Every move matters, every solution reveals mastery.
              </p>
              <div class="hero-stats d-flex justify-content-center gap-4 flex-wrap">
                <div class="stat-item">
                  <div class="stat-number">{{ currentPuzzle + 1 }}</div>
                  <div class="stat-label">Current Puzzle</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ puzzlesSolved }}</div>
                  <div class="stat-label">Solved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Puzzle Content -->
    <!-- Puzzle Content -->
    <section class="puzzle-content py-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-10">
            <!-- Puzzle Info -->
            <div class="puzzle-info-card mb-4">
              <div class="row align-items-center">
                <!-- Status Message -->
                <div v-if="statusMessage" class="status-message mt-3 text-center">
                  <div :class="statusClass" class="alert">
                    <i :class="statusIcon" class="me-2"></i>{{ statusMessage }}
                  </div>
                </div>
              </div>
              
              <!-- Chess Board Container -->
              <div class="chess-container">
                <div class="board-wrapper">
                  <div class="chess-board" ref="chessBoard">
                    <div 
                      v-for="(square, index) in boardSquares" 
                      :key="index"
                      :class="getSquareClass(index)"
                      @click="handleSquareClick(index)"
                    >
                      <div v-if="square.piece" :class="getPieceClass(square.piece)" class="chess-piece" :data-piece="square.piece">
                      </div>
                      <!-- Valid move indicator -->
                      <div v-if="isValidMove(index)" class="move-indicator"></div>
                    </div>
                  </div>
                  
                  <!-- Board Coordinates -->
                  <div class="board-coordinates">
                    <div class="files">
                      <span v-for="file in files" :key="file" class="file-label">{{ file }}</span>
                    </div>
                    <div class="ranks">
                      <span v-for="rank in ranks" :key="rank" class="rank-label">{{ rank }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
<div v-if="showPromotionDialog" class="promotion-dialog-overlay">
              <div class="promotion-dialog">
                <h3 class="text-center mb-3">Choose Promotion Piece</h3>
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
            <div v-if="isCheckmate || isStalemate" class="game-end-overlay">
              <div class="game-end-dialog">
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
                  <button @click="nextPuzzle" class="btn btn-warning btn-lg">
                    <i class="fas fa-arrow-right me-2"></i>Next Puzzle
                  </button>
                </div>
              </div>
            </div>

            <!-- Puzzle Controls Section -->
            <div class="controls-section mt-4">
              <div class="puzzle-controls">
                <div class="control-buttons d-flex justify-content-center gap-3 flex-wrap">
                  <button class="btn btn-outline-warning" @click="resetPuzzle">
                    <i class="fas fa-undo me-2"></i>Reset
                  </button>
                  <button class="btn btn-outline-info" @click="showHint">
                    <i class="fas fa-lightbulb me-2"></i>Hint
                  </button>
                  <button class="btn btn-outline-success" @click="checkSolution">
                    <i class="fas fa-check me-2"></i>Check
                  </button>
                  <button class="btn btn-warning" @click="nextPuzzle">
                    <i class="fas fa-arrow-right me-2"></i>Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const currentPuzzle = ref(0)
const puzzlesSolved = ref(0)
const selectedSquare = ref(null)
const statusMessage = ref('')
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

// Castling rights tracking
const castlingRights = ref({
  whiteKingMoved: false,
  blackKingMoved: false,
  whiteKingsideRookMoved: false,
  whiteQueensideRookMoved: false,
  blackKingsideRookMoved: false,
  blackQueensideRookMoved: false
})

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const ranks = [8, 7, 6, 5, 4, 3, 2, 1]
const puzzles = ref([])
const boardSquares = ref([])

const currentPuzzleData = computed(() => {
  if (!puzzles.value || puzzles.value.length === 0) return null
  return puzzles.value[currentPuzzle.value] || puzzles.value[0]
})

const fenToBoardArray = (fen) => {
  const board = []
  const rows = fen.split(" ")[0].split("/")
  for (let row of rows) {
    for (let char of row) {
      if (!isNaN(char)) {
        for (let i = 0; i < parseInt(char); i++) board.push("")
      } else {
        board.push(char)
      }
    }
  }
  return board
}


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
}
watch(puzzles, (newVal) => {
  if (newVal.length > 0) {
    initializeBoard()
  }
})

const loadPuzzlesFromCSV = async () => {
  const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQyFaAasaUsySp8rSfkT_zmqo4fKdxYc8Fi7WZeIbpRvRGT2aiNM5rNepOy9rWHjzL0xvzNUz2gfrXo/pub?output=csv"
  const res = await fetch(url)
  const text = await res.text()

  const rows = text.split("\n").map(r => r.split(","))
  const headers = rows[0]

  puzzles.value = rows.slice(1).map(r => {
    let obj = {}
    headers.forEach((h, i) => obj[h.trim()] = r[i]?.trim())
    obj.board = fenToBoardArray(obj.fen)
    obj.solution = obj.solution?.split(" ").map(s => s.trim())
    return obj
  })
}

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
  const whiteInCheck = isKingInCheck(true)
  const blackInCheck = isKingInCheck(false)
  
  isWhiteInCheck.value = whiteInCheck
  isBlackInCheck.value = blackInCheck
  
  // Check if current player has legal moves
  const currentPlayerIsWhite = currentTurn.value === 'white'
  const hasLegal = hasLegalMoves(currentPlayerIsWhite)
  
  if (!hasLegal) {
    if (currentPlayerIsWhite && whiteInCheck) {
      // White is checkmated
      isCheckmate.value = true
      winner.value = 'black'
      isGameActive.value = false
      statusMessage.value = '♚ Checkmate! Black wins!'
      statusClass.value = 'alert-danger'
      statusIcon.value = 'fas fa-trophy'
    } else if (!currentPlayerIsWhite && blackInCheck) {
      // Black is checkmated
      isCheckmate.value = true
      winner.value = 'white'
      isGameActive.value = false
      statusMessage.value = '♔ Checkmate! White wins!'
      statusClass.value = 'alert-danger'
      statusIcon.value = 'fas fa-trophy'
    } else {
      // Stalemate
      isStalemate.value = true
      isGameActive.value = false
      statusMessage.value = '🤝 Stalemate! Draw!'
      statusClass.value = 'alert-warning'
      statusIcon.value = 'fas fa-handshake'
    }
  } else {
    // Game continues - show check status
    if (whiteInCheck) {
      statusMessage.value += ' - White King in Check! ♔'
      statusClass.value = 'alert-warning'
      statusIcon.value = 'fas fa-exclamation-triangle'
    } else if (blackInCheck) {
      statusMessage.value += ' - Black King in Check! ♚'
      statusClass.value = 'alert-warning'
      statusIcon.value = 'fas fa-exclamation-triangle'
    }
  }
}

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
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
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
  const row = Math.floor(index / 8)
  const col = index % 8
  const isLight = (row + col) % 2 === 0
  
  let classes = ['chess-square']
  classes.push(isLight ? 'light-square' : 'dark-square')
  
  if (boardSquares.value[index].selected) {
    classes.push('selected-square')
  }
  
  if (isValidMove(index)) {
    classes.push('valid-move-square')
  }
  
  // Highlight king if in check
  const piece = boardSquares.value[index]?.piece
  if (piece === 'K' && isWhiteInCheck.value) {
    classes.push('king-in-check')
  } else if (piece === 'k' && isBlackInCheck.value) {
    classes.push('king-in-check')
  }
  
  return classes
}

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

const makeMove = (fromIndex, toIndex) => {
  const piece = boardSquares.value[fromIndex].piece
  const capturedPiece = boardSquares.value[toIndex].piece
  
  // Find if this is a castling move
  const moveData = validMoves.value.find(move => move.index === toIndex)
  
  // Verify the move doesn't leave own king in check (should already be filtered, but double-check)
  const isWhite = isWhitePiece(piece)
  if (wouldMoveCauseCheck(fromIndex, toIndex, isWhite)) {
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
  
  // Handle en passant capture
  if (moveData?.isEnPassant) {
    const direction = isWhite ? 1 : -1
    const capturedPawnIndex = toIndex + (direction * 8)
    const capturedPawn = boardSquares.value[capturedPawnIndex].piece
    
    // Move pawn
    boardSquares.value[fromIndex].piece = null
    boardSquares.value[toIndex].piece = piece
    // Remove captured pawn
    boardSquares.value[capturedPawnIndex].piece = null
    
    statusMessage.value = `En passant! ${piece.toUpperCase()} captures ${capturedPawn.toUpperCase()}`
    statusClass.value = 'alert-success'
    statusIcon.value = 'fas fa-chess-pawn'
  }
  // Handle castling
  else if (moveData?.isCastling) {
    const { row } = getSquareFromIndex(fromIndex)
    
    // Move king
    boardSquares.value[fromIndex].piece = null
    boardSquares.value[toIndex].piece = piece
    
    // Move rook
    if (moveData.isKingside) {
      const rookFromIndex = getIndexFromSquare(row, 7)
      const rookToIndex = getIndexFromSquare(row, 5)
      const rook = boardSquares.value[rookFromIndex].piece
      boardSquares.value[rookFromIndex].piece = null
      boardSquares.value[rookToIndex].piece = rook
      
      statusMessage.value = '♔ Castled kingside! O-O'
      statusClass.value = 'alert-success'
      statusIcon.value = 'fas fa-chess-rook'
    } else {
      const rookFromIndex = getIndexFromSquare(row, 0)
      const rookToIndex = getIndexFromSquare(row, 3)
      const rook = boardSquares.value[rookFromIndex].piece
      boardSquares.value[rookFromIndex].piece = null
      boardSquares.value[rookToIndex].piece = rook
      
      statusMessage.value = '♔ Castled queenside! O-O-O'
      statusClass.value = 'alert-success'
      statusIcon.value = 'fas fa-chess-rook'
    }
  }
  // Normal move
  else {
    // Check for double pawn move (for en passant setup)
    if (piece.toLowerCase() === 'p' && moveData?.isDoublePawnMove) {
      const direction = isWhite ? 1 : -1
      enPassantTarget.value = toIndex + (direction * 8)
    }
    
    boardSquares.value[fromIndex].piece = null
    boardSquares.value[toIndex].piece = piece
    
    // Check for pawn promotion
    const targetRow = Math.floor(toIndex / 8)
    if (piece.toLowerCase() === 'p' && (targetRow === 0 || targetRow === 7)) {
      // Show promotion dialog
      showPromotionDialog.value = true
      promotionSquare.value = toIndex
      promotionColor.value = isWhite
      isGameActive.value = false
      
      statusMessage.value = '👑 Choose a piece for promotion!'
      statusClass.value = 'alert-info'
      statusIcon.value = 'fas fa-crown'
      
      // Don't continue with rest of move logic until promotion is chosen
      return
    }
    
    if (capturedPiece) {
      statusMessage.value = `${piece.toUpperCase()} captures ${capturedPiece.toUpperCase()}!`
      statusClass.value = 'alert-success'
      statusIcon.value = 'fas fa-times'
    } else {
      statusMessage.value = `${currentTurn.value === 'white' ? 'Black' : 'White'} to move`
      statusClass.value = 'alert-info'
      statusIcon.value = 'fas fa-chess'
    }
  }
  
  // Record move in history
  gameHistory.value.push({
    from: fromIndex,
    to: toIndex,
    piece: piece,
    captured: capturedPiece,
    turn: currentTurn.value,
    castling: moveData?.isCastling || false,
    enPassant: moveData?.isEnPassant || false
  })
  
  // Clear selection and highlights
  deselectPiece()
  
  // Switch turns
  currentTurn.value = currentTurn.value === 'white' ? 'black' : 'white'
  
  // Check for checkmate or stalemate
  checkGameEnd()
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
  statusMessage.value = 'Puzzle reset! White to move.'
  statusClass.value = 'alert-info'
  statusIcon.value = 'fas fa-undo'
}

const showHint = () => {
  const solution = currentPuzzleData.value.solution[0]
  statusMessage.value = `Hint: Try ${solution}`
  statusClass.value = 'alert-info'
  statusIcon.value = 'fas fa-lightbulb'
}

const checkSolution = () => {
  statusMessage.value = 'Good move! Keep going...'
  statusClass.value = 'alert-success'
  statusIcon.value = 'fas fa-check-circle'
}

const nextPuzzle = () => {
  if (currentPuzzle.value < puzzles.value.length - 1) {
    currentPuzzle.value++
  } else {
    currentPuzzle.value = 0
  }
  deselectPiece()
  initializeBoard()
  statusMessage.value = 'New puzzle loaded! White to move.'
  statusClass.value = 'alert-success'
  statusIcon.value = 'fas fa-puzzle-piece'
  puzzlesSolved.value++
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
}

onMounted(() => {
  loadPuzzlesFromCSV()
  document.title = 'IISER-TVM Chess Club - Puzzles'
  initializeBoard()
  statusMessage.value = 'White to move. Select a piece to start!'
  statusClass.value = 'alert-info'
  statusIcon.value = 'fas fa-chess'
})
</script>

<style scoped>

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.game-end-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  animation: fadeIn 0.5s ease-in-out;
  backdrop-filter: blur(6px);
}

.game-end-dialog {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border-radius: 1.25rem;
  padding: 2.5rem 2rem;
  text-align: center;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 15px 50px rgba(0,0,0,0.6);
  animation: scaleIn 0.5s ease;
}

.game-end-icon {
  font-size: 4.5rem;
  margin-bottom: 1rem;
  color: #fff;
  text-shadow: 0 6px 15px rgba(0,0,0,0.5);
  animation: bounce 1.5s ease-in-out infinite;
}

.game-end-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
  color: #fff;
}

.game-end-subtitle {
  font-size: 1.2rem;
  color: rgba(255,255,255,0.9);
  margin-bottom: 2rem;
}

.game-end-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.game-end-buttons .btn {
  background: linear-gradient(135deg, #fa3239 0%, #fd592c 100%);
  border: none;
  border-radius: 0.75rem;
  padding: 0.75rem 1.8rem;
  font-weight: 600;
  cursor: pointer;
  color: #333;
  transition: all 0.3s ease;
}

.game-end-buttons .btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
}
@keyframes scaleIn {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}
.move-indicator {
  position: absolute;
  width: 30%;
  height: 30%;
  background-color: rgba(127, 201, 127, 0.6);
  border-radius: 50%;
  pointer-events: none;
}

.valid-move-square {
  cursor: pointer;
}

.valid-move-square:hover {
  background-color: rgba(127, 201, 127, 0.3) !important;
}

.selected-square {
  box-shadow: inset 0 0 0 3px #2e7d32 !important;
  background-color: #7fc97f !important;
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
.promotion-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(6px);
  animation: fadeIn 0.3s ease;
}

.promotion-dialog {
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(12px);
  padding: 2rem 2.5rem;
  border-radius: 1rem;
  text-align: center;
  animation: slideUp 0.35s ease;
  box-shadow: 0 12px 40px rgba(0,0,0,0.5);
}

.promotion-dialog h3 {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #fff;
}

.promotion-pieces {
  display: flex;
  gap: 1.2rem;
  justify-content: center;
}

.promotion-btn {
  background: rgba(255,255,255,0.12);
  border: 2px solid rgba(255,255,255,0.25);
  border-radius: 0.9rem;
  padding: 1rem;
  min-width: 85px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.promotion-btn:hover {
  transform: translateY(-5px) scale(1.08);
  background: rgba(255,255,255,0.2);
  box-shadow: 0 6px 20px rgba(0,0,0,0.35);
}

.promotion-piece {
  font-size: 2.8rem;
  user-select: none;
  color: #fff;
  text-shadow: 0 4px 10px rgba(0,0,0,0.4);
}

.promotion-btn span {
  color: rgba(255,255,255,0.95);
  font-weight: 600;
  font-size: 0.9rem;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.move-indicator {
  position: absolute;
  width: 30%;
  height: 30%;
  background-color: rgba(127, 201, 127, 0.6);
  border-radius: 50%;
  pointer-events: none;
}

.valid-move-square {
  cursor: pointer;
}

.valid-move-square:hover {
  background-color: rgba(127, 201, 127, 0.3) !important;
}

.selected-square {
  box-shadow: inset 0 0 0 3px #2e7d32 !important;
  background-color: #7fc97f !important;
}
/* Global Styles */
.puzzles-page {
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%);
  color: #e0e0e0;
  min-height: 100vh;
  padding-top: 0px;
}

/* Hero Section */
.puzzles-hero {
  background: radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0a0a0a 100%);
  padding: 6rem 0;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(45deg, transparent 40%, rgba(255, 193, 7, 0.05) 50%, transparent 60%),
    linear-gradient(-45deg, transparent 40%, rgba(138, 43, 226, 0.05) 50%, transparent 60%);
  animation: heroShift 20s ease-in-out infinite alternate;
}

.chess-pattern-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 80px),
    repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(255,193,7,0.02) 40px, rgba(255,193,7,0.02) 80px);
  opacity: 0.3;
}

.hero-title {
  font-size: 4rem;
  font-weight: 900;
  letter-spacing: -2px;
}

.text-glow {
  background: linear-gradient(45deg, #ffc107, #8a2be2, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 40px rgba(255, 193, 7, 0.5);
  animation: titlePulse 4s ease-in-out infinite;
}

.hero-subtitle {
  font-size: 1.3rem;
  opacity: 0.9;
  line-height: 1.8;
  max-width: 600px;
  margin: 0 auto;
}

.chess-icon {
  font-size: 1.1em;
  margin-right: 15px;
  filter: drop-shadow(0 0 15px rgba(255, 193, 7, 0.7));
}

/* Hero Stats */
.hero-stats .stat-item {
  text-align: center;
  padding: 1rem;
}

.hero-stats .stat-number {
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(45deg, #ffc107, #8a2be2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: block;
}

.hero-stats .stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.turn-active {
  background: rgba(255, 193, 7, 0.2);
  border-radius: 15px;
  padding: 0.5rem;
  border: 2px solid rgba(255, 193, 7, 0.5);
}

/* Puzzle Content */
.puzzle-content {
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
}

.puzzle-info-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border: 1px solid rgba(255, 193, 7, 0.2);
  border-radius: 20px;
  padding: 2rem;
}

.puzzle-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffc107;
}

.puzzle-description {
  opacity: 0.9;
  font-size: 1rem;
}

.puzzle-badges .badge {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.5rem 1rem;
}

/* Chess Board Styles */
.chess-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 0;
}

.board-wrapper {
  position: relative;
  display: inline-block;
}

.chess-board {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  width: 512px;
  height: 512px;
  border: 2px solid #333;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
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
  background-color: rgba(255, 255, 0, 0.6) !important;
  position: relative;
}

.selected-square::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 3px solid #646f40;
  pointer-events: none;
}

/* Chess Pieces */
.chess-piece {
  width: 100%;
  height: 100%;
  background-size: 85%;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
  transition: none;
}

/* White pieces */
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

/* Black pieces */
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

/* Board Coordinates */
.board-coordinates {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.files {
  position: absolute;
  bottom: -30px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 0 2px;
}

.ranks {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -30px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}

.file-label, .rank-label {
  color: #b58863;
  font-size: 0.9rem;
  font-weight: bold;
  font-family: 'Roboto', sans-serif;
}

/* Controls Section */
.controls-section {
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border: 1px solid rgba(255, 193, 7, 0.2);
  border-radius: 20px;
  padding: 2rem;
  margin-top: 2rem;
}
.puzzle-controls {
  text-align: center;
}

.control-buttons .btn {
  position: relative;
  overflow: hidden;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-width: 2px;
  padding: 0.8rem 1.5rem;
  transition: all 0.3s ease;
}

.control-buttons .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

/* Status Messages */
.status-message .alert {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem;
  font-weight: 600;
}

.alert-success {
  background: rgba(76, 175, 80, 0.2) !important;
  border-color: rgba(76, 175, 80, 0.4) !important;
  color: #4caf50;
}

.alert-info {
  background: rgba(33, 150, 243, 0.2) !important;
  border-color: rgba(33, 150, 243, 0.4) !important;
  color: #2196f3;
}

.alert-warning {
  background: rgba(255, 193, 7, 0.2) !important;
  border-color: rgba(255, 193, 7, 0.4) !important;
  color: #ffc107;
}

/* Responsive Design */
@media (max-width: 768px) {
  .chess-board {
    width: 400px;
    height: 400px;
  }
  
  .hero-title {
    font-size: 2.8rem;
  }
  
  .puzzle-info-card {
    padding: 1.5rem;
  }
  
  .controls-section {
    padding: 1.5rem;
  }
}

@media (max-width: 576px) {
  .chess-board {
    width: 320px;
    height: 320px;
  }
  
  .hero-title {
    font-size: 2.2rem;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .control-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .control-buttons .btn {
    width: 100%;
  }
}

/* Animations */
@keyframes titlePulse {
  0%, 100% { 
    text-shadow: 0 0 40px rgba(255, 193, 7, 0.5);
  }
  50% { 
    text-shadow: 0 0 60px rgba(255, 193, 7, 0.8), 0 0 80px rgba(138, 43, 226, 0.3);
  }
}

@keyframes heroShift {
  0% { transform: translateX(-2px); }
  100% { transform: translateX(2px); }
}
</style>