let ui = require('scripts/ui')
let utils = require('scripts/utils')

function setupTodayView() {
  if(utils.getCache("backgroundTranparent", true)) {
    let alpha = 1
    $delay(0.7, function(){
      let timer = $timer.schedule({
        interval: 0.01,
        handler: function() {
          if(alpha > 0) {
            $ui.vc.runtimeValue().$view().$setBackgroundColor($rgba(255, 255, 255, alpha))
            alpha -= 0.05
          } else {
            timer.invalidate()
          }
        }
      })
    })
  }
  let items = utils.getCache("localItems", [])
  let columns = utils.getCache("columns", 4)
  let itemHeight = 50

  let showView = []
  if(utils.getCache("pullToClose", true)) {
    showView = [{
      type: "matrix",
      props: {
        id: "rowsShow",
        columns: columns, //横行个数
        itemHeight: itemHeight, //图标到字之间得距离
        spacing: 3, //每个边框与边框之间得距离
        bgcolor: $color("clear"),
        template: ui.genTemplate(),
        data: items,
        showsVerticalIndicator: false,
      },
      layout: function(make, view) {
        make.width.equalTo(view.super)
        make.centerX.equalTo(view.super)
        make.top.bottom.inset(0)
      },
      events: {
        didSelect(sender, indexPath, data) {
          $device.taptic(1)
          utils.myOpenUrl(data.url)
        },
        didScroll: function(sender) {
          if($("rowsShow").contentOffset.y < -35) {
            if($("closeView").bgcolor === $color("clear")) {
              $device.taptic(2)
              $("closeView").bgcolor = utils.randomValue(utils.colors)
            }
          } else{
            $("closeView").bgcolor = $color("clear")
          }
        },
        didEndDragging: function(sender, decelerate) {
          if($("closeView").bgcolor !== $color("clear")) {
            $app.close()
          }
        }
      },
      views: [{
        type: "button",
        props: {
          id: "closeView",
          title: "CLOSE",
          bgcolor: $color("clear"),
          titleColor: $rgba(100, 100, 100, 0.4),
          font: $font(15),
          hidden: false,
          radius: 15,
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.inset(0).offset(-35)
          make.width.equalTo(80)
          make.height.equalTo(30)
        },
      }]
    }]
  } else {
    showView = [{
      type: "button",
      props: {
        title: "CLOSE",
        bgcolor: $color("clear"),
        titleColor: $rgba(100, 100, 100, 0.2),
        font: $font(15),
        hidden: false,
      },
      layout: function(make, view) {
        make.centerX.equalTo(view.super)
        make.top.inset(0)
        make.width.equalTo(120)
        make.height.equalTo(30)
      },
      events: {
        tapped: function(sender) {
          $app.close(0.1)
        }
      }
    },{
      type: "matrix",
      props: {
        id: "rowsShow",
        columns: columns, //横行个数
        itemHeight: itemHeight, //图标到字之间得距离
        spacing: 3, //每个边框与边框之间得距离
        bgcolor: $color("clear"),
        template: ui.genTemplate(),
        data: items,
        showsVerticalIndicator: false,
      },
      layout: function(make, view) {
        make.width.equalTo(view.super)
        make.centerX.equalTo(view.super)
        make.top.equalTo(view.prev.bottom)
        make.bottom.inset(0)
      },
      events: {
        didSelect(sender, indexPath, data) {
          $device.taptic(1)
          myOpenUrl(data.url)
        },
      },
    }]
  }
  
  $ui.render({
    props: {
      id: "todayView",
      title: "Launch Center",
      navBarHidden: true
    },
    layout: $layout.fill,
    views: showView,
  })

  if(utils.getCache("pullToClose", true)) {
    $widget.height = 215
  } else {
    $widget.height = 245
  }

  if(utils.getCache("pullToClose", true) == true && !utils.getCache("isPullToCloseToasted", false)) {
    $cache.set("isPullToCloseToasted", true);
    $delay(1, function(){
      ui.showToastView($("todayView"), utils.mColor.blue, "下拉即可关闭 ↓")
    })
  }
}

module.exports = {
  show: setupTodayView
}