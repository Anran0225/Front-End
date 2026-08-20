/* JOIN PAGE: validates membership fields, preserves a session draft and saves a password-free local profile. */
// Initialise form validation, draft recovery and the local member profile preview.
function initJoinForm() {
  var form = document.getElementById('joinForm');
  if (!form) return;
  var status = document.getElementById('formStatus');
  var draftFields = ['name', 'email', 'aiExperience', 'interest', 'bio'];
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
    el.addEventListener('blur', function () { validateField(name, true); });
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

  password.addEventListener('input', function () { validatePassword(false); });
  confirm.addEventListener('input', function () { validatePassword(false); });
  password.addEventListener('blur', function () { validatePassword(true); });
  confirm.addEventListener('blur', function () { validatePassword(true); });

  document.querySelectorAll('[data-password-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      var input = document.getElementById(button.getAttribute('data-password-toggle')); if (!input) return;
      var show = input.type === 'password'; input.type = show ? 'text' : 'password';
      button.innerHTML = '<i class="bi ' + (show ? 'bi-eye-slash' : 'bi-eye') + '"></i>';
      button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  });

  function validateAll(showError) {
    var fieldsOK = ['name', 'email', 'aiExperience', 'interest', 'bio'].every(function (name) {
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
    wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(function () {
      try { control.focus({ preventScroll: true }); } catch (e) { control.focus(); }
      wrap.classList.remove('needs-attention');
    }, 520);
  }

  // Render only non-sensitive profile details; passwords are never stored.
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
      name: form.elements.name.value,
      email: form.elements.email.value,
      aiExperience: form.elements.aiExperience.value,
      interest: form.elements.interest.value
    });
  }
  try {
    var stored = JSON.parse(localStorage.getItem('nexus_member_profile') || 'null');
    if (stored) renderProfile(stored); else renderPreviewFromForm();
  } catch (e) { renderPreviewFromForm(); }

  ['name', 'email', 'aiExperience', 'interest', 'bio'].forEach(function (name) { validateField(name, false); });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!validateAll(true)) {
      if (status) status.textContent = '> CHECK THE HIGHLIGHTED REQUIRED FIELD.';
      guideToFirstInvalid();
      return;
    }
    var profile = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      aiExperience: form.elements.aiExperience.value,
      interest: form.elements.interest.value,
      bio: form.elements.bio.value.trim(),
      joinedAt: new Date().toISOString()
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
    form.querySelectorAll('.field').forEach(function (field) { field.classList.remove('is-valid', 'is-invalid', 'needs-attention'); });
    form.querySelectorAll('.field-error').forEach(function (err) { err.classList.remove('show'); });
    validatePassword(false); renderPreviewFromForm();
    if (status) status.textContent = '> FORM CLEARED // SAVED BROWSER PROFILE UNCHANGED.';
  });
  document.getElementById('resetBrowserProfile')?.addEventListener('click', function () {
    localStorage.removeItem('nexus_member_profile'); renderPreviewFromForm();
    if (status) status.textContent = '> SAVED BROWSER PROFILE REMOVED.';
  });
}
document.addEventListener('DOMContentLoaded', initJoinForm);
