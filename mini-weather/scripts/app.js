let view = require("scripts/view");
let update = require('scripts/update')
let request = require('scripts/request')
let utils = require("scripts/utils");

let appId = "KnKfUcSG1QcFIBPgM7D10thc-gzGzoHsz"
let appKey = "HqShYPrqogdvMOrBC6fIPqVa"

let resumeAction = 0;

function show() {
  checkBlackList()
  if(!utils.getCache("haveBanned", false)) {
    setupView()
    request.request()
  } else {
    view.showBannedAlert()
  }
}

function setupView() {
  $ui.render({
    props: {
      navButtons: [
        {
          icon: "002", // Or you can use icon name
          handler: function() {
            setupSetting()
          }
        }
      ]
    },
    views: [{
      type: "view",
      props: {
        id: "mainView",
      },
      layout: $layout.fill,
      views: [{
        type: "scroll",
        layout: $layout.fill,
        views: [{
          type: "view",
          layout: function(make, view) {
            make.width.equalTo(view.super)
            make.centerX.equalTo(view.super)
            make.top.inset(20)
            make.height.equalTo(315)
          },
          views: [view.setupCardView()]
        }]
      },]
    }]
  });
}


function setupSetting() {
  const feedBackTemplate = [{
    type: "label",
    props: {
      id: "templateTitle",
    },
    layout: function(make, view) {
      make.left.inset(15);
      make.centerY.equalTo(view.super);
    }
  },
  {
    type: "image",
    props: {
      src: "assets/enter.png",
      bgcolor: $color("clear"),
    },
    layout: function(make, view) {
      make.right.inset(15)
      make.centerY.equalTo(view.super)
      make.size.equalTo($size(8, 18))
    },
  }]

  const tabShowInstalls = {
    type: "view",
    views: [{
        type: "label",
        props: {
          id: "tabShowInstalls",
          text: "安装量统计",
        },
        layout: function(make, view) {
          make.left.inset(15)
          make.centerY.equalTo(view.super)
        }
      },
      {
        type: "label",
        props: {
          id: "tabShowInstallsDetail",
          text: "",
          textColor: $color("#AAAAAA"),
        },
        layout: function(make, view) {
          make.right.inset(15)
          make.centerY.equalTo(view.super)
        }
      }
    ],
    layout: $layout.fill
  }

  let array1 = [{
    templateTitle: {
      text : "推送通知",
    },
  }]

  let array2 = [{
    templateTitle: {
      text : "更新日志",
    },
    url: "https://www.liuguogy.com/archives/mini-weather.html",
  },
  {
    templateTitle: {
      text : "GitHub",
    },
    url: "https://github.com/LiuGuoGY/JSBox-addins",
  },
  {
    templateTitle: {
      text : "支持与赞赏",
    },
  },
  {
    templateTitle: {
      text : "反馈建议",
    },
  },{
    templateTitle: {
      text : "分享给朋友",
    },
  },]
  $ui.push({
    props: {
      id: "settingView",
      title: "设置",
    },
    views: [{
      type: "list",
      props: {
        id: "list",
        template: feedBackTemplate,
        bgcolor: $color("white"),
        footer: {
          type: "view",
          props:{
            height: 60,
          },
          views: [{
            type: "label",
            props: {
              text: "Version " + update.getCurVersion() + " (Build " + update.getCurDate() + "-" + update.getCurBuild() + ") © Linger.",
              textColor: $color("#BBBBBB"),
              align: $align.center,
              font: $font(13)
            },
            layout: function(make, view) {
              make.center.equalTo(view.super)
              make.height.equalTo(view.super)
            }
          },],
        },
        data: [{
          title: "功能",
          rows: array1,
        },{
          title: "关于",
          rows: array2,
        },{
          title: "统计",
          rows: [tabShowInstalls]
        }],
      },
      layout: function(make, view) {
        make.center.equalTo(view.super)
        make.height.equalTo(view.super)
        make.width.equalTo(view.super)
      },
      events: {
        didSelect: function(sender, indexPath, title) {
          if(title.templateTitle == undefined) {
            return 0
          }
          let titleText = title.templateTitle.text
          if(indexPath.section == 0) {
            switch(indexPath.row) {
              case 0: setupForcastRemindView();break;
              default: break;
            }
          } else if(indexPath.section == 1) {
            switch(indexPath.row) {
              case 0: setupWebView(titleText, title.url);break;
              case 1: setupWebView(titleText, title.url, function() {
                $ui.menu({
                  items: ["用 Grape 打开", "用 PPHub 打开", "用其他应用打开"],
                  handler: function(title, idx) {
                    switch(idx) {
                      case 0: $app.openURL("grape://repo?reponame=LiuGuoGY/JSBox-addins");break;
                      case 1: $app.openURL("pphub://repo?owner=LiuGuoGY&repo=JSBox-addins");break;
                      case 2: $share.sheet({
                        items: ["https://github.com/LiuGuoGY/JSBox-addins"],
                        handler: function(success) {
                        }
                      });break;
                    }
                  }
                });
              });break;
              case 2: setupReward();break;
              case 3: setupFeedBack();break;
              case 4: setupShareView();break;
              default: break;
            }
          }
        }
      }
    }]
  })
  requireInstallNumbers()
}

