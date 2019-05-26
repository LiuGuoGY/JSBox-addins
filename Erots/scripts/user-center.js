let ui = require('scripts/ui')
let utils = require('scripts/utils')
let user = require('scripts/user')

function setupUserCenterView(prevTitle) {
  $ui.push({
    props: {
      id: "userCenterView",
      navBarHidden: true,
      statusBarStyle: 0,
    },
    events: {
      appeared: function(sender) {
        $app.autoKeyboardEnabled = true
        $app.keyboardToolbarEnabled = true
      },
      didAppear: function(sender) {
        $app.autoKeyboardEnabled = true
        $app.keyboardToolbarEnabled = true
      },
      disappeared: function() {
        $app.autoKeyboardEnabled = false
        $app.keyboardToolbarEnabled = false
      }
    },
    views: [ui.genPageHeader("主页", "个人中心"), {
      type: "scroll",
      props: {
        bgcolor: $color("#F9F9F8"),
        showsVerticalIndicator: true,
      },
      layout: function(make, view) {
        make.centerX.equalTo(view.super)
        make.width.equalTo(view.super)
        make.top.equalTo(view.prev.bottom)
        if($device.info.version >= "11"){
          make.bottom.equalTo(view.super.safeAreaBottom)
        } else {
          make.bottom.inset(0)
        }
      },
      views: [{
        type: "label",
        props: {
          text: "已登录用户： " + user.getLoginUser().username,
          align: $align.left,
          font: $font(14),
          textColor: $color("gray"),
        },
        layout: function(make, view) {
          make.left.right.inset(20)
          make.centerX.equalTo(view.super)
          make.height.equalTo(45)
          make.top.inset(30)
        }
      },{
        type: "button",
          props: {
            title: "退出登录",
            bgcolor: $color(utils.mColor.lightBlue),
            titleColor: $color("white"),
            circular: true,
          },
          layout: function(make, view) {
            make.left.right.inset(20)
            make.centerX.equalTo(view.super)
            make.height.equalTo(45)
            make.top.equalTo(view.prev.bottom).inset(30)
          },
          events: {
            tapped: async function(sender) {
              $ui.alert({
                title: "提示",
                message: "确定要退出？",
                actions: [
                  {
                    title: "确定",
                    handler: function() {
                      user.logout()
                    }
                  },
                  {
                    title: "取消",
                    handler: function() {
              
                    }
                  }
                ]
              });
            }
          }
      }]
    },],
  })
}

module.exports = {
  setupUserCenterView: setupUserCenterView,
}