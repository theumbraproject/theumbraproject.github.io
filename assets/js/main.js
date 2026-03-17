(function(){
'use strict';

// ── SHARED HTML ──────────────────────────────────────────────
var HEADER = `
<header id="hdr">
  <a href="/index.html" class="logo">U<em>◆</em>MBRA</a>
  <button class="nav-toggle" id="navToggle" aria-label="Menu">
    <span></span><span></span><span></span>
  </button>
  <nav id="nav">
    <a href="/index.html">Home</a>
    <a href="/presence.html">Presence</a>
    <a href="/work.html">Work</a>
    <a href="/project.html">The Project</a>
    <a href="/contact.html">Signal</a>
  </nav>
</header>`;

var FOOTER = `
<footer>
  <div>
    <div class="footer-logo">U<em>◆</em>MBRA</div>
    <div class="footer-copy">© MMXXV · All rights withheld</div>
  </div>
  <a href="/contact.html" class="footer-signal">Initiate Signal →</a>
</footer>`;

var OVERLAY = `
<div id="vignette"></div>
<canvas id="liquid-bg"></canvas>
<canvas id="particles"></canvas>
<div class="corner tl"></div>
<div class="corner tr"></div>
<div class="corner bl"></div>
<div class="corner br"></div>
<div id="cur"></div>
<div id="cur-r"></div>`;

document.body.insertAdjacentHTML('afterbegin', OVERLAY);
var hs = document.getElementById('header-slot');
if(hs) hs.outerHTML = HEADER;
var fs = document.getElementById('footer-slot');
if(fs) fs.outerHTML = FOOTER;

// ── ACTIVE NAV ───────────────────────────────────────────────
var path = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('nav a').forEach(function(a){
  if(a.getAttribute('href').split('/').pop() === path) a.classList.add('active');
});

// ── CURSOR ───────────────────────────────────────────────────
var cur  = document.getElementById('cur');
var ring = document.getElementById('cur-r');
var mx = window.innerWidth/2, my = window.innerHeight/2;
var rx = mx, ry = my, curOn = false;

document.addEventListener('mousemove', function(e){
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx+'px'; cur.style.top = my+'px';
  if(!curOn){ curOn=true; cur.style.opacity='1'; ring.style.opacity='1'; }
});

(function raf(){
  rx += (mx-rx)*.1; ry += (my-ry)*.1;
  ring.style.left = rx+'px'; ring.style.top = ry+'px';
  requestAnimationFrame(raf);
})();

function applyHover(el){
  el.addEventListener('mouseenter',function(){ document.body.classList.add('hov'); });
  el.addEventListener('mouseleave',function(){ document.body.classList.remove('hov'); });
}
document.querySelectorAll('a,button,input,textarea,select,.filter-btn').forEach(applyHover);
new MutationObserver(function(){
  document.querySelectorAll('a,button,input,textarea,select,.filter-btn').forEach(applyHover);
}).observe(document.body,{childList:true,subtree:true});

// ── HEADER SCROLL ────────────────────────────────────────────
window.addEventListener('scroll',function(){
  var h=document.getElementById('hdr');
  if(h) h.classList.toggle('scrolled',window.scrollY>60);
},{passive:true});

// ── MOBILE NAV ───────────────────────────────────────────────
document.addEventListener('click',function(e){
  var tog=document.getElementById('navToggle');
  var nav=document.getElementById('nav');
  if(!tog||!nav) return;
  if(tog===e.target||tog.contains(e.target)){
    tog.classList.toggle('open'); nav.classList.toggle('open');
  } else if(nav.classList.contains('open')&&!nav.contains(e.target)){
    tog.classList.remove('open'); nav.classList.remove('open');
  }
});

// ── LIQUID BACKGROUND ────────────────────────────────────────
var lc = document.getElementById('liquid-bg');
if(lc){
  var lctx = lc.getContext('2d');
  var LW, LH;
  function resizeL(){ LW=lc.width=window.innerWidth; LH=lc.height=window.innerHeight; }
  resizeL();
  window.addEventListener('resize',resizeL,{passive:true});

  // Metaballs / fluid blobs
  var blobs = [];
  for(var i=0;i<7;i++){
    blobs.push({
      x: Math.random()*window.innerWidth,
      y: Math.random()*window.innerHeight,
      vx: (Math.random()-.5)*.4,
      vy: (Math.random()-.5)*.4,
      r: Math.random()*300+180,
      phase: Math.random()*Math.PI*2,
      speed: Math.random()*.003+.001
    });
  }

  function drawLiquid(){
    lctx.clearRect(0,0,LW,LH);
    blobs.forEach(function(b){
      b.phase += b.speed;
      b.x += b.vx + Math.sin(b.phase)*.5;
      b.y += b.vy + Math.cos(b.phase*.7)*.4;
      // Soft bounce
      if(b.x<-b.r) b.x=LW+b.r;
      if(b.x>LW+b.r) b.x=-b.r;
      if(b.y<-b.r) b.y=LH+b.r;
      if(b.y>LH+b.r) b.y=-b.r;

      var g = lctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);
      g.addColorStop(0,'rgba(14,10,8,0.55)');
      g.addColorStop(.4,'rgba(10,7,6,0.35)');
      g.addColorStop(.75,'rgba(8,5,5,0.15)');
      g.addColorStop(1,'rgba(5,5,5,0)');
      lctx.beginPath();
      lctx.ellipse(b.x,b.y,b.r,b.r*.7,b.phase*.3,0,Math.PI*2);
      lctx.fillStyle=g;
      lctx.fill();
    });

    // Iridescent oil-sheen streaks
    blobs.forEach(function(b,i){
      if(i%2!==0) return;
      var next = blobs[(i+1)%blobs.length];
      var dx=next.x-b.x, dy=next.y-b.y;
      var dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<600){
        var alpha=(1-dist/600)*.04;
        var g2=lctx.createLinearGradient(b.x,b.y,next.x,next.y);
        g2.addColorStop(0,'rgba(40,18,14,'+alpha+')');
        g2.addColorStop(.3,'rgba(20,10,8,'+(alpha*.6)+')');
        g2.addColorStop(.6,'rgba(30,12,10,'+(alpha*.8)+')');
        g2.addColorStop(1,'rgba(15,8,6,'+alpha+')');
        lctx.beginPath();
        lctx.moveTo(b.x,b.y);
        lctx.bezierCurveTo(
          b.x+dy*.3, b.y-dx*.3,
          next.x-dy*.3, next.y+dx*.3,
          next.x, next.y
        );
        lctx.strokeStyle=g2;
        lctx.lineWidth=Math.min(b.r,next.r)*.4;
        lctx.stroke();
      }
    });
    requestAnimationFrame(drawLiquid);
  }
  drawLiquid();
}

