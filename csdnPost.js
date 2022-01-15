const fs = require("fs")
const crypto = require('crypto');
//const sqlite = require('./asqlite3.js')
//const puppeteer = require('puppeteer')
const core = require('@actions/core')
const github = require('@actions/github')
 const puppeteer = require('puppeteer-extra');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin()); 
const { tFormat, sleep, clearBrowser, getRndInteger, randomOne, randomString, md5, waitForString, findFrames  } = require('./common.js')
const { changeContent, cutStrin, filterContent } = require('./utils.js')
Date.prototype.format = tFormat
const mysql = require('mysql2/promise')
const runId = github.context.runId
let browser
let setup = {}
if (!runId) {
    setup = JSON.parse(fs.readFileSync('./setup.json', 'utf8'))
} else {
    setup = JSON.parse(process.env.SETUP)
}
const pool = mysql.createPool({
    host: setup.mysql.host,
    user: setup.mysql.user,
    password: setup.mysql.password,
    port: setup.mysql.port,
    database: setup.mysql.database,
    waitForConnections: true, //连接超额是否等待
    connectionLimit: 10, //一次创建的最大连接数
    queueLimit: 0 //可以等待的连接的个数
});

async function postArticles(row, page) {
    await page.goto('https://mp.csdn.net/mp_blog/creation/editor', { timeout: 60000 })
    await sleep(3000)
    await page.waitForSelector('#txtTitle', { timeout: 15000 })
    await page.evaluate((selecter, text) => document.querySelector(selecter).value = text, '#txtTitle', row.title)
    await sleep(200)
    //await findFrames(page)
    const frame = ( await page.mainFrame().childFrames() )[0];//通过索引得到我的iframe
    let content = row.content
    //await page.type('#title',row.title)
    //await page.$eval('#title', el => el.value = row.title) //出错，不能使用node环境中的变量 
    //await page.$eval('#content', el => el.value = row.content+'<p>[rihide]</p>'+row.vip+'<p>[/rihide]</p>')
    await frame.evaluate((selecter, text) => document.querySelector(selecter).innerHTML = text, 'body > p', content)
    //await page.type('#content',row.content+'<p>[rihide]</p>'+row.vip+'<p>[/rihide]</p>')
    await sleep(200)
/*     await page.evaluate((selecter) => document.querySelector(selecter).checked = true, '#in-category-4')
    await sleep(200)
    await page.type('#new-tag-post_tag', row.label)
    await sleep(100)
    await page.evaluate((selecter) => document.querySelector(selecter).checked = true, '#_cao_post_options > div.inside > div > div > div.csf-content > div > div > div:nth-child(5) > div.csf-fieldset > label > input.csf--checkbox')
    await sleep(2000) */
    //return Promise.reject(new Error('临时退出'))
    //await page.click('#publish')
    return Promise.reject(new Error('临时退出'))
    await page.evaluate((selecter) => document.querySelector(selecter).click(), '#publish')
    console.log('click:#publish')
    await waitForString(page, '#message > p', '查看文章', 30000)
        .catch(async (error) => {
            console.log('再次点击')
            await page.click('#publish')
            await waitForString(page, '#message > p', '文章已更新', 30000)
        })
    await sleep(100)
    await page.waitForSelector('#sample-permalink', { visible: true, timeout: 15000 })
    if (!row.url_kxnn) row.url_kxnn = await page.$eval('#sample-permalink', el => el.href)
    //return Promise.reject(new Error('临时退出'))
    return row
}
async function main() {
    browser = await puppeteer.launch({
        //headless: true,
        headless: runId ? true : false,
        //slowMo: 150,
        args: [
            '--window-size=1920,1080',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            //setup.proxy.normal  
        ],
        defaultViewport: null,
        ignoreHTTPSErrors: true,
        dumpio: false
    })
    //console.log(await sqlite.open('./freeok.db'))
    const page = await browser.newPage()
    //await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36')
    //await page.authenticate({username:setup.proxy.usr, password:setup.proxy.pwd});
    page.on('dialog', async dialog => {
        //console.info(`➞ ${dialog.message()}`);
        await dialog.dismiss();
    })
    let cookies = []
    cookies = JSON.parse(fs.readFileSync('./csdn.json', 'utf8'))
    await page.setCookie(...cookies)
    console.log("写入cookies")
    await page.goto('https://mp.csdn.net/', { timeout: 60000 })
    //await page.click('body > header > div > ul.nav-right > li.nav-login.no > a.signin-loader > span')
/*     await page.waitForSelector('body > div.passport-container > div > div.passport-main > div.login-box > div.login-box-top > div.login-box-tabs > div.login-box-tabs-items > span:nth-child(4)', { timeout: 15000 })
    await sleep(200)
    page.click('body > div.passport-container > div > div.passport-main > div.login-box > div.login-box-top > div.login-box-tabs > div.login-box-tabs-items > span:nth-child(4)')
    await sleep(200)
    await page.type('body > div.passport-container > div > div.passport-main > div.login-box > div.login-box-top > div > div.login-box-tabs-main > div > div:nth-child(1) > div > input', setup.usr.csdn)
    await page.type('body > div.passport-container > div > div.passport-main > div.login-box > div.login-box-top > div > div.login-box-tabs-main > div > div:nth-child(2) > div > input', setup.pwd.csdn)
    //await page.evaluate((selecter,text) => document.querySelector(selecter).value=text,'#user_login',setup.usr.kxnn)
    //await page.evaluate((selecter,text) => document.querySelector(selecter).value=text,'#user_pass',setup.pwd.kxnn)
    await sleep(200)
    //return Promise.reject(new Error('临时退出'))
    await Promise.all([
        page.waitForNavigation({ timeout: 60000 }),
        //等待页面跳转完成，一般点击某个按钮需要跳转时，都需要等待 page.waitForNavigation() 执行完毕才表示跳转成功
        page.click('body > div.passport-container > div > div.passport-main > div.login-box > div.login-box-top > div > div.login-box-tabs-main > div > div:nth-child(4) > button'),
    ])
        .then(() => console.log('登录成功'))
    await sleep(300) */
    //return
    cookies = await page.cookies();
    fs.writeFileSync('./csdn.json', JSON.stringify(cookies, null, '\t'))
    //return Promise.reject(new Error('调试退出'))
    console.log(`*****************开始postArticles ${Date()}*******************\n`)
    //let sql = "SELECT * FROM freeok WHERE level IS NULL  and (level_end_time < datetime('now') or level_end_time IS NULL);"
    let sql = "SELECT * FROM articles WHERE csdn = 0 and posted = 1  order by  date asc limit 1;"
    //let sql = "SELECT * FROM articles WHERE posted = 1 limit 1;"
    let r = await pool.query(sql)
    let i = 0
    console.log(`共有${r[0].length}个文章要发布`)
    for (let row of r[0]) {
        i++
        console.log(i, row.url)
        if (i % 3 == 0) await sleep(500).then(() => console.log('暂停3秒！'))
        if (row.url) await postArticles(row, page)
            .then(async row => {
                let sql, arr
                sql = 'UPDATE articles SET  csdn=1 WHERE id=?'
                arr = [row.id]
                sql = await pool.format(sql, arr)
                //console.log(row);
                await pool.query(sql)
                    .then((result) => { console.log('changedRows', result[0].changedRows); sleep(3000); })
                    .catch((error) => { console.log('UPDATEerror: ', error.message); sleep(3000); })
            })
            .catch(error => console.log('error: ', error.message))
    }
    await pool.end()
    if (runId ? true : false) await browser.close()
    //await browser.close()
}
main();