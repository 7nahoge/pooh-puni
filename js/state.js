/* 
  ゲーム状態、画像ロード、グリッド初期化
*/

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

  imgs = paths.map(path => {
    const img = new Image();
    img.src = path;
    return img;
  });
}

function waitImagesLoaded(){
  return new Promise(resolve => {
    let loaded = 0;
    const done = () => {
      loaded++;
      if(loaded === imgs.length) resolve();
    };

    imgs.forEach(img => {
      img.onload = done;
      img.onerror = done;
    });
  });
}

function initGrid(){
  grid = Array.from({length: ROW}, () => Array(COL).fill(null));
  bounceMap = Array.from({length: ROW}, () => Array(COL).fill(0));
}

function rand(){
  return Math.floor(Math.random() * imgs.length);
}

function sanitizeGrid(){
  for(let y = 0; y < ROW; y++){
    for(let x = 0; x < COL; x++){
      if(grid[y][x] !== null && typeof grid[y][x] !== "number"){
        grid[y][x] = null;
      }
    }
  }
}

function can(x, y){
  return x >= 0 && x < COL && y >= 0 && y < ROW && grid[y][x] === null;
}
