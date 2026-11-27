/* Interactions — no animation library. IntersectionObserver reveals,
   one rAF scroll loop for scrubbed effects, Lenis for smooth scrolling. */
(function () {
  'use strict';
  const doc = document.documentElement, body = document.body;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  doc.classList.add('js');
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);

  /* copy-to-clipboard buttons */
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-copy]'); if (!b) return;
    const label = b.querySelector('span');
    try { await navigator.clipboard.writeText(b.dataset.copy); label.textContent = 'Copied!'; b.classList.add('is-done'); }
    catch { label.textContent = b.dataset.copy; }
    setTimeout(() => { label.textContent = 'Copy email'; b.classList.remove('is-done'); }, 1800);
  });

  /* ---------- small helpers ---------- */
  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
  $$('.btn').forEach((b) => { if (b.querySelector('.btn__arrow')) b.classList.add('has-arrow'); });

  /* letter roll: wrap characters (text only, built with DOM APIs) */
  $$('[data-roll]').forEach((el) => {
    const text = el.textContent; el.textContent = ''; el.classList.add('roll');
    el.setAttribute('aria-label', text);
    [...text].forEach((c, i) => {
      const s = document.createElement('span');
      s.className = 'ch'; s.textContent = c; s.dataset.c = c; s.style.setProperty('--i', i); s.setAttribute('aria-hidden', 'true');
      el.appendChild(s);
    });
  });

  /* headings → masked lines (measured after fonts load) */
  function splitLines(el) {
    const text = el.dataset.raw || (el.dataset.raw = el.textContent.trim());
    el.textContent = '';
    const words = text.split(/\s+/).map((w) => { const s = document.createElement('span'); s.textContent = w + ' '; s.className = 'wtmp'; el.appendChild(s); return s; });
    const lines = []; let top = null;
    words.forEach((w) => { if (w.offsetTop !== top) { lines.push([]); top = w.offsetTop; } lines[lines.length - 1].push(w.textContent); });
    el.textContent = '';
    lines.forEach((l, i) => {
      const o = document.createElement('span'); o.className = 'ln';
      const inner = document.createElement('span'); inner.textContent = l.join('').trim(); inner.style.setProperty('--d', i * 90);
      o.appendChild(inner); el.appendChild(o);
    });
    el.setAttribute('aria-label', text);
  }
  const lineEls = $$('[data-lines]');

  /* about statement → words lit by scroll */
  const statement = $('[data-words]');
  let words = [];
  if (statement) {
    const txt = statement.textContent.trim(); statement.textContent = '';
    words = txt.split(/\s+/).map((w) => { const s = document.createElement('span'); s.className = 'w'; s.textContent = w; statement.appendChild(s); statement.appendChild(document.createTextNode(' ')); return s; });
  }

  /* stagger delays for reveal groups */
  const STAGGER = [0, 70, 125, 170, 205, 230];
  const stagger = (i, base = 0) => base + STAGGER[Math.min(i, STAGGER.length - 1)];
  $$('.cgrid, .specs, .achv').forEach((g) => {
    $$('[data-reveal]', g).forEach((el, i) => el.style.setProperty('--d', stagger(i)));
  });
  // hero: the words lead, then the pitch/CTAs and the numbers follow while the last line settles
  $$('[data-reveal]', $('.hero__side') || document.createElement('i')).forEach((el, i) => el.style.setProperty('--d', stagger(i, 320)));
  $$('[data-reveal]', $('.stats') || document.createElement('i')).forEach((el, i) => el.style.setProperty('--d', stagger(i, 420)));

  /* ---------- loader ---------- */
  const loader = $('.loader'), lNum = $('.loader__num'), lBar = $('.loader__bar i');
  function runLoader() {
    return new Promise((resolve) => {
      if (reduce) return resolve();
      const start = performance.now(), min = 520;
      let ready = false;
      const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
      Promise.race([fonts, new Promise((r) => setTimeout(r, 1100))]).then(() => (ready = true));
      setTimeout(resolve, 1600);                                   // hard cap: never block the page
      (function step(now) {
        const el = now - start;
        let p = Math.min(1, el / min);
        if (!ready) p = Math.min(p, .9);
        const e = 1 - Math.pow(1 - p, 3);
        lNum.textContent = Math.round(e * 100);
        lBar.style.transform = `scaleX(${e})`;
        if (p >= 1 && ready) setTimeout(resolve, 120); else requestAnimationFrame(step);
      })(start);
    });
  }

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    // lerp mode: follows the wheel/trackpad closely with a short catch-up (no floaty fixed-duration glide)
    lenis = new window.Lenis({ lerp: 0.12, wheelMultiplier: 1, smoothWheel: true, syncTouch: false });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
  }
  function scrollToEl(el) {
    if (lenis) lenis.scrollTo(el, { offset: el.id === 'top' ? 0 : -8, duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const el = document.getElementById(id.slice(1)); if (!el) return;
    e.preventDefault(); closeMenu(); scrollToEl(el);
    history.replaceState(null, '', id === '#top' ? location.pathname : id);
  }));

  /* ---------- menu ---------- */
  const menuBtn = $('.menu-btn'), menu = $('#menu');
  function closeMenu() { body.classList.remove('menu-open'); menuBtn.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-hidden', 'true'); }
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = !body.classList.contains('menu-open');
    body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-hidden', String(!open));
  });
  document.addEventListener('click', (e) => { if (body.classList.contains('menu-open') && !menu.contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- nav links: sliding pill + active section ---------- */
  const links = $('.links'), pill = $('.links__pill'), navLinks = $$('[data-nav]');
  let active = null;
  function movePill(a) {
    if (!a) { pill.style.opacity = 0; return; }
    pill.style.opacity = 1; pill.style.width = a.offsetWidth + 'px'; pill.style.transform = `translateX(${a.offsetLeft}px)`;
  }
  const sectionToLink = { about: 'about', experience: 'experience', skills: 'skills', work: 'work', blog: 'blog', education: 'blog', contact: 'contact' };

  /* ---------- reveal on view ---------- */
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  const tlIO = new IntersectionObserver((entries) => entries.forEach((en) => en.target.classList.toggle('on', en.boundingClientRect.top < window.innerHeight * 0.62 || en.isIntersecting)), { rootMargin: '0px 0px -38% 0px' });

  /* ---------- scroll loop (progress, nav state, scrubs) ---------- */
  const prog = $('.progress i'), nav = $('.nav'), sections = $$('[data-section]');
  const rail = $('.tl__rail i'), timeline = $('.timeline');
  const heroInner = $('.hero__inner');
  // Layout is measured once (and on resize), never inside the scroll frame,
  // so scrolling never forces the browser to recalculate layout.
  const L = { vh: 0, vw: 0, max: 0, secs: [], st: { top: 0, h: 1 }, tl: { top: 0, h: 1 }, hw: null };
  // pinned horizontal client work
  const hw = $('.hwork'), hwTrack = $('.hwork__track'), hwPanels = $$('[data-panel]');
  const hwCount = $('.hwork__count b'), hwProg = $('.hwork__prog i');
  const hwPhones = hwPanels.map((p) => $('.phones, .logo-plate', p));
  const pinMQ = window.matchMedia('(min-width: 901px) and (min-height: 560px)');
  const canPin = () => !!hw && !reduce && pinMQ.matches;
  // side index + timeline head
  const sidx = $('.sidx'), sidxLinks = $$('[data-sidx]');
  const railHead = $('.tl__rail b');
  const absTop = (el) => el.getBoundingClientRect().top + window.scrollY;
  function measure() {
    L.vh = window.innerHeight; L.max = doc.scrollHeight - L.vh;
    L.secs = sections.map((s) => ({ id: s.id, top: absTop(s) }));
    if (statement) L.st = { top: absTop(statement), h: statement.offsetHeight || 1 };
    if (timeline) L.tl = { top: absTop(timeline), h: timeline.offsetHeight || 1 };
    L.vw = window.innerWidth;
    if (hw) {
      const pin = canPin();
      hw.classList.toggle('is-static', !pin);
      if (pin) {
        const dist = Math.max(0, hwTrack.scrollWidth - L.vw);
        const want = Math.round(L.vh + dist) + 'px';
        if (hw.style.height !== want) hw.style.height = want;
        L.hw = { top: absTop(hw), dist, panels: hwPanels.map((p) => ({ l: p.offsetLeft, w: p.offsetWidth })) };
      } else {
        if (hw.style.height) hw.style.height = '';
        hwTrack.style.transform = ''; hwPhones.forEach((ph) => { if (ph) ph.style.transform = ''; });
        L.hw = null;
      }
      L.max = doc.scrollHeight - L.vh;
      L.secs = sections.map((sec) => ({ id: sec.id, top: absTop(sec) }));
    }
    lastHw = -1;
    onScroll();
  }
  let lastY = 0, ticking = false, lastN = -1, lastHeroK = -1, lastRail = -1, navHidden = false;
  let fabMini = false, lastHw = -1, lastHwI = -1, lastSidx = null, sidxOn = false, sidxDark = false;
  function update() {
    ticking = false;
    const y = window.scrollY, vh = L.vh;
    prog.style.transform = `scaleX(${L.max > 0 ? Math.min(1, y / L.max) : 0})`;
    // header hide/show (only touch the DOM when the state changes)
    if (!body.classList.contains('menu-open')) {
      let hide = navHidden;
      if (y > lastY + 6 && y > vh * .7) hide = true; else if (y < lastY - 6 || y < vh * .7) hide = false;
      if (hide !== navHidden) { navHidden = hide; nav.classList.toggle('is-hidden', hide); }
    }
    lastY = y;
    // chat button: full pill in the hero, orb only further down (CSS applies it on phones)
    const mini = y > vh * .5;
    if (mini !== fabMini) { fabMini = mini; body.classList.toggle('fab-mini', mini); }
    // active section from cached offsets
    let curId = L.secs.length ? L.secs[0].id : '';
    for (const s of L.secs) if (s.top - y < vh * .45) curId = s.id;
    const id = sectionToLink[curId];
    const link = id ? navLinks.find((a) => a.getAttribute('href') === '#' + id) : null;
    if (link !== active) { navLinks.forEach((a) => a.classList.toggle('is-active', a === link)); active = link; if (!links.matches(':hover')) movePill(link); }
    // side index: visible after the hero, inverted on the blue contact section
    if (sidx) {
      const inPin = L.hw && y > L.hw.top - vh * .2 && y < L.hw.top + L.hw.dist + vh * .1;
      const on = y > vh * .6 && !inPin;
      if (on !== sidxOn) { sidxOn = on; sidx.classList.toggle('is-on', on); }
      if (curId !== lastSidx) { lastSidx = curId; sidxLinks.forEach((a) => a.classList.toggle('is-active', a.dataset.sidx === curId)); }
      const dark = curId === 'contact';
      if (dark !== sidxDark) { sidxDark = dark; sidx.classList.toggle('on-dark', dark); }
    }
    // pinned horizontal work: vertical scroll drives the track
    if (L.hw) {
      const H = L.hw, p = H.dist > 0 ? Math.min(1, Math.max(0, (y - H.top) / H.dist)) : 0;
      const pr = Math.round(p * 2000) / 2000;
      if (pr !== lastHw) {
        lastHw = pr;
        const x = -pr * H.dist;
        hwTrack.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
        hwProg.style.transform = `scaleX(${(.125 + pr * .875).toFixed(4)})`;
        // panel nearest the centre -> counter; phones drift against the track for depth
        let best = 0, bd = Infinity;
        H.panels.forEach((pp, i) => {
          const c = pp.l + x + pp.w / 2 - L.vw / 2, rel = c / L.vw;
          if (Math.abs(c) < bd) { bd = Math.abs(c); best = i; }
          const ph = hwPhones[i];
          if (ph && Math.abs(rel) < 1.4 && !reduce) ph.style.transform = `translate3d(${(rel * -70).toFixed(1)}px, 0, 0)`;
        });
        if (best !== lastHwI) { lastHwI = best; hwCount.textContent = String(best + 1).padStart(2, '0'); }
      }
    }
    if (reduce) return;
    // hero content drifts up and fades as you leave
    const k = Math.min(1, y / vh);
    if (k !== lastHeroK && (k < 1 || lastHeroK < 1)) { lastHeroK = k; heroInner.style.transform = `translate3d(0, ${(-k * 80).toFixed(1)}px, 0)`; heroInner.style.opacity = (1 - k * .9).toFixed(3); }
    // statement words light up (only the words that changed)
    if (words.length) {
      const p = Math.min(1, Math.max(0, (y + vh * .85 - L.st.top) / (L.st.h + vh * .35)));
      const n = Math.min(words.length, Math.floor(p * words.length * 1.05));
      if (n !== lastN) {
        const a = Math.max(0, Math.min(n, lastN)), b = Math.max(n, lastN);
        for (let i = a; i < b; i++) words[i].classList.toggle('on', i < n);
        if (lastN < 0) for (let i = 0; i < words.length; i++) words[i].classList.toggle('on', i < n);
        lastN = n;
      }
    }
    // timeline rail
    if (rail) {
      const p = Math.round(Math.min(1, Math.max(0, (y + vh * .6 - L.tl.top) / L.tl.h)) * 1000) / 1000;
      if (p !== lastRail) { lastRail = p; rail.style.transform = `scaleY(${p})`; if (railHead) railHead.style.transform = `translate3d(0, ${(p * L.tl.h).toFixed(1)}px, 0)`; }
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  let mT; const remeasure = () => { clearTimeout(mT); mT = setTimeout(measure, 120); };
  window.addEventListener('resize', remeasure, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(document.body);
  window.addEventListener('load', remeasure);
  if (pinMQ.addEventListener) pinMQ.addEventListener('change', remeasure);

  /* ---------- section labels: decode / scramble in ---------- */
  const GLYPHS = '#%&*+=/<>[]{}01ABCDEFXYZ';
  function scramble(el) {
    const node = [...el.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
    if (!node || reduce) return;
    const final = node.textContent, len = final.length, t0 = performance.now(), D = 650 + len * 18;
    const tail = document.createElement('span'); tail.className = 'scr'; tail.setAttribute('aria-hidden', 'true');
    node.textContent = ''; el.appendChild(tail);
    (function f(now) {
      const p = Math.min(1, (now - t0) / D), done = Math.floor(p * len);
      let t = '';
      for (let i = done; i < len; i++) t += final[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      node.textContent = final.slice(0, done); tail.textContent = t;
      if (p < 1) requestAnimationFrame(f); else { node.textContent = final; tail.textContent = ''; el.removeChild(tail); }
    })(t0);
  }
  const scrIO = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { scrIO.unobserve(en.target); setTimeout(() => scramble(en.target), 120); }
  }), { rootMargin: '0px 0px -12% 0px' });

  /* swipe carousel (not pinned): counter + progress follow the horizontal scroll */
  const hwView = $('.hwork__view');
  if (hwView && hwPanels.length) {
    let sq = false;
    hwView.addEventListener('scroll', () => {
      if (sq || L.hw) return; sq = true;
      requestAnimationFrame(() => {
        sq = false;
        const max = hwView.scrollWidth - hwView.clientWidth, p = max > 0 ? hwView.scrollLeft / max : 0;
        hwProg.style.transform = `scaleX(${(.125 + p * .875).toFixed(4)})`;
        const i = Math.round(p * (hwPanels.length - 1));
        if (i !== lastHwI) { lastHwI = i; hwCount.textContent = String(i + 1).padStart(2, '0'); }
      });
    }, { passive: true });
  }

  /* ---------- privacy-friendly analytics (Vercel Web Analytics, cookie-free; Vercel host only) ---------- */
  if (/\.vercel\.app$/.test(location.hostname)) {
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    const sc = document.createElement('script'); sc.src = '/_vercel/insights/script.js'; sc.defer = true;
    document.head.appendChild(sc);
  }

  /* ---------- cursor ---------- */
  if (fine && !reduce) {
    body.classList.add('has-cursor');
    const cur = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__ring em');
    let x = -100, y = -100, rx = x, ry = y;
    window.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; dot.style.transform = `translate3d(${x}px, ${y}px, 0)`; }, { passive: true });
    let following = false;
    function follow() {
      rx += (x - rx) * .2; ry += (y - ry) * .2;
      ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
      if (Math.abs(x - rx) + Math.abs(y - ry) > .3) requestAnimationFrame(follow); else following = false;   // sleep when still
    }
    window.addEventListener('pointermove', () => { if (!following) { following = true; requestAnimationFrame(follow); } }, { passive: true });
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('a, button, [data-cursor]');
      const lbl = t && t.dataset.cursor;
      cur.classList.toggle('is-hover', !!t && !lbl);
      cur.classList.toggle('is-label', !!lbl);
      if (lbl) label.textContent = lbl;
    });
    document.documentElement.addEventListener('mouseleave', () => (cur.style.opacity = 0));
    document.documentElement.addEventListener('mouseenter', () => (cur.style.opacity = 1));
  }

  /* ---------- magnetic buttons ---------- */
  if (fine && !reduce) $$('.magnetic').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.translate = `${((e.clientX - r.left - r.width / 2) * .14).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * .2).toFixed(1)}px`;
    });
    el.addEventListener('pointerleave', () => (el.style.translate = ''));
  });

  /* ---------- hero depth: tech tiles orbit a glass phone in true 3D ----------
     Tiles sit on two tilted rings. Each frame we rotate the rings, apply the
     camera (pitch/yaw from the cursor), project with perspective, sort by depth
     and blur the far side (depth of field). */
  const orbit = $('.orbit'), heroTitle = $('.hero__title'), heroEl = $('.hero');
  if (orbit) {
    const core = $('.core', orbit);
    const orbs = $$('.orb', orbit).map((el, i) => {
      const ringA = i < 7, n = ringA ? 7 : 5, k = ringA ? i : i - 7;
      return { el, ring: ringA ? 0 : 1, a0: (k / n) * Math.PI * 2 + (ringA ? 0 : .4) };
    });
    const rings = [
      { r: .41, roll: 14 * Math.PI / 180, speed: .16, lift: -.02 },
      { r: .29, roll: -32 * Math.PI / 180, speed: -.24, lift: .03 },
    ];
    const m = { x: .15, y: -.1, tx: .15, ty: -.1 };
    if (fine && !reduce) window.addEventListener('pointermove', (e) => {
      m.tx = e.clientX / window.innerWidth - .5; m.ty = e.clientY / window.innerHeight - .5;
    }, { passive: true });
    let t = 0, last = performance.now(), heroVisible = true;
    const blurCache = new WeakMap(), zCache = new WeakMap();
    let orbitW = orbit.clientWidth;
    if ('ResizeObserver' in window) new ResizeObserver(() => { orbitW = orbit.clientWidth; }).observe(orbit);
    function frame(now) {
      if (body.classList.contains('is-loading')) { last = now; requestAnimationFrame(frame); return; }
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (!reduce) t += dt;
      m.x += (m.tx - m.x) * .05; m.y += (m.ty - m.y) * .05;
      const W = orbitW, f = W * 1.7;
      const pitch = (14 + m.y * 18) * Math.PI / 180, yaw = (m.x * 34) * Math.PI / 180;
      const cp = Math.cos(pitch), sp = Math.sin(pitch), cy = Math.cos(yaw), syw = Math.sin(yaw);
      for (const o of orbs) {
        const rg = rings[o.ring], a = o.a0 + t * rg.speed, R = rg.r * W;
        // point on ring (XZ plane), lifted, then rolled around Z
        let x = Math.cos(a) * R, y = rg.lift * W, z = Math.sin(a) * R;
        const cr = Math.cos(rg.roll), sr = Math.sin(rg.roll);
        [x, y] = [x * cr - y * sr, x * sr + y * cr];
        // camera yaw (Y) then pitch (X)
        [x, z] = [x * cy + z * syw, -x * syw + z * cy];
        [y, z] = [y * cp - z * sp, y * sp + z * cp];
        const s = f / (f + z), depth = z / R;                 // depth: -1 front … +1 back
        const blur = depth > 0 ? depth * 4.5 : Math.max(0, -depth - .75) * 4;
        o.el.style.transform = `translate3d(${(x * s).toFixed(1)}px, ${(y * s).toFixed(1)}px, 0) scale(${(s * .95).toFixed(3)})`;
        const bq = blur > .3 ? Math.round(blur * 2) / 2 : 0;         // quantise: fewer repaints
        if (blurCache.get(o.el) !== bq) { blurCache.set(o.el, bq); o.el.style.filter = bq ? `blur(${bq}px)` : 'none'; }
        o.el.style.opacity = (.62 + .38 * Math.min(1, s)).toFixed(2);
        const zi = 500 - Math.round(z / 8) * 8;                       // coarse steps: restack rarely
        if (zCache.get(o.el) !== zi) { zCache.set(o.el, zi); o.el.style.zIndex = String(zi); }
      }
      core.style.transform = `translate(-50%, -50%) rotateY(${(-14 + m.x * 30).toFixed(2)}deg) rotateX(${(6 - m.y * 16).toFixed(2)}deg) rotateZ(${(Math.sin(t * .6) * 2).toFixed(2)}deg)`;
      const sy = Math.min(window.scrollY, window.innerHeight);
      orbit.style.translate = `0 ${(-sy * .3).toFixed(1)}px`;
      if (fine && !reduce) heroTitle.style.transform = `perspective(1400px) rotateX(${(m.y * -3).toFixed(2)}deg) rotateY(${(m.x * 4).toFixed(2)}deg)`;
      if (heroVisible && !reduce) requestAnimationFrame(frame);
    }
    new IntersectionObserver(([en]) => { const was = heroVisible; heroVisible = en.isIntersecting; if (heroVisible && !was) { last = performance.now(); requestAnimationFrame(frame); } }).observe(heroEl);
    requestAnimationFrame(frame);
    window.addEventListener('resize', () => { if (reduce) requestAnimationFrame(frame); }, { passive: true });
  }

  /* ---------- tech stack: infinite band, speed + direction follow scroll, draggable ---------- */
  const stack = $('.stack');
  if (stack) {
    const rows = $$('.stack__row', stack).map((row) => {
      const originals = Array.from(row.children);
      const setW = () => originals.reduce((w, c) => w + c.getBoundingClientRect().width, 0) + originals.length * 14;
      return { row, dir: +row.dataset.dir || 1, originals, setW, w: 0, x: 0 };
    });
    function fill() {
      rows.forEach((r) => {
        r.row.querySelectorAll('[data-clone]').forEach((c) => c.remove());
        r.w = r.setW();
        const need = Math.ceil((window.innerWidth * 2) / Math.max(1, r.w)) + 1;
        for (let i = 0; i < need; i++) r.originals.forEach((c) => { const k = c.cloneNode(true); k.dataset.clone = ''; k.setAttribute('aria-hidden', 'true'); r.row.appendChild(k); });
        if (r.dir < 0) r.x = -r.w;
      });
    }
    let boost = 0, scrollDir = 1, lastSY = window.scrollY, drag = null, visible = true, last = performance.now();
    window.addEventListener('scroll', () => {
      const dy = window.scrollY - lastSY; lastSY = window.scrollY;
      if (dy) scrollDir = Math.sign(dy);
      boost = Math.min(18, boost + Math.abs(dy) * .06);
    }, { passive: true });
    stack.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, v: 0 }; stack.classList.add('is-drag'); stack.setPointerCapture(e.pointerId); });
    stack.addEventListener('pointermove', (e) => { if (!drag) return; const dx = e.clientX - drag.x; drag.x = e.clientX; drag.v = dx; rows.forEach((r) => (r.x += dx * r.dir)); });
    const endDrag = () => { if (drag) { boost = Math.min(18, Math.abs(drag.v) * .4); stack.classList.remove('is-drag'); drag = null; } };
    stack.addEventListener('pointerup', endDrag); stack.addEventListener('pointercancel', endDrag);
    let hover = false; stack.addEventListener('pointerenter', () => (hover = true)); stack.addEventListener('pointerleave', () => (hover = false));
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) { last = performance.now(); requestAnimationFrame(band); } }).observe(stack);
    function band(now) {
      if (!visible) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      const base = reduce ? 0 : (hover ? 14 : 48);
      boost *= .92;
      if (!drag) rows.forEach((r) => { r.x -= (base + boost * 40) * dt * r.dir * scrollDir; });
      rows.forEach((r) => {
        if (r.w > 0) { while (r.x <= -r.w) r.x += r.w; while (r.x > 0) r.x -= r.w; }
        r.row.style.transform = `translate3d(${r.x}px, 0, 0)`;
      });
      requestAnimationFrame(band);
    }
    const startBand = () => { fill(); requestAnimationFrame(band); };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(startBand);
    let fr, fw = window.innerWidth; window.addEventListener('resize', () => { if (window.innerWidth === fw) return; fw = window.innerWidth; clearTimeout(fr); fr = setTimeout(fill, 250); });
  }

  /* ---------- counters ---------- */
  function countUp(el) {
    const end = +el.dataset.count, t0 = performance.now(), d = 1000;
    (function f(n) { const p = Math.min(1, (n - t0) / d); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(f); })(t0);
  }

  /* ---------- boot ---------- */
  runLoader().then(() => {
    lineEls.forEach(splitLines);
    $$('[data-reveal], [data-lines]').forEach((el) => io.observe(el));
    $$('.tl').forEach((el) => tlIO.observe(el));
    $$('.label').forEach((el) => scrIO.observe(el));
    loader.classList.add('is-done');
    body.classList.remove('is-loading');
    requestAnimationFrame(() => {
      $$('.hero .ln > span').forEach((s, i) => s.style.setProperty('--d', 60 + i * 80));
      $('.hero__title').classList.add('in');
      if (!reduce) $$('[data-count]').forEach(countUp);
      const target = location.hash && document.getElementById(location.hash.slice(1));
      if (target) { if (lenis) lenis.scrollTo(target, { immediate: true, offset: -8 }); else target.scrollIntoView(); }
      measure();
    });
    setTimeout(() => loader.remove(), 1000);
  });
  let rT, lastW = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastW) return; // ignore mobile URL-bar resizes
    lastW = window.innerWidth; clearTimeout(rT); rT = setTimeout(() => lineEls.forEach(splitLines), 300);
  });
})();
