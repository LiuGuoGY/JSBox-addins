let utils = require("scripts/utils");

function setupCardView(mode) {
  let view = {
    type: "view",
    layout: function(make, view) {
      make.center.equalTo(view.super)
      make.size.equalTo(view.super)
    },
    views: [{
      type: "view",
      props: {
        id: "card",
        bgcolor: $color("clear"),
        clipsToBounds: false,
      },
      layout: function(make, view) {
        make.centerX.equalTo(view.super)
        make.top.inset(10)
        make.left.right.inset(10)
        // make.height.equalTo(utils.getWidgetHeight() - 20) //utils.getWidgetHeight() - 20
        make.bottom.inset(10)
        shadow(view, utils.getCache("bgcolor", utils.bgcolors.orange))
      },
      views: [{
        type: "blur",
        props: {
          smoothRadius: 13.5,
          style: 1,
        },
        layout: $layout.fill,
        views: [{
          type: "view",
          props: {
            clipsToBounds: true,
          },
          layout: function(make, view) {
            make.centerX.equalTo(view.super)
            make.top.inset(0)
            make.width.equalTo(view.super)
            make.height.equalTo(utils.getWidgetHeight() - 20)
          },
          views: [{
            type: "image",
            props: {
              id: "cardBgImage",
              src: utils.getCardSrc(utils.getCache("todayType", "未知"), utils.getCache("nowQlty", "无")),
              bgcolor: $color("clear"),
              contentMode: $contentMode.scaleAspectFit,
            },
            layout: function(make, view) {
              make.centerX.equalTo(view.super)
              make.centerY.equalTo(view.super).offset(-8)
              make.width.equalTo(view.super)
              make.height.equalTo(300)
            }
          },{
            type: "label",
            props: {
              id: "temp",
              text: utils.getCache("nowTemp", "**") + "°",
              font: $font("Lato-Regular", 40),
              textColor: $color("white"),
              align: $align.left,
            },
            layout: function(make, view) {
              make.width.equalTo(view.super).multipliedBy(0.4)
              make.left.bottom.inset(15)
              make.height.equalTo(35)
            }
          },{
            type: "label",
            props: {
              id: "weatherType",
              text: utils.getCache("todayType", "未知"),
              font: $font("Lato-Medium", 16),
              textColor: $color("white"),
              align: $align.left,
            },
            layout: function(make, view) {
              make.width.equalTo(view.super).multipliedBy(0.5)
              make.left.inset(18)
              make.bottom.equalTo(view.prev.top).inset(2)
              make.height.equalTo(20)
            }
          },{
            type: "label",
            props: {
              id: "airQuality",
              text: "空气质量：" + utils.getCache("nowQlty", "无"),
              font: $font("Lato-Medium", 13),
              textColor: $color("white"),
              align: $align.right,
            },
            layout: function(make, view) {
              make.width.equalTo(view.super).multipliedBy(0.8)
              make.right.inset(15)
              make.bottom.inset(8)
              make.height.equalTo(20)
            }
          },{
            type: "image",
            props: {
              id: "locationIcon",
              icon: $icon("007", $color("white"), $size(14, 14)),
              alpha: 0.5,
              bgcolor: $color("clear"),
              circular: true,
            },
            layout: function(make, view) {
              make.top.right.inset(8)
              make.size.equalTo($size(15, 15))
            },
          }]
        },]
      }]
    },]
  }
  return view
}

function shadow(view, color) {
  var layer = view.runtimeValue().invoke("layer")
  layer.invoke("setCornerRadius", 10)
  layer.invoke("setShadowOffset", $size(0, 7))
  layer.invoke("setShadowColor", $color(color).runtimeValue().invoke("CGColor"))
  layer.invoke("setShadowOpacity", 0.8)
  layer.invoke("setShadowRadius", 5)
}

module.exports = {
  setupCardView: setupCardView,
  shadow: shadow,
};
