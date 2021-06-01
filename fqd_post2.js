const fs = require("fs")
const core = require('@actions/core');
const github = require('@actions/github');
const myfuns = require('./myfuns.js');
// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra')
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
Date.prototype.Format = myfuns.Format;
async function  autoPost (page) {
    let selecter = '';
    await page.goto('https://fanqiangdang.com/forum.php');
    await page.waitForFunction(
        (selecter) => document.querySelector(selecter).innerText.includes("翻墙论坛"),
        {timeout:10000},
        'body'
      )
      .then(async ()=>{console.log("无需验证");await myfuns.Sleep(1000);})
      .catch(async (error)=>{
          console.log('需要验证 ');
          await page.goto('https://accounts.hcaptcha.com/verify_email/ebf36f8b-0722-4253-9d81-94193b9c91e7');
          selecter = "#root > div > div.sc-fKgJPI.cxbltl > div > div.sc-ikXwFM.sc-uxdHp.hZHGfK.fiDOnB > button";
          await page.waitForSelector(selecter,{timeout:20000})    
          .catch(async ()=>{
              console.log ('设置cookie按钮不存在');
              return Promise.reject(new Error('设置cookie按钮不存在'));
          });
          await myfuns.Sleep(1000);
          await page.click(selecter);
          await page.waitForFunction(
              (selecter) => document.querySelector(selecter).innerText.includes("Cookie集"),
              {timeout:20000},
              '#root > div > div.sc-fKgJPI.cxbltl > div > div.sc-ikXwFM.sc-uxdHp.hZHGfK.fiDOnB > span'
            ).then(async ()=>{console.log("设置Cookie集成功");await myfuns.Sleep(1000);})
            .catch(async (error)=>{
                console.log ('重新获取cookie集');
                await page.goto('https://accounts.hcaptcha.com/verify_email/ebf36f8b-0722-4253-9d81-94193b9c91e7');
                selecter = "#root > div > div.sc-fKgJPI.cxbltl > div > div.sc-ikXwFM.sc-uxdHp.hZHGfK.fiDOnB > button";
                await page.waitForSelector(selecter,{timeout:20000})    
                .catch(async ()=>{
                    console.log ('设置cookie按钮不存在');
                    return Promise.reject(new Error('设置cookie按钮不存在'));
                });
                await myfuns.Sleep(1000);
                await page.click(selecter);
                await page.waitForFunction(
                    (selecter) => document.querySelector(selecter).innerText.includes("Cookie集"),
                    {timeout:20000},
                    '#root > div > div.sc-fKgJPI.cxbltl > div > div.sc-ikXwFM.sc-uxdHp.hZHGfK.fiDOnB > span'
                  )                
                  .catch(async ()=>{
                    console.log ('获取cookie集失败');
                    return Promise.reject(new Error('获取cookie集失败'));
                });
            });
          await myfuns.Sleep(1000); 
          await page.goto('https://fanqiangdang.com/forum.php');
          await myfuns.Sleep(10000);
          const frames = await page.mainFrame().childFrames();
          let i = 0;
          for (let frame of frames){
              i++;
              //console.log(frames.length,frame.url(),frame.setContent(i));//查看得到的frame列表数量
              //console.log(frame.url());
              if (frame.url().includes('https://newassets.hcaptcha.com/captcha/v1/c4ed6d3/static/hcaptcha-checkbox.html')){
                  await frame.waitForSelector('#checkbox',{timeout:20000}).catch(error => console.log('#checkbox: ', error.message));
                  await frame.click('#checkbox');
                  await page.waitForFunction(
                    (selecter) => document.querySelector(selecter).innerText.includes("eroslp"),
                    {timeout:20000},
                    'body'
                  )
                  .then(async ()=>{
                      console.log("登录成功");
                      await myfuns.Sleep(1000);
                    })
                  .catch(error => console.log('登录失败: ', error.message));
                  break;
              }
          } 
        });
    await page.goto('https://fanqiangdang.com/forum.php?mod=post&action=newthread&fid=51');
    //await page.waitFor(1500);
    selecter = '#typeid_ctrl';
    await page.waitForSelector(selecter);
    await page.click(selecter);
    await myfuns.Sleep(500);
    selecter = '#typeid_ctrl_menu > ul > li:nth-child(3)';
    await page.waitForSelector(selecter);
    await page.click(selecter);
    await myfuns.Sleep(500);
    selecter = '#subject';
    await page.waitForSelector(selecter);
    await page.type(selecter,
        ` 私人专属 v2ray 免费点阅地址  ${(new Date()).Format("yyyy-MM-dd") }更新`
        );
    let content = `
    网速：10+Mbps网速，720-1080P支持；
    延迟：50ms+延迟，UDP加速器支持，KCP支持；
    节点：香港、新加坡、日本、韩国等100+数量全球节点，高速稳定 秒开4k 支持网飞
    ${(new Date()).Format("yyyy-MM-dd") }更新
    订阅地址公开后容易失效，
    请到 https://www.aiboboxx.ml/post/free-v2ray/
    获取私人专属v2ray订阅地址，长期可用。资源有限，先到先得。
    [hide]
    https://rss.srss.xyz/link/3IyNlMsb93pAuo7d?mu=2
    [/hide] 
    `;
    //find frame index
/*     const frames = await page.mainFrame().childFrames();   
    let i = 0;
    for (let frame of frames){
        i++;
        console.log(frames.length,frame.setContent(i));//查看得到的frame列表数量
    } */
    //return;
    let frame = (await page.mainFrame().childFrames())[2];   
    await frame.waitForSelector('body');
    await frame.type('body', content);
    selecter = '#postsubmit > span';
    await page.waitForSelector(selecter);
    await page.click(selecter);
    await  page.waitForNavigation();
}  
async function  main () {
    let runId = github.context.runId;
        //console.log(await sqlite.open('./freeok.db'))
    const browser = await puppeteer.launch({ 
        headless: runId?true:false ,
        //slowMo: 150,
        args: [
            '--window-size=1920,1080',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
        ],
        defaultViewport: null,
        //ignoreHTTPSErrors: true,
        ignoreDefaultArgs: ["--enable-automation"],
        //userDataDir: './userdata'
    });
    const page = await browser.newPage();
    page.on('dialog', async dialog => {
        //console.info(`➞ ${dialog.message()}`);
        await dialog.dismiss();
    });
    console.log(`*****************开始fqd发帖 ${Date()}*******************\n`);  
    await autoPost(page).then(()=>{
          console.log ('fqd发帖成功');
    });
    //sqlite.close();
    if ( runId?true:false ) await browser.close();
}
main();
