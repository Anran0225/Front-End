/* AI AWS Club — shared site behaviour */
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.navToggle'), links = document.querySelector('.navlinks');
  if (toggle && links) toggle.addEventListener('click', function () { links.classList.toggle('open'); });
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navlinks a').forEach(function (a) { if (a.getAttribute('href') === here) a.classList.add('active'); });
  initModeSwitch(); initCanvas();
  if (!(window.gsap && window.ScrollTrigger)) initReveal();
  initTerminal(); initStorageDemo(); initSocialShare(); initStatCounters();
  initCookieNotice(); initFooterSocials(); initSocialMediaHub();
});
/* ---------- Dark / Light mode toggle (single button, persisted in localStorage) ---------- */
function initModeSwitch() {
  var saved = localStorage.getItem('nexus_mode') || 'dark';
  applyMode(saved);

  document.querySelectorAll('.theme-toggle').forEach(function (btn) {
    refreshButton(btn);
    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') || 'dark';
      var next = current === 'dark' ? 'light' : 'dark';
      applyMode(next);
      document.querySelectorAll('.theme-toggle').forEach(refreshButton);
    });
  });

  function applyMode(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('nexus_mode', mode);
    var themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', mode === 'light' ? '#ffffff' : '#0d1117');
  }

  function refreshButton(btn) {
    var mode = document.documentElement.getAttribute('data-theme') || 'dark';
    var goingTo = mode === 'dark' ? 'light' : 'dark';
    var icon = btn.querySelector('.theme-toggle-icon');
    if (icon) icon.textContent = mode === 'dark' ? '☀' : '☾';
    btn.setAttribute('aria-label', 'Switch to ' + goingTo + ' mode');
    btn.setAttribute('title', 'Switch to ' + goingTo + ' mode');
    btn.setAttribute('aria-pressed', mode === 'light' ? 'true' : 'false');
  }
}

/* ---------- Constellation / neural-net background ---------- */
function initCanvas() {
  var canvas = document.getElementById('netCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var w, h, nodes = [];
  var NODE_COUNT = window.innerWidth < 700 ? 32 : 60;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (var i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25
    });
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function colors() {
    var light = document.documentElement.getAttribute('data-theme') === 'light';
    return light
      ? { node: 'rgba(12,140,121,0.55)', line: 'rgba(109,60,232,' }
      : { node: 'rgba(63,232,200,0.8)', line: 'rgba(139,92,246,' };
  }

  function tick() {
    var c = colors();
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (!reduceMotion) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = c.node;
      ctx.fill();
    }
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var a = nodes[i], b = nodes[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = c.line + ((1 - dist / 140) * 0.35) + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    if (!reduceMotion) requestAnimationFrame(tick);
  }
  tick();
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach(function (e) { e.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.15 });
  els.forEach(function (e) { io.observe(e); });
}

/* ---------- Stat counters (count up on scroll into view) ---------- */
function initStatCounters() {
  var block = document.getElementById('statsBlock');
  if (!block) return;

  var counted = false;

  function runCount() {
    if (counted) return;
    counted = true;
    block.querySelectorAll('.stat-number').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-target'), 10) || 0;
      var duration = 1500;
      var start = performance.now();

      function tick(now) {
        var progress = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  if (!('IntersectionObserver' in window)) { runCount(); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { runCount(); io.unobserve(en.target); }
    });
  }, { threshold: 0.4 });
  io.observe(block);
}

/* ---------- Terminal boot-sequence typing effect ---------- */
function initTerminal() {
  var body = document.querySelector('.terminal .tbody');
  if (!body) return;
  var lines = JSON.parse(body.getAttribute('data-lines') || '[]');
  if (!lines.length) return;
  body.innerHTML = '';
  var li = 0, ci = 0;
  var current = document.createElement('div');
  body.appendChild(current);

  function step() {
    if (li >= lines.length) {
      current.innerHTML += ' <span class="cursor"></span>';
      return;
    }
    var line = lines[li];
    if (ci <= line.text.length) {
      current.innerHTML = (line.prefix ? '<span class="l">' + line.prefix + '</span>' : '') + line.text.slice(0, ci);
      ci++;
      setTimeout(step, line.speed || 18);
    } else {
      li++; ci = 0;
      current = document.createElement('div');
      body.appendChild(current);
      setTimeout(step, 220);
    }
  }
  step();
}

