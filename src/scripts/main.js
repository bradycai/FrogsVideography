/* ============================================================================
 *  Frogs Videography — front-end behavior
 *  Loader · scroll progress · reveal-on-scroll · count-up stats ·
 *  lazy YouTube embeds · process timeline · mobile menu · smooth anchors ·
 *  ROI calculator.
 *  (Vanilla JS, no dependencies. Bundled by Astro.)
 * ========================================================================== */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---- Loader ---- */
  window.addEventListener('load', function () {
    setTimeout(
      function () {
        var l = document.getElementById('loader');
        if (l) l.classList.add('done');
        document.body.classList.remove('loading');
        startHeroVideo();
      },
      reduceMotion ? 150 : 1900
    );
  });
  setTimeout(function () {
    if (document.body.classList.contains('loading')) {
      var l = document.getElementById('loader');
      if (l) l.classList.add('done');
      document.body.classList.remove('loading');
      startHeroVideo();
    }
  }, 4000);

  /* ---- Hero background video ---- */
  function startHeroVideo() {
    var bg = document.getElementById('heroBg');
    if (!bg || bg.dataset.on) return;
    bg.dataset.on = '1';
    var id = bg.dataset.video;
    if (!id) return;
    var f = document.createElement('iframe');
    f.src =
      'https://www.youtube-nocookie.com/embed/' +
      id +
      '?autoplay=1&mute=1&controls=0&loop=1&playlist=' +
      id +
      '&playsinline=1&modestbranding=1&rel=0&showinfo=0&disablekb=1';
    f.allow = 'autoplay; encrypted-media';
    f.setAttribute('tabindex', '-1');
    f.setAttribute('aria-hidden', 'true');
    f.setAttribute('title', 'Frogs Videography showreel');
    bg.appendChild(f);
    setTimeout(function () {
      bg.classList.add('playing');
    }, 400);
  }

  /* ---- Scroll: sticky nav, progress bar, mobile CTA ---- */
  var nav = document.getElementById('nav'),
    progress = document.getElementById('progress'),
    sticky = document.getElementById('stickyCta'),
    hero = document.getElementById('hero');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('stuck', y > 40);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    if (sticky) {
      var hb = hero ? hero.offsetHeight - 140 : 600;
      sticky.classList.toggle('show', y > hb);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Reveal on scroll ---- */
  var io = new IntersectionObserver(
    function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );
  document.querySelectorAll('.reveal').forEach(function (el) {
    io.observe(el);
  });

  /* ---- Count-up stats ---- */
  var counted = new WeakSet();
  var cio = new IntersectionObserver(
    function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !counted.has(e.target)) {
          counted.add(e.target);
          runCount(e.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll('.count').forEach(function (el) {
    cio.observe(el);
  });
  function runCount(el) {
    var to = parseFloat(el.dataset.to) || 0,
      suffix = el.dataset.suffix || '',
      dur = 1500,
      start = null,
      isFloat = to % 1 !== 0;
    if (reduceMotion) {
      el.textContent = (isFloat ? to.toFixed(1) : to.toLocaleString()) + suffix;
      return;
    }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1),
        e = 1 - Math.pow(1 - p, 3),
        v = to * e;
      el.textContent = (isFloat ? v.toFixed(1) : Math.round(v).toLocaleString()) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = (isFloat ? to.toFixed(1) : Math.round(to).toLocaleString()) + suffix;
    }
    requestAnimationFrame(step);
  }

  /* ---- Lazy YouTube embeds (portfolio + reels) ---- */
  document.querySelectorAll('.vcard[data-yt]').forEach(function (card) {
    function load() {
      if (card.dataset.loaded) return;
      card.dataset.loaded = '1';
      var id = card.dataset.yt,
        ratio = card.querySelector('.ratio');
      var f = document.createElement('iframe');
      f.src =
        'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
      f.title = card.dataset.title || 'Frogs Videography video';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      ratio.appendChild(f);
    }
    card.addEventListener('click', load);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        load();
      }
    });
  });

  /* ---- Process timeline fill ---- */
  var timeline = document.getElementById('timeline'),
    tlFill = document.getElementById('tlFill'),
    steps = document.querySelectorAll('.step');
  if (timeline) {
    var sio = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) e.target.classList.add('active');
        });
      },
      { threshold: 0.5 }
    );
    steps.forEach(function (s) {
      sio.observe(s);
    });
    window.addEventListener(
      'scroll',
      function () {
        var r = timeline.getBoundingClientRect(),
          vh = window.innerHeight,
          prog = (vh * 0.5 - r.top) / r.height;
        prog = Math.max(0, Math.min(1, prog));
        if (tlFill) tlFill.style.height = prog * 100 + '%';
      },
      { passive: true }
    );
  }

  /* ---- Mobile menu ---- */
  var burger = document.getElementById('burger'),
    mm = document.getElementById('mobileMenu');
  if (burger && mm) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mm.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('menu-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Smooth in-page anchors ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      var t = document.querySelector(id);
      if (t) {
        e.preventDefault();
        t.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });

  /* ---- ROI calculator ---- */
  var fmt = function (n) {
    return '$' + Math.round(n).toLocaleString();
  };
  var fmtK = function (n) {
    n = Math.round(n);
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
    return n.toLocaleString();
  };
  var I = {
    org: document.getElementById('orgType'),
    vis: document.getElementById('visitors'),
    leads: document.getElementById('leads'),
    aud: document.getElementById('audience'),
    goal: document.getElementById('goal'),
  };
  var O = {
    big: document.getElementById('roiBig'),
    engage: document.getElementById('mEngage'),
    conv: document.getElementById('mConv'),
    give: document.getElementById('mGive'),
    giveLabel: document.getElementById('mGiveLabel'),
    life: document.getElementById('mLife'),
    reach: document.getElementById('mReach'),
    summary: document.getElementById('roiSummary'),
    goalLabel: document.querySelector('label[for="goal"]'),
    vV: document.getElementById('visitorsV'),
    lV: document.getElementById('leadsV'),
    aV: document.getElementById('audienceV'),
    gV: document.getElementById('goalV'),
  };
  function calc() {
    if (!I.vis) return;
    var org = I.org.value,
      vis = +I.vis.value,
      leads = +I.leads.value,
      aud = +I.aud.value,
      goal = +I.goal.value;
    if (O.vV) O.vV.textContent = vis.toLocaleString();
    if (O.lV) O.lV.textContent = leads.toLocaleString();
    if (O.aV) O.aV.textContent = aud.toLocaleString();
    if (O.gV) O.gV.textContent = fmt(goal);
    var isNP = org === 'nonprofit';
    if (O.goalLabel) O.goalLabel.childNodes[0].nodeValue = isNP ? 'Annual fundraising goal ' : 'Annual revenue goal ';
    if (O.giveLabel) O.giveLabel.textContent = isNP ? 'Added giving potential / yr' : 'Added revenue potential / yr';
    if (O.summary)
      O.summary.textContent = isNP
        ? 'More donors moved to give — through story.'
        : 'More customers moved to act — through story.';
    var engageLift = org === 'nonprofit' ? 0.62 : org === 'startup' ? 0.55 : org === 'event' ? 0.48 : 0.5;
    var newConv = leads * 12 * 0.2;
    var perOpp = Math.max(leads > 0 ? goal / (leads * 12) : goal / 600, 40);
    var addedValue = newConv * perOpp;
    var givePotential = goal * (isNP ? 0.18 : 0.15);
    var reachAdd = aud * 0.6 + vis * 2.4;
    var headline = addedValue * 0.55 + givePotential * 0.9;
    if (O.big) O.big.textContent = fmt(headline);
    if (O.engage) O.engage.textContent = '+' + Math.round(engageLift * 100) + '%';
    if (O.conv) O.conv.textContent = '+' + fmtK(newConv);
    if (O.give) O.give.textContent = fmt(givePotential);
    if (O.life) O.life.textContent = '3+ yrs';
    if (O.reach) O.reach.textContent = '+' + fmtK(reachAdd);
  }
    Object.keys(I).forEach(function (k) {
    if (I[k]) I[k].addEventListener('input', calc);
  });

  calc();

  /* ---- Services accordion ---- */
  var serviceItems = document.querySelectorAll('[data-svc]');

  serviceItems.forEach(function (item) {
    var button = item.querySelector('.svc-head');

    if (!button) return;

    button.addEventListener('click', function () {
      var shouldOpen = !item.classList.contains('open');

      serviceItems.forEach(function (otherItem) {
        otherItem.classList.remove('open');

        var otherButton = otherItem.querySelector('.svc-head');

        if (otherButton) {
          otherButton.setAttribute('aria-expanded', 'false');
        }
      });

      if (shouldOpen) {
        item.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();
