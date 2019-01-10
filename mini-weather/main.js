let utils = require("scripts/utils")
let update = require("scripts/update")

$ui.render("main");

let locTimer = $timer.schedule({
  interval: 0.2,
  handler: function() {
    if($("image[1]").hidden == false) {
      $("image[1]").hidden = true
    } else {
      $("image[1]").hidden = false
    }
  }
});

$location.fetch({
  handler: function(resp) {
    var lat = resp.lat
    var lng = resp.lng
    $http.get({
      url:
        "https://restapi.amap.com/v3/geocode/regeo?output=json&location=" + lng + "," + lat + "&key=cddd95953d25ad9d34d63b1823a21dcd",
      handler: function(resp) {
        var data = resp.data;
        $console.info(data);
        if(data.status == "1") {
          // getWannianli(data.regeocode.addressComponent.district)
          getAirQuality(data.regeocode.addressComponent.city)
          getHeFeng(data.regeocode.addressComponent.district)
          locTimer.invalidate()
          $("image[1]").hidden = true
        }
      }
    })
  }
})

if ($app.env == $env.app) {
  update.checkUpdate()
}

async function getWannianli(city) {
  let resp = await $http.get({
    url: "http://wthrcdn.etouch.cn/weather_mini?city=" + $text.URLEncode(city),
  });
  let data = resp.data;
  if (data.status == 1000) {
    $("label[0]").text = data.data.wendu + "°";
    $("label[1]").text = data.data.forecast[0].type;
    $cache.set("nowTemp", data.data.wendu);
    $cache.set("todayType", data.data.forecast[0].type);
    $("image[0]").src = utils.getCardSrc(data.data.forecast[0].type)
  }
  $console.info(data);
}

async function getAirQuality(city) {
  let resp = await $http.get({
    url: "https://free-api.heweather.net/s6/air/now?location=" + $text.URLEncode(city) + "&key=63d9ae66c2844258895e1432ac452ef4",
  });
  let data = resp.data;
  if(data.HeWeather6[0].status == "ok") {
    $("label[2]").text = "空气质量：" + data.HeWeather6[0].air_now_city.qlty;
    $cache.set("nowQlty", data.HeWeather6[0].air_now_city.qlty);
  }
  $console.info(data);
}

async function getHeFeng(city) {
  let resp = await $http.get({
    url: "https://free-api.heweather.net/s6/weather/now?location=" + $text.URLEncode(city) + "&key=63d9ae66c2844258895e1432ac452ef4",
  });
  let data = resp.data;
  if(data.HeWeather6[0].status == "ok") {
    $("label[0]").text = data.HeWeather6[0].now.tmp + "°";
    $("label[1]").text = data.HeWeather6[0].now.cond_txt;
    $cache.set("nowTemp", data.HeWeather6[0].now.tmp);
    $cache.set("todayType", data.HeWeather6[0].now.cond_txt);
    $("image[0]").src = utils.getCardSrc(data.HeWeather6[0].now.cond_txt)
  }
  $console.info(data);
}
