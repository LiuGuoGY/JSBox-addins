/**
 * @version 1.1
 * @author Liu Guo
 * @date 2018.6.14
 * @brief
 *   1. 修复因为JSBox的Bug而导致的云库显示异常的问题
 * @/brief
 */

"use strict"

let appVersion = 1.1
let addinURL = "https://raw.githubusercontent.com/LiuGuoGY/JSBox-addins/master/launch-center.js"
let appId = "wCpHV9SrijfUPmcGvhUrpClI-gzGzoHsz"
let appKey = "CHcCPcIWDClxvpQ0f0v5tkMN"

uploadInstall()
if (needCheckup()) {
  checkupVersion()
}
if ($app.env == $env.today) {
  setupTodayView()
} else {
  setupMainView()
}

function setupTodayView() {
  $ui.render({
    props: {
      title: "Launch Center"
    },
    views: [{
      type: "matrix",
      props: {
        id: "rowsShow",
        columns: 5, //横行个数
        itemHeight: 50, //图标到字之间得距离
        spacing: 3, //每个边框与边框之间得距离
        template: [{
            type: "blur",
            props: {
              radius: 2.0, //调整边框是什么形状的如:方形圆形什么的
              style: 1 // 0 ~ 5 调整背景的颜色程度
            },
            layout: $layout.fill
          },
          {
            type: "label",
            props: {
              id: "title",
              textColor: $color("black"),
              bgcolor: $color("clear"),
              font: $font(13),
              align: $align.center,
            },
            layout(make, view) {
              make.bottom.inset(0)
              make.centerX.equalTo(view.super)
              make.height.equalTo(25)
              make.width.equalTo(view.super)
            }
          },
          {
            type: "image",
            props: {
              id: "icon",
              bgcolor: $color("clear"),
              size: $size(20, 20)
            },
            layout(make, view) {
              make.top.inset(9)
              make.centerX.equalTo(view.super)
              make.size.equalTo(20)
            }
          }
        ],
        data: getCache("localItems", [])
      },
      layout: $layout.fill,
      events: {
        didSelect(sender, indexPath, data) {
          $app.openURL(data.url)
        }
      }
    }]
  })
}

