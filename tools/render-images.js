#!/usr/bin/env node
/* Renders the favicon PNGs and the link-preview card with Playwright.
   Usage: node tools/render-images.js   (needs the playwright package) */
const path = require('path');
const { chromium } = require('playwright');
const A = p => path.join(__dirname, '..', p);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport: {width: 1200, height: 630}});
  await p.goto('file://' + A('tools/og-card.html'), {waitUntil: 'networkidle'});
  await p.screenshot({path: A('assets/og-image.png')});
  for (const [file, size] of [['assets/favicon-32.png', 32], ['assets/apple-touch-icon.png', 180]]) {
    await p.setViewportSize({width: size, height: size});
    await p.goto('file://' + A('assets/favicon.svg'));  // no fixed size: scales to the viewport
    await p.screenshot({path: A(file), omitBackground: true});
  }
  await b.close();
  console.log('Wrote assets/og-image.png, assets/favicon-32.png, assets/apple-touch-icon.png');
})();
