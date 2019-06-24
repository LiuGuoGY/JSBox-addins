let ui = require('scripts/ui')
let utils = require('scripts/utils')
let update = require('scripts/update')
let uploadView = require('scripts/upload-view')
let logUpView = require('scripts/login-view')
let user = require('scripts/user')
let userCenterView = require('scripts/user-center')
let appItemView = require('scripts/app-itemview')
let api = require('scripts/api')

let appId = "kscF2nXMoGQCJDLf2MQxYTGm-gzGzoHsz"
let appKey = "Stp7wCtlaybGlMbDJ4ApYbQL"
let resumeAction = 0 // 1 验证 2 赞赏 3 跳转
let topOffset = -20
let searchText = ""

let mIcon = []

function show() {
  uploadInstall()
  checkBlackList()
  if(!utils.getCache("haveBanned", false)) {
    main()
  } else {
    ui.showBannedAlert()
  }
}

// api.shimo_newUploadFile()

function main() {
  setupMainView()
  requireApps()
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

function setThemeColor() {
  if(utils.getCache("darkMode")) {
    if($device.isDarkMode) {
      utils.themeColor = utils.tColor.dark;
    } else {
      if(utils.getCache("darkModeAuto")) {
        utils.themeColor = ($system.brightness < 0.15)?utils.tColor.dark:utils.tColor.light;
      } else {
        utils.themeColor = utils.tColor.dark;
      }
    }
  } else {
    utils.themeColor = utils.tColor.light;
  }
  mIcon = [
    {
      blue: $icon("102", utils.getCache("themeColor"), $size(25, 25)),
      gray: $icon("102", utils.themeColor.mainTabGrayColor, $size(25, 25)),
    },
    {
      blue: $icon("164", utils.getCache("themeColor"), $size(25, 25)),
      gray: $icon("164", utils.themeColor.mainTabGrayColor, $size(25, 25)),
    },
    {
      blue: $icon("109", utils.getCache("themeColor"), $size(25, 25)),
      gray: $icon("109", utils.themeColor.mainTabGrayColor, $size(25, 25)),
    },
  ]
}
  
function setupMainView() {
  setThemeColor()
  $app.autoKeyboardEnabled = false
  $app.keyboardToolbarEnabled = false
  $ui.render({
    props: {
      id: "mainViewParent",
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: $color("clear"),
      // debugging: true,
    },
    views: [genMainView()]
  })
}

function genMainView() {
  let mainView = {
    type: "view",
    props: {
      id: "mainView",
      bgcolor: utils.themeColor.mainColor,
    },
    layout: $layout.fill,
    views: [{
      type: "view",
      props: {
        id: "content",
        bgcolor: utils.themeColor.bgcolor,
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
        // make.width.equalTo(view.super)
        make.bottom.inset(0)
      },
      views: [{
        type: "blur",
        props: {
          style: utils.themeColor.blurType,
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
                textColor: utils.getCache("themeColor")
              }
            },
            {
              menu_image: {
                icon: mIcon[1].gray,
              },
              menu_label: {
                text: "更新",
                textColor: utils.themeColor.mainTabGrayColor
              }
            },
            {
              menu_image: {
                icon: mIcon[2].gray,
              },
              menu_label: {
                text: "我的",
                textColor: utils.themeColor.mainTabGrayColor
              }
            },
          ],
        },
        layout: function(make, view) {
          make.top.inset(0)
          if($device.info.screen.width > 500) {
            make.width.equalTo(500)
          } else {
            make.left.right.inset(0)
          }
          make.centerX.equalTo(view.super)
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
  ]}
  return mainView;
}

function handleSelect(view, row) {
  let newData = view.data
  for(let i = 0; i < newData.length; i++) {
    if (i == row) {
      newData[i].menu_label.textColor = utils.getCache("themeColor")
      newData[i].menu_image.icon = mIcon[i].blue
      if($(contentViews[i]) == undefined) {
        $("content").add(getContentView(i)) 
      }
      $(contentViews[i]).hidden = false
    } else {
      newData[i].menu_label.textColor = utils.themeColor.mainTabGrayColor
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
        id: "updatePageHeaderView",
        hidden: false,
        alpha: 0,
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
          style: utils.themeColor.blurType, // 0 ~ 5
          bgcolor: utils.themeColor.mainColor,
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
            textColor: utils.themeColor.listHeaderTextColor,
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
      bgcolor: utils.themeColor.bgcolor,
      hidden: false,
    },
    layout: $layout.fill,
    views: [{
      type: "view",
      props: {
        id: "cloudAppListParent",
        bgcolor: utils.themeColor.bgcolor,
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
        id: "cloudPageHeaderView",
        hidden: false,
        alpha: 0,
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
          style: utils.themeColor.blurType, // 0 ~ 5
          bgcolor: utils.themeColor.mainColor,
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
            textColor: utils.themeColor.listHeaderTextColor,
            hidden: true,
          },
          layout: $layout.fill,
        },],
      },],
    }],
  }
  return view
}

