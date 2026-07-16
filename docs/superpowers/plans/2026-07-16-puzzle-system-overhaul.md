# Puzzle System Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken puzzle database with ~90 engine-validated tactical puzzles that have single clear winning lines, multi-move sequences, and adaptive difficulty.

**Architecture:** Hand-craft puzzles from known tactical patterns, validate each with chess-engine.js, store as static JSON in chess.html, implement rating-based selection with anti-repetition.

**Tech Stack:** JavaScript (inline in chess.html), chess-engine.js for validation

## Global Constraints
- All puzzles must be validated by chess-engine.js before being added to PUZZLE_DB
- Every FEN must be legal (engine loads without error)
- Every solution move must have eval ≥ 1.5 pawns better than alternatives
- All opponent responses must lead to positions with ≥ 1.0 pawn disadvantage for the puzzle side
- Puzzles must not repeat within last 20 selections
- Hint usage must reduce rating gain by 50%

---

## Task 1: Create Validation Script

**Files:**
- Create: `validate-puzzles.js`
- Modify: None

**Interfaces:**
- Consumes: `chess-engine.js` (ChessEngine class)
- Produces: Console output (PASS/FAIL per puzzle), cleaned puzzle list

- [ ] **Step 1: Create the validation script skeleton**

```javascript
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
```

- [ ] **Step 2: Run validation script to verify it works**

Run: `node validate-puzzles.js`
Expected: Output shows "Validizing puzzle database..." with 0 puzzles (empty array)

- [ ] **Step 3: Commit**

```bash
git add validate-puzzles.js
git commit -m "feat: add puzzle validation script skeleton"
```

---

## Task 2: Create Validated Puzzle Database

**Files:**
- Create: `puzzle-data.js` (temporary file with all puzzles)
- Modify: `chess.html:657-757` (replace PUZZLE_DB)

**Interfaces:**
- Consumes: chess-engine.js for validation
- Produces: PUZZLE_DB array in chess.html

- [ ] **Step 1: Create puzzle-data.js with ~100 candidate puzzles**

Create `puzzle-data.js` containing puzzles organized by category:

**Mate in 1 (15 puzzles, rating 800-1000):**
- Simple back rank mates with undefended king
- Corridor mates with rook/queen
- Queen + king mates

**Mate in 2-3 (20 puzzles, rating 1000-1300):**
- Back rank combinations (deflection + mate)
- Queen sacrifice leading to mate
- Discovered check leading to mate

**Forks (15 puzzles, rating 1100-1400):**
- Knight forks on king + queen
- Queen forks on unprotected pieces
- Pawn forks on two pieces

