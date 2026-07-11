/* 
  canvas描画
*/

// 盤面・操作中のぷに・演出エフェクトをcanvasへ描画する
function draw(){
  ctx.clearRect(0, 0, c.width, c.height);

  for(let y = 0; y < ROW; y++){
    for(let x = 0; x < COL; x++){
      if(grid[y][x] !== null){
        drawCat(imgs[grid[y][x]], x * SIZE, y * SIZE, bounceMap[y][x]);
      }
    }
  }

  if(current){
    drawCat(imgs[current.cat], current.x * SIZE, current.y * SIZE, current.bounce);
  }

  drawEffects();
}

// 画像をバウンド量に合わせて伸縮させながら描画する
function drawCat(img, x, y, bounce = 0){
  if(!img || !img.complete) return;

  const sx = 1 + bounce * 0.25;
  const sy = 1 - bounce * 0.15;
  const w = SIZE * sx;
  const h = SIZE * sy;

  ctx.drawImage(img, x - (w - SIZE) / 2, y - (h - SIZE), w, h);
}

// 消去演出の粒を動かしながら描画し、寿命切れを削除する
function drawEffects(){
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for(let i = effects.length - 1; i >= 0; i--){
    const e = effects[i];
    e.life--;

    if(e.life <= 0){
      effects.splice(i, 1);
      continue;
    }

    e.x += Math.cos(e.angle) * e.speed;
    e.y += Math.sin(e.angle) * e.speed;
    e.speed *= 0.97;

    ctx.save();
    ctx.globalAlpha = e.life / 40;
    ctx.font = `${e.size}px sans-serif`;
    ctx.fillText(e.emoji, e.x, e.y);
    ctx.restore();
  }
}

// 指定したマスの中心から消去演出の粒を発生させる
function addEffect(gx, gy){
  const marks = ["*", "+", "o", "!", "x"];

  for(let i = 0; i < 12; i++){
    effects.push({
      x: gx * SIZE + SIZE / 2,
      y: gy * SIZE + SIZE / 2,
      angle: Math.random() * Math.PI * 2,
      speed: 2 + Math.random() * 4,
      size: 18 + Math.random() * 10,
      life: 40,
      emoji: marks[Math.floor(Math.random() * marks.length)]
    });
  }
}
