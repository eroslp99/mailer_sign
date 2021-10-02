const fs = require("fs")
const core = require('@actions/core');
const github = require('@actions/github');
const url = require('url');
const puppeteer = require('puppeteer-extra')
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const { tFormat, sleep, clearBrowser, getRndInteger, randomOne, randomString } = require('./common.js');
const { sbFreeok,login,loginWithCookies,resetPwd } = require('./utils.js');
Date.prototype.format = tFormat;
const runId = github.context.runId;
let browser;
let setup = {};
if (!runId) {
    setup  = JSON.parse(fs.readFileSync('./setup.json', 'utf8'));
  }else{
    setup  = JSON.parse(process.env.SETUP);
  }
let pwd = setup.pwd['fqd'];
//console.log("pwd:",pwd,process.env.PWD_FQD);
async function autoPost(page) {
    let selecter = '';
    await page.goto('https://fanqiangdang.com/forum.php',{timeout: 60000})
    .catch(error => console.log('首页超时'));
    console.log("翻墙论坛");
    await page.waitForFunction(
        (selecter) => {
            if (document.querySelector(selecter)){
                console.log("body",document.querySelector('body').innerText);
                return document.querySelector(selecter).innerText.includes("翻墙论坛");
            }else{
                return false;
            }
        },
        { timeout: 60000 },
        'body'
    )      .then(async () => { console.log("无需验证"); await sleep(1000); });
/*         .catch(async (error) => {
            console.log('需要验证 ');
            await page.goto('https://accounts.hcaptcha.com/verify_email/6234aa23-5ee5-4f5e-b1d9-1187660ea55c');
            selecter = "#root > div > div.sc-fKgJPI.cxbltl > div > div.sc-ikXwFM.sc-uxdHp.hZHGfK.fiDOnB > button";
            await page.waitForSelector(selecter, { timeout: 20000 })
                .catch(async () => {
                    console.log('设置cookie按钮不存在');
                    return Promise.reject(new Error('设置cookie按钮不存在'));
                });
            await sleep(3000);
            await page.click(selecter);
            await page.waitForFunction(
                (selecter) => document.querySelector(selecter).innerText.includes("Cookie集"),
                { timeout: 20000 },
                '#root > div > div.sc-fKgJPI.cxbltl > div > div.sc-ikXwFM.sc-uxdHp.hZHGfK.fiDOnB > span'
            ).then(async () => { console.log("设置Cookie集成功"); await sleep(1000); })
                .catch(async (error) => {
                    console.log('重新获取cookie集');
                    await page.goto('https://accounts.hcaptcha.com/verify_email/56b6e35c-a87d-474e-8087-49e5c596be27');
                    selecter = "#root > div > div.sc-fKgJPI.cxbltl > div > div.sc-ikXwFM.sc-uxdHp.hZHGfK.fiDOnB > button";
                    await page.waitForSelector(selecter, { timeout: 20000 })
                        .catch(async () => {
                            console.log('设置cookie按钮不存在');
                            return  Promise.reject(new Error('设置cookie按钮不存在'));
                        });
                    await sleep(3000);
                    await page.click(selecter);
                    await page.waitForFunction(
                        (selecter) => document.querySelector(selecter).innerText.includes("Cookie集"),
                        { timeout: 20000 },
                        '#root > div > div.sc-fKgJPI.cxbltl > div > div.sc-ikXwFM.sc-uxdHp.hZHGfK.fiDOnB > span'
                    )
                        .catch(async () => {
                            console.log('获取cookie集失败');
                            return Promise.resolve('获取cookie集失败');
                        });
                });
            await sleep(1000);
            await page.goto('https://fanqiangdang.com/forum.php');
            await sleep(10000);
            const frames = await page.mainFrame().childFrames();
            let i = 0;
            for (let frame of frames) {
                i++;
                console.log(frame.url());
                if (frame.url().includes('hcaptcha-checkbox.html')) {
                    await frame.waitForSelector('#checkbox', { timeout: 60000 }).catch(error => console.log('#checkbox: ', error.message));
                    await frame.click('#checkbox');
                    await page.waitForFunction(
                        (selecter) => document.querySelector(selecter).innerText.includes("翻墙论坛"),
                        { timeout: 30000 },
                        'body'
                    )
                        .then(async () => {
                            console.log("进入首页");
                            await sleep(1000);
                        })
                        .catch(async () => {
                            console.log('未过验证');
                            return Promise.reject(new Error('未过验证'));
                        });
                    break;
                }
            }
        }); */
    //await sleep(6000);    
    console.log("登录");
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
            selecter = '#ls_username';
            await page.waitForSelector(selecter, { timeout: 30000 })
                .catch(async () => {
                    console.log('等待输入用户名');
                    await sleep(3000);
                    await page.waitForSelector(selecter, { timeout: 10000 });
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
        ` 私人专属 v2ray 免费点阅地址  ${(new Date()).format("yyyy-MM-dd")}更新`
    );
    let content = `
    网速：10+Mbps网速，720-1080P支持；
    延迟：50ms+延迟，UDP加速器支持，KCP支持；
    节点：香港、新加坡、日本、韩国等100+数量全球节点，高速稳定 秒开4k 支持网飞
    ${(new Date()).format("yyyy-MM-dd")}更新
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
    await page.waitForNavigation();
}

async function main() {
    //await v2raya();
    browser = await puppeteer.launch({
        headless: runId ? true : false,
        //slowMo: 150,
        args: [
            '--window-size=1920,1080',
            setup.proxy
        ],
        defaultViewport: null,
        ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
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
    //sqlite.close();
    if (runId ? true : false) await browser.close();
}
main();
