/* MERCOPACT dependency-free site-integrity assertions. Run: node scripts/verify-trust-pages.js */
const fs = require('node:fs');
const path = require('node:path');
const pages = [
  'index.html', 'global-buyer-pilot.html', 'about.html',
  'how-we-work.html', 'trust-and-method.html', 'research-examples.html',
  'contact.html', 'buyer-growth.html', 'capabilities.html'
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
ensure(read('packages.html').includes('International Buyer Development Programs | MERCOPACT'), 'Programs must be global-first without public pricing');
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
ensure((sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g)||[]).length === urls.length, 'All sitemap URLs need valid update-date elements');
ensure(sitemap.includes('https://mercopact.com/capabilities.html</loc><lastmod>2026-10-20</lastmod>'), 'Capabilities page missing from sitemap or date incorrect');
ensure(home.includes('Your next export market needs more than a list of company names.'), 'Homepage must explain the buyer-development pain');
ensure(source['global-buyer-pilot.html'].includes('Two starting routes, scoped separately:'), 'Pilot must separate warm enquiry recovery from new account research');
ensure(source['global-buyer-pilot.html'].includes('where further contact is permitted'), 'Warm contact recovery must have an authorization gate');
ensure(!source['global-buyer-pilot.html'].includes('>View Bangladesh packages</a>'), 'Global pilot must not link to domestic prices at its final CTA');
ensure(source['capabilities.html'].includes('Examine the capability behind the commercial promise.'), 'Professional capability and assurance page absent');
ensure(source['capabilities.html'].includes('These are competencies and review responsibilities'), 'Do not imply listed competencies equal verified staff skills');
ensure(source['capabilities.html'].includes('No certifications, authorized foreign mandates'), 'Certification and third-party authority must not be invented');
for (const file of ['index.html','about.html','global-buyer-pilot.html','trust-and-method.html']) ensure(source[file].includes('href="/capabilities.html"'), file+' must surface real capability review');
for (const f of ['operations/CAPABILITY-AND-SKILLS-FRAMEWORK.md','operations/CORPORATE-CREDENTIALS-AND-DUE-DILIGENCE.md','operations/INTERNATIONAL-PILOT-SOW-TEMPLATE.md','operations/QUALIFICATION-AND-READINESS-TRACKER.md']) ensure(fs.existsSync(path.join(process.cwd(),f)), f+' missing actual operating framework');
ensure(source['capabilities.html'].includes('Professional Capabilities &amp; Commercial Assurance'), 'Approved professional assurance copy missing');
for (const term of ['Professional competence','Quality assurance','Corporate accountability','Qualified project delivery','International business standards']) {
  ensure(source['capabilities.html'].includes('<h3>'+term+'</h3>'), 'Approved assurance characteristic missing: '+term);
}
ensure(source['capabilities.html'].includes('not independently certified compliance'), 'Assurance copy must not imply unverified credentials or current staffing');
// Every live root HTML route and legacy nested HTML file served by GitHub Pages must stay free of published monetary figures.
const forbiddenPrice = /৳|\b(?:USD|BDT)\b|(?:US\$|\$)\s*\d|\b(?:price|prices|pricing|fee|fees)\b/i;
for (const htmlFile of businessPages) {
  const content = read(htmlFile);
  ensure(!forbiddenPrice.test(content), htmlFile+' exposes pricing or a monetary amount; public site must not display prices');
  ensure(!content.includes('>Bangladesh Packages</a>'), htmlFile+' must use service navigation, not pricing-style package navigation');
}
for(const file of ['packages.html','contact.html']) {
  const content = read(file);
  ensure(!/৳\s*\d|\$\s*\d/.test(content), file+' retains a financial amount in public content');
}
ensure(!read('packages.html').includes('package-price'), 'Public package cards must not contain hidden numerical fees');
// Internal estimates and historical HTML must not be copied into the Jekyll website output.
const pagesConfig = read('_config.yml');
for (const excluded of ['operations','audits','mercopact-logo-layout-perfect','scripts','README.md','QA-REPORT.md','qa-browser.json','qa-static.json']) {
  ensure(pagesConfig.includes('  - '+excluded+'\n'), 'Jekyll exclusion missing: '+excluded);
}
ensure(!pagesConfig.includes('include:'), 'Public-site config must not override directory exclusions');
const offers = read('packages.html');
ensure(offers.includes('Global-first. Project-specific.'), 'Offers must clearly accept qualified clients from multiple countries');
ensure(offers.includes('Your company can be headquartered in any commercially eligible country'), 'HQ of paying client cannot be restricted to Bangladesh');
ensure(offers.includes('the buyer destination is selected separately'), 'Client headquarters and buyer market must be independent');
ensure(offers.includes('Program details and activity volumes illustrate possible scopes'), 'Quantities must be conditional on a signed project scope');
ensure(!offers.includes('For export-ready Bangladesh manufacturers') && !offers.includes('Bangladesh-specific buyer-development packages'), 'Offers must not be positioned as Bangladesh-only');
ensure(['Export Market Proof','Buyer Development System','Export Growth Desk'].every(x=>offers.includes('<h3>'+x+'</h3>')), 'Preserve the three international service levels');
ensure(offers.includes('30-DAY ENGAGEMENT') && (offers.match(/90-DAY PROGRAM/g)||[]).length === 2, 'Preserve 30-day and both 90-day delivery formats');
ensure(source['buyer-growth.html'].includes('Looking for relevant B2B buyers in your next international market?'), 'Buyer Growth must be international-client-first');
ensure(source['buyer-growth.html'].includes('name="Company headquarters country"') && source['buyer-growth.html'].includes('name="Target country or market"'), 'Enquiry must separate customer HQ from buyer destination');
ensure(!source['buyer-growth.html'].includes('lang="bn"'), 'International landing page should not revert to Bangladesh-only Bangla hero');
for(const file of businessPages) ensure(!read(file).includes('>Bangladesh Services</a>'), file+' must label its international program nav correctly');
// Sitewide conversion, accessibility and no-fabrication regressions audited 2026-10-20.
const offerValues = ['Export Market Proof — focused one-market pilot','Buyer Development System — ongoing program','Export Growth Desk — coordinated expansion','International Buyer Development — recommend a scope'];
const formSelect = source['contact.html'].match(/<select id="package"[^>]*>([\s\S]*?)<\/select>/)?.[1] || '';
for(const value of offerValues) ensure(formSelect.includes('<option>'+value+'</option>'), 'Contact option missing: '+value);
for(const slug of ['market-proof','international-pilot','buyer-development','growth-desk']) ensure(f.includes("'"+slug+"': "), 'Program preselection key missing: '+slug);
for(const value of offerValues) ensure(f.includes("'"+value+"'"), 'Forms script must match existing contact option: '+value);
ensure(read('assets/js/main.js').includes("'packages.html': '/packages/'"), 'Packages URL needs canonical navigation mapping');
ensure(!/৳|\b(?:BDT|USD)\b|(?:US\$|\$)\s*\d/i.test(f), 'Public forms JavaScript must not expose outdated historical rates');
ensure(f.includes('if (FORM_DELIVERY_READY) recovery.append(recoveryEmail)'), 'Inactive email must not be offered as an available recovery channel');
for(const file of businessPages) {
 const html = read(file);
 ensure(!/href="mailto:/i.test(html), file+' must not advertise unavailable company mailboxes');
}
ensure(source['contact.html'].includes('Online form preparation requires JavaScript'), 'Contact must explain disabled JS fallback');
ensure(source['buyer-growth.html'].includes('Online form preparation requires JavaScript'), 'Buyer Growth must explain disabled JS fallback');
ensure(read('404.html').includes('<meta name="robots" content="noindex,follow">'), '404 page should not be indexed');
console.log('MERCOPACT trust-integrity checks passed:',checks);
