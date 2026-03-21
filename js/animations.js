/**
 * G&J Window Tinting — Canvas Animations
 * Blue/teal light particles through tinted glass + starfield
 */
(function () {
  'use strict';

  function rand(a, b) { return Math.random() * (b - a) + a; }

  /* colour palette — blues, teals, purples, gold accent */
  const COLOURS = [
    { r: 0,   g: 200, b: 255 }, // cyan
    { r: 0,   g: 160, b: 255 }, // sky blue
    { r: 80,  g: 0,   b: 255 }, // violet
    { r: 0,   g: 255, b: 200 }, // teal
    { r: 120, g: 80,  b: 255 }, // purple
    { r: 232, g: 160, b: 0   }, // gold accent
  ];

  function pickColour() { return COLOURS[Math.floor(Math.random() * COLOURS.length)]; }

  /* ============================================================
     HERO CANVAS — floating light dust through tinted glass
  ============================================================ */
  function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { canvas.style.display = 'none'; return; }

    const ctx = canvas.getContext('2d');
    let W, H, particles, animId;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function newParticle() {
      const col = pickColour();
      return {
        x: rand(0, W), y: rand(0, H),
        r: rand(0.4, 2.5),
        vx: rand(-0.25, 0.25),
        vy: rand(-0.55, -0.08),
        alpha: rand(0.05, 0.5),
        dalpha: rand(0.002, 0.008),
        fading: false,
        col,
        streak: Math.random() > 0.7,
        streakLen: rand(8, 28),
        angle: rand(-0.5, 0.5),
      };
    }

    function drawParticle(p) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      if (p.streak) {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle + Math.atan2(p.vy, p.vx));
        const g = ctx.createLinearGradient(-p.streakLen / 2, 0, p.streakLen / 2, 0);
        g.addColorStop(0,   `rgba(${p.col.r},${p.col.g},${p.col.b},0)`);
        g.addColorStop(0.5, `rgba(${p.col.r},${p.col.g},${p.col.b},1)`);
        g.addColorStop(1,   `rgba(${p.col.r},${p.col.g},${p.col.b},0)`);
        ctx.strokeStyle = g;
        ctx.lineWidth = p.r;
        ctx.beginPath();
        ctx.moveTo(-p.streakLen / 2, 0);
        ctx.lineTo( p.streakLen / 2, 0);
        ctx.stroke();
      } else {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        g.addColorStop(0, `rgba(${p.col.r},${p.col.g},${p.col.b},1)`);
        g.addColorStop(1, `rgba(${p.col.r},${p.col.g},${p.col.b},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function initParticles() {
      const n = Math.min(Math.floor(W * H / 4800), 130);
      particles = Array.from({ length: n }, newParticle);
    }

    function update() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(function (p, i) {
        p.x += p.vx; p.y += p.vy;
        if (!p.fading) { p.alpha += p.dalpha; if (p.alpha >= 0.5) p.fading = true; }
        else           { p.alpha -= p.dalpha; }
        if (p.alpha <= 0 || p.y < -10 || p.x < -30 || p.x > W + 30) {
          particles[i] = newParticle();
          particles[i].y = H + 5;
          particles[i].alpha = 0;
          particles[i].fading = false;
        }
        drawParticle(p);
      });
      animId = requestAnimationFrame(update);
    }

    resize(); initParticles(); update();

    let rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { cancelAnimationFrame(animId); resize(); initParticles(); update(); }, 250);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) cancelAnimationFrame(animId); else update();
    });
  }

  /* ============================================================
     ABOUT CANVAS — starfield (starlight headliner theme)
  ============================================================ */
  function initStarCanvas() {
    const canvas = document.getElementById('starCanvas');
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { canvas.style.display = 'none'; return; }

    const ctx = canvas.getContext('2d');
    let W, H, stars, shooters, animId, running = false;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function newStar() {
      return {
        x: rand(0, W), y: rand(0, H),
        r: rand(0.3, 1.8),
        alpha: rand(0.1, 0.8),
        speed: rand(0.003, 0.012),
        phase: rand(0, Math.PI * 2),
        col: Math.random() > 0.5
          ? { r: 0, g: 200, b: 255 }   // cyan star
          : { r: 180, g: 160, b: 255 }, // lavender star
      };
    }

    function newShooter() {
      return {
        x: rand(W * 0.1, W * 0.9), y: rand(0, H * 0.35),
        len: rand(70, 160), speed: rand(4, 10),
        alpha: 0, active: false, progress: 0,
        angle: rand(0.3, 0.65),
        delay: rand(2000, 9000), lastFired: performance.now(),
      };
    }

    function initStars() {
      const n = Math.min(Math.floor(W * H / 2800), 220);
      stars    = Array.from({ length: n }, newStar);
      shooters = Array.from({ length: 3 },  newShooter);
    }

    function draw(ts) {
      ctx.clearRect(0, 0, W, H);
      stars.forEach(function (s) {
        const tw  = 0.5 + 0.5 * Math.sin(ts * s.speed + s.phase);
        const a   = s.alpha * tw;
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 2.5);
        grd.addColorStop(0, `rgba(${s.col.r},${s.col.g},${s.col.b},${a})`);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      shooters.forEach(function (ss) {
        const now = performance.now();
        if (!ss.active) {
          if (now - ss.lastFired > ss.delay) { ss.active = true; ss.progress = 0; ss.alpha = 0; ss.x = rand(W*0.1, W*0.9); ss.y = rand(0, H*0.3); }
          return;
        }
        ss.progress += ss.speed / ss.len;
        if      (ss.progress < 0.3) ss.alpha = ss.progress / 0.3;
        else if (ss.progress > 0.7) ss.alpha = (1 - ss.progress) / 0.3;
        else                         ss.alpha = 1;

        const ex = ss.x + Math.cos(ss.angle) * ss.len * ss.progress;
        const ey = ss.y + Math.sin(ss.angle) * ss.len * ss.progress;
        const sx = ex - Math.cos(ss.angle) * Math.min(ss.len * 0.4, ss.len * ss.progress);
        const sy = ey - Math.sin(ss.angle) * Math.min(ss.len * 0.4, ss.len * ss.progress);

        const g = ctx.createLinearGradient(sx, sy, ex, ey);
        g.addColorStop(0,   'rgba(0,200,255,0)');
        g.addColorStop(0.6, `rgba(100,220,255,${ss.alpha * 0.7})`);
        g.addColorStop(1,   `rgba(255,255,255,${ss.alpha})`);
        ctx.save();
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.restore();

        if (ss.progress >= 1) { ss.active = false; ss.lastFired = performance.now(); ss.delay = rand(3000, 11000); }
      });
    }

    function loop(ts) { draw(ts / 1000); animId = requestAnimationFrame(loop); }

    const about = document.getElementById('about');
    if ('IntersectionObserver' in window && about) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          if (!running) { running = true; resize(); initStars(); animId = requestAnimationFrame(loop); }
        } else {
          if (running) { cancelAnimationFrame(animId); running = false; }
        }
      }, { threshold: 0.1 }).observe(about);
    } else {
      resize(); initStars(); animId = requestAnimationFrame(loop);
    }

    let rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { cancelAnimationFrame(animId); running = false; resize(); initStars(); }, 300);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { cancelAnimationFrame(animId); running = false; }
    });
  }

  /* init */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initHeroCanvas(); initStarCanvas(); });
  } else {
    initHeroCanvas(); initStarCanvas();
  }
})();
