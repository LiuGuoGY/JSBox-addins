let colors = [$rgba(120, 219, 252, 0.9), $rgba(252, 175, 230, 0.9), $rgba(252, 200, 121, 0.9), $rgba(187, 252, 121, 0.9), $rgba(173, 121, 252, 0.9), $rgba(252, 121, 121, 0.9), $rgba(121, 252, 252, 0.9)]
const mColor = {
  gray: "#a2a2a2",
  blue: "#3478f7",
  black: "#303032",
  green: "#27AE60",
  red: "#E74C3C",
  iosGreen: "#4CD964",
  lightBlue: "#00A2FF"
}
const appCates = ["工具", "效率", "开发", "社交", "视频", "音乐", "游戏", "学习"]
const appId = "kscF2nXMoGQCJDLf2MQxYTGm-gzGzoHsz"
const appKey = "Stp7wCtlaybGlMbDJ4ApYbQL"

function getCache(key, def) {
  let temp = $cache.get(key)
  if (temp == undefined) {
    if(def == undefined){
      switch(key) { 
        case "columns": def = 4; break;
        case "showMode": def = 0; break;
        case "openBroswer": def = 0; break;
        case "backgroundTranparent": def = true; break;
        case "pullToClose": def = true; break;
        case "staticHeight": def = false; break;
      }
    }
    $cache.set(key, def)
    return def
  } else {
    return temp
  }
}

function getSearchJson(url){
  let deUrl = decodeURI(url)
  let searchArr = deUrl.substr(deUrl.indexOf("?") + 1).split("&");
  let searchJson = {}
  for(let i = 0; i < searchArr.length; i++){
    searchJson[searchArr[i].split("=")[0]] = searchArr[i].split("=")[1]
  }
  return searchJson
}

function getNum(text){
	var value = text.replace(/[^0-9]/ig,""); 
	return value;
}

function myOpenUrl(url) {
  url = spliceUrlPara(url)
  if(!url.startsWith("http")|| checkUrlScheme(url)) {
    $app.openURL(url)
  } else {
    let bNumber = getCache("openBroswer")
    if(bNumber == 0) {
      $app.openURL(url)
    } else if(bNumber < 11) {
      $app.openBrowser({
        type: 10000 + bNumber - 1,
        url: url,
      })
    } else {
      switch(bNumber) {
        case 11: $app.openURL("alook://" + url)
          break
      }
    }
  }
}

function spliceUrlPara(url) {
  if(url.indexOf("[clipboard]") >= 0) {
    let clipboard = $clipboard.text
    if(clipboard == undefined) {
      clipboard = ""
    }
    return url.replace(/\[clipboard\]/g, $text.URLEncode(clipboard))
  } else {
    return url
  }
}

function checkUrlScheme(url) {
  let array = ["itunes.apple.com"]
  for(let i = 0; i < array.length; i++) {
    if(url.indexOf(array[i]) >= 0) {
      return true
    }
  }
  return false
}

function randomValue(object) {
  let x = Math.floor(Math.random()*object.length)
  return object[x]
}

function getInstalledApps() {
  let apps = []
  let addins = $addin.list
  for(let i = 0; i < addins.length; i++) {
    if(addins[i].name.endsWith(".js")) {
      let str = addins[i].data.string
      if(str && str.indexOf("/**erots") >= 0) {
        let id = str.match(/id: (\S*)\n/)[1]
        let build = parseInt(str.match(/build: (\S*)\n/)[1])
        apps.push({
          localName: addins[i].name,
          id: id,
          build: build,
        })
      }
    } else {
      let data = $file.read("../../Code/" + addins[i].name + "/erots.json");
      if(data) {
        let json = JSON.parse(data.string)
        json.localName = addins[i].name
        apps.push(json)
      }
    }
  }
  return apps
}

module.exports = {
  getCache: getCache,
  randomValue: randomValue,
  mColor: mColor,
  colors: colors,
  myOpenUrl: myOpenUrl,
  appCates: appCates,
  getSearchJson: getSearchJson,
  getNum: getNum,
  appId: appId,
  appKey: appKey,
  getInstalledApps: getInstalledApps,
}