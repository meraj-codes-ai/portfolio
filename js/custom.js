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

	if (window.matchMedia) {
		var colorPreference = window.matchMedia('(prefers-color-scheme: dark)');
		var syncWithSystem = function(event){
			try {
				if (!window.localStorage.getItem(storageKey)) {
					setTheme(event.matches ? 'dark' : 'light');
				}
			} catch (e) {}
		};
		if (colorPreference.addEventListener) {
			colorPreference.addEventListener('change', syncWithSystem);
		} else if (colorPreference.addListener) {
			colorPreference.addListener(syncWithSystem);
		}
	}
})();

// Mobile navigation: close after a selection and keep the trigger state accurate.
(function(){
	var nav = document.getElementById('navbarSupportedContent');
	var toggle = document.querySelector('[data-target="#navbarSupportedContent"]');
	if (!nav || !toggle) return;

	function isOpen() {
		return nav.classList.contains('show');
	}

	function setNavigation(open) {
		nav.classList.toggle('show', open);
		toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
	}

	function closeNavigation() {
		if (window.innerWidth >= 992 || !isOpen()) return;
		setNavigation(false);
	}

	toggle.addEventListener('click', function(){
		setNavigation(!isOpen());
	});

	nav.querySelectorAll('a.nav-link').forEach(function(link){
		link.addEventListener('click', closeNavigation);
	});

	document.addEventListener('keydown', function(event){
		if (event.key !== 'Escape' || !isOpen()) return;
		closeNavigation();
		toggle.focus();
	});

	document.addEventListener('click', function(event){
		if (window.innerWidth >= 992 || !isOpen()) return;
		if (nav.contains(event.target) || toggle.contains(event.target)) return;
		setNavigation(false);
	});

	window.addEventListener('resize', function(){
		if (window.innerWidth >= 992) setNavigation(false);
	}, { passive: true });
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

  var options = { root: null, rootMargin: '-25% 0px -62% 0px', threshold: 0 };
  var current;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      var a = linkMap.get(entry.target);
      if (!a) return;
      if (entry.isIntersecting) {
		if (current) {
			current.classList.remove('active');
			current.removeAttribute('aria-current');
		}
        a.classList.add('active');
		a.setAttribute('aria-current', 'location');
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

  function activateTab(tab, shouldScroll) {
    var targetId = tab.getAttribute('data-project-target');
    tabs.forEach(function(item){
      var active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', active ? 'true' : 'false');
		item.setAttribute('tabindex', active ? '0' : '-1');
    });
    panels.forEach(function(panel){
      var active = panel.id === targetId;
      panel.classList.toggle('is-active', active);
		panel.hidden = !active;
    });
		if (shouldScroll) {
			tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
		}
  }

	var initiallyActive = root.querySelector('.project_tab.is-active') || tabs[0];
	activateTab(initiallyActive, false);

  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
		activateTab(tab, true);
    });
    tab.addEventListener('keydown', function(e){
		if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault();
      var list = Array.prototype.slice.call(tabs);
      var index = list.indexOf(tab);
		var nextIndex;
		if (e.key === 'Home') nextIndex = 0;
		else if (e.key === 'End') nextIndex = list.length - 1;
		else nextIndex = e.key === 'ArrowRight'
			? (index + 1) % list.length
			: (index - 1 + list.length) % list.length;
      list[nextIndex].focus();
		activateTab(list[nextIndex], true);
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
	var count = document.getElementById('model-result-count');

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

		var visibleCount = 0;
		cards.forEach(function(card){
      var matchesProvider = includesFilter(card.getAttribute('data-provider'), providerValue);
      var matchesType = includesFilter(card.getAttribute('data-type'), typeValue);
      var matchesRuntime = includesFilter(card.getAttribute('data-runtime'), runtimeValue);
			var matches = matchesProvider && matchesType && matchesRuntime;
			card.hidden = !matches;
			if (matches) visibleCount += 1;
    });
		if (count) {
			count.textContent = visibleCount + (visibleCount === 1 ? ' model shown' : ' models shown');
		}
  }

  [provider, type, runtime].forEach(function(control){
    if (!control) return;
    control.addEventListener('change', applyFilters);
  });

  applyFilters();
})();
