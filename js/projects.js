/* PROJECTS PAGE: handles project quick views, favourites and card/orbit motion. */
// Connect each Quick View button to the shared project catalogue and modal.
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
      document.getElementById('projectModalTags').innerHTML = project.tags.map(function (tag) { return '<span>' + tag + '</span>'; }).join('');
      var visual = document.getElementById('projectModalVisual'); visual.className = 'project-modal-visual ' + project.cover; visual.innerHTML = '<i class="bi ' + project.icon + '"></i>';
      document.getElementById('projectModalDetails').href = 'project-detail.html?id=' + encodeURIComponent(id);
      var save = document.getElementById('projectModalSave');
      // Keep the modal favourite button consistent with localStorage.
      function syncSave() { var favs = JSON.parse(localStorage.getItem('nexus_favorites') || '[]'); var on = favs.indexOf(id) > -1; save.textContent = on ? '★ Saved' : '☆ Save project'; save.classList.toggle('on', on); }
      save.onclick = function () { var favs = JSON.parse(localStorage.getItem('nexus_favorites') || '[]'); favs = favs.indexOf(id) > -1 ? favs.filter(function (x) { return x !== id; }) : favs.concat(id); localStorage.setItem('nexus_favorites', JSON.stringify(favs)); syncSave(); };
      syncSave(); modal.show();
    });
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
