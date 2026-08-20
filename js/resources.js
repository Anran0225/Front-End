/* RESOURCES PAGE: manages learning stages, GitHub recommendations, progress and saved resources. */
// Initialise the staged learning roadmap and its GitHub resource recommendations.
function initLearningResources() {
  if (!document.getElementById('learningRoadmap')) return;

  // Five fixed learning tracks, each with a sequence and curated repositories.
  var stages = [
    { slug: 'ai-fundamentals', title: 'AI Fundamentals', level: 'Beginner', description: 'Build a responsible foundation before choosing a specialised AI area.', sequence: ['What is AI? · Video', 'Basic AI concepts · Article', 'Data and AI · Documentation', 'Responsible AI · Tutorial', 'First AI experiment · Practice'], repositories: ['microsoft/AI-For-Beginners', 'microsoft/Data-Science-For-Beginners', 'microsoft/generative-ai-for-beginners'] },
    { slug: 'machine-learning', title: 'Machine Learning', level: 'Beginner → Intermediate', description: 'Learn the path from Python and training data to a working classification or regression model.', sequence: ['Machine Learning Basics · Video', 'Python for Data · Tutorial', 'Training Data · Notebook', 'Classification & Regression · Course', 'Build a Simple ML Model · Practice'], repositories: ['microsoft/ML-For-Beginners', 'ageron/handson-ml3', 'scikit-learn/scikit-learn'] },
    { slug: 'generative-ai', title: 'Generative AI & LLM', level: 'Beginner → Intermediate', description: 'Understand generative models, practise prompts and connect an AI model to a simple application.', sequence: ['Generative AI Basics · Video', 'Prompt Engineering · Practice', 'How LLMs Work · Article', 'APIs and AI Applications · Documentation', 'Build a Simple AI Assistant · GitHub'], repositories: ['microsoft/generative-ai-for-beginners', 'dair-ai/Prompt-Engineering-Guide', 'openai/openai-cookbook'] },
    { slug: 'computer-vision', title: 'Computer Vision', level: 'Intermediate', description: 'Move from image basics to classification, object detection and a CampusEye-style prototype.', sequence: ['Computer Vision Basics · Video', 'Image Classification · Tutorial', 'Object Detection · Course', 'OpenCV & Vision Tools · Documentation', 'Build a Vision Project · Practice'], repositories: ['microsoft/AI-For-Beginners', 'opencv/opencv', 'ultralytics/ultralytics'] },
    { slug: 'agentic-ai', title: 'Agentic AI', level: 'Intermediate', description: 'Learn how agents translate a user goal into plans, tool calls, actions and evaluated results.', sequence: ['What Is an AI Agent? · Article', 'Goals and Planning · Tutorial', 'Tool Use · Documentation', 'Multi-Step Workflows · GitHub', 'Build a Simple Agent · Practice'], repositories: ['microsoft/ai-agents-for-beginners', 'openai/openai-agents-python', 'microsoft/autogen'] }
  ];
  var storedSlug = localStorage.getItem('nexus_learning_stage');
  var currentStage = Math.max(0, stages.findIndex(function (stage) { return stage.slug === storedSlug; }));
  var requestedTrack = new URLSearchParams(window.location.search).get('track');
  var requestedIndex = stages.findIndex(function (stage) { return stage.slug === requestedTrack; });
  if (requestedIndex > -1) currentStage = requestedIndex;
  var completedCount = Math.min(5, Math.max(0, Number(localStorage.getItem('nexus_learning_completed')) || 0));
  var latestResources = [];

  function esc(value) { return $('<div>').text(value == null ? '' : String(value)).html(); }
  // Read saved resources from localStorage and recover safely from invalid data.
  function savedResources() { try { return JSON.parse(localStorage.getItem('nexus_saved_resources') || '[]'); } catch (e) { return []; } }
  function persistProgress() { localStorage.setItem('nexus_learning_stage', stages[currentStage].slug); localStorage.setItem('nexus_learning_completed', String(completedCount)); }
  function stars(value) { return value >= 1000 ? (value / 1000).toFixed(value >= 10000 ? 0 : 1) + 'K' : String(value); }

  // Update the active track, progress display and recommended repositories.
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
    $('#trackSequence').html(stage.sequence.map(function (step, index) { return '<li><b>' + String(index + 1).padStart(2, '0') + '</b><span>' + esc(step) + '</span></li>'; }).join(''));
    sessionStorage.setItem('nexus_session_learning_interest', stage.slug);
    $('#completeStage').prop('disabled', completedCount === 5).text(completedCount === 5 ? 'Journey completed ✓' : 'Mark step complete');
    $('#githubStatus,#githubResult').empty();
  }
  function renderRecommendations(items) {
    var saved = savedResources();
    var html = items.map(function (repo, index) {
      var isSaved = saved.some(function (item) { return item.id === repo.id; });
      var updated = new Date(repo.updated_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
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
  // Display resources the visitor previously saved in this browser.
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
    var requests = stage.repositories.map(function (repository) { return $.ajax({ url: 'https://api.github.com/repos/' + repository, method: 'GET', dataType: 'json', timeout: 10000 }); });
    $.when.apply($, requests).done(function () { latestResources = Array.prototype.map.call(arguments, function (response) { return response[0]; }); $('#githubStatus').text('> SUCCESS // 3 FIXED RESOURCES LOADED'); renderRecommendations(latestResources); })
      .fail(function (xhr) { var msg = xhr.status === 403 || xhr.status === 429 ? 'GitHub public API rate limit reached. Try again later.' : 'Unable to load assigned resources. Check your connection.'; $('#githubStatus').empty(); $('#githubResult').html('<div class="api-error">> ERROR // ' + msg + '</div>'); })
      .always(function () { $button.prop('disabled', false).text('LOAD ASSIGNED RESOURCES'); });
  });
  $(document).on('click', '.save-resource', function () { var repo = latestResources[Number($(this).data('resource'))]; if (!repo) return; var saved = savedResources(); var exists = saved.some(function (item) { return item.id === repo.id; }); saved = exists ? saved.filter(function (item) { return item.id !== repo.id; }) : saved.concat([{ id: repo.id, name: repo.name.replace(/-/g, ' '), url: repo.html_url }]); localStorage.setItem('nexus_saved_resources', JSON.stringify(saved)); renderRecommendations(latestResources); renderSaved(); });
  $(document).on('click', '.remove-saved', function () { var id = Number($(this).data('id')); localStorage.setItem('nexus_saved_resources', JSON.stringify(savedResources().filter(function (item) { return item.id !== id; }))); renderSaved(); if (latestResources.length) renderRecommendations(latestResources); });
  renderStage(); renderSaved();
}

document.addEventListener('DOMContentLoaded', initLearningResources);
