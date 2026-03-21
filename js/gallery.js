/**
 * G&J Window Tinting — Gallery JavaScript
 * Handles: filter tabs, lightbox, keyboard nav, touch swipe
 *
 * ============================================================
 * HOW TO ADD YOUR PHOTOS & VIDEOS
 * ============================================================
 *
 * 1. Create these folders in your project:
 *      images/gallery/    ← put your photos here (.jpg, .webp, .png)
 *      videos/gallery/    ← put your videos here (.mp4 recommended)
 *
 * 2. Add each file to the GALLERY_ITEMS array below.
 *    Each item needs:
 *      - type:     'photo' or 'video'
 *      - category: 'auto' | 'home' | 'commercial' | 'headliner' | 'utv' | 'video'
 *      - src:      path to your file  e.g. 'images/gallery/truck-tint-1.jpg'
 *      - thumb:    (optional) path to a smaller thumbnail — if blank, src is used
 *      - caption:  text shown in lightbox
 *      - wide:     true to make it span 2 columns (use for landscape/before-after shots)
 *      - tall:     true to make it span 2 rows   (use for portrait shots)
 *      - feature:  true to make it 2×2 (hero shot — use sparingly)
 *
 * EXAMPLE:
 *   {
 *     type: 'photo',
 *     category: 'auto',
 *     src: 'images/gallery/black-truck-tint.jpg',
 *     caption: 'Ford F-150 — 20% Ceramic Tint',
 *     wide: true
 *   },
 *   {
 *     type: 'video',
 *     category: 'headliner',
 *     src: 'videos/gallery/starlight-install.mp4',
 *     thumb: 'images/gallery/starlight-thumb.jpg',
 *     caption: 'Starlight Headliner Install — GMC Yukon'
 *   },
 *
 * 3. Save this file and push to GitHub — Vercel will redeploy automatically.
 * ============================================================
 */

const GALLERY_ITEMS = [
  // ── Paste your items here ──────────────────────────────
  // Example (delete these and add your real files):
  //
  // {
  //   type: 'photo',
  //   category: 'auto',
  //   src: 'images/gallery/your-photo.jpg',
  //   caption: 'Your caption here',
  //   wide: false
  // },
  //
  // ──────────────────────────────────────────────────────
];

