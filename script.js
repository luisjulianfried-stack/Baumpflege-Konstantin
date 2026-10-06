const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
// Gestaffelte Auftritte in Listen
document.querySelectorAll('.service-list li,.quotes blockquote,.stats div').forEach(el=>{const i=[...el.parentNode.children].indexOf(el);el.style.transitionDelay=(i%2*0.08+Math.floor(i/2)*0.06)+'s'});
document.querySelectorAll('.reveal,.reveal-img,.reveal-tree').forEach(el=>io.observe(el));
// Startanimation, sobald Schrift und erstes Bild bereit sind
const pre=document.querySelector('.preloader');let firstVisit=true;
try{firstVisit=!sessionStorage.getItem('bk-visited');sessionStorage.setItem('bk-visited','1')}catch(e){}
if(!firstVisit||matchMedia('(prefers-reduced-motion: reduce)').matches)pre?.classList.add('is-gone');
const reveal=()=>requestAnimationFrame(()=>document.body.classList.remove('is-loading'));
const start=()=>{if(!pre||pre.classList.contains('is-gone'))return reveal();
  // Begrüßung: Logo und Name, dann hebt sich der Vorhang und die Startseite baut sich auf
  const wait=Math.max(0,1900-performance.now());
  setTimeout(()=>{pre.classList.add('is-done');setTimeout(reveal,380);setTimeout(()=>pre.classList.add('is-gone'),1200)},wait)};
Promise.race([Promise.all([document.fonts?document.fonts.ready:0,new Promise(r=>{const i=document.querySelector('.ba img');if(!i||i.complete)r();else{i.onload=r;i.onerror=r}})]),new Promise(r=>setTimeout(r,2600))]).then(start);
// Header: dunkle Variante auf dunklem Grund, beim Runterscrollen ausblenden
const header=document.querySelector('.nav-wrap');const navLinks=[...document.querySelectorAll('.main-nav a')];const darkSecs=[...document.querySelectorAll('.opening,.dark-section,.image-band')];let lastY=scrollY;
const onScroll=()=>{const y=scrollY;const mid=header.getBoundingClientRect().bottom/2+10;
  header.classList.toggle('on-dark',darkSecs.some(s=>{const r=s.getBoundingClientRect();return r.top<=mid&&r.bottom>=mid}));
  if(y>lastY&&y>260)header.classList.add('is-hidden');else if(y<lastY||y<=260)header.classList.remove('is-hidden');lastY=y;
  header.classList.toggle('is-scrolled',y>30);
  // Aktiven Menüpunkt markieren
  let cur=null;navLinks.forEach(a=>{const sec=document.querySelector(a.hash);if(sec&&sec.getBoundingClientRect().top<=innerHeight*.4)cur=a});navLinks.forEach(a=>a.classList.toggle('is-active',a===cur));
  // Parallaxe im Bildband
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.querySelectorAll('.image-band img').forEach(img=>{const r=img.parentNode.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight){const p=(r.top+r.height/2-innerHeight/2)/innerHeight;img.style.transform=`translateY(${p*-9}%)`}});};
addEventListener('scroll',()=>requestAnimationFrame(onScroll),{passive:true});onScroll();
// Zahlen hochzählen
const countIO=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;countIO.unobserve(e.target);const el=e.target,end=+el.dataset.count,suf=el.dataset.suffix||'',t0=performance.now();const tick=n=>{const p=Math.min(1,(n-t0)/1600),v=Math.round(end*(1-Math.pow(1-p,4)));el.textContent=v+suf;if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)}),{threshold:.6});
document.querySelectorAll('[data-count]').forEach(el=>countIO.observe(el));

