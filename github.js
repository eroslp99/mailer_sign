const fs = require("fs");
const puppeteer = require('puppeteer');
const core = require('@actions/core');
const github = require('@actions/github');
const { tFormat, sleep, clearBrowser, getRndInteger, randomOne, randomString,findFrames  } = require('./common.js');
//const { sbFreeok,login,loginWithCookies,resetPwd } = require('./utils.js');
const runId = github.context.runId;
let browser;
let setup = {};
if (!runId) {
    setup  = JSON.parse(fs.readFileSync('./setup.json', 'utf8'));
  }else{
    setup  = JSON.parse(process.env.SETUP);
  }
let usr = setup.usr['github'];
let pwd = setup.pwd['github'];

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
    await page.goto('https://github.com/login');
    await page.waitForSelector('#login_field',{ timeout: 60000 });//等待用户名输入框出现
    await page.type('#login_field',usr);//输入账户
    await page.waitForSelector('#password');//等待密码框出现
    await page.type('#password',pwd);//输入密码
    await page.click('#login > div.auth-form-body.mt-3 > form > div > input.btn.btn-primary.btn-block.js-sign-in-button');
    //await page.waitForNavigation();
    await sleep(1000);
    await page.waitForFunction(
        (selecter,string) => {
            if (document.querySelector(selecter)){
                //console.log("body",document.querySelector('body').innerText);
                return document.querySelector(selecter).innerText.includes(string);
            }else{
                return false;
            }
        },
        { timeout: 60000 },
        'body',
        'Repositories'
    ) 
    //let cookies = {};
    //cookies = JSON.parse(fs.readFileSync('./eroslp99@github.com.json', 'utf8'));
    //await page.setCookie(...cookies);
    await page.goto('https://github.com/freefq/free/issues/');
    let body =  await page.$eval('body', el => el.innerText);
    if (body.includes("免费白嫖公益v2ray机场订阅地址自助获取")){
        console.log("已存在！");
    }else{
        await page.goto('https://github.com/freefq/free/issues/new');
        await sleep(1000);
        await page.waitForSelector("#issue_title");
        await sleep(1000);
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
    }

    //cookies = await page.cookies();
    //fs.writeFileSync('./eroslp99@github.com.json', JSON.stringify(cookies, null, '\t'))
    if ( runId?true:false ) await browser.close();
}
main();

