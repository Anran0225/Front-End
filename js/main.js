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
  if (!(window.gsap && window.ScrollTrigger)) initReveal();
  initTerminal();
  initStorageDemo();
  initSocialShare();
  initStatCounters();
  initLearningResources();
  initCookieNotice();
  initFooterSocials();
  initSocialMediaHub();
  initProjectQuickViews();
  initProjectDetailPage();
  initAINews();
  initJoinForm();
  initIntroResourcePreview();
  initChallengesPage();
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
      var detailUrl = 'project-detail.html?repo=' + encodeURIComponent(repo.full_name);
      var $card = $('<article class="card api-project-card reveal in"></article>');
      var previewUrl = 'https://opengraph.githubassets.com/1/' + encodeURI(repo.full_name);
      var avatarUrl = repo.owner && repo.owner.avatar_url ? repo.owner.avatar_url : 'assets/nexus-motion-poster.jpg';
      $card.append('<a class="api-project-media" href="' + detailUrl + '" aria-label="View details for ' + escapeHtml(repo.full_name) + '"><img src="' + previewUrl + '" alt="Preview image for ' + escapeHtml(repo.full_name) + '" loading="lazy" onerror="this.onerror=null;this.src=\'' + escapeHtml(avatarUrl) + '\';this.classList.add(\'avatar-fallback\');"><span><i class="bi bi-box-arrow-up-right"></i> Explore project</span></a>');
      $card.append('<div class="api-project-content">');
      var $content = $card.find('.api-project-content');
      $content.append('<div class="api-project-top"><span class="tag">★ ' + repo.stargazers_count.toLocaleString() + ' stars</span><span class="api-project-live"><i class="status-dot"></i> LIVE API</span></div>');
      $content.append('<h3></h3>').find('h3').text(repo.full_name);
      $content.append('<p></p>').find('p').text(repo.description ? repo.description.slice(0, 130) : 'No description provided.');
      $content.append('<div class="meta api-project-meta"><span>' + (repo.language || 'N/A') + '</span><span>' + repo.forks_count.toLocaleString() + ' forks</span></div>');
      $content.append('<div class="api-project-actions"><a class="text-link" href="' + detailUrl + '">DETAILS →</a><a class="project-details-link" href="' + repo.html_url + '" target="_blank" rel="noopener"><i class="bi bi-github"></i> GitHub ↗</a></div>');
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

/* ============================================================
   PERSONALISED LEARNING ROADMAP
   Fixed stage -> fixed repositories -> live GitHub repository data.
   ============================================================ */
