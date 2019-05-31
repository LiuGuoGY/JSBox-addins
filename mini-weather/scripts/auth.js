let widget = require("scripts/widget");
let app = require("scripts/app");
let view = require("scripts/view");
let utils = require("scripts/utils");

function detect() {
  if($app.env == $env.app) {
    let url = "https://wcphv9sr.api.lncld.net/1.1/classes/fansList?where={\"deviceId\":\"" + $objc("FCUUID").invoke("uuidForDevice").rawValue() + "\"}"
    $http.request({
      method: "GET",
      url: encodeURI(url),
      timeout: 5,
      header: {
        "Content-Type": "application/json",
        "X-LC-Id": "Ah185wdqs1gPX3nYHbMnB7g4-gzGzoHsz",
        "X-LC-Key": "HmbtutG47Fibi9vRwezIY2E7",
      },
      handler: function(resp) {
        let data = resp.data.results
        if(data.length > 0) {
          authPass()
        } else {
          setupWelcome()
        }
      }
    })
    $ui.render({
      views: [{
        type: "view",
        layout: function(make, view) {
          make.center.equalTo(view.super)
          make.size.equalTo($size(40, 40))
        },
        views:[{
          type: "spinner",
          props: {
            loading: true,
          },
          layout: function(make, view) {
            make.top.inset(0)
            make.centerX.equalTo(view.super)
          }
        },{
          type: "label",
          props: {
            text: "正在载入...",
            align: $align.center,
            font: $font(12),
          },
          layout: function(make, view) {
            make.centerX.equalTo(view.super).offset(4)
            make.bottom.inset(0)
          }
        }],
      },]
    });
  } else {
    authPass();
  }
}
let authSucces = false
function setupWelcome() {
  if($app.env != $env.app) {
    $ui.render({
      props: {
        title: "欢迎使用"
      },
      views: [{
        type: "button",
        props: {
          id: "subscribeButton",
          title: "关注公众号以继续使用",
          circular: true,
          titleColor: $color("white"),
          bgcolor: $color("#00CC7A"),
          font: $font("bold", 15),
        },
        layout: function(make, view) {
          make.center.equalTo(view.super)
          make.width.equalTo(250)
          make.height.equalTo(50)
        },
        events: {
          tapped: function(sender) {
            $app.openURL("jsbox://run?name=" + encodeURI($addin.current.name));
          }
        }
      }]
    });
  } else {
    $app.autoKeyboardEnabled = true
    $app.keyboardToolbarEnabled = true
    $ui.render({
      props: {
        title: "欢迎使用",
        navButtons: [
          {
            title: "",
            handler: function() {
              
            }
          }
        ],
      },
      views: [{
        type: "gallery",
        props: {
          items: [
            {
              type: "image",
              props: {
                src: "assets/show1.png",
                contentMode: $contentMode.scaleAspectFit,
              }
            },
          ],
          interval: 4,
          radius: 5.0
        },
        layout: function(make, view) {
          make.left.right.inset(10)
          make.centerX.equalTo(view.super)
          make.top.inset(50)
          make.height.equalTo(200)
        }
      },{
        type: "label",
        props: {
          id: "welcomeDetailLabel",
          text: "关注微信公众号「纵享派」即可继续使用，感谢你对作者辛苦开发和维护的支持 :)",
          font: $font("bold", 20),
          align: $align.center,
          lines: 0,
        },
        layout: function(make, view) {
          make.left.right.inset(20)
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(30)
        },
      },{
        type: "button",
        props: {
          id: "subscribeButton",
          title: "关注以继续使用",
          circular: true,
          titleColor: $color("white"),
          bgcolor: $color("#00CC7A"),
          font: $font("bold", 15),
        },
        layout: function(make, view) {
          make.bottom.inset(100)
          make.centerX.equalTo(view.super)
          make.width.equalTo(220)
          make.height.equalTo(50)
        },
        events: {
          tapped: function(sender) {
            if(!authSucces) {
              $ui.alert({
                title: "提示",
                message: "下载二维码图片或复制公众号名并跳转到微信，只需选择图片或者搜索即可关注公众号。",
                actions: [
                  {
                    title: "下载二维码",
                    handler: function() {
                      gotoWxScan()
                    }
                  },
                  {
                    title: "复制公众号名",
                    handler: function() {
                      gotoWx()
                    }
                  },
                  {
                    title: "取消",
                    handler: function() {
                      
                    }
                  }
                ]
              });
            } else {
              authPass();
            }
          }
        },
      },{
        type: "button",
        props: {
          title: "我已关注",
          circular: true,
          titleColor: $color("#a2a2a2"), //#3478f7
          bgcolor: $color("white"),
          font: $font("bold", 13),
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          make.centerX.equalTo(view.super)
          make.width.equalTo(100)
          make.height.equalTo(30)
        },
        events: {
          tapped: function(sender) {
            if(!$("nicknameInput")) {
              $("showWindow").add({
                type: "view",
                props: {
                  id: "inputParent",
                },
                layout: $layout.fill,
                views:[{
                  type: "input",
                  props: {
                    id: "nicknameInput",
                    borderColor: $color("#00CC7A"),
                    borderWidth: 3,
                    bgcolor: $color("white"),
                    tintColor: $color("#00CC7A"),
                    placeholder: "输入你的微信用户昵称",
                    font: $font("bold", 13),
                  },
                  layout: function(make, view) {
                    make.center.equalTo(view.super)
                    make.height.equalTo(32)
                    make.width.equalTo(150)
                  },
                  events: {
                    returned: function(sender) {
                      sender.blur()
                    },
                    didEndEditing: function(sender) {
                      detectNickname(sender.text)
                    }
                  }
                },{
                  type: "image",
                  props: {
                    id: "toastIcon",
                    bgcolor: $color("clear"),
                    icon: null,
                  },
                  layout: function(make, view) {
                    make.centerY.equalTo(view.super)
                    make.size.equalTo($size(20, 20))
                    make.left.equalTo(view.prev.right).inset(5)
                  },
                  events: {
                    tapped: function(sender) {
                      if(!authSucces && sender.icon) {
                        if($("nicknameInput").text.indexOf("&") >= 0) {
                          $ui.alert({
                            title: "提示",
                            message: "昵称中含有 & 符号，请在公众号后台联系开发者",
                          });
                        } else {
                          $ui.alert({
                            title: "提示",
                            message: "待开发者审核，请在公众号后台发送你的微信昵称以通过审核，请耐心等待",
                          });
                        }
                      }
                    }
                  }
                }]
              })
            }
            $("nicknameInput").focus()
          }
        },
      },{
        type: "view",
        props: {
          id: "showWindow",
        },
        layout: function(make, view) {
          make.bottom.equalTo($("subscribeButton").top).inset(20)
          make.centerX.equalTo(view.super)
          make.width.equalTo(200)
          make.height.equalTo(40)
        },
        views: []
      }]
    });
  }
}

