function whichLan(text) {
  let englishChar = text.match(/[a-zA-Z]/g)
  let englishNumber = !englishChar?0:englishChar.length
  let chineseChar = text.match(/[\u4e00-\u9fff\uf900-\ufaff]/g)
  let chineseNumber = !chineseChar?0:chineseChar.length
  let tl = "en"
  if ((chineseNumber * 2) >= englishNumber) {
    tl = "zh-CN"
  } else {
    tl = "en"
  }
  return tl
}

async function googleTran(text, handler) {
  let sl = whichLan(text)
  let tl = ""
  if (sl == "en") {
    tl = "zh-CN"
    let resp = await $http.request({
      method: "POST",
      url: "http://translate.google.cn/translate_a/single",
      timeout: 5,
      header: {
        "User-Agent": "iOSTranslate",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: {
        "dt": "t",
        "q": text,
        "tl": tl,
        "ie": "UTF-8",
        "sl": sl,
        "client": "ia",
        "dj": "1"
      },
      showsProgress: false,
    })
    return (analyseGData(resp.data))
  } else {
    return (text)
  }
}

function analyseGData(data) {
  let length = data.sentences.length
  if(length != undefined) {
    let meanText = ""
    for (let i = 0; i < length; i++) {
      meanText += data.sentences[i].trans
      if (i < length - 1) {
        meanText += "\n"
      }
    }
    return meanText
  } else {
    return data.sentences[0].trans
  }
}


module.exports = {
  tran: googleTran,
}