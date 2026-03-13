(() => {
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (isTouch || prefersReduced) return;

  const canvas = document.createElement("canvas");
  canvas.id = "dot-field-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  let dpr = Math.max(1, window.devicePixelRatio || 1);
  let width = 0;
  let height = 0;
  let cols = 0;
  let rows = 0;
  let dots = [];

  const pointer = {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.35,
    tx: window.innerWidth * 0.5,
    ty: window.innerHeight * 0.35,
    vx: 0,
    vy: 0,
    speed: 0
  };

  const settings = {
    spacing: 32,
    baseRadius: 1.35,
    influence: 170,
    push: 18
  };

  function resize() {
    dpr = Math.max(1, window.devicePixelRatio || 1);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cols = Math.ceil(width / settings.spacing) + 1;
    rows = Math.ceil(height / settings.spacing) + 1;
    dots = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        dots.push({
          x: x * settings.spacing,
          y: y * settings.spacing,
          seed: (x * 17.13 + y * 11.71) % (Math.PI * 2)
        });
      }
    }
  }

  function onMove(event) {
    pointer.tx = event.clientX;
    pointer.ty = event.clientY;
  }

  function onLeave() {
    pointer.tx = width * 0.5;
    pointer.ty = height * 0.35;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function tick(time) {
    pointer.vx += (pointer.tx - pointer.x) * 0.08;
    pointer.vy += (pointer.ty - pointer.y) * 0.08;
    pointer.vx *= 0.82;
    pointer.vy *= 0.82;
    pointer.x += pointer.vx;
    pointer.y += pointer.vy;
    pointer.speed = Math.sqrt(pointer.vx * pointer.vx + pointer.vy * pointer.vy);

    ctx.clearRect(0, 0, width, height);

    const hueBase = 220 + Math.sin(time * 0.00025) * 20;
    const speedHue = clamp(pointer.speed * 18, 0, 70);

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      const dx = dot.x - pointer.x;
      const dy = dot.y - pointer.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const influence = Math.max(0, 1 - distance / settings.influence);
      const wave = Math.sin(time * 0.0012 + dot.seed) * 0.5 + 0.5;

      const offsetX = distance ? (dx / distance) * influence * settings.push : 0;
      const offsetY = distance ? (dy / distance) * influence * settings.push : 0;
      const radius = settings.baseRadius + influence * 2 + wave * 0.45;

      const hue = hueBase + speedHue + influence * 110 + wave * 18;
      const sat = 70 + influence * 20;
      const light = 58 + influence * 16;
      const alpha = 0.18 + influence * 0.65;

      ctx.beginPath();
      ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
      ctx.arc(dot.x + offsetX, dot.y + offsetY, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("mouseleave", onLeave);
  requestAnimationFrame(tick);
})();
