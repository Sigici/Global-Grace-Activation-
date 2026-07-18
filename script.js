/* ============================================================
   GLOBAL GRACE ACTIVATION — shared behaviour
   ============================================================ */
(function(){

  /* ---------- Navbar: scroll state + mobile menu + active link ---------- */
  const nav = document.querySelector('.nav');
  const burger = document.querySelector('.nav-burger');
  const links = document.querySelector('.nav-links');

  function onScroll(){
    if(!nav) return;
    if(window.scrollY > 30) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  if(burger && links){
    burger.addEventListener('click', () => {
      burger.classList.toggle('is-open');
      links.classList.toggle('is-open');
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      burger.classList.remove('is-open');
      links.classList.remove('is-open');
    }));
  }

  // mark active nav link based on current file
  const page = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a').forEach(a=>{
    const href = a.getAttribute('href');
    if(href === page || (page === '' && href === 'index.html')) a.classList.add('active');
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if('IntersectionObserver' in window && revealEls.length){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, {threshold:.14, rootMargin:'0px 0px -60px 0px'});
    revealEls.forEach(el=>io.observe(el));
  } else {
    revealEls.forEach(el=>el.classList.add('in'));
  }

  /* ---------- Countdown timer (real, live) ---------- */
  // Target: GGA Global Conference — 4 Dec 2026, 6:00 PM WAT
  const EVENT_DATE = new Date('2026-12-04T18:00:00+01:00').getTime();

  function paint(id, value){
    const el = document.getElementById(id);
    if(el) el.textContent = String(Math.max(0,value)).padStart(2,'0');
  }

  function tickCountdown(){
    const now = Date.now();
    let diff = EVENT_DATE - now;
    if(diff < 0) diff = 0;
    const days = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor((diff / (1000*60*60)) % 24);
    const mins = Math.floor((diff / (1000*60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    paint('cd-days', days);
    paint('cd-hours', hours);
    paint('cd-mins', mins);
    paint('cd-secs', secs);
  }
  if(document.getElementById('cd-days')){
    tickCountdown();
    setInterval(tickCountdown, 1000);
  }

  /* ---------- Hero load-in sequence ---------- */
  window.addEventListener('DOMContentLoaded', () => {
    const seq = [
      '.hero-flame-word',
      '.hero .split-line span',
      'p.lede',
      '.hero-cta-row',
      '.hero-panel'
    ];
    let delay = 200;
    seq.forEach((sel, i)=>{
      document.querySelectorAll(sel).forEach((el, idx)=>{
        setTimeout(()=>{
          el.style.transition = 'opacity .9s cubic-bezier(.16,.8,.24,1), transform .9s cubic-bezier(.16,.8,.24,1)';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, delay + idx*90);
      });
      delay += (sel.includes('split-line') ? 90 : 160);
    });
  });

  /* ---------- Ember particle canvas on hero ---------- */
  const canvas = document.getElementById('ember-canvas');
  if(canvas && canvas.getContext){
    const ctx = canvas.getContext('2d');
    let w,h,particles;
    const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize(){
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    }
    function makeParticles(){
      const count = REDUCE ? 0 : Math.min(70, Math.floor(w/28));
      particles = Array.from({length:count}, () => spawn());
    }
    function spawn(){
      return {
        x: Math.random()*w,
        y: h + Math.random()*100,
        r: (Math.random()*2.2+0.6) * devicePixelRatio,
        speed: (Math.random()*0.6+0.25) * devicePixelRatio,
        drift: (Math.random()-0.5)*0.5,
        alpha: Math.random()*0.5+0.15,
        hue: Math.random() > 0.25 ? '47,214,126' : '245,185,66'
      };
    }
    function frame(){
      ctx.clearRect(0,0,w,h);
      particles.forEach(p=>{
        p.y -= p.speed;
        p.x += p.drift;
        if(p.y < -20){ Object.assign(p, spawn(), {y: h+20}); }
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle = `rgba(${p.hue},${p.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(frame);
    }
    resize(); makeParticles();
    window.addEventListener('resize', ()=>{ resize(); makeParticles(); });
    if(!REDUCE) requestAnimationFrame(frame);
  }

  /* ---------- Toast helper ---------- */
  window.gcToast = function(msg){
    let t = document.querySelector('.toast');
    if(!t){
      t = document.createElement('div');
      t.className = 'toast';
      t.innerHTML = '<span class="dot-ok"></span><span class="msg"></span>';
      document.body.appendChild(t);
    }
    t.querySelector('.msg').textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(()=>t.classList.remove('show'), 3200);
  };

  /* ---------- Generic form intercept (newsletter, contact, volunteer, prayer, register) ---------- */
  document.querySelectorAll('form[data-fake-submit]').forEach(form=>{
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const msg = form.getAttribute('data-success') || 'Thank you — received!';
      window.gcToast(msg);
      form.reset();
    });
  });

  /* ---------- Accordion (FAQs) ---------- */
  document.querySelectorAll('.accordion-item').forEach(item=>{
    const btn = item.querySelector('button');
    const body = item.querySelector('.a-body');
    if(!btn||!body) return;
    btn.addEventListener('click', ()=>{
      const isOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.accordion-item').forEach(i=>{
        i.classList.remove('open');
        i.querySelector('.a-body').style.maxHeight = null;
      });
      if(!isOpen){
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Tabs (Events / Blog / Testimonies filters) ---------- */
  document.querySelectorAll('[data-tabs]').forEach(group=>{
    const buttons = group.querySelectorAll('.tab-btn');
    const targetSel = group.getAttribute('data-tabs');
    const items = document.querySelectorAll(targetSel + ' [data-cat]');
    buttons.forEach(b=>{
      b.addEventListener('click', ()=>{
        buttons.forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        const cat = b.getAttribute('data-filter');
        items.forEach(it=>{
          const show = cat === 'all' || it.getAttribute('data-cat') === cat;
          it.style.display = show ? '' : 'none';
        });
      });
    });
  });

  /* ---------- Give: amount + frequency selection ---------- */
  document.querySelectorAll('.give-amounts').forEach(group=>{
    group.querySelectorAll('.amt-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        group.querySelectorAll('.amt-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const customInput = group.parentElement.querySelector('.custom-amount');
        if(customInput) customInput.value = btn.dataset.amt === 'custom' ? '' : btn.textContent.replace(/[^\d]/g,'');
      });
    });
  });
  document.querySelectorAll('.give-toggle').forEach(toggle=>{
    toggle.querySelectorAll('button').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        toggle.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  });
  document.querySelectorAll('[data-give-cta]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.preventDefault();
      window.gcToast('Redirecting to secure checkout…');
    });
  });

  /* ---------- Watch Live: demo chat ---------- */
  const chatForm = document.getElementById('live-chat-form');
  if(chatForm){
    const box = document.getElementById('live-chat-messages');
    chatForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const input = chatForm.querySelector('input');
      if(!input.value.trim()) return;
      const div = document.createElement('div');
      div.className = 'chat-msg';
      div.innerHTML = `<b>You:</b> ${input.value.replace(/</g,'&lt;')}`;
      box.appendChild(div);
      box.scrollTop = box.scrollHeight;
      input.value = '';
    });
  }

  /* ---------- Gallery lightbox (simple caption toast) ---------- */
  document.querySelectorAll('.gallery-item').forEach(item=>{
    item.addEventListener('click', ()=>{
      window.gcToast(item.dataset.caption || 'Opening media…');
    });
  });

})();
