let view = require("scripts/view");

function setupView() {
  $ui.render({
    views: [{
      type: "view",
      layout: $layout.fill,
      views: [view.setupCardView()]
    }]
  });
}

module.exports = {
  setupView: setupView,
};
