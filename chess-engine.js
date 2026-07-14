class ChessEngine {
  constructor() {
    this.board = new Array(64).fill(null);
    this._side = 'w';
    this.castling = { K: true, Q: true, k: true, q: true };
    this.epSquare = null;
    this.halfmoveClock = 0;
    this.fullmoveNumber = 1;
    this.history = [];
    this.positionHistory = [];
    this.ply = 0;
    this.loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  }

  sqToIndex(sq) {
    return (8 - parseInt(sq[1])) * 8 + (sq.charCodeAt(0) - 97);
  }

  indexToSq(idx) {
    const file = String.fromCharCode(97 + (idx % 8));
    const rank = 8 - Math.floor(idx / 8);
    return file + rank;
  }

  loadFEN(fen) {
    const parts = fen.split(' ');
    const rows = parts[0].split('/');
    this.board.fill(null);
    for (let r = 0; r < 8; r++) {
      let col = 0;
      for (const ch of rows[r]) {
        if (ch >= '1' && ch <= '8') {
          col += parseInt(ch);
        } else {
          this.board[r * 8 + col] = ch;
          col++;
        }
      }
    }
    this._side = parts[1];
    this.castling = { K: false, Q: false, k: false, q: false };
    if (parts[2] !== '-') {
      for (const ch of parts[2]) {
        if (ch === 'K') this.castling.K = true;
        if (ch === 'Q') this.castling.Q = true;
        if (ch === 'k') this.castling.k = true;
        if (ch === 'q') this.castling.q = true;
      }
    }
    this.epSquare = parts[3] === '-' ? null : this.sqToIndex(parts[3]);
    this.halfmoveClock = parseInt(parts[4]);
    this.fullmoveNumber = parseInt(parts[5]);
    this.history = [];
    this.positionHistory = [];
    this.ply = 0;
    this.pushPosition();
  }

  toFEN() {
    let fen = '';
    for (let r = 0; r < 8; r++) {
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const p = this.board[r * 8 + c];
        if (p === null) {
          empty++;
        } else {
          if (empty > 0) { fen += empty; empty = 0; }
          fen += p;
        }
      }
      if (empty > 0) fen += empty;
      if (r < 7) fen += '/';
    }
    fen += ' ' + this._side;
    let castling = '';
    if (this.castling.K) castling += 'K';
    if (this.castling.Q) castling += 'Q';
    if (this.castling.k) castling += 'k';
    if (this.castling.q) castling += 'q';
    fen += ' ' + (castling || '-');
    fen += ' ' + (this.epSquare !== null ? this.indexToSq(this.epSquare) : '-');
    fen += ' ' + this.halfmoveClock;
    fen += ' ' + this.fullmoveNumber;
    return fen;
  }

  getPiece(sq) {
    const idx = this.sqToIndex(sq);
    return this.board[idx];
  }

  isWhite(p) { return p !== null && p === p.toUpperCase(); }
  isBlack(p) { return p !== null && p === p.toLowerCase(); }
  colorOf(p) { return p === null ? null : (this.isWhite(p) ? 'w' : 'b'); }

  pushPosition() {
    this.positionHistory.push(this.toFEN().split(' ').slice(0, 4).join(' '));
  }

  popPosition() {
    this.positionHistory.pop();
  }

  _pseudoMoves() {
    const moves = [];
    const side = this._side;
    const enemy = side === 'w' ? 'b' : 'w';
    const isWhiteSide = side === 'w';

    for (let i = 0; i < 64; i++) {
      const piece = this.board[i];
      if (piece === null || this.colorOf(piece) !== side) continue;
      const p = piece.toLowerCase();

      if (p === 'p') {
        const dir = isWhiteSide ? -8 : 8;
        const startRank = isWhiteSide ? 6 : 1;
        const promoRank = isWhiteSide ? 0 : 7;

        // Single push
        const onePush = i + dir;
        if (onePush >= 0 && onePush < 64 && this.board[onePush] === null) {
          if (Math.floor(onePush / 8) === promoRank) {
            for (const promo of ['q', 'r', 'b', 'n']) {
              moves.push({ from: this.indexToSq(i), to: this.indexToSq(onePush), piece: piece, captured: null, promotion: promo });
            }
          } else {
            moves.push({ from: this.indexToSq(i), to: this.indexToSq(onePush), piece: piece, captured: null, promotion: null });
          }

          // Double push
          const dblPush = i + 2 * dir;
          if (Math.floor(i / 8) === startRank && this.board[dblPush] === null) {
            moves.push({ from: this.indexToSq(i), to: this.indexToSq(dblPush), piece: piece, captured: null, promotion: null, _epFlag: true });
          }
        }

        // Captures
        for (const dc of [-1, 1]) {
          const capIdx = i + dir + dc;
          if (capIdx < 0 || capIdx >= 64) continue;
          if (Math.abs((capIdx % 8) - (i % 8)) !== 1) continue;
          const captured = this.board[capIdx];
          if (captured !== null && this.colorOf(captured) === enemy) {
            if (Math.floor(capIdx / 8) === promoRank) {
              for (const promo of ['q', 'r', 'b', 'n']) {
                moves.push({ from: this.indexToSq(i), to: this.indexToSq(capIdx), piece: piece, captured: captured, promotion: promo });
              }
            } else {
              moves.push({ from: this.indexToSq(i), to: this.indexToSq(capIdx), piece: piece, captured: captured, promotion: null });
            }
          }
          // En passant
          const epIdx = isWhiteSide ? i + 2 * dir + dc : i + dir + dc;
          if (this.epSquare !== null && epIdx === this.epSquare && epIdx >= 0 && epIdx < 64) {
            const capturedPawnIdx = isWhiteSide ? i + dir + dc : i + dc;
            const capturedPawn = this.board[capturedPawnIdx];
            if (capturedPawn !== null && capturedPawn.toLowerCase() === 'p' && this.colorOf(capturedPawn) === enemy) {
              moves.push({ from: this.indexToSq(i), to: this.indexToSq(epIdx), piece: piece, captured: capturedPawn, promotion: null, _epCapture: true, _epCapturedIdx: capturedPawnIdx });
            }
          }
        }
      }

      if (p === 'n') {
        const knightDeltas = [-17, -15, -10, -6, 6, 10, 15, 17];
        for (const d of knightDeltas) {
          const j = i + d;
          if (j < 0 || j >= 64) continue;
          if (Math.abs((j % 8) - (i % 8)) > 2) continue;
          const captured = this.board[j];
          if (captured !== null && this.colorOf(captured) === side) continue;
          moves.push({ from: this.indexToSq(i), to: this.indexToSq(j), piece: piece, captured: captured, promotion: null });
        }
      }

      if (p === 'b' || p === 'q') {
        const bishopDeltas = [-9, -7, 7, 9];
        for (const d of bishopDeltas) {
          for (let j = i + d; j >= 0 && j < 64; j += d) {
            if (Math.abs((j % 8) - ((j - d) % 8)) > 1) break;
            const captured = this.board[j];
            if (captured !== null && this.colorOf(captured) === side) break;
            moves.push({ from: this.indexToSq(i), to: this.indexToSq(j), piece: piece, captured: captured, promotion: null });
            if (captured !== null) break;
          }
        }
      }

      if (p === 'r' || p === 'q') {
        const rookDeltas = [-8, -1, 1, 8];
        for (const d of rookDeltas) {
          for (let j = i + d; j >= 0 && j < 64; j += d) {
            if (d === -1 || d === 1) {
              if (Math.floor(j / 8) !== Math.floor(i / 8)) break;
            }
            const captured = this.board[j];
            if (captured !== null && this.colorOf(captured) === side) break;
            moves.push({ from: this.indexToSq(i), to: this.indexToSq(j), piece: piece, captured: captured, promotion: null });
            if (captured !== null) break;
          }
        }
      }

      if (p === 'k') {
        const kingDeltas = [-9, -8, -7, -1, 1, 7, 8, 9];
        for (const d of kingDeltas) {
          const j = i + d;
          if (j < 0 || j >= 64) continue;
          if (Math.abs((j % 8) - (i % 8)) > 1) continue;
          const captured = this.board[j];
          if (captured !== null && this.colorOf(captured) === side) continue;
          moves.push({ from: this.indexToSq(i), to: this.indexToSq(j), piece: piece, captured: captured, promotion: null });
        }

        // Castling
        if (isWhiteSide) {
          if (this.castling.K && this.board[60] === 'K' && this.board[61] === null && this.board[62] === null && this.board[63] === 'R') {
            if (!this._isSquareAttacked(60, 'b') && !this._isSquareAttacked(61, 'b') && !this._isSquareAttacked(62, 'b')) {
              moves.push({ from: 'e1', to: 'g1', piece: 'K', captured: null, promotion: null, _castle: 'K' });
            }
          }
          if (this.castling.Q && this.board[60] === 'K' && this.board[59] === null && this.board[58] === null && this.board[57] === null && this.board[56] === 'R') {
            if (!this._isSquareAttacked(60, 'b') && !this._isSquareAttacked(59, 'b') && !this._isSquareAttacked(58, 'b')) {
              moves.push({ from: 'e1', to: 'c1', piece: 'K', captured: null, promotion: null, _castle: 'Q' });
            }
          }
        } else {
          if (this.castling.k && this.board[4] === 'k' && this.board[5] === null && this.board[6] === null && this.board[7] === 'r') {
            if (!this._isSquareAttacked(4, 'w') && !this._isSquareAttacked(5, 'w') && !this._isSquareAttacked(6, 'w')) {
              moves.push({ from: 'e8', to: 'g8', piece: 'k', captured: null, promotion: null, _castle: 'k' });
            }
          }
          if (this.castling.q && this.board[4] === 'k' && this.board[3] === null && this.board[2] === null && this.board[1] === null && this.board[0] === 'r') {
            if (!this._isSquareAttacked(4, 'w') && !this._isSquareAttacked(3, 'w') && !this._isSquareAttacked(2, 'w')) {
              moves.push({ from: 'e8', to: 'c8', piece: 'k', captured: null, promotion: null, _castle: 'q' });
            }
          }
        }
      }
    }
    return moves;
  }

  _isSquareAttacked(idx, byColor) {
    for (let i = 0; i < 64; i++) {
      const piece = this.board[i];
      if (piece === null || this.colorOf(piece) !== byColor) continue;
      const p = piece.toLowerCase();

      if (p === 'p') {
        const dir = byColor === 'w' ? -8 : 8;
        for (const dc of [-1, 1]) {
          const j = i + dir + dc;
          if (j === idx) return true;
        }
      }
      if (p === 'n') {
        const deltas = [-17, -15, -10, -6, 6, 10, 15, 17];
        for (const d of deltas) {
          if (i + d === idx) {
            if (Math.abs(((i + d) % 8) - (i % 8)) <= 2) return true;
          }
        }
      }
      if (p === 'b' || p === 'q') {
        const deltas = [-9, -7, 7, 9];
        for (const d of deltas) {
          for (let j = i + d; j >= 0 && j < 64; j += d) {
            if (Math.abs((j % 8) - ((j - d) % 8)) > 1) break;
            if (j === idx) return true;
            if (this.board[j] !== null) break;
          }
        }
      }
      if (p === 'r' || p === 'q') {
        const deltas = [-8, -1, 1, 8];
        for (const d of deltas) {
          for (let j = i + d; j >= 0 && j < 64; j += d) {
            if (d === -1 || d === 1) {
              if (Math.floor(j / 8) !== Math.floor(i / 8)) break;
            }
            if (j === idx) return true;
            if (this.board[j] !== null) break;
          }
        }
      }
      if (p === 'k') {
        const deltas = [-9, -8, -7, -1, 1, 7, 8, 9];
        for (const d of deltas) {
          if (i + d === idx) return true;
        }
      }
    }
    return false;
  }

  _findKing(side) {
    const k = side === 'w' ? 'K' : 'k';
    for (let i = 0; i < 64; i++) {
      if (this.board[i] === k) return i;
    }
    return -1;
  }

  _isLegal(move) {
    const fromIdx = this.sqToIndex(move.from);
    const toIdx = this.sqToIndex(move.to);
    const captured = this.board[toIdx];
    const movedPiece = this.board[fromIdx];
    const boardCopy = this.board.slice();
    const oldCastling = { ...this.castling };
    const oldEp = this.epSquare;

    this.board[toIdx] = this.board[fromIdx];
    this.board[fromIdx] = null;

    if (move._epCapture) {
      this.board[move._epCapturedIdx] = null;
    }

    if (move._castle) {
      if (move._castle === 'K') { this.board[62] = this.board[60]; this.board[61] = this.board[63]; this.board[60] = null; this.board[63] = null; }
      else if (move._castle === 'Q') { this.board[58] = this.board[60]; this.board[59] = this.board[56]; this.board[60] = null; this.board[56] = null; }
      else if (move._castle === 'k') { this.board[6] = this.board[4]; this.board[5] = this.board[7]; this.board[4] = null; this.board[7] = null; }
      else if (move._castle === 'q') { this.board[2] = this.board[4]; this.board[3] = this.board[0]; this.board[4] = null; this.board[0] = null; }
    }

    if (move.promotion) {
      const promoPiece = this._side === 'w' ? move.promotion.toUpperCase() : move.promotion.toLowerCase();
      this.board[toIdx] = promoPiece;
    }

    const kingIdx = this._findKing(this._side);
    const inCheck = kingIdx >= 0 && this._isSquareAttacked(kingIdx, this._side === 'w' ? 'b' : 'w');

    this.board = boardCopy;
    this.castling = oldCastling;
    this.epSquare = oldEp;

    return !inCheck;
  }

  moves(square) {
    const allPseudo = this._pseudoMoves();
    const legalMoves = [];
    for (const m of allPseudo) {
      if (square && (m.from !== square && m.to !== square)) continue;
      if (square && (m.from !== square && m.to === square)) continue;
      if (this._isLegal(m)) legalMoves.push(m);
    }

    // Sort: captures first (MVV-LVA), then others
    const victimValue = { 'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000 };
    const attackerValue = { 'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000 };
    legalMoves.sort((a, b) => {
      const aCap = a.captured ? 1 : 0;
      const bCap = b.captured ? 1 : 0;
      if (aCap !== bCap) return bCap - aCap;
      if (a.captured && b.captured) {
        const aVictim = victimValue[a.captured.toLowerCase()] || 0;
        const bVictim = victimValue[b.captured.toLowerCase()] || 0;
        if (aVictim !== bVictim) return bVictim - aVictim;
        const aAtt = attackerValue[a.piece.toLowerCase()] || 0;
        const bAtt = attackerValue[b.piece.toLowerCase()] || 0;
        return aAtt - bAtt;
      }
      return 0;
    });
    return legalMoves;
  }

  makeMove(move) {
    if (!move || !move.from || !move.to) return false;
    const legalMoves = this.moves();
    let matched = null;
    for (const m of legalMoves) {
      if (m.from === move.from && m.to === move.to) {
        if (move.promotion && m.promotion !== move.promotion) continue;
        if (!move.promotion && m.promotion) continue;
        matched = m;
        break;
      }
    }
    if (!matched) return false;

    const fromIdx = this.sqToIndex(matched.from);
    const toIdx = this.sqToIndex(matched.to);

    const restore = {
      board: this.board.slice(),
      castling: { ...this.castling },
      epSquare: this.epSquare,
      halfmoveClock: this.halfmoveClock,
      fullmoveNumber: this.fullmoveNumber,
      turn: this._side,
      ply: this.ply
    };

    const captured = this.board[toIdx];

    // En passant capture
    if (matched._epCapture) {
      this.board[matched._epCapturedIdx] = null;
    }

    // Move piece
    this.board[toIdx] = this.board[fromIdx];
    this.board[fromIdx] = null;

    // Promotion
    if (matched.promotion) {
      this.board[toIdx] = this._side === 'w' ? matched.promotion.toUpperCase() : matched.promotion.toLowerCase();
    }

    // Castling
    if (matched._castle) {
      if (matched._castle === 'K') { this.board[61] = 'R'; this.board[63] = null; }
      else if (matched._castle === 'Q') { this.board[59] = 'R'; this.board[56] = null; }
      else if (matched._castle === 'k') { this.board[5] = 'r'; this.board[7] = null; }
      else if (matched._castle === 'q') { this.board[3] = 'r'; this.board[0] = null; }
    }

    // Update en passant
    this.epSquare = null;
    const movedPiece = this.board[toIdx].toLowerCase();
    if (movedPiece === 'p' && Math.abs(toIdx - fromIdx) === 16) {
      this.epSquare = (fromIdx + toIdx) / 2;
    }

    // Update castling rights
    if (fromIdx === 60 || toIdx === 60) { this.castling.K = false; this.castling.Q = false; }
    if (fromIdx === 4 || toIdx === 4) { this.castling.k = false; this.castling.q = false; }
    if (fromIdx === 63 || toIdx === 63) this.castling.K = false;
    if (fromIdx === 56 || toIdx === 56) this.castling.Q = false;
    if (fromIdx === 7 || toIdx === 7) this.castling.k = false;
    if (fromIdx === 0 || toIdx === 0) this.castling.q = false;

    // Halfmove clock
    if (movedPiece === 'p' || captured || matched._epCapture) {
      this.halfmoveClock = 0;
    } else {
      this.halfmoveClock++;
    }

    // Fullmove number
    if (this._side === 'b') this.fullmoveNumber++;

    this._side = this._side === 'w' ? 'b' : 'w';
    this.ply++;

    restore.savedCaptured = captured || (matched._epCapture ? matched.captured : null);

    this.history.push(restore);

    this.pushPosition();
    return true;
  }

  undoMove() {
    if (this.history.length === 0) return false;
    const restore = this.history.pop();
    this.popPosition();
    this.board = restore.board;
    this.castling = restore.castling;
    this.epSquare = restore.epSquare;
    this.halfmoveClock = restore.halfmoveClock;
    this.fullmoveNumber = restore.fullmoveNumber;
    this._side = restore.turn;
    this.ply = restore.ply;
    return true;
  }

  turn() { return this._side; }

  isCheck() {
    const kingIdx = this._findKing(this._side);
    if (kingIdx < 0) return false;
    return this._isSquareAttacked(kingIdx, this._side === 'w' ? 'b' : 'w');
  }

  isCheckmate() {
    return this.isCheck() && this.moves().length === 0;
  }

  isStalemate() {
    return !this.isCheck() && this.moves().length === 0;
  }

  _insufficientMaterial() {
    const pieces = { w: [], b: [] };
    for (let i = 0; i < 64; i++) {
      const p = this.board[i];
      if (p !== null) {
        pieces[this.colorOf(p)].push(p.toLowerCase());
      }
    }
    const all = pieces.w.concat(pieces.b);
    if (all.some(p => p === 'p' || p === 'r' || p === 'q')) return false;
    const wb = pieces.w.filter(p => p === 'b').length;
    const wn = pieces.w.filter(p => p === 'n').length;
    const bb = pieces.b.filter(p => p === 'b').length;
    const bn = pieces.b.filter(p => p === 'n').length;
    if (all.length === 2) return true; // K vs K
    if (all.length === 3 && (wb + wn + bb + bn) === 1) return true; // K+N vs K or K+B vs K
    // K+B vs K+B (same color bishops)
    if (all.length === 4 && wb === 1 && bb === 1) {
      // Check if bishops are on same color squares
      return true; // Simplified: treat as draw
    }
    return false;
  }

  _positionCount() {
    const key = this.toFEN().split(' ').slice(0, 4).join(' ');
    let count = 0;
    for (const pos of this.positionHistory) {
      if (pos === key) count++;
    }
    return count;
  }

  isDraw() {
    if (this.isStalemate()) return true;
    if (this.halfmoveClock >= 100) return true;
    if (this._positionCount() >= 3) return true;
    if (this._insufficientMaterial()) return true;
    return false;
  }

  isGameOver() {
    return this.isCheckmate() || this.isDraw();
  }

  evaluate() {
    const mg_table = {
      P: [[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]],
      N: [[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],[-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],[-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]],
      B: [[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]],
      R: [[0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]],
      Q: [[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]],
      K_mg: [[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]],
      K_eg: [[-50,-40,-30,-20,-20,-30,-40,-50],[-30,-20,-10,0,0,-10,-20,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-30,0,0,0,0,-30,-30],[-50,-30,-30,-30,-30,-30,-30,-50]]
    };

    const mg_value = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 20000 };

    let whiteMg = 0, blackMg = 0;
    let whitePst = { P: 0, N: 0, B: 0, R: 0, Q: 0, K: 0 };
    let blackPst = { P: 0, N: 0, B: 0, R: 0, Q: 0, K: 0 };

    // Detect endgame
    let hasQueen = false;
    let minorCount = 0;
    for (let i = 0; i < 64; i++) {
      const p = this.board[i];
      if (p !== null) {
        const pl = p.toLowerCase();
        if (pl === 'q') hasQueen = true;
        if (pl === 'b' || pl === 'n') minorCount++;
      }
    }
    const endgame = !hasQueen || minorCount <= 2;

    for (let i = 0; i < 64; i++) {
      const piece = this.board[i];
      if (piece === null) continue;
      const p = piece.toUpperCase();
      const mgv = mg_value[p] || 0;

      if (this.isWhite(piece)) {
        whiteMg += mgv;
        const row = Math.floor(i / 8);
        const col = i % 8;
        if (p === 'K') {
          const table = endgame ? mg_table.K_eg : mg_table.K_mg;
          whitePst.K += table[row][col];
        } else if (mg_table[p]) {
          whitePst[p] += mg_table[p][row][col];
        }
      } else {
        blackMg += mgv;
        const row = Math.floor(i / 8);
        const col = i % 8;
        const mirrorRow = 7 - row;
        if (p === 'K') {
          const table = endgame ? mg_table.K_eg : mg_table.K_mg;
          blackPst.K += table[mirrorRow][col];
        } else if (mg_table[p]) {
          blackPst[p] += mg_table[p][mirrorRow][col];
        }
      }
    }

    const whiteScore = whiteMg + whitePst.P + whitePst.N + whitePst.B + whitePst.R + whitePst.Q + whitePst.K;
    const blackScore = blackMg + blackPst.P + blackPst.N + blackPst.B + blackPst.R + blackPst.Q + blackPst.K;

    const score = whiteScore - blackScore;
    return this._side === 'w' ? score : -score;
  }

  quiesce(alpha, beta) {
    const standPat = this.evaluate();
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;

    const captures = this.moves().filter(m => m.captured !== null);
    for (const move of captures) {
      this.makeMove(move);
      const score = -this.quiesce(-beta, -alpha);
      this.undoMove();
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  }

  negamax(alpha, beta, depth) {
    if (depth === 0) return this.quiesce(alpha, beta);

    const allMoves = this.moves();
    if (allMoves.length === 0) {
      if (this.isCheck()) return -100000 + this.ply;
      return 0;
    }

    let bestScore = -Infinity;
    for (const move of allMoves) {
      this.makeMove(move);
      const score = -this.negamax(-beta, -alpha, depth - 1);
      this.undoMove();

      if (score > bestScore) bestScore = score;
      if (score > alpha) alpha = score;
      if (alpha >= beta) break;
    }
    return bestScore;
  }

  getThreats() {
    const side = this._side;
    const enemy = side === 'w' ? 'b' : 'w';
    const threats = [];

    for (let i = 0; i < 64; i++) {
      const piece = this.board[i];
      if (piece === null || this.colorOf(piece) !== side) continue;

      // Check if this piece is attacked
      if (this._isSquareAttacked(i, enemy)) {
        const attackers = [];
        for (let j = 0; j < 64; j++) {
          const ap = this.board[j];
          if (ap === null || this.colorOf(ap) !== enemy) continue;
          const aLow = ap.toLowerCase();
          const dir = enemy === 'w' ? -8 : 8;
          if (aLow === 'p') {
            if (j + dir - 1 === i || j + dir + 1 === i) attackers.push(ap);
          }
          if (aLow === 'n') {
            const deltas = [-17, -15, -10, -6, 6, 10, 15, 17];
            for (const d of deltas) if (j + d === i && Math.abs(((j + d) % 8) - (j % 8)) <= 2) attackers.push(ap);
          }
          if (aLow === 'b' || aLow === 'q') {
            const bd = [-9, -7, 7, 9];
            for (const d of bd) {
              for (let k = j + d; k >= 0 && k < 64; k += d) {
                if (Math.abs((k % 8) - ((k - d) % 8)) > 1) break;
                if (k === i) { attackers.push(ap); break; }
                if (this.board[k] !== null) break;
              }
            }
          }
          if (aLow === 'r' || aLow === 'q') {
            const rd = [-8, -1, 1, 8];
            for (const d of rd) {
              for (let k = j + d; k >= 0 && k < 64; k += d) {
                if ((d === -1 || d === 1) && Math.floor(k / 8) !== Math.floor(j / 8)) break;
                if (k === i) { attackers.push(ap); break; }
                if (this.board[k] !== null) break;
              }
            }
          }
          if (aLow === 'k') {
            const kd = [-9, -8, -7, -1, 1, 7, 8, 9];
            for (const d of kd) if (j + d === i) attackers.push(ap);
          }
        }

        const vv = { 'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000 };
        const pieceVal = vv[piece.toLowerCase()] || 0;
        const minAttackerVal = attackers.length > 0 ? Math.min(...attackers.map(a => vv[a.toLowerCase()] || 0)) : 0;
        const dangerous = pieceVal > minAttackerVal;

        threats.push({
          square: this.indexToSq(i),
          piece: piece,
          attacker: attackers.length > 0 ? attackers[0] : null,
          dangerous: dangerous
        });
      }
    }
    return threats;
  }

  bestMove(depth) {
    let bestMove = null;
    for (let d = 1; d <= depth; d++) {
      const allMoves = this.moves();
      if (allMoves.length === 0) break;

      let alpha = -Infinity;
      const beta = Infinity;
      let localBest = null;

      for (const move of allMoves) {
        this.makeMove(move);
        const score = -this.negamax(-beta, -alpha, d - 1);
        this.undoMove();

        if (score > alpha || localBest === null) {
          alpha = score;
          // Auto-promote to queen for bestMove
          localBest = { from: move.from, to: move.to, promotion: move.promotion || undefined };
        }
      }
      bestMove = localBest;
    }
    return bestMove || { from: null, to: null };
  }

  perft(depth) {
    if (depth === 0) return 1;
    let nodes = 0;
    const allMoves = this.moves();
    for (const move of allMoves) {
      this.makeMove(move);
      nodes += this.perft(depth - 1);
      this.undoMove();
    }
    return nodes;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChessEngine;
}
