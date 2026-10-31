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

  /* Word splitting: same text, wrapped for masked reveal */
  function split(el) {
    if (el.dataset.pmSplit) return; el.dataset.pmSplit = '1';
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var w = document.createElement('span'); w.className = 'pm-w';
            var s = document.createElement('span'); s.textContent = p; s.style.setProperty('--i', i++);
            w.appendChild(s); frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !n.classList.contains('pm-w')) walk(n);
      });
    })(el);
    el.classList.add('pm-split');
  }
  var h1 = document.querySelector('.hero h1');
  var heads = Array.prototype.slice.call(document.querySelectorAll('.section-intro h2, .contact h2'));
  if (h1) split(h1);
  heads.forEach(split);

  if (h1) {
    var go = function () { setTimeout(function () { h1.classList.add('pm-on'); }, 150); };
    if (doc.classList.contains('pm-loading')) {
      new MutationObserver(function (m, o) { if (!doc.classList.contains('pm-loading')) { o.disconnect(); go(); } })
        .observe(doc, { attributes: true, attributeFilter: ['class'] });
    } else go();
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('pm-on'); io.unobserve(e.target); } });
    }, { threshold: 0.2 });
    heads.forEach(function (h) { io.observe(h); });
  } else heads.forEach(function (h) { h.classList.add('pm-on'); });

  /* Services numerals: wrap for odometer roll (text unchanged) */
  document.querySelectorAll('#services .service-index').forEach(function (n) {
    n.dataset.pmCounted = '1'; // disable pass-2 counter
    var s = document.createElement('span'); s.textContent = n.textContent; n.textContent = ''; n.appendChild(s);
  });

})();
