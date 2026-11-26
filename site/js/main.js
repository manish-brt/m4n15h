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
  $$('.workgrid, .skillgrid, .cgrid, .specs, .achv, .stats, .hero__side').forEach((g) => {
    $$('[data-reveal]', g).forEach((el, i) => el.style.setProperty('--d', (i % 4) * 90));
  });

  /* ---------- loader ---------- */
  const loader = $('.loader'), lNum = $('.loader__num'), lBar = $('.loader__bar i');
  function runLoader() {
    return new Promise((resolve) => {
      if (reduce) return resolve();
      const start = performance.now(), min = 900;
      let ready = false;
      const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
      Promise.race([fonts, new Promise((r) => setTimeout(r, 1800))]).then(() => (ready = true));
      setTimeout(resolve, 2600);                                   // hard cap: never block the page
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
    lenis = new window.Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
  }
  function scrollToEl(el) {
    if (lenis) lenis.scrollTo(el, { offset: el.id === 'top' ? 0 : -8, duration: 1.4 });
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
  let lastY = 0, ticking = false;
  function update() {
    ticking = false;
    const y = window.scrollY, vh = window.innerHeight, max = doc.scrollHeight - vh;
    prog.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    // header hide/show
    if (!body.classList.contains('menu-open')) {
      if (y > lastY + 6 && y > vh * .7) nav.classList.add('is-hidden');
      else if (y < lastY - 6 || y < vh * .7) nav.classList.remove('is-hidden');
    }
    lastY = y;
    // active section
    let cur = sections[0];
    for (const s of sections) if (s.getBoundingClientRect().top < vh * .45) cur = s;
    const id = sectionToLink[cur.id];
    const link = id ? navLinks.find((a) => a.getAttribute('href') === '#' + id) : null;
    if (link !== active) { navLinks.forEach((a) => a.classList.toggle('is-active', a === link)); active = link; if (!links.matches(':hover')) movePill(link); }
    if (reduce) return;
    // hero content drifts up and fades as you leave
    if (y < vh * 1.2) { const k = Math.min(1, y / vh); heroInner.style.transform = `translate3d(0, ${-k * 80}px, 0)`; heroInner.style.opacity = 1 - k * .9; }
    // statement words light up
    if (words.length) {
      const r = statement.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .35)));
      const n = Math.floor(p * words.length * 1.05);
      for (let i = 0; i < words.length; i++) words[i].classList.toggle('on', i < n);
    }
    // timeline rail
    if (rail) { const r = timeline.getBoundingClientRect(); const p = Math.min(1, Math.max(0, (vh * .6 - r.top) / r.height)); rail.style.transform = `scaleY(${p})`; }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  /* ---------- cursor ---------- */
  if (fine && !reduce) {
    body.classList.add('has-cursor');
    const cur = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__ring em');
    let x = -100, y = -100, rx = x, ry = y;
    window.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; dot.style.transform = `translate3d(${x}px, ${y}px, 0)`; }, { passive: true });
    (function follow() { rx += (x - rx) * .2; ry += (y - ry) * .2; ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`; requestAnimationFrame(follow); })();
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
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`;
    });
    el.addEventListener('pointerleave', () => (el.style.transform = ''));
  });

  /* ---------- work media: subtle parallax tilt following cursor ---------- */
  if (fine && !reduce) $$('.wcard__media').forEach((m) => {
    const inner = m.querySelector('.screens, .logo-plate');
    if (!inner) return;
    m.addEventListener('pointermove', (e) => {
      const r = m.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      inner.style.transform = `translate3d(${px * 18}px, ${py * 14}px, 0)`;
    });
    m.addEventListener('pointerleave', () => (inner.style.transform = ''));
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
    const blurCache = new WeakMap();
    function frame(now) {
      if (body.classList.contains('is-loading')) { last = now; requestAnimationFrame(frame); return; }
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (!reduce) t += dt;
      m.x += (m.tx - m.x) * .05; m.y += (m.ty - m.y) * .05;
      const W = orbit.clientWidth, f = W * 1.7;
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
        o.el.style.zIndex = String(500 - Math.round(z));
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
    const end = +el.dataset.count, t0 = performance.now(), d = 1400;
    (function f(n) { const p = Math.min(1, (n - t0) / d); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(f); })(t0);
  }

  /* ---------- boot ---------- */
  runLoader().then(() => {
    lineEls.forEach(splitLines);
    $$('[data-reveal], [data-lines]').forEach((el) => io.observe(el));
    $$('.tl').forEach((el) => tlIO.observe(el));
    loader.classList.add('is-done');
    body.classList.remove('is-loading');
    requestAnimationFrame(() => {
      $$('.hero .ln > span').forEach((s, i) => s.style.setProperty('--d', 150 + i * 110));
      $('.hero__title').classList.add('in');
      if (!reduce) $$('[data-count]').forEach(countUp);
      const target = location.hash && document.getElementById(location.hash.slice(1));
      if (target) { if (lenis) lenis.scrollTo(target, { immediate: true, offset: -8 }); else target.scrollIntoView(); }
      update();
    });
    setTimeout(() => loader.remove(), 1200);
  });
  let rT, lastW = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastW) return; // ignore mobile URL-bar resizes
    lastW = window.innerWidth; clearTimeout(rT); rT = setTimeout(() => lineEls.forEach(splitLines), 300);
  });
})();