function setupMainView() {
  $ui.render({
    props: {
      title: "Launch Center"
    },
    views: [{
        type: "button",
        props: {
          id: "cloudButton",
          title: "  云端库  ",
          bgcolor: $color("clear"),
          titleColor: $color("orange"),
          icon: $icon("091", $color("orange"), $size(20, 20)),
          borderColor: $color("orange"),
          borderWidth: 1,
        },
        layout: function(make, view) {
          make.left.right.inset(10)
          make.height.equalTo(50)
          make.top.inset(5)
        },
        events: {
          tapped: function(sender) {
            setupStoreView()
          }
        }
      },
      {
        type: "label",
        props: {
          id: "localLabel",
          text: "本地库：",
          align: $align.left
        },
        layout: function(make, view) {
          make.width.equalTo(view.super)
          make.top.equalTo($("cloudButton").bottom).inset(5)
          make.left.inset(10)
        }
      },
      {
        type: "button",
        props: {
          id: "cleanButton",
          title: "清空所有",
          bgcolor: $color("clear"),
          titleColor: $color("blue"),
        },
        layout: function(make, view) {
          make.top.equalTo($("localLabel").bottom).inset(10)
          make.right.inset(10)
        },
        events: {
          tapped: function(sender) {
            $cache.set("localItems", [])
            $("rowsShow").data = []
          }
        }
      },
      {
        type: "button",
        props: {
          id: "refreshButton",
          title: "刷新",
          bgcolor: $color("clear"),
          titleColor: $color("#377116"),
        },
        layout: function(make, view) {
          make.top.equalTo($("localLabel").bottom).inset(10)
          make.left.inset(10)
        },
        events: {
          tapped: function(sender) {
            $("rowsShow").data = getCache("localItems", [])
          }
        }
      },
      {
        type: "matrix",
        props: {
          id: "rowsShow",
          columns: 5, //横行个数
          itemHeight: 50, //图标到字之间得距离
          spacing: 3, //每个边框与边框之间得距离
          template: [{
              type: "blur",
              props: {
                radius: 2.0, //调整边框是什么形状的如:方形圆形什么的
                style: 1 // 0 ~ 5 调整背景的颜色程度
              },
              layout: $layout.fill,
            },
            {
              type: "label",
              props: {
                id: "title",
                textColor: $color("black"),
                bgcolor: $color("clear"),
                font: $font(13),
                align: $align.center,
              },
              layout(make, view) {
                make.bottom.inset(0)
                make.centerX.equalTo(view.super)
                make.height.equalTo(25)
                make.width.equalTo(view.super)
              }
            },
            {
              type: "image",
              props: {
                id: "icon",
                bgcolor: $color("clear"),
                size: $size(20, 20),
              },
              layout(make, view) {
                make.top.inset(9)
                make.centerX.equalTo(view.super)
                make.size.equalTo(20)
              }
            },
          ],
          data: getCache("localItems", [])
        },
        layout: function(make, view) {
          make.width.equalTo(view.super)
          make.top.equalTo($("refreshButton").bottom).inset(10)
          make.height.equalTo(view.super).multipliedBy(0.4)
        },
        events: {
          didSelect(sender, indexPath, data) {
            $app.openURL(data.url)
          },
          // longPressed: function(sender, indexPath, data) {
          //   $("rowsShow").delete(indexPath)
          //   $cache.set("localItems", $("rowsShow").data)
          // }
        }
      },
      {
        type: "text",
        props: {
          id: "attentionText",
          text: "注意：\n\t刷新按钮刷新功能在 iOS 11 及以下，且 JSBox 版本在 1.20.0 及以下时，有时会有问题，此为 JSBox 的 Bug，此时建议重新进入插件即可实现刷新\n\t推荐设置为普通模式",
          align: $align.left,
          textColor: $color("gray"),
          editable: false,
          selectable: false,
          font: $font(13)
        },
        layout: function(make, view) {
          make.width.equalTo(view.super)
          make.top.equalTo($("rowsShow").bottom).inset(20)
          make.height.equalTo(100)
        }
      },
      {
        type: "button",
        props: {
          id: "feedbackButton",
          title: "反馈/建议",
          bgcolor: $color("clear"),
          titleColor: $color("#15BCF5"),
          borderColor: $color("#15BCF5"),
          borderWidth: 1,
        },
        layout: function(make, view) {
          make.left.right.inset(20)
          make.height.equalTo(50)
          make.bottom.inset(30)
        },
        events: {
          tapped: function(sender) {
            setupFeedBack()
          }
        }
      }
    ]
  })
}

