let utils = require('scripts/utils')
let ui = require('scripts/ui')
let user = require('scripts/user')
let logUpView = require('scripts/login-view')
let api = require('scripts/api')

function show(objectId) {
  let app = {}
  let cloudApps = utils.getCache("cloudApps", [])
  for(let i = 0; i < cloudApps.length; i++) {
    if(cloudApps[i].objectId == objectId) {
      app = cloudApps[i];
      break;
    }
  }
  let buttonText = ""
  if(app.haveInstalled) {
    if(app.needUpdate) {
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
  if(comments && comments.length > 0) {
    for(let i = 0; i < comments.length; i++) {
      commentSubviews.push({
        type: "view",
        props: {
          bgcolor: utils.themeColor.commentBgColor,
          radius: 8,
        },
        layout: function(make, view) {
          make.top.inset(0)
          make.height.equalTo(view.super)
          make.width.equalTo($device.info.screen.width - 40)
          if(i == 0) {
            make.left.inset(20)
          } else {
            make.left.equalTo(view.prev.right).inset(10)
          }
        },
        views: [{
          type: "label",
          props: {
            text: comments[comments.length - i - 1].name,
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
            text: comments[comments.length - i - 1].comment,
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
      })
    }
    let commentMoveXOffsetOld,commentMoveXOffsetNew = 0;
    commentSubviews.push({
      type: "view",
      layout: function(make, view) {
        make.top.inset(0)
        make.height.equalTo(view.super)
        make.width.equalTo(30)
        make.left.equalTo(view.prev.right).inset(0)
      },
    })
    commentView = {
      type: "view",
      layout: function(make, view) {
        make.top.equalTo(view.prev.bottom).inset(10)
        make.height.equalTo(150)
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
        },
        layout: $layout.fill,
        views: commentSubviews,
        events: {
          willBeginDragging: function(sender) {
            commentMoveXOffsetOld = sender.contentOffset.x;
          },
          willEndDragging: function(sender, decelerate) {
            commentMoveXOffsetNew = sender.contentOffset.x;
          },
          willBeginDecelerating: function(sender) {
            let offsetChange = commentMoveXOffsetNew - commentMoveXOffsetOld
            let unit = (sender.contentSize.width - 40) / comments.length
            let x = Math.round(commentMoveXOffsetOld / unit) * unit
            if(Math.abs(offsetChange) > 40) {
              x = (offsetChange > 0)? x + unit : x - unit
            }
            if(x < 0 || x > sender.contentSize.width - unit) {
              x = Math.round(commentMoveXOffsetOld / unit) * unit
            }
            sender.scrollToOffset($point(x, 0))
          },
          didEndDragging: function(sender, decelerate) {
            let offsetChange = commentMoveXOffsetNew - commentMoveXOffsetOld
            let unit = (sender.contentSize.width - 40) / comments.length
            let x = Math.round(commentMoveXOffsetOld / unit) * unit
            if(Math.abs(offsetChange) > 40) {
              x = (offsetChange > 0)? x + unit : x - unit
            }
            if(x < 0 || x > sender.contentSize.width - unit) {
              x = Math.round(commentMoveXOffsetOld / unit) * unit
            }
            sender.scrollToOffset($point(x, 0))
          }
        }
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
      layout: function(make, view) {
        make.top.equalTo(view.prev.bottom).inset(0)
        make.height.equalTo(30)
        make.left.inset(20)
      },
    }
  }
  $ui.push({
    props: {
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
    },
    views: [ui.genPageHeader("主页", ""),{
      type: "scroll",
      props: {
        id: "appItemShowScroll",
      },
      layout: function(make, view) {
        make.left.right.bottom.inset(0)
        make.top.equalTo(view.prev.bottom)
        make.centerX.equalTo(view.super)
      },
      views: [{
        type: "view",
        layout: function(make, view) {
          make.left.right.inset(20)
          make.top.inset(10)
          make.height.equalTo(80)
          make.centerX.equalTo(view.super)
        },
        views: [ui.genAppShowView(app.appIcon, app.appName, (app.subtitle != "")?app.subtitle:app.appCate, buttonText, function(buttonView) {
          if(!app.needUpdate && app.haveInstalled) {
            $addin.run(app.appName)
          } else {
            buttonView.title = ""
            buttonView.updateLayout(function(make, view) {
              make.size.equalTo($size(30, 30))
            })
            $ui.animate({
              duration: 0.2,
              animation: function() {
                buttonView.relayout()
              },
              completion: function() {
                $ui.animate({
                  duration: 0.1,
                  animation: function() {
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
                      ctx.strokeColor = utils.themeColor.appButtonBgColor,
                      ctx.setLineWidth(2.5)
                      ctx.addArc(15, 15, 14, 0, 3 / 2 * 3.14)
                      ctx.strokePath()
                    }
                  },
                })
                let radius = 0;
                let timer = $timer.schedule({
                  interval: 0.01,
                  handler: function() {
                    if(buttonView.get("canvas")) {
                      buttonView.get("canvas").rotate(radius)
                      radius = radius + Math.PI / 180 * 6
                      $console.info(radius);
                    } else {
                      timer.invalidate()
                    }
                  }
                });
                $http.download({
                  url: app.file,
                  showsProgress: false,
                  handler: function(resp) {
                    let json = utils.getSearchJson(app.appIcon)
                    let icon_code = (json.code)?json.code:"124";
                    $addin.save({
                      name: app.appName,
                      data: resp.data,
                      icon: "icon_" + icon_code + ".png",
                    });
                    if(app.needUpdate && app.haveInstalled) {
                      utils.addUpdateApps(app.objectId);
                    }
                    let cloudApps = utils.getCache("cloudApps", [])
                    for(let j = 0; j < cloudApps.length; j++) {
                      if(cloudApps[j].objectId == app.objectId) {
                        cloudApps[j].haveInstalled = true
                        cloudApps[j].needUpdate = false
                      }
                    }
                    $cache.set("cloudApps", cloudApps);
                    $ui.animate({
                      duration: 0.1,
                      animation: function() {
                        buttonView.bgcolor = utils.themeColor.appButtonBgColor
                      },
                      completion: function() {
                        buttonView.get("canvas").remove()
                        buttonView.updateLayout(function(make, view) {
                          make.size.equalTo($size(75, 30))
                        })
                        $ui.animate({
                          duration: 0.2,
                          animation: function() {
                            buttonView.relayout()
                          },
                          completion: function() {
                            buttonView.title = "打开"
                            api.uploadDownloadTimes(app.objectId)
                            $app.notify({
                              name: "refreshAll",
                              object: {"a": "b"}
                            });
                            app.needUpdate = false
                            app.haveInstalled = true
                            $device.taptic(2);
                            $delay(0.2, ()=>{$device.taptic(2);})
                          }
                        })
                      }
                    })
                  }
                })
              }
            })
          }
        })]
      },{
        type: "view",
        layout: function(make, view) {
          make.left.right.inset(0)
          make.top.equalTo(view.prev.bottom)
          make.centerX.equalTo(view.super)
          make.height.equalTo(60)
        },
        views: [{
          type: "view",
          layout: function(make, view) {
            make.width.equalTo(view.super).multipliedBy(0.3)
            make.center.equalTo(view.super)
            make.height.equalTo(view.super)
          },
          views: [{
            type: "label",
            props: {
              text: "" + app.downloadTimes,
              font: $font("PingFangSC-Medium", 20),
              align: $align.center,
              textColor: $color("gray"),
            },
            layout: function(make, view) {
              make.top.inset(15)
              make.height.equalTo(18)
              make.centerX.equalTo(view.super)
            },
          },{
            type: "label",
            props: {
              text: "下载量",
              font: $font(11),
              align: $align.center,
              textColor: utils.themeColor.appHintColor,
            },
            layout: function(make, view) {
              make.top.equalTo(view.prev.bottom).inset(5)
              make.height.equalTo(15)
              make.centerX.equalTo(view.super)
            },
          }]
        },{
          type: "view",
          layout: function(make, view) {
            make.left.inset(20)
            make.right.equalTo(view.prev.left)
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
          },
          views: [{
            type: "label",
            props: {
              text: "" + app.comment.length,
              font: $font("PingFangSC-Medium", 20),
              align: $align.center,
              textColor: $color("gray"),
            },
            layout: function(make, view) {
              make.top.inset(15)
              make.height.equalTo(18)
              make.centerX.equalTo(view.super)
            },
          },{
            type: "label",
            props: {
              text: "评论",
              font: $font(11),
              align: $align.center,
              textColor: utils.themeColor.appHintColor,
            },
            layout: function(make, view) {
              make.top.equalTo(view.prev.bottom).inset(5)
              make.height.equalTo(15)
              make.centerX.equalTo(view.super)
            },
          }]
        },{
          type: "view",
          layout: function(make, view) {
            make.right.inset(20)
            make.left.equalTo(view.prev.prev.right)
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
          },
          views: [{
            type: "label",
            props: {
              text: "0",
              font: $font("PingFangSC-Medium", 20),
              align: $align.center,
              textColor: $color("gray"),
            },
            layout: function(make, view) {
              make.top.inset(15)
              make.height.equalTo(18)
              make.centerX.equalTo(view.super)
            },
          },{
            type: "label",
            props: {
              text: "点赞",
              font: $font(11),
              align: $align.center,
              textColor: utils.themeColor.appHintColor,
            },
            layout: function(make, view) {
              make.top.equalTo(view.prev.bottom).inset(5)
              make.height.equalTo(15)
              make.centerX.equalTo(view.super)
            },
          }]
        }]
      },{
        type: "canvas",
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(1 / $device.info.screen.scale)
          make.left.right.inset(20)
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
        type: "view",
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom)
          let size = $text.sizeThatFits({
            text: app.versionInst,
            width: $device.info.screen.width - 40,
            font: $font("PingFangSC-Regular", 15),
            lineSpacing: 5, // Optional
          })
          make.height.equalTo(size.height + 80)
          make.left.right.inset(0)
        },
        views: [{
          type: "view",
          layout: function(make, view) {
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
            layout: function(make, view) {
              make.top.inset(0)
              make.height.equalTo(50)
              make.left.inset(20)
            },
          },{
            type: "button",
            props: {
              title: "版本历史记录",
              bgcolor: $color("clear"),
              titleColor: utils.getCache("themeColor"),
              font: $font(17),
            },
            layout: function(make, view) {
              make.top.inset(0)
              make.height.equalTo(50)
              make.right.inset(20)
            },
            events: {
              tapped: function(sender) {
                genUpdateHistoryView(app)
              }
            }
          },]
        },{
          type: "view",
          layout: function(make, view) {
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
            layout: function(make, view) {
              make.centerY.equalTo(view.super)
              make.height.equalTo(25)
              make.left.inset(20)
            },
          },{
            type: "label",
            props: {
              text: utils.getUpdateDateString((app.updateTime)?app.updateTime:app.updatedAt),
              font: $font(14),
              align: $align.center,
              textColor: utils.themeColor.appCateTextColor,
            },
            layout: function(make, view) {
              make.centerY.equalTo(view.super)
              make.height.equalTo(25)
              make.right.inset(20)
            },
          }]
        },{
          type: "label",
          props: {
            text: app.versionInst,
            align: $align.left,
            lines: 0,
            font: $font("PingFangSC-Regular", 15),
            attributedText: setLineSpacing(app.versionInst, 5),
            textColor: utils.themeColor.listContentTextColor,
          },
          layout: function(make, view) {
            let size = $text.sizeThatFits({
              text: app.versionInst,
              width: $device.info.screen.width - 40,
              font: $font("PingFangSC-Regular", 15),
              lineSpacing: 5, // Optional
            })
            make.top.equalTo(view.prev.bottom).inset(5)
            make.height.equalTo(size.height)
            make.left.right.inset(20)
            make.centerX.equalTo(view.super)
          }
        }]
      },{
        type: "canvas",
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          if(app.previews.length > 0) {
            make.height.equalTo(1 / $device.info.screen.scale)
          } else {
            make.height.equalTo(0)
          }
          make.left.right.inset(20)
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
        type: "label",
        props: {
          text: "预览",
          font: $font("bold", 22),
          align: $align.center,
          textColor: utils.themeColor.listHeaderTextColor,
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(10)
          if(app.previews.length > 0) {
            make.height.equalTo(40)
          } else {
            make.height.equalTo(0)
          }
          make.left.inset(20)
        },
      },{
        type: "view",
        props: {
          id: "appPreviewPhotosScrollParent",
          bgcolor: utils.themeColor.bgcolor,
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(0)
          if(app.previews.length > 0) {
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
            contentSize: $size(app.previews.length*100, 260),
            alwaysBounceHorizontal: true,
            alwaysBounceVertical: false,
            userInteractionEnabled: true,
            showsHorizontalIndicator: false,
            showsVerticalIndicator: false,
          },
          layout: function(make, view) {
            make.center.equalTo(view.super)
            make.size.equalTo(view.super)
          },
          views: ui.genAppPreviewPhotosView(app.previews, function(sender) {
            genAppPreviewPhotosScrollView(app.previews)
          }),
        },]
      },{
        type: "canvas",
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(1 / $device.info.screen.scale)
          make.left.right.inset(20)
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
        type: "label",
        props: {
          text: app.instruction,
          align: $align.left,
          lines: 0,
          font: $font("PingFangSC-Regular", 15),
          attributedText: setLineSpacing(app.instruction, 5),
          textColor: utils.themeColor.listContentTextColor,
        },
        layout: function(make, view) {
          let size = $text.sizeThatFits({
            text: app.instruction,
            width: $device.info.screen.width - 40,
            font: $font("PingFangSC-Regular", 15),
            lineSpacing: 5, // Optional
          })
          make.top.equalTo(view.prev.bottom).inset(20)
          make.height.equalTo(size.height)
          make.left.right.inset(20)
          make.centerX.equalTo(view.super)
        }
      },{
        type: "canvas",
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          make.height.equalTo(1 / $device.info.screen.scale)
          make.left.right.inset(20)
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
        type: "view",
        layout: function(make, view) {
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
          layout: function(make, view) {
            make.top.inset(0)
            make.height.equalTo(50)
            make.left.inset(0)
          },
        },{
          type: "button",
          props: {
            title: "撰写评论",
            bgcolor: $color("clear"),
            titleColor: utils.getCache("themeColor"),
            font: $font(17),
          },
          layout: function(make, view) {
            make.top.inset(0)
            make.height.equalTo(50)
            make.right.inset(0)
          },
          events: {
            tapped: function(sender) {
              if(!user.haveLogined()) {
                $ui.alert({
                  title: "提示",
                  message: "未登录用户无法发布评论，请先登录",
                  actions: [
                    {
                      title: "我要登录",
                      handler: function() {
                        logUpView.setupLoginView()
                      }
                    },
                    {
                      title: "我要注册",
                      handler: function() {
                        logUpView.setupLogUpView()
                      }
                    },
                    {
                      title: "好的",
                      handler: function() {
                        
                      }
                    },
                  ]
                });
              } else {
                genCommentView(app)
              }
            }
          }
        }]
      },commentView,{
        type: "canvas",
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          make.height.equalTo(1 / $device.info.screen.scale)
          make.left.right.inset(20)
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
        type: "label",
        props: {
          text: "信息",
          font: $font("bold", 22),
          align: $align.center,
          textColor: utils.themeColor.listHeaderTextColor,
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(50)
          make.left.inset(20)
        },
      },{
        type: "view",
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom)
          make.height.equalTo(40)
          make.left.right.inset(20)
        },
        views: [{
          type: "label",
          props: {
            text: "开发者",
            align: $align.left,
            font: $font("PingFangSC-Regular", 14),
            textColor: utils.themeColor.appCateTextColor,
          },
          layout: function(make, view) {
            make.top.inset(0)
            make.height.equalTo(20)
            make.left.inset(0)
            make.centerY.equalTo(view.super)
          }
        },{
          type: "label",
          props: {
            text: (app.author)?app.author:"无",
            align: $align.right,
            font: $font("PingFangSC-Regular", 14),
            textColor: utils.themeColor.listHeaderTextColor,
          },
          layout: function(make, view) {
            make.top.inset(0)
            make.height.equalTo(20)
            make.right.inset(0)
            make.width.equalTo(100)
            make.centerY.equalTo(view.super)
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
              ctx.strokeColor = $color("#D0D0D0")
              ctx.setLineWidth(1 / scale)
              ctx.moveToPoint(0, 0)
              ctx.addLineToPoint(width, 0)
              ctx.strokePath()
            }
          }
        }]
      },{
        type: "view",
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom)
          make.height.equalTo(40)
          make.left.right.inset(20)
        },
        views: [{
          type: "label",
          props: {
            text: "类别",
            align: $align.left,
            font: $font(14),
            textColor: utils.themeColor.appCateTextColor,
          },
          layout: function(make, view) {
            make.top.inset(0)
            make.height.equalTo(20)
            make.left.inset(0)
            make.centerY.equalTo(view.super)
          }
        },{
          type: "label",
          props: {
            text: app.appCate,
            align: $align.right,
            font: $font(14),
            textColor: utils.themeColor.listHeaderTextColor,
          },
          layout: function(make, view) {
            make.top.inset(0)
            make.height.equalTo(20)
            make.right.inset(0)
            make.width.equalTo(100)
            make.centerY.equalTo(view.super)
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
              ctx.strokeColor = $color("#D0D0D0")
              ctx.setLineWidth(1 / scale)
              ctx.moveToPoint(0, 0)
              ctx.addLineToPoint(width, 0)
              ctx.strokePath()
            }
          }
        }]
      },{
        type: "view",
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom)
          make.height.equalTo(110)
          make.left.right.inset(0)
        },
        views: [{
          type: "button",
          props: {
            title: " 分享",
            icon: $icon("022", utils.getCache("themeColor"), $size(20, 20)),
            bgcolor: utils.themeColor.appButtonBgColor,
            titleColor: utils.getCache("themeColor"),
            font: $font("bold", 16.5),
            radius: 7,
            align: $align.center,
          },
          layout: function(make, view) {
            make.center.equalTo(view.super)
            make.size.equalTo($size(120, 50))
          },
          events: {
            tapped: function(sender) {
              $share.sheet([app.appName,"https://liuguogy.github.io/JSBox-addins/?q=show&objectId=" + app.objectId]);
            }
          },
        }]
      },]
    },]
  });
  $("appItemShowScroll").resize()
  $("appItemShowScroll").contentSize = $size(0, $("appItemShowScroll").contentSize.height + 50)
  $("appPreviewPhotosScroll").resize()
  $("appPreviewPhotosScroll").contentSize = $size($("appPreviewPhotosScroll").contentSize.width + 20, 0)
}

