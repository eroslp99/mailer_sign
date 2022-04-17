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
const ckfile = './vpnse.json'
let setup = {};
if (!runId) {
    setup  = JSON.parse(fs.readFileSync('./setup.json', 'utf8'));
  }else{
    setup  = JSON.parse(process.env.SETUP);
  }
let pwd = setup.pwd['vpnse'];

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
    await page.goto('https://vpnse.org/',{timeout: 10000})
    .catch(error => console.log('首页超时'));
    console.log("等待首页");
    await page.waitForFunction(
        (selecter) => {
            if (document.querySelector(selecter)){
                return document.querySelector(selecter).innerText.includes("VPNSE");
            }else{
                return false;
            }
        },
        { timeout: 6000 },
        'body'
    )
        .then(async () => { console.log("进入首页"); await sleep(1000); })
        .catch(async () => { 
            console.log(await page.$eval('body', el => el.innerText));
            //await page.$eval('body', el => el.innerText);
            await sleep(1000); 
        });

    //console.log("是否已登录");   
    await page.waitForFunction(
        (selecter) => document.querySelector(selecter).innerText.includes("aiboboxx"),
        { timeout: 3000 },
        '#header-secondary > ul > li.item-session > div > button > span.Button-label > span'
    )
        .then(async () => {
            console.log("已登录");
            await sleep(1000);
        })
        .catch(async (error) => {
            console.log('未登录 ');
            //console.log(await page.$eval('body', el => el.innerText));
            selecter = '#header-secondary > ul > li.item-logIn > button > span';
            await page.waitForSelector(selecter, { timeout: 10000 })
            await page.click(selecter)
            await sleep(1000)
            selecter = "#modal > div > div > div > form > div.Modal-body > div.Form.Form--centered > div:nth-child(1) > input"
            await page.waitForSelector(selecter, { timeout: 10000,visible: true })
            await page.type(selecter,'aiboboxx').then(() => console.log('用户名：aiboboxx'))
            selecter = "#modal > div > div > div > form > div.Modal-body > div.Form.Form--centered > div:nth-child(2) > input"
            await page.type(selecter,pwd).then(() => console.log('密码'))
            await page.click("#modal > div > div > div > form > div.Modal-body > div.Form.Form--centered > div:nth-child(3) > div > label > input[type=checkbox]")
            await sleep(500)
            await page.click("#modal > div > div > div > form > div.Modal-body > div.Form.Form--centered > div:nth-child(4) > button")
            //await page.evaluate(pwd => document.querySelector('#ls_password').value = pwd,pwd).then(()=>console.log('密码'));
            //await page.evaluate(() => document.querySelector("#ls_cookietime").click()).then(() => console.log('自动登录'));
            await sleep(2000)
            await page.waitForFunction(
                (selecter) => document.querySelector(selecter).innerText.includes("aiboboxx"),
                { timeout: 3000 },
                '#header-secondary > ul > li.item-session > div > button > span.Button-label > span'
            )
            .then(() => console.log('登录成功'))
            .catch(async (err) => {
                console.log("登录失败: " + err);
            });    
        });
    console.log("发帖");    
    await sleep(500);
    await page.goto('https://vpnse.org/t/freenode',{ timeout: 10000 }).catch((err)=>console.log('页面超时'));
    //发布主题
    selecter = '#content > div > div > div > nav > ul > li.item-newDiscussion.App-primaryControl > button > span';
    await page.waitForSelector(selecter,{ timeout: 10000 });
    await page.click(selecter);
    await sleep(1000);
    //标题
    selecter = '#composer > div > div.Composer-content > div > div.ComposerBody-content > ul > li.item-discussionTitle > h3 > input';
    await page.waitForSelector(selecter,{ timeout: 10000,visible: true })
    await page.click(selecter)
    await sleep(500)
    await page.type(selecter,
        `  高速稳定 秒开4k Vmess/V2ray节点,长期可用  ${(new Date()).format("yyyy-MM-dd hh:mm:ss")}更新`
    );
    let content = `网速：10+Mbps网速，720-1080P支持；
    延迟：50ms+延迟，UDP加速器支持，KCP支持；
    节点：香港、新加坡、日本、韩国等100+数量全球节点，高速稳定 秒开4k 支持网飞
    ${(new Date()).format("yyyy-MM-dd")}更新
    节点公开后容易失效，
    到这里 [免费公益v2ray节点订阅](https://www.v2rayfree.eu.org/post/free-v2ray/)
    获取私人专属v2ray订阅地址，长期可用。资源有限，先到先得。
    [reply]vmess://eyJ2IjoiMiIsImhvc3QiOiJzMzYxLnNub2Rlcy54eXoiLCJwYXRoIjoiXC9wYW5lbCIsInRscyI6InRscyIsInBzIiA6Iue/u+WimeWFmmZhbnFpYW5nZGFuZy5jb20iLCIiIDoi576O5Zu9IzM2MXwwLjd8MXwxMSV8NDU0R3xva21lLnh5enzlhaznm4roioLngrkiLCJhZGQiOiJzMzYxLnNub2Rlcy54eXoiLCJwb3J0IjoiNDQzIiwiaWQiOiJkOGEzOTNlMi1lMjdlLTM0MjItOWY2NS0zZGNkYWI1MmY2YWMiLCJhaWQiOiIxIiwibmV0Ijoid3MiLCJ0eXBlIjoibm9uZSJ9
    vmess://eyJ2IjoiMiIsImhvc3QiOiJzMjEzLnNub2Rlcy54eXoiLCJwYXRoIjoiXC9wYW5lbCIsInRscyI6IiIsInBzIiA6Iue/u+WimeWFmmZhbnFpYW5nZGFuZy5jb20iLCIiIDoi6aaZ5rivIOe9kemjniMyMTN8MS42fDF8OCV8ODA2R3xva21lLnh5enzlhaznm4roioLngrl8ODBub1RscyIsImFkZCI6InMyMTMuc25vZGVzLnh5eiIsInBvcnQiOjgwLCJpZCI6ImQ4YTM5M2UyLWUyN2UtMzQyMi05ZjY1LTNkY2RhYjUyZjZhYyIsImFpZCI6IjEiLCJuZXQiOiJ3cyIsInR5cGUiOiJub25lIn0=[/reply]
    `;
    //内容
    selecter = '#composer > div > div.Composer-content > div > div.ComposerBody-content > div > div > div > div > div.ComposerBody-emojiWrapper > textarea';
    await page.focus(selecter) 
    await sleep(1000)
    await page.type(selecter,content)
    //await page.evaluate((selecter,content) => document.querySelector(selecter).innerText = content,selecter,content)
    await sleep(1000)
    selecter = "#composer > div > div.Composer-content > div > div.ComposerBody-content > div > div > ul > li.item-submit.App-primaryControl > button > span"
    await page.waitForSelector(selecter,{ timeout: 10000 })
    await page.click(selecter)
    await sleep(3000)
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
    console.log(`*****************开始发帖 ${Date()}*******************\n`);
    await autoPost(page).then(() => {
        console.log('发帖成功');
    }).catch(error => console.log('执行失败：', error.message));
    //sqlite.close();
    if (runId ? true : false) await browser.close();
}
main();
