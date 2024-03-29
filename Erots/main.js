let ui = require('scripts/ui')
let utils = require('scripts/utils')
let update = require("scripts/update");
let api = require('scripts/api')

if ($app.env == $env.today) {
    if (utils.getCache("haveBanned") === true) {
        ui.showBannedAlert()
    } else if ($app.widgetIndex == -1) {
        // today.show()
    } else {
        // widget.show()
    }
} else {
    let agreement = require("scripts/agreement");
    agreement.show();
}