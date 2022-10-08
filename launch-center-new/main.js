if ($app.env == $env.today) {
  let utils = require('scripts/utils')
  if(utils.getCache("haveBanned") === true) {
    let ui = require('scripts/ui')
    ui.showBannedAlert()
  } else if($app.widgetIndex == -1) {
    let today = require('scripts/today')
    today.show()
  } else {
    let widget = require('scripts/widget')
    widget.show()
  }
} else if($app.env == $env.widget) {
  let ios14widget = require('scripts/ios14widget')
  ios14widget.show()
} else {
  let app = require('scripts/app')
  app.show()
}