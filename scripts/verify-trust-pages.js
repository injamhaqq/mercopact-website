/* MERCOPACT release contract: current approved global commercial offer, routes and form safeguards. */
const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();
const read = f => fs.readFileSync(path.join(root,f),'utf8');
const exists = f => fs.existsSync(path.join(root,f));
let checks = 0;
const ensure = (pass, why) => { checks++; if (!pass) throw new Error(why); };
const nested = ['services/index.html','strategic-sourcing/index.html','commercial-intelligence/index.html','opportunities/index.html','managed-export-sales/index.html','opportunity-recovery/index.html'];
const pages = [...fs.readdirSync(root).filter(f=>f.endsWith('.html')&&!f.startsWith('route-')&&!['buyer-growth.html','bangladesh-market-entry.html'].includes(f)),...nested];
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
  for(const href of ['/buyer-development/','/how-we-work/','/research-examples.html','/packages/','/about/']) ensure(nav.includes('href="'+href+'"'),f+' missing navigation '+href);
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
  ensure(!/Bangladesh|Dhaka/i.test(html),f+' retains origin-specific positioning');
  ensure(!/clarity\.ms|formsubmit\.co/i.test(html),f+' loads a retired provider');
  ensure(!/href="mailto:/i.test(html),f+' advertises unverified mailbox');
}
for (const [file, target] of [['buyer-growth.html','/contact/'],['bangladesh-market-entry.html','/international-markets/'],['route-global-buyer-pilot.html','/global-buyer-pilot.html']]) {
  const html = read(file);
  ensure(html.includes('noindex') && html.includes('location.replace("' + target + '"') && html.includes('href="' + target + '"'),file+' has no working redirect');
}
const home=read('index.html'), brief=read('buyer-development.html'), sprint=read('global-buyer-pilot.html'), managed=read('managed-export-sales/index.html'), pricing=read('packages.html'), contact=read('contact.html'), terms=read('terms.html'), form=read('assets/js/forms.js');
ensure(home.includes('You make the product. We help you find the buyers.'),'Global hero missing');
ensure(home.includes('href="/contact/?package=brief"') && home.includes('href="/research-examples.html"'),'Primary journey missing');
for (const [name, fee, page, scope] of [
  ['Buyer Development Brief','$600',brief,'12 researched buyer accounts'],
  ['Buyer Outreach Sprint','$1,800',sprint,'up to 20 approved initial approaches'],
  ['Managed Buyer Development','$3,000',managed,'Up to 25 approved outreach or follow-up actions']
]) {
  for (const [label, html] of [['home',home],['pricing',pricing],['terms',terms],['service detail',page]]) ensure(html.includes(name) && html.includes(fee),label+' offer mismatch: '+name);
  ensure(page.includes(scope),'Missing scope: '+name);
}
ensure(sprint.includes('$900 at kickoff') && sprint.includes('day-seven milestone'),'Sprint milestone mismatch');
ensure(terms.includes('the agreement applies'),'Signed agreement boundary missing');
for(const report of ['sample-market-access.html','sample-uae-packaging.html','sample-india-packaging.html','sample-eu-us-jute-bags.html','sample-eu-garments-knitwear.html','sample-eu-uk-leather-footwear.html'])ensure(read('research-examples.html').includes('href="/'+report+'"'),'Research hub missing '+report);
ensure(exists('assets/examples/mercopact-recovery-example.csv'),'Recovery example missing');
const csv = read('assets/examples/mercopact-account-register-example.csv');
ensure(csv.trim().split(/\r?\n/).length===3 && /JuteBag.*https:\/\/www\.jutebag/.test(csv) && /Jutexpo.*https:\/\/www\.jutexpo/.test(csv),'Sample account register does not match the preview');
ensure(!/fetch\s*\(|XMLHttpRequest|sendBeacon|formsubmit/i.test(form),'Draft preparation must not transmit data');
ensure(contact.includes('data-prepare disabled') && contact.includes('<noscript>') && contact.includes('https://wa.me/'),'No-JS contact fallback missing');
ensure(!/<form[^>]+(?:action|method)=/i.test(contact),'Contact form must have no submission endpoint');
for(const id of ['name','company','website','product','market','package'])ensure(contact.includes('id="'+id+'"'),'Enquiry field missing: '+id);
for(const [slug,label] of [['brief','Buyer Development Brief'],['outreach-sprint','Buyer Outreach Sprint'],['ongoing','Managed Buyer Development'],['recovery','Sales Opportunity Recovery'],['specialist','Specialist project']]) {
  ensure(form.includes(slug) && contact.includes('<option>'+label+'</option>'),'Offer preselection mismatch '+slug);
}
const sitemap=read('sitemap.xml'),urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
ensure(urls.length===27,'Offer release must retain all 27 canonical routes');
ensure(urls.length===new Set(urls).size,'Duplicate sitemap URLs');
for(const url of urls){const u=new URL(url);ensure(u.hostname==='mercopact.com','Foreign sitemap domain');const mapped = routes.get(u.pathname)||u.pathname.slice(1); ensure(exists(mapped),'Missing sitemap page '+u.pathname);const wrapper=read(mapped); const include=wrapper.match(/include_relative\s+(\S+)/)?.[1];ensure((include?read(include):wrapper).includes('rel="canonical" href="'+url+'"'),'Canonical mismatch '+u.pathname);}
for(const page of nested)ensure(urls.includes('https://mercopact.com/'+page.replace('index.html','')),'Missing nested sitemap '+page);
ensure((sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g)||[]).length===urls.length,'Invalid lastmod values');
const config=read('_config.yml');for(const excluded of ['operations','audits','mercopact-logo-layout-perfect','scripts','README.md','QA-REPORT.md','qa-browser.json','qa-static.json'])ensure(config.includes('  - '+excluded+'\n'),'Internal files must remain excluded: '+excluded);
ensure(!config.includes('include:'),'Unexpected publication override');
ensure(read('404.html').includes('noindex,follow'),'404 must not be indexed');
ensure(!read('assets/css/responsive.css').includes('top:calc(100% + 339px)'),'Brittle mobile CTA offset');
console.log('MERCOPACT trust-integrity checks passed:',checks);
