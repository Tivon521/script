/*
轩辕虎越,风生水起
功能：关注、加购、签到，助力，抽卡（运行一次，抽奖10次）
活动时间：2022年1月6日-2022年1月31日
1 0,21 6-31 1 * jd_xy.js
活动链接：https://lzdz1-isv.isvjcloud.com/dingzhi/tiger/gold/activity/6272050?activityId=dz2201100014002401&shareUuid=1778ca76b61d415b87582021ef5a785b&adsource=null&shareuserid4minipg=&shopid=1000140024
 */
const $ = new Env("轩辕虎越,风生水起");
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const notify = $.isNode() ? require('./sendNotify') : '';
let cookiesArr = [], cookie = '', message = '';
let ownCode = null;
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
} else {
  cookiesArr = [
    $.getdata("CookieJD"),
    $.getdata("CookieJD2"),
    ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  console.log('活动名称：轩辕虎越,风生水起\n' +
      '功能：关注、加购、签到，助力，抽卡（运行一次，抽奖一次）\n' +
      '活动时间：2022年1月6日-2022年1月31日\n' +
      '1 1,21 6-31 1 * jd_xy.js\n' +
      '活动链接：https://lzdz1-isv.isvjcloud.com/dingzhi/tiger/gold/activity/6272050?activityId=dz2201100014002401&shareUuid=1778ca76b61d415b87582021ef5a785b&adsource=null&shareuserid4minipg=&shopid=1000140024')
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i]
      originCookie = cookiesArr[i]
      newCookie = ''
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      await checkCookie();
      console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        continue
      }
      $.bean = 0;
      $.ADID = getUUID('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 1);
      $.UUID = getUUID('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      $.authorCode = ownCode ? ownCode : 'ec091f999d754124b2d43e8cd812a1d7'
      $.authorNum = `${random(1000000, 9999999)}`
      $.activityId = 'dz2201100014002401'
      $.activityShopId = '1000140024'
      $.activityUrl = `https://lzdz1-isv.isvjcloud.com/dingzhi/tiger/gold/activity/${$.authorNum}?activityId=${$.activityId}&shareUuid=${encodeURIComponent($.authorCode)}&adsource=null&shareuserid4minipg=null&shopid=${$.activityShopId}&lng=00.000000&lat=00.000000&sid=&un_area=`
      await main();
      await $.wait(2000);
      if ($.bean > 0) {
        message += `\n【京东账号${$.index}】${$.nickName || $.UserName} \n获得 ${$.bean} 京豆。`
      }
    }
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })


