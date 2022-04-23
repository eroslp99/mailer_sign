const fs = require("fs");
const core = require('@actions/core');
const github = require('@actions/github');
const url = require('url');
const puppeteer = require('puppeteer-extra');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const { tFormat, sleep, clearBrowser, getRndInteger, randomOne, randomString } = require('./common.js');
const { sbFreeok,login,loginWithCookies,resetPwd } = require('./utils.js');
Date.prototype.format = tFormat;
const runId = github.context.runId;
const ckfile = './fqd.json'
let setup = {};
if (!runId) {
    setup  = JSON.parse(fs.readFileSync('./setup.json', 'utf8'));
  }else{
    setup  = JSON.parse(process.env.SETUP);
  }
let pwd = setup.pwd['fqd'];

//console.log("pwd:",pwd,process.env.PWD_FQD);
async function autoPost(page) {
    let cookies = {};
    cookies = JSON.parse(fs.readFileSync(ckfile, 'utf8'));
/*     let ct = new Date()
    ct.setMonth(ct.getDate() + 3)
    for (let cookie of cookies) {
        cookie.expires =  ct.getTime()/1000
        //console.log (cookie.name,cookie.expires)
    }  */
    await page.setCookie(...cookies);
    console.log("写入cookies");
    let selecter = '';
    await page.goto('https://fanqiangdang.com/forum.php',{timeout: 20000})
    .catch(error => console.log('首页超时'));
    console.log("等待首页");
    await page.waitForFunction(
        (selecter) => {
            if (document.querySelector(selecter)){
                return document.querySelector(selecter).innerText.includes("翻墙论坛");
            }else{
                return false;
            }
        },
        { timeout: 20000 },
        'body'
    )
        .then(async () => { console.log("无5秒盾"); await sleep(1000); })
        .catch(async () => { 
            console.log(await page.$eval('body', el => el.innerText));
            //await page.$eval('body', el => el.innerText);
            await sleep(1000); 
        });

    console.log("是否已登录");   
    await page.waitForFunction(
        (selecter) => document.querySelector(selecter).innerText.includes("eroslp"),
        { timeout: 3000 },
        '#um > p:nth-child(2) > strong > a'
    )
        .then(async () => {
            console.log("已登录");
            await sleep(1000);
        })
        .catch(async (error) => {
            console.log('未登录 ');
            console.log(await page.$eval('body', el => el.innerText));
            selecter = '#ls_username';
            await page.waitForSelector(selecter, { timeout: 30000 })
                .catch(async () => {
                    console.log('等待输入用户名');
                    await sleep(3000);
                    await page.waitForSelector(selecter, { timeout: 30000 })
                    .catch(async ()=>{console.log(await page.$eval('body', el => el.innerText));});
                });
            await page.evaluate(() => document.querySelector('#ls_username').value = 'eroslp').then(() => console.log('用户名：eroslp'));
            await page.evaluate(pwd => document.querySelector('#ls_password').value = pwd,pwd).then(()=>console.log('密码'));
            await page.evaluate(() => document.querySelector("#ls_cookietime").click()).then(() => console.log('自动登录'));
            await sleep(3000);  
            selecter = '.pn.vm';
            await Promise.all([
                page.waitForNavigation({ timeout: 20000 }),
                page.click(selecter)
            ])
                .then(() => console.log('登录成功'))
                .catch(async (err) => {
                    console.log("登录失败: " + err);
                    await Promise.all([
                        page.waitForNavigation({ timeout: 30000 }),
                        page.evaluate(() => document.querySelector('#lsform > div > div > table > tbody > tr:nth-child(2) > td.fastlg_l > button').click())
                    ])
                        .then(() => console.log('又登录成功'),
                            err => {
                                console.log("又登录失败: " + err);
                                return Promise.reject(new Error('登录失败，返回'));
                            });
                });
        });
        console.log("发帖");    
    await sleep(500);
    await page.goto('https://fanqiangdang.com/forum.php?mod=post&action=newthread&fid=51').catch((err)=>console.log('页面超时'));
    await sleep(2000);
    selecter = '#typeid_ctrl';
    await page.waitForSelector(selecter);
    await page.click(selecter);
    await sleep(2000);
    selecter = '#typeid_ctrl_menu > ul > li:nth-child(3)';
    await page.waitForSelector(selecter);
    await page.evaluate(() => document.querySelector('#typeid_ctrl_menu > ul > li:nth-child(3)').click());
    await sleep(2000);
    selecter = '#subject';
    await page.waitForSelector(selecter);
    await page.type(selecter,
        ` 免费公益v2ray机场节点订阅 每日更新   ${(new Date()).format("yyyy-MM-dd")}`
    );
    let content = `
    免费公益v2ray机场 节点订阅 每日更新 更新时间 ${(new Date()).format("yyyy-MM-dd")}
    所有免费节点都爬取自网络，请勿用于非法用途
    节点来自： https://github.com/aiboboxx/v2rayfree
    [hide]
    订阅地址： https://github.com/aiboboxx/v2rayfree
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
    await page.waitForNavigation();
    cookies = await page.cookies();
    fs.writeFileSync(ckfile, JSON.stringify(cookies, null, '\t'))
}

async function main() {
    const browser = await puppeteer.launch({
        headless: runId ? true : false,
        //headless: true,
        args: [
            '--window-size=1920,1080',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            setup.proxy.changeip,
            //setup.proxy.normal
        ],
        defaultViewport: null,
        ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
    await page.authenticate({username:setup.proxy.usr, password:setup.proxy.pwd});
    page.on('dialog', async dialog => {
        //console.info(`➞ ${dialog.message()}`);
        await dialog.dismiss();
    });
    await page.setRequestInterception(true);
    //监听每一次请求，形参为请求对象
    page.on('request',(interceptedRequest)=>{
        //ite.url()获取请求url地址
        //let url = interceptedRequest.url();
        let urlObj=url.parse(interceptedRequest.url());
        //如果是谷歌的广告
        if(urlObj.hostname=='googleads.g.doubleclick.net' || urlObj.hostname.indexOf('google')!=-1){
            //拦截请求
            interceptedRequest.abort();
        }else{
            interceptedRequest.continue();
        }
    })
    console.log(`*****************开始fqd发帖 ${Date()}*******************\n`);
    await autoPost(page).then(() => {
        console.log('fqd发帖成功');
    }).catch(error => console.log('执行失败：', error.message));
    //if (runId ? true : false) await browser.close();
    await browser.close();
}
main();
