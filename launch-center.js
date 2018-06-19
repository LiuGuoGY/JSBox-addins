/**
 * @version 1.5
 * @author Liu Guo
 * @date 2018.6.19
 * @brief
 *   1. 修复云库不能显示超过100的问题
 * @/brief
 */

"use strict"

let appVersion = 1.5
let addinURL = "https://raw.githubusercontent.com/LiuGuoGY/JSBox-addins/master/launch-center.js"
let appId = "wCpHV9SrijfUPmcGvhUrpClI-gzGzoHsz"
let appKey = "CHcCPcIWDClxvpQ0f0v5tkMN"
let resumeAction = 0

uploadInstall()
if (needCheckup()) {
  checkupVersion()
}
if ($app.env == $env.today) {
  setupTodayView()
} else {
  setupMainView()
}

$app.listen({
  pause: function() {
    switch(resumeAction) {
      case 1: 
      let nDate = new Date()
      let sTime = getCache("begainTime", nDate.getTime())
      let duration = (nDate.getTime() - sTime)
      if (duration < 100) {
        verifyStateSet(true)
      } else {
        verifyStateSet(false)
      }
      resumeAction = 0
      break
    }
  }
})

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
              make.size.equalTo($size(20, 20))
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
            $ui.alert({
              title: "确定清空？",
              message: "清空操作无法撤销",
              actions: [
                {
                  title: "OK",
                  handler: function() {
                    $cache.set("localItems", [])
                    $("rowsShow").data = []
                  }
                },
                {
                  title: "Cancel",
                  handler: function() {
            
                  }
                }
              ]
            })
          }
        }
      },
      {
        type: "button",
        props: {
          id: "deleteButton",
          title: "删除",
          bgcolor: $color("clear"),
          titleColor: $color("#377116"),
          info: false,
        },
        layout: function(make, view) {
          make.top.equalTo($("localLabel").bottom).inset(10)
          make.left.inset(10)
          make.width.equalTo(50)
        },
        events: {
          tapped: function(sender) {
            if (sender.info == false) {
              sender.info = true
              sender.bgcolor = $color("#C70039")
              sender.titleColor = $color("white")
            } else {
              sender.info = false
              sender.bgcolor = $color("clear")
              sender.titleColor = $color("#377116")
            }
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
                make.size.equalTo($size(20, 20))
              }
            },
          ],
          data: getCache("localItems", [])
        },
        layout: function(make, view) {
          make.width.equalTo(view.super)
          make.top.equalTo($("deleteButton").bottom).inset(10)
          make.height.equalTo(view.super).multipliedBy(0.4)
          make.centerX.equalTo(view.super)
        },
        events: {
          didSelect(sender, indexPath, data) {
            if($("deleteButton").info == false) {
              $app.openURL(data.url)
            } else {
              $("rowsShow").delete(indexPath)
              $cache.set("localItems", $("rowsShow").data)
            }
          },
          pulled: function(sender) {
            $("rowsShow").data = getCache("localItems", [])
            $("rowsShow").endRefreshing()
          }
        }
      },
      {
        type: "text",
        props: {
          id: "attentionText",
          text: "注意：\n\t普通模式不宜添加过多，否则容易出现无法载入，性能模式无此限制",
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
                make.size.equalTo($size(20,20))
              }
            }
          ],
          data: getCache("cloudItems", []),
        },
        layout: function(make, view) {
          make.width.equalTo(view.super)
          make.top.equalTo($("cloudLabel").bottom).inset(10)
          make.height.equalTo(view.super).multipliedBy(0.7)
          make.centerX.equalTo(view.super)
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
          },
          pulled: function(sender) {
            requireItems()
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
          make.left.inset(20)
          make.height.equalTo(50)
          make.bottom.inset(30)
          make.width.equalTo(view.super).multipliedBy(0.4)
        },
        events: {
          tapped: function(sender) {
            setupUploadView()
          }
        }
      },
      {
        type: "button",
        props: {
          id: "cloudButton",
          title: "  我上传的  ",
          bgcolor: $color("clear"),
          titleColor: $color("#F39C12"),
          icon: $icon("109", $color("#F39C12"), $size(20, 20)),
          borderColor: $color("#F39C12"),
          borderWidth: 1,
        },
        layout: function(make, view) {
          make.right.inset(20)
          make.height.equalTo(50)
          make.bottom.inset(30)
          make.width.equalTo(view.super).multipliedBy(0.4)
        },
        events: {
          tapped: function(sender) {
            setupMyUpView()
          }
        }
      }
    ]
  })
  requireItems()
}

