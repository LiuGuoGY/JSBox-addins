let ui = require('scripts/ui')
let utils = require('scripts/utils')
let update = require('scripts/update')

function setupTodayView() {
  let items = utils.getCache("localItems", [])
  let columns = utils.getCache("columns")
  let itemHeight = 50
  let showView = []
  let backgroundColor = utils.getCache("backgroundTranparent")?((utils.getThemeMode() == "dark")?$color("black"):$color("clear")):((utils.getThemeMode() == "dark")?$color("black"):$color("white"))

  if(utils.getCache("backgroundTranparent") && (utils.getThemeMode() != "dark")) {
    let alpha = 1
    $delay(0.5, function(){
      let timer = $timer.schedule({
        interval: 0.01,
        handler: function() {
          if(alpha > 0) {
            $ui.vc.runtimeValue().$view().$setBackgroundColor((utils.getThemeMode() == "dark")?$rgba(0, 0, 0, alpha):$rgba(255, 255, 255, alpha))
            alpha -= 0.02
          } else {
            timer.invalidate()
          }
        }
      })
    })
  }
  showView = [{
    type: "matrix",
    props: {
      id: "rowsShow",
      columns: columns, //横行个数
      itemHeight: itemHeight, //图标到字之间得距离
      spacing: 3, //每个边框与边框之间得距离
      bgcolor: backgroundColor,
      template: ui.genTemplate(),
      data: items,
      showsVerticalIndicator: false,
    },
    layout: function(make, view) {
      make.width.equalTo(view.super)
      make.centerX.equalTo(view.super)
      make.top.inset(0)
      make.bottom.inset(0)
    },
    events: {
      didSelect(sender, indexPath, data) {
        $device.taptic(1)
        utils.myOpenUrl(data.url)
      },
    },
  }]

  $ui.render({
    props: {
      id: "todayView",
      title: "Launch Center",
      bgcolor: $color("clear"),
      barColor: (utils.getThemeMode() == "dark")?$color("black"):$color("white"),
      titleColor: (utils.getThemeMode() == "dark")?$color("white"):$color("black"),
      iconColor: (utils.getThemeMode() == "dark")?$color("white"):$color("black"),
      navButtons: [
        {
          title: "App",
          symbol: "plus.circle", // SF symbols are supported
          handler: sender => {
            $app.openURL("jsbox://run?name=" + encodeURI($addin.current.name));
          }
        }
      ]
    },
    layout: $layout.fill,
    views: showView,
  })
  
  // update.easyCheckUpdate()

  if(!utils.getCache("staticHeight")) {
    $widget.height = 260;
  }
}

module.exports = {
  show: setupTodayView
}