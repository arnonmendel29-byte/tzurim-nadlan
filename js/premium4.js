(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Hero line art: an abstract skyline / facade drawn in thin gold strokes */
  var hero = document.querySelector('.hero');
  if (hero) {
    var sw = document.createElement('span'); sw.className = 'pm-sweep'; sw.setAttribute('aria-hidden', 'true');
    hero.insertBefore(sw, hero.firstChild);
    var NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'pm-arch'); svg.setAttribute('viewBox', '0 0 900 420'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
    var shapes = [
      ['line', { x1: 0, y1: 419, x2: 900, y2: 419 }],
      ['path', { d: 'M60 419V170h120v249' }], ['path', { d: 'M180 419V90l70-40 70 40v329' }],
      ['path', { d: 'M320 419V200h90v219' }], ['path', { d: 'M410 419V30h110v389' }],
      ['path', { d: 'M520 419V140l60-50 60 50v279' }], ['path', { d: 'M640 419V230h140v189' }], ['path', { d: 'M780 419V180h80v239' }],
      ['path', { d: 'M430 70h70M430 110h70M430 150h70M430 190h70M430 230h70M430 270h70M430 310h70M430 350h70', c: 'pm-arch-faint' }],
      ['path', { d: 'M200 130h100M200 180h100M200 230h100M200 280h100M200 330h100', c: 'pm-arch-faint' }],
      ['path', { d: 'M540 170h80M540 220h80M540 270h80M540 320h80', c: 'pm-arch-faint' }],
      ['path', { d: 'M465 30V0', c: '' }], ['rect', { x: 690, y: 270, width: 40, height: 50 }]
    ];
    shapes.forEach(function (s, i) {
      var e = document.createElementNS(NS, s[0]);
      Object.keys(s[1]).forEach(function (k) { if (k === 'c') { if (s[1].c) e.setAttribute('class', s[1].c); } else e.setAttribute(k, s[1][k]); });
      e.setAttribute('pathLength', '1'); e.style.setProperty('--d', i); svg.appendChild(e);
    });
    hero.insertBefore(svg, sw.nextSibling);
  }

  /* Section progress lines */
  var secs = Array.prototype.slice.call(document.querySelectorAll('main > section.section'));
  secs.forEach(function (s) {
    if (getComputedStyle(s).position === 'static') s.style.position = 'relative';
    var l = document.createElement('span'); l.className = 'pm-sline'; l.setAttribute('aria-hidden', 'true'); s.appendChild(l);
  });

  /* Reveal observers: intro dividers, about portrait, footer */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var t = e.target;
      t.classList.add(t.classList.contains('section-intro') ? 'pm-drawn' : t.tagName === 'FOOTER' ? 'pm-foot-in' : 'pm-revealed');
      io.unobserve(t);
    });
  }, { threshold: 0.2 }) : null;
  var revs = document.querySelectorAll('.section-intro, .about-portrait, .site-footer');
  if (io) revs.forEach(function (el) { io.observe(el); });
  else revs.forEach(function (el) { el.classList.add('pm-drawn', 'pm-revealed', 'pm-foot-in'); });

  if (reduce) return;

  /* Scroll-linked: progress lines, image parallax, hero art drift */
  var ticking = false, arch = document.querySelector('.pm-arch');
  function imgs() { return document.querySelectorAll('.about-portrait .pm-frame img, .listing img'); }
  function upd() {
    ticking = false; var vh = innerHeight;
    secs.forEach(function (s) {
      var r = s.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
      var p = Math.min(1, Math.max(0, (vh * .6 - r.top) / r.height));
      s.style.setProperty('--sp', p.toFixed(3));
    });
    imgs().forEach(function (im) {
      var r = im.getBoundingClientRect(); if (r.bottom < -50 || r.top > vh + 50) return;
      var k = ((r.top + r.height / 2) - vh / 2) / vh; im.style.setProperty('--pm-iy', (k * -28).toFixed(1) + 'px');
    });
    if (arch && scrollY < vh * 1.2) arch.style.setProperty('--pm-arch-y', (scrollY * .18).toFixed(1) + 'px');
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
  addEventListener('resize', upd); upd(); setTimeout(upd, 1500);

  if (!fine) return;

  /* Magnetic CTAs */
  document.querySelectorAll('.hero-actions .btn, .inline-cta .btn, .header-cta, .contact .btn').forEach(function (b) {
    b.classList.add('pm-mag');
    b.addEventListener('pointermove', function (e) {
      var r = b.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      b.classList.add('pm-mag-on'); b.style.transform = 'translate(' + (dx * .22).toFixed(1) + 'px,' + (dy * .3).toFixed(1) + 'px)';
    });
    b.addEventListener('pointerleave', function () { b.classList.remove('pm-mag-on'); b.style.transform = ''; });
  });

  /* Card tilt */
  document.querySelectorAll('.fit-list article, .check-list article, .service-list li, .timeline .steps li').forEach(function (c) {
    c.classList.add('pm-tilt');
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      var amt = c.tagName === 'LI' && c.closest('.service-list') ? 2 : 5;
      c.classList.add('pm-tilting');
      c.style.transform = 'perspective(900px) rotateX(' + (-py * amt).toFixed(2) + 'deg) rotateY(' + (px * amt).toFixed(2) + 'deg) translateY(-4px)';
    });
    c.addEventListener('pointerleave', function () { c.classList.remove('pm-tilting'); c.style.transform = ''; });
  });
})();
