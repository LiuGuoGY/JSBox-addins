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
  if(utils.getCache("needToUpdate", false)) {
    items.push({
      title: {
        text: "版本更新"
      },
      icon: {
        src: "assets/update.png"
      },
      url: "jsbox://run?name=" + encodeURI($addin.current.name + "&action=update"),
    })
  } else {
    items.push({
      title: {
        text: "更多"
      },
      icon: {
        src: "assets/more.png"
      },
      url: "jsbox://run?name=" + encodeURI($addin.current.name + "&action=more"),
    })
  }
  
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
        shadow(view)
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
}

function shadow(view) {
  var layer = view.runtimeValue().invoke("layer")
  layer.invoke("setCornerRadius", 5)
  layer.invoke("setShadowOffset", $size(0, 0))
  layer.invoke("setShadowColor", $color("#96e6a1").runtimeValue().invoke("CGColor"))
  layer.invoke("setShadowOpacity", 0.8)
  layer.invoke("setShadowRadius", 5)
}

module.exports = {
  showToastView: showToastView,
  genTemplate: genTemplate,
  showBannedAlert: showBannedAlert,
  addButtonMore: addButtonMore,
  addProgressView: addProgressView,
}