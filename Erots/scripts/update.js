let ui = require('scripts/ui')
let utils = require('scripts/utils')

let appJsonUrl = "https://gitee.com/liuguogy/JSBox-addins/raw/master/Erots/app.json"
let updateDetailUrl = "https://gitee.com/liuguogy/JSBox-addins/raw/master/Erots/updateDetail.md"
let boxUrl = "https://gitee.com/liuguogy/JSBox-addins/raw/master/Erots/.output/Erots.box"

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

function getLatestBuild(now) {
  $http.download({
    url: appJsonUrl,
    showsProgress: false,
    timeout: 5,
    handler: function(resp) {
      if(resp.data) {
        let appJson = JSON.parse(resp.data.string)
        let updateBuild = appJson.build
        let updateVersion = appJson.version
        let force = appJson.force
        if(parseInt(updateBuild) > parseInt(getCurBuild())) {
          $http.download({
            url: updateDetailUrl,
            showsProgress: false,
            timeout: 5,
            handler: function(resp) {
              if(resp.data) {
                sureToUpdate(updateVersion, resp.data.string, force)
              }
            }
          })
        } else {
          if(now && $("mainView")) {
            ui.showToastView($("mainView"), utils.mColor.blue, "当前版本已是最新")
          }
        }
      }
    }
  })
}

async function checkUpdateNow() {
  let resp = await $http.download({
    url: appJsonUrl,
    showsProgress: false,
    timeout: 5,
  })
  if(resp.data) {
    let appJson = JSON.parse(resp.data.string)
    let updateBuild = appJson.build
    let updateVersion = appJson.version
    let force = appJson.force
    if(parseInt(updateBuild) > parseInt(getCurBuild())) {
      let resp2 = await $http.download({
        url: updateDetailUrl,
        showsProgress: false,
        timeout: 5,
      })
      if(resp2.data) {
        sureToUpdate(updateVersion, resp2.data.string, force)
      }
    } else {
      if($("mainView")) {
        ui.showToastView($("mainView"), utils.mColor.blue, "当前版本已是最新")
      }
    }
  }
}

//确定升级？
function sureToUpdate(version, des, force) {
  let actions = (force)?[{
    title: "立即更新",
    handler: function() {
      $ui.popToRoot();
      updateScript()
    }
  }]:[{
    title: "否",
    handler: function() {
      
    }
  },
  {
    title: "是",
    handler: function() {
      $ui.popToRoot();
      updateScript()
    }
  }]
  $ui.alert({
    title: "发现新版本 V" + version,
    message: "\n" + des + "\n\n是否更新？",
    actions: actions
  })
}

function updateScript() {
  const scriptName = $addin.current.name;
  let ui = require('scripts/ui')
  if($("mainView")) {
    ui.addProgressView($("mainView"), "开始更新...")
  }
  $http.download({
    url: boxUrl,
    showsProgress: false,
    timeout: 5,
    progress: function(bytesWritten, totalBytes) {
      var percentage = bytesWritten * 1.0 / totalBytes
      if($("myProgress")) {
        $("myProgress").locations = [0.0, percentage, percentage]
      }
    },
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
            if($("myProgressText")) {
              $("myProgressText").text = "更新完成"
            }
            $delay(1, ()=>{
              $addin.restart()
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
    getLatestBuild(now)
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
  checkUpdateNow: checkUpdateNow,
}