// ── AMBIENT PARTICLES ────────────────────────────────────────
var pc = document.getElementById('particles');
if(pc){
  var pctx=pc.getContext('2d'), PW, PH, pts=[];
  function resizeP(){ PW=pc.width=window.innerWidth; PH=pc.height=window.innerHeight; }
  resizeP();
  window.addEventListener('resize',resizeP,{passive:true});
  for(var j=0;j<55;j++) pts.push({
    x:Math.random()*window.innerWidth, y:Math.random()*window.innerHeight,
    vx:(Math.random()-.5)*.25, vy:(Math.random()-.5)*.25,
    r:Math.random()*1.2+.3, a:Math.random()*.35+.08
  });
  (function drawP(){
    pctx.clearRect(0,0,PW,PH);
    pts.forEach(function(p){
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0)p.x=PW; if(p.x>PW)p.x=0;
      if(p.y<0)p.y=PH; if(p.y>PH)p.y=0;
      pctx.beginPath(); pctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      pctx.fillStyle='rgba(192,57,43,'+p.a+')'; pctx.fill();
    });
    requestAnimationFrame(drawP);
  })();
}

// ── SCROLL REVEAL ────────────────────────────────────────────
var srObs=new IntersectionObserver(function(entries){
  entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('vis'); srObs.unobserve(e.target); }});
},{threshold:0.08});
document.querySelectorAll('.sr').forEach(function(el){ srObs.observe(el); });

// ── SPLIT SECTIONS ───────────────────────────────────────────
var splitObs=new IntersectionObserver(function(entries){
  entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('vis'); splitObs.unobserve(e.target); }});
},{threshold:0.12});
document.querySelectorAll('.split-section').forEach(function(el){ splitObs.observe(el); });

// ── WORD REVEAL ──────────────────────────────────────────────
var wObs=new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(e.isIntersecting){
      e.target.querySelectorAll('.reveal-word').forEach(function(w,i){
        setTimeout(function(){ w.classList.add('visible'); },i*120);
      });
      wObs.unobserve(e.target);
    }
  });
},{threshold:0.2});
document.querySelectorAll('.doctrine-heading').forEach(function(el){ wObs.observe(el); });

// ── SCRAMBLE TEXT ────────────────────────────────────────────
var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789◆·—';
function scramble(el, finalText, duration){
  var frames = Math.floor(duration/40);
  var frame  = 0;
  var id = setInterval(function(){
    var ratio = frame/frames;
    var resolved = Math.floor(ratio*finalText.length);
    var out = '';
    for(var i=0;i<finalText.length;i++){
      if(finalText[i]===' '){ out+=' '; continue; }
      if(i<resolved){ out+=finalText[i]; }
      else{ out+=CHARS[Math.floor(Math.random()*CHARS.length)]; }
    }
    el.textContent=out;
    frame++;
    if(frame>frames){ clearInterval(id); el.textContent=finalText; }
  },40);
}