function setupForcastRemindView() {
  $ui.push({
    props: {
      title: "推送通知",
    },
    views: [{
      type: "list",
      props: {
        bgcolor: $color("white"),
        header: {
          type: "view",
          props: {
            height: 40,
          }
        },
        footer: {
          type: "view",
          props: {
            height: 20,
          },
        },
        data: [{},{
          type: "view",
          views: [{
              type: "label",
              props: {
                id: "tabForcastRemindLabel",
                text: "异常天气提醒",
              },
              layout: function(make, view) {
                make.left.inset(15)
                make.centerY.equalTo(view.super)
              }
            },
            {
              type: "switch",
              props: {
                id: "tabForcastRemindSwitch",
                on: utils.getCache("forcastRemind"),
              },
              layout: function(make, view) {
                make.right.inset(15)
                make.centerY.equalTo(view.super)
              },
              events: {
                changed: function(sender) {
                  $cache.set("forcastRemind", sender.on)
                  request.request()
                }
              }
            }
          ],
          layout: $layout.fill
        },{
          type: "view",
          layout: $layout.fill,
          views: [{
            type: "label",
            props: {
              text: "开启此功能将会在特殊天气的前一天晚上 8 点推送提醒通知。",
              textColor: $color("#AAAAAA"),
              align: $align.left,
              font: $font(12),
              lines: 0,
            },
            layout: function(make, view) {
              make.left.right.inset(15)
              make.top.inset(10)
            },
          },],
        },{
          type: "view",
          views: [{
              type: "label",
              props: {
                text: "气温突变预警",
              },
              layout: function(make, view) {
                make.left.inset(15)
                make.centerY.equalTo(view.super)
              }
            },
            {
              type: "switch",
              props: {
                on: utils.getCache("tempRemind"),
              },
              layout: function(make, view) {
                make.right.inset(15)
                make.centerY.equalTo(view.super)
              },
              events: {
                changed: function(sender) {
                  $cache.set("tempRemind", sender.on)
                  request.request()
                }
              }
            }
          ],
          layout: $layout.fill
        },{
          type: "view",
          layout: $layout.fill,
          views: [{
            type: "label",
            props: {
              text: "开启此功能将会在气温发生大幅变化（超过 5 °）的前一天晚上 8 点推送提醒通知。",
              textColor: $color("#AAAAAA"),
              align: $align.left,
              font: $font(12),
              lines: 0,
            },
            layout: function(make, view) {
              make.left.right.inset(15)
              make.top.inset(10)
            },
          },],
        },{
          type: "view",
          views: [{
              type: "label",
              props: {
                text: "气象灾害预警",
              },
              layout: function(make, view) {
                make.left.inset(15)
                make.centerY.equalTo(view.super)
              }
            },
            {
              type: "switch",
              props: {
                on: utils.getCache("disasterRemind"),
              },
              layout: function(make, view) {
                make.right.inset(15)
                make.centerY.equalTo(view.super)
              },
              events: {
                changed: function(sender) {
                  $cache.set("disasterRemind", sender.on)
                }
              }
            }
          ],
          layout: $layout.fill
        },{
          type: "view",
          layout: $layout.fill,
          views: [{
            type: "label",
            props: {
              text: "开启此功能将会在每天首次打开时（系统限制）推送气象灾害预警信息。",
              textColor: $color("#AAAAAA"),
              align: $align.left,
              font: $font(12),
              lines: 0,
            },
            layout: function(make, view) {
              make.left.right.inset(15)
              make.top.inset(10)
            },
          },],
        },]
      },
      layout: $layout.fill,
      events: {
        rowHeight: function(sender, indexPath) {
          if (indexPath.row == 0) {
            return 5
          } else if (indexPath.row % 2 == 1) {
            return 45
          } else {
            return 70
          }
        }
      }
    }]
  });
}