function setupStoreView() {
  $ui.push({
    props: {
      title: "Launch Cloud"
    },
    views: [{
        type: "label",
        props: {
          id: "cloudLabel",
          text: "云库:",
          align: $align.left
        },
        layout: function(make, view) {
          make.top.inset(10)
        }
      },
      {
        type: "label",
        props: {
          id: "hint",
          text: "点击即可添加到本地",
          align: $align.left,
          font: $font(13),
          textColor: $color("gray")
        },
        layout: function(make, view) {
          make.left.equalTo($("cloudLabel").right).inset(10)
          make.bottom.equalTo($("cloudLabel").bottom)
        }
      },
      {
        type: "matrix",
        props: {
          id: "rowsCloudShow",
          columns: 5, //横行个数
          itemHeight: 50, //图标到字之间得距离
          spacing: 3, //每个边框与边框之间得距离
          template: [{
              type: "blur",
              props: {
                radius: 2.0, //调整边框是什么形状的如:方形圆形什么的
                style: 1 // 0 ~ 5 调整背景的颜色程度
              },
              layout: $layout.fill
            },
            {
              type: "label",
              props: {
                id: "title",
                textColor: $color("black"),
                bgcolor: $color("clear"),
                font: $font(13),
                align: $align.center,
              },
              layout(make, view) {
                make.bottom.inset(0)
                make.centerX.equalTo(view.super)
                make.height.equalTo(25)
                make.width.equalTo(view.super)
              }
            },
            {
              type: "image",
              props: {
                id: "icon",
                bgcolor: $color("clear"),
                size: $size(20, 20)
              },
              layout(make, view) {
                make.top.inset(9)
                make.centerX.equalTo(view.super)
                make.size.equalTo(20)
              }
            }
          ],
          data: [],
        },
        layout: function(make, view) {
          make.width.equalTo(view.super)
          make.top.equalTo($("cloudLabel").bottom).inset(10)
          make.height.equalTo(view.super).multipliedBy(0.7)
        },
        events: {
          didSelect(sender, indexPath, data) {
            let array = getCache("localItems", [])
            let item = sender.object(indexPath)
            array.push({
              title: {
                text: item.title.text
              },
              icon: {
                src: item.icon.src
              },
              url: item.url
            })
            $cache.set("localItems", array)
            $ui.toast("添加成功", 0.5)
          }
        }
      },
      {
        type: "button",
        props: {
          id: "cloudButton",
          title: "  我要上传  ",
          bgcolor: $color("clear"),
          titleColor: $color("#15BCF5"),
          icon: $icon("166", $color("#15BCF5"), $size(20, 20)),
          borderColor: $color("#15BCF5"),
          borderWidth: 1,
        },
        layout: function(make, view) {
          make.left.right.inset(20)
          make.height.equalTo(50)
          make.bottom.inset(30)
        },
        events: {
          tapped: function(sender) {
            setupUploadView()
          }
        }
      }
    ]
  })
  requireItems()
}

