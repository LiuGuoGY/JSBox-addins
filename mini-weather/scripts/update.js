function getCurVersion() {
  let version = $file.exists("app.json")
    ? JSON.parse($file.read("app.json").string).version
    : "0.0.0";
  return version;
}

function getCurBuild() {
  let build = $file.exists("app.json")
    ? JSON.parse($file.read("app.json").string).build
    : "0";
  return build;
}

function getCurDate() {
  let date = $file.exists("app.json")
    ? JSON.parse($file.read("app.json").string).date
    : "000000";
  return date;
}

function getLatestBuild() {
  $http.download({
    url:
      "https://raw.githubusercontent.com/LiuGuoGY/JSBox-addins/master/mini-weather/app.json",
    showsProgress: false,
    timeout: 5,
    handler: function(resp) {
      if (resp.data) {
        let appJson = JSON.parse(resp.data.string);
        let updateBuild = appJson.build;
        let updateVersion = appJson.version;
        if (parseInt(updateBuild) > parseInt(getCurBuild())) {
          $http.download({
            url:
              "https://raw.githubusercontent.com/LiuGuoGY/JSBox-addins/master/mini-weather/updateDetail.md",
            showsProgress: false,
            timeout: 5,
            handler: function(resp) {
              if (resp.data) {
                sureToUpdate(updateVersion, resp.data.string);
              }
            }
          });
        } else {
          $cache.set("needToUpdate", false);
        }
      }
    }
  });
}

//确定升级？
function sureToUpdate(version, des) {
  $ui.alert({
    title: "发现新版本 V" + version,
    message: "\n" + des + "\n\n是否更新？",
    actions: [
      {
        title: "否",
        handler: function() {}
      },
      {
        title: "是",
        handler: function() {
          updateScript();
        }
      }
    ]
  });
}

function updateScript() {
  let url =
    "https://github.com/LiuGuoGY/JSBox-addins/blob/master/mini-weather/.output/MiniWeather.box?raw=true";
  const scriptName = $addin.current.name;
  $http.download({
    url: url,
    showsProgress: false,
    timeout: 5,
    handler: function(resp) {
      let box = resp.data;
      $addin.save({
        name: scriptName,
        data: box,
        handler: success => {
          if (success) {
            $cache.remove("lastCT");
            $cache.set("needToUpdate", false);
            $device.taptic(2);
            $delay(0.2, function() {
              $device.taptic(2);
            });
            $ui.alert({
              title: "安装完成",
              actions: [
                {
                  title: "OK",
                  handler: function() {
                    $addin.restart();
                  }
                }
              ]
            });
          }
        }
      });
    }
  });
}

function checkUpdate(now) {
  if (needCheckup() || now) {
    getLatestBuild();
  }
}

//需要检查更新？
function needCheckup() {
  let nDate = new Date();
  let lastCT = $cache.get("lastCT");
  if (lastCT == undefined) {
    $cache.set("lastCT", nDate);
    return true;
  } else {
    let tdoa = (nDate.getTime() - lastCT.getTime()) / (60 * 1000);
    let interval = 720;
    if ($app.env == $env.app) {
      interval = 30;
    }
    $console.info("离下次检测更新: " + (interval - tdoa) + "  分钟");
    if (tdoa > interval) {
      $cache.set("lastCT", nDate);
      return true;
    } else {
      return false;
    }
  }
}
module.exports = {
  checkUpdate: checkUpdate,
  getCurVersion: getCurVersion,
  getCurBuild: getCurBuild,
  getCurDate: getCurDate
};
