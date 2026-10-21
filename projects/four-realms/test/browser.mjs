// Run after building and starting the server. Install Chromium with
// `npx playwright install chromium`, or provide CHROMIUM_PATH.
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:3000');await page.click('#practice');
 await page.waitForFunction(()=>!document.querySelector('#world').hidden);
 await page.click('#leave');await page.setViewportSize({width:390,height:844});
 assert.equal(await page.locator('#practice').isVisible(),true);
 await page.click('#duel');await page.click('#host');
 await page.waitForFunction(()=>document.querySelector('#mode-label').textContent.includes('PRIVATE DUEL'));
 const code=(await page.locator('#mode-label').textContent()).split(' · ')[1];
 const second=await browser.newPage();second.on('pageerror',e=>errors.push(e.message));
 await second.goto('http://localhost:3000');await second.click('[data-element=air]');
 await second.click('#duel');await second.fill('#code',code);await second.click('#join');
 await page.waitForFunction(()=>document.querySelector('#match-status').textContent.includes('Air opponent'));
 await second.waitForFunction(()=>document.querySelector('#match-status').textContent.includes('Fire opponent'));
 assert.deepEqual(errors,[]);console.log('Browser flow passed: training, mobile menu and two-player room.');
} finally {await browser.close();}
