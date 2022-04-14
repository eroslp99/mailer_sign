const puppeteer = require('puppeteer');
const request = require('request');
async function main() {
// 打开浏览器
let browser = await puppeteer.launch({
  headless: false, // 有界面模式
  devtools: true, // 自动打开devtool
  defaultViewport: {
      width: 1500,
      height: 800
  }
})
// 打开新页面
const page = await browser.newPage();
// 模拟一下ua，不然默认会带Chrome Headless
page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36")
// 打开拦截请求
await page.setRequestInterception(true);
// 请求拦截器
// 这里的作用是在所有js执行前都插入我们的js代码抹掉puppeteer的特征
page.on("request", async (req, res2) => {
    // 非js脚本返回
    // 如果html中有inline的script检测html中也要改，一般没有
    if (req.resourceType() !== "script") {
        req.continue()
        return
    }
    // 获取url
    const url = req.url()
    await new Promise((resolve, reject) => {
        // 使用request/axios等请求库获取js文件
        request.get(url, (err, _res) => {
           // 删掉navigator.webdriver
           // 这里不排除有其它特征检测，每个网站需要定制化修改
            let newRes = "navigator.webdriver && delete Navigator.prototype.webdriver;" + _res.body
            // 返回删掉了webdriver的js
            req.respond({
                body: newRes
            })
            resolve()
        })
    })

})
// 进入页面url
await page.goto("https://fanqiangdang.com/forum.php");
await page.waitFor(5000);
}
main();
