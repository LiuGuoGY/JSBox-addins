let utils = require('scripts/utils')
let ui = require('scripts/ui')

function show(objectId) {
  let app = {}
  let cloudApps = utils.getCache("cloudApps", [])
  for(let i = 0; i < cloudApps.length; i++) {
    if(cloudApps[i].objectId == objectId) {
      app = cloudApps[i];
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
        views: [ui.genAppShowView(app.appIcon, app.appName, (app.subtitle != "")?app.subtitle:app.appCate, buttonText, function(buttonView) {
          if(!app.needUpdate && app.haveInstalled) {
            $addin.run(app.appName)
          } else {
            $http.download({
              url: app.file,
              showsProgress: false,
              handler: function(resp) {
                let json = utils.getSearchJson(app.appIcon)
                let icon_code = (json.code)?json.code:"124";
                $addin.save({
                  name: app.appName,
                  data: resp.data,
                  icon: "icon_" + icon_code + ".png",
                });
                let cloudApps = utils.getCache("cloudApps", [])
                for(let j = 0; j < cloudApps.length; j++) {
                  if(cloudApps[j].objectId == app.objectId) {
                    cloudApps[j].haveInstalled = true
                    cloudApps[j].needUpdate = false
                  }
                }
                $cache.set("cloudApps", cloudApps);
                $app.notify({
                  name: "refreshAll",
                  object: {"a": "b"}
                });
                app.needUpdate = false
                app.haveInstalled = true
                buttonView.title = "打开"
                $device.taptic(2);
                $delay(0.2, ()=>{$device.taptic(2);})
              }
            })
          }
        })]
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
          views: ui.genAppPreviewPhotosView(app.previews, function(sender) {
            genAppPreviewPhotosScrollView(app.previews)
          }),
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

function genAppPreviewPhotosScrollView(photos) {
  let moveXOffsetOld,moveXOffsetNew;
  let items = []
  for(let i = 0; i < photos.length; i++) {
    items.push({
      type: "image",
      props: {
        src: photos[i],
        radius: 5,
        contentMode: $contentMode.scaleAspectFit,
        borderWidth: 1 / $device.info.screen.scale,
        borderColor: $color("#D0D0D0"),
      },
      layout: function(make, view) {
        make.centerY.equalTo(view.super)
        if(i == 0) {
          make.left.inset(25)
        } else {
          make.left.equalTo(view.prev.right).inset(13)
        }
        make.width.equalTo($device.info.screen.width - 50)
        make.height.equalTo(view.super).multipliedBy(0.9)
      },
    })
  }
  items.push({
    type: "view",
    layout: function(make, view) {
      make.centerY.equalTo(view.super)
      make.left.equalTo(view.prev.right)
      make.width.equalTo(25)
      make.height.equalTo(view.super).multipliedBy(0.9)
    }
  })
  $ui.push({
    props: {
      navBarHidden: true,
      statusBarStyle: 0,
    },
    views: [ui.genPageHeader("应用", "预览"), {
      type: "view",
      props: {
        bgcolor: $color("white"),
      },
      layout: function(make, view) {
        make.top.equalTo(view.prev.bottom).inset(0)
        make.left.right.inset(0)
        make.bottom.inset(0)
      },
      views: [{
        type: "scroll",
        props: {
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
        views: items,
        events: {
          willBeginDragging: function(sender) {
            moveXOffsetOld = sender.contentOffset.x;
          },
          willEndDragging: function(sender, decelerate) {
            moveXOffsetNew = sender.contentOffset.x;
          },
          willBeginDecelerating: function(sender) {
            let offsetChange = moveXOffsetNew - moveXOffsetOld
            let unit = (sender.contentSize.width - 40) / photos.length
            let x = Math.round(moveXOffsetOld / unit) * unit
            if(Math.abs(offsetChange) > 40) {
              x = (offsetChange > 0)? x + unit : x - unit
            }
            if(x < 0 || x > sender.contentSize.width - unit) {
              x = Math.round(moveXOffsetOld / unit) * unit
            }
            sender.scrollToOffset($point(x, 0))
          },
          didEndDragging: function(sender, decelerate) {
            let offsetChange = moveXOffsetNew - moveXOffsetOld
            let unit = (sender.contentSize.width - 40) / photos.length
            let x = Math.round(moveXOffsetOld / unit) * unit
            if(Math.abs(offsetChange) > 40) {
              x = (offsetChange > 0)? x + unit : x - unit
            }
            if(x < 0 || x > sender.contentSize.width - unit) {
              x = Math.round(moveXOffsetOld / unit) * unit
            }
            sender.scrollToOffset($point(x, 0))
          }
        }
      },]
    },]
  });
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