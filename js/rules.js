/* 
  消去判定、連鎖、重力
*/

// 同じ種類が4つ以上つながっている場所を探して消去する
function check(){
  let visited = Array.from(
    {length: ROW},
    // 1行分の訪問済みフラグ配列を作る
    () => Array(COL).fill(false)
  );
  let cleared = 0;

  // 指定マスから同じ種類のつながりを深さ優先探索で集める
  function dfs(x, y, color, group){
    if(x < 0 || y < 0 || x >= COL || y >= ROW || visited[y][x] || grid[y][x] !== color) return;

    visited[y][x] = true;
    group.push([x, y]);

    dfs(x + 1, y, color, group);
    dfs(x - 1, y, color, group);
    dfs(x, y + 1, color, group);
    dfs(x, y - 1, color, group);
  }

  for(let y = 0; y < ROW; y++){
    for(let x = 0; x < COL; x++){
      if(grid[y][x] !== null && !visited[y][x]){
        let group = [];
        dfs(x, y, grid[y][x], group);

        if(group.length >= 4){
          cleared += group.length;

          for(let [gx, gy] of group){
            addEffect(gx, gy);
            grid[gy][gx] = null;
          }
        }
      }
    }
  }

  if(cleared > 0){
    chain++;
    score += cleared * SCORE_PER_CLEARED + chain * CHAIN_BONUS;
    updateUI();
    playDogPartySound(chain, cleared);
  }else{
    chain = 0;
    if(chainLabel) chainLabel.innerText = "";
  }

  return cleared;
}

// 重力と消去判定を繰り返して連鎖をすべて解決する
function resolveChains(){
  sanitizeGrid();
  lockControl = true;

  while(true){
    applyGravity();
    const cleared = check();
    if(cleared === 0) break;
  }

  // 連鎖処理後に操作ロックを解除する
  setTimeout(
    // 連鎖処理後に操作ロックを解除する
    () => {
      lockControl = false;
    },
    300
  );
}

// 各列のぷにを下へ詰め、落下があればバウンドと効果音を出す
function applyGravity(){
  let dropped = 0;

  for(let x = 0; x < COL; x++){
    let stack = [];

    for(let y = ROW - 1; y >= 0; y--){
      if(grid[y][x] !== null){
        stack.push({cat: grid[y][x], fromY: y});
      }
    }

    for(let y = ROW - 1; y >= 0; y--){
      if(stack.length){
        const item = stack.shift();
        grid[y][x] = item.cat;

        if(item.fromY !== y){
          bounceMap[y][x] = 1;
          dropped++;
        }
      }else{
        grid[y][x] = null;
      }
    }
  }

  if(dropped > 0){
    playCuteDogSound(Math.min(1, 0.65 + dropped * 0.1));
  }
}