async function main() {
  try {
    $.token = null;
    $.secretPin = null;
    $.openCardActivityId = null
    await getFirstLZCK()
    await getToken();
    await task('dz/common/getSimpleActInfoVo', `activityId=${$.activityId}`, 1)
    if ($.token) {
      await getMyPing();
      if ($.secretPin) {
        console.log('去助力 ' + $.authorCode)
        await $.wait(1000);
        await task("taskact/common/drawContent", `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}`)
        await $.wait(1000);
        await task('common/accessLogWithAD', `venderId=${$.activityShopId}&code=99&pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}&pageUrl=${$.activityUrl}&subType=app&adSource=null`, 1);
        await $.wait(1000);
        await task('wxActionCommon/getUserInfo', `pin=${encodeURIComponent($.secretPin)}`, 1)
        await $.wait(1000);
        await task('tiger/gold/activityContent', `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&pinImg=${encodeURIComponent($.pinImg)}&nick=${encodeURIComponent($.pin)}&cjyxPin=&cjhyPin=&shareUuid=${encodeURIComponent($.authorCode)}`)
        await $.wait(1000);
        await task('tiger/gold/checkOpenCard', `activityId=${$.activityId}&actorUuid=${encodeURIComponent($.actorUuid)}&pin=${encodeURIComponent($.secretPin)}&shareUuid=${encodeURIComponent($.authorCode)}`)
        if ($.activityContent) {
          $.log("\n-> 关注店铺")
          if (!$.activityContent.followShopStatus) {
            await $.wait(1000);
            await task('tiger/gold//saveTask', `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&actorUuid=${encodeURIComponent($.actorUuid)}&taskType=23&taskValue=&shareUuid=${encodeURIComponent($.authorCode)}`)
          } else {
            $.log("    >>>已经关注过了\n")
          }
          $.log("\n-> 去做任务")
          await $.wait(1000);
          $.log("\n-> 去关注店铺")
          await task('tiger/gold/saveTask', `pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}&actorUuid=${encodeURIComponent($.actorUuid)}&&shareUuid=${encodeURIComponent($.authorCode)}&taskType=23&taskValue=`)
          await $.wait(1000);
          $.log("\n-> 去加购")
          await task('tiger/gold/saveTask', `pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}&actorUuid=${encodeURIComponent($.actorUuid)}&&shareUuid=${encodeURIComponent($.authorCode)}&taskType=21&taskValue=`)
          $.log("\n-> 去签到")
          await task('tiger/gold/saveTask', `pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}&actorUuid=${encodeURIComponent($.actorUuid)}&&shareUuid=${encodeURIComponent($.authorCode)}&taskType=0&taskValue=`)
          // console.log('去投票')
          // for (let i = 0; i < 10; i++) {
          //   await $.wait(2000)
          //   await task('tiger/gold/insxintiao', `pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}&playerId=37`)
          // }
          console.log('抽奖10次')
          for (let i = 0; i < Array(10).length; i++) {
            await task('tiger/gold/startDraw', `activityId=${$.activityId}&actorUuid=${encodeURIComponent($.actorUuid)}&pin=${encodeURIComponent($.secretPin)}`)
            await $.wait(2000)
          }
        } else {
          $.log("无法顺利的获取到活动信息。")
        }
      } else {
        $.log("没有成功获取到用户信息")
      }
    } else {
      $.log("没有成功获取到用户鉴权信息")
    }
  } catch (e) {
    $.logErr(e)
  }
}

function task(function_id, body, isCommon = 0) {
  return new Promise(resolve => {
    $.post(taskUrl(function_id, body, isCommon), async (err, resp, data) => {
      try {
        if (err) {
          $.log('请求失败：',function_id, err)
        } else {
          if (data) {
            data = $.toObj(data);
            if (data.result) {
              switch (function_id) {
                case 'crm/pageVisit/insertCrmPageVisit':
                  break;
                case 'interaction/write/writePersonInfo':
                  break;
                case 'dz/common/getSimpleActInfoVo':
                  $.jdActivityId = data.data.jdActivityId;
                  $.venderId = data.data.venderId;
                  break;
                case 'wxActionCommon/getUserInfo':
                  if (data.data.yunMidImageUrl) {
                    $.pinImg = data.data.yunMidImageUrl
                  } else {
                    $.pin = data.data.nickname
                    $.pinImg = 'https://img10.360buyimg.com/imgzone/jfs/t1/7020/27/13511/6142/5c5138d8E4df2e764/5a1216a3a5043c5d.png'
                  }
                  break;
                case 'tiger/gold/activityContent':
                  if (!data.data.hasEnd) {
                    $.log(`开启【${data.data.activityName}】活动`)
                    $.log("-------------------")
                    if ($.index === 1) {
                      ownCode = data.data.actorUuid
                      console.log('账号1邀请码：', ownCode)
                    }
                    $.activityContent = data.data;
                    $.actorUuid = data.data.actorUuid;
                    // console.log(data.data.actorUuid)
                  } else {
                    $.log("活动已经结束");
                  }
                  break;
                case 'openCard/mayOpenbox/openCardDraw':
                  if (data.data.sendFlage) {
                    $.log(`==>获得【${data.data.benas}】京豆\n`)
                  }
                  break;
                case 'personal/care/checkOpencard':
                  if (data.data.openCardBeanNum) {
                    $.log(`==>获得【${data.data.openCardBeanNum}】京豆\n`)
                    $.bean += data.data.openCardBeanNum
                  }
                  $.openCardStatus = data.data.openInfo;
                  console.log(data.data.assistState);
                  break;
                case 'personal/care/saveTask':
                  if (data.data) {
                    if (data.data.sendStatus) {
                      $.bean += data.data.sendBeans;
                      $.log(`==>获得【${data.data.sendBeans}】京豆\n`)
                    }
                    if (data.data.addScore) {
                      $.log(`==>获得【${data.data.addScore}】积分\n`)
                    }
                  }
                  break;
                case 'crm/pageVisit/insertCrmPageVisit':
                  console.log(data)
                  break;
                case 'interaction/write/writePersonInfo':
                  console.log(data)
                  break;
                case 'crm/pageVisit/insertCrmPageVisit':
                  $.log("==> 上报成功")

                case 'tiger/gold/saveTask':
                  if (data.data) {
                    $.log(`${data.result}`)
                  }
                  break;
                case 'tiger/gold/insxintiao':
                  console.log('投票insxintiao', data.data)
                  break;
                case 'tiger/gold/startDraw':
                  if (data.data.drawOk) {
                    switch (data.data.drawInfo.type) {
                      case 6:
                        $.bean += data.data.drawInfo.beanNum;
                        $.log(`==>获得【${data.data.drawInfo.beanNum}】京豆\n`)
                        break;
                      default:
                        if ($.isNode()) {
                          await notify.sendNotify($.name, `\n【京东账号${$.index}】${$.nickName || $.UserName} \n获得 ${data.data.drawInfo.name}\n活动链接：${$.activityUrl}`, '', '')
                        } else {
                          $.msg($.name, '',`【京东账号${$.index}】${$.nickName || $.UserName} \n获得 ${data.data.drawInfo.name}\n活动链接：${$.activityUrl}`)
                        }
                        break;
                    }
                  } else {
                    $.log("未中奖！")
                  }
                  break;
                default:
                  $.log(JSON.stringify(data))
                  break;
              }
            } else {
              $.log(JSON.stringify(data))
            }
          }
        }
      } catch (error) {
        $.log(error)
      } finally {
        resolve();
      }
    })
  })
}

