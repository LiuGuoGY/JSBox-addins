let ui = require('scripts/ui')
let utils = require('scripts/utils')
let update = require('scripts/update')
let sync = require('scripts/sync')

let appId = "wCpHV9SrijfUPmcGvhUrpClI-gzGzoHsz"
let appKey = "CHcCPcIWDClxvpQ0f0v5tkMN"
let apiKeys = ["qp8G6bzstArEa3sLgYa90TImDLmJ511r", "N2Ceias4LsCo0DzW2OaYPvTWMifcJZ6t"]
let colors = [$rgba(120, 219, 252, 0.9), $rgba(252, 175, 230, 0.9), $rgba(252, 200, 121, 0.9), $rgba(187, 252, 121, 0.9), $rgba(173, 121, 252, 0.9), $rgba(252, 121, 121, 0.9), $rgba(121, 252, 252, 0.9)]
let resumeAction = 0 // 1 验证 2 赞赏 3 跳转
let showMode = ["图文模式", "小图标", "仅文字", "横向图文", "大图标"]
let broswers = ["Safari", "Chrome", "UC", "Firefox", "QQ", "Opera", "Quark", "iCab", "Maxthon", "Dolphin", "2345", "Alook"]

const mColor = {
  gray: "#a2a2a2",
  blue: "#3478f7",
  black: "#303032",
  green: "#27AE60",
  red: "#E74C3C",
  iosGreen: "#4CD964",
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
function show() {
  uploadInstall()
  checkBlackList()
  if(!utils.getCache("haveBanned", false)) {
    main()
  } else {
    ui.showBannedAlert()
  }
}

function main() {
  sync.download()
  setupMainView()
  solveQuery()
  update.checkUpdate()
}

$app.listen({
  pause: function() {
    switch(resumeAction) {
      case 1: {
        let nDate = new Date()
        let sTime = utils.getCache("begainTime", nDate.getTime())
        let duration = (nDate.getTime() - sTime)
        if (duration < 100) {
          verifyStateSet(true)
        } else {
          verifyStateSet(false)
        }
      };
        resumeAction = 0
        break;
      case 3: 
        resumeAction = 0
        break
    }
    
  },
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
  exit: function() {
    sync.upload()
  },
})

let contentViews = ["localView", "cloudView", "settingView"]
  
function setupMainView() {
  $app.autoKeyboardEnabled = false
  $app.keyboardToolbarEnabled = false
  $ui.render({
    props: {
      id: "mainView",
      title: "Launch Center",
      navBarHidden: true,
      statusBarStyle: 0,
    },
    views: [{
        type: "blur",
        props: {
          style: 5 // 0 ~ 5 调整背景的颜色程度
        },
        layout: function(make, view) {
          make.left.bottom.right.inset(0)
          if($device.info.version >= "11"){
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
                make.bottom.inset(5)
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
          if($device.info.version >= "11"){
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
          make.height.equalTo(1 / $device.info.screen.scale)
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
      {
        type: "view",
        props: {
          id: "content",
          bgcolor: $color("clear"),
          clipsToBounds: true,
        },
        layout: function(make, view) {
          make.width.equalTo(view.super)
          make.left.right.inset(0)
          make.bottom.equalTo($("tab").top)
          if($device.info.version >= "11"){
            make.top.equalTo(view.super.safeAreaTop)
          } else {
            make.top.inset(20)
          }
        },
        views: [genLocalView()],
      },
    ]
  })
}

function solveQuery() {
  let query = $context.query
  if(query) {
    switch(query.q) {
      case "show":
      showOneItem(query.objectId);break;
      default:break;
    }
  }
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

function shadow(view) {
  var layer = view.runtimeValue().invoke("layer")
  layer.invoke("setCornerRadius", 0)
  layer.invoke("setShadowOffset", $size(0, -5))
  layer.invoke("setShadowColor", $color("gray").runtimeValue().invoke("CGColor"))
  layer.invoke("setShadowOpacity", 0.2)
  layer.invoke("setShadowRadius", 5)
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
      template: ui.genTemplate(),
      header: {
        type: "view",
        props:{
          height: 45,
        },
        views: [{
          type: "label",
          props: {
            id: "localListHeaderTitle",
            text: "本地",
            font: $font("Avenir-Black", 35),
            textColor: $color("black"),
            align: $align.center,
          },
          layout: function(make, view) {
            make.left.inset(15)
            make.bottom.inset(0)
            make.height.equalTo(45)
          }
        }]
      },
      data: utils.getCache("localItems", [])
    },
    layout: $layout.fill,
    events: {
      didSelect(sender, indexPath, data) {
        let view = $("deleteLocalButton")
        if(view == undefined || view.info == false) {
          if(data.url != "") {
            $device.taptic(1)
            utils.myOpenUrl(data.url)
            resumeAction = 3
            $thread.background({
              delay: 0.1,
              handler: function() {
                if(resumeAction == 3) {
                  resumeAction = 0
                  ui.showToastView($("mainView"), mColor.red, "未安装对应APP")
                }
              }
            })
          }
        } else {
          $("rowsShow").delete(indexPath)
          $cache.set("localItems", $("rowsShow").data)
        }
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
              $clipboard.text = utils.getCache("localItems", [])[indexPath.row].url
              ui.showToastView($("mainView"), mColor.green, "复制成功")
            } else if(idx == 1) {
              $system.makeIcon({ title: utils.getCache("localItems", [])[indexPath.row].title.text, url: utils.getCache("localItems", [])[indexPath.row].url, icon: $("rowsShow").cell(indexPath).get("icon").image })
            } else if(idx == 2) {
              setupUploadView("edit", data.title.text, data.icon.src, data.url, data.descript, undefined, indexPath)
            }
          }
        })
      },
      didScroll: function(sender) {
        if(sender.contentOffset.y >= 37 && $("localPageHeaderLabel").hidden === true) {
          $("localPageHeaderLabel").hidden = false
        } else if(sender.contentOffset.y < 37 && $("localPageHeaderLabel").hidden === false) {
          $("localPageHeaderLabel").hidden = true
        }else if(sender.contentOffset.y < 0) {
          let size = 35 - sender.contentOffset.y * 0.04
          if(size > 40)
            size = 40
          $("localListHeaderTitle").font = $font("Avenir-Black", size)
        }
      },
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
      type: "view",
      props: {
        hidden: false,
      },
      layout: function(make, view) {
        make.left.top.right.inset(0)
        make.height.equalTo(45)
      },
      views:[{
        type: "label",
        props: {
          id: "localPageHeaderLabel",
          text: "本地",
          font: $font("bold", 17),
          align: $align.center,
          bgcolor: $color("white"),
          textColor: $color("black"),
          hidden: true,
        },
        layout: $layout.fill,
      },{
        type: "button",
        props: {
          id: "reorderButton",
          title: "排序",
          bgcolor: $color("clear"),
          titleColor: $color(mColor.blue),
          info: false,
        },
        layout: function(make, view) {
          make.right.inset(10)
          make.width.equalTo(50)
          make.centerY.equalTo(view.super)
          make.height.equalTo(35)
        },
        events: {
          tapped: function(sender) {
            if (sender.info == false) {
              sender.info = true
              sender.bgcolor = $color("#C70039")
              sender.titleColor = $color("white")
              $("rowsShow").remove()
              $("rowsShowParent").add(genRowsView(true, utils.getCache("columns")))
            } else {
              sender.info = false
              sender.bgcolor = $color("clear")
              sender.titleColor = $color(mColor.blue)
              $("rowsShow").remove()
              $("rowsShowParent").add(genRowsView(false, utils.getCache("columns")))
            }
          }
        }
      },{
        type: "button",
        props: {
          id: "deleteLocalButton",
          title: "删除",
          bgcolor: $color("clear"),
          titleColor: $color(mColor.blue),
          info: false,
        },
        layout: function(make, view) {
          make.left.inset(10)
          make.width.equalTo(50)
          make.centerY.equalTo(view.super)
          make.height.equalTo(35)
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
              sender.titleColor = $color(mColor.blue)
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
      },],
    },
    {
      type: "view",
      props: {
        id: "rowsShowParent",
      },
      layout: function(make, view) {
        make.width.equalTo(view.super)
        make.top.equalTo($("deleteLocalButton").bottom).inset(7)
        make.bottom.inset(0)
        make.centerX.equalTo(view.super)
      },
      views: [genRowsView(false, utils.getCache("columns"))]
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
        make.right.inset(0).offset(55)
        make.size.equalTo($size(55, 35))
      },
      events: {
        tapped: function(sender) {
          let input = $("search_input")
          input.text = ""
          $("search_hint").hidden = false
          searchItems("")
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
          userInteractionEnabled: false,
          tintColor: $color(mColor.blue),
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
            $("searchBarParent").remakeLayout(function(make) {
              make.left.inset(15)
              make.height.equalTo($("headerView").height)
              make.centerY.equalTo($("headerView").centerY)
              make.right.inset(15)
            })
            $ui.animate({
              duration: 0.2,
              animation: function() {
                $("searchBarParent").relayout()
              },
              completion: function() {
                $("cancel_button").updateLayout(function(make) {
                  make.right.inset(0).offset(0)
                })
                $ui.animate({
                  duration: 0.4,
                  damping: 0.8,
                  animation: function() {
                    $("cancel_button").relayout()
                  }
                })
              }
            })
          },
          didEndEditing: function(sender) {
            if($("cancel_button") != undefined) {
              $("cancel_button").updateLayout(function(make) {
                make.right.inset(0).offset(55)
              })
              $ui.animate({
                duration: 0.2,
                animation: function() {
                  $("cancel_button").relayout()
                },
                completion: function() {
                  $("searchBarParent").remakeLayout(function(make) {
                    make.left.inset(15)
                    make.height.equalTo($("headerView").height)
                    make.centerY.equalTo($("headerView").centerY)
                    make.right.inset(15)
                  })
                  $ui.animate({
                    duration: 0.2,
                    animation: function() {
                      $("searchBarParent").relayout()
                    },
                    completion: function() {
                      $("search_input").userInteractionEnabled = false
                    }
                  })
                }
              })
              
            }
          },
          changed: function(sender) {
            if(sender.text.length > 0) {
              $("search_hint").hidden = true
            } else {
              $("search_hint").hidden = false
              // searchItems(sender.text)
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
            text: "Launcher",
            align: $align.center,
            textColor: $rgba(100, 100, 100, 0.4),
            hidden: false,
          },
          layout: function(make, view) {
            make.left.inset(8)
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
      type: "view",
      props: {
        id: "rowsCloudShowParent",
      },
      layout: function(make, view) {
        make.width.equalTo(view.super)
        make.top.inset(0)
        make.bottom.inset(0)
        make.centerX.equalTo(view.super)
      },
      views: [{
        type: "view",
        props: {
          hidden: false,
        },
        layout: function(make, view) {
          make.left.top.right.inset(0)
          make.height.equalTo(45)
        },
        views:[{
          type: "label",
          props: {
            id: "cloudPageHeaderLabel",
            text: "云库",
            font: $font("bold", 17),
            align: $align.center,
            bgcolor: $color("white"),
            textColor: $color("black"),
            hidden: true,
          },
          layout: $layout.fill,
        },{
          type: "button",
          props: {
            id: "uploadButton",
            title: "＋",
            bgcolor: $color("clear"),
            font: $font(27),
            titleColor: $color(mColor.blue),
            info: false,
          },
          layout: function(make, view) {
            make.right.inset(10)
            make.width.equalTo(50)
            make.centerY.equalTo(view.super)
            make.height.equalTo(35)
          },
          events: {
            tapped: function(sender) {
              setupUploadView("upload")
            }
          }
        },{
          type: "button",
          props: {
            id: "myUploadButton",
            title: "我的",
            bgcolor: $color("clear"),
            titleColor: $color(mColor.blue),
            info: false,
          },
          layout: function(make, view) {
            make.left.inset(10)
            make.width.equalTo(50)
            make.centerY.equalTo(view.super)
            make.height.equalTo(35)
          },
          events: {
            tapped: function(sender) {
              setupMyUpView()
            },
          }
        },],
      },{
        type: "matrix",
        props: {
          id: "rowsCloudShow",
          columns: ($device.info.screen.width < 400)?4:6, //横行个数
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
                smoothRadius: 5,
                size: $size(20, 20)
              },
              layout(make, view) {
                make.top.inset(9)
                make.centerX.equalTo(view.super)
                make.size.equalTo($size(20,20))
              }
            }
          ],
          header: {
            type: "view",
            props:{
              height: 100,
            },
            views: [{
              type: "label",
              props: {
                id: "cloudListHeaderTitle",
                text: "云库",
                font: $font("Avenir-Black", 35),
                textColor: $color("black"),
                align: $align.center,
              },
              layout: function(make, view) {
                make.left.inset(15)
                make.top.inset(0)
                make.height.equalTo(45)
              }
            },{
              type: "view",
              props: {
                id: "headerView",
                clipsToBounds: true,
              },
              layout: function(make, view) {
                make.centerX.equalTo(view.super)
                make.left.right.inset(0)
                make.top.equalTo(view.prev.bottom)
                make.height.equalTo(55)
              },
              views: [{
                type: "view",
                props: {
                  id: "searchBarParent",
                  clipsToBounds: true,
                  userInteractionEnabled: true,
                  bgcolor: $color("white"),
                },
                layout: function(make, view) {
                  make.left.inset(15)
                  make.height.equalTo(view.super)
                  make.centerY.equalTo(view.super)
                  make.right.inset(15)
                },
                views: [searchBar],
                events: {
                  tapped: function(sender) {
                    $("search_input").userInteractionEnabled = true
                    $("search_input").focus()
                  }
                }
              },]
            },]
          },
          data: utils.getCache("cloudItems", []),
        },
        layout: function(make, view) {
          make.left.right.bottom.inset(0)
          make.top.equalTo(view.prev.bottom)
          make.centerX.equalTo(view.super)
        },
        events: {
          didSelect(sender, indexPath, data) {
            $("search_input").blur()
            showInfoView($("mainView"), data, indexPath)
          },
          didLongPress: function(sender, indexPath, data) {
            $device.taptic(2)
            $ui.menu({
              items: ["收藏到本地"],
              handler: function(title, idx) {
                if(idx == 0) {
                  addToLocal(data, true)
                }
              }
            })
          },
          didScroll: function(sender) {
            if(sender.contentOffset.y >= 37 && $("cloudPageHeaderLabel").hidden === true) {
              $("cloudPageHeaderLabel").hidden = false
            } else if(sender.contentOffset.y < 37 && $("cloudPageHeaderLabel").hidden === false) {
              $("cloudPageHeaderLabel").hidden = true
            }else if(sender.contentOffset.y < 0) {
              let size = 35 - sender.contentOffset.y * 0.04
              if(size > 40)
                size = 40
              $("cloudListHeaderTitle").font = $font("Avenir-Black", size)
            }
          },
          willBeginDragging: function(sender) {

          },
          didEndDragging: function(sender, decelerate) {
            
          },
        }
      }]
    },],
  }
  
  requireItems()
  return view
}