function genAppPreviewPhotosScrollView(photos) {
  let moveXOffsetOld,moveXOffsetNew;
  let items = []
  for(let i = 0; i < photos.length; i++) {
    items.push({
      type: "image",
      props: {
        src: photos[i],
        radius: 5,
        contentMode: $contentMode.scaleToFill,
        borderWidth: 1 / $device.info.screen.scale,
        borderColor: $color("#E0E0E0"),
      },
      layout: function(make, view) {
        make.centerY.equalTo(view.super)
        if(i == 0) {
          make.left.inset(25)
        } else {
          make.left.equalTo(view.prev.right).inset(13)
        }
        make.width.equalTo($device.info.screen.width - 50)
        make.height.equalTo(view.super).multipliedBy(0.9)
      },
      views: [{
        type: "blur",
        props: {
          style: utils.themeColor.blurType, // 0 ~ 5
        },
        layout: $layout.fill
      },{
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
    })
  }
  items.push({
    type: "view",
    layout: function(make, view) {
      make.centerY.equalTo(view.super)
      make.left.equalTo(view.prev.right)
      make.width.equalTo(25)
      make.height.equalTo(view.super).multipliedBy(0.9)
    }
  })
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
      layout: function(make, view) {
        make.top.equalTo(view.prev.bottom).inset(0)
        make.left.right.inset(0)
        make.bottom.inset(0)
      },
      views: [{
        type: "scroll",
        props: {
          alwaysBounceHorizontal: true,
          alwaysBounceVertical: false,
          userInteractionEnabled: true,
          showsHorizontalIndicator: false,
          showsVerticalIndicator: false,
        },
        layout: function(make, view) {
          make.center.equalTo(view.super)
          make.size.equalTo(view.super)
        },
        views: items,
        events: {
          willBeginDragging: function(sender) {
            moveXOffsetOld = sender.contentOffset.x;
          },
          willEndDragging: function(sender, decelerate) {
            moveXOffsetNew = sender.contentOffset.x;
          },
          willBeginDecelerating: function(sender) {
            let offsetChange = moveXOffsetNew - moveXOffsetOld
            let unit = (sender.contentSize.width - 40) / photos.length
            let x = Math.round(moveXOffsetOld / unit) * unit
            if(Math.abs(offsetChange) > 40) {
              x = (offsetChange > 0)? x + unit : x - unit
            }
            if(x < 0 || x > sender.contentSize.width - unit) {
              x = Math.round(moveXOffsetOld / unit) * unit
            }
            sender.scrollToOffset($point(x, 0))
          },
          didEndDragging: function(sender, decelerate) {
            let offsetChange = moveXOffsetNew - moveXOffsetOld
            let unit = (sender.contentSize.width - 40) / photos.length
            let x = Math.round(moveXOffsetOld / unit) * unit
            if(Math.abs(offsetChange) > 40) {
              x = (offsetChange > 0)? x + unit : x - unit
            }
            if(x < 0 || x > sender.contentSize.width - unit) {
              x = Math.round(moveXOffsetOld / unit) * unit
            }
            sender.scrollToOffset($point(x, 0))
          }
        }
      },]
    },]
  });
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
        layout: function(make, view) {
          make.right.inset(0)
          make.height.equalTo(view.super)
        },
        events: {
          tapped: async function(sender) {
            if($("commentText").text.length >= 5) {
              let userInfo = user.getLoginUser()
              let json = {
                userId: userInfo.objectId,
                name: userInfo.nickname,
                comment: $("commentText").text,
              }
              await api.uploadComment(app.objectId, json)
              ui.showToastView($("addCommentView"), utils.mColor.green, "发送成功")
              $delay(1, ()=>{
                $ui.pop();
              })
            } else {
              ui.showToastView($("addCommentView"), utils.mColor.red, "字数不得少于 5 个")
            }
          },
        },
      }),{
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
      layout: function(make, view) {
        make.height.equalTo(view.super)
        make.top.equalTo(view.prev.bottom)
        make.centerX.equalTo(view.center)
        make.left.right.inset(0)
      },
      events: {
        changed: function(sender) {
          if(sender.text.length > 0) {
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
        layout: function(make, view) {
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
  for(let i = history.length - 1; i >= 0; i--) {
    historyViews.push({
      type: "view",
      layout: function(make, view) {
        make.centerX.equalTo(view.super)
        if(i == history.length - 1) {
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
        layout: function(make, view) {
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
          layout: function(make, view) {
            make.left.inset(20)
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
          },
        },{
          type: "label",
          props: {
            text: utils.getUpdateDateString(history[i].time),
            font: $font(15),
            align: $align.center,
            textColor: utils.themeColor.appCateTextColor,
          },
          layout: function(make, view) {
            make.right.inset(20)
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
          },
        }]
      },{
        type: "label",
        props: {
          text: history[i].versionInst,
          font: $font("PingFangSC-Regular", 15),
          align: $align.left,
          textColor: utils.themeColor.listHeaderTextColor,
          lines: 0,
          attributedText: setLineSpacing(history[i].versionInst, 5),
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(5)
          make.centerX.equalTo(view.super)
          let size = $text.sizeThatFits({
            text: history[i].versionInst,
            width: $device.info.screen.width - 40,
            font: $font("PingFangSC-Regular", 15),
            lineSpacing: 5,
          })
          make.height.equalTo(size.height)
          make.left.right.inset(20)
        },
      },{
        type: "canvas",
        layout: function(make, view) {
          make.bottom.inset(0)
          make.height.equalTo(1 / $device.info.screen.scale)
          make.left.right.inset(20)
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
        alwaysBounceHorizontal: false,
      },
      layout: function(make, view) {
        make.top.equalTo(view.prev.bottom)
        make.left.right.bottom.inset(0)
      },
      views: historyViews,
      events: {
        ready: function(sender) {
          sender.resize()
          sender.alwaysBounceHorizontal = false
          sender.contentSize = $size(0, sender.contentSize.height)
        }
      }
    }]
  })
}

function setLineSpacing(text, spacing) {
  var attrText = $objc("NSMutableAttributedString").invoke("alloc").invoke("initWithString", text);
  var style = $objc("NSMutableParagraphStyle").invoke("alloc.init");
  style.invoke("setLineSpacing", spacing);
  attrText.invoke("addAttribute:value:range:", "NSParagraphStyle", style, $range(0, text.length));
  return attrText.rawValue();
}

module.exports = {
  show: show,
}