function taskUrl(function_id, body, isCommon) {
  return {
    url: isCommon ? `https://lzdz1-isv.isvjd.com/${function_id}` : `https://lzdz1-isv.isvjd.com/dingzhi/${function_id}`,
    headers: {
      Host: 'lzdz1-isv.isvjd.com',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept-Language': 'zh-cn',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: 'https://lzdz1-isv.isvjd.com',
      'User-Agent': `jdapp;iPhone;9.5.4;13.6;${$.UUID};network/wifi;ADID/${$.ADID};model/iPhone10,3;addressid/0;appBuild/167668;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
      Connection: 'keep-alive',
      Referer: $.activityUrl,
      Cookie: cookie
    },
    body: body

  }
}

function getMyPing() {
  let opt = {
    url: `https://lzdz1-isv.isvjd.com/customer/getMyPing`,
    headers: {
      "Host": "lzdz1-isv.isvjd.com",
      "Accept": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "Accept-Language": "zh-cn",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Type": "application/x-www-form-urlencoded",
      "Origin": "https://lzdz1-isv.isvjd.com",
      "User-Agent": `jdapp;iPhone;9.5.4;13.6;${$.UUID};network/wifi;ADID/${$.ADID};model/iPhone10,3;addressid/0;appBuild/167668;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
      "Connection": "keep-alive",
      "Referer": $.activityUrl,
      "Cookie": cookie,
    },
    body: `userId=${$.activityShopId}&token=${$.token}&fromType=APP&riskType=1`,
  };
  return new Promise((resolve) => {
    $.post(opt, (err, resp, data) => {
      try {
        if (err) {
          $.log(err);
        } else {
          if (resp["headers"]["set-cookie"]) {
            cookie = `${originCookie}`;
            if ($.isNode()) {
              for (let sk of resp["headers"]["set-cookie"]) {
                cookie = `${cookie}${sk.split(";")[0]};`;
              }
            } else {
              for (let ck of resp["headers"]["Set-Cookie"].split(",")) {
                cookie = `${cookie}${ck.split(";")[0]};`;
              }
            }
          }
          if (resp["headers"]["Set-Cookie"]) {
            cookie = `${originCookie}`;
            if ($.isNode()) {
              for (let sk of resp["headers"]["set-cookie"]) {
                cookie = `${cookie}${sk.split(";")[0]};`;
              }
            } else {
              for (let ck of resp["headers"]["Set-Cookie"].split(",")) {
                cookie = `${cookie}${ck.split(";")[0]};`;
              }
            }
          }
          if (data) {
            data = JSON.parse(data);
            if (data.result) {
              $.log(`你好：${data.data.nickname}`);
              // $.pin = data.data.nickname;
              $.secretPin = data.data.secretPin;
              // cookie = `${cookie};AUTH_C_USER=${data.data.secretPin}`;
            } else {
              $.log(data.errorMessage);
            }
          } else {
            $.log("京东返回了空数据");
          }
        }
      } catch (error) {
        $.log(error);
      } finally {
        resolve();
      }
    });
  });
}

function getFirstLZCK() {
  return new Promise(resolve => {
    $.get({url: $.activityUrl}, (err, resp, data) => {
      try {
        if (err) {
          console.log(err)
        } else {
          if (resp['headers']['set-cookie']) {
            cookie = `${originCookie}`
            if ($.isNode()) {
              for (let sk of resp['headers']['set-cookie']) {
                cookie = `${cookie}${sk.split(";")[0]};`
              }
            } else {
              for (let ck of resp['headers']['Set-Cookie'].split(',')) {
                cookie = `${cookie}${ck.split(";")[0]};`
              }
            }
          }
          if (resp['headers']['Set-Cookie']) {
            cookie = `${originCookie}`
            if ($.isNode()) {
              for (let sk of resp['headers']['set-cookie']) {
                cookie = `${cookie}${sk.split(";")[0]};`
              }
            } else {
              for (let ck of resp['headers']['Set-Cookie'].split(',')) {
                cookie = `${cookie}${ck.split(";")[0]};`
              }
            }
          }
        }
      } catch (error) {
        console.log(error)
      } finally {
        resolve();
      }
    })
  })
}

function getToken() {
  let opt = {
    url: `https://api.m.jd.com/client.action?functionId=isvObfuscator`,
    headers: {
      Host: 'api.m.jd.com',
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: '*/*',
      Connection: 'keep-alive',
      Cookie: cookie,
      'User-Agent': 'JD4iPhone/167650 (iPhone; iOS 13.7; Scale/3.00)',
      'Accept-Language': 'zh-Hans-CN;q=1',
      'Accept-Encoding': 'gzip, deflate, br',
    },
    body: `body=%7B%22url%22%3A%20%22https%3A//lzdz2-isv.isvjcloud.com%22%2C%20%22id%22%3A%20%22%22%7D&uuid=22ee31cb140e413eb74ce5103e2ee553&client=apple&clientVersion=9.4.0&st=1622020861000&sv=102&sign=20d34e0e16f2736cb8b64da914fd74af`
  }
  return new Promise(resolve => {
    $.post(opt, (err, resp, data) => {
      try {
        if (err) {
          $.log(err)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data.code === "0") {
              $.token = data.token
            }
          } else {
            $.log("京东返回了空数据")
          }
        }
      } catch (error) {
        $.log(error)
      } finally {
        resolve();
      }
    })
  })
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getUUID(format = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', UpperCase = 0) {
  return format.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    if (UpperCase) {
      uuid = v.toString(36).toUpperCase();
    } else {
      uuid = v.toString(36)
    }
    return uuid;
  });
}

function checkCookie() {
  const options = {
    url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
    headers: {
      "Host": "me-api.jd.com",
      "Accept": "*/*",
      "Connection": "keep-alive",
      "Cookie": cookie,
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Mobile/15E148 Safari/604.1",
      "Accept-Language": "zh-cn",
      "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
      "Accept-Encoding": "gzip, deflate, br",
    }
  };
  return new Promise(resolve => {
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          $.logErr(err)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data.retcode === "1001") {
              $.isLogin = false; //cookie过期
              return;
            }
            if (data.retcode === "0" && data.data.hasOwnProperty("userInfo")) {
              $.nickName = data.data.userInfo.baseInfo.nickname;
            }
          } else {
            $.log('京东返回了空数据');
          }
        }
      } catch (e) {
        $.logErr(e)
      } finally {
        resolve();
      }
    })
  })
}
// prettier-ignore
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
