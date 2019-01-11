function getCache(key, def) {
  let temp = $cache.get(key);
  if (temp == undefined) {
    $cache.set(key, def);
    return def;
  } else {
    return temp;
  }
}

function getCardSrc(weatherType, airQuality) {
  if (weatherType.indexOf("多云") >= 0) {
    return "assets/purple.PNG";
  } else if (weatherType.indexOf("晴") >= 0) {
    return "assets/orange.PNG";
  } else if (weatherType.indexOf("小雨") >= 0 && airQuality.indexOf("优") >= 0){
    return "assets/green.PNG";
  } else {
    return "assets/blue.PNG";
  }
}

function getWidgetHeight() {
  let standardHeight = $device.isIpadPro ? 130.0 : 110.0;
  let bodyFontSize = $objc("UIFont")
    .$preferredFontForTextStyle("UICTFontTextStyleBody")
    .$pointSize();
  let standardFontSize = 17.0;
  let fontSizeDiff = bodyFontSize - standardFontSize;
  let compactModeHeight = standardHeight + fontSizeDiff;
  return compactModeHeight;
}

function isString(s) {
  return String(s) === s;
}

module.exports = {
  getCache: getCache,
  getCardSrc: getCardSrc,
  getWidgetHeight: getWidgetHeight,
  isString: isString,
};
