let utils = require('scripts/utils')

function showToastView(view, color, text, duration) {
  let time = new Date().getTime()
  let topInset = view.frame.height / 10
  let textSize = $text.sizeThatFits({
    text: text,
    width: view.width,
    font: $font(15),
  })
  if(duration === undefined) {
    duration = text.length / 5
  }
  let showView = {
    type: "view",
    props: {
      id: "toastView",
      bgcolor: $color("clear"),
      alpha: 0,
      userInteractionEnabled: false,
      info: time,
    },
    layout: function(make, view) {
      make.centerX.equalTo(view.super)
      make.top.inset(topInset)
      make.width.equalTo(textSize.width + 60)
      make.height.equalTo(30)
    },
    views: [{
      type: "blur",
      props: {
        style: utils.themeColor.blurType,
        radius: 5,
      },
      layout: $layout.fill
    },{
      type: "image",
      props: {
        icon: $icon("009", $color(color), $size(16, 16)),
        bgcolor: $color("clear"),
      },
      layout: function(make, view) {
        make.centerY.equalTo(view.super)
        make.size.equalTo($size(16, 16))
        make.left.inset(10)
      }
    },{
      type: "view",
      layout: function(make, view) {
        make.centerY.equalTo(view.super)
        make.left.equalTo(view.prev.right).inset(0)
        make.right.inset(10)
        make.height.equalTo(view.super)
      },
      views: [{
        type: "label",
        props: {
          text: text,
          bgcolor: $color("clear"),
          textColor: utils.themeColor.listHeaderTextColor,
          font: $font(15),
        },
        layout: function(make, view) {
          make.center.equalTo(view.super)
        },
      }]
    }]
  }
  if($("toastView") != undefined) {
    $("toastView").remove()
  }
  view.add(showView)
  let fView = $("toastView")
  if(fView == undefined) {
    return 0
  }
  fView.relayout()
  fView.updateLayout(function(make) {
    make.top.inset(topInset + 20)
  })
  $ui.animate({
    duration: 0.4,
    animation: function() {
      fView.alpha = 1.0
      fView.relayout()
    },
    completion: function() {
      $delay(duration, function() {
        let fView = $("toastView")
        if(fView == undefined) {
          return 0
        } else if(fView.info != time) {
          return 0
        }
        fView.updateLayout(function(make) {
          make.top.inset(topInset)
        })
        $ui.animate({
          duration: 0.4,
          animation: function() {
            fView.alpha = 0.0
            fView.relayout()
          },
          completion: function() {
            if(fView != undefined) {
              fView.remove()
            }
          }
        })
      })
    }
  })
}

function addButtonMore(items) {
  items.push({
    title: {
      text: "更多"
    },
    icon: {
      src: "assets/more.png"
    },
    url: "jsbox://run?name=" + encodeURI($addin.current.name + "&action=more"),
  })
  return items
}

function showBannedAlert() {
  $ui.alert({
    title: "Warning",
    message: "You have been banned!",
    actions: [
      {
        title: "OK",
        handler: function() {
          $app.close()
        }
      },
    ]
  })
}

