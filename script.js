/* =========================================================
   BILLY LOVE COLLECTION — SCRIPTS
   1.  Announcement rotator
   2.  Sticky header state
   3.  Mobile drawer
   5.  Size swatches
   6.  Quick view modal
   7.  Add to bag / buy now
   9.  Newsletter
   10. Marquee duplication guard
   11. Best sellers tabs
   12. Best sellers carousel
   13. Scroll reveal
   14. Testimonial slider
   ========================================================= */

(function () {
  'use strict';

  var body = document.body;

  /* ---------- helpers ---------- */
  function qs(selector, scope) { return (scope || document).querySelector(selector); }
  function qsa(selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }

  /* ============ 1. ANNOUNCEMENT ROTATOR ============ */
  (function announcementRotator() {
    var items = qsa('.announcement__item');
    if (items.length < 2) { return; }

    var index = 0;
    var timer = null;

    function show(next) {
      items[index].classList.remove('is-active');
      index = (next + items.length) % items.length;
      items[index].classList.add('is-active');
    }

    function autoplay() {
      timer = window.setInterval(function () { show(index + 1); }, 5000);
    }

    function restart() {
      window.clearInterval(timer);
      autoplay();
    }

    var prev = qs('[data-announce-prev]');
    var next = qs('[data-announce-next]');

    if (prev) { prev.addEventListener('click', function () { show(index - 1); restart(); }); }
    if (next) { next.addEventListener('click', function () { show(index + 1); restart(); }); }

    autoplay();
  }());

  /* ============ 2. STICKY HEADER STATE ============ */
  (function stickyHeader() {
    var top = qs('#siteTop');
    if (!top) { return; }

    // Measured before .is-stuck hides the announcement, otherwise the
    // threshold would shrink on activation and flicker at the boundary.
    var threshold = top.offsetHeight;

    function onScroll() {
      top.classList.toggle('is-stuck', window.scrollY > threshold);
    }

    window.addEventListener('resize', function () {
      if (!top.classList.contains('is-stuck')) { threshold = top.offsetHeight; }
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }());

  /* ============ 3. MOBILE DRAWER ============ */
  (function mobileDrawer() {
    var drawer = qs('#mobileDrawer');
    var openBtn = qs('[data-open-menu]');
    if (!drawer || !openBtn) { return; }

    function open() {
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      body.classList.add('is-locked');
    }

    function close() {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      body.classList.remove('is-locked');
    }

    openBtn.addEventListener('click', open);

    qsa('[data-close-menu]').forEach(function (btn) { btn.addEventListener('click', close); });
    qsa('.drawer__link').forEach(function (link) { link.addEventListener('click', close); });

    drawer.addEventListener('click', function (event) {
      if (event.target === drawer) { close(); }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { close(); }
    });
  }());

  /* ============ 5. SIZE SWATCHES ============ */
  (function sizeSwatches() {
    qsa('.size-swatches').forEach(function (group) {
      qsa('.size-swatch', group).forEach(function (swatch) {
        swatch.addEventListener('click', function (event) {
          event.preventDefault();
          qsa('.size-swatch', group).forEach(function (item) { item.classList.remove('is-selected'); });
          swatch.classList.add('is-selected');
        });
      });
    });
  }());

  /* ============ 6. QUICK VIEW MODAL ============ */
  (function quickView() {
    var modal = qs('#quickView');
    if (!modal) { return; }

    var titleEl = qs('[data-qv-title]', modal);
    var priceEl = qs('[data-qv-price]', modal);
    var imageEl = qs('[data-qv-image]', modal);

    function open(card) {
      var image = card.getAttribute('data-image');

      var name = card.getAttribute('data-product') || 'Product';

      modal.setAttribute('data-product', name);
      titleEl.textContent = name;
      priceEl.textContent = card.getAttribute('data-price') || '';
      if (image) { imageEl.setAttribute('src', image); }

      qsa('.size-swatch', modal).forEach(function (item) { item.classList.remove('is-selected'); });

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      body.classList.add('is-locked');
    }

    function close() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      body.classList.remove('is-locked');
    }

    qsa('[data-quickview]').forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        var card = btn.closest('[data-product]');
        if (card) { open(card); }
      });
    });

    qsa('[data-close-quickview]').forEach(function (btn) { btn.addEventListener('click', close); });

    modal.addEventListener('click', function (event) {
      if (event.target === modal) { close(); }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { close(); }
    });

    modal.addEventListener('billylove:added', close);
  }());

  /* ============ 7. ADD TO BAG / BUY NOW ============ */
  (function cart() {
    var countEl = qs('[data-cart-count]');
    var toast = qs('#toast');
    var toastText = qs('[data-toast-text]');
    var count = 0;
    var toastTimer = null;

    function showToast(message) {
      if (!toast) { return; }
      if (toastText) { toastText.textContent = message; }
      toast.classList.add('is-visible');
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(function () { toast.classList.remove('is-visible'); }, 2600);
    }

    // Any ancestor carrying data-product is a cart scope: product cards,
    // the featured product, product of the week, and the quick view modal.
    function contextFor(btn) {
      return btn.closest('[data-product]');
    }

    function add(btn, buyNow) {
      var scope = contextFor(btn);
      var name = (scope && scope.getAttribute('data-product')) || 'Item';
      var group = scope ? qs('.size-swatches', scope) : null;
      var selected = group ? qs('.size-swatch.is-selected', group) : null;

      if (group && !selected) {
        showToast('Please select a size first');
        return;
      }

      var qtyInput = scope ? qs('[data-qty-input]', scope) : null;
      var qty = qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;

      btn.classList.add('is-loading');

      window.setTimeout(function () {
        btn.classList.remove('is-loading');

        count += qty;
        if (countEl) { countEl.textContent = String(count); }

        var size = selected ? ' (' + selected.textContent + ')' : '';
        showToast(buyNow ? 'Heading to checkout — ' + name + size : name + size + ' added to bag');

        var modal = qs('#quickView');
        if (modal && modal.contains(btn)) { modal.dispatchEvent(new CustomEvent('billylove:added')); }
      }, 450);
    }

    qsa('[data-add-to-cart]').forEach(function (btn) {
      btn.addEventListener('click', function (event) { event.preventDefault(); add(btn, false); });
    });

    qsa('[data-buy-now]').forEach(function (btn) {
      btn.addEventListener('click', function (event) { event.preventDefault(); add(btn, true); });
    });
  }());

  /* ============ 9. NEWSLETTER ============ */
  (function newsletter() {
    var form = qs('[data-newsletter]');
    if (!form) { return; }

    var note = qs('[data-newsletter-note]');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = qs('.newsletter__input', form);
      if (!input || !input.value) { return; }

      if (note) { note.textContent = 'Thank you. Look out for a welcome email at ' + input.value + '.'; }
      form.reset();
    });
  }());


  /* ============ 11. BEST SELLERS TABS ============ */
  (function bestsellerTabs() {
    var tabs = qsa('.tabs .tab');
    if (!tabs.length) { return; }

    var cta = qs('[data-tab-cta]');

    function panelFor(tab) { return document.getElementById(tab.getAttribute('aria-controls')); }

    function activate(tab, focus) {
      tabs.forEach(function (item) {
        var isTarget = item === tab;
        var panel = panelFor(item);

        item.classList.toggle('is-active', isTarget);
        item.setAttribute('aria-selected', isTarget ? 'true' : 'false');
        item.setAttribute('tabindex', isTarget ? '0' : '-1');

        if (!panel) { return; }

        if (isTarget) {
          panel.hidden = false;
          panel.classList.remove('is-leaving');
          // Next frame, so the opacity transition has a starting point to run from.
          window.requestAnimationFrame(function () { panel.classList.add('is-active'); });
        } else if (!panel.hidden) {
          // Pull it out of the flow first so the incoming panel can take its
          // place immediately and the section height never changes.
          panel.classList.add('is-leaving');
          panel.classList.remove('is-active');

          window.setTimeout(function () {
            if (!item.classList.contains('is-active')) {
              panel.hidden = true;
              panel.classList.remove('is-leaving');
            }
          }, 350);
        }
      });

      if (cta) {
        cta.textContent = tab.getAttribute('data-cta-label') || cta.textContent;
        cta.setAttribute('href', tab.getAttribute('data-cta-href') || '#');
      }

      if (focus) { tab.focus(); }
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () { activate(tab, false); });

      tab.addEventListener('keydown', function (event) {
        var next = null;

        if (event.key === 'ArrowRight') { next = tabs[(index + 1) % tabs.length]; }
        else if (event.key === 'ArrowLeft') { next = tabs[(index - 1 + tabs.length) % tabs.length]; }
        else if (event.key === 'Home') { next = tabs[0]; }
        else if (event.key === 'End') { next = tabs[tabs.length - 1]; }

        if (next) { event.preventDefault(); activate(next, true); }
      });
    });

    // Header and footer links to #shop-women / #shop-men open the matching tab.
    qsa('a[href="#shop-women"], a[href="#shop-men"]').forEach(function (link) {
      link.addEventListener('click', function () {
        var target = document.getElementById(link.getAttribute('href').slice(1));
        if (target && target.classList.contains('tab')) { activate(target, false); }
      });
    });
  }());

  /* ============ 12. BEST SELLERS CAROUSEL ============ */
  (function bestsellerCarousel() {
    qsa('[data-carousel]').forEach(function (carousel) {
      var track = qs('[data-carousel-track]', carousel);
      var prev = qs('[data-carousel-prev]', carousel);
      var next = qs('[data-carousel-next]', carousel);
      if (!track) { return; }

      function step() {
        var card = track.firstElementChild;
        if (!card) { return 320; }
        var gap = parseInt(window.getComputedStyle(track).columnGap, 10) || 0;
        return card.getBoundingClientRect().width + gap;
      }

      function syncButtons() {
        var max = track.scrollWidth - track.clientWidth;
        var atStart = track.scrollLeft <= 1;
        var atEnd = track.scrollLeft >= max - 1;

        if (prev) { prev.classList.toggle('is-visible', !atStart); }
        if (next) { next.classList.toggle('is-hidden', atEnd || max <= 0); }
      }

      function scrollBy(direction) {
        track.scrollBy({ left: step() * direction, behavior: 'smooth' });
      }

      if (prev) { prev.addEventListener('click', function () { scrollBy(-1); }); }
      if (next) { next.addEventListener('click', function () { scrollBy(1); }); }

      track.addEventListener('scroll', syncButtons, { passive: true });
      window.addEventListener('resize', syncButtons);

      track.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowRight') { event.preventDefault(); scrollBy(1); }
        else if (event.key === 'ArrowLeft') { event.preventDefault(); scrollBy(-1); }
      });

      syncButtons();
    });
  }());


  /* ============ 13. SCROLL REVEAL ============ */
  (function scrollReveal() {
    var targets = qsa('[data-reveal]');
    if (!targets.length) { return; }

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // No observer support, or motion is not wanted: show everything up front.
    if (reduced || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.2 });

    targets.forEach(function (el) { observer.observe(el); });
  }());



  /* ============ 14. TESTIMONIAL SLIDER ============ */
  (function testimonialSlider() {
    var track = qs('[data-testimonials]');
    if (!track) { return; }

    var slides = qsa('[data-testimonial]', track);
    var dots = qsa('[data-testimonial-dot]');
    if (slides.length < 2) { return; }

    var index = 0;
    var timer = null;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function show(next) {
      index = (next + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        var on = i === index;
        slide.classList.toggle('is-active', on);
        if (on) { slide.removeAttribute('aria-hidden'); }
        else { slide.setAttribute('aria-hidden', 'true'); }
      });

      dots.forEach(function (dot, i) {
        var on = i === index;
        dot.classList.toggle('is-active', on);
        if (on) { dot.setAttribute('aria-current', 'true'); }
        else { dot.removeAttribute('aria-current'); }
      });
    }

    function play() {
      if (reduced) { return; }
      timer = window.setInterval(function () { show(index + 1); }, 6000);
    }

    function stop() { window.clearInterval(timer); }
    function restart() { stop(); play(); }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { show(i); restart(); });
    });

    // Pause while someone is reading or tabbing through.
    track.addEventListener('mouseenter', stop);
    track.addEventListener('mouseleave', play);
    track.addEventListener('focusin', stop);
    track.addEventListener('focusout', play);

    play();
  }());

  /* ============ 10. MARQUEE DUPLICATION GUARD ============ */
  (function marquee() {
    var track = qs('.marquee__track');
    if (!track) { return; }

    // The markup ships two identical halves so the -50% scroll loops seamlessly.
    // If the viewport is wider than the content, duplicate once more.
    if (track.scrollWidth < window.innerWidth * 2) {
      track.innerHTML += track.innerHTML;
    }
  }());
}());
