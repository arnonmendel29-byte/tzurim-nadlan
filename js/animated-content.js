(function (global) {
  var WIPES = {
    up: "linear-gradient(to top, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))",
    down: "linear-gradient(to bottom, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))",
    left: "linear-gradient(to left, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))",
    right: "linear-gradient(to right, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))",
    center:
      "radial-gradient(farthest-corner at 50% 50%, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))"
  };

  function defaults(options) {
    return Object.assign(
      {
        container: null,
        distance: 100,
        direction: "vertical",
        reverse: false,
        duration: 0.8,
        ease: "power3.out",
        initialOpacity: 0,
        animateOpacity: true,
        scale: 1,
        blur: 0,
        rotate: 0,
        tilt: 0,
        wipe: "none",
        threshold: 0.1,
        delay: 0,
        stagger: 0,
        staggerFrom: "start",
        trigger: "scroll",
        once: true,
        scrub: false,
        disappearAfter: 0,
        disappearDuration: 0.5,
        disappearEase: "power3.in",
        onStart: null,
        onComplete: null,
        onDisappearanceComplete: null
      },
      options || {}
    );
  }

  function initAnimatedContent(el, options) {
    if (!el || typeof gsap === "undefined") return function () {};

    var opts = defaults(options);
    var gsapLib = gsap;
    if (typeof ScrollTrigger !== "undefined") {
      gsapLib.registerPlugin(ScrollTrigger);
    }

    var scroller = opts.container || document.getElementById("snap-main-container") || null;
    if (typeof scroller === "string") scroller = document.querySelector(scroller);

    var reduce = (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) || false;
    el.style.visibility = "hidden";

    var ctx = gsapLib.context(function () {
      var targets =
        opts.stagger > 0 && el.children.length ? Array.prototype.slice.call(el.children) : [el];
      var horizontal = opts.direction === "horizontal";
      var axis = horizontal ? "x" : "y";
      var sign = opts.reverse ? -1 : 1;
      var mask = WIPES[opts.wipe];

      gsapLib.set(el, { visibility: "visible" });

      if (reduce) {
        gsapLib.set(targets, { clearProps: "all" });
        if (typeof opts.onComplete === "function") opts.onComplete();
        return;
      }

      var from = {};
      var to = {
        duration: opts.duration,
        ease: opts.ease
      };
      from[axis] = opts.distance * sign;
      from.scale = opts.scale;
      from.opacity = opts.animateOpacity ? opts.initialOpacity : 1;
      to[axis] = 0;
      to.scale = 1;
      to.opacity = 1;

      if (opts.blur > 0) {
        from.filter = "blur(" + opts.blur + "px)";
        to.filter = "blur(0px)";
      }
      if (opts.rotate) {
        from.rotation = opts.rotate * sign;
        to.rotation = 0;
      }
      if (opts.tilt) {
        var tiltAxis = horizontal ? "rotationY" : "rotationX";
        from[tiltAxis] = horizontal ? -opts.tilt * sign : opts.tilt * sign;
        to[tiltAxis] = 0;
        from.transformPerspective = 900;
        to.transformPerspective = 900;
      }
      if (mask) {
        gsapLib.set(targets, { maskImage: mask, webkitMaskImage: mask });
        from["--ac-wipe"] = 0;
        to["--ac-wipe"] = 1;
      }
      if (opts.stagger > 0) {
        to.stagger = { each: opts.stagger, from: opts.staggerFrom };
      }

      function settle() {
        if (opts.scrub) return;
        gsapLib.set(targets, {
          clearProps: mask ? "filter,transform,maskImage,webkitMaskImage" : "filter,transform"
        });
      }

      function disappear() {
        if (opts.disappearAfter <= 0) return;
        var out = {
          scale: 0.8,
          opacity: opts.animateOpacity ? opts.initialOpacity : 0,
          delay: opts.disappearAfter,
          duration: opts.disappearDuration,
          ease: opts.disappearEase,
          onComplete: function () {
            if (typeof opts.onDisappearanceComplete === "function") opts.onDisappearanceComplete();
          }
        };
        out[axis] = -opts.distance * sign;
        if (opts.blur > 0) out.filter = "blur(" + opts.blur + "px)";
        if (opts.stagger > 0) out.stagger = { each: opts.stagger, from: opts.staggerFrom };
        gsapLib.to(targets, out);
      }

      var tl = gsapLib.timeline({
        paused: true,
        onStart: function () {
          if (typeof opts.onStart === "function") opts.onStart();
        },
        onComplete: function () {
          if (typeof opts.onComplete === "function") opts.onComplete();
          settle();
          if (opts.once && !opts.scrub) disappear();
        }
      });
      tl.fromTo(targets, from, to, opts.scrub ? 0 : Math.max(opts.delay, 0));

      if (opts.trigger === "mount") {
        tl.play();
        return;
      }

      if (typeof ScrollTrigger === "undefined") {
        tl.play();
        return;
      }

      var start = "top " + (1 - opts.threshold) * 100 + "%";

      if (opts.scrub) {
        ScrollTrigger.create({
          trigger: el,
          scroller: scroller || undefined,
          start: start,
          end: "top " + Math.max((1 - opts.threshold) * 100 - 45, 5) + "%",
          scrub: opts.scrub === true ? true : Math.max(Number(opts.scrub) || 0, 0.01),
          animation: tl
        });
        return;
      }

      ScrollTrigger.create({
        trigger: el,
        scroller: scroller || undefined,
        start: start,
        once: opts.once,
        onEnter: function () {
          tl.play();
        },
        onLeaveBack: opts.once
          ? undefined
          : function () {
              if (mask) gsapLib.set(targets, { maskImage: mask, webkitMaskImage: mask });
              tl.reverse();
            }
      });
    }, el);

    return function () {
      ctx.revert();
    };
  }

  global.initAnimatedContent = initAnimatedContent;
})(window);
