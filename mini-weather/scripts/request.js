let utils = require("scripts/utils");
let view = require("scripts/view");

function request() {
  $("locationIcon").hidden = false;
  if($objc("CLLocationManager").invoke("authorizationStatus") == 2) {
    if(utils.getCache("location")) {
      requestWeather(utils.getCache("location"))
    } else {
      fetchIPAddress()
    }
  } else {
    $location.fetch({
      handler: function(resp) {
        var lat = resp.lat;//纬度
        var lng = resp.lng;//经度
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

async function fetchIPAddress() {
  let resp = await $http.get({
    url: "http://www.taobao.com/help/getip.php"
  });
  let ip = resp.data.match(/"(\S*)"/)[1]
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
  getHeFengAirQuality();
  getHeFengLive(location.lng, location.lat);
  getHeFengForecast(location.lng, location.lat);
  // getCaiYun(location.lng, location.lat);
  getCaiYun2HoursForecast(location.lng, location.lat);
  // getMojiWeatherWarning(location.lng, location.lat);
  // getMojiWeatherAlert(location.lng, location.lat);
  getChinaWeather(location.lng, location.lat);
  // locTimer.invalidate();
  if($("locationIcon")) {
    $("locationIcon").hidden = true;
  }
}

// async function getWannianli(city) {
//   let resp = await $http.get({
//     url: "http://wthrcdn.etouch.cn/weather_mini?city=" + $text.URLEncode(city)
//   });
//   let data = resp.data;
//   if (data.status == 1000) {
//     setTemp(data.data.wendu);
//     setWeatherType(data.data.forecast[0].type);
//     setBgImage(data.data.forecast[0].type)
//   }
//   $console.info(data);
// }

async function getHeFengAirQuality() {
  let resp = await $http.get({
    url:
      "https://free-api.heweather.net/s6/air/now?location=auto_ip" + 
      "&key=63d9ae66c2844258895e1432ac452ef4"
  });
  let data = resp.data;
  $console.info(data);
  if (data.HeWeather6[0].status == "ok") {
    $("airQuality").text = "空气质量：" + data.HeWeather6[0].air_now_city.qlty;
    $cache.set("nowQlty", data.HeWeather6[0].air_now_city.qlty);
    return true
  }
}

async function getHeFengLive(lng, lat) {
  let resp = await $http.get({
    url:
      "https://free-api.heweather.net/s6/weather/now?location=" +
      lng + "," + lat +
      "&key=63d9ae66c2844258895e1432ac452ef4"
  });
  let data = resp.data;
  $console.info(data);
  if (data.HeWeather6[0].status == "ok") {
    setTemp(data.HeWeather6[0].now.tmp);
    setWeatherType(data.HeWeather6[0].now.cond_txt);
    setBgImage(data.HeWeather6[0].now.cond_txt)
    // $cache.set("nowWind", data.HeWeather6[0].now.wind_sc);
    // $("airQuality").text = "空气质量：" + utils.getCache("nowQlty", "无") + "  |  风力：" + data.HeWeather6[0].now.wind_sc + "级";
    return true
  } else {
    return false;
  }
}

async function getHeFengForecast(lng, lat) {
  let resp = await $http.get({
    url:
      "https://free-api.heweather.net/s6/weather/forecast?location=" +
      lng + "," + lat +
      "&key=63d9ae66c2844258895e1432ac452ef4"
  });
  let data = resp.data;
  $console.info(data);
  if (data.HeWeather6[0].status == "ok") {
    // setTemp(data.HeWeather6[0].now.tmp);
    // setWeatherType(data.HeWeather6[0].now.cond_txt);
    // setBgImage(data.HeWeather6[0].now.cond_txt)
    let listData = [];
    for(let i = 0; i < data.HeWeather6[0].daily_forecast.length; i++) {
      listData.push({
        list_mark: {
          hidden: i != 0,
        },
        list_date: {
          text: getDateString(i),
        },
        list_temp: {
          text: data.HeWeather6[0].daily_forecast[i].tmp_min + " ~ " + data.HeWeather6[0].daily_forecast[i].tmp_max + "℃",
        },
        list_weather: {
          text: data.HeWeather6[0].daily_forecast[i].cond_txt_d,
        },
        temp_average: (parseInt(data.HeWeather6[0].daily_forecast[i].tmp_max) + parseInt(data.HeWeather6[0].daily_forecast[i].tmp_min)) / 2
      })
    }
    $("forecastList").data = listData;
    $cache.set("forecastData", listData);
    $push.clear();
    if(utils.getCache("forcastRemind") || utils.getCache("tempRemind")) {
      for(let i = 1; i < listData.length; i++) {
        let isWeatherAbnormal = listData[i].list_weather.text.indexOf("雨") >= 0 || listData[i].list_weather.text.indexOf("雪") >= 0
        let temp_error = listData[i].temp_average - listData[i-1].temp_average
        let isTempAbnormal = temp_error >= 5 || temp_error <= -5
        if(isWeatherAbnormal || isTempAbnormal) {
          let updownString = (temp_error > 0)?"升高":"降低"
          let remindString = ((isWeatherAbnormal)?("天气可能是" + listData[i].list_weather.text + "，"):"") + ((isTempAbnormal)?("温度可能会" + updownString + " " + Math.abs(temp_error) + " °，"):"")
          let desDate = new Date()
          let nowDate = new Date()
          if(nowDate.getHours() >= 20 && i == 1) {
            let prevScheduleTime = utils.getCache("prevScheduleTime")
            //12小时内只提醒一次
            if(!prevScheduleTime || (prevScheduleTime && nowDate.getTime() - prevScheduleTime.getTime() >= 720 * 60000)) {
              $push.schedule({
                title: "Mini Weather 提示",
                body: "明天" + remindString + "请注意防范！轻触或重按查看详情",
                delay: 1,
                script: $addin.current.name,
                handler: function(result) {
                  $cache.set("prevScheduleTime", nowDate);
                }
              })
            }
          } else {
            desDate.setDate(nowDate.getDate() + i - 1)
            desDate.setHours(20)
            desDate.setMinutes(0)
            desDate.setSeconds(0)
            desDate.setMilliseconds(0)
            $push.schedule({
              title: "Mini Weather 提示",
              body: "明天" + remindString + "请注意防范！轻触或重按查看详情",
              date: desDate,
              script: $addin.current.name,
              handler: function(result) {
                
              }
            })
          }
        }
      }
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

async function getCaiYun2HoursForecast(lng, lat) {
  let resp = await $http.get({
    url: "https://api.caiyunapp.com/v2/Y2FpeXVuX25vdGlmeQ==/" + lng + "," + lat + "/forecast"
  });
  let data = resp.data;
  $console.info(data)
  if (data.status == "ok") {
    if(data.result.forecast_keypoint.indexOf("不会") < 0 && data.result.forecast_keypoint.indexOf("最近的") < 0) {
      $delay(1, function() {
        $ui.animate({
          duration: 0.4,
          damping: 0.8,
          animation: function() {
            $("airQuality").alpha = 0
          },
          completion: function() {
            let blank = "            "
            let size = $text.sizeThatFits({
              text: data.result.forecast_keypoint,
              width: 1000,
              font: $font("Lato-Medium", 13),
            })
            let needScroll = size.width > $("airQuality").frame.width
            if(needScroll) {
              size = $text.sizeThatFits({
                text: data.result.forecast_keypoint + blank,
                width: 1000,
                font: $font("Lato-Medium", 13),
              })
              $("airQuality").align = $align.left
              $("airQuality").remakeLayout(function(make) {
                make.centerY.equalTo(view.super)
                make.width.equalTo(size.width * 2)
                make.height.equalTo(20)
                make.left.inset(0)
              })
              $("airQuality").relayout()
              $("airQuality").text = data.result.forecast_keypoint + blank + data.result.forecast_keypoint + blank;
            } else {
              $("airQuality").text = data.result.forecast_keypoint;
            }
            $ui.animate({
              duration: 0.4,
              damping: 0.8,
              animation: function() {
                $("airQuality").alpha = 1
              },
              completion: function() {
                if(needScroll) {
                  scrollStart()
                  function scrollStart() {
                    $("airQuality").updateLayout(function(make) {
                      make.left.inset(0).offset(- size.width)
                    })
                    $ui.animate({
                      delay: 1,
                      options: 3 << 16,
                      duration: 0.1 * size.width,
                      animation: function() {
                        $("airQuality").relayout()
                      },
                      completion: function() {
                        $("airQuality").updateLayout(function(make) {
                          make.left.inset(0)
                        })
                        $("airQuality").relayout()
                        scrollStart()
                      }
                    })
                  }
                }
              }
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
    if(body && utils.getCache("disasterRemind")) {
      $push.schedule({
        id: "alarm",
        title: "气象灾害预警",
        body: body,
        delay: 1,
        script: $addin.current.name,
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
  let src = utils.getCardSrc(text, utils.getCache("nowQlty", "无"));
  if(src !== $("cardBgImage").src) {
    $("cardBgImage").src = src;
    $console.info($("cardBgImage").src + "-->" + src);
  }
  if($app.env == $env.app) {
    view.shadow($("card"), utils.getBgColor(src))
  }
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
