const fs = require("fs")
const puppeteer = require('puppeteer')
const core = require('@actions/core')
const github = require('@actions/github')
const { tFormat, sleep, clearBrowser, getRndInteger, randomOne, randomString, findFrames, findFrame } = require('./common.js')
//const { sbFreeok,login,loginWithCookies,resetPwd } = require('./utils.js');
const runId = github.context.runId
let setup = {};
if (!runId) {
    setup  = JSON.parse(fs.readFileSync('./setup.json', 'utf8'));
  }else{
    setup  = JSON.parse(process.env.SETUP);
  }
async function main() {
    //console.log(await sqlite.open('./freeok.db'))
    const browser = await puppeteer.launch({
        headless: runId ? true : false,
        args: [
            '--window-size=1920,1080',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            //setup.proxy.changeip,
            //setup.proxy.normal
        ],
        defaultViewport: null,
        ignoreHTTPSErrors: true,
    })
    const page = await browser.newPage();
    await page.goto('https://www.v2rayfree.eu.org/', { timeout: 18000 })
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
    const links = [
        'http://laolangdh.xyz',
        'http://dagongrendh.xyz?do=www.v2rayfree.eu.org'
    ]
    for (let link of links){
        await clickToNewpage(page,link)
            .catch(async (error) => { console.log('error: ', error.message) })
        await sleep(1000)
    }
    if (runId ? true : false) await browser.close()
    async function clickToNewpage(page,target){
        await page.evaluate((target) => {
            document.querySelector('#fakeLink').href = target
        },target)
        const link = await page.$('#fakeLink')
        const [popup] = await Promise.all([
            new Promise((resolve) => page.once('popup', async p => {
              await p.waitForNavigation({ waitUntil: 'networkidle0',timeout: 8000 })
                .catch(async (error) => { console.log('waitForNavigation error: ', error.message) })
              resolve(p);
            })),
            link.click(),
          ])
          console.log("点击链接：",target)
          await popup.waitForSelector("body",{timeout: 8000 })
          await popup.close()
    }
}
main()


