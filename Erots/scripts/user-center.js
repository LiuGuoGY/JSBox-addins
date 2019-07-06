let ui = require('scripts/ui')
let utils = require('scripts/utils')
let user = require('scripts/user')

function setupUserCenterView(prevTitle) {
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
          make.right.equalTo(view.prev.left).inset(2);
          make.centerY.equalTo(view.super);
        }
      },]
    }]
  }
  let userInfo = user.getLoginUser()
  $console.info(userInfo);
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
            case 2: setupMyCommentsView();break;
            default:break;
          }
        }
      }
    }]
  }
  $ui.push({
    props: {
      id: "userCenterView",
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
    },
    views: [ui.genPageHeader("主页", "个人中心"), {
      type: "view",
      layout: function(make, view) {
        make.top.equalTo(view.prev.bottom)
        make.left.right.bottom.inset(0)
        make.centerX.equalTo(view.super)
      },
      views: [userView]
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
        make.height.equalTo(150)
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
          make.top.equalTo(view.prev.bottom).inset(10)
          make.left.right.inset(15)
        },
      }]
    }]
  }
  let cloudApps = utils.getCache("cloudApps", [])
  let comments = []
  for(let i = 0; i < cloudApps.length; i++) {
    if(cloudApps[i].authorId === user.getLoginUser().objectId && cloudApps[i].comment.length > 0) {
      let subComents = []
      for(let j = 0; j < cloudApps[i].comment.length; j++) {
        subComents.push({
          comments_name: {
            text: cloudApps[i].comment[j].name,
          },
          comments_text: {
            text: cloudApps[i].comment[j].comment,
          }
        })
      }
      comments.push({
        title: cloudApps[i].appName,
        rows: subComents,
      })
    }
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
          data: comments,
          rowHeight: 180,
          selectable: false,
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

module.exports = {
  setupUserCenterView: setupUserCenterView,
}