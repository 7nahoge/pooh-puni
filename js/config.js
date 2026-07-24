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
const legendReward = document.getElementById("legendReward");
const rewardDownload = document.getElementById("rewardDownload");
const restartBtn = document.getElementById("restartBtn");
const endBtn = document.getElementById("endBtn");

const COL = 6;
const ROW = 10;
const SIZE = 60;
const DROP_INTERVAL = 700;
const HIGH_SCORE_TARGET = 500;
const LEGEND_SCORE_TARGET = 1000;
const SCORE_PER_CLEARED = 35;
const CHAIN_BONUS = 50;
const REWARD_WALLPAPER_PATH = "image/rewards/legend-wallpaper.png";
const REWARD_WALLPAPER_NAME = "pupu-puni-legend-wallpaper.png";

c.width = COL * SIZE;
c.height = ROW * SIZE;

// ゲームオーバーのポップアップに最終スコアを表示する
function showGameOverPopup(){
  if(finalScore){
    finalScore.innerText = "SCORE: " + score;
  }

  if(gameOverMessage){
    if(score >= LEGEND_SCORE_TARGET){
      gameOverMessage.innerText = "Amazing! You scored over 10000!";
    }else if(score >= HIGH_SCORE_TARGET){
      gameOverMessage.innerText = "Great job! You scored over 5000!";
    }else{
      gameOverMessage.innerText = "So close. Aim for over 5000 next time!";
    }
  }

  if(gameOverPopup){
    gameOverPopup.classList.toggle("isClear", score >= HIGH_SCORE_TARGET);
    gameOverPopup.classList.toggle("isLegend", score >= LEGEND_SCORE_TARGET);
    gameOverPopup.classList.remove("hidden");
  }

  if(legendReward){
    legendReward.hidden = score < LEGEND_SCORE_TARGET;
  }

  if(rewardDownload && score >= LEGEND_SCORE_TARGET){
    rewardDownload.href = REWARD_WALLPAPER_PATH;
    rewardDownload.download = REWARD_WALLPAPER_NAME;
    rewardDownload.setAttribute("aria-disabled", "false");
  }else if(rewardDownload){
    rewardDownload.removeAttribute("href");
    rewardDownload.removeAttribute("download");
    rewardDownload.setAttribute("aria-disabled", "true");
  }
}

// ゲームオーバーのポップアップを非表示にする
function hideGameOverPopup(){
  if(gameOverPopup){
    gameOverPopup.classList.add("hidden");
    gameOverPopup.classList.remove("isClear");
    gameOverPopup.classList.remove("isLegend");
  }

  if(legendReward){
    legendReward.hidden = true;
  }

  if(rewardDownload){
    rewardDownload.removeAttribute("href");
    rewardDownload.removeAttribute("download");
    rewardDownload.setAttribute("aria-disabled", "true");
  }
}

// スコアと連鎖数の表示を現在の状態に更新する
function updateUI(){
  scoreLabel.innerText = "SCORE: " + score;

  if(chainLabel){
    chainLabel.innerText = chain > 0 ? `${chain} CHAIN!!` : "";
  }
}

if(rewardDownload){
  rewardDownload.addEventListener("click", e => {
    if(score < LEGEND_SCORE_TARGET){
      e.preventDefault();
    }
  });
}
