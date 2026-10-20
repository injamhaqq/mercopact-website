/* Real Chromium smoke tests for the MERCOPACT static site. No emails are transmitted. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const screenshots = path.join(root, '.qa-screenshots');
fs.mkdirSync(screenshots, { recursive: true });
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml' };
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
  const local = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const file = path.resolve(root, local);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end('Not found'); return; }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({ headless: true });
let count = 0;
function ensure(ok, message) { if (!ok) throw Error(message); count += 1; }
async function load(page, file) {
  await page.goto(origin + '/' + file, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForSelector('h1', { timeout: 15000 });
}
try {
  for (const width of [320,375,390,768,1024,1180,1200,1280,1440]) {
    const page = await browser.newPage({ viewport:{ width, height:800 }, reducedMotion:'reduce' });
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await load(page, 'index.html');
    ensure((await page.locator('h1').innerText()).includes('B2B buyers'), 'Global hero missing at '+width);
    const sizes = await page.evaluate(() => ({ 
      scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth,
      offenders: [...document.querySelectorAll('body *')].filter(el => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > innerWidth + 3 || r.left < -3);
      }).slice(0, 8).map(el => ({ tag: el.tagName, cls: String(el.className).slice(0, 70), right: Math.round(el.getBoundingClientRect().right) }))
    }));
    ensure(sizes.scroll <= sizes.client + 2, 'Horizontal overflow at '+width+'px: '+JSON.stringify(sizes));
    if (width <= 1180) {
      const menu = page.locator('.menu-toggle');
      ensure(await menu.isVisible(), 'Missing mobile menu toggle '+width);
      await menu.click();
      ensure(await menu.getAttribute('aria-expanded') === 'true', 'Menu did not open '+width);
      ensure(await page.locator('#primary-navigation').isVisible(), 'Mobile links not visible '+width);
      ensure(await page.locator('.header-cta .btn').isVisible(), 'Mobile enquiry CTA invisible '+width);
      await page.keyboard.press('Escape');
      ensure(await menu.getAttribute('aria-expanded') === 'false', 'Escape did not close menu '+width);
    } else ensure(await page.locator('.site-nav').isVisible(), 'Desktop nav missing '+width);
    ensure(errors.length === 0, 'JS errors at '+width+': '+errors.join('; '));
    if (width === 320 || width === 390 || width === 1440)
      await page.screenshot({ path:path.join(screenshots,'homepage-'+width+'.png'), fullPage:true, timeout:20000 });
    await page.close();
  }
  for (const width of [320,390,768,1440]) {
    const capabilitiesPage = await browser.newPage({ viewport:{width,height:820}, reducedMotion:'reduce' });
    const capabilityErrors = [];
    capabilitiesPage.on('pageerror', error => capabilityErrors.push(error.message));
    await load(capabilitiesPage, 'capabilities.html');
    ensure((await capabilitiesPage.locator('h1').innerText()).includes('capability'), 'Capabilities heading missing '+width);
    ensure(await capabilitiesPage.locator('a[href="/research-examples.html"]').count() > 0, 'Evidence library link missing '+width);
    ensure(await capabilitiesPage.locator('a[href="/trust-and-method.html"]').count() > 0, 'Operating standards link missing '+width);
    const size = await capabilitiesPage.evaluate(() => ({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
    ensure(size.scroll <= size.client+2, 'Capabilities horizontal overflow '+width+':'+JSON.stringify(size));
    ensure(capabilityErrors.length === 0, 'Capabilities JavaScript errors at '+width+':'+capabilityErrors.join(';'));
    if (width === 390 || width === 1440) await capabilitiesPage.screenshot({path:path.join(screenshots,'capabilities-'+width+'.png'),fullPage:true,timeout:20000});
    await capabilitiesPage.close();
  }
  for(const width of [390,1440]) {
    const programPage = await browser.newPage({viewport:{width,height:820},reducedMotion:'reduce'});
    await load(programPage,'packages.html');
    ensure(/international buyer-development engagement/i.test(await programPage.locator('h1').innerText()), 'Programs heading must target international clients');
    ensure((await programPage.locator('.package-card').count())===3, 'Three offer levels missing');
    ensure((await programPage.locator('.package-card').allInnerTexts()).every(x=>/Export Market Proof|Buyer Development System|Export Growth Desk/.test(x)), 'Program names not correctly rendered');
    ensure((await programPage.locator('body').innerText()).includes('buyer destination is selected separately'), 'Client HQ and buyer market must be separate');
    const overflow=await programPage.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    ensure(overflow<=2,'International programs overflow at '+width+'px');
    if(width===390)await programPage.screenshot({path:path.join(screenshots,'international-programs-mobile.png'),fullPage:true,timeout:20000});
    if(width===1440)await programPage.screenshot({path:path.join(screenshots,'international-programs-desktop.png'),fullPage:true,timeout:20000});
    await programPage.close();
  }
  for(const width of [390,1440]) {
    const growthPage=await browser.newPage({viewport:{width,height:820},reducedMotion:'reduce'});
    await load(growthPage,'buyer-growth.html');
    ensure((await growthPage.locator('h1').innerText()).includes('international market'), 'Buyer Growth header must serve international clients');
    ensure(await growthPage.locator('#lg-hqcountry').count()===1,'Company HQ field missing');
    ensure(await growthPage.locator('#lg-market').count()===1,'Target buyer market field missing');
    ensure(!(await growthPage.locator('body').innerText()).includes('For established Bangladesh'), 'Legacy Bangladesh-specific pitch has returned');
    const growthOverflow=await growthPage.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    ensure(growthOverflow<=2,'International assessment overflow at '+width);
    await growthPage.close();
  }
  for (const file of ['packages.html','contact.html','global-buyer-pilot.html']) {
    for (const width of [390,1440]) {
      const pricingPage = await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});
      await load(pricingPage, file);
      const content = await pricingPage.locator('body').innerText();
      ensure(!/৳|\b(?:USD|BDT)\b|(?:US\$|\$)\s*\d|\b(?:prices|pricing|fee|fees)\b/i.test(content), 'Monetary text was rendered on '+file+' at '+width);
      const scroll = await pricingPage.evaluate(() => document.documentElement.scrollWidth-document.documentElement.clientWidth);
      ensure(scroll <= 2, 'Overflow after pricing removal: '+file+' at '+width+' over='+scroll);
      if (file === 'packages.html') {
        ensure(await pricingPage.locator('.package-card').count() === 3, 'Three service cards were not preserved');
        ensure(await pricingPage.locator('.package-summary').count() === 3, 'Service summaries not rendered');
      }
      if (file === 'contact.html') {
        const options=await pricingPage.locator('select option').allInnerTexts();
        ensure(!options.some(o=>/৳|\b(?:USD|BDT)\b|(?:US\$|\$)\s*\d/.test(o)), 'Contact options disclose rates');
      }
      if(width===390 && file==='packages.html') await pricingPage.screenshot({path:path.join(screenshots,'services-no-public-rates-mobile.png'),fullPage:true,timeout:20000});
      await pricingPage.close();
    }
  }
  // Independently inspect every public page in narrow and wide viewports (not just the homepage).
  const completePublicPages = fs.readdirSync(root).filter(name => name.endsWith('.html') && !name.startsWith('route-'));
  for(const width of [390,1280]) {
    const qaPage = await browser.newPage({viewport:{width,height:840},reducedMotion:'reduce'});
    for(const file of completePublicPages) {
      const errors=[];
      const listener=error=>errors.push(error.message);
      qaPage.on('pageerror',listener);
      await load(qaPage,file);
      ensure(await qaPage.locator('h1').count() === 1, 'Exactly one H1 needed: '+file);
      const sizes=await qaPage.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
      ensure(sizes.scroll<=sizes.client+2, 'Sitewide overflow '+file+' at '+width+':'+JSON.stringify(sizes));
      ensure(errors.length===0, 'Page JS error '+file+' at '+width+':'+errors.join('; '));
      if(file==='packages.html') {
        ensure((await qaPage.locator('#packages .package-card').count())===3,'Offer cards missing from '+file);
      }
      qaPage.off('pageerror',listener);
    }
    await qaPage.close();
  }
  // Validate that each campaign URL selects the actual published option, never a stale fee label.
  for(const [slug,label] of [
    ['market-proof','Export Market Proof — focused one-market pilot'],
    ['international-pilot','International Buyer Development — recommend a scope'],
    ['buyer-development','Buyer Development System — ongoing program'],
    ['growth-desk','Export Growth Desk — coordinated expansion']
  ]) {
    const qPage=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
    await qPage.goto(origin+'/contact.html?package='+slug,{waitUntil:'domcontentloaded'});
    ensure(await qPage.locator('#package').inputValue()===label,'Wrong offer selected from '+slug+' enquiry URL');
    ensure(!(await qPage.locator('#package').inputValue()).includes('৳'),'Old rate leaked into selected offer');
    await qPage.close();
  }
  // Do not allow unverified third-party form submission when scripts are disabled.
  const noJsContext=await browser.newContext({javaScriptEnabled:false});
  for(const file of ['contact.html','buyer-growth.html']) {
    const noJs=await noJsContext.newPage();
    await noJs.goto(origin+'/'+file,{waitUntil:'domcontentloaded'});
    ensure(!(await noJs.locator('form[data-static-form]').isVisible()),'Unverified direct form POST visible without JS: '+file);
    ensure(await noJs.locator('a[href^="https://wa.me/"]').count()>0,'No real contact method without JavaScript: '+file);
    await noJs.close();
  }
  await noJsContext.close();
  const page = await browser.newPage({ viewport:{width:390,height:844}, reducedMotion:'reduce' });
  await load(page, 'contact.html');
  await page.locator('#name').fill('Synthetic Browser QA');
  await page.locator('#company').fill('Example Test Organization');
  await page.locator('#email').fill('quality@example.com');
  await page.locator('#sell').fill('Manufacturing components');
  await page.locator('#goal').fill('Test the WhatsApp handoff; no real enquiry');
  await page.locator('button[type="submit"]').click();
  const message = await page.locator('.form-status').innerText();
  ensure(/temporarily offline|not been submitted/i.test(message), 'Contact form must disclose it was not submitted: '+message);
  const recovery = page.locator('.mc-recovery a').first();
  ensure(await recovery.isVisible(), 'WhatsApp prepared handoff not visible');
  const wa = await recovery.getAttribute('href');
  ensure(wa.startsWith('https://wa.me/8801793122369?text='), 'Invalid WhatsApp handoff URL');
  ensure(wa.includes('Synthetic'), 'Prepared handoff did not preserve form content');
  await page.screenshot({ path:path.join(screenshots,'contact-mobile.png'), fullPage:true, timeout:20000 });
  await page.close();
  const domestic = await browser.newPage({ viewport:{width:375,height:812}, reducedMotion:'reduce' });
  await load(domestic, 'buyer-growth.html');
  await domestic.locator('#lg-name').fill('Synthetic Domestic QA');
  await domestic.locator('#lg-company').fill('Example Organization');
  await domestic.locator('#lg-email').fill('domestic@example.com');
  await domestic.locator('#lg-sell').fill('Packaging supply');
  await domestic.locator('#lg-target').fill('Industrial procurement');
  await domestic.locator('button[type="submit"]').click();
  ensure(await domestic.locator('.mc-recovery.is-visible').isVisible(), 'Domestic enquiry fallback did not appear');
  await domestic.close();
  console.log('Chromium site checks passed:',count,'including mobile/desktop layouts, keyboard navigation and offline form recovery.');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
