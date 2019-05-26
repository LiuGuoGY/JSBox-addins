let utils = require('scripts/utils')
const mColor = {
  gray: "#a2a2a2",
  blue: "#3478f7",
  black: "#303032",
  green: "#27AE60",
  red: "#E74C3C",
  iosGreen: "#4CD964",
}

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
        style: 1, // 0 ~ 5
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
          textColor: $color(utils.mColor.black),
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

function genTemplate() {
  let showMode = utils.getCache("showMode", 0)
  let template = []
  if(showMode == 0) {
    template.push({
      type: "blur",
      props: {
        radius: 2.0, //调整边框是什么形状的如:方形圆形什么的
        style: 1 // 0 ~ 5 调整背景的颜色程度
      },
      layout: $layout.fill,
    },{
      type: "label",
      props: {
        id: "title",
        textColor: $color("black"),
        bgcolor: $color("clear"),
        font: $font(13),
        align: $align.center,
      },
      layout: function(make, view) {
        make.bottom.inset(0)
        make.centerX.equalTo(view.super)
        make.height.equalTo(25)
        make.width.equalTo(view.super)
      }
    },{
      type: "image",
      props: {
        id: "icon",
        bgcolor: $color("clear"),
        smoothRadius: 5,
        size: $size(20, 20),
      },
      layout: function(make, view) {
        make.top.inset(9)
        make.centerX.equalTo(view.super)
        make.size.equalTo($size(20, 20))
      }
    })
  } else if(showMode == 1) {
    template.push({
      type: "blur",
      props: {
        circular: true,
        style: 1, // 0 ~ 5 调整背景的颜色程度
      },
      layout: function(make, view) {
        make.center.equalTo(view.super)
        make.size.equalTo($size(40, 40))
      },
    },{
      type: "image",
      props: {
        id: "icon",
        bgcolor: $color("clear"),
        smoothRadius: 5,
        size: $size(20, 20),
      },
      layout: function(make, view) {
        make.center.equalTo(view.super)
        make.size.equalTo($size(20, 20))
      }
    })
  } else if(showMode == 2) {
    let bgcolor = utils.randomValue(utils.colors)
    template.push({
      type: "label",
      props: {
        id: "title",
        textColor: $color("black"),
        bgcolor: $color("clear"),
        font: $font(13),
        align: $align.center,
      },
      layout: function(make, view) {
        make.center.equalTo(view.super)
        make.height.equalTo(25)
        make.width.equalTo(view.super)
      }
    },{
      type: "view",
      props: {
        bgcolor: bgcolor,
      },
      layout: function(make, view) {
        make.centerX.equalTo(view.super)
        make.height.equalTo(1)
        make.width.equalTo(30)
        make.top.equalTo($("title").bottom).inset(1)
      }
    },{
      type: "view",
      props: {
        bgcolor: bgcolor,
      },
      layout: function(make, view) {
        make.centerX.equalTo(view.super)
        make.height.equalTo(1)
        make.width.equalTo(30)
        make.bottom.equalTo($("title").top).inset(1)
      }
    })
  } else if(showMode == 3) {
    template.push({
      type: "blur",
      props: {
        radius: 5, //调整边框是什么形状的如:方形圆形什么的
        style: 1 // 0 ~ 5 调整背景的颜色程度
      },
      layout: function(make, view) {
        make.center.equalTo(view.super)
        make.top.bottom.inset(0.5)
        make.width.equalTo(view.super)
      },
    },{
      type: "image",
      props: {
        id: "icon",
        bgcolor: $color("clear"),
        smoothRadius: 5,
        size: $size(20, 20),
      },
      layout: function(make, view) {
        make.left.inset(8)
        make.centerY.equalTo(view.super)
        make.size.equalTo($size(20, 20))
      }
    },{
      type: "label",
      props: {
        id: "title",
        textColor: $color("black"),
        bgcolor: $color("clear"),
        font: $font(13),
        align: $align.center,
      },
      layout: function(make, view) {
        make.left.equalTo(view.prev.right).inset(0)
        make.centerY.equalTo(view.super)
        make.height.equalTo(25)
        make.right.inset(8)
      }
    })
  } else if(showMode == 4) {
    template.push({
      type: "view",
      props: {
        radius: 12, //调整边框是什么形状的如:方形圆形什么的
      },
      layout: function(make, view) {
        make.center.equalTo(view.super)
        make.size.equalTo($size(46, 46))
      },
      views: [{
        type: "view",
        props: {
          clipsToBounds: false,
        },
        layout: function(make, view) {
          make.center.equalTo(view.super)
          make.size.equalTo(view.super)
        },
        views: [{
          type: "image",
          props: {
            id: "icon",
            bgcolor: $color("clear"),
            size: $size(29, 29),
            radius: 5,
          },
          layout: function(make, view) {
            make.center.equalTo(view.super)
            make.size.equalTo($size(29, 29))
          }
        }]
      }]
    })
  }
  return template
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

function genPageHeader(backName, title) {
  let view = {
    type: "view",
    layout: function(make, view) {
      if($device.info.version >= "11"){
        make.top.equalTo(view.super.safeAreaTop)
      } else {
        make.top.inset(20)
      }
      make.left.right.inset(0)
      make.height.equalTo(45)
    },
    views:[{
      type: "label",
      props: {
        text: title,
        font: $font("bold", 17),
        align: $align.center,
        bgcolor: $color("white"),
        textColor: $color("black"),
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
          ctx.strokeColor = $color("darkGray")
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
        type: "image",
        props: {
          src: "assets/back.png",
          bgcolor: $color("clear"),
        },
        layout: function(make, view) {
          make.left.inset(10)
          make.centerY.equalTo(view.super)
          make.size.equalTo($size(12, 23))
        },
      },{
        type: "label",
        props: {
          text: backName,
          align: $align.center,
          textColor: $color(mColor.blue),
          font: $font(17)
        },
        layout: function(make, view) {
          make.height.equalTo(view.super)
          make.left.equalTo(view.prev.right).inset(3)
        }
      }],
    },]
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

function genAppShowView(icon, name, cate, buttonText, buttonFunction) {
  let iconView = {}
  if(icon.startsWith("erots")) {
    let json = utils.getSearchJson(icon)
    let bgcolor = $color("clear")
    let fontcolor = $color("#" + json.color)
    if(json.mode == "1") {
      bgcolor = $color("#" + json.color)
      fontcolor = $color("white")
    }
    iconView = {
      type: "image",
      props: {
        bgcolor: (json.mode == "1")?bgcolor:$color("clear"),
        radius: 12,
        borderColor: $color("#DEDEDF"),
        borderWidth: 0.8,
      },
      layout: function(make, view) {
        make.size.equalTo($size(60, 60))
        make.left.inset(0)
        make.centerY.equalTo(view.super)
      },
      views: [{
        type: "image",
        props: {
          icon: $icon(json.code, fontcolor, $size(35, 35)),
          bgcolor: bgcolor,
        },
        layout: function(make, view) {
          make.size.equalTo($size(35, 35))
          make.center.equalTo(view.super)
        },
      }]
    }
  } else {
    iconView = {
      type: "image",
      props: {
        src: icon,
        bgcolor: $color("clear"),
        radius: 12,
        borderColor: $color("#DEDEDF"),
        borderWidth: 0.8,
      },
      layout: function(make, view) {
        make.size.equalTo($size(60, 60))
        make.left.inset(0)
        make.centerY.equalTo(view.super)
      },
    }
  }
  
  let view = {
    type: "view",
    layout: function(make, view) {
      make.left.right.inset(0)
      make.top.inset(0)
      make.height.equalTo(70)
      make.center.equalTo(view.super)
    },
    views: [iconView,{
      type: "button",
      props: {
        title: buttonText,
        bgcolor: $rgba(100, 100, 100, 0.1),
        titleColor: $color(mColor.blue),
        font: $font("bold", 15),
        radius: 15,
        align: $align.center,
      },
      layout: function(make, view) {
        make.centerY.equalTo(view.super)
        make.right.inset(0)
        make.size.equalTo($size(75, 30))
      },
      events: {
        tapped: function(sender) {
          buttonFunction(sender)
        }
      },
      views: []
    },{
      type: "label",
      props: {
        text: name,
        font: $font(16),
        textColor: $color("black"),
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
        textColor: $color(mColor.gray),
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

function genAppPreviewPhotosView(photos, longPressedHandler) {
  let height = 240
  let photosView = []
  for(let i = 0; i < photos.length; i++) {
    if(photos[i].endsWith(".mp4")) {
      
    } else {
      photosView.push({
        type: "image",
        props: {
          src: photos[i],
          bgcolor: $color("clear"),
          borderWidth: 1,
          borderColor: $color("#EEEEEF"),
          radius: 4,
          info: i,
        },
        layout: function(make, view) {
          make.top.inset(10)
          if(view.prev) {
            make.left.equalTo(view.prev.right).inset(10)
          } else {            
            make.left.inset(20)
          }
          make.width.equalTo(height * 0.6)
          make.height.equalTo(height)
        },
        events: {
          tapped: function(sender) {
            $quicklook.open({
              image: sender.image
            })
          },
          longPressed: function(sender) {
            if(longPressedHandler) {
              longPressedHandler(sender.sender.info)
            }
          },
        },
      })
    }
  }

  return photosView
}

function addProgressView(superView) {
  superView.add({
    type: "blur",
    props: {
      id: "myProgressParent",
      style: 1,
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
        text: "更新中...",
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
  genTemplate: genTemplate,
  showBannedAlert: showBannedAlert,
  addButtonMore: addButtonMore,
  genAppShowView: genAppShowView,
  genPageHeader: genPageHeader,
  selectIcon: selectIcon,
  genAppPreviewPhotosView: genAppPreviewPhotosView,
  addProgressView: addProgressView,
}