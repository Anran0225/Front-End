/* PROJECT DETAIL PAGE: renders club project records or live public GitHub repository information. */
// Convert a list of labels into the tag markup used by the detail page.
function detailTags(tags) { return (tags || []).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join(''); }
// Select club data or GitHub API data according to the URL query parameters.
function initProjectDetailPage() {
  if (!document.body.hasAttribute('data-project-detail')) return;
  var params = new URLSearchParams(location.search); var repoName = params.get('repo'); var id = params.get('id');
  if (repoName) loadRepositoryDetail(repoName); else renderClubProjectDetail(clubProjects[id] || clubProjects.studybuddy, id || 'studybuddy');
}

// Populate the detail layout for an internally defined club project.
function renderClubProjectDetail(project, id) {
  document.title = project.title + ' | AI AWS Club';
  $('#detailTitle').text(project.title); $('#detailSubtitle').text(project.category + ' · ' + project.focus); $('#detailDescription').text(project.description);
  $('#detailTags').html(detailTags(project.tags)); $('#detailTech').html(detailTags(project.tech));
  var isChallengeWinner = !!project.challenge;
  $('#projectContextGrid').toggle(isChallengeWinner);
  $('#detailChallengeBack').toggle(isChallengeWinner);
  if (isChallengeWinner) {
    $('#detailChallenge').text(project.challenge); $('#detailAchievement').text(project.achievement);
    $('#detailProblem').text(project.problem); $('#detailSolution').text(project.solution); $('#detailLearning').text(project.learning);
  }
  $('#detailInlineMeta').html('<span><i class="status-dot"></i>' + escapeHtml(project.status) + '</span><span><i class="bi bi-people"></i>' + escapeHtml(project.team) + '</span><span><i class="bi bi-star"></i>Featured club concept</span>');
  $('#detailFeatures').html(project.features.map(function (f) { return '<div class="detail-feature"><i class="bi bi-check2-circle"></i><span>' + escapeHtml(f) + '</span></div>'; }).join(''));
  $('#detailContributors').html(project.contributors.map(function (c, i) { return '<div class="detail-person"><span class="detail-avatar">' + escapeHtml(c.charAt(0)) + '</span><div><strong>' + escapeHtml(c) + '</strong><small>' + (i === 0 ? 'Lead contributor' : 'Project contributor') + '</small></div></div>'; }).join(''));
  $('#detailData').html('<div><span>Type</span><strong>' + (isChallengeWinner ? 'Hackathon winner' : 'Club project concept') + '</strong></div><div><span>Category</span><strong>' + escapeHtml(project.category) + '</strong></div><div><span>Saved locally</span><strong>localStorage</strong></div>');
  $('#detailGithub').attr('href', 'https://github.com/Anran0225/Front-End').html('<i class="bi bi-github"></i> Website source on GitHub');

  // Project concept video: fixed curated YouTube video, no YouTube API key required.
  if (project.videoId) {
    $('#projectDemoPanel').show();
    $('#detailVideoDescription').text(project.videoDescription || 'Watch a related video to understand the project concept.');
    $('#detailVideo').attr('src', 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(project.videoId) + '?rel=0');
    $('#detailYoutubeLink').attr('href', 'https://www.youtube.com/watch?v=' + encodeURIComponent(project.videoId));
  } else {
    $('#projectDemoPanel').hide();
  }

  $('#projectDetailHero').addClass(project.cover);
}

// Fetch and render public repository metadata through the GitHub REST API.
function loadRepositoryDetail(repoName) {
  $('#projectContextGrid').hide();
  $('#detailChallengeBack').hide();
  $('#projectDemoPanel').hide();
  $('#detailVideo').attr('src', '');
  $('#detailTitle').text('Loading ' + repoName + '…');
  $.ajax({ url: 'https://api.github.com/repos/' + repoName, dataType: 'json', timeout: 10000 }).done(function (repo) {
    document.title = repo.name + ' | GitHub Project Detail';
    $('#detailTitle').text(repo.name); $('#detailSubtitle').text(repo.full_name); $('#detailDescription').text(repo.description || 'No repository description provided.');
    $('#detailTags').html(detailTags((repo.topics || []).slice(0, 4).length ? (repo.topics || []).slice(0, 4) : ['Open source', 'GitHub API']));
    $('#detailTech').html(detailTags([repo.language || 'Mixed'].concat((repo.topics || []).slice(0, 5))));
    $('#detailInlineMeta').html('<span><i class="status-dot"></i>LIVE GITHUB DATA</span><span><i class="bi bi-star"></i>' + repo.stargazers_count.toLocaleString() + ' stars</span><span><i class="bi bi-diagram-2"></i>' + repo.forks_count.toLocaleString() + ' forks</span>');
    $('#detailFeatures').html(['Public repository metadata', 'Live star and fork counts', 'Direct GitHub source access', 'API-powered detail page'].map(function (f) { return '<div class="detail-feature"><i class="bi bi-check2-circle"></i><span>' + f + '</span></div>'; }).join(''));
    $('#detailContributors').html('<div class="detail-person"><img class="detail-avatar image" src="' + escapeHtml(repo.owner.avatar_url) + '" alt=""><div><strong>' + escapeHtml(repo.owner.login) + '</strong><small>Repository owner</small></div></div>');
    var updated = new Date(repo.updated_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
    $('#detailData').html('<div><span>Primary language</span><strong>' + escapeHtml(repo.language || 'N/A') + '</strong></div><div><span>Open issues</span><strong>' + repo.open_issues_count.toLocaleString() + '</strong></div><div><span>Updated</span><strong>' + escapeHtml(updated) + '</strong></div>');
    $('#detailGithub').attr('href', repo.html_url).html('<i class="bi bi-github"></i> View on GitHub');
    $('#projectDetailHero').css('background-image', 'linear-gradient(90deg,rgba(13,17,23,.96),rgba(13,17,23,.68)),url("https://opengraph.githubassets.com/1/' + encodeURI(repo.full_name) + '")');
  }).fail(function () { $('#detailTitle').text('Project could not be loaded'); $('#detailSubtitle').text('The GitHub API may be rate-limited.'); $('#detailDescription').text('Return to the Projects page and try again shortly.'); });
}
document.addEventListener('DOMContentLoaded', initProjectDetailPage);
