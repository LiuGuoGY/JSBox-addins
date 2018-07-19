/**
 * @version 2.6
 * @author Liu Guo
 * @date 2018.7.19
 * @brief
 *   1. 适配最新tf(build 258)
 * @/brief
 */

"use strict"

let appVersion = 2.6
let addinURL = "https://raw.githubusercontent.com/LiuGuoGY/JSBox-addins/master/launch-center.js"
let appId = "wCpHV9SrijfUPmcGvhUrpClI-gzGzoHsz"
let appKey = "CHcCPcIWDClxvpQ0f0v5tkMN"
let resumeAction = 0

const mColor = {
  gray: "#a2a2a2",
  blue: "#3478f7",
  black: "#303032",
}
const mIcon = [
  {
    blue: $icon("102", $color(mColor.blue), $size(25, 25)),
    gray: $icon("102", $color(mColor.gray), $size(25, 25)),
  },
  {
    blue: $icon("091", $color(mColor.blue), $size(25, 25)),
    gray: $icon("091", $color(mColor.gray), $size(25, 25)),
  },
  {
    blue: $icon("002", $color(mColor.blue), $size(25, 25)),
    gray: $icon("002", $color(mColor.gray), $size(25, 25)),
  },
]

uploadInstall()
if (needCheckup()) {
  checkupVersion()
}
if ($app.env == $env.today) {
  if($app.widgetIndex == -1) {
    setupTodayView()
  } else {
    setupWidgetView()
  }
} else {
  setupMainView()
}
$delay(0, function(){
  let view = $("gradientParent")
  let hintText = $("hintText")
  view.remakeLayout(function(make) {
    make.centerY.equalTo(hintText)
    make.width.equalTo(20)
    make.height.equalTo(hintText)
    make.right.equalTo(hintText.right).inset(5)
  })
  $ui.animate({
    duration: 2.5,
    animation: function() {
      view.relayout(); 
    }
  })
})

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
  },
  resume: function() {
    let nDate = new Date()
    let sTime = getCache("stopTime", nDate.getTime())
    let tdoa = (nDate.getTime() - sTime) / 1000
    if (tdoa > 5) {
      switch(resumeAction) {
        case 2:
        sTime = getCache("stopTime", nDate.getTime())
        let tdoa = (nDate.getTime() - sTime) / 1000
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
        break
      }
      resumeAction = 0
    }
  }
})

function setupTodayView() {
  $ui.render({
    props: {
      title: "Launch Center",
      navBarHidden: true
    },
    layout: function(make, view) {
      make.top.left.right.inset(0)
      make.height.equalTo(100)
      // make.width.equalTo(view.super)
    },
    views: [{
      type: "matrix",
      props: {
        id: "rowsShow",
        columns: getCache("columns", 4), //横行个数
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
          $device.taptic(1)
          $app.openURL(data.url)
        }
      }
    }]
  })
}

function setupWidgetView() {
  $ui.render({
    props: {
      title: "Launch Center",
    },
    views: [{
      type: "matrix",
      props: {
        id: "rowsShow",
        columns: getCache("columns", 4), //横行个数
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
          $device.taptic(1)
          $app.openURL(data.url)
        }
      }
    }]
  })
}

let contentViews = ["localView", "cloudView", "settingView"]

