let colors = [$rgba(120, 219, 252, 0.9), $rgba(252, 175, 230, 0.9), $rgba(252, 200, 121, 0.9), $rgba(187, 252, 121, 0.9), $rgba(173, 121, 252, 0.9), $rgba(252, 121, 121, 0.9), $rgba(121, 252, 252, 0.9)]
const mColor = {
  gray: "#a2a2a2",
  blue: "#3478f7",
  black: "#303032",
  green: "#27AE60",
  red: "#E74C3C",
  iosGreen: "#4CD964",
  lightBlue: "#00A2FF",
  // orangeRed: "#FF4500",
  // forcasetGreen: "#228B22",
  // gold: "#FFD700",
  // purple: "#9370DB",
  // brown: "#A52A2A",
  // steelBlue: "#4682B4"
}
const appCates = ["工具", "效率", "开发", "社交", "视频", "音乐", "游戏", "学习"]
const appId = "kscF2nXMoGQCJDLf2MQxYTGm-gzGzoHsz"
const appKey = "Stp7wCtlaybGlMbDJ4ApYbQL"

const tColor = {
  light: {
    mainColor: $color("white"),
    bgcolor: $color("clear"),
    blurType: 1,
    listHeaderTextColor: $color("black"),
    appButtonBgColor: $rgba(100, 100, 100, 0.1),
    iconBorderColor: $color("#DEDEDF"),
    separatorColor: $color("#E0E0E0"),
    statusBarStyle: 0,
    appCateTextColor: $color("gray"),
    listContentTextColor: $color("#444444"),
    darkKeyboard: false,
    mainTabGrayColor: $color(mColor.gray),
    commentBgColor: $color("#F0F0F8"),
    appHintColor: $color("lightGray"),
    appObviousColor: $color("darkGray"),
    uploadBgcolor: $color("#F9F9F8"),
    actionSheetBgColor: $rgba(0, 0, 0, 0.25),
    spinnerStyle: 2,
  },
  dark: {
    mainColor: $color("black"),
    bgcolor: $color("black"),
    blurType: 3,
    listHeaderTextColor: $color("white"), //gray
    appButtonBgColor: $rgba(100, 100, 100, 0.5),
    iconBorderColor: $color("gray"),
    separatorColor: $color("darkGray"),
    statusBarStyle: 1,
    appCateTextColor: $color("gray"),
    listContentTextColor: $color("white"), //gray
    darkKeyboard: true,
    mainTabGrayColor: $color("gray"),
    commentBgColor: $color("#202020"),
    appHintColor: $color("gray"),
    appObviousColor: $color("white"),
    uploadBgcolor: $color("#202020"),
    actionSheetBgColor: $rgba(255, 255, 255, 0.15),
    spinnerStyle: 1,
  }
}

let themeColor = tColor.light;

function getCache(key, def) {
  let temp = $cache.get(key)
  if (temp == undefined) {
    if (def == undefined) {
      switch (key) {
        case "darkMode":
          def = false;
          break;
        case "authPass":
          def = false;
          break;
        case "darkModeAuto":
          def = false;
          break;
        case "themeColor":
          def = $color(mColor.blue);
          break;
      }
    }
    $cache.set(key, def)
    return def
  } else {
    return temp
  }
}

function getSearchJson(url) {
  let deUrl = decodeURI(url)
  let searchArr = deUrl.substr(deUrl.indexOf("?") + 1).split("&");
  let searchJson = {}
  for (let i = 0; i < searchArr.length; i++) {
    searchJson[searchArr[i].split("=")[0]] = searchArr[i].split("=")[1]
  }
  return searchJson
}

function getNum(text) {
  var value = text.replace(/[^0-9]/ig, "");
  return value;
}

function myOpenUrl(url) {
  url = spliceUrlPara(url)
  if (!url.startsWith("http") || checkUrlScheme(url)) {
    $app.openURL(url)
  } else {
    let bNumber = getCache("openBroswer")
    if (bNumber == 0) {
      $app.openURL(url)
    } else if (bNumber < 11) {
      $app.openBrowser({
        type: 10000 + bNumber - 1,
        url: url,
      })
    } else {
      switch (bNumber) {
        case 11:
          $app.openURL("alook://" + url)
          break
      }
    }
  }
}

function spliceUrlPara(url) {
  if (url.indexOf("[clipboard]") >= 0) {
    let clipboard = $clipboard.text
    if (clipboard == undefined) {
      clipboard = ""
    }
    return url.replace(/\[clipboard\]/g, $text.URLEncode(clipboard))
  } else {
    return url
  }
}