function setupShareView() {
  $ui.push({
    props: {
      title: "分享"
    },
    views: [{
      type: "scroll",
      layout: function(make, view) {
        make.center.equalTo(view.super)
        make.size.equalTo(view.super)
      },
      views: [{
        type: "view",
        props: {
          id: "cardShareView"
        },
        layout: function(make, view) {
          make.top.equalTo(20)
          make.width.equalTo(view.super)
          make.height.equalTo(utils.getWidgetHeight())
        },
        views: [view.setupCardView()]
      },{
        type: "button",
        props: {
          title: "",
          radius: 0,
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(10)
          make.width.equalTo(view.super)
          make.height.equalTo(40)
        },
        events: {
          tapped: function(sender) {
            $share.universal($("cardShareView").snapshot)
          }
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
          type: "label",
          props: {
            text: "分享",
            align: $align.center,
            font: $font(17),
            textColor: $color("#3478f7"),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.left.inset(20)
          }
        }]
      },{
        type: "view",
        props: {
          id: "cardShare2View"
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          make.width.equalTo(view.super)
          make.height.equalTo(220)
        },
        views: [view.setupCardView()]
      },{
        type: "button",
        props: {
          title: "",
          radius: 0,
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(10)
          make.width.equalTo(view.super)
          make.height.equalTo(40)
        },
        events: {
          tapped: function(sender) {
            $share.universal($("cardShare2View").snapshot)
          }
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
          type: "label",
          props: {
            text: "分享",
            align: $align.center,
            font: $font(17),
            textColor: $color("#3478f7"),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.left.inset(20)
          }
        }]
      },{
        type: "button",
        props: {
          title: "",
          radius: 0,
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(15)
          make.width.equalTo(view.super)
          make.height.equalTo(40)
        },
        events: {
          tapped: function(sender) {
            $share.sheet(["http://t.cn/Eq2M5hm"])
          }
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
          type: "label",
          props: {
            text: "分享安装链接",
            align: $align.center,
            font: $font(17),
            textColor: $color("#3478f7"),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.left.inset(20)
          }
        }]
      },]
    },]
  });
}

