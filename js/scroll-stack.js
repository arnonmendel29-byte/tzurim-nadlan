(function (global) {
  function resolveOffset(value, size) {
    if (typeof value === "number") return value;
    var text = String(value).trim();
    if (text.endsWith("%")) return (parseFloat(text) / 100) * size;
    return parseFloat(text) || 0;
  }

  function toLength(value) {
    return typeof value === "number" ? value + "px" : value;
  }

  function scrollsInside(node, stop, delta) {
    for (var element = node; element && element !== stop; element = element.parentElement) {
      if (element.scrollHeight <= element.clientHeight + 1) continue;
      var overflow = getComputedStyle(element).overflowY;
      if (overflow !== "auto" && overflow !== "scroll") continue;
      if (delta > 0 ? element.scrollTop + element.clientHeight < element.scrollHeight - 1 : element.scrollTop > 0) {
        return true;
      }
    }
    return false;
  }

  function defaults(options) {
    return Object.assign(
      {
        itemDistance: 100,
        itemStackDistance: 24,
        stackPosition: "15%",
        itemScale: 0.05,
        baseScale: 0.8,
        dimAmount: 0.2,
        blurAmount: 0,
        tiltAmount: 0,
        rotationAmount: 0,
        holdDistance: 200,
        smoothScroll: true,
        snap: false,
        useWindowScroll: false,
        onStackComplete: null
      },
      options || {}
    );
  }

  function initScrollStack(root, options) {
    if (!root) return function () {};

    var opts = defaults(options);
    var inner = root.querySelector(".scroll-stack__inner");
    var end = root.querySelector(".scroll-stack__end");
    if (!inner || !end) return function () {};

    var windowed = opts.useWindowScroll;
    var target = windowed ? window : root;
    var motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var cache = new Map();
    var frame = 0;
    var glide = 0;
    var rest = 0;
    var complete = false;
    var gliding = false;
    var pressed = false;
    var current = 0;
    var goal = 0;
    var written = 0;
    var last = 0;
    var points = [];
    var reach = 0;
    var destroyed = false;

    root.classList.toggle("scroll-stack--window", windowed);
    root.classList.toggle("scroll-stack--contained", !windowed);

    var slots = Array.prototype.slice.call(inner.querySelectorAll("[data-stack-slot]"));
    slots.forEach(function (slot, index) {
      slot.style.top = "calc(" + toLength(opts.stackPosition) + " + " + index * opts.itemStackDistance + "px)";
      slot.style.marginBottom = (slots.length - 1 - index) * opts.itemStackDistance + "px";
      slot.style.zIndex = String(index + 1);
      if (index > 0) {
        var gap = opts.itemDistance - (slots.length - index) * opts.itemStackDistance;
        var spacer = document.createElement("div");
        spacer.setAttribute("aria-hidden", "true");
        spacer.style.height = Math.max(0, gap) + "px";
        spacer.style.marginTop = Math.min(0, gap) + "px";
        inner.insertBefore(spacer, slot);
      }
    });

    function readScroll() {
      return windowed ? window.scrollY : root.scrollTop;
    }

    function maxScroll() {
      return windowed
        ? document.documentElement.scrollHeight - window.innerHeight
        : root.scrollHeight - root.clientHeight;
    }

    function writeScroll(value) {
      written = value;
      target.scrollTo({ top: value, behavior: "instant" });
    }

    function write(key, value, apply) {
      if (cache.get(key) === value) return false;
      cache.set(key, value);
      apply(value);
      return true;
    }

    function update() {
      frame = 0;
      if (destroyed) return;
      slots = Array.prototype.slice.call(inner.querySelectorAll("[data-stack-slot]"));
      if (!slots.length) return;

      var viewHeight = windowed ? window.innerHeight : root.clientHeight;
      var viewTop = windowed ? 0 : root.getBoundingClientRect().top + root.clientTop;
      var stackTop = resolveOffset(opts.stackPosition, viewHeight);
      var offset = opts.itemStackDistance;
      var heights = slots.map(function (slot) {
        return slot.offsetHeight;
      });
      var tops = slots.map(function (slot) {
        return slot.getBoundingClientRect().top;
      });
      var lastPin = stackTop + (slots.length - 1) * offset;
      var padTop = windowed ? 0 : stackTop;
      var endHeight =
        opts.holdDistance + (windowed ? 0 : Math.max(0, viewHeight - lastPin - heights[heights.length - 1]));

      var moved = write("padTop", padTop, function (value) {
        inner.style.paddingTop = value + "px";
      });
      moved =
        write("endHeight", endHeight, function (value) {
          end.style.height = value + "px";
        }) || moved;

      var flow = inner.getBoundingClientRect().top - viewTop + readScroll() + padTop;
      points = heights.map(function (height, i) {
        var point = flow - stackTop - i * offset;
        flow += height + opts.itemDistance;
        return point;
      });
      reach = Math.max(40, (heights[0] + opts.itemDistance - offset) / 2);

      var depths = slots.map(function () {
        return 0;
      });
      var lastCover = 0;
      for (var j = 1; j < slots.length; j++) {
        var pinBefore = viewTop + stackTop + (j - 1) * offset;
        var start = pinBefore + heights[j - 1];
        var span = Math.max(1, start - pinBefore - offset);
        var cover = Math.min(1, Math.max(0, (start - tops[j]) / span));
        for (var i = 0; i < j; i++) depths[i] += cover;
        lastCover = cover;
      }

      if (motion.matches) {
        slots.forEach(function (slot) {
          var card = slot.firstElementChild;
          if (!card) return;
          card.style.transform = "";
          card.style.filter = "";
          card.style.setProperty("--scroll-stack-dim", "0");
        });
      } else {
        var dimStep = Math.min(Math.max(opts.dimAmount, 0), 1);
        slots.forEach(function (slot, i) {
          var card = slot.firstElementChild;
          if (!card) return;
          var depth = depths[i];
          var lean = Math.min(depth, 1);
          var scale = Math.max(Math.min(opts.baseScale, 1), 1 - depth * opts.itemScale);
          var tilt = -lean * opts.tiltAmount;
          var turn = lean * opts.rotationAmount * (i % 2 ? -1 : 1);
          var blur = depth * opts.blurAmount;
          var dim = 1 - Math.pow(1 - dimStep, depth);
          var transform =
            depth < 0.0005
              ? ""
              : "perspective(1200px) rotateX(" +
                tilt.toFixed(2) +
                "deg) rotate(" +
                turn.toFixed(2) +
                "deg) scale(" +
                scale.toFixed(4) +
                ")";
          write("transform" + i, transform, function (value) {
            card.style.transform = value;
          });
          write("filter" + i, blur > 0.01 ? "blur(" + blur.toFixed(2) + "px)" : "", function (value) {
            card.style.filter = value;
          });
          write("dim" + i, dim.toFixed(3), function (value) {
            card.style.setProperty("--scroll-stack-dim", value);
          });
        });
      }

      var done = slots.length > 1 && lastCover >= 0.999;
      if (done !== complete) {
        complete = done;
        if (done && typeof opts.onStackComplete === "function") opts.onStackComplete();
      }

      if (moved) schedule();
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    function step(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (Math.abs(readScroll() - written) > 2) {
        gliding = false;
        glide = 0;
        settleSoon();
        return;
      }
      current += (goal - current) * (1 - Math.pow(0.9, dt * 60));
      if (Math.abs(goal - current) < 0.5) current = goal;
      writeScroll(current);
      if (current === goal) {
        gliding = false;
        glide = 0;
        settleSoon();
        return;
      }
      glide = requestAnimationFrame(step);
    }

    function glideTo(value) {
      goal = Math.min(Math.max(value, 0), maxScroll());
      if (motion.matches) {
        writeScroll(goal);
        return;
      }
      if (gliding) return;
      gliding = true;
      current = readScroll();
      written = current;
      last = performance.now();
      glide = requestAnimationFrame(step);
    }

    function settle() {
      rest = 0;
      if (!opts.snap || gliding || pressed || !points.length) return;
      var now = readScroll();
      var nearest = points.reduce(function (best, point) {
        return Math.abs(point - now) < Math.abs(best - now) ? point : best;
      });
      var gap = Math.abs(nearest - now);
      if (gap > 1 && gap < reach) glideTo(nearest);
    }

    function settleSoon() {
      window.clearTimeout(rest);
      rest = window.setTimeout(settle, 140);
    }

    function onScroll() {
      schedule();
      if (!gliding) settleSoon();
    }

    function onWheel(event) {
      if (!opts.smoothScroll || motion.matches || event.defaultPrevented || event.ctrlKey) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      var page = windowed ? window.innerHeight : root.clientHeight;
      var delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? page : 1);
      if (!delta || scrollsInside(event.target, windowed ? document.body : root, delta)) return;
      var base = gliding ? goal : readScroll();
      if ((delta < 0 && base <= 0) || (delta > 0 && base >= maxScroll() - 0.5)) return;
      event.preventDefault();
      window.clearTimeout(rest);
      glideTo(base + delta);
    }

    function onPress() {
      pressed = true;
      window.clearTimeout(rest);
    }

    function onRelease() {
      if (!pressed) return;
      pressed = false;
      settleSoon();
    }

    var observer = new ResizeObserver(schedule);
    observer.observe(root);
    observer.observe(inner);
    target.addEventListener("scroll", onScroll, { passive: true });
    target.addEventListener("wheel", onWheel, { passive: false });
    target.addEventListener("pointerdown", onPress, { passive: true });
    window.addEventListener("pointerup", onRelease, { passive: true });
    window.addEventListener("pointercancel", onRelease, { passive: true });
    window.addEventListener("resize", schedule);
    update();

    return function () {
      destroyed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(glide);
      window.clearTimeout(rest);
      observer.disconnect();
      target.removeEventListener("scroll", onScroll);
      target.removeEventListener("wheel", onWheel);
      target.removeEventListener("pointerdown", onPress);
      window.removeEventListener("pointerup", onRelease);
      window.removeEventListener("pointercancel", onRelease);
      window.removeEventListener("resize", schedule);
    };
  }

  global.initScrollStack = initScrollStack;
})(window);
