const {chromium}=require('playwright-core');
(async()=>{
const b=await chromium.launch({executablePath:'C:/Users/aarav/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe',headless:true});
const p=await (await b.newContext()).newPage();
await p.goto('http://localhost:4173/',{waitUntil:'domcontentloaded'});await p.waitForTimeout(2000);
const t=await p.evaluate(()=>{
  const e=[...document.querySelectorAll('h2,h3,p')].find(x=>/Three Pillars/.test(x.textContent));
  if(!e)return 'nf';
  let el=e,out=[];while(el&&out.length<6){out.push(el.tagName+'.'+el.className.toString().slice(0,90));el=el.parentElement;}
  return out.join('\n');
});
console.log(t);
await b.close();
})()