function genPageHeader(backName, title, rightView) {
  let view = {
    type: "view",
    layout: function(make, view) {
      make.left.top.right.inset(0)
      if ($device.info.version >= "11") {
        make.bottom.equalTo(view.super.topMargin).offset(35)
      } else {
        make.height.equalTo(60)
      }
    },
    views:[{
      type: "view",
      layout: function (make, view) {
        make.left.bottom.right.inset(0)
        make.height.equalTo(45)
      },
      views:[{
        type: "label",
        props: {
          text: title,
          font: $font("bold", 17),
          align: $align.center,
          bgcolor: utils.themeColor.mainColor,
          textColor: utils.themeColor.listHeaderTextColor,
        },
        layout: $layout.fill,
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
            ctx.strokeColor = utils.themeColor.appObviousColor
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      },{
        type: "button",
        props: {
          bgcolor: $color("clear"),
        },
        layout: function(make, view) {
          make.left.inset(0)
          make.width.equalTo(100)
          make.height.equalTo(view.super)
        },
        events: {
          tapped: function(sender) {
            $ui.pop()
          },
        },
        views:[{
          type: "view",
          props: {
            bgcolor: $color("clear"),
          },
          layout: function(make, view) {
            make.left.inset(10)
            make.centerY.equalTo(view.super)
            make.size.equalTo($size(12.5, 21))
          },
          views: [createBack(utils.getCache("themeColor"))]
        },{
          type: "label",
          props: {
            text: backName,
            align: $align.center,
            textColor: utils.getCache("themeColor"),
            font: $font(17)
          },
          layout: function(make, view) {
            make.height.equalTo(view.super)
            make.left.equalTo(view.prev.right).inset(3)
          }
        }],
      },{
        type: "view",
        props: {
          bgcolor: $color("clear"),
        },
        layout: function(make, view) {
          make.right.inset(20)
          make.height.equalTo(view.super)
          make.width.equalTo(50)
        },
        views: [rightView?rightView:{}]
      }],
    },]
  }
  return view
}

function createBack(color) {
  let view = {
    type: "canvas",
    layout: $layout.fill,
    events: {
      draw: function(view, ctx) {
        ctx.fillColor = color
        ctx.strokeColor = color
        ctx.allowsAntialiasing = true
        ctx.setLineCap(1)
        ctx.setLineWidth(3)
        ctx.moveToPoint(view.frame.width - 2, 2)
        ctx.addLineToPoint(2, view.frame.height / 2)
        ctx.addLineToPoint(view.frame.width - 2, view.frame.height - 2)
        ctx.strokePath()
      }
    }
  }
  return view
}

function createEnter(color) {
  let view = {
    type: "canvas",
    layout: $layout.fill,
    events: {
      draw: function(view, ctx) {
        ctx.fillColor = color
        ctx.strokeColor = color
        ctx.allowsAntialiasing = true
        ctx.setLineCap(1)
        ctx.setLineWidth(1.5)
        ctx.moveToPoint(2, 2)
        ctx.addLineToPoint(view.frame.width - 2, view.frame.height / 2)
        ctx.addLineToPoint(2, view.frame.height - 2)
        ctx.strokePath()
      }
    }
  }
  return view
}

function selectIcon(action) {
  var iconHandler = $block("void, NSString *", function(icon) {
    var text = icon.rawValue()
    var format = text.match(/\d+/)[0]
    action(format)
  })

  var icons = $objc("AddinIconPicker").invoke("alloc.init")
  icons.invoke("setCompletionHandler", iconHandler)
  icons.invoke("show")
}

function createRight(color, lineWidth) {
  let view = {
    type: "canvas",
    props: {
      clipsToBounds: false,
    },
    layout: $layout.fill,
    events: {
      draw: function(view, ctx) {
        ctx.fillColor = color
        ctx.strokeColor = color
        ctx.allowsAntialiasing = true
        ctx.setLineCap(1)
        ctx.setLineWidth(lineWidth)
        ctx.moveToPoint(2, view.frame.height / 2)
        ctx.addLineToPoint(view.frame.width / 2.5, view.frame.height - 2)
        ctx.addLineToPoint(view.frame.width - 2, 2)
        ctx.strokePath()
      }
    }
  }
  return view
}

