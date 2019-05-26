let ui = require('scripts/ui')
let utils = require('scripts/utils')

function setupWidgetView() {
  let items = ui.addButtonMore(utils.getCache("localItems", []))
  let columns = utils.getCache("columns")
  let itemHeight = 50
  let view = {
    props: {
      title: "Launch Center",
    },
    views: [{
      type: "matrix",
      props: {
        id: "rowsShow",
        columns: columns, //横行个数
        itemHeight: itemHeight, //图标到字之间得距离
        spacing: 3, //每个边框与边框之间得距离
        template: ui.genTemplate(),
        data: items,
      },
      layout: $layout.fill,
      events: {
        didSelect(sender, indexPath, data) {
          $device.taptic(1)
          utils.myOpenUrl(data.url)
        }
      }
    }]
  }
  $ui.render(view)
}

module.exports = {
  show: setupWidgetView
}