**Pins & Skewers (15 puzzles, rating 1200-1500):**
- Absolute pins (piece can't move without exposing king)
- Relative pins (piece can't move without exposing queen)
- Skewers (more valuable piece attacked, forced to move, less valuable piece captured)

**Discovered Attacks (10 puzzles, rating 1300-1600):**
- Discovered check with capture
- Discovered attack on queen
- Double discovered attack

**Deflection/Overload (10 puzzles, rating 1400-1700):**
- Removing the defender
- Overloading a piece to defend two things
- Decoy sacrifice

**Pattern mates (5 puzzles, rating 1500-1800):**
- Smothered mate
- Anastasia's mate
- Boden's mate

- [ ] **Step 2: Run validation on all candidate puzzles**

Run: `node validate-puzzles.js`
Expected: ~80-90 pass, ~10-20 fail (illegal FENs, incorrect solutions)

- [ ] **Step 3: Fix or remove failed puzzles**

For each failed puzzle:
- If illegal FEN: Fix the FEN to be legal
- If incorrect solution: Find the correct solution or remove puzzle
- If eval gap < 1.5: Remove puzzle (not tactical enough)

- [ ] **Step 4: Re-run validation on fixed puzzles**

Run: `node validate-puzzles.js`
Expected: All remaining puzzles pass

- [ ] **Step 5: Extract validated PUZZLE_DB**

Copy the validated puzzles from `puzzle-data.js` to replace the PUZZLE_DB in chess.html

- [ ] **Step 6: Commit**

```bash
git add puzzle-data.js chess.html
git commit -m "feat: replace puzzle database with engine-validated puzzles"
```

---

## Task 3: Implement Rating-Based Selection

**Files:**
- Modify: `chess.html:763` (generatePuzzle function)

**Interfaces:**
- Consumes: PUZZLE_DB, puzzleRating (user's rating)
- Produces: selected puzzle, updated UI

- [ ] **Step 1: Add lastShownFens array**

Add after PUZZLE_DB initialization:
```javascript
var lastShownFens = [];
var MAX_HISTORY = 20;
```

- [ ] **Step 2: Update generatePuzzle to filter by rating**

Replace the random selection in generatePuzzle with:
```javascript
// Filter by rating (±200, fallback to ±400, then any)
var filtered = PUZZLE_DB.filter(function(p) {
  return Math.abs(p.rating - puzzleRating) <= 200;
});
if (filtered.length < 10) {
  filtered = PUZZLE_DB.filter(function(p) {
    return Math.abs(p.rating - puzzleRating) <= 400;
  });
}
if (filtered.length < 5) {
  lastShownFens = [];
  filtered = PUZZLE_DB;
}

// Remove recently shown
var available = filtered.filter(function(p) {
  return lastShownFens.indexOf(p.fen) === -1;
});
if (available.length === 0) {
  lastShownFens = [];
  available = filtered;
}

// Select random
var template = available[Math.floor(Math.random() * available.length)];
lastShownFens.push(template.fen);
if (lastShownFens.length > MAX_HISTORY) {
  lastShownFens.shift();
}
```

- [ ] **Step 3: Test selection logic**

Start dev server and verify:
- Puzzles shown match user's rating range
- No puzzles repeat within 20 selections
- Fallback works when few puzzles match

- [ ] **Step 4: Commit**

```bash
git add chess.html
git commit -m "feat: implement rating-based puzzle selection with anti-repetition"
```

---

## Task 4: Implement Hint Penalty

**Files:**
- Modify: `chess.html:764` (processPuzzleMove function)

**Interfaces:**
- Consumes: hintUsed flag, ratingGain
- Produces: modified ratingGain, UI update

- [ ] **Step 1: Add hintUsed flag**

Add after other puzzle variables:
```javascript
var puzzleHintUsed = false;
```

- [ ] **Step 2: Set flag when hint is used**

In hintPuzzle function, add:
```javascript
puzzleHintUsed = true;
```

- [ ] **Step 3: Reset flag in generatePuzzle**

In generatePuzzle, add:
```javascript
puzzleHintUsed = false;
```

- [ ] **Step 4: Apply penalty in processPuzzleMove**

Find the rating gain calculation and modify:
```javascript
var ratingGain = eloChange(puzzleRating, puzzleTemplateRating, true);
if (puzzleHintUsed) {
  ratingGain = Math.round(ratingGain * 0.5);
}
```

- [ ] **Step 5: Show hint status in UI**

After showing rating gain, add:
```javascript
if (puzzleHintUsed) {
  document.getElementById('puzzleResult').textContent += ' (hint used)';
}
```

- [ ] **Step 6: Test hint penalty**

Start dev server and verify:
- Using a hint sets puzzleHintUsed = true
- Rating gain is halved when hint was used
- UI shows "(hint used)" text
- Flag resets for new puzzle

- [ ] **Step 7: Commit**

```bash
git add chess.html
git commit -m "feat: implement hint penalty for puzzle rating"
```

---

## Task 5: Fix Page Freezing Issue

**Files:**
- Modify: `chess.html` (processPuzzleMove, drawBoard functions)

**Interfaces:**
- Consumes: puzzleChess, puzzleMoveHistory
- Produces: smooth UI updates

- [ ] **Step 1: Identify freeze cause**

Check for:
- Infinite loops in move validation
- Excessive DOM updates during move processing
- Canvas redraw blocking main thread

- [ ] **Step 2: Optimize processPuzzleMove**

If move processing is slow:
- Debounce drawBoard calls
- Use requestAnimationFrame for canvas updates
- Limit engine analysis depth during gameplay

- [ ] **Step 3: Test for freezes**

Start dev server and verify:
- Rapid move inputs don't freeze page
- Multi-move sequences complete smoothly
- No forced reloads needed

- [ ] **Step 4: Commit**

```bash
git add chess.html
git commit -m "fix: prevent puzzle page freezing during move input"
```

---

## Task 6: Final Verification

**Files:**
- None (testing only)

**Interfaces:**
- Consumes: All previous tasks
- Produces: Working puzzle system

- [ ] **Step 1: Run full validation**

Run: `node validate-puzzles.js`
Expected: All puzzles pass

- [ ] **Step 2: Manual testing checklist**

Start dev server and verify:
- [ ] Puzzles load with correct FEN (no illegal positions)
- [ ] Solutions are correct (engine confirms best move)
- [ ] Multi-move sequences work (opponent replies played)
- [ ] Rating filtering works (±200, ±400 fallback)
- [ ] No puzzles repeat within 20 selections
- [ ] Hint penalty works (50% rating reduction)
- [ ] Page doesn't freeze during moves
- [ ] UI shows puzzle rating and hint status

- [ ] **Step 3: Create test report**

Document results:
- Total puzzles validated
- Categories covered
- Rating range
- Any remaining issues

- [ ] **Step 4: Commit final state**

```bash
git add -A
git commit -m "feat: complete puzzle system overhaul with validated database"
```

---

## Success Criteria

- [ ] All puzzles have legal FENs (verified by engine)
- [ ] All solutions have eval ≥ 1.5 pawns better than alternatives
- [ ] All defensive replies lead to losing positions (≥1.0 pawn disadvantage)
- [ ] No duplicate FENs in database
- [ ] Puzzles don't repeat within 20 selections
- [ ] Rating filtering works (±200, ±400 fallback)
- [ ] Hint penalty reduces rating gain by 50%
- [ ] Multi-move puzzles work correctly
- [ ] Page doesn't freeze during move input
- [ ] UI shows puzzle rating and hint status
