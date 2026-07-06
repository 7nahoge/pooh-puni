
const c = document.getElementById("c");
const ctx = c.getContext("2d");

const startBtn = document.getElementById("startBtn");
const scoreLabel = document.getElementById("score");
const chainLabel = document.getElementById("chain");

const COL = 6;
const ROW = 10;
const SIZE = 60;
const DROP_INTERVAL = 450; // 450msごとに1マス

c.width = COL * SIZE;
c.height = ROW * SIZE;

let grid;
let imgs = [];
let current = null;

let score = 0;
let chain = 0;

let running = true;
let animationId = null;
let lockControl = false;
let bounceMap;
let lastDrop = 0;

let effects = [];

// 📦 画像を固定ロード
function loadImages(){
  const paths = [
    "image/img1.png",
    "image/img2.png",
    "image/img3.png",
    "image/img4.png",
    "image/img5.png",
    "image/img6.png",
    "image/img7.png",
    "image/img8.png" 
  ];

  imgs = paths.map(p=>{
    const img = new Image();
    img.src = p;
    return img;
  });
}

function initGrid(){

  grid = Array.from({length:ROW},()=>Array(COL).fill(null));

  bounceMap = Array.from(
      {length:ROW},
      ()=>Array(COL).fill(0)
  );
}

document.getElementById("startBtn").onclick = async ()=>{
  cancelAnimationFrame(animationId);

  running = false;

  loadImages();
  initGrid();

  sanitizeGrid();

  await waitImagesLoaded();

  running = true;
  lastDrop = 0;
  score = 0;
  chain = 0;

  updateUI();

  spawn();
  animationId = requestAnimationFrame(loop);
};

function waitImagesLoaded(){

  return new Promise(resolve=>{

    let loaded = 0;

    imgs.forEach(img=>{

      img.onload = ()=>{
        loaded++;
        if(loaded === imgs.length){
          resolve();
        }
      };

      img.onerror = ()=>{
        loaded++;
        if(loaded === imgs.length){
          resolve();
        }
      };

    });

  });
}

function rand(){
  return Math.floor(Math.random()*imgs.length);
}

function spawn(){

  let r = rand();

  if(r < 0 || r >= imgs.length || isNaN(r)){
    r = 0;
  }

  current = {
    x: Math.floor(COL/2),
    y: 0,
    cat: r,
    bounce: 0
  };

  if(!can(current.x,current.y)){
    gameOver();
  }
}

function sanitizeGrid(){
  for(let y=0;y<ROW;y++){
    for(let x=0;x<COL;x++){
      if(
          grid[y][x] !== null &&
          typeof grid[y][x] !== "number"
      ){
          grid[y][x] = null;
      }
    }
  }
}

function gameOver(){

  running = false;
  current = null;

  alert(
    "GAME OVER\nSCORE:"+score
  );
}

function can(x,y){
  return x>=0 && x<COL && y>=0 && y<ROW && grid[y][x] === null;
}

function move(dx,dy){
  if(!current || lockControl) return;

  if(can(current.x+dx,current.y+dy)){
    current.x+=dx;
  }
}

function lock(){

  grid[current.y][current.x] = current.cat;

  bounceMap[current.y][current.x] = 1;

  sanitizeGrid(); 

  resolveChains();

  spawn();
}

function drop(){
  if(lockControl) return;

  if(can(current.x,current.y+1)){
    current.y++;
  }else{
    lock();
  }
}

function check(){
  let visited = Array.from({length:ROW},()=>Array(COL).fill(false));
  let cleared = 0;

  function dfs(x,y,color,group){
    if(
      x<0||y<0||x>=COL||y>=ROW||
      visited[y][x]||
      grid[y][x]!==color
    ) return;

    visited[y][x]=true;
    group.push([x,y]);

    dfs(x+1,y,color,group);
    dfs(x-1,y,color,group);
    dfs(x,y+1,color,group);
    dfs(x,y-1,color,group);
  }

  for(let y=0;y<ROW;y++){
    for(let x=0;x<COL;x++){
      if(grid[y][x]!==null && !visited[y][x]){
        let group=[];
        dfs(x,y,grid[y][x],group);

        if(group.length>=4){
          cleared += group.length;

          for(let [gx,gy] of group){
            addEffect(gx,gy);
            grid[gy][gx]=null;
          }
        }
      }
    }
  }

  if(cleared>0){
    chain++;
    score += cleared * 10 + chain * 5;
    updateUI();
  } else {
    chain=0;
    if(chainLabel){
      chainLabel.innerText = "";
    }
  }
  return cleared;
}

