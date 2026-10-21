(function () {
  var PHONE = "972542324527";

  function whatsappHref(message) {
    return "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(message);
  }

  function textOf(value) {
    return String(value || "").trim();
  }

  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initNav() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (!header || !toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "סגירת תפריט" : "פתיחת תפריט");
      document.body.classList.toggle("nav-open", open);
    }

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      setOpen(open);
      if (open) {
        var first = nav.querySelector("a");
        if (first) first.focus();
      }
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (header.contains(event.target)) return;
      setOpen(false);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) setOpen(false);
    });

    var links = Array.prototype.slice.call(document.querySelectorAll(".site-nav a[href*='#']"));
    var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
    if (!sections.length || !("IntersectionObserver" in window)) return;

    var byId = {};
    links.forEach(function (link) {
      var href = link.getAttribute("href") || "";
      var id = href.slice(href.indexOf("#") + 1);
      if (id && !byId[id]) byId[id] = link;
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (link) {
            link.removeAttribute("aria-current");
          });
          var current = byId[entry.target.id];
          if (current) current.setAttribute("aria-current", "true");
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  var ANIMATED_CONTENT_OPTS = {
    distance: 100,
    direction: "vertical",
    duration: 0.8,
    ease: "power3.out",
    blur: 0,
    stagger: 0.08,
    threshold: 0.1
  };

  function revealRoot(section) {
    return (
      section.querySelector(".about-grid, .contact-grid, .hero-grid") ||
      section.querySelector(".container") ||
      section
    );
  }

  function initReveal() {
    var nodes = document.querySelectorAll(".reveal");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var mobile = window.matchMedia("(max-width: 860px)").matches;

    if (typeof window.initAnimatedContent === "function" && typeof gsap !== "undefined" && !reduce && !mobile) {
      if (reduce) {
        nodes.forEach(function (node) {
          node.classList.add("is-in");
          node.style.visibility = "visible";
          var root = revealRoot(node);
          if (root) root.style.visibility = "visible";
        });
        var heroReduced = document.querySelector(".hero-copy");
        if (heroReduced) heroReduced.style.visibility = "visible";
        return;
      }

      nodes.forEach(function (section) {
        section.classList.add("is-in");
        window.initAnimatedContent(revealRoot(section), ANIMATED_CONTENT_OPTS);
      });

      var heroCopy = document.querySelector(".hero-copy");
      if (heroCopy) {
        window.initAnimatedContent(
          heroCopy,
          Object.assign({}, ANIMATED_CONTENT_OPTS, { trigger: "mount", delay: 0.05 })
        );
      }

      if (typeof ScrollTrigger !== "undefined") {
        requestAnimationFrame(function () {
          ScrollTrigger.refresh();
        });
      }
      return;
    }

    function showReveal(node) {
      node.classList.add("is-in");
      node.style.visibility = "visible";
      var root = revealRoot(node);
      if (root) root.style.visibility = "visible";
    }

    var heroCopy = document.querySelector(".hero-copy");
    if (heroCopy) heroCopy.style.visibility = "visible";

    if (!nodes.length) return;
    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach(showReveal);
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          showReveal(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    nodes.forEach(function (node) {
      observer.observe(node);
    });
  }

  function initContactFloat() {
    var contact = document.querySelector("#contact");
    if (!contact || !("IntersectionObserver" in window)) return;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          document.body.classList.toggle("contact-in-view", entry.isIntersecting && entry.intersectionRatio > 0.28);
        });
      },
      { threshold: [0.28, 0.5] }
    );
    observer.observe(contact);
  }

  function initForm() {
    var form = document.querySelector("#contact-form");
    if (!form) return;
    var error = form.querySelector(".form-error");
    var status = form.querySelector(".form-status");
    var nameInput = form.querySelector("#name");
    var phoneInput = form.querySelector("#phone");
    var subjectInput = form.querySelector("#subject");

    function showError(message, field) {
      error.textContent = message;
      error.hidden = false;
      status.hidden = true;
      [nameInput, phoneInput, subjectInput].forEach(function (input) {
        input.removeAttribute("aria-invalid");
      });
      if (field) {
        field.setAttribute("aria-invalid", "true");
        field.focus();
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var name = textOf(nameInput.value);
      var phone = textOf(phoneInput.value);
      var subject = textOf(subjectInput.value);
      var digits = phone.replace(/\D/g, "");

      if (name.length < 2) {
        showError("הזינו שם.", nameInput);
        return;
      }
      if (digits.length < 9 || digits.length > 15) {
        showError("הזינו מספר טלפון כדי שעמרני יוכל לחזור אליכם.", phoneInput);
        return;
      }
      if (!subject) {
        showError("בחרו נושא לפנייה.", subjectInput);
        return;
      }

      error.hidden = true;
      [nameInput, phoneInput, subjectInput].forEach(function (input) {
        input.removeAttribute("aria-invalid");
      });

      var href = whatsappHref(
        ["היי עמרני, הגעתי דרך האתר של צורים נדל״ן.", "שם: " + name, "טלפון: " + phone, "נושא: " + subject].join("\n")
      );

      var link = document.createElement("a");
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "לפתוח את השיחה מכאן";

      status.replaceChildren(
        document.createTextNode("ההודעה מוכנה בוואטסאפ. היא תישלח רק אחרי האישור שלכם שם. אם החלון לא נפתח, אפשר "),
        link,
        document.createTextNode(".")
      );
      status.hidden = false;
      window.open(href, "_blank", "noopener,noreferrer");
    });
  }

  initHeader();
  initNav();
  initReveal();
  initContactFloat();
  initForm();
})();