function setupMainView() {
  $ui.render({
    props: {
      title: "Launch Center",
      navBarHidden: true,
      statusBarStyle: 0,
    },
    views: [{
        type: "view",
        props: {
          id: "content",
          bgcolor: $color("clear"),
        },
        layout: function(make, view) {
          make.width.equalTo(view.super)
          make.left.right.inset(0)
          make.bottom.inset(50)
          if($device.info.version >= "11" && $device.isIphoneX){
            make.top.equalTo(view.super.safeAreaTop)
          } else {
            make.top.inset(20)
          }
        },
        views: [genLocalView()], //, genCloudView(), genSettingView()
      },
      {
        type: "blur",
        props: {
          style: 5 // 0 ~ 5 调整背景的颜色程度
        },
        layout: function(make, view) {
          make.left.bottom.right.inset(0)
          if($device.info.version >= "11" && $device.isIphoneX){
            make.top.equalTo(view.super.safeAreaBottom).offset(-50)
          } else {
            make.height.equalTo(50)
          }
        },
      },
      {
        type: "matrix",
        props: {
          id: "tab",
          columns: 3,
          itemHeight: 50,
          spacing: 0,
          scrollEnabled: false,
          bgcolor: $color("clear"),
          template: [{
              type: "image",
              props: {
                id: "menu_image",
                bgcolor: $color("clear")
              },
              layout: function(make, view) {
                make.centerX.equalTo(view.super)
                make.width.height.equalTo(25)
                make.top.inset(7)
              },
            },
            {
              type: "label",
              props: {
                id: "menu_label",
                font: $font(10),
              },
              layout: function(make, view) {
                var preView = view.prev
                make.centerX.equalTo(preView)
                make.bottom.inset(3)
              }
            }
          ],
          data: [{
            menu_image: {
              icon: mIcon[0].blue,
            },
            menu_label: {
              text: "本地",
              textColor: $color(mColor.blue)
            }
          },
          {
            menu_image: {
              icon: mIcon[1].gray,
            },
            menu_label: {
              text: "云库",
              textColor: $color(mColor.gray)
            }
          },
          {
            menu_image: {
              icon: mIcon[2].gray,
            },
            menu_label: {
              text: "设置",
              textColor: $color(mColor.gray),
            }
          }
        ],
        },
        layout: function(make, view) {
          make.height.equalTo(50)
          make.left.right.inset(0)
          if($device.info.version >= "11" && $device.isIphoneX){
            make.bottom.equalTo(view.super.safeAreaBottom)
          } else {
            make.bottom.inset(0)
          }
        },
        events: {
          didSelect(sender, indexPath, data) {
            handleSelect(sender, indexPath.row)
          },
        }
      },
      {
        type: "canvas",
        layout: function(make, view) {
          var preView = view.prev
          make.top.equalTo(preView.top)
          make.height.equalTo(1)
          make.left.right.inset(0)
        },
        events: {
          draw: function(view, ctx) {
            var width = view.frame.width
            var scale = $device.info.screen.scale
            ctx.strokeColor = $color("gray")
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.width.equalTo(view.super)
          make.left.right.top.inset(0)
          make.height.equalTo(20)
        },
      },
    ]
  })
}

function handleSelect(view, row) {
  let newData = view.data
  for(let i = 0; i < newData.length; i++) {
    if (i == row) {
      newData[i].menu_label.textColor = $color(mColor.blue)
      newData[i].menu_image.icon = mIcon[i].blue
      if($(contentViews[i]) == undefined) {
        $("content").add(getContentView(i)) 
      }
      $(contentViews[i]).hidden = false
    } else {
      newData[i].menu_label.textColor = $color(mColor.gray)
      newData[i].menu_image.icon = mIcon[i].gray
      if($(contentViews[i]) != undefined) {
        $(contentViews[i]).hidden = true
      }
    }
  }
  view.data = newData
}

function getContentView(number) {
  switch(number) {
    case 0: return genLocalView()
    case 1: return genCloudView()
    case 2: return genSettingView()
  }
}

function genRowsView(reorder, columns) {
  let view = {
    type: "matrix",
    props: {
      id: "rowsShow",
      columns: columns, //横行个数
      itemHeight: 50, //图标到字之间得距离
      spacing: 3, //每个边框与边框之间得距离
      reorder: reorder,
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
    layout: $layout.fill,
    events: {
      didSelect(sender, indexPath, data) {
        let view = $("deleteLocalButton")
        if(view == undefined || view.info == false) {
          $device.taptic(1)
          $app.openURL(data.url)
        } else {
          $("rowsShow").delete(indexPath)
          $cache.set("localItems", $("rowsShow").data)
        }
      },
      pulled: function(sender) {
        $("rowsShow").data = getCache("localItems", [])
        $("rowsShow").endRefreshing()
      },
      reorderFinished: function(data) {
        $cache.set("localItems", $("rowsShow").data)
      },
      didLongPress: function(sender, indexPath, data) {
        $device.taptic(2)
        $ui.menu({
          items: ["复制URL", "保存到桌面", "编辑"],
          handler: function(title, idx) {
            if(idx == 0) {
              $clipboard.text = getCache("localItems", [])[indexPath.row].url
              $ui.toast("复制成功")
            } else if(idx == 1) {
              $system.makeIcon({ title: getCache("localItems", [])[indexPath.row].title.text, url: getCache("localItems", [])[indexPath.row].url, icon: $("rowsShow").cell(indexPath).get("icon").image })
            } else if(idx == 2) {
              setupUploadView("edit", data.title.text, data.icon.src, data.url, undefined, indexPath)
            }
          }
        })
      }
    }
  }
  return view
}

function genLocalView() {
  let view = {
    type: "view",
    props: {
      id: "localView",
      hidden: false,
    },
    layout: $layout.fill,
    views: [{
      type: "button",
      props: {
        id: "reorderButton",
        title: "排序",
        bgcolor: $color("clear"),
        titleColor: $color("orange"),
        info: false,
      },
      layout: function(make, view) {
        make.top.inset(10)
        make.right.inset(10)
        make.width.equalTo(50)
        make.height.equalTo(30)
      },
      events: {
        tapped: function(sender) {
          if (sender.info == false) {
            sender.info = true
            sender.bgcolor = $color("#C70039")
            sender.titleColor = $color("white")
            $("rowsShow").remove()
            $("rowsShowParent").add(genRowsView(true, getCache("columns", 4)))
          } else {
            sender.info = false
            sender.bgcolor = $color("clear")
            sender.titleColor = $color("orange")
            $("rowsShow").remove()
            $("rowsShowParent").add(genRowsView(false, getCache("columns", 4)))
          }
        }
      }
    },
    {
      type: "button",
      props: {
        id: "deleteLocalButton",
        title: "删除",
        bgcolor: $color("clear"),
        titleColor: $color("#377116"),
        info: false,
      },
      layout: function(make, view) {
        make.top.inset(10)
        make.left.inset(10)
        make.width.equalTo(50)
        make.height.equalTo(30)
      },
      events: {
        tapped: function(sender) {
          if (sender.info == undefined || sender.info == false) {
            sender.info = true
            sender.bgcolor = $color("#C70039")
            sender.titleColor = $color("white")
          } else {
            sender.info = false
            sender.bgcolor = $color("clear")
            sender.titleColor = $color("#377116")
          }
        },
        longPressed: function(sender) {
          $device.taptic(2)
          $ui.alert({
            title: "确定清空？",
            message: "清空操作无法撤销",
            actions: [
              {
                title: "OK",
                handler: function() {
                  $device.taptic(2)
                  $delay(0.15, function(){
                    $device.taptic(2)
                  })
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
    },{
      type: "label",
      props: {
        id: "hintText",
        text: getHintText(),
        textColor: $color("lightGray"),
        align: $align.center,
        font: $font(15)
      },
      layout: function(make, view) {
        make.centerY.equalTo(view.prev)
        make.centerX.equalTo(view.super)
        make.left.equalTo(view.prev.right).inset(10)
        make.right.equalTo(view.prev.prev.left).inset(10)
      },
    },{
      type: "view",
      props: {
        id: "gradientParent",
      },
      layout: function(make, view) {
        make.centerY.equalTo(view.prev)
        make.left.equalTo(view.prev.left).inset(5)
        make.width.equalTo(20)
        make.height.equalTo(view.prev)
      },
      views: [{
        type: "gradient",
        props: {
          colors: [$rgba(255, 255, 255, 0.0), $rgba(255, 255, 255, 1.0), $rgba(255, 255, 255, 0.0)],
          locations: [0, 0.5, 1],
          startPoint: $point(0, 0.5),
          endPoint: $point(1, 0.5),
          hidden: false,
        },
        layout: $layout.fill,
      }]
    },{
      type: "view",
      props: {
        id: "rowsShowParent",
      },
      layout: function(make, view) {
        make.width.equalTo(view.super)
        make.top.equalTo($("deleteLocalButton").bottom).inset(10)
        make.bottom.inset(5)
        make.centerX.equalTo(view.super)
      },
      views: [genRowsView(false, getCache("columns", 4))]
    },]
  }
  return view
}

function genCloudView() {

  const searchBar = {
    type: "view",
    layout: $layout.fill,
    views: [{
      type: "button",
      props: {
        id: "cancel_button",
        title: "取消",
        font: $font(17),
        titleColor: $color(mColor.blue),
        bgcolor: $color("clear"),
      },
      layout: function(make, view) {
        make.centerY.equalTo(view.super)
        make.right.inset(0)
        make.size.equalTo($size(0, 35))
      },
      events: {
        tapped: function(sender) {
          let input = $("search_input")
          input.blur()
        }
      }
    },
    {
      type: "view",
      props: {
        bgcolor: $rgba(100, 100, 100, 0.1),
        radius: 10,
      },
      layout: function(make, view) {
        make.centerY.equalTo(view.super)
        make.left.inset(0)
        make.right.equalTo(view.prev.left)
        make.height.equalTo(35)
      },
      views: [{
        type: "image",
        props: {
          icon: $icon("023", $rgba(100, 100, 100, 0.4), $size(15, 15)),
          bgcolor: $color("clear"),
        },
        layout: function(make, view) {
          make.centerY.equalTo(view.super)
          make.left.inset(7)
          make.size.equalTo($size(15, 15))
        },
      },{
        type: "input",
        props: {
          id: "search_input",
          returnKeyType: 6,
        },
        layout: function(make, view) {
          make.centerY.equalTo(view.super)
          make.right.inset(0)
          make.height.equalTo(view.super)
          make.left.equalTo(view.prev.right).inset(0)
          make.width.equalTo(view.frame.width - 22)
        },
        events: {
          didBeginEditing: function(sender, view) {
            $("cancel_button").updateLayout(function(make) {
              make.size.equalTo($size(55, 35))
            })
            $ui.animate({
              duration: 0.4,
              damping: 0.8,
              animation: function() {
                $("cancel_button").relayout()
              }
            })
          },
          didEndEditing: function(sender) {
            $("cancel_button").updateLayout(function(make) {
              make.size.equalTo($size(0, 35))
            })
            $ui.animate({
              duration: 0.4,
              damping: 0.8,
              animation: function() {
                $("cancel_button").relayout()
              }
            })
          },
          changed: function(sender) {
            if(sender.text.length > 0) {
              $("search_hint").hidden = true
            } else {
              $("search_hint").hidden = false
              searchItems(sender.text)
            }
          },
          returned: function(sender) {
            sender.blur()
            searchItems(sender.text)
          },
        },
        views: [{
          type: "label",
          props: {
            id: "search_hint",
            text: " Launcher",
            align: $align.center,
            textColor: $rgba(100, 100, 100, 0.4),
            hidden: false,
          },
          layout: function(make, view) {
            make.left.inset(5)
            make.centerY.equalTo(view.super)
          }
        }]
      },]
    }]
  }

  let view = {
    type: "view",
    props: {
      id: "cloudView",
      hidden: true,
    },
    layout: $layout.fill,
    views: [{
      type: "button",
      props: {
        id: "cloudButton",
        bgcolor: $color("clear"),
        titleColor: $color("#F39C12"),
        icon: $icon("109", $color("#F39C12"), $size(20, 20)),
        font: $font(17),
        // borderColor: $color("#F39C12"),
        // borderWidth: 1,
      },
      layout: function(make, view) {
        make.right.inset(20)
        make.height.equalTo(30)
        make.top.inset(10)
        make.width.equalTo(40)
      },
      events: {
        tapped: function(sender) {
          setupMyUpView()
        }
      }
    },{
      type: "button",
      props: {
        id: "cloudButton",
        font: $font(17),
        bgcolor: $color("clear"),
        titleColor: $color("#15BCF5"),
        icon: $icon("166", $color("#15BCF5"), $size(20, 20)),
        // borderColor: $color("#15BCF5"),
        // borderWidth: 1,
      },
      layout: function(make, view) {
        make.right.equalTo(view.prev.left)
        make.height.equalTo(30)
        make.top.inset(10)
        make.width.equalTo(40)
      },
      events: {
        tapped: function(sender) {
          setupUploadView("upload")
        }
      }
    },
    {
      type: "view",
      layout: function(make, view) {
        make.left.inset(20)
        make.height.equalTo(30)
        make.top.inset(10)
        make.right.equalTo(view.prev.left).inset(10)
      },
      views: [searchBar]
    },
    {
      type: "matrix",
      props: {
        id: "rowsCloudShow",
        columns: 4, //横行个数
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
        make.top.equalTo(view.prev.bottom).inset(10)
        make.bottom.inset(5)
        make.centerX.equalTo(view.super)
      },
      events: {
        didSelect(sender, indexPath, data) {
          addToLocal(sender, indexPath)
        },
        pulled: function(sender) {
          requireItems()
        },
        didLongPress: function(sender, indexPath, data) {
          $device.taptic(2)
          $ui.menu({
            items: ["添加到本地"],
            handler: function(title, idx) {
              if(idx == 0) {
                addToLocal(sender, indexPath)
              }
            }
          })
        }
      }
    },],
  }
  requireItems()
  return view
}

function searchItems(text) {
  if(text == "" || text.length <= 0) {
    $("rowsCloudShow").data = getCache("cloudItems", [])
  } else {
    $text.tokenize({
      text: text,
      handler: function(results) {
        let resultItems = []
        let cloudItems = getCache("cloudItems", [])
        for(let i = 0; i < cloudItems.length; i++) {
          for(let j = 0; j < results.length; j++) {
            if(cloudItems[i].title.text.toLowerCase().indexOf(results[j].toLowerCase()) >= 0 || cloudItems[i].url.toLowerCase().indexOf(results[j].toLowerCase()) >= 0) {
              resultItems.push(cloudItems[i])
              break
            }
          }
        }
        $("rowsCloudShow").data = resultItems
      }
    })
  }
}

function addToLocal(sender, indexPath) {
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
  $("rowsShow").data = getCache("localItems", [])
}

function updateToLocal(sender, indexPath, title, icon, url) {
  let array = getCache("localItems", [])
  let item = sender.object(indexPath)
  array[indexPath.row].title.text = title
  array[indexPath.row].icon.src = icon
  array[indexPath.row].url = url
  $cache.set("localItems", array)
  $("rowsShow").data = getCache("localItems", [])
}

function genSettingView() {
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
    type: "label",
    props: {
      id: "templateDetails",
      textColor: $color("#AAAAAA")
    },
    layout: function(make, view) {
      make.right.inset(15);
      make.centerY.equalTo(view.super);
    },
    events: {
      tapped: function(sender, indexPath, item) {
  
      }
    }
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
          text: getCache("installNumbers", 0).toString(),
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

  const tabSetColumns = {
    type: "view",
    views: [{
        type: "label",
        props: {
          id: "tabSetColumns",
          text: "显示列数",
        },
        layout: function(make, view) {
          make.left.inset(15)
          make.centerY.equalTo(view.super)
        }
      },
      {
        type: "stepper",
        props: {
          max: 6,
          min: 2,
          value: getCache("columns", 4),
        },
        layout: function(make, view) {
          make.right.inset(15)
          make.centerY.equalTo(view.super)
        },
        events: {
          changed: function(sender) {
            $("tabSetColumnsDetail").text = sender.value
            $cache.set("columns", sender.value)
            $("rowsShow").remove()
            $("rowsShowParent").add(genRowsView($("reorderButton").info, getCache("columns", 4)))
          }
        }
      },
      {
        type: "label",
        props: {
          id: "tabSetColumnsDetail",
          text: "" + getCache("columns", 4),
        },
        layout: function(make, view) {
          make.right.equalTo(view.prev.left).inset(5)
          make.centerY.equalTo(view.super)
        }
      }
    ],
    layout: $layout.fill
  }

  let array = [{
    templateTitle: {
      text : "更新日志",
    },
    templateDetails: {
      text : "",
    },
    url: "https://www.liuguogy.com/archives/launch-center.html",
  },
  {
    templateTitle: {
      text : "GitHub",
    },
    templateDetails: {
      text : "",
    },
    url: "https://github.com/LiuGuoGY/JSBox-addins/blob/master/launch-center.js",
  },
  {
    templateTitle: {
      text : "检查更新",
    },
    templateDetails: {
      text : "" + appVersion.toFixed(1),
    },
  },
  {
    templateTitle: {
      text : "反馈与建议",
      textColor: $color("#14BCF7"),
    },
    templateDetails: {
      text : "",
    },
  },
  {
    templateTitle: {
      text : "支持与赞赏",
      textColor: $color("#FF823E"),
    },
    templateDetails: {
      text : "",
    },
  }]

  let view = {
    type: "view",
    props: {
      id: "settingView",
      hidden: true,
    },
    layout: $layout.fill,
    views: [{
      type: "list",
      props: {
        id: "list",
        bgcolor: $color("clear"),
        template: feedBackTemplate,
        data: [{
          title: "功能",
          rows: [tabSetColumns],
        },
        {
          title: "关于",
          rows: array,
        },
        {
          title: "统计",
          rows: [tabShowInstalls],
        }],
      },
      layout: $layout.fill,
      events: {
        didSelect: function(sender, indexPath, title) {
          if(title.templateTitle == undefined) {
            return 0
          }
          let titleText = title.templateTitle.text
          if(title.url) {
            setupWebView(titleText, title.url)
          } else {
            switch(title.templateTitle.text) {
              case "反馈与建议": setupFeedBack()
                break
              case "检查更新": checkupVersion()
                break
              case "支持与赞赏": setupReward()
                break
              default:
            }
          }
        }
      }
    }],
  }
  requireInstallNumbers()
  return view
}

function setupWebView(title, url) {
  $ui.push({
    props: {
      id: "myWebView",
      title: title,
      navBarHidden: true,
      statusBarStyle: 0,
    },
    events: {
      appeared: function(sender) {
        popDelegate = $("myWebView").runtimeValue().$viewController().$navigationController().$interactivePopGestureRecognizer().$delegate()
        $("myWebView").runtimeValue().$viewController().$navigationController().$interactivePopGestureRecognizer().$setDelegate(null)
      },
      didAppear: function(sender) {
        popDelegate = $("myWebView").runtimeValue().$viewController().$navigationController().$interactivePopGestureRecognizer().$delegate()
        $("myWebView").runtimeValue().$viewController().$navigationController().$interactivePopGestureRecognizer().$setDelegate(null)
      }
    },
    views: [{
      type: "web",
      props: {
        id: "webView",
        url: url,
      },
      layout: function(make, view) {
        make.center.equalTo(view.super)
        if(isInToday()) {
          make.height.equalTo(cardHeight)
        } else {
          make.height.equalTo(view.super)
        }
        make.width.equalTo(view.super)
      },
    }]
  })
}

function setupMyUpView() {
  $ui.push({
    props: {
      id: "myUploadView",
      title: "My Upload",
      navBarHidden: true,
      statusBarStyle: 0,
    },
    events: {
      appeared: function(sender) {
        popDelegate = $("myUploadView").runtimeValue().$viewController().$navigationController().$interactivePopGestureRecognizer().$delegate()
        $("myUploadView").runtimeValue().$viewController().$navigationController().$interactivePopGestureRecognizer().$setDelegate(null)
      },
      didAppear: function(sender) {
        popDelegate = $("myUploadView").runtimeValue().$viewController().$navigationController().$interactivePopGestureRecognizer().$delegate()
        $("myUploadView").runtimeValue().$viewController().$navigationController().$interactivePopGestureRecognizer().$setDelegate(null)
      }
    },
    views: [{
      type: "button",
      props: {
        id: "deleteButton",
        title: "删除",
        bgcolor: $color("clear"),
        titleColor: $color("#377116"),
        info: false,
      },
      layout: function(make, view) {
        make.top.inset(30)
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
        },
      }
    },
    {
      type: "matrix",
      props: {
        id: "rowsMyShow",
        columns: 4, //横行个数
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
        make.bottom.inset(20)
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
        didLongPress: function(sender, indexPath, data) {
          $device.taptic(2)
          $ui.menu({
            items: ["编辑"],
            handler: function(title, idx) {
              if(idx == 0) {
                setupUploadView("renew", data.title.text, data.icon.src, data.url, data.info.objectId)
              }
            }
          })
        },
        pulled: function(sender) {
          requireMyItems()
        }
      }
    },]
  })
  requireMyItems()
}

function setupUploadView(action, title, icon, url, objectId, indexPath) {
  $app.autoKeyboardEnabled = true
  let isIconRevised = false
  let actionText = "  开始上传  "
  switch(action) {
    case "upload": actionText = "  开始上传  "
      break
    case "edit": actionText = "  完成编辑  "
      break
    case "renew": actionText = "  更新上传  "
      break
  }
  $ui.push({
    props: {
      id: "uploadItemView",
      title: "Upload Launcher",
      navBarHidden: true,
      statusBarStyle: 0,
    },
    events: {
      appeared: function(sender) {
        popDelegate = $("uploadItemView").runtimeValue().$viewController().$navigationController().$interactivePopGestureRecognizer().$delegate()
        $("uploadItemView").runtimeValue().$viewController().$navigationController().$interactivePopGestureRecognizer().$setDelegate(null)
      },
      didAppear: function(sender) {
        popDelegate = $("uploadItemView").runtimeValue().$viewController().$navigationController().$interactivePopGestureRecognizer().$delegate()
        $("uploadItemView").runtimeValue().$viewController().$navigationController().$interactivePopGestureRecognizer().$setDelegate(null)
      }
    },
    views: [{
      type: "button",
      props: {
        id: "cloudButton",
        title: actionText,
        bgcolor: $color("clear"),
        titleColor: $color("#1B9713"),
        icon: $icon("049", $color("#1B9713"), $size(20, 20)),
        borderColor: $color("#1B9713"),
        borderWidth: 1,
      },
      layout: function(make, view) {
        make.left.right.inset(20)
        make.height.equalTo(50)
        if($device.info.version >= "11"){
          make.bottom.equalTo(view.super.safeAreaBottom).inset(30)
        } else {
          make.bottom.inset(30)
        }
      },
      events: {
        tapped: function(sender) {
          if ($("titleInput").text.length == 0 || $("schemeInput").text.length == 0 || $("chooseButton").info == undefined) {
            $ui.error("请补全信息")
          } else if ($("verifyButton").info == false && action != "edit") {
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
                            if(action == "upload") {
                              uploadSM($("chooseButton").info)
                            } else if(action == "renew"){
                              if(isIconRevised == false) {
                                uploadItem($("titleInput").text, undefined, $("schemeInput").text, undefined, undefined, objectId)
                              } else {
                                uploadSM($("chooseButton").info, objectId)
                              }
                            }
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
            if(action == "upload") {
              uploadSM($("chooseButton").info)
            } else if(action == "renew"){
              if(isIconRevised == false) {
                uploadItem($("titleInput").text, undefined, $("schemeInput").text, undefined, undefined, objectId)
              } else {
                uploadSM($("chooseButton").info, objectId)
              }
            } else if(action == "edit") {
              updateToLocal($("rowsShow"), indexPath, $("titleInput").text, icon, $("schemeInput").text)
              $ui.pop()
            }
          }
        }
      }
    },
    {
      type: "scroll",
      layout: function(make, view) {
        make.centerX.equalTo(view.super)
        make.top.left.right.inset(20)
        make.bottom.equalTo($("cloudButton").top).inset(20)
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
          make.top.inset(30)
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
          make.width.equalTo(view.super).dividedBy(4)
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
            text: (title == undefined)?"未定义":title,
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
        type: "label",
        props: {
          id: "titleLabel",
          text: "文字部分：",
          align: $align.left
        },
        layout: function(make, view) {
          make.width.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(20)
          make.left.inset(10)
        }
      },
      {
        type: "input",
        props: {
          id: "titleInput",
          text: (title == undefined)?"":title,
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo($("titleLabel").bottom).inset(10)
          make.height.equalTo(32)
          make.width.equalTo(view.super).multipliedBy(0.7)
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
          info: icon,
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
                isIconRevised = true
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
          text: (url == undefined)?"":url,
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo($("schemeLabel").bottom).inset(10)
          make.height.equalTo(32)
          make.width.equalTo(view.super).multipliedBy(0.7)
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
      },]
    },
    ]
  })
  if(icon != undefined) {
    $("icon").src = icon
  }
  if(action != "upload") {
    verifyStateSet(true)
  }
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
    button.bgcolor = $color("#2ECC71")
    button.titleColor = $color("white")
    button.borderColor = $color("#2ECC71")
    button.info = true
  }
}

function getHintText() {
  let textArray = ["右滑可退出脚本", "长按图标可弹出菜单", "长按删除按钮可清空", "长按可编辑本地启动器", "上传的启动器也可编辑"]
  return textArray[Math.floor(Math.random()*textArray.length)]
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
      navButtons: [
        {
          icon: "141", // Or you can use icon name
          handler: function() {
            $app.openURL("https://qr.alipay.com/c1x01118pzbsiaajndmmp65")
          }
        }
      ],
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
        if($app.env == $env.today) {
          make.height.equalTo(cardHeight)
        } else {
          make.top.inset(50)
          if($device.info.version >= "11"){
            make.bottom.equalTo(view.super.safeAreaBottom).inset(50)
          } else {
            make.bottom.inset(50)
          }
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
          index: 0,
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
              case 0: $app.openURL("HTTPS://QR.ALIPAY.COM/FKX02994GPGIJ8ACYWFQD8")
                break
              case 1: $app.openURL("HTTPS://QR.ALIPAY.COM/FKX075764EQ49XNSVFA0BC")
                break
              case 2: $app.openURL("HTTPS://QR.ALIPAY.COM/FKX07563B7TFDJBIRDFX45")
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
    },]
  })
  requireReward()
  $delay(1, function(){
    $("rewardList").scrollToOffset($point(0, 20))
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
    url: "https://raw.githubusercontent.com/LiuGuoGY/JSBox-addins/master/launch-center/" + PicWay + "_reward_" + PicMoney + ".JPG",
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
            resumeAction = 2
            $app.openURL(url)
          }
        }
      })
    }
  })
}


