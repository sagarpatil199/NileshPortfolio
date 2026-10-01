#!/usr/bin/env node
/* Regenerates the parts of index.html that come from data/publications.js:
     - the publication list (so it is in the HTML for search engines and no-JS visitors)
     - the Publications / First-author counts
     - the JSON-LD structured data (Person + ScholarlyArticle)
   Usage:  node tools/build.js           rewrite index.html
           node tools/build.js --check   exit 1 if index.html is out of date */
const fs = require('fs'), path = require('path'), vm = require('vm');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://sagarpatil199.github.io/NileshPortfolio/';
const SCHOLAR = 'https://scholar.google.com/citations?user=LY0ouK8AAAAJ&hl=en';
const ME = /(N\.?\s?Chougala|N\.?\s?Chougula|Nilesh Chougala|N\.?\s?Chougle)/;
const LABELS = {storage: 'Energy storage', magnetism: 'Magnetism', nano: 'Nanomaterials'};

const src = fs.readFileSync(path.join(ROOT, 'data/publications.js'), 'utf8');
const pubs = vm.runInNewContext(src + '\n;PUBLICATIONS', {}, {filename: 'data/publications.js'})
  .slice().sort((a, b) => b.y - a.y || (b.c || 0) - (a.c || 0));

for (const p of pubs) {
  for (const k of ['y', 't', 'a', 'j', 'url']) if (!p[k]) throw new Error(`Publication missing "${k}": ${p.t || JSON.stringify(p)}`);
  for (const c of p.cat || []) if (!LABELS[c]) throw new Error(`Unknown category "${c}" in: ${p.t}`);
}

const esc = s => String(s).replace(/[&<>"]/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[ch]));
const NT = '<span class="sr-only"> (opens in new tab)</span>';

const item = p => `      <li class="pub" data-first="${!!p.first}" data-cat="${p.cat.join(' ')}">
        <div class="yr">${p.y}</div>
        <div>
          <p class="pt"><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.t)}${NT}</a></p>
          <p class="au">${esc(p.a).replace(ME, '<strong>$1</strong>')}</p>
          <div class="jn">${esc(p.j)}</div>
          <div class="tags">${[
            p.first ? '<span class="tag first">First author</span>' : '',
            p.kind ? `<span class="tag">${esc(p.kind)}</span>` : '',
            ...p.cat.map(c => `<span class="tag">${LABELS[c]}</span>`)
          ].join('')}</div>
        </div>
        <div class="side">
          ${p.c != null ? `<div class="cites"><b>${p.c}</b><span>citations</span></div>` : '<div></div>'}
          <a class="doi" href="${esc(p.url)}" target="_blank" rel="noopener">${p.doi ? 'DOI' : 'View'}<span aria-hidden="true"> ↗</span><span class="sr-only"> publisher page (opens in new tab)</span></a>
        </div>
      </li>`;

const person = {
  '@type': 'Person', '@id': SITE + '#person',
  name: 'Nilesh Chougle', honorificPrefix: 'Dr.', alternateName: ['N. Chougala', 'Nilesh Chougala'],
  jobTitle: 'Research Scholar', url: SITE, image: SITE + 'assets/photo.jpg',
  email: 'mailto:nilesh.chougle@kletech.ac.in',
  affiliation: {'@type': 'CollegeOrUniversity', name: 'KLE Technological University',
    department: {'@type': 'Organization', name: 'Department of Physics'},
    address: {'@type': 'PostalAddress', addressLocality: 'Hubli', addressRegion: 'Karnataka', addressCountry: 'IN'}},
  sameAs: [SCHOLAR],
  knowsAbout: ['Magneto-electrochemical energy storage', 'Supercapacitors', 'Multiferroics',
    'Magnetocaloric effect', 'Perovskite orthoferrites', 'Spinel ferrites', 'Nanomaterials']
};
const article = p => {
  const a = {'@type': 'ScholarlyArticle', name: p.t, datePublished: String(p.y), url: p.url,
    author: p.a.split(/,\s*/).filter(n => n && !/^et al\.?$/.test(n))
      .map(n => ME.test(n) ? {'@id': SITE + '#person'} : {'@type': 'Person', name: n})};
  if (p.doi) { a.identifier = {'@type': 'PropertyValue', propertyID: 'DOI', value: p.doi}; a.sameAs = 'https://doi.org/' + p.doi; }
  return a;
};
// One graph entry per line: compact, but still diffable when a paper changes
const jsonld = ('{"@context":"https://schema.org","@graph":[\n' +
  [person, ...pubs.map(article)].map(o => JSON.stringify(o)).join(',\n') + '\n]}').replace(/</g, '\\u003c');

const file = path.join(ROOT, 'index.html');
const before = fs.readFileSync(file, 'utf8');
let html = before;
const swap = (re, to, what) => {
  if (!re.test(html)) throw new Error(`index.html: marker for ${what} not found`);
  html = html.replace(re, typeof to === 'function' ? to : () => to);
};
swap(/<!-- build:publications -->[\s\S]*?<!-- \/build:publications -->/,
  `<!-- build:publications -->\n${pubs.map(item).join('\n')}\n      <!-- /build:publications -->`, 'publications');
swap(/<b id="m-papers">\d*<\/b>/, `<b id="m-papers">${pubs.length}</b>`, 'm-papers');
swap(/<b id="m-first">\d*<\/b>/, `<b id="m-first">${pubs.filter(p => p.first).length}</b>`, 'm-first');
swap(/(<div class="count" id="count"[^>]*>)[^<]*(<\/div>)/, (m, open, close) => `${open}${pubs.length} of ${pubs.length} publications${close}`, 'count');
swap(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">\n${jsonld}\n</script>`, 'JSON-LD');

if (process.argv.includes('--check')) {
  if (html !== before) { console.error('index.html is out of date. Run: node tools/build.js'); process.exit(1); }
  console.log('index.html is up to date.');
} else if (html !== before) {
  fs.writeFileSync(file, html);
  console.log(`index.html updated: ${pubs.length} publications.`);
} else console.log('index.html already up to date.');