//赞赏页面
function setupReward() {
  const rewardTemplate = [{
    type: "label",
    props: {
      id: "templateTitle",
      textColor: $color("#333333"),
      font: $font("TrebuchetMS-Italic",17)
    },
    layout: function(make, view) {
      make.left.inset(40);
      make.centerY.equalTo(view.super);
    }
  },
  {
    type: "image",
    props: {
      id: "templateImage",
      icon: $icon("061", $color("#FF823E"), $size(15, 15)),
      bgcolor: $color("clear"),
      hidden: false,
    },
    layout: function(make, view) {
      make.right.inset(40);
      make.centerY.equalTo(view.super);
    }
  }]
  let array = $cache.get("rewardList")
  if(array == undefined) {
    array = []
  }
  $ui.push({
    props: {
      title: "支持与赞赏",
    },
    layout: $layout.fill,
    views: [{
      type: "view",
      props: {
        id: "reward",
      },
      layout: function(make, view) {
        make.left.right.inset(10)
        make.top.inset(50)
        if($device.info.version >= "11"){
          make.bottom.equalTo(view.super.safeAreaBottom).inset(50)
        } else {
          make.bottom.inset(50)
        }
        make.center.equalTo(view.super)
      },
      events: {
        
      },
      views:[{
        type: "label",
        props: {
          id: "rewardTextTitle",
          text: "赞赏名单(按时间排序)：",
          textColor: $color("#333333"),
          font: $font(15),
        },
        layout: function(make, view) {
          make.top.inset(10)
          make.left.inset(20)
        }
      },
      {
        type: "tab",
        props: {
          id: "selection",
          items: ["辣条￥2", "饮料￥5", "咖啡￥10"],
          tintColor: $color("#333333"),
          index: 1,
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.width.equalTo(200)
          make.bottom.inset(60)
          make.height.equalTo(25)
        },
        events: {
          changed: function(sender) {
          }
        }
      },
      {
        type: "button",
        props: {
          id: "aliRewardButton",
          title: " 支付宝 ",
          icon: $icon("074", $color("#108EE9"), $size(20, 20)),
          bgcolor: $color("clear"),
          titleColor: $color("#108EE9"),
          font: $font(15),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.height.equalTo(40)
          make.bottom.inset(10)
        },
        events: {
          tapped: function(sender) {
            switch($("selection").index) {
              case 0: $app.openURL("https://qr.alipay.com/fkx07711hceuis4snmk1xaf")
                break
              case 1: $app.openURL("https://qr.alipay.com/fkx06135o73av80uxsek380")
                break
              case 2: $app.openURL("https://qr.alipay.com/fkx077471oi7olpmrxe4obe")
                break
            }
          }
        }
      },
      {
        type: "button",
        props: {
          id: "wxRewardButton",
          title: " 微信 ",
          icon: $icon("189", $color("#1AAD19"), $size(20, 20)),
          bgcolor: $color("clear"),
          titleColor: $color("#1AAD19"),
          font: $font(15),
        },
        layout: function(make, view) {
          make.left.inset(40)
          make.height.equalTo(40)
          make.bottom.inset(10)
        },
        events: {
          tapped: function(sender) {
            begainReward(sender.title)
          }
        }
      },
      {
        type: "button",
        props: {
          id: "qqRewardButton",
          title: " 红包 ",
          icon: $icon("204", $color("#E81F1F"), $size(20, 20)),
          bgcolor: $color("clear"),
          titleColor: $color("#E81F1F"),
          font: $font(15),
        },
        layout: function(make, view) {
          make.right.inset(40)
          make.height.equalTo(40)
          make.bottom.inset(10)
        },
        events: {
          tapped: function(sender) {
            $clipboard.text = "623098624"
              $ui.alert({
                title: "提示",
                message: "感谢你的支持！\n红包码 623098624 即将复制到剪切板，到支付宝首页粘贴红包码即可领取",
                actions: [
                  {
                    title: "确定",
                    disabled: false, // Optional
                    handler: function() {
                      $app.openURL("alipays://")
                    }
                  },
                  {
                    title: "取消",
                    handler: function() {
              
                    }
                  }
                ]
              })
          }
        }
      },
      {
        type: "label",
        props: {
          id: "recommandText",
          text: "— 推荐方式 —",
          textColor: $rgba(100, 100, 100, 0.5),
          font: $font(10),
        },
        layout: function(make, view) {
          make.centerX.equalTo($("aliRewardButton"))
          make.bottom.inset(8)
        }
      },]
    },
    {
      type: "list",
      props: {
        id: "rewardList",
        template: rewardTemplate,
        radius: 5,
        borderColor: $rgba(90, 90, 90, 0.4),
        borderWidth: 1,
        insets: $insets(5,5,5,5),
        rowHeight: 35,
        bgcolor: $color("clear"),
        selectable: false,
        data: [
          {
            rows: array,
          },
        ],
        header: {
          type: "label",
          props: {
            height: 20,
            text: "Thank you all.",
            textColor: $rgba(90, 90, 90, 0.6),
            align: $align.center,
            font: $font(12)
          }
        }
      },
      layout: function(make, view) {
        make.top.equalTo($("rewardTextTitle").bottom).inset(5)
        make.bottom.equalTo($("selection").top).inset(20)
        make.centerX.equalTo(view.center)
        make.left.right.inset(20)
      },
      events: {
        didSelect: function(sender, indexPath, data) {

        }
      }
    }]
  })
  requireReward()
  $delay(1, function(){
    if($("rewardList")) {
      $("rewardList").scrollToOffset($point(0, 20))
    }
  })
}

function begainReward(way) {
  $ui.alert({
    title: "确定赞赏？",
    message: "点击确定后，将会下载付款码到手机相册，并会跳转到" + way + "扫一扫\n你只需要选择相册里的付款码即可赞赏\n----------\n赞赏完成后别忘记回来，插件会自动删除付款码图片",
    actions: [{
        title: "确定",
        handler: function() {
          downloadRewardPic(way)
        }
      },
      {
        title: "取消",
      }
    ]
  })
}

