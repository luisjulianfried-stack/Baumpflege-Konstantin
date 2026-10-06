const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
const menu=document.querySelector('.menu');
menu?.addEventListener('click',()=>{const nav=document.querySelector('.nav-wrap nav'); if(!nav)return; const open=nav.style.display==='flex'; nav.style.display=open?'none':'flex'; nav.style.position='absolute'; nav.style.top='78px'; nav.style.left='0'; nav.style.right='0'; nav.style.padding='24px'; nav.style.background='rgba(243,240,231,.98)'; nav.style.flexDirection='column';});