function setupMyUpView() {
  $ui.push({
    props: {
      title: "My Upload"
    },
    views: [{
      type: "label",
      props: {
        id: "myUploadLabel",
        text: "我上传的：",
        align: $align.left
      },
      layout: function(make, view) {
        make.top.inset(10)
        make.left.inset(10)
      }
    },
    {
      type: "button",
      props: {
        id: "deleteButton",
        title: "删除",
        bgcolor: $color("clear"),
        titleColor: $color("#377116"),
        info: false,
      },
      layout: function(make, view) {
        make.top.equalTo($("myUploadLabel").bottom).inset(10)
        make.left.inset(10)
        make.width.equalTo(50)
      },
      events: {
        tapped: function(sender) {
          if (sender.info == false) {
            sender.info = true
            sender.bgcolor = $color("#C70039")
            sender.titleColor = $color("white")
          } else {
            sender.info = false
            sender.bgcolor = $color("clear")
            sender.titleColor = $color("#377116")
          }
        }
      }
    },
    {
      type: "matrix",
      props: {
        id: "rowsMyShow",
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
              make.size.equalTo($size(20, 20))
            }
          },
        ],
        data: [],
      },
      layout: function(make, view) {
        make.width.equalTo(view.super)
        make.top.equalTo($("deleteButton").bottom).inset(10)
        make.height.equalTo(view.super).multipliedBy(0.7)
        make.centerX.equalTo(view.super)
      },
      events: {
        didSelect(sender, indexPath, data) {
          if($("deleteButton").info == false) {
            $app.openURL(data.url)
          } else {
            $ui.alert({
              title: "确定删除？",
              message: "删除操作不可撤销，请谨慎操作",
              actions: [
                {
                  title: "OK",
                  handler: function() {
                    deleteCloudItem(data.info.objectId)
                    $("rowsMyShow").delete(indexPath)
                    $cache.set("myItems", $("rowsMyShow").data)
                  }
                },
                {
                  title: "Cancel",
                  handler: function() {
            
                  }
                }
              ]
            })
          }
        },
        pulled: function(sender) {
          requireMyItems()
        }
      }
    },]
  })
  requireMyItems()
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
            make.size.equalTo($size(20,20))
          }
        }],
      },
      {
        type: "text",
        props: {
          id: "attentionLabel",
          text: "注意： \n\t为保证文字显示完整，文字部分最好不超过8个字符或4个汉字（一个汉字=两个字母）",
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
          make.size.equalTo($size(150, 32))
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
          make.size.equalTo($size(100, 32))
        },
        events: {
          tapped: function(sender) {
            $photo.pick({
              format: "data",
              handler: function(resp) {
                let mimeType = resp.data.info.mimeType
                let cutedIcon = cutIcon(resp.data.image)
                if (mimeType.indexOf("png") >= 0) {
                  sender.info = cutedIcon.png
                  $("icon").data = cutedIcon.png
                } else {
                  sender.info = cutedIcon.jpg(1.0)
                  $("icon").data = cutedIcon.jpg(1.0)
                }
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
          make.size.equalTo($size(150, 32))
        },
        events: {
          returned: function(sender) {
            sender.blur()
          },
          changed: function(sender) {
            verifyStateSet()
          }
        }
      },
      {
        type: "button",
        props: {
          id: "verifyButton",
          title: "验证",
          font: $font(10),
          bgcolor: $color("clear"),
          titleColor: $color("gray"),
          borderWidth: 1,
          borderColor: $color("gray"),
          info: false,
        },
        layout: function(make, view) {
          make.centerY.equalTo($("schemeInput"))
          make.left.equalTo($("schemeInput").right).inset(3)
        },
        events: {
          tapped: function(sender) {
            $app.openURL($("schemeInput").text)
            let nDate = new Date()
            $cache.set("begainTime", nDate.getTime())
            resumeAction = 1
            $thread.background({
              delay: 0.2,
              handler: function() {
                if (resumeAction == 1) {
                  resumeAction = 0
                  verifyStateSet(false)
                }
              }
            })
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
            if ($("titleInput").text.length == 0 || $("schemeInput").text.length == 0 || $("chooseButton").info == undefined) {
              $ui.error("请补全信息")
            } else if ($("verifyButton").info == false) {
              $ui.alert({
                title: "警告",
                message: "请先点击验证按钮验证",
                actions: [
                  {
                    title: "仍要上传",
                    handler: function() {
                      $ui.alert({
                        title: "提醒",
                        message: "请确认url scheme的正确性",
                        actions: [
                          {
                            title: "上传",
                            handler: function() {
                              uploadSM($("chooseButton").info)
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
                  },
                  {
                    title: "取消",
                    handler: function() {
              
                    }
                  }
                ]
              })
            } else {
              uploadSM($("chooseButton").info)
            }
          }
        }
      }
    ]
  })
}

function verifyStateSet(isSuccess) {
  let button = $("verifyButton")
  if(isSuccess == undefined) {
    button.bgcolor = $color("clear")
    button.titleColor = $color("gray")
    button.borderColor = $color("gray")
    button.info = false
  } else if (isSuccess == false) {
    button.bgcolor = $color("red")
    button.titleColor = $color("white")
    button.borderColor = $color("red")
    button.info = false
  } else if (isSuccess == true) {
    button.bgcolor = $color("green")
    button.titleColor = $color("white")
    button.borderColor = $color("green")
    button.info = true
  }
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
      $console.info(str)
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
    url: "https://wcphv9sr.api.lncld.net/1.1/classes/Items?limit=1000",
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
        $("rowsCloudShow").endRefreshing()
        $cache.set("cloudItems", array)
      } else {
        $("rowsCloudShow").endRefreshing()
      }
    }
  })
}

function requireMyItems() {
  let url = "https://wcphv9sr.api.lncld.net/1.1/classes/Items?limit=1000&where={\"deviceToken\":\"" + $objc("FCUUID").invoke("uuidForDevice").rawValue() + "\"}"
  $console.info(url)
  $http.request({
    method: "GET",
    url: encodeURI(url),
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": appId,
      "X-LC-Key": appKey,
    },
    handler: function(resp) {
      let data = resp.data.results
      $console.info(resp.data)
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
            url: data[i].url,
            info: {
              objectId: data[i].objectId,
            }
          })
        }
        $("rowsMyShow").data = array
        $("rowsMyShow").endRefreshing()
        $cache.set("myItems", array)
      } else {
        $("rowsMyShow").endRefreshing()
      }
    }
  })
}

