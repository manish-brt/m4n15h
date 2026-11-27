/* Hero: bright liquid-glass field in raw WebGL (no libraries).
   Domain-warped noise mapped to blue / cyan / white / orange, with glossy
   highlight rims and a cursor "lens". Renders at reduced resolution, pauses
   when the hero is off-screen or the tab is hidden. */
(function () {
  'use strict';
  const canvas = document.querySelector('.hero__gl');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
  if (!gl) { canvas.remove(); return; }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const vs = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
  const fs = `
    precision mediump float;
    uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uMob;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float n(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
      return mix(mix(h(i), h(i+vec2(1,0)), u.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), u.x), u.y); }
    float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 4; i++){ v += a*n(p); p = p*2.03 + vec2(1.7, 9.2); a *= .5; } return v; }
    void main(){
      vec2 uv = (gl_FragCoord.xy - .5*uRes) / uRes.y;
      vec2 m = uMouse;
      float d = length(uv - m);
      uv += (uv - m) * .22 * exp(-d*d*5.);           // cursor lens
      float t = uTime * .05;
      vec2 q = vec2(fbm(uv*1.3 + t), fbm(uv*1.3 + vec2(5.2, 1.3) - t));
      vec2 r = vec2(fbm(uv*1.5 + 3.*q + vec2(1.7, 9.2) + t*1.6), fbm(uv*1.5 + 3.*q + vec2(8.3, 2.8) - t*1.2));
      float f = fbm(uv*1.5 + 3.2*r);
      vec3 base   = vec3(.953, .957, .969);
      vec3 cyan   = vec3(.09, .77, 1.);
      vec3 blue   = vec3(.137, .25, 1.);
      vec3 deep   = vec3(.06, .1, .55);
      vec3 orange = vec3(1., .36, .12);
      vec3 col = mix(base, cyan, smoothstep(.36, .62, f) * .75);
      col = mix(col, blue, smoothstep(.52, .78, f));
      col = mix(col, deep, smoothstep(.78, .95, f) * .55);
      col = mix(col, orange, smoothstep(.62, .9, r.y) * smoothstep(.45, .7, f) * .55);
      float rim = smoothstep(.015, 0., abs(f - .6)) + smoothstep(.012, 0., abs(f - .7)) * .6;
      col += rim * .35;
      col += pow(max(0., 1. - d*1.6), 6.) * .18;           // soft glow under cursor
      // keep the headline zone calm: field lives top/right on desktop, top on mobile
      vec2 sc = gl_FragCoord.xy / uRes;
      float mask = uMob > .5
        ? smoothstep(.66, 1., sc.y) * .9
        : max(smoothstep(.42, .92, sc.x) * smoothstep(.1, .55, sc.y), smoothstep(.72, 1., sc.y) * .55);
      col = mix(base, col, clamp(mask, 0., 1.) * .96);
      col += (h(gl_FragCoord.xy + uTime) - .5) * .02;      // dither
      gl_FragColor = vec4(col, 1.);
    }`;

  function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; }
  const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) { canvas.remove(); return; }
  const pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { canvas.remove(); return; }
  gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = { res: gl.getUniformLocation(pr, 'uRes'), time: gl.getUniformLocation(pr, 'uTime'), mouse: gl.getUniformLocation(pr, 'uMouse'), mob: gl.getUniformLocation(pr, 'uMob') };

  let W = 0, H = 0, scale = 0.45, quality = 1, slow = 0;
  function resize() {
    const r = canvas.getBoundingClientRect();
    scale = Math.min(quality, r.width < 820 ? 0.4 : 0.45);
    W = Math.max(1, Math.round(r.width * scale)); H = Math.max(1, Math.round(r.height * scale));
    canvas.width = W; canvas.height = H; gl.viewport(0, 0, W, H);
    gl.uniform2f(U.res, W, H); gl.uniform1f(U.mob, r.width < 820 ? 1 : 0);
    draw();
  }
  const mouse = { x: .45, y: .15, tx: .45, ty: .15 };
  window.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left - r.width / 2) / r.height;
    mouse.ty = -(e.clientY - r.top - r.height / 2) / r.height;
  }, { passive: true });

  let t = Math.random() * 100, last = performance.now(), visible = true, running = false;
  function draw() { gl.uniform1f(U.time, t); gl.uniform2f(U.mouse, mouse.x, mouse.y); gl.drawArrays(gl.TRIANGLES, 0, 3); }
  function frame(now) {
    if (!visible || document.hidden) { running = false; return; }
    const raw = now - last;
    const dt = Math.min(.05, raw / 1000); last = now; t += dt;
    // adaptive quality: if frames are consistently slow, render at a lower resolution
    if (raw > 0 && raw < 200) { slow = slow * .95 + (raw > 22 ? 1 : 0) * .05; if (slow > .6 && quality > .3) { quality = .3; slow = 0; resize(); } }
    mouse.x += (mouse.tx - mouse.x) * .06; mouse.y += (mouse.ty - mouse.y) * .06;
    draw(); requestAnimationFrame(frame);
  }
  function start() { if (reduce || running) return; running = true; last = performance.now(); requestAnimationFrame(frame); }

  new IntersectionObserver(([e]) => { visible = e.intersectionRatio > .15; if (visible) start(); }, { threshold: [0, .15, .3] }).observe(canvas);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); }, { passive: true });
  resize(); start();
})();
