#!/usr/bin/env node
// Live verification — catches what curl CANNOT:
//  - React hydration error #418 (localStorage-in-render)
//  - sub-resource 404 (favicon) — curl -I / returns 200 but browser console 404s
//  - stuck "Loading..." (hydration never completes)
// Usage: node verify-live.js <baseUrl>   (or VERIFY_BASE_URL env)
// Routes: default list below, override with VERIFY_ROUTES="a,b,c" (no leading slash issues handled)
const puppeteer = require('puppeteer');

const base = process.argv[2] || process.env.VERIFY_BASE_URL || 'http://localhost:3000';
const routeArg = process.env.VERIFY_ROUTES;
const routes = routeArg
  ? routeArg.split(',').map((r) => (r.startsWith('/') ? r : '/' + r))
  : ['/', '/login', '/register', '/dashboard', '/tasks', '/vendors', '/budget', '/inventory', '/assets', '/finance', '/share', '/waha', '/settings', '/s/demo-household'];

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  } catch (e) {
    console.log('LAUNCH_FAIL', e.message);
    process.exit(2);
  }
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push('PAGEERROR: ' + err.message));

  let totalErrors = 0;
  for (const r of routes) {
    errors.length = 0;
    try {
      await page.goto(base + r, { waitUntil: 'networkidle0', timeout: 20000 });
      await new Promise((res) => setTimeout(res, 1500));
      const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 200));
      const stillLoading = bodyText.includes('Loading...') && bodyText.length < 50;
      const status = errors.length === 0 && !stillLoading ? 'OK' : 'FAIL';
      if (errors.length) totalErrors += errors.length;
      console.log(`${r} → ${status} errors=${errors.length}${stillLoading ? ' STILL_LOADING' : ''}`);
      if (errors.length) console.log('    ', errors.slice(0, 3).join(' | ').slice(0, 300));
    } catch (e) {
      console.log(`${r} → NAV_FAIL ${e.message.slice(0, 100)}`);
      totalErrors += 1;
    }
  }
  await browser.close();
  console.log(totalErrors === 0 ? 'VERIFY_PASS' : `VERIFY_FAIL total=${totalErrors}`);
  process.exit(totalErrors === 0 ? 0 : 1);
})();