function resolveChains(){
  sanitizeGrid(); 

  lockControl = true;

  while(true){

    applyGravity();
    const cleared = check();

    if(cleared === 0) break;

  }

  setTimeout(()=>{
    lockControl = false;
  }, 300); // 少し待って解除
}

function draw(){
  ctx.clearRect(0,0,c.width,c.height);
  
  for(let y=0;y<ROW;y++){
    for(let x=0;x<COL;x++){

      if(grid[y][x]!==null){
        drawCat(
          imgs[grid[y][x]],
          x*SIZE,
          y*SIZE,
          bounceMap[y][x]
        );
      }
    }
  }

function drawEffects(){

    for(let i=effects.length-1;i>=0;i--){

        const e = effects[i];

        e.life--;

        if(e.life<=0){
            effects.splice(i,1);
            continue;
        }

        e.x += Math.cos(e.angle) * e.speed;
        e.y += Math.sin(e.angle) * e.speed;

        e.alpha = e.life / 30;

        ctx.save();

        ctx.globalAlpha = e.alpha;

        ctx.fillStyle = e.color;

        ctx.beginPath();

        ctx.arc(
            e.x,
            e.y,
            e.size,
            0,
            Math.PI*2
        );

        ctx.fill();

        ctx.restore();
    }

}
  if(current){
    drawCat(
      imgs[current.cat],
      current.x*SIZE,
      current.y*SIZE,
      current.bounce
    );
  }
  drawEffects();
}

function drawCat(img,x,y,bounce=0){

  if(!img || !img.complete) return;

  const sx = 1 + bounce * 0.25;
  const sy = 1 - bounce * 0.15;

  const w = SIZE * sx;
  const h = SIZE * sy;

  ctx.drawImage(
    img,
    x-(w-SIZE)/2,
    y-(h-SIZE),
    w,
    h
  );
}

function addEffect(gx, gy){
    const count = 10;   // 星の数
    for(let i=0;i<count;i++){

        effects.push({

            x: gx * SIZE + SIZE / 2,
            y: gy * SIZE + SIZE / 2,

            angle: Math.random() * Math.PI * 2,
            speed: 1 + Math.random() * 3,

            size: 2 + Math.random() * 4,

            life: 30,
            alpha: 1,

            color: [
                "#fff799",
                "#ffe066",
                "#ffd43b",
                "#ffffff"
            ][Math.floor(Math.random()*4)]

        });
    }
}

function updateUI() {
    scoreLabel.innerText = "SCORE: " + score;

    if (chainLabel) {
        chainLabel.innerText = chain > 0
            ? `${chain} CHAIN!! 💥`
            : "";
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

    for(let y=0;y<ROW;y++){
      for(let x=0;x<COL;x++){
          bounceMap[y][x] *= 0.93;

          if(bounceMap[y][x] < 0.01){
              bounceMap[y][x] = 0;
          }
      }
    }
}

function applyGravity(){

  for(let x=0;x<COL;x++){

    let stack=[];

    for(let y=ROW-1;y>=0;y--){

      if(grid[y][x]!==null){
        stack.push(grid[y][x]);
      }
    }

    for(let y=ROW-1;y>=0;y--){

      if(stack.length){
        grid[y][x]=stack.shift();
      }else{
        grid[y][x]=null;
      }
    }
  }
}

// keyboard
document.addEventListener("keydown",e=>{
  if(!current) return;
  if(e.key==="ArrowLeft") move(-1,0);
  if(e.key==="ArrowRight") move(1,0);
  if(e.key==="ArrowDown") drop();
});

// touch
let sx,sy;
c.addEventListener("touchstart",e=>{
  sx=e.touches[0].clientX;
  sy=e.touches[0].clientY;
});

c.addEventListener("touchend",e=>{
  let dx=e.changedTouches[0].clientX - sx;
  let dy=e.changedTouches[0].clientY - sy;

  if(Math.abs(dx)>Math.abs(dy)){
    if(dx>30) move(1,0);
    else if(dx<-30) move(-1,0);
  } else {
    if(dy>30) drop();
  }
});