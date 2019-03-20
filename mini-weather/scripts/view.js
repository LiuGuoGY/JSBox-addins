let utils = require("scripts/utils");

function setupCardView(mode) {
  let widgetHeight = utils.getWidgetHeight();
  let listTextColor = "#171717";
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
        make.top.inset(widgetHeight / 13)
        make.left.right.inset(widgetHeight / 13)
        // make.height.equalTo(utils.getWidgetHeight() - 20) //utils.getWidgetHeight() - 20
        make.bottom.inset(widgetHeight / 13)
        shadow(view, utils.getCache("bgcolor", utils.bgcolors.blue))
      },
      views: [{
        type: "blur",
        props: {
          smoothRadius: 13.5,
          style: 5,
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
            make.height.equalTo((utils.getWidgetHeight() - widgetHeight / 13 * 2) * 1.15)
          },
          views: [{
            type: "view",
            layout: function(make, view) {
              make.centerX.equalTo(view.super)
              make.top.inset(0)
              make.width.equalTo(view.super)
              make.height.equalTo(utils.getWidgetHeight() - widgetHeight / 13 * 2)
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
                make.centerY.equalTo(view.super).offset(15 / 110 * widgetHeight)
                make.width.equalTo(view.super).multipliedBy(1)
                make.height.equalTo(500)
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
                make.left.bottom.inset(15 / 110 * widgetHeight)
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
                make.width.equalTo(view.super).multipliedBy(0.7)
                make.right.inset(15)
                make.bottom.inset(8 / 110 * widgetHeight)
                make.height.equalTo(20)
              }
            },{
              type: "image",
              props: {
                id: "locationIcon",
                icon: $icon("007", $color("white"), $size(14, 14)),
                alpha: 0.5,
                bgcolor: $color("clear"),
              },
              layout: function(make, view) {
                make.top.right.inset(8 / 110 * widgetHeight)
                make.size.equalTo($size(15, 15))
              },
            },],
          },]
        },{
          type: "view",
          layout: function(make, view) {
            make.centerX.equalTo(view.super)
            make.top.equalTo(view.prev.bottom)
            make.bottom.inset(0)
            make.width.equalTo(view.super)
          },
          views: [{
            type: "list",
            props: {
              id: "forecastList",
              rowHeight: 40,
              separatorHidden: true,
              showsVerticalIndicator: false,
              scrollEnabled: false,
              bgcolor: $color("clear"),
              template: {
                props: {
                  bgcolor: $color("clear")
                },
                views: [{
                  type: "label",
                  props: {
                    id: "list_mark",
                    text: "  ·",
                    bgcolor: $color("clear"),
                    textColor: $color(listTextColor),
                    align: $align.center,
                    font: $font("Avenir-Black", 20),
                  },
                  layout: function(make, view) {
                    make.centerY.equalTo(view.super)
                    make.left.inset(0)
                    make.top.bottom.inset(0)
                    make.width.equalTo(view.super).multipliedBy(0.1)
                  },
                },{
                  type: "label",
                  props: {
                    id: "list_date",
                    bgcolor: $color("clear"),
                    textColor: $color(listTextColor),
                    align: $align.left,
                    font: $font("Avenir-Black", 15),
                  },
                  layout: function(make, view) {
                    make.centerY.equalTo(view.super)
                    make.left.equalTo(view.prev.right)
                    make.top.bottom.inset(0)
                    make.width.equalTo(view.super).multipliedBy(0.35)
                  },
                },{
                  type: "label",
                  props: {
                    id: "list_temp",
                    bgcolor: $color("clear"),
                    textColor: $color(listTextColor),
                    align: $align.left,
                    font: $font("Avenir-Black", 15),
                  },
                  layout: function(make, view) {
                    make.centerY.equalTo(view.super)
                    make.left.equalTo(view.prev.right)
                    make.top.bottom.inset(0)
                    make.width.equalTo(view.super).multipliedBy(0.25)
                  },
                },{
                  type: "label",
                  props: {
                    id: "list_weather",
                    bgcolor: $color("clear"),
                    textColor: $color(listTextColor),
                    align: $align.center,
                    font: $font("Avenir-Black", 15),
                  },
                  layout: function(make, view) {
                    make.centerY.equalTo(view.super)
                    make.left.equalTo(view.prev.right)
                    make.top.bottom.inset(0)
                    make.width.equalTo(view.super).multipliedBy(0.3)
                  },
                }]
              },
              data: utils.getCache("forecastData", []),
            },
            layout: function(make, view) {
              make.center.equalTo(view.super)
              make.width.equalTo(view.super)
              if(view.super.frame.height > 80) {
                make.height.equalTo(80)
              } else {
                make.height.equalTo(view.super).multipliedBy(0.8)
              }
            },
          }],
        }]
      }]
    },]
  }
  return view
}

function addProgressView(superView) {
  superView.add({
    type: "blur",
    props: {
      id: "myProgressParent",
      style: 1,
      alpha: 0,
    },
    layout: $layout.fill,
    views: [{
      type: "view",
      props: {
        bgcolor: $color("clear"),
        clipsToBounds: 0
      },
      layout: function (make, view) {
        make.centerX.equalTo(view.super)
        make.centerY.equalTo(view.super).offset(-20)
        make.size.equalTo($size(300, 15))
        progress_shadow(view)
      },
      views: [{
        type: "gradient",
        props: {
          id: "myProgress",
          circular: 1,
          colors: [$color("#d4fc79"), $color("#96e6a1"), $color("white")],
          locations: [0.0, 0.0, 0.0],
          startPoint: $point(0, 1),
          endPoint: $point(1, 1)
        },
        layout: $layout.fill
      }]
    },{
      type: "label",
      props: {
        id: "myProgressText",
        text: "更新中...",
        font: $font("bold", 15),
        align: $align.center
      },
      layout: function(make, view) {
        make.centerX.equalTo(view.super)
        make.centerY.equalTo(view.super).offset(20)
      }
    }],
  })
  $ui.animate({
    duration: 0.5,
    animation: () => {
      $("myProgressParent").alpha = 1;
    },
  });

  function progress_shadow(view) {
    var layer = view.runtimeValue().invoke("layer")
    layer.invoke("setCornerRadius", 5)
    layer.invoke("setShadowOffset", $size(0, 0))
    layer.invoke("setShadowColor", $color("#96e6a1").runtimeValue().invoke("CGColor"))
    layer.invoke("setShadowOpacity", 0.8)
    layer.invoke("setShadowRadius", 5)
  }
}

function shadow(view, color) {
  var layer = view.runtimeValue().invoke("layer")
  layer.invoke("setCornerRadius", 10)
  layer.invoke("setShadowOffset", $size(0, 3))
  layer.invoke("setShadowColor", $color(color).runtimeValue().invoke("CGColor"))
  layer.invoke("setShadowOpacity", 1)
  layer.invoke("setShadowRadius", 5)
}

function showBannedAlert() {
  $ui.alert({
    title: "Warning",
    message: "You have been banned!",
    actions: [
      {
        title: "OK",
        handler: function() {
          $app.close()
        }
      },
    ]
  })
}

module.exports = {
  setupCardView: setupCardView,
  addProgressView: addProgressView,
  shadow: shadow,
  showBannedAlert: showBannedAlert,
};
