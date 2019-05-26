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

function getLatestVersion() {
  $http.download({
    url: "https://raw.githubusercontent.com/LiuGuoGY/JSBox-addins/master/launch-center-new/app.json",
    showsProgress: false,
    timeout: 5,
    handler: function(resp) {
      if(resp.data) {
        let updateVersion = JSON.parse(resp.data.string).version
        if(needUpdate(updateVersion, getCurVersion())) {
          $http.download({
            url: "https://raw.githubusercontent.com/LiuGuoGY/JSBox-addins/master/launch-center-new/updateDetail.md",
            showsProgress: false,
            timeout: 5,
            handler: function(resp) {
              if(resp.data) {
                sureToUpdate(updateVersion, resp.data.string)
              }
            }
          })
        }
      }
    }
  })
}

function getLatestBuild() {
  $http.download({
    url: "https://raw.githubusercontent.com/LiuGuoGY/JSBox-addins/master/Erots/app.json",
    showsProgress: false,
    timeout: 5,
    handler: function(resp) {
      if(resp.data) {
        let appJson = JSON.parse(resp.data.string)
        let updateBuild = appJson.build
        let updateVersion = appJson.version
        if(parseInt(updateBuild) > parseInt(getCurBuild())) {
          $http.download({
            url: "https://raw.githubusercontent.com/LiuGuoGY/JSBox-addins/master/Erots/updateDetail.md",
            showsProgress: false,
            timeout: 5,
            handler: function(resp) {
              if(resp.data) {
                sureToUpdate(updateVersion, resp.data.string)
              }
            }
          })
        }
      }
    }
  })
}

//确定升级？
function sureToUpdate(version, des) {
  $ui.alert({
    title: "发现新版本 V" + version,
    message: "\n" + des + "\n\n是否更新？",
    actions: [{
        title: "否",
        handler: function() {
          
        }
      },
      {
        title: "是",
        handler: function() {
          updateScript()
        }
      },
    ]
  })
}

function updateScript() {
  let url =
    "https://github.com/LiuGuoGY/JSBox-addins/raw/master/Erots/.output/Erots.box?raw=true";
  const scriptName = $addin.current.name;
  $http.download({
    url: url,
    showsProgress: false,
    timeout: 5,
    handler: function(resp) {
      let box = resp.data
      $addin.save({
        name: scriptName,
        data: box,
        handler: success => {
          if (success) {
            $cache.remove("lastCT")
            $device.taptic(2)
            $delay(0.2, function() {
              $device.taptic(2)
            })
            $ui.alert({
              title: "安装完成",
              actions: [{
                title: "OK",
                handler: function() {
                  $app.openExtension($addin.current.name)
                }
              }]
            })
          }
        }
      });
    }
  })
}

function needUpdate(nv, ov) {
  let getVersionWeight = i => {
    return i
      .split(".")
      .map(i => i * 1)
      .reduce((s, i) => s * 100 + i);
  };
  return getVersionWeight(nv) > getVersionWeight(ov);
}

function checkUpdate(now) {
  if(needCheckup() || now) {
    getLatestBuild()
  }
}

//需要检查更新？
function needCheckup() {
  let nDate = new Date()
  let lastCT = $cache.get("lastCT")
  if (lastCT == undefined) {
    $cache.set("lastCT", nDate)
    return true
  } else {
    let tdoa = (nDate.getTime() - lastCT.getTime()) / (60 * 1000)
    let interval = 1440
    if ($app.env == $env.app) {
      interval = 1
    }
    $console.info("离下次检测更新: " + (interval - tdoa) + "  分钟")
    if (tdoa > interval) {
      $cache.set("lastCT", nDate)
      return true
    } else {
      return false
    }
  }
}

module.exports = {
  checkUpdate: checkUpdate,
  getCurVersion: getCurVersion,
  getCurBuild: getCurBuild,
  getCurDate: getCurDate,
}