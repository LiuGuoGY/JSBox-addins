let utils = require('scripts/utils')
let ui = require('scripts/ui')
let api = require('scripts/api')

function installApp(app, buttonView, handler) {
  buttonView.userInteractionEnabled = false
  buttonView.title = ""
  buttonView.updateLayout(function (make, view) {
    make.size.equalTo($size(30, 30))
  })
  let progress = 0.2;
  $ui.animate({
    duration: 0.2,
    animation: function () {
      buttonView.relayout()
    },
    completion: function () {
      $ui.animate({
        duration: 0.1,
        animation: function () {
          buttonView.bgcolor = $color("clear")
        },
      })
      buttonView.add({
        type: "canvas",
        layout: (make, view) => {
          make.center.equalTo(view.super)
          make.size.equalTo($size(30, 30))
        },
        events: {
          draw: (view, ctx) => {
            ctx.strokeColor = utils.themeColor.appButtonBgColor,
              ctx.setLineWidth(2.5)
            ctx.addArc(15, 15, 14, 0, progress * 2 * Math.PI)
            ctx.strokePath()
          }
        },
      })
      let radius = 0;
      let timer = $timer.schedule({
        interval: 0.01,
        handler: function () {
          let canvas = buttonView.get("canvas")
          if (canvas) {
            canvas.rotate(radius);
            radius = radius + Math.PI / 180 * 6
            canvas.ocValue().invoke("setNeedsDisplay");
          } else {
            timer.invalidate()
          }
        }
      });
      $http.download({
        url: app.file,
        showsProgress: false,
        progress: function(bytesWritten, totalBytes) {
          var percentage = bytesWritten * 1.0 / totalBytes;
          progress = 0.2 + percentage * 0.8;
        },
        handler: function (resp) {
          let json = utils.getSearchJson(app.appIcon)
          let icon_code = (json.code) ? json.code : "124";
          utils.saveAddin(app.appName, "icon_" + icon_code + ".png", resp.data);
          if (app.needUpdate && app.haveInstalled) {
            utils.addUpdateApps(app.objectId);
          }
          let cloudApps = utils.getCache("cloudApps", [])
          for (let j = 0; j < cloudApps.length; j++) {
            if (cloudApps[j].objectId == app.objectId) {
              cloudApps[j].haveInstalled = true
              cloudApps[j].needUpdate = false
            }
          }
          $cache.set("cloudApps", cloudApps);
          $ui.animate({
            duration: 0.1,
            animation: function () {
              buttonView.bgcolor = utils.themeColor.appButtonBgColor
            },
            completion: function () {
              buttonView.get("canvas").remove()
              buttonView.updateLayout(function (make, view) {
                make.size.equalTo($size(75, 30))
              })
              $delay(0.1, ()=>{
                buttonView.title = "打开"
              })
              $ui.animate({
                duration: 0.2,
                animation: function () {
                  buttonView.relayout()
                },
                completion: function () {
                  api.uploadDownloadTimes(app.objectId)
                  app.needUpdate = false
                  app.haveInstalled = true
                  buttonView.userInteractionEnabled = true
                  handler();
                }
              })
            }
          })
        }
      })
    }
  })
}

function isOSSuit(app) {
  return parseInt($device.info.version) >= app.needIOSVersion
}

module.exports = {
  installApp: installApp,
  isOSSuit: isOSSuit,
}