/* ============================================================
   STORAGE TECHNOLOGY DEMO
   - Cookies:        visit counter + "last visited page" (30-day expiry)
   - localStorage:   persistent theme preference + saved/favorited projects
   - sessionStorage: pages viewed this browser session + form draft
   ============================================================ */

/* --- cookie helpers --- */
function setCookie(name, value, days) {
  var expires = '';
  if (days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + d.toUTCString();
  }
  document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax';
}
function getCookie(name) {
  var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function initStorageDemo() {
  var pageName = document.title.split('|')[0].trim();

  /* ---- COOKIE: visit counter (persists 30 days) ---- */
  var visits = parseInt(getCookie('nexus_visits') || '0', 10) + 1;
  setCookie('nexus_visits', visits, 30);
  setCookie('nexus_last_page', pageName, 30);

  /* ---- SESSION STORAGE: pages viewed this tab session ---- */
  var seen = JSON.parse(sessionStorage.getItem('nexus_session_pages') || '[]');
  if (seen.indexOf(pageName) === -1) seen.push(pageName);
  sessionStorage.setItem('nexus_session_pages', JSON.stringify(seen));
  sessionStorage.setItem('nexus_session_start', sessionStorage.getItem('nexus_session_start') || new Date().toLocaleTimeString());

  /* ---- LOCAL STORAGE: dark/light preference (persists across sessions) ---- */
  var theme = localStorage.getItem('nexus_mode') || 'dark';

  /* ---- Render HUD status panel if present on page ---- */
  var panel = document.getElementById('storageStatus');
  if (panel) {
    panel.innerHTML =
      row('COOKIE · visit_count', visits + ' visits') +
      row('COOKIE · last_page', getCookie('nexus_last_page')) +
      row('COOKIE · consent', (getCookie('ai_aws_cookie_consent_v2') || localStorage.getItem('ai_aws_cookie_consent_v2') || 'not chosen').toUpperCase()) +
      row('SESSION · pages_this_tab', seen.join(', ')) +
      row('SESSION · started_at', sessionStorage.getItem('nexus_session_start')) +
      row('LOCAL · display_mode', theme.toUpperCase());
  }
  function row(k, v) {
    return '<div class="row"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>';
  }


  /* ---- Favorite / save project buttons (localStorage array) ---- */
  document.querySelectorAll('[data-fav]').forEach(function (btn) {
    var id = btn.getAttribute('data-fav');
    var favs = JSON.parse(localStorage.getItem('nexus_favorites') || '[]');
    if (favs.indexOf(id) > -1) { btn.classList.add('on'); btn.textContent = '★ SAVED'; }
    btn.addEventListener('click', function () {
      favs = JSON.parse(localStorage.getItem('nexus_favorites') || '[]');
      if (favs.indexOf(id) > -1) {
        favs = favs.filter(function (f) { return f !== id; });
        btn.classList.remove('on'); btn.textContent = '☆ SAVE PROJECT';
      } else {
        favs.push(id);
        btn.classList.add('on'); btn.textContent = '★ SAVED';
      }
      localStorage.setItem('nexus_favorites', JSON.stringify(favs));
    });
  });

}

/* ============================================================
   REST API CALL (jQuery) — GitHub API: trending AI/ML repositories
   Demonstrates: $.getJSON / $.ajax calling a public RESTful API
   ============================================================ */
function initSocialShare() {
  document.querySelectorAll('.share-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var network = btn.getAttribute('data-network');
      var url = encodeURIComponent(window.location.href);
      var text = encodeURIComponent(document.title);
      var shareUrls = {
        twitter: 'https://twitter.com/intent/tweet?url=' + url + '&text=' + text,
        linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + url,
        whatsapp: 'https://wa.me/?text=' + text + '%20' + url,
        facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + url
      };
      if (shareUrls[network]) window.open(shareUrls[network], '_blank', 'noopener,width=600,height=500');
    });
  });
}

/* ============================================================
   PERSONALISED LEARNING ROADMAP
   Fixed stage -> fixed repositories -> live GitHub repository data.
   ============================================================ */
