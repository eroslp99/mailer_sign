const fs = require("fs");
const puppeteer = require('puppeteer');
const core = require('@actions/core');
const github = require('@actions/github');
const { tFormat, sleep, clearBrowser, getRndInteger, randomOne, randomString,findFrames,findFrame  } = require('./common.js');
//const { sbFreeok,login,loginWithCookies,resetPwd } = require('./utils.js');
const runId = github.context.runId;
let browser;
let setup = {};
if (!runId) {
    setup  = JSON.parse(fs.readFileSync('./setup.json', 'utf8'));
  }else{
    setup  = JSON.parse(process.env.SETUP);
  }
let pwd = setup.pwd['163'];
async function  main () {
    //console.log(await sqlite.open('./freeok.db'))
    const browser = await puppeteer.launch({ 
        headless: runId?true:false ,
        args: ['--window-size=1920,1080'],
        defaultViewport: null,
        ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
    await page.goto('https://bulink.me/sub/3mumg/vm',{ timeout: 60000 });
    let content = await page.$eval('body',e=>e.innerHTML);
    // create a buffer
    let buff = Buffer.from(content, 'base64');
    // decode buffer as UTF-8
    content = buff.toString('utf-8');
    const ss = content.split('\n');
    let i=0;
    let output = [];
    for (let s of ss) {
      i++;
      if (!s) continue;
      let a = s.split('://');
      if (a[0] === 'vmess'){
        buff = Buffer.from(a[1], 'base64');
        content = buff.toString('utf-8');
        if (content.includes('bulink') || content.includes('BuLink')) continue;
        a[1] = content.replace(/freefq/g, "aiboboxx")
      }else{
        a[1] = a[1].replace(/freefq/g, "aiboboxx")       
      }
      //console.log(i,a[0],a[1]); 
      output.push(a[0]+'://'+a[1]);
    }
    console.log(output.join('\n'));
    if ( runId?true:false ) await browser.close();
}
main();

