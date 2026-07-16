const fs = require('fs');
const path = require('path');
const ChessEngine = require('./chess-engine.js');

let PUZZLE_DB = [];
try {
  const puzzlePath = path.join(__dirname, 'puzzle-data.js');
  const content = fs.readFileSync(puzzlePath, 'utf8');
  const match = content.match(/module\.exports\s*=\s*(\[[\s\S]*\]);/);
  if (match) {
    PUZZLE_DB = eval(match[1]);
  } else {
    const match2 = content.match(/const\s+PUZZLES\s*=\s*(\[[\s\S]*\]);/);
    if (match2) {
      PUZZLE_DB = eval(match2[1]);
    }
  }
} catch (e) {
  console.error('Failed to load puzzle-data.js:', e.message);
  process.exit(1);
}

if (PUZZLE_DB.length === 0) {
  console.error('No puzzles found in puzzle-data.js');
  process.exit(1);
}

const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

function evaluateBoard(engine) {
  let score = 0;
  for (let i = 0; i < 64; i++) {
    const p = engine.board[i];
    if (p === null) continue;
    const val = PIECE_VALUES[p.toLowerCase()] || 0;
    score += engine.isWhite(p) ? val : -val;
  }
  return engine.turn() === 'w' ? score : -score;
}

function staticEval(engine, depth) {
  if (depth === 0) return evaluateBoard(engine);
  const moves = engine.moves();
  if (moves.length === 0) {
    if (engine.isCheckmate()) return -99999 + (10 - depth);
    return 0;
  }
  if (engine.turn() === 'w') {
    let best = -Infinity;
    for (const m of moves) {
      engine.makeMove(m);
      const s = staticEval(engine, depth - 1);
      engine.undoMove();
      if (s > best) best = s;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      engine.makeMove(m);
      const s = staticEval(engine, depth - 1);
      engine.undoMove();
      if (s < best) best = s;
    }
    return best;
  }
}

function bestMoveSimple(engine, depth) {
  const moves = engine.moves();
  if (moves.length === 0) return null;
  let bestScore = -Infinity;
  let best = null;
  for (const m of moves) {
    engine.makeMove(m);
    const score = -staticEval(engine, depth - 1);
    engine.undoMove();
    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }
  return best;
}

function moveObjToUCI(m) {
  return m.from + m.to + (m.promotion || '');
}

