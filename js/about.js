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
document.addEventListener('DOMContentLoaded', initAboutCounters);
