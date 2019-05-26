let utils = require('scripts/utils')
let ui = require('scripts/ui')

function show(objectId) {
  let app = {}
  let cloudApps = utils.getCache("cloudApps", [])
  for(let i = 0; i < cloudApps.length; i++) {
    if(cloudApps[i].objectId == objectId) {
      app = cloudApps[i]
      break;
    }
  }
  $console.info(app);
  let buttonText = ""
  if(app.haveInstalled) {
    if(app.needUpdate) {
      buttonText = "更新"
    } else {
      buttonText = "打开"
    }
  } else {
    buttonText = "获取"
  }
  $ui.push({
    props: {
      navBarHidden: true,
      statusBarStyle: 0,
    },
    views: [ui.genPageHeader("主页", ""),{
      type: "scroll",
      props: {
        id: "appItemShowScroll",
      },
      layout: function(make, view) {
        make.left.right.bottom.inset(0)
        make.top.equalTo(view.prev.bottom)
        make.centerX.equalTo(view.super)
      },
      views: [{
        type: "view",
        layout: function(make, view) {
          make.left.right.inset(20)
          make.top.inset(10)
          make.height.equalTo(80)
          make.centerX.equalTo(view.super)
        },
        views: [ui.genAppShowView(app.appIcon, app.appName, (app.subtitle != "")?app.subtitle:app.appCate, buttonText, ()=>{})]
      },{
        type: "canvas",
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(1 / $device.info.screen.scale)
          make.left.right.inset(20)
        },
        events: {
          draw: function(view, ctx) {
            var width = view.frame.width
            var scale = $device.info.screen.scale
            ctx.strokeColor = $color("lightGray")
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      },{
        type: "view",
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom)
          let size = $text.sizeThatFits({
            text: app.versionInst,
            width: $device.info.screen.width - 40,
            font: $font(15),
            lineSpacing: 5, // Optional
          })
          make.height.equalTo(size.height + 80)
          make.left.right.inset(0)
        },
        views: [{
          type: "label",
          props: {
            text: "新功能",
            font: $font("bold", 22),
            align: $align.center,
            textColor: $color("black"),
          },
          layout: function(make, view) {
            make.top.inset(10)
            make.height.equalTo(40)
            make.left.inset(20)
          },
        },{
          type: "label",
          props: {
            text: "版本 " + app.appVersion,
            font: $font(14),
            align: $align.center,
            textColor: $color("gray"),
          },
          layout: function(make, view) {
            make.top.equalTo(view.prev.bottom)
            make.height.equalTo(25)
            make.left.inset(20)
          },
        },{
          type: "label",
          props: {
            text: app.versionInst,
            align: $align.left,
            lines: 0,
            font: $font(15),
            attributedText: setLineSpacing(app.versionInst, 5),
          },
          layout: function(make, view) {
            let size = $text.sizeThatFits({
              text: app.versionInst,
              width: $device.info.screen.width - 40,
              font: $font(15),
              lineSpacing: 5, // Optional
            })
            make.top.equalTo(view.prev.bottom).inset(5)
            make.height.equalTo(size.height)
            make.left.right.inset(20)
            make.centerX.equalTo(view.super)
          }
        }]
      },{
        type: "canvas",
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          if(app.previews.length > 0) {
            make.height.equalTo(1 / $device.info.screen.scale)
          } else {
            make.height.equalTo(0)
          }
          make.left.right.inset(20)
        },
        events: {
          draw: function(view, ctx) {
            var width = view.frame.width
            var scale = $device.info.screen.scale
            ctx.strokeColor = $color("lightGray")
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      },{
        type: "label",
        props: {
          text: "预览",
          font: $font("bold", 22),
          align: $align.center,
          textColor: $color("black"),
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(10)
          if(app.previews.length > 0) {
            make.height.equalTo(40)
          } else {
            make.height.equalTo(0)
          }
          make.left.inset(20)
        },
      },{
        type: "view",
        props: {
          id: "appPreviewPhotosScrollParent",
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(0)
          if(app.previews.length > 0) {
            make.height.equalTo(260)
          } else {
            make.height.equalTo(0)
          }
          make.left.right.inset(0)
        },
        views: [{
          type: "scroll",
          props: {
            id: "appPreviewPhotosScroll",
            contentSize: $size(app.previews.length*100, 260),
            alwaysBounceHorizontal: true,
            alwaysBounceVertical: false,
            userInteractionEnabled: true,
            showsHorizontalIndicator: false,
            showsVerticalIndicator: false,
          },
          layout: function(make, view) {
            make.center.equalTo(view.super)
            make.size.equalTo(view.super)
          },
          views: ui.genAppPreviewPhotosView(app.previews, ()=>{}),
        },]
      },{
        type: "canvas",
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(1 / $device.info.screen.scale)
          make.left.right.inset(20)
        },
        events: {
          draw: function(view, ctx) {
            var width = view.frame.width
            var scale = $device.info.screen.scale
            ctx.strokeColor = $color("lightGray")
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      },{
        type: "label",
        props: {
          text: app.instruction,
          align: $align.left,
          lines: 0,
          font: $font(15),
          attributedText: setLineSpacing(app.instruction, 5),
        },
        layout: function(make, view) {
          let size = $text.sizeThatFits({
            text: app.instruction,
            width: $device.info.screen.width - 40,
            font: $font(15),
            lineSpacing: 5, // Optional
          })
          make.top.equalTo(view.prev.bottom).inset(20)
          make.height.equalTo(size.height)
          make.left.right.inset(20)
          make.centerX.equalTo(view.super)
        }
      },{
        type: "canvas",
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          make.height.equalTo(1 / $device.info.screen.scale)
          make.left.right.inset(20)
        },
        events: {
          draw: function(view, ctx) {
            var width = view.frame.width
            var scale = $device.info.screen.scale
            ctx.strokeColor = $color("lightGray")
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      },{
        type: "label",
        props: {
          text: "信息",
          font: $font("bold", 22),
          align: $align.center,
          textColor: $color("black"),
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(50)
          make.left.inset(20)
        },
      },{
        type: "view",
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom)
          make.height.equalTo(40)
          make.left.right.inset(20)
        },
        views: [{
          type: "label",
          props: {
            text: "开发者",
            align: $align.left,
            font: $font(14),
            textColor: $color("gray"),
          },
          layout: function(make, view) {
            make.top.inset(0)
            make.height.equalTo(20)
            make.left.inset(0)
            make.centerY.equalTo(view.super)
          }
        },{
          type: "label",
          props: {
            text: (app.author)?app.author:"无",
            align: $align.right,
            font: $font(14),
            textColor: $color("black"),
          },
          layout: function(make, view) {
            make.top.inset(0)
            make.height.equalTo(20)
            make.right.inset(0)
            make.width.equalTo(100)
            make.centerY.equalTo(view.super)
          }
        },{
          type: "canvas",
          layout: function(make, view) {
            make.bottom.inset(0)
            make.height.equalTo(1 / $device.info.screen.scale)
            make.left.right.inset(0)
          },
          events: {
            draw: function(view, ctx) {
              var width = view.frame.width
              var scale = $device.info.screen.scale
              ctx.strokeColor = $color("#D0D0D0")
              ctx.setLineWidth(1 / scale)
              ctx.moveToPoint(0, 0)
              ctx.addLineToPoint(width, 0)
              ctx.strokePath()
            }
          }
        }]
      },{
        type: "view",
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom)
          make.height.equalTo(40)
          make.left.right.inset(20)
        },
        views: [{
          type: "label",
          props: {
            text: "类别",
            align: $align.left,
            font: $font(14),
            textColor: $color("gray"),
          },
          layout: function(make, view) {
            make.top.inset(0)
            make.height.equalTo(20)
            make.left.inset(0)
            make.centerY.equalTo(view.super)
          }
        },{
          type: "label",
          props: {
            text: app.appCate,
            align: $align.right,
            font: $font(14),
            textColor: $color("black"),
          },
          layout: function(make, view) {
            make.top.inset(0)
            make.height.equalTo(20)
            make.right.inset(0)
            make.width.equalTo(100)
            make.centerY.equalTo(view.super)
          }
        },{
          type: "canvas",
          layout: function(make, view) {
            make.bottom.inset(0)
            make.height.equalTo(1 / $device.info.screen.scale)
            make.left.right.inset(0)
          },
          events: {
            draw: function(view, ctx) {
              var width = view.frame.width
              var scale = $device.info.screen.scale
              ctx.strokeColor = $color("#D0D0D0")
              ctx.setLineWidth(1 / scale)
              ctx.moveToPoint(0, 0)
              ctx.addLineToPoint(width, 0)
              ctx.strokePath()
            }
          }
        }]
      }]
    },]
  });
  $("appItemShowScroll").resize()
  $("appItemShowScroll").contentSize = $size(0, $("appItemShowScroll").contentSize.height + 50)
  $("appPreviewPhotosScroll").resize()
  $("appPreviewPhotosScroll").contentSize = $size($("appPreviewPhotosScroll").contentSize.width + 20, 0)
}

function setLineSpacing(text, spacing) {
  var attrText = $objc("NSMutableAttributedString").invoke("alloc").invoke("initWithString", text);
  var style = $objc("NSMutableParagraphStyle").invoke("alloc.init");
  style.invoke("setLineSpacing", spacing);
  attrText.invoke("addAttribute:value:range:", "NSParagraphStyle", style, $range(0, text.length));
  return attrText.rawValue();
}

module.exports = {
  show: show,
}