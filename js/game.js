/* 
  ゲーム開始/終了、落下、スポーン、メインループ、キーボード/タッチ操作
*/

// ゲームの状態を初期化してプレイを開始する
async function startGame() {
  initAudio();
  cancelAnimationFrame(animationId);
  stopBgm();

  running = false;
  hideGameOverPopup();

  loadImages();
  initGrid();
  sanitizeGrid();

  await waitImagesLoaded();

  running = true;
  lastDrop = 0;
  score = 0;
  chain = 0;

  updateUI();
  startBgm();

  spawn();
  animationId = requestAnimationFrame(loop);
}

// ゲームを終了して盤面やスコアをリセットする
function endGame() {
  cancelAnimationFrame(animationId);
  stopBgm();

  running = false;
  current = null;
  score = 0;
  chain = 0;
  effects = [];

  hideGameOverPopup();
  updateUI();
  ctx.clearRect(0, 0, c.width, c.height);
}

// 新しい操作中のぷにを盤面上部に生成する
function spawn() {
  let r = rand();

  if (r < 0 || r >= imgs.length || isNaN(r)) {
    r = 0;
  }

  current = {
    x: Math.floor(COL / 2),
    y: 0,
    cat: r,
    bounce: 0
  };

  if (!can(current.x, current.y)) {
    gameOver();
  }
}

// ゲームオーバー状態にして効果音とポップアップを出す
function gameOver() {
  running = false;
  current = null;
  stopBgm();
  // スコアが5000点以上なら勝利音楽を再生、それ以外はゲームオーバー音楽を再生
  if (score >= HIGH_SCORE_TARGET) {
    playVictoryGameOverMusic();
  } else {
    playGameOverMusic();
  }

  showGameOverPopup();
}

// 操作中のぷにを指定方向に移動する
function move(dx, dy) {
  if (!current || lockControl) return;

  if (can(current.x + dx, current.y + dy)) {
    current.x += dx;
  }
}

// 操作中のぷにを盤面に固定して連鎖判定へ進める
function lock() {
  grid[current.y][current.x] = current.cat;
  bounceMap[current.y][current.x] = 1;
  playCuteDogSound();

  sanitizeGrid();
  resolveChains();
  spawn();
}

// 操作中のぷにを1マス下げ、下げられない場合は固定する
function drop() {
  if (lockControl) return;

  if (can(current.x, current.y + 1)) {
    current.y++;
  } else {
    lock();
  }
}

// ゲームのメインループとして落下・描画・バウンド減衰を行う
function loop(time) {
  if (!running) return;

  if (time - lastDrop > DROP_INTERVAL) {
    drop();
    lastDrop = time;
  }

  draw();
  animationId = requestAnimationFrame(loop);

  for (let y = 0; y < ROW; y++) {
    for (let x = 0; x < COL; x++) {
      bounceMap[y][x] *= 0.93;
      if (bounceMap[y][x] < 0.01) bounceMap[y][x] = 0;
    }
  }
}

startBtn.onclick = startGame;
restartBtn.onclick = startGame;
endBtn.onclick = endGame;

document.addEventListener(
  "keydown",
  // キーボード入力で左右移動と下方向への落下を行う
  e => {
    if (!current) return;
    if (e.key === "ArrowLeft") move(-1, 0);
    if (e.key === "ArrowRight") move(1, 0);
    if (e.key === "ArrowDown") drop();
  }
);

let tx, ty;
const SWIPE = 30;
const TOUCH_MOVE_INTERVAL = 200;
const TOUCH_DROP_INTERVAL = 200;
let lastTouchMove = 0;
let lastTouchDrop = 0;

c.addEventListener(
  "touchstart",
  // タッチ開始位置を記録してスワイプ判定の基準にする
  e => {
    e.preventDefault();
    tx = e.touches[0].clientX;
    ty = e.touches[0].clientY;
  },
  { passive: false }
);

c.addEventListener(
  "touchmove",
  // タッチ移動量から左右移動または下方向への落下を行う
  e => {
    e.preventDefault();

    const dx = e.touches[0].clientX - tx;
    const dy = e.touches[0].clientY - ty;
    const now = Date.now();

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > SWIPE && now - lastTouchMove > TOUCH_MOVE_INTERVAL) {
        move(1, 0);
        lastTouchMove = now;
        tx = e.touches[0].clientX;
      } else if (dx < -SWIPE && now - lastTouchMove > TOUCH_MOVE_INTERVAL) {
        move(-1, 0);
        lastTouchMove = now;
        tx = e.touches[0].clientX;
      }
    } else if (dy > SWIPE && now - lastTouchDrop > TOUCH_DROP_INTERVAL) {
      drop();
      lastTouchDrop = now;
      ty = e.touches[0].clientY;
    }
  },
  { passive: false }
);
