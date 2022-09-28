let utils = require('scripts/utils')

function showToastView(view, color, text, duration) {
    let time = new Date().getTime()
    let topInset = view.frame.height / 10
    let textSize = $text.sizeThatFits({
      text: text,
      width: view.frame.width,
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
          icon: $icon("009", color, $size(16, 16)),
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

  module.exports = {
    showToastView: showToastView,
  }