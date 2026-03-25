/**
 * G&J Window Tinting & Auto Restyling
 * Main JavaScript — Interactions, animations, and progressive enhancements
 */

(function () {
  'use strict';

  /* ============================================================
     SECURITY: Sanitize any dynamic output
     ============================================================ */
  function sanitize(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
  }

  /* ============================================================
     LOADER
     ============================================================ */
  const loader = document.getElementById('loader');
  if (loader) {
    window.addEventListener('load', function () {
      setTimeout(function () {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
      }, 1500);
    });
    document.body.style.overflow = 'hidden';
  }

  /* ============================================================
     CUSTOM CURSOR (desktop only)
     ============================================================ */
  if (window.matchMedia('(pointer: fine)').matches) {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (cursor) {
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
      }
    });

    // Smooth follower with RAF
    function animateFollower() {
      followerX += (mouseX - followerX) * 0.12;
      followerY += (mouseY - followerY) * 0.12;
      if (follower) {
        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';
      }
      requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Scale cursor on interactive elements
    const interactives = document.querySelectorAll('a, button, .service-card, .film-card, .review-card');
    interactives.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        if (cursor) cursor.style.transform = 'translate(-50%, -50%) scale(2.5)';
        if (follower) follower.style.transform = 'translate(-50%, -50%) scale(1.5)';
        if (follower) follower.style.borderColor = 'rgba(212,175,55,0.8)';
      });
      el.addEventListener('mouseleave', function () {
        if (cursor) cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        if (follower) follower.style.transform = 'translate(-50%, -50%) scale(1)';
        if (follower) follower.style.borderColor = 'rgba(212,175,55,0.5)';
      });
    });
  } else {
    // Hide cursor elements on touch devices
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');
    if (cursor) cursor.style.display = 'none';
    if (follower) follower.style.display = 'none';
  }

  /* ============================================================
     HEADER — scroll behaviour
     ============================================================ */
  const header = document.getElementById('header');
  let lastScroll = 0;

  function handleScroll() {
    const scrollY = window.scrollY;
    if (header) {
      if (scrollY > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Back to top button
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
      if (scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }

    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ============================================================
     HAMBURGER MENU
     ============================================================ */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      // Prevent body scroll when menu open
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });

    // Close mobile nav on link click
    mobileNav.querySelectorAll('.mobile-nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!header.contains(e.target) && mobileNav.classList.contains('open')) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ============================================================
     SMOOTH SCROLL for anchor links
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ============================================================
     REVEAL ON SCROLL (Intersection Observer)
     ============================================================ */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: show all
    revealEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ============================================================
     ACTIVE NAV LINK on scroll
     ============================================================ */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.header__nav a');

  if (sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (link) {
              link.style.color = '';
            });
            const id = entry.target.getAttribute('id');
            const activeLink = document.querySelector('.header__nav a[href="#' + id + '"]');
            if (activeLink) activeLink.style.color = 'var(--clr-white)';
          }
        });
      },
      { threshold: 0.4 }
    );
    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ============================================================
     BACK TO TOP
     ============================================================ */
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     FOOTER YEAR
     ============================================================ */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ============================================================
     PERFORMANCE: Lazy load map iframe
     ============================================================ */
  const mapIframe = document.querySelector('.map-section iframe');
  if (mapIframe && 'IntersectionObserver' in window) {
    const realSrc = mapIframe.getAttribute('src');
    mapIframe.removeAttribute('src');

    const mapObserver = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          mapIframe.setAttribute('src', realSrc);
          mapObserver.unobserve(mapIframe);
        }
      },
      { rootMargin: '200px' }
    );
    mapObserver.observe(mapIframe);
  }

  /* ============================================================
     EXTERNAL LINKS — security: add rel noopener noreferrer
     ============================================================ */
  document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
    const rel = link.getAttribute('rel') || '';
    if (!rel.includes('noopener')) {
      link.setAttribute('rel', (rel + ' noopener noreferrer').trim());
    }
  });

  /* ============================================================
     PHONE NUMBER CLICK TRACKING (optional analytics hook)
     ============================================================ */
  document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
    link.addEventListener('click', function () {
      // Placeholder for analytics event
      // e.g. gtag('event', 'phone_click', { ... });
    });
  });

  /* ============================================================
     SERVICE WORKER REGISTRATION (caching)
     ============================================================ */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker
        .register('/sw.js')
        .then(function (reg) {
          // Service worker registered
        })
        .catch(function (err) {
          // Service worker registration failed — site still works fine
        });
    });
  }

})();
