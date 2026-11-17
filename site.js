/* KTK · 启源显示 — site.js v16. Shared by Chinese and English pages. */
(function () {
  var en = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  var L = en
    ? { close: 'Close', prev: 'Previous', next: 'Next', none: 'No matching models.' }
    : { close: '关闭', prev: '上一张', next: '下一张', none: '没有找到匹配的机型。' };

  // ----- mobile menu -----
  var header = document.getElementById('site-header');
  // the home page header floats over the hero video and turns solid once scrolled
  if (header && document.body.classList.contains('home')) {
    var solid = function () {
      header.classList.toggle('solid', window.scrollY > 40 || header.classList.contains('open'));
    };
    window.addEventListener('scroll', solid, { passive: true });
    header.addEventListener('click', function () { setTimeout(solid, 0); });
    solid();
  }
  var burger = header && header.querySelector('.burger');
  if (burger) {
    var setOpen = function (open) {
      header.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    burger.addEventListener('click', function () { setOpen(!header.classList.contains('open')); });
    header.querySelectorAll('nav a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  // ----- home page: highlight the section being read -----
  var navLinks = [].slice.call(document.querySelectorAll('header nav a[data-spy]'));
  if (navLinks.length && 'IntersectionObserver' in window) {
    var home = document.querySelector('header nav a[data-home]');
    var seen = {};
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { seen[e.target.id] = e.isIntersecting; });
      var active = null;
      navLinks.forEach(function (a) { if (!active && seen[a.getAttribute('data-spy')]) active = a; });
      navLinks.forEach(function (a) { a.classList.toggle('on', a === active); });
      if (home) home.classList.toggle('on', !active);
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) {
      var sec = document.getElementById(a.getAttribute('data-spy'));
      if (sec) spy.observe(sec);
    });
  }

  // ----- reveal sections as they scroll into view -----
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = [].slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !still) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // ----- hero video: skip it for visitors who ask for reduced motion or data saving -----
  var heroVideo = document.querySelector('.banner video');
  if (heroVideo) {
    var saver = navigator.connection && navigator.connection.saveData;
    if (still || saver) {
      heroVideo.removeAttribute('autoplay');
      heroVideo.pause();
    } else {
      var tryPlay = heroVideo.play();
      if (tryPlay && tryPlay.catch) tryPlay.catch(function () {});
    }
  }

  // ----- factory film: plays with sound and controls after a click -----
  document.querySelectorAll('.film').forEach(function (film) {
    var v = film.querySelector('video');
    var b = film.querySelector('.play');
    if (!v || !b) return;
    b.addEventListener('click', function () {
      b.hidden = true;
      v.controls = true;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    });
  });

  // ----- model page gallery -----
  document.querySelectorAll('[data-gallery]').forEach(function (g) {
    var main = g.querySelector('.main img');
    var badge = g.querySelector('.main .badge');
    var buttons = [].slice.call(g.querySelectorAll('.thumbs button'));
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        main.src = b.getAttribute('data-src');
        main.alt = b.getAttribute('data-alt') || '';
        if (badge) badge.hidden = !b.hasAttribute('data-lit');
        buttons.forEach(function (x) { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); });
        b.classList.add('on');
        b.setAttribute('aria-pressed', 'true');
      });
    });
  });

  // ----- catalogue: series filter + search -----
  var grid = document.getElementById('grid');
  if (grid) {
    var cards = [].slice.call(grid.querySelectorAll('.product'));
    var tabs = [].slice.call(document.querySelectorAll('.side a[data-filter]'));
    var box = document.querySelector('.search input');
    var empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = L.none;
    empty.hidden = true;
    grid.appendChild(empty);
    var series = 'all';
    var apply = function () {
      var q = ((box && box.value) || '').toLowerCase().replace(/oled|iphone/g, '').replace(/\s+/g, ' ').trim();
      var shown = 0;
      cards.forEach(function (card) {
        var okSeries = series === 'all' || card.getAttribute('data-series') === series;
        var name = card.getAttribute('data-name');
        var okQ = !q || name.indexOf(q) !== -1 || name.replace(/ /g, '').indexOf(q.replace(/ /g, '')) !== -1;
        var ok = okSeries && okQ;
        card.hidden = !ok;
        if (ok) shown++;
      });
      empty.hidden = shown > 0;
    };
    tabs.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        series = a.getAttribute('data-filter');
        tabs.forEach(function (x) { x.classList.toggle('on', x === a); });
        apply();
      });
    });
    if (box) {
      box.value = new URLSearchParams(location.search).get('q') || '';
      box.addEventListener('input', apply);
      box.form.addEventListener('submit', function (e) { e.preventDefault(); apply(); box.blur(); });
    }
    apply();
  }

  // ----- map: load only when it is about to be seen -----
  // The Baidu map page grabs focus on load, which drags the whole page down to it,
  // so hold the scroll position for a moment unless the visitor moves it themselves.
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

  // ----- lightbox for workshop photos -----
  document.querySelectorAll('[data-zoom]').forEach(function (zone) {
    var imgs = [].slice.call(zone.querySelectorAll('img'));
    if (!imgs.length) return;
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.hidden = true;
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = '<button class="lb-close" aria-label="' + L.close + '">×</button>' +
      '<button class="lb-prev" aria-label="' + L.prev + '">‹</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="lb-next" aria-label="' + L.next + '">›</button>';
    document.body.appendChild(lb);
    var big = lb.querySelector('img');
    var cap = lb.querySelector('figcaption');
    var at = 0;
    var opener = null;
    function show(i) {
      at = (i + imgs.length) % imgs.length;
      var src = imgs[at];
      big.src = src.currentSrc || src.src;
      big.alt = src.alt;
      var art = src.closest('article');
      var h = art && art.querySelector('h3');
      cap.textContent = (h ? h.textContent + ' · ' : '') + src.alt;
    }
    function open(i) {
      opener = document.activeElement;
      show(i);
      lb.hidden = false;
      document.body.classList.add('lb-open');
      lb.querySelector('.lb-close').focus();
    }
    function close() {
      lb.hidden = true;
      document.body.classList.remove('lb-open');
      if (opener && opener.focus) opener.focus();
    }
    imgs.forEach(function (img, i) {
      img.classList.add('zoomable');
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.addEventListener('click', function () { open(i); });
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
      });
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
