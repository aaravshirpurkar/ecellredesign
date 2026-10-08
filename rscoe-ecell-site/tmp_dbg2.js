const {chromium}=require('playwright-core');
(async()=>{
const b=await chromium.launch({executablePath:'C:/Users/aarav/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe',headless:true});
const p=await (await b.newContext()).newPage();
await p.goto('http://localhost:4173/blogdetails',{waitUntil:'domcontentloaded'});await p.waitForTimeout(800);
const info=await p.evaluate(() => {
  const h=[...document.querySelectorAll('h3')].find(e=>/idea is not/i.test(e.textContent));
  const nodes=[];
  (function gather(n){ [...n.childNodes].forEach(c=>{ if(c.nodeType===3) nodes.push(JSON.stringify(c.textContent)); else gather(c); }); })(h);
  return 'nodes: '+nodes.join(' | ');
});
console.log(info);
await b.close();
})()
