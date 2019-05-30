let ui = require('scripts/ui')
let utils = require('scripts/utils')
let update = require('scripts/update')
let uploadView = require('scripts/upload-view')
let logUpView = require('scripts/login-view')
let user = require('scripts/user')
let userCenterView = require('scripts/user-center')
let appItemView = require('scripts/app-itemview')

let appId = "kscF2nXMoGQCJDLf2MQxYTGm-gzGzoHsz"
let appKey = "Stp7wCtlaybGlMbDJ4ApYbQL"
let apiKeys = ["qp8G6bzstArEa3sLgYa90TImDLmJ511r", "N2Ceias4LsCo0DzW2OaYPvTWMifcJZ6t"]
let colors = [$rgba(120, 219, 252, 0.9), $rgba(252, 175, 230, 0.9), $rgba(252, 200, 121, 0.9), $rgba(187, 252, 121, 0.9), $rgba(173, 121, 252, 0.9), $rgba(252, 121, 121, 0.9), $rgba(121, 252, 252, 0.9)]
let resumeAction = 0 // 1 验证 2 赞赏 3 跳转
let topOffset = -20

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
    blue: $icon("164", $color(mColor.blue), $size(25, 25)),
    gray: $icon("164", $color(mColor.gray), $size(25, 25)),
  },
  {
    blue: $icon("109", $color(mColor.blue), $size(25, 25)),
    gray: $icon("109", $color(mColor.gray), $size(25, 25)),
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
  setupMainView()
  // solveQuery()
}

$app.listen({
  refreshAll: function(object) {
    refreshAllView()
  },
  requireCloud: function(object) {
    requireApps()
  },
});

let contentViews = ["cloudView", "updateView", "meView"] //"exploreView", 
  
