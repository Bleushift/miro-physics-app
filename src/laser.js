// Physics Pathway — Laser Pointer Overlay
// Injected into the Miro page via bookmarklet/console.
// Canvas uses pointer-events:none so all clicks pass through to the board.
// Toggle: run again to turn off, or press Escape, or click ✕.
(function () {
  'use strict';
  if (window.__laser) { window.__laser.destroy(); return; }

  // ─── LaserTrail ───────────────────────────────────────────────
  class LaserTrail {
    constructor(ms) { this.ms = ms; this.pts = []; this.GAP = 4; }
    add(x, y, t) {
      const pts = this.pts;
      if (pts.length) {
        const last = pts[pts.length - 1];
        const dx = x - last.x, dy = y - last.y;
        const d = Math.hypot(dx, dy);
        if (d > this.GAP) {
          const n = Math.floor(d / this.GAP);
          for (let i = 1; i <= n; i++) {
            const f = i / (n + 1);
            pts.push({ x: last.x + dx * f, y: last.y + dy * f, t: last.t + (t - last.t) * f });
          }
        }
      }
      pts.push({ x, y, t });
    }
    prune(now) {
      const cut = now - this.ms;
      let i = 0;
      while (i < this.pts.length && this.pts[i].t < cut) i++;
      if (i) this.pts.splice(0, i);
    }
  }

  // ─── Config ───────────────────────────────────────────────────
  var COLORS = [
    [229, 57, 53, '#E53935'],
    [30, 136, 229, '#1E88E5'],
    [161, 139, 250, '#a18bfa'],
    [94, 234, 212, '#5eead4'],
    [251, 191, 36, '#fbbf24']
  ];
  var ci = 0, r = COLORS[0][0], g = COLORS[0][1], b = COLORS[0][2];
  var trail = new LaserTrail(900);
  var mx = -100, my = -100;

  // ─── DOM ──────────────────────────────────────────────────────
  var root = document.createElement('div');
  root.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:2147483647;pointer-events:none;';

  var cvs = document.createElement('canvas');
  cvs.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
  root.appendChild(cvs);
  var ctx = cvs.getContext('2d');

  // ─── Floating control bar ─────────────────────────────────────
  var bar = document.createElement('div');
  bar.style.cssText = 'position:absolute;bottom:16px;left:50%;transform:translateX(-50%);pointer-events:auto;display:flex;align-items:center;gap:6px;background:rgba(30,30,46,0.92);padding:6px 14px;border-radius:20px;backdrop-filter:blur(8px);box-shadow:0 2px 16px rgba(0,0,0,0.4);user-select:none;';

  var dots = [];
  COLORS.forEach(function (c, i) {
    var d = document.createElement('div');
    d.style.cssText = 'width:20px;height:20px;border-radius:50%;background:' + c[3] + ';border:2px solid ' + (i === 0 ? '#fff' : 'transparent') + ';cursor:pointer;transition:border-color .15s,transform .1s;';
    d.title = ['Red', 'Blue', 'Purple', 'Teal', 'Yellow'][i];
    d.addEventListener('mouseenter', function () { d.style.transform = 'scale(1.15)'; });
    d.addEventListener('mouseleave', function () { d.style.transform = ''; });
    d.addEventListener('click', function (e) {
      e.stopPropagation();
      ci = i; r = c[0]; g = c[1]; b = c[2];
      dots.forEach(function (dd, j) { dd.style.borderColor = j === i ? '#fff' : 'transparent'; });
    });
    dots.push(d);
    bar.appendChild(d);
  });

  // Separator
  var sep = document.createElement('div');
  sep.style.cssText = 'width:1px;height:16px;background:rgba(255,255,255,0.15);margin:0 4px;';
  bar.appendChild(sep);

  // Close button
  var cls = document.createElement('div');
  cls.textContent = '\u2715';
  cls.style.cssText = 'color:rgba(255,255,255,0.6);font:600 14px/1 -apple-system,sans-serif;cursor:pointer;padding:2px 4px;transition:color .15s;';
  cls.addEventListener('mouseenter', function () { cls.style.color = '#fff'; });
  cls.addEventListener('mouseleave', function () { cls.style.color = 'rgba(255,255,255,0.6)'; });
  cls.addEventListener('click', function (e) { e.stopPropagation(); window.__laser.destroy(); });
  bar.appendChild(cls);

  root.appendChild(bar);
  document.body.appendChild(root);

  // ─── Canvas sizing ────────────────────────────────────────────
  function resize() {
    var dpr = devicePixelRatio || 1;
    cvs.width = innerWidth * dpr;
    cvs.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener('resize', resize);

  // ─── Mouse tracking (capture phase on document) ───────────────
  function onMove(e) {
    mx = e.clientX; my = e.clientY;
    trail.add(mx, my, performance.now());
  }
  document.addEventListener('mousemove', onMove, true);

  function onKey(e) {
    if (e.key === 'Escape') window.__laser.destroy();
  }
  document.addEventListener('keydown', onKey, true);

  // ─── Render loop ──────────────────────────────────────────────
  var af;
  function draw() {
    var now = performance.now();
    trail.prune(now);
    var dpr = devicePixelRatio || 1;
    ctx.clearRect(0, 0, cvs.width / dpr, cvs.height / dpr);

    var pts = trail.pts;
    if (pts.length >= 2) {
      // Glow layer
      ctx.save();
      ctx.lineCap = ctx.lineJoin = 'round';
      ctx.lineWidth = 14;
      ctx.shadowBlur = 24;
      ctx.shadowColor = 'rgba(' + r + ',' + g + ',' + b + ',.4)';
      for (var i = 1; i < pts.length; i++) {
        var a = Math.max(0, (1 - (now - pts[i].t) / trail.ms) * 0.25);
        ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
        ctx.beginPath();
        ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
        ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
      }
      ctx.restore();

      // Core trail
      ctx.save();
      ctx.lineCap = ctx.lineJoin = 'round';
      ctx.lineWidth = 3;
      for (var i = 1; i < pts.length; i++) {
        var a = Math.max(0, 1 - (now - pts[i].t) / trail.ms);
        ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
        ctx.beginPath();
        ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
        ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Cursor dot
    if (mx > 0) {
      ctx.beginPath(); ctx.arc(mx, my, 12, 0, 7);
      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',.25)'; ctx.fill();
      ctx.beginPath(); ctx.arc(mx, my, 5, 0, 7);
      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',1)'; ctx.fill();
      ctx.beginPath(); ctx.arc(mx, my, 2, 0, 7);
      ctx.fillStyle = '#fff'; ctx.fill();
    }

    af = requestAnimationFrame(draw);
  }
  af = requestAnimationFrame(draw);

  // ─── Cleanup ──────────────────────────────────────────────────
  window.__laser = {
    destroy: function () {
      cancelAnimationFrame(af);
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('keydown', onKey, true);
      removeEventListener('resize', resize);
      root.remove();
      delete window.__laser;
    }
  };
})();