function setupUploadView() {
  $app.autoKeyboardEnabled = true
  $ui.push({
    props: {
      title: "Upload Launcher"
    },
    views: [{
        type: "label",
        props: {
          id: "previewLabel",
          text: "启动器预览：",
          align: $align.left
        },
        layout: function(make, view) {
          make.width.equalTo(view.super)
          make.top.inset(10)
          make.left.inset(10)
        }
      },
      {
        type: "view",
        props: {
          id: "preView",
          bgcolor: $color("#E2EDF9")
        },
        layout: function(make, view) {
          make.width.equalTo(view.super).dividedBy(5)
          make.top.equalTo($("previewLabel").bottom).inset(10)
          make.height.equalTo(50)
          make.centerX.equalTo(view.super)
        },
        views: [{
          type: "blur",
          props: {
            radius: 2.0, //调整边框是什么形状的如:方形圆形什么的
            style: 1 // 0 ~ 5 调整背景的颜色程度
          },
          layout: $layout.fill
        },
        {
          type: "label",
          props: {
            id: "title",
            textColor: $color("black"),
            bgcolor: $color("clear"),
            font: $font(13),
            text: "未定义",
            align: $align.center
          },
          layout(make, view) {
            make.bottom.inset(0)
            make.centerX.equalTo(view.super)
            make.height.equalTo(25)
            make.width.equalTo(view.super)
          }
        },
        {
          type: "image",
          props: {
            id: "icon",
            bgcolor: $color("clear"),
            size: $size(20, 20),
            icon: $icon("008", $color("gray"), $size(20, 20)),
          },
          layout(make, view) {
            make.top.inset(9)
            make.centerX.equalTo(view.super)
            make.size.equalTo(20)
          }
        }],
      },
      {
        type: "text",
        props: {
          id: "attentionLabel",
          text: "注意： \n\t上传的图片应为正方形，且为保证加载速度，图片的大小不应超过20KB。\n\t为保证文字显示完整，文字部分应不超过8个字符或4个汉字（一个汉字=两个字母）",
          align: $align.left,
          textColor: $color("gray"),
          editable: false,
          selectable: false,
          font: $font(13)
        },
        layout: function(make, view) {
          make.width.equalTo(view.super)
          make.top.equalTo($("preView").bottom).inset(20)
          make.height.equalTo(100)
        }
      },
      {
        type: "label",
        props: {
          id: "titleLabel",
          text: "文字部分：",
          align: $align.left
        },
        layout: function(make, view) {
          make.width.equalTo(view.super)
          make.top.equalTo($("attentionLabel").bottom).inset(20)
          make.left.inset(10)
        }
      },
      {
        type: "input",
        props: {
          id: "titleInput",
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo($("titleLabel").bottom).inset(10)
          make.size.equalTo($size(200, 32))
        },
        events: {
          changed: function(sender) {
            $("title").text = sender.text
          },
          returned: function(sender) {
            sender.blur()
          }
        }
      },
      {
        type: "label",
        props: {
          id: "iconLabel",
          text: "图标部分：",
          align: $align.left
        },
        layout: function(make, view) {
          make.width.equalTo(view.super)
          make.top.equalTo($("titleInput").bottom).inset(10)
          make.left.inset(10)
        }
      },
      {
        type: "button",
        props: {
          id: "chooseButton",
          title: "  选择图片  ",
          bgcolor: $color("clear"),
          titleColor: $color("#A24A11"),
          borderColor: $color("#A24A11"),
          borderWidth: 1,
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo($("iconLabel").bottom).inset(10)
          make.size.equalTo($size(200, 32))
        },
        events: {
          tapped: function(sender) {
            $photo.pick({
              size: $size(20),
              handler: function(resp) {
                $("icon").data = resp.image.png
                sender.info = resp.image.png
              }
            })
          }
        }
      },
      {
        type: "label",
        props: {
          id: "schemeLabel",
          text: "url scheme部分：",
          align: $align.left
        },
        layout: function(make, view) {
          make.width.equalTo(view.super)
          make.top.equalTo($("chooseButton").bottom).inset(20)
          make.left.inset(10)
        }
      },
      {
        type: "input",
        props: {
          id: "schemeInput",
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo($("schemeLabel").bottom).inset(10)
          make.size.equalTo($size(200, 32))
        },
        events: {
          returned: function(sender) {
            sender.blur()
          }
        }
      },
      {
        type: "button",
        props: {
          id: "cloudButton",
          title: "  开始上传  ",
          bgcolor: $color("clear"),
          titleColor: $color("#1B9713"),
          icon: $icon("049", $color("#1B9713"), $size(20, 20)),
          borderColor: $color("#1B9713"),
          borderWidth: 1,
        },
        layout: function(make, view) {
          make.left.right.inset(20)
          make.height.equalTo(50)
          make.bottom.inset(30)
        },
        events: {
          tapped: function(sender) {
            uploadSM($("chooseButton").info)
          }
        }
      }
    ]
  })
}

