/* CHALLENGES PAGE: manages filters, countdown, detail modal and locally saved challenges. */
// Initialise challenge filtering, deadline countdown, modal details and saves.
function initChallengesPage() {
  if (!document.body.hasAttribute('data-challenges-page')) return;
  var filters = document.querySelectorAll('.challenge-filter');
  var cards = document.querySelectorAll('.challenge-card');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (b) { b.classList.remove('active') }); btn.classList.add('active');
      var f = btn.getAttribute('data-challenge-filter'); cards.forEach(function (card) { card.hidden = !(f === 'All' || card.dataset.category === f); });
      if (window.gsap) gsap.fromTo(Array.from(cards).filter(function (c) { return !c.hidden }), { opacity: .35, y: 14 }, { opacity: 1, y: 0, duration: .35, stagger: .04 });
    });
  });
  var cd = document.getElementById('challengeCountdown');
  if (cd) { var target = new Date(cd.dataset.target).getTime(); var boxes = cd.querySelectorAll('b'); function tick() { var d = Math.max(0, target - Date.now()), vals = [Math.floor(d / 86400000), Math.floor((d % 86400000) / 3600000), Math.floor((d % 3600000) / 60000), Math.floor((d % 60000) / 1000)]; boxes.forEach(function (b, i) { b.textContent = String(vals[i] || 0).padStart(2, '0') }); } tick(); setInterval(tick, 1000); }
  var modalEl = document.getElementById('challengeDetailModal'), modal = modalEl && window.bootstrap ? new bootstrap.Modal(modalEl) : null;
  document.querySelectorAll('.challenge-detail-btn').forEach(function (btn) { btn.addEventListener('click', function () { var card = btn.closest('.challenge-card'); if (!card) return; document.getElementById('challengeModalCategory').textContent = card.dataset.category; document.getElementById('challengeModalTitle').textContent = card.dataset.title; document.getElementById('challengeModalDeadline').innerHTML = '<i class="bi bi-calendar3"></i> Deadline: ' + escapeHtml(card.dataset.deadline); document.getElementById('challengeModalTeam').innerHTML = '<i class="bi bi-people"></i> ' + escapeHtml(card.dataset.team); document.getElementById('challengeModalLevel').innerHTML = '<i class="bi bi-bar-chart"></i> ' + escapeHtml(card.dataset.level); document.getElementById('challengeModalDescription').textContent = card.dataset.description; if (modal) modal.show(); }); });
  // Read the visitor's saved challenge IDs from localStorage safely.
  function saved() { try { return JSON.parse(localStorage.getItem('nexus_saved_challenges') || '[]') } catch (e) { return [] } }
  // Synchronise Save buttons and the saved-challenge summary.
  function render() { var list = saved(); document.querySelectorAll('.challenge-save-btn').forEach(function (btn) { var on = list.indexOf(btn.dataset.challengeId) > -1; btn.classList.toggle('saved', on); btn.innerHTML = on ? '<i class="bi bi-bookmark-check"></i> Saved' : '<i class="bi bi-bookmark"></i> Save'; }); var s = document.getElementById('savedChallengeSummary'); if (s) s.textContent = list.length + ' saved challenge' + (list.length === 1 ? '' : 's') + ' in this browser.'; }
  document.querySelectorAll('.challenge-save-btn').forEach(function (btn) { btn.addEventListener('click', function () { var list = saved(), id = btn.dataset.challengeId, i = list.indexOf(id); if (i > -1) list.splice(i, 1); else list.push(id); localStorage.setItem('nexus_saved_challenges', JSON.stringify(list)); render(); }); }); render();
}
document.addEventListener('DOMContentLoaded', initChallengesPage);
