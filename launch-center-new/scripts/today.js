let ui = require('scripts/ui')
let utils = require('scripts/utils')

function setupTodayView() {
  let items = ui.addButtonMore(utils.getCache("localItems", []))
  let columns = utils.getCache("columns")
  let itemHeight = 50
  let wantToClose = false
  let showView = []

  // if(!utils.getCache("staticHeight")) {
  //   let totalHeight = Math.ceil(items.length / columns) * itemHeight + 15
  //   if(!utils.getCache("pullToClose")) {
  //     totalHeight += 30
  //   }
  //   $widget.height = totalHeight
  // }

  if(!utils.getCache("staticHeight")) {
    if(utils.getCache("pullToClose")) {
      $widget.height = 215
    } else {
      $widget.height = 245
    }
  }
  

  if(utils.getCache("backgroundTranparent")) {
    let alpha = 1
    $delay(0.7, function(){
      let timer = $timer.schedule({
        interval: 0.01,
        handler: function() {
          if(alpha > 0) {
            $ui.vc.runtimeValue().$view().$setBackgroundColor($rgba(255, 255, 255, alpha))
            alpha -= 0.02
          } else {
            timer.invalidate()
          }
        }
      })
    })
  }
  
  if(utils.getCache("pullToClose")) {
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
        make.center.equalTo(view.super)
        make.size.equalTo(view.super)
      },
      events: {
        didSelect(sender, indexPath, data) {
          $device.taptic(1)
          utils.myOpenUrl(data.url)
        },
        didScroll: function(sender) {
          if(sender.contentOffset.y < -30) {
            if(!wantToClose) {
              wantToClose = true
              $device.taptic(2)
              let color = utils.randomValue(utils.colors)
              $("closeView").icon = $icon("225", color, $size(17, 17))
              $("closeView").titleColor = color
            }
          } else{
            wantToClose = false
            $("closeView").icon = $icon("225", $rgba(100, 100, 100, 0.3), $size(17, 17))
            $("closeView").titleColor = $rgba(100, 100, 100, 0.3)
          }
        },
        didEndDragging: function(sender, decelerate) {
          if(wantToClose) {
            $app.close()
          }
        }
      },
      views: [{
        type: "button",
        props: {
          id: "closeView",
          title: " CLOSE",
          bgcolor: $color("clear"),
          icon: $icon("225", $rgba(100, 100, 100, 0.3), $size(17, 17)),
          titleColor: $rgba(100, 100, 100, 0.3),
          font: $font("bold", 15),
          hidden: false,
          radius: 15,
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.inset(0).offset(-30)
          make.width.equalTo(80)
          make.height.equalTo(30)
        },
      },]
    }]
  } else {
    showView = [{
      type: "button",
      props: {
        title: "CLOSE",
        bgcolor: $color("clear"),
        titleColor: $rgba(100, 100, 100, 0.3),
        font: $font("bold", 15),
        hidden: false,
        radius: 15,
      },
      layout: function(make, view) {
        make.centerX.equalTo(view.super)
        make.top.inset(0)
        make.width.equalTo(120)
        make.height.equalTo(30)
      },
      events: {
        tapped: function(sender) {
          $device.taptic(2)
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

  if(utils.getCache("pullToClose") == true && !utils.getCache("isPullToCloseToasted", false)) {
    $cache.set("isPullToCloseToasted", true);
    $delay(1, function(){
      ui.showToastView($("todayView"), utils.mColor.blue, "下拉即可关闭 ↓")
    })
  }
}

module.exports = {
  show: setupTodayView
}