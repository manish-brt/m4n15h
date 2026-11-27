/* Liquid ripple on app screens while hovered (raw WebGL, one shared context).
   The canvas moves into whichever phone screen is under the pointer, draws that
   screen's image with a cursor-centred ripple and a faint RGB split, then fades
   back to the plain image and parks itself. Nothing runs while idle. */
(function () {
  'use strict';
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: 'low-power' });
  if (!gl) return;

  const vs = 'attribute vec2 p; varying vec2 v; void main(){ v = vec2(p.x * .5 + .5, .5 - p.y * .5); gl_Position = vec4(p, 0., 1.); }';
  const fs = `
    precision mediump float;
    uniform sampler2D tex; uniform vec2 m; uniform float time, amp, ratio; uniform vec4 map; varying vec2 v;
    void main(){
      vec2 d = v - m; d.y *= ratio;
      float r = length(d);
      float w = sin(r * 34. - time * 6.5) * exp(-r * 4.5) * amp;
      vec2 dir = d / max(r, 1e-4); dir.y /= ratio;
      vec2 uv = (v + dir * w * .016) * map.xy + map.zw;
      float s = amp * .0035 * (1. - smoothstep(0., .6, r));
      vec3 c = vec3(texture2D(tex, uv + vec2(s, 0.)).r, texture2D(tex, uv).g, texture2D(tex, uv - vec2(s, 0.)).b);
      c += w * .12;
      gl_FragColor = vec4(c, 1.);
    }`;
  function sh(type, src) { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; }
  const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return;
  const pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ['m', 'time', 'amp', 'ratio', 'map'].forEach((k) => (U[k] = gl.getUniformLocation(pr, k)));
  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  [[gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE], [gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR]].forEach(([k, val]) => gl.texParameteri(gl.TEXTURE_2D, k, val));

  let host = null, img = null, amp = 0, target = 0, t = 0, last = 0, running = false;
  const mouse = { x: .5, y: .5, tx: .5, ty: .5 };

  function attach(screen) {
    const im = screen.querySelector('img');
    if (!im || !im.complete || !im.naturalWidth) return false;
    const r = screen.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(r.width * dpr)); canvas.height = Math.max(1, Math.round(r.height * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (img !== im) {
      try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im); } catch { return false; }
      img = im;
    }
    // object-fit: cover, anchored to the top (matches the CSS)
    const boxR = r.height / r.width, imgR = im.naturalHeight / im.naturalWidth;
    let sx = 1, sy = 1, ox = 0;
    if (imgR > boxR) sy = boxR / imgR; else { sx = imgR / boxR; ox = (1 - sx) / 2; }
    gl.uniform4f(U.map, sx, sy, ox, 0);
    gl.uniform1f(U.ratio, boxR);
    screen.appendChild(canvas); host = screen;
    return true;
  }
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
    amp += (target - amp) * .08;
    mouse.x += (mouse.tx - mouse.x) * .18; mouse.y += (mouse.ty - mouse.y) * .18;
    gl.uniform1f(U.time, t); gl.uniform1f(U.amp, amp); gl.uniform2f(U.m, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (target === 0 && amp < .01) { running = false; if (canvas.parentNode) canvas.parentNode.removeChild(canvas); host = null; return; }
    requestAnimationFrame(frame);
  }
  function start() { if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
  function track(e, screen) {
    const r = screen.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left) / r.width; mouse.ty = (e.clientY - r.top) / r.height;
  }

  document.addEventListener('pointerover', (e) => {
    const screen = e.target.closest && e.target.closest('.phone__screen');
    if (!screen || screen === host) return;
    if (host && host !== screen) { amp = 0; }
    track(e, screen); mouse.x = mouse.tx; mouse.y = mouse.ty;
    if (attach(screen)) { target = 1; start(); }
  });
  document.addEventListener('pointermove', (e) => { if (host) track(e, host); }, { passive: true });
  document.addEventListener('pointerout', (e) => {
    if (!host) return;
    const to = e.relatedTarget;
    if (!to || !host.contains(to)) target = 0;
  });
  window.addEventListener('scroll', () => { if (host) target = 0; }, { passive: true });
})();
