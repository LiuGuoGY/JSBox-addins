let colors = [$rgba(120, 219, 252, 0.9), $rgba(252, 175, 230, 0.9), $rgba(252, 200, 121, 0.9), $rgba(187, 252, 121, 0.9), $rgba(173, 121, 252, 0.9), $rgba(252, 121, 121, 0.9), $rgba(121, 252, 252, 0.9)]
const mColor = {
  gray: "#a2a2a2",
  blue: "#3478f7",
  black: "#303032",
  green: "#27AE60",
  red: "#E74C3C",
  iosGreen: "#4CD964",
}

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

module.exports = {
  getCache: getCache,
  randomValue: randomValue,
  mColor: mColor,
  colors: colors,
  myOpenUrl: myOpenUrl,
}