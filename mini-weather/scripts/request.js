let utils = require("scripts/utils");
let view = require("scripts/view");

function request() {
  let locTimer = $timer.schedule({
    interval: 0.2,
    handler: function() {
      if ($("locationIcon").hidden == false) {
        $("locationIcon").hidden = true;
      } else {
        $("locationIcon").hidden = false;
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
            getCaiYunForecast(lng, lat);
            locTimer.invalidate();
            $("locationIcon").hidden = true;
          }
        }
      });
    }
  });
}


async function getWannianli(city) {
  let resp = await $http.get({
    url: "http://wthrcdn.etouch.cn/weather_mini?city=" + $text.URLEncode(city)
  });
  let data = resp.data;
  if (data.status == 1000) {
    setTemp(data.data.wendu);
    setWeatherType(data.data.forecast[0].type);
    setBgImage(data.data.forecast[0].type)
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
      $("airQuality").text = "空气质量：" + data.HeWeather6[0].air_now_city.qlty;
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
      setTemp(data.HeWeather6[0].now.tmp);
      setWeatherType(data.HeWeather6[0].now.cond_txt);
      setBgImage(data.HeWeather6[0].now.cond_txt)
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
    setTemp(Math.floor(Math.parseFloat(data.result.temperature)));
    // $("temp").text = Math.floor(Math.parseFloat(data.result.temperature)) + "°";
    // $("weatherType").text = data.result.skycon;
    // $cache.set("nowTemp", Math.floor(Math.parseFloat(data.result.temperature)));
  //   $cache.set("todayType", data.HeWeather6[0].now.cond_txt);
  //   $("cardBgImage").src = utils.getCardSrc(data.HeWeather6[0].now.cond_txt);
  //   view.shadow($("card"), utils.getBgColor($("cardBgImage").src))
  //   return true
  // } else {
  //   get(array, index + 1);
  //   return false
  }
}

async function getCaiYunForecast(lng, lat) {
  let resp = await $http.get({
    url: "https://api.caiyunapp.com/v2/Y2FpeXVuX25vdGlmeQ==/" + lng + "," + lat + "/forecast"
  });
  let data = resp.data;
  $console.info(data)
  if (data.status == "ok") {
    if(data.result.forecast_keypoint.indexOf("不会") < 0) {
      $delay(0.5, function() {
        $ui.animate({
          duration: 0.4,
          damping: 0.8,
          animation: function() {
            $("airQuality").alpha = 0
          },
          completion: function() {
            $("airQuality").text = data.result.forecast_keypoint;
            $ui.animate({
              duration: 0.4,
              damping: 0.8,
              animation: function() {
                $("airQuality").alpha = 1
              },
            })
          },
        })
      });
    }
    
    let listData = [];
    listData.push({
      list_mark: {
        hidden: false,
      },
      list_date: {
        text: getDateString(0),
      },
      list_temp: {
        text: Math.floor(data.result.daily.temperature[0].min) + " ~ " + Math.floor(data.result.daily.temperature[0].max) + "℃",
      },
      list_weather: {
        text: "——",
      }
    });
    listData.push({
      list_mark: {
        hidden: true,
      },
      list_date: {
        text: getDateString(1),
      },
      list_temp: {
        text: Math.floor(data.result.daily.temperature[1].min) + " ~ " + Math.floor(data.result.daily.temperature[1].max) + "℃",
      },
      list_weather: {
        text: "——",
      }
    })
    $("forecastList").data = listData;
    $cache.set("forecastData", listData);
  }
}

function getDateString(offset) {
  let date = new Date();
  date.setDate(date.getDate() + offset);
  let nowMonth = date.getMonth() + 1;
  var nowDay = date.getDate();
  if (nowMonth >= 1 && nowMonth <= 9) {
    nowMonth = "0" + nowMonth;
 }
 if (nowDay >= 0 && nowDay <= 9) {
    nowDay = "0" + nowDay;
 }
 return nowMonth + " / " + nowDay;
}

function setTemp(text) {
  $("temp").text = text + "°";
  $cache.set("nowTemp", text);
}

function setBgImage(text) {
  let src = utils.getCardSrc(text);
  if(src !== $("cardBgImage").src) {
    $("cardBgImage").src = src;
  }
  view.shadow($("card"), utils.getBgColor(src))
  $cache.set("bgcolor", utils.getBgColor(src));
}

function setWeatherType(text) {
  $("weatherType").text = text;
  $cache.set("todayType", text);
}

function setTempView(targetTemp) {
  targetTemp = parseInt(targetTemp)
  let startTemp = parseInt($("temp").text.substring(0, $("temp").text.length - 1))
  let nowTemp = startTemp
  let tempTimer = $timer.schedule({
    interval: Math.abs(startTemp - targetTemp) * 0.0145,
    handler: function() {
      if($("temp")) {
        if(nowTemp < targetTemp) {
          $("temp").text = ++nowTemp + "°";
        } else if(nowTemp > targetTemp) {
          $("temp").text = --nowTemp + "°";
        } else {
          tempTimer.invalidate();
        }
      } else {
        tempTimer.invalidate();
      }
    }
  });
}

module.exports = {
  request: request,
};
