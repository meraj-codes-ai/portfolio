(function(){
  var body = document.body;
  if (!body || !body.classList.contains('ai-future-theme')) return;

  var toggle = document.getElementById('theme-toggle');
  var storageKey = 'site-theme';
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  function setTheme(theme) {
    body.setAttribute('data-theme', theme);
    if (toggle) {
      var isDark = theme === 'dark';
      toggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  var savedTheme = null;
  try {
    savedTheme = window.localStorage.getItem(storageKey);
  } catch (e) {}

  setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

  if (toggle) {
    toggle.addEventListener('click', function(){
      var nextTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(nextTheme);
      try {
        window.localStorage.setItem(storageKey, nextTheme);
      } catch (e) {}
    });
  }
})();

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

// Selected work tabs
(function(){
  var root = document.getElementById('portfolio');
  if (!root) return;
  var tabs = root.querySelectorAll('.project_tab');
  var panels = root.querySelectorAll('.project_panel');
  if (!tabs.length || !panels.length) return;

  function activateTab(tab) {
    var targetId = tab.getAttribute('data-project-target');
    tabs.forEach(function(item){
      var active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    panels.forEach(function(panel){
      var active = panel.id === targetId;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
  }

  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      activateTab(tab);
    });
    tab.addEventListener('keydown', function(e){
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var list = Array.prototype.slice.call(tabs);
      var index = list.indexOf(tab);
      var nextIndex = e.key === 'ArrowRight'
        ? (index + 1) % list.length
        : (index - 1 + list.length) % list.length;
      list[nextIndex].focus();
      activateTab(list[nextIndex]);
    });
  });
})();

// Tools page: AI model directory filters
(function(){
  var grid = document.getElementById('model-grid');
  if (!grid) return;

  var provider = document.getElementById('model-provider-filter');
  var type = document.getElementById('model-type-filter');
  var runtime = document.getElementById('model-runtime-filter');
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.model_card'));

  function includesFilter(value, selected) {
    if (!selected || selected === 'all') return true;
    return (value || '')
      .split(',')
      .map(function(item){ return item.trim(); })
      .indexOf(selected) !== -1;
  }

  function applyFilters() {
    var providerValue = provider ? provider.value : 'all';
    var typeValue = type ? type.value : 'all';
    var runtimeValue = runtime ? runtime.value : 'all';

    cards.forEach(function(card){
      var matchesProvider = includesFilter(card.getAttribute('data-provider'), providerValue);
      var matchesType = includesFilter(card.getAttribute('data-type'), typeValue);
      var matchesRuntime = includesFilter(card.getAttribute('data-runtime'), runtimeValue);
      card.hidden = !(matchesProvider && matchesType && matchesRuntime);
    });
  }

  [provider, type, runtime].forEach(function(control){
    if (!control) return;
    control.addEventListener('change', applyFilters);
  });

  applyFilters();
})();
