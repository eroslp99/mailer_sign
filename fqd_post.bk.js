const fs = require("fs")
const core = require('@actions/core');
const github = require('@actions/github');
const myfuns = require('./myfuns.js');
// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra')
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
Date.prototype.Format = myfuns.Format;
let browser;
let setup = {};
if (!runId) {
    setup  = JSON.parse(fs.readFileSync('./setup.json', 'utf8'));
  }else{
    setup  = JSON.parse(process.env.SETUP);
  }
let pwd = setup.pwd['fqd'];
async function  autoPost (page) {
    let selecter = '';
    let cookies = {};
    //let allck = JSON.parse(fs.readFileSync('./allck.json', 'utf8'));
    //cookies = JSON.parse(fs.readFileSync('./fanqiangdang.json', 'utf8'));
    //await page.setCookie(...cookies);
    await page.goto('https://fanqiangdang.com/forum.php');
    await page.waitForFunction(
        (selecter) => document.querySelector(selecter).innerText.includes("翻墙论坛"),
        {timeout:10000},
        'body'
      )
      .then(async ()=>{console.log("无需验证");await sleep(1000);})
      .catch(async (error)=>{
          console.log('需要验证: ', error.message);
          await page.goto('https://accounts.hcaptcha.com/verify_email/ebf36f8b-0722-4253-9d81-94193b9c91e7');
          selecter = "#root > div > div.sc-fKgJPI.cxbltl > div > div.sc-ikXwFM.sc-uxdHp.hZHGfK.fiDOnB > button";
          await page.waitForSelector(selecter,{timeout:20000})    
          .catch(async ()=>{
              console.log ('设置cookie按钮不存在');
              return Promise.reject(new Error('设置cookie按钮不存在'));
          });
/*           await page.click(selecter);
          await page.waitForFunction(
              (selecter) => document.querySelector(selecter).innerText.includes("Cookie集"),
              {timeout:10000},
              '#root > div > div.sc-fKgJPI.cxbltl > div > div.sc-ikXwFM.sc-uxdHp.hZHGfK.fiDOnB > span'
            ).then(async ()=>{console.log("设置Cookie集成功");await sleep(1000);}); */
/*           await page.goto('https://fanqiangdang.com/forum.php');
          await sleep(10000);
          await page.waitForSelector('#cf-hcaptcha-container > iframe',{timeout:10000})
          .catch(error => console.log('#cf-hcaptcha-container > iframe: ', error.message)); 
          const frames = await page.mainFrame().childFrames();   
          let i = 0;
          for (let frame of frames){
              i++;
              //console.log(frames.length,frame.url(),frame.setContent(i));//查看得到的frame列表数量
              console.log(frame.url());
              if (frame.url().includes('https://newassets.hcaptcha.com/captcha/v1/c4ed6d3/static/hcaptcha-checkbox.html')){
                  await frame.waitForSelector('#checkbox',{timeout:20000}).catch(error => console.log('#checkbox: ', error.message));
                  await frame.click('#checkbox');
                  await page.waitForFunction(
                    (selecter) => document.querySelector(selecter).innerText.includes("eroslp"),
                    {timeout:20000},
                    'body'
                  )
                  .then(async ()=>{
                      console.log("登录成功");
                      await sleep(1000);
                      cookies = await page.cookies();
                      //allck['aiboboxx@163.com'] = cookies;
                      //sqlite.close();
                      fs.writeFileSync('./fanqiangdang.json', JSON.stringify(cookies, null, '\t'))
                    })
                  .catch(error => console.log('登录失败: ', error.message));
                  break;
              }
          } */ 
        });
/*     selecter = '#ls_username';
    await page.waitForSelector(selecter,{timeout:30000})
    .catch(async ()=>{
        console.log ('等待输入用户名');
        await sleep(3000);
        //await page.goto('https://fanqiangdang.com/forum.php');
        await page.waitForSelector(selecter,{timeout:10000});
    });
    await page.evaluate(() => document.querySelector('#ls_username').value = 'eroslp').then(()=>console.log('用户名：eroslp'));
    //await page.type('#ls_password', '');
    await page.evaluate(() => document.querySelector('#ls_password').value = '').then(()=>console.log('密码'));
    selecter = '#lsform > div > div > table > tbody > tr:nth-child(2) > td.fastlg_l > button > em';
    await Promise.all([
      page.waitForNavigation({timeout:10000}), 
      //等待页面跳转完成，一般点击某个按钮需要跳转时，都需要等待 page.waitForNavigation() 执行完毕才表示跳转成功
      page.click(selecter)   
    ])
    .then(()=>console.log ('登录成功'))
    .catch(async (err) => {
        console.log ("登录失败: "+ err);
        await Promise.all([
            page.waitForNavigation({timeout:20000}), 
            //等待页面跳转完成，一般点击某个按钮需要跳转时，都需要等待 page.waitForNavigation() 执行完毕才表示跳转成功
            page.evaluate(() => document.querySelector('#lsform > div > div > table > tbody > tr:nth-child(2) > td.fastlg_l > button > em').click())    
          ])
          .then(()=>console.log ('又登录成功'),
                err=>{
                    console.log ("又登录失败: "+ err);
                    return Promise.reject(new Error('登录失败，返回'));
                });
        }); */
    await page.goto('https://fanqiangdang.com/forum.php?mod=post&action=newthread&fid=36');
    //await page.waitFor(1500);
    selecter = '#typeid_ctrl';
    await page.waitForSelector(selecter);
    await page.click(selecter);
    await sleep(500);
    selecter = '#typeid_ctrl_menu > ul > li:nth-child(3)';
    await page.click(selecter);
    await sleep(500);
    selecter = '#subject';
    await page.type(selecter,
        ` 高速稳定 秒开4k Vmess/V2ray节点,长期可用  ${(new Date()).Format("yyyy-MM-dd hh:mm:ss") }更新`
        );
    let content = `
    网速：10+Mbps网速，720-1080P支持；
    延迟：50ms+延迟，UDP加速器支持，KCP支持；
    节点：香港、新加坡、日本、韩国等100+数量全球节点，高速稳定 秒开4k 支持网飞
    ${(new Date()).Format("yyyy-MM-dd") }更新
    节点公开后容易失效，
    请到 https://www.aiboboxx.ml/post/free-v2ray/ 
    获取私人专属v2ray订阅地址，长期可用。资源有限，先到先得。
    [hide]vmess://eyJ2IjoiMiIsImhvc3QiOiJzMzYxLnNub2Rlcy54eXoiLCJwYXRoIjoiXC9wYW5lbCIsInRscyI6InRscyIsInBzIiA6Iue/u+WimeWFmmZhbnFpYW5nZGFuZy5jb20iLCIiIDoi576O5Zu9IzM2MXwwLjd8MXwxMSV8NDU0R3xva21lLnh5enzlhaznm4roioLngrkiLCJhZGQiOiJzMzYxLnNub2Rlcy54eXoiLCJwb3J0IjoiNDQzIiwiaWQiOiJkOGEzOTNlMi1lMjdlLTM0MjItOWY2NS0zZGNkYWI1MmY2YWMiLCJhaWQiOiIxIiwibmV0Ijoid3MiLCJ0eXBlIjoibm9uZSJ9
    vmess://eyJ2IjoiMiIsImhvc3QiOiJzMjEzLnNub2Rlcy54eXoiLCJwYXRoIjoiXC9wYW5lbCIsInRscyI6IiIsInBzIiA6Iue/u+WimeWFmmZhbnFpYW5nZGFuZy5jb20iLCIiIDoi6aaZ5rivIOe9kemjniMyMTN8MS42fDF8OCV8ODA2R3xva21lLnh5enzlhaznm4roioLngrl8ODBub1RscyIsImFkZCI6InMyMTMuc25vZGVzLnh5eiIsInBvcnQiOjgwLCJpZCI6ImQ4YTM5M2UyLWUyN2UtMzQyMi05ZjY1LTNkY2RhYjUyZjZhYyIsImFpZCI6IjEiLCJuZXQiOiJ3cyIsInR5cGUiOiJub25lIn0=
    [/hide]
`;
    let frame = (await page.mainFrame().childFrames())[2];   
    await frame.waitForSelector('body');
    await frame.type('body', content);
    selecter = '#postsubmit > span';
    await page.waitForSelector(selecter);
    //await page.waitFor(1000);
    await page.click(selecter);
    await  page.waitForNavigation();
}  
async function  main () {
    let runId = github.context.runId;
        //console.log(await sqlite.open('./freeok.db'))
    const browser = await puppeteer.launch({ 
        headless: runId?true:false ,
        //slowMo: 150,
        args: [
            '--window-size=1920,1080',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
        ],
        defaultViewport: null,
        //ignoreHTTPSErrors: true,
        ignoreDefaultArgs: ["--enable-automation"],
        userDataDir: './userdata'
    });
    const page = await browser.newPage();
    page.on('dialog', async dialog => {
        //console.info(`➞ ${dialog.message()}`);
        await dialog.dismiss();
    });
    console.log(`*****************开始fqd发帖 ${Date()}*******************\n`);  
    await autoPost(page).then(()=>{
          console.log ('fqd发帖成功');
    });
    //sqlite.close();
    if ( runId?true:false ) await browser.close();
}
main();
