let utils = require("scripts/utils");
let update = require("scripts/update");

$ui.render("main");

let locTimer = $timer.schedule({
  interval: 0.2,
  handler: function() {
    if ($("image[1]").hidden == false) {
      $("image[1]").hidden = true;
    } else {
      $("image[1]").hidden = false;
    }
  }
});

$location.fetch({
  handler: function(resp) {
    var lat = resp.lat;
    var lng = resp.lng;
    $http.get({
      url:
        "https://restapi.amap.com/v3/geocode/regeo?output=json&location=" +
        lng +
        "," +
        lat +
        "&key=cddd95953d25ad9d34d63b1823a21dcd",
      handler: function(resp) {
        var data = resp.data;
        $console.info(data);
        if (data.status == "1") {
          // getWannianli(data.regeocode.addressComponent.district)
          getAirQuality(data.regeocode.addressComponent.province, data.regeocode.addressComponent.city);
          getHeFeng(data.regeocode.addressComponent.province, data.regeocode.addressComponent.city, data.regeocode.addressComponent.district);
          // getCaiYun(lng, lat);
          locTimer.invalidate();
          $("image[1]").hidden = true;
        }
      }
    });
  }
});

if ($app.env == $env.app) {
  update.checkUpdate();
  uploadInstall()
}


async function getWannianli(city) {
  let resp = await $http.get({
    url: "http://wthrcdn.etouch.cn/weather_mini?city=" + $text.URLEncode(city)
  });
  let data = resp.data;
  if (data.status == 1000) {
    $("label[0]").text = data.data.wendu + "°";
    $("label[1]").text = data.data.forecast[0].type;
    $cache.set("nowTemp", data.data.wendu);
    $cache.set("todayType", data.data.forecast[0].type);
    $("image[2]").src = utils.getCardSrc(data.data.forecast[0].type);
  }
  $console.info(data);
}

async function getAirQuality(province, city) {
  let array = [city, province]
  get(array)
  async function get(array, index) {
    if(!index) {
      index = 0;
    }
    if(index > array.length - 1) {
      return false;
    }
    if(!utils.isString(array[index]) || array[index].length <= 0) {
      get(array, index + 1);
      return false;
    }
    let resp = await $http.get({
      url:
        "https://free-api.heweather.net/s6/air/now?location="  +
        $text.URLEncode(array[index]) +
        "&key=63d9ae66c2844258895e1432ac452ef4"
    });
    let data = resp.data;
    $console.info(data);
    if (data.HeWeather6[0].status == "ok") {
      $("label[2]").text = "空气质量：" + data.HeWeather6[0].air_now_city.qlty;
      $cache.set("nowQlty", data.HeWeather6[0].air_now_city.qlty);
      return true
    } else {
      get(array, index + 1);
      return false
    }
  }
}

async function getHeFeng(province, city, district) {
  let array = [district, city, province]
  get(array)
  async function get(array, index) {
    if(!index) {
      index = 0;
    }
    if(index > array.length - 1) {
      return undefined;
    }
    if(!utils.isString(array[index]) || array[index].length <= 0) {
      get(array, index + 1);
      return undefined;
    }
    let resp = await $http.get({
      url:
        "https://free-api.heweather.net/s6/weather/now?location=" +
        $text.URLEncode(array[index]) +
        "&key=63d9ae66c2844258895e1432ac452ef4"
    });
    let data = resp.data;
    $console.info(data);
    if (data.HeWeather6[0].status == "ok") {
      $("label[0]").text = data.HeWeather6[0].now.tmp + "°";
      $("label[1]").text = data.HeWeather6[0].now.cond_txt;
      $cache.set("nowTemp", data.HeWeather6[0].now.tmp);
      $cache.set("todayType", data.HeWeather6[0].now.cond_txt);
      $("image[2]").src = utils.getCardSrc(data.HeWeather6[0].now.cond_txt);
      return true
    } else {
      get(array, index + 1);
      return false
    }
  }
}

async function getCaiYun(lng, lat) {
  let resp = await $http.get({
    url: "https://api.caiyunapp.com/v2/Y2FpeXVuX25vdGlmeQ==/" + lng + "," + lat + "/realtime"
  });
  let data = resp.data;
  $console.info(data);
  if (data.status == "ok") {
  //   $("label[0]").text = data.HeWeather6[0].now.tmp + "°";
  //   $("label[1]").text = data.HeWeather6[0].now.cond_txt;
  //   $cache.set("nowTemp", data.HeWeather6[0].now.tmp);
  //   $cache.set("todayType", data.HeWeather6[0].now.cond_txt);
  //   $("image[2]").src = utils.getCardSrc(data.HeWeather6[0].now.cond_txt);
  //   return true
  // } else {
  //   get(array, index + 1);
  //   return false
  }
}

function setTempView(targetTemp) {
  targetTemp = parseInt(targetTemp)
  let startTemp = parseInt($("label[0]").text.substring(0, $("label[0]").text.length - 1))
  let nowTemp = startTemp
  let tempTimer = $timer.schedule({
    interval: Math.abs(startTemp - targetTemp) * 0.0145,
    handler: function() {
      if($("label[0]")) {
        if(nowTemp < targetTemp) {
          $("label[0]").text = ++nowTemp + "°";
        } else if(nowTemp > targetTemp) {
          $("label[0]").text = --nowTemp + "°";
        } else {
          tempTimer.invalidate();
        }
      } else {
        tempTimer.invalidate();
      }
    }
  });
}

function uploadInstall() {
  let appId = "KnKfUcSG1QcFIBPgM7D10thc-gzGzoHsz"
  let appKey = "HqShYPrqogdvMOrBC6fIPqVa"
  let info = {
    addinVersion: update.getCurVersion(),
    iosVersion: $device.info.version,
    jsboxVersion: $app.info.version,
    deviceType: "ios",
    deviceToken: $objc("FCUUID").invoke("uuidForDevice").rawValue()
  }
  let info_pre = utils.getCache("installInfo")
  function isDifferent(info, info_pre) {
    if(info == undefined || info_pre == undefined) {
      return true
    } else if(info.addinVersion != info_pre.addinVersion || info.iosVersion != info_pre.iosVersion || info.jsboxVersion != info_pre.jsboxVersion || info.deviceToken != info_pre.deviceToken) {
      return true
    } else {
      return false
    }
  }
  if(isDifferent(info, info_pre)) {
    $cache.set("installInfo", info)
    $http.request({
      method: "POST",
      url: "https://knkfucsg.api.lncld.net/1.1/installations",
      timeout: 5,
      header: {
        "Content-Type": "application/json",
        "X-LC-Id": appId,
        "X-LC-Key": appKey,
      },
      body: {
        addinVersion: update.getCurVersion(),
        iosVersion: $device.info.version,
        jsboxVersion: $app.info.version,
        deviceType: "ios",
        deviceToken: $objc("FCUUID").invoke("uuidForDevice").rawValue()
      },
      handler: function(resp) {
      }
    })
  }
}