/* ---------- Cookie preferences (site-wide, once-per-visit prompt + persistent decision) ---------- */
function initCookieNotice() {
  var notice = document.getElementById('cookieNotice');
  var consentKey = 'ai_aws_cookie_consent_v2';
  var promptedKey = 'ai_aws_cookie_prompted_v2';

  if (!notice) {
    notice = document.createElement('aside');
    notice.id = 'cookieNotice';
    notice.className = 'cookie-notice';
    notice.setAttribute('role', 'dialog');
    notice.setAttribute('aria-modal', 'true');
    notice.setAttribute('aria-labelledby', 'cookieTitle');
    notice.innerHTML =
      '<div class="cookie-card">' +
      '<button class="cookie-close" id="closeCookie" type="button" aria-label="Close cookie preferences">×</button>' +
      '<div class="cookie-kicker">PRIVACY // PREFERENCES</div>' +
      '<h2 id="cookieTitle">Cookies on this site</h2>' +
      '<p>We use a small consent cookie and browser storage to make this AI Club website easier to use.</p>' +
      '<ul class="cookie-list">' +
      '<li><strong>Remember your settings</strong> — theme, saved learning resources and project favourites.</li>' +
      '<li><strong>Keep session progress</strong> — pages viewed and unfinished form content during this browser session.</li>' +
      '<li><strong>Support interactive features</strong> — GitHub API resources and social sharing controls.</li>' +
      '<li><strong>Load optional social plugins</strong> — X, Facebook and Discord embeds are loaded only after you accept.</li>' +
      '</ul>' +
      '<p class="cookie-note">No advertising cookies are used in this coursework demo. Your choice is shared across all pages on this site.</p>' +
      '<div class="cookie-actions">' +
      '<button id="acceptCookie" class="btn" type="button">Accept</button>' +
      '<button id="rejectCookie" class="btn ghost" type="button">Decline &amp; clear</button>' +
      '</div>' +
      '</div>';
    document.body.appendChild(notice);
  }

  function openPreferences(markPrompted) {
    notice.classList.add('show');
    document.body.classList.add('cookie-open');
    if (markPrompted !== false) {
      try { sessionStorage.setItem(promptedKey, '1'); } catch (e) { }
    }
    var acceptBtn = notice.querySelector('#acceptCookie');
    if (acceptBtn) setTimeout(function () { acceptBtn.focus(); }, 50);
  }

  function closePreferences() {
    notice.classList.remove('show');
    document.body.classList.remove('cookie-open');
  }

  document.querySelectorAll('footer .wrap').forEach(function (footerWrap) {
    if (footerWrap.querySelector('.cookie-preferences-link')) return;
    var bar = document.createElement('div');
    bar.className = 'footer-preferences';
    bar.innerHTML = '<button class="cookie-preferences-link" type="button">Cookie Preferences</button>';
    footerWrap.appendChild(bar);
  });

  document.querySelectorAll('.cookie-preferences-link').forEach(function (button) {
    button.addEventListener('click', function () { openPreferences(false); });
  });

  var accept = notice.querySelector('#acceptCookie');
  var reject = notice.querySelector('#rejectCookie');
  var close = notice.querySelector('#closeCookie');

  if (accept) accept.addEventListener('click', function () {
    setCookie(consentKey, 'accepted', 180);
    try {
      localStorage.setItem(consentKey, 'accepted');
      sessionStorage.setItem(promptedKey, '1');
    } catch (e) { }
    closePreferences();
    document.dispatchEvent(new CustomEvent('aiAwsConsentChanged', { detail: { status: 'accepted' } }));
  });

  if (reject) reject.addEventListener('click', function () {
    setCookie(consentKey, 'declined', 30);
    try {
      localStorage.setItem(consentKey, 'declined');
      sessionStorage.setItem(promptedKey, '1');
    } catch (e) { }
    ['nexus_favorites', 'nexus_saved_resources', 'nexus_learning_stage', 'nexus_learning_completed'].forEach(function (key) {
      localStorage.removeItem(key);
    });
    ['join_draft_name', 'join_draft_email', 'join_draft_aiExperience', 'join_draft_interest', 'join_draft_bio'].forEach(function (key) {
      sessionStorage.removeItem(key);
    });
    closePreferences();
    document.dispatchEvent(new CustomEvent('aiAwsConsentChanged', { detail: { status: 'declined' } }));
  });

  if (close) close.addEventListener('click', closePreferences);
  notice.addEventListener('click', function (event) { if (event.target === notice) closePreferences(); });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && notice.classList.contains('show')) closePreferences();
  });

  var consent = getCookie(consentKey);
  try { consent = localStorage.getItem(consentKey) || consent; } catch (e) { }
  var prompted = false;
  try { prompted = sessionStorage.getItem(promptedKey) === '1'; } catch (e) { }

  // Do not mark the prompt as shown until it actually opens.
  // This fixes the fast-navigation bug where a visitor changed pages before the timer fired.
  if (!consent && !prompted) {
    setTimeout(function () {
      var latestConsent = getCookie(consentKey);
      try { latestConsent = localStorage.getItem(consentKey) || latestConsent; } catch (e) { }
      if (!latestConsent) openPreferences(true);
    }, 650);
  }
}


