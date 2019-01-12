let view = require("scripts/view");

function setupView() {
  $ui.render({
    views: [{
      type: "view",
      layout: function(make, view) {
        make.width.equalTo(view.super)
        make.centerX.equalTo(view.super)
        make.top.inset(0)
        make.height.equalTo(200)
      },
      views: [view.setupCardView()]
    }]
  });
}

module.exports = {
  setupView: setupView,
};
