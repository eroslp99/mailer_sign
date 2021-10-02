// 对Date的扩展，将 Date 转化为指定格式的String  
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，   
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)   
// 例子：   
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423   
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18   
const tFormat = function(fmt){  
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
}
exports.tFormat = tFormat ;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
exports.sleep = sleep ;

async function clearBrowser (page) {
		// clear cookies
		const client = await page.target().createCDPSession()		
		await await client.send('Network.clearBrowserCookies')
}
exports.clearBrowser = clearBrowser ;

    //find frame index
async function findFrames (page) {
	const frames = await page.mainFrame().childFrames();   
    let i = 0;
    for (let frame of frames){
        i++;
		console.log(i,frame.url(),frame.setContent(i));
	}
	
}
exports.findFrames = findFrames ;

exports.getRndInteger = function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
 * 随机获取数组中的一个元素
 * @param arr 数组
 * @returns {*}  数组中的任意一个元素
 */

exports.randomOne = function randomOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
exports.randomString =  function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  }
exports.sbFreeok =  async function sbFreeok(page) {
    const injectedScript = `
      const getCanvasValue = (selector) => {
          let canvas = document.querySelector(selector)
          let ctx = canvas.getContext('2d')
          let [width, height] = [canvas.width, canvas.height]
          let rets = [...Array(height)].map(_ => [...Array(width)].map(_ => 0))
          for (let i = 0; i < height; ++i) { 
              for (let j = 0; j < width; ++j) { 
                  rets[i][j] = Object.values(ctx.getImageData(j,i,1,1).data)
              }
          }        
          return rets
      }
  `
    await page.addScriptTag({ content: injectedScript });
    async function _getDistance() {
      const THRESHOLD = 1
      const _equals = (a, b) => {
        if (a.length !== b.length) {
          return false
        }
        for (let i = 0; i < a.length; ++i) {
          let delta = Math.abs(a[i] - b[i])
          if (delta > THRESHOLD) {
            return false
          }
        }
        return true
      }
      const _differentSet = (a1, a2) => {
        //console.log("a1", a1)
        //console.log("a2", a2)
        let rets = []
        a1.forEach((el, y) => {
          el.forEach((el2, x) => {
            if (!_equals(el2, a2[y][x])) {
              rets.push({
                x,
                y,
                v: el2,
                v2: a2[y][x]
              })
            }
          })
        })
        return rets
      }
      const _getLeftest = (array) => {
        return array.sort((a, b) => {
          if (a.x < b.x) {
            return -1
          }
  
          else if (a.x == b.x) {
            if (a.y <= b.y) {
              return -1
            }
            return 1
          }
          return 1
        }).shift()
      }
      let selecter = 'body > div.geetest_fullpage_click.geetest_float.geetest_wind.geetest_slide3 > div.geetest_fullpage_click_wrap > div.geetest_fullpage_click_box > div > div.geetest_wrap > div.geetest_widget > div > a > div.geetest_canvas_img.geetest_absolute > div > canvas.geetest_canvas_bg.geetest_absolute';
      await page.waitForSelector(selecter);
      let rets1 = await page.evaluate((selecter) => getCanvasValue(selecter), selecter);
      //console.log("rets1",rets1);
      selecter = 'body > div.geetest_fullpage_click.geetest_float.geetest_wind.geetest_slide3 > div.geetest_fullpage_click_wrap > div.geetest_fullpage_click_box > div > div.geetest_wrap > div.geetest_widget > div > a > div.geetest_canvas_img.geetest_absolute > canvas';
      await page.waitForSelector(selecter);
      let rets2 = await page.evaluate((selecter) => getCanvasValue(selecter), selecter);
      //await page.evaluate(()=>dlbg(),);
      //console.log("rets2",rets2);
      let dest = _getLeftest(_differentSet(rets1, rets2));
      //console.log('dest',dest);
      return dest.x;
    }
    const distance = await _getDistance();
    const button = await page.waitForSelector("body > div.geetest_fullpage_click.geetest_float.geetest_wind.geetest_slide3 > div.geetest_fullpage_click_wrap > div.geetest_fullpage_click_box > div > div.geetest_wrap > div.geetest_slider.geetest_ready > div.geetest_slider_button");
    const box = await button.boundingBox();
    const axleX = Math.floor(box.x + box.width / 2);
    const axleY = Math.floor(box.y + box.height / 2);
    await btnSlider(distance);
    async function btnSlider(distance) {
      await page.mouse.move(axleX, axleY);
      await page.mouse.down();
      await sleep (getRndInteger(100, 200));
      await page.mouse.move(box.x + distance / 4 + getRndInteger(-8, 10), axleY + getRndInteger(-8, 10), { steps: +getRndInteger(60, 100) });
      //await sleep (getRndInteger(50, 200));
      await page.mouse.move(box.x + distance / 2 + getRndInteger(-8, 10), axleY + getRndInteger(-8, 10), { steps: getRndInteger(60, 100) });
      //await sleep (getRndInteger(50, 200));
      await page.mouse.move(box.x + (distance / 8) * 7 + getRndInteger(-8, 10), axleY + getRndInteger(-8, 10), { steps: getRndInteger(60, 80) });
      //await sleep (getRndInteger(50, 200));
      await page.mouse.move(box.x + distance  + getRndInteger(-8, 10), axleY + getRndInteger(-8, 10), { steps: getRndInteger(60, 100) });
      //await sleep (getRndInteger(50, 200));
      await page.mouse.move(box.x + distance + getRndInteger(10, 50), axleY + getRndInteger(-8, 10), { steps: getRndInteger(60, 100) });
      //await sleep (getRndInteger(50, 200));
      await page.mouse.move(box.x + distance + 30 + getRndInteger(-1, 3), axleY + getRndInteger(-8, 10), { steps: getRndInteger(60, 100) });
      await sleep (getRndInteger(50, 200));
      await page.mouse.up();
      await sleep (2000);
  
      let text = await page.evaluate(() => {
        return document.querySelector("#embed-captcha > div > div.geetest_btn > div.geetest_radar_btn > div.geetest_radar_tip").innerText;
      });
      let text2 = await page.evaluate(() => {
        return document.querySelector("#embed-captcha > div").innerText;
      });
      console.log(text, text2);
      let step = 0;
      if (text) {
        // 如果失败重新获取滑块
        if (
          text.includes("怪物吃了拼图") ||
          text.includes("拖动滑块将悬浮图像正确拼合") ||
          text.includes("网络不给力请点击重试")
        ) {
          await page.waitFor(1000);
          await page.click("#embed-captcha > div > div.geetest_btn > div.geetest_radar_btn > div.geetest_radar_tip");
          await sleep(2000);
          step = await _getDistance();
          await btnSlider(step);
        } else if (text.includes("请完成验证")) {
          step = await _getDistance();
          await btnSlider(step);
        }
      }
    }
  }