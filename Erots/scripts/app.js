let ui = require('scripts/ui')
let utils = require('scripts/utils')
let update = require('scripts/update')
let uploadView = require('scripts/upload-view')
let logUpView = require('scripts/login-view')
let user = require('scripts/user')
let userCenterView = require('scripts/user-center')
let appItemView = require('scripts/app-itemview')
let api = require('scripts/api')
let appUtils = require('scripts/app-utils')
const groups = require("./groups");

let topOffset = -20
let searchText = ""
let query = $context.query;

const mIconSymbols = ["square.grid.2x2.fill", "bag.fill", "square.and.arrow.down.fill", "person.fill"]

function show() {
  uploadInstall()
  checkBlackList()
  if (!utils.getCache("haveBanned", false)) {
    main()
  } else {
    ui.showBannedAlert()
  }
  update.checkUpdate();
}

function main() {
  setupMainView()
  solveQuery()
  showAnnouncement()
}

$app.listen({
  refreshAll: function (object) {
    refreshAllView(object.except)
  },
  requireCloud: async function () {
    await api.requireApps();
    refreshAllView()
  },
});

let contentViews = ["cloudView", "exploreView", "updateView", "meView"];

function setThemeColor() {
  if (utils.getThemeMode() == "dark") {
    utils.themeColor = utils.tColor.dark;
    $cache.set("themeColor", utils.getCache("darkThemeColor"));
    $app.theme = "dark";
  } else {
    utils.themeColor = utils.tColor.light;
    $cache.set("themeColor", utils.getCache("lightThemeColor"));
    $app.theme = "light";
  }
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
  if (user.haveLogined()) {
    let apps = utils.getCache("cloudApps", [])
    showNewCommentNumber(apps)
  }
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
      layout: function (make, view) {
        make.width.equalTo(view.super)
        make.left.right.inset(0)
        make.bottom.inset(0)
        make.top.inset(0)
      },
      events: {
        ready(sender) {
          $delay(0.1, () => {
            if ($("cloudAppsList")) {
              topOffset = $("cloudAppsList").contentOffset.y
            }
          })
        },
      },
      views: [genCloudView()],
    },
    {
      type: "view",
      layout: function (make, view) {
        if ($device.info.version >= "11") {
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
      }, {
        type: "matrix",
        props: {
          id: "tab",
          columns: 4,
          itemHeight: 50,
          spacing: 0,
          scrollEnabled: false,
          bgcolor: $color("clear"),
          template: [{
            type: "view",
            layout: function (make, view) {
              make.size.equalTo(view.super)
              make.center.equalTo(view.super)
            },
            views: [{
              type: "image",
              props: {
                id: "menu_image",
                resizable: true,
                clipsToBounds: false,
              },
              layout: function (make, view) {
                make.centerX.equalTo(view.super)
                make.size.equalTo($size(25, 25))
                make.top.inset(6)
              },
            },
            {
              type: "label",
              props: {
                id: "menu_label",
                font: $font(10),
              },
              layout: function (make, view) {
                var preView = view.prev
                make.centerX.equalTo(preView)
                make.bottom.inset(5)
              }
            }]
          }],
          data: [{
            menu_image: {
              symbol: mIconSymbols[0],
              tintColor: utils.getCache("themeColor"),
            },
            menu_label: {
              text: "应用",
              textColor: utils.themeColor.mainTabGrayColor
            }
          },{
            menu_image: {
              symbol: mIconSymbols[1],
              tintColor: utils.themeColor.mainTabGrayColor,
            },
            menu_label: {
              text: "探索",
              textColor: utils.themeColor.mainTabGrayColor,
            }
          },{
            menu_image: {
              symbol: mIconSymbols[2],
              tintColor: utils.themeColor.mainTabGrayColor,
            },
            menu_label: {
              text: "更新",
              textColor: utils.themeColor.mainTabGrayColor
            }
          },{
            menu_image: {
              symbol: mIconSymbols[3],
              tintColor: utils.themeColor.mainTabGrayColor,
            },
            menu_label: {
              text: "我的",
              textColor: utils.themeColor.mainTabGrayColor
            }
          }],
        },
        layout: function (make, view) {
          make.top.inset(0)
          if ($device.info.screen.width > 500) {
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
    }, {
      type: "canvas",
      layout: function (make, view) {
        var preView = view.prev
        make.top.equalTo(preView.top)
        make.height.equalTo(1 / $device.info.screen.scale)
        make.left.right.inset(0)
      },
      events: {
        draw: function (view, ctx) {
          var width = view.frame.width
          var scale = $device.info.screen.scale
          ctx.strokeColor = $color("gray")
          ctx.setLineWidth(1 / scale)
          ctx.moveToPoint(0, 0)
          ctx.addLineToPoint(width, 0)
          ctx.strokePath()
        }
      }
    },{
      type: "view",
      props: {
        hidden: !utils.isVoiceOverRunning(),
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
        type: "view",
        layout: function (make, view) {
          make.left.bottom.right.inset(0)
          make.height.equalTo(45)
        },
        views: [{
          type: "button",
          props: {
            bgcolor: $color("clear"),
          },
          layout: function (make, view) {
            make.left.inset(0)
            make.width.equalTo(100)
            make.height.equalTo(view.super)
          },
          events: {
            tapped: function (sender) {
              $app.close()
            },
          },
          views: [{
            type: "view",
            props: {
              bgcolor: $color("clear"),
            },
            layout: function (make, view) {
              make.left.inset(10)
              make.centerY.equalTo(view.super)
              make.size.equalTo($size(12.5, 21))
            },
            views: [ui.createBack(utils.getCache("themeColor"))]
          }, {
            type: "label",
            props: {
              text: "JSBox",
              align: $align.center,
              textColor: utils.getCache("themeColor"),
              font: $font(17)
            },
            layout: function (make, view) {
              make.height.equalTo(view.super)
              make.left.equalTo(view.prev.right).inset(3)
            }
          }],
        }],
      },],
    }]
  }
  return mainView;
}

function handleSelect(view, row) {
  let newData = view.data
  for (let i = 0; i < newData.length; i++) {
    if (i == row) {
      newData[i].menu_label.textColor = utils.getCache("themeColor")
      newData[i].menu_image.symbol = mIconSymbols[i]
      newData[i].menu_image.tintColor = utils.getCache("themeColor")
      if ($(contentViews[i]) == undefined) {
        $("content").add(getContentView(i))
      }
      $(contentViews[i]).hidden = false
    } else {
      newData[i].menu_label.textColor = utils.themeColor.mainTabGrayColor
      newData[i].menu_image.symbol = mIconSymbols[i]
      newData[i].menu_image.tintColor = utils.themeColor.mainTabGrayColor
      if ($(contentViews[i]) != undefined) {
        $(contentViews[i]).hidden = true
      }
    }
  }
  view.data = newData
}

function getContentView(number) {
  switch (number) {
    case 0: 
      return genCloudView();
    case 1:
      return genExploreView();
    case 2:
      return genUpdateView();
    case 3:
      return genMeView();
  }
}