function genCloudAppListView() {
  let searchBar = {
    type: "view",
    layout: $layout.fill,
    views: [{
      type: "button",
      props: {
        id: "cancel_button",
        title: "取消",
        font: $font(17),
        titleColor: utils.getCache("themeColor"),
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
          $delay(0.1, ()=>{
            if(searchText !== "") {
              searchText = ""
              refreshAllView()
            }
          })
          if($("noSearchItemView")) {
            $("noSearchItemView").remove()
          }
          input.blur()
        }
      }
    },
    {
      type: "view",
      props: {
        bgcolor: utils.themeColor.appButtonBgColor,
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
          bgcolor: $color("clear"),
          returnKeyType: 6,
          userInteractionEnabled: false,
          tintColor: utils.getCache("themeColor"),
          text: searchText,
          textColor: utils.themeColor.listHeaderTextColor,
          darkKeyboard: utils.themeColor.darkKeyboard,
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
            searchText = sender.text
            $delay(0.1, ()=>{
              refreshAllView()
            })
          },
        },
        views: [{
          type: "label",
          props: {
            id: "search_hint",
            text: "Apps",
            align: $align.center,
            textColor: utils.themeColor.appHintColor,
            hidden: searchText != "",
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
  let apps = getCloudAppDisplaySource()
  appViewItems = genAppListView(apps)
  let cloudView = {
    type: "list",
    props: {
      id: "cloudAppsList",
      template: {},
      bgcolor: $color("clear"),
      indicatorInsets: $insets(45, 0, 50, 0),
      separatorColor: utils.themeColor.separatorColor,
      separatorInset: $insets(0, 85, 0, 15),
      separatorHidden: true,
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
            textColor: utils.themeColor.listHeaderTextColor,
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
              bgcolor: utils.themeColor.bgcolor,
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
        if(sender.contentOffset.y >= 5 + topOffset && $("cloudPageHeaderView").alpha == 0) {
          $ui.animate({
            duration: 0.2,
            animation: function() {
              $("cloudPageHeaderView").alpha = 1;
            },
          });
        } else if(sender.contentOffset.y < 5 + topOffset && $("cloudPageHeaderView").alpha == 1) {
          $ui.animate({
            duration: 0.2,
            animation: function() {
              $("cloudPageHeaderView").alpha = 0;
            },
          });
        }
        if(sender.contentOffset.y >= 40 + topOffset && $("cloudPageHeaderLabel").hidden === true) {
          $("cloudPageHeaderLabel").hidden = false
          $("cloudPageHeaderBlur").bgcolor = $color("clear")
          $("cloudListHeaderTitle").hidden = true
        } else if(sender.contentOffset.y < 40 + topOffset && $("cloudPageHeaderLabel").hidden === false) {
          $("cloudPageHeaderLabel").hidden = true
          $("cloudPageHeaderBlur").bgcolor = utils.themeColor.mainColor
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
  let watingAppViewItems = []
  let updatedAppViewItems = []
  let appListData = []
  let apps = utils.getCache("cloudApps", [])
  let updateIds = utils.getCache("updateIds", [])
  let newUpdateIds = []
  let updatedApps = []
  let watingApps = []
  for(let i = 0; i < apps.length; i++) {
    if(apps[i].needUpdate == true) {
      watingApps.push(apps[i])
    }
  }
  
  for(let j = 0; j < updateIds.length; j++) {
    for(let i = 0; i < apps.length; i++) {
      if(apps[i].objectId == updateIds[j] && apps[i].needUpdate == false) {
        updatedApps.push(apps[i])
        newUpdateIds.push(updateIds[j])
      }
    }
  }
  $cache.set("updateIds", newUpdateIds);
  watingAppViewItems = genAppListView(watingApps)
  updatedAppViewItems = genAppListView(updatedApps)
  if(watingAppViewItems.length > 0) {
    appListData.push({
      rows: [{
        type: "view",
        props: {
          bgcolor: $color("clear"),
        },
        layout: function(make, view) {
          make.left.right.top.inset(0)
          make.height.equalTo(50)
        },
        views: [{
          type: "label",
          props: {
            text: "等待中",
            font: $font("bold", 22),
            textColor: utils.themeColor.listHeaderTextColor,
            align: $align.center,
          },
          layout: function(make, view) {
            make.left.inset(15)
            make.centerY.equalTo(view.super)
          },
        },{
          type: "button",
          props: {
            title: "全部更新",
            titleColor: utils.getCache("themeColor"),
            bgcolor: $color("clear"),
            font: $font(17),
          },
          layout: function(make, view) {
            make.right.inset(15)
            make.centerY.equalTo(view.super)
          },
          events: {
            tapped: function(sender) {
              let listView = $("updateAppsList")
              let needUpdateNumber = watingApps.length
              if(listView) {
                sender.titleColor = utils.themeColor.appCateTextColor
                sender.userInteractionEnabled = false
                for(let i = 0; i < watingApps.length; i++) {
                  let itemView = listView.cell($indexPath(0, i + 1))
                  let buttonView = itemView.get("button")
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
                            ctx.strokeColor = utils.themeColor.appButtonBgColor
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
                          } else {
                            timer.invalidate()
                          }
                        }
                      });
                      $http.download({
                        url: watingApps[i].file,
                        showsProgress: false,
                        handler: function(resp) {
                          let json = utils.getSearchJson(watingApps[i].appIcon)
                          let icon_code = (json.code)?json.code:"124";
                          $addin.save({
                            name: watingApps[i].appName,
                            data: resp.data,
                            icon: "icon_" + icon_code + ".png",
                          });
                          if(watingApps[i].needUpdate && watingApps[i].haveInstalled) {
                            utils.addUpdateApps(watingApps[i].objectId);
                          }
                          let cloudApps = utils.getCache("cloudApps", [])
                          for(let j = 0; j < cloudApps.length; j++) {
                            if(cloudApps[j].objectId == watingApps[i].objectId) {
                              cloudApps[j].haveInstalled = true
                              cloudApps[j].needUpdate = false
                              break;
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
                                  api.uploadDownloadTimes(watingApps[i].objectId)
                                  needUpdateNumber--;
                                  if(needUpdateNumber <= 0) {
                                    $delay(0.5,()=>{
                                      refreshAllView()
                                    })
                                  }
                                }
                              })
                            }
                          })
                        }
                      })
                    }
                  })
                }
              }
            }
          }
        }]
      }].concat(watingAppViewItems)
    })
  }
  if(updatedAppViewItems.length > 0) {
    appListData.push({
      rows: [{
        type: "view",
        props: {
          bgcolor: $color("clear"),
        },
        layout: function(make, view) {
          make.left.right.top.inset(0)
          make.height.equalTo(50)
        },
        views: [{
          type: "label",
          props: {
            text: "近期更新",
            font: $font("bold", 22),
            textColor: utils.themeColor.listHeaderTextColor,
            align: $align.center,
          },
          layout: function(make, view) {
            make.left.inset(15)
            make.centerY.equalTo(view.super)
          },
        }]
      }].concat(updatedAppViewItems)
    })
  }
  if(watingAppViewItems.length == 0 && updatedAppViewItems == 0) {
    appListData = [{
      type: "label",
      props: {
        text: "所有应用已是最新",
        align: $align.center,
        font: $font(14),
        textColor: utils.themeColor.mainTabGrayColor,
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
      bgcolor: $color("clear"),
      separatorInset: $insets(0, 85, 0, 15),
      separatorColor: utils.themeColor.separatorColor,
      separatorHidden: true,
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
            textColor: utils.themeColor.listHeaderTextColor,
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
      data: appListData,
    },
    layout: $layout.fill,
    events: {
      rowHeight: function(sender, indexPath) {
        if (indexPath.row == 0) {
          return 50
        } else {
          return 80
        }
      },
      didScroll: function(sender) {
        if(sender.contentOffset.y >= 5 + topOffset && $("updatePageHeaderView").alpha == 0) {
          $ui.animate({
            duration: 0.2,
            animation: function() {
              $("updatePageHeaderView").alpha = 1;
            },
          });
        } else if(sender.contentOffset.y < 5 + topOffset && $("updatePageHeaderView").alpha == 1) {
          $ui.animate({
            duration: 0.2,
            animation: function() {
              $("updatePageHeaderView").alpha = 0;
            },
          });
        }
        if(sender.contentOffset.y >= 40 + topOffset && $("updatePageHeaderLabel").hidden === true) {
          $("updatePageHeaderLabel").hidden = false
          $("updatePageHeaderBlur").bgcolor = $color("clear")
          $("updateListHeaderTitle").hidden = true
        } else if(sender.contentOffset.y < 40 + topOffset && $("updatePageHeaderLabel").hidden === false) {
          $("updatePageHeaderLabel").hidden = true
          $("updatePageHeaderBlur").bgcolor = utils.themeColor.mainColor
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
        // bgcolor: utils.themeColor.bgcolor,
        bgcolor: $color("clear"),
      },
      layout: function(make, view) {
        make.left.right.inset(0)
        make.height.equalTo(80)
        make.center.equalTo(view.super)
      },
      views: [{
        type: "view",
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
                      ctx.strokeColor = utils.themeColor.appButtonBgColor
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
                    if(apps[i].needUpdate && apps[i].haveInstalled) {
                      utils.addUpdateApps(apps[i].objectId);
                    }
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
                            api.uploadDownloadTimes(apps[i].objectId)
                            $device.taptic(2);
                            $delay(0.2, ()=>{
                              $device.taptic(2);
                            })
                            $delay(0.5,()=>{
                              refreshAllView()
                            })
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
      }]
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
  const feedBackTemplate = {
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
          id: "templateTitle",
          textColor: utils.themeColor.listContentTextColor,
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
    }]
  }

  const tabShowInstalls = {
    type: "view",
    props: {
      bgcolor: utils.themeColor.bgcolor,
    },
    views: [{
        type: "label",
        props: {
          id: "tabShowInstalls",
          text: "安装量统计",
          textColor: utils.themeColor.listContentTextColor,
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
          textColor: utils.themeColor.appCateTextColor,
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
  },
  {
    templateTitle: {
      text : "分享︎︎给朋友",
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

  let fuctionArray = [{
    templateTitle: {
      text : "主题设置",
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
        id: "melist",
        bgcolor: $color("clear"),
        template: feedBackTemplate,
        indicatorInsets: $insets(45, 0, 50, 0),
        separatorColor: utils.themeColor.separatorColor,
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
              textColor: utils.themeColor.listHeaderTextColor,
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
              textColor: utils.themeColor.appCateTextColor,
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
          title: "功能",
          rows: fuctionArray,
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
              case 2: (utils.getCache("authPass"))?setupThemeSettingView():genWxWelcomView();break;
              case 5: update.checkUpdate(true);break;
              case 6: setupFeedBack();break;
              case 7: setupReward();break;
              case 8: share("http://t.cn/AiNM3N1T");break;
              default:break;
            }
          }
        },
        didScroll: function(sender) {
          if(sender.contentOffset.y >= 5 + topOffset && $("mePageHeaderView").alpha == 0) {
            $ui.animate({
              duration: 0.2,
              animation: function() {
                $("mePageHeaderView").alpha = 1;
              },
            });
          } else if(sender.contentOffset.y < 5 + topOffset && $("mePageHeaderView").alpha == 1) {
            $ui.animate({
              duration: 0.2,
              animation: function() {
                $("mePageHeaderView").alpha = 0;
              },
            });
          }
          if(sender.contentOffset.y >= 40 + topOffset && $("mePageHeaderLabel").hidden === true) {
            $("mePageHeaderLabel").hidden = false
            $("mePageHeaderBlur").bgcolor = $color("clear")
            $("meListHeaderTitle").hidden = true
          } else if(sender.contentOffset.y < 40 + topOffset && $("mePageHeaderLabel").hidden === false) {
            $("mePageHeaderLabel").hidden = true
            $("mePageHeaderBlur").bgcolor = utils.themeColor.mainColor
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
        id: "mePageHeaderView",
        hidden: false,
        alpha: 0,
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
          style: utils.themeColor.blurType, // 0 ~ 5
          bgcolor: utils.themeColor.mainColor,
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
            textColor: utils.themeColor.listHeaderTextColor,
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

function setupThemeSettingView() {
  $ui.push({
    props: {
      id: "themeSettingViewParent",
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
    },
    views: [genThemeSettingView()]
  })
}

function refreshAllTheme(delay) {
  $delay(delay?delay:0, ()=>{
    setThemeColor()
    if($("mainView")) {
      $("mainView").remove()
      $("mainViewParent").add(genMainView())
      // $("mainViewParent").$statusBarStyle(utils.themeColor.statusBarStyle)
      // $("mainViewParent").bgcolor = utils.themeColor.mainColor
      // $objc("UIApplication").$setStatusBarStyle(utils.themeColor.statusBarStyle)
    }
    if($("themeSettingView")) {
      $("themeSettingView").remove()
      $("themeSettingViewParent").add(genThemeSettingView())
      // $objc("UIApplication").$setStatusBarStyle(utils.themeColor.statusBarStyle)
      // $("themeSettingViewParent").statusBarStyle = utils.themeColor.statusBarStyle
      // $("themeSettingViewParent").bgcolor = utils.themeColor.mainColor
    }
  })
}

function genThemeSettingView() {
  let tabDarkMode = {
    type: "view",
    props: {
      bgcolor: utils.themeColor.mainColor,
    },
    layout: $layout.fill,
    views: [{
        type: "label",
        props: {
          text: "暗色模式",
          textColor: utils.themeColor.listContentTextColor,
        },
        layout: function(make, view) {
          make.left.inset(20)
          make.centerY.equalTo(view.super)
        }
      },{
        type: "switch",
        props: {
          onColor: $color(utils.mColor.iosGreen),
          on: utils.getCache("darkMode"),
        },
        layout: function(make, view) {
          make.right.inset(20)
          make.centerY.equalTo(view.super)
        },
        events: {
          changed: function(sender) {
            $cache.set("darkMode", sender.on)
            refreshAllTheme(0.05)
          }
        }
      }
    ],
  }
  let tabDarkModeAuto = {
    type: "view",
    props: {
      bgcolor: utils.themeColor.bgcolor,
    },
    layout: $layout.fill,
    views: [{
        type: "label",
        props: {
          text: "根据亮度自动变换主题",
          textColor: utils.themeColor.listContentTextColor,
        },
        layout: function(make, view) {
          make.left.inset(20)
          make.centerY.equalTo(view.super)
        }
      },{
        type: "switch",
        props: {
          onColor: $color(utils.mColor.iosGreen),
          on: utils.getCache("darkModeAuto"),
        },
        layout: function(make, view) {
          make.right.inset(20)
          make.centerY.equalTo(view.super)
        },
        events: {
          changed: function(sender) {
            $cache.set("darkModeAuto", sender.on)
            refreshAllTheme(0.05)
          }
        }
      }
    ],
  }
  let tabThemeColor = {
    type: "view",
    props: {
      bgcolor: utils.themeColor.bgcolor,
    },
    layout: $layout.fill,
    views: [{
        type: "label",
        props: {
          text: "主题颜色",
          textColor: utils.themeColor.listContentTextColor,
        },
        layout: function(make, view) {
          make.left.inset(20)
          make.centerY.equalTo(view.super)
        }
      },{
        type: "image",
        props: {
          src: "assets/enter.png",
          bgcolor: $color("clear"),
        },
        layout: function(make, view) {
          make.right.inset(20)
          make.centerY.equalTo(view.super)
          make.size.equalTo($size(8, 18))
        },
      },{
        type: "view",
        props: {
          circular: true,
          borderColor: utils.themeColor.iconBorderColor,
          borderWidth: 1,
          bgcolor: utils.getCache("themeColor"),
        },
        layout: function(make, view) {
          make.right.equalTo(view.prev.left).inset(20)
          make.centerY.equalTo(view.super)
          make.size.equalTo($size(20, 20))
        },
      }
    ],
  }
  let themeSettingView = {
    type: "view",
    props: {
      id: "themeSettingView",
      bgcolor: utils.themeColor.mainColor,
    },
    layout: $layout.fill,
    views: [ui.genPageHeader("主页", "主题设置"), {
      type: "list",
      props: {
        bgcolor: $color("clear"),
        template: [],
        indicatorInsets: $insets(45, 0, 50, 0),
        separatorColor: utils.themeColor.separatorColor,
        itemHeight: 50,
        data: [{
          type: "view",
          props: {
            bgcolor: utils.themeColor.bgcolor,
          },
          layout: $layout.fill,
        },tabDarkMode,tabDarkModeAuto,tabThemeColor],
      },
      layout: function(make, view) {
        make.top.equalTo(view.prev.bottom)
        make.left.right.bottom.inset(0)
      },
      events: {
        didSelect: function(sender, indexPath, title) {
          switch(indexPath.row + indexPath.section) {
            case 3: showColorSelectView($("themeSettingView"));break;
            default:break;
          }
        }
      }
    }]
  }
  return themeSettingView;
}

function showColorSelectView(superView) {
  let windowWidth = 400
  let itemColors = []
  let colors = [utils.mColor.blue, "#F83B4C", "#FF7519", "#EBA239", "#29B327", "#00C2ED", "#7748FE", "#FF5DA2"]
  let selectedColor = utils.getCache("themeColor")
  for(let i = 0; i < colors.length; i++) {
    itemColors.push({
      itemColor: {
        bgcolor: $color(colors[i]),
      },
      colorSelect: {
        hidden: selectedColor.hexCode.toUpperCase() != colors[i].toUpperCase(),
      }
    })
  }
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
        bgcolor: utils.themeColor.actionSheetBgColor,
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
        bgcolor: $color("clear"),
      },
      layout: function(make, view) {
        make.height.equalTo(270)
        if(superView.frame.width > windowWidth) {
          make.width.equalTo(windowWidth)
        } else {
          make.width.equalTo(view.super)
        }
        make.centerX.equalTo(view.super)
        make.top.equalTo(view.super.bottom)
      },
      views: [{
        type: "view",
        props: {
          bgcolor: utils.themeColor.mainColor,
          radius: 15,
        },
        layout: function(make, view) {
          make.height.equalTo(view.super).multipliedBy(0.73)
          make.left.right.inset(15)
          make.centerX.equalTo(view.super)
          make.top.inset(0)
        },
        views: [{
          type: "label",
          props: {
            text: "选择主题颜色",
            textColor: utils.themeColor.listContentTextColor,
            font: $font("bold", 16),
            align: $align.center,
          },
          layout: function(make, view) {
            make.top.inset(15)
            make.centerX.equalTo(view.super)
            make.height.equalTo(23)
            make.width.equalTo(view.super)
          }
        },{
          type: "matrix",
          props: {
            columns: 4,
            itemHeight: 58,
            spacing: 8,
            scrollEnabled: false,
            bgcolor: $color("clear"),
            template: [{
                type: "view",
                props: {
                  id: "itemColor",
                  circular: true,
                  borderWidth: 0,
                  bgcolor: utils.getCache("themeColor"),
                },
                layout: function(make, view) {
                  make.centerX.equalTo(view.super)
                  make.width.height.equalTo(54)
                  make.top.inset(7)
                },
                views: [{
                  type: "view",
                  props: {
                    id: "colorSelect",
                    hidden: true,
                  },
                  layout: function(make, view) {
                    make.center.equalTo(view.super)
                    make.height.equalTo(view.super).multipliedBy(0.3)
                    make.width.equalTo(view.super).multipliedBy(0.4)
                  },
                  views: [ui.createRight($color("white"), 2.5)]
                }],
              },
            ],
            data: itemColors,
          },
          events: {
            didSelect: function(sender, indexPath, data) {
              for(let i = 0; i < itemColors.length; i++) {
                itemColors[i].colorSelect.hidden = true
              }
              itemColors[indexPath.row].colorSelect.hidden = false
              sender.data = itemColors
              $cache.set("themeColor", $color(colors[indexPath.row]));
              $delay(0.1, ()=>{
                hideView()
              })
              setThemeColor()
              refreshAllTheme(0.12)
            }
          },
          layout: function(make, view) {
            make.top.equalTo(view.prev.bottom).inset(5)
            make.bottom.inset(10)
            make.centerX.equalTo(view.super)
            make.left.right.inset(20)
          }
        }]
      },{
        type: "view",
        props: {
          bgcolor: utils.themeColor.mainColor,
          radius: 15,
        },
        layout: function(make, view) {
          make.left.right.inset(15)
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(10)
          make.bottom.inset(10)
        },
        views: [{
          type: "button",
          props: {
            borderWidth: 0,
            bgcolor: $color("clear"),
            titleColor: utils.getCache("themeColor"),
            font: $font(18),
            title: "Cancel",
          },
          layout: function(make, view) {
            make.center.equalTo(view.super)
            make.size.equalTo(view.super)
          },
          events: {
            tapped: function(sender) {
              hideView()
            }
          }
        }]
      }],
    }],
  })
  $("windowView").relayout()
  $("windowView").remakeLayout(function(make) {
    make.height.equalTo(270)
    if(superView.frame.width > windowWidth) {
      make.width.equalTo(windowWidth)
    } else {
      make.width.equalTo(superView)
    }
    make.centerX.equalTo(superView)
    make.bottom.inset(0)
  })
  $ui.animate({
    duration: 0.15,
    animation: () => {
      $("infoView").alpha = 1
    }
  })
  $ui.animate({
    delay: 0.1,
    duration: 0.25,
    velocity: 1,
    animation: () => {
      $("windowView").relayout()
    }
  })
  function hideView() {
    $("windowView").remakeLayout(function(make) {
      make.height.equalTo(270)
      if(superView.frame.width > windowWidth) {
        make.width.equalTo(windowWidth)
      } else {
        make.width.equalTo($("infoView"))
      }
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
        if($("infoView")) {
          $("infoView").remove();
        }
      }
    });
  }
}

function genWxWelcomView() {
  let authSucces = false
  $ui.push({
    props: {
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
    views: [ui.genPageHeader("主页", "解锁功能"), {
      type: "scroll",
      props: {
        bgcolor: $color("clear"),
      },
      layout: function(make, view) {
        make.top.equalTo(view.prev.bottom)
        make.left.right.bottom.inset(0)
      },
      views: [{
        type: "gallery",
        props: {
          items: [
            {
              type: "image",
              props: {
                src: "assets/show2.jpg",
                contentMode: $contentMode.scaleAspectFit,
              }
            },
          ],
          interval: 4,
          radius: 5.0
        },
        layout: function(make, view) {
          make.left.right.inset(10)
          make.centerX.equalTo(view.super)
          make.top.inset(30)
          make.height.equalTo(200)
        }
      },{
        type: "label",
        props: {
          id: "welcomeDetailLabel",
          text: "关注微信公众号「纵享派」即可解锁主题设置，感谢你对作者辛苦开发和维护的支持 :)",
          font: $font("bold", 20),
          align: $align.center,
          lines: 0,
        },
        layout: function(make, view) {
          make.left.right.inset(20)
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(30)
        },
      },{
        type: "view",
        props: {
          id: "showWindow",
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          make.centerX.equalTo(view.super)
          make.width.equalTo(200)
          make.height.equalTo(40)
        },
        views: []
      },{
        type: "button",
        props: {
          id: "subscribeButton",
          title: "关注以继续使用",
          circular: true,
          titleColor: $color("white"),
          bgcolor: $color("#00CC7A"),
          font: $font("bold", 15),
        },
        layout: function(make, view) {
          make.width.equalTo(220)
          make.centerX.equalTo(view.super)
          make.height.equalTo(50)
          make.top.equalTo(view.prev.bottom).inset(30)
        },
        events: {
          tapped: function(sender) {
            if(!authSucces) {
              $ui.alert({
                title: "提示",
                message: "下载二维码图片或复制公众号名并跳转到微信，只需选择图片或者搜索即可关注公众号。",
                actions: [
                  {
                    title: "下载二维码",
                    handler: function() {
                      gotoWxScan()
                    }
                  },
                  {
                    title: "复制公众号名",
                    handler: function() {
                      gotoWx()
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
              $ui.pop();
              $cache.set("authPass", true);
              setupThemeSettingView()
            }
          }
        },
      },{
        type: "button",
        props: {
          title: "我已关注",
          circular: true,
          titleColor: $color("#a2a2a2"), //#3478f7
          bgcolor: $color("white"),
          font: $font("bold", 13),
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          make.centerX.equalTo(view.super)
          make.width.equalTo(100)
          make.height.equalTo(30)
        },
        events: {
          tapped: function(sender) {
            if(!$("nicknameInput")) {
              $("showWindow").add({
                type: "view",
                props: {
                  id: "inputParent",
                },
                layout: $layout.fill,
                views:[{
                  type: "input",
                  props: {
                    id: "nicknameInput",
                    borderColor: $color("#00CC7A"),
                    borderWidth: 3,
                    bgcolor: $color("white"),
                    tintColor: $color("#00CC7A"),
                    placeholder: "输入你的微信用户昵称",
                    font: $font("bold", 13),
                  },
                  layout: function(make, view) {
                    make.center.equalTo(view.super)
                    make.height.equalTo(32)
                    make.width.equalTo(150)
                  },
                  events: {
                    returned: function(sender) {
                      sender.blur()
                    },
                    didEndEditing: function(sender) {
                      detectNickname(sender.text)
                    }
                  }
                },{
                  type: "image",
                  props: {
                    id: "toastIcon",
                    bgcolor: $color("clear"),
                    icon: null,
                  },
                  layout: function(make, view) {
                    make.centerY.equalTo(view.super)
                    make.size.equalTo($size(20, 20))
                    make.left.equalTo(view.prev.right).inset(5)
                  },
                  events: {
                    tapped: function(sender) {
                      if(!authSucces && sender.icon) {
                        if($("nicknameInput").text.indexOf("&") >= 0) {
                          $ui.alert({
                            title: "提示",
                            message: "昵称中含有 & 符号，请在公众号后台联系开发者",
                          });
                        } else {
                          $ui.alert({
                            title: "提示",
                            message: "待开发者审核，请在公众号后台发送你的微信昵称以通过审核，请耐心等待，注意是昵称不是微信号",
                          });
                        }
                      }
                    }
                  }
                }]
              })
            }
            $("nicknameInput").focus()
          }
        },
      }]
    }],
  })
  function detectNickname(nickname) {
    if(nickname.length <= 0 && $("toastIcon")) {
      $("toastIcon").icon = null
      authSucces = false
      return 0
    }
    if($("toastIcon")) {
      $("toastIcon").icon = $icon("162", $color("gray"), $size(20, 20))
    }
    let url = "https://avoscloud.com/1.1/classes/fansList?where={\"nickname\":\"" + nickname + "\"}"
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
        if(data && data.length > 0) {
          if($("toastIcon")) {
            $("toastIcon").icon = $icon("064", $color("#00CC7A"), $size(20, 20))
            authSucces = true
            $("subscribeButton").bgcolor = $color("#3478f7");
            $("subscribeButton").title = "开始使用"
            regisiter(data[0].objectId)
          }
        } else {
          if($("toastIcon")) {
            $("toastIcon").icon = $icon("009", $color("gray"), $size(20, 20))
            authSucces = false
          }
        }
      }
    })
  }
  function gotoWxScan() {
    $("showWindow").add({
      type: "spinner",
      props: {
        id: "loadingView",
        loading: true,
      },
      layout: function(make, view) {
        make.center.equalTo(view.super)
      }
    })
    $http.download({
      url: "https://github.com/LiuGuoGY/JSBox-addins/raw/master/resources/OfficialAccountQr.jpg",
      handler: function(resp) {
        $photo.save({
          data: resp.data,
          handler: function(success) {
            if($("loadingView")) {
              $("loadingView").remove()
            }
            if (success) {
              $app.openURL("weixin://scanqrcode")
            }
          }
        })
      }
    })
  }
  function gotoWx() {
    $clipboard.text = "纵享派"
    $app.openURL("weixin://")
  }  
  function regisiter(objectId) {
    $http.request({
      method: "PUT",
      url: "https://avoscloud.com/1.1/classes/fansList/" + objectId,
      timeout: 5,
      header: {
        "Content-Type": "application/json",
        "X-LC-Id": "Ah185wdqs1gPX3nYHbMnB7g4-gzGzoHsz",
        "X-LC-Key": "HmbtutG47Fibi9vRwezIY2E7",
      },
      body: {
        deviceId: {
          __op: "AddUnique",
          objects: [$objc("FCUUID").invoke("uuidForDevice").rawValue()],
        }
      },
      handler: function(resp) {
      }
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
        ui.showToastView($("mainView"), utils.mColor.blue, "感谢您的分享")
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
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
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
  const rewardTemplate = {
    type: "view",
    props: {
      bgcolor: $color("clear"),
    },
    layout: $layout.fill,
    views: [{
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
  }
  let array = $cache.get("rewardList")
  if(array == undefined) {
    array = []
  }
  $ui.push({
    props: {
      id: "rewardMainView",
      title: "支持与赞赏",
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
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
    views: [ui.genPageHeader("主页", "支持与赞赏"), {
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
          textColor: utils.themeColor.listContentTextColor,
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
          tintColor: utils.themeColor.listContentTextColor,
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
              case 0: $app.openURL("https://qr.alipay.com/fkx050667bqnzgnmfyqod4d")
                break
              case 1: $app.openURL("https://qr.alipay.com/fkx095547lpjdisvgwkvzbc")
                break
              case 2: $app.openURL("https://qr.alipay.com/fkx04580mfavvdvwdwetd29")
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
          textColor: utils.themeColor.appHintColor,
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
          textColor: utils.themeColor.appHintColor,
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
    url: "https://raw.githubusercontent.com/LiuGuoGY/JSBox-addins/master/erots-res/" + PicWay + "_reward_" + PicMoney + ".JPG",
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
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
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
    views: [ui.genPageHeader("主页", "反馈建议"), {
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
              textColor: utils.themeColor.listContentTextColor,
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
              textColor: utils.themeColor.appObviousColor,
              font: $font(15),
              borderColor: $rgba(90, 90, 90, 0.6),
              borderWidth: 1,
              insets: $insets(5, 5, 5, 5),
              alwaysBounceVertical: true,
              bgcolor: $color("clear"),
              darkKeyboard: utils.themeColor.darkKeyboard,
              tintColor: utils.getCache("themeColor"),
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
              textColor: utils.themeColor.listContentTextColor,
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
              textColor: utils.themeColor.appObviousColor,
              font: $font(15),
              borderColor: $rgba(90, 90, 90, 0.6),
              borderWidth: 1,
              insets: $insets(5, 5, 5, 5),
              radius: 5,
              align: $align.center,
              bgcolor: $color("clear"),
              darkKeyboard: utils.themeColor.darkKeyboard,
              tintColor: utils.getCache("themeColor"),
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
              bgcolor: utils.themeColor.commentBgColor,
              titleColor: utils.getCache("themeColor"),
              font: $font("bold", 16),
              radius: 12,
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
              textColor: utils.themeColor.appHintColor,
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
    url: "https://avoscloud.com/1.1/classes/App?limit=1000&order=-updateTime,-updatedAt",
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
          let localName = (installedApps[j].localName.endsWith(".js"))?installedApps[j].localName.slice(0, -3):installedApps[j].localName;
          if(apps[i].objectId === installedApps[j].id && apps[i].appName == localName) {
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
      let query = $context.query
      if(query) {
        switch(query.q) {
          case "show":
            appItemView.show(query.objectId);
            break;
          default:break;
        }
      }
    }
  })
}

function getCloudAppDisplaySource() {
  let cloudApps = utils.getCache("cloudApps", [])
  let onstoreApps = []
  for(let i = 0; i < cloudApps.length; i++) {
    if(cloudApps[i].onStore) {
      onstoreApps.push(cloudApps[i]);
    }
  }
  let results = []
  if(searchText != "") {
    for(let i = 0; i < onstoreApps.length; i++) {
      if(onstoreApps[i].appName.toLowerCase().indexOf(searchText.toLowerCase()) >= 0 || onstoreApps[i].author.toLowerCase().indexOf(searchText.toLowerCase()) >= 0 || onstoreApps[i].subtitle.toLowerCase().indexOf(searchText.toLowerCase()) >= 0 || onstoreApps[i].instruction.toLowerCase().indexOf(searchText.toLowerCase()) >= 0) {
        results.push(onstoreApps[i])
      }
    }
    return results;
  } else {
    return onstoreApps;
  }
}

function requireReward() {
  $http.request({
    method: "GET",
    url: "https://avoscloud.com/1.1/classes/Reward",
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
    url: "https://avoscloud.com/1.1/installations?count=1&limit=0",
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
      url: "https://avoscloud.com/1.1/installations",
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

function sendFeedBack(text, contact) {
  $http.request({
    method: "POST",
    url: "https://avoscloud.com/1.1/feedback",
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
    let url = "https://avoscloud.com/1.1/classes/list?where={\"deviceToken\":\"" + $objc("FCUUID").invoke("uuidForDevice").rawValue() + "\"}"
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