function genIconView(icon) {
  let iconView = {}
  if(icon.startsWith("erots")) {
    let json = utils.getSearchJson(icon)
    if(json.mode == "0" || json.mode == "1") {
      let bgcolor = $color("clear")
      let fontcolor = $color("#" + json.color)
      if(json.mode == "1") {
        bgcolor = $color("#" + json.color)
        fontcolor = $color("white")
      }
      iconView = {
        type: "view",
        props: {
          bgcolor: (json.mode == "1")?bgcolor:$color("white"),
        },
        layout: function(make, view) {
          make.size.equalTo(view.super)
          make.center.equalTo(view.super)
        },
        views: [{
          type: "image",
          props: {
            icon: $icon(json.code, fontcolor, $size(90, 90)),
            bgcolor: bgcolor,
          },
          layout: function(make, view) {
            make.size.equalTo(view.super).multipliedBy(7/12)
            make.center.equalTo(view.super)
          },
        }]
      }
    } else if(json.mode == "2" || json.mode == "3") {
      let bgcolor = $color("white")
      let fontcolor = $color("#" + json.color)
      iconView = {
        type: "view",
        props: {
          bgcolor: (json.mode == "3")?fontcolor:bgcolor,
        },
        layout: function(make, view) {
          make.size.equalTo(view.super)
          make.center.equalTo(view.super)
        },
        views: [{
          type: "view",
          props: {
            bgcolor: (json.mode == "3")?bgcolor:fontcolor,
            circular: true,
          },
          layout: function(make, view) {
            make.size.equalTo(view.super).multipliedBy(5/6)
            make.center.equalTo(view.super)
          },
          views: [{
            type: "image",
            props: {
              icon: $icon(json.code, (json.mode == "3")?fontcolor:bgcolor, $size(90, 90)),
              bgcolor: (json.mode == "3")?bgcolor:fontcolor,
            },
            layout: function(make, view) {
              make.size.equalTo(view.super).multipliedBy(3/5)
              make.center.equalTo(view.super)
            },
          }]
        }]
      }
    }
  } else {
    iconView = {
      type: "image",
      props: {
        src: icon,
        bgcolor: $color("white"),
      },
      layout: function(make, view) {
        make.size.equalTo(view.super)
        make.center.equalTo(view.super)
      },
    }
  }
  return iconView
}

function genAppShowView(icon, name, cate, buttonText, buttonFunction, moreJson) {
  let view = {
    type: "view",
    layout: function(make, view) {
      make.left.right.inset(0)
      make.top.inset(0)
      make.height.equalTo(70)
      make.center.equalTo(view.super)
    },
    views: [{
      type: "view",
      props: {
        borderColor: utils.themeColor.iconBorderColor,
        borderWidth: 0.8,
        smoothRadius: 12,
      },
      layout: function(make, view) {
        make.centerY.equalTo(view.super)
        make.left.inset(0)
        make.size.equalTo($size(60, 60))
      },
      views: [genIconView(icon)]
    }, {
      type: "view",
      layout: function(make, view) {
        make.centerY.equalTo(view.super)
        make.right.inset(0)
        make.width.equalTo(75)
        make.height.equalTo(view.super)
      },
      views: [{
        type: "button",
        props: {
          title: buttonText,
          bgcolor: utils.themeColor.appButtonBgColor,
          titleColor: (moreJson && moreJson.textColor)?moreJson.textColor:utils.getCache("themeColor"),
          font: $font("bold", 15),
          radius: 15,
          align: $align.center,
        },
        layout: function(make, view) {
          make.center.equalTo(view.super)
          make.size.equalTo($size(75, 30))
        },
        events: {
          tapped: function(sender) {
            buttonFunction(sender)
          }
        },
      },{
        type: "label",
        props: {
          text: (moreJson && moreJson.hintText)?moreJson.hintText:"",
          font: $font(10),
          textColor: utils.themeColor.appCateTextColor,
          align: $align.center,
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(3)
          make.centerX.equalTo(view.super)
        }
      }]
    },{
      type: "label",
      props: {
        text: name,
        font: $font("PingFangSC-Regular", 15.5),
        textColor: utils.themeColor.listHeaderTextColor,
        align: $align.left,
      },
      layout: function(make, view) {
        make.left.equalTo(view.prev.prev.right).inset(10)
        make.right.equalTo(view.prev.left).inset(10)
        make.centerY.equalTo(view.super).offset(-10)
      }
    },{
      type: "label",
      props: {
        text: cate,
        font: $font(13),
        textColor: utils.themeColor.appCateTextColor,
        align: $align.left,
      },
      layout: function(make, view) {
        make.left.equalTo(view.prev.left)
        make.right.equalTo(view.prev)
        make.top.equalTo(view.prev.bottom).inset(3)
      }
    }]
  }
  return view
}

