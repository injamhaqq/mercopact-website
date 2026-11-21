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
 await load(page,'/');ensure((await page.locator('h1').innerText()).replace(/\s+/g,' ').includes('Find buyers worth approaching.'),'Current hero missing');
 await layout(page,'home '+width);
 const entry=await page.locator('.home-entry').evaluate(el=>({
  bg:getComputedStyle(el).backgroundColor,
  fg:getComputedStyle(el.querySelector('h2')).color
 }));
 ensure(entry.bg==='rgb(247, 244, 237)' && entry.fg==='rgb(11, 31, 51)','Brief section must use the brand ivory and navy');
 const action=await page.locator('.home-hero .btn-primary').evaluate(el=>({bg:getComputedStyle(el).backgroundColor,fg:getComputedStyle(el).color}));
 ensure(action.bg==='rgb(200, 155, 60)' && action.fg==='rgb(11, 31, 51)','Primary home action must use brass and navy');
 await page.locator('.home-hero-photo').evaluate(img=>img.decode());
 const sourceLink=page.locator('#buyer-method .method-step a');
 ensure((await sourceLink.getAttribute('href'))?.startsWith('https://www.jutebag.co.uk/'),'Buyer example lacks a traceable source');
 ensure(await page.getByRole('complementary',{name:'Sample buyer register'}).isVisible(),'Buyer register preview missing');
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
for(const width of [320,390,1440]){const ctx=await context(width),page=await ctx.newPage();for(const url of paths){const errors=[],listener=e=>errors.push(e.message);page.on('pageerror',listener);await load(page,url);ensure(await page.locator('h1').count()===1,'Exactly one H1 '+url);await layout(page,url+' '+width);ensure(!errors.length,'JS errors '+url+' '+errors.join(';'));page.off('pageerror',listener);if(url==='/pilot-deliverables.html'){ensure(await page.locator('.evidence-card').count()===2,'Sample account cards missing');await page.screenshot({path:path.join(shots,'sample-brief-'+width+'.png'),fullPage:true});}if(url==='/research-examples.html')await page.screenshot({path:path.join(shots,'research-'+width+'.png'),fullPage:true});if(url==='/contact/')await page.screenshot({path:path.join(shots,'contact-'+width+'.png'),fullPage:true});if(url==='/packages/'){const options=page.locator('.pricing-alternatives .pricing-option');
ensure(await options.count()===3,'Research, existing Brief and monthly support must each have a disclosure');
ensure(await page.locator('.pricing-routes a[href="#pilot-scope"]').isVisible() && await page.locator('.pricing-routes a[href="#quote-follow-up"]').isVisible(),'Both buying situations must be visible');
const pilotAction=page.locator('.pilot-price-panel .btn-dark');
ensure(await pilotAction.getAttribute('href')==='#request-scope','Primary pricing action must stay on the pricing page');
const pilotActionBounds=await pilotAction.boundingBox();
ensure(pilotActionBounds && pilotActionBounds.y+pilotActionBounds.height<840,'Primary Pilot action below the first viewport');
await page.screenshot({path:path.join(shots,'pricing-first-screen-'+width+'.png')});
const paymentStages=await page.locator('.pilot-price-panel .pilot-milestones dt').allTextContents();
ensure(paymentStages.length===2 && paymentStages[0].includes('$1,500 at kickoff') && paymentStages[1].includes('$1,500 at shortlist delivery'),'Pilot must show both payment milestones with its price');
const positions=await options.evaluateAll(rows=>rows.map(row=>row.getBoundingClientRect().top));
ensure(positions[0]<positions[1] && positions[1]<positions[2],'Secondary prices must stay in reading order');
const briefOption=options.first();
ensure(!await briefOption.locator('h3').isVisible(),'The secondary offer details should start collapsed');
await briefOption.locator('summary').press('Enter');
ensure(await briefOption.getByRole('heading',{name:'Buyer Development Brief'}).isVisible(),'The secondary offer must open with the keyboard');
await briefOption.locator('summary').press('Enter');
const question=page.locator('#buyer-questions details').first();
await question.locator('summary').press('Enter');
ensure(await question.locator('p').isVisible(),'The FAQ must open with the keyboard');
const textColor=await pilotAction.evaluate(el=>getComputedStyle(el).color);
ensure(textColor==='rgb(255, 255, 255)','Pilot button needs a legible label');
await page.evaluate(()=>window.scrollTo(0,0));
const body=await page.locator('body').innerText();for(const p of ['$600','$1,800','$3,000/month','fixed project fee'])ensure(body.includes(p),'Missing price '+p);await page.screenshot({path:path.join(shots,'engagements-'+width+'.png'),fullPage:true});}}await ctx.close();}
const aboutContext=await context(390),aboutPage=await aboutContext.newPage();
await load(aboutPage,'/about/');
ensure(await aboutPage.getByRole('heading',{name:'Across Markets. With Confidence.'}).isVisible(),'Brand promise is missing from About');
await aboutPage.locator('.about-brand-mark img').evaluate(img=>img.decode());
ensure(await aboutPage.getByRole('link',{name:'Injam Haq on LinkedIn'}).getAttribute('href')==='https://www.linkedin.com/in/injamhaq/','Founder profile link is incorrect');
await aboutContext.close();
const animated=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
await animated.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
const motionPage=await animated.newPage();
await load(motionPage,'/');
await motionPage.getByRole('link',{name:'Preview the buyer register'}).press('Enter');
ensure(motionPage.url().endsWith('#buyer-register'),'Preview link did not open the register');
await motionPage.getByRole('link',{name:'See how we assess this buyer'}).press('Enter');
ensure(motionPage.url().endsWith('#buyer-method'),'Register did not lead to the buyer walkthrough');
await motionPage.getByText('Check what the listing leaves open',{exact:true}).press('Enter');
ensure(await motionPage.getByText(/Whether the company wants a new supplier/).isVisible(),'Evidence interaction is not keyboard accessible');
await animated.close();

