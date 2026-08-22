/* AI INTRO PAGE: controls the ecosystem orbit, technology explorer, AI workflow, use cases and GitHub resource previews. */
(function () {
  // Position each ecosystem node around the orbit while keeping its label upright.
  function initUprightOrbit() {
    var stage = document.querySelector('.ai-orbit-stage');
    var track = stage && stage.querySelector('.ai-orbit-track-single');
    if (!stage || !track) return;
    var nodes = Array.from(track.querySelectorAll('.ai-orbit-node'));
    if (!nodes.length) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var bases = nodes.map(function (node, index) {
      var raw = getComputedStyle(node).getPropertyValue('--angle').trim();
      var n = parseFloat(raw); return Number.isFinite(n) ? n : index * (360 / nodes.length);
    });
    var phase = 0, last = performance.now(), speed = 360 / 32000;
    function layout(now) {
      var dt = Math.min(60, now - last); last = now;
      if (!reduce && !stage.classList.contains('orbit-paused')) phase = (phase + dt * speed) % 360;
      var radius = track.clientWidth / 2;
      nodes.forEach(function (node, i) {
        var a = (bases[i] + phase) * Math.PI / 180;
        var x = Math.cos(a) * radius, y = Math.sin(a) * radius;
        node.style.transform = 'translate(-50%, -50%) translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px)';
      });
      if (!reduce) requestAnimationFrame(layout);
    }
    if (reduce) { layout(performance.now()); } else { requestAnimationFrame(layout); }
    window.addEventListener('resize', function () { if (reduce) layout(performance.now()); });
  }

  // Curated content displayed by the interactive AI technology tabs.
  var techData={
    ml:{
      videoId:'znF2U_3Z210',
      videoTitle:'Machine Learning Explained: A Guide to ML, AI, & Deep Learning',
      videoSource:'IBM Technology',
      videoUrl:'https://www.youtube.com/watch?v=znF2U_3Z210',
      title:'Machine Learning',
      summary:'Systems learn patterns from examples instead of being programmed with a rule for every situation.',
      how:'Data → Training → Model → Prediction',
      facts:['Predict house prices from past data','Python · scikit-learn · pandas','Classification or recommendation system']
    },
    deep:{
      videoId:'Beh13Cd_QbY',
      videoTitle:'Machine Learning vs. Deep Learning vs. Foundation Models',
      videoSource:'IBM Technology',
      videoUrl:'https://www.youtube.com/watch?v=Beh13Cd_QbY',
      title:'Deep Learning',
      summary:'Deep learning uses neural networks with many layers to learn complex patterns from large amounts of data.',
      how:'Large datasets → Neural layers → Features → Prediction',
      facts:['Recognise objects in images','PyTorch · TensorFlow · GPUs','Image classifier or speech recogniser']
    },
    gen:{
      videoId:'qYNweeDHiyU',
      videoTitle:'What Are AI, ML, DL, and Generative AI?',
      videoSource:'IBM Technology',
      videoUrl:'https://www.youtube.com/watch?v=qYNweeDHiyU',
      title:'Generative AI',
      summary:'Generative AI creates new text, images, audio, video or code by learning patterns from existing examples.',
      how:'Prompt → Model context → Generation → Review',
      facts:['Generate a study explanation or image','LLMs · diffusion models · prompts','Campus assistant or content generator']
    },
    vision:{
      videoId:'lOD_EE96jhM',
      videoTitle:'What Are Vision Language Models? How AI Sees & Understands Images',
      videoSource:'IBM Technology',
      videoUrl:'https://www.youtube.com/watch?v=lOD_EE96jhM',
      title:'Computer Vision',
      summary:'Computer Vision helps machines interpret visual information such as images, video frames and camera streams.',
      how:'Image → Feature detection → Recognition → Action',
      facts:['Detect vehicles or recognise objects','OpenCV · YOLO · CNNs','Smart attendance or object detector']
    },
    nlp:{
      videoId:'fLvJ8VdHLA0',
      videoTitle:'What is NLP (Natural Language Processing)?',
      videoSource:'IBM Technology',
      videoUrl:'https://www.youtube.com/watch?v=fLvJ8VdHLA0',
      title:'Natural Language Processing',
      summary:'NLP enables software to analyse, understand and generate human language.',
      how:'Text → Tokens → Language model → Meaning / response',
      facts:['Classify feedback or answer questions','Transformers · embeddings · tokenisation','FAQ bot or sentiment analyser']
    },
    rl:{
      videoId:'Z-T0iJEXiwM',
      videoTitle:'Reinforcement Learning: Essential Concepts',
      videoSource:'StatQuest with Josh Starmer',
      videoUrl:'https://www.youtube.com/watch?v=Z-T0iJEXiwM',
      title:'Reinforcement Learning',
      summary:'Reinforcement Learning trains an agent to choose better actions by learning from rewards and penalties while interacting with an environment.',
      how:'State → Action → Reward → Policy update',
      facts:['Train an agent to balance a pole or play a simple game','Python · Gymnasium · Stable-Baselines3','CartPole agent or grid-world navigation']
    }
  };


  // Replace the selected technology video, explanation and example facts.
   function initTechExplorer(){
    var detail=document.getElementById('aiTechDetail'); if(!detail) return;
    var buttons=[].slice.call(document.querySelectorAll('.ai-tech-tab'));
    var video=detail.querySelector('#aiTechVideo');
    var videoLink=detail.querySelector('#aiTechVideoLink');
    var videoSource=detail.querySelector('#aiTechVideoSource');
    var how=detail.querySelector('#aiTechHow');
    function activate(btn){
      buttons.forEach(function(b){b.classList.remove('active');b.setAttribute('aria-selected','false')});
      btn.classList.add('active');btn.setAttribute('aria-selected','true');
      var d=techData[btn.dataset.tech];if(!d)return;
      if(video){
        video.src='https://www.youtube-nocookie.com/embed/'+d.videoId+'?rel=0';
        video.title=d.videoTitle;
      }
      if(videoLink){videoLink.href=d.videoUrl;videoLink.setAttribute('aria-label','Watch '+d.videoTitle+' on YouTube');}
      if(videoSource) videoSource.textContent=d.videoSource;
      detail.querySelector('h3').textContent=d.title;
      detail.querySelector('.ai-tech-summary').textContent=d.summary;
      if(how) how.textContent=d.how;
      detail.querySelectorAll('.ai-tech-facts strong').forEach(function(el,i){el.textContent=d.facts[i]});
      if(window.gsap){
        gsap.fromTo(detail,{opacity:.72,y:10},{opacity:1,y:0,duration:.34,ease:'power2.out'});
        if(video) gsap.fromTo(video.closest('.tech-video-frame'),{opacity:.45,scale:.985},{opacity:1,scale:1,duration:.42,ease:'power2.out'});
      }
    }
    buttons.forEach(function(btn){
      btn.addEventListener('click',function(){activate(btn)});
      btn.addEventListener('focus',function(){if(!btn.classList.contains('active'))activate(btn)});
    });
  }

  // Explanations for the four clickable stages of a basic AI workflow.
  var flowData = {
    data: ['01 · Data', 'AI starts with examples such as text, images, sensor readings or labelled records. Better-quality data usually produces more useful learning.'],
    train: ['02 · Training', 'During training, an algorithm adjusts internal parameters so its outputs become closer to the desired pattern or objective.'],
    model: ['03 · Model', 'The trained model stores the learned relationships. It is not a database of perfect answers; it is a mathematical system that estimates useful outputs.'],
    output: ['04 · Output', 'During inference, the model uses new input to produce a prediction, classification, recommendation or generated result.']
  };
  // Show the explanation that belongs to the selected workflow stage.
  function initFlow() { var box = document.getElementById('aiFlowExplain'); if (!box) return; document.querySelectorAll('.ai-flow-step').forEach(function (btn) { btn.addEventListener('click', function () { document.querySelectorAll('.ai-flow-step').forEach(function (b) { b.classList.remove('active') }); btn.classList.add('active'); var d = flowData[btn.dataset.flow]; box.querySelector('strong').textContent = d[0]; box.querySelector('p').textContent = d[1]; if (window.gsap) gsap.fromTo(box, { opacity: .55, x: -8 }, { opacity: 1, x: 0, duration: .25 }) }) }) }

  // Real-world AI examples and fallback images for each application area.
  var cases = {
    education: ['https://images.unsplash.com/photo-1758270705317-3ef6142d306f?auto=format&fit=crop&w=1400&q=80', 'University students collaborating around a laptop', 'Education', 'Personalised learning and study support', 'AI can recommend practice material, summarise difficult content and help students receive feedback at their own pace.', 'Example: adaptive quiz recommendations based on previous answers.', 'assets/ai-visuals/usecase-education.svg'],
    health: ['https://images.unsplash.com/photo-1758691461932-d0aa0ebf6b31?auto=format&fit=crop&w=1400&q=80', 'Doctor consulting a patient through a laptop', 'Healthcare', 'Assist clinicians with patterns in medical data', 'AI can help analyse scans, prioritise cases and identify patterns, while qualified professionals remain responsible for decisions.', 'Example: highlighting suspicious regions in medical images for review.', 'assets/ai-visuals/usecase-health.svg'],
    finance: ['https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?auto=format&fit=crop&w=1400&q=80', 'Stock-market chart displayed on a laptop', 'Finance', 'Detect patterns, risk and unusual activity', 'Financial systems use machine learning for fraud detection, credit-risk support and market analysis.', 'Example: flagging a transaction that differs strongly from normal behaviour.', 'assets/ai-visuals/usecase-finance.svg'],
    creative: ['https://images.unsplash.com/photo-1753164597967-b41945a05e89?auto=format&fit=crop&w=1400&q=80', 'Designer working with a laptop in a creative studio', 'Creative Work', 'Generate and refine ideas across media', 'Generative AI can support writing, images, audio, video and design ideation when users provide clear goals and evaluate outputs.', 'Example: generating concept variations for a campaign poster.', 'assets/ai-visuals/usecase-creative.svg'],
    campus: ['https://images.unsplash.com/photo-1753613648120-d2c8d1d49002?auto=format&fit=crop&w=1400&q=80', 'University student working on a laptop in a library', 'Smart Campus', 'Use AI to improve campus services', 'AI can support scheduling, smart facilities, student services and campus operations when privacy and responsible-use requirements are considered.', 'Example: an FAQ assistant that routes students to the correct university service.', 'assets/ai-visuals/usecase-campus.svg']
  };
  // Update the real-world use-case panel when a category is selected.
  function initUsecases(){
    var panel=document.getElementById('aiUsecasePanel');if(!panel)return;
    document.querySelectorAll('.ai-usecase-tab').forEach(function(btn){
      btn.addEventListener('click',function(){
        document.querySelectorAll('.ai-usecase-tab').forEach(function(b){b.classList.remove('active')});
        btn.classList.add('active');
        var d=cases[btn.dataset.case];
        var img=panel.querySelector('#aiUsecaseImage');
        if(img){
          img.onerror=function(){img.onerror=null;img.src=d[6];};
          img.src=d[0];
          img.alt=d[1];
        }
        panel.querySelector('.tag').textContent=d[2];
        panel.querySelector('h3').textContent=d[3];
        panel.querySelector('p').textContent=d[4];
        panel.querySelector('small').textContent=d[5];
        if(window.gsap){
          gsap.fromTo(panel,{opacity:.62,y:8},{opacity:1,y:0,duration:.3});
          if(img) gsap.fromTo(img,{opacity:.3,scale:1.03},{opacity:1,scale:1,duration:.4});
        }
      })
    })
  }
  // Start all interactive AI Intro components after the document is ready.
  function init() { initUprightOrbit(); initTechExplorer(); initFlow(); initUsecases(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
// Load curated public GitHub learning repositories into the Explore More cards.
function initIntroResourcePreview() {
  var grid = document.getElementById('introResourceGrid');
  if (!grid || typeof window.jQuery === 'undefined') return;
  $(grid).find('.intro-resource-card[data-repo]').each(function () {
    var $card = $(this), repo = $card.data('repo'), label = $card.data('label') || 'Resource';
    $.ajax({ url: 'https://api.github.com/repos/' + repo, method: 'GET', dataType: 'json', timeout: 10000 })
      .done(function (data) {
        var updated = data.updated_at ? new Date(data.updated_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently';
        var avatar = data.owner && data.owner.avatar_url ? data.owner.avatar_url : 'assets/nexus-motion-poster.jpg';
        $card.removeClass('skeleton-card').html(
          '<div class="intro-resource-media"><img src="' + escapeHtml(avatar) + '" alt="' + escapeHtml((data.owner && data.owner.login) || 'GitHub') + ' profile image" loading="lazy"><span class="resource-api-badge"><i class="bi bi-github"></i> LIVE GITHUB</span></div>' +
          '<div class="intro-resource-body"><span class="intro-resource-type">' + escapeHtml(label) + '</span><h3>' + escapeHtml((data.name || repo).replace(/-/g, ' ')) + '</h3><p>' + escapeHtml(data.description || 'Open-source learning resource on GitHub.') + '</p>' +
          '<div class="intro-resource-meta"><span><i class="bi bi-star"></i> ' + Number(data.stargazers_count || 0).toLocaleString() + '</span><span>' + escapeHtml(data.language || 'Mixed') + '</span><span>Updated ' + escapeHtml(updated) + '</span></div>' +
          '<div class="intro-resource-actions"><a class="btn small" href="' + escapeHtml(data.html_url) + '" target="_blank" rel="noopener">View Resource ↗</a><a class="text-link" href="resources.html">Learning roadmap →</a></div></div>'
        );
      }).fail(function () {
        $card.removeClass('skeleton-card').find('h3').text(repo.split('/')[1].replace(/-/g, ' '));
        $card.find('p').text('GitHub could not be reached right now. Open the full Resources page to continue.');
      });
  });
}
/* Pause the ecosystem animation while a tool is being inspected or opened. */
(function () {
  function initOrbitLinks() {
    var stage = document.querySelector('.ai-orbit-stage');
    if (stage) {
      stage.querySelectorAll('.ai-orbit-node').forEach(function (node) {
        node.addEventListener('mouseenter', function () { stage.classList.add('orbit-paused'); });
        node.addEventListener('mouseleave', function () { stage.classList.remove('orbit-paused'); });
        node.addEventListener('focus', function () { stage.classList.add('orbit-paused'); });
        node.addEventListener('blur', function () { stage.classList.remove('orbit-paused'); });
        node.addEventListener('click', function () {
          var url = node.getAttribute('data-url');
          if (url) window.location.assign(url);
        });
        node.addEventListener('keydown', function (event) {
          if ((event.key === 'Enter' || event.key === ' ') && node.getAttribute('data-url')) {
            event.preventDefault();
            window.location.assign(node.getAttribute('data-url'));
          }
        });
      });
    }

  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initOrbitLinks);
  else initOrbitLinks();
})();
document.addEventListener('DOMContentLoaded', initIntroResourcePreview);
