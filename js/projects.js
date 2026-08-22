/* PROJECTS PAGE: handles project quick views, favourites and card/orbit motion. */
var PROJECT_FAVOURITES_KEY = 'nexus_favorites';

// Read and validate the single existing favourites array from localStorage.
function getSavedProjectIds() {
  try {
    var stored = JSON.parse(localStorage.getItem(PROJECT_FAVOURITES_KEY) || '[]');
    if (!Array.isArray(stored)) return [];
    return stored.filter(function (id, index) {
      return clubProjects[id] && stored.indexOf(id) === index;
    });
  } catch (error) {
    return [];
  }
}

function setSavedProjectIds(ids) {
  localStorage.setItem(PROJECT_FAVOURITES_KEY, JSON.stringify(ids));
}

function savedProjectContext(project) {
  return project.challenge ? 'Hackathon Winner · ' + project.achievement : 'Club Project';
}

// Build compact cards from the shared clubProjects catalogue.
function renderSavedProjects() {
  var section = document.getElementById('savedProjectsSection');
  var grid = document.getElementById('savedProjectsGrid');
  var count = document.getElementById('savedProjectsCount');
  if (!section || !grid || !count) return;

  var ids = getSavedProjectIds();
  section.hidden = ids.length === 0;
  count.textContent = ids.length + ' SAVED';
  grid.innerHTML = ids.map(function (id) {
    var project = clubProjects[id];
    return '<article class="saved-project-card" data-saved-project="' + escapeHtml(id) + '">' +
      '<div class="saved-project-icon ' + escapeHtml(project.cover) + '"><i class="bi ' + escapeHtml(project.icon) + '"></i></div>' +
      '<div class="saved-project-copy"><span>' + escapeHtml(project.category) + '</span><h3>' + escapeHtml(project.title) + '</h3><p>' + escapeHtml(savedProjectContext(project)) + '</p></div>' +
      '<div class="saved-project-actions"><a class="text-link" href="project-detail.html?id=' + encodeURIComponent(id) + '">View Project →</a>' +
      '<button class="saved-project-remove" data-remove-saved-project="' + escapeHtml(id) + '" type="button" aria-label="Remove ' + escapeHtml(project.title) + ' from saved projects">★ Saved</button></div>' +
      '</article>';
  }).join('');
}

function toggleSavedProject(projectId) {
  var ids = getSavedProjectIds();
  ids = ids.indexOf(projectId) > -1 ? ids.filter(function (id) { return id !== projectId; }) : ids.concat(projectId);
  setSavedProjectIds(ids);
  renderSavedProjects();
  updateSavedProjectControls(projectId);
}

function updateSavedProjectControls(activeProjectId) {
  var save = document.getElementById('projectModalSave');
  if (!save || !activeProjectId) return;
  var isSaved = getSavedProjectIds().indexOf(activeProjectId) > -1;
  save.textContent = isSaved ? '★ Saved' : '☆ Save Project';
  save.classList.toggle('on', isSaved);
  save.setAttribute('aria-pressed', String(isSaved));
}

// Connect the saved collection and Quick View modal to the same favourites state.
function initProjectQuickViews() {
  var activeProjectId = '';
  var savedGrid = document.getElementById('savedProjectsGrid');
  renderSavedProjects();

  if (savedGrid) {
    savedGrid.addEventListener('click', function (event) {
      var remove = event.target.closest('[data-remove-saved-project]');
      if (!remove) return;
      toggleSavedProject(remove.getAttribute('data-remove-saved-project'));
      updateSavedProjectControls(activeProjectId);
    });
  }

  var modalEl = document.getElementById('projectQuickView');
  if (!modalEl || !window.bootstrap) return;
  var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  document.querySelectorAll('.project-quick-btn').forEach(function (btn) {
    btn.addEventListener('click', function (event) {
      event.preventDefault(); event.stopPropagation();
      var id = btn.getAttribute('data-project'); var project = clubProjects[id]; if (!project) return;
      activeProjectId = id;
      document.getElementById('projectModalTitle').textContent = project.title;
      document.getElementById('projectModalText').textContent = project.description;
      document.getElementById('projectModalStatus').textContent = project.status;
      document.getElementById('projectModalTeam').textContent = project.team;
      document.getElementById('projectModalFocus').textContent = project.focus;
      document.getElementById('projectModalTags').innerHTML = project.tags.map(function (tag) { return '<span>' + tag + '</span>'; }).join('');
      var visual = document.getElementById('projectModalVisual'); visual.className = 'project-modal-visual ' + project.cover; visual.innerHTML = '<i class="bi ' + project.icon + '"></i>';
      document.getElementById('projectModalDetails').href = 'project-detail.html?id=' + encodeURIComponent(id);
      var save = document.getElementById('projectModalSave');
      save.onclick = function () { toggleSavedProject(id); };
      updateSavedProjectControls(id);
      modal.show();
    });
  });

  window.addEventListener('storage', function (event) {
    if (event.key === PROJECT_FAVOURITES_KEY) {
      renderSavedProjects();
      updateSavedProjectControls(activeProjectId);
    }
  });
}

/* V5 interactive orbit + project motion */
(function () {
  // Add accessible orbit links and pointer-based card depth effects.
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
document.addEventListener('DOMContentLoaded', initProjectQuickViews);
