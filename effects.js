/* ESpice scroll effects: each "How to order" icon draws itself as it scrolls into view. */
(function () {
  "use strict";
  var steps = document.querySelector(".how-steps");
  if (!steps || !("IntersectionObserver" in window)) return;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var items = steps.querySelectorAll("li");
  steps.classList.add("anim");
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var i = Array.prototype.indexOf.call(items, e.target);
      var wide = window.innerWidth > 980;
      setTimeout(function () { e.target.classList.add("in"); }, wide ? i * 350 : 0);
      io.unobserve(e.target);
    });
  }, { threshold: 0.4 });
  Array.prototype.forEach.call(items, function (li) { io.observe(li); });
})();
