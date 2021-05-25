const fs = require("fs");
//const sqlite = require('./asqlite3.js')
const puppeteer = require('puppeteer');
const core = require('@actions/core');
const github = require('@actions/github');
const myfuns = require('./myfuns.js');
Date.prototype.Format = myfuns.Format;
const runId = github.context.runId;

async function  main () {
    //console.log(await sqlite.open('./freeok.db'))
    const browser = await puppeteer.launch({ 
        headless: runId?true:false ,
        args: ['--window-size=1920,1080'],
        defaultViewport: null,
        ignoreHTTPSErrors: true
    });
    const page = await browser.newPage();
    // 当页面中的脚本使用“alert”、“prompt”、“confirm”或“beforeunload”时发出
    page.on('dialog', async dialog => {
        //console.info(`➞ ${dialog.message()}`);
        await dialog.dismiss();
    });

    let cookies = {};
    //let allck = JSON.parse(fs.readFileSync('./allck.json', 'utf8'));
    cookies = JSON.parse(fs.readFileSync('./eroslp99@github.com.json', 'utf8'));
    //cookies = allck['eroslp99@github.com'];
    await page.setCookie(...cookies);
    await page.goto('https://github.com/freefq/free/issues/');
    let body =  await page.$eval('body', el => el.innerText);
    if (body.includes("免费白嫖公益v2ray机场订阅地址自助获取")){
        console.log("已存在！");
        return Promise.resolve('已存在！');
    }
    await page.goto('https://github.com/freefq/free/issues/new');
    await myfuns.Sleep(1000);
    await page.waitForSelector("#issue_title");
    await myfuns.Sleep(1000);
    await page.type("#issue_title",'免费白嫖公益v2ray机场订阅地址自助获取');
    let content = `
    免费白嫖公益v2ray机场订阅地址自助获取
    https://www.aiboboxx.ml/post/free-v2ray/
    `;
    await page.type("#issue_body",content);
    await page.evaluate('document.querySelector("#new_issue > div > div > div.flex-shrink-0.col-12.col-md-9.mb-4.mb-md-0 > div > div.timeline-comment.color-bg-canvas.hx_comment-box--tip > div > div.flex-items-center.flex-justify-end.mx-2.mb-2.px-0.d-none.d-md-flex > button").click()');
    await page.waitForFunction(
        (selecter) => document.querySelector(selecter).innerText.includes("免费白嫖公益v2ray机场订阅地址自助获取"),
        {timeout:6000},
        'body'
      ).then(()=>{console.log("发布成功!");});
    //await page.click("#_mail_icon_21_182");
    //await myfuns.Sleep(5000);
    cookies = await page.cookies();
    //allck['eroslp99@github.com'] = cookies;
    //sqlite.close();
    fs.writeFileSync('./eroslp99@github.com.json', JSON.stringify(cookies, null, '\t'))
    if ( runId?true:false ) await browser.close();
}
main();

