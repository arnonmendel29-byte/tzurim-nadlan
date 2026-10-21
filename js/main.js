(function () {
  var PHONE = "972542324527";

  function whatsappHref(message) {
    return "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(message);
  }

  function textOf(value) {
    return String(value || "").trim();
  }

  function listingHref(item) {
    var slug = textOf(item.slug) || textOf(item.id);
    return slug ? "property.html?id=" + encodeURIComponent(slug) : "";
  }

  function renderListings() {
    var root = document.querySelector("[data-listings]");
    var items = Array.isArray(window.LISTINGS) ? window.LISTINGS : [];
    if (!root || !items.length) return;

    var stack = document.createElement("div");
    stack.className = "scroll-stack scroll-stack--window";
    var inner = document.createElement("div");
    inner.className = "scroll-stack__inner";

    items.forEach(function (item) {
      if (!item || typeof item !== "object") return;
      var slot = document.createElement("div");
      slot.className = "scroll-stack__slot";
      slot.setAttribute("data-stack-slot", "");

      var article = document.createElement("article");
      article.className = "listing scroll-stack-card";

      var media = document.createElement("div");
      media.className = "listing-media";
      var image = textOf(item.image);
      if (image) {
        var img = document.createElement("img");
        img.src = image;
        img.alt = textOf(item.imageAlt) || textOf(item.title) || "תצלום נכס";
        img.loading = "lazy";
        img.decoding = "async";
        img.sizes = "(max-width: 860px) 92vw, 560px";
        img.width = 800;
        img.height = 500;
        media.append(img);
      } else {
        media.classList.add("is-pending");
        var pending = document.createElement("p");
        pending.textContent = "התמונה תתווסף לאחר שיוך מאומת";
        media.append(pending);
      }
      article.append(media);

      var copy = document.createElement("div");
      copy.className = "listing-copy";

      if (item.demo) {
        var demo = document.createElement("p");
        demo.className = "listing-demo";
        demo.textContent = "המחשה בלבד";
        copy.append(demo);
      }

      var title = textOf(item.title) || textOf(item.location) || "נכס";
      var heading = document.createElement("h3");
      heading.textContent = title;
      copy.append(heading);

      var place = textOf(item.location);
      if (place && place !== title) {
        var location = document.createElement("p");
        location.className = "listing-location";
        location.textContent = place;
        copy.append(location);
      }

      var meta = document.createElement("dl");
      meta.className = "listing-meta";
      [
        ["שטח בנוי", item.builtArea],
        ["שטח מגרש", item.plotArea],
        ["חדרים", item.rooms]
      ].forEach(function (pair) {
        var value = textOf(pair[1]);
        if (!value) return;
        var wrap = document.createElement("div");
        var dt = document.createElement("dt");
        dt.textContent = pair[0];
        var dd = document.createElement("dd");
        dd.textContent = value;
        wrap.append(dt, dd);
        meta.append(wrap);
      });
      if (!meta.childElementCount && textOf(item.area)) {
        var legacy = document.createElement("p");
        legacy.textContent = textOf(item.area);
        copy.append(legacy);
      } else if (meta.childElementCount) {
        copy.append(meta);
      }

      var summary = textOf(item.summary);
      if (summary) {
        var blurb = document.createElement("p");
        blurb.className = "listing-summary";
        blurb.textContent = summary;
        copy.append(blurb);
      }

      if (textOf(item.price)) {
        var price = document.createElement("p");
        price.textContent = textOf(item.price);
        copy.append(price);
      }

      var actions = document.createElement("div");
      actions.className = "listing-actions";
      var page = listingHref(item);
      if (page) {
        var more = document.createElement("a");
        more.className = "btn btn-yellow";
        more.href = page;
        more.textContent = "לצפייה בנכס";
        actions.append(more);
      }
      if (textOf(item.whatsapp)) {
        var talk = document.createElement("a");
        talk.className = "btn btn-line";
        talk.href = whatsappHref(item.whatsapp);
        talk.target = "_blank";
        talk.rel = "noopener noreferrer";
        talk.textContent = "וואטסאפ";
        actions.append(talk);
      }
      if (actions.childElementCount) copy.append(actions);

      article.append(copy);
      var shade = document.createElement("span");
      shade.className = "scroll-stack-card__shade";
      shade.setAttribute("aria-hidden", "true");
      article.append(shade);
      slot.append(article);
      inner.append(slot);
    });

    if (!inner.querySelector("[data-stack-slot]")) return;
    var end = document.createElement("div");
    end.className = "scroll-stack__end";
    end.setAttribute("aria-hidden", "true");
    inner.append(end);
    stack.append(inner);
    root.replaceChildren(stack);

    var mobileStack = window.matchMedia("(max-width: 860px)").matches;
    if (mobileStack) {
      stack.classList.add("scroll-stack--flat");
      return;
    }

    if (typeof window.initScrollStack === "function") {
      var header = document.querySelector(".site-header");
      var stackTop = (header ? header.offsetHeight : 76) + 20;
      window.initScrollStack(stack, {
        itemDistance: 100,
        itemStackDistance: 24,
        stackPosition: stackTop,
        itemScale: 0.05,
        baseScale: 0.85,
        dimAmount: 0.2,
        holdDistance: 200,
        smoothScroll: false,
        useWindowScroll: true
      });
    }
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

  function initTimeline() {
    var wrap = document.querySelector("[data-timeline]");
    if (!wrap) return;
    var dots = Array.prototype.slice.call(wrap.querySelectorAll(".timeline-dot"));
    if (!dots.length) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var ticking = false;

    function setProgress(value) {
      var progress = Math.min(1, Math.max(0, value));
      wrap.style.setProperty("--timeline-progress", progress.toFixed(4));
      dots.forEach(function (dot, index) {
        var threshold = dots.length === 1 ? 0 : index / (dots.length - 1);
        dot.classList.toggle("is-lit", progress >= threshold - 0.02);
      });
    }

    function update() {
      ticking = false;
      if (reduce) {
        setProgress(1);
        return;
      }
      var rect = wrap.getBoundingClientRect();
      var view = window.innerHeight || 1;
      var start = view * 0.85;
      var end = view * 0.28;
      setProgress((start - rect.top) / Math.max(1, start - end));
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  renderListings();
  initHeader();
  initNav();
  initContactFloat();
  initForm();
  initTimeline();

  function startReveal() {
    initReveal();
  }

  if (window.__motionReady && typeof window.__motionReady.then === "function") {
    window.__motionReady.then(startReveal);
  } else {
    startReveal();
  }
})();
