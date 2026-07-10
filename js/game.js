/* 
  開始/終了、落下、スポーン、メインループ、キーボード/タッチ操作
*/

async function startGame(){
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

function endGame(){
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

function spawn(){
  let r = rand();

  if(r < 0 || r >= imgs.length || isNaN(r)){
    r = 0;
  }

  current = {
    x: Math.floor(COL / 2),
    y: 0,
    cat: r,
    bounce: 0
  };

  if(!can(current.x, current.y)){
    gameOver();
  }
}

function gameOver(){
  running = false;
  current = null;
  stopBgm();

  if(score > 5000){
    playVictoryGameOverMusic();
  }else{
    playGameOverMusic();
  }

  showGameOverPopup();
}

function move(dx, dy){
  if(!current || lockControl) return;

  if(can(current.x + dx, current.y + dy)){
    current.x += dx;
  }
}

function lock(){
  grid[current.y][current.x] = current.cat;
  bounceMap[current.y][current.x] = 1;
  playCuteDogSound();

  sanitizeGrid();
  resolveChains();
  spawn();
}

function drop(){
  if(lockControl) return;

  if(can(current.x, current.y + 1)){
    current.y++;
  }else{
    lock();
  }
}

function loop(time){
  if(!running) return;

  if(time - lastDrop > DROP_INTERVAL){
    drop();
    lastDrop = time;
  }

  draw();
  animationId = requestAnimationFrame(loop);

  for(let y = 0; y < ROW; y++){
    for(let x = 0; x < COL; x++){
      bounceMap[y][x] *= 0.93;
      if(bounceMap[y][x] < 0.01) bounceMap[y][x] = 0;
    }
  }
}

startBtn.onclick = startGame;
restartBtn.onclick = startGame;
endBtn.onclick = endGame;

document.addEventListener("keydown", e => {
  if(!current) return;
  if(e.key === "ArrowLeft") move(-1, 0);
  if(e.key === "ArrowRight") move(1, 0);
  if(e.key === "ArrowDown") drop();
});

let tx, ty;
const SWIPE = 30;
const TOUCH_MOVE_INTERVAL = 200;
const TOUCH_DROP_INTERVAL = 200;
let lastTouchMove = 0;
let lastTouchDrop = 0;

c.addEventListener("touchstart", e => {
  e.preventDefault();
  tx = e.touches[0].clientX;
  ty = e.touches[0].clientY;
}, {passive: false});

c.addEventListener("touchmove", e => {
  e.preventDefault();

  const dx = e.touches[0].clientX - tx;
  const dy = e.touches[0].clientY - ty;
  const now = Date.now();

  if(Math.abs(dx) > Math.abs(dy)){
    if(dx > SWIPE && now - lastTouchMove > TOUCH_MOVE_INTERVAL){
      move(1, 0);
      lastTouchMove = now;
      tx = e.touches[0].clientX;
    }else if(dx < -SWIPE && now - lastTouchMove > TOUCH_MOVE_INTERVAL){
      move(-1, 0);
      lastTouchMove = now;
      tx = e.touches[0].clientX;
    }
  }else if(dy > SWIPE && now - lastTouchDrop > TOUCH_DROP_INTERVAL){
    drop();
    lastTouchDrop = now;
    ty = e.touches[0].clientY;
  }
}, {passive: false});
