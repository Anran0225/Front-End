function initEventsPage() {
  if (!document.body.hasAttribute('data-events-page')) return;

  var $cards = $('.event-card');
  var $filters = $('.event-filter');
  function applyFilter(filter) {
    filter = filter || 'All';
    $filters.removeClass('active').filter('[data-event-filter="' + filter + '"]').addClass('active');
    $cards.each(function () {
      var show = filter === 'All' || $(this).data('category') === filter;
      $(this).stop(true, true)[show ? 'fadeIn' : 'fadeOut'](220);
    });
  }
  $filters.on('click', function () { applyFilter($(this).data('event-filter')); });
  try {
    var fromQuery = new URLSearchParams(location.search).get('filter');
    if (fromQuery && $filters.filter('[data-event-filter="' + fromQuery + '"]').length) applyFilter(fromQuery);
  } catch (e) { }

  var countdown = document.getElementById('eventCountdown');
  var countdownCard = document.querySelector('[data-countdown-target]');
  function tickCountdown() {
    if (!countdown || !countdownCard) return;
    var target = new Date(countdownCard.getAttribute('data-countdown-target')).getTime();
    var diff = Math.max(0, target - Date.now());
    var values = [Math.floor(diff / 86400000), Math.floor(diff % 86400000 / 3600000), Math.floor(diff % 3600000 / 60000), Math.floor(diff % 60000 / 1000)];
    countdown.querySelectorAll('b').forEach(function (el, i) { el.textContent = String(values[i] || 0).padStart(2, '0'); });
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
  $(document).on('click', '.event-details-btn', function () { var card = this.closest('.event-card'); if (!card) return; fillDetail(card); if (detailModal) detailModal.show(); });

  function selectForRegistration(name) {
    var select = document.getElementById('eventRegSelect'); if (select) select.value = name || '';
    var section = document.querySelector('.event-registration-section'); if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(function () { var nameInput = document.getElementById('eventRegName'); if (nameInput) nameInput.focus({ preventScroll: true }); }, 500);
  }
  $(document).on('click', '.event-register-btn', function () { var card = this.closest('.event-card'); if (card) selectForRegistration(card.dataset.eventName); });
  var modalRegister = document.getElementById('eventModalRegister'); if (modalRegister) modalRegister.addEventListener('click', function () { selectForRegistration(selectedEvent); });

  var form = document.getElementById('eventRegisterForm');
  var status = document.getElementById('eventRegisterStatus');
  var summary = document.getElementById('eventRegistrationSummary');
  var registrationKey = document.body.getAttribute('data-registration-key') || 'nexus_event_registrations';
  function registrations() { try { return JSON.parse(localStorage.getItem(registrationKey) || '[]'); } catch (e) { return []; } }
  function updateSummary() {
    var list = registrations();
    if (summary) summary.innerHTML = '<span class="status-dot"></span><strong>' + list.length + ' saved registration' + (list.length === 1 ? '' : 's') + '</strong>' + (list.length ? '<small>Latest: ' + escapeHtml(list[list.length - 1].event) + '</small>' : '<small>Register for an event to demonstrate localStorage.</small>');
  }
  updateSummary();
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = { name: form.elements.name.value.trim(), studentId: form.elements.studentId.value.trim(), email: form.elements.email.value.trim(), event: form.elements.event.value, registeredAt: new Date().toISOString() };
      if (!data.name || !data.studentId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || !data.event) { if (status) status.textContent = '> CHECK REQUIRED FIELDS BEFORE SAVING.'; return; }
      var list = registrations();
      var duplicate = list.some(function (item) { return item.studentId === data.studentId && item.event === data.event; });
      if (!duplicate) { list.push(data); localStorage.setItem(registrationKey, JSON.stringify(list)); }
      if (status) status.textContent = duplicate ? '> ALREADY REGISTERED // saved record found.' : '> SUCCESS // REGISTRATION SAVED TO LOCALSTORAGE.';
      updateSummary();
      if (window.gsap) gsap.fromTo(summary, { scale: .97 }, { scale: 1, duration: .35, ease: 'back.out(2)' });
    });
    form.addEventListener('reset', function () { window.setTimeout(function () { if (status) status.textContent = '> FORM CLEARED // saved registrations unchanged.'; }, 0); });
  }
}
document.addEventListener('DOMContentLoaded', initEventsPage);