//赞赏页面
function setupReward() {
  const rewardTemplate = [{
      type: "label",
      props: {
        id: "templateTitle",
        textColor: $color("#333333"),
        font: $font("TrebuchetMS-Italic", 17)
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
    }
  ]
  let array = $cache.get("rewardList")
  if (array == undefined) {
    array = []
  }
  $ui.push({
    props: {
      title: "支持与赞赏",
      navBarHidden: isInToday(),
    },
    layout: $layout.fill,
    views: [{
        type: "view",
        props: {
          id: "reward",
        },
        layout: function(make, view) {
          make.left.right.inset(10)
          make.height.equalTo(300)
          make.center.equalTo(view.super)
        },
        events: {

        },
        views: [{
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
            type: "list",
            props: {
              id: "rewardList",
              template: rewardTemplate,
              radius: 5,
              borderColor: $rgba(90, 90, 90, 0.4),
              borderWidth: 1,
              insets: $insets(5, 5, 5, 5),
              rowHeight: 35,
              bgcolor: $color("clear"),
              selectable: false,
              data: [{
                rows: array,
              }, ],
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
              make.height.equalTo(160)
              make.top.equalTo($("rewardTextTitle").bottom).inset(5)
              make.centerX.equalTo(view.center)
              make.left.right.inset(20)
            },
            events: {
              didSelect: function(sender, indexPath, data) {

              }
            }
          },
          {
            type: "tab",
            props: {
              id: "selection",
              items: ["辣条￥2", "饮料￥5", "咖啡￥10"],
              tintColor: $color("#333333"),
              index: 0,
            },
            layout: function(make, view) {
              make.centerX.equalTo(view.super)
              make.width.equalTo(200)
              make.bottom.inset(60)
              make.height.equalTo(25)
            },
            events: {
              changed: function(sender) {}
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
                switch ($("selection").index) {
                  case 0:
                    $app.openURL("HTTPS://QR.ALIPAY.COM/FKX08935BBCTQWGRIJ7VDF")
                    break
                  case 1:
                    $app.openURL("HTTPS://QR.ALIPAY.COM/FKX09116CT3WME79IRNO41")
                    break
                  case 2:
                    $app.openURL("HTTPS://QR.ALIPAY.COM/FKX09563WVPH2YUGMKTX0A")
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
              title: " QQ ",
              icon: $icon("070", $color("#E81F1F"), $size(20, 20)),
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
                begainReward(sender.title)
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
          },
        ]
      },
      {
        type: "button",
        props: {
          title: "CLOSE",
          bgcolor: $color("clear"),
          titleColor: $rgba(100, 100, 100, 0.2),
          font: $font(15),
          hidden: !isInToday(),
        },
        layout: function(make, view) {
          make.right.inset(0)
          make.width.equalTo(view.super).multipliedBy(0.5)
          make.bottom.equalTo($("reward").top).inset(1)
          make.height.equalTo(30)
        },
        events: {
          tapped: function(sender) {
            $app.close(0.1)
          }
        }
      },
      {
        type: "button",
        props: {
          title: "BACK",
          bgcolor: $color("clear"),
          titleColor: $rgba(100, 100, 100, 0.2),
          font: $font(15),
          hidden: !isInToday(),
        },
        layout: function(make, view) {
          make.left.inset(0)
          make.width.equalTo(view.super).multipliedBy(0.5)
          make.bottom.equalTo($("reward").top).inset(1)
          make.height.equalTo(30)
        },
        events: {
          tapped: function(sender) {
            $ui.pop()
          }
        }
      }
    ]
  })
  requireReward()
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
    url: "https://raw.githubusercontent.com/LiuGuoGY/JSBox-addins/master/en-ch-translater/" + PicWay + "_reward_" + PicMoney + ".JPG",
    progress: function(bytesWritten, totalBytes) {
      var percentage = bytesWritten * 1.0 / totalBytes
    },
    handler: function(resp) {
      $photo.save({
        data: resp.data,
        handler: function(success) {
          if (success) {
            let nDate = new Date()
            $cache.set("stopTime", nDate.getTime())
            resumeAction = 1
            $app.openURL(url)

          }
        }
      })
    }
  })
}

//反馈页面
function setupFeedBack() {
  $ui.push({
    props: {
      title: "反馈与建议",
      navBarHidden: isInToday(),
    },
    layout: $layout.fill,
    views: [{
        type: "view",
        props: {
          id: "feedback",
        },
        layout: function(make, view) {
          make.left.right.inset(10)
          make.height.equalTo(300)
          make.center.equalTo(view.super)
        },
        events: {

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
              text: "",
              align: $align.left,
              radius: 5,
              textColor: $color("#333333"),
              font: $font(15),
              borderColor: $rgba(90, 90, 90, 0.6),
              borderWidth: 1,
              insets: $insets(5, 5, 5, 5),
              alwaysBounceVertical: false,
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
              bgcolor: $color("white"),
              borderColor: $rgba(90, 90, 90, 0.6),
              borderWidth: 1,
              titleColor: $rgba(90, 90, 90, 0.6),
              font: $font(15),
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
                  sendFeedBack($("feedbackText").text, $("feedbackContact").text)
                }
              }
            }
          },
        ]
      },
      {
        type: "button",
        props: {
          title: "CLOSE",
          bgcolor: $color("clear"),
          titleColor: $rgba(100, 100, 100, 0.2),
          font: $font(15),
          hidden: !isInToday(),
        },
        layout: function(make, view) {
          make.right.inset(0)
          make.width.equalTo(view.super).multipliedBy(0.5)
          make.bottom.equalTo($("feedback").top).inset(1)
          make.height.equalTo(30)
        },
        events: {
          tapped: function(sender) {
            $app.close(0.1)
          }
        }
      },
      {
        type: "button",
        props: {
          title: "BACK",
          bgcolor: $color("clear"),
          titleColor: $rgba(100, 100, 100, 0.2),
          font: $font(15),
          hidden: !isInToday(),
        },
        layout: function(make, view) {
          make.left.inset(0)
          make.width.equalTo(view.super).multipliedBy(0.5)
          make.bottom.equalTo($("feedback").top).inset(1)
          make.height.equalTo(30)
        },
        events: {
          tapped: function(sender) {
            $ui.pop()
          }
        }
      }
    ]
  })
}

