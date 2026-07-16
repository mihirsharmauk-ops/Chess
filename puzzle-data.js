const PUZZLES = [
  {
    "fen": "6k1/5ppp/4R3/8/8/8/5PPP/4R1K1 w - - 0 1",
    "moves": [
      "e6e8"
    ],
    "rating": 850,
    "category": "mate1"
  },
  {
    "fen": "6k1/5ppp/8/8/8/8/5PPP/1R4K1 w - - 0 1",
    "moves": [
      "b1b8"
    ],
    "rating": 850,
    "category": "mate1"
  },
  {
    "fen": "6k1/5ppp/8/8/8/8/5PPP/R3K3 w - - 0 1",
    "moves": [
      "a1a8"
    ],
    "rating": 860,
    "category": "mate1"
  },
  {
    "fen": "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
    "moves": [
      "d1d8"
    ],
    "rating": 860,
    "category": "mate1"
  },
  {
    "fen": "6k1/5ppp/8/4Q3/8/8/5PPP/4R1K1 w - - 0 1",
    "moves": [
      "e5e8"
    ],
    "rating": 870,
    "category": "mate1"
  },
  {
    "fen": "6k1/5ppp/8/8/8/8/2Q3PPP/2R3K1 w - - 0 1",
    "moves": [
      "c2c8"
    ],
    "rating": 880,
    "category": "mate1"
  },
  {
    "fen": "6k1/5ppp/8/8/8/8/1Q3PPP/1R4K1 w - - 0 1",
    "moves": [
      "b2b8"
    ],
    "rating": 880,
    "category": "mate1"
  },
  {
    "fen": "6k1/4Rppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    "moves": [
      "e7e8"
    ],
    "rating": 870,
    "category": "mate1"
  },
  {
    "fen": "6k1/5ppp/8/8/8/8/R4PPP/4R1K1 w - - 0 1",
    "moves": [
      "a2a8"
    ],
    "rating": 870,
    "category": "mate1"
  },
  {
    "fen": "6k1/5ppp/4Q3/8/8/8/5PPP/4R1K1 w - - 0 1",
    "moves": [
      "e6e8"
    ],
    "rating": 880,
    "category": "mate1"
  },
  {
    "fen": "6k1/5ppp/R7/8/8/8/5PPP/4R1K1 w - - 0 1",
    "moves": [
      "a6a8"
    ],
    "rating": 870,
    "category": "mate1"
  },
  {
    "fen": "5rk1/4Q1pp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    "moves": [
      "e7e8"
    ],
    "rating": 920,
    "category": "mate1"
  },
  {
    "fen": "6k1/5ppp/8/8/8/8/4QPPP/4R1K1 w - - 0 1",
    "moves": [
      "e2e8"
    ],
    "rating": 880,
    "category": "mate1"
  },
  {
    "fen": "1k1r4/pp4pp/8/8/8/8/PP4PP/1K1R2R1 w - - 0 1",
    "moves": [
      "d1d8"
    ],
    "rating": 1080,
    "category": "backrank"
  },
  {
    "fen": "2kr4/ppp2ppp/8/8/8/8/PP4PP/1K1R2R1 w - - 0 1",
    "moves": [
      "d1d8"
    ],
    "rating": 1080,
    "category": "backrank"
  },
  {
    "fen": "r4rk1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
    "moves": [
      "d1d8"
    ],
    "rating": 1120,
    "category": "backrank"
  },
  {
    "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    "moves": [
      "f3g5"
    ],
    "rating": 1150,
    "category": "fork"
  },
  {
    "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 4",
    "moves": [
      "f3g5"
    ],
    "rating": 1200,
    "category": "fork"
  },
  {
    "fen": "r1bqk2r/ppppnppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
    "moves": [
      "f3g5"
    ],
    "rating": 1200,
    "category": "fork"
  },
  {
    "fen": "r2qkb1r/pp2pppp/2n2n2/2pp1b2/3P4/2N2N2/PPP1PPPP/R1BQKB1R w KQkq - 4 4",
    "moves": [
      "f3g5"
    ],
    "rating": 1250,
    "category": "fork"
  },
  {
    "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 2",
    "moves": [
      "f3g5"
    ],
    "rating": 1100,
    "category": "fork"
  },
  {
    "fen": "r1bqkbnr/pppppppp/2n5/4p3/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 1 3",
    "moves": [
      "d4e5"
    ],
    "rating": 1100,
    "category": "fork"
  },
  {
    "fen": "r1bqkb1r/pppppppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 3",
    "moves": [
      "f3g5"
    ],
    "rating": 1150,
    "category": "fork"
  },
  {
    "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2BPP3/5N2/PPP2PPP/RNBQK2R w KQkq - 0 5",
    "moves": [
      "d4c5"
    ],
    "rating": 1250,
    "category": "fork"
  },
  {
    "fen": "r2qkb1r/pp2pppp/2n2n2/2pp1b2/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
    "moves": [
      "c4d5"
    ],
    "rating": 1250,
    "category": "fork"
  },
  {
    "fen": "r1b1k2r/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 5",
    "moves": [
      "f3g5"
    ],
    "rating": 1200,
    "category": "fork"
  },
  {
    "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5",
    "moves": [
      "b1c3"
    ],
    "rating": 1150,
    "category": "fork"
  },
  {
    "fen": "r1bq1rk1/ppp2ppp/2np4/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQ - 0 7",
    "moves": [
      "d3d4"
    ],
    "rating": 1350,
    "category": "fork"
  },
  {
    "fen": "r1bqkb1r/pppppppp/2n2n2/4p3/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
    "moves": [
      "d4e5"
    ],
    "rating": 1100,
    "category": "fork"
  },
  {
    "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p1B1/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    "moves": [
      "g5f6"
    ],
    "rating": 1250,
    "category": "pin"
  },
  {
    "fen": "r1bqkb1r/pppppppp/2n2n2/4p1B1/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    "moves": [
      "f3e5"
    ],
    "rating": 1300,
    "category": "pin"
  },
  {
    "fen": "r2qk2r/ppp2ppp/2n2n2/2bPp3/2B5/5N2/PPP2PPP/RNBQK2R w KQkq - 0 6",
    "moves": [
      "d5c6"
    ],
    "rating": 1350,
    "category": "pin"
  },
  {
    "fen": "r1bqkb1r/pppppppp/2n2n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    "moves": [
      "f1c4"
    ],
    "rating": 1200,
    "category": "pin"
  },
  {
    "fen": "r1bqkbnr/pppppppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 3",
    "moves": [
      "b5c6"
    ],
    "rating": 1150,
    "category": "skewer"
  },
  {
    "fen": "r2qkb1r/pp2pppp/2n1bn2/2pp4/3P1B2/4PN2/PPP2PPP/RN1QKB1R w KQkq - 4 5",
    "moves": [
      "f1b5"
    ],
    "rating": 1400,
    "category": "pin"
  },
  {
    "fen": "r1bq1rk1/ppp2ppp/2n2n2/3p4/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w - - 0 7",
    "moves": [
      "c1g5"
    ],
    "rating": 1400,
    "category": "pin"
  },
  {
    "fen": "r2q1rk1/pppb1ppp/4pn2/3N4/3P4/8/PPP2PPP/R1BQ1RK1 w - - 0 9",
    "moves": [
      "d5f6"
    ],
    "rating": 1400,
    "category": "pin"
  },
  {
    "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P4/PPP1NPPP/RNBQK2R w KQkq - 0 4",
    "moves": [
      "c1g5"
    ],
    "rating": 1350,
    "category": "pin"
  },
  {
    "fen": "4k3/8/8/4B3/4R3/8/8/4K3 w - - 0 1",
    "moves": [
      "e5d6"
    ],
    "rating": 1350,
    "category": "discovery"
  },
  {
    "fen": "r1bqk2r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    "moves": [
      "f3g5"
    ],
    "rating": 1300,
    "category": "discovery"
  },
  {
    "fen": "r1bq1rk1/ppp2ppp/2n5/3N4/2b1P3/3B4/PPP2PPP/R2Q1RK1 w - - 0 10",
    "moves": [
      "d5e7"
    ],
    "rating": 1400,
    "category": "deflection"
  },
  {
    "fen": "r1b2rk1/ppp2ppp/2n5/3N4/2b1P3/8/PPP2PPP/R1B2RK1 w - - 0 10",
    "moves": [
      "d5e7"
    ],
    "rating": 1400,
    "category": "deflection"
  },
  {
    "fen": "r1bqkb1r/pppp1ppp/2n2n2/4N3/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    "moves": [
      "e5f7"
    ],
    "rating": 1350,
    "category": "deflection"
  },
  {
    "fen": "r1bq1rk1/pp2ppbp/2np2p1/8/2BPP3/2N2N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    "moves": [
      "e4e5"
    ],
    "rating": 1500,
    "category": "deflection"
  },
  {
    "fen": "r2q1rk1/ppp2ppp/2np4/2b1p3/2B1P1n1/3P1N2/PPP2PPP/RNBQ1RK1 w - - 0 1",
    "moves": [
      "f3g5"
    ],
    "rating": 1500,
    "category": "deflection"
  },
  {
    "fen": "r4rk1/1b2qppp/p2p4/1p6/3NP3/1BN5/PPP2PPP/R2Q1RK1 w - - 0 1",
    "moves": [
      "c3d5"
    ],
    "rating": 1500,
    "category": "deflection"
  },
  {
    "fen": "r1bq1rk1/pp2ppbp/2np2p1/2b5/2BPP3/2N2N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    "moves": [
      "e4e5"
    ],
    "rating": 1500,
    "category": "overload"
  },
  {
    "fen": "6rk/6pp/8/8/8/8/8/4Q1K1 w - - 0 1",
    "moves": [
      "e1e8"
    ],
    "rating": 1500,
    "category": "pattern_mate"
  },
  {
    "fen": "5rk1/5Npp/4Q3/8/8/8/8/5RK1 w - - 0 1",
    "moves": [
      "f7h6"
    ],
    "rating": 1550,
    "category": "pattern_mate"
  },
  {
    "fen": "r1b2k1r/ppppqppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQ - 0 7",
    "moves": [
      "c4f7"
    ],
    "rating": 1500,
    "category": "pattern_mate"
  },
  {
    "fen": "r1b2rk1/ppppqppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w - - 0 7",
    "moves": [
      "c4f7"
    ],
    "rating": 1600,
    "category": "pattern_mate"
  },
  {
    "fen": "rnbqkbnr/ppp1pppp/8/3p4/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 2",
    "moves": [
      "e4d5"
    ],
    "rating": 1100,
    "category": "opening_tactic"
  },
  {
    "fen": "r1bqkbnr/pppppppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    "moves": [
      "f1c4"
    ],
    "rating": 1100,
    "category": "opening_tactic"
  },
  {
    "fen": "6k1/5p1p/5QpB/8/8/8/5PPP/6K1 w - - 0 1",
    "moves": [
      "f6g7"
    ],
    "opponent": [],
    "rating": 1200,
    "category": "mate1"
  },
  {
    "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/R3K2R w KQkq - 0 5",
    "moves": [
      "e1g1"
    ],
    "opponent": [],
    "rating": 1400,
    "category": "backrank"
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = PUZZLES;
}
