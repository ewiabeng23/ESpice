/* ESpice dish photos: a thumbnail on each dish, tap to browse all its photos.
   Photos are listed per dish in shop.js as  images: ["images/...", ...]  */
(function () {
  "use strict";
  if (!window.Shop) return;
  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/></svg>';
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';

  var dlg = document.createElement("dialog");
  dlg.className = "lightbox";
  dlg.setAttribute("aria-label", "Dish photos");
  dlg.innerHTML =
    '<div class="lb-stage"><img class="lb-img" alt="">' +
    '<button type="button" class="lb-nav lb-prev" aria-label="Previous photo">' + ARROW + '</button>' +
    '<button type="button" class="lb-nav lb-next" aria-label="Next photo">' + ARROW + '</button>' +
    '<button type="button" class="lb-close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
    '<div class="lb-foot"><div class="lb-text"><p class="lb-name"></p><p class="lb-meta"></p></div>' +
    '<div class="lb-dots"></div><button type="button" class="lb-add">Add to order</button></div>';
  document.body.appendChild(dlg);

  var img = dlg.querySelector(".lb-img"), dots = dlg.querySelector(".lb-dots"), cur = null, idx = 0;

  function render() {
    var list = cur.images;
    img.classList.remove("in");
    img.src = list[idx];
    img.alt = cur.name + ", photo " + (idx + 1) + " of " + list.length;
    void img.offsetWidth;
    img.classList.add("in");
    dlg.querySelector(".lb-meta").textContent = Shop.formatPrice(cur.price) + (list.length > 1 ? "     Photo " + (idx + 1) + " of " + list.length : "");
    dots.innerHTML = list.length > 1 ? list.map(function (_, i) {
      return '<button type="button" aria-label="Photo ' + (i + 1) + '"' + (i === idx ? ' aria-current="true"' : "") + "></button>";
    }).join("") : "";
    dlg.classList.toggle("single", list.length < 2);
    [idx + 1, idx - 1].forEach(function (i) { new Image().src = list[(i + list.length) % list.length]; });
  }
  function go(d) { idx = (idx + d + cur.images.length) % cur.images.length; render(); }
  function open(item) {
    cur = item; idx = 0;
    dlg.querySelector(".lb-name").textContent = item.name;
    render();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }
  function close() { if (dlg.close) dlg.close(); else dlg.removeAttribute("open"); }

  dlg.querySelector(".lb-prev").addEventListener("click", function () { go(-1); });
  dlg.querySelector(".lb-next").addEventListener("click", function () { go(1); });
  dlg.querySelector(".lb-close").addEventListener("click", close);
  dots.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    idx = Array.prototype.indexOf.call(dots.children, b); render();
  });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });
  dlg.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  });
  var x0 = null;
  img.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
  img.addEventListener("pointerup", function (e) {
    if (x0 === null) return;
    var dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  });
  dlg.querySelector(".lb-add").addEventListener("click", function () {
    var id = cur.id; close();
    var btn = document.querySelector('#menuList [data-add="' + id + '"]');
    if (btn) btn.click();
  });

  Shop.MENU.forEach(function (c) {
    c.items.forEach(function (item) {
      var list = item.images || (item.image ? [item.image] : []);
      if (!list.length) return;
      item.images = list;
      var add = document.querySelector('#menuList [data-add="' + item.id + '"]');
      var li = add && add.closest(".item");
      if (!li) return;
      var old = li.querySelector("img.item-photo");
      if (old) old.remove();
      var b = document.createElement("button");
      b.type = "button";
      b.className = "item-thumb";
      b.setAttribute("aria-label", "View photos of " + item.name);
      b.innerHTML = '<img class="item-photo" src="' + list[0] + '" alt="" loading="lazy">' +
        (list.length > 1 ? '<span class="count">' + ICON + list.length + "</span>" : "");
      b.addEventListener("click", function () { open(item); });
      li.insertBefore(b, li.firstChild);
    });
  });
})();