function searchItems(text) {
  let view = $("rowsCloudShow")
  if(text === "" || text.length <= 0) {
    view.data = utils.getCache("cloudItems", [])
  } else {
    $text.tokenize({
      text: text,
      handler: function(results) {
        let resultItems = []
        let cloudItems = utils.getCache("cloudItems", [])
        for(let i = 0; i < cloudItems.length; i++) {
          for(let j = 0; j < results.length; j++) {
            let descript = (cloudItems[i].descript)?(cloudItems[i].descript):"";
            if(cloudItems[i].title.text.toLowerCase().indexOf(results[j].toLowerCase()) >= 0 || cloudItems[i].url.toLowerCase().indexOf(results[j].toLowerCase()) >= 0 || descript.toLowerCase().indexOf(results[j].toLowerCase()) >= 0) {
              resultItems.push(cloudItems[i])
              break
            }
          }
        }
        view.data = resultItems
        if(resultItems.length == 0) {
          ui.showToastView($("mainView"), mColor.blue, "无搜索结果，试试其他词吧")
        }
      }
    })
  }
}

function addToLocal(data, showToast) {
  let array = utils.getCache("localItems", [])
  let isExist = false
  for(let i = 0; i < array.length; i++) {
    if(data.url === array[i].url) {
      isExist = true
    }
  }
  if(isExist === false) {
    array.push({
      title: {
        text: data.title.text
      },
      icon: {
        src: data.icon.src
      },
      url: data.url,
      descript: data.descript,
    })
    $cache.set("localItems", array)
    if(showToast) {
      ui.showToastView($("mainView"), mColor.green, "添加成功")
    }
    $("rowsShow").data = utils.getCache("localItems", [])
  } else {
    if(showToast) {
      ui.showToastView($("mainView"), mColor.red, "本地已存在")
    }
  }
}