function checkUrlScheme(url) {
  let array = ["itunes.apple.com"]
  for (let i = 0; i < array.length; i++) {
    if (url.indexOf(array[i]) >= 0) {
      return true
    }
  }
  return false
}

function randomValue(object) {
  let x = Math.floor(Math.random() * object.length)
  return object[x]
}

function getInstalledApps() {
  let apps = []
  let addins = $addin.list
  for (let i = 0; i < addins.length; i++) {
    if (addins[i].name.endsWith(".js")) {
      let data = addins[i].data
      if (data && data.string.indexOf("/**erots") >= 0) {
        let id = data.string.match(/id: (\S*)\n/)[1]
        let build = parseInt(data.string.match(/build: (\S*)\n/)[1])
        apps.push({
          localName: addins[i].name,
          id: id,
          build: build,
        })
      }
    } else {
      let data = $file.read("../../Code/" + addins[i].name + "/erots.json");
      if (data) {
        let json = JSON.parse(data.string)
        json.localName = addins[i].name
        apps.push(json)
      }
    }
  }
  return apps
}

function addUpdateApps(objectId) {
  let ids = getCache("updateIds", [])
  for (let i = 0; i < ids.length; i++) {
    if (ids[i] == objectId) {
      ids.splice(i, 1);
    }
  }
  ids.unshift(objectId)
  $cache.set("updateIds", ids);
}

function getUpdateDateString(time) {
  if (!time) {
    return "过去某时";
  }
  let result = ""
  let minute = 1000 * 60;
  let hour = minute * 60;
  let day = hour * 24;
  let month = day * 30;
  let year = month * 12
  let updateTime = new Date(time).getTime()
  let nowTime = new Date().getTime()
  let diffValue = nowTime - updateTime;
  let yearC = diffValue / year;
  let monthC = diffValue / month;
  let weekC = diffValue / (7 * day);
  let dayC = diffValue / day;
  let hourC = diffValue / hour;
  let minC = diffValue / minute;
  if (yearC >= 1) {
    result = "" + parseInt(yearC) + "年前";
  } else if (monthC >= 1) {
    result = "" + parseInt(monthC) + "月前";
  } else if (weekC >= 1) {
    result = "" + parseInt(weekC) + "周前";
  } else if (dayC >= 1) {
    result = "" + parseInt(dayC) + "天前";
  } else if (hourC >= 1) {
    result = "" + parseInt(hourC) + "小时前";
  } else if (minC >= 1) {
    result = "" + parseInt(minC) + "分钟前";
  } else {
    result = "刚刚";
  }
  return result;
}

function getThemeMode() {
  if (getCache("darkMode")) {
    if ($device.isDarkMode) {
      return "dark";
    } else {
      if (getCache("darkModeAuto")) {
        return ($system.brightness < 0.15) ? "dark" : "light";
      } else {
        return "dark";
      }
    }
  } else {
    return "light";
  }
}

async function saveAddin(name, icon, data) {
  let deviceId = $objc("FCUUID").invoke("uuidForDevice").rawValue()
  if (data.string) {
    let id = data.string.match(/id: (\S*)\n/)[1]
    let build = parseInt(data.string.match(/build: (\S*)\n/)[1])
    let position = data.string.indexOf("/**erots")
    let str = data.string
    if (position >= 0) {
      str = data.string.replace(/\/\*\*erots(.|\n)*?\*\/\n/, "")
    }
    let newStr = "/**erots\nid: " + id + "\nbuild: " + build + "\nsource: " + deviceId + "\n*/\n" + str
    $addin.save({
      name: name,
      data: $data({ string: newStr, }),
      icon: icon,
    });
  } else {
    $addin.save({
      name: name,
      data: data,
      icon: icon,
      handler: function(success) {
        let fileData = $file.read("../../Code/" + name + "/erots.json");
        if (fileData) {
          let json = JSON.parse(fileData.string)
          json.source = deviceId;
          let str = JSON.stringify(json, null, 2);
          $console.info(str);
          $file.write({
            data: $data({ string: str, }),
            path: "../../Code/" + name + "/erots.json"
          });
        }
      }
    });
  }
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
  getUpdateDateString: getUpdateDateString,
  tColor: tColor,
  themeColor: themeColor,
  addUpdateApps: addUpdateApps,
  getThemeMode: getThemeMode,
  saveAddin: saveAddin,
}