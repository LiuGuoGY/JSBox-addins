let utils = require('scripts/utils')
let ui = require('scripts/ui')
let user = require('scripts/user')
let logUpView = require('scripts/login-view')
let api = require('scripts/api')
let appUtils = require('scripts/app-utils')

let objectId = ""
let topOffset = -20

$app.listen({
  refreshAll: function (object) {
    $console.info(object);
    if (object.appItem) {
      refreshAppItemView()
    }
  },
  refreshItemView: function (object) {
    if (object.onStore) {
      refreshAppItemView()
    } else {
      genNotOnStoreView()
    }
  },
});

function getAppItem(id) {
  let cloudApps = utils.getCache("cloudApps", [])
  for (let i = 0; i < cloudApps.length; i++) {
    if (cloudApps[i].objectId == id) {
      return cloudApps[i];
    }
  }
  return null;
}

function show(id) {
  let app = getAppItem(id);
  let subview = {};
  if(app && app.onStore) {
    subview = genAppItemShowView(app);
    objectId = id;
  } else {
    subview = genNotOnStoreView();
  }
  $ui.push({
    props: {
      id: "appItemViewParent",
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
    },
    views: [subview]
  });
  if(app.onStore) {
    resizeItemScroll()
    $("appPreviewPhotosScroll").resize()
    $("appPreviewPhotosScroll").contentSize = $size($("appPreviewPhotosScroll").contentSize.width + 20, 0)
    if($("heart_lottie_view")) { // 赞赏动画
      $("heart_lottie_view").play();
    }
  }
}

function preview(id) {
  objectId = id
  $ui.push({
    props: {
      id: "appItemViewParent",
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
    },
    views: [{
      type: "view",
      props: {
        id: "appItemView",
      },
      layout: $layout.fill,
      views: [ui.genPageHeader("主页", ""), ui.genLoadingView()]
    }]
  });
}

function genNotOnStoreView() {
  return {
    type: "view",
    props: {
      id: "appItemView",
    },
    layout: $layout.fill,
    views: [ui.genPageHeader("主页", ""), {
      type: "label",
      props: {
        text: "此应用已下架",
        align: $align.center,
        font: $font(15),
        textColor: utils.themeColor.appObviousColor,
      },
      layout: function (make, view) {
        make.center.equalTo(view.super)
      }
    }]
  };
}

function resizeItemScroll() {
  $("appItemShowScroll").resize()
  $("appItemShowScroll").contentSize = $size(0, $("appItemShowScroll").contentSize.height + 50)
}

function refreshAppItemView() {
  if ($("appItemView")) {
    $("appItemView").remove()
    $("appItemViewParent").add(genAppItemShowView(getAppItem(objectId)))
    $("appItemShowScroll").resize()
    $("appItemShowScroll").contentSize = $size(0, $("appItemShowScroll").contentSize.height + 50)
    $("appPreviewPhotosScroll").resize()
    $("appPreviewPhotosScroll").contentSize = $size($("appPreviewPhotosScroll").contentSize.width + 20, 0)
  }
}

