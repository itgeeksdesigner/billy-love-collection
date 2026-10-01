/* ==========================================================================
   Speedgear Racing — Global Script
   Each module initialises only when its markup is on the page, so this file
   is shared safely by the homepage and all future inner pages.
   ========================================================================== */

(function () {
  'use strict';

  const DESKTOP_NAV = window.matchMedia('(min-width: 992px)');

  /* ---------- Announcement bar ----------
     Desktop shows three messages per page, tablet/mobile show one. */
  function initAnnouncement() {
    const bar = document.querySelector('[data-announcement]');
    if (!bar) return;

    const items = Array.from(bar.querySelectorAll('.announcement__item'));
    if (!items.length) return;

    let page = 0;
    let timer;

    const perPage = () => (DESKTOP_NAV.matches ? 3 : 1);
    const pageCount = () => Math.ceil(items.length / perPage());

    const show = (next) => {
      const size = perPage();
      page = (next + pageCount()) % pageCount();
      items.forEach((item, i) => {
        item.classList.toggle('is-visible', i >= page * size && i < (page + 1) * size);
      });
    };

    const start = () => {
      clearInterval(timer);
      if (pageCount() > 1) timer = setInterval(() => show(page + 1), 5000);
    };

    bar.querySelector('[data-announcement-prev]').addEventListener('click', () => { show(page - 1); start(); });
    bar.querySelector('[data-announcement-next]').addEventListener('click', () => { show(page + 1); start(); });
    bar.addEventListener('mouseenter', () => clearInterval(timer));
    bar.addEventListener('mouseleave', start);
    DESKTOP_NAV.addEventListener('change', () => { show(0); start(); });

    show(0);
    start();
  }

  /* ---------- Sticky header shadow + back to top ---------- */
  function initScrollState() {
    const header = document.querySelector('[data-header]');
    const toTop = document.querySelector('[data-back-to-top]');

    const update = () => {
      const y = window.scrollY;
      if (header) header.classList.toggle('is-scrolled', y > 10);
      if (toTop) toTop.classList.toggle('is-visible', y > 600);
    };

    window.addEventListener('scroll', update, { passive: true });
    update();

    if (toTop) {
      toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
  }

  /* ---------- Desktop mega menu ---------- */
  function initMegaMenu() {
    const items = document.querySelectorAll('[data-nav-item]');
    if (!items.length) return;

    const close = (item) => {
      item.classList.remove('is-open');
      item.querySelector('.site-nav__link').setAttribute('aria-expanded', 'false');
    };

    const closeAll = (except) => items.forEach((item) => { if (item !== except) close(item); });

    const open = (item) => {
      closeAll(item);
      item.classList.add('is-open');
      item.querySelector('.site-nav__link').setAttribute('aria-expanded', 'true');
    };

    items.forEach((item) => {
      let hoverTimer;
      const link = item.querySelector('.site-nav__link');

      item.addEventListener('mouseenter', () => {
        if (!DESKTOP_NAV.matches) return;
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => open(item), 120);
      });

      item.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => close(item), 150);
      });

      // Keyboard: Enter/Space/ArrowDown on the top link opens the panel
      link.addEventListener('keydown', (event) => {
        if (['ArrowDown', ' '].includes(event.key) || (event.key === 'Enter' && !item.classList.contains('is-open'))) {
          event.preventDefault();
          open(item);
          const first = item.querySelector('.mega-menu a, .mega-menu button');
          if (first) first.focus();
        }
      });

      item.addEventListener('focusout', (event) => {
        if (!item.contains(event.relatedTarget)) close(item);
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      const openItem = document.querySelector('[data-nav-item].is-open');
      if (openItem) {
        close(openItem);
        openItem.querySelector('.site-nav__link').focus();
      }
    });
  }

  /* ---------- A–Z tabs inside the mega menu ---------- */
  function initMegaTabs() {
    document.querySelectorAll('[data-mega-tabs]').forEach((tabs) => {
      const buttons = tabs.querySelectorAll('.mega-tabs__btn');
      const panels = tabs.querySelectorAll('.mega-tabs__panel');

      const activate = (button) => {
        buttons.forEach((b) => {
          b.classList.toggle('is-active', b === button);
          b.setAttribute('aria-selected', String(b === button));
        });
        panels.forEach((panel) => panel.classList.toggle('is-active', panel.id === button.dataset.tabTarget));
      };

      buttons.forEach((button) => {
        button.addEventListener('mouseenter', () => activate(button));
        button.addEventListener('click', () => activate(button));
      });
    });
  }

  /* ---------- Mobile drawer ---------- */
  function initDrawer() {
    const drawer = document.querySelector('[data-drawer]');
    const overlay = document.querySelector('[data-drawer-overlay]');
    const openBtn = document.querySelector('[data-drawer-open]');
    if (!drawer || !openBtn) return;

    const setOpen = (isOpen) => {
      drawer.classList.toggle('is-open', isOpen);
      overlay.classList.toggle('is-open', isOpen);
      drawer.setAttribute('aria-hidden', String(!isOpen));
      openBtn.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('is-locked', isOpen);
      if (isOpen) drawer.querySelector('[data-drawer-close]').focus();
      else openBtn.focus();
    };

    openBtn.addEventListener('click', () => setOpen(true));
    drawer.querySelector('[data-drawer-close]').addEventListener('click', () => setOpen(false));
    overlay.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && drawer.classList.contains('is-open')) setOpen(false);
    });
    DESKTOP_NAV.addEventListener('change', (event) => {
      if (event.matches && drawer.classList.contains('is-open')) setOpen(false);
    });

    drawer.querySelectorAll('.accordion__trigger').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('[data-accordion]');
        const isOpen = item.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', String(isOpen));
      });
    });
  }

  /* ---------- Mobile search toggle ---------- */
  function initMobileSearch() {
    const toggle = document.querySelector('[data-search-toggle]');
    const panel = document.querySelector('[data-mobile-search]');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', () => {
      const isOpen = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) panel.querySelector('input').focus();
    });
  }

  /* ---------- Hero slideshow (side arrows, counter, team tabs) ---------- */
  function initSlider() {
    document.querySelectorAll('[data-slider]').forEach((slider) => {
      const track = slider.querySelector('[data-slider-track]');
      const slides = Array.from(track.children);
      const tabs = slider.querySelectorAll('[data-slider-tabs] button');
      const current = slider.querySelector('[data-slider-current]');
      const total = slider.querySelector('[data-slider-total]');
      if (slides.length < 2) return;

      const pad = (n) => String(n).padStart(2, '0');
      let index = 0;
      let timer;
      let touchX = null;

      if (total) total.textContent = pad(slides.length);

      const go = (next) => {
        index = (next + slides.length) % slides.length;
        track.style.transform = `translateX(-${index * 100}%)`;
        tabs.forEach((tab, i) => {
          tab.classList.toggle('is-active', i === index);
          tab.setAttribute('aria-selected', String(i === index));
        });
        slides.forEach((slide, i) => {
          slide.setAttribute('aria-hidden', String(i !== index));
          slide.querySelectorAll('a').forEach((link) => { link.tabIndex = i === index ? 0 : -1; });
        });
        if (current) current.textContent = pad(index + 1);
      };

      const start = () => {
        clearInterval(timer);
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          timer = setInterval(() => go(index + 1), 6000);
        }
      };

      slider.querySelector('[data-slider-prev]').addEventListener('click', () => { go(index - 1); start(); });
      slider.querySelector('[data-slider-next]').addEventListener('click', () => { go(index + 1); start(); });
      tabs.forEach((tab, i) => tab.addEventListener('click', () => { go(i); start(); }));

      slider.addEventListener('mouseenter', () => clearInterval(timer));
      slider.addEventListener('mouseleave', start);
      slider.addEventListener('focusin', () => clearInterval(timer));

      slider.addEventListener('touchstart', (event) => { touchX = event.touches[0].clientX; }, { passive: true });
      slider.addEventListener('touchend', (event) => {
        if (touchX === null) return;
        const delta = event.changedTouches[0].clientX - touchX;
        if (Math.abs(delta) > 50) { go(delta < 0 ? index + 1 : index - 1); start(); }
        touchX = null;
      });

      go(0);
      start();
    });
  }

  /* ---------- Product carousel ---------- */
  function initCarousels() {
    document.querySelectorAll('[data-carousel]').forEach((carousel) => {
      const track = carousel.querySelector('[data-carousel-track]');
      const prev = carousel.querySelector('[data-carousel-prev]');
      const next = carousel.querySelector('[data-carousel-next]');
      const bar = carousel.querySelector('[data-carousel-progress]');

      const step = () => {
        const card = track.firstElementChild;
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        return card ? card.offsetWidth + gap : track.clientWidth;
      };

      const update = () => {
        const max = track.scrollWidth - track.clientWidth;
        const visible = track.clientWidth / track.scrollWidth;
        prev.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft >= max - 2;
        if (bar) {
          bar.style.width = `${Math.max(visible * 100, 10)}%`;
          const progress = max > 0 ? track.scrollLeft / max : 0;
          bar.style.transform = `translateX(${progress * ((1 / Math.max(visible, 0.1)) - 1) * 100}%)`;
        }
      };

      prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
      next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
      track.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();
    });
  }

  /* ---------- Product tabs (Best Sellers / New Arrivals) ---------- */
  function initProductTabs() {
    document.querySelectorAll('[data-product-tabs]').forEach((section) => {
      const tabs = section.querySelectorAll('[data-tab-target]');
      const viewAll = section.querySelector('[data-tab-view-all]');

      tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          tabs.forEach((t) => {
            const active = t === tab;
            t.classList.toggle('is-active', active);
            t.setAttribute('aria-selected', String(active));
            section.querySelector(`#${t.dataset.tabTarget}`).classList.toggle('is-active', active);
          });
          if (viewAll && tab.dataset.viewAll) viewAll.href = tab.dataset.viewAll;
        });
      });
    });
  }

  /* ---------- Countdown (Clearance lap) ----------
     End time comes from data-countdown-end on the section. */
  function initCountdown() {
    document.querySelectorAll('[data-countdown]').forEach((el) => {
      const end = new Date(el.dataset.countdownEnd).getTime();
      if (Number.isNaN(end)) return;

      const parts = {
        days: el.querySelector('[data-countdown-days]'),
        hours: el.querySelector('[data-countdown-hours]'),
        mins: el.querySelector('[data-countdown-mins]'),
        secs: el.querySelector('[data-countdown-secs]'),
      };
      const pad = (n) => String(n).padStart(2, '0');
      let timer;

      const tick = () => {
        const left = Math.max(0, end - Date.now());
        const total = Math.floor(left / 1000);
        parts.days.textContent = pad(Math.floor(total / 86400));
        parts.hours.textContent = pad(Math.floor((total % 86400) / 3600));
        parts.mins.textContent = pad(Math.floor((total % 3600) / 60));
        parts.secs.textContent = pad(total % 60);
        if (left === 0) {
          el.classList.add('is-ended');
          clearInterval(timer);
        }
      };

      tick();
      timer = setInterval(tick, 1000);
    });
  }

  /* ---------- Footer accordions (mobile) ---------- */
  function initFooter() {
    document.querySelectorAll('[data-footer-toggle]').forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const col = toggle.closest('[data-footer-col]');
        const isOpen = col.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
      });
    });

    const year = document.querySelector('[data-year]');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ---------- Newsletter validation ---------- */
  function initNewsletter() {
    document.querySelectorAll('[data-newsletter]').forEach((form) => {
      const input = form.querySelector('input[type="email"]');
      const message = form.querySelector('[data-newsletter-message]');

      form.addEventListener('submit', (event) => {
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
        message.classList.remove('is-error', 'is-success');

        if (!valid) {
          event.preventDefault();
          message.textContent = 'Please enter a valid email address.';
          message.classList.add('is-error');
          input.focus();
          return;
        }

        // Static preview only: on Shopify the form posts to /contact as normal.
        if (!window.Shopify) {
          event.preventDefault();
          message.textContent = 'Thanks for subscribing! Watch your inbox for exclusive deals.';
          message.classList.add('is-success');
          form.reset();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initAnnouncement();
    initScrollState();
    initMegaMenu();
    initMegaTabs();
    initDrawer();
    initMobileSearch();
    initSlider();
    initCarousels();
    initProductTabs();
    initNewsletter();
    initCountdown();
    initFooter();
  });
})();