/* ============================================================
   SITE-WIDE FOOTER SOCIAL LINKS
   Moved out of the homepage hero so social controls appear only
   at the end of each page.
   ============================================================ */
function initFooterSocials() {
  document.querySelectorAll('footer .wrap').forEach(function (wrap) {
    if (wrap.querySelector('.footer-socials')) return;
    var socials = document.createElement('div');
    socials.className = 'footer-socials';
    socials.innerHTML =
      '<div class="footer-social-copy"><span class="eyebrow">Connect // Share</span><strong>Follow the build beyond this page.</strong></div>' +
      '<div class="footer-social-links">' +
      '<a class="social-link" href="https://x.com/socaisociety" target="_blank" rel="noopener" aria-label="NUS SoC AI Society on X"><i class="bi bi-twitter-x"></i><span>X</span></a>' +
      '<a class="social-link" href="https://www.facebook.com/AISoc.ucl/" target="_blank" rel="noopener" aria-label="UCL AI Society on Facebook"><i class="bi bi-facebook"></i><span>Facebook</span></a>' +
      '<a class="social-link" href="https://discord.com/invite/yazkAEsjww" target="_blank" rel="noopener" aria-label="NUS SoC AI Society Discord"><i class="bi bi-discord"></i><span>Discord</span></a>' +
      '<a class="social-link" href="https://www.instagram.com/uclaisociety/" target="_blank" rel="noopener" aria-label="UCL AI Society on Instagram"><i class="bi bi-instagram"></i><span>Instagram</span></a>' +
      '<a class="social-link" href="https://github.com/NUSAISoc" target="_blank" rel="noopener" aria-label="NUS SoC AI Society on GitHub"><i class="bi bi-github"></i><span>GitHub</span></a>' +
      '</div>';
    var bottom = wrap.querySelector('.foot-bottom');
    if (bottom) wrap.insertBefore(socials, bottom); else wrap.appendChild(socials);
  });
  // initSocialShare ran before these dynamically-created buttons existed.
  initSocialShare();
}


/* ============================================================
   V16 — SOCIAL MEDIA PLUGIN HUB
   Official X Follow widget + Facebook Page Plugin are consent-gated.
   Discord uses its public server widget JSON when available.
   Instagram is a direct AI-community profile link.
   GitHub repository stats are loaded with jQuery $.ajax().
   ============================================================ */
