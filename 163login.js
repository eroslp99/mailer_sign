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
        ignoreHTTPSErrors: true,
        userDataDir: './userdata'
    });
    const page = await browser.newPage();
    // 当页面中的脚本使用“alert”、“prompt”、“confirm”或“beforeunload”时发出
    page.on('dialog', async dialog => {
        //console.info(`➞ ${dialog.message()}`);
        await dialog.dismiss();
    });

    //let cookies = {};
    //let allck = JSON.parse(fs.readFileSync('./allck.json', 'utf8'));
    //cookies = JSON.parse(fs.readFileSync('./aiboboxx@163.com.json', 'utf8'));
    //cookies = allck['aiboboxx@163.com'];
    //await page.setCookie(...cookies);
    await page.goto('https://mail.163.com/');
    await myfuns.Sleep(1000);
    await page.waitForSelector("#_mail_icon_21_182");
    await myfuns.Sleep(1000);
    await page.evaluate('document.querySelector("#_mail_icon_21_182").click()');
    await page.waitForFunction(
        (selecter) => document.querySelector(selecter).innerText.includes("收取完成"),
        {timeout:60000},
        'body'
      ).then(()=>{console.log("收取完成!");});
    //await page.click("#_mail_icon_21_182");
    //await myfuns.Sleep(5000);
    //cookies = await page.cookies();
    //allck['aiboboxx@163.com'] = cookies;
    //sqlite.close();
    //fs.writeFileSync('./aiboboxx@163.com.json', JSON.stringify(cookies, null, '\t'))
    if ( runId?true:false ) await browser.close();
}
main();

