let view = require("scripts/view");
let utils = require("scripts/utils");
let request = require('scripts/request')

function setupView() {
  $ui.render({
    views: [{
      type: "view",
      props: {
        id: "widget",
      },
      layout: $layout.fill,
      views: [view.setupCardView()]
    }]
  });
  request.request()
  $delay(0.2, function() {
    if($widget.mode == 0) {
      if(utils.getCache("widgetHeight") != $("widget").frame.height) {
        $cache.set("widgetHeight", $("widget").frame.height);
      }
    }
  });
}

module.exports = {
  setupView: setupView,
};
