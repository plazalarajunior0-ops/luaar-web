/* LUAAR · landing — motion (GSAP + ScrollTrigger, sin Lenis) */
(function(){
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = window.gsap && window.ScrollTrigger;
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ---------- split de palabras ---------- */
  function splitWords(el){
    var frag = document.createDocumentFragment();
    function pushText(txt, target){
      var parts = txt.split(/(\s+)/);
      parts.forEach(function(p){
        if (p === '') return;
        if (/^\s+$/.test(p)) { target.appendChild(document.createTextNode(p)); }
        else { var s = document.createElement('span'); s.className = 'w'; s.textContent = p; target.appendChild(s); }
      });
    }
    Array.prototype.forEach.call(el.childNodes, function(node){
      if (node.nodeType === 3) { pushText(node.textContent, frag); }
      else if (node.nodeType === 1) {
        var clone = node.cloneNode(false);
        Array.prototype.forEach.call(node.childNodes, function(cn){
          if (cn.nodeType === 3) pushText(cn.textContent, clone);
          else clone.appendChild(cn.cloneNode(true));
        });
        frag.appendChild(clone);
      }
    });
    el.textContent = '';
    el.appendChild(frag);
    return el.querySelectorAll('.w');
  }

  var body = document.body;
  var loader = document.getElementById('loader');

  /* ==========================================================
     Sin GSAP o con reduced-motion: dejar todo visible y salir
     ========================================================== */
  if (!hasGSAP || reduce) {
    if (loader) loader.style.display = 'none';
    if (reduce) {
      // mostrar posters: detener videos ambientales
      document.querySelectorAll('video').forEach(function(v){
        v.removeAttribute('autoplay'); try { v.pause(); v.currentTime = 0; } catch(e){}
      });
    }
    setupMenu();
    setupCtaBarFallback();
    setupFaqFallback();
    return;
  }

  /* ==========================================================
     HERO — timeline de entrada (en pausa hasta cerrar loader)
     ========================================================== */
  var heroTl = gsap.timeline({ paused: true });
  (function heroSetup(){
    gsap.set('#top', { opacity: 0 });
    var l1 = splitWords(document.querySelector('.hero__line--1'));
    var l2 = splitWords(document.querySelector('.hero__line--2'));
    var media = document.querySelector('.hero__media');
    var video = document.querySelector('.hero__video');
    var lead = document.querySelector('.hero__lead');
    var cta = document.querySelector('.hero__cta');

    gsap.set(media, { xPercent: -50, yPercent: -50 });
    gsap.set([l1, l2], { y: 60, opacity: 0 });
    gsap.set(video, { scale: 0.9, rotate: -8, opacity: 0, transformOrigin: 'center center' });
    gsap.set([lead, cta], { y: 24, opacity: 0 });

    heroTl.to('#top', { opacity: 1, duration: 0.6, ease: 'power2.out' })
      .to(l1, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.08 }, '-=0.2')
      .to(video, { scale: 1, rotate: -4, opacity: 1, duration: 1.2, ease: 'power3.out' }, '<')
      .to(l2, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.08 }, '<')
      .to([lead, cta], { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.1 }, '-=0.8');

    // parallax leve
    gsap.to(video, { yPercent: -12, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__line--1', { yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__line--2', { yPercent: -3, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });

    // indicador scroll (bucle)
    gsap.fromTo('.hero__scroll i', { scaleY: 0 },
      { scaleY: 1, transformOrigin: 'top center', duration: 1.4, ease: 'power1.inOut', repeat: -1 });
  })();

  /* ==========================================================
     LOADER — retirar en fonts.ready (máx 2.5s)
     ========================================================== */
  var loaderGone = false;
  function hideLoader(){
    if (loaderGone) return; loaderGone = true;
    gsap.to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'power4.inOut',
      onComplete: function(){ loader.style.display = 'none'; heroTl.play(); } });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(hideLoader);
  setTimeout(hideLoader, 1800);

  /* ==========================================================
     HEADER — fondo sólido tras 80px  ·  indicador scroll oculto
     ========================================================== */
  var topEl = document.getElementById('top');
  var scrollInd = document.querySelector('.hero__scroll');
  function onScrollUI(){
    var y = window.pageYOffset;
    topEl.classList.toggle('solid', y > 80);
    if (scrollInd) scrollInd.classList.toggle('hide', y > window.innerHeight * 0.1);
  }
  window.addEventListener('scroll', onScrollUI, { passive: true });
  onScrollUI();

  /* ==========================================================
     HEADER camaleón — claro sobre secciones marfil.
     Una entrada por sección marfil. La clase se decide por la
     sección que ocupa la banda del header fijo (sonda por rect),
     robusto frente al pin de la historia (donde onToggle/isActive
     de un ScrollTrigger no basta). Se recalcula en scroll, en cada
     toggle de sección y tras cada ScrollTrigger.refresh().
     ========================================================== */
  var marfilSecs = ['#historia', '#caja', '#preguntas', '#footer']
    .map(function(s){ return document.querySelector(s); })
    .filter(Boolean);
  function refreshHeaderLight(){
    var probe = topEl.getBoundingClientRect().bottom; // borde inferior del header fijo
    var any = marfilSecs.some(function(el){
      var r = el.getBoundingClientRect();
      return r.top <= probe && r.bottom > probe;
    });
    document.documentElement.classList.toggle('header-light', any);
  }
  window.addEventListener('scroll', refreshHeaderLight, { passive: true });
  // un ScrollTrigger por sección: refresca la clase en cada cruce (incluye
  // el back-scroll) además del listener de scroll.
  marfilSecs.forEach(function(el){
    ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top',
      onToggle: refreshHeaderLight, onUpdate: refreshHeaderLight });
  });
  refreshHeaderLight();

  /* ==========================================================
     HISTORIA — pin+scrub (desktop) / apilado (móvil)
     ========================================================== */
  var beats = gsap.utils.toArray('.beat');
  beats.forEach(function(b){ splitWords(b.querySelector('.beat__title')); });

  function beatInner(b){ return b.querySelector('.frame > *'); }
  function beatReset(b){
    gsap.set(b.querySelectorAll('.beat__title .w'), { y: 40, opacity: 0 });
    var m = beatInner(b);
    if (m) gsap.set(m, { clipPath: 'inset(0 0 0 100%)', scale: 1.08, yPercent: 0 });
  }
  function beatEnter(b){
    gsap.to(b.querySelectorAll('.beat__title .w'),
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'power3.out' });
    var m = beatInner(b);
    if (m) gsap.to(m, { clipPath: 'inset(0px)', scale: 1, duration: 0.9, ease: 'power3.out' });
  }

  var isDesktop = window.matchMedia('(min-width:900px)').matches;

  if (isDesktop) {
    var bar = document.querySelector('.story__bar');
    var numEl = document.getElementById('beatNum');
    var seg = 1 / 4, fade = 0.12, active = 0;
    beats.forEach(function(b, i){ gsap.set(b, { opacity: i === 0 ? 1 : 0 }); beatReset(b); });
    beatEnter(beats[0]);

    ScrollTrigger.create({
      trigger: '#historia', start: 'top top', end: '+=380%',
      pin: '.story__pin', scrub: true, anticipatePin: 1,
      onUpdate: function(self){
        var p = self.progress;
        gsap.set(bar, { scaleX: p });
        var cur = Math.min(3, Math.floor(p / seg));
        var t = (p - cur * seg) / seg;               // 0..1 dentro del beat
        // crossfade
        beats.forEach(function(b){ gsap.set(b, { opacity: 0 }); });
        if (t > 1 - fade && cur < 3) {
          var a = (t - (1 - fade)) / fade;
          gsap.set(beats[cur], { opacity: 1 - a });
          gsap.set(beats[cur + 1], { opacity: a });
        } else {
          gsap.set(beats[cur], { opacity: 1 });
        }
        // activación
        if (cur !== active) { beatReset(beats[active]); beatEnter(beats[cur]); active = cur; }
        numEl.textContent = ('0' + (cur + 1)).slice(-2);
        // parallax interno leve del medio activo
        var m = beatInner(beats[cur]);
        if (m) gsap.set(m, { yPercent: (t - 0.5) * 6 });
        // videos: sólo el activo
        beats.forEach(function(b, i){
          var v = b.querySelector('video');
          if (!v) return;
          if (i === cur) { v.play && v.play().catch(function(){}); }
          else { v.pause && v.pause(); }
        });
      }
    });
  } else {
    // móvil: apilado, reveal simple once
    beats.forEach(function(b){
      beatReset(b);
      ScrollTrigger.create({
        trigger: b, start: 'top 80%', once: true,
        onEnter: function(){
          beatEnter(b);
          var v = b.querySelector('video');
          if (v) { v.play && v.play().catch(function(){}); }
        }
      });
    });
  }

  /* ==========================================================
     RENDIMIENTO móvil — videos pesados lazy (preload none + IO)
     pour.mp4, ribbon.mp4 y hero-h.mp4 del cierre; hero-v se queda
     ========================================================== */
  if (!isDesktop) {
    var lazyVids = [];
    document.querySelectorAll('.beat video').forEach(function(v){ lazyVids.push(v); });
    var cierreVid = document.querySelector('.cierre__bg');
    if (cierreVid) lazyVids.push(cierreVid);
    lazyVids.forEach(function(v){ try { v.preload = 'none'; v.removeAttribute('autoplay'); } catch(e){} });
    if ('IntersectionObserver' in window) {
      var vio = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          var v = en.target;
          if (en.isIntersecting) { if (v.play) v.play().catch(function(){}); }
          else { if (v.pause) v.pause(); }
        });
      }, { threshold: 0.2 });
      lazyVids.forEach(function(v){ vio.observe(v); });
    }
  }

  /* ==========================================================
     MARQUEE — bucle + aceleración por velocidad de scroll
     ========================================================== */
  (function marquee(){
    var phrases = ['Cera vegetal', 'Hecha a mano', 'Lote pequeño', 'Llega lista para regalar'];
    document.querySelectorAll('.marquee__group').forEach(function(g){
      for (var r = 0; r < 4; r++) {
        phrases.forEach(function(txt){
          var s = document.createElement('span'); s.className = 'm'; s.textContent = txt; g.appendChild(s);
          var img = document.createElement('img'); img.src = 'logo/luaar-destello-camel.svg';
          img.alt = ''; img.setAttribute('aria-hidden', 'true'); g.appendChild(img);
        });
      }
    });
    var track = document.querySelector('.marquee__track');
    var tween = gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
    var lastY = window.pageYOffset, lastT = performance.now(), vel = 0;
    window.addEventListener('scroll', function(){
      var now = performance.now(), dt = (now - lastT) || 16;
      vel = (window.pageYOffset - lastY) / dt * 1000;
      lastY = window.pageYOffset; lastT = now;
    }, { passive: true });
    gsap.ticker.add(function(){
      var target = 1 + Math.min(Math.abs(vel) / 1500, 3);
      tween.timeScale(gsap.utils.interpolate(tween.timeScale(), target, 0.1));
      vel *= 0.9;
    });
  })();

  /* ==========================================================
     REVEALS genéricos
     ========================================================== */
  gsap.utils.toArray('[data-reveal]').forEach(function(el){
    if (el.closest('#hero')) return; // lo maneja el timeline del hero
    gsap.from(el, { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 82%', once: true } });
  });

  gsap.utils.toArray('[data-clip]').forEach(function(el){
    var inner = el.querySelector('img, video') || el;
    gsap.fromTo(inner, { clipPath: 'inset(12%)', scale: 1.06 },
      { clipPath: 'inset(0px)', scale: 1, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 82%', once: true } });
  });

  gsap.utils.toArray('[data-words]').forEach(function(el){
    if (el.closest('#hero') || el.closest('.beat')) return; // ya divididos
    var words = splitWords(el);
    gsap.from(words, { opacity: 0, y: 20, duration: 0.6, stagger: 0.05, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 82%', once: true } });
  });

  // parallax leve de marcos con data-parallax (fuera de beats)
  gsap.utils.toArray('[data-parallax]').forEach(function(el){
    if (el.closest('.beat')) return; // los beats tienen su propio parallax
    var inner = el.querySelector('img, video') || el;
    gsap.fromTo(inner, { yPercent: -4 }, { yPercent: 4, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ==========================================================
     MENÚ, CTA BAR, FAQ
     ========================================================== */
  setupMenu();

  var ctaBar = document.getElementById('ctaBar');
  ScrollTrigger.create({ trigger: '#hero', start: 'bottom top',
    onEnter: function(){ ctaBar.classList.add('show'); },
    onLeaveBack: function(){ ctaBar.classList.remove('show'); } });

  setupFaq();

  /* ==========================================================
     REFRESH tras carga y fuentes
     ========================================================== */
  // Seguridad para navegación por ancla: los reveals que ya quedaron por
  // encima de la línea de disparo (top 82%) se fuerzan a su estado final,
  // para que no queden semitransparentes al llegar por #ancla.
  function forceRevealsAbove(){
    var lim = window.innerHeight * 0.82;
    gsap.utils.toArray('[data-reveal]').forEach(function(el){
      if (el.closest('#hero')) return;
      if (el.getBoundingClientRect().top < lim) gsap.set(el, { opacity: 1, y: 0 });
    });
    gsap.utils.toArray('[data-clip]').forEach(function(el){
      if (el.getBoundingClientRect().top < lim) {
        var inner = el.querySelector('img, video') || el;
        gsap.set(inner, { clipPath: 'inset(0px)', scale: 1 });
      }
    });
    document.querySelectorAll('[data-words]').forEach(function(el){
      if (el.closest('#hero') || el.closest('.beat')) return;
      if (el.getBoundingClientRect().top < lim) gsap.set(el.querySelectorAll('.w'), { opacity: 1, y: 0 });
    });
  }
  window.addEventListener('load', function(){ ScrollTrigger.refresh(); forceRevealsAbove(); refreshHeaderLight(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ ScrollTrigger.refresh(); forceRevealsAbove(); refreshHeaderLight(); });

  /* ---------- funciones reutilizables ---------- */
  function setupMenu(){
    var menu = document.getElementById('menu');
    var menuBtn = document.getElementById('menuBtn');
    if (!menu || !menuBtn) return;
    var links = menu.querySelectorAll('a');
    function setOrigin(){
      var r = menuBtn.getBoundingClientRect();
      menu.style.setProperty('--mx', (r.left + r.width / 2) + 'px');
      menu.style.setProperty('--my', (r.top + r.height / 2) + 'px');
    }
    function open(){
      setOrigin();
      document.body.classList.add('menu-open');
      document.getElementById('top').classList.remove('solid');
      menu.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
      menuBtn.setAttribute('aria-expanded', 'true');
      menuBtn.setAttribute('aria-label', 'Cerrar menú');
      if (window.gsap && !reduce) {
        gsap.fromTo(links, { y: 30, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.06, duration: 0.5, delay: 0.15, ease: 'power3.out' });
      }
    }
    function close(){
      document.body.classList.remove('menu-open');
      menu.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Abrir menú');
      if (window.pageYOffset > 80) document.getElementById('top').classList.add('solid');
    }
    menuBtn.addEventListener('click', function(){
      menu.classList.contains('open') ? close() : open();
    });
    links.forEach(function(a){ a.addEventListener('click', close); });
    window.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && menu.classList.contains('open')) close();
    });
  }

  function setupCtaBarFallback(){
    var ctaBar = document.getElementById('ctaBar');
    var hero = document.getElementById('hero');
    if (!ctaBar || !hero) return;
    window.addEventListener('scroll', function(){
      var past = hero.getBoundingClientRect().bottom < 0;
      ctaBar.classList.toggle('show', past);
    }, { passive: true });
  }

  function setupFaq(){
    var items = Array.prototype.slice.call(document.querySelectorAll('.faq__item'));
    function closeItem(item){
      if (!item.open) return;
      var a = item.querySelector('.faq__a');
      gsap.to(a, { height: 0, duration: 0.35, ease: 'power2.inOut',
        onComplete: function(){ item.open = false; a.style.height = ''; } });
    }
    function openItem(item){
      var a = item.querySelector('.faq__a');
      item.open = true;
      gsap.fromTo(a, { height: 0 }, { height: a.scrollHeight, duration: 0.35, ease: 'power2.inOut',
        onComplete: function(){ a.style.height = 'auto'; } });
    }
    items.forEach(function(item){
      var summary = item.querySelector('summary');
      summary.addEventListener('click', function(e){
        e.preventDefault();
        if (item.open) {
          closeItem(item);
        } else {
          // solo uno abierto a la vez: cerrar los demás
          items.forEach(function(other){ if (other !== item) closeItem(other); });
          openItem(item);
        }
      });
    });
  }

  function setupFaqFallback(){ /* nativo: <details> funciona sin JS */ }
})();
