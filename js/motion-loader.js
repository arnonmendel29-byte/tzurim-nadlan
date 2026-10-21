(function (global) {
  var desktop = global.matchMedia("(min-width: 861px)").matches;
  var reduce = global.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!desktop || reduce) {
    global.__motionReady = Promise.resolve(false);
    return;
  }

  var base = "https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/";
  var files = ["gsap.min.js", "ScrollTrigger.min.js"];

  global.__motionReady = Promise.all(
    files.map(function (file) {
      return new Promise(function (resolve) {
        var script = document.createElement("script");
        script.src = base + file;
        script.onload = function () {
          resolve(true);
        };
        script.onerror = function () {
          resolve(false);
        };
        document.head.appendChild(script);
      });
    })
  ).then(function () {
    return typeof global.gsap !== "undefined";
  });
})(window);
