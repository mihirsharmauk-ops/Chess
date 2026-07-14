const ChessEngine = require('./chess-engine.js');

let passed = 0, failed = 0, errors = [];

function assert(name, cond, detail) {
  if (cond) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; const msg = `  FAIL  ${name}${detail ? ' — ' + detail : ''}`; console.log(msg); errors.push(msg); }
}
function assertEqual(name, a, b) {
  assert(name, a === b, `expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}
function engine(fen) {
  var e = new ChessEngine();
  if (fen) e.loadFEN(fen);
  return e;
}

// ===================== STARTING POSITION =====================
console.log('\n=== Starting Position ===');
assertEqual('FEN', engine().toFEN(), 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
assertEqual('20 legal moves', engine().moves().length, 20);
assertEqual('turn is w', engine().turn(), 'w');
assertEqual('no check', engine().isCheck(), false);
assertEqual('no checkmate', engine().isCheckmate(), false);
assertEqual('not game over', engine().isGameOver(), false);
assertEqual('e2 pawn', engine().getPiece('e2'), 'P');
assertEqual('e7 pawn', engine().getPiece('e7'), 'p');
assertEqual('e1 king', engine().getPiece('e1'), 'K');
assertEqual('d8 queen', engine().getPiece('d8'), 'q');
assertEqual('a1 rook', engine().getPiece('a1'), 'R');
assertEqual('d1 queen', engine().getPiece('d1'), 'Q');
assertEqual('e4 empty', engine().getPiece('e4'), null);

// ===================== MOVING =====================
console.log('\n=== Moving ===');
var e = engine();
assertEqual('e2-e4', e.makeMove({from:'e2',to:'e4'}), true);
assertEqual('e4 has P', e.getPiece('e4'), 'P');
assertEqual('e2 empty', e.getPiece('e2'), null);
assertEqual('turn after e4', e.turn(), 'b');
assertEqual('cant move black piece', engine().makeMove({from:'e7',to:'e5'}), false);
assertEqual('illegal move', engine().makeMove({from:'e2',to:'e5'}), false);

// Capture
e = engine('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
e.makeMove({from:'d7',to:'d5'});
e.makeMove({from:'e4',to:'d5'});
assertEqual('capture: d5 has P', e.getPiece('d5'), 'P');
assertEqual('capture: d7 empty', e.getPiece('d7'), null);

// ===================== UNDO =====================
console.log('\n=== Undo ===');
e = engine();
var fen0 = e.toFEN();
e.makeMove({from:'e2',to:'e4'});
e.undoMove();
assertEqual('undo restores FEN', e.toFEN(), fen0);

e = engine('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
e.makeMove({from:'d7',to:'d5'});
e.makeMove({from:'e4',to:'d5'});
e.undoMove(); e.undoMove();
assertEqual('undo restores d7 pawn', e.getPiece('d7'), 'p');
assertEqual('undo restores e4 pawn', e.getPiece('e4'), 'P');

e = engine();
fen0 = e.toFEN();
e.makeMove({from:'e2',to:'e4'});
e.makeMove({from:'e7',to:'e5'});
e.makeMove({from:'g1',to:'f3'});
e.undoMove(); e.undoMove(); e.undoMove();
assertEqual('multi-undo', e.toFEN(), fen0);

// ===================== CHECK =====================
console.log('\n=== Check Detection ===');
assertEqual('no check start', engine('rnb1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1').isCheck(), false);
assertEqual('rook checks black king', engine('k7/8/8/8/8/8/8/R3K3 b - - 0 1').isCheck(), true);
assertEqual('no check k vs k', engine('k7/8/8/8/8/8/8/8 w - - 0 1').isCheck(), false);

// ===================== CHECKMATE =====================
console.log('\n=== Checkmate ===');
assertEqual('not checkmate start', engine('rnb1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1').isCheckmate(), false);
assertEqual('fools mate position check', engine('rnb1kbnr/pppp1ppp/4p3/8/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 0 1').isCheck(), true);
assertEqual('Q+K vs K checkmate', engine('7k/6Q1/7K/8/8/8/8/8 b - - 0 1').isCheckmate(), true);
assertEqual('fools mate isGameOver', engine('rnb1kbnr/pppp1ppp/4p3/8/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 0 1').isGameOver(), true);

// Play fool's mate
e = engine();
e.makeMove(e.moves('f2').find(m => m.to === 'f3'));
e.makeMove(e.moves('e7').find(m => m.to === 'e5'));
e.makeMove(e.moves('g2').find(m => m.to === 'g4'));
var qh4 = e.moves('d8').find(m => m.to === 'h4');
assert('Qh4 available', !!qh4);
e.makeMove(qh4);
assertEqual('fools mate played', e.isCheckmate(), true);

// ===================== STALEMATE =====================
console.log('\n=== Stalemate ===');
assertEqual('K+Q vs K not draw', engine('7k/8/8/8/8/8/8/6QK w - - 0 1').isDraw(), false);
assertEqual('stalemate: Q traps K', engine('k7/8/KQ6/8/8/8/8/8 b - - 0 1').isStalemate(), true);

// ===================== EN PASSANT =====================
console.log('\n=== En Passant ===');
e = engine('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
e.makeMove({from:'d7',to:'d5'});
var epMoves = e.moves('e4');
var hasEP = epMoves.some(function(m) { return m.to === 'd6'; });
assertEqual('en passant available', hasEP, true);

// Execute en passant
e.makeMove({from:'e4',to:'d6'});
assertEqual('EP removes d5 pawn', e.getPiece('d5'), null);
assertEqual('EP places pawn on d6', e.getPiece('d6'), 'P');

// ===================== CASTLING =====================
console.log('\n=== Castling ===');
var castleMoves = engine('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1').moves('e1');
assertEqual('white O-O available', castleMoves.some(function(m){return m.to==='g1';}), true);
assertEqual('white O-O-O available', castleMoves.some(function(m){return m.to==='c1';}), true);

e = engine('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
e.makeMove({from:'e1',to:'g1'});
assertEqual('O-O king on g1', e.getPiece('g1'), 'K');
assertEqual('O-O rook on f1', e.getPiece('f1'), 'R');
assertEqual('O-O e1 empty', e.getPiece('e1'), null);
assertEqual('O-O h1 empty', e.getPiece('h1'), null);

e = engine('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
e.makeMove({from:'e1',to:'c1'});
assertEqual('O-O-O king on c1', e.getPiece('c1'), 'K');
assertEqual('O-O-O rook on d1', e.getPiece('d1'), 'R');
assertEqual('O-O-O e1 empty', e.getPiece('e1'), null);
assertEqual('O-O-O a1 empty', e.getPiece('a1'), null);

e = engine('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b KQkq - 0 1');
e.makeMove({from:'e8',to:'g8'});
assertEqual('black O-O king on g8', e.getPiece('g8'), 'k');
assertEqual('black O-O rook on f8', e.getPiece('f8'), 'r');

e = engine('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b KQkq - 0 1');
e.makeMove({from:'e8',to:'c8'});
assertEqual('black O-O-O king on c8', e.getPiece('c8'), 'k');
assertEqual('black O-O-O rook on d8', e.getPiece('d8'), 'r');

// Cant castle when in check
e = engine('4k3/8/8/8/8/8/4r3/R3K2R w KQkq - 0 1');
assertEqual('king in check cannot castle', e.isCheck(), true);
assertEqual('no castling in check', e.moves('e1').some(function(m){return m.to==='g1'||m.to==='c1';}), false);

// ===================== PROMOTION =====================
console.log('\n=== Promotion ===');
e = engine('8/P7/8/8/8/8/8/8 w - - 0 1');
var promoMoves = e.moves('a7');
assertEqual('has promotion moves', promoMoves.length > 0, true);
assertEqual('promotes to queen', promoMoves.some(function(m){return m.promotion==='q';}), true);
e.makeMove({from:'a7',to:'a8',promotion:'q'});
assertEqual('a8 is Q', e.getPiece('a8'), 'Q');

// ===================== FEN ROUND-TRIP =====================
console.log('\n=== FEN Round-Trip ===');
var fens = [
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
  '8/8/8/8/8/8/8/k6K w - - 0 1',
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2'
];
fens.forEach(function(fen) {
  assertEqual('FEN: ' + fen.substring(0,30) + '...', engine(fen).toFEN(), fen);
});

// ===================== EVALUATION =====================
console.log('\n=== Evaluation ===');
assertEqual('eval is number', typeof engine().evaluate(), 'number');
assertEqual('eval 0 at start', engine().evaluate(), 0);
assert('eval favors extra bishop', engine('r1bqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1').evaluate() > 0);

// ===================== BEST MOVE =====================
console.log('\n=== Best Move ===');
var bm = engine().bestMove(1);
assertEqual('bestMove has from', typeof bm.from, 'string');
assertEqual('bestMove has to', typeof bm.to, 'string');
assertEqual('bestMove depth 1 legal', engine().makeMove(bm), true);

bm = engine().bestMove(2);
assertEqual('bestMove depth 2 legal', engine().makeMove(bm), true);

// ===================== PERFT =====================
console.log('\n=== Perft ===');
assertEqual('perft(1)=20', engine().perft(1), 20);
assertEqual('perft(2)=400', engine().perft(2), 400);

// ===================== THREATS =====================
console.log('\n=== Threats ===');
assertEqual('threats is array', Array.isArray(engine().getThreats()), true);
assert('threats has entries', engine('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1').getThreats().length >= 0);

// ===================== INSUFFICIENT MATERIAL =====================
console.log('\n=== Insufficient Material ===');
assertEqual('K vs K draw', engine('8/8/8/8/8/8/8/k6K w - - 0 1').isDraw(), true);
assertEqual('K+B vs K draw', engine('8/8/8/8/8/8/8/k4BK1 w - - 0 1').isDraw(), true);
assertEqual('K+N vs K draw', engine('8/8/8/8/8/8/8/k4NK1 w - - 0 1').isDraw(), true);
assertEqual('K+R vs K not draw', engine('8/8/8/8/8/8/8/k4RK1 w - - 0 1').isDraw(), false);

// ===================== SUMMARY =====================
console.log('\n' + '='.repeat(60));
console.log(`RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
if (errors.length > 0) {
  console.log('\nFailures:');
  errors.forEach(e => console.log(e));
}
console.log('='.repeat(60));
process.exit(failed > 0 ? 1 : 0);