function genAppPreviewPhotosStack(photos, tappedHandler, longPressedHandler) {
  let photosViews = []
  for(let i = 0; i < photos.length; i++) {
    photosViews.push({
      type: "image",
      props: {
        src: photos[i],
        align: $align.center,
        bgcolor: $color("clear"),
        borderWidth: 1,
        borderColor: utils.themeColor.iconBorderColor,
        radius: 4,
        info: i,
      },
      events: {
        tapped: function(sender) {
          if(tappedHandler) {
            tappedHandler(sender)
          }
        },
        longPressed: function(sender) {
          if(longPressedHandler) {
            longPressedHandler(sender.sender.info)
          }
        },
      },
    })
  }
  return {
    type: "stack",
    props: {
      spacing: 10,
      distribution: $stackViewDistribution.fillEqually,
      axis: $stackViewAxis.horizontal,
      stack: {
        views: photosViews,
      }
    },
    layout: function(make, view) {
      make.left.inset(20)
      make.top.inset(10)
      make.width.equalTo(photos.length * 140)
      make.height.equalTo(240)
    },
  }
}

function addProgressView(superView, text) {
  superView.add({
    type: "blur",
    props: {
      id: "myProgressParent",
      style: utils.themeColor.blurType,
      alpha: 0,
    },
    layout: $layout.fill,
    views: [{
      type: "view",
      props: {
        bgcolor: $color("clear"),
        clipsToBounds: 0
      },
      layout: function (make, view) {
        make.centerX.equalTo(view.super)
        make.centerY.equalTo(view.super).offset(-20)
        make.size.equalTo($size(300, 15))
        progress_shadow(view)
      },
      views: [{
        type: "gradient",
        props: {
          id: "myProgress",
          circular: 1,
          colors: [$color("#d4fc79"), $color("#96e6a1"), $color("white")],
          locations: [0.0, 0.0, 0.0],
          startPoint: $point(0, 1),
          endPoint: $point(1, 1)
        },
        layout: $layout.fill
      }]
    },{
      type: "label",
      props: {
        id: "myProgressText",
        text: text,
        textColor: utils.themeColor.appObviousColor,
        font: $font("bold", 15),
        align: $align.center
      },
      layout: function(make, view) {
        make.centerX.equalTo(view.super)
        make.centerY.equalTo(view.super).offset(20)
      }
    }],
  })
  $ui.animate({
    duration: 0.5,
    animation: () => {
      $("myProgressParent").alpha = 1;
    },
  });

  function progress_shadow(view) {
    var layer = view.runtimeValue().invoke("layer")
    layer.invoke("setCornerRadius", 5)
    layer.invoke("setShadowOffset", $size(0, 0))
    layer.invoke("setShadowColor", $color("#96e6a1").runtimeValue().invoke("CGColor"))
    layer.invoke("setShadowOpacity", 0.8)
    layer.invoke("setShadowRadius", 5)
  }
}

module.exports = {
  showToastView: showToastView,
  showBannedAlert: showBannedAlert,
  addButtonMore: addButtonMore,
  genAppShowView: genAppShowView,
  genPageHeader: genPageHeader,
  selectIcon: selectIcon,
  genAppPreviewPhotosStack: genAppPreviewPhotosStack,
  addProgressView: addProgressView,
  createRight: createRight,
  createBack: createBack,
  createEnter: createEnter,
  genIconView: genIconView,
}