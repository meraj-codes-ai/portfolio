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
