/* ============================================================
   AWS — main.js
   Covers: nav toggle, constellation canvas, terminal typing FX,
   scroll-reveal, COOKIES / LOCAL STORAGE / SESSION STORAGE demo,
   jQuery REST API call (GitHub API), social share plugin buttons.
   ============================================================ */

/* ---------- Nav toggle (mobile) ---------- */
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.navToggle');
  var links = document.querySelector('.navlinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  // mark active nav link
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navlinks a').forEach(function (a) {
    if (a.getAttribute('href') === here) a.classList.add('active');
  });

  initModeSwitch();
  initCanvas();
  initReveal();
  initTerminal();
  initStorageDemo();
  initSocialShare();
  initStatCounters();
});

/* ---------- Dark / Light mode toggle (persisted in localStorage) ---------- */
function initModeSwitch() {
  var saved = localStorage.getItem('nexus_mode') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);

  document.querySelectorAll('.mode-switch').forEach(function (sw) {
    var dark = sw.querySelector('[data-mode="dark"]');
    var light = sw.querySelector('[data-mode="light"]');
    function refresh() {
      var mode = document.documentElement.getAttribute('data-theme') || 'dark';
      if (dark) dark.classList.toggle('active', mode === 'dark');
      if (light) light.classList.toggle('active', mode === 'light');
    }
    refresh();
    if (dark) dark.addEventListener('click', function () { setMode('dark'); refresh(); });
    if (light) light.addEventListener('click', function () { setMode('light'); refresh(); });
  });

  function setMode(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('nexus_mode', mode);
    document.querySelectorAll('.mode-switch').forEach(function (sw) {
      var d = sw.querySelector('[data-mode="dark"]');
      var l = sw.querySelector('[data-mode="light"]');
      if (d) d.classList.toggle('active', mode === 'dark');
      if (l) l.classList.toggle('active', mode === 'light');
    });
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
    if (ci <= line.length) {
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

  /* ---- LOCAL STORAGE: theme preference (persists across sessions) ---- */
  var theme = localStorage.getItem('nexus_theme') || 'cyan';
  document.documentElement.style.setProperty('--cyan', theme === 'violet' ? '#B69CFF' : '#3FE8C8');

  /* ---- Render HUD status panel if present on page ---- */
  var panel = document.getElementById('storageStatus');
  if (panel) {
    panel.innerHTML =
      row('COOKIE · visit_count', visits + ' visits') +
      row('COOKIE · last_page', getCookie('nexus_last_page')) +
      row('SESSION · pages_this_tab', seen.join(', ')) +
      row('SESSION · started_at', sessionStorage.getItem('nexus_session_start')) +
      row('LOCAL · theme_pref', theme.toUpperCase());
  }
  function row(k, v) {
    return '<div class="row"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>';
  }

  /* ---- Theme toggle buttons (writes to localStorage) ---- */
  document.querySelectorAll('[data-theme-btn]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var t = btn.getAttribute('data-theme-btn');
      localStorage.setItem('nexus_theme', t);
      document.documentElement.style.setProperty('--cyan', t === 'violet' ? '#B69CFF' : '#3FE8C8');
    });
  });

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

  /* ---- Contact form draft auto-saved to sessionStorage ---- */
  var form = document.getElementById('contactForm');
  if (form) {
    ['name', 'email', 'message'].forEach(function (f) {
      var el = form.elements[f];
      if (!el) return;
      var saved = sessionStorage.getItem('draft_' + f);
      if (saved) el.value = saved;
      el.addEventListener('input', function () {
        sessionStorage.setItem('draft_' + f, el.value);
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      ['name', 'email', 'message'].forEach(function (f) { sessionStorage.removeItem('draft_' + f); });
      var status = document.getElementById('formStatus');
      if (status) status.textContent = '> TRANSMISSION RECEIVED — a crew member will respond within 48h.';
      form.reset();
    });
  }
}

/* ============================================================
   REST API CALL (jQuery) — GitHub API: trending AI/ML repositories
   Demonstrates: $.getJSON / $.ajax calling a public RESTful API
   ============================================================ */
function loadTrendingAIRepos() {
  var $list = $('#repoList');
  if (!$list.length) return;
  $list.html('<div class="mono" style="color:var(--dim)">> querying api.github.com/search/repositories ...</div>');

  $.ajax({
    url: 'https://api.github.com/search/repositories',
    data: { q: 'topic:artificial-intelligence', sort: 'stars', order: 'desc', per_page: 6 },
    dataType: 'json',
    timeout: 8000
  }).done(function (data) {
    $list.empty();
    if (!data.items || !data.items.length) {
      $list.html('<p>No results returned by the API.</p>');
      return;
    }
    $.each(data.items, function (i, repo) {
      var $card = $('<div class="card reveal in"></div>');
      $card.append('<span class="tag">★ ' + repo.stargazers_count.toLocaleString() + ' stars</span>');
      $card.append('<h3></h3>').find('h3').text(repo.full_name);
      $card.append('<p></p>').find('p').text(repo.description ? repo.description.slice(0, 110) : 'No description provided.');
      $card.append('<div class="meta"><span>' + (repo.language || 'N/A') + '</span><a href="' + repo.html_url + '" target="_blank" rel="noopener">VIEW REPO →</a></div>');
      $list.append($card);
    });
  }).fail(function () {
    $list.html('<p>&gt; API request failed or rate-limited. Please try again shortly.</p>');
  });
}

/* ============================================================
   SOCIAL MEDIA SHARE PLUGIN (generic share-intent buttons)
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
