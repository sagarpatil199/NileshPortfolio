/* Site behaviour: mobile menu, profile photo fallback, publication list.
   Publication data lives in data/publications.js (loaded first). */

/* Mobile menu */
(function(){
  const btn=document.querySelector('.menu-btn'), links=document.getElementById('site-links');
  const set=open=>{ links.classList.toggle('open',open); btn.setAttribute('aria-expanded',open); btn.setAttribute('aria-label',open?'Close menu':'Open menu'); };
  btn.addEventListener('click',()=>set(btn.getAttribute('aria-expanded')!=='true'));
  links.addEventListener('click',e=>{ if(e.target.closest('a')) set(false); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&links.classList.contains('open')){ set(false); btn.focus(); } });
  matchMedia('(min-width:901px)').addEventListener('change',e=>{ if(e.matches) set(false); });
})();

/* Profile photo: show initials if the image fails to load */
(function(){
  const img=document.querySelector('.photo img');
  if(!img) return;
  const fallback=()=>{ img.parentNode.textContent='NC'; };
  if(img.complete && !img.naturalWidth) fallback(); else img.addEventListener('error',fallback);
})();

/* Publications: filter + search over the list already in the page
   (the list itself is generated into index.html by tools/build.js) */
(function(){
  const list=document.getElementById('pubs'), q=document.getElementById('q'), countEl=document.getElementById('count'),
        empty=document.getElementById('pubs-empty'), buttons=document.querySelectorAll('.filter');
  const items=[...list.querySelectorAll('.pub')].map(li=>({li,
    // title (without the screen-reader hint) + authors + journal
    text:[li.querySelector('.pt a').firstChild.textContent, li.querySelector('.au').textContent, li.querySelector('.jn').textContent].join(' ').toLowerCase()}));
  let filter='all';
  function apply(){
    const term=q.value.trim().toLowerCase(); let shown=0;
    for(const {li,text} of items){
      const ok=(filter==='all' || (filter==='first' ? li.dataset.first==='true' : li.dataset.cat.split(' ').includes(filter)))
        && (!term || text.includes(term));
      li.hidden=!ok; if(ok) shown++;
    }
    list.hidden=!shown; empty.hidden=!!shown;
    countEl.textContent=`${shown} of ${items.length} publications`;
  }
  buttons.forEach(b=>b.addEventListener('click',()=>{
    buttons.forEach(x=>x.setAttribute('aria-pressed','false'));
    b.setAttribute('aria-pressed','true'); filter=b.dataset.f; apply();
  }));
  q.addEventListener('input',apply);
  document.querySelector('.toolbar').hidden=false;
})();
