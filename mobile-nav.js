/* AI consultant — mobile navigation + PWA registration
   Works with the shared header markup (.nav > .brand + .navlinks) and the
   standalone result_ai.html header (header > .navlinks). Pure progressive
   enhancement: if JS is off, desktop links still render. */
(function () {
  function initNav() {
    var navlinks = document.querySelector('header .navlinks');
    if (!navlinks || navlinks.dataset.mobileReady) return;
    navlinks.dataset.mobileReady = '1';

    // Build hamburger toggle
    var toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-label', '開啟選單');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span></span><span></span><span></span>';

    // Place it in the same flex row as the links so it sits top-right on mobile
    navlinks.parentNode.insertBefore(toggle, navlinks);

    function setOpen(open) {
      navlinks.classList.toggle('open', open);
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
    }

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(!navlinks.classList.contains('open'));
    });

    // Close when a link is tapped
    navlinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    // Close on outside click / Escape
    document.addEventListener('click', function (e) {
      if (!navlinks.classList.contains('open')) return;
      if (!navlinks.contains(e.target) && e.target !== toggle) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });

    // Reset when resizing back to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) setOpen(false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }

  // Register the service worker (installable + offline).
  // Resolve sw.js relative to THIS script so it works from subdirectories too.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      var me = document.querySelector('script[src$="mobile-nav.js"]');
      var swUrl = me ? new URL('sw.js', me.src).href : 'sw.js';
      navigator.serviceWorker.register(swUrl).catch(function () {/* no-op */});
    });
  }
})();
