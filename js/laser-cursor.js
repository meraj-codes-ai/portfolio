(() => {
  // Color settings: switch mode to 'rainbow' | 'neon' | 'cyber' | 'plasma'
  const settings = {
    mode: 'rainbow',
    widthMin: 1.5,
    widthMax: 6,
    glowMin: 6,
    glowMax: 18,
    hueSpeed: 0.02, // degrees per ms (~20 deg/sec)
    sat: 100, // %
    light: 55 // %
  };
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isTouch || prefersReduced) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'laser-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let dpr = Math.max(1, window.devicePixelRatio || 1);
  let width = 0, height = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const trail = [];
  const MAX_POINTS = 40;
  const MAX_AGE = 450; // ms
  let lastMove = Date.now();

  function addPoint(x, y) {
    const now = Date.now();
    lastMove = now;
    trail.push({ x, y, t: now });
    while (trail.length > MAX_POINTS) trail.shift();
  }

  window.addEventListener('mousemove', (e) => {
    addPoint(e.clientX, e.clientY);
  }, { passive: true });

  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
    const c = (1 - Math.abs(2*l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c/2;
    let r1=0,g1=0,b1=0;
    if (h < 60) { r1=c; g1=x; }
    else if (h < 120) { r1=x; g1=c; }
    else if (h < 180) { g1=c; b1=x; }
    else if (h < 240) { g1=x; b1=c; }
    else if (h < 300) { r1=x; b1=c; }
    else { r1=c; b1=x; }
    const r = Math.round((r1 + m) * 255);
    const g = Math.round((g1 + m) * 255);
    const b = Math.round((b1 + m) * 255);
    return { r, g, b };
  }

  function rgba(rgb, a) { return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`; }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function multiHue(hues, t) {
    if (hues.length === 1) return hues[0];
    const segs = hues.length - 1;
    const pos = t * segs;
    const i = Math.min(segs - 1, Math.max(0, Math.floor(pos)));
    const localT = Math.min(1, Math.max(0, pos - i));
    return lerp(hues[i], hues[i+1], localT);
  }

  function colorAt(t, now) {
    const shift = (now * settings.hueSpeed) % 360;
    let hue;
    switch (settings.mode) {
      case 'neon': {
        // Cyan -> Magenta blend across the trail
        hue = multiHue([190, 320], t) + shift;
        break;
      }
      case 'cyber': {
        // Electric blue -> Acid lime
        hue = multiHue([200, 100], t) + shift;
        break;
      }
      case 'plasma': {
        // Purple -> Pink -> Orange
        hue = multiHue([280, 320, 25], t) + shift;
        break;
      }
      case 'rainbow':
      default: {
        // Full spectrum along trail, animated over time
        hue = (shift + t * 360) % 360;
        break;
      }
    }
    return hslToRgb(hue, settings.sat, settings.light);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    const now = Date.now();
    // Remove old points
    while (trail.length && now - trail[0].t > MAX_AGE) trail.shift();

    if (trail.length > 1) {
      for (let i = 1; i < trail.length; i++) {
        const p0 = trail[i - 1];
        const p1 = trail[i];
        const age = now - p1.t;
        const life = 1 - Math.min(1, age / MAX_AGE);

        const widthPx = lerp(settings.widthMax, settings.widthMin, i / trail.length);
        const glow = lerp(settings.glowMax, settings.glowMin, i / trail.length);

        const c0 = colorAt((i - 1) / trail.length, now);
        const c1 = colorAt(i / trail.length, now);
        const alpha = 0.55 * life;
        const grad = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
        grad.addColorStop(0, rgba(c0, alpha));
        grad.addColorStop(1, rgba(c1, alpha));

        ctx.save();
        ctx.strokeStyle = grad;
        ctx.lineWidth = widthPx;
        ctx.lineCap = 'round';
        ctx.shadowColor = rgba(c1, Math.min(0.8, 0.6 + 0.4 * life));
        ctx.shadowBlur = glow;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
        ctx.restore();
      }

      // Cursor glow at head
      const head = trail[trail.length - 1];
      const pulse = 0.6 + 0.4 * Math.sin(now / 120);
      ctx.beginPath();
      const r = 7 + 2 * pulse;
      const headRgb = colorAt(1, now);
      const grd = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, r * 4);
      grd.addColorStop(0, rgba(headRgb, 0.95));
      grd.addColorStop(0.5, rgba(headRgb, 0.35));
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.arc(head.x, head.y, r * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();
