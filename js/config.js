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
const legendRewardTitle = document.getElementById("legendRewardTitle");
const rewardDownload = document.getElementById("rewardDownload");
const restartBtn = document.getElementById("restartBtn");
const endBtn = document.getElementById("endBtn");

const COL = 6;
const ROW = 10;
const SIZE = 60;
const DROP_INTERVAL = 700;
const HIGH_SCORE_TARGET = 5000;
const LEGEND_SCORE_TARGET = 10000;
const SCORE_PER_CLEARED = 40;
const CHAIN_BONUS = 55;
const REWARD_WALLPAPER_PATH = "image/rewards/legend-wallpaper.png";
const REWARD_WALLPAPER_NAME = "pupu-puni-legend-wallpaper.png";
const SECOND_REWARD_SCORE_TARGET = 20000;
const SECOND_REWARD_WALLPAPER_PATH = "image/rewards/legend-wallpaper2.jpg";
const SECOND_REWARD_WALLPAPER_NAME = "legend-wallpaper2.jpg";

c.width = COL * SIZE;
c.height = ROW * SIZE;

// 描画座標は維持し、Safariのツールバーとセーフエリアを除いた領域に盤面を収める。
function resizeCanvasDisplay(){
  const viewport = window.visualViewport;
  const viewportBottom = viewport
    ? viewport.offsetTop + viewport.height
    : window.innerHeight;
  const bodyStyle = getComputedStyle(document.body);
  const availableWidth = document.documentElement.clientWidth
    - parseFloat(bodyStyle.paddingLeft) - parseFloat(bodyStyle.paddingRight) - 4;
  const availableHeight = viewportBottom - c.getBoundingClientRect().top
    - parseFloat(bodyStyle.paddingBottom) - 4;
  const scale = Math.max(0, Math.min(1, availableWidth / c.width, availableHeight / c.height));

  c.style.width = `${c.width * scale}px`;
  c.style.height = `${c.height * scale}px`;
}

window.addEventListener("resize", resizeCanvasDisplay);
window.visualViewport?.addEventListener("resize", resizeCanvasDisplay);
window.addEventListener("load", resizeCanvasDisplay);
resizeCanvasDisplay();

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

  if(legendRewardTitle){
    legendRewardTitle.innerText = score > SECOND_REWARD_SCORE_TARGET
      ? "20,000点超えプレゼント！"
      : "10,000点達成プレゼント！";
  }

  if(rewardDownload && score >= LEGEND_SCORE_TARGET){
    const isSecondReward = score > SECOND_REWARD_SCORE_TARGET;
    rewardDownload.href = isSecondReward ? SECOND_REWARD_WALLPAPER_PATH : REWARD_WALLPAPER_PATH;
    rewardDownload.download = isSecondReward ? SECOND_REWARD_WALLPAPER_NAME : REWARD_WALLPAPER_NAME;
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
