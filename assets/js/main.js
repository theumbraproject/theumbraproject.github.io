/* UMBRA — main.js */
(function () {

  /* ── CURSOR ──────────────────────────────────────── */
  var dot  = document.getElementById('umbra-cur');
  var ring = document.getElementById('umbra-ring');
  var mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function rafRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(rafRing);
  })();

  document.querySelectorAll('a, button, .filter-btn').forEach(function (el) {
    el.addEventListener('mouseenter', function () { document.body.classList.add('hov'); });
    el.addEventListener('mouseleave', function () { document.body.classList.remove('hov'); });
  });

  /* ── HEADER ──────────────────────────────────────── */
  var hdr = document.getElementById('site-header');
  window.addEventListener('scroll', function () {
    if (hdr) hdr.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  /* ── MOBILE NAV ──────────────────────────────────── */
  var navToggle = document.getElementById('nav-toggle');
  var siteNav   = document.getElementById('site-nav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('open');
      siteNav.classList.toggle('open');
    });
    siteNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navToggle.classList.remove('open');
        siteNav.classList.remove('open');
      });
    });
  }

  /* ── ACTIVE NAV LINK ─────────────────────────────── */
  var page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#site-nav a').forEach(function (a) {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });

  /* ── SCROLL REVEAL ───────────────────────────────── */
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('on');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal, .split-l, .split-r').forEach(function (el) {
    revealObs.observe(el);
  });

  /* ── WORD REVEAL ─────────────────────────────────── */
  var wordObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.word-wrap').forEach(function (w, i) {
          setTimeout(function () { w.classList.add('on'); }, i * 110);
        });
        wordObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.doctrine-heading').forEach(function (el) {
    wordObs.observe(el);
  });

  /* ── STAT COUNTERS ───────────────────────────────── */
  var statObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var cell = entry.target;
      cell.classList.add('on');
      var el = cell.querySelector('[data-count]');
      if (el) {
        var target = +el.getAttribute('data-count');
        var suffix = el.getAttribute('data-suffix') || '';
        var start = performance.now();
        var dur = 1800;
        (function step(now) {
          var p = Math.min((now - start) / dur, 1);
          var ease = 1 - Math.pow(1 - p, 4);
          el.textContent = Math.floor(ease * target) + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        })(start);
      }
      statObs.unobserve(cell);
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.stat-cell').forEach(function (el) { statObs.observe(el); });

  /* ── TYPED TEXT ──────────────────────────────────── */
  var typedEl = document.getElementById('typed-cursor');
  if (typedEl) {
    var phrases = [
      'The most durable structures are built by those who never appear in the photograph.',
      'Power exercised from the unseen position compounds without resistance.',
      'The shadow is not the absence of light. It is light, redirected.',
      'Build the thing that runs without you — then disappear.'
    ];
    var ti = 0, ci = 0, deleting = false, waiting = 0, started = false;

    function tick() {
      if (waiting > 0) { waiting--; setTimeout(tick, 50); return; }
      var phrase = phrases[ti];
      if (!deleting) {
        typedEl.textContent = phrase.slice(0, ++ci);
        if (ci === phrase.length) { deleting = true; waiting = 55; setTimeout(tick, 50); }
        else setTimeout(tick, 38);
      } else {
        typedEl.textContent = phrase.slice(0, --ci);
        if (ci === 0) { deleting = false; ti = (ti + 1) % phrases.length; waiting = 10; setTimeout(tick, 50); }
        else setTimeout(tick, 18);
      }
    }

    var typedObs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !started) { started = true; tick(); typedObs.disconnect(); }
    }, { threshold: 0.3 });
    typedObs.observe(typedEl.closest('section') || typedEl);
  }

  /* ── WORK FILTER ─────────────────────────────────── */
  document.querySelectorAll('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('on'); });
      btn.classList.add('on');
      var f = btn.getAttribute('data-filter');
      document.querySelectorAll('.work-card').forEach(function (card) {
        card.classList.toggle('hidden', f !== 'all' && card.getAttribute('data-cat') !== f);
      });
    });
  });

  /* ── CONTACT FORM ────────────────────────────────── */
  var form = document.getElementById('signal-form');
  var conf = document.getElementById('form-confirm');
  var errEl = document.getElementById('form-error');
  var sbtn  = document.getElementById('submit-btn');
  if (form && conf) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sbtn) { sbtn.textContent = 'Transmitting...'; sbtn.style.opacity = '0.6'; sbtn.style.pointerEvents = 'none'; }
      if (errEl) errEl.classList.remove('show');
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (r) {
          if (r.ok) {
            form.style.opacity = '0'; form.style.transition = 'opacity 0.4s';
            setTimeout(function () { form.style.display = 'none'; conf.classList.add('show'); }, 400);
          } else throw new Error();
        })
        .catch(function () {
          if (sbtn) { sbtn.textContent = 'Transmit →'; sbtn.style.opacity = ''; sbtn.style.pointerEvents = ''; }
          if (errEl) errEl.classList.add('show');
        });
    });
  }

  /* ── PAGE TRANSITION ─────────────────────────────── */
  var wipe = document.getElementById('page-wipe');
  if (wipe) {
    wipe.animate([{ transform: 'scaleY(1)', transformOrigin: 'top' }, { transform: 'scaleY(0)', transformOrigin: 'top' }],
      { duration: 800, easing: 'cubic-bezier(0.76,0,0.24,1)', fill: 'forwards' });

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;
      e.preventDefault();
      wipe.style.transform = 'scaleY(0)';
      wipe.animate([{ transform: 'scaleY(0)', transformOrigin: 'bottom' }, { transform: 'scaleY(1)', transformOrigin: 'bottom' }],
        { duration: 480, easing: 'cubic-bezier(0.76,0,0.24,1)', fill: 'forwards' });
      setTimeout(function () { window.location.href = href; }, 480);
    });
  }

  /* ── LIQUID BACKGROUND ───────────────────────────── */
  var lc = document.getElementById('fx-liquid');
  if (lc) {
    var lx = lc.getContext('2d'), LW, LH, blobs = [];
    function resizeL() { LW = lc.width = window.innerWidth; LH = lc.height = window.innerHeight; }
    resizeL();
    window.addEventListener('resize', resizeL, { passive: true });
    for (var i = 0; i < 7; i++) blobs.push({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 280 + 160, ph: Math.random() * Math.PI * 2, spd: Math.random() * 0.003 + 0.001
    });
    (function drawL() {
      lx.clearRect(0, 0, LW, LH);
      blobs.forEach(function (b) {
        b.ph += b.spd;
        b.x += b.vx + Math.sin(b.ph) * 0.4;
        b.y += b.vy + Math.cos(b.ph * 0.7) * 0.3;
        if (b.x < -b.r) b.x = LW + b.r; if (b.x > LW + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = LH + b.r; if (b.y > LH + b.r) b.y = -b.r;
        var g = lx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, 'rgba(16,10,8,0.58)');
        g.addColorStop(0.45, 'rgba(10,7,6,0.35)');
        g.addColorStop(0.8, 'rgba(7,5,5,0.12)');
        g.addColorStop(1, 'rgba(5,5,5,0)');
        lx.beginPath();
        lx.ellipse(b.x, b.y, b.r, b.r * 0.68, b.ph * 0.3, 0, Math.PI * 2);
        lx.fillStyle = g; lx.fill();
      });
      requestAnimationFrame(drawL);
    })();
  }

  /* ── PARTICLES ───────────────────────────────────── */
  var pc = document.getElementById('fx-particles');
  if (pc) {
    var px = pc.getContext('2d'), PW, PH, pts = [];
    function resizeP() { PW = pc.width = window.innerWidth; PH = pc.height = window.innerHeight; }
    resizeP();
    window.addEventListener('resize', resizeP, { passive: true });
    for (var j = 0; j < 55; j++) pts.push({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.1 + 0.3, a: Math.random() * 0.28 + 0.07
    });
    (function drawP() {
      px.clearRect(0, 0, PW, PH);
      pts.forEach(function (p) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = PW; if (p.x > PW) p.x = 0;
        if (p.y < 0) p.y = PH; if (p.y > PH) p.y = 0;
        px.beginPath(); px.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        px.fillStyle = 'rgba(192,57,43,' + p.a + ')'; px.fill();
      });
      requestAnimationFrame(drawP);
    })();
  }

})();
