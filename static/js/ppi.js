// PPI (Plan Position Indicator) radar scope for the home hero.
// Bearing 0° = north, clockwise. Echoes brighten as the beam passes and decay afterwards.
(function () {
  var c = document.getElementById("ppi");
  if (!c || !c.getContext) return;
  var ctx = c.getContext("2d");
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var RANGE_KM = 20, RINGS = 4, PERIOD = 4.0; // seconds per revolution

  // r: fraction of max range, b: bearing in degrees, v: drift in deg/s
  var targets = [
    { r: 0.31, b: 42, v: 0.9 },
    { r: 0.57, b: 118, v: -0.4 },
    { r: 0.72, b: 226, v: 0.25 },
    { r: 0.44, b: 302, v: -0.6 },
    { r: 0.86, b: 71, v: 0.15 }
  ];

  var size = 0, colors = {};
  function readColors() {
    var s = getComputedStyle(c);
    ["--ppi-bg", "--ppi-line", "--ppi-sweep", "--ppi-text", "--ppi-echo"].forEach(function (n) {
      colors[n] = s.getPropertyValue(n).trim() || "#5FD6C6";
    });
  }
  function resize() {
    var w = c.getBoundingClientRect().width || 440;
    var dpr = window.devicePixelRatio || 1;
    size = w;
    c.width = Math.round(w * dpr);
    c.height = Math.round(w * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function rad(bearing) { return (bearing - 90) * Math.PI / 180; }
  function alpha(hex, a) {
    var h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map(function (x) { return x + x; }).join("");
    var n = parseInt(h, 16);
    return "rgba(" + (n >> 16 & 255) + "," + (n >> 8 & 255) + "," + (n & 255) + "," + a + ")";
  }

  function draw(sweep) {
    var cx = size / 2, cy = size / 2, R = size / 2 - Math.max(18, size * 0.06);
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = colors["--ppi-bg"];
    ctx.beginPath(); ctx.arc(cx, cy, size / 2, 0, Math.PI * 2); ctx.fill();

    // range rings
    ctx.lineWidth = 1;
    ctx.strokeStyle = colors["--ppi-line"];
    for (var i = 1; i <= RINGS; i++) {
      ctx.beginPath(); ctx.arc(cx, cy, R * i / RINGS, 0, Math.PI * 2); ctx.stroke();
    }
    // cross hairs
    ctx.strokeStyle = alpha(colors["--ppi-line"], 0.6);
    ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();

    // bearing ticks + labels
    ctx.strokeStyle = colors["--ppi-line"];
    ctx.fillStyle = colors["--ppi-text"];
    var fs = Math.max(9, Math.round(size * 0.024));
    ctx.font = fs + "px 'IBM Plex Sans KR', sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (var b = 0; b < 360; b += 10) {
      var a = rad(b), long = b % 30 === 0;
      var r1 = R, r2 = R + (long ? 7 : 4);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
      ctx.stroke();
      if (b % 90 === 0) {
        var rl = R + Math.max(12, size * 0.035);
        ctx.fillText(("00" + b).slice(-3), cx + Math.cos(a) * rl, cy + Math.sin(a) * rl);
      }
    }
    // range labels along 045°
    ctx.textAlign = "left";
    for (var k = 1; k <= RINGS; k++) {
      var rr = R * k / RINGS, la = rad(45);
      ctx.fillText((RANGE_KM / RINGS * k) + (k === RINGS ? " km" : ""), cx + Math.cos(la) * rr + 4, cy + Math.sin(la) * rr + 2);
    }

    // sweep trail: thin wedges fading behind the beam
    var TRAIL = 70, STEPS = 35;
    for (var s = 0; s < STEPS; s++) {
      var a0 = rad(sweep - TRAIL * (s + 1) / STEPS), a1 = rad(sweep - TRAIL * s / STEPS);
      ctx.fillStyle = alpha(colors["--ppi-sweep"], 0.22 * Math.pow(1 - s / STEPS, 2));
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a0, a1); ctx.closePath(); ctx.fill();
    }
    // beam line
    var ab = rad(sweep);
    ctx.strokeStyle = colors["--ppi-sweep"]; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ab) * R, cy + Math.sin(ab) * R); ctx.stroke();

    // echoes
    targets.forEach(function (t) {
      var since = ((sweep - t.b) % 360 + 360) % 360;   // degrees since beam passed
      var glow = Math.exp(-since / 110);
      if (glow < 0.04) return;
      var ta = rad(t.b), tx = cx + Math.cos(ta) * R * t.r, ty = cy + Math.sin(ta) * R * t.r;
      var rad0 = Math.max(2.5, size * 0.009);
      ctx.fillStyle = alpha(colors["--ppi-echo"], 0.25 * glow);
      ctx.beginPath(); ctx.arc(tx, ty, rad0 * 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = alpha(colors["--ppi-echo"], 0.95 * glow);
      ctx.beginPath(); ctx.arc(tx, ty, rad0, 0, Math.PI * 2); ctx.fill();
    });

    // center
    ctx.fillStyle = colors["--ppi-sweep"];
    ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fill();
  }

  readColors(); resize();
  var last = null, sweep = 60, tick = 0;
  function frame(ts) {
    if (last === null) last = ts;
    var dt = Math.min(0.1, (ts - last) / 1000); last = ts;
    sweep = (sweep + 360 * dt / PERIOD) % 360;
    targets.forEach(function (t) { t.b = (t.b + t.v * dt + 360) % 360; });
    if (++tick % 60 === 0) readColors();
    draw(sweep);
    if (!document.hidden) requestAnimationFrame(frame); else last = null;
  }
  if (reduce) {
    draw(80);
  } else {
    requestAnimationFrame(frame);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) { last = null; requestAnimationFrame(frame); } });
  }
  if (window.ResizeObserver) new ResizeObserver(function () { resize(); if (reduce) draw(80); }).observe(c);
  if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { readColors(); if (reduce) draw(80); });
})();
