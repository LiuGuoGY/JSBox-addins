let ui = require('scripts/ui')
let utils = require('scripts/utils')
let user = require('scripts/user')
let api = require('scripts/api')

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
  },]
  let userView = {
    type: "view",
    props: {
      id: "userCenterSubView",
    },
    layout: $layout.fill,
    views: [{
      type: "list",
      props: {
        bgcolor: $color("clear"),
        template: userTemplate,
        indicatorInsets: $insets(45, 0, 50, 0),
        separatorColor: utils.themeColor.separatorColor,
        header: {
          type: "view",
          props:{
            height: 20,
          },
          views: []
        },
        footer: {
          type: "view",
          props:{
            height: 110,
          },
          views: [{
            type: "button",
            props: {
              title: "退出登录",
              bgcolor: utils.themeColor.commentBgColor,
              titleColor: utils.getCache("themeColor"),
              font: $font("bold", 16),
              radius: 12,
            },
            layout: function(make, view) {
              make.left.right.inset(20)
              make.center.equalTo(view.super)
              make.height.equalTo(45)
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
          }],
        },
        data: infoArray,
      },
      layout: function(make, view) {
        make.top.inset(0)
        make.bottom.inset(0)
        make.left.right.inset(0)
      },
      events: {
        didSelect: function(sender, indexPath, title) {
          switch(indexPath.row + indexPath.section) {
            case 2: setupMyPraiseView();break;
            case 3: setupMyCommentsView();break;
            default:break;
          }
        }
      }
    }]
  }
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
          id: "comments_time",
          textColor: utils.themeColor.appHintColor,
          font: $font("PingFangSC-Regular", 14),
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(5)
          make.height.equalTo(20)
          make.left.right.inset(15)
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
    if(cloudApps[i].authorId === user.getLoginUser().objectId && cloudApps[i].comment.length > 0) {
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
          indicatorInsets: $insets(45, 0, 50, 0),
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
                ui.showToastView($("myPraiseView"), utils.mColor.red, "赞赏链接不可为空");
              } else {
                $ui.alert({
                  title: "提示",
                  message: "确定要上传该设置？",
                  actions: [{
                    title: "确定",
                    handler: async function () {
                      ui.showToastView($("myPraiseView"), utils.mColor.blue, "正在上传设置中...");
                      await user.setPraise($("praiseInput").text)
                      let userInfo = user.getLoginUser()
                      userInfo.praise = $("praiseInput").text
                      user.saveUser(userInfo)
                      let cloudApps = utils.getCache("cloudApps", [])
                      for(let i = 0; i < cloudApps.length; i++) {
                        if(cloudApps[i].authorId === user.getLoginUser().objectId) {
                          if(!cloudApps[i].praise || cloudApps[i].praise != $("praiseInput").text) {
                            await api.uploadPraise(cloudApps[i].objectId, $("praiseInput").text)
                          }
                        }
                      }
                      ui.showToastView($("myPraiseView"), utils.mColor.green, "设置成功");
                      $app.notify({
                        name: "refreshAll",
                        object: {"a": "b"}
                      });
                      $delay(0.5, ()=>{
                        $ui.pop();
                      })
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

module.exports = {
  setupUserCenterView: setupUserCenterView,
}