//获取缓存 def为默认值
function getCache(key, def) {
  let temp = $cache.get(key)
  if (temp == undefined) {
    $cache.set(key, def)
    return def
  } else {
    return temp
  }
}

function isInToday() {
  return ($app.env == $env.today) ? true : false
}

//需要更新？
function needUpdate(nv, lv) {
  let m = parseFloat(nv) - parseFloat(lv)
  if (m < 0) {
    return true
  } else {
    return false
  }
}

//升级插件
function updateAddin(app) {
  $addin.save({
    name: currentName(),
    data: app,
    icon: currentIcon(),
    handler: function(success) {
      if (success) {
        $cache.remove("firstInstall")
        $device.taptic(2)
        $delay(0.2, function() {
          $device.taptic(2)
        })
        $ui.alert({
          title: "安装完成",
          actions: [{
            title: "OK",
            handler: function() {
              $app.openExtension($addin.current.name)
            }
          }]
        })
      }
    }
  })
}

//检查版本
function checkupVersion() {
  if ($app.env == $env.today && !getCache("showUi", true)) {
    $ui.loading("检查更新")
  }
  $http.download({
    url: addinURL,
    showsProgress: false,
    timeout: 5,
    handler: function(resp) {
      let str = resp.data.string
      let lv = getVFS(str)
      if ($app.env == $env.today && !getCache("showUi", true)) {
        $ui.loading(false)
      }
      if (needUpdate(appVersion, lv)) {
        sureToUpdate(str, resp.data, lv)
      }
    }
  })
}

//获取版本号
function getVFS(str) {
  let vIndex = str.indexOf("@version ")
  let start = vIndex + 9
  let end = str.indexOf("\n", start)
  let lv = str.substring(start, end)
  return lv
}

//获取更新说明
function getUpDes(str) {
  let bIndex = str.indexOf("@brief")
  let eIndex = str.indexOf("@/brief")
  let des = str.substring(bIndex + 6, eIndex)
  let fixDes = des.replace(/\*/g, "")
  return fixDes
}

//当前插件名
function currentName() {
  let name = $addin.current.name
  let end = name.length - 3
  return name.substring(0, end)
}

//当前插件图标
function currentIcon() {
  return $addin.current.icon
}

//确定升级？
function sureToUpdate(str, app, version) {
  let des = getUpDes(str)
  $ui.alert({
    title: "发现新版本 V" + version,
    message: des + "\n是否更新？",
    actions: [{
        title: "否",
        handler: function() {

        }
      },
      {
        title: "是",
        handler: function() {
          updateAddin(app)
        }
      },
    ]
  })
}

//需要检查更新？
function needCheckup() {
  let nDate = new Date()
  let lastCT = $cache.get("lastCT")
  if (lastCT == undefined) {
    $cache.set("lastCT", nDate)
    return true
  } else {
    let tdoa = (nDate.getTime() - lastCT.getTime()) / (60 * 1000)
    let interval = 1440
    if ($app.env == $env.app) {
      interval = 30
    }
    myLog("离下次检测更新: " + (interval - tdoa) + "  分钟")
    if (tdoa > interval) {
      $cache.set("lastCT", nDate)
      return true
    } else {
      return false
    }
  }
}

//myLog
function myLog(text) {
  if ($app.env == $env.app) {
    $console.log(text)
  }
}