function genUpdateView() {
  let view = {
    type: "view",
    props: {
      id: "updateView",
      hidden: true,
    },
    layout: $layout.fill,
    views: [{
      type: "view",
      props: {
        id: "updateAppListParent",
      },
      layout: function (make, view) {
        make.width.equalTo(view.super)
        make.top.inset(0)
        make.bottom.inset(0)
        make.centerX.equalTo(view.super)
      },
      views: [genUpdateAppListView()]
    }, {
      type: "view",
      props: {
        id: "updatePageHeaderView",
        hidden: false,
        alpha: 0,
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
          id: "updatePageHeaderBlur",
          style: utils.themeColor.blurType, // 0 ~ 5
          bgcolor: utils.themeColor.mainColor,
        },
        layout: $layout.fill,
      }, {
        type: "view",
        props: {},
        layout: function (make, view) {
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
      hidden: true,
    },
    layout: $layout.fill,
    views: [{
      type: "view",
      props: {
        id: "exploreAppListParent",
      },
      layout: function (make, view) {
        make.width.equalTo(view.super)
        make.top.inset(0)
        make.bottom.inset(0)
        make.centerX.equalTo(view.super)
      },
      views: [ui.genLoadingView("exploreLoading")] //genExploreAppListView()
    }, {
      type: "view",
      props: {
        id: "explorePageHeaderView",
        hidden: false,
        alpha: 0,
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
          id: "explorePageHeaderBlur",
          style: utils.themeColor.blurType, // 0 ~ 5
          bgcolor: utils.themeColor.mainColor,
        },
        layout: $layout.fill,
      }, {
        type: "view",
        props: {},
        layout: function (make, view) {
          make.left.bottom.right.inset(0)
          make.height.equalTo(45)
        },
        views: [{
          type: "label",
          props: {
            id: "explorePageHeaderLabel",
            text: "探索",
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
  $delay(0, async function() {
    await api.getExploreApps();
    if($("exploreLoading")) {
      $("exploreLoading").remove()
    }
    $("exploreAppListParent").add(genExploreAppListView())
  });
  return view
}

function genExploreAppListView() {
  let exploreInfos = utils.getCache("ExploreInfos", []);
  let cloudApps = utils.getCache("cloudApps", [])
  let bannerViewItems = []
  for(let i = 0; i < exploreInfos.length; i++) {
    if(!exploreInfos[i].show) {
      continue;
    } else {
      let ids = exploreInfos[i].appIds;
      let apps = []
      for(let z = 0; z < cloudApps.length; z++) {
        for(let j = 0; j < ids.length; j++) {
          if(ids[j] == cloudApps[z].objectId && cloudApps[z].onStore) {
            apps.push(cloudApps[z]);
          }
        }
      }
      bannerViewItems.push(genBannerView(exploreInfos[i].title, apps));
    }
  }
  
  let exploreView = {
    type: "list",
    props: {
      id: "exploreAppsList",
      template: [],
      bgcolor: $color("clear"),
      indicatorInsets: $insets(40, 0, 50, 0),
      indicatorStyle: utils.themeColor.indicatorStyle,
      separatorInset: $insets(0, 85, 0, 15),
      separatorColor: $color("systemSeparator"),
      separatorHidden: true,
      header: {
        type: "view",
        props: {
          height: 95,
        },
        views: [{
          type: "label",
          props: {
            id: "exploreListHeaderTitle",
            text: "探索",
            font: $font("Avenir-Black", 35),
            textColor: utils.themeColor.listHeaderTextColor,
            align: $align.center,
            indicatorInsets: $insets(45, 0, 50, 0),
          },
          layout: function (make, view) {
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
      rowHeight: 290,
      data: [{
        rows: bannerViewItems,
      }],
    },
    layout: $layout.fill,
    events: {
      didScroll: function (sender) {
        if (sender.contentOffset.y >= 5 + topOffset && $("explorePageHeaderView").alpha == 0) {
          $ui.animate({
            duration: 0.2,
            animation: function () {
              $("explorePageHeaderView").alpha = 1;
            },
          });
        } else if (sender.contentOffset.y < 5 + topOffset && $("explorePageHeaderView").alpha == 1) {
          $ui.animate({
            duration: 0.2,
            animation: function () {
              $("explorePageHeaderView").alpha = 0;
            },
          });
        }
        if (sender.contentOffset.y >= 45 + topOffset && $("explorePageHeaderLabel").hidden === true) {
          $("explorePageHeaderLabel").hidden = false
          $("explorePageHeaderBlur").bgcolor = $color("clear")
          $("exploreListHeaderTitle").hidden = true
        } else if (sender.contentOffset.y < 45 + topOffset && $("explorePageHeaderLabel").hidden === false) {
          $("explorePageHeaderLabel").hidden = true
          $("explorePageHeaderBlur").bgcolor = utils.themeColor.mainColor
          $("exploreListHeaderTitle").hidden = false
        } else if (sender.contentOffset.y <= topOffset) {
          let size = 35 - sender.contentOffset.y * 0.04
          if (size > 40)
            size = 40
          $("exploreListHeaderTitle").font = $font("Avenir-Black", size)
        }
      }
    }
  }
  return exploreView
}

function genBannerView(title, apps) {
  let appsListViewItems = genAppListItemView(apps, "exploreAppsList", true);
  let number = apps.length;
  let rows = 3;
  let columns = Math.ceil(number / rows);
  let bannerContent = [];
  let leftView;
  for(let i = 0; i < columns; i++) {
    let topView;
    for(let y = 0; y < rows; y++) {
      if (i * rows + y < number) {
        bannerContent.push({
          type: "view",
          views:[appsListViewItems[i * rows + y]],
          layout: function(make, view) {
            if(topView) {
              make.top.equalTo(topView.bottom);
            } else {
              make.top.inset(0)
            }
            if(leftView) {
              make.left.equalTo(leftView.right).inset(10);
            } else {
              make.left.inset(0)
            }
            make.width.equalTo($device.info.screen.width - 30);
            make.height.equalTo(80)
            if(y == rows - 1) {
              leftView = view
            }
            topView = view
          },
          events: {
            tapped: function(sender) {
              if (sender.views[0].info) {
                appItemView.show(sender.views[0].info);
              }
            }
          }
        })
      }
    }
  }
  let contentWidth = columns * ($device.info.screen.width - 20);
  let view = {
    type: "view",
    props: {
      bgcolor: $color("clear"),
    },
    layout: $layout.fill,
    views: [{
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
          text: title,
          font: $font("bold", 22),
          textColor: utils.themeColor.listHeaderTextColor,
          bgcolor: $color("clear"),
          align: $align.center,
        },
        layout: function (make, view) {
          make.left.inset(15)
          make.centerY.equalTo(view.super)
        },
      }, {
        type: "button",
        props: {
          title: "查看全部",
          titleColor: utils.getCache("themeColor"),
          bgcolor: $color("clear"),
          font: $font(17),
          hidden: (apps.length <= 3),
        },
        layout: function (make, view) {
          make.right.inset(15)
          make.centerY.equalTo(view.super)
        },
        events: {
          tapped: function (sender) {
            genNewPageAppListView(title, "主页", apps);
          }
        }
      }]
    },{
      type: "scroll",
      props: {
        alwaysBounceHorizontal: true,
        alwaysBounceVertical: false,
        userInteractionEnabled: true,
        showsHorizontalIndicator: false,
        showsVerticalIndicator: false,
        clipsToBounds: false,
        pagingEnabled: true,
        contentSize: $size(contentWidth, 240),
      },
      layout: function(make, view) {
        make.top.equalTo(view.prev.bottom)
        make.left.inset(15)
        make.right.inset(5)
        make.height.equalTo(240)
      },
      views: bannerContent
    }]
  }
  return view
}

function genNewPageAppListView(pageName, returnName, apps) {
  let appsListViewItems = genAppListItemView(apps, "newPageAppsList");
  $ui.push({
    props: {
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
    },
    views: [ui.genPageHeader(returnName, pageName), {
      type: "list",
      props: {
        bgcolor: $color("clear"),
        // indicatorInsets: $insets(40, 0, 50, 0),
        indicatorStyle: utils.themeColor.indicatorStyle,
        separatorColor: $color("systemSeparator"),
        separatorInset: $insets(0, 85, 0, 15),
        separatorHidden: false,
        header: {
          type: "view",
          props: {
            height: 10,
          },
        },
        footer: {
          type: "view",
          props: {
            height: 45,
          },
        },
        data: appsListViewItems,
        rowHeight: 80,
      },
      layout: function (make, view) {
        make.top.equalTo(view.prev.bottom)
        make.left.right.bottom.inset(0)
      },
      events: {
        didSelect: function (sender, indexPath, data) {
          if (data.props.info) {
            appItemView.show(data.props.info);
          }
        }
      }
    }]
  })
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
      layout: function (make, view) {
        make.width.equalTo(view.super)
        make.top.inset(0)
        make.bottom.inset(0)
        make.centerX.equalTo(view.super)
      },
      views: [genCloudAppListView()]
    }, {
      type: "view",
      props: {
        id: "cloudPageHeaderView",
        hidden: false,
        alpha: 0,
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
          id: "cloudPageHeaderBlur",
          style: utils.themeColor.blurType, // 0 ~ 5
          bgcolor: utils.themeColor.mainColor,
        },
        layout: $layout.fill,
      }, {
        type: "view",
        props: {},
        layout: function (make, view) {
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
      layout: function (make, view) {
        make.centerY.equalTo(view.super)
        make.right.inset(0).offset(55)
        make.size.equalTo($size(55, 35))
      },
      events: {
        tapped: function (sender) {
          let input = $("search_input")
          input.text = ""
          $("search_hint").hidden = false
          $delay(0.2, () => {
            if (searchText !== "") {
              searchText = ""
              refreshAllView()
            }
          })
          if ($("noSearchItemView")) {
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
      layout: function (make, view) {
        make.centerY.equalTo(view.super)
        make.left.inset(0)
        make.right.equalTo(view.prev.left)
        make.height.equalTo(35)
      },
      views: [{
        type: "image",
        props: {
          // icon: $icon("023", utils.themeColor.appHintColor, $size(15, 15)),
          symbol: "magnifyingglass",
          tintColor: utils.themeColor.appHintColor,
          bgcolor: $color("clear"),
        },
        layout: function (make, view) {
          make.centerY.equalTo(view.super)
          make.left.inset(8)
          make.size.equalTo($size(20, 20))
        },
      }, {
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
        layout: function (make, view) {
          make.centerY.equalTo(view.super)
          make.right.inset(0)
          make.height.equalTo(view.super)
          make.left.equalTo(view.prev.right).inset(0)
          make.width.equalTo(view.frame.width - 22)
        },
        events: {
          didBeginEditing: function (sender, view) {
            $("searchBarParent").remakeLayout(function (make) {
              make.left.inset(15)
              make.height.equalTo($("headerView").height)
              make.centerY.equalTo($("headerView").centerY)
              make.right.inset(15)
            })
            $ui.animate({
              duration: 0.2,
              animation: function () {
                $("searchBarParent").relayout()
              },
              completion: function () {
                $("cancel_button").updateLayout(function (make) {
                  make.right.inset(0).offset(0)
                })
                $ui.animate({
                  duration: 0.4,
                  damping: 0.8,
                  animation: function () {
                    $("cancel_button").relayout()
                  }
                })
              }
            })
          },
          didEndEditing: function (sender) {
            if ($("cancel_button") != undefined) {
              $("cancel_button").updateLayout(function (make) {
                make.right.inset(0).offset(55)
              })
              $ui.animate({
                duration: 0.2,
                animation: function () {
                  $("cancel_button").relayout()
                },
                completion: function () {
                  $("searchBarParent").remakeLayout(function (make) {
                    make.left.inset(15)
                    make.height.equalTo($("headerView").height)
                    make.centerY.equalTo($("headerView").centerY)
                    make.right.inset(15)
                  })
                  $ui.animate({
                    duration: 0.2,
                    animation: function () {
                      $("searchBarParent").relayout()
                    },
                    completion: function () {
                      $("search_input").userInteractionEnabled = false
                    }
                  })
                }
              })

            }
          },
          changed: function (sender) {
            if (sender.text.length > 0) {
              $("search_hint").hidden = true
            } else {
              $("search_hint").hidden = false
            }
          },
          returned: function (sender) {
            sender.blur()
            searchText = sender.text
            $delay(0.2, () => {
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
          layout: function (make, view) {
            make.left.inset(8)
            make.centerY.equalTo(view.super)
          }
        }]
      },]
    }
    ]
  }
  let appViewItems = []
  let apps = getCloudAppDisplaySource()
  appViewItems = genAppListItemView(apps, "cloudAppsList")
  let cloudView = {
    type: "list",
    props: {
      id: "cloudAppsList",
      template: {},
      bgcolor: $color("clear"),
      indicatorInsets: $insets(40, 0, 50, 0),
      indicatorStyle: utils.themeColor.indicatorStyle,
      separatorColor: $color("systemSeparator"),
      separatorInset: $insets(0, 85, 0, 15),
      separatorHidden: ($app.info.build >= 497) ? false : true,
      header: {
        type: "view",
        props: {
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
          layout: function (make, view) {
            make.left.inset(15)
            make.top.inset(50)
            make.height.equalTo(45)
          }
        }, {
          type: "view",
          props: {
            id: "headerView",
            clipsToBounds: true,
          },
          layout: function (make, view) {
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
            layout: function (make, view) {
              make.left.right.inset(15)
              make.height.equalTo(view.super)
              make.centerY.equalTo(view.super)
            },
            views: [searchBar],
            events: {
              tapped: function (sender) {
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
          height: 55,
          bgcolor: $color("clear"),
        },
        views: [{
          type: "label",
          props: {
            text: "———— 已经到底了 ————",
            textColor: utils.themeColor.appCateTextColor,
            align: $align.center,
            font: $font("PingFangSC-Regular", 13),
            lines: 2,
          },
          layout: function (make, view) {
            make.centerX.equalTo(view.super)
            make.top.inset(10)
          }
        }]
      },
      rowHeight: 80,
      data: appViewItems,
    },
    layout: $layout.fill,
    events: {
      didScroll: function (sender) {
        if (sender.contentOffset.y >= 5 + topOffset && $("cloudPageHeaderView").alpha == 0) {
          $ui.animate({
            duration: 0.2,
            animation: function () {
              $("cloudPageHeaderView").alpha = 1;
            },
          });
        } else if (sender.contentOffset.y < 5 + topOffset && $("cloudPageHeaderView").alpha == 1) {
          $ui.animate({
            duration: 0.2,
            animation: function () {
              $("cloudPageHeaderView").alpha = 0;
            },
          });
        }
        if (sender.contentOffset.y >= 45 + topOffset && $("cloudPageHeaderLabel").hidden === true) {
          $("cloudPageHeaderLabel").hidden = false
          $("cloudPageHeaderBlur").bgcolor = $color("clear")
          $("cloudListHeaderTitle").hidden = true
        } else if (sender.contentOffset.y < 45 + topOffset && $("cloudPageHeaderLabel").hidden === false) {
          $("cloudPageHeaderLabel").hidden = true
          $("cloudPageHeaderBlur").bgcolor = utils.themeColor.mainColor
          $("cloudListHeaderTitle").hidden = false
        } else if (sender.contentOffset.y <= topOffset) {
          let size = 35 - sender.contentOffset.y * 0.04
          if (size > 40)
            size = 40;
          if ($("cloudListHeaderTitle")) {
            $("cloudListHeaderTitle").font = $font("Avenir-Black", size)
          }
        }
      },
      didSelect: function (sender, indexPath, data) {
        if (data.props.info) {
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
  for (let i = 0; i < apps.length; i++) {
    if (apps[i].needUpdate == true && apps[i].onStore) {
      watingApps.push(apps[i])
    }
  }

  for (let j = 0; j < updateIds.length; j++) {
    for (let i = 0; i < apps.length; i++) {
      if (apps[i].objectId == updateIds[j] && !apps[i].needUpdate && apps[i].onStore) {
        updatedApps.push(apps[i])
        newUpdateIds.push(updateIds[j])
      }
    }
  }
  $cache.set("updateIds", newUpdateIds);
  watingAppViewItems = genAppListItemView(watingApps)
  updatedAppViewItems = genAppListItemView(updatedApps)
  if (watingAppViewItems.length > 0) {
    appListData.push({
      rows: [{
        type: "view",
        props: {
          bgcolor: $color("clear"),
        },
        layout: function (make, view) {
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
          layout: function (make, view) {
            make.left.inset(15)
            make.centerY.equalTo(view.super)
          },
        }, {
          type: "button",
          props: {
            title: "全部更新",
            titleColor: utils.getCache("themeColor"),
            bgcolor: $color("clear"),
            font: $font(17),
          },
          layout: function (make, view) {
            make.right.inset(15)
            make.centerY.equalTo(view.super)
          },
          events: {
            tapped: function (sender) {
              let listView = $("updateAppsList")
              let needUpdateNumber = watingApps.length
              let needOSAlert = false
              if (listView) {
                sender.titleColor = utils.themeColor.appCateTextColor
                sender.userInteractionEnabled = false
                for (let i = 0; i < watingApps.length; i++) {
                  if(!appUtils.isOSSuit(watingApps[i])) {
                    needOSAlert = true
                    needUpdateNumber--;
                    if (needUpdateNumber <= 0) {
                      $delay(0.5, () => {
                        refreshAllView()
                      })
                    }
                    continue;
                  }
                  let itemView = listView.cell($indexPath(0, i + 1))
                  let buttonView = itemView.get("button")
                  appUtils.installApp(watingApps[i], buttonView, ()=>{
                    needUpdateNumber--;
                    if (needUpdateNumber <= 0) {
                      $device.taptic(2);
                      $delay(0.2, () => { $device.taptic(2); })
                      $delay(0.5, () => {
                        refreshAllView()
                      })
                    }
                  })
                }
                if(needOSAlert) {
                  $ui.alert({
                    title: "提示",
                    message: "部分应用的最低系统要求不满足，如需更新请逐个点击更新",
                    actions: [
                      {
                        title: "好的",
                        handler: function() {
                  
                        }
                      }
                    ]
                  });
                }
              }
            }
          }
        }]
      }].concat(watingAppViewItems)
    })
  }
  if (updatedAppViewItems.length > 0) {
    appListData.push({
      rows: [{
        type: "view",
        props: {
          bgcolor: $color("clear"),
        },
        layout: function (make, view) {
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
          layout: function (make, view) {
            make.left.inset(15)
            make.centerY.equalTo(view.super)
          },
        }]
      }].concat(updatedAppViewItems)
    })
  }
  if (watingAppViewItems.length == 0 && updatedAppViewItems == 0) {
    appListData = [{
      type: "label",
      props: {
        text: "所有应用已是最新",
        align: $align.center,
        font: $font(14),
        textColor: utils.themeColor.mainTabGrayColor,
      },
      layout: function (make, view) {
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
      indicatorInsets: $insets(40, 0, 50, 0),
      indicatorStyle: utils.themeColor.indicatorStyle,
      separatorInset: $insets(0, 85, 0, 15),
      separatorColor: $color("systemSeparator"),
      separatorHidden: true,
      header: {
        type: "view",
        props: {
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
          layout: function (make, view) {
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
      rowHeight: function (sender, indexPath) {
        if (indexPath.row == 0) {
          return 50
        } else {
          return 80
        }
      },
      didScroll: function (sender) {
        if (sender.contentOffset.y >= 5 + topOffset && $("updatePageHeaderView").alpha == 0) {
          $ui.animate({
            duration: 0.2,
            animation: function () {
              $("updatePageHeaderView").alpha = 1;
            },
          });
        } else if (sender.contentOffset.y < 5 + topOffset && $("updatePageHeaderView").alpha == 1) {
          $ui.animate({
            duration: 0.2,
            animation: function () {
              $("updatePageHeaderView").alpha = 0;
            },
          });
        }
        if (sender.contentOffset.y >= 45 + topOffset && $("updatePageHeaderLabel").hidden === true) {
          $("updatePageHeaderLabel").hidden = false
          $("updatePageHeaderBlur").bgcolor = $color("clear")
          $("updateListHeaderTitle").hidden = true
        } else if (sender.contentOffset.y < 45 + topOffset && $("updatePageHeaderLabel").hidden === false) {
          $("updatePageHeaderLabel").hidden = true
          $("updatePageHeaderBlur").bgcolor = utils.themeColor.mainColor
          $("updateListHeaderTitle").hidden = false
        } else if (sender.contentOffset.y <= topOffset) {
          let size = 35 - sender.contentOffset.y * 0.04
          if (size > 40)
            size = 40
          $("updateListHeaderTitle").font = $font("Avenir-Black", size)
        }
      },
      didSelect: function (sender, indexPath, data) {
        if (data.props.info) {
          appItemView.show(data.props.info);
        }
      }
    }
  }
  return updateView
}

function genAppListItemView(apps, sourceViewName, isFill) { //isFill 是指左右不留空隙，充满整个父view
  let appViewItems = []
  let buttonText = ""
  for (let i = 0; i < apps.length; i++) {
    if (apps[i].haveInstalled) {
      if (apps[i].needUpdate) {
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
        bgcolor: $color("clear"),
      },
      layout: function (make, view) {
        make.left.right.inset(0)
        make.height.equalTo(80)
        make.center.equalTo(view.super)
      },
      views: [{
        type: "view",
        layout: function (make, view) {
          make.left.right.inset(isFill?0:15);
          make.height.equalTo(80)
          make.center.equalTo(view.super)
        },
        views: [ui.genAppShowView(apps[i].appIcon, apps[i].appName, (apps[i].subtitle != "") ? apps[i].subtitle : apps[i].appCate, buttonText, function (buttonView) {
          if (!apps[i].needUpdate && apps[i].haveInstalled) {
            $addin.run(apps[i].appName)
          } else {
            if(!appUtils.isOSSuit(apps[i])) {
              $ui.alert({
                title: "提示",
                message: "当前的系统版本过低，最低要求 iOS" + apps[i].needIOSVersion + "，确定安装？",
                actions: [
                  {
                    title: "安装",
                    // style: $alertActionType.destructive, // Optional
                    handler: function() {
                      appUtils.installApp(apps[i], buttonView, ()=>{
                        $device.taptic(2);
                        $delay(0.2, () => { $device.taptic(2); })
                        $app.notify({
                          name: "refreshAll",
                          object: { 
                            except: sourceViewName,
                            appItem: true, 
                          }
                        });
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
              appUtils.installApp(apps[i], buttonView, ()=>{
                $device.taptic(2);
                $delay(0.2, () => { $device.taptic(2); })
                $app.notify({
                  name: "refreshAll",
                  object: { 
                    except: sourceViewName,
                    appItem: true, 
                  }
                });
              })
            }
          }
        }, {
          hintText: (apps[i].racing) ? "参赛作品" : "",
        })]
      }]
    })
  }
  return appViewItems
}

function refreshAllView(exceptViewName) {
  if(((exceptViewName && exceptViewName != "cloudAppsList") || !exceptViewName) && $("cloudAppsList")) {
    let cloudOffset = $("cloudAppsList").contentOffset.y
    $("cloudAppsList").remove()
    $("cloudAppListParent").add(genCloudAppListView())
    $("cloudAppsList").contentOffset = $point(0, cloudOffset)
  }
  if(((exceptViewName && exceptViewName != "updateAppsList") || !exceptViewName) && $("updateAppsList")) {
    let updateOffset = $("updateAppsList").contentOffset.y
    $("updateAppsList").remove()
    $("updateAppListParent").add(genUpdateAppListView())
    $("updateAppsList").contentOffset = $point(0, updateOffset)
  }
  if(((exceptViewName && exceptViewName != "exploreAppsList") || !exceptViewName) && $("exploreAppsList")) {
    let updateOffset = $("exploreAppsList").contentOffset.y
    $("exploreAppsList").remove()
    $("exploreAppListParent").add(genExploreAppListView())
    $("exploreAppsList").contentOffset = $point(0, updateOffset)
  }
  storeStiky()
}

function storeStiky() {
  if(utils.getCache("storeStiky")) {
    moveToTop($addin.current.name);
    function moveToTop(name) {
      const list = $addin.list;
      const index = list.findIndex(n => n.name === name || n.name === name + ".js");
    
      if (index === -1) {
        missingApps.push(name);
      } else {
        const app = list[index];
        list.splice(index, 1);
        list.unshift(app);
        $addin.list = list;
      }
    }
  }
}

function genMeView() {
  const tabMyVoteCode = {
    type: "view",
    props: {
      bgcolor: utils.themeColor.bgcolor,
    },
    views: [{
      type: "label",
      props: {
        text: "我的投票码",
        textColor: utils.themeColor.listContentTextColor,
      },
      layout: function (make, view) {
        make.left.inset(15)
        make.centerY.equalTo(view.super)
      }
    },
    {
      type: "button",
      props: {
        borderWidth: 0,
        bgcolor: $color("clear"),
        titleColor: utils.getCache("themeColor"),
        font: $font(16),
        title: "点击查看",
      },
      layout: function (make, view) {
        make.right.inset(15)
        make.centerY.equalTo(view.super)
      },
      events: {
        tapped: function (sender) {
          let code = $objc("FCUUID").invoke("uuidForDevice").rawValue().toUpperCase().slice(0,4) + "E" + $objc("FCUUID").invoke("uuidForDevice").rawValue().toUpperCase().slice(4, 13) + "A" + $objc("FCUUID").invoke("uuidForDevice").rawValue().toUpperCase().slice(13)
          $ui.alert({
            title: "提示",
            message: "你的投票码为 " + code,
            actions: [{
              title: "好的",
              handler: function () {
      
              }
            },{
              title: "复制",
              handler: function () {
                $clipboard.text = code
              }
            },
            ]
          })
        }
      }
    }],
    layout: $layout.fill
  }

  let newMeList = {
    type: "list",
    props: {
      id: "melist",
      style: 2, // 使用复选类型时这个应该选择 2
      rowHeight: 45,
      separatorInset: $insets(0, 66, 0, 0),
      indicatorInsets: $insets(40, 0, 50, 0),
      separatorColor: $color("systemSeparator"),
      header: {
        type: "view",
        props: {
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
          layout: function (make, view) {
            make.left.inset(15)
            make.bottom.inset(0)
            make.height.equalTo(45)
          }
        }]
      },
      footer: {
        type: "view",
        props: {
          height: 150,
        },
        views: [{
          type: "image",
          props: {
            src: (utils.getThemeMode() == "light")?"assets/wx_footer_signoff@2x.png":"assets/wx_footer_signoff_dark@2x.png",
            contentMode: $contentMode.scaleAspectFit,
          },
          layout: function(make, view) {
            make.centerX.equalTo(view.super)
            make.width.equalTo(view.super)
            make.height.equalTo(22)
            make.top.inset(23)
          },
        },{
          type: "label",
          props: {
            text: "Version " + update.getCurVersion() + " (Build " + update.getCurDate() + "-" + update.getCurBuild() + ") © Linger.",
            textColor: utils.themeColor.appCateTextColor,
            align: $align.center,
            font: $font(13)
          },
          layout: function (make, view) {
            make.centerX.equalTo(view.super)
            make.top.equalTo(view.prev.bottom).inset(10)
          }
        },],
      },
      data: groups.init({
        groups: [{
          title: "用户",
          items: [{
            type: "arrow",
            async: false,
            title: user.haveLogined() ? "个人中心" : "未登录用户",
            symbol: "person.fill",
            iconColor: utils.systemColor("pink"),
            handler: () => {
              user.haveLogined() ? userCenterView.setupUserCenterView() : wantToLogin();
            }
        }]
        },{
          title: "功能",
          items: [{
            type: "arrow",
            async: false,
            title: "我要发布",
            symbol: "plus.app.fill",
            iconColor: utils.systemColor("green"),
            handler: () => {
              wantToRealse();
            }
        },{
            type: "arrow",
            async: false,
            title: "主题功能",
            symbol: "cube.fill",
            iconColor: utils.systemColor("orange"),
            handler: () => {
              (utils.getCache("authPass") || !utils.getCache("Settings").needVerify) ? setupThemeSettingView() : genWxWelcomView();
            }
        }]
        },{
          title: "其他",
          items: [{
            type: "arrow",
            async: false,
            title: "更新日志",
            symbol: "safari.fill",
            iconColor: utils.systemColor("blue"),
            handler: () => {
              setupWebView("更新日志", "https://www.liuguogy.com/archives/jsbox-store-developing.html");
            }
            },{
              type: "arrow",
              async: false,
              title: "代码仓库",
              symbol: "tray.fill",
              iconColor: utils.systemColor("black"),
              handler: () => {
                setupWebView("GitHub", "https://github.com/LiuGuoGY/JSBox-addins/");
                // $app.openURL("https://github.com/LiuGuoGY/JSBox-addins/");
              }
          },{
            type: "arrow",
            async: false,
            title: "交流讨论",
            symbol: "message.fill",
            iconColor: utils.systemColor("red"),
            handler: () => {
              setupWebView("Discussion", "https://github.com/LiuGuoGY/JSBox-addins/discussions");
              // $app.openURL("https://github.com/LiuGuoGY/JSBox-addins/discussions");
            }
          },{
              type: "arrow",
              async: false,
              title: "用户协议",
              symbol: "doc.fill",
              iconColor: utils.systemColor("purple"),
              handler: () => {
                setupWebView("用户协议", "https://www.liuguogy.com/archives/erots-user-agreement.html");
              }
          },{
              type: "arrow",
              async: false,
              title: "检查更新",
              async: true,
              symbol: "capslock.fill",
              iconColor: utils.systemColor("green"),
              handler: async () => {
                await update.checkUpdateNow();
              }
          },{
              type: "arrow",
              async: false,
              title: "反馈建议",
              symbol: "envelope.open.fill",
              iconColor: utils.systemColor("orange"),
              handler: () => {
                setupFeedBack();
              }
          },{
              type: "arrow",
              async: false,
              title: "支持与赞赏",
              symbol: "heart.fill",
              iconColor: utils.systemColor("red"),
              handler: () => {
                setupReward();
              }
          },{
              type: "arrow",
              async: true,
              title: "分享︎︎给朋友",
              symbol: "arrowshape.turn.up.right.fill",
              iconColor: utils.systemColor("yellow"),
              handler: () => {
                share("https://xteko.com/redir?name=Erots&url=https%3A%2F%2Fgithub.com%2FLiuGuoGY%2FJSBox-addins%2Fraw%2Fmaster%2FErots%2F.output%2FErots.box");
              }
          },{
            type: "text",
            async: false,
            title: "活跃安装量",
            symbol: "chart.pie.fill",
            iconColor: utils.systemColor("blue"),
            text: utils.getCache("installNumbers", 0).toString(),
            handler: () => {
            }
          }]
        },]
      })
    },
    layout: $layout.fill,
    events: {
      didScroll: function (sender) {
        if (sender.contentOffset.y >= 5 + topOffset && $("mePageHeaderView").alpha == 0) {
          $ui.animate({
            duration: 0.2,
            animation: function () {
              $("mePageHeaderView").alpha = 1;
            },
          });
        } else if (sender.contentOffset.y < 5 + topOffset && $("mePageHeaderView").alpha == 1) {
          $ui.animate({
            duration: 0.2,
            animation: function () {
              $("mePageHeaderView").alpha = 0;
            },
          });
        }
        if (sender.contentOffset.y >= 45 + topOffset && $("mePageHeaderLabel").hidden === true) {
          $("mePageHeaderLabel").hidden = false
          $("mePageHeaderBlur").bgcolor = $color("clear")
          $("meListHeaderTitle").hidden = true
        } else if (sender.contentOffset.y < 45 + topOffset && $("mePageHeaderLabel").hidden === false) {
          $("mePageHeaderLabel").hidden = true
          $("mePageHeaderBlur").bgcolor = $color("insetGroupedBackground")
          $("meListHeaderTitle").hidden = false
        } else if (sender.contentOffset.y <= topOffset) {
          let size = 35 - sender.contentOffset.y * 0.04
          if (size > 40)
            size = 40
          $("meListHeaderTitle").font = $font("Avenir-Black", size)
        }
      },
    }
  };

  let view = {
    type: "view",
    props: {
      id: "meView",
      hidden: true,
    },
    layout: $layout.fill,
    views: [newMeList, {
      type: "view",
      props: {
        id: "mePageHeaderView",
        hidden: false,
        alpha: 0,
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
          id: "mePageHeaderBlur",
          style: utils.themeColor.blurType, // 0 ~ 5
          bgcolor: $color("insetGroupedBackground"),
        },
        layout: $layout.fill,
      }, {
        type: "view",
        layout: function (make, view) {
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
    }]
  }
  requireInstallNumbers()
  return view
}

function solveQuery() {
  if (query) {
    switch (query.q) {
      case "show":
        if(query.objectId) {
          appItemView.show(query.objectId);
        }
        break;
      case "theme":
        setQueryTheme(query.color);
        break;
      default:
        break;
    }
  }
}

function setQueryTheme(color) {
  if(utils.getCache("authPass") && color && color.length == 6) {
    if (utils.getThemeMode() == "dark") {
      $cache.set("darkThemeColor", $color("#" + color));
    } else {
      $cache.set("lightThemeColor", $color("#" + color));
    }
    refreshAllTheme(0.5)
  } else {
    ui.showToastView($("mainView"), utils.mColor.red, "无法设置主题颜色")
  }
}

function showAnnouncement() {
  let show = utils.getCache("Settings").showAnnouncement
  let anno = utils.getCache("Settings").announcement
  let link = utils.getCache("Settings").announceLink
  let actions = [{
    title: "好的",
    handler: function () {

    }
  }]
  if(link && link != "") {
    $cache.remove("noAgainAunounceContent");
    actions.push({
      title: "前往",
      handler: function () {
        $app.openURL(link);
      }
    })
  } else {
    actions.push({
      title: "不再提示",
      handler: function () {
        $cache.set("noAgainAunounceContent", anno);
      }
    })
  }
  if (show && anno && anno != "" && utils.getCache("noAgainAunounceContent") != anno) {
    $delay(0.5, () => {
      $ui.alert({
        title: "公告",
        message: "" + anno,
        actions: actions
      });
    })
  }
}

function wantToLogin() {
  $ui.menu({
    items: ["登录", "注册"],
    handler: function (title, idx) {
      if (idx == 0) {
        logUpView.setupLoginView()
      } else if (idx == 1) {
        logUpView.setupLogUpView()
      }
    }
  })
}

function wantToRealse() {
  if (user.haveLogined()) {
    $ui.menu({
      items: ["首发应用", "更新应用"],
      handler: function (title, idx) {
        if (idx == 0) {
          uploadView.setupUploadView()
        } else if (idx == 1) {
          let apps = utils.getCache("cloudApps", [])
          let author = user.getLoginUser()
          let myApps = []
          for (let i = 0; i < apps.length; i++) {
            if (apps[i].authorId == author.objectId) {
              myApps.push(apps[i])
            }
          }
          let names = []
          for (let i = 0; i < myApps.length; i++) {
            names.push(myApps[i].appName)
          }
          $ui.menu({
            items: names,
            handler: function (title, idx) {
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
      actions: [{
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
  $delay(delay ? delay : 0, () => {
    setThemeColor()
    if ($("mainView")) {
      $("mainView").remove()
      $("mainViewParent").add(genMainView())
      // $("mainViewParent").$statusBarStyle(utils.themeColor.statusBarStyle)
      // $("mainViewParent").bgcolor = utils.themeColor.mainColor
      // $objc("UIApplication").$setStatusBarStyle(utils.themeColor.statusBarStyle)
    }
    if ($("themeSettingView")) {
      $("themeSettingView").remove()
      $("themeSettingViewParent").add(genThemeSettingView())
      // $objc("UIApplication").$setStatusBarStyle(utils.themeColor.statusBarStyle)
      // $("themeSettingViewParent").statusBarStyle = utils.themeColor.statusBarStyle
      // $("themeSettingViewParent").bgcolor = utils.themeColor.mainColor
    }
  })
}

function genThemeSettingView() {
  let themeMode = utils.getCache("themeMode");
  let themeSymbols = ["sun.max","moon.stars", "clock","bolt"]
  let themeSettingView = {
    type: "view",
    props: {
      id: "themeSettingView",
      bgcolor: utils.themeColor.mainColor,
    },
    layout: $layout.fill,
    views: [ui.genPageHeader("主页", "主题功能"), {
      type: "list",
      props: {
        style: 2, // 使用复选类型时这个应该选择 2
        rowHeight: 45,
        separatorInset: $insets(0, 66, 0, 0),
        indicatorInsets: $insets(100, 0, 49, 0),
        separatorColor: $color("systemSeparator"),
        header: {
          type: "view",
          props: {height: 5}
        },
        data: groups.init({
          groups: [{
            title: "主题",
            items: [{
              type: "arrow",
              async: false,
              title: "主题模式",
              symbol: themeSymbols[themeMode],
              iconColor: utils.systemColor("blue"),
              handler: () => {
                showThemeModeSelectView($("themeSettingView"));
              }
            },
            {
              type: "arrow",
              async: false,
              title: "主题颜色",
              symbol: "pencil.tip",
              iconColor: utils.getCache("themeColor"),
              handler: () => {
                showColorSelectView($("themeSettingView"));
              }
          },]
          },
          {
            title: "功能",
            items: [{
              type: "switch",
              async: false,
              title: "商店置顶",
              symbol: "arrow.up",
              key: "storeStiky",
              iconColor: utils.systemColor("orange"),
              handler: () => {
              }
            },{
              type: "switch",
              async: false,
              title: "欢迎动画",
              symbol: "star",
              key: "welcomeAnimation",
              iconColor: utils.systemColor("purple"),
              handler: () => {
              }
            },]
          },]
        })
      },
      layout: function (make, view) {
        make.top.equalTo(view.prev.bottom)
        make.left.right.bottom.inset(0)
      },
    }]
  }
  return themeSettingView;
}

function showColorSelectView(superView) {
  let windowWidth = 400
  let itemColors = []
  let lightColors = ["#007AFE", "#00C2EC", "#29B227", "#EB6BA3", "#EF8200", "#9471EE", "#D23213", "#ECB403", "#6C829E", "#000000"];
  let darkColors = ["#007AFE", "#00C2EC", "#29B227", "#EB6BA3", "#EF8200", "#9471EE", "#D23213", "#ECB403", "#EF238E", "#FEFFFE"];
  let selectedColor = utils.getCache("themeColor")
  let colors = ($device.isDarkMode) ? darkColors : lightColors;
  for (let i = 0; i < colors.length; i++) {
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
    layout: function (make, view) {
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
    }, {
      type: "view",
      props: {
        id: "windowView",
        bgcolor: $color("clear"),
      },
      layout: function (make, view) {
        make.height.equalTo(270)
        if (superView.frame.width > windowWidth) {
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
        layout: function (make, view) {
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
          layout: function (make, view) {
            make.top.inset(15)
            make.centerX.equalTo(view.super)
            make.height.equalTo(23)
            make.width.equalTo(view.super)
          }
        }, {
          type: "matrix",
          props: {
            columns: 5,
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
              layout: function (make, view) {
                make.centerX.equalTo(view.super)
                make.width.height.equalTo(50)
                make.top.inset(7)
              },
              views: [{
                type: "view",
                props: {
                  id: "colorSelect",
                  hidden: true,
                },
                layout: function (make, view) {
                  make.center.equalTo(view.super)
                  make.height.equalTo(view.super).multipliedBy(0.3)
                  make.width.equalTo(view.super).multipliedBy(0.4)
                },
                views: [ui.createRight($color("white"), 2.5)]
              }],
            },],
            data: itemColors,
          },
          events: {
            didSelect: function (sender, indexPath, data) {
              for (let i = 0; i < itemColors.length; i++) {
                itemColors[i].colorSelect.hidden = true
              }
              itemColors[indexPath.row].colorSelect.hidden = false
              sender.data = itemColors
              if (utils.getThemeMode() == "dark") {
                $cache.set("darkThemeColor", $color(colors[indexPath.row]));
              } else {
                $cache.set("lightThemeColor", $color(colors[indexPath.row]));
              }
              $delay(0.1, () => {
                hideView()
              })
              setThemeColor()
              refreshAllTheme(0.12)
            }
          },
          layout: function (make, view) {
            make.top.equalTo(view.prev.bottom).inset(5)
            make.bottom.inset(10)
            make.centerX.equalTo(view.super)
            make.left.right.inset(20)
          }
        }]
      }, {
        type: "view",
        props: {
          bgcolor: utils.themeColor.mainColor,
          radius: 15,
        },
        layout: function (make, view) {
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
          layout: function (make, view) {
            make.center.equalTo(view.super)
            make.size.equalTo(view.super)
          },
          events: {
            tapped: function (sender) {
              hideView()
            }
          }
        }]
      }],
    }],
  })
  $("windowView").relayout()
  $("windowView").remakeLayout(function (make) {
    make.height.equalTo(270)
    if (superView.frame.width > windowWidth) {
      make.width.equalTo(windowWidth)
    } else {
      make.width.equalTo(superView)
    }
    make.centerX.equalTo(superView)
    make.bottom.inset(10)
  })
  $ui.animate({
    duration: 0.15,
    animation: () => {
      $("infoView").alpha = 1
    }
  })
  $ui.animate({
    duration: 0.3,
    velocity: 1,
    damping: 2,
    animation: () => {
      $("windowView").relayout()
    }
  })

  function hideView() {
    $("windowView").remakeLayout(function (make) {
      make.height.equalTo(270)
      if (superView.frame.width > windowWidth) {
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
        if ($("infoView")) {
          $("infoView").remove();
        }
      }
    });
  }
}

function showThemeModeSelectView(superView) {
  let windowWidth = 400
  let items = []
  let imageIconSymbols = ["sun.max.fill", "moon.circle.fill", "circle.lefthalf.fill", "bolt.badge.a.fill"]
  let modeTexts = ["浅色", "深色", "自动", "亮度"]
  let selectedMode = utils.getCache("themeMode")
  for (let i = 0; i < imageIconSymbols.length; i++) {
    items.push({
      modeIcon: {
        symbol: imageIconSymbols[i],
      },
      selectedView: {
        hidden: (selectedMode != i),
      },
      modeText: {
        text: modeTexts[i],
        textColor: (selectedMode == i)?utils.getCache("themeColor"):utils.themeColor.listContentTextColor,
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
    layout: function (make, view) {
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
    }, {
      type: "view",
      props: {
        id: "windowView",
        bgcolor: $color("clear"),
      },
      layout: function (make, view) {
        make.height.equalTo(240)
        if (superView.frame.width > windowWidth) {
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
        layout: function (make, view) {
          make.height.equalTo(view.super).multipliedBy(0.70)
          make.left.right.inset(15)
          make.centerX.equalTo(view.super)
          make.top.inset(0)
        },
        views: [{
          type: "label",
          props: {
            text: "选择主题模式",
            textColor: utils.themeColor.listContentTextColor,
            font: $font("bold", 16),
            align: $align.center,
          },
          layout: function (make, view) {
            make.top.inset(15)
            make.centerX.equalTo(view.super)
            make.height.equalTo(23)
            make.width.equalTo(view.super)
          }
        }, {
          type: "matrix",
          props: {
            columns: 4,
            itemHeight: 90,
            spacing: 8,
            scrollEnabled: false,
            bgcolor: $color("clear"),
            template: [{
              type: "view",
              props: {
                bgcolor: $color("clear"),
              },
              layout: function (make, view) {
                make.centerX.equalTo(view.super)
                make.top.inset(7)
                make.width.height.equalTo(50)
              },
              views: [{
                type: "view",
                props: {
                  id: "selectedView",
                  circular: true,
                  borderWidth: 0,
                  bgcolor: utils.getCache("themeColor"),
                },
                layout: function (make, view) {
                  make.center.equalTo(view.super)
                  make.width.height.equalTo(50)
                },
              },{
                type: "view",
                props: {
                  circular: true,
                  borderWidth: 0,
                  bgcolor: utils.themeColor.mainColor,
                },
                layout: function (make, view) {
                  make.center.equalTo(view.super)
                  make.width.height.equalTo(45)
                },
                views: [{
                  type: "view",
                  props: {
                    circular: true,
                    borderWidth: 0,
                    bgcolor: utils.themeColor.mainColor,
                    clipsToBounds: false,
                  },
                  layout: function (make, view) {
                    make.center.equalTo(view.super)
                    make.width.height.equalTo(30)
                  },
                  views: [{
                    type: "image",
                    props: {
                      id: "modeIcon",
                      tintColor: utils.themeColor.listHeaderTextColor
                    },
                    layout: function (make, view) {
                      make.center.equalTo(view.super)
                      make.height.width.equalTo(view.super)
                    },
                  }]
                },],
              },]
            },{
              type: "view",
              props: {
                bgcolor: $color("clear"),
              },
              layout: function (make, view) {
                make.bottom.inset(7)
                make.width.equalTo(50)
                make.height.equalTo(20)
                make.centerX.equalTo(view.super)
              },
              views:[{
                type: "label",
                props: {
                  id: "modeText",
                  font: $font("bold", 15),
                  align: $align.center,
                },
                layout: function (make, view) {
                  make.center.equalTo(view.super)
                  make.width.equalTo(view.super)
                }
              }]
            }],
            data: items,
          },
          events: {
            didSelect: function (sender, indexPath, data) {
              for (let i = 0; i < items.length; i++) {
                items[i].selectedView.hidden = true
                items[i].modeText.textColor = utils.themeColor.listContentTextColor
              }
              items[indexPath.row].selectedView.hidden = false
              items[indexPath.row].modeText.textColor = utils.getCache("themeColor")
              sender.data = items
              $cache.set("themeMode", indexPath.row);
              $delay(0.1, () => {
                hideView()
              })
              setThemeColor()
              refreshAllTheme(0.12)
            }
          },
          layout: function (make, view) {
            make.top.equalTo(view.prev.bottom).inset(5)
            make.bottom.inset(10)
            make.centerX.equalTo(view.super)
            make.left.right.inset(20)
          }
        }]
      }, {
        type: "view",
        props: {
          bgcolor: utils.themeColor.mainColor,
          radius: 15,
        },
        layout: function (make, view) {
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
          layout: function (make, view) {
            make.center.equalTo(view.super)
            make.size.equalTo(view.super)
          },
          events: {
            tapped: function (sender) {
              hideView()
            }
          }
        }]
      }],
    }],
  })
  $("windowView").relayout()
  $("windowView").remakeLayout(function (make) {
    make.height.equalTo(240)
    if (superView.frame.width > windowWidth) {
      make.width.equalTo(windowWidth)
    } else {
      make.width.equalTo(superView)
    }
    make.centerX.equalTo(superView)
    make.bottom.inset(10)
  })
  $ui.animate({
    duration: 0.15,
    animation: () => {
      $("infoView").alpha = 1
    }
  })
  $ui.animate({
    duration: 0.3,
    velocity: 1,
    damping: 2,
    animation: () => {
      $("windowView").relayout()
    }
  })

  function hideView() {
    $("windowView").remakeLayout(function (make) {
      make.height.equalTo(270)
      if (superView.frame.width > windowWidth) {
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
        if ($("infoView")) {
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
      appeared: function (sender) {
        $app.autoKeyboardEnabled = true
        $app.keyboardToolbarEnabled = true
      },
      didAppear: function (sender) {
        $app.autoKeyboardEnabled = true
        $app.keyboardToolbarEnabled = true
      },
      disappeared: function () {
        $app.autoKeyboardEnabled = false
        $app.keyboardToolbarEnabled = false
      }
    },
    views: [ui.genPageHeader("主页", "解锁功能"), {
      type: "scroll",
      props: {
        bgcolor: $color("clear"),
      },
      layout: function (make, view) {
        make.top.equalTo(view.prev.bottom)
        make.left.right.bottom.inset(0)
      },
      views: [{
        type: "gallery",
        props: {
          items: [{
            type: "image",
            props: {
              src: "assets/show2.jpg",
              contentMode: $contentMode.scaleAspectFit,
            }
          },],
          interval: 4,
          radius: 5.0
        },
        layout: function (make, view) {
          make.left.right.inset(10)
          make.centerX.equalTo(view.super)
          make.top.inset(30)
          make.height.equalTo(200)
        }
      }, {
        type: "label",
        props: {
          id: "welcomeDetailLabel",
          text: "关注微信公众号「纵享派」即可解锁主题功能，感谢你对作者辛苦开发和维护的支持 :)",
          textColor: utils.themeColor.listHeaderTextColor,
          font: $font("bold", 20),
          align: $align.center,
          lines: 0,
        },
        layout: function (make, view) {
          make.left.right.inset(20)
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(30)
        },
      }, {
        type: "view",
        props: {
          id: "showWindow",
        },
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          make.centerX.equalTo(view.super)
          make.width.equalTo(200)
          make.height.equalTo(40)
        },
        views: []
      }, {
        type: "button",
        props: {
          id: "subscribeButton",
          title: "关注以继续使用",
          circular: true,
          titleColor: $color("white"),
          bgcolor: $color("#00CC7A"),
          font: $font("bold", 15),
        },
        layout: function (make, view) {
          make.width.equalTo(220)
          make.centerX.equalTo(view.super)
          make.height.equalTo(50)
          make.top.equalTo(view.prev.bottom).inset(30)
        },
        events: {
          tapped: function (sender) {
            if (!authSucces) {
              $ui.alert({
                title: "提示",
                message: "下载二维码图片或复制公众号名并跳转到微信，只需选择图片或者搜索即可关注公众号。",
                actions: [{
                  title: "下载二维码",
                  handler: function () {
                    gotoWxScan()
                  }
                },
                {
                  title: "复制公众号名",
                  handler: function () {
                    gotoWx()
                  }
                },
                {
                  title: "取消",
                  handler: function () {

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
      }, {
        type: "button",
        props: {
          title: "我已关注",
          circular: true,
          titleColor: utils.themeColor.appHintColor, //#3478f7
          bgcolor: utils.themeColor.bgcolor,
          font: $font("bold", 13),
        },
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          make.centerX.equalTo(view.super)
          make.width.equalTo(100)
          make.height.equalTo(30)
        },
        events: {
          tapped: function (sender) {
            if (!$("nicknameInput")) {
              $("showWindow").add({
                type: "view",
                props: {
                  id: "inputParent",
                },
                layout: $layout.fill,
                views: [{
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
                  layout: function (make, view) {
                    make.center.equalTo(view.super)
                    make.height.equalTo(32)
                    make.width.equalTo(150)
                  },
                  events: {
                    returned: function (sender) {
                      sender.blur()
                    },
                    didEndEditing: function (sender) {
                      detectNickname(sender.text)
                    }
                  }
                }, {
                  type: "image",
                  props: {
                    id: "toastIcon",
                    bgcolor: $color("clear"),
                    icon: null,
                  },
                  layout: function (make, view) {
                    make.centerY.equalTo(view.super)
                    make.size.equalTo($size(20, 20))
                    make.left.equalTo(view.prev.right).inset(5)
                  },
                  events: {
                    tapped: function (sender) {
                      if (!authSucces && sender.icon) {
                        if ($("nicknameInput").text.indexOf("&") >= 0) {
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
    if (nickname.length <= 0 && $("toastIcon")) {
      $("toastIcon").icon = null
      authSucces = false
      return 0
    }
    if ($("toastIcon")) {
      $("toastIcon").icon = $icon("162", $color("gray"), $size(20, 20))
    }
    let url = utils.domain + "/classes/fansList?where={\"nickname\":\"" + nickname + "\"}"
    $http.request({
      method: "GET",
      url: encodeURI(url),
      timeout: 5,
      header: {
        "Content-Type": "application/json",
        "X-LC-Id": utils.conAppId,
        "X-LC-Key": utils.conAppKey,
      },
      handler: function (resp) {
        let data = resp.data.results
        if (data && data.length > 0) {
          if ($("toastIcon")) {
            $("toastIcon").icon = $icon("064", $color("#00CC7A"), $size(20, 20))
            authSucces = true
            $("subscribeButton").bgcolor = $color("#3478f7");
            $("subscribeButton").title = "开始使用"
            regisiter(data[0].objectId)
          }
        } else {
          if ($("toastIcon")) {
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
      layout: function (make, view) {
        make.center.equalTo(view.super)
      }
    })
    $http.download({
      url: "https://github.com/LiuGuoGY/JSBox-addins/raw/master/resources/OfficialAccountQr.jpg",
      handler: function (resp) {
        $photo.save({
          data: resp.data,
          handler: function (success) {
            if ($("loadingView")) {
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
      url: utils.domain + "/classes/fansList/" + objectId,
      timeout: 5,
      header: {
        "Content-Type": "application/json",
        "X-LC-Id": utils.conAppId,
        "X-LC-Key": utils.conAppKey,
      },
      body: {
        deviceId: {
          __op: "AddUnique",
          objects: [$objc("FCUUID").invoke("uuidForDevice").rawValue()],
        }
      },
      handler: function (resp) { }
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
    handler: function (success) {
      if (success) {
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
    views: [ui.genPageHeader("我的", title, {
      type: "image",
      props: {
        symbol: "safari",
        tintColor: utils.getCache("themeColor"),
      },
      layout: function(make, view) {
        make.size.equalTo($size(26, 26))
        make.centerY.equalTo(view.super)
        make.right.inset(15)
      },
      events: {
        tapped: function (sender) {
          $app.openURL(url)
        }
      },
    }), {
      type: "web",
      props: {
        id: "webView",
        url: url,
      },
      layout: function (make, view) {
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
        textColor: utils.themeColor.listContentTextColor,
        font: $font("TrebuchetMS-Italic", 17)
      },
      layout: function (make, view) {
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
      layout: function (make, view) {
        make.right.inset(40);
        make.centerY.equalTo(view.super);
      }
    }
    ]
  }
  let array = $cache.get("rewardList")
  if (array == undefined) {
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
      appeared: function (sender) {
        $app.autoKeyboardEnabled = true
        $app.keyboardToolbarEnabled = true
      },
      didAppear: function (sender) {
        $app.autoKeyboardEnabled = true
        $app.keyboardToolbarEnabled = true
      },
      disappeared: function () {
        $app.autoKeyboardEnabled = false
        $app.keyboardToolbarEnabled = false
      }
    },
    views: [ui.genPageHeader("主页", "支持与赞赏"), {
      type: "view",
      props: {
        id: "reward",
      },
      layout: function (make, view) {
        make.left.right.inset(10)
        make.top.equalTo(view.prev.bottom).inset(30)
        if ($device.info.version >= "11") {
          make.bottom.equalTo(view.super.safeAreaBottom).inset(30)
        } else {
          make.bottom.inset(30)
        }
        make.centerX.equalTo(view.super)
      },
      views: [{
        type: "label",
        props: {
          id: "rewardTextTitle",
          text: "赞赏名单(按时间排序)：",
          textColor: utils.themeColor.listContentTextColor,
          font: $font(15),
        },
        layout: function (make, view) {
          make.top.inset(10)
          make.left.inset(20)
        }
      },
      {
        type: "tab",
        props: {
          id: "selection",
          items: ["辣条￥2", "饮料￥5", "咖啡￥10"],
          index: 0,
        },
        layout: function (make, view) {
          make.centerX.equalTo(view.super)
          make.width.equalTo(200)
          make.bottom.inset(60)
          make.height.equalTo(25)
        },
        events: {
          changed: function (sender) { }
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
        layout: function (make, view) {
          make.centerX.equalTo(view.super).offset(60)
          make.height.equalTo(40)
          make.bottom.inset(10)
        },
        events: {
          tapped: function (sender) {
            switch ($("selection").index) {
              case 0:
                $app.openURL("https://qr.alipay.com/fkx050667bqnzgnmfyqod4d")
                break
              case 1:
                $app.openURL("https://qr.alipay.com/fkx095547lpjdisvgwkvzbc")
                break
              case 2:
                $app.openURL("https://qr.alipay.com/fkx04580mfavvdvwdwetd29")
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
        layout: function (make, view) {
          make.centerX.equalTo(view.super).offset(-60)
          make.height.equalTo(40)
          make.bottom.inset(10)
        },
        events: {
          tapped: function (sender) {
            begainReward(sender.title)
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
        layout: function (make, view) {
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
        separatorColor: $color("systemSeparator"),
        indicatorStyle: utils.themeColor.indicatorStyle,
        separatorInset: $insets(0, 20, 0, 20),
        insets: $insets(5, 5, 5, 5),
        rowHeight: 35,
        bgcolor: $color("clear"),
        selectable: false,
        data: [{
          rows: array,
        },],
      },
      layout: function (make, view) {
        make.top.equalTo($("rewardTextTitle").bottom).inset(5)
        make.bottom.equalTo($("selection").top).inset(20)
        make.centerX.equalTo(view.center)
        make.left.right.inset(20)
      },
      events: {
        didSelect: function (sender, indexPath, data) {

        }
      }
    },
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
      handler: function () {
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
    handler: function (resp) {
      $photo.save({
        data: resp.data,
        handler: function (success) {
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
  if ($device.isJailbroken) {
    $ui.alert({
      title: "警告",
      message: "越狱设备不提供反馈建议功能",
    });
    return 0;
  }
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
      appeared: function (sender) {
        $app.autoKeyboardEnabled = true
        $app.keyboardToolbarEnabled = true
      },
      didAppear: function (sender) {
        $app.autoKeyboardEnabled = true
        $app.keyboardToolbarEnabled = true
      },
      disappeared: function () {
        $app.autoKeyboardEnabled = false
        $app.keyboardToolbarEnabled = false
      }
    },
    views: [ui.genPageHeader("主页", "反馈建议"), {
      type: "view",
      props: {
        id: "feedback",
      },
      layout: function (make, view) {
        make.left.right.inset(10)
        make.height.equalTo(300)
        make.top.equalTo(view.prev.bottom).inset(20)
      },
      events: {
        tapped: function (sender) {
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
        layout: function (make, view) {
          make.top.inset(10)
          make.left.inset(20)
        }
      },
      {
        type: "text",
        props: {
          id: "feedbackText",
          text: (text) ? text : "",
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
        layout: function (make, view) {
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
        layout: function (make, view) {
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
        layout: function (make, view) {
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
        layout: function (make, view) {
          make.left.right.inset(20)
          make.height.equalTo(40)
          make.bottom.inset(10)
          make.centerX.equalTo(view.super)
        },
        events: {
          tapped: function (sender) {
            if ($("feedbackText").text.length > 0) {
              sendFeedBack($("feedbackText").text, $("feedbackContact").text)
            }
          },
        }
      },
      {
        type: "label",
        props: {
          text: "如果需要发送图片或者视频，请在公众号「纵享派」中进行反馈。",
          textColor: utils.themeColor.appHintColor,
          align: $align.left,
          font: $font(12),
          lines: 0,
        },
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          make.left.right.inset(20)
        }
      }
      ]
    },]
  })
}

// function requireApps() {
//   if (user.haveLogined()) {
//     showNewCommentNumber(apps)
//   }
  // if (query) {
  //   switch (query.q) {
  //     case "show":
  //       for (let i = 0; i < apps.length; i++) {
  //         if (apps[i].objectId === query.objectId) {
  //           $app.notify({
  //             name: "refreshItemView",
  //             object: { onStore: apps[i].onStore }
  //           });
  //           break;
  //         }
  //       }
  //       break;
  //     default:
  //       break;
  //   }
  // }
// }

function showNewCommentNumber(apps) {
  let commentNum = 0;
  for (let i = 0; i < apps.length; i++) {
    if (apps[i].authorId === user.getLoginUser().objectId) {
      if (apps[i].comment) {
        commentNum += apps[i].comment.length;
      }
    }
  }
  let oldCommentNum = utils.getCache("commentNum", 0);
  if (commentNum > oldCommentNum) {
    $delay(1, ()=>{ui.showToastView($("mainView"), utils.mColor.blue, "你有 " + (commentNum - oldCommentNum) + " 个新评论哦");});
  }
  $cache.set("commentNum", commentNum);
}

function getCloudAppDisplaySource() {
  let cloudApps = utils.getCache("cloudApps", [])
  let onstoreApps = []
  for (let i = 0; i < cloudApps.length; i++) {
    if (cloudApps[i].onStore) {
      onstoreApps.push(cloudApps[i]);
    }
  }
  let results = []
  if (searchText != "") {
    for (let i = 0; i < onstoreApps.length; i++) {
      if (onstoreApps[i].appName.toLowerCase().indexOf(searchText.toLowerCase()) >= 0 || onstoreApps[i].author.toLowerCase().indexOf(searchText.toLowerCase()) >= 0 || onstoreApps[i].subtitle.toLowerCase().indexOf(searchText.toLowerCase()) >= 0 || onstoreApps[i].instruction.toLowerCase().indexOf(searchText.toLowerCase()) >= 0) {
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
    url: utils.domain + "/classes/Reward",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": utils.appId,
      "X-LC-Key": utils.appKey,
    },
    handler: function (resp) {
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
    url: utils.domain + "/installations?count=1&limit=0",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": utils.appId,
      "X-LC-Key": utils.appKey,
    },
    handler: function (resp) {
      let results = resp.data.count
      if (results != undefined) {
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
    if (info == undefined || info_pre == undefined) {
      return true
    } else if (info.addinVersion != info_pre.addinVersion || info.iosVersion != info_pre.iosVersion || info.jsboxVersion != info_pre.jsboxVersion || info.deviceToken != info_pre.deviceToken) {
      return true
    } else {
      return false
    }
  }
  if (isDifferent(info, info_pre)) {
    $cache.set("installInfo", info)
    $http.request({
      method: "POST",
      url: utils.domain + "/installations",
      timeout: 5,
      header: {
        "Content-Type": "application/json",
        "X-LC-Id": utils.appId,
        "X-LC-Key": utils.appKey,
      },
      body: {
        addinVersion: update.getCurVersion(),
        iosVersion: $device.info.version,
        jsboxVersion: $app.info.version,
        deviceType: "ios",
        deviceToken: $objc("FCUUID").invoke("uuidForDevice").rawValue()
      },
      handler: function (resp) { }
    })
  }
}

function sendFeedBack(text, contact) {
  $http.request({
    method: "POST",
    url: utils.domain + "/feedback",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": utils.appId,
      "X-LC-Key": utils.appKey,
    },
    body: {
      status: "open",
      content: text + "\nID: " + $objc("FCUUID").invoke("uuidForDevice").rawValue().toString(),
      contact: contact,
    },
    handler: function (resp) {
      $device.taptic(2)
      $delay(0.2, function () {
        $device.taptic(2)
      })
      $ui.alert({
        title: "发送成功",
        message: "感谢您的反馈！开发者会认真考虑！",
        actions: [{
          title: "OK",
          handler: function () {
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
  if (lastCheckTime !== undefined && utils.getCache("haveBanned") !== undefined) {
    if ((nowTime - lastCheckTime) / (60 * 1000) < 10) {
      needCheckBlackList = false
    }
  }
  if (needCheckBlackList) {
    $cache.remove("haveBanned")
    $cache.set("lastCheckBlackTime", nowTime)
    let url = utils.domain + "/classes/list?where={\"deviceToken\":\"" + $objc("FCUUID").invoke("uuidForDevice").rawValue() + "\"}"
    $http.request({
      method: "GET",
      url: encodeURI(url),
      timeout: 5,
      header: {
        "Content-Type": "application/json",
        "X-LC-Id": utils.conAppId,
        "X-LC-Key": utils.conAppKey,
      },
      handler: function (resp) {
        let data = resp.data.results
        if (data.length > 0) {
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