function genAppItemShowView(app) {
  let buttonText = ""
  if (app.haveInstalled) {
    if (app.needUpdate) {
      buttonText = "更新"
    } else {
      buttonText = "打开"
    }
  } else {
    buttonText = "获取"
  }
  let comments = app.comment
  let commentView = {}
  let commentSubviews = []
  if (comments && comments.length > 0) {
    let showLength = (comments.length > 10)?10:comments.length;
    for (let i = 0; i < showLength; i++) {
      let cardSubViews = []
      let commentSize = $text.sizeThatFits({
        text: comments[comments.length - i - 1].comment,
        width: $device.info.screen.width - 70,
        font: $font("PingFangSC-Regular", 15),
      })
      let haveReply = comments[comments.length - i - 1].reply
      let showCommentMore = false
      let commentHeight = undefined
      if (!haveReply && commentSize.height > 147) {
        commentHeight = 147
        showCommentMore = true
      } else if (haveReply && commentSize.height > 63) {
        commentHeight = 63//66
        showCommentMore = true
      }
      cardSubViews = [{
        type: "label",
        props: {
          text: comments[comments.length - i - 1].name,
          textColor: utils.themeColor.appHintColor,
          font: $font("PingFangSC-Regular", 15),
        },
        layout: function (make, view) {
          make.top.inset(10)
          make.height.equalTo(20)
          make.left.inset(15)
        },
      }, {
        type: "label",
        props: {
          text: utils.getUpdateDateString(comments[comments.length - i - 1].time),
          textColor: utils.themeColor.appHintColor,
          font: $font("PingFangSC-Regular", 14),
        },
        layout: function (make, view) {
          make.top.inset(10)
          make.height.equalTo(20)
          make.right.inset(15)
        },
      }, {
        type: "label",
        props: {
          text: comments[comments.length - i - 1].comment,
          textColor: utils.themeColor.listHeaderTextColor,
          font: $font("PingFangSC-Regular", 15),
          align: $align.justified,
          bgcolor: $color("clear"),
          lines: 0,
        },
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(7)
          make.left.right.inset(15)
          if (commentHeight) {
            make.height.equalTo(commentHeight)
          }
        },
      }, {
        type: "gradient",
        props: {
          colors: [utils.getThemeMode() == "dark" ? $rgba(32, 32, 32, 0.0) : $rgba(240, 240, 248, 0.0), utils.themeColor.commentBgColor],
          locations: [0.0, 0.3],
          startPoint: $point(0, 0.5),
          endPoint: $point(1, 0.5),
          hidden: !showCommentMore,
          bgcolor: $color("clear"),
        },
        layout: function (make, view) {
          make.right.bottom.equalTo(view.prev)
          make.width.equalTo(50)
          make.height.equalTo(20)
        },
        views: [{
          type: "button",
          props: {
            title: "更多",
            font: $font("PingFangSC-Regular", 15),
            titleColor: utils.getCache("themeColor"),
            bgcolor: $color("clear"),
            radius: 0,
            contentEdgeInsets: $insets(2, 5, 2, 0),
          },
          layout: function (make, view) {
            make.right.equalTo(view.super)
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
          },
          events: {
            tapped: function (sender) {
              genCommentDetailView(comments[comments.length - i - 1])
            }
          }
        }],
      }]
      if (haveReply) {
        let replySize = $text.sizeThatFits({
          text: comments[comments.length - i - 1].reply,
          width: $device.info.screen.width - 70,
          font: $font("PingFangSC-Regular", 15),
        })
        let showReplyMore = false
        let replyHeight = undefined
        if (commentSize.height > 63 && replySize.height > 46) {
          replyHeight = 46
          showReplyMore = true
        } else if (commentSize.height <= 63 && replySize.height > 106 - commentSize.height) {
          replyHeight = 106 - commentSize.height
          showReplyMore = true
        }
        cardSubViews.push({
          type: "label",
          props: {
            text: "开发者回复",
            textColor: utils.themeColor.appHintColor,
            font: $font("PingFangSC-Regular", 15),
          },
          layout: function (make, view) {
            make.top.equalTo(view.prev.bottom).inset(10)
            make.height.equalTo(20)
            make.left.inset(15)
          },
        }, {
            type: "label",
            props: {
              text: utils.getUpdateDateString(comments[comments.length - i - 1].replyTime),
              textColor: utils.themeColor.appHintColor,
              font: $font("PingFangSC-Regular", 14),
            },
            layout: function (make, view) {
              make.centerY.equalTo(view.prev)
              make.height.equalTo(20)
              make.right.inset(15)
            },
          }, {
            type: "label",
            props: {
              text: comments[comments.length - i - 1].reply,
              textColor: utils.themeColor.listHeaderTextColor,
              font: $font("PingFangSC-Regular", 15),
              align: $align.justified,
              bgcolor: $color("clear"),
              lines: 0,
            },
            layout: function (make, view) {
              make.top.equalTo(view.prev.bottom).inset(7)
              make.left.right.inset(15)
              if (replyHeight) {
                make.height.equalTo(replyHeight)
              }
            },
          }, {
            type: "gradient",
            props: {
              colors: [utils.getThemeMode() == "dark" ? $rgba(32, 32, 32, 0.0) : $rgba(240, 240, 248, 0.0), utils.themeColor.commentBgColor],
              locations: [0.0, 0.3],
              startPoint: $point(0, 0.5),
              endPoint: $point(1, 0.5),
              hidden: !showReplyMore,
              bgcolor: $color("clear"),
            },
            layout: function (make, view) {
              make.right.bottom.equalTo(view.prev)
              make.width.equalTo(50)
              make.height.equalTo(20)
            },
            views: [{
              type: "button",
              props: {
                title: "更多",
                font: $font("PingFangSC-Regular", 15),
                titleColor: utils.getCache("themeColor"),
                bgcolor: $color("clear"),
                radius: 0,
                contentEdgeInsets: $insets(2, 5, 2, 0),
              },
              layout: function (make, view) {
                make.right.equalTo(view.super)
                make.centerY.equalTo(view.super)
                make.height.equalTo(view.super)
              },
              events: {
                tapped: function (sender) {
                  genCommentDetailView(comments[comments.length - i - 1])
                }
              }
            }],
          })
      }
      let longPressMenu = {
        items: [
          {
            title: "复制评论",
            symbol: "doc.on.doc",
            handler: sender => {
              let replyText = (haveReply)?("\n开发者回复" + "\n" + comments[comments.length - i - 1].reply):"";
              $clipboard.text = comments[comments.length - i - 1].name + "\n" + comments[comments.length - i - 1].comment + replyText;
              ui.showToastView($("appItemView"), utils.mColor.green, "已复制");
            }
          }
        ]
      }
      if((user.haveLogined() && comments[comments.length - i - 1].time && user.getLoginUser().objectId == app.authorId)) {
        longPressMenu.items.push({
          title: "回复评论",
          symbol: "arrowshape.turn.up.left",
          handler: sender => {
            $delay(0.05, ()=>{
              genCommentReplyView(app, comments.length - i - 1);
            })
          }
        })
      }
      commentSubviews.push({
        type: "view",
        layout: function (make, view) {
          make.top.inset(0)
          make.height.equalTo(view.super)
          make.width.equalTo($device.info.screen.width - 30)
          if (i == 0) {
            make.left.inset(0)
          } else {
            make.left.equalTo(view.prev.right).inset(0)
          }
        },
        views: [{
          type: "view",
          props: {
            bgcolor: utils.themeColor.commentBgColor,
            radius: 8,
            menu: longPressMenu,
          },
          layout: function (make, view) {
            make.top.bottom.inset(0)
            make.left.inset(0)
            make.right.inset(10)
            make.center.equalTo(view.super)
          },
          events: {
            longPressed: function (sender) {
              let userInfo = user.getLoginUser()
              if (user.haveLogined() && comments[comments.length - i - 1].time && userInfo.objectId == app.authorId) {
                $device.taptic(0);
                $ui.menu({
                  items: ["回复评论"],
                  handler: function (title, idx) {
                    switch (idx) {
                      case 0: {
                        genCommentReplyView(app, comments.length - i - 1);
                        break;
                      }
                    }
                  }
                });
              }
            }
          },
          views: cardSubViews,
        }]
      })
    }
    commentView = {
      type: "view",
      layout: function (make, view) {
        make.top.equalTo(view.prev.bottom).inset(10)
        make.height.equalTo(200)
        make.left.right.inset(0)
      },
      views: [{
        type: "scroll",
        props: {
          alwaysBounceHorizontal: true,
          alwaysBounceVertical: false,
          userInteractionEnabled: true,
          showsHorizontalIndicator: false,
          showsVerticalIndicator: false,
          clipsToBounds: false,
          pagingEnabled: true,
        },
        layout: function (make, view) {
          make.top.bottom.inset(0)
          make.left.inset(20)
          make.right.inset(10)
          make.center.equalTo(view.super)
        },
        views: commentSubviews,
      }]
    }
  } else {
    commentView = {
      type: "label",
      props: {
        text: "此应用尚未收到评论。",
        font: $font(15),
        align: $align.center,
        textColor: $color("gray"),
      },
      layout: function (make, view) {
        make.top.equalTo(view.prev.bottom).inset(0)
        make.height.equalTo(30)
        make.left.inset(20)
      },
    }
  }
  let appInstSize = sizeOfLabelView({
    text: app.instruction,
    lines: 0,
    font: $font("PingFangSC-Regular", 15),
    attributedText: utils.setLineSpacing(app.instruction, 5),
    align: $align.left,
  }, $device.info.screen.width - 40)
  let appVerInstSize = sizeOfLabelView({
    text: app.versionInst,
    lines: 0,
    font: $font("PingFangSC-Regular", 15),
    attributedText: utils.setLineSpacing(app.instruction, 5),
    align: $align.left,
  }, $device.info.screen.width - 40)
  let appInstFoldSize = sizeOfLabelView({
    text: app.instruction,
    lines: 3,
    font: $font("PingFangSC-Regular", 15),
    attributedText: utils.setLineSpacing(app.instruction, 5),
    align: $align.left,
  }, $device.info.screen.width - 40)
  let appVerInstFoldSize = sizeOfLabelView({
    text: app.versionInst,
    lines: 3,
    font: $font("PingFangSC-Regular", 15),
    attributedText: utils.setLineSpacing(app.instruction, 5),
    align: $align.left,
  }, $device.info.screen.width - 40)
  let coverOffset = (app.cover && app.cover != "")?140:0;
  return {
    type: "view",
    props: {
      id: "appItemView",
    },
    layout: $layout.fill,
    events: {
      ready(sender) {
        $delay(0.1, () => {
          if($("appItemShowScroll")) {
            topOffset = $("appItemShowScroll").contentOffset.y
          }
        })
      },
    },
    views: [{
      type: "scroll",
      props: {
        id: "appItemShowScroll",
        indicatorStyle: utils.themeColor.indicatorStyle,
        indicatorInsets: $insets(60, 0, 0, 0),
      },
      layout: function (make, view) {
        make.left.right.bottom.inset(0)
        make.top.inset(0).offset(-20)
        make.centerX.equalTo(view.super)
      },
      events: {
        didScroll: function(sender) {
          if (sender.contentOffset.y >= 10 + topOffset + coverOffset && $("itemPageHeaderBlur").alpha == 0) {
            $ui.animate({
              duration: 0.2,
              animation: function () {
                $("itemPageHeaderBlur").alpha = 1;
              },
            });
          } else if (sender.contentOffset.y < 10 + topOffset + coverOffset && $("itemPageHeaderBlur").alpha == 1) {
            $ui.animate({
              duration: 0.2,
              animation: function () {
                $("itemPageHeaderBlur").alpha = 0;
              },
            });
          }
          if (sender.contentOffset.y >= 110 + topOffset + coverOffset && $("itemPageHeaderTitle").alpha == 0) {
            $ui.animate({
              duration: 0.2,
              animation: function () {
                $("itemPageHeaderTitle").alpha = 1;
              },
            });
          } else if (sender.contentOffset.y < 110 + topOffset + coverOffset && $("itemPageHeaderTitle").alpha == 1) {
            $ui.animate({
              duration: 0.2,
              animation: function () {
                $("itemPageHeaderTitle").alpha = 0;
              },
            });
          }
        }
      },
      views: [{
        type: "image",
        props: {
          src: (app.cover)?app.cover:"",
          contentMode: $contentMode.scaleAspectFill,
        },
        layout: function (make, view) {
          make.left.right.inset(0)
          make.top.inset(0)
          if(app.cover && app.cover != "") {
            make.height.equalTo(200)
          } else {
            make.height.equalTo(60)
          }
          make.centerX.equalTo(view.super)
        },
      },{
        type: "view",
        layout: function (make, view) {
          make.left.right.inset(20)
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(120)
          make.centerX.equalTo(view.super)
        },
        views: [{
          type: "view",
          props: {
            borderColor: utils.themeColor.iconBorderColor,
            borderWidth: 1.2,
            smoothRadius: 17,
          },
          layout: function (make, view) {
            make.left.inset(0)
            make.size.equalTo($size(90, 90))
            make.centerY.equalTo(view.super)
          },
          views: [ui.genIconView(app.appIcon)]
        }, {
          type: "view",
          layout: function (make, view) {
            make.left.equalTo(view.prev.right).inset(15)
            make.bottom.equalTo(view.prev.bottom)
            make.right.inset(0)
            make.height.equalTo(30)
          },
          views: [{
            type: "view",
            layout: function (make, view) {
              make.left.inset(0)
              make.centerY.equalTo(view.super)
              make.size.equalTo($size(75, 30))
            },
            views: [{
              type: "button",
              props: {
                title: buttonText,
                bgcolor: utils.themeColor.appButtonBgColor,
                titleColor: utils.getCache("themeColor"),
                font: $font("bold", 15),
                radius: 15,
                align: $align.center,
              },
              layout: function (make, view) {
                make.center.equalTo(view.super)
                make.size.equalTo($size(75, 30))
              },
              events: {
                tapped: function (sender) {
                  if (!app.needUpdate && app.haveInstalled) {
                    $addin.run(app.appName)
                  } else {
                    if(!appUtils.isOSSuit(app)) {
                      $ui.alert({
                        title: "提示",
                        message: "当前的系统版本过低，最低要求 iOS" + app.needIOSVersion + "，确定安装？",
                        actions: [
                          {
                            title: "安装",
                            // style: $alertActionType.destructive, // Optional
                            handler: function() {
                              appUtils.installApp(app, sender, ()=>{
                                $device.taptic(2);
                                $delay(0.2, () => { $device.taptic(2); })
                                $delay(0.5, () => {
                                  $app.notify({
                                    name: "refreshAll",
                                    object: { appItem: false }
                                  });
                                })
                              })
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
                      appUtils.installApp(app, sender, ()=>{
                        $device.taptic(2);
                        $delay(0.2, () => { $device.taptic(2); })
                        $delay(0.5, () => {
                          $app.notify({
                            name: "refreshAll",
                            object: { appItem: false }
                          });
                        })
                      })
                    }
                  }
                }
              },
            }]
          }, {
            type: "label",
            props: {
              text: "需要 iOS" + app.needIOSVersion,
              font: $font(11),
              textColor: utils.themeColor.appCateTextColor,
              align: $align.left,
              hidden: (app.needIOSVersion)?appUtils.isOSSuit(app):true,
            },
            layout: function (make, view) {
              make.left.equalTo(view.prev.right).inset(15)
              make.centerY.equalTo(view.prev)
            }
          }, {
            type: "button",
            props: {
              title: "",//"⋯",
              bgcolor: utils.themeColor.appButtonBgColor,
              titleColor: utils.getCache("themeColor"),
              font: $font("bold", 20),
              circular: true,
              align: $align.center,
              menu: {
                pullDown: true,
                asPrimary: true,
                items: [
                  {
                    title: "分享链接",
                    symbol: "square.and.arrow.up",
                    handler: sender => {
                      $share.sheet(["https://liuguogy.github.io/JSBox-addins/?q=show&objectId=" + app.objectId]);
                    }
                  },
                  {
                    title: "失效反馈",
                    symbol: "exclamationmark.octagon",
                    handler: sender => {
                      ui.showToastView($("appItemView"), utils.mColor.blue, "请在下方评论来告诉开发者吧！");
                    }
                  },
                ]
              }
            },
            layout: function (make, view) {
              make.centerY.equalTo(view.super)
              make.right.inset(0)
              make.size.equalTo($size(30, 30))
            },
            events: {
              tapped: function (sender) {
                $ui.menu({
                  items: ["分享链接", "失效反馈"],
                  handler: function (title, idx) {
                    switch (idx) {
                      case 0: $share.sheet(["https://liuguogy.github.io/JSBox-addins/?q=show&objectId=" + app.objectId]); break;
                      case 1: ui.showToastView($("appItemView"), utils.mColor.blue, "请在下方评论来告诉开发者吧！");break;
                      default: break;
                    }
                  }
                });
              }
            },
            views: [{
              type: "canvas",
              props: {
                userInteractionEnabled: false,
              },
              layout: $layout.fill,
              events: {
                draw: function (view, ctx) {
                  ctx.fillColor = utils.getCache("themeColor")
                  ctx.strokeColor = utils.getCache("themeColor")
                  ctx.setLineWidth(2)
                  ctx.addArc(view.frame.width / 2, view.frame.height / 2, 1, 0, 2 * Math.PI, true)
                  ctx.strokePath()
                  ctx.addArc(view.frame.width / 2 - 6, view.frame.height / 2, 1, 0, 2 * Math.PI, true)
                  ctx.strokePath()
                  ctx.addArc(view.frame.width / 2 + 6, view.frame.height / 2, 1, 0, 2 * Math.PI, true)
                  ctx.strokePath()
                }
              }
            }]
          }]
        }, {
          type: "label",
          props: {
            text: app.appName,
            font: $font("PingFangSC-Medium", 20),
            textColor: utils.themeColor.listHeaderTextColor,
            align: $align.left,
          },
          layout: function (make, view) {
            make.left.equalTo(view.prev.left).inset(0)
            make.right.inset(0)
            make.top.equalTo(view.prev.prev.top)
          }
        }, {
          type: "label",
          props: {
            text: (app.subtitle != "") ? app.subtitle : app.appCate,
            font: $font(13),
            textColor: utils.themeColor.appCateTextColor,
            align: $align.left,
          },
          layout: function (make, view) {
            make.left.equalTo(view.prev.left)
            make.right.equalTo(view.prev)
            make.top.equalTo(view.prev.bottom).inset(3)
          }
        },]
      }, {
        type: "view",
        props: {
          clipsToBounds: true,
          hidden: !app.racing,
        },
        layout: function (make, view) {
          make.left.right.inset(0)
          make.top.equalTo(view.prev.bottom)
          make.centerX.equalTo(view.super)
          if(app.racing) {
            make.height.equalTo(80)
          } else {
            make.height.equalTo(0)
          }
        },
        views: [{
          type: "view",
          props: {
            bgcolor: $color(utils.mColor.green),
          },
          layout: function (make, view) {
            make.left.right.inset(20)
            make.center.equalTo(view.super)
            make.height.equalTo(60)
            shadow(view)
          },
          views: [{
            type: "label",
            props: {
              text: "参赛作品",
              font: $font("PingFangSC-Semibold", 21),
              align: $align.center,
              textColor: $color("white"),
            },
            layout: function (make, view) {
              make.top.inset(5)
              make.centerX.equalTo(view.super)
            },
          },{
            type: "label",
            props: {
              text: "第一届脚本作品竞赛",
              font: $font("PingFangSC-Regular", 13),
              align: $align.center,
              textColor: $color("white"),
            },
            layout: function (make, view) {
              make.centerX.equalTo(view.super)
              make.bottom.inset(5)
            },
          }]
        }]
      }, {
        type: "canvas",
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(1 / $device.info.screen.scale)
          make.left.right.inset(20)
        },
        events: {
          draw: function (view, ctx) {
            var width = view.frame.width
            var scale = $device.info.screen.scale
            ctx.strokeColor = $color("systemSeparator");
            ctx.setLineWidth(1);
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      }, {
        type: "view",
        layout: function (make, view) {
          make.left.right.inset(0)
          make.top.equalTo(view.prev.bottom).inset(10)
          make.centerX.equalTo(view.super)
          make.height.equalTo(60)
        },
        views: [{
          type: "view",
          layout: function (make, view) {
            make.width.equalTo(view.super).multipliedBy(0.35)
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
            make.left.inset(20)
          },
          views: [{
            type: "label",
            props: {
              text: (app.author) ? app.author : "无",
              font: $font("PingFangSC-Medium", 20),
              align: $align.center,
              textColor: $color("gray"),
            },
            layout: function (make, view) {
              make.top.inset(10)
              make.height.equalTo(23)
              make.centerX.equalTo(view.super)
            },
          }, {
            type: "label",
            props: {
              text: "开发者",
              font: $font(11),
              align: $align.center,
              textColor: utils.themeColor.appHintColor,
            },
            layout: function (make, view) {
              make.top.equalTo(view.prev.bottom).inset(5)
              make.height.equalTo(15)
              make.centerX.equalTo(view.super)
            },
          }]
        }, {
          type: "view",
          layout: function (make, view) {
            make.width.equalTo(view.super).multipliedBy(0.3)
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
            make.left.equalTo(view.prev.right)
          },
          views: [{
            type: "label",
            props: {
              text: "" + app.comment.length,
              font: $font("PingFangSC-Medium", 20),
              align: $align.center,
              textColor: $color("gray"),
            },
            layout: function (make, view) {
              make.top.inset(10)
              make.height.equalTo(23)
              make.centerX.equalTo(view.super)
            },
          }, {
            type: "label",
            props: {
              text: "评论",
              font: $font(11),
              align: $align.center,
              textColor: utils.themeColor.appHintColor,
            },
            layout: function (make, view) {
              make.top.equalTo(view.prev.bottom).inset(5)
              make.height.equalTo(15)
              make.centerX.equalTo(view.super)
            },
          }]
        },{
          type: "view",
          layout: function (make, view) {
            make.width.equalTo(view.super).multipliedBy(0.3)
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
            make.right.inset(20)
          },
          views: [{
            type: "label",
            props: {
              text: "" + app.downloadTimes,
              font: $font("PingFangSC-Medium", 20),
              align: $align.center,
              textColor: $color("gray"),
            },
            layout: function (make, view) {
              make.top.inset(10)
              make.height.equalTo(23)
              make.centerX.equalTo(view.super)
            },
          }, {
            type: "label",
            props: {
              text: "下载量",
              font: $font(11),
              align: $align.center,
              textColor: utils.themeColor.appHintColor,
            },
            layout: function (make, view) {
              make.top.equalTo(view.prev.bottom).inset(5)
              make.height.equalTo(15)
              make.centerX.equalTo(view.super)
            },
          }]
        }]
      }, {
        type: "canvas",
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(1 / $device.info.screen.scale)
          make.left.right.inset(20)
        },
        events: {
          draw: function (view, ctx) {
            var width = view.frame.width
            ctx.strokeColor = $color("systemSeparator");
            ctx.setLineWidth(1);
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      }, {
        type: "view",
        layout: function (make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom)
          make.height.equalTo(90)
          make.left.right.inset(0)
        },
        views: [{
          type: "view",
          layout: function (make, view) {
            make.top.inset(10)
            make.height.equalTo(50)
            make.left.right.inset(0)
          },
          views: [{
            type: "label",
            props: {
              text: "新功能",
              font: $font("bold", 22),
              align: $align.center,
              textColor: utils.themeColor.listHeaderTextColor,
            },
            layout: function (make, view) {
              make.top.inset(0)
              make.height.equalTo(50)
              make.left.inset(20)
            },
          }, {
            type: "button",
            props: {
              title: "版本历史记录",
              bgcolor: $color("clear"),
              titleColor: utils.getCache("themeColor"),
              font: $font(17),
            },
            layout: function (make, view) {
              make.top.inset(0)
              make.height.equalTo(50)
              make.right.inset(20)
            },
            events: {
              tapped: function (sender) {
                genUpdateHistoryView(app)
              }
            }
          },]
        }, {
          type: "view",
          layout: function (make, view) {
            make.top.equalTo(view.prev.bottom)
            make.height.equalTo(25)
            make.width.equalTo(view.super)
          },
          views: [{
            type: "label",
            props: {
              text: "版本 " + app.appVersion,
              font: $font(14),
              align: $align.center,
              textColor: utils.themeColor.appCateTextColor,
            },
            layout: function (make, view) {
              make.centerY.equalTo(view.super)
              make.height.equalTo(25)
              make.left.inset(20)
            },
          }, {
            type: "label",
            props: {
              text: utils.getUpdateDateString((app.updateTime) ? app.updateTime : app.updatedAt),
              font: $font(14),
              align: $align.center,
              textColor: utils.themeColor.appCateTextColor,
            },
            layout: function (make, view) {
              make.centerY.equalTo(view.super)
              make.height.equalTo(25)
              make.right.inset(20)
            },
          }]
        },]
      }, {
        type: "label",
        props: {
          id: "appVerInstLabel",
          text: app.versionInst,
          align: $align.left,
          lines: 3,
          font: $font("PingFangSC-Regular", 15),
          attributedText: utils.setLineSpacing(app.versionInst, 5),
          textColor: utils.themeColor.listContentTextColor,
        },
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(5)
          make.left.right.inset(20)
          make.centerX.equalTo(view.super)
        }
      }, {
        type: "gradient",
        props: {
          colors: [utils.getThemeMode() == "dark" ? $rgba(0, 0, 0, 0.0) : $rgba(255, 255, 255, 0.0), utils.themeColor.mainColor],
          locations: [0.0, 0.3],
          startPoint: $point(0, 0.5),
          endPoint: $point(1, 0.5),
          hidden: (appVerInstSize.height <= appVerInstFoldSize.height),
          bgcolor: $color("clear"),
        },
        layout: function (make, view) {
          make.right.bottom.equalTo(view.prev)
          make.width.equalTo(50)
          make.height.equalTo(20)
        },
        views: [{
          type: "button",
          props: {
            title: "更多",
            font: $font("PingFangSC-Regular", 15),
            titleColor: utils.getCache("themeColor"),
            bgcolor: $color("clear"),
            radius: 0,
            contentEdgeInsets: $insets(2, 5, 2, 0),
          },
          layout: function (make, view) {
            make.right.equalTo(view.super)
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
          },
          events: {
            tapped: function (sender) {
              sender.super.hidden = true;
              $("appVerInstLabel").lines = 0;
              resizeItemScroll()
            }
          }
        }],
      }, {
        type: "canvas",
        layout: function (make, view) {
          if (app.previews.length > 0) {
            make.top.equalTo(view.prev.bottom).inset(20)
            make.height.equalTo(1 / $device.info.screen.scale)
          } else {
            make.top.equalTo(view.prev.bottom).inset(0)
            make.height.equalTo(0)
          }
          make.left.right.inset(20)
        },
        events: {
          draw: function (view, ctx) {
            var width = view.frame.width;
            ctx.strokeColor = $color("systemSeparator");
            ctx.setLineWidth(1);
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      }, {
        type: "label",
        props: {
          text: "预览",
          font: $font("bold", 22),
          align: $align.center,
          textColor: utils.themeColor.listHeaderTextColor,
        },
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(10)
          if (app.previews.length > 0) {
            make.height.equalTo(40)
          } else {
            make.height.equalTo(0)
          }
          make.left.inset(20)
        },
      }, {
        type: "view",
        props: {
          id: "appPreviewPhotosScrollParent",
          bgcolor: utils.themeColor.bgcolor,
        },
        layout: function (make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(0)
          if (app.previews.length > 0) {
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
            // contentSize: $size(app.previews.length * 100, 260),
            alwaysBounceHorizontal: true,
            alwaysBounceVertical: false,
            userInteractionEnabled: true,
            showsHorizontalIndicator: false,
            showsVerticalIndicator: false,
          },
          layout: function (make, view) {
            make.center.equalTo(view.super)
            make.size.equalTo(view.super)
          },
          views: [ui.genAppPreviewPhotosStack(app.previews, function (sender) {
            genAppPreviewPhotosScrollView(app.previews, sender.info)
          })],
        },]
      }, {
        type: "canvas",
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(1 / $device.info.screen.scale)
          make.left.right.inset(20)
        },
        events: {
          draw: function (view, ctx) {
            var width = view.frame.width
            ctx.strokeColor = $color("systemSeparator");
            ctx.setLineWidth(1);
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      }, {
        type: "label",
        props: {
          id: "appInstLabel",
          text: app.instruction,
          align: $align.left,
          lines: 3,
          font: $font("PingFangSC-Regular", 15),
          attributedText: utils.setLineSpacing(app.instruction, 5),
          textColor: utils.themeColor.listContentTextColor,
        },
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          make.left.right.inset(20)
          make.centerX.equalTo(view.super)
        },
      }, {
        type: "gradient",
        props: {
          colors: [utils.getThemeMode() == "dark" ? $rgba(0, 0, 0, 0.0) : $rgba(255, 255, 255, 0.0), utils.themeColor.mainColor],
          locations: [0.0, 0.3],
          startPoint: $point(0, 0.5),
          endPoint: $point(1, 0.5),
          hidden: (appInstSize.height <= appInstFoldSize.height),
          bgcolor: $color("clear"),
        },
        layout: function (make, view) {
          make.right.bottom.equalTo(view.prev)
          make.width.equalTo(50)
          make.height.equalTo(20)
        },
        views: [{
          type: "button",
          props: {
            title: "更多",
            font: $font("PingFangSC-Regular", 15),
            titleColor: utils.getCache("themeColor"),
            bgcolor: $color("clear"),
            radius: 0,
            contentEdgeInsets: $insets(2, 5, 2, 0),
          },
          layout: function (make, view) {
            make.right.equalTo(view.super)
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
          },
          events: {
            tapped: function (sender) {
              sender.super.hidden = true
              $("appInstLabel").lines = 0;
              resizeItemScroll()
            }
          }
        }],
      }, {
        type: "canvas",
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          make.height.equalTo(1 / $device.info.screen.scale)
          make.left.right.inset(20)
        },
        events: {
          draw: function (view, ctx) {
            var width = view.frame.width
            ctx.strokeColor = $color("systemSeparator");
            ctx.setLineWidth(1);
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      }, {
        type: "view",
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(50)
          make.left.right.inset(20)
        },
        views: [{
          type: "label",
          props: {
            text: "评论",
            font: $font("bold", 22),
            align: $align.center,
            textColor: utils.themeColor.listHeaderTextColor,
          },
          layout: function (make, view) {
            make.top.inset(0)
            make.height.equalTo(50)
            make.left.inset(0)
          },
        }, {
          type: "button",
          props: {
            title: "撰写评论",
            bgcolor: $color("clear"),
            titleColor: utils.getCache("themeColor"),
            font: $font(17),
          },
          layout: function (make, view) {
            make.top.inset(0)
            make.height.equalTo(50)
            make.right.inset(0)
          },
          events: {
            tapped: function (sender) {
              if (!user.haveLogined()) {
                showNotLoginError("发布评论");
              } else {
                genCommentView(app)
              }
            }
          }
        }]
      }, commentView, {
        type: "view",
        props: {
          clipsToBounds: true,
        },
        layout: function (make, view) {
          if(user.haveLogined() && user.getLoginUser().objectId == app.authorId && app.comment.length > 0) {
            make.top.equalTo(view.prev.bottom).inset(10)
            make.height.equalTo(20)
          } else {
            make.top.equalTo(view.prev.bottom)
            make.height.equalTo(0)
          }
          make.left.right.inset(20)
        },
        views: [{
          type: "image",
          props: {
            // icon: $icon("009", utils.themeColor.appHintColor , $size(14, 14)),
            symbol: "info.circle.fill",
            tintColor: utils.themeColor.appHintColor,
            bgcolor: $color("clear"),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.size.equalTo($size(17, 17))
            make.left.inset(10)
          }
        },{
          type: "label",
          props: {
            text: "长按评论可以回复",
            bgcolor: $color("clear"),
            textColor: utils.themeColor.appHintColor,
            font: $font(13),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.left.equalTo(view.prev.right).inset(5)
            make.right.inset(10)
            make.height.equalTo(view.super)
          },
        }],
      },{
        type: "canvas",
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          make.height.equalTo(1 / $device.info.screen.scale)
          make.left.right.inset(20)
        },
        events: {
          draw: function (view, ctx) {
            var width = view.frame.width
            var scale = $device.info.screen.scale
            ctx.strokeColor = $color("systemSeparator");
            ctx.setLineWidth(1);
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      }, {
        type: "label",
        props: {
          text: "信息",
          font: $font("bold", 22),
          align: $align.center,
          textColor: utils.themeColor.listHeaderTextColor,
        },
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(50)
          make.left.inset(20)
        },
      }, 
      genAppItemInfoView("开发者", (app.author) ? app.author : "无"),
      genAppItemInfoView("类别", app.appCate),
      genAppItemInfoView("大小", utils.numerToSize(app.appSize)),
      genAppItemInfoView("系统要求", (app.needIOSVersion)?("iOS"+app.needIOSVersion+"+"):"无"), 
      {
        type: "view",
        props: {
          hidden: !app.praise,
          clipsToBounds: true,
        },
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(10)
          if (app.praise) {
            make.height.equalTo(110)
          } else {
            make.height.equalTo(0)
          }
          make.left.right.inset(0)
        },
        views: [{
          type: "button",
          props: {
            // title: "赞赏作者",
            // icon: $icon("103", utils.getCache("themeColor"), $size(20, 20)),
            bgcolor: utils.themeColor.appButtonBgColor,
            titleColor: utils.getCache("themeColor"),
            font: $font("bold", 16.5),
            radius: 7,
            align: $align.center,
          },
          layout: function (make, view) {
            make.center.equalTo(view.super)
            make.size.equalTo($size(150, 50))
          },
          events: {
            tapped: function (sender) {
              $ui.alert({
                title: "提示",
                message: "开发者 " + app.author + " 为了给你更好的体验，为该应用更新了 " + (app.buildVersion) + " 个版本，你的赞赏会给开发者更多的动力。\n\n即将跳转赞赏开发者，确定跳转？",
                actions: [{
                  title: "确定",
                  handler: function () {
                    if (app.praise) {
                      $app.openURL(app.praise);
                    }
                  }
                }, {
                  title: "取消",
                  handler: function () {
                  }
                }]
              });
            }
          },
          views: [{
            type: "lottie",
            props: {
              id: "heart_lottie_view",
              src: "assets/heart-lottie.json",
              loop: true,
              userInteractionEnabled: false,
            },
            layout: (make, view) => {
              make.size.equalTo($size(40, 40));
              make.left.inset(12)
              make.centerY.equalTo(view.super).offset(-10)
            }
          }, {
            type: "label",
            props: {
              text: "  赞赏作者",
              font: $font("bold", 16.5),
              textColor: utils.getCache("themeColor"),
            },
            layout: function (make, view) {
              make.left.equalTo(view.prev.right)
              make.right.equalTo(view.super)
              make.height.equalTo(view.super)
              make.centerY.equalTo(view.super)
            }
          }]
        }, {
          type: "label",
          props: {
            text: "『 你的赞赏是开发者最大的动力 』",
            font: $font(13),
            textColor: utils.themeColor.appCateTextColor,
          },
          layout: function (make, view) {
            make.top.equalTo(view.prev.bottom).inset(14)
            make.centerX.equalTo(view.super)
          }
        }]
      },]
    },{
      type: "view",
      props: {
        id: "itemPageHeaderView",
      },
      layout: function (make, view) {
        make.left.top.right.inset(0)
        if ($device.info.version >= "11") {
          make.bottom.equalTo(view.super.topMargin).offset(35)
        } else {
          make.height.equalTo(60)
        }
      },
      views: [{
        type: "blur",
        props: {
          id: "itemPageHeaderBlur",
          style: utils.themeColor.blurType, // 0 ~ 5
          alpha: 0,
        },
        layout: $layout.fill,
      },{
        type: "view",
        layout: function (make, view) {
          make.left.bottom.right.inset(0)
          make.height.equalTo(45)
        },
        views:[{
          type: "label",
          props: {
            id: "itemPageHeaderTitle",
            text: app.appName,
            font: $font("PingFangSC-Medium", 17),
            align: $align.center,
            bgcolor: $color("clear"),
            textColor: utils.themeColor.listHeaderTextColor,
            alpha: 0,
          },
          layout: $layout.fill,
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
            views: [ui.createBack(utils.getCache("themeColor"))]
          },{
            type: "label",
            props: {
              text: "主页",
              align: $align.center,
              textColor: utils.getCache("themeColor"),
              font: $font(17)
            },
            layout: function(make, view) {
              make.height.equalTo(view.super)
              make.left.equalTo(view.prev.right).inset(3)
            }
          }],
        }]
      }]
    }]
  }
}

function genAppItemInfoView(text, detail) {
  return {
    type: "view",
    layout: function (make, view) {
      make.top.equalTo(view.prev.bottom)
      make.height.equalTo(40)
      make.left.right.inset(20)
    },
    views: [{
      type: "label",
      props: {
        text: text,
        align: $align.left,
        font: $font(14),
        textColor: utils.themeColor.appCateTextColor,
      },
      layout: function (make, view) {
        make.top.inset(0)
        make.height.equalTo(20)
        make.left.inset(0)
        make.centerY.equalTo(view.super)
      }
    }, {
      type: "label",
      props: {
        text: detail,
        align: $align.right,
        font: $font(14),
        textColor: utils.themeColor.listHeaderTextColor,
      },
      layout: function (make, view) {
        make.top.inset(0)
        make.height.equalTo(20)
        make.right.inset(0)
        make.width.equalTo(100)
        make.centerY.equalTo(view.super)
      }
    }, {
      type: "canvas",
      layout: function (make, view) {
        make.bottom.inset(0)
        make.height.equalTo(1 / $device.info.screen.scale)
        make.left.right.inset(0)
      },
      events: {
        draw: function (view, ctx) {
          var width = view.frame.width
          ctx.strokeColor = $color("systemSeparator");
          ctx.setLineWidth(1);
          ctx.moveToPoint(0, 0)
          ctx.addLineToPoint(width, 0)
          ctx.strokePath()
        }
      }
    }]
  }
}

function genAppPreviewPhotosScrollView(photos, index) {
  let items = []
  for (let i = 0; i < photos.length; i++) {
    items.push({
      type: "view",
      props: {
      },
      views: [{
        type: "image",
        props: {
          src: photos[i],
          align: $align.center,
          radius: 5,
          contentMode: $contentMode.scaleToFill,
          borderWidth: 1 / $device.info.screen.scale,
          borderColor: $color("#E0E0E0"),
        },
        layout: function(make, view) {
          make.left.right.inset(20)
          make.top.bottom.inset(40)
          make.center.equalTo(view.super)
        },
        views: [{
          type: "blur",
          props: {
            style: utils.themeColor.blurType, // 0 ~ 5
            alpha: (utils.getThemeMode() == "dark")?0.85:1,
          },
          layout: $layout.fill
        }, {
          type: "image",
          props: {
            src: photos[i],
            radius: 5,
            contentMode: $contentMode.scaleAspectFit,
            borderWidth: 1 / $device.info.screen.scale,
            borderColor: utils.themeColor.separatorColor,
            bgcolor: $color("clear"),
          },
          layout: $layout.fill,
        }]
      }]
    })
  }
  $ui.push({
    props: {
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
    },
    views: [ui.genPageHeader("应用", "预览"), {
      type: "view",
      props: {
        bgcolor: utils.themeColor.bgcolor,
      },
      layout: function (make, view) {
        make.top.equalTo(view.prev.bottom).inset(0)
        make.left.right.inset(0)
        make.bottom.inset(0)
      },
      views: [{
        type: "scroll",
        props: {
          id: "previewPhotosDetailScroll",
          contentOffset: $point(index * ($device.info.screen.width), 0),
          alwaysBounceHorizontal: true,
          alwaysBounceVertical: false,
          userInteractionEnabled: true,
          showsHorizontalIndicator: false,
          showsVerticalIndicator: false,
          pagingEnabled: true,
        },
        layout: function (make, view) {
          make.center.equalTo(view.super)
          make.size.equalTo(view.super)
        },
        views: [{
          type: "stack",
          props: {
            spacing: 10,
            distribution: $stackViewDistribution.fillEqually,
            axis: $stackViewAxis.horizontal,
            stack: {
              views: items,
            }
          },
          layout: function(make, view) {
            make.left.inset(0)
            make.centerY.equalTo(view.super)
            make.width.equalTo(($device.info.screen.width) * photos.length)
            make.height.equalTo(view.super)
          },
        }],
      },]
    },]
  });

  $("previewPhotosDetailScroll").contentOffset = $point(index * ($device.info.screen.width), 0)
}

function genCommentView(app) {
  $ui.push({
    props: {
      id: "addCommentView",
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
    },
    views: [ui.genPageHeader("应用", "撰写评论", {
      type: "button",
      props: {
        title: "发送",
        titleColor: utils.getCache("themeColor"),
        font: $font("bold", 17),
        bgcolor: $color("clear"),
        borderColor: $color("clear"),
      },
      layout: function (make, view) {
        make.right.inset(10)
        make.height.equalTo(view.super)
      },
      events: {
        tapped: async function (sender) {
          if ($("commentText").text.length >= 5) {
            sender.userInteractionEnabled = false
            sender.titleColor = utils.themeColor.appCateTextColor
            let userInfo = user.getLoginUser()
            let json = {
              userId: userInfo.objectId,
              name: userInfo.nickname,
              comment: $("commentText").text.trim(),
              time: new Date().getTime(),
            }
            await api.uploadComment(app.objectId, json)
            let cloudApps = utils.getCache("cloudApps", [])
            for (let i = 0; i < cloudApps.length; i++) {
              if (cloudApps[i].objectId === app.objectId) {
                cloudApps[i].comment.push(json)
              }
            }
            $cache.set("cloudApps", cloudApps);
            $app.notify({
              name: "refreshAll",
              object: { appItem: true }
            });
            ui.showToastView($("addCommentView"), utils.mColor.green, "发送成功")
            $delay(1, () => {
              $ui.pop();
            })
          } else {
            ui.showToastView($("addCommentView"), utils.mColor.red, "字数不得少于 5 个")
          }
        },
      },
    }), {
      type: "text",
      props: {
        id: "commentText",
        text: "",
        align: $align.left,
        radius: 0,
        textColor: utils.themeColor.listContentTextColor,
        font: $font(17),
        borderColor: $color("clear"),
        insets: $insets(12, 20, 12, 20),
        alwaysBounceVertical: true,
        bgcolor: utils.themeColor.bgcolor,
        tintColor: utils.getCache("themeColor"),
        darkKeyboard: utils.themeColor.darkKeyboard,
      },
      layout: function (make, view) {
        make.height.equalTo(view.super)
        make.top.equalTo(view.prev.bottom)
        make.centerX.equalTo(view.center)
        make.left.right.inset(0)
      },
      events: {
        changed: function (sender) {
          if (sender.text.length > 0) {
            $("commentTextHint").hidden = true
          } else {
            $("commentTextHint").hidden = false
          }
        },
      },
      views: [{
        type: "label",
        props: {
          id: "commentTextHint",
          text: "评论（必填）",
          align: $align.left,
          textColor: utils.themeColor.appHintColor,
          font: $font(17)
        },
        layout: function (make, view) {
          make.left.inset(24)
          make.top.inset(12)
        }
      }]
    }]
  })
}

function genCommentReplyView(app, position) {
  $ui.push({
    props: {
      id: "addCommentReplyView",
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
    },
    views: [ui.genPageHeader("应用", "回复评论", {
      type: "button",
      props: {
        title: "发送",
        titleColor: utils.getCache("themeColor"),
        font: $font("bold", 17),
        bgcolor: $color("clear"),
        borderColor: $color("clear"),
      },
      layout: function (make, view) {
        make.right.inset(0)
        make.height.equalTo(view.super)
      },
      events: {
        tapped: async function (sender) {
          if ($("commentText").text.length >= 5) {
            sender.userInteractionEnabled = false
            sender.titleColor = utils.themeColor.appCateTextColor
            let comment = app.comment[position]
            comment.reply = $("commentText").text
            comment.replyTime = new Date().getTime()
            await api.uploadReply(app.objectId, comment)
            let cloudApps = utils.getCache("cloudApps", [])
            for (let i = 0; i < cloudApps.length; i++) {
              if (cloudApps[i].objectId === app.objectId) {
                cloudApps[i].comment[position].reply = comment.reply
                cloudApps[i].comment[position].replyTime = comment.replyTime
              }
            }
            $cache.set("cloudApps", cloudApps);
            $app.notify({
              name: "refreshAll",
              object: { appItem: true }
            });
            ui.showToastView($("addCommentReplyView"), utils.mColor.green, "发送成功")
            $delay(1, () => {
              $ui.pop();
            })
          } else {
            ui.showToastView($("addCommentReplyView"), utils.mColor.red, "字数不得少于 5 个")
          }
        },
      },
    }), {
      type: "text",
      props: {
        id: "commentText",
        text: "",
        align: $align.left,
        radius: 0,
        textColor: utils.themeColor.listContentTextColor,
        font: $font(17),
        borderColor: $color("clear"),
        insets: $insets(12, 20, 12, 20),
        alwaysBounceVertical: true,
        bgcolor: utils.themeColor.bgcolor,
        tintColor: utils.getCache("themeColor"),
        darkKeyboard: utils.themeColor.darkKeyboard,
      },
      layout: function (make, view) {
        make.height.equalTo(view.super)
        make.top.equalTo(view.prev.bottom)
        make.centerX.equalTo(view.center)
        make.left.right.inset(0)
      },
      events: {
        changed: function (sender) {
          if (sender.text.length > 0) {
            $("commentTextHint").hidden = true
          } else {
            $("commentTextHint").hidden = false
          }
        },
      },
      views: [{
        type: "label",
        props: {
          id: "commentTextHint",
          text: "评论（必填）",
          align: $align.left,
          textColor: utils.themeColor.appHintColor,
          font: $font(17)
        },
        layout: function (make, view) {
          make.left.inset(24)
          make.top.inset(12)
        }
      }]
    }]
  })
}

function genUpdateHistoryView(app) {
  let history = app.versionHistory
  let historyViews = []
  for (let i = history.length - 1; i >= 0; i--) {
    historyViews.push({
      type: "view",
      layout: function (make, view) {
        make.centerX.equalTo(view.super)
        if (i == history.length - 1) {
          make.top.inset(0)
        } else {
          make.top.equalTo(view.prev.bottom)
        }
        let size = $text.sizeThatFits({
          text: history[i].versionInst,
          width: $device.info.screen.width - 40,
          font: $font("PingFangSC-Regular", 15),
          lineSpacing: 5,
        })
        make.height.equalTo(size.height + 60)
        make.left.right.inset(0)
      },
      views: [{
        type: "view",
        layout: function (make, view) {
          make.top.inset(10)
          make.width.equalTo(view.super)
          make.centerX.equalTo(view.super)
          make.height.equalTo(30)
        },
        views: [{
          type: "label",
          props: {
            text: history[i].version,
            font: $font("PingFangSC-Medium", 15),
            align: $align.center,
            textColor: utils.themeColor.listHeaderTextColor,
          },
          layout: function (make, view) {
            make.left.inset(20)
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
          },
        }, {
          type: "label",
          props: {
            text: utils.getUpdateDateString(history[i].time),
            font: $font(15),
            align: $align.center,
            textColor: utils.themeColor.appCateTextColor,
          },
          layout: function (make, view) {
            make.right.inset(20)
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
          },
        }]
      }, {
        type: "label",
        props: {
          text: history[i].versionInst,
          font: $font("PingFangSC-Regular", 15),
          align: $align.left,
          textColor: utils.themeColor.listHeaderTextColor,
          lines: 0,
          attributedText: utils.setLineSpacing(history[i].versionInst, 5),
        },
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(5)
          make.centerX.equalTo(view.super)
          // let size = $text.sizeThatFits({
          //   text: history[i].versionInst,
          //   width: $device.info.screen.width - 40,
          //   font: $font("PingFangSC-Regular", 15),
          //   lineSpacing: 5,
          // })
          // make.height.equalTo(size.height)
          make.left.right.inset(20)
        },
      }, {
        type: "canvas",
        layout: function (make, view) {
          make.bottom.inset(0)
          make.height.equalTo(1 / $device.info.screen.scale)
          make.left.right.inset(20)
        },
        events: {
          draw: function (view, ctx) {
            var width = view.frame.width
            ctx.strokeColor = $color("systemSeparator");
            ctx.setLineWidth(1);
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      }]
    })
  }
  $ui.push({
    props: {
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
    },
    views: [ui.genPageHeader("应用", "版本历史记录"), {
      type: "scroll",
      props: {
        indicatorStyle: utils.themeColor.indicatorStyle,
        alwaysBounceHorizontal: false,
      },
      layout: function (make, view) {
        make.top.equalTo(view.prev.bottom)
        make.left.right.bottom.inset(0)
      },
      views: historyViews,
      events: {
        ready: function (sender) {
          sender.resize()
          sender.alwaysBounceHorizontal = false
          sender.contentSize = $size(0, sender.contentSize.height)
        }
      }
    }]
  })
}

function showNotLoginError(actionStr) {
  $ui.alert({
    title: "提示",
    message: "未登录用户无法" + actionStr + "，请先登录",
    actions: [
      {
        title: "我要登录",
        handler: function () {
          logUpView.setupLoginView()
        }
      },
      {
        title: "我要注册",
        handler: function () {
          logUpView.setupLogUpView()
        }
      },
      {
        title: "好的",
        handler: function () {

        }
      },
    ]
  });
}

function genCommentDetailView(comment) {
  let commentSize = $text.sizeThatFits({
    text: comment.comment,
    width: $device.info.screen.width - 70,
    font: $font("PingFangSC-Regular", 15),
  })
  let replySize = $text.sizeThatFits({
    text: comment.reply,
    width: $device.info.screen.width - 70,
    font: $font("PingFangSC-Regular", 15),
  })
  let subViews = [{
    type: "label",
    props: {
      text: comment.name,
      textColor: utils.themeColor.appHintColor,
      font: $font("PingFangSC-Regular", 15),
    },
    layout: function (make, view) {
      make.top.inset(10)
      make.height.equalTo(20)
      make.left.inset(15)
    },
  }, {
    type: "label",
    props: {
      text: utils.getUpdateDateString(comment.time),
      textColor: utils.themeColor.appHintColor,
      font: $font("PingFangSC-Regular", 14),
    },
    layout: function (make, view) {
      make.top.inset(10)
      make.height.equalTo(20)
      make.right.inset(15)
    },
  }, {
    type: "label",
    props: {
      text: comment.comment,
      textColor: utils.themeColor.listHeaderTextColor,
      font: $font("PingFangSC-Regular", 15),
      align: $align.justified,
      bgcolor: $color("clear"),
      lines: 0,
    },
    layout: function (make, view) {
      make.top.equalTo(view.prev.bottom).inset(7)
      make.left.right.inset(15)
    },
  }]
  if (comment.reply) {
    subViews.push({
      type: "label",
      props: {
        text: "开发者回复",
        textColor: utils.themeColor.appHintColor,
        font: $font("PingFangSC-Regular", 15),
      },
      layout: function (make, view) {
        make.top.equalTo(view.prev.bottom).inset(10)
        make.height.equalTo(20)
        make.left.inset(15)
      },
    }, {
        type: "label",
        props: {
          text: utils.getUpdateDateString(comment.replyTime),
          textColor: utils.themeColor.appHintColor,
          font: $font("PingFangSC-Regular", 14),
        },
        layout: function (make, view) {
          make.centerY.equalTo(view.prev)
          make.height.equalTo(20)
          make.right.inset(15)
        },
      }, {
        type: "label",
        props: {
          text: comment.reply,
          textColor: utils.themeColor.listHeaderTextColor,
          font: $font("PingFangSC-Regular", 15),
          align: $align.justified,
          bgcolor: $color("clear"),
          lines: 0,
        },
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(7)
          make.left.right.inset(15)
        },
      })
  }
  let longPressMenu = {
    items: [
      {
        title: "复制评论",
        symbol: "doc.on.doc",
        handler: sender => {
          let replyText = (comment.reply)?("\n开发者回复" + "\n" + comment.reply):"";
          $clipboard.text = comment.name + "\n" + comment.comment + replyText;
          ui.showToastView($("appItemView"), utils.mColor.green, "已复制");
        }
      }
    ]
  }
  $ui.push({
    props: {
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
    },
    views: [ui.genPageHeader("应用", "评论详情"), {
      type: "scroll",
      props: {
        alwaysBounceHorizontal: false,
      },
      layout: function (make, view) {
        make.top.equalTo(view.prev.bottom)
        make.left.right.bottom.inset(0)
      },
      views: [{
        type: "view",
        props: {
          bgcolor: utils.themeColor.commentBgColor,
          radius: 8,
          menu: longPressMenu,
        },
        layout: function (make, view) {
          make.top.inset(20)
          make.height.equalTo(commentSize.height + replySize.height + 87)
          make.left.inset(20)
          make.width.equalTo($device.info.screen.width - 40)
        },
        views: subViews
      }],
      events: {
        ready: function (sender) {
          sender.resize()
          sender.alwaysBounceHorizontal = false
          sender.contentSize = $size(0, sender.contentSize.height)
        }
      }
    }]
  })
}

function genAppShareView(app) {
  $ui.push({
    props: {
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
    },
    views: [ui.genPageHeader("应用", "分享"), {
      type: "scroll",
      props: {
        alwaysBounceHorizontal: false,
      },
      layout: function (make, view) {
        make.top.equalTo(view.prev.bottom)
        make.left.right.bottom.inset(0)
      },
      views: [{
        type: "view",
        props: {
          bgcolor: $color("white"),
          radius: 0,
        },
        layout: function (make, view) {
          make.top.inset(20)
          make.height.equalTo(200)
          make.left.inset(0)
          make.width.equalTo($device.info.screen.width)
        },
        views: [{
          type: "view",
          props: {
            bgcolor: $color("clear"),
            radius: 15,
          },
          layout: function (make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(180)
            make.left.right.inset(20)
          },
          views: []
        }]
      }],
      events: {
        ready: function (sender) {
          sender.resize()
          sender.alwaysBounceHorizontal = false
          sender.contentSize = $size(0, sender.contentSize.height)
        }
      }
    }]
  })
}

function genAppReportFaultView(app) {
  $ui.push({
    props: {
      id: "FaultReportView",
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
    },
    views: [ui.genPageHeader("应用", "失效反馈", {
      type: "button",
      props: {
        title: "发送",
        titleColor: utils.getCache("themeColor"),
        font: $font("bold", 17),
        bgcolor: $color("clear"),
        borderColor: $color("clear"),
      },
      layout: function (make, view) {
        make.right.inset(0)
        make.height.equalTo(view.super)
      },
      events: {
        tapped: async function (sender) {
          if ($("commentText").text.length >= 10) {
            sender.userInteractionEnabled = false
            sender.titleColor = utils.themeColor.appCateTextColor
            let userInfo = user.getLoginUser()
            let json = {
              userId: userInfo.objectId,
              username: userInfo.nickname,
              appId: app.objectId,
              appName: app.appName,
              detail: $("commentText").text.trim(),
            }
            await api.uploadFaultReport(json)
            ui.showToastView($("FaultReportView"), utils.mColor.green, "发送成功")
            $delay(1, () => {
              $ui.pop();
            })
          } else {
            ui.showToastView($("FaultReportView"), utils.mColor.red, "字数不得少于 10 个")
          }
        },
      },
    }), {
      type: "text",
      props: {
        id: "commentText",
        text: "",
        align: $align.left,
        radius: 0,
        textColor: utils.themeColor.listContentTextColor,
        font: $font(17),
        borderColor: $color("clear"),
        insets: $insets(12, 20, 12, 20),
        alwaysBounceVertical: true,
        bgcolor: utils.themeColor.bgcolor,
        tintColor: utils.getCache("themeColor"),
        darkKeyboard: utils.themeColor.darkKeyboard,
      },
      layout: function (make, view) {
        make.height.equalTo(view.super)
        make.top.equalTo(view.prev.bottom)
        make.centerX.equalTo(view.center)
        make.left.right.inset(0)
      },
      events: {
        changed: function (sender) {
          if (sender.text.length > 0) {
            $("commentTextHint").hidden = true
          } else {
            $("commentTextHint").hidden = false
          }
        },
      },
      views: [{
        type: "label",
        props: {
          id: "commentTextHint",
          text: "失效现象或原因（必填）",
          align: $align.left,
          textColor: utils.themeColor.appHintColor,
          font: $font(17)
        },
        layout: function (make, view) {
          make.left.inset(24)
          make.top.inset(12)
        }
      }]
    }]
  })
}

function sizeOfLabelView(props, width) {
  const uilabel = $ui.create({
    type: "label",
    props: props
  })
  const size = uilabel.ocValue().invoke("sizeThatFits:", $size(width, 0))
  return size
}

function shadow(view) {
  var layer = view.runtimeValue().invoke("layer")
  layer.invoke("setCornerRadius", 8)
  layer.invoke("setShadowOffset", $size(0, 0))
  layer.invoke("setShadowColor", $color(utils.mColor.green).runtimeValue().invoke("CGColor"))
  layer.invoke("setShadowOpacity", 0.8)
  layer.invoke("setShadowRadius", 5)
}

module.exports = {
  show: show,
  preview: preview,
}