//myloading
function myLoading(text) {
  $ui.loading(text)
}

//myAlert
function myAlert(text) {
  if ($app.env == $env.today && !getCache("showUi", true)) {
    $ui.alert(text)
  }
}

//myToast
function myToast(text, duration) {
  if ($app.env == $env.today && !getCache("showUi", true)) {
    $ui.toast(text, duration)
  }
}

function requireRewardNumber() {
  $http.request({
    method: "GET",
    url: "https://wcphv9sr.api.lncld.net/1.1/classes/Reward?count=1&limit=0",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": appId,
      "X-LC-Key": appKey,
    },
    handler: function(resp) {
      let results = resp.data.count
      if (results != undefined) {

      }
    }
  })
}

function requireItems() {
  $http.request({
    method: "GET",
    url: "https://wcphv9sr.api.lncld.net/1.1/classes/Items",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": appId,
      "X-LC-Key": appKey,
    },
    handler: function(resp) {
      let data = resp.data.results
      if (data != undefined) {
        let array = []
        for (let i = 0; i < data.length; i++) {
          array.push({
            title: {
              text: data[i].title
            },
            icon: {
              src: data[i].icon
            },
            url: data[i].url
          })
        }
        $("rowsCloudShow").data = array
      }
    }
  })
}

function uploadItem(title, icon, url) {
  $http.request({
    method: "POST",
    url: "https://wcphv9sr.api.lncld.net/1.1/classes/Items",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": appId,
      "X-LC-Key": appKey,
    },
    body: {
      title: title,
      icon: icon,
      url: url,
    },
    handler: function(resp) {
      $ui.toast("上传成功")
    }
  })
}

function requireReward() {
  $http.request({
    method: "GET",
    url: "https://wcphv9sr.api.lncld.net/1.1/classes/Reward",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": appId,
      "X-LC-Key": appKey,
    },
    handler: function(resp) {
      let data = resp.data.results
      let array = []
      if (data != undefined) {
        for (let i = 0; i < data.length; i++) {
          array.unshift({
            templateTitle: {
              text: data[i].name,
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

function requireInstallNumbers() {
  $http.request({
    method: "GET",
    url: "https://wcphv9sr.api.lncld.net/1.1/installations?count=1&limit=0",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": appId,
      "X-LC-Key": appKey,
    },
    handler: function(resp) {
      let results = resp.data.count
      if (results != undefined) {
        $("tabShowInstallsDetail").text = "" + results
      }
    }
  })
}

function uploadInstall() {
  if ($cache.get("firstInstall") == undefined) {
    $cache.set("firstInstall", true)
    $http.request({
      method: "POST",
      url: "https://wcphv9sr.api.lncld.net/1.1/installations",
      timeout: 5,
      header: {
        "Content-Type": "application/json",
        "X-LC-Id": appId,
        "X-LC-Key": appKey,
      },
      body: {
        addinVersion: appVersion.toFixed(1),
        iosVersion: $device.info.version,
        jsboxVersion: $app.info.version,
        deviceType: "ios",
        deviceToken: $objc("FCUUID").invoke("uuidForDevice").rawValue()
      },
      handler: function(resp) {}
    })
  }
}

function uploadSM(pic) {
  if (typeof(pic) != "undefined") {
    $ui.loading(true)
    $http.upload({
      url: "https://sm.ms/api/upload",
      files: [{ "data": pic, "name": "smfile" }],
      handler: function(resp) {
        $ui.loading(false)
        var data = resp.data.data
        uploadItem($("title").text, data.url, $("schemeInput").text)
      }
    })
  }
}

function sendFeedBack(text, contact) {
  $http.request({
    method: "POST",
    url: "https://wcphv9sr.api.lncld.net/1.1/feedback",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": appId,
      "X-LC-Key": appKey,
    },
    body: {
      status: "open",
      content: text,
      contact: contact,
    },
    handler: function(resp) {
      $device.taptic(2)
      $delay(0.2, function() {
        $device.taptic(2)
      })
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
    }
  })
}
