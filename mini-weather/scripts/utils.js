const bgcolors = {
  purple: "#A192D1",
  orange: "#F8A042",
  green: "#9BEE52",
  blue: "#496CC5",
}

const mColor = {
  gray: "#a2a2a2",
  blue: "#3478f7",
  theme: "#3478f7",
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
        case "forcastRemind": def = false; break;
      }
    }
    $cache.set(key, def)
    return def
  } else {
    return temp
  }
}

function getCardSrc(weatherType, airQuality) {
  if (weatherType.indexOf("多云") >= 0) {
    return "assets/purple.png";
  } else if (weatherType.indexOf("晴") >= 0) {
    return "assets/orange.png";
  } else if (weatherType.indexOf("小雨") >= 0 && airQuality.indexOf("优") >= 0){
    return "assets/green.png";
  } else {
    return "assets/blue.png";
  }
}

function getBgColor(src) {
  if (src.indexOf("purple") >= 0) {
    return bgcolors.purple;
  } else if (src.indexOf("orange") >= 0) {
    return bgcolors.orange;
  } else if (src.indexOf("green") >= 0){
    return bgcolors.green;
  } else {
    return bgcolors.blue;
  }
}

function getWidgetHeight() {
  if(getCache("widgetHeight") && $app.env != $env.app) {
    return getCache("widgetHeight")
  } else {
    let standardHeight = $device.isIpadPro ? 130.0 : 110.0;
    let bodyFontSize = $objc("UIFont")
      .$preferredFontForTextStyle("UICTFontTextStyleBody")
      .$pointSize();
    let standardFontSize = 17.0;
    let fontSizeDiff = bodyFontSize - standardFontSize;
    let compactModeHeight = standardHeight + fontSizeDiff;
    return compactModeHeight;
  }
}

function isString(s) {
  return String(s) === s;
}

module.exports = {
  getCache: getCache,
  getCardSrc: getCardSrc,
  getWidgetHeight: getWidgetHeight,
  isString: isString,
  bgcolors: bgcolors,
  getBgColor: getBgColor,
  mColor: mColor,
};
