(function () {
  var doc = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Preloader (JS-injected, so no-JS users never see it) */
  if (!reduce) {
    doc.classList.add('pm-loading');
    var L = document.createElement('div'); L.className = 'pm-loader'; L.setAttribute('aria-hidden', 'true');
    L.innerHTML = '<img src="assets/logo.png" alt=""><i></i>';
    document.body.appendChild(L);
    var t0 = performance.now();
    var finish = function () {
      setTimeout(function () { doc.classList.remove('pm-loading'); doc.classList.add('pm-loaded'); setTimeout(function () { L.remove(); }, 1000); },
        Math.max(0, 450 - (performance.now() - t0)));
    };
    if (document.readyState === 'complete') finish(); else addEventListener('load', finish);
    setTimeout(finish, 1200);
  }

  /* Services numerals: keep plain text (no counter, no roll) */
  document.querySelectorAll('#services .service-index').forEach(function (n) {
    n.dataset.pmCounted = '1'; // disable pass-2 counter
  });

})();
