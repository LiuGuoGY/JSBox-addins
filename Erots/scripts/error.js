let tran = require('scripts/translate')

async function getMessage(code, error) {
  if(code === 403) {
    if(error.indexOf("permissions") >= 0 && error.indexOf("_User") >= 0) {
      return "注册关闭"
    }
  }
  if(code === 140) {
    return "今日的API次数已经用完，请明日再使用，对此带来的不便，敬请谅解"
  }
  return (await tran.tran(error) + " 错误代码: " + code)
}

module.exports = {
  getMessage: getMessage,
}