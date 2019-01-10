function getCache(key, def) {
  let temp = $cache.get(key)
  if (temp == undefined) {
    $cache.set(key, def)
    return def
  } else {
    return temp
  }
}

function getCardSrc(weatherType) {
  if(weatherType.indexOf("多云") >= 0) {
    return "assets/purple.PNG"
  } else if(weatherType.indexOf("晴") >= 0) {
    return"assets/orange.PNG"
  } else {
    return "assets/blue.PNG"
  }
}

module.exports = {
  getCache: getCache,
  getCardSrc: getCardSrc,
};
