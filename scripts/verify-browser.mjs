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
 await load(page,'/');ensure((await page.locator('h1').innerText()).includes('international commercial opportunities'),'Current hero missing');
 await layout(page,'home '+width);
 if(width<=1180){const toggle=page.locator('.menu-toggle');ensure(await toggle.isVisible(),'Mobile toggle missing '+width);await toggle.click();ensure(await toggle.getAttribute('aria-expanded')==='true','Menu failed');ensure(await page.locator('#primary-navigation').isVisible(),'Nav not visible');ensure(await page.locator('.header-cta .btn').isVisible(),'CTA not visible');await page.keyboard.press('Escape');ensure(await toggle.getAttribute('aria-expanded')==='false','Escape failed');}else ensure(await page.locator('.site-nav').isVisible(),'Desktop nav missing');
 ensure(!errors.length,'JS error '+width+' '+errors.join(';'));if([320,390,1440].includes(width))await page.screenshot({path:path.join(shots,'homepage-'+width+'.png'),fullPage:true});await ctx.close();
}
const paths=['/','/packages/','/contact/','/global-buyer-pilot.html','/services/','/strategic-sourcing/','/commercial-intelligence/','/opportunities/','/buyer-development/','/international-markets/','/about/','/privacy/','/terms/','/research-examples.html','/capabilities.html','/how-we-work/','/trust-and-method.html','/pilot-deliverables.html','/industries/','/sample-eu-us-jute-bags.html','/sample-eu-garments-knitwear.html','/sample-eu-uk-leather-footwear.html','/sample-market-access.html','/sample-uae-packaging.html','/sample-india-packaging.html'];
for(const width of [390,1280]){const ctx=await context(width),page=await ctx.newPage();for(const url of paths){const errors=[],listener=e=>errors.push(e.message);page.on('pageerror',listener);await load(page,url);ensure(await page.locator('h1').count()===1,'Exactly one H1 '+url);await layout(page,url+' '+width);ensure(!errors.length,'JS errors '+url+' '+errors.join(';'));page.off('pageerror',listener);if(url==='/packages/'){const body=await page.locator('body').innerText();for(const p of ['$750','From $1,500','From $3,500/month','Custom pricing'])ensure(body.includes(p),'Missing price '+p);await page.screenshot({path:path.join(shots,'engagements-'+width+'.png'),fullPage:true});}}await ctx.close();}
const nojs=await context(390,false),np=await nojs.newPage();await load(np,'/contact/');ensure(await np.locator('button[type="submit"]').isDisabled(),'Unverified direct POST enabled without JS');ensure(await np.locator('a[href^="https://wa.me/"]').count()>0,'No-JS fallback missing');await nojs.close();
const ctx=await context(390),p=await ctx.newPage();
for(const [slug,label] of [['sprint','Commercial Opportunity Sprint'],['pilot','30-Day Pilot'],['ongoing','Ongoing programme'],['mandate','Strategic Commercial Mandate'],['market-proof','30-Day Pilot'],['international-pilot','30-Day Pilot'],['buyer-development','Ongoing programme'],['growth-desk','Ongoing programme']]){await load(p,'/contact/?package='+slug);ensure(await p.locator('#package').inputValue()===label,'Wrong engagement preselection '+slug);}
await load(p,'/contact/');
await p.locator('#name').fill('Synthetic Browser QA');await p.locator('#company').fill('Example Test Organization');await p.locator('#email').fill('quality@example.com');await p.locator('#requirement').selectOption({index:1});await p.locator('#goal').fill('Test WhatsApp handoff only; no real enquiry');
await p.locator('button[type="submit"]').click();
ensure(/not been submitted|temporarily offline/i.test(await p.locator('.form-status').innerText()),'Must disclose offline delivery');
const recovery=p.locator('.mc-recovery a').first();ensure(await recovery.isVisible(),'WhatsApp recovery not visible');
const wa=await recovery.getAttribute('href');ensure(wa.startsWith('https://wa.me/8801793122369?text=')&&wa.includes('Synthetic'),'Fallback must preserve form content');
await p.screenshot({path:path.join(shots,'contact-mobile.png'),fullPage:true});await ctx.close();
console.log('Chromium release checks passed:',count);
}finally{await browser.close();await new Promise(r=>server.close(r));}
