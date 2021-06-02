const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless:false});
  const page = await browser.newPage();
  await page.goto('https://mail.163.com/');
  await page.setViewport({width:1000,height:800});
  //切换iframe框代码
  await page.waitFor('#loginDiv>iframe');//等待我的iframe出现
  const frame = ( await page.frames() )[3];//通过索引得到我的iframe
  await frame.waitFor('.j-inputtext.dlemail');//等待用户名输入框出现
  await frame.type('.j-inputtext.dlemail','aiboboxx');//输入账户
  await frame.waitFor('.dlpwd');//等待密码框出现
  await frame.type('.dlpwd','780830wy');//输入密码
  await frame.click('#un-login');
  await frame.click('#dologin');
  await frame.waitForNavigation();
  //等待3秒后退出浏览器
  await page.waitFor(3000);
  await browser.close();
})();