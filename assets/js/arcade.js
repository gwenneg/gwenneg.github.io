(function () {
  /* Retro arcade cameos: one short pixel animation plays inside the top bar of the home page, behind its text.
     layouts/baseof.html loads this script only when a cameo should play: on about a third of the views, never twice
     within three minutes, never for readers who ask for less motion. */
  const local = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  const rand = (a, b) => a + Math.random() * (b - a);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const GAMES = { ufo, snake, blocks, pong, runner, coin, pacman };

  setTimeout(start, rand(6000, 25000));

  function start() {
    if (document.hidden) { document.addEventListener('visibilitychange', start, { once: true }); return; }
    local('arcade-last', String(Date.now()));
    const names = Object.keys(GAMES);
    const name = names[Math.floor(rand(0, names.length))];
    const stage = document.createElement('div');
    stage.className = 'arcade';
    stage.setAttribute('aria-hidden', 'true');
    (document.querySelector('.topbar') || document.body).append(stage);
    stageW = stage.clientWidth;
    GAMES[name](stage).catch(() => {}).then(() => stage.remove());
  }

  /* ---------- pixel helpers ---------- */
  const PAL = {
    K: 'var(--fg-strong)', M: '#9AA0A6', m: '#6B7178', C: '#7FE0FF', A: 'var(--accent)', Y: '#FFD34D', R: '#E5484D',
    G: '#4CAF50', g: '#2E7D32', S: '#F1C27D', B: '#4F8DF7', P: '#5A4A78', T: '#8D6E63',
    W: '#F2F2F2', D: '#333333', N: '#F4A6B5', H: '#5D3A1A', F: '#2121DE', w: '#FFB8AE',
  };
  function sprite(rows, px) {
    let r = '';
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length;) {
        const c = row[x];
        if (c === '.') { x++; continue; }
        let n = 1;
        while (row[x + n] === c) n++;
        r += `<rect x="${x}" y="${y}" width="${n}" height="1" style="fill:${PAL[c]}"/>`;
        x += n;
      }
    });
    return `<svg viewBox="0 0 ${rows[0].length} ${rows.length}" width="${rows[0].length * px}" height="${rows.length * px}" shape-rendering="crispEdges">${r}</svg>`;
  }
  function el(stage, cls, html) {
    const e = document.createElement('div');
    e.className = cls;
    if (html) e.innerHTML = html;
    stage.append(e);
    return e;
  }
  /* two frames that alternate, for walking and flapping */
  const frames = (a, b) => `<span class="arcade-frames">${a}${b}</span>`;
  /* the stage's width: games run in the middle 60% of the top bar, not under its edges */
  let stageW = innerWidth;
  const W = () => stageW;

  /* ---------- the games, all inside the top bar ---------- */
  async function ufo(stage) {
    const H = stage.clientHeight, y = Math.round((H - 18) / 2) - 4;
    const ship = el(stage, 'arcade-sky', sprite([
      '....MMMMM....',
      '..MMCCCCCMM..',
      '.MMMMMMMMMMM.',
      'MAmAmAmAmAmAM',
      '.MMMMMMMMMMM.',
      '...m.....m...',
    ], 3) + '<i class="arcade-beam"></i>');
    /* the ship hovers near the top while it beams up the cow grazing below it */
    const hover = 1, shipBottom = hover + 18;
    ship.lastChild.style.height = (H - 3 - shipBottom) + 'px';
    const mid = rand(0.3, 0.7) * W();
    /* three cows: the one under the ship gets beamed up, the two others keep grazing on either side */
    const cowPx = H >= 50 ? 1.5 : 1, center = mid + 19.5;
    const cowUp = ['...........D.D.', '.DDDDDDDDDDWWWD', 'DWWDDWWWWWDWDWD', 'DWDDDWWWDDWWWWD', 'DWWWWWWDDDWNNND', 'DWWDDWWWWWDNNND', '.DDDDDDDDDD.DD.', '.D.D....D.D....'];
    const cowDown = ['...............', '.DDDDDDDDDD....', 'DWWDDWWWWWD.D.D', 'DWDDDWWWDDDWWWD', 'DWWWWWWDDDDWDWD', 'DWWDDWWWWWDWWWD', '.DDDDDDDDDDNNND', '.D.D....D.DNNND'];
    [-1, 1].forEach(side => {
      const grazer = el(stage, 'arcade-ground arcade-graze', frames(sprite([...cowUp, '.D.D....D.D.G.G'], cowPx), sprite([...cowDown, '.D.D....D.D.G.G'], cowPx)));
      grazer.style.left = (center + side * (H >= 50 ? 40 : 30) - 7.5 * cowPx) + 'px';
      if (side < 0) grazer.style.transform = 'scaleX(-1)';
      grazer.firstChild.style.setProperty('--graze-delay', side < 0 ? '-1.1s' : '0s');
    });
    const cow = el(stage, 'arcade-ground arcade-cow', sprite([...cowUp, '.D.D....D.D....'], cowPx));
    cow.style.left = (center - 7.5 * cowPx) + 'px';
    const lift = H - 3 - shipBottom;
    cow.animate([
      { transform: 'none', opacity: 1 },
      { transform: 'none', offset: 0.47 },
      { transform: `translateY(-${lift * 0.4}px) rotate(-8deg) scale(0.8)`, offset: 0.51 },
      { transform: `translateY(-${lift * 0.75}px) rotate(7deg) scale(0.55)`, offset: 0.55 },
      { transform: `translateY(-${lift}px) scale(0.25)`, opacity: 1, offset: 0.58 },
      { transform: `translateY(-${lift}px) scale(0.25)`, opacity: 0, offset: 0.59 },
      { transform: `translateY(-${lift}px) scale(0.25)`, opacity: 0 },
    ], { duration: 7000, fill: 'forwards' });
    ship.animate([
      { transform: `translate(-60px, ${y}px)` },
      { transform: `translate(${mid}px, ${hover}px)`, offset: 0.4 },
      { transform: `translate(${mid}px, ${hover}px)`, offset: 0.62 },
      { transform: `translate(${W() + 60}px, ${y - 2}px)` },
    ], { duration: 7000, easing: 'ease-in-out', fill: 'forwards' });
    ship.lastChild.animate([{ opacity: 0 }, { opacity: 0, offset: 0.42 }, { opacity: 0.6, offset: 0.46 }, { opacity: 0.6, offset: 0.58 }, { opacity: 0, offset: 0.6 }, { opacity: 0 }], { duration: 7000 });
    await wait(7000);
  }

  async function snake(stage) {
    /* a grid snake: one cell per tick, with turns up and down the bar; it grows when it eats the apple */
    const H = stage.clientHeight, cell = 6, tick = 50;
    const rows = Math.floor((H - 4) / cell), top = Math.floor((H - rows * cell) / 2), cols = Math.ceil(W() / cell);
    let len = 7;
    const path = [];
    let x = -len, y = Math.floor(rows / 2), run = Math.floor(rand(4, 9));
    path.push([x, y]);
    while (x < cols + len + 4) {
      if (run-- <= 0 && x > 2 && x < cols - 4) {
        const dir = y <= 0 ? 1 : y >= rows - 1 ? -1 : Math.random() < 0.5 ? -1 : 1;
        const steps = Math.max(1, Math.min(Math.floor(rand(2, rows)), dir > 0 ? rows - 1 - y : y));
        for (let k = 0; k < steps; k++) { y += dir; path.push([x, y]); }
        run = Math.floor(rand(5, 11));
      }
      x++;
      path.push([x, y]);
    }
    const at = (c, [cx, cy]) => { c.style.transform = `translate(${cx * cell}px, ${top + cy * cell}px)`; };
    let ai = Math.floor(path.length * rand(0.4, 0.65));
    const apple = el(stage, 'arcade-sky', sprite(['...g..', '.RRRR.', 'RRRRRR', 'RRRRRR', 'RRRRRR', '.RRRR.'], 1));
    at(apple, path[ai]);
    const segs = [];
    for (let h = 0; h < path.length; h++) {
      if (h === ai) { apple.remove(); len += 4; }
      while (segs.length < len) segs.push(el(stage, 'arcade-seg' + (segs.length ? '' : ' head')));
      segs.forEach((c, k) => {
        const idx = h - k;
        c.style.visibility = idx < 0 ? 'hidden' : '';
        if (idx >= 0) at(c, path[idx]);
      });
      await wait(tick);
    }
  }

  async function blocks(stage) {
    /* a tiny falling-block game that follows the rules: a piece falls until it rests on the floor or another block,
       a full row clears as soon as the piece that completes it locks, and the rows above drop by the rows cleared below them */
    const H = stage.clientHeight, cell = 7, width = 6;
    const well = el(stage, 'arcade-ground');
    well.style.left = rand(0.2, 0.75) * W() + 'px';
    const board = new Map();
    const key = (x, y) => x + ',' + y;
    const free = (x, y) => x >= 0 && x < width && y >= 0 && !board.has(key(x, y));
    const place = (c, x, y) => { c.style.left = x * cell + 'px'; c.style.bottom = y * cell + 'px'; };
    async function drop(shape, x, color) {
      let y = 8;
      while (shape.every(([dx, dy]) => free(x + dx, y - 1 + dy))) y--;
      const piece = shape.map(([dx, dy]) => {
        const c = document.createElement('i');
        c.className = 'arcade-cell';
        c.style.cssText = `width:${cell}px;height:${cell}px;background:${color}`;
        place(c, x + dx, y + dy);
        well.append(c);
        board.set(key(x + dx, y + dy), c);
        return c;
      });
      await Promise.all(piece.map(c => c.animate([{ transform: `translateY(-${H}px)` }, { transform: 'none' }], { duration: 1100, easing: 'steps(6)' }).finished));
      const full = [];
      for (let r = 0; r < 8; r++) if ([...Array(width).keys()].every(cx => board.has(key(cx, r)))) full.push(r);
      if (!full.length) return;
      const cleared = [...board].filter(([k]) => full.includes(+k.split(',')[1]));
      await Promise.all(cleared.map(([, c]) => c.animate([{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }, { opacity: 0 }, { opacity: 1 }, { opacity: 0 }], { duration: 700, easing: 'steps(6)', fill: 'forwards' }).finished));
      cleared.forEach(([k, c]) => { c.remove(); board.delete(k); });
      const moved = [...board].map(([k, c]) => {
        const [cx, cy] = k.split(',').map(Number);
        return { k, c, cx, cy, by: full.filter(r => r < cy).length };
      }).filter(m => m.by);
      moved.forEach(m => board.delete(m.k));
      moved.forEach(m => board.set(key(m.cx, m.cy - m.by), m.c));
      await Promise.all(moved.map(m => m.c.animate([{ transform: 'none' }, { transform: `translateY(${m.by * cell}px)` }], { duration: 160 }).finished));
      moved.forEach(m => place(m.c, m.cx, m.cy - m.by));
    }
    await drop([[0, 0], [1, 0], [2, 0], [3, 0]], 0, '#7FE0FF');          /* I, flat */
    await drop([[0, 0], [1, 0], [0, 1], [1, 1]], 4, '#FFD34D');          /* O: completes the bottom row, which clears */
    await drop([[0, 0], [1, 0], [2, 0], [1, 1]], 0, 'var(--accent)');    /* T */
    await drop([[0, 0], [0, 1], [0, 2], [0, 3]], 3, '#B79CFF');          /* I, upright: fills the gap, the bottom row clears again */
    await wait(900);
    await stage.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' }).finished;
  }

  async function pong(stage) {
    const H = stage.clientHeight, w = W();
    const size = 5, padH = 14, top = 3, bottom = H - size - 3;
    const lx = w * 0.03, rx = w * 0.97 - 4;
    const lp = el(stage, 'arcade-paddle'), rp = el(stage, 'arcade-paddle'), ball = el(stage, 'arcade-ball');
    const ys = [H / 2, top, bottom, rand(top, bottom), rand(top, bottom)];
    const xs = [w * 0.5, lx + 4, rx - size, lx + 4, w + 20];
    const leg = 1300, n = xs.length - 1;
    ball.animate(xs.map((x, i) => ({ transform: `translate(${x}px, ${ys[i]}px)`, offset: i / n })), { duration: leg * n, easing: 'linear', fill: 'forwards' });
    /* each paddle meets the ball on its side; the right one misses the last shot */
    const pad = (x, y) => ({ transform: `translate(${x}px, ${Math.max(0, Math.min(H - padH, y - padH / 2 + size / 2))}px)` });
    lp.animate([[0, H / 2], [1, ys[1]], [2, ys[1]], [3, ys[3]], [4, ys[3]]].map(([t, y]) => ({ ...pad(lx, y), offset: t / n })), { duration: leg * n, easing: 'ease-in-out', fill: 'forwards' });
    rp.animate([[0, H / 2], [1.5, ys[2]], [2, ys[2]], [3, ys[2]], [4, ys[4] > H / 2 ? 0 : H]].map(([t, y]) => ({ ...pad(rx, y), offset: t / n })), { duration: leg * n, easing: 'ease-in-out', fill: 'forwards' });
    await wait(leg * n);
    const score = el(stage, 'arcade-score', '1 : 0');
    await score.animate([{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: 1600 }).finished;
  }

  async function runner(stage) {
    const H = stage.clientHeight;
    /* a plumber: red cap, mustache, red shirt, blue overalls with yellow buttons, white gloves */
    const top = ['...RRRRR..', '..RRRRRRRR', '..HHSSHS..', '.HSSSSSSS.', '..SSSHHHH.', '...SSSSS..', '..RRBRRB..', '.RRRBBBBRR', 'WRBBYBBYBW', '..BBBBBB..'];
    const heroPx = H >= 50 ? 2 : 1.6;
    const hero = el(stage, 'arcade-ground', '<span class="arcade-jump">' + frames(
      sprite([...top, '.BBB..BBB.', 'HHH....HHH'], heroPx),
      sprite([...top, '...BBBB...', '..HHHH....'], heroPx),
    ) + '</span>');
    /* three obstacles in random order, spread across the bar: a cactus, a rock, a crate.
       Each is lower than the jump, and each jump peaks right above its obstacle. */
    const kinds = [
      ['..G..', 'G.G..', 'GGG.G', '..GGG', '..G..', '..G..'],
      ['..mm..', '.mMMm.', 'mMMMMm', 'mmmmmm'],
      ['TTTTT', 'TSTST', 'TTSTT', 'TTTTT'],
    ].sort(() => Math.random() - 0.5);
    const from = -30, to = W() + 20, duration = 8000, jump = 640, heroW = 10 * heroPx;
    const obstacles = [0.28, 0.55, 0.8].map((f, k) => ({ x: (f + rand(-0.05, 0.05)) * W(), w: kinds[k][0].length * 2 }));
    obstacles.forEach((o, k) => { el(stage, 'arcade-ground', sprite(kinds[k], 2)).style.left = o.x + 'px'; });
    hero.animate([{ transform: `translateX(${from}px)` }, { transform: `translateX(${to}px)` }], { duration, fill: 'forwards' });
    let now = 0;
    for (const o of obstacles) {
      const peak = ((o.x + o.w / 2 - heroW / 2 - from) / (to - from)) * duration;
      await wait(peak - jump / 2 - now);
      hero.firstChild.animate([
        { transform: 'none', easing: 'ease-out' },
        { transform: 'translateY(-16px)', easing: 'ease-in' },
        { transform: 'none' },
      ], { duration: jump });
      now = peak - jump / 2;
    }
    await wait(duration - now);
  }

  async function pacman(stage) {
    /* a chomping Pac-Man chases three frightened ghosts across the bar, catches the slowest one, then the other two get away */
    const H = stage.clientHeight, px = H >= 50 ? 2 : 1.5, D = 6500;
    const mid = h => Math.round((H - h * px) / 2) + 'px';
    const ghostSprite = skirt => sprite([
      '.....FFFF.....', '...FFFFFFFF...', '..FFFFFFFFFF..', '.FFFFFFFFFFFF.', '.FFFwwFFwwFFF.', '.FFFwwFFwwFFF.', 'FFFFFFFFFFFFFF',
      'FFFFFFFFFFFFFF', 'FFwwFFwwFFwwFF', 'FwFFwwFFwwFFwF', 'FFFFFFFFFFFFFF', 'FFFFFFFFFFFFFF', ...skirt,
    ], px);
    const pacStart = -180, pacEnd = W() + 10, v = (pacEnd - pacStart) / D, eatAt = 0.5 * D;
    const ghosts = [-140, -95, -50].map(x0 => {
      const g = el(stage, 'arcade-sky', frames(ghostSprite(['FF.FFF..FFF.FF', 'F...FF..FF...F']), ghostSprite(['FFF.FF..FF.FFF', 'F.F..F..F..F.F'])));
      g.style.top = mid(14);
      return { g, x0 };
    });
    const pac = el(stage, 'arcade-sky', frames(sprite([
      '....YYYYY....', '..YYYYYYYYY..', '.YYYYYYYYYYY.', '.YYYYYYYYYY..', 'YYYYYYYYY....', 'YYYYYYY......', 'YYYYY........',
      'YYYYYYY......', 'YYYYYYYYY....', '.YYYYYYYYYY..', '.YYYYYYYYYYY.', '..YYYYYYYYY..', '....YYYYY....',
    ], px), sprite([
      '....YYYYY....', '..YYYYYYYYY..', '.YYYYYYYYYYY.', '.YYYYYYYYYYY.', 'YYYYYYYYYYYYY', 'YYYYYYYYYYYYY', 'YYYYYYYYYYYYY',
      'YYYYYYYYYYYYY', 'YYYYYYYYYYYYY', '.YYYYYYYYYYY.', '.YYYYYYYYYYY.', '..YYYYYYYYY..', '....YYYYY....',
    ], px)));
    pac.style.top = mid(13);
    pac.animate([{ transform: `translateX(${pacStart}px)` }, { transform: `translateX(${pacEnd}px)` }], { duration: D, fill: 'forwards' });
    /* the first ghost is slower: Pac-Man reaches it halfway through. The other two keep Pac-Man's speed and stay ahead. */
    /* the ghost disappears when Pac-Man's mouth reaches it */
    const eatX = pacStart + v * eatAt + 10 * px, f = eatAt / D;
    ghosts.forEach(({ g, x0 }, k) => {
      if (k === 0) {
        g.animate([
          { transform: `translateX(${x0}px)` },
          { transform: `translateX(${eatX}px)`, opacity: 1, offset: f },
          { transform: `translateX(${eatX}px)`, opacity: 0, offset: f + 0.001 },
          { transform: `translateX(${eatX}px)`, opacity: 0 },
        ], { duration: D, fill: 'forwards' });
      } else {
        g.animate([{ transform: `translateX(${x0}px)` }, { transform: `translateX(${x0 + v * D}px)` }], { duration: D, fill: 'forwards' });
      }
    });
    /* the score shows where the ghost was, once Pac-Man has moved past it */
    const passed = (13 * px + 4) / v;
    await wait(eatAt + passed);
    const pts = el(stage, 'arcade-sky arcade-points', '200');
    pts.style.left = (eatX + 2) + 'px';
    pts.style.top = mid(14);
    pts.animate([{ opacity: 1 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }], { duration: 1000, fill: 'forwards' });
    await wait(D - eatAt - passed);
  }

  async function coin(stage) {
    /* three coins side by side, each popping up a moment after the one before, each with its own +100 */
    const x0 = rand(0.15, 0.7) * W(), gap = 36, delay = 250;
    const one = async x => {
      const c = el(stage, 'arcade-ground', sprite(['..AAAA..', '.AYYYYA.', 'AYYAYYYA', 'AYYAYYYA', 'AYYAYYYA', 'AYYAYYYA', '.AYYYYA.', '..AAAA..'], 2));
      c.style.left = x + 'px';
      c.firstChild.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0.15)' }, { transform: 'scaleX(1)' }], { duration: 300, iterations: 4 });
      await c.animate([{ transform: 'translateY(16px)' }, { transform: 'translateY(-14px)', offset: 0.55 }, { transform: 'translateY(-8px)', opacity: 1, offset: 0.8 }, { transform: 'translateY(-8px)', opacity: 0 }], { duration: 1200, easing: 'ease-out', fill: 'forwards' }).finished;
      const pts = el(stage, 'arcade-sky arcade-points', '+100');
      pts.style.left = (x - 2) + 'px';
      await pts.animate([{ transform: 'translateY(12px)', opacity: 1 }, { transform: 'translateY(2px)', opacity: 0 }], { duration: 900, easing: 'ease-out', fill: 'forwards' }).finished;
    };
    await Promise.all([0, 1, 2].map(k => wait(k * delay).then(() => one(x0 + k * gap))));
  }

})();