function deleteLocalItem(data) {
  let array = utils.getCache("localItems", [])
  for(let i = 0; i < array.length; i++) {
    if(data.url === array[i].url) {
      array.splice(i, 1)
      $cache.set("localItems", array)
    }
  }
  if($("rowsShow") != undefined) {
    $("rowsShow").remove()
    $("rowsShowParent").add(genRowsView($("reorderButton").info, utils.getCache("columns")))
  }
}

function isExist(data) {
  let array = utils.getCache("localItems", [])
  let isExist = false
  for(let i = 0; i < array.length; i++) {
    if(data.url === array[i].url) {
      isExist = true
    }
  }
  return isExist
}

function updateToLocal(sender, indexPath, title, icon, url, descript) {
  let array = utils.getCache("localItems", [])
  array[indexPath.row].title.text = title
  array[indexPath.row].icon.src = icon
  array[indexPath.row].url = url
  array[indexPath.row].descript = descript
  $cache.set("localItems", array)
  $("rowsShow").data = utils.getCache("localItems", [])
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
          text: utils.getCache("installNumbers", 0).toString(),
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

  const tabAutoSync = {
    type: "view",
    views: [{
        type: "label",
        props: {
          text: "iCloud 自动同步",
        },
        layout: function(make, view) {
          make.left.inset(15)
          make.centerY.equalTo(view.super)
        }
      },
      {
        type: "label",
        props: {
          text: "已启用",
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
          max: 10,
          min: 2,
          tintColor: $color("black"),
          value: utils.getCache("columns"),
        },
        layout: function(make, view) {
          make.right.inset(15)
          make.centerY.equalTo(view.super)
        },
        events: {
          changed: function(sender) {
            $("tabSetColumnsDetail").text = sender.value
            $cache.set("columns", sender.value)
            refreshLocalView()
          }
        }
      },
      {
        type: "label",
        props: {
          id: "tabSetColumnsDetail",
          text: "" + utils.getCache("columns"),
        },
        layout: function(make, view) {
          make.right.equalTo(view.prev.left).inset(5)
          make.centerY.equalTo(view.super)
        }
      }
    ],
    layout: $layout.fill
  }

  const tabShowMode = {
    type: "view",
    views: [{
        type: "label",
        props: {
          id: "tabShowMode",
          text: "显示样式",
        },
        layout: function(make, view) {
          make.left.inset(15)
          make.centerY.equalTo(view.super)
        }
      },
      {
        type: "view",
        layout: function(make, view) {
          make.right.inset(15)
          make.centerY.equalTo(view.super)
          make.height.equalTo(view.super)
          make.width.equalTo(view.super).multipliedBy(0.5)
        },
        events: {
          tapped: function(sender) {
            $ui.menu({
              items: showMode,
              handler: function(title, idx) {
                $cache.set("showMode", idx)
                $("tabShowModeDetail").text = getShowModeText()
                $("rowsShow").remove()
                $("rowsShowParent").add(genRowsView($("reorderButton").info, utils.getCache("columns")))
              }
            })
          }
        },
        views: [{
          type: "image",
          props: {
            src: "assets/enter.png",
            bgcolor: $color("clear"),
          },
          layout: function(make, view) {
            make.right.inset(0)
            make.centerY.equalTo(view.super)
            make.size.equalTo($size(8, 18))
          },
        },{
          type: "label",
          props: {
            id: "tabShowModeDetail",
            text: getShowModeText(),
            align: $align.right,
          },
          layout: function(make, view) {
            make.right.equalTo(view.prev.left).inset(5)
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
          },
        },]
      },
      
    ],
    layout: $layout.fill
  }

  const tabOpenBroswer = {
    type: "view",
    views: [{
        type: "label",
        props: {
          id: "tabOpenBroswer",
          text: "启动浏览器",
        },
        layout: function(make, view) {
          make.left.inset(15)
          make.centerY.equalTo(view.super)
        }
      },
      {
        type: "view",
        layout: function(make, view) {
          make.right.inset(15)
          make.centerY.equalTo(view.super)
          make.height.equalTo(view.super)
          make.width.equalTo(view.super).multipliedBy(0.5)
        },
        events: {
          tapped: function(sender) {
            $ui.menu({
              items: broswers,
              handler: function(title, idx) {
                $cache.set("openBroswer", idx)
                $("tabOpenBroswerDetail").text = getOpenBroswer()
              }
            })
          }
        },
        views: [{
          type: "image",
          props: {
            src: "assets/enter.png",
            bgcolor: $color("clear"),
          },
          layout: function(make, view) {
            make.right.inset(0)
            make.centerY.equalTo(view.super)
            make.size.equalTo($size(8, 18))
          },
        },{
          type: "label",
          props: {
            id: "tabOpenBroswerDetail",
            text: getOpenBroswer(),
            align: $align.right,
          },
          layout: function(make, view) {
            make.right.equalTo(view.prev.left).inset(5)
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
          },
        },]
      },
      
    ],
    layout: $layout.fill
  }

  const tabBackgroundTranparent = {
    type: "view",
    props: {

    },
    views: [{
        type: "label",
        props: {
          id: "tabBackgroundTranparent",
          text: "透明背景",
        },
        layout: function(make, view) {
          make.left.inset(15)
          make.centerY.equalTo(view.super)
        }
      },
      {
        type: "switch",
        props: {
          id: "tabBackgroundTranparentSwitch",
          onColor: $color(mColor.iosGreen),
          on: utils.getCache("backgroundTranparent"),
        },
        layout: function(make, view) {
          make.right.inset(15)
          make.centerY.equalTo(view.super)
        },
        events: {
          changed: function(sender) {
              $cache.set("backgroundTranparent", sender.on)
          }
        }
      }
    ],
    layout: $layout.fill
  }

  const tabPullToClose = {
    type: "view",
    props: {

    },
    views: [{
        type: "label",
        props: {
          id: "tabPullToClose",
          text: "下拉关闭",
        },
        layout: function(make, view) {
          make.left.inset(15)
          make.centerY.equalTo(view.super)
        }
      },
      {
        type: "switch",
        props: {
          id: "tabPullToCloseSwitch",
          onColor: $color(mColor.iosGreen),
          on: utils.getCache("pullToClose"),
        },
        layout: function(make, view) {
          make.right.inset(15)
          make.centerY.equalTo(view.super)
        },
        events: {
          changed: function(sender) {
            $cache.set("pullToClose", sender.on)
          }
        }
      }
    ],
    layout: $layout.fill
  }

  const tabStaticHeight = {
    type: "view",
    props: {

    },
    views: [{
        type: "label",
        props: {
          id: "tabStaticHeight",
          text: "高度跟随",
        },
        layout: function(make, view) {
          make.left.inset(15)
          make.centerY.equalTo(view.super)
        }
      },{
        type: "button",
        props: {
          icon: $icon("008", $color("white"), $size(14, 14)),
          bgcolor: $color("lightGray"),
          borderWidth: 1,
          borderColor: $color("lightGray"),
          circular: true,
        },
        layout: function(make, view) {
          make.left.equalTo(view.prev.right).inset(10)
          make.centerY.equalTo(view.super)
          make.size.equalTo($size(14,14))
        },
        events: {
          tapped: function(sender) {
            $ui.alert({
              title: "高度跟随",
              message: "即通知中心打开不改变原来的高度",
            });
          }
        }
      },
      {
        type: "switch",
        props: {
          id: "tabStaticHeightSwitch",
          onColor: $color(mColor.iosGreen),
          on: utils.getCache("staticHeight"),
        },
        layout: function(make, view) {
          make.right.inset(15)
          make.centerY.equalTo(view.super)
        },
        events: {
          changed: function(sender) {
            $cache.set("staticHeight", sender.on)
            let file = $file.read("config.json")
            if(file) {
              let json = JSON.parse(file.string)
              json.widget.staticSize = sender.on
              $file.write({
                data: $data({string: JSON.stringify(json, null, 2)}),
                path: "config.json"
              });
            }
            if($app.info.build < 339 && sender.on == true) {
              ui.showToastView($("mainView"), mColor.blue, "当前JSBox版本低，当前设置不会生效")
            }
          }
        }
      }
    ],
    layout: $layout.fill
  }

  let array = [{
    templateTitle: {
      text : "更新日志",
    },
    url: "https://www.liuguogy.com/archives/launch-center.html",
  },
  {
    templateTitle: {
      text : "GitHub",
    },
    url: "https://github.com/LiuGuoGY/JSBox-addins/tree/master/launch-center-new",
  },
  {
    templateTitle: {
      text : "检查更新",
    },
  },
  {
    templateTitle: {
      text : "反馈建议",
    },
  },
  {
    templateTitle: {
      text : "支持与赞赏",
    },
  },
  {
    templateTitle: {
      text : "分享 Launch Center",
    },
  },]

  let view = {
    type: "view",
    props: {
      id: "settingView",
      hidden: true,
    },
    layout: $layout.fill,
    views: [{
      type: "view",
      props: {
        hidden: true,
      },
      layout: function(make, view) {
        make.left.top.right.inset(0)
        make.height.equalTo(45)
      },
      views:[{
        type: "label",
        props: {
          text: "设置",
          font: $font("bold", 17),
          align: $align.center,
          bgcolor: $color("white"),
          textColor: $color("black"),
        },
        layout: $layout.fill,
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
            ctx.strokeColor = $color("darkGray")
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      },],
    },{
      type: "list",
      props: {
        id: "list",
        bgcolor: $color("clear"),
        template: feedBackTemplate,
        header: {
          type: "view",
          props:{
            height: 45,
          },
          views: [{
            type: "label",
            props: {
              id: "settingListHeaderTitle",
              text: "设置",
              font: $font("Avenir-Black", 35),
              textColor: $color("black"),
              align: $align.center,
            },
            layout: function(make, view) {
              make.left.inset(15)
              make.bottom.inset(0)
              make.height.equalTo(45)
            }
          }]
        },
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
          rows: [tabSetColumns, tabShowMode, tabOpenBroswer],
        },
        {
          title: "JSBox 启动器",
          rows: [tabBackgroundTranparent, tabPullToClose, tabStaticHeight],
        },
        {
          title: "关于",
          rows: array,
        },
        {
          title: "同步",
          rows: [tabAutoSync],
        },
        {
          title: "其他",
          rows: [tabShowInstalls],
        }],
      },
      layout: function(make, view) {
        make.top.equalTo(view.prev.bottom)
        make.bottom.inset(0)
        make.left.right.inset(0)
      },
      events: {
        didSelect: function(sender, indexPath, title) {
          if(title.templateTitle == undefined) {
            return 0
          }
          let titleText = title.templateTitle.text
          if(title.url) {
            setupWebView(titleText, title.url)
          } else {
            switch(indexPath.row) {
              case 2: update.checkUpdate(true)
                break
              case 3: setupFeedBack()
                break
              case 4: setupReward()
                break
              case 5: share("http://t.cn/E7kdTkv")
                break
              default:
            }
          }
        },
        didScroll: function(sender) {
          if(sender.contentOffset.y >= 37 && sender.prev.hidden === true) {
            sender.prev.hidden = false
          } else if(sender.contentOffset.y < 37 && sender.prev.hidden === false) {
            sender.prev.hidden = true
          }else if(sender.contentOffset.y < 0) {
            let size = 35 - sender.contentOffset.y * 0.04
            if(size > 40)
              size = 40
            $("settingListHeaderTitle").font = $font("Avenir-Black", size)
          }
        },
      }
    },],
  }
  requireInstallNumbers()
  return view
}