function initSocialMediaHub() {
  var hub = document.getElementById('socialPluginHub');
  if (!hub) return;

  var consentKey = 'ai_aws_cookie_consent_v2';
  var xBox = document.getElementById('xPluginMount');
  var fbBox = document.getElementById('facebookPluginMount');
  var discordBox = document.getElementById('discordPluginMount');
  var githubBox = document.getElementById('githubPluginMount');
  var consentCopy = document.getElementById('socialConsentState');

  function readConsent() {
    var state = '';
    try { state = localStorage.getItem(consentKey) || ''; } catch (e) { }
    if (!state && typeof getCookie === 'function') state = getCookie(consentKey) || '';
    return state;
  }

  function lockedMarkup(label) {
    return '<div class="social-plugin-locked"><i class="bi bi-shield-lock"></i><span>' + label + '</span><button type="button" class="social-open-cookie">Enable in Cookie Preferences</button></div>';
  }

  function wireCookieButtons() {
    hub.querySelectorAll('.social-open-cookie').forEach(function (button) {
      button.addEventListener('click', function () {
        var cookieButton = document.querySelector('.cookie-preferences-link');
        if (cookieButton) cookieButton.click();
      });
    });
  }

  function loadX() {
    if (!xBox || xBox.dataset.loaded === '1') return;
    xBox.dataset.loaded = '1';
    xBox.innerHTML = '<a class="twitter-follow-button" href="https://twitter.com/socaisociety" data-size="large" data-show-count="true">Follow @socaisociety</a>';
    if (!document.getElementById('twitter-wjs')) {
      var script = document.createElement('script');
      script.id = 'twitter-wjs';
      script.async = true;
      script.src = 'https://platform.twitter.com/widgets.js';
      document.body.appendChild(script);
    } else if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load(xBox);
    }
  }

  function loadFacebook() {
    if (!fbBox || fbBox.dataset.loaded === '1') return;
    fbBox.dataset.loaded = '1';
    var page = 'https://www.facebook.com/AISoc.ucl/';
    var src = 'https://www.facebook.com/plugins/page.php?href=' + encodeURIComponent(page) + '&tabs=&width=300&height=88&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false';
    fbBox.innerHTML = '<iframe title="UCL AI Society Facebook Page Plugin" src="' + src + '" width="300" height="88" style="border:0;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>';
  }

  function loadDiscord() {
    if (!discordBox || discordBox.dataset.loaded === '1') return;
    discordBox.dataset.loaded = '1';
    discordBox.innerHTML = '<div class="social-live-summary"><i class="bi bi-discord"></i><div><strong>NUS SoC AI Society</strong><span>Student AI community workspace</span></div><a href="https://discord.com/invite/yazkAEsjww" target="_blank" rel="noopener">Join ↗</a></div>';
  }

  function loadGithub() {
    if (!githubBox || githubBox.dataset.loaded === '1') return;
    githubBox.dataset.loaded = '1';
    var fallback = '<div class="social-live-summary"><i class="bi bi-github"></i><div><strong>NUS SoC AI Society</strong><span>University AI Society on GitHub</span></div><a href="https://github.com/NUSAISoc" target="_blank" rel="noopener">Open ↗</a></div>';
    if (typeof window.jQuery === 'undefined') { githubBox.innerHTML = fallback; return; }
    $.ajax({
      url: 'https://api.github.com/orgs/NUSAISoc',
      method: 'GET', dataType: 'json', timeout: 8000
    }).done(function (org) {
      githubBox.innerHTML = '<div class="social-live-summary"><i class="bi bi-github"></i><div><strong>' + escapeHtml(org.name || org.login || 'NUS SoC AI Society') + '</strong><span>' + Number(org.public_repos || 0).toLocaleString() + ' public repos · ' + Number(org.followers || 0).toLocaleString() + ' followers</span></div><a href="' + escapeHtml(org.html_url || 'https://github.com/NUSAISoc') + '" target="_blank" rel="noopener">GitHub ↗</a></div>';
    }).fail(function () { githubBox.innerHTML = fallback; });
  }

  function render() {
    var state = readConsent();
    loadGithub();
    loadDiscord();
    if (state === 'accepted') {
      if (consentCopy) consentCopy.innerHTML = '<i class="bi bi-check-circle-fill"></i> Social plugins enabled by your cookie preference.';
      loadX(); loadFacebook();
    } else {
      if (consentCopy) consentCopy.innerHTML = '<i class="bi bi-shield-lock"></i> X and Facebook AI-society plugins load only after cookie consent.';
      if (xBox) { xBox.dataset.loaded = '0'; xBox.innerHTML = lockedMarkup('NUS AI Society X widget is off'); }
      if (fbBox) { fbBox.dataset.loaded = '0'; fbBox.innerHTML = lockedMarkup('UCL AI Society Facebook plugin is off'); }
      wireCookieButtons();
    }
  }

  document.addEventListener('aiAwsConsentChanged', render);
  render();
}

function escapeHtml(value) { return String(value == null ? '' : value).replace(/[&<>'"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]; }); }
