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
  for (const width of [320,375,390,768,1024,1440]) {
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
