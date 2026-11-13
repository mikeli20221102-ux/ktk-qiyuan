(function () {
  var header = document.getElementById('site-header');
  var layers = [].slice.call(document.querySelectorAll('.parallax'));
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function onScroll() {
    if (header && !document.body.classList.contains('inner')) {
      header.classList.toggle('solid', window.scrollY > 80);
    }
    if (still) return;
    layers.forEach(function (img) {
      var box = img.parentElement.getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight) return;
      var t = (box.top + box.height / 2 - innerHeight / 2) / innerHeight;
      img.style.transform = 'translateY(' + (t * -8 - 8) + '%)';
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var items = [].slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !still) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  document.querySelectorAll('[data-gallery]').forEach(function (g) {
    var main = g.querySelector('.main img');
    var badge = g.querySelector('.main .badge');
    g.querySelectorAll('.thumbs button').forEach(function (b) {
      b.addEventListener('click', function () {
        main.src = b.getAttribute('data-src');
        main.alt = b.getAttribute('data-alt') || '';
        if (badge) badge.hidden = !b.hasAttribute('data-lit');
        g.querySelectorAll('.thumbs button').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
      });
    });
  });

  // The Baidu map page grabs focus on load, which drags the whole page down to it.
  var map = document.querySelector('.map iframe[data-src]');
  if (map) {
    var userMoved = false;
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) {
      window.addEventListener(ev, function () { userMoved = true; }, { passive: true });
    });
    var loadMap = function () {
      var y = window.scrollY;
      userMoved = false;
      var hold = function () { if (!userMoved && Math.abs(window.scrollY - y) > 40) window.scrollTo(0, y); };
      window.addEventListener('scroll', hold, { passive: true });
      setTimeout(function () { window.removeEventListener('scroll', hold); }, 4000);
      map.src = map.getAttribute('data-src');
    };
    if ('IntersectionObserver' in window) {
      var mo = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { mo.disconnect(); loadMap(); }
      }, { rootMargin: '200px 0px' });
      mo.observe(map);
    } else {
      window.addEventListener('load', loadMap);
    }
  }

  document.querySelectorAll('[data-zoom]').forEach(function (box) {
    var imgs = [].slice.call(box.querySelectorAll('img'));
    if (!imgs.length) return;
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.hidden = true;
    lb.innerHTML = '<button class="lb-close" aria-label="关闭">×</button>' +
      '<button class="lb-prev" aria-label="上一张">‹</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="lb-next" aria-label="下一张">›</button>';
    document.body.appendChild(lb);
    var big = lb.querySelector('img');
    var cap = lb.querySelector('figcaption');
    var at = 0;
    function show(i) {
      at = (i + imgs.length) % imgs.length;
      var src = imgs[at];
      big.src = src.currentSrc || src.src;
      big.alt = src.alt;
      var h = src.closest('article') && src.closest('article').querySelector('h3');
      cap.textContent = (h ? h.textContent + ' · ' : '') + src.alt;
    }
    function open(i) { show(i); lb.hidden = false; document.body.classList.add('lb-open'); }
    function close() { lb.hidden = true; document.body.classList.remove('lb-open'); }
    imgs.forEach(function (img, i) {
      img.classList.add('zoomable');
      img.addEventListener('click', function () { open(i); });
    });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); show(at - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); show(at + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.tagName === 'FIGURE') close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(at - 1);
      if (e.key === 'ArrowRight') show(at + 1);
    });
  });
})();