(function () {
  'use strict';

  /* ============================================================
     BUILD GRID FROM GALLERY_ITEMS
     (only runs if GALLERY_ITEMS has entries — otherwise
      the placeholder HTML in gallery.html is shown)
  ============================================================ */
  function buildGrid() {
    if (!GALLERY_ITEMS || GALLERY_ITEMS.length === 0) return;

    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    // Clear placeholder HTML
    grid.innerHTML = '';

    GALLERY_ITEMS.forEach(function (item, index) {
      const div = document.createElement('div');
      div.className = 'gallery-item' +
        (item.wide    ? ' gallery-item--wide'    : '') +
        (item.tall    ? ' gallery-item--tall'    : '') +
        (item.feature ? ' gallery-item--feature' : '');
      div.dataset.category = item.category || 'all';
      div.dataset.type     = item.type || 'photo';
      div.dataset.index    = index;

      const inner = document.createElement('div');
      inner.className = 'gallery-item__inner';

      if (item.type === 'video') {
        // Video thumbnail or a video element
        if (item.thumb) {
          const img = document.createElement('img');
          img.src     = sanitizePath(item.thumb);
          img.alt     = item.caption || 'G&J Window Tinting video';
          img.loading = 'lazy';
          img.decoding = 'async';
          inner.appendChild(img);
        } else {
          const vid = document.createElement('video');
          vid.src      = sanitizePath(item.src);
          vid.muted    = true;
          vid.preload  = 'metadata';
          vid.setAttribute('playsinline', '');
          inner.appendChild(vid);
        }
      } else {
        const img = document.createElement('img');
        img.src      = sanitizePath(item.src);
        img.alt      = item.caption || 'G&J Window Tinting work';
        img.loading  = 'lazy';
        img.decoding = 'async';
        inner.appendChild(img);
      }

      // Overlay
      const overlay = document.createElement('div');
      overlay.className = 'gallery-item__overlay';
      overlay.innerHTML =
        '<span class="gallery-item__label">' + escapeHTML(categoryLabel(item.category)) + '</span>' +
        '<span class="gallery-item__zoom">' + (item.type === 'video' ? '▶' : '🔍') + '</span>';

      inner.appendChild(overlay);
      div.appendChild(inner);
      grid.appendChild(div);
    });

    // Re-attach click listeners after building
    attachItemListeners();
  }

  function sanitizePath(path) {
    // Only allow safe relative paths — no protocol, no double-dots
    if (!path || typeof path !== 'string') return '';
    if (/^https?:\/\//i.test(path)) return ''; // block external src
    if (path.includes('..')) return '';
    return path.replace(/[<>"']/g, '');
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
  }

  function categoryLabel(cat) {
    const map = {
      auto:       'Auto Tint',
      home:       'Home Tint',
      commercial: 'Commercial',
      headliner:  'Headliner',
      utv:        'UTV / Equipment',
      video:      'Video',
    };
    return map[cat] || cat;
  }

  /* ============================================================
     FILTER TABS
  ============================================================ */
  function initFilters() {
    const btns  = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.gallery-item');
    const empty = document.getElementById('galleryEmpty');

    if (!btns.length) return;

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const filter = this.dataset.filter;

        // Update active button
        btns.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');

        // Filter items
        let visible = 0;
        items.forEach(function (item) {
          const cat  = item.dataset.category;
          const type = item.dataset.type;
          const show = filter === 'all' ||
                       cat === filter   ||
                       (filter === 'video' && type === 'video');

          if (show) {
            item.classList.remove('hidden');
            visible++;
          } else {
            item.classList.add('hidden');
          }
        });

        // Show empty state if nothing visible
        if (empty) {
          empty.style.display = visible === 0 ? 'block' : 'none';
        }
      });
    });
  }

  /* ============================================================
     NOTICE DISMISS
  ============================================================ */
  function initNotice() {
    const btn = document.getElementById('noticeClose');
    const notice = document.getElementById('galleryNotice');
    if (btn && notice) {
      btn.addEventListener('click', function () {
        notice.style.transition = 'opacity 0.3s, max-height 0.4s';
        notice.style.opacity = '0';
        notice.style.maxHeight = '0';
        notice.style.overflow = 'hidden';
        notice.style.padding = '0';
        notice.style.margin = '0';
        setTimeout(function () { notice.style.display = 'none'; }, 400);
      });
    }
  }

  /* ============================================================
     LIGHTBOX
  ============================================================ */
  let currentIndex = -1;
  let visibleItems  = [];

  function getVisibleItems() {
    return Array.from(document.querySelectorAll('.gallery-item:not(.hidden)'));
  }

  function openLightbox(index) {
    visibleItems = getVisibleItems();
    if (!visibleItems.length) return;

    // Clamp index
    currentIndex = Math.max(0, Math.min(index, visibleItems.length - 1));

    const lb         = document.getElementById('lightbox');
    const backdrop   = document.getElementById('lightboxBackdrop');
    const content    = document.getElementById('lightboxContent');
    const caption    = document.getElementById('lightboxCaption');
    const counter    = document.getElementById('lightboxCounter');

    if (!lb || !backdrop || !content) return;

    lb.style.display      = 'flex';
    backdrop.style.display = 'block';
    document.body.style.overflow = 'hidden';

    renderLightboxItem(content, caption, counter);

    // Focus trap
    lb.focus && lb.focus();
  }

  function renderLightboxItem(content, caption, counter) {
    const item     = visibleItems[currentIndex];
    const type     = item.dataset.type;
    const itemIdx  = parseInt(item.dataset.index, 10);
    const data     = GALLERY_ITEMS[itemIdx];

    content.innerHTML = '';

    if (type === 'video' && data && data.src) {
      const vid = document.createElement('video');
      vid.src      = sanitizePath(data.src);
      vid.controls = true;
      vid.autoplay = true;
      vid.setAttribute('playsinline', '');
      content.appendChild(vid);
    } else if (type === 'video') {
      // Placeholder video
      content.innerHTML = '<div style="width:560px;max-width:80vw;height:320px;display:flex;align-items:center;justify-content:center;background:var(--clr-bg-2);border-radius:16px;font-size:4rem;">▶</div>';
    } else if (data && data.src) {
      const img = document.createElement('img');
      img.src = sanitizePath(data.src);
      img.alt = data.caption || 'G&J Window Tinting';
      content.appendChild(img);
    } else {
      // Placeholder image
      const img = item.querySelector('img');
      const placeholder = item.querySelector('.gallery-placeholder');
      if (img && img.src && !img.src.includes('undefined')) {
        const clone = img.cloneNode(true);
        clone.style.maxWidth  = '80vw';
        clone.style.maxHeight = '80vh';
        content.appendChild(clone);
      } else {
        content.innerHTML = '<div style="width:480px;max-width:80vw;height:360px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;background:var(--clr-bg-2);border-radius:16px;font-size:3rem;color:var(--clr-gray);">' +
          (placeholder ? placeholder.innerHTML : '📸') + '</div>';
      }
    }

    if (caption) {
      caption.textContent = (data && data.caption) ? data.caption :
        categoryLabel(item.dataset.category);
    }
    if (counter) {
      counter.textContent = (currentIndex + 1) + ' / ' + visibleItems.length;
    }
  }

  function closeLightbox() {
    const lb       = document.getElementById('lightbox');
    const backdrop = document.getElementById('lightboxBackdrop');
    const content  = document.getElementById('lightboxContent');

    if (!lb) return;

    // Pause any playing video
    const vid = content && content.querySelector('video');
    if (vid) { vid.pause(); vid.src = ''; }

    lb.style.display       = 'none';
    backdrop.style.display = 'none';
    document.body.style.overflow = '';
    currentIndex = -1;
  }

  function lightboxNav(direction) {
    visibleItems = getVisibleItems();
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = visibleItems.length - 1;
    if (currentIndex >= visibleItems.length) currentIndex = 0;

    const content  = document.getElementById('lightboxContent');
    const caption  = document.getElementById('lightboxCaption');
    const counter  = document.getElementById('lightboxCounter');

    // Pause old video
    const vid = content && content.querySelector('video');
    if (vid) { vid.pause(); vid.src = ''; }

    renderLightboxItem(content, caption, counter);
  }

  function attachItemListeners() {
    document.querySelectorAll('.gallery-item').forEach(function (item, i) {
      item.addEventListener('click', function () {
        visibleItems = getVisibleItems();
        const idx = visibleItems.indexOf(item);
        openLightbox(idx >= 0 ? idx : i);
      });
    });
  }

  function initLightbox() {
    // Close button
    const closeBtn = document.getElementById('lightboxClose');
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

    // Prev / Next
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    if (prevBtn) prevBtn.addEventListener('click', function () { lightboxNav(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { lightboxNav(1); });

    // Backdrop click
    const backdrop = document.getElementById('lightboxBackdrop');
    if (backdrop) backdrop.addEventListener('click', closeLightbox);

    // Keyboard
    document.addEventListener('keydown', function (e) {
      const lb = document.getElementById('lightbox');
      if (!lb || lb.style.display === 'none') return;
      if (e.key === 'Escape')      closeLightbox();
      if (e.key === 'ArrowLeft')   lightboxNav(-1);
      if (e.key === 'ArrowRight')  lightboxNav(1);
    });

    // Touch swipe
    let touchStartX = 0;
    const lb = document.getElementById('lightbox');
    if (lb) {
      lb.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      lb.addEventListener('touchend', function (e) {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) lightboxNav(diff > 0 ? 1 : -1);
      }, { passive: true });
    }

    // Attach click to existing placeholder items
    attachItemListeners();
  }

  /* ============================================================
     FOOTER YEAR
  ============================================================ */
  document.querySelectorAll('.footer-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ============================================================
     REVEAL ANIMATIONS
  ============================================================ */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { obs.observe(el); });
  }

  /* ============================================================
     INIT
  ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    buildGrid();
    initFilters();
    initLightbox();
    initNotice();
    initReveal();
  });

})();