function getShowModeText() {
  let mode = utils.getCache("showMode")
  return showMode[mode]
}

function getOpenBroswer() {
  let mode = utils.getCache("openBroswer")
  return broswers[mode]
}

function share(link) {
  $share.sheet({
    items: [link], // 也支持 item
    handler: function(success) {
      if(success) {
        ui.showToastView($("mainView"), mColor.blue, "感谢您的分享")
      }
    }
  })
}

function setupWebView(title, url) {
  $ui.push({
    props: {
      id: "myWebView",
      title: title,
      navBarHidden: true,
      statusBarStyle: 0,
    },
    views: [{
      type: "view",
      layout: function(make, view) {
        if($device.info.version >= "11"){
          make.top.equalTo(view.super.safeAreaTop)
        } else {
          make.top.inset(20)
        }
        make.left.right.inset(0)
        make.height.equalTo(45)
      },
      views:[{
        type: "label",
        props: {
          text: title,
          font: $font("bold", 17),
          align: $align.center,
          bgcolor: $color("white"),
          textColor: $color("black"),
        },
        layout: $layout.fill,
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
            ctx.strokeColor = $color("darkGray")
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      },{
        type: "button",
        props: {
          bgcolor: $color("clear"),
        },
        layout: function(make, view) {
          make.left.inset(0)
          make.width.equalTo(60)
          make.height.equalTo(view.super)
        },
        events: {
          tapped: function(sender) {
            $ui.pop()
          },
        },
        views:[{
          type: "image",
          props: {
            src: "assets/back.png",
            bgcolor: $color("clear"),
          },
          layout: function(make, view) {
            make.left.inset(10)
            make.centerY.equalTo(view.super)
            make.size.equalTo($size(12, 23))
          },
        },{
          type: "label",
          props: {
            text: "设置",
            align: $align.center,
            textColor: $color(mColor.blue),
            font: $font(17)
          },
          layout: function(make, view) {
            make.height.equalTo(view.super)
            make.left.equalTo(view.prev.right).inset(3)
          }
        }],
      },],
    },{
      type: "web",
      props: {
        id: "webView",
        url: url,
      },
      layout: function(make, view) {
        make.centerX.equalTo(view.super)
        make.left.right.bottom.inset(0)
        make.top.equalTo(view.prev.bottom)
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
    views: [{
      type: "view",
      layout: function(make, view) {
        if($device.info.version >= "11"){
          make.top.equalTo(view.super.safeAreaTop)
        } else {
          make.top.inset(20)
        }
        make.left.right.inset(0)
        make.height.equalTo(45)
      },
      views:[{
        type: "label",
        props: {
          text: "我的上传",
          font: $font("bold", 17),
          align: $align.center,
          bgcolor: $color("white"),
          textColor: $color("black"),
        },
        layout: $layout.fill,
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
            ctx.strokeColor = $color("darkGray")
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      },{
        type: "button",
        props: {
          bgcolor: $color("clear"),
        },
        layout: function(make, view) {
          make.left.inset(0)
          make.width.equalTo(60)
          make.height.equalTo(view.super)
        },
        events: {
          tapped: function(sender) {
            $ui.pop()
          },
        },
        views:[{
          type: "image",
          props: {
            src: "assets/back.png",
            bgcolor: $color("clear"),
          },
          layout: function(make, view) {
            make.left.inset(10)
            make.centerY.equalTo(view.super)
            make.size.equalTo($size(12, 23))
          },
        },{
          type: "label",
          props: {
            text: "云库",
            align: $align.center,
            textColor: $color(mColor.blue),
            font: $font(17)
          },
          layout: function(make, view) {
            make.height.equalTo(view.super)
            make.left.equalTo(view.prev.right).inset(3)
          }
        }],
      },],
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
              smoothRadius: 5,
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
        make.top.equalTo(view.prev.bottom)
        make.bottom.inset(0)
        make.centerX.equalTo(view.super)
      },
      events: {
        didSelect(sender, indexPath, data) {
          $ui.menu({
            items: ["打开"],
            handler: function(title, idx) {
              if(idx == 0) {
                utils.myOpenUrl(data.url)
              }
            }
          })
        },
        didLongPress: function(sender, indexPath, data) {
          $device.taptic(2)
          $ui.menu({
            items: ["编辑", "删除"],
            handler: function(title, idx) {
              if(idx == 0) {
                setupUploadView("renew", data.title.text, data.icon.src, data.url, data.descript, data.info.objectId)
              } else if(idx == 1) {
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
                        requireItems()
                        $("rowsCloudShow").scrollToOffset($point(0, 0))
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

function setupUploadView(action, title, icon, url, descript, objectId, indexPath) {
  let fileName = ""
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
      layout: function(make, view) {
        if($device.info.version >= "11"){
          make.top.equalTo(view.super.safeAreaTop)
        } else {
          make.top.inset(20)
        }
        make.left.right.inset(0)
        make.height.equalTo(45)
      },
      views:[{
        type: "label",
        props: {
          text: "上传修改",
          font: $font("bold", 17),
          align: $align.center,
          bgcolor: $color("white"),
          textColor: $color("black"),
        },
        layout: $layout.fill,
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
            ctx.strokeColor = $color("darkGray")
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      },{
        type: "button",
        props: {
          bgcolor: $color("clear"),
        },
        layout: function(make, view) {
          make.left.inset(0)
          make.width.equalTo(60)
          make.height.equalTo(view.super)
        },
        events: {
          tapped: function(sender) {
            $ui.pop()
          },
        },
        views:[{
          type: "image",
          props: {
            src: "assets/back.png",
            bgcolor: $color("clear"),
          },
          layout: function(make, view) {
            make.left.inset(10)
            make.centerY.equalTo(view.super)
            make.size.equalTo($size(12, 23))
          },
        },{
          type: "label",
          props: {
            text: "云库",
            align: $align.center,
            textColor: $color(mColor.blue),
            font: $font(17)
          },
          layout: function(make, view) {
            make.height.equalTo(view.super)
            make.left.equalTo(view.prev.right).inset(3)
          }
        }],
      },],
    },
    {
      type: "scroll",
      props: {
        id: "uploadScroll",
        bgcolor: $color("#F9F9F8"),
        showsVerticalIndicator: true,
      },
      layout: function(make, view) {
        make.centerX.equalTo(view.super)
        make.width.equalTo(view.super)
        make.top.equalTo(view.prev.bottom)
        if($device.info.version >= "11"){
          make.bottom.equalTo(view.super.safeAreaBottom)
        } else {
          make.bottom.inset(0)
        }
      },
      views: [{
        type: "label",
        props: {
          id: "previewLabel",
          text: "启动器预览",
          align: $align.left,
          font: $font(16),
        },
        layout: function(make, view) {
          make.top.inset(10)
          make.height.equalTo(20)
          make.left.inset(10)
        }
      },
      {
        type: "view",
        props: {
          id: "preView",
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.left.right.inset(0)
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(80)
          make.centerX.equalTo(view.super)
        },
        views: [{
          type: "view",
          layout: function(make, view) {
            make.left.right.inset(0)
            make.height.equalTo(50)
            make.center.equalTo(view.super)
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
              smoothRadius: 5,
              size: $size(20, 20),
              icon: $icon("008", $color("gray"), $size(20, 20)),
            },
            layout(make, view) {
              make.top.inset(9)
              make.centerX.equalTo(view.super)
              make.size.equalTo($size(20,20))
            }
          },]
        }],
      },
      {
        type: "label",
        props: {
          id: "descriptLabel",
          text: "启动器参数",
          align: $align.left,
          font: $font(16),
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          make.height.equalTo(20)
          make.left.inset(10)
        }
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(50)
          make.left.right.inset(0)
        },
        views: [{
          type: "label",
          props: {
            id: "titleLabel",
            text: "名称",
            align: $align.left,
            font: $font(16),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(20)
            make.left.inset(15)
            make.width.equalTo(40)
          }
        },{
          type: "input",
          props: {
            id: "titleInput",
            bgcolor: $color("white"),
            radius: 0,
            text: (title == undefined)?"":title,
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(32)
            make.left.equalTo(view.prev.right)
            make.right.inset(15)
          },
          events: {
            changed: function(sender) {
              $("title").text = sender.text
            },
            returned: function(sender) {
              sender.blur()
            }
          }
        },],
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(1)
          make.height.equalTo(50)
          make.left.right.inset(0)
        },
        views: [{
          type: "label",
          props: {
            id: "iconLabel",
            text: "图标",
            align: $align.left,
            font: $font(16),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(20)
            make.left.inset(15)
            make.width.equalTo(50)
          }
        },{
          type: "button",
          props: {
            id: "chooseButton",
            bgcolor: $color("clear"),
            info: icon,
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(32)
            make.left.equalTo(view.prev.right)
            make.right.inset(15)
          },
          events: {
            tapped: function(sender) {
              $photo.pick({
                format: "data",
                handler: function(resp) {
                  if(resp.data != undefined) {
                    let mimeType = resp.data.info.mimeType
                    let cutedIcon = cutIcon(resp.data.image)
                    if (mimeType.indexOf("png") >= 0) {
                      fileName = "1.png"
                      sender.info = cutedIcon.png
                      $("icon").data = cutedIcon.png
                    } else {
                      fileName = "1.jpg"
                      sender.info = cutedIcon.jpg(1.0)
                      $("icon").data = cutedIcon.jpg(1.0)
                    }
                    isIconRevised = true
                  }
                }
              })
            }
          },
          views: [{
            type: "image",
            props: {
              src: "assets/enter.png",
              bgcolor: $color("clear"),
            },
            layout: function(make, view) {
              make.right.inset(0)
              make.centerY.equalTo(view.super)
              make.size.equalTo($size(8, 18))
            },
          },{
            type: "label",
            props: {
              text: "选择图片",
              font: $font(15),
              align: $align.right,
              textColor: $color("lightGray"),
            },
            layout: function(make, view) {
              make.centerY.equalTo(view.super)
              make.height.equalTo(view.super)
              make.left.inset(0)
              make.right.equalTo(view.prev.left).inset(10)
            }
          }]
        },],
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(1)
          make.height.equalTo(50)
          make.left.right.inset(0)
        },
        views: [{
          type: "label",
          props: {
            id: "schemeLabel",
            text: "Url Scheme",
            align: $align.left,
            font: $font(16),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(20)
            make.left.inset(15)
            make.width.equalTo(90)
          }
        },{
          type: "input",
          props: {
            id: "schemeInput",
            text: (url == undefined)?"":url,
            bgcolor: $color("white"),
            radius: 0,
            type: $kbType.url,
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(32)
            make.left.equalTo(view.prev.right)
            make.right.inset(15)
            setUrlInputTool()
          },
          events: {
            returned: function(sender) {
              sender.blur()
            },
            changed: function(sender) {
              verifyStateSet()
              if(sender.text.indexOf("jsbox://run") >= 0) {
                $ui.alert({
                  title: "提示",
                  message: "请勿上传JSBox内脚本的链接，因为JSBox自带启动器，且其他人难以获取",
                })
                sender.text = ""
              } else if(sender.text.indexOf("workflow://x-callback-url/run-workflow") >= 0) {
                $ui.alert({
                  title: "提示",
                  message: "请勿上传Workflow内规则的链接，因为Workflow自带启动器，且其他人难以获取",
                })
                sender.text = ""
              }
            }
          }
        },],
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(1)
          make.height.equalTo(50)
          make.left.right.inset(0)
        },
        views: [{
          type: "label",
          props: {
            text: "验证",
            align: $align.left,
            font: $font(16),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(20)
            make.left.inset(15)
            make.width.equalTo(80)
          }
        },{
          type: "button",
          props: {
            id: "verifyButton",
            font: $font(10),
            bgcolor: $color("#D8D8D8"),
            circular: true,
            info: false,
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(32)
            make.width.equalTo(32)
            make.right.inset(15)
          },
          events: {
            tapped: function(sender) {
              utils.myOpenUrl($("schemeInput").text)
              let nDate = new Date()
              $cache.set("begainTime", nDate.getTime())
              resumeAction = 1
              $thread.background({
                delay: 0.1,
                handler: function() {
                  if (resumeAction == 1) {
                    resumeAction = 0
                    verifyStateSet(false)
                  }
                }
              })
            }
          }
        },],
      },
      {
        type: "label",
        props: {
          id: "schemeLabel",
          text: "请先点击验证按钮验证正确性",
          align: $align.left,
          font: $font(13),
          textColor: $color("gray"),
        },
        layout: function(make, view) {
          make.width.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(20)
          make.left.inset(15)
        }
      },
      {
        type: "label",
        props: {
          id: "descriptLabel",
          text: "启动器说明(可选)",
          align: $align.left,
          font: $font(16),
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          make.height.equalTo(20)
          make.left.inset(10)
        }
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(140)
          make.left.right.inset(0)
        },
        views: [{
          type: "text",
          props: {
            id: "descriptInput",
            text: (descript)?descript:"",
            bgcolor: $color("white"),
            radius: 0,
            font: $font(15),
          },
          layout: function(make, view) {
            make.center.equalTo(view.super)
            make.height.equalTo(110)
            make.left.right.inset(15)
          },
          events: {
            didChange: function(sender) {
              let length = sender.text.length
              $("descriptNumberHint").text = length + "/80"
              if(length > 80) {
                $("descriptNumberHint").textColor = $color("red")
              } else {
                $("descriptNumberHint").textColor = $color("darkGray")
              }
            }
          }
        },{
          type: "label",
          props: {
            id: "descriptNumberHint",
            text: ((descript)?descript.length:0).toString() + "/80",
            align: $align.center,
            font: $font(12),
            textColor: $color("darkGray"),
          },
          layout: function(make, view) {
            make.right.equalTo(view.prev).inset(3)
            make.bottom.equalTo(view.prev)
            make.height.equalTo(20)
          }
        },],
      },
      {
        type: "button",
        props: {
          id: "cloudButton",
          title: actionText,
          bgcolor: $color("#62BEF2"),
          titleColor: $color("white"),
          circular: true,
          info: {isfinish: false}
        },
        layout: function(make, view) {
          make.left.right.inset(20)
          make.centerX.equalTo(view.super)
          make.height.equalTo(45)
          make.top.equalTo(view.prev.bottom).inset(30)
        },
        events: {
          tapped: function(sender) {
            if ($("titleInput").text.length == 0 || $("schemeInput").text.length == 0 || $("chooseButton").info == undefined) {
              ui.showToastView($("uploadItemView"), mColor.red, "请补全信息")
            } else if ($("verifyButton").info == false && action != "edit") {
              ui.showToastView($("uploadItemView"), mColor.red, "请先通过验证")
            } else if ($("descriptInput").text.length > 80) {
              ui.showToastView($("uploadItemView"), mColor.red, "说明文字过长")
            } else {
              let descriptText = $("descriptInput").text
              if(descriptText.length == 0) {
                descriptText = undefined
              }
              if(action == "upload") {
                if(haveExisted($("schemeInput").text)) {
                  $ui.alert({
                    title: "提示",
                    message: "云库中已存在，请勿重复上传，如有其他情况请反馈",
                  })
                } else {
                  $("uploadItemView").add(genProgress(sender))
                  uploadTinyPng(action, $("chooseButton").info, undefined, undefined, fileName)
                }
              } else if(action == "renew"){
                if(isIconRevised == false) {
                  uploadItem($("titleInput").text, undefined, $("schemeInput").text, descriptText, undefined, undefined, objectId)
                } else {
                  $("uploadItemView").add(genProgress(sender))
                  uploadTinyPng(action, $("chooseButton").info, objectId, undefined, fileName)
                }
              } else if(action == "edit") {
                if(isIconRevised == false) {
                  updateToLocal($("rowsShow"), indexPath, $("titleInput").text, icon, $("schemeInput").text, descriptText)
                  $ui.pop()
                } else {
                  uploadSM(action, $("chooseButton").info, undefined, indexPath, fileName)
                }
              }
            }
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
  $("uploadScroll").resize()
  $("uploadScroll").contentSize = $size(0, 750)
}

function setUrlInputTool() {
  let inputView = $("schemeInput")
  var toolView = $ui.create({
    type: "view",
    props: {
      frame: $rect(0, 0, 0, 40),
      bgcolor: $color("clear"),
      borderWidth: 0.5,
      borderColor: $color("#cccccc")
    },
    views: [{
      type: "blur",
      props: {
        style: 5,
      },
      layout: $layout.fill
    },{
      type: "button",
      props: {
        title: "完成",
        font: $font(16.5),
        titleColor: $color("#222222"),
        radius: 0,
        bgcolor: $color("clear")
      },
      layout: function(make, view) {
        make.top.bottom.inset(0);
        make.right.inset(15)
      },
      events: {
        tapped: function(sender) {
          inputView.blur();
        }
      }
    },{
      type: "view",
      layout: function(make, view) {
        make.centerY.equalTo(view.super)
        make.height.equalTo(view.super)
        make.left.inset(5)
        make.right.equalTo(view.prev.left).inset(15)
      },
      views: [{
        type: "button",
        props: {
          bgcolor: $color("white"),
          smoothRadius: 8,
        },
        layout: function(make, view) {
          make.centerY.equalTo(view.super)
          make.top.bottom.inset(5)
          make.left.inset(3)
          make.width.equalTo(110)
        },
        views: [{
          type: "image",
          props: {
            icon: $icon("104", $color("#bbbbbb"), $size(18, 18)),
            bgcolor: $color("clear"),
            smoothRadius: 5,
            size: $size(18, 18),
          },
          layout: function(make, view) {
            make.left.inset(8)
            make.centerY.equalTo(view.super)
            make.size.equalTo($size(18, 18))
          }
        },{
          type: "label",
          props: {
            text: "剪切板参数",
            textColor: $color("black"),
            bgcolor: $color("clear"),
            font: $font(13),
            align: $align.center,
          },
          layout: function(make, view) {
            make.left.equalTo(view.prev.right).inset(0)
            make.centerY.equalTo(view.super)
            make.height.equalTo(25)
            make.right.inset(5)
          }
        },],
        events: {
          tapped: function(sender) {
            inputView.text = inputView.text + "[clipboard]"
          }
        },
      },],
    },]
  });
  inputView.runtimeValue().$setInputAccessoryView(toolView);
  inputView.runtimeValue().$reloadInputViews();
}

function genProgress(baseView) {
  if($("progress") != undefined) {
    $("progress").super.remove()
  }
  let progress = {
    type: "gradient",
    props: {
      colors: colors,
      locations: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1],
      startPoint: $point(0, 0.5),
      endPoint: $point(1, 0.5),
    },
    layout: function(make, view) {
      make.height.equalTo(2)
      make.left.right.inset(20)
      make.bottom.equalTo(baseView.top).inset(8)
      make.centerX.equalTo(view.super)
    },
    views: [{
      type: "progress",
      props: {
        id: "progress",
        value: 0,
        progressColor: $color("darkGray"),
        trackColor: $color("clear"),
      },
      layout: $layout.fill,
    }]
  }
  let progressTimer = $timer.schedule({
    interval: 0.04,
    handler: function() {
      let view = $("progress")
      if(view != undefined) {
        if(view.value < 0.8 && $("cloudButton").info.isfinish == false) {
          view.value += 0.001
        } else {
          progressTimer.invalidate()
        }
      }
    }
  })
  return progress
}

function haveExisted(url) {
  let cloudItems = utils.getCache("cloudItems", [])
  let result = false
  for(let i = 0; i < cloudItems.length; i++) {
    if(cloudItems[i].url.toLowerCase() === url.toLowerCase()) {
      result = true
    }
  }
  return result
}

function verifyStateSet(isSuccess) {
  let button = $("verifyButton")
  if(isSuccess == undefined) {
    button.bgcolor = $color("#D8D8D8")
    button.info = false
  } else if (isSuccess == false) {
    button.bgcolor = $color("red")
    button.info = false
  } else if (isSuccess == true) {
    button.bgcolor = $color("#2ECC71")
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
      id: "rewardMainView",
      title: "支持与赞赏",
      navBarHidden: true,
      statusBarStyle: 0,
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
      layout: function(make, view) {
        if($device.info.version >= "11"){
          make.top.equalTo(view.super.safeAreaTop)
        } else {
          make.top.inset(20)
        }
        make.left.right.inset(0)
        make.height.equalTo(45)
      },
      views:[{
        type: "label",
        props: {
          text: "支持与赞赏",
          font: $font("bold", 17),
          align: $align.center,
          bgcolor: $color("white"),
          textColor: $color("black"),
        },
        layout: $layout.fill,
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
            ctx.strokeColor = $color("darkGray")
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      },{
        type: "button",
        props: {
          bgcolor: $color("clear"),
        },
        layout: function(make, view) {
          make.left.inset(0)
          make.width.equalTo(60)
          make.height.equalTo(view.super)
        },
        events: {
          tapped: function(sender) {
            $ui.pop()
          },
        },
        views:[{
          type: "image",
          props: {
            src: "assets/back.png",
            bgcolor: $color("clear"),
          },
          layout: function(make, view) {
            make.left.inset(10)
            make.centerY.equalTo(view.super)
            make.size.equalTo($size(12, 23))
          },
        },{
          type: "label",
          props: {
            text: "设置",
            align: $align.center,
            textColor: $color(mColor.blue),
            font: $font(17)
          },
          layout: function(make, view) {
            make.height.equalTo(view.super)
            make.left.equalTo(view.prev.right).inset(3)
          }
        }],
      },],
    },{
      type: "view",
      props: {
        id: "reward",
      },
      layout: function(make, view) {
        make.left.right.inset(10)
        make.top.equalTo(view.prev.bottom).inset(30)
        if($device.info.version >= "11"){
          make.bottom.equalTo(view.super.safeAreaBottom).inset(30)
        } else {
          make.bottom.inset(30)
        }
        make.centerX.equalTo(view.super)
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
          id: "aliRedPackButton",
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
            // $app.openURL("https://qr.alipay.com/c1x01118pzbsiaajndmmp65")
            $clipboard.text = "623098624"
            $ui.alert({
              title: "提示",
              message: "感谢你的支持！\n红包码 623098624 已复制到剪切板，到支付宝首页粘贴红包码即可领取",
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
      },{
        type: "label",
        props: {
          id: "recommandText",
          text: "— 零成本支持 —",
          textColor: $rgba(100, 100, 100, 0.5),
          font: $font(10),
        },
        layout: function(make, view) {
          make.centerX.equalTo($("aliRedPackButton"))
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
        footer: {
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
function setupFeedBack(text) {
  $ui.push({
    props: {
      id: "feedbackView",
      title: "反馈建议",
      navBarHidden: true,
      statusBarStyle: 0,
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
      layout: function(make, view) {
        if($device.info.version >= "11"){
          make.top.equalTo(view.super.safeAreaTop)
        } else {
          make.top.inset(20)
        }
        make.left.right.inset(0)
        make.height.equalTo(45)
      },
      views:[{
        type: "label",
        props: {
          text: "反馈建议",
          font: $font("bold", 17),
          align: $align.center,
          bgcolor: $color("white"),
          textColor: $color("black"),
        },
        layout: $layout.fill,
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
            ctx.strokeColor = $color("darkGray")
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      },{
        type: "button",
        props: {
          bgcolor: $color("clear"),
        },
        layout: function(make, view) {
          make.left.inset(0)
          make.width.equalTo(60)
          make.height.equalTo(view.super)
        },
        events: {
          tapped: function(sender) {
            $ui.pop()
          },
        },
        views:[{
          type: "image",
          props: {
            src: "assets/back.png",
            bgcolor: $color("clear"),
          },
          layout: function(make, view) {
            make.left.inset(10)
            make.centerY.equalTo(view.super)
            make.size.equalTo($size(12, 23))
          },
        },{
          type: "label",
          props: {
            text: "设置",
            align: $align.center,
            textColor: $color(mColor.blue),
            font: $font(17)
          },
          layout: function(make, view) {
            make.height.equalTo(view.super)
            make.left.equalTo(view.prev.right).inset(3)
          }
        }],
      },],
    },{
        type: "view",
        props: {
          id: "feedback",
        },
        layout: function(make, view) {
          make.left.right.inset(10)
          make.height.equalTo(300)
          make.top.equalTo(view.prev.bottom).inset(20)
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
    ]
  })
}

function showInfoView(superView, data) {
  let exist = isExist(data)
  superView.add({
    type: "view",
    props: {
      id: "infoView",
      alpha: 0,
      clipsToBounds: true,
    },
    layout: function(make, view) {
      make.size.equalTo(view.super)
      make.center.equalTo(view.super)
    },
    views: [{
      type: "view",
      props: {
        bgcolor: $rgba(0, 0, 0, 0.25)
      },
      layout: $layout.fill,
      events: {
        tapped: sender => {
          hideView()
        }
      }
    },{
      type: "view",
      props: {
        id: "windowView",
        bgcolor: $color("#f6f6f6"),
      },
      layout: function(make, view) {
        make.height.equalTo(260)
        make.width.equalTo(view.super)
        make.centerX.equalTo(view.super)
        make.top.equalTo(view.super.bottom)
        shadow(view)
      },
      views: [{
        type: "view",  //top view
        layout: function(make, view) {
          make.left.right.inset(0)
          make.top.inset(0)
          make.height.equalTo(35)
        },
        views: [{
          type: "button",
          props: {
            bgcolor: $color("clear"),
          },
          layout: function(make, view) {
            make.left.inset(20)
            make.centerY.equalTo(view.super)
            make.size.equalTo($size(50, 35))
          },
          events: {
            tapped: function(sender) {
              $ui.menu({
                items: ["分享", "失效反馈"],
                handler: function(title, idx) {
                  switch (idx) {
                    case 0:
                      let shareLink = "https://liuguogy.github.io/JSBox-addins?q=show&objectId=" + data.objectId
                      share(shareLink)
                      break;
                    case 1:
                      setupFeedBack("应用失效(objectId)：\n\t" + data.objectId + "\n描述(原因或现象)：\n\t")
                      break;
                    default:
                      break;
                  }
                },
                finished: function(cancelled) {}
              })
            }
          },
          views: [{
            type: "image",
            props: {
              src: "assets/more.png",
              bgcolor: $color("clear"),
              alpha: 0.7,
            },
            layout: function(make, view) {
              make.center.equalTo(view.super)
              make.size.equalTo($size(17, 17))
            },
          }]
        },{
          type: "button",
          props: {
            title: "×",
            font: $font(27),
            titleColor: $color("#bbbbbb"),
            bgcolor: $color("clear"),
          },
          layout: function(make, view) {
            make.right.inset(20)
            make.centerY.equalTo(view.super)
            make.size.equalTo($size(50, 35))
          },
          events: {
            tapped: function(sender) {
              hideView()
            }
          }
        },],
      },{
        type: "canvas",
        layout: function(make, view) {
          var preView = view.prev
          make.top.equalTo(preView.bottom)
          make.height.equalTo(1 / $device.info.screen.scale)
          make.left.right.inset(20)
        },
        events: {
          draw: function(view, ctx) {
            var width = view.frame.width
            var scale = $device.info.screen.scale
            ctx.strokeColor = $color("#bbbbbb")
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      },{
        type: "view",
        props: {
          bgcolor: $color("clear"),
          clipsToBounds: false,
        },
        layout: function(make, view) {
          make.left.right.inset(30)
          make.height.equalTo(50)
          make.top.equalTo(view.prev).inset(12)
        },
        views: [{
          type: "image",
          props: {
            bgcolor: $color("clear"),
            smoothRadius: 13,
            size: $size(50, 50),
            src: data.icon.src,
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.left.inset(0)
            make.size.equalTo($size(50, 50))
          }
        },{
          type: "lottie",
          props: {
            src: "assets/star.json",
            loop: false,
            autoReverse: false,
            speed: 2,
            bgcolor: $color("clear"),
            progress: (exist)?1:0,
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.right.inset(0)
            make.size.equalTo($size(60, 60))
          },
          events:{
            tapped:(sender)=>{
              if(exist){
                sender.stop();
                deleteLocalItem(data)
              } else {
                $device.taptic(1);
                $delay(0.4, ()=>{
                  $device.taptic(1);
                })
                sender.play();
                addToLocal(data)
              }
              exist = !exist
            },
          },
        },{
          type: "label",
          props: {
            text: data.title.text,
            font: $font("bold", 17),
            textColor: $color("#555555"),
            align: $align.left,
          },
          layout: function(make, view) {
            make.left.equalTo(view.prev.prev.right).inset(15)
            make.right.equalTo(view.prev.left).inset(0)
            make.top.inset(2)
          }
        },
        {
          type: "label",
          props: {
            text: data.url,
            font: $font(15),
            textColor: $color("#aaaaaa"),
            bgcolor: $color("clear"),
            align: $align.left,
            userInteractionEnabled: true,
          },
          layout: function(make, view) {
            make.left.equalTo(view.prev.left)
            make.right.equalTo(view.prev.prev.left).inset(0)
            make.bottom.inset(3)
          },
          events: {
            tapped: function(sender) {
              $device.taptic(0)
              $clipboard.text = data.url
              ui.showToastView($("windowView"), mColor.green, "复制成功", 0.2)
              sender.bgcolor = $color("clear")
              sender.textColor = $color("#aaaaaa")
            },
            touchesBegan: function(sender, location) {
              sender.bgcolor = $color("clear")
              sender.textColor = $color("#555555")
            },
            touchesEnded: function(sender, location) {
              sender.bgcolor = $color("clear")
              sender.textColor = $color("#aaaaaa")
            }
          },
        },],
      },{
        type: "label",
        props: {
          text: (data.descript)?data.descript:"暂无说明",
          font: $font(15),
          textColor: $color("#555555"),
          bgcolor: $color("clear"),
          align: $align.left,
          lines: 0,
        },
        layout: function(make, view) {
          make.left.right.inset(30)
          make.top.equalTo(view.prev.bottom).inset(10)
          let height = $text.sizeThatFits({
            text: (data.descript)?data.descript:"暂无说明",
            width: $device.info.screen.width - 60,
            font: $font(15),
          }).height
          if(height > 72) {
            height = 72
          }
          make.height.equalTo(height)
        }
      },{
        type: "view",
        props: {
          bgcolor: $color("clear"),
        },
        layout: function(make, view) {
          make.left.right.inset(25)
          make.height.equalTo(40)
          make.bottom.inset(20)
        },
        views: [{
          type: "button",
          props: {
            title: "打 开",
            bgcolor: $color("#3897E6"),
            borderColor: $color("clear"),
            borderWidth: 0,
            titleColor: $color("white"),
            // circular: true,
          },
          layout: function(make, view) {
            make.top.bottom.inset(0)
            make.width.equalTo(view.super)
            make.centerY.equalTo(view.super)
            make.left.inset(0)
          },
          events: {
            tapped: function(sender) {
              $device.taptic(0)
              utils.myOpenUrl(data.url)
              resumeAction = 3
              $thread.background({
                delay: 0.1,
                handler: function() {
                  if(resumeAction == 3) {
                    resumeAction = 0
                    sender.title = "未安装对应APP"
                    sender.bgcolor = $color(mColor.red)
                    $device.taptic(2)
                    $delay(0.6, function(){
                      if(sender != undefined) {
                        sender.bgcolor = $color("#3897E6")
                        sender.title = "打 开"
                      }
                    })
                  }
                }
              })
            }
          }
        },]
      },],
    }],
  })
  $("windowView").relayout()
  $("windowView").remakeLayout(function(make) {
    make.height.equalTo(260)
    make.width.equalTo(superView)
    make.centerX.equalTo(superView)
    make.bottom.inset(0)
  })
  $ui.animate({
    duration: 0.3,
    damping: 0.9,
    velocity: 0.4,
    animation: () => {
      $("infoView").alpha = 1
      $("windowView").relayout()
    }
  })
  function hideView() {
    $("windowView").remakeLayout(function(make) {
      make.height.equalTo(260)
      make.width.equalTo($("infoView"))
      make.centerX.equalTo($("infoView"))
      make.top.equalTo($("infoView").bottom)
    })
    $ui.animate({
      duration: 0.2,
      velocity: 0.5,
      animation: () => {
        $("infoView").alpha = 0;
        $("windowView").relayout()
      },
      completion: () => {
        $("infoView").remove();
      }
    });
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
    }
  })
}

function showOneItem(objectId) {
  let cloudItems = utils.getCache("cloudItems", [])
  for(let i = 0; i < cloudItems.length; i++) {
    if(cloudItems[i].objectId == objectId) {
      $delay(0.3, ()=>{
        if($("mainView")) {
          showInfoView($("mainView"), cloudItems[i])
        }
      })
      return 0
    }
  }
  $http.request({
    method: "GET",
    url: "https://wcphv9sr.api.lncld.net/1.1/classes/Items/" + objectId + "?keys=-deviceToken,-size,-createdAt",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": appId,
      "X-LC-Key": appKey,
    },
    handler: function(resp) {
      let data = resp.data
      if (data != undefined && data.url != undefined) {
        let itemInfo = {
          title: {
            text: data.title
          },
          icon: {
            src: data.icon
          },
          url: data.url,
          descript: data.descript,
        }
        $delay(0.3, ()=>{
          showInfoView($("mainView"), itemInfo)
        })
      } else {
        ui.showToastView($("mainView"), mColor.red, "未找到该启动器")
      }
    }
  })
}

function requireItems() {
  $http.request({
    method: "GET",
    url: "https://wcphv9sr.api.lncld.net/1.1/classes/Items?limit=1000&order=-updatedAt&keys=-deviceToken,-size",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": appId,
      "X-LC-Key": appKey,
    },
    handler: function(resp) {
      let view = $("rowsCloudShow")
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
            descript: data[i].descript,
            objectId: data[i].objectId,
          })
        }
        view.data = array
        view.endRefreshing()
        let cloudItems = utils.getCache("cloudItems", [])
        if(array.length > cloudItems.length) {
          ui.showToastView($("mainView"), mColor.blue, "发现 " + (array.length - cloudItems.length) + " 个新启动器")
        }
        $cache.set("cloudItems", array)
      } else {
        view.endRefreshing()
      }
    }
  })
}

function requireMyItems() {
  let url = "https://wcphv9sr.api.lncld.net/1.1/classes/Items?limit=1000&order=-updatedAt&where={\"deviceToken\":\"" + $objc("FCUUID").invoke("uuidForDevice").rawValue() + "\"}"
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
            descript: data[i].descript,
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
    }
  })
}

function uploadItem(title, icon, url, descript, size, deviceToken, objectId) {
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
  if(descript != undefined) {
    json.descript = descript
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
      $("cloudButton").info = {isfinish: true}
      let view = $("progress")
      ui.showToastView($("uploadItemView"), mColor.green, "上传成功")
      requireItems()
      $("rowsCloudShow").scrollToOffset($point(0, 0))
      if(view != undefined) {
        let finishTimer = $timer.schedule({
          interval: 0.001,
          handler: function() {
            if(view != undefined) {
              if(view.value < 1) {
                view.value += 0.001
              } else {
                finishTimer.invalidate()
                $delay(0.5, function() {
                  if($("toastView") != undefined) {
                    $("toastView").remove()
                  }
                  $ui.pop()
                })
              }
            }
          }
        })
      } else {
        $delay(0.5, function() {
          if($("toastView") != undefined) {
            $("toastView").remove()
          }
          $ui.pop()
        })
      }
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
        view.text = results
        $cache.set("installNumbers", results)
      }
    }
  })
}

function uploadInstall() {
  let info = {
    addinVersion: update.getCurVersion(),
    iosVersion: $device.info.version,
    jsboxVersion: $app.info.version,
    deviceType: "ios",
    deviceToken: $objc("FCUUID").invoke("uuidForDevice").rawValue()
  }
  let info_pre = utils.getCache("installInfo")
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
        addinVersion: update.getCurVersion(),
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
      frame: $rect(0, 0, canvasSize, canvasSize),
      bgcolor: $color("clear"),
    }
  })
  canvas.frame = $rect(0, 0, canvasSize, canvasSize)
  let snapshot = canvas.snapshot
  return snapshot
}

function uploadSM(action, pic, objectId, indexPath, fileName) {
  if(action != "edit") {
    if (typeof(pic) != "undefined") {
      $http.upload({
        url: "https://sm.ms/api/upload",
        files: [{ "data": pic, "name": "smfile", "filename": fileName}],
        handler: function(resp) {
          var data = resp.data.data
          let deviceId = undefined
          if(action != "renew") {
            deviceId = $objc("FCUUID").invoke("uuidForDevice").rawValue()
          }
          uploadItem($("title").text, data.url, $("schemeInput").text, $("descriptInput").text, data.size, deviceId, objectId)
        }
      })
    }
  } else {
    if (typeof(pic) != "undefined") {
      ui.showToastView($("uploadItemView"), mColor.blue, "请稍候")
      $http.upload({
        url: "https://sm.ms/api/upload",
        files: [{ "data": pic, "name": "smfile", "filename": fileName}],
        handler: function(resp) {
          var data = resp.data.data
          updateToLocal($("rowsShow"), indexPath, $("titleInput").text, data.url, $("schemeInput").text, $("descriptInput").text)
          $ui.pop()
        }
      })
    }
  }
}

function uploadTinyPng(action, pic, objectId, indexPath, fileName) {
  ui.showToastView($("uploadItemView"), mColor.blue, "压缩上传中，请耐心等候", 5)
  $http.request({
    method: "POST",
    url: "https://api.tinify.com/shrink",
    header: {
      Authorization: "Basic " + $text.base64Encode("api:" + randomValue(apiKeys)),
    },
    body: pic,
    handler: function (resp) {
      let response = resp.response;
      if (response.statusCode === 201 || response.statusCode === 200) {
        let compressedImageUrl = response.headers["Location"]
        $http.download({
          url: compressedImageUrl,
          handler: function (resp_) {
            if (resp_.data) {
              let imageData = resp_.data
              uploadSM(action, imageData, objectId, indexPath, fileName)
            }
          }
        })
      }
    }
  })
}

function randomValue(object) {
  let x = Math.floor(Math.random()*object.length)
  return object[x]
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
      content: text + "\nID: " + $objc("FCUUID").invoke("uuidForDevice").rawValue().toString(),
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
          ui.showBannedAlert()
        } else {
          $cache.set("haveBanned", false)
        }
      }
    })
  }
}

function refreshLocalView() {
  if($("rowsShow") != undefined) {
    $("rowsShow").remove()
    $("rowsShowParent").add(genRowsView($("reorderButton").info, utils.getCache("columns")))
  }
}

module.exports = {
  show: show,
  refreshLocalView: refreshLocalView,
}