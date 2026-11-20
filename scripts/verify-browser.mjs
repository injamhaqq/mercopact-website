/* Chromium release journeys. All external requests blocked; no enquiries sent. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),shots=path.join(root,'.qa-screenshots');
fs.mkdirSync(shots,{recursive:true});
const routes=new Map([['/','index.html']]);
for(const f of fs.readdirSync(root).filter(f=>f.startsWith('route-')&&f.endsWith('.html'))){const s=fs.readFileSync(path.join(root,f),'utf8'),r=s.match(/^permalink:\s*(\S+)/m)?.[1],inc=s.match(/include_relative\s+(\S+)\s*%}/)?.[1];if(r)routes.set(r,inc||f);}
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{try{const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname),local=routes.get(p)||(p.endsWith('/')?p.slice(1)+'index.html':p.slice(1)),f=path.resolve(root,local);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);}catch{res.writeHead(400).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true});
let count=0;function ensure(ok,why){if(!ok)throw Error(why);count++;}
async function context(width,js=true){const ctx=await browser.newContext({viewport:{width,height:840},reducedMotion:'reduce',javaScriptEnabled:js});await ctx.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());return ctx;}
async function load(page,url){const response=await page.goto(origin+url,{waitUntil:'domcontentloaded',timeout:30000});ensure(response?.ok(),'Page not reachable '+url);await page.waitForSelector('h1');}
async function layout(page,label){const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));ensure(size.scroll<=size.width+2,'Horizontal overflow '+label+': '+JSON.stringify(size));}
try{
for(const width of [320,375,390,768,1024,1180,1200,1280,1440]){
 const ctx=await context(width),page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await load(page,'/');ensure((await page.locator('h1').innerText()).replace(/\s+/g,' ').includes('Know which buyers are worth approaching.'),'Current hero missing');
 await layout(page,'home '+width);
 const entry=await page.locator('.home-entry').evaluate(el=>({
  bg:getComputedStyle(el).backgroundColor,
  fg:getComputedStyle(el.querySelector('h2')).color
 }));
 ensure(entry.bg==='rgb(247, 244, 235)' && entry.fg==='rgb(11, 31, 51)','Brief section uses unreadable colors');
 const sourceLink=page.locator('.home-proof-preview .proof-fields a');
 ensure((await sourceLink.getAttribute('href'))?.startsWith('https://www.jutebag.co.uk/'),'Hero example lacks a traceable source');
 const photo=page.locator('.home-hero-photo');
 await photo.evaluate(img=>img.decode());
 const hero=await page.locator('.home-hero > .container').evaluate(el=>({
  columns:getComputedStyle(el).gridTemplateColumns.split(' ').length,
  cta:el.querySelector('.actions a').getBoundingClientRect().bottom
 }));
 ensure(hero.columns===(width<=760?1:2),'Homepage hero columns overlap '+width);
 ensure(hero.cta<840,'Homepage primary action below the first viewport at '+width);
 if([390,1440].includes(width))await page.screenshot({path:path.join(shots,'home-first-screen-'+width+'.png')});
 if(width<=1180){const toggle=page.locator('.menu-toggle');ensure(await toggle.isVisible(),'Mobile toggle missing '+width);await toggle.click();ensure(await toggle.getAttribute('aria-expanded')==='true','Menu failed');ensure(await page.locator('#primary-navigation').isVisible(),'Nav not visible');ensure(await page.locator('.header-cta .btn').isVisible(),'CTA not visible');await page.keyboard.press('Escape');ensure(await toggle.getAttribute('aria-expanded')==='false','Escape failed');}else ensure(await page.locator('.site-nav').isVisible(),'Desktop nav missing');
 ensure(!errors.length,'JS error '+width+' '+errors.join(';'));if([320,390,1440].includes(width))await page.screenshot({path:path.join(shots,'homepage-'+width+'.png'),fullPage:true});await ctx.close();
}
const paths=['/','/packages/','/contact/','/global-buyer-pilot.html','/services/','/strategic-sourcing/','/commercial-intelligence/','/opportunities/','/managed-export-sales/','/opportunity-recovery/','/buyer-development/','/international-markets/','/about/','/privacy/','/terms/','/research-examples.html','/capabilities.html','/how-we-work/','/trust-and-method.html','/pilot-deliverables.html','/industries/','/sample-eu-us-jute-bags.html','/sample-eu-garments-knitwear.html','/sample-eu-uk-leather-footwear.html','/sample-market-access.html','/sample-uae-packaging.html','/sample-india-packaging.html'];
for(const width of [390,1440]){const ctx=await context(width),page=await ctx.newPage();for(const url of paths){const errors=[],listener=e=>errors.push(e.message);page.on('pageerror',listener);await load(page,url);ensure(await page.locator('h1').count()===1,'Exactly one H1 '+url);await layout(page,url+' '+width);ensure(!errors.length,'JS errors '+url+' '+errors.join(';'));page.off('pageerror',listener);if(url==='/pilot-deliverables.html'){ensure(await page.locator('.evidence-card').count()===2,'Sample account cards missing');await page.screenshot({path:path.join(shots,'sample-brief-'+width+'.png'),fullPage:true});}if(url==='/research-examples.html')await page.screenshot({path:path.join(shots,'research-'+width+'.png'),fullPage:true});if(url==='/contact/')await page.screenshot({path:path.join(shots,'contact-'+width+'.png'),fullPage:true});if(url==='/packages/'){ensure(await page.locator('.pricing-alternatives .mp-offer').count()===3,'Brief, Sprint and monthly options required');
const pilotAction=page.locator('.pilot-price-panel .btn-dark');
ensure(await pilotAction.getAttribute('href')==='#request-scope','Primary pricing action must stay on the pricing page');
const pilotActionBounds=await pilotAction.boundingBox();
ensure(pilotActionBounds && pilotActionBounds.y+pilotActionBounds.height<840,'Primary Pilot action below the first viewport');
await page.screenshot({path:path.join(shots,'pricing-first-screen-'+width+'.png')});
const positions=await page.locator('.mp-offer').evaluateAll(cards=>cards.map(card=>card.getBoundingClientRect().top));
ensure(width===390?positions[0]<positions[1]&&positions[1]<positions[2]:Math.max(...positions)-Math.min(...positions)<1,'Pricing cards do not follow the intended grid');
await page.locator('.pricing-question summary').first().click();
ensure(await page.locator('.pricing-question').first().getAttribute('open')!==null,'Pricing FAQ is not keyboard/click accessible');const textColor=await page.locator('.pricing-card .btn-dark').first().evaluate(el=>getComputedStyle(el).color);
ensure(textColor==='rgb(255, 255, 255)','Pricing card button label must contrast with the dark fill');
await page.evaluate(()=>window.scrollTo(0,0));
const body=await page.locator('body').innerText();for(const p of ['$600','$1,800','$3,000/month','fixed project fee'])ensure(body.includes(p),'Missing price '+p);await page.screenshot({path:path.join(shots,'engagements-'+width+'.png'),fullPage:true});}}await ctx.close();}
const nojs=await context(390,false),np=await nojs.newPage();await load(np,'/contact/');ensure(await np.locator('button[type="submit"]').isDisabled(),'Draft control enabled without JS');ensure(await np.locator('a[href^="https://wa.me/"]').count()>0,'No-JS fallback missing');await load(np,'/packages/');
await np.locator('.pilot-price-panel .btn-dark').click();
ensure(np.url().endsWith('#request-scope'),'No-JS pricing jump missing');
ensure(await np.locator('#request-scope noscript a').isVisible(),'No-JS pricing enquiry fallback missing');
await nojs.close();
const ctx=await context(390),p=await ctx.newPage();
for(const [slug,label] of [['brief','Buyer Development Brief'],['development-pilot','Buyer Development Pilot'],['outreach-sprint','Buyer Outreach Sprint'],['ongoing','Managed Buyer Development'],['recovery','Sales Opportunity Recovery'],['specialist','Specialist project'],['sprint','Sales Opportunity Recovery'],['pilot','Buyer Development Brief'],['mandate','Specialist project'],['market-proof','Buyer Development Brief'],['international-pilot','Buyer Development Brief'],['buyer-development','Buyer Development Brief'],['growth-desk','Managed Buyer Development']]) {
  await load(p,'/contact/?package='+slug);
  ensure(await p.locator('#package').inputValue()===label,'Wrong enquiry preselection '+slug);
}
await load(p,'/contact/?package=brief');
ensure((await p.locator('h1').innerText())==='Check fit for your product','Brief request heading missing');
ensure(await p.locator('[data-brief-summary]').isVisible(),'Brief request summary missing');
ensure((await p.locator('[data-brief-summary]').innerText()).includes('$600 USD'),'Brief request pricing missing');
await p.locator('#package').selectOption({label:'Buyer Outreach Sprint'});
ensure(await p.locator('[data-brief-summary]').isHidden(),'Brief context remained after switching service');
ensure((await p.locator('h1').innerText())==='Tell us what you want to sell abroad','General heading not restored');
await p.locator('#package').selectOption({label:'Buyer Development Brief'});
ensure(await p.locator('[data-brief-summary]').isVisible(),'Brief context did not return after switching service');
await load(p,'/contact/?package=outreach-sprint');
ensure(await p.locator('[data-brief-summary]').isHidden(),'Brief context shown for another service');
await load(p,'/packages/');
const pricingMenu=p.locator('.menu-toggle');
await pricingMenu.click();
await p.locator('.header-cta a').click();
ensure(await pricingMenu.getAttribute('aria-expanded')==='false','Mobile menu covered the inline enquiry');
ensure(p.url().endsWith('/packages/#request-scope'),'Header enquiry left pricing');
await p.getByRole('link',{name:'See a sample buyer record',exact:true}).click();
ensure(p.url().endsWith('/packages/#sample-buyer-record'),'Sample did not stay on pricing');
ensure(await p.locator('#sample-buyer-record a[download]').count()===1,'Sample download missing');
for (const [offer,label] of [['development-pilot','Buyer Development Pilot'],['brief','Buyer Development Brief'],['outreach-sprint','Buyer Outreach Sprint'],['ongoing','Managed Buyer Development'],['recovery','Sales Opportunity Recovery'],['specialist','Specialist project']]) {
  await p.locator('main [data-enquiry-package="'+offer+'"]').click();
  ensure(p.url().endsWith('/packages/#request-scope'),'Enquiry left pricing for '+offer);
  ensure(await p.locator('#package').inputValue()===label,'Pricing selected the wrong offer '+offer);
}
const pricingRequests=[];
p.on('request',request=>pricingRequests.push(request.url()));
await p.screenshot({path:path.join(shots,'pricing-enquiry-390.png')});
await p.locator('#name').fill('Synthetic Pricing QA');
await p.locator('#company').fill('Example Supply Co');
await p.locator('#product').fill('Reusable bags');
await p.locator('#market').fill('United Kingdom');
await p.getByRole('button',{name:'Prepare WhatsApp draft'}).click();
const pricingDraft=p.locator('#whatsapp-draft');
ensure(await pricingDraft.isVisible(),'Inline draft link missing');
ensure(new URL(await pricingDraft.getAttribute('href')).searchParams.get('text').includes('Specialist project'),'Inline draft omitted the selected offer');
ensure(pricingRequests.length===0,'Inline draft preparation sent a network request');
await p.locator('main [data-enquiry-package="brief"]').click();
ensure(await pricingDraft.isHidden() && !await pricingDraft.getAttribute('href'),'Changing offers left a stale inline draft');
ensure(await p.locator('#company').inputValue()==='Example Supply Co','Changing offers lost the prospect’s inputs');

await load(p,'/contact/?package=development-pilot');
await p.locator('[data-pilot-summary]').waitFor({state:'visible'});
ensure((await p.locator('h1').innerText())==='Request a Buyer Development Pilot scope','Pilot heading missing');
ensure(await p.locator('#package').inputValue()==='Buyer Development Pilot','Pilot option was not selected');
ensure((await p.locator('[data-pilot-summary]').innerText()).includes('$3,000 USD'),'Pilot price missing');
ensure(await p.locator('[data-brief-summary]').isHidden(),'Brief summary shown alongside Pilot');
await p.locator('#package').selectOption({label:'Buyer Development Brief'});
ensure(await p.locator('[data-pilot-summary]').isHidden(),'Pilot summary stayed visible after switching to Brief');
ensure(await p.locator('[data-brief-summary]').isVisible(),'Brief summary was not restored');
await load(p,'/contact/?package=brief');
const requests=[];
p.on('request',request=>requests.push(request.url()));
await p.locator('button[type="submit"]').click();
ensure((await p.locator('#name-error').innerText()) === 'Enter your name.','Required errors missing');
ensure(await p.locator('#name').evaluate(el=>el===document.activeElement),'First invalid control must receive focus');
await p.locator('#name').fill('Synthetic Browser QA');
await p.locator('#company').fill('Example & Partners');
await p.locator('#website').fill('ftp://example.com');
await p.locator('#product').fill('Reusable bags + samples');
await p.locator('#market').fill('United Kingdom');
await p.locator('button[type="submit"]').click();
ensure((await p.locator('#website-error').innerText()).includes('Enter a valid website address'),'Invalid website accepted');
await p.locator('#website').fill('https://example.com/catalogue?q=product');
await p.locator('#market').press('Enter');
ensure((await p.locator('.form-status').innerText()) === 'Your draft is ready. Open WhatsApp and press Send when you’re ready.','Missing draft-only status');
const draft=p.locator('#whatsapp-draft');
ensure(await draft.isVisible(),'WhatsApp draft link missing');
const wa=new URL(await draft.getAttribute('href'));
ensure(wa.origin==='https://wa.me' && wa.pathname==='/8801793122369','Wrong WhatsApp destination');
const message=wa.searchParams.get('text');
ensure(message.includes('Example & Partners') && message.includes('Reusable bags + samples') && message.includes('Buyer Development Brief'),'Draft formatting and URL encoding mismatch');
ensure(requests.length===0,'Draft preparation sent a network request');
await p.screenshot({path:path.join(shots,'contact-mobile.png'),fullPage:true});
await p.locator('#market').fill('Germany');
ensure(await draft.isHidden() && !await draft.getAttribute('href'),'Edited details leave a stale draft link');
await ctx.close();
console.log('Chromium release checks passed:',count);
}finally{await browser.close();await new Promise(r=>server.close(r));}
