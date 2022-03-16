let ui = require('scripts/ui')
let utils = require('scripts/utils')
let user = require('scripts/user')
let api = require('scripts/api')
const groups = require("./groups");

$app.listen({
  refreshAll: function (object) {
    if($("userCenterSubView")) {
      $("userCenterSubView").remove()
      $("userCenterParentView").add(genUserCenterSubview())
    }
  },
});

function genUserCenterSubview() {
  let userTemplate = {
    type: "view",
    props: {
      bgcolor: $color("clear"),
    },
    layout: $layout.fill,
    views: [{
      type: "view",
      layout: $layout.fill,
      views: [{
        type: "label",
        props: {
          id: "userTitle",
          textColor: utils.themeColor.listContentTextColor,
        },
        layout: function(make, view) {
          make.left.inset(15);
          make.centerY.equalTo(view.super);
        }
      },{
        type: "view",
        props: {
          id: "canGo",
          bgcolor: $color("clear"),
        },
        layout: function(make, view) {
          make.right.inset(15)
          make.centerY.equalTo(view.super)
          make.size.equalTo($size(10, 16))
        },
        views: [ui.createEnter(utils.themeColor.appHintColor)]
      },{
        type: "label",
        props: {
          id: "userDetail",
          textColor: utils.themeColor.appHintColor,
        },
        layout: function(make, view) {
          make.left.equalTo(view.prev.prev.right).inset(15)
          make.right.equalTo(view.prev.left).inset(3);
          make.centerY.equalTo(view.super);
        }
      },]
    }]
  }
  let userInfo = user.getLoginUser()
  let infoArray = [{
    userTitle: {
      text: "邮箱"
    },
    userDetail: {
      text: userInfo.email,
    },
    canGo: {
      hidden: true,
    }
  },{
    userTitle: {
      text: "昵称"
    },
    userDetail: {
      text: userInfo.nickname,
    },
    canGo: {
      hidden: true,
    }
  },{
    userTitle: {
      text: "赞赏链接"
    },
    userDetail: {
      text: (userInfo.praise)?userInfo.praise:"无",
    },
    canGo: {
      hidden: false,
    }
  },{
    userTitle: {
      text: "与我有关的评论"
    },
    userDetail: {
      text: "",
    },
    canGo: {
      hidden: false,
    }
  },{
    userTitle: {
      text: "管理我的应用"
    },
    userDetail: {
      text: "",
    },
    canGo: {
      hidden: false,
    }
  },]
  let userView = {
    type: "list",
    props: {
      style: 2, // 使用复选类型时这个应该选择 2
      rowHeight: 45,
      separatorInset: $insets(0, 66, 0, 0),
      indicatorInsets: $insets(100, 0, 49, 0),
      separatorColor: $color("systemSeparator"),
      header: {
        type: "view",
        props: {height: 5}
      },
      footer: {
        type: "view",
        props:{
          height: 30,
        }
      },
      data: groups.init({
        groups: [{
          title: "用户信息",
          items: [{
            type: "text",
            async: false,
            title: "邮箱",
            symbol: "envelope",
            iconColor: utils.systemColor("blue"),
            text: userInfo.email,
            handler: () => {
            }
          },
          {
            type: "text",
            async: false,
            title: "昵称",
            symbol: "person",
            iconColor: utils.systemColor("pink"),
            text: userInfo.nickname,
            handler: () => {}
        },]
        },
        {
          title: "应用管理",
          items: [{
            type: "arrow",
            async: false,
            title: "赞赏链接",
            symbol: "link",
            iconColor: utils.systemColor("red"),
            handler: () => {
              setupMyPraiseView();
            }
          },{
              type: "arrow",
              async: false,
              title: "与我有关的评论",
              symbol: "bubble.right",
              iconColor: utils.systemColor("green"),
              handler: () => {
                setupMyCommentsView();
              }
            },
            {
              type: "arrow",
              async: false,
              title: "管理我的应用",
              symbol: "hammer",
              iconColor: utils.systemColor("purple"),
              handler: () => {
                setupManageMyAppsView();
              }
          },
        ]},{
          title: "",
          items: [{
            type: "textButton",
            async: false,
            title: "退出登录",
            titleColor: utils.getCache("themeColor"),
            handler: () => {
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
        ]}]
      })
    },
    layout: $layout.fillSafeArea,
  };
  return userView
}

function setupUserCenterView(prevTitle) {
  $ui.push({
    props: {
      id: "userCenterView",
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
    },
    views: [ui.genPageHeader("主页", "个人中心"), {
      type: "view",
      props: {
        id: "userCenterParentView",
      },
      layout: function(make, view) {
        make.top.equalTo(view.prev.bottom)
        make.left.right.bottom.inset(0)
        make.centerX.equalTo(view.super)
      },
      views: [genUserCenterSubview()]
    }],
  })
}

function setupMyCommentsView() {
  let template = {
    type: "view",
    props: {
      bgcolor: $color("clear"),
    },
    layout: $layout.fill,
    views: [{
      type: "view",
      props: {
        bgcolor: utils.themeColor.commentBgColor,
        radius: 8,
      },
      layout: function(make, view) {
        make.center.equalTo(view.super)
        make.height.equalTo(170)
        make.left.right.inset(15)
      },
      views: [{
        type: "label",
        props: {
          id: "comments_name",
          textColor: utils.themeColor.appHintColor,
          font: $font("PingFangSC-Regular", 15),
        },
        layout: function(make, view) {
          make.top.inset(10)
          make.height.equalTo(20)
          make.left.inset(15)
        },
      },{
        type: "label",
        props: {
          id: "comments_time",
          textColor: utils.themeColor.appHintColor,
          font: $font("PingFangSC-Regular", 14),
        },
        layout: function(make, view) {
          make.centerY.equalTo(view.prev)
          make.height.equalTo(20)
          make.left.equalTo(view.prev.right).inset(10)
        },
      },{
        type: "label",
        props: {
          id: "comments_app",
          textColor: utils.themeColor.appHintColor,
          font: $font("PingFangSC-Regular", 14),
        },
        layout: function(make, view) {
          make.top.inset(10)
          make.height.equalTo(20)
          make.right.inset(15)
        },
      },{
        type: "label",
        props: {
          id: "comments_text",
          textColor: utils.themeColor.listHeaderTextColor,
          font: $font("PingFangSC-Regular", 15),
          align: $align.justified,
          bgcolor: $color("clear"),
          lines: 0,
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(5)
          make.left.right.inset(15)
        },
      }]
    }]
  }
  let cloudApps = utils.getCache("cloudApps", [])
  let comments = []
  let sortedComments = []
  for(let i = 0; i < cloudApps.length; i++) {
    if(cloudApps[i].authorId === user.getLoginUser().objectId && cloudApps[i].comment && cloudApps[i].comment.length > 0) {
      for(let j = 0; j < cloudApps[i].comment.length; j++) {
        comments.push({
          name: cloudApps[i].comment[j].name,
          app: cloudApps[i].appName,
          time: cloudApps[i].comment[j].time,
          text: cloudApps[i].comment[j].comment,
        })
      }
    }
  }
  comments.sort(function(a, b) {
    let aN = parseInt(a.time);
    let bN = parseInt(b.time);
    if(!aN && !bN) {
      return 0;
    } else if(aN && !bN) {
      return -1;
    } else if(!aN && bN) {
      return 1;
    } else if(aN < bN) {
      return 1;
    } else {
      return -1;
    }
  })
  for(let i = 0; i < comments.length; i++) {
    sortedComments.push({
      comments_name: {
        text: comments[i].name,
      },
      comments_app: {
        text: comments[i].app,
      },
      comments_time: {
        text: utils.getUpdateDateString(comments[i].time),
      },
      comments_text: {
        text: comments[i].text,
      }
    });
  }
  $ui.push({
    props: {
      id: "myCommentsView",
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
    },
    views: [ui.genPageHeader("个人", "与我有关的评论"), {
      type: "view",
      layout: function(make, view) {
        make.top.equalTo(view.prev.bottom)
        make.left.right.bottom.inset(0)
        make.centerX.equalTo(view.super)
      },
      views: [{
        type: "list",
        props: {
          bgcolor: $color("clear"),
          template: template,
          indicatorInsets: $insets(0, 0, 0, 0),
          indicatorStyle: utils.themeColor.indicatorStyle,
          separatorColor: utils.themeColor.separatorColor,
          separatorHidden: true,
          data: sortedComments,
          rowHeight: 190,
          selectable: false,
          header: {
            type: "view",
            props: {
                height: 20,
            },
          },
          footer: {
            type: "view",
            props: {
                height: 20,
            },
          },
        },
        layout: function(make, view) {
          make.top.inset(0)
          make.bottom.inset(0)
          make.left.right.inset(0)
        },
      }]
    }],
  })
}

function setupMyPraiseView() {

  async function uploadParise() {
    ui.showToastView($("myPraiseView"), utils.mColor.blue, "正在上传设置中...");
    await user.setPraise($("praiseInput").text)
    let userInfo = user.getLoginUser()
    userInfo.praise = $("praiseInput").text
    user.saveUser(userInfo)
    let cloudApps = utils.getCache("cloudApps", [])
    let appObjects = []
    for(let i = 0; i < cloudApps.length; i++) {
      if(cloudApps[i].authorId === user.getLoginUser().objectId) {
        if(!cloudApps[i].praise || cloudApps[i].praise != $("praiseInput").text) {
          appObjects.push(cloudApps[i].objectId);
        }
      }
    }
    await api.uploadPraise(appObjects, $("praiseInput").text);
    ui.showToastView($("myPraiseView"), utils.mColor.green, "设置成功");
    $app.notify({
      name: "refreshAll",
      object: {appItem: true, }
    });
    $delay(0.5, ()=>{
      $ui.pop();
    })
  }
  $ui.push({
    props: {
      id: "myPraiseView",
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
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
    views: [ui.genPageHeader("个人", "赞赏链接"), {
      type: "view",
      layout: function(make, view) {
        make.top.equalTo(view.prev.bottom)
        make.left.right.bottom.inset(0)
        make.centerX.equalTo(view.super)
      },
      views: [{
        type: "scroll",
        layout: $layout.fill,
        views: [{
          type: "view",
          layout: function(make, view) {
            make.top.inset(30)
            make.centerX.equalTo(view.super)
            make.left.right.inset(0)
            make.height.equalTo(45)
          },
          views: [{
            type: "canvas",
            layout: function(make, view) {
              make.top.inset(0)
              make.height.equalTo(1 / $device.info.screen.scale)
              make.left.right.inset(0)
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
                ctx.strokeColor = $color("lightGray")
                ctx.setLineWidth(1 / scale)
                ctx.moveToPoint(0, 0)
                ctx.addLineToPoint(width, 0)
                ctx.strokePath()
              }
            }
          },{
            type: "input",
            props: {
              id: "praiseInput",
              text: user.getLoginUser().praise?user.getLoginUser().praise:"",
              bgcolor: $color("clear"),
              radius: 0,
              type: $kbType.default,
              tintColor: utils.getCache("themeColor"),
              textColor: utils.themeColor.listHeaderTextColor,
              darkKeyboard: utils.themeColor.darkKeyboard,
            },
            layout: function(make, view) {
              make.top.bottom.inset(0)
              make.center.equalTo(view.super)
              make.left.right.inset(15)
            },
            events: {
              didBeginEditing: function (sender, view) {
                
              },
              didEndEditing: function (sender) {
                
              },
              changed: function (sender) {
                if (sender.text.length > 0) {
                  sender.views[0].hidden = true
                } else {
                  sender.views[0].hidden = false
                }
              },
              returned: function (sender) {
                sender.blur()
              },
            },
            views: [{
              type: "label",
              props: {
                id: "praiseInputHint",
                text: "输入内容",
                font: $font(16),
                align: $align.center,
                textColor: utils.themeColor.appHintColor,
                hidden: user.getLoginUser().praise?true:false,
              },
              layout: function (make, view) {
                make.left.inset(10)
                make.centerY.equalTo(view.super).offset(-1)
              }
            }]
          }]
        },{
          type: "view",
          layout: function(make, view) {
            make.top.equalTo(view.prev.bottom).inset(15)
            make.centerX.equalTo(view.super)
            make.left.right.inset(0)
            make.height.equalTo(40)
          },
          views: [{
            type: "label",
            props: {
              text: "此处推荐设置为支付宝赞赏链接。",
              textColor: utils.themeColor.appHintColor,
              align: $align.left,
              font: $font(12),
              lines: 0,
            },
            layout: function(make, view) {
              make.left.right.inset(20)
              make.top.inset(10)
            },
          },],
        },{
          type: "button",
          props: {
            title: "导入支付宝收钱码",
            bgcolor: $color("clear"),
            titleColor: $color(utils.mColor.blue),
            font: $font("bold", 12),
            radius: 0,
          },
          layout: function(make, view) {
            make.left.inset(20)
            make.top.equalTo(view.prev.bottom).inset(10)
            make.height.equalTo(35)
          },
          events: {
            tapped: async function(sender) {
              let resp = await $photo.pick({
                mediaTypes: [$mediaType.image],
                format: 'data',
              })
              var text = $qrcode.decode(resp.data.image)
              $("praiseInputHint").hidden = true
              $("praiseInput").text = text
            }
          },
        },{
          type: "button",
          props: {
            title: "点击进行赞赏测试",
            titleColor: $color(utils.mColor.iosGreen),
            bgcolor: $color("clear"),
            font: $font("bold", 12),
            radius: 0,
          },
          layout: function(make, view) {
            make.left.equalTo(view.prev.right).inset(20)
            make.centerY.equalTo(view.prev)
            make.height.equalTo(35)
          },
          events: {
            tapped: async function(sender) {
              $app.openURL($("praiseInput").text);
            }
          },
        },{
          type: "button",
          props: {
            title: "完成设置",
            bgcolor: utils.themeColor.commentBgColor,
            titleColor: utils.getCache("themeColor"),
            font: $font("bold", 16),
            radius: 12,
          },
          layout: function(make, view) {
            make.left.right.inset(20)
            make.top.equalTo(view.prev.bottom).inset(30)
            make.centerX.equalTo(view.super)
            make.height.equalTo(45)
          },
          events: {
            tapped: function(sender) {
              if($("praiseInput").text.length <= 0) {
                $ui.alert({
                  title: "提示",
                  message: "确定要清除赞赏链接？",
                  actions: [{
                    title: "确定",
                    handler: function () {
                      uploadParise()
                    }
                  },{
                    title: "取消",
                    handler: function () {
                    }
                  }]
                })
              } else {
                $ui.alert({
                  title: "提示",
                  message: "确定要上传该设置？",
                  actions: [{
                    title: "确定",
                    handler: function () {
                      uploadParise()
                    }
                  },{
                    title: "取消",
                    handler: function () {
                    }
                  }]
                });
              }
            }
          },
        }]
      }]
    }]
  });
}

function setupManageMyAppsView() {
  let cloudApps = utils.getCache("cloudApps", [])
  let author = user.getLoginUser()
  let myApps = []
  for(let i = 0; i < cloudApps.length; i++) {
    if (cloudApps[i].authorId == author.objectId) {
      myApps.push(cloudApps[i])
    }
  }
  let appViewItems = []
  for(let i = 0; i < myApps.length; i++) {
    let buttonText = (myApps[i].onStore)?"上架中":"下架中";
    appViewItems.push({
      type: "view",
      props: {
        info: myApps[i].objectId,
        bgcolor: $color("clear"),
      },
      layout: function (make, view) {
        make.left.right.inset(0)
        make.height.equalTo(80)
        make.center.equalTo(view.super)
      },
      views: [{
        type: "view",
        layout: function (make, view) {
          make.left.right.inset(15)
          make.height.equalTo(80)
          make.center.equalTo(view.super)
        },
        views: [ui.genAppShowView(myApps[i].appIcon, myApps[i].appName, (myApps[i].subtitle != "") ? myApps[i].subtitle : myApps[i].appCate, buttonText, function(buttonView) {
          buttonView.userInteractionEnabled = false
          buttonView.title = ""
          buttonView.updateLayout(function (make, view) {
            make.size.equalTo($size(30, 30))
          })
          $ui.animate({
            duration: 0.2,
            animation: function () {
              buttonView.relayout()
            },
            completion: async function () {
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
                    ctx.strokeColor = utils.themeColor.appButtonBgColor
                    ctx.setLineWidth(2.5)
                    ctx.addArc(15, 15, 14, 0, 3 / 2 * 3.14)
                    ctx.strokePath()
                  }
                },
              })
              let radius = 0;
              let timer = $timer.schedule({
                interval: 0.01,
                handler: function () {
                  if (buttonView.get("canvas")) {
                    buttonView.get("canvas").rotate(radius)
                    radius = radius + Math.PI / 180 * 6
                  } else {
                    timer.invalidate()
                  }
                }
              });
              let apps = utils.getCache("cloudApps", [])
              for(let j = 0; j < cloudApps.length; j++) {
                if (apps[j].objectId == myApps[i].objectId) {
                  myApps[i].onStore = !myApps[i].onStore
                  apps[j].onStore = myApps[i].onStore
                  await api.uploadOnStore(apps[j].objectId, apps[j].onStore);
                  break;
                }
              }
              $cache.set("cloudApps", apps);
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
                    buttonView.title = (myApps[i].onStore)?"上架中":"下架中"
                    buttonView.titleColor = (myApps[i].onStore)?utils.getCache("themeColor"):utils.themeColor.appCateTextColor
                  })
                  $ui.animate({
                    duration: 0.2,
                    animation: function () {
                      buttonView.relayout()
                    },
                    completion: function () {
                      $app.notify({
                        name: "refreshAll",
                        object: {}
                      });
                      buttonView.userInteractionEnabled = true
                      $device.taptic(2);
                      $delay(0.2, () => {
                        $device.taptic(2);
                      })
                    }
                  })
                }
              })
            }
          })
        }, {
          textColor: (!myApps[i].onStore)?utils.themeColor.appCateTextColor:undefined,
        })]
      }]
    })
  }
  $ui.push({
    props: {
      id: "manageMyAppsView",
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
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
    views: [ui.genPageHeader("个人", "我的应用"), {
      type: "list",
      props: {
        style: 0,
        bgcolor: $color("clear"),
        indicatorInsets: $insets(0, 0, 0, 0),
        indicatorStyle: utils.themeColor.indicatorStyle,
        separatorColor: utils.themeColor.separatorColor,
        separatorInset: $insets(0, 85, 0, 15),
        separatorHidden: ($app.info.build >= 497)?false:true,
        header: {
          type: "view",
          props: {
            height: 10,
          },
          views: []
        },
        footer: {
          type: "view",
          props: {
            height: 30,
            bgcolor: $color("clear"),
          }
        },
        rowHeight: 80,
        data: appViewItems,
      },
      layout: function(make, view) {
        make.top.equalTo(view.prev.bottom)
        make.left.right.bottom.inset(0)
        make.centerX.equalTo(view.super)
      },
    }]
  })
}

module.exports = {
  setupUserCenterView: setupUserCenterView,
}