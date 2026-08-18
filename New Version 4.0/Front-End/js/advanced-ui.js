/* ============================================================
   NEXUS ADVANCED UI MOTION LAYER
   - boot/loading experience
   - top scroll progress
   - same-site page transition
   - GSAP + ScrollTrigger motion flow
   - responsive/reduced-motion safeguards
   - premium card spotlight interactions
   ============================================================ */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initLoader();
    initScrollProgress();
    initPageTransitions();
    initNavbarState();
    initSurfaceSpotlight();
    initDecorativeVideo();
    initGsapMotion();
    initResourceMotion();
    initJoinMotion();
  });

  function initLoader() {
    var loader = document.getElementById('siteLoader');
    if (!loader) return;
    var done = false;
    var start = performance.now();
    loader.classList.add('is-assembling');

    function finish() {
      if (done) return;
      done = true;
      var elapsed = performance.now() - start;
      setTimeout(function () {
        loader.classList.add('is-done');
        document.body.classList.add('is-ready');
      }, Math.max(140, 1250 - elapsed));
    }
    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });
    setTimeout(finish, 3200);
  }

  function initScrollProgress() {
    var bar = document.getElementById('scrollProgressBar');
    if (!bar) return;
    var ticking = false;
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var progress = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, progress)) + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  function initNavbarState() {
    var nav = document.querySelector('.navbar');
    if (!nav) return;
    function refresh() { nav.classList.toggle('is-scrolled', window.scrollY > 24); }
    window.addEventListener('scroll', refresh, { passive: true });
    refresh();
  }

  function initPageTransitions() {
    var overlay = document.getElementById('pageTransition');
    if (!overlay) return;
    window.addEventListener('pageshow', function () { overlay.classList.remove('is-active'); });

    document.addEventListener('click', function (event) {
      var a = event.target.closest('a[href]');
      if (!a || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      var url;
      try { url = new URL(a.href, window.location.href); } catch (e) { return; }
      if (url.origin !== window.location.origin || url.protocol === 'mailto:' || url.protocol === 'tel:') return;
      if (url.href === window.location.href || (url.pathname === window.location.pathname && url.hash)) return;
      event.preventDefault();
      overlay.classList.add('is-active');
      setTimeout(function () { window.location.href = url.href; }, 240);
    });
  }

  function initSurfaceSpotlight() {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !window.matchMedia('(pointer:fine)').matches) return;
    document.querySelectorAll('.card, .learning-resource, .video-shell').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    });
  }

  function initDecorativeVideo() {
    var video = document.querySelector('.showcase-video');
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause();
      video.removeAttribute('autoplay');
    }
  }

  function initGsapMotion() {
    if (!window.gsap || !window.ScrollTrigger) {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    var mm = gsap.matchMedia();

    mm.add({
      desktop: '(min-width: 800px)',
      mobile: '(max-width: 799px)',
      reduceMotion: '(prefers-reduced-motion: reduce)'
    }, function (context) {
      var c = context.conditions;
      if (c.reduceMotion) {
        gsap.set('.reveal', { opacity: 1, y: 0, clearProps: 'transform' });
        return;
      }

      // Hero / inner-page opening sequence.
      if (document.querySelector('.hero')) {
        var hero = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.08 });
        hero.from('.hero .badge-pill', { y: 16, opacity: 0, duration: 0.5 })
            .from('.hero h1', { y: 42, opacity: 0, duration: 0.9 }, '-=.22')
            .from('.hero > .wrap > p', { y: 20, opacity: 0, duration: 0.65 }, '-=.55')
            .from('.hero .btn', { y: 14, opacity: 0, duration: 0.45, stagger: 0.08 }, '-=.35')
            .from('.hero .terminal', { y: 24, opacity: 0, scale: 0.985, duration: 0.7 }, '-=.22');
      } else if (document.querySelector('.pagehead')) {
        gsap.from('.pagehead .breadcrumb, .pagehead .badge-pill, .pagehead h1, .pagehead p', {
          y: 22, opacity: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out'
        });
      }

      // Batched reveal creates a connected scroll rhythm across the whole site.
      gsap.set('.reveal', { opacity: 0, y: c.mobile ? 20 : 34 });
      ScrollTrigger.batch('.reveal', {
        start: 'top 88%',
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.72,
            stagger: 0.09,
            ease: 'power3.out',
            overwrite: true
          });
        }
      });

      // Gentle section-heading drift gives the page a premium editorial flow.
      document.querySelectorAll('.section-head').forEach(function (head) {
        gsap.from(head, {
          x: c.desktop ? -24 : 0,
          opacity: 0,
          duration: 0.7,
          scrollTrigger: { trigger: head, start: 'top 88%', once: true }
        });
      });

      if (c.desktop) {
        var terminal = document.querySelector('.hero .terminal');
        if (terminal) {
          gsap.to(terminal, {
            y: -24,
            ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 }
          });
        }
        var videoShell = document.querySelector('[data-video-shell]');
        if (videoShell) {
          gsap.to(videoShell, {
            y: -36,
            ease: 'none',
            scrollTrigger: { trigger: '.showcase-reel', start: 'top bottom', end: 'bottom top', scrub: 1 }
          });
        }
      }
    });
  }

  function initResourceMotion() {
    var card = document.querySelector('.resource-flow-card');
    if (!card || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.gsap) {
      gsap.to('.resource-flow-node', { y:-8, duration:1.7, stagger:{each:.18, repeat:-1, yoyo:true}, ease:'sine.inOut' });
      gsap.to('.resource-flow-core', { scale:1.055, boxShadow:'0 0 64px rgba(88,166,255,.34)', duration:2.2, repeat:-1, yoyo:true, ease:'sine.inOut' });
      gsap.from('.resource-summary-grid > div', { opacity:0, y:18, duration:.55, stagger:.10, ease:'power3.out', scrollTrigger:{trigger:'.resource-summary-grid',start:'top 88%',once:true} });
    }
  }

  function initJoinMotion() {
    if (!document.body.hasAttribute('data-join-page') || !window.gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.from('.join-logo-core b', { opacity:0, scale:.55, y:18, duration:.65, stagger:.12, ease:'back.out(1.8)', delay:.25 });
    gsap.from('.join-head-copy h1', { opacity:0, x:32, duration:.78, ease:'power3.out', delay:.18 });
    gsap.from('.join-hero-points span', { opacity:0, y:12, duration:.5, stagger:.09, ease:'power2.out', delay:.45 });
    gsap.to('.join-visual-panel', { y:-10, duration:3.4, repeat:-1, yoyo:true, ease:'sine.inOut' });
  }

})();
