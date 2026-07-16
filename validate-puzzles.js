// validate-puzzles.js
// Run with: node validate-puzzles.js
// Requires chess-engine.js in same directory

const fs = require('fs');
const path = require('path');

// Load chess engine
const ChessEngine = require('./chess-engine.js');

// Puzzle database to validate (paste from chess.html)
const PUZZLE_DB = [
  // Will be populated in Task 2
];

function validatePuzzle(puzzle, index) {
  const results = { index, fen: puzzle.fen, passed: false, errors: [] };
  
  try {
    const engine = new ChessEngine();
    engine.loadFEN(puzzle.fen);
    results.fenLegal = true;
  } catch (e) {
    results.errors.push(`Illegal FEN: ${e.message}`);
    return results;
  }
  
  // Validate solution move is legal
  // Validate solution move is best (eval gap)
  // Validate all opponent responses lead to losing positions
  
  results.passed = results.errors.length === 0;
  return results;
}

function runValidation() {
  console.log('Validating puzzle database...\n');
  
  const results = PUZZLE_DB.map((puzzle, i) => validatePuzzle(puzzle, i));
  
  const passed = results.filter(r => r.passed);
  const failed = results.filter(r => !r.passed);
  
  console.log(`Results: ${passed.length} passed, ${failed.length} failed\n`);
  
  failed.forEach(r => {
    console.log(`FAILED #${r.index}: ${r.fen}`);
    r.errors.forEach(e => console.log(`  - ${e}`));
  });
}

runValidation();
