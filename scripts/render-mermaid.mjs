// Render Mermaid .mmd files to high-resolution PNG using the Playwright-bundled Chromium.
// Usage: node scripts/render-mermaid.mjs <out-dir> <scale> <file1.mmd> [file2.mmd ...]
// No global deps required beyond @playwright/test (already installed) + internet for mermaid CDN.
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { basename } from 'node:path';
import https from 'node:https';

const MERMAID_CDN = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

const [, , outDir, scaleArg, ...files] = process.argv;
const scale = Number(scaleArg) || 3;
mkdirSync(outDir, { recursive: true });

const mermaidJs = await fetchText(MERMAID_CDN);
const browser = await chromium.launch();

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const page = await browser.newPage({ deviceScaleFactor: scale, viewport: { width: 1600, height: 1200 } });
  await page.setContent('<!doctype html><html><body style="margin:0;background:#ffffff"><div id="c"></div></body></html>');
  await page.addScriptTag({ content: mermaidJs });
  const ok = await page.evaluate(async (definition) => {
    try {
      // eslint-disable-next-line no-undef
      mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose', flowchart: { useMaxWidth: false }, er: { useMaxWidth: false } });
      // eslint-disable-next-line no-undef
      const { svg } = await mermaid.render('graph', definition);
      document.getElementById('c').innerHTML = svg;
      const el = document.querySelector('#c svg');
      el.removeAttribute('style');
      return true;
    } catch (e) {
      document.body.innerHTML = '<pre style="color:red">' + (e && e.message ? e.message : String(e)) + '</pre>';
      return false;
    }
  }, src);

  const outName = basename(file).replace(/\.mmd$/, '.png');
  const outPath = `${outDir}/${outName}`;
  if (!ok) {
    const err = await page.locator('pre').textContent().catch(() => 'unknown');
    console.error(`FAIL ${outName}: ${err}`);
    await page.close();
    continue;
  }
  const el = page.locator('#c svg');
  const box = await el.boundingBox();
  await el.screenshot({ path: outPath });
  console.log(`OK   ${outName}  css=${Math.round(box.width)}x${Math.round(box.height)}  px=${Math.round(box.width * scale)}x${Math.round(box.height * scale)}`);
  await page.close();
}

await browser.close();
