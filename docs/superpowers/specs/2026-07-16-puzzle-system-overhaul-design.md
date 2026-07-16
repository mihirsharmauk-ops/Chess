# Puzzle System Overhaul Design

## Problem Statement

The current chess puzzle system has critical quality issues:

1. **Illegal positions**: Multiple FENs contain impossible pawn structures (e.g., black pawns on both rank 7 AND advanced squares, giving 9+ pawns)
2. **Non-tactical puzzles**: Many "puzzles" are just standard opening moves where multiple moves are equally good, not "find the one winning move"
3. **Incorrect solutions**: Some solutions (especially back rank mates) don't actually work because defenders exist
4. **Duplicate positions**: Same FEN appears multiple times with different ratings
5. **Repetitive selection**: Random selection shows the same ~10 puzzles repeatedly
6. **No hint penalty**: Using hints doesn't reduce rating gain
7. **No adaptive difficulty**: Same puzzles shown regardless of user rating
8. **Single-move only**: Most puzzles have only 1 move, not multi-move sequences

## Solution: Engine-Validated Static Database

### Approach
- Hand-craft ~90 puzzles from well-known tactical positions
- Validate EVERY position and solution using chess-engine.js
- Store as static JSON in chess.html
- Runtime selection filters by user rating and avoids repeats

### Puzzle Data Format

```javascript
{
  fen: '6k1/5ppp/4R3/8/8/8/5PPP/6K1 w - - 0 1',
  moves: ['e6e8'],           // Solution moves (user's moves)
  opponent: [],               // Opponent's forced replies between user moves
  rating: 950,                // Puzzle difficulty rating
  category: 'mate1',         // For tracking/stats
  verified: true              // Marked as engine-validated
}
```

**Multi-move example** (deflection + back rank mate):
```javascript
{
  fen: '2r3k1/5ppp/8/8/8/8/5PPP/1R2R1K1 w - - 0 1',
  moves: ['e1e8', 'b1e8'],   // User plays Re8+, then Rxe8#
  opponent: ['c8e8'],         // Opponent plays Rxe8 (forced recapture)
  rating: 1100,
  category: 'mate2',
  verified: true
}
```
1. Re8+ (check) → Rxe8 (forced) → Rxe8# (back rank mate)

### Puzzle Categories (~90 total)

| Category | Count | Rating Range | Description |
|----------|-------|--------------|-------------|
| Mate in 1 | 15 | 800-1000 | Simple back rank mates, corridor mates |
| Mate in 2-3 | 20 | 1000-1300 | Combination mates with forced sequences |
| Forks | 15 | 1100-1400 | Knight forks, queen forks, pawn forks |
| Pins & Skewers | 15 | 1200-1500 | Absolute pins, relative pins, skewers |
| Discovered Attacks | 10 | 1300-1600 | Discovered checks, double attacks |
| Deflection/Overload | 10 | 1400-1700 | Removing defenders, overloaded pieces |
| Smothered/Pattern mates | 5 | 1500-1800 | Famous patterns (smothered mate, etc.) |

### Selection Logic

**Rating-based filtering:**
1. Filter PUZZLE_DB to puzzles where `|puzzle.rating - user.rating| ≤ 200`
2. If fewer than 10 puzzles match, widen to `±400`
3. If still fewer than 5, clear history and retry

**Anti-repetition:**
- Track last 20 shown puzzle FENs in array
- Never show a puzzle shown in last 20
- Reset history when user starts new session

**Hint penalty:**
- If user used a hint: `ratingGain = Math.round(ratingGain * 0.5)`
- Show "(hint used)" text when hint penalty applies

### Validation Script

One-time script (`validate-puzzles.js`) that runs in Node.js with chess-engine.js:

**For each puzzle, checks:**
1. **FEN legality**: Load FEN in engine, verify no errors
2. **Solution correctness**: Play solution move, verify it's engine's best move (eval ≥ 1.5 pawns better than alternatives)
3. **Defensive coverage**: For each opponent response, verify position still evaluates to ≥ 1.0 pawn advantage for puzzle side
4. **No stalemates**: Verify position isn't stalemate
5. **Move legality**: Verify all moves in sequence are legal

**Output:**
- Console log for each puzzle: PASS/FAIL with details
- Generate cleaned PUZZLE_DB with only validated puzzles
- Report: X passed, Y failed, Z had illegal FENs

### Implementation Steps

1. **Create validation script** (`validate-puzzles.js`)
   - Import chess-engine.js
   - Define test cases for each validation check
   - Output results and cleaned database

2. **Hand-craft puzzle database**
   - Create ~100 initial puzzles from known tactical positions
   - Run validation script
   - Fix or remove failed puzzles
   - Iterate until ~90 pass validation

3. **Update chess.html**
   - Replace old PUZZLE_DB with validated version
   - Update generatePuzzle() with new selection logic
   - Add rating-based filtering
   - Add anti-repetition tracking
   - Add hint penalty to processPuzzleMove()
   - Update UI to show puzzle rating and hint status

4. **Test and verify**
   - Start dev server
   - Test puzzle selection
   - Test hint penalty
   - Test adaptive difficulty
   - Verify no repeats in 20+ puzzles

### Success Criteria

- All puzzles have legal FENs (verified by engine)
- All solutions have eval ≥ 1.5 pawns better than alternatives
- All defensive replies lead to losing positions (≥1.0 pawn disadvantage)
- No duplicate FENs in database
- Puzzles don't repeat within 20 selections
- Rating filtering works (±200, ±400 fallback)
- Hint penalty reduces rating gain by 50%
- Multi-move puzzles work correctly (opponent replies played automatically)
- UI shows puzzle rating and hint status

### Files to Modify

- `chess.html`: Main file with puzzle UI and logic
- `validate-puzzles.js`: New validation script (one-time use)
- `chess-engine.js`: No changes needed (already has required methods)

### Risk Mitigation

- **Validation script complexity**: Use simple eval comparison, not full game tree analysis
- **Puzzle quality**: Start with well-known tactical patterns from famous games
- **Performance**: Static database loads instantly, no runtime generation needed
- **Edge cases**: Validate FENs before adding to database, catch illegal positions early