//反馈页面
function setupFeedBack() {
  $app.autoKeyboardEnabled = true
  $app.keyboardToolbarEnabled = true
  $ui.push({
    props: {
      id: "feedbackView",
      title: "反馈与建议",
      navBarHidden: true,
      statusBarStyle: 0,
    },
    layout: $layout.fill,
    events: {
      appeared: function(sender) {
        popDelegate = $("feedbackView").runtimeValue().$viewController().$navigationController().$interactivePopGestureRecognizer().$delegate()
        $("feedbackView").runtimeValue().$viewController().$navigationController().$interactivePopGestureRecognizer().$setDelegate(null)
      },
      didAppear: function(sender) {
        popDelegate = $("feedbackView").runtimeValue().$viewController().$navigationController().$interactivePopGestureRecognizer().$delegate()
        $("feedbackView").runtimeValue().$viewController().$navigationController().$interactivePopGestureRecognizer().$setDelegate(null)
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
          make.center.equalTo(view.super)
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
              text: "",
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
              bgcolor: $color("#62BEF2"),
              titleColor: $color("white"),
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
              },
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
            url: data[i].url,
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
    }
  })
}

function uploadItem(title, icon, url, size, deviceToken, objectId) {
  let json = {}
  if(title != undefined) {
    json.title = title
  }
  if(icon != undefined) {
    json.icon = icon
  }
  if(url != undefined) {
    json.url = url
  }
  if(size != undefined) {
    let size_k = ""
    if (size < 1000000) {
      size_k = size / 1000 + " K"
    } else {
      size_k = size / 1000000 + " M"
    }
    json.size = size_k
  }
  if(deviceToken != undefined) {
    json.deviceToken = deviceToken
  }
  let objectUrl = "https://wcphv9sr.api.lncld.net/1.1/classes/Items".concat((objectId == undefined)?(""):("/" + objectId))
  $http.request({
    method: (objectId == undefined)?"POST":"PUT",
    url: objectUrl,
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": appId,
      "X-LC-Key": appKey,
    },
    body: json,
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
        let view = $("tabShowInstallsDetail")
        $cache.set("installNumbers", results)
        let timer = $timer.schedule({
          interval: 0.11,
          handler: function() {
            if(parseInt(view.text) < results) {
              transition(view, 0.1, 5 << 20, () => {
                view.text = (parseInt(view.text) + 1).toString();
              }, null);
            } else {
              timer.invalidate()
            }
          }
        })
      }
    }
  })
}