function setupMainView() {
  $app.autoKeyboardEnabled = false
  $app.keyboardToolbarEnabled = false
  $ui.render({
    props: {
      id: "mainView",
      navBarHidden: true,
      statusBarStyle: 0,
    },
    views: [{
      type: "view",
      props: {
        id: "content",
        bgcolor: $color("clear"),
        clipsToBounds: true,
      },
      layout: function(make, view) {
        make.width.equalTo(view.super)
        make.left.right.inset(0)
        make.bottom.inset(0)
        make.top.inset(0)
      },
      events: {
        ready(sender) {
          $delay(0.1, ()=>{
            topOffset = $("cloudAppsList").contentOffset.y
          })
        },
      },
      views: [genCloudView()],
    },
    {
      type: "view",
      layout: function(make, view) {
        if($device.info.version >= "11"){
          make.top.equalTo(view.super.safeAreaBottom).offset(-50)
        } else {
          make.height.equalTo(50)
        }
        make.left.right.inset(0)
        make.bottom.inset(0)
      },
      views: [{
        type: "blur",
        props: {
          style: 1,
        },
        layout: $layout.fill,
      },{
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
          data: [
            {
              menu_image: {
                icon: mIcon[0].blue,
              },
              menu_label: {
                text: "应用",
                textColor: $color(mColor.blue)
              }
            },
            {
              menu_image: {
                icon: mIcon[1].gray,
              },
              menu_label: {
                text: "更新",
                textColor: $color(mColor.gray)
              }
            },
            {
              menu_image: {
                icon: mIcon[2].gray,
              },
              menu_label: {
                text: "我的",
                textColor: $color(mColor.gray)
              }
            },
          ],
        },
        layout: function(make, view) {
          make.top.inset(0)
          make.left.right.inset(0)
          make.height.equalTo(50)
        },
        events: {
          didSelect(sender, indexPath, data) {
            handleSelect(sender, indexPath.row)
          },
        }
      },],
    },{
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
    // case 0: return genExploreView()
    case 0: return genCloudView()
    case 1: return genUpdateView()
    case 2: return genMeView()
  }
}

function genUpdateView() {
  let view = {
    type: "view",
    props: {
      id: "updateView",
      hidden: false,
    },
    layout: $layout.fill,
    views: [{
      type: "view",
      props: {
        id: "updateAppListParent",
      },
      layout: function(make, view) {
        make.width.equalTo(view.super)
        make.top.inset(0)
        make.bottom.inset(0)
        make.centerX.equalTo(view.super)
      },
      views: [genUpdateAppListView()]
    },{
      type: "view",
      props: {
        hidden: false,
      },
      layout: function(make, view) {
        make.left.top.right.inset(0)
        if($device.info.version >= "11"){
          make.bottom.equalTo(view.super.topMargin).offset(40)
        } else {
          make.height.equalTo(65)
        }
      },
      views:[{
        type: "blur",
        props: {
          id: "updatePageHeaderBlur",
          style: 1, // 0 ~ 5
          bgcolor: $color("white"),
        },
        layout: $layout.fill,
      },{
        type: "view",
        props: {
        },
        layout: function(make, view) {
          make.left.bottom.right.inset(0)
          make.height.equalTo(45)
        },
        views: [{
          type: "label",
          props: {
            id: "updatePageHeaderLabel",
            text: "更新",
            font: $font("bold", 17),
            align: $align.center,
            bgcolor: $color("clear"),
            textColor: $color("black"),
            hidden: true,
          },
          layout: $layout.fill,
        },],
      },],
    }],
  }
  return view
}

function genExploreView() {
  let view = {
    type: "view",
    props: {
      id: "exploreView",
      hidden: false,
    },
    layout: $layout.fill,
    views: [],
  }
  return view
}

function genCloudView() {
  let view = {
    type: "view",
    props: {
      id: "cloudView",
      hidden: false,
    },
    layout: $layout.fill,
    views: [{
      type: "view",
      props: {
        id: "cloudAppListParent",
      },
      layout: function(make, view) {
        make.width.equalTo(view.super)
        make.top.inset(0)
        make.bottom.inset(0)
        make.centerX.equalTo(view.super)
      },
      views: [genCloudAppListView()]
    },{
      type: "view",
      props: {
        hidden: false,
      },
      layout: function(make, view) {
        make.left.top.right.inset(0)
        if($device.info.version >= "11"){
          make.bottom.equalTo(view.super.topMargin).offset(40)
        } else {
          make.height.equalTo(65)
        }
      },
      views:[{
        type: "blur",
        props: {
          id: "cloudPageHeaderBlur",
          style: 1, // 0 ~ 5
          bgcolor: $color("white"),
        },
        layout: $layout.fill,
      },{
        type: "view",
        props: {
        },
        layout: function(make, view) {
          make.left.bottom.right.inset(0)
          make.height.equalTo(45)
        },
        views: [{
          type: "label",
          props: {
            id: "cloudPageHeaderLabel",
            text: "应用",
            font: $font("bold", 17),
            align: $align.center,
            bgcolor: $color("clear"),
            textColor: $color("black"),
            hidden: true,
          },
          layout: $layout.fill,
        },],
      },],
    }],
  }
  
  requireApps()
  return view
}

function genCloudAppListView() {
  let searchText = ""
  let searchBar = {
    type: "view",
    layout: $layout.fill,
    views: [{
      type: "button",
      props: {
        id: "cancel_button",
        title: "取消",
        font: $font(17),
        titleColor: $color(utils.mColor.blue),
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
          if(searchText !== "") {
            // searchItems("")
          }
          if($("noSearchItemView")) {
            $("noSearchItemView").remove()
          }
          searchText = ""
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
          tintColor: $color(utils.mColor.blue),
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
            }
          },
          returned: function(sender) {
            sender.blur()
            // searchItems(sender.text)
            searchText = sender.text
          },
        },
        views: [{
          type: "label",
          props: {
            id: "search_hint",
            text: "Apps",
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
  let appViewItems = []
  let apps = utils.getCache("cloudApps", [])
  appViewItems = genAppListView(apps)
  let cloudView = {
    type: "list",
    props: {
      id: "cloudAppsList",
      template: [],
      separatorInset: $insets(0, 85, 0, 15),
      indicatorInsets: $insets(45, 0, 50, 0),
      header: {
        type: "view",
        props:{
          height: 150,
        },
        views: [{
          type: "label",
          props: {
            id: "cloudListHeaderTitle",
            text: "应用",
            font: $font("Avenir-Black", 35),
            textColor: $color("black"),
            align: $align.center,
          },
          layout: function(make, view) {
            make.left.inset(15)
            make.top.inset(50)
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
              make.left.right.inset(15)
              make.height.equalTo(view.super)
              make.centerY.equalTo(view.super)
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
      footer: {
        type: "view",
        props: {
          height: 70,
          bgcolor: $color("clear"),
        }
      },
      rowHeight: 80,
      data: appViewItems,
    },
    layout: $layout.fill,
    events: {
      didScroll: function(sender) {
        if(sender.contentOffset.y >= 40 + topOffset && $("cloudPageHeaderLabel").hidden === true) {
          $("cloudPageHeaderLabel").hidden = false
          $("cloudPageHeaderBlur").bgcolor = $color("clear")
          $("cloudListHeaderTitle").hidden = true
        } else if(sender.contentOffset.y < 40 + topOffset && $("cloudPageHeaderLabel").hidden === false) {
          $("cloudPageHeaderLabel").hidden = true
          $("cloudPageHeaderBlur").bgcolor = $color("white")
          $("cloudListHeaderTitle").hidden = false
        }else if(sender.contentOffset.y < topOffset) {
          let size = 35 - sender.contentOffset.y * 0.04
          if(size > 40)
            size = 40
          $("cloudListHeaderTitle").font = $font("Avenir-Black", size)
        }
      },
      didSelect: function(sender, indexPath, data) {
        if(data.props.info) {
          appItemView.show(data.props.info);
        }
      }
    }
  }
  return cloudView
}

function genUpdateAppListView() {
  let appViewItems = []
  let apps = utils.getCache("cloudApps", [])
  let showApps = []
  for(let i = 0; i < apps.length; i++) {
    if(apps[i].needUpdate == true) {
      showApps.push(apps[i])
    }
  }
  appViewItems = genAppListView(showApps)
  if(appViewItems.length == 0) {
    appViewItems = [{
      type: "label",
      props: {
        text: "所有应用已是最新",
        align: $align.center,
        font: $font(14),
        textColor: $color(mColor.gray),
      },
      layout: function(make, view) {
        make.center.equalTo(view.super)
      }
    }]
  }
  let updateView = {
    type: "list",
    props: {
      id: "updateAppsList",
      template: [],
      separatorInset: $insets(0, 85, 0, 15),
      header: {
        type: "view",
        props:{
          height: 95,
        },
        views: [{
          type: "label",
          props: {
            id: "updateListHeaderTitle",
            text: "更新",
            font: $font("Avenir-Black", 35),
            textColor: $color("black"),
            align: $align.center,
            indicatorInsets: $insets(45, 0, 50, 0),
          },
          layout: function(make, view) {
            make.left.inset(15)
            make.top.inset(50)
            make.height.equalTo(45)
          }
        },]
      },
      footer: {
        type: "view",
        props: {
          height: 50,
          bgcolor: $color("clear"),
        }
      },
      rowHeight: 80,
      data: appViewItems,
    },
    layout: $layout.fill,
    events: {
      didScroll: function(sender) {
        if(sender.contentOffset.y >= 40 + topOffset && $("updatePageHeaderLabel").hidden === true) {
          $("updatePageHeaderLabel").hidden = false
          $("updatePageHeaderBlur").bgcolor = $color("clear")
          $("updateListHeaderTitle").hidden = true
        } else if(sender.contentOffset.y < 40 + topOffset && $("updatePageHeaderLabel").hidden === false) {
          $("updatePageHeaderLabel").hidden = true
          $("updatePageHeaderBlur").bgcolor = $color("white")
          $("updateListHeaderTitle").hidden = false
        }else if(sender.contentOffset.y < topOffset) {
          let size = 35 - sender.contentOffset.y * 0.04
          if(size > 40)
            size = 40
          $("updateListHeaderTitle").font = $font("Avenir-Black", size)
        }
      },
      didSelect: function(sender, indexPath, data) {
        if(data.props.info) {
          appItemView.show(data.props.info);
        }
      }
    }
  }
  return updateView
}

function genAppListView(apps) {
  let appViewItems = []
  let buttonText = ""
  for(let i = 0; i < apps.length; i++) {
    if(apps[i].haveInstalled) {
      if(apps[i].needUpdate) {
        buttonText = "更新"
      } else {
        buttonText = "打开"
      }
    } else {
      buttonText = "获取"
    }
    appViewItems.push({
      type: "view",
      props: {
        info: apps[i].objectId,
      },
      layout: function(make, view) {
        make.left.right.inset(15)
        make.height.equalTo(80)
        make.center.equalTo(view.super)
      },
      views: [ui.genAppShowView(apps[i].appIcon, apps[i].appName, (apps[i].subtitle != "")?apps[i].subtitle:apps[i].appCate, buttonText, function(buttonView) {
        if(!apps[i].needUpdate && apps[i].haveInstalled) {
          $addin.run(apps[i].appName)
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
                    ctx.strokeColor = $rgba(100, 100, 100, 0.1)
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
                url: apps[i].file,
                showsProgress: false,
                handler: function(resp) {
                  let json = utils.getSearchJson(apps[i].appIcon)
                  let icon_code = (json.code)?json.code:"124";
                  $addin.save({
                    name: apps[i].appName,
                    data: resp.data,
                    icon: "icon_" + icon_code + ".png",
                  });
                  let cloudApps = utils.getCache("cloudApps", [])
                  for(let j = 0; j < cloudApps.length; j++) {
                    if(cloudApps[j].objectId == apps[i].objectId) {
                      cloudApps[j].haveInstalled = true
                      cloudApps[j].needUpdate = false
                    }
                  }
                  $cache.set("cloudApps", cloudApps);
                  $ui.animate({
                    duration: 0.1,
                    animation: function() {
                      buttonView.bgcolor = $rgba(100, 100, 100, 0.1)
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
                          refreshAllView()
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
    })
  }
  return appViewItems
}

function refreshAllView() {
  if($("cloudAppsList")) {
    let cloudOffset = $("cloudAppsList").contentOffset.y
    $("cloudAppsList").remove()
    $("cloudAppListParent").add(genCloudAppListView())
    $("cloudAppsList").contentOffset = $point(0, cloudOffset)
  }
  if($("updateAppsList")) {
    let updateOffset = $("updateAppsList").contentOffset.y
    $("updateAppsList").remove()
    $("updateAppListParent").add(genUpdateAppListView())
    $("updateAppsList").contentOffset = $point(0, updateOffset)
  }
}

function genMeView() {
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

  let array = [{
    templateTitle: {
      text : "更新日志",
    },
    url: "https://www.liuguogy.com/archives/jsbox-store-developing.html",
  },
  {
    templateTitle: {
      text : "GitHub",
    },
    url: "https://github.com/LiuGuoGY/JSBox-addins/",
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
  },]

  let userArray = [{
    templateTitle: {
      text : user.haveLogined()?"个人中心":"未登录用户",
    },
  },]

  let actionArray = [{
    templateTitle: {
      text : "我要发布",
    },
  },]

  let view = {
    type: "view",
    props: {
      id: "meView",
      hidden: true,
    },
    layout: $layout.fill,
    views: [{
      type: "list",
      props: {
        id: "list",
        bgcolor: $color("clear"),
        template: feedBackTemplate,
        indicatorInsets: $insets(45, 0, 50, 0),
        header: {
          type: "view",
          props:{
            height: 95,
          },
          views: [{
            type: "label",
            props: {
              id: "meListHeaderTitle",
              text: "我的",
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
            height: 110,
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
              make.centerX.equalTo(view.super)
              make.top.inset(23)
            }
          },],
        },
        data: [{
          title: "用户",
          rows: userArray,
        },{
          title: "操作",
          rows: actionArray,
        },{
          title: "关于",
          rows: array,
        },
        {
          title: "其他",
          rows: [tabShowInstalls],
        }],
      },
      layout: function(make, view) {
        make.top.inset(0)
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
            switch(indexPath.row + indexPath.section) {
              case 0: user.haveLogined()?userCenterView.setupUserCenterView():wantToLogin();break;
              case 1: wantToRealse();break;
              case 4: update.checkUpdate(true);break;
              case 5: setupFeedBack();break;
              case 6: setupReward();break;
              default:break;
            }
          }
        },
        didScroll: function(sender) {
          if(sender.contentOffset.y >= 40 + topOffset && $("mePageHeaderLabel").hidden === true) {
            $("mePageHeaderLabel").hidden = false
            $("mePageHeaderBlur").bgcolor = $color("clear")
            $("meListHeaderTitle").hidden = true
          } else if(sender.contentOffset.y < 40 + topOffset && $("mePageHeaderLabel").hidden === false) {
            $("mePageHeaderLabel").hidden = true
            $("mePageHeaderBlur").bgcolor = $color("white")
            $("meListHeaderTitle").hidden = false
          }else if(sender.contentOffset.y < topOffset) {
            let size = 35 - sender.contentOffset.y * 0.04
            if(size > 40)
              size = 40
            $("meListHeaderTitle").font = $font("Avenir-Black", size)
          }
        },
      }
    },{
      type: "view",
      props: {
        hidden: false,
      },
      layout: function(make, view) {
        make.left.top.right.inset(0)
        if($device.info.version >= "11"){
          make.bottom.equalTo(view.super.topMargin).offset(40)
        } else {
          make.height.equalTo(65)
        }
      },
      views:[{
        type: "blur",
        props: {
          id: "mePageHeaderBlur",
          style: 1, // 0 ~ 5
          bgcolor: $color("white"),
        },
        layout: $layout.fill,
      },{
        type: "view",
        layout: function(make, view) {
          make.left.bottom.right.inset(0)
          make.height.equalTo(45)
        },
        views: [{
          type: "label",
          props: {
            id: "mePageHeaderLabel",
            text: "我的",
            hidden: true,
            font: $font("bold", 17),
            align: $align.center,
            bgcolor: $color("clear"),
            textColor: $color("black"),
          },
          layout: $layout.fill,
        },],
      },],
    }],
  }
  requireInstallNumbers()
  return view
}

function wantToLogin() {
  $ui.menu({
    items: ["登录", "注册"],
    handler: function(title, idx) {
      if(idx == 0) {
        logUpView.setupLoginView()
      } else if(idx == 1) {
        logUpView.setupLogUpView()
      }
    }
  })
}

function wantToRealse() {
  if(user.haveLogined()) {
    $ui.menu({
      items: ["首发应用", "更新应用"],
      handler: function(title, idx) {
        if(idx == 0) {
          uploadView.setupUploadView()
        } else if(idx == 1) {
          let apps = utils.getCache("cloudApps", [])
          let author = user.getLoginUser()
          let myApps = []
          for(let i = 0; i < apps.length; i++) {
            if(apps[i].authorAccount == author.objectId || apps[i].authorAccount == author.username || apps[i].authorId == author.objectId) {
              myApps.push(apps[i])
            }
          }
          let names = []
          for(let i = 0; i < myApps.length; i++) {
            names.push(myApps[i].appName)
          }
          $ui.menu({
            items: names,
            handler: function(title, idx) {
              uploadView.setupUploadView(myApps[idx])
            }
          });
        }
      }
    })
  } else {
    $ui.alert({
      title: "提示",
      message: "未登录用户无法发布应用，请先登录",
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
    })
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
    views: [ui.genPageHeader("我的", title), {
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
          make.height.equalTo(1)
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
            $app.openURL("https://qr.alipay.com/c1x01118pzbsiaajndmmp65")
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
          make.height.equalTo(1)
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
}

function requireApps() {
  $http.request({
    method: "GET",
    url: "https://kscf2nxm.api.lncld.net/1.1/classes/App?limit=1000&order=-updatedAt",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": utils.appId,
      "X-LC-Key": utils.appKey,
    },
    handler: function(resp) {
      let apps = resp.data.results
      let installedApps = utils.getInstalledApps()
      for(let i = 0; i < apps.length; i++) {
        for(let j = 0; j < installedApps.length; j++) {
          if(apps[i].objectId === installedApps[j].id) {
            apps[i].haveInstalled = true;
            if(apps[i].buildVersion > installedApps[j].build) {
              apps[i].needUpdate = true
            } else {
              apps[i].needUpdate = false
            }
          }
        }
      }
      $cache.set("cloudApps", apps);
      refreshAllView();
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
  let objectUrl = "https://kscf2nxm.api.lncld.net/1.1/classes/Items".concat((objectId == undefined)?(""):("/" + objectId))
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
    url: "https://kscf2nxm.api.lncld.net/1.1/classes/Reward",
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
    url: "https://kscf2nxm.api.lncld.net/1.1/installations?count=1&limit=0",
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
      url: "https://kscf2nxm.api.lncld.net/1.1/installations",
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
    url: "https://kscf2nxm.api.lncld.net/1.1/feedback",
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
    let url = "https://kscf2nxm.api.lncld.net/1.1/classes/list?where={\"deviceToken\":\"" + $objc("FCUUID").invoke("uuidForDevice").rawValue() + "\"}"
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

module.exports = {
  show: show,
}