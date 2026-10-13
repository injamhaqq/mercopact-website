/* MERCOPACT dependency-free site-integrity assertions. Run: node scripts/verify-trust-pages.js */
const fs = require('node:fs');
const path = require('node:path');
const pages = [
  'index.html', 'global-buyer-pilot.html', 'about.html',
  'how-we-work.html', 'trust-and-method.html', 'research-examples.html',
  'contact.html', 'buyer-growth.html'
];
const reports = ['sample-market-access.html','sample-uae-packaging.html','sample-india-packaging.html'];
let checks = 0;
const ensure = (pass, why) => { checks++; if (!pass) throw new Error(why); };
const read = f => fs.readFileSync(path.join(process.cwd(),f),'utf8');
const source = Object.fromEntries([...pages,...reports].map(f=>[f,read(f)]));
for (const [file, html] of Object.entries(source)) {
  ensure((html.match(/<h1(?:\s|>)/g)||[]).length === 1, file+' must have exactly one H1');
  ensure(html.includes('mercopact-primary-lockup-v7.png'), file+' lost approved brand lockup');
  ensure(file==='buyer-growth.html' || html.includes('aria-label="Primary navigation"'), file+' lost primary navigation');
  ensure(html.includes('<footer class="site-footer">'), file+' lost footer');
  ensure((html.includes('href="/research-examples.html"')||html.includes('href="research-examples.html"')) || file==='research-examples.html' || file==='about.html',file+' missing research nav');
  ensure((html.includes('href="/trust-and-method.html"')||html.includes('href="trust-and-method.html"')) || file==='trust-and-method.html',file+' missing standards nav');
  for (const m of html.matchAll(/\bhref="([^"]+)"/g)) {
    const href = m[1];
    if (!href || /^(#|\/|https?:|mailto:|tel:|javascript:)/i.test(href)) continue;
    const local = decodeURIComponent(href.split(/[?#]/)[0]);
    if (!local) continue;
    ensure(fs.existsSync(path.join(process.cwd(), local)),file+' broken local href: '+local);
  }
}
for (const file of pages) {
  ensure(source[file].includes('trust-conversion-v1.css'),file+' must load scoped trust styles');
}
const home=source['index.html'],f=read('assets/js/forms.js');
for(const report of reports)ensure((home.includes('href="/'+report+'"')||home.includes('href="'+report+'"')),'Homepage missing research '+report);
ensure(f.includes("result.success === true")&&f.includes("result.success === 'true'"),'Must verify FormSubmit explicit success');
ensure(f.includes('showRecovery();')&&f.includes('recoveryWhatsApp.href')&&f.includes('recoveryEmail.href'),'Failed form must offer a recoverable, user-controlled handoff');
ensure(f.includes('new FormData(form)'),'Preserve typed form details for handoff');
ensure((f.match(/recovery.className = 'mc-recovery'/g)||[]).length===1,'Form recovery panel must be created exactly once');
ensure(f.indexOf("recovery.className = 'mc-recovery'") < f.indexOf("form.addEventListener('submit'"),'Recovery panel must be initialized outside submit handler');
ensure(source['contact.html'].includes('class="mc-optional-details field full"'),'Contact technical details should be optional');
ensure(source['global-buyer-pilot.html'].includes('id="mc-handoff-proof"'),'Pilot must describe auditable handoff deliverables');
ensure(source['about.html'].includes('not a MERCOPACT facility'),'Illustrative photography must be labeled transparently');
ensure(read('assets/css/trust-conversion-v1.css').includes('@media'),'Responsive trust styles missing');
const sitemap=read('sitemap.xml');
for(const file of [...reports,'research-examples.html','trust-and-method.html'])ensure(sitemap.includes('/'+file),'Sitemap missing '+file);
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
ensure(urls.length===new Set(urls).size,'Duplicate sitemap URLs');
ensure(home.includes('Develop qualified B2B buyers beyond your home market'), 'Homepage positioning not applied');
ensure(home.includes('href="/pilot-deliverables.html"'), 'Homepage proof CTA missing');
ensure(source['global-buyer-pilot.html'].includes('id="international-commercial-terms"'), 'International commercial terms missing');
ensure(source['contact.html'].includes('Send an enquiry via WhatsApp') && source['contact.html'].includes('Email routing is under verification'), 'A reachable fallback must be visible during DNS email outage');
ensure(read('bangladesh-market-entry.html').includes('wits.worldbank.org'), 'Bangladesh machinery corridor source missing');
for (const page of ['index.html','global-buyer-pilot.html','about.html','how-we-work.html','trust-and-method.html','research-examples.html','contact.html']) {
  ensure(source[page].includes('>30-Day Pilot</a>'), page+' must link to the international pilot in its navigation');
}
ensure(read('packages.html').includes('Bangladesh Buyer Development Packages'), 'Existing Bangladesh prices must remain a distinct published offer');
ensure(home.includes('Develop qualified B2B buyers beyond your home market'), 'Global-first homepage hero must be present');
ensure(!home.includes('aria-labelledby="bd-title"') && !home.includes('aria-labelledby="entry-title"'), 'Global homepage must not feature Bangladesh domestic or entry sections');
ensure(source['global-buyer-pilot.html'].includes('Europe, North America, Asia'), 'Global source-country positioning missing');
ensure(source['contact.html'].includes('name="Company headquarters country"'), 'Separate client and destination countries in enquiry');

const rootHtmlPages = fs.readdirSync(process.cwd()).filter(f => f.endsWith('.html') && !f.startsWith('route-') && f !== 'buyer-growth.html');
for (const file of rootHtmlPages) {
  const html = read(file);
  const nav = html.match(/<nav id="primary-navigation" class="site-nav" aria-label="Primary navigation">([\s\S]*?)<\/nav>/);
  if (!nav) continue;
  ensure(!nav[0].includes('>Bangladesh Market Entry</a>'), file+' must keep Bangladesh service as secondary footer navigation');
  const marketsAt = nav[0].indexOf('>International Markets</a>');
  const pilotAt = nav[0].indexOf('>30-Day Pilot</a>');
  ensure(marketsAt >= 0 && pilotAt > marketsAt && pilotAt < nav[0].indexOf('>Industries</a>'), file+' international pilot navigation ordering');
}

const businessPages = fs.readdirSync(process.cwd()).filter(file => file.endsWith('.html') && !file.startsWith('route-'));
const titles = new Set();
for (const file of businessPages) {
  const html = read(file);
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] || '';
  const description = html.match(/<meta name="description" content="([^"]+)"/i)?.[1] || '';
  ensure(title.length > 8 && title.length <= 65, file+' needs a concise title');
  ensure(description.length > 25 && description.length <= 165, file+' needs a concise description');
  ensure(!titles.has(title.toLowerCase()), file+' has a duplicate title');
  titles.add(title.toLowerCase());
  ensure((html.match(/<h1(?:\s|>)/g)||[]).length === 1, file+' needs one H1');
  if (file !== 'buyer-growth.html') {
    ensure(html.includes('id="primary-navigation"') && html.includes('aria-controls="primary-navigation"'), file+' toggle must control its navigation');
  }
}
ensure(f.includes('const FORM_DELIVERY_READY = false'), 'Do not post to unverified FormSubmit inbox');
ensure(f.includes('showRecovery();'), 'Offline form must preserve WhatsApp handoff');
ensure(!read('assets/css/responsive.css').includes('top:calc(100% + 339px)'), 'Brittle mobile CTA offset found');
ensure(!home.includes('aria-labelledby="paths-title"'), 'Homepage must not reintroduce three competing services');
ensure((sitemap.match(/<lastmod>2026-10-13<\/lastmod>/g)||[]).length === urls.length, 'Sitemap must show actual content update dates');
console.log('MERCOPACT trust-integrity checks passed:',checks);
