/* 
  DOM取得、定数、canvasサイズ、スコア表示、ゲームオーバーポップアップ
*/

const c = document.getElementById("c");
const ctx = c.getContext("2d");

const startBtn = document.getElementById("startBtn");
const scoreLabel = document.getElementById("score");
const chainLabel = document.getElementById("chain");
const gameOverPopup = document.getElementById("gameOverPopup");
const finalScore = document.getElementById("finalScore");
const gameOverMessage = document.getElementById("gameOverMessage");
const restartBtn = document.getElementById("restartBtn");
const endBtn = document.getElementById("endBtn");

const COL = 6;
const ROW = 10;
const SIZE = 60;
const DROP_INTERVAL = 500;
const HIGH_SCORE_TARGET = 5000;
c.width = COL * SIZE;
c.height = ROW * SIZE;

// ゲームオーバーのポップアップに最終スコアを表示する
function showGameOverPopup(){
  if(finalScore){
    finalScore.innerText = "SCORE: " + score;
  }

  if(gameOverMessage){
    gameOverMessage.innerText = score >= HIGH_SCORE_TARGET
      ? "Great job! You scored over 5000!"
      : "So close. Aim for over 5000 next time!";
  }

  if(gameOverPopup){
    gameOverPopup.classList.toggle("isClear", score >= HIGH_SCORE_TARGET);
    gameOverPopup.classList.remove("hidden");
  }
}

// ゲームオーバーのポップアップを非表示にする
function hideGameOverPopup(){
  if(gameOverPopup){
    gameOverPopup.classList.add("hidden");
    gameOverPopup.classList.remove("isClear");
  }
}

// スコアと連鎖数の表示を現在の状態に更新する
function updateUI(){
  scoreLabel.innerText = "SCORE: " + score;

  if(chainLabel){
    chainLabel.innerText = chain > 0 ? `${chain} CHAIN!!` : "";
  }
}