// Apply scramble to elements with data-scramble on scroll
var scObs=new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(e.isIntersecting){
      var el=e.target;
      var txt=el.getAttribute('data-scramble');
      scramble(el,txt,900);
      scObs.unobserve(el);
    }
  });
},{threshold:0.5});
document.querySelectorAll('[data-scramble]').forEach(function(el){ scObs.observe(el); });

// ── STAT COUNTERS ────────────────────────────────────────────
var statObs=new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(e.isIntersecting){
      e.target.classList.add('vis');
      var numEl=e.target.querySelector('.count-num');
      if(!numEl){ statObs.unobserve(e.target); return; }
      var target=parseInt(numEl.getAttribute('data-target'),10);
      var suffix=numEl.getAttribute('data-suffix')||'';
      var dur=1800, start=null;
      function step(ts){
        if(!start) start=ts;
        var prog=Math.min((ts-start)/dur,1);
        var ease=1-Math.pow(1-prog,4); // ease-out-quart
        numEl.textContent=Math.floor(ease*target)+suffix;
        if(prog<1) requestAnimationFrame(step);
        else numEl.textContent=target+suffix;
      }
      requestAnimationFrame(step);
      statObs.unobserve(e.target);
    }
  });
},{threshold:0.4});
document.querySelectorAll('.stat-cell').forEach(function(el){ statObs.observe(el); });

// ── TYPED TEXT ───────────────────────────────────────────────
var tel=document.getElementById('typed-text');
if(tel){
  var phrases=[
    'The most durable structures are built by those who never appear in the photograph.',
    'Power exercised from the unseen position compounds without resistance.',
    'The shadow is not the absence of light. It is light, redirected.',
    'Build the thing that runs without you — then disappear.'
  ];
  var ti=0,ci=0,deleting=false,wait=0;
  function type(){
    if(wait>0){wait--;setTimeout(type,50);return;}
    var phrase=phrases[ti];
    if(!deleting){
      tel.textContent=phrase.slice(0,++ci);
      if(ci===phrase.length){deleting=true;wait=60;setTimeout(type,50);}
      else setTimeout(type,36);
    } else {
      tel.textContent=phrase.slice(0,--ci);
      if(ci===0){deleting=false;ti=(ti+1)%phrases.length;wait=12;setTimeout(type,50);}
      else setTimeout(type,16);
    }
  }
  var tObs=new IntersectionObserver(function(e){if(e[0].isIntersecting){type();tObs.disconnect();}},{threshold:.3});
  tObs.observe(tel.closest('section')||tel);
}

// ── PAGE TRANSITION ──────────────────────────────────────────
var overlay=document.createElement('div');
overlay.style.cssText='position:fixed;inset:0;background:#050505;z-index:99999;pointer-events:none;';
document.body.appendChild(overlay);
overlay.animate([{transform:'scaleY(1)',transformOrigin:'top'},{transform:'scaleY(0)',transformOrigin:'top'}],
  {duration:900,easing:'cubic-bezier(0.76,0,0.24,1)',fill:'forwards'});
document.addEventListener('click',function(e){
  var link=e.target.closest('a[href]');
  if(!link) return;
  var href=link.getAttribute('href');
  if(!href||href.startsWith('#')||href.startsWith('mailto')||href.startsWith('http')||href.startsWith('tel')) return;
  e.preventDefault();
  overlay.animate([{transform:'scaleY(0)',transformOrigin:'bottom'},{transform:'scaleY(1)',transformOrigin:'bottom'}],
    {duration:500,easing:'cubic-bezier(0.76,0,0.24,1)',fill:'forwards'});
  setTimeout(function(){window.location.href=href;},500);
});

// ── WORK FILTER ──────────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(function(btn){
  btn.addEventListener('click',function(){
    document.querySelectorAll('.filter-btn').forEach(function(b){b.classList.remove('active');});
    btn.classList.add('active');
    var f=btn.getAttribute('data-filter');
    document.querySelectorAll('.work-card').forEach(function(c){
      c.classList.toggle('hidden',f!=='all'&&c.getAttribute('data-cat')!==f);
    });
  });
});

// ── CONTACT FORM ─────────────────────────────────────────────
var form=document.getElementById('signalForm');
var conf=document.getElementById('formConfirm');
var err=document.getElementById('formError');
var sbtn=document.getElementById('submitBtn');
if(form&&conf){
  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(sbtn){sbtn.classList.add('sending');sbtn.textContent='Transmitting...';}
    if(err) err.classList.remove('show');
    fetch(form.action,{method:'POST',body:new FormData(form),headers:{'Accept':'application/json'}})
    .then(function(r){
      if(r.ok){
        form.style.transition='opacity .4s';form.style.opacity='0';
        setTimeout(function(){form.style.display='none';conf.classList.add('show');},400);
      } else throw new Error();
    })
    .catch(function(){
      if(sbtn){sbtn.classList.remove('sending');sbtn.textContent='Transmit →';}
      if(err) err.classList.add('show');
    });
  });
}

})();