// Vorher / Nachher: Regler ziehen, Slides wischen
document.querySelectorAll('.ba').forEach(ba=>{
  const handle=ba.querySelector('.ba-handle');
  const set=v=>{v=Math.max(0,Math.min(100,v));ba.style.setProperty('--pos',v+'%');handle.setAttribute('aria-valuenow',Math.round(v));ba._pos=v};
  ba._set=set;ba._pos=50;
  const fromEvent=e=>{const r=ba.getBoundingClientRect();set((e.clientX-r.left)/r.width*100)};
  // Nur der Regler verschiebt die Trennlinie, so bleibt das Foto frei zum Wischen
  handle.addEventListener('pointerdown',e=>{cancelAnimationFrame(ba._anim);ba._hinted=true;handle.setPointerCapture(e.pointerId);ba.classList.add('is-dragging');e.stopPropagation()});
  handle.addEventListener('pointermove',e=>{if(ba.classList.contains('is-dragging'))fromEvent(e)});
  ['pointerup','pointercancel'].forEach(t=>handle.addEventListener(t,()=>ba.classList.remove('is-dragging')));
  handle.addEventListener('keydown',e=>{const step=e.shiftKey?10:2;if(e.key==='ArrowLeft'){set(ba._pos-step);e.preventDefault()}if(e.key==='ArrowRight'){set(ba._pos+step);e.preventDefault()}});
});
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
function hint(ba){ // kurze Animation, die zeigt, dass man den Regler ziehen kann
  if(ba._hinted||reduceMotion)return;ba._hinted=true;
  const keys=[[0,50],[700,82],[1500,18],[2200,50]];const t0=performance.now();
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const tick=now=>{const t=now-t0;let i=1;while(i<keys.length-1&&t>keys[i][0])i++;const[a0,v0]=keys[i-1],[a1,v1]=keys[i];const p=Math.min(1,Math.max(0,(t-a0)/(a1-a0)));ba._set(v0+(v1-v0)*ease(p));if(t<keys[keys.length-1][0])ba._anim=requestAnimationFrame(tick)};
  ba._anim=requestAnimationFrame(tick);
}
document.querySelectorAll('.ba-carousel').forEach(c=>{
  const track=c.querySelector('.ba-track'),slides=[...c.querySelectorAll('.ba-slide')],dots=c.querySelector('.ba-dots'),count=c.querySelector('.ba-count'),prev=c.querySelector('.ba-prev'),next=c.querySelector('.ba-next');
  const pad=n=>String(n).padStart(2,'0');let active=-1;
  slides.forEach((s,i)=>{const b=document.createElement('button');b.setAttribute('role','tab');b.setAttribute('aria-label','Projekt '+(i+1));b.addEventListener('click',()=>go(i));dots.appendChild(b)});
  const go=i=>{i=Math.max(0,Math.min(slides.length-1,i));track.scrollTo({left:slides[i].offsetLeft-slides[0].offsetLeft})};
  const update=()=>{const x=track.scrollLeft;let i=0,best=1e9;slides.forEach((s,k)=>{const d=Math.abs(s.offsetLeft-slides[0].offsetLeft-x);if(d<best){best=d;i=k}});
    if(track.scrollLeft+track.clientWidth>=track.scrollWidth-4)i=slides.length-1;
    if(i===active)return;active=i;
    slides.forEach((s,k)=>s.classList.toggle('is-active',k===i));
    [...dots.children].forEach((d,k)=>d.setAttribute('aria-selected',k===i));
    count.textContent=pad(i+1)+' / '+pad(slides.length);prev.disabled=i===0;next.disabled=i===slides.length-1;
    if(c._visible)hint(slides[i].querySelector('.ba'));};
  prev.addEventListener('click',()=>go(active-1));next.addEventListener('click',()=>go(active+1));
  let raf;track.addEventListener('scroll',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(update)},{passive:true});
  // Rechts genug Platz lassen, damit auch die letzten Slides ganz nach links rasten
  const fit=()=>{const pl=parseFloat(getComputedStyle(track).paddingLeft);track.style.paddingRight=Math.max(pl,track.clientWidth-slides[0].offsetWidth-pl)+'px'};
  fit();addEventListener('resize',()=>{fit();active=-1;update()});
  c.addEventListener('keydown',e=>{if(e.target.classList.contains('ba-handle'))return;if(e.key==='ArrowRight')go(active+1);if(e.key==='ArrowLeft')go(active-1)});
  // Wischen mit der Maus (auf Touch wischt der Browser nativ)
  let sx=null,sl=0,si=0;track.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.target.closest('.ba-handle'))return;e.preventDefault();sx=e.clientX;sl=track.scrollLeft;si=active;track.style.scrollSnapType='none';track.style.scrollBehavior='auto'});
  addEventListener('pointermove',e=>{if(sx!==null)track.scrollLeft=sl-(e.clientX-sx)});
  addEventListener('pointerup',e=>{if(sx===null)return;const dx=e.clientX-sx;sx=null;track.style.scrollSnapType='';track.style.scrollBehavior='';go(si+(dx<-40?1:dx>40?-1:0))});
  new IntersectionObserver(es=>es.forEach(e=>{c._visible=e.isIntersecting;if(e.isIntersecting&&active>=0){const b=slides[active].querySelector('.ba');setTimeout(()=>{if(c._visible&&!document.body.classList.contains('is-loading'))hint(b);else setTimeout(()=>hint(b),1600)},1500)}}),{threshold:.5}).observe(c);
  update();
});