function transition(view, duration, options, animations, completion) {
  let animationsBlock = $block("void, void", function() {
    if (animations) {
      animations();
    }
  });
  let completionBlock = $block("void, BOOL", function(flag) {
    if (completion) {
      completion();
    }
  });
  $objc("UIView").invoke("transitionWithView:duration:options:animations:completion", view, duration, options, animationsBlock, completionBlock)
}

function uploadInstall() {
  let info = {
    addinVersion: appVersion.toFixed(1),
    iosVersion: $device.info.version,
    jsboxVersion: $app.info.version,
    deviceType: "ios",
    deviceToken: $objc("FCUUID").invoke("uuidForDevice").rawValue()
  }
  let info_pre = getCache("installInfo")
  function isDifferent(info, info_pre) {
    if(info == undefined || info_pre == undefined) {
      return true
    } else if(info.addinVersion != info_pre.addinVersion || info.iosVersion != info_pre.iosVersion || info.jsboxVersion != info_pre.jsboxVersion || info.deviceToken != info_pre.deviceToken) {
      return true
    } else {
      return false
    }
  }
  if(isDifferent(info, info_pre)) {
    $cache.set("installInfo", info)
    $http.request({
      method: "POST",
      url: "https://pwqyveon.api.lncld.net/1.1/installations",
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
      handler: function(resp) {
      }
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

function uploadSM(pic, objectId) {
  if (typeof(pic) != "undefined") {
    $ui.loading(true)
    $http.upload({
      url: "https://sm.ms/api/upload",
      files: [{ "data": pic, "name": "smfile" }],
      handler: function(resp) {
        $ui.loading(false)
        var data = resp.data.data
        uploadItem($("title").text, data.url, $("schemeInput").text, data.size, $objc("FCUUID").invoke("uuidForDevice").rawValue(), objectId)
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
      contact: (contact == "")?$objc("FCUUID").invoke("uuidForDevice").rawValue().toString():contact,
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
