const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'dist')));

const server = app.listen(3000, async () => {
  console.log('Server started on port 3000');
  
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()} ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    console.log(`[BROWSER PAGE ERROR] ${err.toString()}`);
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  // Wait a bit to let React finish rendering after network requests
  await new Promise(r => setTimeout(r, 5000));
  
  await browser.close();
  server.close();
});
