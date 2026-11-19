/* MERCOPACT release contract: current approved global commercial offer, routes and form safeguards. */
const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();
const read = f => fs.readFileSync(path.join(root,f),'utf8');
const exists = f => fs.existsSync(path.join(root,f));
let checks = 0;
const ensure = (pass, why) => { checks++; if (!pass) throw new Error(why); };
const nested = ['services/index.html','strategic-sourcing/index.html','commercial-intelligence/index.html','opportunities/index.html'];
const pages = [...fs.readdirSync(root).filter(f=>f.endsWith('.html')&&!f.startsWith('route-')&&f!=='buyer-growth.html'),...nested];
const routes = new Map([['/','index.html'],...nested.map(f=>['/'+f.replace('index.html',''),f])]);
for (const f of fs.readdirSync(root).filter(f=>f.startsWith('route-')&&f.endsWith('.html'))) {
  const html=read(f), route=html.match(/^permalink:\s*(\S+)/m)?.[1];
  if(route) routes.set(route,f);
  const include=html.match(/include_relative\s+(\S+)\s*%}/)?.[1];
  if(include) ensure(exists(include),f+' has missing include '+include);
}
const titles=new Set();
for(const f of pages) {
  const html=read(f);
  ensure((html.match(/<h1(?:\s|>)/gi)||[]).length===1,f+' must have one H1');
  ensure(html.includes('mercopact-primary-lockup-v7.png'),f+' lost approved brand');
  ensure(html.includes('id="primary-navigation"')&&html.includes('aria-controls="primary-navigation"'),f+' missing accessible navigation');
  ensure(html.includes('<footer class="site-footer">'),f+' missing footer');
  const nav=html.match(/<nav id="primary-navigation"[\s\S]*?<\/nav>/)?.[0]||'';
  for(const href of ['/services/','/opportunities/','/research-examples.html','/packages/','/about/']) ensure(nav.includes('href="'+href+'"'),f+' missing navigation '+href);
  const title=html.match(/<title>([^<]+)<\/title>/i)?.[1]||'';
  const desc=html.match(/<meta name="description" content="([^"]+)"/i)?.[1]||'';
  ensure(title.length>8 && title.length<=85,f+' invalid title');
  ensure(desc.length>25 && desc.length<=200,f+' invalid description');
  ensure(!titles.has(title.toLowerCase()),f+' duplicate title'); titles.add(title.toLowerCase());
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);ensure(ids.length===new Set(ids).size,f+' duplicate IDs');
  for(const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const value=m[1];
    if(/^(https?:|mailto:|tel:|javascript:|data:|\/\/)/i.test(value)) continue;
    const [url,fragment]=value.split('#'); const local=decodeURIComponent(url.split('?')[0]);
    if(!local){if(fragment)ensure(ids.includes(fragment),f+' missing anchor '+fragment);continue;}
    const absolute=local.startsWith('/')?local:'/'+path.posix.normalize(path.posix.join(path.posix.dirname(f),local));
    const mapped=routes.get(absolute)||absolute.slice(1);
    ensure(exists(mapped),f+' broken local resource '+value);
    if(fragment && mapped.endsWith('.html')){const target=read(mapped);const inc=target.match(/include_relative\s+(\S+)\s*%}/)?.[1];ensure((inc?read(inc):target).includes('id="'+fragment+'"'),f+' broken target anchor '+value);}
  }
  ensure(!/we keep working at no extra cost|up to 30 more days|fast-start bonus/i.test(html),f+' retains retired guarantee or bonus');
  ensure(!/Built for Bangladesh manufacturers|We help Bangladeshi manufacturers/i.test(html),f+' retains restrictive global positioning');
  ensure(!/href="mailto:/i.test(html),f+' advertises unverified mailbox');
}
const redirect=read('buyer-growth.html');
ensure(/noindex/.test(redirect)&&redirect.includes('location.replace("/contact/"')&&redirect.includes('href="/contact/"'),'Retired buyer-growth route must redirect to contact');
const home=read('index.html'), pilot=read('global-buyer-pilot.html'), offers=read('packages.html'), contact=read('contact.html'), terms=read('terms.html'), f=read('assets/js/forms.js');
ensure(home.includes('Find the right buyers, suppliers and international business opportunities.'),'Current global hero missing');
ensure(home.includes('Commercial engagements from $750')&&home.includes('href="/packages/"'),'Homepage entry price and engagements link missing');
for(const price of ['$750','From $1,500','From $3,500/month','Custom pricing'])ensure(offers.includes(price),'Approved public price missing: '+price);
for(const label of ['Commercial Opportunity Sprint','International Buyer Development','Commercial Development Desk','Strategic Commercial Mandate'])ensure(offers.includes(label),'Approved engagement missing: '+label);
ensure(pilot.includes('40 researched companies')&&pilot.includes('50% upfront')&&pilot.includes('day 15'),'Pilot scope or payment milestones missing');
ensure(terms.includes('Existing signed agreements retain their original terms')&&terms.includes('do not guarantee purchase orders'),'Commercial quality boundaries missing');
for(const report of ['sample-market-access.html','sample-uae-packaging.html','sample-india-packaging.html','sample-eu-us-jute-bags.html','sample-eu-garments-knitwear.html','sample-eu-uk-leather-footwear.html'])ensure(home.includes('href="/'+report+'"'),'Homepage missing research '+report);
ensure(home.includes('href="/pilot-deliverables.html"'),'Homepage proof CTA missing');
for(const file of ['index.html','about.html','global-buyer-pilot.html','trust-and-method.html'])ensure(read(file).includes('href="/capabilities.html"'),file+' missing capability review');
ensure((offers.match(/<h4>What you receive<\/h4>/g)||[]).length===4,'Each offer needs an explicit deliverables list');
ensure(offers.includes('40 researched target companies')&&offers.includes('Weekly opportunity and pipeline reports')&&offers.includes('One live review call'),'Distinct tangible handoffs missing');
const capabilities=read('capabilities.html');ensure(capabilities.includes('These are competencies and review responsibilities'),'Do not imply verified staff skills');
ensure(capabilities.includes('not independently certified compliance'),'Do not imply unverified credentials');
for(const internal of ['operations/CAPABILITY-AND-SKILLS-FRAMEWORK.md','operations/CORPORATE-CREDENTIALS-AND-DUE-DILIGENCE.md','operations/INTERNATIONAL-PILOT-SOW-TEMPLATE.md','operations/QUALIFICATION-AND-READINESS-TRACKER.md'])ensure(exists(internal),'Missing operational framework '+internal);
ensure(f.includes('const FORM_DELIVERY_READY = false'),'Do not enable mailbox until end-to-end verification');
ensure(f.includes("result.success === true")&&f.includes("result.success === 'true'"),'Explicit delivery success required');
ensure(f.includes('showRecovery();')&&f.includes('recoveryWhatsApp.href')&&f.includes('new FormData(form)'),'Form must preserve typed details via fallback');
ensure((f.match(/recovery.className = 'mc-recovery'/g)||[]).length===1,'Recovery panel must be created once');
ensure(f.indexOf("recovery.className = 'mc-recovery'")<f.indexOf("form.addEventListener('submit'"),'Recovery must be initialized before submit');
ensure(f.includes('if (FORM_DELIVERY_READY) recovery.append(recoveryEmail)'),'Unverified email must remain unavailable');
ensure(contact.includes('type="submit" disabled')&&contact.includes('<noscript>')&&contact.includes('https://wa.me/'),'No-JS form must fail closed and offer WhatsApp');
for(const id of ['name','company','email','requirement','goal','budget','package'])ensure(contact.includes('id="'+id+'"'),'Enquiry field missing: '+id);
for(const [slug,label] of [['sprint','Commercial Opportunity Sprint'],['pilot','30-Day Pilot'],['ongoing','Ongoing programme'],['mandate','Strategic Commercial Mandate']])ensure(f.includes("'"+slug+"': '"+label+"'")&&contact.includes('<option>'+label+'</option>'),'Offer preselection mismatch '+slug);
const sitemap=read('sitemap.xml'),urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
ensure(urls.length===new Set(urls).size,'Duplicate sitemap URLs');
for(const url of urls){const u=new URL(url);ensure(u.hostname==='mercopact.com','Foreign sitemap domain');ensure(exists(routes.get(u.pathname)||u.pathname.slice(1)),'Missing sitemap page '+u.pathname);}
for(const page of nested)ensure(urls.includes('https://mercopact.com/'+page.replace('index.html','')),'Missing nested sitemap '+page);
ensure((sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g)||[]).length===urls.length,'Invalid lastmod values');
const config=read('_config.yml');for(const excluded of ['operations','audits','mercopact-logo-layout-perfect','scripts','README.md','QA-REPORT.md','qa-browser.json','qa-static.json'])ensure(config.includes('  - '+excluded+'\n'),'Internal files must remain excluded: '+excluded);
ensure(!config.includes('include:'),'Unexpected publication override');
ensure(read('404.html').includes('noindex,follow'),'404 must not be indexed');
ensure(!read('assets/css/responsive.css').includes('top:calc(100% + 339px)'),'Brittle mobile CTA offset');
console.log('MERCOPACT trust-integrity checks passed:',checks);