function gotoWxScan() {
  $("showWindow").add({
    type: "spinner",
    props: {
      id: "loadingView",
      loading: true,
    },
    layout: function(make, view) {
      make.center.equalTo(view.super)
    }
  })
  $http.download({
    url: "https://github.com/LiuGuoGY/JSBox-addins/raw/master/resources/OfficialAccountQr.jpg",
    handler: function(resp) {
      $photo.save({
        data: resp.data,
        handler: function(success) {
          if($("loadingView")) {
            $("loadingView").remove()
          }
          if (success) {
            $app.openURL("weixin://scanqrcode")
          }
        }
      })
    }
  })
}

function gotoWx() {
  $clipboard.text = "纵享派"
  $app.openURL("weixin://")
}

function detectNickname(nickname) {
  if(nickname.length <= 0 && $("toastIcon")) {
    $("toastIcon").icon = null
    authSucces = false
    return 0
  }
  if($("toastIcon")) {
    $("toastIcon").icon = $icon("162", $color("gray"), $size(20, 20))
  }
  let url = "https://wcphv9sr.api.lncld.net/1.1/classes/fansList?where={\"nickname\":\"" + nickname + "\"}"
  $http.request({
    method: "GET",
    url: encodeURI(url),
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": "Ah185wdqs1gPX3nYHbMnB7g4-gzGzoHsz",
      "X-LC-Key": "HmbtutG47Fibi9vRwezIY2E7",
    },
    handler: function(resp) {
      let data = resp.data.results
      if(data.length > 0) {
        if($("toastIcon")) {
          $("toastIcon").icon = $icon("064", $color("#00CC7A"), $size(20, 20))
          authSucces = true
          $("subscribeButton").bgcolor = $color("#3478f7");
          $("subscribeButton").title = "开始使用"
          regisiter(data[0].objectId)
        }
      } else {
        if($("toastIcon")) {
          $("toastIcon").icon = $icon("009", $color("gray"), $size(20, 20))
          authSucces = false
        }
      }
    }
  })
}

function regisiter(objectId) {
  $http.request({
    method: "PUT",
    url: "https://wcphv9sr.api.lncld.net/1.1/classes/fansList/" + objectId,
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": "Ah185wdqs1gPX3nYHbMnB7g4-gzGzoHsz",
      "X-LC-Key": "HmbtutG47Fibi9vRwezIY2E7",
    },
    body: {
      deviceId: {
        __op: "AddUnique",
        objects: [$objc("FCUUID").invoke("uuidForDevice").rawValue()],
      }
    },
    handler: function(resp) {
    }
  })
}
function authPass() {
  if ($app.env != $env.app) {
    if(utils.getCache("haveBanned") === true) {
      view.showBannedAlert()
    } else {
      widget.setupView()
    }
  } else {
    app.show()
  }
}

module.exports = {
  start: detect,
};