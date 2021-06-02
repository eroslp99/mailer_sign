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
        //userDataDir: './userdata'
    });
    const page = await browser.newPage();
    // 当页面中的脚本使用“alert”、“prompt”、“confirm”或“beforeunload”时发出
    page.on('dialog', async dialog => {
        //console.info(`➞ ${dialog.message()}`);
        await dialog.dismiss();
    });

    let cookies = {};
    cookies = JSON.parse(fs.readFileSync('./aiboboxx@163.com.json', 'utf8'));
    await page.setCookie(...cookies);
    await page.goto('https://mail.163.com/',{ timeout: 60000 });
 /*   await page.waitForSelector('#loginDiv>iframe',{ timeout: 60000 });//等待我的iframe出现
    const frame = ( await page.frames() )[3];//通过索引得到我的iframe
    await frame.waitForSelector('.j-inputtext.dlemail',{ timeout: 60000 });//等待用户名输入框出现
    await frame.type('.j-inputtext.dlemail','aiboboxx');//输入账户
    await frame.waitForSelector('.dlpwd');//等待密码框出现
    await frame.type('.dlpwd',pwd);//输入密码
    await frame.click('#un-login');
    await frame.click('#dologin'); */
    //await frame.waitForNavigation();
    await myfuns.Sleep(1000);
    await page.waitForSelector("#_mail_icon_21_182");
    await myfuns.Sleep(1000);
    await page.evaluate('document.querySelector("#_mail_icon_21_182").click()');
    await page.waitForFunction(
        (selecter) => document.querySelector(selecter).innerText.includes("收取完成"),
        {timeout:60000},
        'body'
      ).then(async ()=>{
          console.log("收取完成!");
          await myfuns.Sleep(5000);
          cookies = await page.cookies();
          fs.writeFileSync('./aiboboxx@163.com.json', JSON.stringify(cookies, null, '\t'))});
    if ( runId?true:false ) await browser.close();
}
main();