function validatePuzzle(puzzle, index) {
  const results = { index, fen: puzzle.fen, passed: false, errors: [], warnings: [] };

  let engine;
  try {
    engine = new ChessEngine();
    engine.loadFEN(puzzle.fen);
  } catch (e) {
    results.errors.push('Illegal FEN: ' + e.message);
    return results;
  }

  const side = engine.turn();

  if (!puzzle.moves || puzzle.moves.length === 0) {
    results.errors.push('No solution moves defined');
    return results;
  }

  const firstMoveUCI = puzzle.moves[0];
  const legalMoves = engine.moves();
  const firstMoveLegal = legalMoves.find(m => moveObjToUCI(m) === firstMoveUCI);
  if (!firstMoveLegal) {
    results.errors.push('First solution move ' + firstMoveUCI + ' is not legal. Legal: ' + legalMoves.map(moveObjToUCI).join(', '));
    return results;
  }

  engine.makeMove(firstMoveLegal);

  const engineBest = bestMoveSimple(engine, 2);
  if (engineBest) {
    const engineBestUCI = moveObjToUCI(engineBest);
    if (engineBestUCI !== firstMoveUCI) {
      const bestScore = -staticEval(engine, 1);
      engine.undoMove();
      engine.makeMove(firstMoveLegal);
      const solScore = -staticEval(engine, 1);
      const gap = solScore - bestScore;
      if (gap < 150 && !engine.isCheckmate()) {
        results.warnings.push('Solution not clearly best: gap=' + gap + ' cp');
      }
    } else {
      engine.undoMove();
      engine.makeMove(firstMoveLegal);
    }
  }

  let testEngine;
  try {
    testEngine = new ChessEngine();
    testEngine.loadFEN(puzzle.fen);
  } catch (e) {
    results.errors.push('Could not reload FEN: ' + e.message);
    return results;
  }

  for (let i = 0; i < puzzle.moves.length; i++) {
    const uci = puzzle.moves[i];
    const lm = testEngine.moves();
    const matched = lm.find(m => moveObjToUCI(m) === uci);
    if (!matched) {
      results.errors.push('Solution move ' + (i + 1) + ' (' + uci + ') is not legal');
      return results;
    }
    testEngine.makeMove(matched);

    if (i < puzzle.moves.length - 1 || (puzzle.opponent && puzzle.opponent.length > i)) {
      const oppUci = puzzle.opponent && puzzle.opponent[i] ? puzzle.opponent[i] : null;
      if (oppUci) {
        const oppLegal = testEngine.moves();
        const oppMatched = oppLegal.find(m => moveObjToUCI(m) === oppUci);
        if (!oppMatched) {
          results.errors.push('Opponent reply ' + (i + 1) + ' (' + oppUci + ') is not legal. Legal: ' + oppLegal.map(moveObjToUCI).join(', '));
          return results;
        }
        testEngine.makeMove(oppMatched);
      } else {
        const oppMoves = testEngine.moves();
        if (oppMoves.length > 0) {
          const oppBest = bestMoveSimple(testEngine, 2);
          if (oppBest) {
            testEngine.makeMove(oppBest);
          } else {
            testEngine.makeMove(oppMoves[0]);
          }
        }
      }
    }
  }

  if (testEngine.isCheckmate()) {
    // Checkmate is always a win - no eval check needed
  } else if (testEngine.isStalemate() || testEngine.isDraw()) {
    results.warnings.push('Final position is draw/stalemate');
  } else {
    const finalScore = evaluateBoard(testEngine);
    if (finalScore < 100) {
      results.warnings.push('Final position eval only ' + (finalScore / 100).toFixed(2) + ' pawns');
    }
  }

  results.passed = results.errors.length === 0;
  return results;
}

function runValidation() {
  console.log('Validating ' + PUZZLE_DB.length + ' puzzles...\n');

  const results = PUZZLE_DB.map((puzzle, i) => validatePuzzle(puzzle, i));

  const passed = results.filter(r => r.passed);
  const failed = results.filter(r => !r.passed);
  const warned = passed.filter(r => r.warnings.length > 0);

  console.log('Results: ' + passed.length + ' passed, ' + failed.length + ' failed, ' + warned.length + ' with warnings\n');

  if (failed.length > 0) {
    console.log('=== FAILED ===');
    failed.forEach(r => {
      console.log('#' + r.index + ' [' + r.fen + ']');
      r.errors.forEach(e => console.log('  ERROR: ' + e));
    });
    console.log('');
  }

  if (warned.length > 0) {
    console.log('=== WARNINGS ===');
    warned.forEach(r => {
      console.log('#' + r.index + ' [' + r.fen + ']');
      r.warnings.forEach(w => console.log('  WARN: ' + w));
    });
    console.log('');
  }

  const categories = {};
  PUZZLE_DB.forEach(p => {
    const cat = p.category || 'uncategorized';
    categories[cat] = (categories[cat] || 0) + 1;
  });
  console.log('Categories:');
  Object.entries(categories).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log('  ' + cat + ': ' + count);
  });

  const fens = PUZZLE_DB.map(p => p.fen);
  const uniqueFens = new Set(fens);
  if (uniqueFens.size < fens.length) {
    console.log('\nWARNING: ' + (fens.length - uniqueFens.size) + ' duplicate FENs found!');
  } else {
    console.log('\nAll FENs unique.');
  }

  console.log('\nDone. ' + passed.length + '/' + PUZZLE_DB.length + ' puzzles validated.');

  return { passed: passed.length, failed: failed.length, total: PUZZLE_DB.length };
}

const result = runValidation();
process.exit(result.failed > 0 ? 1 : 0);