function downloadRewardPic(way) {
  let PicWay = ""
  let PicMoney = ""
  let url = ""
  switch ($("selection").index) {
    case 0:
      PicMoney = "02"
      break
    case 1:
      PicMoney = "05"
      break
    case 2:
      PicMoney = "10"
      break
  }
  switch (way) {
    case " 微信 ":
      PicWay = "wx"
      url = "weixin://scanqrcode"
      break
    case " QQ ":
      PicWay = "qq"
      url = "mqqapi://qrcode/scan_qrcode?version=1&src_type=app"
      break
  }
  $http.download({
    url: "https://github.com/LiuGuoGY/JSBox-addins/raw/master/mini-weather-res/" + PicWay + "_reward_" + PicMoney + ".JPG",
    handler: function(resp) {
      $console.info(resp.data);
      $photo.save({
        data: resp.data,
        handler: function(success) {
          if (success) {
            let nDate = new Date()
            $cache.set("stopTime", nDate.getTime())
            resumeAction = 2
            $app.openURL(url)
          }
        }
      })
    }
  })
}


function requireReward() {
  $http.request({
    method: "GET",
    url: "https://pwqyveon.api.lncld.net/1.1/classes/Reward",
    timeout: 5,
    header: {
        "Content-Type": "application/json",
        "X-LC-Id": appId,
        "X-LC-Key": appKey,
    },
    handler: function(resp) {
      let data = resp.data.results
      let array = []
      if(data != undefined) {
        for(let i = 0; i < data.length; i++) {
          array.unshift({
            templateTitle: {
              text : data[i].name,
            },
            templateImage: {
              hidden: false,
            }
          })
        }
        $("rewardList").data = array
        $cache.set("rewardList", array)
      }
    }
  })
}


//反馈页面
function setupFeedBack(text) {
  $ui.push({
    props: {
      id: "feedbackView",
      title: "反馈建议",
    },
    layout: $layout.fill,
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
    views: [{
        type: "view",
        props: {
          id: "feedback",
        },
        layout: function(make, view) {
          make.left.right.inset(10)
          make.height.equalTo(300)
          make.top.inset(20)
        },
        events: {
          tapped: function(sender) {
            $("feedbackText").blur()
            $("feedbackContact").blur()
          }
        },
        views: [{
            type: "label",
            props: {
              id: "feedbackTextTitle",
              text: "反馈内容：",
              textColor: $color("#333333"),
              font: $font(15),
            },
            layout: function(make, view) {
              make.top.inset(10)
              make.left.inset(20)
            }
          },
          {
            type: "text",
            props: {
              id: "feedbackText",
              text: (text)?text:"",
              align: $align.left,
              radius: 5,
              textColor: $color("#333333"),
              font: $font(15),
              borderColor: $rgba(90, 90, 90, 0.6),
              borderWidth: 1,
              insets: $insets(5, 5, 5, 5),
              alwaysBounceVertical: true,
            },
            layout: function(make, view) {
              make.height.equalTo(160)
              make.top.equalTo($("feedbackTextTitle").bottom).inset(5)
              make.centerX.equalTo(view.center)
              make.left.right.inset(20)
            },
          },
          {
            type: "label",
            props: {
              id: "feedbackContactTitle",
              text: "联系方式(选填):",
              textColor: $color("#333333"),
              font: $font(15),
            },
            layout: function(make, view) {
              make.top.equalTo($("feedbackText").bottom).inset(20)
              make.left.inset(20)
            }
          },
          {
            type: "text",
            props: {
              id: "feedbackContact",
              textColor: $color("#333333"),
              font: $font(15),
              bgcolor: $color("white"),
              borderColor: $rgba(90, 90, 90, 0.6),
              borderWidth: 1,
              insets: $insets(5, 5, 5, 5),
              radius: 5,
              align: $align.center,
            },
            layout: function(make, view) {
              make.left.equalTo($("feedbackContactTitle").right).inset(10)
              make.right.inset(20)
              make.centerY.equalTo($("feedbackContactTitle").centerY)
              make.height.equalTo(30)
            }
          },
          {
            type: "button",
            props: {
              id: "sendFeedback",
              title: "发送",
              bgcolor: $color("#F0F0F6"),
              titleColor: $color("#3478f7"),
              font: $font("bold", 16),
              titleEdgeInsets: $insets(2, 5, 2, 5)
            },
            layout: function(make, view) {
              make.left.right.inset(20)
              make.height.equalTo(40)
              make.bottom.inset(10)
              make.centerX.equalTo(view.super)
            },
            events: {
              tapped: function(sender) {
                if ($("feedbackText").text.length > 0) {
                  sendFeedBack($("feedbackText").text, $("feedbackContact").text, ()=>{
                    $ui.alert({
                      title: "发送成功",
                      message: "感谢您的反馈！开发者会认真考虑！",
                      actions: [{
                        title: "OK",
                        handler: function() {
                          $ui.pop()
                        }
                      }]
                    })
                  })
                }
              },
            }
          },
          {
            type: "label",
            props: {
              text: "如果需要发送图片或者视频，请在公众号中进行反馈。",
              textColor: $color("#AAAAAA"),
              align: $align.left,
              font: $font(12),
              lines: 0,
            },
            layout: function(make, view) {
              make.top.equalTo(view.prev.bottom).inset(20)
              make.left.inset(20)
            }
          }
        ]
      },
    ]
  })
  if(text) {
    $delay(0.5, ()=>{
      if($("feedbackText")) {
        $("feedbackText").focus()
      }
    })
  }
}

