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

/* Publications: filter + search */
const ME = /(N\.?\s?Chougala|N\.?\s?Chougula|Nilesh Chougala|N\.?\s?Chougle)/;
const labels = {storage:"Energy storage", magnetism:"Magnetism", nano:"Nanomaterials"};
const list = document.getElementById('pubs'), q = document.getElementById('q'), countEl = document.getElementById('count');
let filter = 'all';
document.getElementById('m-papers').textContent = PUBLICATIONS.length;
document.getElementById('m-first').textContent = PUBLICATIONS.filter(p=>p.first).length;

const esc = s => s.replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));

function render(){
  const term = q.value.trim().toLowerCase();
  const rows = PUBLICATIONS.filter(p => (filter==='all' || (filter==='first' ? p.first : p.cat.includes(filter))) &&
    (!term || (p.t+' '+p.a+' '+p.j).toLowerCase().includes(term)))
    .sort((a,b)=> b.y-a.y || (b.c||0)-(a.c||0));
  countEl.textContent = `${rows.length} of ${PUBLICATIONS.length} publications`;
  list.innerHTML = rows.length ? rows.map(p => `
    <li class="pub">
      <div class="yr">${p.y}</div>
      <div>
        <p class="pt"><a href="${p.url}" target="_blank" rel="noopener">${esc(p.t)}</a></p>
        <p class="au">${esc(p.a).replace(ME,'<strong>$1</strong>')}</p>
        <div class="jn">${esc(p.j)}</div>
        <div class="tags">
          ${p.first?'<span class="tag first">First author</span>':''}
          ${p.kind?`<span class="tag">${p.kind}</span>`:''}
          ${p.cat.map(c=>`<span class="tag">${labels[c]}</span>`).join('')}
        </div>
      </div>
      <div class="side">
        ${p.c!=null?`<div class="cites"><b>${p.c}</b><span>citations</span></div>`:'<div></div>'}
        <a class="doi" href="${p.url}" target="_blank" rel="noopener">${p.doi?'DOI ↗':'View ↗'}</a>
      </div>
    </li>`).join('') : '<li class="empty">No publications match that search.</li>';
}
document.querySelectorAll('.filter').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(x=>x.setAttribute('aria-pressed','false'));
  b.setAttribute('aria-pressed','true'); filter = b.dataset.f; render();
}));
q.addEventListener('input', render);
render();