const nojs=await context(390,false),np=await nojs.newPage();
await load(np,'/');
ensure(await np.getByRole('complementary',{name:'Sample buyer register'}).isVisible(),'Buyer register preview requires JavaScript');
ensure(await np.getByText('Find a product match',{exact:true}).isVisible(),'Buyer proof requires JavaScript');await load(np,'/contact/');ensure(await np.locator('button[type="submit"]').isDisabled(),'Draft control enabled without JS');ensure(await np.locator('a[href^="https://wa.me/"]').count()>0,'No-JS fallback missing');await load(np,'/packages/');
await np.locator('.pricing-routes a[href="#quote-follow-up"]').click();
ensure(np.url().endsWith('#quote-follow-up') && await np.locator('#quote-follow-up h2').isVisible(),'Quote follow-up needs a working no-JS route');
await np.locator('.pilot-price-panel .btn-dark').click();
ensure(np.url().endsWith('#request-scope'),'No-JS pricing jump missing');
ensure(await np.locator('#request-scope noscript a').isVisible(),'No-JS pricing enquiry fallback missing');
await nojs.close();
const ctx=await context(390),p=await ctx.newPage();
for(const [slug,label] of [['brief','Buyer Development Brief'],['development-pilot','Buyer Development Pilot'],['outreach-sprint','Buyer Outreach Sprint'],['ongoing','Managed Buyer Development'],['quote-follow-up','Export Quote & Sample Sprint'],['recovery','Export Quote & Sample Sprint'],['specialist','Specialist project'],['sprint','Export Quote & Sample Sprint'],['pilot','Buyer Development Brief'],['mandate','Specialist project'],['market-proof','Buyer Development Brief'],['international-pilot','Buyer Development Brief'],['buyer-development','Buyer Development Brief'],['growth-desk','Managed Buyer Development']]) {
  await load(p,'/contact/?package='+slug);
  ensure(await p.locator('#package').inputValue()===label,'Wrong enquiry preselection '+slug);
}
await load(p,'/contact/?package=quote-follow-up');
ensure(await p.locator('[data-quote-summary]').isVisible(),'Open-quote enquiry did not explain the selected service');
ensure(!await p.locator('#market').evaluate(field=>field.required),'Open quote enquiry requires a new target market');
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
const sample = p.getByRole('link',{name:'Download the sample buyer register (CSV)'});
const downloadPromise = p.waitForEvent('download');
await sample.click();
const download = await downloadPromise;
ensure(download.suggestedFilename()==='mercopact-pilot-handoff-example.csv','Wrong sample downloaded');
const walkthrough=p.locator('#sample-walkthrough');
await walkthrough.locator('summary').press('Enter');
ensure(await walkthrough.locator('blockquote').isVisible(),'Sample outreach draft is inaccessible');
ensure((await walkthrough.innerText()).includes('illustrative draft and was never sent'),'Sample draft is missing its label');

for (const [offer,label] of [['development-pilot','Buyer Development Pilot'],['brief','Buyer Development Brief'],['outreach-sprint','Buyer Outreach Sprint'],['ongoing','Managed Buyer Development'],['quote-follow-up','Export Quote & Sample Sprint'],['specialist','Specialist project']]) {
  const links=p.locator('main [data-enquiry-package="'+offer+'"]');
  ensure(await links.count()>0,'Missing enquiry action for '+offer);
  for (const link of await links.all()) {
    const option=link.locator('xpath=ancestor::details');
    if(await option.count() && !await link.isVisible()) await option.locator('summary').press('Enter');
    await link.click();
    ensure(p.url().endsWith('/packages/#request-scope'),'Enquiry left pricing for '+offer);
    ensure(await p.locator('#package').inputValue()===label,'Pricing selected the wrong offer '+offer);
    ensure(await p.locator('#market').evaluate(field=>field.required)===(offer!=='quote-follow-up'),'Wrong market requirement for '+offer);
  }
  if (offer==='quote-follow-up') {
    await pricingMenu.click();
    await p.locator('.header-cta a').click();
    ensure(await p.locator('#package').inputValue()===label,'The general scope link overwrote the quote enquiry');
  }
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
