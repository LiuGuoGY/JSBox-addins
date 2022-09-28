/*-- 获取App最顶层Window对象 --*/
const window = $objc("UIApplication").$sharedApplication().invoke("delegate.window").jsValue();

/*-- 获取系统Adaptable颜色 --*/
const systemColor = name => $objc("UIColor").invoke(`system${name.charAt(0).toUpperCase() + name.slice(1)}Color`).jsValue();

/*-- 获取设备方向 (返回上下左右、正面和背面) --*/
const deviceOrientation = $objc("UIDevice").invoke("currentDevice.orientation");

/*-- 获取状态栏方向 (返回上下左右) --*/
const statusBarOrientation = () => $objc("UIApplication").invoke("sharedApplication.statusBarOrientation");

/*-- 获取字体占用空间大小的 --*/
const sizeThatFits = (text, {
  font = $font(17), lineSpacing,
  size = $ui.vc.view.frame
} = {}) => {
  return $text.sizeThatFits({
    text, font, lineSpacing,
    width: size.width,
    height: size.height
  });
};

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
const appId = "j3j1wl1IDqkAISktyLfBDKRL-MdYXbMMI"
const appKey = "7HqEpjmquc1g4g4jqQFw0ekG"
const domain = "https://j3j1wl1I.api.lncldglobal.com/1.1"
const conAppId = "N2gkROnx43nss0Bya21rJMLH-MdYXbMMI"
const conAppKey = "3aU5KFNuqaEbytn7Op4JDFKu"
const tColor = {
  light: {
    mainColor: $color("#FEFFFE"),
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
    indicatorStyle: 0,
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
    indicatorStyle:2,
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
        case "themeMode":
          def = 2;
          break;
        case "lightThemeColor":
        case "darkThemeColor":
        case "themeColor":
          def = $color(mColor.blue);
          break;
        case "storeStiky":
          def = false;
          break;
      }
    }
    $cache.set(key, def)
    return def
  } else {
    return temp
  }
}

function setCache(key, val) {
  $cache.set(key, val)
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
        let ids = data.string.match(/id: (\S*)\n/);
        if(!ids) {
          continue;
        }
        let id = ids[1];
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

//数字补0
function padNumber(num, fill) {
  var len = ('' + num).length;
  return (Array(
      fill > len ? fill - len + 1 || 0 : 0
  ).join(0) + num);
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
    result = "" + parseInt(yearC) + " 年前";
  } else if (monthC >= 1) {
    result = "" + parseInt(monthC) + " 月前";
  } else if (weekC >= 1) {
    result = "" + parseInt(weekC) + " 周前";
  } else if (dayC >= 1) {
    result = "" + parseInt(dayC) + " 天前";
  } else if (hourC >= 1) {
    result = "" + parseInt(hourC) + " 小时前";
  } else if (minC >= 1) {
    result = "" + parseInt(minC) + " 分钟前";
  } else {
    result = "刚刚";
  }
  return result;
}

function getThemeMode() {
  let themeMode = getCache("themeMode")
  switch(themeMode) {
    case 0: return "light";
    case 1: return "dark";
    case 2: return ($device.isDarkMode)?"dark":"light";
    case 3: return ($system.brightness < 0.2)?"dark":"light";
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

function setLineSpacing(text, spacing) {
  var attrText = $objc("NSMutableAttributedString").invoke("alloc").invoke("initWithString", text);
  var style = $objc("NSMutableParagraphStyle").invoke("alloc.init");
  style.invoke("setLineSpacing", spacing);
  attrText.invoke("addAttribute:value:range:", "NSParagraphStyle", style, $range(0, text.length));
  return attrText.rawValue();
}

function isVoiceOverRunning() {
  $defc("UIAccessibilityIsVoiceOverRunning", "BOOL");
  return UIAccessibilityIsVoiceOverRunning();
}


function numerToSize(number){
  var size = "";
  if( number < 1024 ){ //如果小于1KB转化成B
    size = number.toFixed(2) + " B"; 	
  }else if(number < 1024 * 1024 ){//如果小于1MB转化成KB
    size = (number / 1024).toFixed(2) + " KB";			
  }else if(number < 1024 * 1024 * 1024){ //如果小于1GB转化成MB
    size = (number / (1024 * 1024)).toFixed(2) + " MB";
  }else{ //其他转化成GB
    size = (number / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  }
  
  var sizestr = size + ""; 
  var len = sizestr.indexOf("\.");
  var dec = sizestr.substr(len + 1, 2);
  if(dec == "00"){ //当小数点后为00时 去掉小数部分
    return sizestr.substring(0,len) + sizestr.substr(len + 3,2);
  }
  return sizestr;
}

module.exports = {
  window,
  systemColor,
  deviceOrientation,
  statusBarOrientation,
  sizeThatFits,
  getCache: getCache,
  setCache: setCache,
  randomValue: randomValue,
  mColor: mColor,
  colors: colors,
  domain: domain,
  myOpenUrl: myOpenUrl,
  appCates: appCates,
  getSearchJson: getSearchJson,
  getNum: getNum,
  appId: appId,
  appKey: appKey,
  conAppId: conAppId,
  conAppKey: conAppKey,
  getInstalledApps: getInstalledApps,
  getUpdateDateString: getUpdateDateString,
  tColor: tColor,
  themeColor: themeColor,
  addUpdateApps: addUpdateApps,
  getThemeMode: getThemeMode,
  saveAddin: saveAddin,
  setLineSpacing: setLineSpacing,
  isVoiceOverRunning: isVoiceOverRunning,
  numerToSize: numerToSize,
  padNumber: padNumber,
}