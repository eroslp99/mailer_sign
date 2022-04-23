const fs = require("fs")
const puppeteer = require('puppeteer')
const core = require('@actions/core')
const github = require('@actions/github')
const { tFormat, sleep, clearBrowser, getRndInteger, randomOne, randomString, findFrames, findFrame } = require('./common.js')
//const { sbFreeok,login,loginWithCookies,resetPwd } = require('./utils.js');
const runId = github.context.runId
async function main() {
    //console.log(await sqlite.open('./freeok.db'))
    const browser = await puppeteer.launch({
        headless: runId ? true : false,
        args: ['--window-size=1920,1080'],
        defaultViewport: null,
        ignoreHTTPSErrors: true,
    })
    const page = await browser.newPage();
    await page.goto('https://www.v2rayfree.eu.org/', { timeout: 8000 })
        .catch(async (error) => { console.log('error: ', error.message) })
    //await sleep(2000)
    const injectedScript = `
    //新建一个div元素节点
    let div=document.createElement("div")
    div.innerHTML = "<a href='https://www.google.com' id='fakeLink' target='_blank'>link</a>"
    //插入到最前面
    document.body.insertBefore(div, document.body.firstElementChild)
`
    //await page.addScriptTag({ content: injectedScript });
    await page.evaluate(() => {
        let div = document.createElement("div")
        div.innerHTML = "<a href='https://www.google.com' id='fakeLink' target='_blank'>link</a>"
        //插入到最前面
        document.body.insertBefore(div, document.body.firstElementChild)
    })
    const urls = [
        'https://twodh.vip/',
        'https://www.888slw.com/',
    ]
    for (let target of urls){
        await clickLink(page,target)
        await sleep(1000)
    }
    if (runId ? true : false) await browser.close()
    async function clickLink(page,target){
        await page.evaluate((target) => {
            document.querySelector('#fakeLink').href = target
        },target)
        const link = await page.$('#fakeLink')
        const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())))    // 声明变量
        await link.click();                             // 点击跳转
        const newPage = await newPagePromise
        await sleep(5000)
        let value = newPage.url();//获取新页面的链接
        console.log("点击链接：",value)
        await newPage.close();//关掉新页面
    }
}
main()


