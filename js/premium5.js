/* Pass 5 safety net: never leave text hidden. Anything at/above the viewport is shown. */
(function () {
  function sweep() {
    var vh = window.innerHeight;
    document.querySelectorAll('.reveal:not(.is-in), .pm-item:not(.is-shown)').forEach(function (el) {
      if (el.getBoundingClientRect().top < vh * 0.98) {
        if (el.classList.contains('pm-item')) el.classList.add('is-shown');
        else {
          el.classList.add('is-in'); el.style.visibility = 'visible';
          var r = el.querySelector('.about-grid, .contact-grid, .hero-grid') || el.querySelector('.container');
          if (r) r.style.visibility = 'visible';
        }
      }
    });
  }
  var t;
  function soon() { clearTimeout(t); t = setTimeout(sweep, 120); }
  window.addEventListener('scroll', soon, { passive: true });
  window.addEventListener('hashchange', function () { setTimeout(sweep, 60); });
  window.addEventListener('resize', soon);
  window.addEventListener('load', function () { setTimeout(sweep, 300); });
  setTimeout(sweep, 1500);
})();
