var fs=require('fs');
var code=fs.readFileSync('chess-engine.js','utf8');
var m={exports:{}};eval(code+';m.exports=ChessEngine;');
var E=m.exports;

function checkExercise(name,fen,sol){
  var e=new E();e.loadFEN(fen);
  var from=sol.substring(0,2),to=sol.substring(2,4);
  var legal=e.moves(from);
  var found=null;
  for(var j=0;j<legal.length;j++){
    if(legal[j].to===to){found=legal[j];break;}
  }
  if(!found){console.log(name+' ILLEGAL: '+sol);return;}
  e.makeMove(found);
  var result=e.isCheckmate()?'CHECKMATE':e.isCheck()?'CHECK':e.isGameOver()?'GAME OVER':'ongoing';
  console.log(name+' -> '+result);
}

console.log('=== CURRENT (WRONG) ===');
checkExercise('b8','5rk1/5ppp/8/8/8/8/5PPP/R3R1K1 w - - 0 1','e1e8');
checkExercise('i1','2r3k1/5ppp/8/8/8/8/5PPP/1R3RK1 w - - 0 1','b1b8');
checkExercise('i7','4k3/8/8/8/8/5K2/7Q/8 w - - 0 1','h2h8');

console.log('\n=== FIXED ===');
checkExercise('b8 fixed','6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1','e1e8');
checkExercise('i1 fixed','6k1/5ppp/8/8/8/8/5PPP/1R4K1 w - - 0 1','b1b8');
checkExercise('i7 fixed Q mate','6k1/5ppp/8/8/8/8/5PPP/4Q1K1 w - - 0 1','e1e8');
