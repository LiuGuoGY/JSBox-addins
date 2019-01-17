let utils = require("scripts/utils");
let view = require("scripts/view");
let locTimer;

function request() {
  locTimer = $timer.schedule({
    interval: 0.2,
    handler: function() {
      if ($("locationIcon").hidden == false) {
        $("locationIcon").hidden = true;
      } else {
        $("locationIcon").hidden = false;
      }
    }
  });
  if($objc("CLLocationManager").invoke("authorizationStatus") == 2) {
    if(utils.getCache("location")) {
      requestWeather(utils.getCache("location"))
    } else {
      fetchIPAddress()
    }
  } else {
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
              let location = {
                lat: lat,
                lng: lng,
                province: data.regeocode.addressComponent.province,
                city: data.regeocode.addressComponent.city,
                district: data.regeocode.addressComponent.district,
              }
              $cache.set("location", location);
              requestWeather(location)
            }
          }
        });
      }
    });
  }
}

// async function parseXML(city) {
//   let xml = $file.read("assets/city.xml").string;
//   let doc = $xml.parse({
//     string: xml, // Or data: data
//     mode: "xml", // Or "html", default to xml
//   });
//   let rootElement = doc.rootElement;
//   $console.info(rootElement.children({
//     "tag": "name",
//   }));//rootElement.children()[0].children()[1].string
//   let length = rootElement.children().length;
//   // for(let i = 0; i < length; i++) {
//   //   if(city == rootElement.children()[i].children()[1].string) {
//   //     return rootElement.children()[i].children()[0].string
//   //   }
//   // }
// }

async function fetchIPAddress() {
  let resp = await $http.get({
    url: "http://www.taobao.com/help/getip.php"
  });
  let ip = resp.data.match(/\"(\S*)\"/)[1]
  let resp2 = await $http.get({
    url: "http://ip-api.com/json/" + ip + "?lang=zh-CN",
  });
  let data = resp2.data;
  $console.info(data);
  if(data.status == "success") {
    let location = {
      lat: data.lat,
      lng: data.lon,
      province: data.regionName,
      city: data.city,
      district: "",
    }
    requestWeather(location)
  }
}

function requestWeather(location) {
  // getWannianli(location.district)
  getHeFengAirQuality(location.province, location.city);
  getHeFengLive(location.province, location.city, location.district);
  getHeFengForecast(location.province, location.city, location.district);
  // getCaiYun(location.lng, location.lat);
  // getCaiYunForecast(location.lng, location.lat);
  getMojiWeatherWarning(location.lng, location.lat);
  // getMojiWeatherAlert(location.lng, location.lat);
  getChinaWeather(location.lng, location.lat);
  locTimer.invalidate();
  $("locationIcon").hidden = true;
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

async function getHeFengAirQuality(province, city) {
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
      return await get(array, index + 1);
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
      return await get(array, index + 1);
    }
  }
}

async function getHeFengLive(province, city, district) {
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
      return await get(array, index + 1);
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
      return await get(array, index + 1);
    }
  }
}

async function getHeFengForecast(province, city, district) {
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
      return await get(array, index + 1);
    }
    let resp = await $http.get({
      url:
        "https://free-api.heweather.net/s6/weather/forecast?location=" +
        $text.URLEncode(array[index]) +
        "&key=63d9ae66c2844258895e1432ac452ef4"
    });
    let data = resp.data;
    $console.info(data);
    if (data.HeWeather6[0].status == "ok") {
      // setTemp(data.HeWeather6[0].now.tmp);
      // setWeatherType(data.HeWeather6[0].now.cond_txt);
      // setBgImage(data.HeWeather6[0].now.cond_txt)
      let listData = [];
      listData.push({
        list_mark: {
          hidden: false,
        },
        list_date: {
          text: getDateString(0),
        },
        list_temp: {
          text: data.HeWeather6[0].daily_forecast[0].tmp_min + " ~ " + data.HeWeather6[0].daily_forecast[0].tmp_max + "℃",
        },
        list_weather: {
          text: data.HeWeather6[0].daily_forecast[0].cond_txt_d,
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
          text: data.HeWeather6[0].daily_forecast[1].tmp_min + " ~ " + data.HeWeather6[0].daily_forecast[1].tmp_max + "℃",
        },
        list_weather: {
          text: data.HeWeather6[0].daily_forecast[1].cond_txt_d,
        }
      })
      $("forecastList").data = listData;
      $cache.set("forecastData", listData);
      return true
    } else {
      return await get(array, index + 1);
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
    
    // let listData = [];
    // listData.push({
    //   list_mark: {
    //     hidden: false,
    //   },
    //   list_date: {
    //     text: getDateString(0),
    //   },
    //   list_temp: {
    //     text: Math.floor(data.result.daily.temperature[0].min) + " ~ " + Math.floor(data.result.daily.temperature[0].max) + "℃",
    //   },
    //   list_weather: {
    //     text: "——",
    //   }
    // });
    // listData.push({
    //   list_mark: {
    //     hidden: true,
    //   },
    //   list_date: {
    //     text: getDateString(1),
    //   },
    //   list_temp: {
    //     text: Math.floor(data.result.daily.temperature[1].min) + " ~ " + Math.floor(data.result.daily.temperature[1].max) + "℃",
    //   },
    //   list_weather: {
    //     text: "——",
    //   }
    // })
    // $("forecastList").data = listData;
    // $cache.set("forecastData", listData);
  }
}

async function getMojiWeatherWarning(lng, lat) {
  let resp = await $http.post({
    url: "https://mprg.moji.com/data/short/get",
    header: {
      "Content-Type": "application/json",
      "X-Access-Token": "f06bc72f3e7df2ea95c2cb43508d41f60056d860",
    },
    body: {
      "common": {
      "platform": "ios_wechat",
      "uid": 1457521
      },
      "params": {
      "lat": lat,
      "lon": lng,
      },
      "constant": {
      "versionCode": 33020701,
      "channelCode": 8100
      }
    },
  });
  let data = resp.data;
  $console.info(data)
  if(data.rc.p == "success") {
    if(data.radarData.banner.indexOf("不会") < 0) {
      $delay(0.5, function() {
        $ui.animate({
          duration: 0.4,
          damping: 0.8,
          animation: function() {
            $("airQuality").alpha = 0
          },
          completion: function() {
            $("airQuality").text = data.radarData.banner;
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
  }
}

async function getChinaWeather(lng, lat) {
  let resp = await $http.get({
    url: "https://mpv2.weather.com.cn/?lat=" + lat + "&lng=" + lng,
    header: {
      "Content-Type": "application/json",
    },
  });
  let data = resp.data;
  $console.info(data)
  let nowDay = new Date().getDate();
  if(utils.getCache("pushDay") != nowDay) { // 气象灾害
    let body = undefined;
    if(data.station != "") {
      let alarm = data.alarm[data.station]["1001003"]
      if(alarm != null) {
        for(let i = 0; i < alarm.length; i++) {
          if(!body) {
            body = alarm[i]["009"];
          } else {
            body = body + "\n" + alarm[i]["009"];
          }
        }
      }
    }
    if(body) {
      $push.schedule({
        id: "alarm",
        title: "气象灾害预警",
        body: body,
        delay: 1,
        query: data.alarm[data.station]["1001003"],
        handler: function(result) {
          $cache.set("pushDay", nowDay);
        }
      })
    }
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
