/* Premium motion layer: scroll progress, smart header, parallax, card glow, staggered item reveals.
   Vanilla JS, rAF-throttled, transform/opacity only. Respects prefers-reduced-motion. */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var root = document.documentElement;
  var header = document.querySelector(".site-header");
  var hero = document.querySelector(".hero");
  var heroImg = document.querySelector(".hero-portrait .pm-frame img");

  // Scroll progress bar
  var bar = document.createElement("div");
  bar.className = "pm-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  var lastY = window.scrollY;
  var ticking = false;

  function frame() {
    ticking = false;
    var y = window.scrollY;
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    bar.style.setProperty("--pm-progress", Math.min(1, y / max).toFixed(4));

    if (header && !reduce) {
      var navOpen = document.body.classList.contains("nav-open");
      var delta = y - lastY;
      if (navOpen || y < 320) header.classList.remove("is-hidden");
      else if (delta > 6) header.classList.add("is-hidden");
      else if (delta < -6) header.classList.remove("is-hidden");
    }
    lastY = y;

    if (!reduce && hero) {
      var h = hero.offsetHeight || 1;
      if (y < h * 1.2) {
        hero.style.setProperty("--pm-hero-shift", (y * 0.25).toFixed(1) + "px");
        if (heroImg) heroImg.style.setProperty("--pm-img-shift", (y * -0.04).toFixed(1) + "px");
      }
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(frame);
  }

  frame();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  // Keep header visible when keyboard focus lands inside it
  if (header) {
    header.addEventListener("focusin", function () {
      header.classList.remove("is-hidden");
    });
  }

  // Cursor-follow glow on cards (desktop pointers only)
  if (finePointer && !reduce) {
    document.addEventListener(
      "pointermove",
      function (event) {
        var card = event.target.closest && event.target.closest(".fit-list article, .check-list article, .service-list li, .listing");
        if (!card) return;
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((event.clientX - rect.left) / rect.width) * 100 + "%");
        card.style.setProperty("--my", ((event.clientY - rect.top) / rect.height) * 100 + "%");
      },
      { passive: true }
    );
  }

  // Staggered reveal of cards/items inside sections
  if (!reduce && "IntersectionObserver" in window) {
    var groups = [".service-list > li", ".fit-list > article", ".check-list > article", ".timeline .steps > li", ".faq-list > .faq-item"];
    var items = [];
    groups.forEach(function (selector) {
      Array.prototype.forEach.call(document.querySelectorAll(selector), function (el, index) {
        el.classList.add("pm-item");
        el.style.setProperty("--pm-delay", 120 + index * 90 + "ms");
        items.push(el);
      });
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-shown");
          io.unobserve(entry.target);
          // drop the delay after it played so hovers stay snappy
          setTimeout(function () {
            entry.target.style.removeProperty("--pm-delay");
          }, 1600);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    items.forEach(function (el) {
      io.observe(el);
    });
  }

  root.classList.add("pm-ready");
})();
