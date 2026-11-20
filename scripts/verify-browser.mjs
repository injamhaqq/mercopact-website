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
 await load(page,'/');ensure((await page.locator('h1').innerText()).includes('You make the product. We help you find the buyers.'),'Current hero missing');
 await layout(page,'home '+width);
 if(width<=1180){const toggle=page.locator('.menu-toggle');ensure(await toggle.isVisible(),'Mobile toggle missing '+width);await toggle.click();ensure(await toggle.getAttribute('aria-expanded')==='true','Menu failed');ensure(await page.locator('#primary-navigation').isVisible(),'Nav not visible');ensure(await page.locator('.header-cta .btn').isVisible(),'CTA not visible');await page.keyboard.press('Escape');ensure(await toggle.getAttribute('aria-expanded')==='false','Escape failed');}else ensure(await page.locator('.site-nav').isVisible(),'Desktop nav missing');
 ensure(!errors.length,'JS error '+width+' '+errors.join(';'));if([320,390,1440].includes(width))await page.screenshot({path:path.join(shots,'homepage-'+width+'.png'),fullPage:true});await ctx.close();
}
const paths=['/','/packages/','/contact/','/global-buyer-pilot.html','/services/','/strategic-sourcing/','/commercial-intelligence/','/opportunities/','/managed-export-sales/','/opportunity-recovery/','/buyer-development/','/international-markets/','/about/','/privacy/','/terms/','/research-examples.html','/capabilities.html','/how-we-work/','/trust-and-method.html','/pilot-deliverables.html','/industries/','/sample-eu-us-jute-bags.html','/sample-eu-garments-knitwear.html','/sample-eu-uk-leather-footwear.html','/sample-market-access.html','/sample-uae-packaging.html','/sample-india-packaging.html'];
for(const width of [390,1440]){const ctx=await context(width),page=await ctx.newPage();for(const url of paths){const errors=[],listener=e=>errors.push(e.message);page.on('pageerror',listener);await load(page,url);ensure(await page.locator('h1').count()===1,'Exactly one H1 '+url);await layout(page,url+' '+width);ensure(!errors.length,'JS errors '+url+' '+errors.join(';'));page.off('pageerror',listener);if(url==='/packages/'){ensure(await page.locator('.mp-offer').count()===3,'Three engagement cards required');const body=await page.locator('body').innerText();for(const p of ['$600','$1,800','$3,000/month'])ensure(body.includes(p),'Missing price '+p);await page.screenshot({path:path.join(shots,'engagements-'+width+'.png'),fullPage:true});}}await ctx.close();}
const nojs=await context(390,false),np=await nojs.newPage();await load(np,'/contact/');ensure(await np.locator('button[type="submit"]').isDisabled(),'Draft control enabled without JS');ensure(await np.locator('a[href^="https://wa.me/"]').count()>0,'No-JS fallback missing');await nojs.close();
const ctx=await context(390),p=await ctx.newPage();
for(const [slug,label] of [['brief','Buyer Development Brief'],['outreach-sprint','Buyer Outreach Sprint'],['ongoing','Managed Buyer Development'],['recovery','Sales Opportunity Recovery'],['specialist','Specialist project'],['sprint','Sales Opportunity Recovery'],['pilot','Buyer Development Brief'],['mandate','Specialist project'],['market-proof','Buyer Development Brief'],['international-pilot','Buyer Development Brief'],['buyer-development','Buyer Development Brief'],['growth-desk','Managed Buyer Development']]) {
  await load(p,'/contact/?package='+slug);
  ensure(await p.locator('#package').inputValue()===label,'Wrong enquiry preselection '+slug);
}
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
