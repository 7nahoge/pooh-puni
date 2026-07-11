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

// ぷに画像を読み込み用のImageオブジェクトとして準備する
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

  imgs = paths.map(
    // 画像パスごとにImageを作成して読み込みを開始する
    path => {
      const img = new Image();
      img.src = path;
      return img;
    }
  );
}

// すべてのぷに画像の読み込み完了または失敗を待つ
function waitImagesLoaded(){
  return new Promise(
    // 画像の読み込み状態を監視し、全画像が処理されたら完了する
    resolve => {
      let loaded = 0;
      // 画像1枚の読み込み完了を数え、全枚数に達したら待機を終える
      const done = () => {
        loaded++;
        if(loaded === imgs.length) resolve();
      };

      imgs.forEach(
        // 各画像に読み込み完了と失敗時の共通ハンドラを設定する
        img => {
          img.onload = done;
          img.onerror = done;
        }
      );
    }
  );
}

// 盤面とバウンド情報を空の状態で初期化する
function initGrid(){
  grid = Array.from(
    {length: ROW},
    // 1行分の空マス配列を作る
    () => Array(COL).fill(null)
  );
  bounceMap = Array.from(
    {length: ROW},
    // 1行分のバウンド量配列を作る
    () => Array(COL).fill(0)
  );
}

// 読み込まれた画像の中からランダムな種類番号を返す
function rand(){
  return Math.floor(Math.random() * imgs.length);
}

// 盤面に不正な値が入っていた場合に空マスへ戻す
function sanitizeGrid(){
  for(let y = 0; y < ROW; y++){
    for(let x = 0; x < COL; x++){
      if(grid[y][x] !== null && typeof grid[y][x] !== "number"){
        grid[y][x] = null;
      }
    }
  }
}

// 指定した座標にぷにを置けるかどうかを判定する
function can(x, y){
  return x >= 0 && x < COL && y >= 0 && y < ROW && grid[y][x] === null;
}