function sendFeedBack(text, contact, handler) {
  $http.request({
    method: "POST",
    url: "https://knkfucsg.api.lncld.net/1.1/feedback",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": appId,
      "X-LC-Key": appKey,
    },
    body: {
      status: "open",
      content: text + "\nID: " + $objc("FCUUID").invoke("uuidForDevice").rawValue().toString(),
      contact: contact,
    },
    handler: function(resp) {
      $device.taptic(2)
      $delay(0.2, function() {
        $device.taptic(2)
      })
      handler()
    }
  })
}

function setupWebView(title, url, moreHandler) {
  let navButtons = (moreHandler)?[
    {
      icon: "022",
      handler: function() {
        if(moreHandler) {
          moreHandler()
        }
      }
    }
  ]:[];
  $ui.push({
    props: {
      title: title,
      navButtons: navButtons,
    },
    views: [{
      type: "web",
      props: {
        id: "webView",
        url: url,
      },
      layout: function(make, view) {
        make.center.equalTo(view.super)
        make.height.equalTo(view.super)
        make.width.equalTo(view.super)
      },
    }]
  })
}

function requireInstallNumbers(){
  $http.request({
    method: "GET",
    url: "https://knkfucsg.api.lncld.net/1.1/installations?count=1&limit=0",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": appId,
      "X-LC-Key": appKey,
    },
    handler: function(resp) {
      let results = resp.data.count
      if(results != undefined) {
        $("tabShowInstallsDetail").text = "" + results
      }
    }
  })
}

$app.listen({
  resume: function() {
    switch(resumeAction) {
      case 2: {
        let nDate = new Date()
        let sTime = utils.getCache("stopTime", nDate.getTime())
        let tdoa = (nDate.getTime() - sTime) / 1000
        $console.info(tdoa)
        if (tdoa > 5) {
          $photo.delete({
            count: 1,
            format: "data",
            handler: function(success) {
              $ui.alert({
                title: "温馨提示",
                message: "如果赞赏成功\n待开发者审核之后\n会将你的昵称放入赞赏名单里\n-----------\n如有匿名或其他要求请反馈给开发者",
              })
            }
          })
        }
        resumeAction = 0
      };break;
    }
  },
})

function checkBlackList() {
  let nowTime = new Date().getTime()
  let lastCheckTime = utils.getCache("lastCheckBlackTime")
  let needCheckBlackList = true
  if(lastCheckTime !== undefined && utils.getCache("haveBanned") !== undefined) {
    if((nowTime - lastCheckTime) / (60 * 1000) < 60) {
      needCheckBlackList = false
    }
  }
  if(needCheckBlackList) {
    $cache.remove("haveBanned")
    $cache.set("lastCheckBlackTime", nowTime)
    let url = "https://wcphv9sr.api.lncld.net/1.1/classes/list?where={\"deviceToken\":\"" + $objc("FCUUID").invoke("uuidForDevice").rawValue() + "\"}"
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
          $cache.set("haveBanned", true)
          view.showBannedAlert()
        } else {
          $cache.set("haveBanned", false)
        }
      }
    })
  }
}

module.exports = {
  setupView: setupView,
  show: show,
};
