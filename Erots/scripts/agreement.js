let app = require("scripts/app");
let utils = require("scripts/utils");
let auth = require("scripts/auth");

function showAgreement() {
  let agreementMd5 = utils.getCache("agreementMd5", "");
  let fileString = $file.read("assets/使用协议.md").string;
  let fileMd5 = $text.MD5(fileString)
  if (agreementMd5 !== fileMd5) {
    $ui.render({
      props: {
        navBarHidden: true,
        statusBarStyle: 0,
        bgcolor: $color("white"), //(utils.getThemeMode() == "dark") ? $color("black") : $color("white"),
      },
      views: [{
        type: "markdown",
        props: {
          content: fileString,
        },
        layout: function (make, view) {
          make.centerX.equalTo(view.super)
          make.top.inset(20)
          make.width.equalTo(view.super)
          make.bottom.inset(45)
        }
      }, {
        type: "view",
        props: {
          bgcolor: $color("#F0F0F0"),
        },
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom)
          make.bottom.inset(0)
          make.left.right.inset(0)
        },
        views: [{
          type: "canvas",
          layout: function (make, view) {
            make.top.inset(0)
            make.height.equalTo(1 / $device.info.screen.scale)
            make.left.right.inset(0)
          },
          events: {
            draw: function (view, ctx) {
              var width = view.frame.width
              var scale = $device.info.screen.scale
              ctx.strokeColor = $color("gray")
              ctx.setLineWidth(1 / scale)
              ctx.moveToPoint(0, 0)
              ctx.addLineToPoint(width, 0)
              ctx.strokePath()
            }
          }
        }, {
          type: "button",
          props: {
            title: "不同意",
            titleColor: $color(utils.mColor.blue),
            bgcolor: $color("clear"),
            font: $font("bold", 17),
          },
          layout: function (make, view) {
            make.centerY.equalTo(view.super)
            make.left.inset(0)
            make.height.equalTo(view.super)
            make.width.equalTo(80)
          },
          events: {
            tapped: function(sender) {
              $app.close();
            }
          }
        }, {
          type: "button",
          props: {
            title: "同意",
            titleColor: $color(utils.mColor.blue),
            bgcolor: $color("clear"),
            font: $font("bold", 17),
          },
          layout: function (make, view) {
            make.centerY.equalTo(view.super)
            make.right.inset(0)
            make.height.equalTo(view.super)
            make.width.equalTo(80)
          },
          events: {
            tapped: function(sender) {
              $cache.set("agreementMd5", fileMd5);
              auth.start();
            }
          }
        }]
      },]
    });
  } else {
    auth.start();
  }
}

module.exports = {
  show: showAgreement,
};