function initLearningResources() {
  if (!document.getElementById('learningRoadmap')) return;

  var stages = [
    { slug:'ai-fundamentals', title:'AI Fundamentals', level:'Beginner', description:'Start with clear explanations of artificial intelligence, data science, generative AI, and responsible use.', repositories:['microsoft/AI-For-Beginners','microsoft/Data-Science-For-Beginners','microsoft/generative-ai-for-beginners'] },
    { slug:'python-ai', title:'Python for AI', level:'Beginner', description:'Practise Python syntax, numerical computing, and data handling with structured examples and notebooks.', repositories:['jakevdp/PythonDataScienceHandbook','numpy/numpy-tutorials','realpython/materials'] },
    { slug:'machine-learning', title:'Machine Learning', level:'Intermediate', description:'Learn how common algorithms work, train models, and evaluate results through practical examples.', repositories:['microsoft/ML-For-Beginners','ageron/handson-ml3','scikit-learn/scikit-learn'] },
    { slug:'prompt-engineering', title:'Prompt Engineering', level:'Intermediate', description:'Explore structured prompting, evaluation methods, and responsible generative AI workflows.', repositories:['dair-ai/Prompt-Engineering-Guide','microsoft/prompt-engineering','openai/openai-cookbook'] },
    { slug:'ai-projects', title:'AI Project Development', level:'Builder', description:'Combine your skills to study working AI applications and build a complete project of your own.', repositories:['streamlit/llm-examples','openai/openai-quickstart-python','Azure-Samples/azure-search-openai-demo'] }
  ];
  var storedSlug = localStorage.getItem('nexus_learning_stage');
  var currentStage = Math.max(0, stages.findIndex(function (stage) { return stage.slug === storedSlug; }));
  var completedCount = Math.min(5, Math.max(0, Number(localStorage.getItem('nexus_learning_completed')) || 0));
  var latestResources = [];

  function esc(value) { return $('<div>').text(value == null ? '' : String(value)).html(); }
  function savedResources() { try { return JSON.parse(localStorage.getItem('nexus_saved_resources') || '[]'); } catch (e) { return []; } }
  function persistProgress() { localStorage.setItem('nexus_learning_stage', stages[currentStage].slug); localStorage.setItem('nexus_learning_completed', String(completedCount)); }
  function stars(value) { return value >= 1000 ? (value / 1000).toFixed(value >= 10000 ? 0 : 1) + 'K' : String(value); }

  function renderStage() {
    var stage = stages[currentStage];
    var percent = completedCount * 20;
    $('.roadmap-step').each(function () {
      var index = Number($(this).data('stage'));
      $(this).toggleClass('completed', index < completedCount).toggleClass('active', index === currentStage);
    });
    $('#progressLabel').text(completedCount === 5 ? 'Roadmap completed' : 'Step ' + (currentStage + 1) + ' of 5');
    $('#progressPercent').text(percent + '% complete');
    $('#learningProgressBar').css('width', percent + '%').parent().attr('aria-valuenow', percent);
    $('#recommendationTitle').text(stage.title); $('#stageBadge').text(stage.level); $('#stageDescription').text(stage.description);
    $('#completeStage').prop('disabled', completedCount === 5).text(completedCount === 5 ? 'Journey completed ✓' : 'Mark step complete');
    $('#githubStatus,#githubResult').empty();
  }
  function renderRecommendations(items) {
    var saved = savedResources();
    var html = items.map(function (repo, index) {
      var isSaved = saved.some(function (item) { return item.id === repo.id; });
      var updated = new Date(repo.updated_at).toLocaleDateString('en-MY', { day:'numeric', month:'short', year:'numeric' });
      var owner = repo.owner || {};
      var avatar = owner.avatar_url || '';
      return '<article class="learning-resource">' +
        '<div class="resource-visual"><div class="resource-visual-grid"></div><img src="' + esc(avatar) + '" alt="' + esc(owner.login || repo.name) + ' GitHub avatar" loading="lazy"><div><span>GITHUB RESOURCE</span><strong>' + esc(repo.full_name || repo.name) + '</strong></div><i class="bi bi-github"></i></div>' +
        '<div class="resource-card-body"><div class="resource-meta"><span>★ ' + stars(repo.stargazers_count) + '</span><span>' + esc(repo.language || 'LEARNING') + '</span><span>UPDATED ' + esc(updated) + '</span></div>' +
        '<h3>' + esc(repo.name.replace(/-/g, ' ')) + '</h3><p>' + esc(repo.description || 'Open-source examples and learning materials assigned to this stage.') + '</p>' +
        '<div class="resource-owner"><img src="' + esc(avatar) + '" alt="" loading="lazy"><span>Maintained by <b>' + esc(owner.login || 'GitHub community') + '</b></span></div>' +
        '<div class="resource-buttons"><a class="btn small" href="' + esc(repo.html_url) + '" target="_blank" rel="noopener noreferrer">START LEARNING →</a><button class="btn ghost small save-resource ' + (isSaved ? 'saved' : '') + '" type="button" data-resource="' + index + '">' + (isSaved ? '★ SAVED' : '☆ SAVE') + '</button></div></div></article>';
    }).join('');
    $('#githubResult').html(html || '<div class="api-error">Assigned resources could not be displayed.</div>');
  }
  function renderSaved() {
    var saved = savedResources();
    if (!saved.length) { $('#savedResources').html('<p class="empty-state">No saved resources yet. Load your assigned resources and select SAVE.</p>'); return; }
    $('#savedResources').html(saved.map(function (item) { return '<div class="saved-item"><div><strong>' + esc(item.name) + '</strong><br><a href="' + esc(item.url) + '" target="_blank" rel="noopener noreferrer">OPEN RESOURCE →</a></div><button class="remove-saved" type="button" data-id="' + Number(item.id) + '" aria-label="Remove ' + esc(item.name) + '">×</button></div>'; }).join(''));
  }

  $('.roadmap-step').on('click', function () { currentStage = Number($(this).data('stage')); persistProgress(); renderStage(); });
  $('#completeStage').on('click', function () { completedCount = Math.max(completedCount, currentStage + 1); if (currentStage < stages.length - 1) currentStage++; persistProgress(); renderStage(); });
  $('#loadStageResources').on('click', function () {
    var $button = $(this); var stage = stages[currentStage];
    $button.prop('disabled', true).text('LOADING ASSIGNED RESOURCES...'); $('#githubStatus').text('> GET fixed repositories for ' + stage.title + ' ...'); $('#githubResult').empty();
    var requests = stage.repositories.map(function (repository) { return $.ajax({ url:'https://api.github.com/repos/' + repository, method:'GET', dataType:'json', timeout:10000 }); });
    $.when.apply($, requests).done(function () { latestResources = Array.prototype.map.call(arguments, function (response) { return response[0]; }); $('#githubStatus').text('> SUCCESS // 3 FIXED RESOURCES LOADED'); renderRecommendations(latestResources); })
      .fail(function (xhr) { var msg = xhr.status === 403 || xhr.status === 429 ? 'GitHub public API rate limit reached. Try again later.' : 'Unable to load assigned resources. Check your connection.'; $('#githubStatus').empty(); $('#githubResult').html('<div class="api-error">> ERROR // ' + msg + '</div>'); })
      .always(function () { $button.prop('disabled', false).text('LOAD ASSIGNED RESOURCES'); });
  });
  $(document).on('click', '.save-resource', function () { var repo = latestResources[Number($(this).data('resource'))]; if (!repo) return; var saved = savedResources(); var exists = saved.some(function (item) { return item.id === repo.id; }); saved = exists ? saved.filter(function (item) { return item.id !== repo.id; }) : saved.concat([{ id:repo.id, name:repo.name.replace(/-/g, ' '), url:repo.html_url }]); localStorage.setItem('nexus_saved_resources', JSON.stringify(saved)); renderRecommendations(latestResources); renderSaved(); });
  $(document).on('click', '.remove-saved', function () { var id = Number($(this).data('id')); localStorage.setItem('nexus_saved_resources', JSON.stringify(savedResources().filter(function (item) { return item.id !== id; }))); renderSaved(); if (latestResources.length) renderRecommendations(latestResources); });
  renderStage(); renderSaved();
}

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
      try { sessionStorage.setItem(promptedKey, '1'); } catch(e) {}
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
    button.addEventListener('click', function(){ openPreferences(false); });
  });

  var accept = notice.querySelector('#acceptCookie');
  var reject = notice.querySelector('#rejectCookie');
  var close = notice.querySelector('#closeCookie');

  if (accept) accept.addEventListener('click', function () {
    setCookie(consentKey, 'accepted', 180);
    try {
      localStorage.setItem(consentKey, 'accepted');
      sessionStorage.setItem(promptedKey, '1');
    } catch(e) {}
    closePreferences();
    document.dispatchEvent(new CustomEvent('aiAwsConsentChanged', { detail: { status: 'accepted' } }));
  });

  if (reject) reject.addEventListener('click', function () {
    setCookie(consentKey, 'declined', 30);
    try {
      localStorage.setItem(consentKey, 'declined');
      sessionStorage.setItem(promptedKey, '1');
    } catch(e) {}
    ['nexus_favorites','nexus_saved_resources','nexus_learning_stage','nexus_learning_completed'].forEach(function (key) {
      localStorage.removeItem(key);
    });
    ['join_draft_name','join_draft_email','join_draft_aiExperience','join_draft_interest','join_draft_bio'].forEach(function (key) {
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
  try { consent = localStorage.getItem(consentKey) || consent; } catch(e) {}
  var prompted = false;
  try { prompted = sessionStorage.getItem(promptedKey) === '1'; } catch(e) {}

  // Do not mark the prompt as shown until it actually opens.
  // This fixes the fast-navigation bug where a visitor changed pages before the timer fired.
  if (!consent && !prompted) {
    setTimeout(function () {
      var latestConsent = getCookie(consentKey);
      try { latestConsent = localStorage.getItem(consentKey) || latestConsent; } catch(e) {}
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
    try { state = localStorage.getItem(consentKey) || ''; } catch (e) {}
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

var clubProjects = {
  campuseye: { title:'CampusEye', category:'Computer Vision', status:'In progress', team:'4 contributors', focus:'Smart campus', icon:'bi-camera-video', cover:'cover-vision', tags:['AI','CNN','Dashboard'], tech:['Python','CNN','OpenCV','JavaScript'], description:'CampusEye explores a camera-assisted seat availability system for a university library. A computer-vision pipeline would detect occupied and free seating zones and publish the result to a lightweight web dashboard.', features:['Seat occupancy detection','Privacy-aware zone counting','Live dashboard concept','Mobile-friendly status view'], contributors:['Vision Team','Front-End Team','Project Mentor'], videoId:'nif7FQgB_14', videoDescription:'Watch a related computer-vision example that detects passengers and seat occupancy from live video. It demonstrates a similar visual-analysis idea to CampusEye identifying free and occupied library seats.' },
  studybuddy: { title:'StudyBuddy GPT', category:'NLP · RAG', status:'Shipped concept', team:'3 contributors', focus:'Learning assistant', icon:'bi-chat-square-text', cover:'cover-nlp', tags:['LLM','RAG','Citations'], tech:['Python','RAG','Embeddings','LLM'], description:'StudyBuddy GPT is a retrieval-augmented study assistant concept that searches approved faculty notes before generating an answer. The design focuses on source-aware responses so students can trace where an explanation came from.', features:['Document retrieval','Source citations','Revision Q&A','Conversation history'], contributors:['NLP Developer','UI Developer','Content Reviewer'], videoId:'LpKGm1jJXv4', videoDescription:'See how Retrieval-Augmented Generation finds relevant source content before an LLM produces an answer. This is the core learning concept behind StudyBuddy GPT.' },
  clubmatch: { title:'ClubMatch', category:'Recommender', status:'Shipped concept', team:'3 contributors', focus:'Student discovery', icon:'bi-people', cover:'cover-match', tags:['ML','Ranking','Campus'], tech:['Python','Similarity','Ranking','Bootstrap'], description:'ClubMatch recommends campus clubs based on interests, activity preferences and similarity signals. It demonstrates how a recommendation workflow can reduce information overload for new students.', features:['Interest matching','Ranked recommendations','Explainable match reasons','Responsive results'], contributors:['ML Developer','Data Analyst','UI Developer'], videoId:'v90un9ALRzw', videoDescription:'Learn how content-based and collaborative filtering use preferences and item information to generate recommendations, closely matching the recommendation concept used by ClubMatch.' },
  linechaser: { title:'LineChaser Bot', category:'Robotics', status:'In progress', team:'4 contributors', focus:'Reinforcement learning', icon:'bi-cpu', cover:'cover-robot', tags:['RL','Simulation','Robot'], tech:['Python','RL','Simulation','Sensors'], description:'LineChaser Bot studies how a policy trained in simulation could be transferred to a physical line-following robot. The project is designed around experimentation, reward design and repeated evaluation.', features:['Simulation training','Reward tuning','Sensor integration','Physical prototype'], contributors:['RL Developer','Hardware Builder','Tester','Mentor'], videoId:'bPtiN8MS-LE', videoDescription:'Explore how a reinforcement-learning policy can be trained in simulation and moved toward real-world robot deployment, which reflects the sim-to-real idea behind LineChaser Bot.' },
  lecturescribe: { title:'LectureScribe', category:'Audio ML', status:'Shipped concept', team:'3 contributors', focus:'Study productivity', icon:'bi-mic', cover:'cover-audio', tags:['Speech','Summary','Notes'], tech:['Speech-to-text','NLP','JavaScript','Audio'], description:'LectureScribe combines speech-to-text with summarisation to transform a recorded lecture into structured revision notes. The concept highlights accessibility, searchability and post-class review.', features:['Audio transcription','Section summaries','Keyword extraction','Downloadable notes'], contributors:['Audio Developer','NLP Developer','UI Developer'], videoId:'HceKUGguai0', videoDescription:'See a related AI workflow combining speech transcription with LLM summarisation, similar to LectureScribe turning recorded lectures into concise revision notes.' },
  posterforge: { title:'PosterForge', category:'Generative AI', status:'In progress', team:'3 contributors', focus:'Creative automation', icon:'bi-stars', cover:'cover-gen', tags:['Prompting','Design','Automation'], tech:['Prompt engineering','Generative AI','JavaScript','Design'], description:'PosterForge turns a short event brief into a structured creative direction and draft visual concept. It demonstrates how prompt structure, constraints and iteration can improve generative-AI output.', features:['Prompt templates','Creative brief parser','Style constraints','Iteration workflow'], contributors:['Prompt Designer','UI Developer','Content Designer'], videoId:'3pzrIMXA8J4', videoDescription:'Explore how generative AI can support graphic-design ideation, prompt refinement and iterative visual concepts—the same creative direction explored by PosterForge.' }
};

function initProjectQuickViews() {
  var modalEl = document.getElementById('projectQuickView');
  if (!modalEl || !window.bootstrap) return;
  var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  document.querySelectorAll('.project-quick-btn').forEach(function (btn) {
    btn.addEventListener('click', function (event) {
      event.preventDefault(); event.stopPropagation();
      var id = btn.getAttribute('data-project'); var project = clubProjects[id]; if (!project) return;
      document.getElementById('projectModalTitle').textContent = project.title;
      document.getElementById('projectModalText').textContent = project.description;
      document.getElementById('projectModalStatus').textContent = project.status;
      document.getElementById('projectModalTeam').textContent = project.team;
      document.getElementById('projectModalFocus').textContent = project.focus;
      document.getElementById('projectModalTags').innerHTML = project.tags.map(function (tag) { return '<span>'+tag+'</span>'; }).join('');
      var visual = document.getElementById('projectModalVisual'); visual.className = 'project-modal-visual ' + project.cover; visual.innerHTML = '<i class="bi '+project.icon+'"></i>';
      document.getElementById('projectModalDetails').href = 'project-detail.html?id=' + encodeURIComponent(id);
      var save = document.getElementById('projectModalSave');
      function syncSave(){ var favs=JSON.parse(localStorage.getItem('nexus_favorites')||'[]'); var on=favs.indexOf(id)>-1; save.textContent=on?'★ Saved':'☆ Save project'; save.classList.toggle('on',on); }
      save.onclick=function(){ var favs=JSON.parse(localStorage.getItem('nexus_favorites')||'[]'); favs=favs.indexOf(id)>-1?favs.filter(function(x){return x!==id;}):favs.concat(id); localStorage.setItem('nexus_favorites',JSON.stringify(favs)); syncSave(); };
      syncSave(); modal.show();
    });
  });
}

function initProjectDetailPage() {
  if (!document.body.hasAttribute('data-project-detail')) return;
  var params = new URLSearchParams(location.search); var repoName = params.get('repo'); var id = params.get('id');
  if (repoName) loadRepositoryDetail(repoName); else renderClubProjectDetail(clubProjects[id] || clubProjects.studybuddy, id || 'studybuddy');
}

function detailTags(tags) { return (tags || []).map(function (tag) { return '<span>'+escapeHtml(tag)+'</span>'; }).join(''); }
function escapeHtml(value) { return String(value == null ? '' : value).replace(/[&<>'"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c];}); }

function renderClubProjectDetail(project, id) {
  document.title = project.title + ' | AI AWS Club';
  $('#detailTitle').text(project.title); $('#detailSubtitle').text(project.category + ' · ' + project.focus); $('#detailDescription').text(project.description);
  $('#detailTags').html(detailTags(project.tags)); $('#detailTech').html(detailTags(project.tech));
  $('#detailInlineMeta').html('<span><i class="status-dot"></i>'+escapeHtml(project.status)+'</span><span><i class="bi bi-people"></i>'+escapeHtml(project.team)+'</span><span><i class="bi bi-star"></i>Featured club concept</span>');
  $('#detailFeatures').html(project.features.map(function(f){return '<div class="detail-feature"><i class="bi bi-check2-circle"></i><span>'+escapeHtml(f)+'</span></div>';}).join(''));
  $('#detailContributors').html(project.contributors.map(function(c,i){return '<div class="detail-person"><span class="detail-avatar">'+escapeHtml(c.charAt(0))+'</span><div><strong>'+escapeHtml(c)+'</strong><small>'+(i===0?'Lead contributor':'Project contributor')+'</small></div></div>';}).join(''));
  $('#detailData').html('<div><span>Type</span><strong>Club project concept</strong></div><div><span>Category</span><strong>'+escapeHtml(project.category)+'</strong></div><div><span>Saved locally</span><strong>localStorage</strong></div>');
  $('#detailGithub').attr('href','https://github.com/Anran0225/Front-End').html('<i class="bi bi-github"></i> Website source on GitHub');

  // Project concept video: fixed curated YouTube video, no YouTube API key required.
  if (project.videoId) {
    $('#projectDemoPanel').show();
    $('#detailVideoDescription').text(project.videoDescription || 'Watch a related video to understand the project concept.');
    $('#detailVideo').attr('src','https://www.youtube-nocookie.com/embed/' + encodeURIComponent(project.videoId) + '?rel=0');
    $('#detailYoutubeLink').attr('href','https://www.youtube.com/watch?v=' + encodeURIComponent(project.videoId));
  } else {
    $('#projectDemoPanel').hide();
  }

  $('#projectDetailHero').addClass(project.cover);
}

function loadRepositoryDetail(repoName) {
  $('#projectDemoPanel').hide();
  $('#detailVideo').attr('src','');
  $('#detailTitle').text('Loading ' + repoName + '…');
  $.ajax({ url:'https://api.github.com/repos/' + repoName, dataType:'json', timeout:10000 }).done(function(repo){
    document.title = repo.name + ' | GitHub Project Detail';
    $('#detailTitle').text(repo.name); $('#detailSubtitle').text(repo.full_name); $('#detailDescription').text(repo.description || 'No repository description provided.');
    $('#detailTags').html(detailTags((repo.topics || []).slice(0,4).length ? (repo.topics || []).slice(0,4) : ['Open source','GitHub API']));
    $('#detailTech').html(detailTags([repo.language || 'Mixed'].concat((repo.topics || []).slice(0,5))));
    $('#detailInlineMeta').html('<span><i class="status-dot"></i>LIVE GITHUB DATA</span><span><i class="bi bi-star"></i>'+repo.stargazers_count.toLocaleString()+' stars</span><span><i class="bi bi-diagram-2"></i>'+repo.forks_count.toLocaleString()+' forks</span>');
    $('#detailFeatures').html(['Public repository metadata','Live star and fork counts','Direct GitHub source access','API-powered detail page'].map(function(f){return '<div class="detail-feature"><i class="bi bi-check2-circle"></i><span>'+f+'</span></div>';}).join(''));
    $('#detailContributors').html('<div class="detail-person"><img class="detail-avatar image" src="'+escapeHtml(repo.owner.avatar_url)+'" alt=""><div><strong>'+escapeHtml(repo.owner.login)+'</strong><small>Repository owner</small></div></div>');
    var updated = new Date(repo.updated_at).toLocaleDateString('en-MY',{day:'numeric',month:'short',year:'numeric'});
    $('#detailData').html('<div><span>Primary language</span><strong>'+escapeHtml(repo.language || 'N/A')+'</strong></div><div><span>Open issues</span><strong>'+repo.open_issues_count.toLocaleString()+'</strong></div><div><span>Updated</span><strong>'+escapeHtml(updated)+'</strong></div>');
    $('#detailGithub').attr('href',repo.html_url).html('<i class="bi bi-github"></i> View on GitHub');
    $('#projectDetailHero').css('background-image','linear-gradient(90deg,rgba(13,17,23,.96),rgba(13,17,23,.68)),url("https://opengraph.githubassets.com/1/'+encodeURI(repo.full_name)+'")');
  }).fail(function(){ $('#detailTitle').text('Project could not be loaded'); $('#detailSubtitle').text('The GitHub API may be rate-limited.'); $('#detailDescription').text('Return to the Projects page and try again shortly.'); });
}


/* V5 interactive orbit + project motion */
(function () {
  function initV5Motion() {
    var stage = document.querySelector('.ai-orbit-stage');
    if (stage) {
      stage.querySelectorAll('.ai-orbit-node').forEach(function (node) {
        node.addEventListener('mouseenter', function () { stage.classList.add('orbit-paused'); });
        node.addEventListener('mouseleave', function () { stage.classList.remove('orbit-paused'); });
        node.addEventListener('focus', function () { stage.classList.add('orbit-paused'); });
        node.addEventListener('blur', function () { stage.classList.remove('orbit-paused'); });
        node.addEventListener('click', function () {
          var url = node.getAttribute('data-url');
          if (url) window.open(url, '_blank', 'noopener,noreferrer');
        });
        node.addEventListener('keydown', function (event) {
          if ((event.key === 'Enter' || event.key === ' ') && node.getAttribute('data-url')) {
            event.preventDefault();
            window.open(node.getAttribute('data-url'), '_blank', 'noopener,noreferrer');
          }
        });
      });
    }

    if (window.matchMedia('(pointer:fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.project-showcase-card').forEach(function (card) {
        card.addEventListener('mousemove', function (event) {
          var r = card.getBoundingClientRect();
          var px = (event.clientX - r.left) / r.width - .5;
          var py = (event.clientY - r.top) / r.height - .5;
          card.style.transform = 'perspective(900px) rotateX(' + (-py * 4.5) + 'deg) rotateY(' + (px * 5.5) + 'deg) translateY(-5px)';
        });
        card.addEventListener('mouseleave', function () { card.style.transform = ''; });
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initV5Motion);
  else initV5Motion();
})();


/* ============================================================
   AI NEWS — public REST API + jQuery
   Hacker News Search API powered by Algolia.
   ============================================================ */
function initAINews() {
  if (!document.body.hasAttribute('data-ai-news')) return;
  var currentQuery = 'artificial intelligence';
  var $grid = $('#aiNewsGrid');
  var $status = $('#aiNewsStatus');

  function domainOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return 'news.ycombinator.com'; }
  }
  function cleanTitle(value) { return $('<div>').text(value || 'Untitled story').html(); }
  function relativeDate(iso) {
    var d = new Date(iso); if (isNaN(d.getTime())) return '';
    var diff = Math.max(0, Date.now() - d.getTime());
    var hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return hours + 'h ago';
    var days = Math.floor(hours / 24); return days + 'd ago';
  }
  function load(query) {
    currentQuery = query || currentQuery;
    $grid.html('<div class="news-loading"><span></span><p>Scanning the latest AI stories…</p></div>');
    $.ajax({
      url: 'https://hn.algolia.com/api/v1/search_by_date',
      method: 'GET', dataType: 'json', timeout: 10000,
      data: { query: currentQuery, tags: 'story', hitsPerPage: 12 }
    }).done(function (data) {
      var hits = (data.hits || []).filter(function (hit) { return hit.title; }).slice(0, 9);
      if (!hits.length) { $grid.html('<div class="api-error">> No recent stories returned for this filter.</div>'); return; }
      $grid.empty();
      hits.forEach(function (hit, i) {
        var storyUrl = hit.url || ('https://news.ycombinator.com/item?id=' + encodeURIComponent(hit.objectID));
        var discussion = 'https://news.ycombinator.com/item?id=' + encodeURIComponent(hit.objectID);
        var domain = domainOf(storyUrl);
        var favicon = 'https://www.google.com/s2/favicons?sz=128&domain_url=' + encodeURIComponent(storyUrl);
        var card = $('<article class="news-card"></article>');
        card.html(
          '<a class="news-card-media" href="' + storyUrl + '" target="_blank" rel="noopener" aria-label="Open story from ' + cleanTitle(domain) + '">' +
            '<div class="news-media-grid"></div><div class="news-media-orb"></div><img src="' + favicon + '" alt="' + cleanTitle(domain) + ' logo" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'grid\';"><span class="news-media-fallback">' + cleanTitle((domain || 'AI').slice(0,2).toUpperCase()) + '</span><em>LIVE STORY</em>' +
          '</a>' +
          '<div class="news-card-body"><div class="news-card-top"><span class="news-source">' + cleanTitle(domain) + '</span><span class="news-age">' + cleanTitle(relativeDate(hit.created_at)) + '</span></div>' +
          '<h3>' + cleanTitle(hit.title) + '</h3>' +
          '<div class="news-card-meta"><span><i class="bi bi-arrow-up-circle"></i> ' + Number(hit.points || 0).toLocaleString() + ' points</span><span><i class="bi bi-chat-left-text"></i> ' + Number(hit.num_comments || 0).toLocaleString() + ' comments</span><span>by ' + cleanTitle(hit.author || 'HN user') + '</span></div>' +
          '<div class="news-card-actions"><a class="btn small" href="' + storyUrl + '" target="_blank" rel="noopener">Read story ↗</a><a class="text-link" href="' + discussion + '" target="_blank" rel="noopener">Discussion →</a></div></div>'
        );
        $grid.append(card);
      });
      if (window.gsap) gsap.from('#aiNewsGrid .news-card', { opacity:0, y:24, duration:.55, stagger:.06, ease:'power3.out' });
    }).fail(function () {
      $grid.html('<div class="api-error">The public news feed could not be reached. Check your connection and try Refresh.</div>');
    });
  }

  $('.news-filter').on('click', function () {
    $('.news-filter').removeClass('active'); $(this).addClass('active'); load($(this).data('query'));
  });
  $('#newsRefresh').on('click', function () { load(currentQuery); });
  load(currentQuery);
}

/* ============================================================
   JOIN PAGE — browser-only profile demo
   - sessionStorage: non-sensitive draft fields
   - localStorage: profile preview (never stores password)
   - custom live validation: green = ready, red = needs attention
   ============================================================ */
function initJoinForm() {
  var form = document.getElementById('joinForm');
  if (!form) return;
  var status = document.getElementById('formStatus');
  var draftFields = ['name','email','aiExperience','interest','bio'];
  var password = form.elements.password;
  var confirm = form.elements.confirm;

  draftFields.forEach(function (name) {
    var el = form.elements[name]; if (!el) return;
    var saved = sessionStorage.getItem('join_draft_' + name);
    if (saved) el.value = saved;
    el.addEventListener('input', function () {
      sessionStorage.setItem('join_draft_' + name, el.value);
      validateField(name, false);
      renderPreviewFromForm();
    });
    el.addEventListener('change', function () {
      sessionStorage.setItem('join_draft_' + name, el.value);
      validateField(name, false);
      renderPreviewFromForm();
    });
    el.addEventListener('blur', function(){ validateField(name, true); });
  });

  function fieldWrap(name) {
    var el = form.elements[name];
    return el ? el.closest('.field') : null;
  }
  function setState(name, valid, showError) {
    var wrap = fieldWrap(name);
    if (!wrap) return;
    wrap.classList.toggle('is-valid', !!valid);
    wrap.classList.toggle('is-invalid', !valid && !!showError);
    var err = form.querySelector('[data-error-for="' + name + '"]');
    if (err) err.classList.toggle('show', !valid && !!showError);
    var el = form.elements[name];
    if (el) el.setAttribute('aria-invalid', (!valid && !!showError) ? 'true' : 'false');
  }
  function validateField(name, showError) {
    var el = form.elements[name];
    if (!el) return true;
    var value = (el.value || '').trim();
    var valid = true;
    if (name === 'name') valid = value.length >= 2;
    else if (name === 'email') valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    else if (name === 'aiExperience' || name === 'interest') valid = value !== '';
    else if (name === 'bio') valid = value.length >= 20;
    setState(name, valid, showError || value.length > 0);
    return valid;
  }

  function rule(selector, pass) {
    var el = form.querySelector('[data-rule="' + selector + '"]');
    if (el) el.classList.toggle('pass', !!pass);
  }
  function validatePassword(showError) {
    var value = password.value || '';
    var lengthOK = value.length >= 8;
    var letterOK = /[A-Za-z]/.test(value);
    var numberOK = /\d/.test(value);
    rule('length', lengthOK); rule('letter', letterOK); rule('number', numberOK);

    var passwordOK = lengthOK && letterOK && numberOK;
    setState('password', passwordOK, showError || value.length > 0);

    var match = !!value && confirm.value === value;
    setState('confirm', match, showError || confirm.value.length > 0);
    return passwordOK && match;
  }

  password.addEventListener('input', function(){ validatePassword(false); });
  confirm.addEventListener('input', function(){ validatePassword(false); });
  password.addEventListener('blur', function(){ validatePassword(true); });
  confirm.addEventListener('blur', function(){ validatePassword(true); });

  document.querySelectorAll('[data-password-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      var input = document.getElementById(button.getAttribute('data-password-toggle')); if (!input) return;
      var show = input.type === 'password'; input.type = show ? 'text' : 'password';
      button.innerHTML = '<i class="bi ' + (show ? 'bi-eye-slash' : 'bi-eye') + '"></i>';
      button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  });

  function validateAll(showError) {
    var fieldsOK = ['name','email','aiExperience','interest','bio'].every(function(name){
      return validateField(name, showError);
    });
    var passOK = validatePassword(showError);
    return fieldsOK && passOK;
  }

  function firstInvalidControl() {
    var invalidWrap = form.querySelector('.field.is-invalid');
    if (!invalidWrap) return null;
    return invalidWrap.querySelector('input,select,textarea') || invalidWrap;
  }

  function guideToFirstInvalid() {
    var control = firstInvalidControl();
    if (!control) return;
    var wrap = control.closest('.field') || control;
    wrap.classList.add('needs-attention');
    wrap.scrollIntoView({ behavior:'smooth', block:'center' });
    window.setTimeout(function(){
      try { control.focus({ preventScroll:true }); } catch(e) { control.focus(); }
      wrap.classList.remove('needs-attention');
    }, 520);
  }

  function renderProfile(profile) {
    var nameEl = document.getElementById('joinPreviewName');
    var emailEl = document.getElementById('joinPreviewEmail');
    var avatar = document.getElementById('joinAvatar');
    var tags = document.getElementById('joinPreviewTags');
    if (!profile) return;
    if (nameEl) nameEl.textContent = profile.name || 'Future AI AWS Member';
    if (emailEl) emailEl.textContent = profile.email || 'Browser-only profile';
    if (avatar) avatar.textContent = (profile.name || 'A').trim().charAt(0).toUpperCase();
    if (tags) tags.innerHTML = '<span>' + escapeHtml(profile.aiExperience || 'AI CURIOUS') + '</span><span>' + escapeHtml(profile.interest || 'READY TO BUILD') + '</span>';
  }
  function renderPreviewFromForm() {
    renderProfile({
      name:form.elements.name.value,
      email:form.elements.email.value,
      aiExperience:form.elements.aiExperience.value,
      interest:form.elements.interest.value
    });
  }
  try {
    var stored = JSON.parse(localStorage.getItem('nexus_member_profile') || 'null');
    if (stored) renderProfile(stored); else renderPreviewFromForm();
  } catch (e) { renderPreviewFromForm(); }

  ['name','email','aiExperience','interest','bio'].forEach(function(name){ validateField(name, false); });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!validateAll(true)) {
      if (status) status.textContent = '> CHECK THE HIGHLIGHTED REQUIRED FIELD.';
      guideToFirstInvalid();
      return;
    }
    var profile = {
      name:form.elements.name.value.trim(),
      email:form.elements.email.value.trim(),
      aiExperience:form.elements.aiExperience.value,
      interest:form.elements.interest.value,
      bio:form.elements.bio.value.trim(),
      joinedAt:new Date().toISOString()
    };
    localStorage.setItem('nexus_member_profile', JSON.stringify(profile));
    draftFields.forEach(function (name) { sessionStorage.removeItem('join_draft_' + name); });
    password.value = ''; confirm.value = ''; validatePassword(false); renderProfile(profile);
    if (status) status.textContent = '> PROFILE CREATED LOCALLY // NO PASSWORD STORED.';
    document.querySelector('.join-profile-card')?.classList.add('profile-saved');
  });

  document.getElementById('clearJoinForm')?.addEventListener('click', function () {
    form.reset();
    draftFields.forEach(function (name) { sessionStorage.removeItem('join_draft_' + name); });
    form.querySelectorAll('.field').forEach(function(field){ field.classList.remove('is-valid','is-invalid','needs-attention'); });
    form.querySelectorAll('.field-error').forEach(function(err){ err.classList.remove('show'); });
    validatePassword(false); renderPreviewFromForm();
    if (status) status.textContent = '> FORM CLEARED // SAVED BROWSER PROFILE UNCHANGED.';
  });
  document.getElementById('resetBrowserProfile')?.addEventListener('click', function () {
    localStorage.removeItem('nexus_member_profile'); renderPreviewFromForm();
    if (status) status.textContent = '> SAVED BROWSER PROFILE REMOVED.';
  });
}


/* ============================================================
   EVENTS PAGE — filter, countdown, localStorage registration
   ============================================================ */
function initEventsPage() {
  if (!document.body.hasAttribute('data-events-page')) return;

  var $cards = $('.event-card');
  var $filters = $('.event-filter');
  function applyFilter(filter) {
    filter = filter || 'All';
    $filters.removeClass('active').filter('[data-event-filter="' + filter + '"]').addClass('active');
    $cards.each(function () {
      var show = filter === 'All' || $(this).data('category') === filter;
      $(this).stop(true,true)[show ? 'fadeIn' : 'fadeOut'](220);
    });
  }
  $filters.on('click', function () { applyFilter($(this).data('event-filter')); });
  try {
    var fromQuery = new URLSearchParams(location.search).get('filter');
    if (fromQuery && $filters.filter('[data-event-filter="' + fromQuery + '"]').length) applyFilter(fromQuery);
  } catch (e) {}

  var countdown = document.getElementById('eventCountdown');
  var countdownCard = document.querySelector('[data-countdown-target]');
  function tickCountdown() {
    if (!countdown || !countdownCard) return;
    var target = new Date(countdownCard.getAttribute('data-countdown-target')).getTime();
    var diff = Math.max(0, target - Date.now());
    var values = [Math.floor(diff/86400000), Math.floor(diff%86400000/3600000), Math.floor(diff%3600000/60000), Math.floor(diff%60000/1000)];
    countdown.querySelectorAll('b').forEach(function (el,i) { el.textContent = String(values[i] || 0).padStart(2,'0'); });
    if (diff <= 0) countdownCard.classList.add('is-live');
  }
  tickCountdown(); window.setInterval(tickCountdown, 1000);

  var detailEl = document.getElementById('eventDetailModal');
  var detailModal = detailEl && window.bootstrap ? new bootstrap.Modal(detailEl) : null;
  var selectedEvent = '';
  function fillDetail(card) {
    selectedEvent = card.dataset.eventName || '';
    var img = document.getElementById('eventModalImage'); if (img) img.src = card.dataset.eventImage || 'assets/nexus-motion-poster.jpg';
    var type = document.getElementById('eventModalType'); if (type) type.textContent = card.dataset.category || 'Event';
    var title = document.getElementById('eventModalTitle'); if (title) title.textContent = selectedEvent;
    var date = document.getElementById('eventModalDate'); if (date) date.innerHTML = '<i class="bi bi-calendar3"></i> ' + (card.dataset.eventDate || '');
    var loc = document.getElementById('eventModalLocation'); if (loc) loc.innerHTML = '<i class="bi bi-geo-alt"></i> ' + (card.dataset.eventLocation || '');
    var desc = document.getElementById('eventModalDescription'); if (desc) desc.textContent = card.dataset.eventDescription || '';
  }
  $(document).on('click','.event-details-btn',function(){ var card=this.closest('.event-card'); if(!card)return; fillDetail(card); if(detailModal) detailModal.show(); });

  function selectForRegistration(name) {
    var select = document.getElementById('eventRegSelect'); if (select) select.value = name || '';
    var section = document.querySelector('.event-registration-section'); if (section) section.scrollIntoView({behavior:'smooth',block:'start'});
    window.setTimeout(function(){ var nameInput=document.getElementById('eventRegName'); if(nameInput) nameInput.focus({preventScroll:true}); }, 500);
  }
  $(document).on('click','.event-register-btn',function(){ var card=this.closest('.event-card'); if(card) selectForRegistration(card.dataset.eventName); });
  var modalRegister = document.getElementById('eventModalRegister'); if (modalRegister) modalRegister.addEventListener('click',function(){ selectForRegistration(selectedEvent); });

  var form = document.getElementById('eventRegisterForm');
  var status = document.getElementById('eventRegisterStatus');
  var summary = document.getElementById('eventRegistrationSummary');
  var registrationKey = document.body.getAttribute('data-registration-key') || 'nexus_event_registrations';
  function registrations() { try { return JSON.parse(localStorage.getItem(registrationKey) || '[]'); } catch(e) { return []; } }
  function updateSummary() {
    var list = registrations();
    if (summary) summary.innerHTML = '<span class="status-dot"></span><strong>' + list.length + ' saved registration' + (list.length===1?'':'s') + '</strong>' + (list.length ? '<small>Latest: ' + escapeHtml(list[list.length-1].event) + '</small>' : '<small>Register for an event to demonstrate localStorage.</small>');
  }
  updateSummary();
  if (form) {
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var data = { name:form.elements.name.value.trim(), studentId:form.elements.studentId.value.trim(), email:form.elements.email.value.trim(), event:form.elements.event.value, registeredAt:new Date().toISOString() };
      if (!data.name || !data.studentId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || !data.event) { if(status)status.textContent='> CHECK REQUIRED FIELDS BEFORE SAVING.'; return; }
      var list=registrations();
      var duplicate=list.some(function(item){return item.studentId===data.studentId && item.event===data.event;});
      if (!duplicate) { list.push(data); localStorage.setItem(registrationKey, JSON.stringify(list)); }
      if(status)status.textContent=duplicate?'> ALREADY REGISTERED // saved record found.':'> SUCCESS // REGISTRATION SAVED TO LOCALSTORAGE.';
      updateSummary();
      if(window.gsap) gsap.fromTo(summary,{scale:.97},{scale:1,duration:.35,ease:'back.out(2)'});
    });
    form.addEventListener('reset', function(){ window.setTimeout(function(){ if(status)status.textContent='> FORM CLEARED // saved registrations unchanged.'; },0); });
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initEventsPage); else initEventsPage();


/* ============================================================
   V10 — upright AI orbit + AI Intro member interactions
   ============================================================ */
(function(){
  function initUprightOrbit(){
    var stage=document.querySelector('.ai-orbit-stage');
    var track=stage && stage.querySelector('.ai-orbit-track-single');
    if(!stage || !track) return;
    var nodes=Array.from(track.querySelectorAll('.ai-orbit-node'));
    if(!nodes.length) return;
    var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var bases=nodes.map(function(node,index){
      var raw=getComputedStyle(node).getPropertyValue('--angle').trim();
      var n=parseFloat(raw); return Number.isFinite(n)?n:index*(360/nodes.length);
    });
    var phase=0,last=performance.now(),speed=360/32000;
    function layout(now){
      var dt=Math.min(60,now-last); last=now;
      if(!reduce && !stage.classList.contains('orbit-paused')) phase=(phase+dt*speed)%360;
      var radius=track.clientWidth/2;
      nodes.forEach(function(node,i){
        var a=(bases[i]+phase)*Math.PI/180;
        var x=Math.cos(a)*radius, y=Math.sin(a)*radius;
        node.style.transform='translate(-50%, -50%) translate('+x.toFixed(2)+'px,'+y.toFixed(2)+'px)';
      });
      if(!reduce) requestAnimationFrame(layout);
    }
    if(reduce){layout(performance.now());}else{requestAnimationFrame(layout);}
    window.addEventListener('resize',function(){ if(reduce) layout(performance.now()); });
  }

  var techData={
    ml:{icon:'bi-diagram-3',title:'Machine Learning',summary:'Systems learn patterns from examples instead of being programmed with a rule for every situation.',facts:['Predict house prices from past data','Python · scikit-learn · pandas','Classification or recommendation system']},
    deep:{icon:'bi-layers',title:'Deep Learning',summary:'Deep learning uses neural networks with many layers to learn complex patterns from large amounts of data.',facts:['Recognise objects in images','PyTorch · TensorFlow · GPUs','Image classifier or speech recogniser']},
    gen:{icon:'bi-stars',title:'Generative AI',summary:'Generative AI creates new text, images, audio, video or code by learning patterns from existing examples.',facts:['Generate a study explanation or image','LLMs · diffusion models · prompts','Campus assistant or content generator']},
    vision:{icon:'bi-eye',title:'Computer Vision',summary:'Computer Vision helps machines interpret visual information such as images, video frames and camera streams.',facts:['Detect vehicles or recognise objects','OpenCV · YOLO · CNNs','Smart attendance or object detector']},
    nlp:{icon:'bi-chat-square-text',title:'Natural Language Processing',summary:'NLP enables software to analyse, understand and generate human language.',facts:['Classify feedback or answer questions','Transformers · embeddings · tokenisation','FAQ bot or sentiment analyser']},
    robotics:{icon:'bi-cpu',title:'Robotics',summary:'AI-powered robotics combines perception, planning and control so machines can respond to the physical world.',facts:['Navigate around obstacles','Sensors · control · computer vision','Line follower or campus delivery prototype']}
  };
  function initTechExplorer(){
    var detail=document.getElementById('aiTechDetail'); if(!detail) return;
    var buttons=[].slice.call(document.querySelectorAll('.ai-tech-tab'));
    function activate(btn){
      buttons.forEach(function(b){b.classList.remove('active');b.setAttribute('aria-selected','false')});
      btn.classList.add('active');btn.setAttribute('aria-selected','true');var d=techData[btn.dataset.tech];if(!d)return;
      detail.querySelector('.ai-tech-detail-icon i').className='bi '+d.icon;
      detail.querySelector('h3').textContent=d.title;detail.querySelector('.ai-tech-summary').textContent=d.summary;
      detail.querySelectorAll('.ai-tech-facts strong').forEach(function(el,i){el.textContent=d.facts[i]});
      if(window.gsap){
        gsap.fromTo(detail,{opacity:.68,y:10,scale:.992},{opacity:1,y:0,scale:1,duration:.38,ease:'power2.out'});
        gsap.fromTo(detail.querySelector('.ai-tech-detail-icon'),{rotate:-8,scale:.82},{rotate:0,scale:1,duration:.46,ease:'back.out(1.7)'});
      }
    }
    buttons.forEach(function(btn){btn.addEventListener('click',function(){activate(btn)});btn.addEventListener('focus',function(){if(!btn.classList.contains('active'))activate(btn)});});
  }

  var flowData={
    data:['01 · Data','AI starts with examples such as text, images, sensor readings or labelled records. Better-quality data usually produces more useful learning.'],
    train:['02 · Training','During training, an algorithm adjusts internal parameters so its outputs become closer to the desired pattern or objective.'],
    model:['03 · Model','The trained model stores the learned relationships. It is not a database of perfect answers; it is a mathematical system that estimates useful outputs.'],
    output:['04 · Output','During inference, the model uses new input to produce a prediction, classification, recommendation or generated result.']
  };
  function initFlow(){var box=document.getElementById('aiFlowExplain');if(!box)return;document.querySelectorAll('.ai-flow-step').forEach(function(btn){btn.addEventListener('click',function(){document.querySelectorAll('.ai-flow-step').forEach(function(b){b.classList.remove('active')});btn.classList.add('active');var d=flowData[btn.dataset.flow];box.querySelector('strong').textContent=d[0];box.querySelector('p').textContent=d[1];if(window.gsap)gsap.fromTo(box,{opacity:.55,x:-8},{opacity:1,x:0,duration:.25})})})}

  var cases={
    education:['bi-mortarboard','Education','Personalised learning and study support','AI can recommend practice material, summarise difficult content and help students receive feedback at their own pace.','Example: adaptive quiz recommendations based on previous answers.'],
    health:['bi-heart-pulse','Healthcare','Assist clinicians with patterns in medical data','AI can help analyse scans, prioritise cases and identify patterns, while qualified professionals remain responsible for decisions.','Example: highlighting suspicious regions in medical images for review.'],
    finance:['bi-graph-up-arrow','Finance','Detect patterns, risk and unusual activity','Financial systems use machine learning for fraud detection, credit-risk support and market analysis.','Example: flagging a transaction that differs strongly from normal behaviour.'],
    creative:['bi-palette','Creative Work','Generate and refine ideas across media','Generative AI can support writing, images, audio, video and design ideation when users provide clear goals and evaluate outputs.','Example: generating concept variations for a campaign poster.'],
    campus:['bi-buildings','Smart Campus','Use AI to improve campus services','AI can support scheduling, smart facilities, student services and campus operations when privacy and responsible-use requirements are considered.','Example: an FAQ assistant that routes students to the correct university service.']
  };
  function initUsecases(){var panel=document.getElementById('aiUsecasePanel');if(!panel)return;document.querySelectorAll('.ai-usecase-tab').forEach(function(btn){btn.addEventListener('click',function(){document.querySelectorAll('.ai-usecase-tab').forEach(function(b){b.classList.remove('active')});btn.classList.add('active');var d=cases[btn.dataset.case];panel.querySelector('.ai-usecase-icon i').className='bi '+d[0];panel.querySelector('.tag').textContent=d[1];panel.querySelector('h3').textContent=d[2];panel.querySelector('p').textContent=d[3];panel.querySelector('small').textContent=d[4];if(window.gsap)gsap.fromTo(panel,{opacity:.55,y:7},{opacity:1,y:0,duration:.3})})})}

  function initPromptBuilder(){
    var btn=document.getElementById('buildPrompt'),out=document.getElementById('promptOutput');if(!btn||!out)return;
    btn.addEventListener('click',function(){var goal=(document.getElementById('promptGoal').value||'Explain the selected topic').trim();var audience=(document.getElementById('promptAudience').value||'a university student').trim();var format=document.getElementById('promptFormat').value;out.textContent='Act as a clear and accurate AI tutor.\\n\\nAudience: '+audience+'\\nTask: '+goal+'\\nOutput: '+format+'\\nRequirements: Define unfamiliar terms, use one practical example, separate facts from assumptions, and end with two key takeaways. If information is uncertain, say so rather than inventing details.';if(window.gsap)gsap.fromTo(out,{opacity:.5},{opacity:1,duration:.3})});
    var copy=document.getElementById('copyPrompt');if(copy)copy.addEventListener('click',function(){var text=out.textContent;navigator.clipboard&&navigator.clipboard.writeText(text).then(function(){copy.innerHTML='<i class="bi bi-check2"></i> Copied';setTimeout(function(){copy.innerHTML='<i class="bi bi-copy"></i> Copy'},1200)})});
  }

  function initAboutCounters(){
    var counters=[].slice.call(document.querySelectorAll('.about-count'));
    if(!counters.length)return;
    function run(el){
      if(el.dataset.counted==='true')return;
      el.dataset.counted='true';
      var target=parseInt(el.dataset.target||'0',10),suffix=el.dataset.suffix||'';
      var duration=1400,start=performance.now();
      function tick(now){
        var p=Math.min(1,(now-start)/duration);
        var eased=1-Math.pow(1-p,3);
        el.textContent=Math.round(target*eased).toLocaleString()+suffix;
        if(p<1)requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){run(entry.target);io.unobserve(entry.target);}})},{threshold:.45});
      counters.forEach(function(c){io.observe(c)});
    }else counters.forEach(run);
  }

  function init(){initUprightOrbit();initTechExplorer();initFlow();initUsecases();initAboutCounters();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();


/* ============================================================
   AI INTRO — EXPLORE MORE / GitHub REST API preview
   Uses curated public repositories and the GitHub owner.avatar_url image.
   ============================================================ */
function initIntroResourcePreview() {
  var grid = document.getElementById('introResourceGrid');
  if (!grid || typeof window.jQuery === 'undefined') return;
  $(grid).find('.intro-resource-card[data-repo]').each(function () {
    var $card = $(this), repo = $card.data('repo'), label = $card.data('label') || 'Resource';
    $.ajax({ url:'https://api.github.com/repos/' + repo, method:'GET', dataType:'json', timeout:10000 })
      .done(function (data) {
        var updated = data.updated_at ? new Date(data.updated_at).toLocaleDateString('en-MY',{day:'numeric',month:'short',year:'numeric'}) : 'Recently';
        var avatar = data.owner && data.owner.avatar_url ? data.owner.avatar_url : 'assets/nexus-motion-poster.jpg';
        $card.removeClass('skeleton-card').html(
          '<div class="intro-resource-media"><img src="'+escapeHtml(avatar)+'" alt="'+escapeHtml((data.owner&&data.owner.login)||'GitHub')+' profile image" loading="lazy"><span class="resource-api-badge"><i class="bi bi-github"></i> LIVE GITHUB</span></div>'+
          '<div class="intro-resource-body"><span class="intro-resource-type">'+escapeHtml(label)+'</span><h3>'+escapeHtml((data.name||repo).replace(/-/g,' '))+'</h3><p>'+escapeHtml(data.description||'Open-source learning resource on GitHub.')+'</p>'+
          '<div class="intro-resource-meta"><span><i class="bi bi-star"></i> '+Number(data.stargazers_count||0).toLocaleString()+'</span><span>'+escapeHtml(data.language||'Mixed')+'</span><span>Updated '+escapeHtml(updated)+'</span></div>'+
          '<div class="intro-resource-actions"><a class="btn small" href="'+escapeHtml(data.html_url)+'" target="_blank" rel="noopener">View Resource ↗</a><a class="text-link" href="resources.html">Learning roadmap →</a></div></div>'
        );
      }).fail(function () {
        $card.removeClass('skeleton-card').find('h3').text(repo.split('/')[1].replace(/-/g,' '));
        $card.find('p').text('GitHub could not be reached right now. Open the full Resources page to continue.');
      });
  });
}

/* ============================================================
   CHALLENGES — filters, countdown, detail modal, browser saves
   ============================================================ */
function initChallengesPage() {
  if (!document.body.hasAttribute('data-challenges-page')) return;
  var filters = document.querySelectorAll('.challenge-filter');
  var cards = document.querySelectorAll('.challenge-card');
  filters.forEach(function(btn){ btn.addEventListener('click', function(){
    filters.forEach(function(b){b.classList.remove('active')}); btn.classList.add('active');
    var f=btn.getAttribute('data-challenge-filter'); cards.forEach(function(card){ card.hidden = !(f==='All'||card.dataset.category===f); });
    if(window.gsap) gsap.fromTo(Array.from(cards).filter(function(c){return !c.hidden}),{opacity:.35,y:14},{opacity:1,y:0,duration:.35,stagger:.04});
  });});
  var cd=document.getElementById('challengeCountdown');
  if(cd){ var target=new Date(cd.dataset.target).getTime(); var boxes=cd.querySelectorAll('b'); function tick(){var d=Math.max(0,target-Date.now()),vals=[Math.floor(d/86400000),Math.floor((d%86400000)/3600000),Math.floor((d%3600000)/60000),Math.floor((d%60000)/1000)]; boxes.forEach(function(b,i){b.textContent=String(vals[i]||0).padStart(2,'0')});} tick(); setInterval(tick,1000); }
  var modalEl=document.getElementById('challengeDetailModal'), modal=modalEl&&window.bootstrap?new bootstrap.Modal(modalEl):null;
  document.querySelectorAll('.challenge-detail-btn').forEach(function(btn){btn.addEventListener('click',function(){var card=btn.closest('.challenge-card'); if(!card)return; document.getElementById('challengeModalCategory').textContent=card.dataset.category; document.getElementById('challengeModalTitle').textContent=card.dataset.title; document.getElementById('challengeModalDeadline').innerHTML='<i class="bi bi-calendar3"></i> Deadline: '+escapeHtml(card.dataset.deadline); document.getElementById('challengeModalTeam').innerHTML='<i class="bi bi-people"></i> '+escapeHtml(card.dataset.team); document.getElementById('challengeModalLevel').innerHTML='<i class="bi bi-bar-chart"></i> '+escapeHtml(card.dataset.level); document.getElementById('challengeModalDescription').textContent=card.dataset.description; if(modal)modal.show();});});
  function saved(){try{return JSON.parse(localStorage.getItem('nexus_saved_challenges')||'[]')}catch(e){return[]}}
  function render(){var list=saved(); document.querySelectorAll('.challenge-save-btn').forEach(function(btn){var on=list.indexOf(btn.dataset.challengeId)>-1;btn.classList.toggle('saved',on);btn.innerHTML=on?'<i class="bi bi-bookmark-check"></i> Saved':'<i class="bi bi-bookmark"></i> Save';}); var s=document.getElementById('savedChallengeSummary');if(s)s.textContent=list.length+' saved challenge'+(list.length===1?'':'s')+' in this browser.';}
  document.querySelectorAll('.challenge-save-btn').forEach(function(btn){btn.addEventListener('click',function(){var list=saved(),id=btn.dataset.challengeId,i=list.indexOf(id);if(i>-1)list.splice(i,1);else list.push(id);localStorage.setItem('nexus_saved_challenges',JSON.stringify(list));render();});}); render();
}
