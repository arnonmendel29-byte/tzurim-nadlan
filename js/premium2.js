(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ids = ['services', 'fit', 'questions'];
  var secs = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  secs.forEach(function (s) { s.classList.add('pm2-sec'); });

  var svc = document.getElementById('services');
  if (svc) {
    var a = document.createElement('span'); a.className = 'pm-aurora'; a.setAttribute('aria-hidden', 'true');
    svc.insertBefore(a, svc.firstChild);
    svc.querySelectorAll('.service-list li').forEach(function (li) {
      var d = document.createElement('span'); d.className = 'pm-draw'; d.setAttribute('aria-hidden', 'true'); li.appendChild(d);
    });
  }
  var fit = document.getElementById('fit');
  if (fit) fit.querySelectorAll('.fit-list article').forEach(function (art, i) {
    var n = document.createElement('span'); n.className = 'pm-num'; n.setAttribute('aria-hidden', 'true');
    n.textContent = String(i + 1).padStart(2, '0'); art.insertBefore(n, art.firstChild);
  });

  function count(el) {
    var final = el.textContent.trim(), target = parseInt(final, 10);
    if (reduce || isNaN(target) || el.dataset.pmCounted) return;
    el.dataset.pmCounted = '1';
    var start = performance.now(), dur = 900 + target * 250;
    (function tick(t) {
      var k = Math.min(1, (t - start) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = k < 1 ? String(Math.round(e * target)).padStart(2, '0') : final;
      if (k < 1) requestAnimationFrame(tick);
    })(start);
  }

  if (!('IntersectionObserver' in window)) { secs.forEach(function (s) { s.classList.add('pm-live', 'pm-noio'); }); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('pm-live'); io.unobserve(e.target);
    });
  }, { threshold: 0.12 });
  secs.forEach(function (s) { io.observe(s); });

  var rows = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; el.classList.add('pm-in', 'is-shown');
      var idx = el.querySelector('.service-index'); if (idx) count(idx);
      rows.unobserve(el);
    });
  }, { threshold: 0.35 });
  document.querySelectorAll('#services .service-list li, #fit .fit-list article, #questions .check-list article')
    .forEach(function (el) { rows.observe(el); });

  if (reduce || !fit) return;
  var nums = fit.querySelectorAll('.fit-list article'), ticking = false;
  function upd() {
    ticking = false; var vh = innerHeight;
    nums.forEach(function (n) {
      var r = n.getBoundingClientRect(), p = (vh - r.top) / (vh + r.height);
      if (p > -0.2 && p < 1.2) n.style.setProperty('--pm-p', (Math.max(0, Math.min(1, p)) * 2 - 1).toFixed(3));
    });
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
  upd();
})();
