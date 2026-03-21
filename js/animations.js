/**
 * G&J Window Tinting — Canvas Animations
 * 1. Hero: floating light particles + tint film dust
 * 2. About: starfield (Starlight Headliner theme)
 */

(function () {
  'use strict';

  /* ============================================================
     UTILITY
  ============================================================ */
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  const GOLD   = hexToRgb('#e8a000');
  const ORANGE = hexToRgb('#ff6b00');
  const WHITE  = { r: 255, g: 255, b: 255 };

  /* ============================================================
     1. HERO CANVAS — Floating particles (light dust through film)
  ============================================================ */
  function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H, particles, animId;

    /* Skip heavy canvas on low-power devices */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      canvas.style.display = 'none';
      return;
    }

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function createParticle() {
      const col = Math.random() > 0.6 ? GOLD : Math.random() > 0.5 ? ORANGE : WHITE;
      return {
        x:     rand(0, W),
        y:     rand(0, H),
        r:     rand(0.5, 2.8),
        vx:    rand(-0.3, 0.3),
        vy:    rand(-0.6, -0.1),       // float upward
        alpha: rand(0.05, 0.45),
        dalpha: rand(0.002, 0.007),    // fade in/out speed
        fading: false,
        col,
        // some particles are elongated (like dust streaks)
        streak: Math.random() > 0.75,
        streakLen: rand(6, 22),
        angle: rand(-0.4, 0.4),
      };
    }

    function initParticles() {
      const count = Math.min(Math.floor((W * H) / 5000), 120);
      particles = [];
      for (let i = 0; i < count; i++) {
        const p = createParticle();
        p.y = rand(0, H); // spread initially
        particles.push(p);
      }
    }

    function drawParticle(p) {
      ctx.save();
      ctx.globalAlpha = p.alpha;

      if (p.streak) {
        // Light streak
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle + Math.atan2(p.vy, p.vx));
        const grad = ctx.createLinearGradient(-p.streakLen / 2, 0, p.streakLen / 2, 0);
        grad.addColorStop(0, `rgba(${p.col.r},${p.col.g},${p.col.b},0)`);
        grad.addColorStop(0.5, `rgba(${p.col.r},${p.col.g},${p.col.b},1)`);
        grad.addColorStop(1, `rgba(${p.col.r},${p.col.g},${p.col.b},0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = p.r;
        ctx.beginPath();
        ctx.moveTo(-p.streakLen / 2, 0);
        ctx.lineTo(p.streakLen / 2, 0);
        ctx.stroke();
      } else {
        // Glowing dot
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        grd.addColorStop(0, `rgba(${p.col.r},${p.col.g},${p.col.b},1)`);
        grd.addColorStop(1, `rgba(${p.col.r},${p.col.g},${p.col.b},0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function update() {
      ctx.clearRect(0, 0, W, H);

      particles.forEach(function (p, i) {
        p.x += p.vx;
        p.y += p.vy;

        // Fade in / out
        if (!p.fading) {
          p.alpha += p.dalpha;
          if (p.alpha >= 0.45) p.fading = true;
        } else {
          p.alpha -= p.dalpha;
        }

        // Reset when faded out or off screen
        if (p.alpha <= 0 || p.y < -10 || p.x < -20 || p.x > W + 20) {
          particles[i] = createParticle();
          particles[i].y = H + 5;
          particles[i].alpha = 0;
          particles[i].fading = false;
        }

        drawParticle(p);
      });

      animId = requestAnimationFrame(update);
    }

    // Init
    resize();
    initParticles();
    update();

    // Responsive
    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        cancelAnimationFrame(animId);
        resize();
        initParticles();
        update();
      }, 250);
    });

    // Pause when tab hidden (performance)
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        update();
      }
    });
  }

  /* ============================================================
     2. ABOUT CANVAS — Starfield (Starlight Headliner theme)
  ============================================================ */
  function initStarCanvas() {
    const canvas = document.getElementById('starCanvas');
    if (!canvas) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      canvas.style.display = 'none';
      return;
    }

    const ctx = canvas.getContext('2d');
    let W, H, stars, shootingStars, animId;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function createStar() {
      return {
        x:      rand(0, W),
        y:      rand(0, H),
        r:      rand(0.3, 1.8),
        alpha:  rand(0.1, 0.8),
        speed:  rand(0.003, 0.012),
        phase:  rand(0, Math.PI * 2),
        // some stars are warm gold, some cool white
        warm:   Math.random() > 0.6,
      };
    }

    function createShootingStar() {
      return {
        x:     rand(W * 0.1, W * 0.9),
        y:     rand(0, H * 0.4),
        len:   rand(60, 140),
        speed: rand(4, 9),
        alpha: 0,
        active: false,
        angle: rand(0.3, 0.7),    // radians (diagonal)
        progress: 0,
        // fire after random delay
        delay: rand(2000, 8000),
        lastFired: performance.now(),
      };
    }

    function initStars() {
      const count = Math.min(Math.floor((W * H) / 3000), 200);
      stars = [];
      for (let i = 0; i < count; i++) stars.push(createStar());

      shootingStars = [];
      for (let i = 0; i < 3; i++) shootingStars.push(createShootingStar());
    }

    function drawStars(ts) {
      ctx.clearRect(0, 0, W, H);

      // Static stars with gentle twinkle
      stars.forEach(function (s) {
        const twinkle = 0.5 + 0.5 * Math.sin(ts * s.speed + s.phase);
        const alpha   = s.alpha * twinkle;
        const col     = s.warm
          ? `rgba(255, 220, 120, ${alpha})`
          : `rgba(220, 230, 255, ${alpha})`;

        // Glow
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 2.5);
        grd.addColorStop(0, col);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Shooting stars
      shootingStars.forEach(function (ss) {
        const now = performance.now();

        if (!ss.active) {
          if (now - ss.lastFired > ss.delay) {
            ss.active   = true;
            ss.progress = 0;
            ss.alpha    = 0;
            ss.x        = rand(W * 0.1, W * 0.9);
            ss.y        = rand(0, H * 0.3);
          }
          return;
        }

        ss.progress += ss.speed / ss.len;

        if (ss.progress < 0.3) {
          ss.alpha = ss.progress / 0.3;
        } else if (ss.progress > 0.7) {
          ss.alpha = (1 - ss.progress) / 0.3;
        } else {
          ss.alpha = 1;
        }

        const ex = ss.x + Math.cos(ss.angle) * ss.len * ss.progress;
        const ey = ss.y + Math.sin(ss.angle) * ss.len * ss.progress;
        const sx = ex - Math.cos(ss.angle) * Math.min(ss.len * 0.4, ss.len * ss.progress);
        const sy = ey - Math.sin(ss.angle) * Math.min(ss.len * 0.4, ss.len * ss.progress);

        const grad = ctx.createLinearGradient(sx, sy, ex, ey);
        grad.addColorStop(0, `rgba(255, 220, 100, 0)`);
        grad.addColorStop(0.6, `rgba(255, 240, 180, ${ss.alpha * 0.7})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${ss.alpha})`);

        ctx.save();
        ctx.strokeStyle = grad;
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.restore();

        if (ss.progress >= 1) {
          ss.active    = false;
          ss.lastFired = performance.now();
          ss.delay     = rand(3000, 10000);
        }
      });
    }

    function loop(ts) {
      drawStars(ts / 1000);
      animId = requestAnimationFrame(loop);
    }

    // Only run when about section is in view (performance)
    const aboutSection = document.getElementById('about');
    let running = false;

    if ('IntersectionObserver' in window && aboutSection) {
      const obs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          if (!running) {
            running = true;
            resize();
            initStars();
            animId = requestAnimationFrame(loop);
          }
        } else {
          if (running) {
            cancelAnimationFrame(animId);
            running = false;
          }
        }
      }, { threshold: 0.1 });
      obs.observe(aboutSection);
    } else {
      resize();
      initStars();
      animId = requestAnimationFrame(loop);
    }

    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        cancelAnimationFrame(animId);
        running = false;
        resize();
        initStars();
      }, 300);
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        cancelAnimationFrame(animId);
        running = false;
      }
    });
  }

  /* ============================================================
     INIT on DOM ready
  ============================================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initHeroCanvas();
      initStarCanvas();
    });
  } else {
    initHeroCanvas();
    initStarCanvas();
  }

})();
