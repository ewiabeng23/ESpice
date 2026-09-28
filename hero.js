/* ESpice rotating hero: finds photos named hero-1, hero-2 ... in the images folder
   (.jpg, .jpeg, .png or .webp) and crossfades between them.
   Nothing to edit here: just add or remove photos in the images folder. */
(function () {
  "use strict";
  var hero = document.querySelector(".hero");
  if (!hero) return;
  var S = (window.Shop && Shop.SHOP) || {};
  var MAX = 6, EXTS = ["jpg", "jpeg", "png", "webp"], SLIDE_MS = 6500;
  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function probe(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(src); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }
  function findPhoto(n) {
    var i = 0;
    function next() {
      if (i >= EXTS.length) return Promise.resolve(null);
      return probe("images/hero-" + n + "." + EXTS[i++]).then(function (ok) { return ok || next(); });
    }
    return next();
  }

  var list = [];
  for (var n = 1; n <= MAX; n++) list.push(findPhoto(n));
  Promise.all(list).then(function (found) {
    var photos = found.filter(Boolean);
    if (photos.length) build(photos);
  });

  function build(photos) {
    var slides = document.createElement("div");
    slides.className = "hero-slides";
    slides.setAttribute("aria-hidden", "true");
    slides.innerHTML = photos.map(function (src) {
      return '<div class="hero-slide" style="background-image:url(\'' + src + '\')"></div>';
    }).join("") + '<div class="hero-shade"></div>';
    hero.insertBefore(slides, hero.firstChild);
    hero.classList.add("has-slides");

    var extras = document.createElement("div");
    extras.className = "hero-extras";
    var bars = photos.length > 1 ? '<div class="hero-progress" role="group" aria-label="Photos">' + photos.map(function (_, i) {
      return '<button type="button" aria-label="Show photo ' + (i + 1) + '"><span></span></button>';
    }).join("") + "</div>" : "";
    var social = '<div class="hero-social">' +
      (S.instagram ? '<a href="' + S.instagram + '" target="_blank" rel="noopener">Instagram</a>' : "") +
      (S.tiktok ? '<a href="' + S.tiktok + '" target="_blank" rel="noopener">TikTok</a>' : "") + "</div>";
    var scroll = '<a class="hero-scroll" href="#menu" aria-label="Scroll to the menu"><svg viewBox="0 0 24 48" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v38M5 35l7 8 7-8"/></svg></a>';
    extras.innerHTML = bars + social + scroll;
    hero.appendChild(extras);

    var slideEls = slides.querySelectorAll(".hero-slide");
    var barEls = extras.querySelectorAll(".hero-progress button");
    var current = -1, timer = null, visible = true;
    hero.style.setProperty("--slide-ms", SLIDE_MS + "ms");

    function show(i) {
      if (i === current) return;
      if (current >= 0) { slideEls[current].classList.remove("is-active"); if (barEls[current]) barEls[current].classList.remove("is-active"); }
      current = i;
      slideEls[i].classList.add("is-active");
      if (barEls[i]) { barEls[i].classList.remove("is-active"); void barEls[i].offsetWidth; barEls[i].classList.add("is-active"); }
    }
    function schedule() {
      clearTimeout(timer);
      if (reduceMotion || photos.length < 2 || !visible || document.hidden) return;
      timer = setTimeout(function () { show((current + 1) % photos.length); schedule(); }, SLIDE_MS);
    }
    Array.prototype.forEach.call(barEls, function (b, i) {
      b.addEventListener("click", function () { show(i); schedule(); });
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; schedule(); }).observe(hero);
    }
    document.addEventListener("visibilitychange", schedule);
    if (reduceMotion) hero.classList.add("still");
    show(0); schedule();
  }
})();
