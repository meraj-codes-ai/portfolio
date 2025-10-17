(function(){
  // Back to top
  var backBtn = document.getElementById('back-to-top');
  function onScroll(){
    if (!backBtn) return;
    if (window.scrollY > 400) {
      backBtn.style.display = 'flex';
    } else {
      backBtn.style.display = 'none';
    }
  }
  if (backBtn) {
    backBtn.addEventListener('click', function(){
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();

// Make repository cards fully clickable and accessible
(function(){
  var repo = document.getElementById('repo');
  if (!repo) return;
  var cards = repo.querySelectorAll('.white_bg');
  cards.forEach(function(card){
    var link = card.querySelector('a[href]');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href || href.trim() === '#') return;
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', function(e){
      // Avoid double navigation if inner link clicked
      if (e.target.closest('a')) return;
      var target = link.getAttribute('target');
      if (target === '_blank') {
        window.open(href, link.getAttribute('target') || '_self');
      } else {
        window.location.href = href;
      }
    });
    card.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        link.click();
      }
    });

    // Improve image alt using the card title if generic
    var title = card.querySelector('h4');
    var img = card.querySelector('img');
    if (title && img) {
      var currentAlt = (img.getAttribute('alt') || '').trim().toLowerCase();
      if (!currentAlt || currentAlt === 'repository') {
        img.setAttribute('alt', title.textContent.trim());
      }
    }
  });
})();

// Highlight active nav link on scroll
(function(){
  var nav = document.getElementById('navbarSupportedContent');
  if (!nav || !('IntersectionObserver' in window)) return;
  var links = Array.prototype.slice.call(nav.querySelectorAll('a.nav-link[href^="#"]'));
  if (!links.length) return;

  var linkMap = new Map();
  links.forEach(function(a){
    var id = a.getAttribute('href').slice(1);
    var sec = document.getElementById(id);
    if (sec) linkMap.set(sec, a);
  });
  if (!linkMap.size) return;

  var options = { root: null, rootMargin: '0px', threshold: 0.55 };
  var current;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      var a = linkMap.get(entry.target);
      if (!a) return;
      if (entry.isIntersecting) {
        if (current) current.classList.remove('active');
        a.classList.add('active');
        current = a;
      }
    });
  }, options);

  linkMap.forEach(function(_, sec){ io.observe(sec); });
})();