function deleteCloudItem(objectId) {
  if (objectId == "" || objectId == undefined) {
    return 0;
  }
  $http.request({
    method: "DELETE",
    url: "https://wcphv9sr.api.lncld.net/1.1/classes/Items/" + objectId,
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": appId,
      "X-LC-Key": appKey,
    },
    handler: function(resp) {
      let data = resp.data.results
      $console.info(resp.data)
    }
  })
}

function uploadItem(title, icon, url, size, deviceToken) {
  let size_k = ""
  if (size < 1000000) {
    size_k = size / 1000 + " K"
  } else {
    size_k = size / 1000000 + " M"
  }
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
      size: size_k,
      deviceToken: deviceToken,
    },
    handler: function(resp) {
      $ui.toast("上传成功")
      $ui.pop()
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

function cutIcon(image) {
  let canvas = $ui.create({type: "view"})
  let canvasSize = 50
  canvas.add({
    type: "image",
    props: {
      image: image,
      frame: $rect(0, 0, canvasSize, canvasSize)
    }
  })
  canvas.frame = $rect(0, 0, canvasSize, canvasSize)
  let snapshot = canvas.snapshot
  return snapshot
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
        uploadItem($("title").text, data.url, $("schemeInput").text, data.size, $objc("FCUUID").invoke("uuidForDevice").rawValue())
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
